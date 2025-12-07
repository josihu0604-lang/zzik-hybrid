/**
 * Smart Notifications with AI-based Timing Optimization
 *
 * Analyzes user behavior to determine optimal notification timing
 * and generates personalized messages
 */
import 'server-only';

import type { NotificationTiming, NotificationPersonalization, UserPreferences } from './types';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';

// ============================================================================
// Timing Optimization
// ============================================================================

/**
 * Calculate optimal notification time for a user
 * Based on historical engagement patterns
 */
export async function calculateOptimalTime(
  userId: string,
  popupId: string,
  notificationType: 'deadline_approaching' | 'goal_nearly_reached' | 'similar_popup' | 'new_popup'
): Promise<NotificationTiming> {
  const userPrefs = await fetchUserEngagementPatterns(userId);

  // Determine best hour based on user's historical activity
  const optimalHour = userPrefs.avgParticipationTime || 19; // Default: 7 PM

  // Calculate suggested time
  const now = new Date();
  const suggestedDate = new Date(now);
  suggestedDate.setHours(optimalHour, 0, 0, 0);

  // If optimal time has passed today, schedule for tomorrow
  if (suggestedDate < now) {
    suggestedDate.setDate(suggestedDate.getDate() + 1);
  }

  // Add some randomness to avoid notification clustering
  const randomMinutes = Math.floor(Math.random() * 30);
  suggestedDate.setMinutes(randomMinutes);

  const confidence = calculateConfidence(userPrefs);
  const reason = generateTimingReason(optimalHour, notificationType);

  return {
    userId,
    popupId,
    suggestedTime: suggestedDate.toISOString(),
    confidence,
    reason,
    type: notificationType,
  };
}

/**
 * Batch calculate optimal times for multiple users
 */
export async function calculateBatchOptimalTimes(
  userIds: string[],
  popupId: string,
  notificationType: 'deadline_approaching' | 'goal_nearly_reached' | 'similar_popup' | 'new_popup'
): Promise<NotificationTiming[]> {
  const timings = await Promise.all(
    userIds.map((userId) => calculateOptimalTime(userId, popupId, notificationType))
  );

  // Filter out low-confidence timings
  return timings.filter((t) => t.confidence > 0.5);
}

// ============================================================================
// Message Personalization
// ============================================================================

/**
 * Generate personalized notification message
 */
export async function generatePersonalizedMessage(
  userId: string,
  popupId: string,
  popupData: {
    title: string;
    brandName: string;
    category: string;
    currentParticipants: number;
    goalParticipants: number;
    daysLeft: number;
  },
  notificationType: 'deadline_approaching' | 'goal_nearly_reached' | 'similar_popup' | 'new_popup'
): Promise<NotificationPersonalization> {
  const userPrefs = await fetchUserEngagementPatterns(userId);

  const progressPercent = Math.round(
    (popupData.currentParticipants / popupData.goalParticipants) * 100
  );

  let title = '';
  let message = '';
  let emoji = '';
  let urgency: 'low' | 'medium' | 'high' = 'medium';

  switch (notificationType) {
    case 'deadline_approaching':
      urgency = popupData.daysLeft <= 1 ? 'high' : 'medium';
      emoji = popupData.daysLeft === 1 ? '🔥' : '⏰';
      title = `마감 ${popupData.daysLeft}일 전!`;
      message = `${popupData.brandName}의 "${popupData.title}" 팝업이 곧 마감돼요. 지금 참여하세요!`;
      break;

    case 'goal_nearly_reached':
      urgency = progressPercent >= 95 ? 'high' : 'medium';
      emoji = progressPercent >= 95 ? '🎉' : '🚀';
      title = `${progressPercent}% 달성!`;
      message = `"${popupData.title}"가 곧 오픈해요! ${popupData.goalParticipants - popupData.currentParticipants}명만 더 참여하면 오픈됩니다.`;
      break;

    case 'similar_popup':
      urgency = 'low';
      emoji = '✨';
      title = '당신을 위한 추천';
      message = `${getCategoryEmoji(popupData.category)} ${popupData.brandName}의 새로운 팝업을 추천해요!`;
      break;

    case 'new_popup':
      urgency = 'low';
      emoji = '🆕';
      title = '새로운 팝업이 등록되었어요';
      message = `${popupData.brandName}의 "${popupData.title}"에 첫 참여자가 되어보세요!`;
      break;
  }

  // Personalize based on user preferences
  const categoryWeight = userPrefs.categories[popupData.category.toLowerCase()] || 0;
  if (categoryWeight > 0.7) {
    message = `좋아하시는 ${popupData.category} 카테고리의 ${message}`;
  }

  return {
    title,
    message,
    emoji,
    urgency,
    customData: {
      popupId,
      category: popupData.category,
      progressPercent,
      daysLeft: popupData.daysLeft,
    },
  };
}

// ============================================================================
// Smart Batching
// ============================================================================

/**
 * Group notifications to avoid spam
 * Combines multiple notifications into digest if user has many
 */
