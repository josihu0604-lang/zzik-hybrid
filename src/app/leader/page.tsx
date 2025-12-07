'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Crown, Settings, LogIn, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/Toast';
import {
  LeaderStats,
  TierProgress,
  ReferralCard,
  CampaignList,
  RegisterCTA,
  EarningsChart,
  PayoutSummary,
  PayoutRequest,
  QuickActions,
  WeeklyGoal,
  ReferralList,
  PayoutHistory,
  generateDemoEarningsData,
  generateDemo30DaysData,
  generateDemoReferrals,
  generateDemoPayouts,
  DEMO_PAYOUT_DATA,
  DEMO_WEEKLY_GOAL,
} from '@/components/leader';
import { type LeaderTier, type LeaderStats as LeaderStatsType } from '@/lib/leader';
import { useLeaderDashboard } from '@/hooks/useLeaderDashboard';
import { LeaderSkeleton } from '@/components/ui/LoadingSpinner';
import { ErrorBoundary } from '@/components/error';
import { Button, IconButton } from '@/components/ui/Button';
import { colors } from '@/lib/design-tokens';

/**
 * LeaderPage - 리더 대시보드 페이지
 *
 * 상태 분기:
 * 1. 로딩 중 -> 스켈레톤
 * 2. 미로그인 -> 로그인 유도
 * 3. 미등록 -> RegisterCTA
 * 4. 등록됨 -> 대시보드
 */

// Types
interface LeaderData {
  isLeader: boolean;
  referralCode: string;
  referralLink: string;
  tier: LeaderTier;
  stats: LeaderStatsType;
  campaigns: Campaign[];
}

interface Campaign {
  id: string;
  popupId: string;
  brandName: string;
  title: string;
  referrals: number;
  checkins: number;
  earnings: number;
  status: 'active' | 'completed' | 'pending';
}

// Tab type for dashboard sections
type DashboardTab = 'overview' | 'referrals' | 'payouts';

// Demo leader data for testing (reserved for future use)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _DEMO_LEADER_DATA: LeaderData = {
  isLeader: true,
  referralCode: 'ZK8X4M2P',
  referralLink: 'zzik.kr/r/ZK8X4M2P',
  tier: 'Silver',
  stats: {
    tier: 'Silver',
    totalEarnings: 125000,
    thisMonthEarnings: 42500,
    totalReferrals: 67,
    thisMonthReferrals: 23,
    totalCheckins: 45,
    thisMonthCheckins: 18,
    commissionRate: 12,
  },
  campaigns: [
    {
      id: '1',
      popupId: 'popup-1',
      brandName: '성수 카페',
      title: '겨울 시즌 팝업 스토어',
      referrals: 28,
      checkins: 19,
      earnings: 22800,
      status: 'active',
    },
    {
      id: '2',
      popupId: 'popup-2',
      brandName: '뷰티 브랜드',
      title: '신제품 체험존',
      referrals: 15,
      checkins: 12,
      earnings: 14400,
      status: 'active',
    },
    {
      id: '3',
      popupId: 'popup-3',
      brandName: '패션 편집샵',
      title: '한정판 컬렉션 전시',
      referrals: 24,
      checkins: 14,
      earnings: 16800,
      status: 'completed',
    },
  ],
};

// Login CTA Component
function LoginCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
    >
      <motion.div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{
          background:
            'linear-gradient(135deg, rgba(255, 217, 61, 0.2) 0%, rgba(255, 107, 91, 0.2) 100%)',
          border: '1px solid rgba(255, 217, 61, 0.3)',
        }}
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 4px 24px rgba(255, 217, 61, 0.2)',
            '0 8px 32px rgba(255, 217, 61, 0.3)',
            '0 4px 24px rgba(255, 217, 61, 0.2)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Crown size={40} style={{ color: colors.spark[400] }} />
      </motion.div>

      <h2 className="text-white text-xl font-black mb-2">리더 대시보드</h2>
      <p className="text-linear-text-tertiary text-sm mb-8 max-w-xs">
        로그인하면 리더로 등록하고
        <br />
        추천 수익을 받을 수 있어요
      </p>

      <Link href="/login?redirect=/leader">
        <Button
          variant="primary"
          size="lg"
          leftIcon={<LogIn size={20} />}
          style={{
            background: 'linear-gradient(135deg, #FFD93D 0%, #FFC700 100%)',
            color: 'black',
            boxShadow: '0 4px 24px rgba(255, 217, 61, 0.4)',
          }}
        >
          로그인하기
        </Button>
      </Link>
    </motion.div>
  );
}

