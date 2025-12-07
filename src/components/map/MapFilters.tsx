'use client';

import { useState, useCallback, useMemo, useEffect, useRef, memo } from 'react';
import { m, AnimatePresence } from '@/lib/motion';
import { Search, Filter, X, MapPin, ChevronDown } from 'lucide-react';
import { colors } from '@/lib/design-tokens';
import { getCategoryColor } from '@/lib/color-utils';

// Design token aliases
const surface = colors.space[850];

/**
 * MapFilters - 지도 검색 및 필터 컴포넌트
 *
 * Features:
 * - 검색 필터링
 * - 카테고리 다중 선택
 * - 정렬 옵션
 * - 접근성 지원 (키보드 네비게이션, ARIA)
 * - 외부 클릭으로 드롭다운 닫기
 */

interface MapFiltersProps {
  /** 검색 쿼리 */
  searchQuery: string;
  /** 검색어 변경 콜백 */
  onSearchChange: (query: string) => void;
  /** 선택된 카테고리 목록 */
  selectedCategories: string[];
  /** 카테고리 변경 콜백 */
  onCategoryChange: (categories: string[]) => void;
  /** 정렬 기준 */
  sortBy: 'distance' | 'date' | 'popularity';
  /** 정렬 변경 콜백 */
  onSortChange: (sort: 'distance' | 'date' | 'popularity') => void;
  /** 전체 팝업 수 */
  totalCount: number;
  /** 필터링된 팝업 수 */
  filteredCount: number;
}

/** 카테고리 정의 (상수로 분리) */
const CATEGORIES = [
  { id: 'fashion', label: '패션', icon: '👗' },
  { id: 'beauty', label: '뷰티', icon: '💄' },
  { id: 'kpop', label: 'K-pop', icon: '🎤' },
  { id: 'food', label: '푸드', icon: '🍽️' },
  { id: 'cafe', label: '카페', icon: '☕' },
  { id: 'lifestyle', label: '라이프', icon: '🏠' },
  { id: 'culture', label: '문화', icon: '🎨' },
  { id: 'tech', label: '테크', icon: '📱' },
] as const;

/** 정렬 옵션 정의 */
const SORT_OPTIONS = [
  { id: 'distance', label: '거리순' },
  { id: 'date', label: '날짜순' },
  { id: 'popularity', label: '인기순' },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]['id'];

