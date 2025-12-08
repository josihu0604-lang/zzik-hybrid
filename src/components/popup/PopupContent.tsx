'use client';

/**
 * PopupContent Component
 *
 * Content sections for popup detail page (benefits, description, location, stats)
 */

import { ProgressBar } from '@/components/popup';
import { ParticipantAvatars, RealtimeBadge } from '@/components/realtime';
import { type PopupDetailData, type CategoryColor } from '@/hooks/usePopupDetail';
import type { Participant } from '@/types/participant';

interface PopupMainCardProps {
  popup: PopupDetailData;
  participants: number;
  brandColor: CategoryColor;
  realtime: {
    recentParticipants: Participant[];
    isConnected: boolean;
    isDemo: boolean;
  };
  children: React.ReactNode;
}

export function PopupMainCard({
  popup,
  participants,
  brandColor: _brandColor,
  realtime,
  children,
}: PopupMainCardProps) {
  return (
    <div
      className="rounded-2xl p-5 mb-4"
      style={{
        background: 'rgba(18, 19, 20, 0.95)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-linear-elevated flex items-center justify-center text-xl font-bold text-linear-orange">
          {popup.brandName.charAt(0)}
        </div>
        <div>
          <h1 className="text-white font-bold text-lg">{popup.brandName}</h1>
          <p className="text-linear-text-tertiary text-sm">{popup.location}</p>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-white text-xl font-bold mb-4">{popup.title}</h2>

      {/* Progress */}
      <div className="mb-4">
        <ProgressBar current={participants} goal={popup.goalParticipants} size="lg" showLabel />
      </div>

      {/* Realtime Participants */}
      {popup.status === 'funding' && (
        <div className="flex items-center justify-between mb-6">
          <ParticipantAvatars
            participants={realtime.recentParticipants}
            totalCount={participants}
            maxVisible={4}
            size="sm"
          />
          <RealtimeBadge isConnected={realtime.isConnected} isDemo={realtime.isDemo} />
        </div>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-linear-elevated">
          <p className="text-linear-text-tertiary text-xs mb-1">마감일</p>
          <p className="text-white text-sm font-medium">D-{popup.daysLeft}</p>
        </div>
        <div className="p-3 rounded-xl bg-linear-elevated">
          <p className="text-linear-text-tertiary text-xs mb-1">상태</p>
          <p className="text-white text-sm font-medium">
            {popup.status === 'funding'
              ? '펀딩 중'
              : popup.status === 'confirmed'
                ? '오픈 확정'
                : '완료'}
          </p>
        </div>
      </div>

      {/* CTA Section (passed as children) */}
      {children}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface PopupBenefitsProps {}

export function PopupBenefits(_props: PopupBenefitsProps) {
  return (
    <div
      className="rounded-2xl p-5 mb-4"
      style={{
        background: 'rgba(18, 19, 20, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <h3 className="text-white font-bold mb-3">참여 혜택</h3>
      <ul className="space-y-2">
        <li className="flex items-center gap-2 text-linear-text-secondary text-sm">
          <span className="text-flame-500">&#10003;</span>
          오픈 확정 시 우선 방문권
        </li>
        <li className="flex items-center gap-2 text-linear-text-secondary text-sm">
          <span className="text-flame-500">&#10003;</span>
          특별 할인 또는 사은품
        </li>
        <li className="flex items-center gap-2 text-linear-text-secondary text-sm">
          <span className="text-flame-500">&#10003;</span>
          &quot;찍음&quot; 배지 획득 기회
        </li>
      </ul>
    </div>
  );
}

interface PopupDescriptionProps {
  description?: string;
}

export function PopupDescription({ description }: PopupDescriptionProps) {
  if (!description) return null;

  return (
    <div
      className="rounded-2xl p-5 mb-4"
      style={{
        background: 'rgba(18, 19, 20, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <h3 className="text-white font-bold mb-3">상세 정보</h3>
      <p className="text-linear-text-secondary text-sm whitespace-pre-line">{description}</p>
    </div>
  );
}

interface PopupLocationProps {
  location: string;
}

export function PopupLocation({ location }: PopupLocationProps) {
  return (
    <div
      className="rounded-2xl p-5 mb-4"
      style={{
        background: 'rgba(18, 19, 20, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <h3 className="text-white font-bold mb-3">위치</h3>
      <p className="text-linear-text-secondary text-sm mb-3">{location}</p>
      <div className="h-40 rounded-xl bg-linear-elevated flex items-center justify-center">
        <span className="text-linear-text-tertiary text-sm">오픈 확정 시 상세 위치 공개</span>
      </div>
    </div>
  );
}

interface PopupStatsProps {
  participants: number;
  goalParticipants: number;
}

export function PopupStats({ participants, goalParticipants }: PopupStatsProps) {
  return (
    <div
      className="rounded-2xl p-5 mb-24"
      style={{
        background: 'rgba(18, 19, 20, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <h3 className="text-white font-bold mb-3">참여 현황</h3>
      <div className="flex items-center justify-between py-3 border-b border-white/[0.06]">
        <span className="text-linear-text-secondary text-sm">현재 참여자</span>
        <span className="text-white font-semibold">{participants}명</span>
      </div>
      <div className="flex items-center justify-between py-3 border-b border-white/[0.06]">
        <span className="text-linear-text-secondary text-sm">목표</span>
        <span className="text-white font-semibold">{goalParticipants}명</span>
      </div>
      <div className="flex items-center justify-between py-3">
        <span className="text-linear-text-secondary text-sm">남은 인원</span>
        <span className="text-flame-500 font-semibold">
          {Math.max(0, goalParticipants - participants)}명
        </span>
      </div>
    </div>
  );
}
