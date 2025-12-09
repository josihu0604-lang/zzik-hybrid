'use client';

import { useState, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  ChevronDown,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Receipt,
  Store,
  Ticket,
  Gift,
  Zap,
  CreditCard,
} from 'lucide-react';
import { colors, rgba, gradients } from '@/lib/design-tokens';
import { useLocale } from '@/providers/LocaleProvider';

// ============================================
// Types & Interfaces
// ============================================

export type TransactionType = 
  | 'payment'
  | 'refund'
  | 'charge'
  | 'withdraw'
  | 'reward'
  | 'transfer'
  | 'booking';

export type TransactionStatus = 
  | 'completed'
  | 'pending'
  | 'failed'
  | 'cancelled'
  | 'processing';

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  description: string;
  merchantName?: string;
  merchantId?: string;
  paymentMethod?: string;
  timestamp: Date;
  referenceId?: string;
  metadata?: Record<string, unknown>;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  onRefund?: (transactionId: string) => void;
  onExport?: () => void;
  className?: string;
}

interface FilterState {
  type: TransactionType | 'all';
  status: TransactionStatus | 'all';
  dateRange: 'all' | '7days' | '30days' | '90days' | 'custom';
  searchQuery: string;
}

// ============================================
// Constants
// ============================================

const TRANSACTION_TYPE_CONFIG: Record<TransactionType, {
  icon: React.ReactNode;
  color: string;
  label: string;
  labelKo: string;
  labelJa: string;
}> = {
  payment: {
    icon: <ArrowUpRight size={18} />,
    color: colors.red[400],
    label: 'Payment',
    labelKo: '결제',
    labelJa: '支払い',
  },
  refund: {
    icon: <ArrowDownLeft size={18} />,
    color: colors.green[400],
    label: 'Refund',
    labelKo: '환불',
    labelJa: '返金',
  },
  charge: {
    icon: <Zap size={18} />,
    color: colors.flame[500],
    label: 'Charge',
    labelKo: '충전',
    labelJa: 'チャージ',
  },
  withdraw: {
    icon: <ArrowUpRight size={18} />,
    color: colors.orange[400],
    label: 'Withdraw',
    labelKo: '출금',
    labelJa: '引き出し',
  },
  reward: {
    icon: <Gift size={18} />,
    color: colors.purple[400],
    label: 'Reward',
    labelKo: '리워드',
    labelJa: 'リワード',
  },
  transfer: {
    icon: <RefreshCw size={18} />,
    color: colors.blue[400],
    label: 'Transfer',
    labelKo: '이체',
    labelJa: '振替',
  },
  booking: {
    icon: <Ticket size={18} />,
    color: colors.cyan[400],
    label: 'Booking',
    labelKo: '예약',
    labelJa: '予約',
  },
};

const STATUS_CONFIG: Record<TransactionStatus, {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  label: string;
  labelKo: string;
  labelJa: string;
}> = {
  completed: {
    icon: <CheckCircle size={14} />,
    color: colors.green[400],
    bgColor: colors.green[500] + '20',
    label: 'Completed',
    labelKo: '완료',
    labelJa: '完了',
  },
  pending: {
    icon: <Clock size={14} />,
    color: colors.yellow[400],
    bgColor: colors.yellow[500] + '20',
    label: 'Pending',
    labelKo: '대기중',
    labelJa: '保留中',
  },
  failed: {
    icon: <XCircle size={14} />,
    color: colors.red[400],
    bgColor: colors.red[500] + '20',
    label: 'Failed',
    labelKo: '실패',
    labelJa: '失敗',
  },
  cancelled: {
    icon: <XCircle size={14} />,
    color: rgba.white[50],
    bgColor: rgba.white[10],
    label: 'Cancelled',
    labelKo: '취소됨',
    labelJa: 'キャンセル',
  },
  processing: {
    icon: <RefreshCw size={14} className="animate-spin" />,
    color: colors.blue[400],
    bgColor: colors.blue[500] + '20',
    label: 'Processing',
    labelKo: '처리중',
    labelJa: '処理中',
  },
};

