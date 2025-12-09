'use client';

import { useState, useMemo, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
  Star,
  Filter,
  ChevronDown,
  Search,
  TrendingUp,
  Clock,
  ThumbsUp,
  Camera,
  Sparkles,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { colors, rgba, gradients } from '@/lib/design-tokens';
import { useLocale } from '@/providers/LocaleProvider';
import { ReviewCard, Review } from './ReviewCard';

// ============================================
// Types & Interfaces
// ============================================

export interface RatingSummary {
  average: number;
  total: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  highlights?: {
    label: string;
    labelKo: string;
    count: number;
    percentage: number;
  }[];
}

type SortOption = 'recent' | 'helpful' | 'rating_high' | 'rating_low' | 'photos';
type FilterOption = 'all' | '5' | '4' | '3' | '2' | '1' | 'with_photos' | 'verified';

interface ReviewListProps {
  reviews: Review[];
  ratingSummary: RatingSummary;
  targetId: string;
  onHelpful?: (reviewId: string) => void;
  onLike?: (reviewId: string) => void;
  onReply?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  currentUserId?: string;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
  className?: string;
}

// ============================================
// Constants
// ============================================

const SORT_OPTIONS: { value: SortOption; label: string; labelKo: string; icon: React.ReactNode }[] = [
  { value: 'recent', label: 'Most Recent', labelKo: '최신순', icon: <Clock size={16} /> },
  { value: 'helpful', label: 'Most Helpful', labelKo: '도움순', icon: <ThumbsUp size={16} /> },
  { value: 'rating_high', label: 'Highest Rating', labelKo: '평점 높은순', icon: <TrendingUp size={16} /> },
  { value: 'rating_low', label: 'Lowest Rating', labelKo: '평점 낮은순', icon: <TrendingUp size={16} className="rotate-180" /> },
  { value: 'photos', label: 'With Photos', labelKo: '사진 있는 순', icon: <Camera size={16} /> },
];

const FILTER_OPTIONS: { value: FilterOption; label: string; labelKo: string }[] = [
  { value: 'all', label: 'All Reviews', labelKo: '전체' },
  { value: '5', label: '5 Stars', labelKo: '5점' },
  { value: '4', label: '4 Stars', labelKo: '4점' },
  { value: '3', label: '3 Stars', labelKo: '3점' },
  { value: '2', label: '2 Stars', labelKo: '2점' },
  { value: '1', label: '1 Star', labelKo: '1점' },
  { value: 'with_photos', label: 'With Photos', labelKo: '사진 있음' },
  { value: 'verified', label: 'Verified', labelKo: '인증된' },
];

// ============================================
// Sub-Components
// ============================================

// Rating Summary Card
function RatingSummaryCard({ summary, locale }: { summary: RatingSummary; locale: string }) {
  const maxCount = Math.max(...Object.values(summary.distribution));

  return (
    <div 
      className="p-5 rounded-2xl"
      style={{ background: rgba.white[5], border: `1px solid ${rgba.white[10]}` }}
    >
      <div className="flex items-start gap-6">
        {/* Average Score */}
        <div className="text-center">
          <div className="text-5xl font-black text-white mb-1">
            {summary.average.toFixed(1)}
          </div>
          <div className="flex items-center justify-center gap-0.5 mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                fill={star <= Math.round(summary.average) ? colors.yellow[400] : 'transparent'}
                color={star <= Math.round(summary.average) ? colors.yellow[400] : rgba.white[30]}
              />
            ))}
          </div>
          <p className="text-xs" style={{ color: rgba.white[50] }}>
            {summary.total.toLocaleString()} {locale === 'ko' ? '리뷰' : 'reviews'}
          </p>
        </div>

        {/* Distribution */}
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = summary.distribution[rating as keyof typeof summary.distribution];
            const percentage = summary.total > 0 ? (count / summary.total) * 100 : 0;
            const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="w-3 text-xs text-right" style={{ color: rgba.white[60] }}>
                  {rating}
                </span>
                <Star size={12} fill={colors.yellow[400]} color={colors.yellow[400]} />
                <div 
                  className="flex-1 h-2 rounded-full overflow-hidden"
                  style={{ background: rgba.white[10] }}
                >
                  <m.div
                    className="h-full rounded-full"
                    style={{ background: gradients.flame }}
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <span className="w-12 text-xs text-right" style={{ color: rgba.white[50] }}>
                  {percentage.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Highlights */}
      {summary.highlights && summary.highlights.length > 0 && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: rgba.white[10] }}>
          <p className="text-xs font-medium mb-2" style={{ color: rgba.white[60] }}>
            {locale === 'ko' ? '자주 언급되는 키워드' : 'Frequently Mentioned'}
          </p>
          <div className="flex flex-wrap gap-2">
            {summary.highlights.map((highlight, index) => (
              <span
                key={index}
                className="px-3 py-1.5 rounded-full text-xs"
                style={{ background: colors.flame[500] + '15', color: colors.flame[400] }}
              >
                {locale === 'ko' ? highlight.labelKo : highlight.label}
                <span style={{ color: rgba.white[40] }}> ({highlight.count})</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Sort & Filter Controls
function SortFilterControls({
  sort,
  filter,
  onSortChange,
  onFilterChange,
  locale,
}: {
  sort: SortOption;
  filter: FilterOption;
  onSortChange: (sort: SortOption) => void;
  onFilterChange: (filter: FilterOption) => void;
  locale: string;
}) {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const currentSort = SORT_OPTIONS.find(o => o.value === sort);
  const currentFilter = FILTER_OPTIONS.find(o => o.value === filter);

  return (
    <div className="flex items-center gap-3">
      {/* Sort Dropdown */}
      <div className="relative">
        <button
          onClick={() => { setShowSortMenu(!showSortMenu); setShowFilterMenu(false); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: rgba.white[5], color: rgba.white[70] }}
        >
          {currentSort?.icon}
          <span className="hidden sm:inline">
            {locale === 'ko' ? currentSort?.labelKo : currentSort?.label}
          </span>
          <ChevronDown size={16} className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showSortMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
              <m.div
                className="absolute left-0 top-full mt-1 w-48 rounded-xl overflow-hidden z-50"
                style={{ 
                  background: colors.space[800], 
                  border: `1px solid ${rgba.white[10]}`,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {SORT_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => { onSortChange(option.value); setShowSortMenu(false); }}
                    className={`w-full px-4 py-3 flex items-center gap-2 text-sm hover:bg-white/5 ${
                      sort === option.value ? 'bg-white/5' : ''
                    }`}
                    style={{ color: sort === option.value ? colors.flame[500] : rgba.white[70] }}
                  >
                    {option.icon}
                    {locale === 'ko' ? option.labelKo : option.label}
                  </button>
                ))}
              </m.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Filter Dropdown */}
      <div className="relative">
        <button
          onClick={() => { setShowFilterMenu(!showFilterMenu); setShowSortMenu(false); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
          style={{ 
            background: filter !== 'all' ? colors.flame[500] + '20' : rgba.white[5], 
            color: filter !== 'all' ? colors.flame[500] : rgba.white[70],
            border: filter !== 'all' ? `1px solid ${colors.flame[500]}40` : 'none',
          }}
        >
          <Filter size={16} />
          <span className="hidden sm:inline">
            {locale === 'ko' ? currentFilter?.labelKo : currentFilter?.label}
          </span>
          <ChevronDown size={16} className={`transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showFilterMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowFilterMenu(false)} />
              <m.div
                className="absolute right-0 top-full mt-1 w-40 rounded-xl overflow-hidden z-50"
                style={{ 
                  background: colors.space[800], 
                  border: `1px solid ${rgba.white[10]}`,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {FILTER_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => { onFilterChange(option.value); setShowFilterMenu(false); }}
                    className={`w-full px-4 py-3 text-sm text-left hover:bg-white/5 ${
                      filter === option.value ? 'bg-white/5' : ''
                    }`}
                    style={{ color: filter === option.value ? colors.flame[500] : rgba.white[70] }}
                  >
                    {locale === 'ko' ? option.labelKo : option.label}
                  </button>
                ))}
              </m.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Empty State
function EmptyState({ locale }: { locale: string }) {
  return (
    <div 
      className="py-16 text-center rounded-2xl"
      style={{ background: rgba.white[5] }}
    >
      <Sparkles size={48} className="mx-auto mb-4" style={{ color: rgba.white[20] }} />
      <p className="font-semibold text-white mb-2">
        {locale === 'ko' ? '아직 리뷰가 없습니다' : 'No reviews yet'}
      </p>
      <p className="text-sm" style={{ color: rgba.white[50] }}>
        {locale === 'ko' ? '첫 번째 리뷰를 작성해보세요!' : 'Be the first to write a review!'}
      </p>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function ReviewList({
  reviews,
  ratingSummary,
  targetId,
  onHelpful,
  onLike,
  onReply,
  onReport,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  currentUserId,
  onEdit,
  onDelete,
  className = '',
}: ReviewListProps) {
  const { locale } = useLocale();
  const [sort, setSort] = useState<SortOption>('recent');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    // Apply filter
    if (filter !== 'all') {
      switch (filter) {
        case '5':
        case '4':
        case '3':
        case '2':
        case '1':
          result = result.filter(r => r.rating === parseInt(filter));
          break;
        case 'with_photos':
          result = result.filter(r => r.images && r.images.length > 0);
          break;
        case 'verified':
          result = result.filter(r => r.author.isVerified);
          break;
      }
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.content.toLowerCase().includes(query) ||
        r.title?.toLowerCase().includes(query) ||
        r.author.name.toLowerCase().includes(query) ||
        r.tags?.some(t => t.toLowerCase().includes(query))
      );
    }

    // Apply sort
    switch (sort) {
      case 'recent':
        result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        break;
      case 'helpful':
        result.sort((a, b) => b.helpful - a.helpful);
        break;
      case 'rating_high':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating_low':
        result.sort((a, b) => a.rating - b.rating);
        break;
      case 'photos':
        result.sort((a, b) => (b.images?.length || 0) - (a.images?.length || 0));
        break;
    }

    return result;
  }, [reviews, filter, sort, searchQuery]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          {locale === 'ko' ? '리뷰' : 'Reviews'}
          <span className="ml-2 text-base font-normal" style={{ color: rgba.white[50] }}>
            ({ratingSummary.total.toLocaleString()})
          </span>
        </h2>
        <SortFilterControls
          sort={sort}
          filter={filter}
          onSortChange={setSort}
          onFilterChange={setFilter}
          locale={locale}
        />
      </div>

      {/* Rating Summary */}
      <RatingSummaryCard summary={ratingSummary} locale={locale} />

      {/* Search */}
      <div className="relative">
        <Search 
          size={18} 
          className="absolute left-4 top-1/2 -translate-y-1/2"
          style={{ color: rgba.white[40] }}
        />
        <input
          type="text"
          placeholder={locale === 'ko' ? '리뷰 검색...' : 'Search reviews...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-flame-500"
        />
      </div>

      {/* Results Info */}
      {(filter !== 'all' || searchQuery) && (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: rgba.white[60] }}>
            {filteredReviews.length} {locale === 'ko' ? '개의 결과' : 'results'}
          </p>
          {(filter !== 'all' || searchQuery) && (
            <button
              onClick={() => { setFilter('all'); setSearchQuery(''); }}
              className="text-sm font-medium"
              style={{ color: colors.flame[500] }}
            >
              {locale === 'ko' ? '필터 초기화' : 'Clear filters'}
            </button>
          )}
        </div>
      )}

      {/* Review List */}
      {filteredReviews.length === 0 ? (
        <EmptyState locale={locale} />
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review, index) => (
            <m.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ReviewCard
                review={review}
                isOwner={currentUserId === review.author.id}
                onHelpful={onHelpful}
                onLike={onLike}
                onReply={onReply}
                onReport={onReport}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </m.div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={isLoading}
          className="w-full py-4 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
          style={{ background: rgba.white[5], color: colors.flame[500] }}
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

export default ReviewList;
