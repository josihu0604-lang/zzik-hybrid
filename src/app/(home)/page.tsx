'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Flame, Bell, MapPin, Users } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { BentoGrid, BentoItem } from '@/components/layout/BentoGrid';
import { BentoPopupCard } from '@/components/popup/BentoPopupCard';
import { PopupPreviewSheet } from '@/components/popup/PopupPreviewSheet';
import { BentoGridSkeleton } from '@/components/feedback/ShimmerSkeleton';
import { CategoryFilter, DEFAULT_CATEGORIES } from '@/components/home/CategoryFilter';
import { RealtimeNotification } from '@/components/realtime/RealtimeNotification';
import { PullToRefresh } from '@/components/feedback/PullToRefresh';
import { useRealtimePopupList } from '@/hooks/useRealtimeParticipation';
import { hasCompletedOnboarding } from '@/components/onboarding';
import { ErrorBoundary } from '@/components/error';
import { useToast } from '@/components/ui/Toast';
import { useTranslation } from '@/i18n';
import { GlobalHero } from '@/components/home/GlobalHero';
import type { Participant } from '@/types/participant';

/**
 * ZZIK Home Page - 2026 Bento Grid Style
 *
 * Design:
 * - 컴팩트 헤더 (앱 스타일)
 * - 카테고리 탭 필터
 * - Bento Grid 레이아웃 (Hero + Featured + Standard)
 * - Shimmer 스켈레톤
 */

// Types
interface PopupData {
  id: string;
  brandName: string;
  brandLogo?: string;
  imageUrl?: string;
  title: string;
  location: string;
  currentParticipants: number;
  goalParticipants: number;
  daysLeft: number;
  deadlineAt: string;
  category: 'fashion' | 'beauty' | 'kpop' | 'food' | 'cafe' | 'lifestyle' | 'culture' | 'tech';
  status: 'funding' | 'confirmed' | 'completed' | 'cancelled';
  isParticipated?: boolean;
}

interface ApiResponse {
  success: boolean;
  data?: {
    popups: PopupData[];
    total: number;
    source: 'database' | 'mock';
  };
  error?: string;
}