export const MapFilters = memo(function MapFilters({
  searchQuery,
  onSearchChange,
  selectedCategories,
  onCategoryChange,
  sortBy,
  onSortChange,
  totalCount,
  filteredCount,
}: MapFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  // 카테고리 토글 (useCallback으로 메모이제이션)
  const handleCategoryToggle = useCallback(
    (categoryId: string) => {
      if (selectedCategories.includes(categoryId)) {
        onCategoryChange(selectedCategories.filter((c) => c !== categoryId));
      } else {
        onCategoryChange([...selectedCategories, categoryId]);
      }
    },
    [selectedCategories, onCategoryChange]
  );

  // 필터 초기화 (useCallback)
  const clearFilters = useCallback(() => {
    onCategoryChange([]);
    onSearchChange('');
  }, [onCategoryChange, onSearchChange]);

  // 필터 여부 (useMemo)
  const hasFilters = useMemo(
    () => selectedCategories.length > 0 || searchQuery.length > 0,
    [selectedCategories.length, searchQuery.length]
  );

  // 현재 정렬 라벨 (useMemo)
  const currentSortLabel = useMemo(
    () => SORT_OPTIONS.find((o) => o.id === sortBy)?.label ?? '거리순',
    [sortBy]
  );

  // 검색어 클리어 핸들러
  const handleClearSearch = useCallback(() => {
    onSearchChange('');
  }, [onSearchChange]);

  // 필터 토글 핸들러
  const handleFilterToggle = useCallback(() => {
    setIsFilterOpen((prev) => !prev);
    setIsSortOpen(false); // 다른 드롭다운 닫기
  }, []);

  // 정렬 토글 핸들러
  const handleSortToggle = useCallback(() => {
    setIsSortOpen((prev) => !prev);
  }, []);

  // 정렬 선택 핸들러
  const handleSortSelect = useCallback(
    (optionId: SortOption) => {
      onSortChange(optionId);
      setIsSortOpen(false);
    },
    [onSortChange]
  );

  // 외부 클릭으로 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(target)) {
        setIsSortOpen(false);
      }
    };

    if (isSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortOpen]);

  // ESC 키로 드롭다운 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSortOpen(false);
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="absolute top-4 left-4 right-4 z-10 space-y-2" role="search">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div
          className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl"
          style={{
            background: 'rgba(18, 19, 20, 0.95)',
            backdropFilter: 'blur(24px) saturate(180%)',
            border: `1px solid ${colors.border.subtle}`,
          }}
        >
          <Search
            size={18}
            className="text-linear-text-tertiary flex-shrink-0"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="브랜드, 장소 검색..."
            className="flex-1 bg-transparent text-white text-sm placeholder:text-linear-text-tertiary focus:outline-none"
            aria-label="팝업 검색"
            autoComplete="off"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              type="button"
              aria-label="검색어 지우기"
            >
              <X size={16} className="text-linear-text-tertiary" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <m.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleFilterToggle}
          className="p-3 rounded-xl relative"
          style={{
            background: isFilterOpen ? colors.flame[500] : 'rgba(18, 19, 20, 0.95)',
            backdropFilter: 'blur(24px) saturate(180%)',
            border: `1px solid ${isFilterOpen ? colors.flame[500] : colors.border.subtle}`,
          }}
          type="button"
          aria-expanded={isFilterOpen}
          aria-controls="filter-panel"
          aria-label={`필터 ${isFilterOpen ? '닫기' : '열기'}${selectedCategories.length > 0 ? `, ${selectedCategories.length}개 선택됨` : ''}`}
        >
          <Filter
            size={18}
            className={isFilterOpen ? 'text-white' : 'text-linear-text-secondary'}
            aria-hidden="true"
          />
          {selectedCategories.length > 0 && (
            <span
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-micro font-bold flex items-center justify-center text-white"
              style={{ background: colors.flame[500] }}
              aria-hidden="true"
            >
              {selectedCategories.length}
            </span>
          )}
        </m.button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <m.div
            ref={filterPanelRef}
            id="filter-panel"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="rounded-xl overflow-hidden"
            style={{
              background: 'rgba(18, 19, 20, 0.95)',
              backdropFilter: 'blur(24px) saturate(180%)',
              border: `1px solid ${colors.border.subtle}`,
            }}
            role="region"
            aria-label="필터 옵션"
          >
            <div className="p-4">
              {/* Categories */}
              <fieldset className="mb-4">
                <legend className="text-linear-text-tertiary text-xs mb-2">카테고리</legend>
                <div className="flex flex-wrap gap-2" role="group">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.id);
                    const catColor = getCategoryColor(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryToggle(cat.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                        style={{
                          background: isSelected ? `${catColor}30` : 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${isSelected ? catColor : 'rgba(255, 255, 255, 0.1)'}`,
                          color: isSelected ? catColor : colors.text.secondary,
                        }}
                        type="button"
                        aria-pressed={isSelected}
                        aria-label={`${cat.label} ${isSelected ? '선택됨' : ''}`}
                      >
                        <span aria-hidden="true">{cat.icon}</span>
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Sort */}
              <div className="flex items-center justify-between">
                <div className="relative" ref={sortDropdownRef}>
                  <button
                    onClick={handleSortToggle}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-linear-text-secondary hover:bg-white/5 transition-colors"
                    type="button"
                    aria-expanded={isSortOpen}
                    aria-haspopup="listbox"
                    aria-label={`정렬: ${currentSortLabel}`}
                  >
                    <span>{currentSortLabel}</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${isSortOpen ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </button>

                  <AnimatePresence>
                    {isSortOpen && (
                      <m.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute top-full left-0 mt-1 rounded-lg overflow-hidden z-10"
                        style={{
                          background: surface,
                          border: `1px solid ${colors.border.subtle}`,
                        }}
                        role="listbox"
                        aria-label="정렬 옵션"
                      >
                        {SORT_OPTIONS.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleSortSelect(option.id)}
                            className={`block w-full px-4 py-2 text-left text-xs transition-colors ${
                              sortBy === option.id
                                ? 'text-flame-500 bg-flame-500/10'
                                : 'text-linear-text-secondary hover:bg-white/5'
                            }`}
                            type="button"
                            role="option"
                            aria-selected={sortBy === option.id}
                          >
                            {option.label}
                          </button>
                        ))}
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>

                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-linear-text-tertiary hover:text-white transition-colors"
                    type="button"
                    aria-label="모든 필터 초기화"
                  >
                    필터 초기화
                  </button>
                )}
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      {hasFilters && (
        <m.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{
            background: 'rgba(18, 19, 20, 0.8)',
            border: `1px solid ${colors.border.subtle}`,
          }}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <MapPin size={14} style={{ color: colors.flame[500] }} aria-hidden="true" />
          <span className="text-xs text-linear-text-secondary">
            <span className="text-white font-bold">{filteredCount}</span>
            <span className="text-linear-text-tertiary">/{totalCount}</span> 개 팝업
          </span>
        </m.div>
      )}
    </div>
  );
});

export default MapFilters;
