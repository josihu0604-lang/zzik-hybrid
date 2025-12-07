'use client';

import { useRef, memo } from 'react';
import { m, AnimatePresence } from '@/lib/motion';
import { X, RotateCcw } from 'lucide-react';
import {
  type PopupCategory,
  type PopupStatus,
  type SortOption,
  CATEGORY_LABELS,
  STATUS_LABELS,
  SORT_LABELS,
} from '@/hooks/useSearch';
import { colors, gradients } from '@/lib/design-tokens';
import { useFocusTrap } from '@/hooks/useFocusTrap';

/**
 * FilterPanel - 필터 옵션 패널
 *
 * Features:
 * - 카테고리 필터 (칩)
 * - 상태 필터 (탭)
 * - 정렬 옵션
 * - 초기화 버튼
 */

interface FilterPanelProps {
  /** 패널 열림 상태 */
  isOpen: boolean;
  /** 닫기 핸들러 */
  onClose: () => void;
  /** 선택된 카테고리 */
  selectedCategories: PopupCategory[];
  /** 카테고리 토글 핸들러 */
  onCategoryToggle: (category: PopupCategory) => void;
  /** 선택된 상태 */
  selectedStatus: PopupStatus | 'all';
  /** 상태 변경 핸들러 */
  onStatusChange: (status: PopupStatus | 'all') => void;
  /** 선택된 정렬 */
  selectedSort: SortOption;
  /** 정렬 변경 핸들러 */
  onSortChange: (sort: SortOption) => void;
  /** 초기화 핸들러 */
  onReset: () => void;
  /** 활성 필터 개수 */
  activeCount: number;
}

const ALL_CATEGORIES: PopupCategory[] = [
  'fashion',
  'beauty',
  'kpop',
  'food',
  'cafe',
  'lifestyle',
  'culture',
  'tech',
];

const ALL_STATUSES: (PopupStatus | 'all')[] = ['all', 'funding', 'confirmed', 'completed'];

const ALL_SORTS: SortOption[] = ['deadline', 'popular', 'latest', 'progress'];

export function FilterPanel({
  isOpen,
  onClose,
  selectedCategories,
  onCategoryToggle,
  selectedStatus,
  onStatusChange,
  selectedSort,
  onSortChange,
  onReset,
  activeCount,
}: FilterPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap with WCAG 2.1 AA compliance
  const { containerRef: panelRef } = useFocusTrap<HTMLDivElement>({
    enabled: isOpen,
    initialFocus: closeButtonRef,
    returnFocus: true,
    onEscape: onClose,
    preventScroll: true,
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40]"
          />

          {/* Panel */}
          <m.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[50]"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="filter-panel-title"
              className="max-w-lg mx-auto rounded-t-3xl p-5"
              style={{
                background: 'rgba(18, 19, 20, 0.98)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderBottom: 'none',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h3 id="filter-panel-title" className="text-white font-bold text-lg">
                    필터
                  </h3>
                  {activeCount > 0 && (
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: `rgba(255, 107, 91, 0.2)`,
                        color: colors.flame[500],
                      }}
                    >
                      {activeCount}개 적용
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {activeCount > 0 && (
                    <m.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onReset}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: colors.text.secondary,
                      }}
                    >
                      <RotateCcw size={12} />
                      초기화
                    </m.button>
                  )}
                  <button
                    ref={closeButtonRef}
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    aria-label="필터 패널 닫기"
                  >
                    <X size={20} className="text-white/60" />
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <p className="text-linear-text-secondary text-sm font-medium mb-3">카테고리</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_CATEGORIES.map((category) => {
                    const isSelected = selectedCategories.includes(category);
                    return (
                      <m.button
                        key={category}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onCategoryToggle(category)}
                        className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                        style={{
                          background: isSelected
                            ? 'rgba(255, 107, 91, 0.2)'
                            : 'rgba(255, 255, 255, 0.06)',
                          border: isSelected
                            ? '1px solid rgba(255, 107, 91, 0.4)'
                            : '1px solid rgba(255, 255, 255, 0.1)',
                          color: isSelected ? colors.flame[500] : colors.text.secondary,
                        }}
                      >
                        {CATEGORY_LABELS[category]}
                      </m.button>
                    );
                  })}
                </div>
              </div>

              {/* Status Filter */}
              <div className="mb-6">
                <p className="text-linear-text-secondary text-sm font-medium mb-3">상태</p>
                <div
                  className="relative flex gap-2 overflow-x-auto pb-1"
                  role="group"
                  aria-label="상태 필터 옵션"
                >
                  {/* Scroll hint gradient - left */}
                  <div
                    className="absolute left-0 top-0 bottom-1 w-4 pointer-events-none z-10"
                    style={{
                      background: 'linear-gradient(to right, rgba(18, 19, 20, 0.98), transparent)',
                    }}
                    aria-hidden="true"
                  />
                  {/* Scroll hint gradient - right */}
                  <div
                    className="absolute right-0 top-0 bottom-1 w-4 pointer-events-none z-10"
                    style={{
                      background: 'linear-gradient(to left, rgba(18, 19, 20, 0.98), transparent)',
                    }}
                    aria-hidden="true"
                  />
                  {ALL_STATUSES.map((status) => {
                    const isSelected = selectedStatus === status;
                    return (
                      <m.button
                        key={status}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onStatusChange(status)}
                        className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
                        style={{
                          background: isSelected
                            ? 'rgba(255, 107, 91, 0.2)'
                            : 'rgba(255, 255, 255, 0.06)',
                          border: isSelected
                            ? '1px solid rgba(255, 107, 91, 0.4)'
                            : '1px solid rgba(255, 255, 255, 0.1)',
                          color: isSelected ? colors.flame[500] : colors.text.secondary,
                        }}
                      >
                        {STATUS_LABELS[status]}
                      </m.button>
                    );
                  })}
                  <span className="sr-only">좌우로 스크롤하여 더 많은 옵션을 확인하세요</span>
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-6">
                <p className="text-linear-text-secondary text-sm font-medium mb-3">정렬</p>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_SORTS.map((sort) => {
                    const isSelected = selectedSort === sort;
                    return (
                      <m.button
                        key={sort}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSortChange(sort)}
                        className="px-4 py-3 rounded-xl text-sm font-medium transition-all"
                        style={{
                          background: isSelected
                            ? 'linear-gradient(135deg, rgba(255, 107, 91, 0.2) 0%, rgba(255, 217, 61, 0.1) 100%)'
                            : 'rgba(255, 255, 255, 0.04)',
                          border: isSelected
                            ? '1px solid rgba(255, 107, 91, 0.3)'
                            : '1px solid rgba(255, 255, 255, 0.08)',
                          color: isSelected ? colors.flame[500] : colors.text.secondary,
                        }}
                      >
                        {SORT_LABELS[sort]}
                      </m.button>
                    );
                  })}
                </div>
              </div>

              {/* Apply Button */}
              <m.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full py-4 rounded-xl font-bold text-white transition-all"
                style={{
                  background: gradients.flame,
                  boxShadow: '0 4px 16px rgba(255, 107, 91, 0.3)',
                }}
              >
                적용하기
              </m.button>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default memo(FilterPanel);