function HomeContent() {
  const router = useRouter();
  const toast = useToast();
  const { t } = useTranslation();
  const [popups, setPopups] = useState<PopupData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [participatingIds, setParticipatingIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState('all');
  const [latestParticipant, setLatestParticipant] = useState<Participant | null>(null);

  // Bottom Sheet 상태
  const [selectedPopup, setSelectedPopup] = useState<PopupData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Realtime 업데이트 핸들러
  const handleRealtimeUpdate = useCallback((update: { popupId: string; newCount: number }) => {
    setPopups((prev) =>
      prev.map((p) =>
        p.id === update.popupId ? { ...p, currentParticipants: update.newCount } : p
      )
    );
    setLatestParticipant({
      id: `participant-${Date.now()}`,
      name: '새로운 참여자',
      avatar: undefined,
    });
    setTimeout(() => setLatestParticipant(null), 5000);
  }, []);

  useRealtimePopupList(true, handleRealtimeUpdate);

  // 온보딩 체크
  useEffect(() => {
    if (!hasCompletedOnboarding()) {
      router.replace('/onboarding');
    } else {
      setIsCheckingOnboarding(false);
    }
  }, [router]);

  // API 호출 함수
  const loadPopups = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setIsLoading(true);
        const categoryParam = activeCategory !== 'all' ? `&category=${activeCategory}` : '';
        const response = await fetch(`/api/popup?limit=20${categoryParam}`);
        const result: ApiResponse = await response.json();

        if (result.success && result.data) {
          setPopups(result.data.popups);
          setError(null);
        } else {
          setError(result.error || '팝업 데이터를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('[Home] Failed to load popups:', err);
        const errorMessage =
          err instanceof Error ? err.message : '팝업 데이터를 불러오는데 실패했습니다.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [activeCategory]
  );

  // 초기 로딩
  useEffect(() => {
    if (isCheckingOnboarding) return;
    loadPopups();
  }, [isCheckingOnboarding, loadPopups]);

  // 풀 투 리프레시 핸들러
  const handleRefresh = useCallback(async () => {
    await loadPopups(false);
  }, [loadPopups]);

  // 카드 클릭 핸들러 - Bottom Sheet 열기
  const handleCardClick = useCallback(
    (popupId: string) => {
      const popup = popups.find((p) => p.id === popupId);
      if (popup) {
        setSelectedPopup(popup);
        setIsSheetOpen(true);
      }
    },
    [popups]
  );

  // Sheet 닫기 핸들러
  const handleSheetClose = useCallback(() => {
    setIsSheetOpen(false);
    // 애니메이션 후 popup 초기화
    setTimeout(() => setSelectedPopup(null), 300);
  }, []);

  // 참여 핸들러
  const handleParticipate = useCallback(
    async (popupId: string) => {
      if (participatingIds.has(popupId)) return;

      const getCsrfToken = (): string | null => {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'csrf_token') return value;
        }
        return null;
      };

      const csrfToken = getCsrfToken();
      setParticipatingIds((prev) => new Set([...prev, popupId]));

      // Optimistic update
      setPopups((prev) =>
        prev.map((p) =>
          p.id === popupId
            ? { ...p, isParticipated: true, currentParticipants: p.currentParticipants + 1 }
            : p
        )
      );

      try {
        const response = await fetch('/api/popup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
          },
          body: JSON.stringify({ popupId }),
        });

        const result = await response.json();

        if (!result.success) {
          // Rollback
          setPopups((prev) =>
            prev.map((p) =>
              p.id === popupId
                ? { ...p, isParticipated: false, currentParticipants: p.currentParticipants - 1 }
                : p
            )
          );
          if (response.status === 401) {
            toast.info('로그인이 필요합니다');
            window.location.href = '/login?redirect=/';
          } else {
            toast.error('참여에 실패했습니다. 다시 시도해주세요.');
          }
        }
      } catch (err) {
        console.error('[Home] Participation failed:', err);
        // Rollback
        setPopups((prev) =>
          prev.map((p) =>
            p.id === popupId
              ? { ...p, isParticipated: false, currentParticipants: p.currentParticipants - 1 }
              : p
          )
        );
        const errorMessage =
          err instanceof Error && err.message
            ? err.message
            : '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        toast.error(errorMessage);
      } finally {
        setParticipatingIds((prev) => {
          const next = new Set(prev);
          next.delete(popupId);
          return next;
        });
      }
    },
    [participatingIds, toast]
  );

  // 필터링된 팝업
  const filteredPopups = useMemo(() => {
    const funding = popups.filter((p) => p.status === 'funding');
    if (activeCategory === 'all') return funding;
    return funding.filter((p) => p.category === activeCategory);
  }, [popups, activeCategory]);

  const totalParticipants = useMemo(
    () => popups.reduce((sum, p) => sum + p.currentParticipants, 0),
    [popups]
  );

  if (isCheckingOnboarding) {
    return <div className="min-h-screen bg-space-950" aria-busy="true" />;
  }

  return (
    <div className="min-h-screen bg-space-950 text-white pb-24">
      <RealtimeNotification participant={latestParticipant} />

      {/* Compact App Header */}
      <header
        className="sticky top-0 z-50 bg-space-950/90 backdrop-blur-lg border-b border-white/[0.06]"
        role="banner"
      >
        <div className="flex items-center justify-between px-4 h-14">
          {/* Logo + Participant Count */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Flame size={20} className="text-flame-500" />
              <span className="text-base font-bold tracking-tight">ZZIK</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-white/50">
              <Users size={12} />
              <span className="tabular-nums">{totalParticipants.toLocaleString()}</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/map"
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
              aria-label={t('nav.map')}
            >
              <MapPin size={20} className="text-white/60" />
            </Link>
            <button
              className="p-2 rounded-full hover:bg-white/5 transition-colors relative"
              aria-label={t('notification.title')}
            >
              <Bell size={20} className="text-white/60" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-flame-500" />
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <CategoryFilter
          categories={DEFAULT_CATEGORIES}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </header>

      {/* Global Hero Section */}
      <GlobalHero onGetStarted={() => {
        document.getElementById('popup-list')?.scrollIntoView({ behavior: 'smooth' });
      }} />

      {/* Main Content with Pull to Refresh */}
      <PullToRefresh onRefresh={handleRefresh} className="min-h-[calc(100vh-140px)]">
        <main className="px-5 pt-4" role="main" id="popup-list">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-flame-500 animate-pulse" />
              <h2 className="text-sm font-semibold text-white/80">
                {t('experience.trending')} <span className="text-flame-500">{filteredPopups.length}</span>
              </h2>
            </div>
            <Link href="/live" className="text-xs text-white/40 hover:text-white/60">
              {t('experience.viewAll')}
            </Link>
          </div>

          {/* Experience Cards Grid */}
          {/* Loading - Shimmer Skeleton */}
          {isLoading && <BentoGridSkeleton count={5} />}

          {/* Error */}
          {error && !isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 border border-red-500/20 rounded-xl bg-red-500/[0.03]"
              role="alert"
            >
              <p className="text-red-400 text-sm mb-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-xs text-white/60 underline"
              >
                {t('error.tryAgain')}
              </button>
            </motion.div>
          )}

          {/* Empty */}
          {!isLoading && !error && filteredPopups.length === 0 && (
            <div className="text-center py-12 border border-white/[0.06] rounded-xl">
              <p className="text-white/60 text-sm mb-1">{t('experience.noExperiences')}</p>
              <p className="text-white/40 text-xs">{t('experience.newExperiences')}</p>
            </div>
          )}

          {/* Bento Grid - 2026 Style */}
          {!isLoading && !error && filteredPopups.length > 0 && (
            <BentoGrid gap={3} animated>
              {filteredPopups.map((popup, index) => {
                // 카드 크기 결정: 첫 번째=hero, 2-3번째=featured, 나머지=standard
                const size = index === 0 ? 'hero' : index <= 2 ? 'featured' : 'standard';

                return (
                  <BentoItem key={popup.id} size={size}>
                    <BentoPopupCard
                      popup={popup}
                      size={size}
                      onParticipate={handleParticipate}
                      onCardClick={handleCardClick}
                    />
                  </BentoItem>
                );
              })}
            </BentoGrid>
          )}
        </main>
      </PullToRefresh>

      <BottomNav />

      {/* Bottom Sheet - Popup Preview */}
      <PopupPreviewSheet
        popup={selectedPopup}
        isOpen={isSheetOpen}
        onClose={handleSheetClose}
        onParticipate={handleParticipate}
      />
    </div>
  );
}

export default function Home() {
  return (
    <ErrorBoundary onError={(error) => console.error('Home page error:', error)}>
      <HomeContent />
    </ErrorBoundary>
  );
}
