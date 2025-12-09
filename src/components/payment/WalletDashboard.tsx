'use client';

import { useState, useEffect, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Zap,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Plus,
  QrCode,
  History,
  Send,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  Shield,
  ChevronRight,
  RefreshCw,
  Eye,
  EyeOff,
  Bell,
  Settings,
  Copy,
  Check,
  Star,
  Crown,
  MoreHorizontal,
} from 'lucide-react';
import { colors, rgba, gradients } from '@/lib/design-tokens';
import { useLocale } from '@/providers/LocaleProvider';
import { WalletCard } from '@/components/wallet/WalletCard';
import { TransactionHistory, Transaction } from './TransactionHistory';
import Link from 'next/link';

// ============================================
// Types & Interfaces
// ============================================

interface WalletBalance {
  zPoints: number;
  pendingPoints: number;
  lockedPoints: number;
}

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  labelKo: string;
  href: string;
  color: string;
  badge?: string;
}

interface RewardTier {
  name: string;
  nameKo: string;
  icon: React.ReactNode;
  color: string;
  pointsRequired: number;
  currentPoints: number;
  benefits: string[];
}

interface WalletDashboardProps {
  balance: WalletBalance;
  transactions: Transaction[];
  rewardTier?: RewardTier;
  linkedCards?: Array<{
    id: string;
    last4: string;
    brand: string;
    isDefault: boolean;
  }>;
  onRefresh?: () => void;
  onLoadMoreTransactions?: () => void;
  hasMoreTransactions?: boolean;
  isLoading?: boolean;
  className?: string;
}

// ============================================
// Constants
// ============================================

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'charge',
    icon: <Plus size={24} strokeWidth={2.5} />,
    label: 'Charge',
    labelKo: '충전',
    href: '/wallet/charge',
    color: colors.flame[500],
  },
  {
    id: 'pay',
    icon: <QrCode size={24} strokeWidth={2} />,
    label: 'Pay',
    labelKo: '결제',
    href: '/wallet/pay',
    color: colors.blue[500],
  },
  {
    id: 'send',
    icon: <Send size={24} strokeWidth={2} />,
    label: 'Send',
    labelKo: '보내기',
    href: '/wallet/send',
    color: colors.purple[500],
  },
  {
    id: 'history',
    icon: <History size={24} strokeWidth={2} />,
    label: 'History',
    labelKo: '내역',
    href: '/wallet/history',
    color: colors.cyan[500],
  },
];

// ============================================
// Sub-Components
// ============================================

