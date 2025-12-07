'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Users, MapPin, Award, CheckCircle } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { ProgressBar } from '@/components/popup';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorBoundary } from '@/components/error';

/**
 * My Page - 내 참여 내역 + 배지 + 리더 대시보드 티저
 */

interface UserData {
  user: {
    id: string;
    name: string;
    email: string | null;
    profileImage: string | null;
    createdAt: string;
  };
  stats: {
    participated: number;
    visited: number;
    badges: number;
  };
  participations?: Array<{
    id: string;
    popupId: string;
    brandName: string;
    title: string;
    status: string;
    currentParticipants: number;
    goalParticipants: number;
    participatedAt: string;
    hasCheckedIn: boolean;
    checkinPassed: boolean;
  }>;
  recentCheckins?: Array<{
    id: string;
    popupId: string;
    brandName: string;
    title: string;
    totalScore: number;
    gpsScore: number;
    qrScore: number;
    passed: boolean;
    verifiedAt: string;
  }>;
}

// Format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}년 ${month}월`;
}

function formatCheckinDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

// ============================================================================
// EXTRACTED INLINE STYLES - Performance optimization
// ============================================================================

// Glass card base styles
const GLASS_CARD_STYLE = {
  background: 'rgba(18, 19, 20, 0.8)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
} as const;

const GLASS_CARD_LIGHT_STYLE = {
  background: 'rgba(18, 19, 20, 0.8)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
} as const;

// Profile image styles
const PROFILE_IMAGE_STYLE = {
  border: '2px solid rgba(255, 107, 91, 0.5)',
  boxShadow: '0 4px 16px rgba(255, 107, 91, 0.3)',
} as const;

const PROFILE_AVATAR_STYLE = {
  background: 'linear-gradient(135deg, #FF6B5B 0%, #CC4A3A 100%)',
  boxShadow: '0 4px 16px rgba(255, 107, 91, 0.3)',
} as const;

// Stats card styles
const STATS_CARD_FLAME_STYLE = {
  background: 'rgba(26, 28, 31, 0.8)',
  border: '1px solid rgba(255, 107, 91, 0.2)',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
} as const;

const STATS_CARD_GREEN_STYLE = {
  background: 'rgba(26, 28, 31, 0.8)',
  border: '1px solid rgba(34, 197, 94, 0.2)',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
} as const;

const STATS_CARD_YELLOW_STYLE = {
  background: 'rgba(26, 28, 31, 0.8)',
  border: '1px solid rgba(255, 217, 61, 0.3)',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
} as const;

// Badge styles
const BADGE_CARD_STYLE = {
  background: 'rgba(18, 19, 20, 0.8)',
  border: '1px solid rgba(255, 217, 61, 0.3)',
  boxShadow: '0 4px 16px rgba(255, 217, 61, 0.1)',
} as const;

// Reserved for future badge icon styling
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _BADGE_ICON_STYLE = {
  background: 'linear-gradient(135deg, #FFD93D 0%, #FF6B5B 100%)',
  boxShadow: '0 4px 12px rgba(255, 217, 61, 0.4)',
} as const;

// Leader CTA styles
const LEADER_CTA_STYLE = {
  background: 'linear-gradient(135deg, rgba(255, 217, 61, 0.15) 0%, rgba(255, 107, 91, 0.1) 100%)',
  border: '1px solid rgba(255, 217, 61, 0.4)',
  boxShadow: '0 4px 20px rgba(255, 217, 61, 0.15)',
} as const;

const LEADER_CTA_GLOW_STYLE = {
  background: 'radial-gradient(circle at 20% 50%, rgba(255, 217, 61, 0.3) 0%, transparent 50%)',
} as const;

const LEADER_CTA_BUTTON_STYLE = {
  background: 'linear-gradient(135deg, #FFD93D 0%, #FFC700 100%)',
  color: 'black',
  boxShadow: '0 4px 16px rgba(255, 217, 61, 0.3)',
} as const;

// Participation card styles
const PARTICIPATION_CARD_STYLE = {
  background: 'rgba(18, 19, 20, 0.8)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
} as const;

const EMPTY_STATE_STYLE = {
  background: 'rgba(18, 19, 20, 0.6)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
} as const;

const EMPTY_STATE_BUTTON_STYLE = {
  background: 'rgba(255, 107, 91, 0.2)',
  color: '#FF6B5B',
  border: '1px solid rgba(255, 107, 91, 0.3)',
} as const;

// Link styles
const LINK_CARD_STYLE = {
  background: 'rgba(18, 19, 20, 0.6)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
} as const;

// Checkin badge style
const CHECKIN_BADGE_STYLE = {
  background: 'rgba(34, 197, 94, 0.2)',
  border: '1px solid rgba(34, 197, 94, 0.3)',
} as const;

