'use client';

import { useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion';
import Link from 'next/link';
import { MapPin, Calendar, Users, Navigation, X, ExternalLink } from 'lucide-react';
import { colors, liquidGlass, radii, shadows } from '@/lib/design-tokens';
import { getCategoryColor } from '@/lib/color-utils';
import type { PopupLocation } from './MapboxMap';

/**
 * PopupBottomSheet - 마커 클릭 시 표시되는 바텀시트
 *
 * Features:
 * - 스와이프로 닫기 (아래로 드래그)
 * - Liquid Glass 디자인
 * - 상세 정보 + 참여 버튼
 * - Framer Motion 애니메이션
 */

interface PopupBottomSheetProps {
  popup: PopupLocation | null;
  onClose: () => void;
  userLocation?: { lat: number; lng: number } | null;
  onNavigate?: () => void;
}

// 거리 계산 (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // 지구 반지름 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

export function PopupBottomSheet({
  popup,
  onClose,
  userLocation,
  onNavigate,
}: PopupBottomSheetProps) {
  const dragControls = useDragControls();
  const sheetRef = useRef<HTMLDivElement>(null);

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (popup) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [popup, onClose]);

  // 드래그 종료 시 닫기 판단
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      // 아래로 100px 이상 드래그하거나 빠르게 스와이프하면 닫기
      if (info.offset.y > 100 || info.velocity.y > 500) {
        onClose();
      }
    },
    [onClose]
  );

  // 거리 계산
  const distance =
    popup && userLocation
      ? calculateDistance(userLocation.lat, userLocation.lng, popup.lat, popup.lng)
      : null;

  if (!popup) return null;

  const categoryColor = getCategoryColor(popup.category);
  const progressPercent = popup.progress ?? 0;
  const isConfirmed = popup.isConfirmed || progressPercent >= 100;

  return (
    <AnimatePresence>
      {popup && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0, 0, 0, 0.4)' }}
            aria-hidden="true"
          />

          {/* Bottom Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-hidden"
            style={{
              ...liquidGlass.standard,
              borderRadius: `${radii['2xl']} ${radii['2xl']} 0 0`,
              boxShadow: shadows.xl,
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="popup-sheet-title"
          >
            {/* Drag Handle */}
            <div
              className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: colors.border.emphasis }}
              />
            </div>

            {/* Content */}
            <div className="px-5 pb-8 space-y-4 overflow-y-auto max-h-[calc(80vh-60px)]">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  {/* Category Icon */}
                  <motion.div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{
                      background: categoryColor,
                      boxShadow: `0 4px 16px ${categoryColor}50`,
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                  >
                    {popup.brandName.charAt(0)}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: `${categoryColor}20`,
                          color: categoryColor,
                        }}
                      >
                        {popup.category}
                      </span>
                      {isConfirmed && (
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            background: `${colors.success}20`,
                            color: colors.success,
                          }}
                        >
                          OPEN
                        </span>
                      )}
                    </div>
                    <p className="text-linear-text-tertiary text-sm font-medium">
                      {popup.brandName}
                    </p>
                    <h2
                      id="popup-sheet-title"
                      className="text-white font-bold text-lg leading-tight"
                    >
                      {popup.title}
                    </h2>
                  </div>
                </div>

                {/* Close Button */}
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="닫기"
                >
                  <X size={20} className="text-linear-text-tertiary" />
                </motion.button>
              </div>

              {/* Progress Bar (펀딩 진행률) */}
              {!isConfirmed && progressPercent > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-linear-text-secondary">펀딩 진행률</span>
                    <span className="font-bold" style={{ color: categoryColor }}>
                      {progressPercent}%
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: colors.border.subtle }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: categoryColor }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Location */}
                <div className="p-3 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={14} style={{ color: categoryColor }} />
                    <span className="text-xs text-linear-text-tertiary">위치</span>
                  </div>
                  <p className="text-white text-sm font-medium">{popup.location}</p>
                  {distance !== null && (
                    <p className="text-linear-text-secondary text-xs mt-0.5">
                      {formatDistance(distance)}
                    </p>
                  )}
                </div>

                {/* Dates */}
                <div className="p-3 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={14} style={{ color: categoryColor }} />
                    <span className="text-xs text-linear-text-tertiary">기간</span>
                  </div>
                  <p className="text-white text-sm font-medium">{popup.dates}</p>
                </div>
              </div>

              {/* Address */}
              <div
                className="p-3 rounded-xl flex items-center gap-3"
                style={{ background: 'rgba(255, 255, 255, 0.05)' }}
              >
                <MapPin size={16} className="text-linear-text-tertiary flex-shrink-0" />
                <p className="text-linear-text-secondary text-sm flex-1">{popup.address}</p>
                {onNavigate && (
                  <motion.button
                    onClick={onNavigate}
                    className="p-2 rounded-lg"
                    style={{ background: `${categoryColor}20` }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="길찾기"
                  >
                    <Navigation size={16} style={{ color: categoryColor }} />
                  </motion.button>
                )}
              </div>

              {/* Participants */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={16} style={{ color: categoryColor }} />
                  <span className="text-linear-text-secondary text-sm">
                    <span className="text-white font-bold">{popup.totalParticipants}</span>명 참여
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-3 pt-2">
                <Link href={`/popup/${popup.id}`} className="flex-1">
                  <motion.div
                    className="w-full py-4 rounded-xl text-center font-bold text-white"
                    style={{
                      background: categoryColor,
                      boxShadow: `0 4px 16px ${categoryColor}40`,
                    }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: `0 6px 24px ${categoryColor}60`,
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isConfirmed ? '상세보기' : '참여하기'}
                  </motion.div>
                </Link>

                {isConfirmed && (
                  <motion.a
                    href={`https://map.kakao.com/link/to/${popup.title},${popup.lat},${popup.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-4 rounded-xl flex items-center justify-center"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: `1px solid ${colors.border.default}`,
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="카카오맵에서 길찾기"
                  >
                    <ExternalLink size={20} className="text-white" />
                  </motion.a>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default PopupBottomSheet;
