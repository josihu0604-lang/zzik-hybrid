/**
 * Notification Trigger Utilities
 *
 * Functions to create and send notifications for various ZZIK events
 * Handles both push notifications and in-app notifications
 */

import type {
  Notification,
  NotificationType,
  NotificationPriority,
  ParticipationConfirmedData,
  PopupOpenedData,
  CheckinVerifiedData,
  LeaderEarningData,
  TierUpgradeData,
  GoalProgressData,
  DeadlineReminderData,
  NewPopupData,
  PayoutNotificationData,
} from '@/types/notification';

// ============================================
// Types
// ============================================

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  priority?: NotificationPriority;
  expiresInHours?: number;
}

interface SendPushParams {
  userIds: string[];
  title: string;
  body: string;
  icon?: string;
  url?: string;
  tag?: string;
  type?: NotificationType;
  data?: Record<string, unknown>;
}

// ============================================
// Core Functions
// ============================================

/**
 * Create a notification record in the database
 *
 * Note: This function is intended for server-side use.
 * For server-to-server calls, set INTERNAL_API_SECRET env var.
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<Notification | null> {
  try {
    const expiresAt = params.expiresInHours
      ? new Date(Date.now() + params.expiresInHours * 60 * 60 * 1000).toISOString()
      : undefined;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API secret for server-side calls (if available)
    if (typeof process !== 'undefined' && process.env?.INTERNAL_API_SECRET) {
      headers['X-API-Secret'] = process.env.INTERNAL_API_SECRET;
    }

    const response = await fetch('/api/notifications/create', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        user_id: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        data: params.data,
        priority: params.priority || 'medium',
        expires_at: expiresAt,
      }),
    });

    if (!response.ok) {
      console.error('[Notifications] Failed to create notification:', response.statusText);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('[Notifications] Create notification error:', error);
    return null;
  }
}

/**
 * Send push notification
 *
 * Note: This function is intended for server-side use.
 * For server-to-server calls, set INTERNAL_API_SECRET env var.
 */
async function sendPushNotification(params: SendPushParams): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API secret for server-side calls (if available)
    if (typeof process !== 'undefined' && process.env?.INTERNAL_API_SECRET) {
      headers['X-API-Secret'] = process.env.INTERNAL_API_SECRET;
    }

    const response = await fetch('/api/push/send', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userIds: params.userIds,
        payload: {
          title: params.title,
          body: params.body,
          icon: params.icon || '/icons/icon-192.png',
          url: params.url || '/',
          tag: params.tag || 'zzik-notification',
          type: params.type,
          data: params.data,
        },
      }),
    });

    if (!response.ok) {
      console.error('[Notifications] Failed to send push:', response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Notifications] Send push error:', error);
    return false;
  }
}

/**
 * Send both in-app and push notification
 */
async function sendNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  options: {
    data?: Record<string, unknown>;
    priority?: NotificationPriority;
    pushUrl?: string;
    expiresInHours?: number;
  } = {}
): Promise<void> {
  // Create in-app notification
  await createNotification({
    userId,
    type,
    title,
    message,
    data: options.data,
    priority: options.priority,
    expiresInHours: options.expiresInHours,
  });

  // Send push notification
  await sendPushNotification({
    userIds: [userId],
    title,
    body: message,
    url: options.pushUrl,
    type,
    data: options.data,
  });
}

// ============================================
// Event-Specific Notification Functions
// ============================================

/**
 * Notify user when participation is confirmed
 */
export async function notifyParticipationConfirmed(
  userId: string,
  data: ParticipationConfirmedData
): Promise<void> {
  await sendNotification(
    userId,
    'participation_confirmed',
    '참여 확정 완료!',
    `${data.popup_name} 팝업 참여가 확정되었습니다.`,
    {
      data,
      priority: 'medium',
      pushUrl: `/popup/${data.popup_id}`,
      expiresInHours: 168, // 7 days
    }
  );
}

