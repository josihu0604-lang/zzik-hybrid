'use client';

import { useEffect, useState, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * useRealtimeParticipation - Supabase Realtime 구독 Hook
 *
 * 팝업 참여 이벤트를 실시간으로 구독하여 UI를 자동 업데이트합니다.
 * FOMO 엔진의 핵심 - "누군가 방금 참여했어요!"
 */

interface UseRealtimeParticipationOptions {
  /** 초기 참여자 수 */
  initialCount: number;
  /** 새 참여 발생 시 콜백 */
  onNewParticipation?: () => void;
  /** Realtime 활성화 여부 (기본: true) */
  enabled?: boolean;
}

interface UseRealtimeParticipationReturn {
  /** 현재 참여자 수 */
  participants: number;
  /** 참여자 수 직접 설정 (Optimistic UI용) */
  setParticipants: (value: number | ((prev: number) => number)) => void;
  /** 연결 상태 */
  isConnected: boolean;
  /** 마지막 업데이트 시간 */
  lastUpdate: Date | null;
}

export function useRealtimeParticipation(
  popupId: string | null,
  options: UseRealtimeParticipationOptions
): UseRealtimeParticipationReturn {
  const { initialCount, onNewParticipation, enabled = true } = options;

  const [participants, setParticipants] = useState(initialCount);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // 초기값 동기화
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setParticipants(initialCount);
  }, [initialCount]);

  // Realtime 구독
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (!popupId || !enabled) return;

    const supabase = createClient();
    let channel: RealtimeChannel | null = null;

    const setupChannel = () => {
      channel = supabase
        .channel(`popup-participation:${popupId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'popup_participations',
            filter: `popup_id=eq.${popupId}`,
          },
          (payload) => {
            logger.debug('[Realtime] New participation:', payload);
            setParticipants((prev) => prev + 1);
            setLastUpdate(new Date());
            onNewParticipation?.();
          }
        )
        .subscribe((status) => {
          logger.debug('[Realtime] Subscription status:', status);
          setIsConnected(status === 'SUBSCRIBED');
        });
    };

    setupChannel();

    // Cleanup
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [popupId, enabled, onNewParticipation]);

  const setParticipantsCallback = useCallback((value: number | ((prev: number) => number)) => {
    setParticipants(value);
  }, []);

  return {
    participants,
    setParticipants: setParticipantsCallback,
    isConnected,
    lastUpdate,
  };
}

/**
 * useRealtimePopupList - 여러 팝업의 참여 현황을 실시간으로 구독
 *
 * Home 페이지에서 전체 목록의 실시간 업데이트에 사용
 */
interface PopupUpdate {
  popupId: string;
  newCount: number;
}

export function useRealtimePopupList(
  enabled: boolean = true,
  onUpdate?: (update: PopupUpdate) => void
) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (!enabled) return;

    const supabase = createClient();

    const channel = supabase
      .channel('popup-list-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'popups',
        },
        (payload) => {
          logger.debug('[Realtime] Popup updated:', payload);
          if (payload.new && 'id' in payload.new && 'current_participants' in payload.new) {
            onUpdate?.({
              popupId: payload.new.id as string,
              newCount: payload.new.current_participants as number,
            });
          }
        }
      )
      .subscribe((status) => {
        logger.debug('[Realtime] List subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, onUpdate]);

  return { isConnected };
}

export default useRealtimeParticipation;
