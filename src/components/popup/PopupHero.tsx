'use client';

/**
 * PopupHero Component
 *
 * Hero section for popup detail page with parallax effect
 */

import { m, useScroll, useTransform, MotionValue } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';
import { ShareButton } from '@/components/share';
import { CelebrationBanner } from '@/components/effects';
import { RealtimeNotification } from '@/components/realtime';
import { getBrandInitials, type CategoryColor } from '@/hooks/usePopupDetail';
import type { Participant } from '@/types/participant';

interface PopupHeroProps {
  brandName: string;
  popupId: string;
  title: string;
  category: string;
  daysLeft: number;
  isConfirmedOrDone: boolean;
  brandColor: CategoryColor;
  referralCode?: string;
  showCelebration: boolean;
  onCloseCelebration: () => void;
  latestParticipant?: Participant | null;
}

interface UseParallaxReturn {
  heroRef: React.RefObject<HTMLDivElement>;
  y: MotionValue<string>;
  opacity: MotionValue<number>;
  scale: MotionValue<number>;
}

export function useParallax(): UseParallaxReturn {
  const heroRef = useRef<HTMLDivElement>(null!);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  return { heroRef, y, opacity, scale };
}

export function PopupHero({
  brandName,
  popupId,
  title,
  category: _category,
  daysLeft,
  isConfirmedOrDone,
  brandColor,
  referralCode,
  showCelebration,
  onCloseCelebration,
  latestParticipant,
}: PopupHeroProps) {
  const { heroRef, y, opacity, scale } = useParallax();

  return (
    <>
      {/* Realtime Notification */}
      <RealtimeNotification participant={latestParticipant ?? null} />

      {/* Celebration Banner */}
      {showCelebration && <CelebrationBanner brandName={brandName} onClose={onCloseCelebration} />}

      {/* Enhanced Hero Section */}
      <m.div
        ref={heroRef}
        className="relative h-80 overflow-hidden"
        style={{
          background: `linear-gradient(180deg, ${brandColor.primary}15 0%, ${brandColor.secondary}10 50%, #08090a 100%)`,
        }}
      >
        {/* Animated gradient background */}
        <m.div
          className="absolute inset-0"
          style={{
            background: brandColor.gradient,
            opacity: 0.08,
            y,
            scale,
            willChange: 'transform, opacity',
          }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 30% 50%, ${brandColor.primary}40 0%, transparent 50%),
                              radial-gradient(circle at 70% 50%, ${brandColor.secondary}40 0%, transparent 50%)`,
            }}
          />
        </m.div>

        {/* Large Brand Initials with Glassmorphism */}
        <m.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity, willChange: 'opacity' }}
        >
          <m.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Glow effect */}
            <div
              className="absolute inset-0 blur-3xl opacity-20"
              style={{ background: brandColor.gradient }}
            />

            {/* Main initials - DES-116: 성능 최적화 (text-rendering, will-change) */}
            <div
              className="relative text-[120px] md:text-[180px] leading-none font-black tracking-tighter"
              style={{
                background: brandColor.gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                opacity: 0.15,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                textRendering: 'optimizeSpeed', // 성능 최적화
                willChange: 'transform', // GPU 가속
              }}
              aria-hidden="true"
            >
              {getBrandInitials(brandName)}
            </div>
          </m.div>
        </m.div>

        {/* Glassmorphism overlay for depth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(8, 9, 10, 0) 0%, rgba(8, 9, 10, 0.3) 70%, rgba(8, 9, 10, 0.95) 100%)',
          }}
        />

        {/* Back Button - Enhanced */}
        <m.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute top-4 left-4 z-20"
        >
          <Link
            href="/"
            className="w-11 h-11 rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
            aria-label="뒤로가기"
            style={{
              background: 'rgba(18, 19, 20, 0.75)',
              backdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
        </m.div>

        {/* Share Button + Category Badge - Enhanced */}
        <m.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute top-4 right-4 z-20 flex items-center gap-2"
        >
          <ShareButton
            popupId={popupId}
            brandName={brandName}
            title={title}
            referralCode={referralCode}
            variant="icon"
          />
          <div
            className="px-4 py-2 rounded-full text-xs font-bold text-white shadow-lg"
            style={{
              background: brandColor.gradient,
              boxShadow: `0 4px 24px ${brandColor.primary}40`,
            }}
          >
            K-Fashion
          </div>
        </m.div>

        {/* Deadline Badge - Enhanced position and styling */}
        {daysLeft <= 3 && !isConfirmedOrDone && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-6 left-4 right-4 z-20 flex justify-center"
          >
            <div
              className="px-4 py-2.5 rounded-full text-sm font-bold text-white flex items-center gap-2"
              style={{
                background: 'rgba(239, 68, 68, 0.95)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 8px 32px rgba(239, 68, 68, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span>D-{daysLeft} 마감 임박!</span>
              <span className="text-white/80 text-xs ml-1">지금 참여하세요</span>
            </div>
          </m.div>
        )}
      </m.div>
    </>
  );
}
