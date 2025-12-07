'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Bookmark,
  BookmarkX,
  MapPin,
  Clock,
  Users,
  Flame,
  Trash2,
  Filter,
} from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { ProgressBar } from '@/components/popup';
import { Button, IconButton } from '@/components/ui/Button';
import { CATEGORY_LABELS, type PopupItem } from '@/hooks/useSearch';
import { colors, radii, liquidGlass } from '@/lib/design-tokens';

/**
 * Bookmarks Page - 저장한 팝업
 *
 * Features:
 * - 북마크한 팝업 목록
 * - 필터링 (전체/펀딩중/확정)
 * - 개별/전체 삭제
 */

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_BOOKMARKS: (PopupItem & { bookmarkedAt: string })[] = [
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
    bookmarkedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
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
    bookmarkedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
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
    bookmarkedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

type FilterType = 'all' | 'funding' | 'confirmed';

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

  if (days > 0) return `${days}일 ${hours}시간`;
  if (hours > 0) return `${hours}시간`;
  return '마감 임박';
}

function formatBookmarkDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return '오늘';
  if (days === 1) return '어제';
  return `${days}일 전`;
}

function BookmarkCard({
  popup,
  onRemove,
}: {
  popup: PopupItem & { bookmarkedAt: string };
  onRemove: () => void;
}) {
  const router = useRouter();
  const progress = Math.round((popup.currentParticipants / popup.goalParticipants) * 100);
  const isHot = progress >= 70;
  const isConfirmed = popup.status === 'confirmed';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      style={GLASS_CARD_STYLE}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 cursor-pointer" onClick={() => router.push(`/popup/${popup.id}`)}>
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
              {isHot && !isConfirmed && (
                <div className="flex items-center gap-1">
                  <Flame size={12} style={{ color: colors.flame[500] }} />
                  <span className="text-micro font-bold" style={{ color: colors.flame[500] }}>
                    HOT
                  </span>
                </div>
              )}
            </div>
            <p className="text-micro" style={{ color: colors.text.tertiary }}>
              {popup.brandName}
            </p>
            <h3 className="font-bold mt-1" style={{ color: colors.text.primary }}>
              {popup.title}
            </h3>
          </div>

          {/* Remove Button */}
          <IconButton
            icon={<BookmarkX size={18} style={{ color: colors.text.tertiary }} />}
            onClick={(e) => {
              e?.stopPropagation();
              onRemove();
            }}
            variant="ghost"
            size="sm"
            aria-label="북마크 삭제"
          />
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

          <div className="flex items-center gap-2">
            {!isConfirmed && (
              <div className="flex items-center gap-1">
                <Clock size={12} style={{ color: colors.flame[500] }} />
                <span className="text-micro font-medium" style={{ color: colors.flame[500] }}>
                  {formatDeadline(popup.deadlineAt)}
                </span>
              </div>
            )}
            <span className="text-micro" style={{ color: colors.text.muted }}>
              저장: {formatBookmarkDate(popup.bookmarkedAt)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BookmarksPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>('all');
  const [bookmarks, setBookmarks] = useState(MOCK_BOOKMARKS);

  const filteredBookmarks = useMemo(() => {
    if (filter === 'all') return bookmarks;
    return bookmarks.filter((b) => b.status === filter);
  }, [bookmarks, filter]);

  const handleRemove = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleClearAll = () => {
    setBookmarks([]);
  };

  const filterCounts = useMemo(
    () => ({
      all: bookmarks.length,
      funding: bookmarks.filter((b) => b.status === 'funding').length,
      confirmed: bookmarks.filter((b) => b.status === 'confirmed').length,
    }),
    [bookmarks]
  );

  return (
    <div className="min-h-screen pb-24" style={{ background: colors.space[950] }}>
      {/* Header */}
      <div
        className="sticky top-0 z-30 px-4 py-4"
        style={{
          background: 'rgba(8, 9, 10, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${colors.border.subtle}`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <IconButton
              icon={<ChevronLeft size={24} style={{ color: colors.text.primary }} />}
              onClick={() => router.back()}
              aria-label="뒤로 가기"
            />
            <div>
              <h1 className="text-xl font-bold" style={{ color: colors.text.primary }}>
                저장한 팝업
              </h1>
              <p className="text-micro" style={{ color: colors.text.tertiary }}>
                {bookmarks.length}개
              </p>
            </div>
          </div>

          {bookmarks.length > 0 && (
            <IconButton
              icon={<Trash2 size={18} style={{ color: colors.error }} />}
              onClick={handleClearAll}
              variant="danger"
              size="sm"
              aria-label="전체 삭제"
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {bookmarks.length > 0 ? (
          <>
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {(['all', 'funding', 'confirmed'] as FilterType[]).map((f) => (
                <motion.button
                  key={f}
                  onClick={() => setFilter(f)}
                  whileTap={{ scale: 0.95 }}
                  className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                  style={{
                    background:
                      filter === f ? 'rgba(255, 107, 91, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border:
                      filter === f
                        ? `1px solid ${colors.flame[500]}`
                        : `1px solid ${colors.border.subtle}`,
                    color: filter === f ? colors.flame[500] : colors.text.secondary,
                  }}
                >
                  {f === 'all' && '전체'}
                  {f === 'funding' && '펀딩 중'}
                  {f === 'confirmed' && '오픈 확정'}
                  <span
                    className="px-1.5 py-0.5 rounded-full text-micro"
                    style={{
                      background: filter === f ? colors.flame[500] : 'rgba(255, 255, 255, 0.1)',
                      color: filter === f ? 'white' : colors.text.tertiary,
                    }}
                  >
                    {filterCounts[f]}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Bookmarks List */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredBookmarks.map((popup) => (
                  <BookmarkCard
                    key={popup.id}
                    popup={popup}
                    onRemove={() => handleRemove(popup.id)}
                  />
                ))}
              </AnimatePresence>
            </div>

            {filteredBookmarks.length === 0 && (
              <div className="py-12 text-center">
                <Filter size={48} className="mx-auto mb-4" style={{ color: colors.text.muted }} />
                <p style={{ color: colors.text.tertiary }}>해당 필터에 맞는 팝업이 없습니다</p>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center">
            <Bookmark size={64} className="mx-auto mb-4" style={{ color: colors.text.muted }} />
            <h3 className="font-bold text-lg mb-2" style={{ color: colors.text.secondary }}>
              저장한 팝업이 없습니다
            </h3>
            <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: colors.text.tertiary }}>
              관심있는 팝업을 저장하고
              <br />
              마감 전 알림을 받아보세요
            </p>
            <Button variant="primary" size="md" onClick={() => router.push('/')}>
              팝업 둘러보기
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
