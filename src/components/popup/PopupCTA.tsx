'use client';

/**
 * PopupCTA Component
 *
 * Call-to-action section for popup detail page
 * Handles both funding participation and confirmed popup check-in
 */

import { m } from 'framer-motion';
import { CheckinButton } from '@/components/checkin';
import { ShareButton } from '@/components/share';
import { type PopupDetailData, type CategoryColor } from '@/hooks/usePopupDetail';
import { colors } from '@/lib/design-tokens';

interface PopupFundingCTAProps {
  popup: PopupDetailData;
  brandColor: CategoryColor;
  isParticipated: boolean;
  participants: number;
  referralCode?: string;
  onParticipate: () => void;
}

export function PopupFundingCTA({
  popup,
  brandColor,
  isParticipated,
  participants,
  referralCode,
  onParticipate,
}: PopupFundingCTAProps) {
  return (
    <>
      <m.button
        onClick={onParticipate}
        disabled={isParticipated}
        whileHover={{ scale: isParticipated ? 1 : 1.02 }}
        whileTap={{ scale: isParticipated ? 1 : 0.98 }}
        className="relative w-full py-5 rounded-2xl font-bold text-lg transition-all overflow-hidden"
        aria-label={isParticipated ? '참여 완료됨' : `${popup.title} 팝업 펀딩에 참여하기`}
        aria-pressed={isParticipated}
        aria-disabled={isParticipated}
        style={{
          background: isParticipated ? 'rgba(255, 255, 255, 0.08)' : brandColor.gradient,
          color: isParticipated ? '#a8a8a8' : '#ffffff',
          boxShadow: isParticipated
            ? 'none'
            : `0 8px 32px ${brandColor.primary}50, 0 4px 16px ${brandColor.primary}30, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
          border: isParticipated
            ? '1px solid rgba(255, 255, 255, 0.05)'
            : '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        {/* Animated gradient overlay */}
        {!isParticipated && (
          <m.div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, transparent, ${brandColor.primary}30, transparent)`,
            }}
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}

        <span className="relative z-10 flex items-center justify-center gap-2">
          {isParticipated ? (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              참여 완료! 오픈되면 알려드릴게요
            </>
          ) : (
            <>
              참여하기
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </span>
      </m.button>

      {isParticipated && (
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-3"
        >
          <p className="text-center text-linear-text-tertiary text-sm">
            {participants}번째 참여자예요!
          </p>
          <div className="flex justify-center">
            <ShareButton
              popupId={popup.id}
              brandName={popup.brandName}
              title={popup.title}
              referralCode={referralCode}
              variant="button"
            />
          </div>
        </m.div>
      )}
    </>
  );
}

interface PopupConfirmedCTAProps {
  popup: PopupDetailData;
}

export function PopupConfirmedCTA({ popup }: PopupConfirmedCTAProps) {
  return (
    <div className="space-y-4">
      <div
        className="text-center py-3 px-4 rounded-xl"
        style={{
          background: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
        }}
      >
        <p className="text-sm font-medium" style={{ color: colors.success }}>
          오픈 확정! 방문 인증을 완료하세요
        </p>
      </div>

      <CheckinButton popupId={popup.id} brandName={popup.brandName} status={popup.status} />
    </div>
  );
}

interface PopupCTASectionProps {
  popup: PopupDetailData;
  brandColor: CategoryColor;
  isParticipated: boolean;
  participants: number;
  referralCode?: string;
  onParticipate: () => void;
}

export function PopupCTASection({
  popup,
  brandColor,
  isParticipated,
  participants,
  referralCode,
  onParticipate,
}: PopupCTASectionProps) {
  if (popup.status === 'funding') {
    return (
      <PopupFundingCTA
        popup={popup}
        brandColor={brandColor}
        isParticipated={isParticipated}
        participants={participants}
        referralCode={referralCode}
        onParticipate={onParticipate}
      />
    );
  }

  return <PopupConfirmedCTA popup={popup} />;
}