// Color constants
const FLAME_COLOR = '#FF6B5B';
const GREEN_COLOR = '#22c55e';
const YELLOW_COLOR = '#FFD93D';

// Helper function to get status badge style
function getStatusBadgeStyle(status: string) {
  const baseStyle = {
    background:
      status === 'funding'
        ? 'rgba(255, 107, 91, 0.2)'
        : status === 'confirmed'
          ? 'rgba(34, 197, 94, 0.2)'
          : 'rgba(255, 255, 255, 0.1)',
    color: status === 'funding' ? FLAME_COLOR : status === 'confirmed' ? GREEN_COLOR : '#a8a8a8',
    border: `1px solid ${
      status === 'funding'
        ? 'rgba(255, 107, 91, 0.3)'
        : status === 'confirmed'
          ? 'rgba(34, 197, 94, 0.3)'
          : 'rgba(255, 255, 255, 0.15)'
    }`,
  };
  return baseStyle;
}

function MePageContent() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized fetch function
  const fetchUserData = useCallback(async () => {
    try {
      const res = await fetch('/api/me?includeParticipations=true&includeCheckins=true');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch user data');
      }

      setUserData(data.data);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Memoized derived data
  const { user, stats, participations, recentCheckins } = useMemo(
    () => ({
      user: userData?.user,
      stats: userData?.stats,
      participations: userData?.participations ?? [],
      recentCheckins: userData?.recentCheckins ?? [],
    }),
    [userData]
  );

  // Memoized formatted date
  const formattedJoinDate = useMemo(
    () => (user?.createdAt ? formatDate(user.createdAt) : ''),
    [user?.createdAt]
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-space-950 flex items-center justify-center">
        <LoadingSpinner size={32} accentColor="#FF6B5B" />
      </div>
    );
  }

  // Error or no user state (show login prompt)
  if (error || !userData) {
    return (
      <div className="min-h-screen bg-space-950 pt-safe pb-safe">
        <header className="px-5 py-6">
          <div className="max-w-lg mx-auto">
            <h1 className="text-white font-black text-2xl tracking-tight">마이</h1>
          </div>
        </header>

        <main className="px-5 pb-24">
          <div className="max-w-lg mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-8 text-center"
              style={GLASS_CARD_LIGHT_STYLE}
            >
              <Award size={48} className="mx-auto mb-4" style={{ color: FLAME_COLOR }} />
              <h2 className="text-white font-bold text-xl mb-2">로그인이 필요해요</h2>
              <p className="text-linear-text-tertiary text-sm mb-6">
                참여 내역과 배지를 확인하려면 로그인하세요
              </p>
              <Link
                href="/login"
                className="inline-block px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
                style={PROFILE_AVATAR_STYLE}
              >
                로그인하기
              </Link>
            </motion.div>
          </div>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-950 pt-safe pb-safe">
      {/* Header */}
      <header className="px-5 py-6" role="banner">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-white font-black text-2xl tracking-tight">마이</h1>
          <Link
            href="/profile"
            className="text-linear-text-tertiary text-sm hover:text-white transition-colors"
            aria-label="프로필 설정으로 이동"
          >
            설정
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="px-5 pb-24" role="main">
        <div className="max-w-lg mx-auto">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className="rounded-2xl p-6 mb-6 transition-all duration-300"
            style={GLASS_CARD_STYLE}
            role="region"
            aria-labelledby="profile-heading"
          >
            <div className="flex items-center gap-4 mb-6">
              {user?.profileImage ? (
                <Image
                  src={user.profileImage}
                  alt={user.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover"
                  style={PROFILE_IMAGE_STYLE}
                  priority
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                  style={PROFILE_AVATAR_STYLE}
                  aria-hidden="true"
                >
                  {user?.name.charAt(0)}
                </div>
              )}
              <div>
                <h2 id="profile-heading" className="text-white font-bold text-xl mb-0.5">
                  {user?.name}
                </h2>
                <p className="text-linear-text-tertiary text-sm">{formattedJoinDate}부터 함께</p>
                {/* DES-042: 스트릭 카운터 */}
                {stats && stats.participated > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-flame-500 text-xs">🔥</span>
                    <span className="text-flame-500 text-xs font-bold">
                      {Math.min(stats.participated, 7)}일 연속 참여
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3" role="list" aria-label="내 활동 통계">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                className="text-center p-4 rounded-xl transition-all duration-300"
                style={STATS_CARD_FLAME_STYLE}
                role="listitem"
              >
                <Users
                  size={18}
                  className="mx-auto mb-2"
                  style={{ color: FLAME_COLOR }}
                  aria-hidden="true"
                />
                <p
                  className="text-3xl font-black mb-1"
                  style={{ color: FLAME_COLOR }}
                  aria-label={`참여 ${stats?.participated}개`}
                >
                  {stats?.participated}
                </p>
                <p className="text-xs text-linear-text-tertiary font-medium" aria-hidden="true">
                  참여
                </p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                className="text-center p-4 rounded-xl transition-all duration-300"
                style={STATS_CARD_GREEN_STYLE}
                role="listitem"
              >
                <MapPin
                  size={18}
                  className="mx-auto mb-2"
                  style={{ color: GREEN_COLOR }}
                  aria-hidden="true"
                />
                <p
                  className="text-3xl font-black mb-1"
                  style={{ color: GREEN_COLOR }}
                  aria-label={`방문 ${stats?.visited}개`}
                >
                  {stats?.visited}
                </p>
                <p className="text-xs text-linear-text-tertiary font-medium" aria-hidden="true">
                  방문
                </p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                className="text-center p-4 rounded-xl transition-all duration-300"
                style={STATS_CARD_YELLOW_STYLE}
                role="listitem"
              >
                <Award
                  size={18}
                  className="mx-auto mb-2"
                  style={{ color: YELLOW_COLOR }}
                  aria-hidden="true"
                />
                <p
                  className="text-3xl font-black mb-1"
                  style={{ color: YELLOW_COLOR }}
                  aria-label={`배지 ${stats?.badges}개`}
                >
                  {stats?.badges}
                </p>
                <p className="text-xs text-linear-text-tertiary font-medium" aria-hidden="true">
                  배지
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Badges Section */}
          <AnimatePresence>
            {recentCheckins.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
                aria-labelledby="badges-heading"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 id="badges-heading" className="text-white font-black text-lg">
                    획득한 배지
                  </h3>
                  <span className="text-linear-text-tertiary text-sm font-medium">
                    {recentCheckins.length}개
                  </span>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
                  {recentCheckins.map((checkin, index) => {
                    // DES-041: 배지 티어 시각화
                    const tier =
                      checkin.totalScore >= 90
                        ? 'legendary'
                        : checkin.totalScore >= 80
                          ? 'excellent'
                          : 'standard';
                    const tierStyles = {
                      legendary: {
                        border: '2px solid #FFD93D',
                        boxShadow: '0 4px 16px rgba(255, 217, 61, 0.4)',
                        gradient: 'linear-gradient(135deg, #FFD93D 0%, #FF6B5B 100%)',
                      },
                      excellent: {
                        border: '2px solid #22c55e',
                        boxShadow: '0 4px 16px rgba(34, 197, 94, 0.3)',
                        gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      },
                      standard: {
                        border: '1px solid rgba(255, 217, 61, 0.3)',
                        boxShadow: '0 4px 16px rgba(255, 217, 61, 0.1)',
                        gradient: 'linear-gradient(135deg, #FFD93D 0%, #FF6B5B 100%)',
                      },
                    };
                    return (
                      <motion.div
                        key={checkin.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15 + index * 0.05 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="flex-shrink-0 w-28 rounded-xl p-3 text-center transition-all duration-300"
                        style={{
                          ...BADGE_CARD_STYLE,
                          ...tierStyles[tier],
                        }}
                      >
                        <div
                          className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center"
                          style={{
                            background: tierStyles[tier].gradient,
                            boxShadow: tierStyles[tier].boxShadow,
                          }}
                        >
                          <CheckCircle size={24} className="text-black" />
                        </div>
                        <p className="text-white font-bold text-xs truncate mb-0.5">
                          {checkin.brandName}
                        </p>
                        <p className="text-linear-text-tertiary text-micro">
                          {formatCheckinDate(checkin.verifiedAt)}
                        </p>
                        <div className="mt-1 flex items-center justify-center gap-1">
                          <span
                            className="text-micro font-bold"
                            style={{
                              color:
                                tier === 'legendary'
                                  ? YELLOW_COLOR
                                  : tier === 'excellent'
                                    ? GREEN_COLOR
                                    : FLAME_COLOR,
                            }}
                          >
                            {checkin.totalScore}점
                          </span>
                        </div>
                        {tier === 'legendary' && (
                          <p
                            className="text-micro font-bold mt-0.5"
                            style={{ color: YELLOW_COLOR }}
                          >
                            LEGENDARY
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Leader CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl p-6 mb-6 relative overflow-hidden"
            style={LEADER_CTA_STYLE}
            role="complementary"
            aria-labelledby="leader-cta-heading"
          >
            {/* Glow effect */}
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={LEADER_CTA_GLOW_STYLE}
              aria-hidden="true"
            />

            <div className="relative flex items-center justify-between">
              <div>
                <h3
                  id="leader-cta-heading"
                  className="font-black text-lg mb-1"
                  style={{ color: YELLOW_COLOR }}
                >
                  리더가 되어보세요
                </h3>
                <p className="text-linear-text-secondary text-sm">
                  팔로워를 초대하고 수익을 받으세요
                </p>
              </div>
              <Link
                href="/leader"
                className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105"
                style={LEADER_CTA_BUTTON_STYLE}
                aria-label="리더 프로그램 시작하기"
              >
                시작하기
              </Link>
            </div>
          </motion.div>

          {/* Participations */}
          <section className="mb-6" aria-labelledby="participations-heading">
            <div className="flex items-center justify-between mb-4">
              <h3 id="participations-heading" className="text-white font-black text-lg">
                내 참여
              </h3>
              <span
                className="text-linear-text-tertiary text-sm font-medium"
                aria-label={`총 ${participations.length}개`}
              >
                {participations.length}개
              </span>
            </div>

            {participations.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl p-8 text-center"
                style={EMPTY_STATE_STYLE}
              >
                <Users size={32} className="mx-auto mb-3 text-linear-text-tertiary" />
                <p className="text-linear-text-tertiary text-sm mb-3">아직 참여한 팝업이 없어요</p>
                <Link
                  href="/"
                  className="inline-block px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105"
                  style={EMPTY_STATE_BUTTON_STYLE}
                >
                  팝업 둘러보기
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-3" role="list" aria-label="참여한 팝업 목록">
                {participations.map((p, index) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{
                      x: 4,
                      scale: 1.01,
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                    }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="rounded-xl p-4 transition-all duration-300"
                    style={PARTICIPATION_CARD_STYLE}
                    role="listitem"
                    aria-labelledby={`participation-title-${p.id}`}
                  >
                    <Link href={`/popup/${p.popupId}`} className="block">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-linear-text-tertiary text-xs mb-1 font-medium">
                            {p.brandName}
                          </p>
                          <p
                            id={`participation-title-${p.id}`}
                            className="text-white font-semibold text-base truncate"
                          >
                            {p.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          {p.checkinPassed && (
                            <span
                              className="p-1 rounded-full"
                              style={CHECKIN_BADGE_STYLE}
                              title="체크인 완료"
                            >
                              <CheckCircle size={14} style={{ color: GREEN_COLOR }} />
                            </span>
                          )}
                          <span
                            className="px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300"
                            style={getStatusBadgeStyle(p.status)}
                            aria-label={
                              p.status === 'funding'
                                ? '펀딩중 상태'
                                : p.status === 'confirmed'
                                  ? '오픈확정 상태'
                                  : '완료됨 상태'
                            }
                          >
                            {p.status === 'funding'
                              ? '펀딩중'
                              : p.status === 'confirmed'
                                ? '오픈확정'
                                : '완료'}
                          </span>
                        </div>
                      </div>

                      {(p.status === 'funding' || p.status === 'confirmed') && (
                        <div
                          role="progressbar"
                          aria-valuenow={p.currentParticipants}
                          aria-valuemin={0}
                          aria-valuemax={p.goalParticipants}
                          aria-label={`펀딩 진행률 ${Math.round((p.currentParticipants / p.goalParticipants) * 100)}%`}
                        >
                          <ProgressBar
                            current={p.currentParticipants}
                            goal={p.goalParticipants}
                            size="sm"
                          />
                        </div>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Quick Links */}
          <nav className="space-y-2" aria-label="설정 및 정보">
            <Link
              href="/profile"
              className="flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-[1.01]"
              style={LINK_CARD_STYLE}
              aria-label="프로필 편집 페이지로 이동"
            >
              <span className="text-white text-sm font-medium">프로필 편집</span>
              <span className="text-linear-text-tertiary" aria-hidden="true">
                →
              </span>
            </Link>
            <Link
              href="/terms"
              className="flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-[1.01]"
              style={LINK_CARD_STYLE}
              aria-label="이용약관 페이지로 이동"
            >
              <span className="text-white text-sm font-medium">이용약관</span>
              <span className="text-linear-text-tertiary" aria-hidden="true">
                →
              </span>
            </Link>
            <Link
              href="/privacy"
              className="flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-[1.01]"
              style={LINK_CARD_STYLE}
              aria-label="개인정보처리방침 페이지로 이동"
            >
              <span className="text-white text-sm font-medium">개인정보처리방침</span>
              <span className="text-linear-text-tertiary" aria-hidden="true">
                →
              </span>
            </Link>
          </nav>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

export default function MePage() {
  return (
    <ErrorBoundary
      onError={(error) => {
        console.error('Me page error:', error);
      }}
    >
      <MePageContent />
    </ErrorBoundary>
  );
}
