'use client';

import { useState, useEffect, useMemo, Suspense, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  X,
  SlidersHorizontal,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  Flame,
} from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { FilterPanel } from '@/components/search/FilterPanel';
import { ProgressBar } from '@/components/popup';
import { useSearch, CATEGORY_LABELS, type PopupItem } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { IconButton } from '@/components/ui/Button';
import { colors, radii, liquidGlass } from '@/lib/design-tokens';

/**
 * Search Page - 팝업 검색
 *
 * Features:
 * - 실시간 검색
 * - 카테고리/상태/정렬 필터
 * - 최근 검색어
 * - 인기 검색어
 */

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_POPUPS: PopupItem[] = [
  {
    id: '1',
    brandName: 'Nike',
    title: 'Air Max 2025 런칭 팝업',
    category: 'fashion',
    status: 'funding',
    currentParticipants: 72,
    goalParticipants: 100,
    deadlineAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    location: '성수동',
  },
  {
    id: '2',
    brandName: 'NewJeans',
    title: 'Supernatural 팝업스토어',
    category: 'kpop',
    status: 'confirmed',
    currentParticipants: 500,
    goalParticipants: 500,
    deadlineAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    location: '삼성동',
  },
  {
    id: '3',
    brandName: 'Aesop',
    title: '시그니처 센트 팝업',
    category: 'beauty',
    status: 'funding',
    currentParticipants: 45,
    goalParticipants: 80,
    deadlineAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    location: '한남동',
  },
  {
    id: '4',
    brandName: 'Blue Bottle',
    title: '리미티드 로스팅 팝업',
    category: 'cafe',
    status: 'funding',
    currentParticipants: 120,
    goalParticipants: 150,
    deadlineAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    location: '연남동',
  },
  {
    id: '5',
    brandName: 'Apple',
    title: 'Vision Pro 체험존',
    category: 'tech',
    status: 'confirmed',
    currentParticipants: 300,
    goalParticipants: 300,
    deadlineAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    location: '가로수길',
  },
];

const TRENDING_SEARCHES = ['뉴진스', '나이키', '블루보틀', '성수동 팝업', '뷰티'];
const RECENT_SEARCHES_KEY = 'zzik_recent_searches';

// ============================================================================
// STYLES
// ============================================================================

const GLASS_CARD_STYLE = {
  ...liquidGlass.standard,
  borderRadius: radii.xl,
} as const;

// ============================================================================
// COMPONENTS
// ============================================================================

