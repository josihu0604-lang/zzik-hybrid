'use client';

import { useEffect, useState, useMemo } from 'react';

/**
 * useCountdown - D-Day 카운트다운 Hook
 *
 * 마감 시간까지 남은 시간을 실시간으로 계산합니다.
 * FOMO 엔진 - "시간이 촉박해요!"
 */

export interface TimeLeft {
  /** 남은 일수 */
  days: number;
  /** 남은 시간 */
  hours: number;
  /** 남은 분 */
  minutes: number;
  /** 남은 초 */
  seconds: number;
  /** 총 남은 밀리초 */
  totalMs: number;
  /** 마감 임박 여부 (24시간 이내) */
  isUrgent: boolean;
  /** 매우 긴급 (3시간 이내) */
  isCritical: boolean;
  /** 마감됨 */
  isExpired: boolean;
}

function calculateTimeLeft(deadline: string | Date): TimeLeft {
  const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline;
  const now = new Date();
  const diff = deadlineDate.getTime() - now.getTime();

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: 0,
      isUrgent: false,
      isCritical: false,
      isExpired: true,
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const isUrgent = diff < 24 * 60 * 60 * 1000; // 24시간 이내
  const isCritical = diff < 3 * 60 * 60 * 1000; // 3시간 이내

  return {
    days,
    hours,
    minutes,
    seconds,
    totalMs: diff,
    isUrgent,
    isCritical,
    isExpired: false,
  };
}

export function useCountdown(deadline: string | Date | null): TimeLeft | null {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() =>
    deadline ? calculateTimeLeft(deadline) : null
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (!deadline) {
      setTimeLeft(null);
      return;
    }

    // 초기값 설정
    setTimeLeft(calculateTimeLeft(deadline));

    // DES-048: 1초마다 업데이트 (상수 사용)
    const UPDATE_INTERVAL = 1000; // 1초
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(deadline);
      setTimeLeft(newTimeLeft);

      // 만료되면 타이머 중지
      if (newTimeLeft.isExpired) {
        clearInterval(timer);
      }
    }, UPDATE_INTERVAL);

    return () => clearInterval(timer);
  }, [deadline]);

  return timeLeft;
}

/**
 * 카운트다운 포맷팅 유틸리티
 */
export function formatCountdown(timeLeft: TimeLeft): string {
  if (timeLeft.isExpired) {
    return '마감됨';
  }

  if (timeLeft.days > 0) {
    return `D-${timeLeft.days}`;
  }

  if (timeLeft.hours > 0) {
    return `${timeLeft.hours}시간 ${timeLeft.minutes}분`;
  }

  if (timeLeft.minutes > 0) {
    return `${timeLeft.minutes}분 ${timeLeft.seconds}초`;
  }

  return `${timeLeft.seconds}초`;
}

/**
 * 상세 카운트다운 포맷 (D-3 12:34:56)
 */
export function formatDetailedCountdown(timeLeft: TimeLeft): string {
  if (timeLeft.isExpired) {
    return '마감됨';
  }

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (timeLeft.days > 0) {
    return `D-${timeLeft.days} ${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}`;
  }

  return `${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}`;
}

/**
 * useFormattedCountdown - 포맷된 카운트다운 문자열 반환
 */
export function useFormattedCountdown(
  deadline: string | Date | null,
  format: 'simple' | 'detailed' = 'simple'
): { formatted: string; timeLeft: TimeLeft | null } {
  const timeLeft = useCountdown(deadline);

  const formatted = useMemo(() => {
    if (!timeLeft) return '';
    return format === 'detailed' ? formatDetailedCountdown(timeLeft) : formatCountdown(timeLeft);
  }, [timeLeft, format]);

  return { formatted, timeLeft };
}

export default useCountdown;