/**
 * Notify users when popup is confirmed to open
 */
export async function notifyPopupOpened(userIds: string[], data: PopupOpenedData): Promise<void> {
  const title = '팝업 오픈 확정!';
  const message = `${data.popup_name}이(가) 오픈 확정되었습니다. 지금 바로 방문하세요!`;

  // Create notifications for all users
  await Promise.all(
    userIds.map((userId) =>
      createNotification({
        userId,
        type: 'popup_opened',
        title,
        message,
        data,
        priority: 'high',
        expiresInHours: 168,
      })
    )
  );

  // Send push notifications
  await sendPushNotification({
    userIds,
    title,
    body: message,
    url: `/popup/${data.popup_id}`,
    type: 'popup_opened',
    data,
  });
}

/**
 * Notify user when check-in is verified
 */
export async function notifyCheckinVerified(
  userId: string,
  data: CheckinVerifiedData
): Promise<void> {
  const badgeMessage = data.badge_earned ? ` ${data.badge_earned} 배지 획득!` : '';

  await sendNotification(
    userId,
    'checkin_verified',
    '찍음 완료!',
    `${data.popup_name} 방문 인증! ${data.points_earned}P 적립${badgeMessage}`,
    {
      data,
      priority: 'high',
      pushUrl: '/me',
      expiresInHours: 72,
    }
  );
}

/**
 * Notify leader when earning occurs
 */
export async function notifyLeaderEarning(
  leaderId: string,
  data: LeaderEarningData
): Promise<void> {
  await sendNotification(
    leaderId,
    'leader_earning',
    '리더 수익 발생!',
    `${data.popup_name}에서 ${data.referral_count}명의 레퍼럴로 ${data.earning_amount.toLocaleString()}원 수익 발생!`,
    {
      data,
      priority: 'high',
      pushUrl: '/leader',
      expiresInHours: 168,
    }
  );
}

/**
 * Notify user when tier is upgraded
 */
export async function notifyTierUpgrade(userId: string, data: TierUpgradeData): Promise<void> {
  await sendNotification(
    userId,
    'tier_upgrade',
    '티어 승급!',
    `축하합니다! ${data.old_tier}에서 ${data.new_tier}로 승급했습니다.`,
    {
      data,
      priority: 'high',
      pushUrl: '/me',
      expiresInHours: 168,
    }
  );
}

/**
 * Notify users about goal progress milestone
 */
export async function notifyGoalProgress(userIds: string[], data: GoalProgressData): Promise<void> {
  const title = '목표 달성 임박!';
  const message = `${data.popup_name} ${data.current_count}/${data.target_count}명 달성! ${data.progress_percent}% 완료!`;

  // Create notifications for all users
  await Promise.all(
    userIds.map((userId) =>
      createNotification({
        userId,
        type: 'goal_progress',
        title,
        message,
        data,
        priority: 'medium',
        expiresInHours: 24,
      })
    )
  );

  // Send push notifications
  await sendPushNotification({
    userIds,
    title,
    body: message,
    url: `/popup/${data.popup_id}`,
    type: 'goal_progress',
    data,
  });
}

/**
 * Notify users about deadline reminder
 */
export async function notifyDeadlineReminder(
  userIds: string[],
  data: DeadlineReminderData
): Promise<void> {
  const title = '마감 임박!';
  const message = `${data.popup_name} 참여 마감까지 ${data.hours_left}시간 남았습니다.`;

  // Create notifications for all users
  await Promise.all(
    userIds.map((userId) =>
      createNotification({
        userId,
        type: 'deadline_reminder',
        title,
        message,
        data,
        priority: 'urgent',
        expiresInHours: data.hours_left,
      })
    )
  );

  // Send push notifications
  await sendPushNotification({
    userIds,
    title,
    body: message,
    url: `/popup/${data.popup_id}`,
    type: 'deadline_reminder',
    data,
  });
}

/**
 * Notify users about new popup
 */
