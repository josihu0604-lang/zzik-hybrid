'use client';

/**
 * Popup Detail Page - 팝업 상세 + 참여하기
 *
 * Refactored to use extracted hooks and components:
 * - usePopupDetail: Data fetching and state management
 * - PopupHero: Hero section with parallax
 * - PopupContent: Content sections (benefits, description, location, stats)
 * - PopupCTA: Call-to-action section
 */

import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { usePopupDetail } from '@/hooks/usePopupDetail';
import {
  PopupHero,
  PopupMainCard,
  PopupBenefits,
  PopupDescription,
  PopupLocation,
  PopupStats,
  PopupCTASection,
} from '@/components/popup';
import { ErrorBoundary } from '@/components/error';
import { ContentLoader } from '@/components/ui/LoadingSpinner';

function PopupDetailContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const referralCode = searchParams.get('ref');

  const {
    popup,
    isLoading,
    error,
    isParticipated,
    participants,
    showCelebration,
    brandColor,
    isConfirmedOrDone,
    realtime,
    // confetti is handled internally by usePopupDetail
    handleParticipate,
    setShowCelebration,
  } = usePopupDetail({ id, referralCode });

  // Loading state
  if (isLoading) {
    return <ContentLoader message="로딩 중..." />;
  }

  // Error state
  if (error || !popup) {
    return (
      <div className="min-h-screen bg-space-950 flex flex-col items-center justify-center gap-4 px-5">
        <div className="text-white/70 text-center">{error || '팝업을 찾을 수 없습니다.'}</div>
        <Link href="/" className="text-flame-500 text-sm underline">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-950 pt-safe pb-safe">
      {/* DES-028: 뒤로가기 버튼 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-space-950/80 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-5 h-14 flex items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            aria-label="뒤로가기"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">뒤로</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <PopupHero
        brandName={popup.brandName}
        popupId={popup.id}
        title={popup.title}
        category={popup.category}
        daysLeft={popup.daysLeft}
        isConfirmedOrDone={isConfirmedOrDone}
        brandColor={brandColor}
        referralCode={referralCode || undefined}
        showCelebration={showCelebration}
        onCloseCelebration={() => setShowCelebration(false)}
        latestParticipant={realtime.latestParticipant}
      />

      {/* Content */}
      <div className="px-5 -mt-8 relative z-10">
        <div className="max-w-lg mx-auto">
          {/* Main Card */}
          <PopupMainCard
            popup={popup}
            participants={participants}
            brandColor={brandColor}
            realtime={realtime}
          >
            {/* CTA Section */}
            <PopupCTASection
              popup={popup}
              brandColor={brandColor}
              isParticipated={isParticipated}
              participants={participants}
              referralCode={referralCode || undefined}
              onParticipate={handleParticipate}
            />
          </PopupMainCard>

          {/* Benefits */}
          <PopupBenefits />

          {/* Description */}
          <PopupDescription description={popup.description} />

          {/* Location */}
          <PopupLocation location={popup.location} />

          {/* Participation Stats */}
          <PopupStats participants={participants} goalParticipants={popup.goalParticipants} />
        </div>
      </div>
    </div>
  );
}

export default function PopupDetailPage() {
  return (
    <ErrorBoundary
      onError={(error) => {
        console.error('Popup detail page error:', error);
      }}
    >
      <PopupDetailContent />
    </ErrorBoundary>
  );
}
