'use client';

import { useState } from 'react';
import { m, AnimatePresence } from '@/lib/motion';
import { Target, Trophy, Flame, ChevronRight, Settings } from 'lucide-react';
import { colors } from '@/lib/design-tokens';

/**
 * WeeklyGoal - 주간 목표 추적
 *
 * 주간 리퍼럴/체크인 목표 설정 및 진행률
 */

interface WeeklyGoalData {
  referralGoal: number;
  referralCurrent: number;
  checkinGoal: number;
  checkinCurrent: number;
  streak: number; // 연속 목표 달성 주
}

interface WeeklyGoalProps {
  data: WeeklyGoalData;
  onUpdateGoal?: (type: 'referral' | 'checkin', value: number) => void;
  className?: string;
}

export function WeeklyGoal({ data, onUpdateGoal, className = '' }: WeeklyGoalProps) {
  const [showSettings, setShowSettings] = useState(false);

  const referralProgress = Math.min((data.referralCurrent / data.referralGoal) * 100, 100);
  const checkinProgress = Math.min((data.checkinCurrent / data.checkinGoal) * 100, 100);

  const isReferralComplete = data.referralCurrent >= data.referralGoal;
  const isCheckinComplete = data.checkinCurrent >= data.checkinGoal;
  const isWeekComplete = isReferralComplete && isCheckinComplete;

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl overflow-hidden ${className}`}
      style={{
        background: isWeekComplete
          ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)'
          : 'rgba(18, 19, 20, 0.8)',
        border: `1px solid ${isWeekComplete ? colors.success : colors.border.subtle}40`,
      }}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <m.div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: isWeekComplete
                ? `linear-gradient(135deg, ${colors.success} 0%, ${colors.info} 100%)`
                : 'rgba(255, 107, 91, 0.2)',
            }}
            animate={
              isWeekComplete
                ? {
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }
                : {}
            }
            transition={{ duration: 0.5, repeat: isWeekComplete ? Infinity : 0, repeatDelay: 2 }}
          >
            {isWeekComplete ? (
              <Trophy size={20} style={{ color: 'white' }} />
            ) : (
              <Target size={20} style={{ color: colors.flame[500] }} />
            )}
          </m.div>
          <div>
            <h3 className="text-white font-bold text-sm">
              {isWeekComplete ? '이번 주 목표 달성!' : '이번 주 목표'}
            </h3>
            <p className="text-linear-text-tertiary text-xs">
              {data.streak > 0 && (
                <span className="flex items-center gap-1">
                  <Flame size={10} style={{ color: colors.flame[500] }} />
                  {data.streak}주 연속 달성 중
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-lg transition-colors hover:bg-white/10"
        >
          <Settings size={16} className="text-linear-text-tertiary" />
        </button>
      </div>

      {/* Goals */}
      <div className="px-4 pb-4 space-y-3">
        {/* Referral Goal */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-linear-text-secondary text-xs">리퍼럴</span>
            <span
              className="text-xs font-bold"
              style={{ color: isReferralComplete ? colors.success : colors.flame[500] }}
            >
              {data.referralCurrent}/{data.referralGoal}
            </span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          >
            <m.div
              className="h-full rounded-full"
              style={{
                background: isReferralComplete
                  ? colors.success
                  : `linear-gradient(90deg, ${colors.flame[500]} 0%, ${colors.flame[400] || colors.flame[500]}80 100%)`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${referralProgress}%` }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
        </div>

        {/* Checkin Goal */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-linear-text-secondary text-xs">체크인</span>
            <span
              className="text-xs font-bold"
              style={{ color: isCheckinComplete ? colors.success : colors.spark[500] }}
            >
              {data.checkinCurrent}/{data.checkinGoal}
            </span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          >
            <m.div
              className="h-full rounded-full"
              style={{
                background: isCheckinComplete
                  ? colors.success
                  : `linear-gradient(90deg, ${colors.spark[500]} 0%, ${colors.spark[400] || colors.spark[500]}80 100%)`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${checkinProgress}%` }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
            />
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-linear-border overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <p className="text-linear-text-tertiary text-xs">목표 설정</p>

              <div className="grid grid-cols-2 gap-3">
                <GoalInput
                  label="리퍼럴 목표"
                  value={data.referralGoal}
                  onChange={(v) => onUpdateGoal?.('referral', v)}
                  color={colors.flame[500]}
                />
                <GoalInput
                  label="체크인 목표"
                  value={data.checkinGoal}
                  onChange={(v) => onUpdateGoal?.('checkin', v)}
                  color={colors.spark[500]}
                />
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* CTA if not complete */}
      {!isWeekComplete && (
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{
            background: 'rgba(255, 107, 91, 0.1)',
            borderTop: `1px solid ${colors.flame[500]}30`,
          }}
        >
          <span className="text-xs text-linear-text-secondary">
            목표 달성까지 리퍼럴 {Math.max(0, data.referralGoal - data.referralCurrent)}명
          </span>
          <ChevronRight size={14} style={{ color: colors.flame[500] }} />
        </div>
      )}
    </m.div>
  );
}

// Goal Input Component
function GoalInput({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: number;
  onChange?: (v: number) => void;
  color: string;
}) {
  return (
    <div>
      <label className="text-micro text-linear-text-tertiary mb-1 block">{label}</label>
      <div
        className="flex items-center rounded-lg overflow-hidden"
        style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: `1px solid ${color}30`,
        }}
      >
        <button
          onClick={() => onChange?.(Math.max(1, value - 5))}
          className="px-3 py-2 text-white hover:bg-white/10 transition-colors"
        >
          -
        </button>
        <span className="flex-1 text-center font-bold" style={{ color }}>
          {value}
        </span>
        <button
          onClick={() => onChange?.(value + 5)}
          className="px-3 py-2 text-white hover:bg-white/10 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

// Demo data
export const DEMO_WEEKLY_GOAL: WeeklyGoalData = {
  referralGoal: 20,
  referralCurrent: 15,
  checkinGoal: 10,
  checkinCurrent: 8,
  streak: 3,
};

export default WeeklyGoal;