function formatDeadline(dateString: string): string {
  const deadline = new Date(dateString);
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}일 ${hours}시간 남음`;
  if (hours > 0) return `${hours}시간 남음`;
  return '마감 임박';
}

function PopupCard({ popup }: { popup: PopupItem }) {
  const router = useRouter();
  const progress = Math.round((popup.currentParticipants / popup.goalParticipants) * 100);
  const isHot = progress >= 70;
  const isConfirmed = popup.status === 'confirmed';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push(`/popup/${popup.id}`)}
      className="cursor-pointer"
      style={GLASS_CARD_STYLE}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-micro px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: isConfirmed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 107, 91, 0.15)',
                  color: isConfirmed ? colors.success : colors.flame[500],
                }}
              >
                {isConfirmed ? '오픈 확정' : '펀딩 중'}
              </span>
              <span
                className="text-micro px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: colors.text.tertiary,
                }}
              >
                {CATEGORY_LABELS[popup.category]}
              </span>
            </div>
            <p className="text-micro" style={{ color: colors.text.tertiary }}>
              {popup.brandName}
            </p>
            <h3 className="font-bold mt-1" style={{ color: colors.text.primary }}>
              {popup.title}
            </h3>
          </div>

          {isHot && !isConfirmed && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full"
              style={{ background: 'rgba(255, 107, 91, 0.2)' }}
            >
              <Flame size={12} style={{ color: colors.flame[500] }} />
              <span className="text-micro font-bold" style={{ color: colors.flame[500] }}>
                HOT
              </span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="mb-3">
          <ProgressBar
            current={popup.currentParticipants}
            goal={popup.goalParticipants}
            size="sm"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Users size={12} style={{ color: colors.text.tertiary }} />
              <span className="text-micro" style={{ color: colors.text.secondary }}>
                {popup.currentParticipants}/{popup.goalParticipants}
              </span>
            </div>
            {popup.location && (
              <div className="flex items-center gap-1">
                <MapPin size={12} style={{ color: colors.text.tertiary }} />
                <span className="text-micro" style={{ color: colors.text.secondary }}>
                  {popup.location}
                </span>
              </div>
            )}
          </div>

          {!isConfirmed && (
            <div className="flex items-center gap-1">
              <Clock size={12} style={{ color: colors.flame[500] }} />
              <span className="text-micro font-medium" style={{ color: colors.flame[500] }}>
                {formatDeadline(popup.deadlineAt)}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [inputValue, setInputValue] = useState(initialQuery);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const search = useSearch();

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Set initial query from URL
  useEffect(() => {
    if (initialQuery) {
      search.setQuery(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const handleSearch = useCallback(
    (query: string) => {
      search.setQuery(query);

      if (query.trim()) {
        setRecentSearches((prev) => {
          const updated = [query, ...prev.filter((s) => s !== query)].slice(0, 5);
          localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    },
    [search]
  );

  // Debounce search query to reduce API calls
  const debouncedInputValue = useDebounce(inputValue, 300);

  // Update search query when debounced value changes
  useEffect(() => {
    search.setQuery(debouncedInputValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInputValue]);

  const handleClearRecent = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  }, []);

  const filteredPopups = useMemo(() => {
    return search.filterPopups(MOCK_POPUPS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.filters]);

  const showSuggestions = !search.filters.query && filteredPopups.length === MOCK_POPUPS.length;

  return (
    <div className="min-h-screen pb-24" style={{ background: colors.space[950] }}>
      {/* Header with Search */}
      <div
        className="sticky top-0 z-30 px-4 py-4"
        style={{
          background: 'rgba(8, 9, 10, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${colors.border.subtle}`,
        }}
      >
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: colors.text.tertiary }}
            />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(inputValue)}
              placeholder="팝업, 브랜드 검색..."
              className="w-full pl-12 pr-10 py-3 rounded-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: `1px solid ${colors.border.default}`,
                color: colors.text.primary,
                outline: 'none',
              }}
            />
            {inputValue && (
              <button
                onClick={() => {
                  setInputValue('');
                  search.setQuery('');
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <X size={16} style={{ color: colors.text.tertiary }} />
              </button>
            )}
          </div>

          {/* Filter Button */}
          <div className="relative">
            <IconButton
              icon={
                <SlidersHorizontal
                  size={20}
                  style={{
                    color: search.activeFilterCount > 0 ? colors.flame[500] : colors.text.secondary,
                  }}
                />
              }
              onClick={() => setIsFilterOpen(true)}
              variant={search.activeFilterCount > 0 ? 'glass' : 'default'}
              aria-label={`필터 ${search.activeFilterCount > 0 ? `(${search.activeFilterCount}개 적용)` : ''}`}
            />
            {search.activeFilterCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-micro font-bold flex items-center justify-center"
                style={{ background: colors.flame[500], color: 'white' }}
              >
                {search.activeFilterCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {showSuggestions ? (
          <div className="space-y-6">
            {/* Trending Searches */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} style={{ color: colors.flame[500] }} />
                <h3 className="font-semibold" style={{ color: colors.text.primary }}>
                  인기 검색어
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((term) => (
                  <motion.button
                    key={term}
                    onClick={() => {
                      setInputValue(term);
                      handleSearch(term);
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-full text-sm"
                    style={{
                      background: 'rgba(255, 107, 91, 0.1)',
                      border: `1px solid rgba(255, 107, 91, 0.3)`,
                      color: colors.flame[500],
                    }}
                  >
                    {term}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock size={16} style={{ color: colors.text.tertiary }} />
                    <h3 className="font-semibold" style={{ color: colors.text.primary }}>
                      최근 검색
                    </h3>
                  </div>
                  <button
                    onClick={handleClearRecent}
                    className="text-micro"
                    style={{ color: colors.text.tertiary }}
                  >
                    전체 삭제
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <motion.button
                      key={term}
                      onClick={() => {
                        setInputValue(term);
                        handleSearch(term);
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-full text-sm"
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${colors.border.subtle}`,
                        color: colors.text.secondary,
                      }}
                    >
                      {term}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* All Popups */}
            <div>
              <h3 className="font-semibold mb-3" style={{ color: colors.text.primary }}>
                전체 팝업
              </h3>
              <div className="space-y-3">
                {MOCK_POPUPS.map((popup) => (
                  <PopupCard key={popup.id} popup={popup} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                {filteredPopups.length}개의 결과
              </p>
            </div>

            {/* Results */}
            {filteredPopups.length > 0 ? (
              <div className="space-y-3">
                {filteredPopups.map((popup) => (
                  <PopupCard key={popup.id} popup={popup} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <Search size={48} className="mx-auto mb-4" style={{ color: colors.text.muted }} />
                <p className="font-medium mb-2" style={{ color: colors.text.secondary }}>
                  검색 결과가 없습니다
                </p>
                <p className="text-sm" style={{ color: colors.text.tertiary }}>
                  다른 검색어나 필터를 시도해보세요
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Panel */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        selectedCategories={search.filters.categories}
        onCategoryToggle={search.toggleCategory}
        selectedStatus={search.filters.status}
        onStatusChange={search.setStatus}
        selectedSort={search.filters.sort}
        onSortChange={search.setSort}
        onReset={search.resetFilters}
        activeCount={search.activeFilterCount}
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageLoading />}>
      <SearchContent />
    </Suspense>
  );
}

function SearchPageLoading() {
  return (
    <div className="min-h-screen" style={{ background: colors.space[950] }}>
      <div className="p-4 space-y-4">
        <div
          className="h-12 rounded-xl animate-pulse"
          style={{ background: 'rgba(255, 255, 255, 0.06)' }}
        />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 rounded-xl animate-pulse"
            style={{ background: 'rgba(255, 255, 255, 0.04)' }}
          />
        ))}
      </div>
    </div>
  );
}