// Balance Display
function BalanceDisplay({
  balance,
  showBalance,
  toggleBalance,
  locale,
}: {
  balance: WalletBalance;
  showBalance: boolean;
  toggleBalance: () => void;
  locale: string;
}) {
  const [copied, setCopied] = useState(false);

  const totalBalance = balance.zPoints + balance.pendingPoints;
  const displayBalance = showBalance 
    ? totalBalance.toLocaleString() 
    : '••••••';

  return (
    <div 
      className="relative rounded-3xl p-6 overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
        border: `1px solid ${rgba.white[10]}`,
      }}
    >
      {/* Background Glow */}
      <div 
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[100px] opacity-30 pointer-events-none"
        style={{ background: gradients.flame }}
      />
      <div 
        className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full blur-[80px] opacity-20 pointer-events-none"
        style={{ background: colors.blue[500] }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: gradients.flame }}
          >
            <Zap size={24} color="white" fill="white" />
          </div>
          <div>
            <h2 className="font-bold text-white text-xl">Z-Pay</h2>
            <p className="text-sm" style={{ color: rgba.white[50] }}>
              {locale === 'ko' ? '내 포인트' : 'My Points'}
            </p>
          </div>
        </div>
        <button
          onClick={toggleBalance}
          className="p-2 rounded-xl"
          style={{ background: rgba.white[5] }}
        >
          {showBalance ? (
            <Eye size={20} style={{ color: rgba.white[60] }} />
          ) : (
            <EyeOff size={20} style={{ color: rgba.white[60] }} />
          )}
        </button>
      </div>

      {/* Main Balance */}
      <div className="mb-6 relative z-10">
        <div className="flex items-end gap-2">
          <span className="text-5xl font-black text-white tracking-tight">
            {displayBalance}
          </span>
          <span className="text-2xl font-bold mb-2" style={{ color: rgba.white[60] }}>P</span>
        </div>
        <p className="text-sm mt-1" style={{ color: rgba.white[50] }}>
          ≈ ₩{showBalance ? totalBalance.toLocaleString() : '••••••'} KRW
        </p>
      </div>

      {/* Balance Details */}
      {showBalance && (balance.pendingPoints > 0 || balance.lockedPoints > 0) && (
        <div 
          className="flex gap-4 p-3 rounded-xl relative z-10"
          style={{ background: rgba.white[5] }}
        >
          {balance.pendingPoints > 0 && (
            <div className="flex items-center gap-2">
              <RefreshCw size={14} style={{ color: colors.yellow[400] }} />
              <span className="text-xs" style={{ color: rgba.white[60] }}>
                {locale === 'ko' ? '대기중' : 'Pending'}:{' '}
                <span className="font-semibold text-white">
                  +{balance.pendingPoints.toLocaleString()}
                </span>
              </span>
            </div>
          )}
          {balance.lockedPoints > 0 && (
            <div className="flex items-center gap-2">
              <Shield size={14} style={{ color: colors.blue[400] }} />
              <span className="text-xs" style={{ color: rgba.white[60] }}>
                {locale === 'ko' ? '잠금' : 'Locked'}:{' '}
                <span className="font-semibold text-white">
                  {balance.lockedPoints.toLocaleString()}
                </span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Security Badge */}
      <div className="flex items-center gap-2 mt-4 relative z-10">
        <Shield size={14} style={{ color: colors.green[400] }} />
        <span className="text-xs" style={{ color: rgba.white[50] }}>
          {locale === 'ko' ? '안전하게 보호됨' : 'Securely Protected'}
        </span>
      </div>
    </div>
  );
}

// Quick Action Button
function QuickActionButton({ action, locale }: { action: QuickAction; locale: string }) {
  return (
    <Link href={action.href}>
      <m.div
        className="flex flex-col items-center gap-2 py-4 rounded-2xl text-center cursor-pointer"
        style={{ background: rgba.white[5] }}
        whileHover={{ scale: 1.03, background: rgba.white[8] }}
        whileTap={{ scale: 0.97 }}
      >
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: action.color + '20', color: action.color }}
        >
          {action.icon}
        </div>
        <span className="text-sm font-medium text-white">
          {locale === 'ko' ? action.labelKo : action.label}
        </span>
        {action.badge && (
          <span 
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: colors.flame[500], color: 'white' }}
          >
            {action.badge}
          </span>
        )}
      </m.div>
    </Link>
  );
}

