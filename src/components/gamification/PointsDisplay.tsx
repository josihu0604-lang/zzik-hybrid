'use client';

import { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
  Zap,
  TrendingUp,
  Gift,
  Award,
  Flame,
  Star,
  ChevronRight,
  Plus,
  Clock,
  Target,
  Sparkles,
  ArrowUp,
} from 'lucide-react';
import { colors, rgba, gradients } from '@/lib/design-tokens';
import { useLocale } from '@/providers/LocaleProvider';
import Link from 'next/link';

// ============================================
// Types & Interfaces
// ============================================

export interface PointTransaction {
  id: string;
  type: 'earn' | 'spend' | 'bonus' | 'expire';
  amount: number;
  description: string;
  descriptionKo: string;
  timestamp: Date;
  source?: string;
}

export interface LevelInfo {
  current: number;
  name: string;
  nameKo: string;
  currentXP: number;
  nextLevelXP: number;
  icon: string;
}

export interface PointsBoost {
  id: string;
  multiplier: number;
  name: string;
  nameKo: string;
  expiresAt: Date;
  source: string;
}

export interface PointsData {
  balance: number;
  pendingPoints: number;
  lifetimePoints: number;
  level: LevelInfo;
  streak: number;
  streakBonus: number;
  activeBoosts: PointsBoost[];
  recentTransactions: PointTransaction[];
}

interface PointsDisplayProps {
  data: PointsData;
  variant?: 'default' | 'compact' | 'detailed' | 'card';
  showTransactions?: boolean;
  showLevel?: boolean;
  showStreak?: boolean;
  showBoosts?: boolean;
  onEarn?: () => void;
  className?: string;
}

// ============================================
// Constants
// ============================================

const LEVEL_COLORS: Record<number, string> = {
  1: colors.gray[400],
  2: colors.green[400],
  3: colors.blue[400],
  4: colors.purple[400],
  5: colors.flame[500],
  6: colors.yellow[400],
  7: colors.pink[400],
  8: colors.cyan[400],
  9: colors.orange[400],
  10: '#FFD700', // Gold
};

// ============================================
// Sub-Components
// ============================================

// Animated Counter
function AnimatedCounter({ value, duration = 1 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    const startValue = displayValue;
    const endValue = value;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(startValue + (endValue - startValue) * easeOut));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
}

// Level Progress Ring
function LevelProgressRing({ 
  level, 
  size = 80 
}: { 
  level: LevelInfo; 
  size?: number;
}) {
  const progress = (level.currentXP / level.nextLevelXP) * 100;
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const levelColor = LEVEL_COLORS[level.current] || colors.flame[500];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={rgba.white[10]}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <m.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={levelColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      
      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl">{level.icon}</span>
        <span 
          className="text-xs font-bold"
          style={{ color: levelColor }}
        >
          Lv.{level.current}
        </span>
      </div>
    </div>
  );
}

// Streak Display
function StreakDisplay({ streak, bonus, locale }: { streak: number; bonus: number; locale: string }) {
  const isActive = streak > 0;

  return (
    <div 
      className="p-3 rounded-xl flex items-center gap-3"
      style={{ 
        background: isActive ? colors.flame[500] + '15' : rgba.white[5],
        border: `1px solid ${isActive ? colors.flame[500] + '40' : rgba.white[10]}`,
      }}
    >
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ 
          background: isActive ? colors.flame[500] + '30' : rgba.white[10],
        }}
      >
        <Flame 
          size={22} 
          style={{ color: isActive ? colors.flame[500] : rgba.white[40] }}
          fill={isActive ? colors.flame[500] : 'none'}
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">{streak} {locale === 'ko' ? '일 연속' : 'day streak'}</span>
          {bonus > 0 && (
            <span 
              className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
              style={{ background: colors.flame[500], color: 'white' }}
            >
              +{bonus}%
            </span>
          )}
        </div>
        <p className="text-xs" style={{ color: rgba.white[50] }}>
          {locale === 'ko' ? '내일도 활동하면 보너스!' : 'Keep it up for bonus!'}
        </p>
      </div>
    </div>
  );
}

