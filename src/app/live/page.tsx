'use client';

import { motion } from 'framer-motion';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ZzikLogo } from '@/components/cosmic';
import { BottomNav } from '@/components/layout/BottomNav';
import { PopupCard, type PopupData } from '@/components/popup';
import { ErrorBoundary } from '@/components/error';
import { Button, IconButton } from '@/components/ui/Button';
import { X } from 'lucide-react';

/**
 * Live Funding Page - 현재 펀딩 중인 모든 팝업
 */

// Category filters
const CATEGORIES = [
  { id: 'all', label: '전체' },
  { id: 'fashion', label: 'K-Fashion' },
  { id: 'beauty', label: 'K-Beauty' },
  { id: 'kpop', label: 'K-Pop' },
  { id: 'food', label: 'K-Food' },
  { id: 'lifestyle', label: 'Lifestyle' },
];

// Mock data
const MOCK_POPUPS: PopupData[] = [
  {
    id: '1',
    brandName: 'GENTLE MONSTER',
    title: '성수동 한정판 선글라스 팝업',
    location: '성수동 · 1월 17-20일',
    currentParticipants: 72,
    goalParticipants: 100,
    daysLeft: 3,
    category: 'fashion',
  },
  {
    id: '2',
    brandName: 'ADER ERROR',
    title: '2025 S/S 컬렉션 프리뷰',
    location: '한남동 · 1월 25-28일',
    currentParticipants: 156,
    goalParticipants: 200,
    daysLeft: 7,
    category: 'fashion',
  },
  {
    id: '3',
    brandName: 'TAMBURINS',
    title: '새 향수 라인 체험 팝업',
    location: '가로수길 · 2월 1-5일',
    currentParticipants: 89,
    goalParticipants: 80,
    daysLeft: 12,
    category: 'beauty',
  },
  {
    id: '4',
    brandName: 'BT21',
    title: 'BT21 윈터 에디션 팝업',
    location: '홍대 · 1월 20-25일',
    currentParticipants: 245,
    goalParticipants: 300,
    daysLeft: 5,
    category: 'kpop',
  },
  {
    id: '5',
    brandName: 'MARDI MERCREDI',
    title: '봄 신상 프리오더 팝업',
    location: '청담동 · 2월 10-15일',
    currentParticipants: 34,
    goalParticipants: 150,
    daysLeft: 20,
    category: 'fashion',
  },
  {
    id: '6',
    brandName: 'INNISFREE',
    title: '제주 에디션 런칭 팝업',
    location: '명동 · 1월 28-31일',
    currentParticipants: 180,
    goalParticipants: 200,
    daysLeft: 8,
    category: 'beauty',
  },
];