// Tab Navigation Component
function TabNavigation({
  activeTab,
  onTabChange,
}: {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}) {
  const tabs: { id: DashboardTab; label: string }[] = [
    { id: 'overview', label: '개요' },
    { id: 'referrals', label: '리퍼럴' },
    { id: 'payouts', label: '정산' },
  ];

  return (
    <div
      className="flex items-center gap-1 p-1 rounded-xl"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: `1px solid ${colors.border.subtle}`,
      }}
    >
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: activeTab === tab.id ? colors.spark[500] : 'transparent',
            color: activeTab === tab.id ? 'black' : colors.text.secondary,
          }}
        >
          {tab.label}
        </motion.button>
      ))}
    </div>
  );
}

function LeaderPageContent() {
  const { user, loading: authLoading, isDemo } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // Use the new dashboard hook
  const { data: leaderData, isLoading, isRegistering, refresh, register } = useLeaderDashboard();

  // Generate demo data
  const demoEarnings7D = generateDemoEarningsData(7);
  const demoEarnings30D = generateDemo30DaysData();
  const demoReferrals = generateDemoReferrals(12);
  const demoPayouts = generateDemoPayouts();

  // Handle registration
  const handleRegister = async () => {
    const success = await register();
    if (success) {
      toast.celebrate('리더로 등록되었습니다! 이제 추천 활동을 시작하세요.');
    } else {
      toast.error('등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    await refresh();
    toast.success('데이터가 새로고침되었습니다.');
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <main className="min-h-screen bg-linear-bg">
        {/* Header */}
        <header className="sticky top-0 z-50 px-4 py-3 backdrop-blur-xl bg-linear-bg/80 border-b border-linear-border">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 -ml-2">
                <ArrowLeft size={20} className="text-linear-text-secondary" />
              </Link>
              <h1 className="text-lg font-bold text-white">리더 대시보드</h1>
            </div>
          </div>
        </header>

        <div className="max-w-lg mx-auto px-4 py-6">
          <LeaderSkeleton />
        </div>
      </main>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <main className="min-h-screen bg-linear-bg">
        <header className="sticky top-0 z-50 px-4 py-3 backdrop-blur-xl bg-linear-bg/80 border-b border-linear-border">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 -ml-2">
                <ArrowLeft size={20} className="text-linear-text-secondary" />
              </Link>
              <h1 className="text-lg font-bold text-white">리더 대시보드</h1>
            </div>
          </div>
        </header>

        <LoginCTA />
      </main>
    );
  }

  // Not registered as leader
  if (!leaderData || !leaderData.isLeader) {
    return (
      <main className="min-h-screen bg-linear-bg">
        <header className="sticky top-0 z-50 px-4 py-3 backdrop-blur-xl bg-linear-bg/80 border-b border-linear-border">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 -ml-2">
                <ArrowLeft size={20} className="text-linear-text-secondary" />
              </Link>
              <h1 className="text-lg font-bold text-white">리더 대시보드</h1>
            </div>
          </div>
        </header>

        <div className="max-w-lg mx-auto px-4 py-6">
          <RegisterCTA onRegister={handleRegister} isLoading={isRegistering} />
        </div>
      </main>
    );
  }

  // Leader Dashboard
  return (
    <main className="min-h-screen bg-linear-bg pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 px-4 py-3 backdrop-blur-xl bg-linear-bg/80 border-b border-linear-border">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2">
              <ArrowLeft size={20} className="text-linear-text-secondary" />
            </Link>
            <div className="flex items-center gap-2">
              <Crown size={18} style={{ color: colors.spark[400] }} />
              <h1 className="text-lg font-bold text-white">리더 대시보드</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <IconButton
              icon={<RefreshCw size={18} className="text-linear-text-secondary" />}
              onClick={handleRefresh}
              variant="ghost"
              size="sm"
              aria-label="새로고침"
            />
            <IconButton
              icon={<Settings size={20} className="text-linear-text-secondary" />}
              variant="ghost"
              size="sm"
              aria-label="설정"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <AnimatePresence mode="wait">
          {/* Demo Badge */}
          {isDemo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="px-3 py-2 rounded-lg text-center text-xs"
              style={{
                background: 'rgba(168, 85, 247, 0.2)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                color: '#A855F7',
              }}
            >
              데모 모드 - 실제 데이터와 다를 수 있습니다
            </motion.div>
          )}

          {/* Tab Navigation */}
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Tier Progress */}
              <TierProgress
                currentTier={leaderData.tier}
                totalReferrals={leaderData.stats.totalReferrals}
              />

              {/* Weekly Goal */}
              <WeeklyGoal data={DEMO_WEEKLY_GOAL} />

              {/* Stats Grid */}
              <LeaderStats
                totalEarnings={leaderData.stats.totalEarnings}
                thisMonthEarnings={leaderData.stats.thisMonthEarnings}
                totalReferrals={leaderData.stats.totalReferrals}
                thisMonthReferrals={leaderData.stats.thisMonthReferrals}
                totalCheckins={leaderData.stats.totalCheckins}
                commissionRate={leaderData.stats.commissionRate}
              />

              {/* Earnings Chart - 7일/30일 수익 추이 */}
              <EarningsChart data={demoEarnings7D} data30Days={demoEarnings30D} />

              {/* Quick Actions - 빠른 공유 */}
              <QuickActions
                referralCode={leaderData.referralCode}
                referralLink={leaderData.referralLink}
              />

              {/* Payout Summary - 정산 현황 */}
              <PayoutSummary data={DEMO_PAYOUT_DATA} />

              {/* Referral Card */}
              <ReferralCard
                referralCode={leaderData.referralCode}
                referralLink={leaderData.referralLink}
              />

              {/* Campaigns Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-white font-bold">내 캠페인</h2>
                  <span className="text-linear-text-tertiary text-sm">
                    {leaderData.campaigns.length}개
                  </span>
                </div>
                <CampaignList campaigns={leaderData.campaigns} />
              </div>
            </motion.div>
          )}

          {/* Referrals Tab */}
          {activeTab === 'referrals' && (
            <motion.div
              key="referrals"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Quick Stats */}
              <div
                className="grid grid-cols-3 gap-3 p-4 rounded-xl"
                style={{
                  background: 'rgba(18, 19, 20, 0.8)',
                  border: `1px solid ${colors.border.subtle}`,
                }}
              >
                <div className="text-center">
                  <p className="text-2xl font-black" style={{ color: colors.flame[500] }}>
                    {leaderData.stats.totalReferrals}
                  </p>
                  <p className="text-linear-text-tertiary text-xs">총 리퍼럴</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black" style={{ color: colors.success }}>
                    {leaderData.stats.totalCheckins}
                  </p>
                  <p className="text-linear-text-tertiary text-xs">체크인</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black" style={{ color: colors.info }}>
                    {leaderData.stats.totalReferrals > 0
                      ? Math.round(
                          (leaderData.stats.totalCheckins / leaderData.stats.totalReferrals) * 100
                        )
                      : 0}
                    %
                  </p>
                  <p className="text-linear-text-tertiary text-xs">전환율</p>
                </div>
              </div>

              {/* Referral List */}
              <ReferralList referrals={demoReferrals} />

              {/* Quick Share */}
              <QuickActions
                referralCode={leaderData.referralCode}
                referralLink={leaderData.referralLink}
              />
            </motion.div>
          )}

          {/* Payouts Tab */}
          {activeTab === 'payouts' && (
            <motion.div
              key="payouts"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Payout Request - New Component */}
              <PayoutRequest onPayoutRequested={handleRefresh} />

              {/* Payout Summary */}
              <PayoutSummary data={DEMO_PAYOUT_DATA} />

              {/* Earnings Chart */}
              <EarningsChart data={demoEarnings7D} data30Days={demoEarnings30D} />

              {/* Payout History */}
              <PayoutHistory payouts={demoPayouts} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function LeaderPage() {
  return (
    <ErrorBoundary
      onError={(error) => {
        console.error('Leader page error:', error);
      }}
    >
      <LeaderPageContent />
    </ErrorBoundary>
  );
}
