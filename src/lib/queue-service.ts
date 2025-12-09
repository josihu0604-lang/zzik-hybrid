/**
 * Queue Service
 * Business logic for queue management with database persistence
 * @module lib/queue-service
 */

import { createClient } from '@/lib/supabase/server';
import type {
  QueueEntry,
  QueueEntryStatus,
  RestaurantQueueSettings,
  JoinQueueRequest,
  QueueStatistics,
} from '@/types/queue';
import { QUEUE_CONSTANTS, calculateEstimatedWaitTime } from '@/types/queue';

/**
 * Queue Service Class
 */
export class QueueService {
  /**
   * Get restaurant queue settings
   */
  static async getQueueSettings(restaurantId: string): Promise<RestaurantQueueSettings | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('restaurant_queue_settings')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .single();

    if (error) {
      console.error('[QueueService] Error fetching settings:', error);
      return null;
    }

    return data;
  }

  /**
   * Initialize queue settings for a restaurant
   */
  static async initializeQueueSettings(
    restaurantId: string,
    settings?: Partial<RestaurantQueueSettings>
  ): Promise<RestaurantQueueSettings | null> {
    const supabase = await createClient();

    const defaultSettings = {
      restaurant_id: restaurantId,
      is_enabled: true,
      max_queue_size: QUEUE_CONSTANTS.DEFAULT_MAX_QUEUE_SIZE,
      avg_wait_per_party: QUEUE_CONSTANTS.DEFAULT_AVG_WAIT_PER_PARTY,
      auto_call_enabled: false,
      auto_call_interval: 5,
      working_hours: {},
      max_party_size: QUEUE_CONSTANTS.MAX_PARTY_SIZE,
      expiration_time: QUEUE_CONSTANTS.DEFAULT_EXPIRATION_TIME,
      no_show_limit: QUEUE_CONSTANTS.DEFAULT_NO_SHOW_LIMIT,
      metadata: {},
      ...settings,
    };

    const { data, error } = await supabase
      .from('restaurant_queue_settings')
      .insert(defaultSettings)
      .select()
      .single();

    if (error) {
      console.error('[QueueService] Error initializing settings:', error);
      return null;
    }

    return data;
  }

  /**
   * Update queue settings
   */
  static async updateQueueSettings(
    restaurantId: string,
    updates: Partial<RestaurantQueueSettings>
  ): Promise<RestaurantQueueSettings | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('restaurant_queue_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('restaurant_id', restaurantId)
      .select()
      .single();

    if (error) {
      console.error('[QueueService] Error updating settings:', error);
      return null;
    }

    return data;
  }

  /**
   * Join queue
   */
  static async joinQueue(request: JoinQueueRequest): Promise<QueueEntry | null> {
    const supabase = await createClient();

    try {
      // Get restaurant settings
      const settings = await this.getQueueSettings(request.restaurant_id);
      if (!settings || !settings.is_enabled) {
        throw new Error('Queue is not enabled for this restaurant');
      }

      // Get current queue size
      const { count } = await supabase
        .from('queue_entries')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', request.restaurant_id)
        .eq('status', 'waiting');

      const currentSize = count || 0;

      // Check max queue size
      if (currentSize >= settings.max_queue_size) {
        throw new Error('Queue is full');
      }

      // Check party size
      if (request.party_size > settings.max_party_size) {
        throw new Error(`Party size exceeds maximum of ${settings.max_party_size}`);
      }

      // Calculate position (next available)
      const position = currentSize + 1;

      // Calculate estimated wait time
      const estimatedWaitMinutes = calculateEstimatedWaitTime(
        position,
        settings.avg_wait_per_party
      );

      const estimatedSeatingTime = new Date(
        Date.now() + estimatedWaitMinutes * 60 * 1000
      ).toISOString();

      // Check for existing active entry
      const { data: user } = await supabase.auth.getUser();
      const userId = user?.user?.id;

      if (userId) {
        const { data: existing } = await supabase
          .from('queue_entries')
          .select('*')
          .eq('restaurant_id', request.restaurant_id)
          .eq('user_id', userId)
          .in('status', ['waiting', 'called'])
          .single();

        if (existing) {
          throw new Error('Already in queue');
        }
      }

      // Create queue entry
      const entryData = {
        restaurant_id: request.restaurant_id,
        user_id: userId || null,
        guest_name: request.guest_name || null,
        phone_number: request.phone_number || null,
        email: request.email || null,
        party_size: request.party_size,
        position,
        estimated_wait_minutes: estimatedWaitMinutes,
        estimated_seating_time: estimatedSeatingTime,
        status: 'waiting' as QueueEntryStatus,
        special_requests: request.special_requests || null,
        seating_preference: request.seating_preference || null,
        notification_enabled: request.notification_enabled !== false,
        notification_phone: request.notification_phone || request.phone_number || null,
        notification_email: request.notification_email || request.email || null,
        metadata: {},
      };

      const { data: entry, error } = await supabase
        .from('queue_entries')
        .insert(entryData)
        .select()
        .single();

      if (error) {
        console.error('[QueueService] Error creating entry:', error);
        throw error;
      }

      // Send notification
      await this.sendNotification(entry.id, 'joined');

      return entry;
    } catch (error) {
      console.error('[QueueService] Error joining queue:', error);
      return null;
    }
  }

  /**
   * Get queue entry by ID
   */
  static async getQueueEntry(entryId: string): Promise<QueueEntry | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('queue_entries')
      .select('*')
      .eq('id', entryId)
      .single();

    if (error) {
      console.error('[QueueService] Error fetching entry:', error);
      return null;
    }

    return data;
  }

  /**
   * Get all queue entries for a restaurant
   */
  static async getRestaurantQueue(
    restaurantId: string,
    statuses: QueueEntryStatus[] = ['waiting', 'called']
  ): Promise<QueueEntry[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('queue_entries')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .in('status', statuses)
      .order('position', { ascending: true });

    if (error) {
      console.error('[QueueService] Error fetching queue:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Update queue entry status
   */
  static async updateQueueEntry(
    entryId: string,
    updates: Partial<QueueEntry>
  ): Promise<QueueEntry | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('queue_entries')
      .update(updates)
      .eq('id', entryId)
      .select()
      .single();

    if (error) {
      console.error('[QueueService] Error updating entry:', error);
      return null;
    }

    return data;
  }

  /**
   * Leave queue (cancel)
   */
  static async leaveQueue(entryId: string): Promise<boolean> {
    const supabase = await createClient();

    const entry = await this.getQueueEntry(entryId);
    if (!entry) {
      return false;
    }

    const { error } = await supabase
      .from('queue_entries')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', entryId);

    if (error) {
      console.error('[QueueService] Error leaving queue:', error);
      return false;
    }

    // Send notification
    await this.sendNotification(entryId, 'cancelled');

    // Reorder remaining entries (handled by database trigger)
    return true;
  }

  /**
   * Call next customer(s)
   */
  static async callNext(restaurantId: string, count: number = 1): Promise<QueueEntry[]> {
    const supabase = await createClient();

    // Get next waiting entries
    const { data: entries, error } = await supabase
      .from('queue_entries')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('status', 'waiting')
      .order('position', { ascending: true })
      .limit(count);

    if (error || !entries || entries.length === 0) {
      console.error('[QueueService] Error calling next:', error);
      return [];
    }

    // Update status to 'called'
    const calledEntries: QueueEntry[] = [];

    for (const entry of entries) {
      const { data: updated } = await supabase
        .from('queue_entries')
        .update({
          status: 'called',
          called_at: new Date().toISOString(),
        })
        .eq('id', entry.id)
        .select()
        .single();

      if (updated) {
        calledEntries.push(updated);
        // Send notification
        await this.sendNotification(entry.id, 'ready');
      }
    }

    return calledEntries;
  }

  /**
   * Mark as seated
   */
  static async markSeated(entryId: string): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('queue_entries')
      .update({
        status: 'seated',
        seated_at: new Date().toISOString(),
      })
      .eq('id', entryId);

    if (error) {
      console.error('[QueueService] Error marking seated:', error);
      return false;
    }

    return true;
  }

  /**
   * Mark as no-show
   */
  static async markNoShow(entryId: string): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('queue_entries')
      .update({
        status: 'no_show',
        no_show_at: new Date().toISOString(),
      })
      .eq('id', entryId);

    if (error) {
      console.error('[QueueService] Error marking no-show:', error);
      return false;
    }

    return true;
  }

  /**
   * Get queue statistics
   */
  static async getQueueStatistics(restaurantId: string): Promise<QueueStatistics> {
    const supabase = await createClient();

    const { count: totalWaiting } = await supabase
      .from('queue_entries')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId)
      .eq('status', 'waiting');

    const { count: totalCalled } = await supabase
      .from('queue_entries')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId)
      .eq('status', 'called');

    // Get today's seated count
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: totalSeatedToday } = await supabase
      .from('queue_history')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId)
      .eq('final_status', 'seated')
      .gte('created_at', today.toISOString());

    // Calculate average wait time from history
    const { data: historyData } = await supabase
      .from('queue_history')
      .select('wait_duration_minutes')
      .eq('restaurant_id', restaurantId)
      .eq('final_status', 'seated')
      .gte('created_at', today.toISOString());

    const avgWaitTime =
      historyData && historyData.length > 0
        ? Math.round(
            historyData.reduce((sum, h) => sum + (h.wait_duration_minutes || 0), 0) /
              historyData.length
          )
        : 0;

    const settings = await this.getQueueSettings(restaurantId);
    const currentWaitTime = calculateEstimatedWaitTime(
      totalWaiting || 0,
      settings?.avg_wait_per_party || QUEUE_CONSTANTS.DEFAULT_AVG_WAIT_PER_PARTY
    );

    return {
      total_waiting: totalWaiting || 0,
      total_called: totalCalled || 0,
      total_seated_today: totalSeatedToday || 0,
      avg_wait_time: avgWaitTime,
      current_wait_time: currentWaitTime,
      queue_trend: 'stable',
    };
  }

  /**
   * Send queue notification
   */
  static async sendNotification(
    entryId: string,
    type: 'joined' | 'position_update' | 'almost_ready' | 'ready' | 'reminder' | 'expired' | 'cancelled'
  ): Promise<void> {
    const supabase = await createClient();

    const entry = await this.getQueueEntry(entryId);
    if (!entry || !entry.notification_enabled) {
      return;
    }

    const messages = {
      joined: `You've joined the queue at position ${entry.position}. Estimated wait: ${entry.estimated_wait_minutes} minutes.`,
      position_update: `Your position has been updated to ${entry.position}.`,
      almost_ready: `You're almost ready! Only ${entry.position} parties ahead of you.`,
      ready: `Your table is ready! Please come to the host stand.`,
      reminder: `Your table will be ready soon. Please be nearby.`,
      expired: `Your queue entry has expired. Please rejoin if you'd like to wait.`,
      cancelled: `You've left the queue.`,
    };

    await supabase.from('queue_notifications').insert({
      queue_entry_id: entryId,
      user_id: entry.user_id,
      notification_type: type,
      sent_via_sse: true,
      delivery_status: 'sent',
      message_content: messages[type],
      metadata: {},
    });
  }

  /**
   * Clean up expired entries
   */
  static async cleanupExpiredEntries(restaurantId: string): Promise<number> {
    const supabase = await createClient();

    const settings = await this.getQueueSettings(restaurantId);
    if (!settings) {
      return 0;
    }

    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() - settings.expiration_time);

    const { data: expiredEntries } = await supabase
      .from('queue_entries')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('status', 'waiting')
      .lt('joined_at', expirationTime.toISOString());

    if (!expiredEntries || expiredEntries.length === 0) {
      return 0;
    }

    for (const entry of expiredEntries) {
      await supabase
        .from('queue_entries')
        .update({
          status: 'expired',
          expired_at: new Date().toISOString(),
        })
        .eq('id', entry.id);

      await this.sendNotification(entry.id, 'expired');
    }

    return expiredEntries.length;
  }
}
