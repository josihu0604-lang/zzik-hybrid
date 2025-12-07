'use client';

import { memo } from 'react';
import { m, AnimatePresence } from '@/lib/motion';
import { X } from 'lucide-react';
import {
  type PopupCategory,
  type PopupStatus,
  type SortOption,
  CATEGORY_LABELS,
  STATUS_LABELS,
  SORT_LABELS,
} from '@/hooks/useSearch';

/**
 * FilterChips - 활성 필터 칩 표시
 *
 * Features:
 * - 현재 적용된 필터 표시
 * - 개별 필터 제거
 * - 전체 초기화
 */

interface FilterChipsProps {
  /** 검색어 */
  query?: string;
  /** 선택된 카테고리 */
  categories: PopupCategory[];
  /** 선택된 상태 */
  status: PopupStatus | 'all';
  /** 선택된 정렬 */
  sort: SortOption;
  /** 검색어 제거 핸들러 */
  onQueryClear?: () => void;
  /** 카테고리 제거 핸들러 */
  onCategoryRemove: (category: PopupCategory) => void;
  /** 상태 초기화 핸들러 */
  onStatusReset: () => void;
  /** 정렬 초기화 핸들러 */
  onSortReset: () => void;
  /** 전체 초기화 핸들러 */
  onResetAll: () => void;
  /** 추가 클래스 */
  className?: string;
}

export function FilterChips({
  query,
  categories,
  status,
  sort,
  onQueryClear,
  onCategoryRemove,
  onStatusReset,
  onSortReset,
  onResetAll,
  className = '',
}: FilterChipsProps) {
  // 활성 필터 확인
  const hasFilters = query || categories.length > 0 || status !== 'all' || sort !== 'deadline';

  if (!hasFilters) return null;

  return (
    // DES-213: 모바일 반응형 추가 - 수평 스크롤 지원
    <div
      className={`flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide ${className}`}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <AnimatePresence mode="popLayout">
        {/* Search Query Chip */}
        {query && <FilterChip key="query" label={`"${query}"`} onRemove={onQueryClear} />}

        {/* Category Chips */}
        {categories.map((category) => (
          <FilterChip
            key={`category-${category}`}
            label={CATEGORY_LABELS[category]}
            onRemove={() => onCategoryRemove(category)}
            variant="category"
          />
        ))}

        {/* Status Chip */}
        {status !== 'all' && (
          <FilterChip
            key="status"
            label={STATUS_LABELS[status]}
            onRemove={onStatusReset}
            variant="status"
          />
        )}

        {/* Sort Chip (only if not default) */}
        {sort !== 'deadline' && (
          <FilterChip key="sort" label={SORT_LABELS[sort]} onRemove={onSortReset} variant="sort" />
        )}

        {/* Reset All */}
        {(categories.length > 1 || (query && categories.length > 0)) && (
          <m.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={onResetAll}
            className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#a8a8a8',
            }}
          >
            전체 초기화
          </m.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * FilterChip - 개별 필터 칩
 */
interface FilterChipProps {
  label: string;
  onRemove?: () => void;
  variant?: 'default' | 'category' | 'status' | 'sort';
}

const FilterChip = memo(function FilterChip({
  label,
  onRemove,
  variant = 'default',
}: FilterChipProps) {
  // 변형별 스타일
  const variantStyles = {
    default: {
      background: 'rgba(255, 107, 91, 0.15)',
      border: '1px solid rgba(255, 107, 91, 0.3)',
      color: '#FF6B5B',
    },
    category: {
      background: 'rgba(255, 217, 61, 0.15)',
      border: '1px solid rgba(255, 217, 61, 0.3)',
      color: '#FFD93D',
    },
    status: {
      background: 'rgba(34, 197, 94, 0.15)',
      border: '1px solid rgba(34, 197, 94, 0.3)',
      color: '#22c55e',
    },
    sort: {
      background: 'rgba(99, 102, 241, 0.15)',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      color: '#6366f1',
    },
  };

  const style = variantStyles[variant];

  return (
    <m.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap"
      style={style}
    >
      <span className="text-xs font-medium">{label}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="p-0.5 rounded-full hover:bg-white/10 transition-colors"
          aria-label={`${label} 필터 제거`}
        >
          <X size={12} />
        </button>
      )}
    </m.div>
  );
});

export default memo(FilterChips);
