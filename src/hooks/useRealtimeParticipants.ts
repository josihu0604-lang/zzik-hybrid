'use client';

import { useState, useCallback, useRef } from 'react';
import type { Participant } from '@/types/participant';
import { useRealtimeSubscription } from './useRealtimeSubscription';

/**
 * useRealtimeParticipants - 실시간 참여자 추적 훅
 *
 * Supabase Realtime으로 참여자 수 실시간 업데이트
 * Mock fallback 지원 (데모용)
 */

interface RealtimeParticipantsState {
  count: number;
  recentParticipants: Participant[];
  latestParticipant: Participant | null;
  isConnected: boolean;
  isDemo: boolean;
}

interface UseRealtimeParticipantsOptions {
  popupId: string;
  initialCount: number;
  goalCount: number;
  enabled?: boolean;
  onGoalReached?: () => void;
  onNewParticipant?: (participant: Participant) => void;
}

// Mock Korean names for demo
const MOCK_NAMES = [
  '김민준',
  '이서연',
  '박지호',
  '최수빈',
  '정예준',
  '강하은',
  '조민서',
  '윤시우',
  '장서준',
  '임지아',
  '한도윤',
  '오하린',
  '신유준',
  '송채원',
  '권지민',
];

function getRandomName(): string {
  return MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
}

function createMockParticipant(): Participant {
  return {
    id: `mock-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: getRandomName(),
    joinedAt: new Date(),
  };
}

export function useRealtimeParticipants({
  popupId,
  initialCount,
  goalCount,
  enabled = true,
  onGoalReached,
  onNewParticipant,
}: UseRealtimeParticipantsOptions): RealtimeParticipantsState {
  const [count, setCount] = useState(initialCount);
  const [recentParticipants, setRecentParticipants] = useState<Participant[]>([]);
  const [latestParticipant, setLatestParticipant] = useState<Participant | null>(null);

  const goalReachedRef = useRef(false);

  // Handle new participant
  const handleNewParticipant = useCallback(
    (participant: Participant) => {
      setCount((prev) => {
        const newCount = prev + 1;
        // Check goal reached
        if (newCount >= goalCount && !goalReachedRef.current) {
          goalReachedRef.current = true;
          onGoalReached?.();
        }
        return newCount;
      });

      setRecentParticipants((prev) => [participant, ...prev].slice(0, 5));
      setLatestParticipant(participant);
      onNewParticipant?.(participant);

      // Clear latest after 5 seconds
      setTimeout(() => {
        setLatestParticipant((prev) => (prev?.id === participant.id ? null : prev));
      }, 5000);
    },
    [goalCount, onGoalReached, onNewParticipant]
  );

  // Handle realtime data from Supabase
  const handleRealtimeData = useCallback(
    (payload: { id: string; user_name?: string; created_at: string }) => {
      const newParticipant: Participant = {
        id: payload.id,
        name: payload.user_name || '참여자',
        joinedAt: new Date(payload.created_at),
      };
      handleNewParticipant(newParticipant);
    },
    [handleNewParticipant]
  );

  // Handle demo mode tick
  const handleDemoTick = useCallback(() => {
    // Random chance (30%) to add a participant
    if (Math.random() < 0.3) {
      const mockParticipant = createMockParticipant();
      handleNewParticipant(mockParticipant);
    }
  }, [handleNewParticipant]);

  // Use generic realtime subscription hook
  const subscriptionState = useRealtimeSubscription<{
    id: string;
    user_name?: string;
    created_at: string;
  }>(`popup-${popupId}`, {
    table: 'popup_participations',
    event: 'INSERT',
    filter: `popup_id=eq.${popupId}`,
    onData: handleRealtimeData,
    enabled: enabled && !!popupId,
    onDemoTick: handleDemoTick,
    demoTickInterval: 5000,
  });

  return {
    count,
    recentParticipants,
    latestParticipant,
    isConnected: subscriptionState.isConnected,
    isDemo: subscriptionState.isDemo,
  };
}

export default useRealtimeParticipants;
