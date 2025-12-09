import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query user's vibe cards from database
    const { data, error } = await supabase
      .from('vibe_cards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Vibe List] Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch vibe cards' }, { status: 500 });
    }

    // Transform data to match expected format
    const collection = (data || []).map((card) => ({
      id: card.id,
      title: card.token_id ? `Vibe #${card.token_id.slice(-4)}` : 'Unminted Vibe',
      imageUrl: card.image_url,
      metadata: card.metadata || {},
      isMinted: card.is_minted,
    }));

    return NextResponse.json({
      success: true,
      data: collection,
    });
  } catch (error) {
    console.error('[Vibe List] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
