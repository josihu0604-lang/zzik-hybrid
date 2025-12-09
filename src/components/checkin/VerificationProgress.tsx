'use client';

import { m } from 'framer-motion';
import { colors } from '@/lib/design-tokens';

/**
 * VerificationProgress - Triple Verification 점수 표시
 *
 * GPS (40) + QR (40) + Receipt (20) = 100
 * 통과: 60점 이상
 */

interface VerificationItem {
  label: string;
  icon: string;
  score: number;
  maxScore: number;
  status: 'pending' | 'checking' | 'success' | 'fail';
}

interface VerificationProgressProps {
  items: VerificationItem[];
  totalScore: number;
  passed: boolean;
  className?: string;
}

export function VerificationProgress({
  items,
  totalScore,
  passed,
  className = '',
}: VerificationProgressProps) {
  const PASS_THRESHOLD = 60;
  const percentage = (totalScore / 100) * 100;

  return (
    <div className={`space-y-4 ${className}`} role="status" aria-live="polite">
      {/* Total Score Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: colors.text.secondary }}>
            인증 점수
          </span>
          <span
            className="text-lg font-bold"
            style={{ color: passed ? colors.success : colors.flame[500] }}
          >
            {totalScore}/100점
          </span>
        </div>

        <div
          className="relative h-3 rounded-full overflow-hidden"
          style={{ background: colors.space[800] }}
        >
          {/* Pass threshold marker */}
          <div
            className="absolute top-0 h-full w-0.5 z-10"
            style={{
              left: `${PASS_THRESHOLD}%`,
              background: colors.text.muted,
            }}
          />

          {/* Progress fill */}
          <m.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              background: passed
                ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                : `linear-gradient(90deg, ${colors.flame[500]}, ${colors.flame[400]})`,
            }}
          />
        </div>

        <p className="text-xs mt-1" style={{ color: colors.text.muted }}>
          {passed ? '✓ 인증 통과!' : `60점 이상 필요 (${PASS_THRESHOLD - totalScore}점 부족)`}
        </p>
      </div>

      {/* Individual Items */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <m.div
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{
              background: colors.space[850],
              border: `1px solid ${
                item.status === 'success'
                  ? 'rgba(34, 197, 94, 0.3)'
                  : item.status === 'fail'
                    ? 'rgba(239, 68, 68, 0.3)'
                    : colors.border.subtle
              }`,
            }}
          >
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{
                background:
                  item.status === 'success'
                    ? 'rgba(34, 197, 94, 0.15)'
                    : item.status === 'fail'
                      ? 'rgba(239, 68, 68, 0.15)'
                      : item.status === 'checking'
                        ? `rgba(255, 107, 91, 0.15)`
                        : colors.space[800],
              }}
            >
              {item.status === 'checking' ? (
                <m.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  ⏳
                </m.span>
              ) : (
                item.icon
              )}
            </div>

            {/* Label and Score */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium" style={{ color: colors.text.primary }}>
                  {item.label}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{
                    color:
                      item.status === 'success'
                        ? '#22c55e'
                        : item.status === 'fail'
                          ? '#ef4444'
                          : colors.text.muted,
                  }}
                >
                  +{item.score}/{item.maxScore}
                </span>
              </div>

              {/* Status text */}
              <span
                className="text-xs"
                style={{
                  color:
                    item.status === 'success'
                      ? '#22c55e'
                      : item.status === 'fail'
                        ? '#ef4444'
                        : item.status === 'checking'
                          ? colors.flame[500]
                          : colors.text.muted,
                }}
              >
                {item.status === 'pending' && '대기 중'}
                {item.status === 'checking' && '확인 중...'}
                {item.status === 'success' && '✓ 인증 완료'}
                {item.status === 'fail' && '✗ 인증 실패'}
              </span>
            </div>
          </m.div>
        ))}
      </div>
    </div>
  );
}

export default VerificationProgress;
