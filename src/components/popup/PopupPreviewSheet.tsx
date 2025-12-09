'use client';

import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { m } from 'framer-motion';
import { MapPin, Clock, Users, Flame, ChevronRight, ExternalLink } from 'lucide-react';
import { BottomSheet } from '@/components/overlay/BottomSheet';
import { ProgressBar } from './ProgressBar';
import { colors, gradients, typography } from '@/lib/design-tokens';
import type { BentoPopupData } from './BentoPopupCard';

/**
 * PopupPreviewSheet - 팝업 미리보기 바텀시트
 *
 * 2026 트렌드: Bottom Sheet First
 * - 카드 클릭 시 바텀시트로 미리보기
 * - 핵심 정보 + CTA 제공
 * - "자세히 보기"로 풀페이지 이동
 */

interface PopupPreviewSheetProps {
  popup: BentoPopupData | null;
  isOpen: boolean;
  onClose: () => void;
  onParticipate: (popupId: string) => void;
}

function PopupPreviewSheetComponent({
  popup,
  isOpen,
  onClose,
  onParticipate,
}: PopupPreviewSheetProps) {
  if (!popup) return null;

  const progress = Math.min((popup.currentParticipants / popup.goalParticipants) * 100, 100);
  const isDone = progress >= 100;
  const isHot = progress >= 70 && !isDone;
  const isUrgent = popup.daysLeft <= 3 && !isDone;
  const remaining = popup.goalParticipants - popup.currentParticipants;

  const handleParticipate = () => {
    if (!popup.isParticipated && !isDone) {
      onParticipate(popup.id);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      initialHeight={60}
      maxHeight={85}
      closeThreshold={25}
    >
      <div className="px-5 pb-4">
        {/* Hero Image */}
        <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 -mx-1">
          {popup.imageUrl ? (
            <Image
              src={popup.imageUrl}
              alt={popup.title}
              fill
              priority
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgZmlsbD0iIzFhMWMxZiIvPjwvc3ZnPg=="
              className="object-cover"
              sizes="100vw"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: gradients.flame }}
            >
              {popup.brandLogo ? (
                <Image
                  src={popup.brandLogo}
                  alt={popup.brandName}
                  width={80}
                  height={80}
                  loading="lazy"
                  className="object-contain opacity-80"
                />
              ) : (
                <span className="text-6xl font-bold text-white/30">
                  {popup.brandName.charAt(0)}
                </span>
              )}
            </div>
          )}

          {/* Overlay Gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.6) 100%)',
            }}
          />

          {/* Status Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {isUrgent && (
              <span
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                style={{
                  background: 'rgba(255, 107, 91, 0.9)',
                  color: 'white',
                }}
              >
                <Clock size={12} />
                D-{popup.daysLeft}
              </span>
            )}
            {isHot && !isUrgent && (
              <span
                className="px-2.5 py-1 rounded-full text-xs font-bold"
                style={{
                  background: 'rgba(255, 107, 91, 0.9)',
                  color: 'white',
                }}
              >
                🔥 HOT
              </span>
            )}
            {isDone && (
              <span
                className="px-2.5 py-1 rounded-full text-xs font-bold"
                style={{
                  background: 'rgba(34, 197, 94, 0.9)',
                  color: 'white',
                }}
              >
                🎉 OPEN
              </span>
            )}
          </div>
        </div>

        {/* Brand Info */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium" style={{ color: colors.flame[400] }}>
            {popup.brandName}
          </span>
          <span style={{ color: colors.text.muted }}>·</span>
          <span
            className="text-sm flex items-center gap-1"
            style={{ color: colors.text.secondary }}
          >
            <MapPin size={12} />
            {popup.location}
          </span>
        </div>

        {/* Title */}
        <h2
          className="mb-4"
          style={{
            fontSize: typography.fontSize.xl.size,
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            lineHeight: '1.3',
          }}
        >
          {popup.title}
        </h2>

        {/* Progress Section */}
        <div
          className="p-4 rounded-xl mb-4"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${colors.border.subtle}`,
          }}
        >
          <div className="mb-3">
            <ProgressBar
              current={popup.currentParticipants}
              goal={popup.goalParticipants}
              showLabel
              size="md"
            />
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Users size={14} style={{ color: colors.text.muted }} />
                <span
                  style={{ color: colors.text.secondary, fontSize: typography.fontSize.sm.size }}
                >
                  <span
                    className="font-bold"
                    style={{ color: isDone ? colors.success : colors.flame[500] }}
                  >
                    {popup.currentParticipants}
                  </span>
                  /{popup.goalParticipants}명
                </span>
              </div>

              {!isDone && popup.daysLeft > 0 && (
                <div className="flex items-center gap-1.5">
                  <Clock size={14} style={{ color: colors.text.muted }} />
                  <span
                    style={{
                      color: isUrgent ? colors.flame[400] : colors.text.secondary,
                      fontSize: typography.fontSize.sm.size,
                      fontWeight: isUrgent ? 600 : 400,
                    }}
                  >
                    D-{popup.daysLeft}
                  </span>
                </div>
              )}
            </div>

            {!isDone && remaining > 0 && (
              <span
                className="px-2 py-1 rounded-md text-xs font-medium"
                style={{
                  background: 'rgba(255, 107, 91, 0.1)',
                  color: colors.flame[400],
                }}
              >
                {remaining}명 남음
              </span>
            )}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-3">
          {/* 참여 버튼 */}
          <m.button
            onClick={handleParticipate}
            disabled={popup.isParticipated || isDone}
            whileHover={{ scale: popup.isParticipated || isDone ? 1 : 1.02 }}
            whileTap={{ scale: popup.isParticipated || isDone ? 1 : 0.98 }}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all"
            style={{
              background: popup.isParticipated
                ? 'rgba(255, 255, 255, 0.05)'
                : isDone
                  ? 'rgba(34, 197, 94, 0.15)'
                  : gradients.flame,
              color: popup.isParticipated ? colors.text.muted : isDone ? colors.success : '#fff',
              border:
                popup.isParticipated || isDone ? `1px solid ${colors.border.default}` : 'none',
              boxShadow:
                !popup.isParticipated && !isDone ? '0 4px 20px rgba(255, 107, 91, 0.4)' : 'none',
            }}
          >
            {popup.isParticipated ? (
              '✓ 참여 완료'
            ) : isDone ? (
              '🎉 오픈 확정'
            ) : (
              <>
                <Flame size={18} />
                참여하기
              </>
            )}
          </m.button>

          {/* 자세히 보기 버튼 */}
          <Link
            href={`/popup/${popup.id}`}
            onClick={onClose}
            className="flex items-center justify-center gap-1 px-5 py-4 rounded-xl font-semibold transition-all hover:bg-white/10"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${colors.border.default}`,
              color: colors.text.secondary,
            }}
          >
            <span>상세</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* Quick Link to Full Page */}
        <Link
          href={`/popup/${popup.id}`}
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 mt-4 py-2 text-sm transition-colors hover:text-white"
          style={{ color: colors.text.muted }}
        >
          <ExternalLink size={14} />
          <span>풀 페이지로 보기</span>
        </Link>
      </div>
    </BottomSheet>
  );
}

export const PopupPreviewSheet = memo(PopupPreviewSheetComponent);
export default PopupPreviewSheet;
