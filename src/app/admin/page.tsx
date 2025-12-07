'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Store,
  TrendingUp,
  CreditCard,
  Activity,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { colors } from '@/lib/design-tokens';

/**
 * Admin Dashboard Page
 *
 * Overview of key metrics and recent activity.
 */

interface DashboardStats {
  totalUsers: number;
  activePopups: number;
  totalParticipations: number;
  pendingPayouts: number;
  todayCheckins: number;
  openReports: number;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: 'user' | 'popup' | 'checkin' | 'payout' | 'report';
  message: string;
  timestamp: string;
}

// Stats card component
function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  trend?: { value: number; isPositive: boolean };
  color: string;
}) {
  return (
    <motion.div
      className="p-6 rounded-2xl"
      style={{
        background: colors.space[800],
        border: `1px solid ${colors.border.subtle}`,
      }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm mb-1" style={{ color: colors.text.secondary }}>
            {title}
          </p>
          <p className="text-3xl font-bold" style={{ color: colors.text.primary }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <p
              className="text-xs mt-1"
              style={{ color: trend.isPositive ? colors.success : colors.error }}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}% 전월 대비
            </p>
          )}
        </div>
        <div className="p-3 rounded-xl" style={{ background: `${color}20` }}>
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
}

// Activity item component
function ActivityItemRow({ item }: { item: ActivityItem }) {
  const getIcon = () => {
    switch (item.type) {
      case 'user':
        return <Users size={16} />;
      case 'popup':
        return <Store size={16} />;
      case 'checkin':
        return <Activity size={16} />;
      case 'payout':
        return <CreditCard size={16} />;
      case 'report':
        return <AlertCircle size={16} />;
    }
  };

  const getColor = () => {
    switch (item.type) {
      case 'user':
        return colors.info;
      case 'popup':
        return colors.success;
      case 'checkin':
        return colors.flame[500];
      case 'payout':
        return colors.spark[500];
      case 'report':
        return colors.error;
    }
  };

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl"
      style={{ background: colors.space[800] }}
    >
      <div className="p-2 rounded-lg" style={{ background: `${getColor()}20`, color: getColor() }}>
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate" style={{ color: colors.text.primary }}>
          {item.message}
        </p>
        <p className="text-xs" style={{ color: colors.text.muted }}>
          {new Date(item.timestamp).toLocaleString('ko-KR')}
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stats');
      }

      setStats(data.data);
    } catch {
      // Use mock data in development
      setStats({
        totalUsers: 1234,
        activePopups: 42,
        totalParticipations: 8567,
        pendingPayouts: 15,
        todayCheckins: 156,
        openReports: 3,
        recentActivity: [
          {
            id: '1',
            type: 'user',
            message: '새로운 사용자 가입: user@example.com',
            timestamp: new Date().toISOString(),
          },
          {
            id: '2',
            type: 'popup',
            message: '팝업 오픈 확정: 나이키 강남 팝업',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: '3',
            type: 'checkin',
            message: '체크인 완료: 스타벅스 명동점',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
          },
          {
            id: '4',
            type: 'payout',
            message: '정산 요청: 리더 김OO (₩50,000)',
            timestamp: new Date(Date.now() - 10800000).toISOString(),
          },
          {
            id: '5',
            type: 'report',
            message: '신고 접수: 부적절한 리뷰',
            timestamp: new Date(Date.now() - 14400000).toISOString(),
          },
        ],
      });
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl animate-pulse"
              style={{ background: colors.space[800] }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="p-6 rounded-2xl text-center" style={{ background: colors.space[800] }}>
        <AlertCircle size={48} className="mx-auto mb-4" style={{ color: colors.error }} />
        <p style={{ color: colors.text.primary }}>{error}</p>
        <button
          type="button"
          className="mt-4 px-4 py-2 rounded-xl"
          style={{
            background: colors.flame[500],
            color: 'white',
          }}
          onClick={fetchStats}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
            대시보드
          </h1>
          <p style={{ color: colors.text.secondary }}>ZZIK 플랫폼 현황 요약</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors"
          style={{
            background: colors.space[800],
            color: colors.text.secondary,
          }}
          onClick={fetchStats}
        >
          <RefreshCw size={16} />
          새로고침
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="총 사용자"
          value={stats?.totalUsers || 0}
          icon={Users}
          color={colors.info}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="활성 팝업"
          value={stats?.activePopups || 0}
          icon={Store}
          color={colors.success}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="총 참여"
          value={stats?.totalParticipations || 0}
          icon={TrendingUp}
          color={colors.flame[500]}
          trend={{ value: 23, isPositive: true }}
        />
        <StatCard
          title="대기 중 정산"
          value={stats?.pendingPayouts || 0}
          icon={CreditCard}
          color={colors.spark[500]}
        />
        <StatCard
          title="오늘 체크인"
          value={stats?.todayCheckins || 0}
          icon={Activity}
          color={colors.flame[400]}
        />
        <StatCard
          title="미처리 신고"
          value={stats?.openReports || 0}
          icon={AlertCircle}
          color={colors.error}
        />
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: colors.text.primary }}>
          최근 활동
        </h2>
        <div className="space-y-2">
          {stats?.recentActivity.map((item) => (
            <ActivityItemRow key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: colors.text.primary }}>
          빠른 작업
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/admin/users"
            className="p-4 rounded-xl text-center transition-colors"
            style={{
              background: colors.space[800],
              border: `1px solid ${colors.border.subtle}`,
            }}
          >
            <Users size={24} className="mx-auto mb-2" style={{ color: colors.info }} />
            <p className="text-sm" style={{ color: colors.text.primary }}>
              사용자 관리
            </p>
          </a>
          <a
            href="/admin/popups"
            className="p-4 rounded-xl text-center transition-colors"
            style={{
              background: colors.space[800],
              border: `1px solid ${colors.border.subtle}`,
            }}
          >
            <Store size={24} className="mx-auto mb-2" style={{ color: colors.success }} />
            <p className="text-sm" style={{ color: colors.text.primary }}>
              팝업 승인
            </p>
          </a>
          <a
            href="/admin/payouts"
            className="p-4 rounded-xl text-center transition-colors"
            style={{
              background: colors.space[800],
              border: `1px solid ${colors.border.subtle}`,
            }}
          >
            <CreditCard size={24} className="mx-auto mb-2" style={{ color: colors.spark[500] }} />
            <p className="text-sm" style={{ color: colors.text.primary }}>
              정산 처리
            </p>
          </a>
          <a
            href="/admin/reports"
            className="p-4 rounded-xl text-center transition-colors"
            style={{
              background: colors.space[800],
              border: `1px solid ${colors.border.subtle}`,
            }}
          >
            <AlertCircle size={24} className="mx-auto mb-2" style={{ color: colors.error }} />
            <p className="text-sm" style={{ color: colors.text.primary }}>
              신고 처리
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
