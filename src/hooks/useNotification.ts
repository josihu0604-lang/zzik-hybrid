'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * useNotification - 알림 관리 훅
 *
 * Features:
 * - localStorage 기반 알림 저장
 * - 읽음/안읽음 상태 관리
 * - 알림 추가/삭제
 * - 우선순위 정렬
 */

const STORAGE_KEY = 'zzik_notifications';
const MAX_NOTIFICATIONS = 50;

export type NotificationType =
  | 'participation' // 참여 알림
  | 'milestone' // 진행률 마일스톤
  | 'confirmed' // 오픈 확정
  | 'deadline' // 마감 임박
  | 'checkin' // 찍음 완료
  | 'referral' // 리더 레퍼럴
  | 'system'; // 시스템 알림

export type NotificationPriority = 'critical' | 'high' | 'normal' | 'low';

/**
 * Notification data payload types
 */
export interface ParticipationNotificationData {
  popupId: string;
  brandName: string;
  currentParticipants: number;
  goalParticipants: number;
}

export interface MilestoneNotificationData {
  popupId: string;
  milestone: number;
  currentParticipants: number;
}

export interface CheckinNotificationData {
  popupId: string;
  score: number;
  passed: boolean;
}

export interface ReferralNotificationData {
  referralCode: string;
  earnings: number;
}

export type NotificationData =
  | ParticipationNotificationData
  | MilestoneNotificationData
  | CheckinNotificationData
  | ReferralNotificationData
  | Record<string, string | number | boolean>;

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  /** 관련 팝업 ID */
  popupId?: string;
  /** 관련 URL */
  link?: string;
  /** 읽음 여부 */
  read: boolean;
  /** 생성 시간 */
  createdAt: string;
  /** 추가 데이터 */
  data?: NotificationData;
}

export interface UseNotificationReturn {
  /** 전체 알림 목록 */
  notifications: Notification[];
  /** 읽지 않은 알림 수 */
  unreadCount: number;
  /** 알림 추가 */
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  /** 알림 읽음 처리 */
  markAsRead: (id: string) => void;
  /** 전체 읽음 처리 */
  markAllAsRead: () => void;
  /** 알림 삭제 */
  removeNotification: (id: string) => void;
  /** 전체 삭제 */
  clearAll: () => void;
  /** 알림 존재 여부 */
  hasNotifications: boolean;
}

// 우선순위별 가중치 (정렬용)
const PRIORITY_WEIGHT: Record<NotificationPriority, number> = {
  critical: 4,
  high: 3,
  normal: 2,
  low: 1,
};

/**
 * localStorage에서 알림 로드
 */
function loadNotifications(): Notification[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('[useNotification] Failed to load:', error);
  }

  return [];
}

/**
 * localStorage에 알림 저장
 */
function saveNotifications(notifications: Notification[]): void {
  if (typeof window === 'undefined') return;

  try {
    // 최대 개수 제한
    const limited = notifications.slice(0, MAX_NOTIFICATIONS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
  } catch (error) {
    console.error('[useNotification] Failed to save:', error);
  }
}

/**
 * 고유 ID 생성
 */
function generateId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function useNotification(): UseNotificationReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // 초기 로드
  useEffect(() => {
    setNotifications(loadNotifications());
  }, []);

  // 읽지 않은 알림 수
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // 알림 존재 여부
  const hasNotifications = notifications.length > 0;

  // 알림 추가
  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
      const newNotification: Notification = {
        ...notification,
        id: generateId(),
        read: false,
        createdAt: new Date().toISOString(),
      };

      setNotifications((prev) => {
        // 우선순위 + 시간순 정렬
        const updated = [newNotification, ...prev].sort((a, b) => {
          const priorityDiff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        saveNotifications(updated);
        return updated;
      });
    },
    []
  );

  // 읽음 처리
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveNotifications(updated);
      return updated;
    });
  }, []);

  // 전체 읽음 처리
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  }, []);

  // 알림 삭제
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      saveNotifications(updated);
      return updated;
    });
  }, []);

  // 전체 삭제
  const clearAll = useCallback(() => {
    setNotifications([]);
    saveNotifications([]);
  }, []);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    hasNotifications,
  };
}

/**
 * 알림 타입별 아이콘/색상 설정
 */
export const NOTIFICATION_CONFIG: Record<
  NotificationType,
  { icon: string; color: string; label: string }
> = {
  participation: { icon: 'Users', color: '#FF6B5B', label: '참여' },
  milestone: { icon: 'TrendingUp', color: '#FFD93D', label: '마일스톤' },
  confirmed: { icon: 'PartyPopper', color: '#22c55e', label: '오픈 확정' },
  deadline: { icon: 'Clock', color: '#f97316', label: '마감 임박' },
  checkin: { icon: 'MapPin', color: '#FF6B5B', label: '찍음' },
  referral: { icon: 'Gift', color: '#FFD93D', label: '레퍼럴' },
  system: { icon: 'Bell', color: '#6366f1', label: '시스템' },
};

export default useNotification;