// Active Boost Card
function BoostCard({ boost, locale }: { boost: PointsBoost; locale: string }) {
  const timeRemaining = boost.expiresAt.getTime() - Date.now();
  const hoursRemaining = Math.max(0, Math.floor(timeRemaining / 3600000));
  const minutesRemaining = Math.max(0, Math.floor((timeRemaining % 3600000) / 60000));

  return (
    <div 
      className="p-3 rounded-xl"
      style={{ 
        background: `linear-gradient(135deg, ${colors.purple[500]}20, ${colors.flame[500]}20)`,
        border: `1px solid ${colors.purple[500]}40`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles size={16} style={{ color: colors.purple[400] }} />
          <span className="font-semibold text-white text-sm">
            {locale === 'ko' ? boost.nameKo : boost.name}
          </span>
        </div>
        <span 
          className="text-lg font-black"
          style={{ color: colors.purple[400] }}
        >
          x{boost.multiplier}
        </span>
      </div>
      <div className="flex items-center gap-1 text-xs" style={{ color: rgba.white[50] }}>
        <Clock size={12} />
        <span>
          {hoursRemaining}h {minutesRemaining}m {locale === 'ko' ? '남음' : 'left'}
        </span>
      </div>
    </div>
  );
}

// Transaction Item
function TransactionItem({ 
  transaction, 
  locale 
}: { 
  transaction: PointTransaction; 
  locale: string;
}) {
  const isPositive = transaction.type === 'earn' || transaction.type === 'bonus';
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return locale === 'ko' ? '방금' : 'Just now';
    if (diffMins < 60) return `${diffMins}${locale === 'ko' ? '분 전' : 'm ago'}`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}${locale === 'ko' ? '시간 전' : 'h ago'}`;
    return `${Math.floor(diffMins / 1440)}${locale === 'ko' ? '일 전' : 'd ago'}`;
  };

  const typeIcons = {
    earn: <Plus size={14} />,
    spend: <ArrowUp size={14} className="rotate-45" />,
    bonus: <Gift size={14} />,
    expire: <Clock size={14} />,
  };

  return (
    <div className="flex items-center gap-3 py-2">
      <div 
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ 
          background: isPositive ? colors.green[500] + '20' : colors.red[500] + '20',
          color: isPositive ? colors.green[400] : colors.red[400],
        }}
      >
        {typeIcons[transaction.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">
          {locale === 'ko' ? transaction.descriptionKo : transaction.description}
        </p>
        <p className="text-xs" style={{ color: rgba.white[40] }}>
          {formatTime(transaction.timestamp)}
        </p>
      </div>
      <span 
        className="font-semibold"
        style={{ color: isPositive ? colors.green[400] : colors.red[400] }}
      >
        {isPositive ? '+' : '-'}{transaction.amount.toLocaleString()}
      </span>
    </div>
  );
}

// ============================================
// Main Component Variants
// ============================================

// Compact Variant
function CompactPoints({ data, locale }: { data: PointsData; locale: string }) {
  return (
    <div className="flex items-center gap-3">
      <div 
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{ background: colors.flame[500] + '20' }}
      >
        <Zap size={16} style={{ color: colors.flame[500] }} fill={colors.flame[500]} />
        <span className="font-bold" style={{ color: colors.flame[400] }}>
          <AnimatedCounter value={data.balance} />
        </span>
      </div>
      {data.streak > 0 && (
        <div 
          className="flex items-center gap-1 px-2 py-1 rounded-full"
          style={{ background: rgba.white[5] }}
        >
          <Flame size={14} style={{ color: colors.flame[500] }} fill={colors.flame[500]} />
          <span className="text-xs font-semibold" style={{ color: colors.flame[400] }}>
            {data.streak}
          </span>
        </div>
      )}
    </div>
  );
}

// Card Variant
function CardPoints({ data, locale }: { data: PointsData; locale: string }) {
  return (
    <div 
      className="p-5 rounded-2xl relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: `1px solid ${rgba.white[10]}`,
      }}
    >
      {/* Background Glow */}
      <div 
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[80px] opacity-30"
        style={{ background: colors.flame[500] }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <Zap size={20} style={{ color: colors.flame[500] }} fill={colors.flame[500]} />
          <span className="font-semibold text-white">
            {locale === 'ko' ? '내 포인트' : 'My Points'}
          </span>
        </div>
        <Link 
          href="/points/history"
          className="text-xs flex items-center gap-1"
          style={{ color: rgba.white[50] }}
        >
          {locale === 'ko' ? '내역' : 'History'}
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* Balance */}
      <div className="text-center relative z-10 mb-4">
        <div className="text-4xl font-black text-white mb-1">
          <AnimatedCounter value={data.balance} duration={1.5} />
          <span className="text-lg ml-1" style={{ color: rgba.white[60] }}>P</span>
        </div>
        {data.pendingPoints > 0 && (
          <p className="text-xs" style={{ color: colors.yellow[400] }}>
            +{data.pendingPoints.toLocaleString()} {locale === 'ko' ? '적립 예정' : 'pending'}
          </p>
        )}
      </div>

      {/* Level & Streak */}
      <div className="flex items-center justify-center gap-4 relative z-10">
        <div className="text-center">
          <span className="text-2xl">{data.level.icon}</span>
          <p className="text-xs" style={{ color: rgba.white[50] }}>
            Lv.{data.level.current}
          </p>
        </div>
        {data.streak > 0 && (
          <div className="text-center">
            <div className="flex items-center gap-1">
              <Flame size={20} style={{ color: colors.flame[500] }} fill={colors.flame[500]} />
              <span className="font-bold text-white">{data.streak}</span>
            </div>
            <p className="text-xs" style={{ color: rgba.white[50] }}>
              {locale === 'ko' ? '일 연속' : 'streak'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function PointsDisplay({
  data,
  variant = 'default',
  showTransactions = true,
  showLevel = true,
  showStreak = true,
  showBoosts = true,
  onEarn,
  className = '',
}: PointsDisplayProps) {
  const { locale } = useLocale();

  // Compact variant
  if (variant === 'compact') {
    return <CompactPoints data={data} locale={locale} />;
  }

  // Card variant
  if (variant === 'card') {
    return <CardPoints data={data} locale={locale} />;
  }

  // Default & Detailed variant
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Balance */}
      <div 
        className="p-5 rounded-2xl relative overflow-hidden"
        style={{ 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          border: `1px solid ${rgba.white[10]}`,
        }}
      >
        {/* Background Glow */}
        <div 
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[80px] opacity-30"
          style={{ background: colors.flame[500] }}
        />

        <div className="flex items-start justify-between relative z-10">
          {/* Balance Section */}
          <div>
            <p className="text-sm mb-1" style={{ color: rgba.white[50] }}>
              {locale === 'ko' ? '총 포인트' : 'Total Points'}
            </p>
            <div className="text-4xl font-black text-white">
              <AnimatedCounter value={data.balance} duration={1.5} />
              <span className="text-lg ml-1" style={{ color: rgba.white[60] }}>P</span>
            </div>
            {data.pendingPoints > 0 && (
              <p className="text-sm mt-1" style={{ color: colors.yellow[400] }}>
                +{data.pendingPoints.toLocaleString()} {locale === 'ko' ? '적립 예정' : 'pending'}
              </p>
            )}
          </div>

          {/* Level Ring */}
          {showLevel && (
            <LevelProgressRing level={data.level} size={70} />
          )}
        </div>

        {/* Level Progress Bar */}
        {showLevel && (
          <div className="mt-4 relative z-10">
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: rgba.white[50] }}>
                {locale === 'ko' ? data.level.nameKo : data.level.name}
              </span>
              <span style={{ color: rgba.white[50] }}>
                {data.level.currentXP.toLocaleString()}/{data.level.nextLevelXP.toLocaleString()} XP
              </span>
            </div>
            <div 
              className="h-2 rounded-full overflow-hidden"
              style={{ background: rgba.white[10] }}
            >
              <m.div
                className="h-full rounded-full"
                style={{ background: gradients.flame }}
                initial={{ width: 0 }}
                animate={{ width: `${(data.level.currentXP / data.level.nextLevelXP) * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Streak */}
      {showStreak && (
        <StreakDisplay streak={data.streak} bonus={data.streakBonus} locale={locale} />
      )}

      {/* Active Boosts */}
      {showBoosts && data.activeBoosts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white px-1">
            {locale === 'ko' ? '활성 부스트' : 'Active Boosts'}
          </h3>
          {data.activeBoosts.map(boost => (
            <BoostCard key={boost.id} boost={boost} locale={locale} />
          ))}
        </div>
      )}

      {/* Recent Transactions */}
      {showTransactions && data.recentTransactions.length > 0 && (
        <div 
          className="p-4 rounded-xl"
          style={{ background: rgba.white[5] }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">
              {locale === 'ko' ? '최근 활동' : 'Recent Activity'}
            </h3>
            <Link 
              href="/points/history"
              className="text-xs flex items-center gap-1"
              style={{ color: colors.flame[500] }}
            >
              {locale === 'ko' ? '전체 보기' : 'View All'}
              <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y" style={{ divideColor: rgba.white[10] }}>
            {data.recentTransactions.slice(0, 5).map(transaction => (
              <TransactionItem 
                key={transaction.id} 
                transaction={transaction} 
                locale={locale} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Earn More CTA */}
      {onEarn && (
        <button
          onClick={onEarn}
          className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          style={{ background: gradients.flame, color: 'white' }}
        >
          <Target size={18} />
          {locale === 'ko' ? '포인트 더 모으기' : 'Earn More Points'}
        </button>
      )}
    </div>
  );
}

// ============================================
// Exports
// ============================================

export default PointsDisplay;