// Reward Progress Card
function RewardProgressCard({ tier, locale }: { tier: RewardTier; locale: string }) {
  const progress = (tier.currentPoints / tier.pointsRequired) * 100;
  const remaining = tier.pointsRequired - tier.currentPoints;

  return (
    <div 
      className="rounded-2xl p-4 overflow-hidden relative"
      style={{ 
        background: rgba.white[5], 
        border: `1px solid ${rgba.white[10]}` 
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: tier.color + '30', color: tier.color }}
          >
            {tier.icon}
          </div>
          <div>
            <h3 className="font-bold text-white">
              {locale === 'ko' ? tier.nameKo : tier.name}
            </h3>
            <p className="text-xs" style={{ color: rgba.white[50] }}>
              {locale === 'ko' ? '리워드 등급' : 'Reward Tier'}
            </p>
          </div>
        </div>
        <ChevronRight size={20} style={{ color: rgba.white[40] }} />
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 rounded-full overflow-hidden mb-2" style={{ background: rgba.white[10] }}>
        <m.div
          className="h-full rounded-full"
          style={{ background: tier.color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      {/* Progress Text */}
      <div className="flex justify-between text-xs">
        <span style={{ color: rgba.white[60] }}>
          {tier.currentPoints.toLocaleString()} / {tier.pointsRequired.toLocaleString()} P
        </span>
        <span style={{ color: tier.color }}>
          {remaining > 0 
            ? (locale === 'ko' ? `${remaining.toLocaleString()}P 남음` : `${remaining.toLocaleString()}P remaining`)
            : (locale === 'ko' ? '달성!' : 'Achieved!')}
        </span>
      </div>
    </div>
  );
}

// Linked Cards Section
function LinkedCardsSection({ 
  cards, 
  locale 
}: { 
  cards: WalletDashboardProps['linkedCards']; 
  locale: string;
}) {
  if (!cards || cards.length === 0) {
    return (
      <Link href="/wallet/cards/add">
        <m.div
          className="p-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 cursor-pointer"
          style={{ borderColor: rgba.white[20] }}
          whileHover={{ borderColor: colors.flame[500], scale: 1.01 }}
        >
          <Plus size={24} style={{ color: rgba.white[40] }} />
          <span style={{ color: rgba.white[60] }}>
            {locale === 'ko' ? '카드 연결하기' : 'Link a Card'}
          </span>
        </m.div>
      </Link>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="font-semibold text-white">
          {locale === 'ko' ? '연결된 카드' : 'Linked Cards'}
        </h3>
        <Link 
          href="/wallet/cards"
          className="text-sm font-medium"
          style={{ color: colors.flame[500] }}
        >
          {locale === 'ko' ? '관리' : 'Manage'}
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {cards.map((card) => (
          <div
            key={card.id}
            className="shrink-0 w-48 p-4 rounded-xl"
            style={{ 
              background: rgba.white[5],
              border: card.isDefault ? `1px solid ${colors.flame[500]}` : `1px solid ${rgba.white[10]}`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <CreditCard size={20} style={{ color: rgba.white[60] }} />
              {card.isDefault && (
                <span 
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: colors.flame[500], color: 'white' }}
                >
                  Default
                </span>
              )}
            </div>
            <p className="font-mono text-white">•••• {card.last4}</p>
            <p className="text-xs mt-1" style={{ color: rgba.white[50] }}>
              {card.brand}
            </p>
          </div>
        ))}
        <Link href="/wallet/cards/add">
          <div
            className="shrink-0 w-48 p-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer h-full"
            style={{ borderColor: rgba.white[20] }}
          >
            <Plus size={18} style={{ color: rgba.white[40] }} />
            <span className="text-sm" style={{ color: rgba.white[60] }}>
              {locale === 'ko' ? '추가' : 'Add'}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}

// Monthly Summary
function MonthlySummary({ 
  transactions, 
  locale 
}: { 
  transactions: Transaction[]; 
  locale: string;
}) {
  const summary = useMemo(() => {
    const now = new Date();
    const thisMonth = transactions.filter(t => {
      const txDate = new Date(t.timestamp);
      return txDate.getMonth() === now.getMonth() && 
             txDate.getFullYear() === now.getFullYear();
    });

    const income = thisMonth
      .filter(t => ['refund', 'charge', 'reward'].includes(t.type) && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = thisMonth
      .filter(t => ['payment', 'withdraw'].includes(t.type) && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonth = transactions.filter(t => {
      const txDate = new Date(t.timestamp);
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
      return txDate.getMonth() === lastMonthDate.getMonth() && 
             txDate.getFullYear() === lastMonthDate.getFullYear();
    });

    const lastExpense = lastMonth
      .filter(t => ['payment', 'withdraw'].includes(t.type) && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const changePercent = lastExpense > 0 
      ? ((expense - lastExpense) / lastExpense * 100).toFixed(1)
      : 0;

    return { income, expense, changePercent, txCount: thisMonth.length };
  }, [transactions]);

  const currentMonth = new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    month: 'long',
  }).format(new Date());

  return (
    <div 
      className="rounded-2xl p-4"
      style={{ background: rgba.white[5], border: `1px solid ${rgba.white[10]}` }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">
          {currentMonth} {locale === 'ko' ? '요약' : 'Summary'}
        </h3>
        <span className="text-xs px-2 py-1 rounded-full" style={{ background: rgba.white[10], color: rgba.white[60] }}>
          {summary.txCount} {locale === 'ko' ? '건' : 'txns'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <ArrowDownLeft size={14} style={{ color: colors.green[400] }} />
            <span className="text-xs" style={{ color: rgba.white[50] }}>
              {locale === 'ko' ? '수입' : 'Income'}
            </span>
          </div>
          <p className="font-bold text-lg" style={{ color: colors.green[400] }}>
            +₩{summary.income.toLocaleString()}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <ArrowUpRight size={14} style={{ color: colors.red[400] }} />
            <span className="text-xs" style={{ color: rgba.white[50] }}>
              {locale === 'ko' ? '지출' : 'Expense'}
            </span>
          </div>
          <p className="font-bold text-lg" style={{ color: colors.red[400] }}>
            -₩{summary.expense.toLocaleString()}
          </p>
        </div>
      </div>

      {Number(summary.changePercent) !== 0 && (
        <div 
          className="mt-4 pt-3 flex items-center gap-2"
          style={{ borderTop: `1px solid ${rgba.white[10]}` }}
        >
          {Number(summary.changePercent) > 0 ? (
            <TrendingUp size={14} style={{ color: colors.red[400] }} />
          ) : (
            <TrendingDown size={14} style={{ color: colors.green[400] }} />
          )}
          <span className="text-xs" style={{ color: rgba.white[60] }}>
            {locale === 'ko' ? '전월 대비' : 'vs last month'}:{' '}
            <span 
              className="font-semibold"
              style={{ color: Number(summary.changePercent) > 0 ? colors.red[400] : colors.green[400] }}
            >
              {Number(summary.changePercent) > 0 ? '+' : ''}{summary.changePercent}%
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function WalletDashboard({
  balance,
  transactions,
  rewardTier,
  linkedCards,
  onRefresh,
  onLoadMoreTransactions,
  hasMoreTransactions = false,
  isLoading = false,
  className = '',
}: WalletDashboardProps) {
  const { locale } = useLocale();
  const [showBalance, setShowBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  // Recent transactions (last 5)
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);
  }, [transactions]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          {locale === 'ko' ? '지갑' : 'Wallet'}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl transition-colors"
            style={{ background: rgba.white[5] }}
          >
            <RefreshCw 
              size={20} 
              className={isRefreshing ? 'animate-spin' : ''} 
              style={{ color: rgba.white[60] }} 
            />
          </button>
          <Link href="/wallet/notifications">
            <button className="p-2 rounded-xl relative" style={{ background: rgba.white[5] }}>
              <Bell size={20} style={{ color: rgba.white[60] }} />
              <span 
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ background: colors.flame[500] }}
              />
            </button>
          </Link>
          <Link href="/wallet/settings">
            <button className="p-2 rounded-xl" style={{ background: rgba.white[5] }}>
              <Settings size={20} style={{ color: rgba.white[60] }} />
            </button>
          </Link>
        </div>
      </div>

      {/* Balance Card */}
      <BalanceDisplay
        balance={balance}
        showBalance={showBalance}
        toggleBalance={() => setShowBalance(!showBalance)}
        locale={locale}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        {QUICK_ACTIONS.map(action => (
          <QuickActionButton key={action.id} action={action} locale={locale} />
        ))}
      </div>

      {/* Monthly Summary */}
      <MonthlySummary transactions={transactions} locale={locale} />

      {/* Reward Progress */}
      {rewardTier && (
        <RewardProgressCard tier={rewardTier} locale={locale} />
      )}

      {/* Linked Cards */}
      <LinkedCardsSection cards={linkedCards} locale={locale} />

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">
            {locale === 'ko' ? '최근 거래' : 'Recent Transactions'}
          </h3>
          <Link 
            href="/wallet/history"
            className="text-sm font-medium flex items-center gap-1"
            style={{ color: colors.flame[500] }}
          >
            {locale === 'ko' ? '전체 보기' : 'View All'}
            <ChevronRight size={16} />
          </Link>
        </div>

        {recentTransactions.length > 0 ? (
          <TransactionHistory
            transactions={recentTransactions}
            onLoadMore={onLoadMoreTransactions}
            hasMore={hasMoreTransactions}
            isLoading={isLoading}
          />
        ) : (
          <div 
            className="py-12 text-center rounded-xl"
            style={{ background: rgba.white[5] }}
          >
            <History size={40} className="mx-auto mb-3" style={{ color: rgba.white[20] }} />
            <p style={{ color: rgba.white[60] }}>
              {locale === 'ko' ? '거래 내역이 없습니다' : 'No transactions yet'}
            </p>
          </div>
        )}
      </div>

      {/* Footer Promo */}
      <div 
        className="p-4 rounded-2xl flex items-center gap-4"
        style={{ 
          background: `linear-gradient(135deg, ${colors.purple[500]}20, ${colors.flame[500]}20)`,
          border: `1px solid ${rgba.white[10]}`,
        }}
      >
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: colors.purple[500] + '30' }}
        >
          <Gift size={24} style={{ color: colors.purple[400] }} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-white text-sm">
            {locale === 'ko' ? '친구 초대하고 보너스 받기' : 'Invite Friends, Get Bonus'}
          </h4>
          <p className="text-xs" style={{ color: rgba.white[60] }}>
            {locale === 'ko' ? '친구 1명당 1,000P 적립' : 'Earn 1,000P per friend'}
          </p>
        </div>
        <ChevronRight size={20} style={{ color: rgba.white[40] }} />
      </div>
    </div>
  );
}

// ============================================
// Exports
// ============================================

export default WalletDashboard;