export async function notifyNewPopup(userIds: string[], data: NewPopupData): Promise<void> {
  const title = '새로운 팝업 등장!';
  const message = `${data.brand_name}의 ${data.popup_name}이(가) 참여자를 모집 중입니다!`;

  // Create notifications for all users
  await Promise.all(
    userIds.map((userId) =>
      createNotification({
        userId,
        type: 'new_popup',
        title,
        message,
        data,
        priority: 'low',
        expiresInHours: 72,
      })
    )
  );

  // Send push notifications
  await sendPushNotification({
    userIds,
    title,
    body: message,
    url: `/popup/${data.popup_id}`,
    type: 'new_popup',
    data,
  });
}

// ============================================
// Helper Functions
// ============================================

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/notifications/${notificationId}/read`, {
      method: 'POST',
    });

    return response.ok;
  } catch (error) {
    console.error('[Notifications] Mark as read error:', error);
    return false;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    return response.ok;
  } catch (error) {
    console.error('[Notifications] Mark all as read error:', error);
    return false;
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/notifications/${notificationId}`, {
      method: 'DELETE',
    });

    return response.ok;
  } catch (error) {
    console.error('[Notifications] Delete notification error:', error);
    return false;
  }
}

// ============================================
// Payout Notification Functions
// ============================================

/**
 * Notify leader when payout is requested
 */
export async function notifyPayoutRequested(
  leaderId: string,
  data: PayoutNotificationData
): Promise<void> {
  await sendNotification(
    leaderId,
    'payout_requested',
    '정산 요청 접수',
    `${data.amount.toLocaleString()}원 정산 요청이 접수되었습니다.`,
    {
      data,
      priority: 'medium',
      pushUrl: '/leader?tab=payouts',
      expiresInHours: 168, // 7 days
    }
  );
}

/**
 * Notify leader when payout is confirmed
 */
export async function notifyPayoutConfirmed(
  leaderId: string,
  data: PayoutNotificationData
): Promise<void> {
  await sendNotification(
    leaderId,
    'payout_confirmed',
    '정산 승인 완료',
    `${data.amount.toLocaleString()}원 정산이 승인되었습니다. ${data.estimated_date ? `예상 입금일: ${data.estimated_date}` : ''}`,
    {
      data,
      priority: 'high',
      pushUrl: '/leader?tab=payouts',
      expiresInHours: 168,
    }
  );
}

/**
 * Notify leader when payout is processing
 */
export async function notifyPayoutProcessing(
  leaderId: string,
  data: PayoutNotificationData
): Promise<void> {
  await sendNotification(
    leaderId,
    'payout_processing',
    '정산 처리 중',
    `${data.amount.toLocaleString()}원 정산이 처리 중입니다. 곧 입금됩니다.`,
    {
      data,
      priority: 'medium',
      pushUrl: '/leader?tab=payouts',
      expiresInHours: 72,
    }
  );
}

/**
 * Notify leader when payout is completed
 */
export async function notifyPayoutCompleted(
  leaderId: string,
  data: PayoutNotificationData
): Promise<void> {
  await sendNotification(
    leaderId,
    'payout_completed',
    '정산 완료!',
    `${data.amount.toLocaleString()}원이 입금되었습니다.`,
    {
      data,
      priority: 'high',
      pushUrl: '/leader?tab=payouts',
      expiresInHours: 168,
    }
  );
}

/**
 * Notify leader when payout is rejected
 */
export async function notifyPayoutRejected(
  leaderId: string,
  data: PayoutNotificationData
): Promise<void> {
  await sendNotification(
    leaderId,
    'payout_rejected',
    '정산 요청 거절',
    `정산 요청이 거절되었습니다.${data.reason ? ` 사유: ${data.reason}` : ''}`,
    {
      data,
      priority: 'urgent',
      pushUrl: '/leader?tab=payouts',
      expiresInHours: 336, // 14 days
    }
  );
}