export async function createNotificationDigest(
  userId: string,
  notifications: Array<{
    popupId: string;
    type: string;
    title: string;
    message: string;
  }>
): Promise<NotificationPersonalization | null> {
  if (notifications.length === 0) return null;
  if (notifications.length === 1) {
    return {
      title: notifications[0].title,
      message: notifications[0].message,
      urgency: 'medium',
    };
  }

  // Create digest for multiple notifications
  const urgentCount = notifications.filter((n) => n.type === 'deadline_approaching').length;
  const nearGoalCount = notifications.filter((n) => n.type === 'goal_nearly_reached').length;
  const recommendCount = notifications.filter((n) => n.type === 'similar_popup').length;

  const title = `${notifications.length}개의 알림`;
  let message = '';

  if (urgentCount > 0) {
    message += `마감 임박 ${urgentCount}개`;
  }
  if (nearGoalCount > 0) {
    if (message) message += ', ';
    message += `목표 근접 ${nearGoalCount}개`;
  }
  if (recommendCount > 0) {
    if (message) message += ', ';
    message += `추천 ${recommendCount}개`;
  }

  return {
    title,
    message: `${message}의 팝업 소식이 있어요!`,
    emoji: '📬',
    urgency: urgentCount > 0 ? 'high' : 'medium',
    customData: {
      digestCount: notifications.length,
      popupIds: notifications.map((n) => n.popupId),
    },
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

async function fetchUserEngagementPatterns(userId: string): Promise<UserPreferences> {
  // Fetch from database
  if (!isSupabaseConfigured()) {
    console.warn('[SmartNotifications] Supabase not configured, using default engagement patterns');
    return {
      categories: {
        fashion: 0.5,
        beauty: 0.3,
        kpop: 0.2,
      },
      vibes: [],
      participationHistory: [],
      avgParticipationTime: 19, // 7 PM
      preferredLocations: ['성수', '강남'],
    };
  }

  try {
    const supabase = createAdminClient();

    // Fetch user's participation history
    const { data: participations, error: participationsError } = await supabase
      .from('popup_participations')
      .select('popup_id, participated_at')
      .eq('user_id', userId)
      .order('participated_at', { ascending: false });

    if (participationsError) throw participationsError;

    const participationHistory = participations?.map((p) => p.popup_id) || [];

    // Calculate average participation time from timestamps
    let avgParticipationTime = 19; // Default: 7 PM
    if (participations && participations.length > 0) {
      const hours = participations.map((p) => new Date(p.participated_at).getHours());
      avgParticipationTime = Math.round(hours.reduce((sum, h) => sum + h, 0) / hours.length);
    }

    // Fetch user's category preferences based on past participations
    if (participationHistory.length > 0) {
      const { data: popups, error: popupsError } = await supabase
        .from('popups')
        .select('category, location')
        .in('id', participationHistory);

      if (popupsError) throw popupsError;

      // Calculate category weights
      const categoryWeights: Record<string, number> = {};
      const locationCounts: Record<string, number> = {};

      if (popups) {
        popups.forEach((popup) => {
          categoryWeights[popup.category] = (categoryWeights[popup.category] || 0) + 1;
          locationCounts[popup.location] = (locationCounts[popup.location] || 0) + 1;
        });

        // Normalize to 0-1 range
        const maxCount = Math.max(...Object.values(categoryWeights));
        Object.keys(categoryWeights).forEach((cat) => {
          categoryWeights[cat] = categoryWeights[cat] / maxCount;
        });

        // Get top 3 preferred locations
        const preferredLocations = Object.entries(locationCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([loc]) => loc);

        return {
          categories: categoryWeights,
          vibes: [],
          participationHistory,
          avgParticipationTime,
          preferredLocations,
        };
      }
    }

    return {
      categories: {},
      vibes: [],
      participationHistory,
      avgParticipationTime,
      preferredLocations: [],
    };
  } catch (error) {
    console.error('[SmartNotifications] Failed to fetch user engagement patterns:', error);
    return {
      categories: {
        fashion: 0.5,
        beauty: 0.3,
        kpop: 0.2,
      },
      vibes: [],
      participationHistory: [],
      avgParticipationTime: 19,
      preferredLocations: ['성수', '강남'],
    };
  }
}

function calculateConfidence(userPrefs: UserPreferences): number {
  // Higher confidence if we have more historical data
  const historyCount = userPrefs.participationHistory.length;

  if (historyCount === 0) return 0.3; // Low confidence for new users
  if (historyCount < 5) return 0.5; // Medium confidence
  if (historyCount < 20) return 0.7; // Good confidence
  return 0.9; // High confidence
}

function generateTimingReason(hour: number, type: string): string {
  const timeOfDay = hour < 12 ? '오전' : hour < 18 ? '오후' : '저녁';

  const reasons: Record<string, string> = {
    deadline_approaching: `보통 ${timeOfDay}에 팝업을 확인하시는 패턴이 있어요`,
    goal_nearly_reached: `${timeOfDay} 시간대에 참여율이 높아요`,
    similar_popup: `${timeOfDay}에 추천 팝업을 확인하는 경향이 있어요`,
    new_popup: `신규 팝업 알림에 ${timeOfDay}에 반응하는 편이에요`,
  };

  return reasons[type] || `${timeOfDay} 시간대가 최적이에요`;
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    fashion: '👗',
    beauty: '💄',
    kpop: '🎤',
    food: '🍽️',
    cafe: '☕',
    lifestyle: '✨',
    culture: '🎨',
    tech: '💻',
  };

  return emojis[category.toLowerCase()] || '🎯';
}

// ============================================================================
// Notification Scheduling
// ============================================================================

export interface NotificationSchedule {
  userId: string;
  popupId: string;
  scheduledFor: string;
  type: string;
  message: NotificationPersonalization;
  sent: boolean;
}

/**
 * Create optimized notification schedule for a popup
 */
export async function createPopupNotificationSchedule(
  popupId: string,
  popupData: {
    title: string;
    brandName: string;
    category: string;
    currentParticipants: number;
    goalParticipants: number;
    daysLeft: number;
  },
  targetUserIds: string[]
): Promise<NotificationSchedule[]> {
  const schedules: NotificationSchedule[] = [];

  // Determine notification type based on popup state
  let notificationType: NotificationTiming['type'];
  if (popupData.daysLeft <= 3) {
    notificationType = 'deadline_approaching';
  } else if (popupData.currentParticipants / popupData.goalParticipants >= 0.8) {
    notificationType = 'goal_nearly_reached';
  } else {
    notificationType = 'similar_popup';
  }

  // Calculate optimal times for all users
  const timings = await calculateBatchOptimalTimes(targetUserIds, popupId, notificationType);

  // Generate personalized messages
  for (const timing of timings) {
    const message = await generatePersonalizedMessage(
      timing.userId,
      popupId,
      popupData,
      timing.type
    );

    schedules.push({
      userId: timing.userId,
      popupId,
      scheduledFor: timing.suggestedTime,
      type: timing.type,
      message,
      sent: false,
    });
  }

  return schedules;
}

/**
 * Get notification preferences for a user
 * Returns when user wants to receive notifications
 */
export async function getUserNotificationPreferences(userId: string): Promise<{
  enabled: boolean;
  quietHours: { start: number; end: number }; // Hours 0-23
  maxPerDay: number;
  categories: string[];
}> {
  // Fetch from database
  if (!isSupabaseConfigured()) {
    console.warn(
      '[SmartNotifications] Supabase not configured, using default notification preferences'
    );
    return {
      enabled: true,
      quietHours: { start: 22, end: 8 }, // 10 PM to 8 AM
      maxPerDay: 5,
      categories: ['fashion', 'beauty', 'kpop', 'food', 'cafe', 'lifestyle'],
    };
  }

  try {
    const supabase = createAdminClient();

    // Fetch notification preferences from database
    const { data: prefs, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no preferences found, return defaults
      if (error.code === 'PGRST116') {
        return {
          enabled: true,
          quietHours: { start: 22, end: 8 },
          maxPerDay: 5,
          categories: ['fashion', 'beauty', 'kpop', 'food', 'cafe', 'lifestyle'],
        };
      }
      throw error;
    }

    if (!prefs) {
      return {
        enabled: true,
        quietHours: { start: 22, end: 8 },
        maxPerDay: 5,
        categories: ['fashion', 'beauty', 'kpop', 'food', 'cafe', 'lifestyle'],
      };
    }

    // Parse quiet hours from database
    let quietHours = { start: 22, end: 8 };
    if (prefs.quiet_hours_enabled && prefs.quiet_hours_start && prefs.quiet_hours_end) {
      try {
        // Assuming format "HH:MM"
        const startHour = parseInt(prefs.quiet_hours_start.split(':')[0], 10);
        const endHour = parseInt(prefs.quiet_hours_end.split(':')[0], 10);
        quietHours = { start: startHour, end: endHour };
      } catch {
        // Use defaults if parsing fails
      }
    }

    // Build list of enabled categories based on preferences
    const categories: string[] = [];

    // Add all categories if notifications are enabled
    if (prefs.push_enabled || prefs.in_app_enabled) {
      categories.push('fashion', 'beauty', 'kpop', 'food', 'cafe', 'lifestyle');
    }

    return {
      enabled: prefs.push_enabled || prefs.in_app_enabled,
      quietHours,
      maxPerDay: 5, // Could be added to the preferences table
      categories,
    };
  } catch (error) {
    console.error('[SmartNotifications] Failed to fetch notification preferences:', error);
    return {
      enabled: true,
      quietHours: { start: 22, end: 8 },
      maxPerDay: 5,
      categories: ['fashion', 'beauty', 'kpop', 'food', 'cafe', 'lifestyle'],
    };
  }
}
