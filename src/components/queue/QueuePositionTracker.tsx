/**
 * Queue Position Tracker Component
 * Animated progress visualization for queue position
 */

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Trophy, Clock, Users } from 'lucide-react';
import { QueueTimeEstimator } from '@/lib/realtime-queue';
import type { QueueEntry } from '@/lib/realtime-queue';

interface QueuePositionTrackerProps {
  entry: QueueEntry;
  totalInQueue: number;
  locale?: string;
  onPositionChange?: (oldPosition: number, newPosition: number) => void;
}

export function QueuePositionTracker({
  entry,
  totalInQueue,
  locale = 'en',
  onPositionChange,
}: QueuePositionTrackerProps) {
  const [previousPosition, setPreviousPosition] = useState(entry.position);
  const [showChange, setShowChange] = useState(false);

  // Animated progress value
  const progress = useSpring(0, {
    stiffness: 100,
    damping: 20,
  });

  const progressPercent = useTransform(progress, [0, 1], [0, 100]);

  // Update progress when position changes
  useEffect(() => {
    if (previousPosition !== entry.position) {
      setShowChange(true);
      onPositionChange?.(previousPosition, entry.position);
      
      setTimeout(() => {
        setPreviousPosition(entry.position);
        setShowChange(false);
      }, 2000);
    }

    // Calculate progress (inverse: lower position = higher progress)
    const progressValue = Math.max(0, 1 - (entry.position - 1) / totalInQueue);
    progress.set(progressValue);
  }, [entry.position, totalInQueue, previousPosition, progress, onPositionChange]);

  const positionChange = previousPosition - entry.position;
  const isImproving = positionChange > 0;
  const isWorsening = positionChange < 0;

  return (
    <div className="space-y-4">
      {/* Position Badge with Animation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            key={entry.position}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">
                #{entry.position}
              </span>
            </div>
            
            {/* Pulse effect for first position */}
            {entry.position === 1 && (
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full"
              />
            )}

            {/* Trophy for first position */}
            {entry.position === 1 && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
              >
                <Trophy className="w-5 h-5 text-white" />
              </motion.div>
            )}
          </motion.div>

          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {locale === 'ko' ? '현재 위치' :
               locale === 'ja' ? '現在位置' :
               locale === 'zh' ? '当前位置' :
               'Your Position'}
            </h3>
            <p className="text-sm text-gray-600">
              {totalInQueue}{' '}
              {locale === 'ko' ? '명 중' :
               locale === 'ja' ? '人中' :
               locale === 'zh' ? '人中' :
               'in queue'}
            </p>
          </div>
        </div>

        {/* Position Change Indicator */}
        <AnimatePresence>
          {showChange && positionChange !== 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                isImproving
                  ? 'bg-green-100 text-green-700'
                  : isWorsening
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {isImproving ? (
                <>
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-semibold">+{positionChange}</span>
                </>
              ) : isWorsening ? (
                <>
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-sm font-semibold">{positionChange}</span>
                </>
              ) : (
                <>
                  <Minus className="w-4 h-4" />
                  <span className="text-sm font-semibold">0</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {locale === 'ko' ? '진행 상황' :
             locale === 'ja' ? '進捗状況' :
             locale === 'zh' ? '进度' :
             'Progress'}
          </span>
          <motion.span className="font-semibold text-purple-600">
            {progressPercent.get().toFixed(0)}%
          </motion.span>
        </div>

        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          {/* Animated gradient background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Progress fill */}
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg"
            style={{
              width: progressPercent.get() + '%',
            }}
          >
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        </div>

        {/* Milestone markers */}
        <div className="relative h-6">
          {[25, 50, 75].map((milestone) => (
            <div
              key={milestone}
              className="absolute top-0 transform -translate-x-1/2"
              style={{ left: `${milestone}%` }}
            >
              <div className="w-px h-2 bg-gray-300" />
              <span className="text-xs text-gray-400 mt-1 block text-center">
                {milestone}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Time and Party Info */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-gray-600">
              {locale === 'ko' ? '예상 시간' :
               locale === 'ja' ? '予想時間' :
               locale === 'zh' ? '预计时间' :
               'Est. Time'}
            </span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {QueueTimeEstimator.formatWaitTime(entry.estimatedWaitMinutes, locale)}
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-gray-600">
              {locale === 'ko' ? '인원' :
               locale === 'ja' ? '人数' :
               locale === 'zh' ? '人数' :
               'Party'}
            </span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {entry.partySize}{' '}
            {locale === 'ko' ? '명' :
             locale === 'ja' ? '名' :
             locale === 'zh' ? '人' :
             'people'}
          </p>
        </motion.div>
      </div>

      {/* Position-based messages */}
      <PositionMessage position={entry.position} locale={locale} />
    </div>
  );
}

/**
 * Dynamic message based on queue position
 */
function PositionMessage({ position, locale }: { position: number; locale: string }) {
  const getMessage = () => {
    if (position === 1) {
      return {
        text: locale === 'ko' ? '🎉 다음 차례입니다!' :
              locale === 'ja' ? '🎉 次の番です！' :
              locale === 'zh' ? '🎉 轮到你了！' :
              '🎉 You\'re next!',
        color: 'bg-green-50 text-green-700 border-green-200',
      };
    } else if (position <= 3) {
      return {
        text: locale === 'ko' ? '⚡ 곧 입장하실 수 있습니다' :
              locale === 'ja' ? '⚡ まもなくご案内します' :
              locale === 'zh' ? '⚡ 即将入场' :
              '⚡ Almost there!',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
      };
    } else if (position <= 5) {
      return {
        text: locale === 'ko' ? '👀 준비해주세요' :
              locale === 'ja' ? '👀 準備してください' :
              locale === 'zh' ? '👀 请准备' :
              '👀 Get ready!',
        color: 'bg-purple-50 text-purple-700 border-purple-200',
      };
    } else {
      return {
        text: locale === 'ko' ? '⏰ 잠시만 기다려주세요' :
              locale === 'ja' ? '⏰ 少々お待ちください' :
              locale === 'zh' ? '⏰ 请稍候' :
              '⏰ Please wait',
        color: 'bg-gray-50 text-gray-700 border-gray-200',
      };
    }
  };

  const { text, color } = getMessage();

  return (
    <motion.div
      key={position}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-3 px-4 rounded-xl border-2 ${color} font-medium`}
    >
      {text}
    </motion.div>
  );
}

/**
 * Mini position tracker for compact display
 */
export function CompactPositionTracker({
  position,
  totalInQueue,
  estimatedMinutes,
  locale = 'en',
}: {
  position: number;
  totalInQueue: number;
  estimatedMinutes: number;
  locale?: string;
}) {
  const progress = Math.max(0, 1 - (position - 1) / totalInQueue) * 100;

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12">
        {/* Circular progress */}
        <svg className="transform -rotate-90 w-12 h-12">
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-gray-200"
          />
          <motion.circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className="text-purple-600"
            initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - progress / 100) }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-900">#{position}</span>
        </div>
      </div>

      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">
          {position} / {totalInQueue}
        </p>
        <p className="text-xs text-gray-600">
          {QueueTimeEstimator.formatWaitTime(estimatedMinutes, locale)}
        </p>
      </div>
    </div>
  );
}