// ============================================
// Sub-Components
// ============================================

// Filter Dropdown
function FilterDropdown({
  filters,
  setFilters,
  locale,
}: {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  locale: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const typeOptions: { value: TransactionType | 'all'; label: string }[] = [
    { value: 'all', label: locale === 'ko' ? '전체' : 'All' },
    { value: 'payment', label: locale === 'ko' ? '결제' : 'Payment' },
    { value: 'refund', label: locale === 'ko' ? '환불' : 'Refund' },
    { value: 'charge', label: locale === 'ko' ? '충전' : 'Charge' },
    { value: 'reward', label: locale === 'ko' ? '리워드' : 'Reward' },
    { value: 'booking', label: locale === 'ko' ? '예약' : 'Booking' },
  ];

  const dateOptions: { value: FilterState['dateRange']; label: string }[] = [
    { value: 'all', label: locale === 'ko' ? '전체 기간' : 'All Time' },
    { value: '7days', label: locale === 'ko' ? '최근 7일' : 'Last 7 days' },
    { value: '30days', label: locale === 'ko' ? '최근 30일' : 'Last 30 days' },
    { value: '90days', label: locale === 'ko' ? '최근 90일' : 'Last 90 days' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        style={{ 
          background: rgba.white[5], 
          color: rgba.white[70],
          border: `1px solid ${rgba.white[10]}`,
        }}
      >
        <Filter size={16} />
        <span>{locale === 'ko' ? '필터' : 'Filter'}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <m.div
            className="absolute right-0 top-full mt-2 w-64 rounded-xl p-4 z-50"
            style={{ 
              background: colors.space[800], 
              border: `1px solid ${rgba.white[10]}`,
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Type Filter */}
            <div className="space-y-2 mb-4">
              <label className="text-xs font-medium" style={{ color: rgba.white[60] }}>
                {locale === 'ko' ? '거래 유형' : 'Transaction Type'}
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(f => ({ ...f, type: e.target.value as FilterState['type'] }))}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
              >
                {typeOptions.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-space-900">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2 mb-4">
              <label className="text-xs font-medium" style={{ color: rgba.white[60] }}>
                {locale === 'ko' ? '기간' : 'Date Range'}
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(f => ({ ...f, dateRange: e.target.value as FilterState['dateRange'] }))}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
              >
                {dateOptions.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-space-900">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setFilters({
                  type: 'all',
                  status: 'all',
                  dateRange: 'all',
                  searchQuery: '',
                });
                setIsOpen(false);
              }}
              className="w-full py-2 text-sm font-medium rounded-lg"
              style={{ background: rgba.white[5], color: rgba.white[70] }}
            >
              {locale === 'ko' ? '필터 초기화' : 'Reset Filters'}
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Transaction Item
function TransactionItem({
  transaction,
  locale,
  onRefund,
}: {
  transaction: Transaction;
  locale: string;
  onRefund?: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const typeConfig = TRANSACTION_TYPE_CONFIG[transaction.type];
  const statusConfig = STATUS_CONFIG[transaction.status];

  const isIncoming = ['refund', 'charge', 'reward'].includes(transaction.type);
  const amountPrefix = isIncoming ? '+' : '-';
  const amountColor = isIncoming ? colors.green[400] : colors.red[400];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const typeLabel = locale === 'ko' 
    ? typeConfig.labelKo 
    : locale === 'ja' 
    ? typeConfig.labelJa 
    : typeConfig.label;

  const statusLabel = locale === 'ko' 
    ? statusConfig.labelKo 
    : locale === 'ja' 
    ? statusConfig.labelJa 
    : statusConfig.label;

  const canRefund = transaction.type === 'payment' && 
    transaction.status === 'completed' &&
    onRefund;

  return (
    <m.div
      className="rounded-xl overflow-hidden"
      style={{ 
        background: rgba.white[5], 
        border: `1px solid ${rgba.white[10]}` 
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      {/* Main Row */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center gap-3 text-left"
      >
        {/* Icon */}
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: typeConfig.color + '20', color: typeConfig.color }}
        >
          {typeConfig.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-white truncate">
              {transaction.merchantName || typeLabel}
            </span>
            <span 
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full shrink-0"
              style={{ background: statusConfig.bgColor, color: statusConfig.color }}
            >
              {statusConfig.icon}
              {statusLabel}
            </span>
          </div>
          <span className="text-xs" style={{ color: rgba.white[50] }}>
            {formatDate(transaction.timestamp)} • {transaction.description}
          </span>
        </div>

        {/* Amount */}
        <div className="text-right shrink-0">
          <span 
            className="font-bold text-lg"
            style={{ color: amountColor }}
          >
            {amountPrefix}{transaction.currency === 'KRW' ? '₩' : '$'}
            {transaction.amount.toLocaleString()}
          </span>
        </div>

        {/* Expand Icon */}
        <ChevronDown 
          size={18} 
          style={{ color: rgba.white[40] }}
          className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <m.div
            className="px-4 pb-4 space-y-3"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div 
              className="h-px w-full"
              style={{ background: rgba.white[10] }}
            />

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span style={{ color: rgba.white[50] }}>
                  {locale === 'ko' ? '거래 ID' : 'Transaction ID'}
                </span>
                <p className="font-mono text-white truncate">{transaction.id}</p>
              </div>
              {transaction.referenceId && (
                <div>
                  <span style={{ color: rgba.white[50] }}>
                    {locale === 'ko' ? '참조 번호' : 'Reference'}
                  </span>
                  <p className="font-mono text-white truncate">{transaction.referenceId}</p>
                </div>
              )}
              {transaction.paymentMethod && (
                <div>
                  <span style={{ color: rgba.white[50] }}>
                    {locale === 'ko' ? '결제 수단' : 'Payment Method'}
                  </span>
                  <p className="text-white">{transaction.paymentMethod}</p>
                </div>
              )}
              {transaction.merchantId && (
                <div>
                  <span style={{ color: rgba.white[50] }}>
                    {locale === 'ko' ? '가맹점 ID' : 'Merchant ID'}
                  </span>
                  <p className="font-mono text-white truncate">{transaction.merchantId}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                style={{ background: rgba.white[5], color: rgba.white[70] }}
              >
                <Receipt size={14} />
                {locale === 'ko' ? '영수증' : 'Receipt'}
              </button>
              {canRefund && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRefund(transaction.id);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                  style={{ 
                    background: colors.red[500] + '20', 
                    color: colors.red[400] 
                  }}
                >
                  <RefreshCw size={14} />
                  {locale === 'ko' ? '환불 요청' : 'Request Refund'}
                </button>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
}

// ============================================
// Main Component
// ============================================

export function TransactionHistory({
  transactions,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  onRefund,
  onExport,
  className = '',
}: TransactionHistoryProps) {
  const { locale } = useLocale();
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    status: 'all',
    dateRange: 'all',
    searchQuery: '',
  });

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Type filter
    if (filters.type !== 'all') {
      result = result.filter(t => t.type === filters.type);
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter(t => t.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const days = filters.dateRange === '7days' ? 7 
        : filters.dateRange === '30days' ? 30 
        : filters.dateRange === '90days' ? 90 
        : 0;
      
      if (days > 0) {
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        result = result.filter(t => t.timestamp >= cutoff);
      }
    }

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(t => 
        t.description.toLowerCase().includes(query) ||
        t.merchantName?.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query)
      );
    }

    return result;
  }, [transactions, filters]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    
    filteredTransactions.forEach(t => {
      const dateKey = new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(t.timestamp);
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(t);
    });

    return groups;
  }, [filteredTransactions, locale]);

  // Calculate totals
  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter(t => ['refund', 'charge', 'reward'].includes(t.type) && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = filteredTransactions
      .filter(t => ['payment', 'withdraw'].includes(t.type) && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense, net: income - expense };
  }, [filteredTransactions]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white text-lg">
          {locale === 'ko' ? '거래 내역' : 'Transaction History'}
        </h3>
        <div className="flex items-center gap-2">
          {onExport && (
            <button
              onClick={onExport}
              className="p-2 rounded-lg transition-colors"
              style={{ background: rgba.white[5] }}
            >
              <Download size={18} style={{ color: rgba.white[60] }} />
            </button>
          )}
          <FilterDropdown filters={filters} setFilters={setFilters} locale={locale} />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search 
          size={18} 
          className="absolute left-4 top-1/2 -translate-y-1/2"
          style={{ color: rgba.white[40] }}
        />
        <input
          type="text"
          placeholder={locale === 'ko' ? '거래 검색...' : 'Search transactions...'}
          value={filters.searchQuery}
          onChange={(e) => setFilters(f => ({ ...f, searchQuery: e.target.value }))}
          className="w-full pl-11 pr-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-flame-500"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div 
          className="p-3 rounded-xl text-center"
          style={{ background: colors.green[500] + '10', border: `1px solid ${colors.green[500]}30` }}
        >
          <p className="text-xs mb-1" style={{ color: rgba.white[60] }}>
            {locale === 'ko' ? '수입' : 'Income'}
          </p>
          <p className="font-bold text-lg" style={{ color: colors.green[400] }}>
            +₩{totals.income.toLocaleString()}
          </p>
        </div>
        <div 
          className="p-3 rounded-xl text-center"
          style={{ background: colors.red[500] + '10', border: `1px solid ${colors.red[500]}30` }}
        >
          <p className="text-xs mb-1" style={{ color: rgba.white[60] }}>
            {locale === 'ko' ? '지출' : 'Expense'}
          </p>
          <p className="font-bold text-lg" style={{ color: colors.red[400] }}>
            -₩{totals.expense.toLocaleString()}
          </p>
        </div>
        <div 
          className="p-3 rounded-xl text-center"
          style={{ 
            background: totals.net >= 0 ? colors.blue[500] + '10' : colors.orange[500] + '10',
            border: `1px solid ${totals.net >= 0 ? colors.blue[500] : colors.orange[500]}30`,
          }}
        >
          <p className="text-xs mb-1" style={{ color: rgba.white[60] }}>
            {locale === 'ko' ? '순이익' : 'Net'}
          </p>
          <p 
            className="font-bold text-lg" 
            style={{ color: totals.net >= 0 ? colors.blue[400] : colors.orange[400] }}
          >
            {totals.net >= 0 ? '+' : ''}₩{totals.net.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Transaction List */}
      {Object.keys(groupedTransactions).length === 0 ? (
        <div 
          className="py-16 text-center rounded-xl"
          style={{ background: rgba.white[5] }}
        >
          <Receipt size={48} className="mx-auto mb-4" style={{ color: rgba.white[20] }} />
          <p className="font-medium" style={{ color: rgba.white[60] }}>
            {locale === 'ko' ? '거래 내역이 없습니다' : 'No transactions found'}
          </p>
          <p className="text-sm mt-1" style={{ color: rgba.white[40] }}>
            {locale === 'ko' ? '필터를 조정해보세요' : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([dateKey, txns]) => (
            <div key={dateKey} className="space-y-2">
              <p className="text-sm font-medium px-1" style={{ color: rgba.white[60] }}>
                {dateKey}
              </p>
              <div className="space-y-2">
                {txns.map(txn => (
                  <TransactionItem
                    key={txn.id}
                    transaction={txn}
                    locale={locale}
                    onRefund={onRefund}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={isLoading}
          className="w-full py-4 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
          style={{ 
            background: rgba.white[5], 
            color: colors.flame[500],
          }}
        >
          {isLoading ? (
            <RefreshCw size={18} className="animate-spin mx-auto" />
          ) : (
            locale === 'ko' ? '더 보기' : 'Load More'
          )}
        </button>
      )}
    </div>
  );
}

// ============================================
// Exports
// ============================================

export default TransactionHistory;