// Helper function to highlight search terms
function highlightText(text: string, searchTerm: string) {
  if (!searchTerm.trim()) return text;

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <span
        key={`highlight-${index}-${part}`}
        className="bg-linear-orange/30 text-linear-orange font-semibold"
      >
        {part}
      </span>
    ) : (
      <span key={`text-${index}-${part}`}>{part}</span>
    )
  );
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function LivePageContent() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [popups, setPopups] = useState<PopupData[]>(MOCK_POPUPS);
  const [sortBy, setSortBy] = useState<'deadline' | 'participants' | 'latest'>('deadline');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(6); // Show 6 items initially
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Debounced search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter by category
  const filteredPopups = useMemo(() => {
    return selectedCategory === 'all'
      ? popups
      : popups.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, popups]);

  // Search functionality with debounce
  const searchedPopups = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return filteredPopups;

    const query = debouncedSearchQuery.toLowerCase();
    return filteredPopups.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.brandName.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query)
    );
  }, [debouncedSearchQuery, filteredPopups]);

  // Sort functionality
  const sortedPopups = useMemo(() => {
    return [...searchedPopups].sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          return a.daysLeft - b.daysLeft;
        case 'participants':
          return b.currentParticipants - a.currentParticipants;
        case 'latest':
        default:
          return 0;
      }
    });
  }, [searchedPopups, sortBy]);

  const displayedPopups = sortedPopups.slice(0, displayCount);
  const hasMore = displayCount < sortedPopups.length;

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    // Simulate loading delay for better UX
    setTimeout(() => {
      setDisplayCount((prev) => prev + 6);
      setIsLoadingMore(false);
    }, 300);
  };

  const handleParticipate = (popupId: string) => {
    setPopups((prev) =>
      prev.map((p) =>
        p.id === popupId
          ? { ...p, isParticipated: true, currentParticipants: p.currentParticipants + 1 }
          : p
      )
    );
  };

  // U004: Implement handleCardClick with router.push
  const handleCardClick = (popupId: string) => {
    router.push(`/popup/${popupId}`);
  };

  return (
    <div className="min-h-screen bg-space-950 pt-safe pb-safe">
      {/* Header */}
      <header
        className="sticky top-0 z-50 px-5 py-4"
        style={{
          background: 'rgba(8, 9, 10, 0.9)',
          backdropFilter: 'blur(24px) saturate(180%)',
        }}
      >
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <ZzikLogo size={28} />
              <h1 className="text-white font-bold text-lg">펀딩 중</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-linear-orange opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-linear-orange"></span>
              </span>
              <span className="text-linear-text-secondary text-sm">{sortedPopups.length}개</span>
            </div>
          </div>

          {/* Enhanced Search Bar */}
          <div role="search" className="mb-4">
            <div className="relative">
              {/* Search Icon */}
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-linear-text-tertiary pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>

              {/* Search Input */}
              <input
                type="search"
                placeholder="팝업, 브랜드, 지역 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="팝업 검색"
                className="w-full bg-linear-surface text-white text-sm rounded-xl pl-10 pr-10 py-3 border border-transparent focus:border-linear-orange/50 outline-none transition-all placeholder:text-linear-text-tertiary"
              />

              {/* Clear Button */}
              {searchQuery && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <IconButton
                    icon={<X size={12} />}
                    aria-label="검색어 지우기"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSearch}
                  />
                </motion.div>
              )}
            </div>

            {/* Search Results Count */}
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-linear-text-secondary"
              >
                <span className="text-linear-orange font-semibold">{sortedPopups.length}개</span>의
                검색 결과
              </motion.div>
            )}
          </div>

          {/* Category Filter */}
          <div
            className="relative flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide"
            role="radiogroup"
            aria-label="카테고리 필터"
          >
            {/* Fade-out gradient mask */}
            <div
              className="absolute right-0 top-0 bottom-0 w-16 pointer-events-none"
              style={{
                background: 'linear-gradient(to left, rgba(8, 9, 10, 1) 0%, transparent 100%)',
              }}
            />
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                role="radio"
                aria-checked={selectedCategory === cat.id}
                aria-label={`${cat.label} 카테고리 선택`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-3 min-h-[44px] rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-linear-orange text-white'
                    : 'bg-linear-surface text-linear-text-secondary hover:bg-linear-elevated'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-5 pb-24">
        <div className="max-w-lg mx-auto">
          {/* Sort Options */}
          <div className="flex items-center justify-between py-4">
            <span className="text-linear-text-tertiary text-sm">
              {sortedPopups.length}개의 팝업
            </span>
            <select
              className="bg-transparent text-linear-text-secondary text-sm border-none outline-none min-h-[48px] py-2"
              aria-label="팝업 정렬 기준"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'deadline' | 'participants' | 'latest')}
            >
              <option value="deadline">마감 임박순</option>
              <option value="participants">참여자 많은순</option>
              <option value="latest">최신순</option>
            </select>
          </div>

          {/* Popup List with Search Highlight */}
          {sortedPopups.length > 0 ? (
            <div className="flex flex-col gap-4">
              {displayedPopups.map((popup, index) => (
                <motion.div
                  key={popup.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PopupCard
                    popup={popup}
                    onParticipate={handleParticipate}
                    onCardClick={handleCardClick}
                    highlightText={
                      debouncedSearchQuery
                        ? (text) => highlightText(text, debouncedSearchQuery)
                        : undefined
                    }
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            /* Empty State for Search */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 px-6 text-center"
            >
              {/* Search Icon */}
              <div className="w-20 h-20 rounded-full bg-linear-surface flex items-center justify-center mb-6">
                <svg
                  className="w-10 h-10 text-linear-text-tertiary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Message */}
              <h3 className="text-white text-lg font-semibold mb-2">검색 결과가 없어요</h3>
              <p className="text-linear-text-secondary text-sm mb-6 leading-relaxed">
                {searchQuery ? (
                  <>
                    <span className="text-linear-orange font-medium">
                      &quot;{searchQuery}&quot;
                    </span>
                    에 대한 팝업을 찾을 수 없습니다.
                    <br />
                    다른 검색어를 입력해보세요.
                  </>
                ) : (
                  <>
                    해당 카테고리에 펀딩 중인 팝업이 없습니다.
                    <br />
                    다른 카테고리를 선택해보세요.
                  </>
                )}
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="px-5 py-2.5 rounded-xl bg-linear-surface hover:bg-linear-elevated text-white text-sm font-medium transition-colors"
                    aria-label="검색어 지우기"
                  >
                    검색어 지우기
                  </button>
                )}
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="px-5 py-2.5 rounded-xl bg-linear-orange hover:bg-linear-orange/90 text-white text-sm font-medium transition-colors"
                    aria-label="전체 카테고리 보기"
                  >
                    전체 보기
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Load More Button */}
          {hasMore && sortedPopups.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
              <Button
                variant="ghost"
                size="lg"
                fullWidth
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                aria-label={
                  isLoadingMore
                    ? '팝업 로딩 중'
                    : `더보기 버튼, ${sortedPopups.length - displayCount}개 남음`
                }
              >
                {isLoadingMore ? (
                  <div className="flex items-center justify-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/80 animate-spin"
                      role="status"
                      aria-label="로딩 중"
                    />
                    로딩 중...
                  </div>
                ) : (
                  `더보기 (${sortedPopups.length - displayCount}개 남음)`
                )}
              </Button>
            </motion.div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

export default function LivePage() {
  return (
    <ErrorBoundary
      onError={(error) => {
        console.error('Live page error:', error);
      }}
    >
      <LivePageContent />
    </ErrorBoundary>
  );
}
