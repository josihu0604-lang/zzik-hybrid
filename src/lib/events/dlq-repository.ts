
import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export interface DLQEntry {
  id?: string;
  event_type: string;
  payload: any;
  error_message: string;
  stack_trace?: string;
  status: 'failed' | 'replaying' | 'resolved' | 'ignored';
}

export async function saveToDLQ(
  eventType: string, 
  payload: any, 
  error: any
): Promise<void> {
  try {
    const supabase = createAdminClient();
    
    await supabase.from('dead_letter_queue').insert({
      event_type: eventType,
      payload: payload,
      error_message: error.message || String(error),
      stack_trace: error.stack,
      status: 'failed'
    });
    
    logger.info(`[DLQ] Saved failed event: ${eventType}`);
  } catch (dbError) {
    // Failsafe: Log to console if DB fails
    console.error('CRITICAL: Failed to save to DLQ', dbError);
  }
}

export async function replayDLQEvent(id: string, replayFn: (payload: any) => Promise<void>) {
    const supabase = createAdminClient();
    
    // 1. Fetch
    const { data: entry } = await supabase
        .from('dead_letter_queue')
        .select('*')
        .eq('id', id)
        .single();
        
    if (!entry) throw new Error('DLQ Entry not found');
    
    // 2. Update status
    await supabase.from('dead_letter_queue').update({ status: 'replaying' }).eq('id', id);
    
    try {
        // 3. Replay
        await replayFn(entry.payload);
        
        // 4. Resolve
        await supabase.from('dead_letter_queue').update({ status: 'resolved' }).eq('id', id);
    } catch (error) {
        // 5. Fail again
        await supabase.from('dead_letter_queue').update({ 
            status: 'failed', 
            attempts: (entry.attempts || 0) + 1,
            // @ts-ignore
            error_message: error.message
        }).eq('id', id);
        throw error;
    }
}
