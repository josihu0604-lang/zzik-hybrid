'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { m, AnimatePresence } from '@/lib/motion';
import {
  Plus,
  Search,
  MapPin,
  Calendar,
  Users,
  ChevronRight,
  Flame,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { GlassCard, CosmicInput } from '@/components/cosmic';
import { colors, gradients, shadows } from '@/lib/design-tokens';
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations';
import type { BrandCampaign, CampaignStatus } from '@/types/brand';

// Mock data
const mockCampaigns: BrandCampaign[] = [
  {
    id: '1',
    brand_id: 'b1',
    popup_id: 'p1',
    title: '2024 Winter Collection',
    description: '겨울 신상품 런칭 팝업',
    image_url: null,
    location: '성수동 카페거리',
    latitude: 37.5445,
    longitude: 127.0561,
    category: 'fashion',
    goal_participants: 200,
    current_participants: 156,
    deadline_at: '2025-01-15T00:00:00Z',
    starts_at: '2025-01-20T00:00:00Z',
    ends_at: '2025-01-25T00:00:00Z',
    status: 'funding',
    progress_percent: 78,
    total_checkins: 0,
    conversion_rate: 0,
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-06T00:00:00Z',
  },
  {
    id: '2',
    brand_id: 'b1',
    popup_id: 'p2',
    title: 'Holiday Special Event',
    description: '홀리데이 특별 이벤트',
    image_url: null,
    location: '홍대입구역',
    latitude: 37.5563,
    longitude: 126.9234,
    category: 'lifestyle',
    goal_participants: 150,
    current_participants: 150,
    deadline_at: '2024-12-20T00:00:00Z',
    starts_at: '2024-12-25T00:00:00Z',
    ends_at: '2024-12-31T00:00:00Z',
    status: 'confirmed',
    progress_percent: 100,
    total_checkins: 89,
    conversion_rate: 59.3,
    created_at: '2024-11-15T00:00:00Z',
    updated_at: '2024-12-06T00:00:00Z',
  },
  {
    id: '3',
    brand_id: 'b1',
    popup_id: 'p3',
    title: 'New Year Launch',
    description: '새해 런칭 캠페인',
    image_url: null,
    location: '강남역',
    latitude: 37.498,
    longitude: 127.0276,
    category: 'beauty',
    goal_participants: 300,
    current_participants: 45,
    deadline_at: '2025-01-25T00:00:00Z',
    starts_at: '2025-02-01T00:00:00Z',
    ends_at: '2025-02-10T00:00:00Z',
    status: 'funding',
    progress_percent: 15,
    total_checkins: 0,
    conversion_rate: 0,
    created_at: '2024-12-05T00:00:00Z',
    updated_at: '2024-12-06T00:00:00Z',
  },
  {
    id: '4',
    brand_id: 'b1',
    popup_id: 'p4',
    title: 'Summer Collection Preview',
    description: '여름 컬렉션 미리보기',
    image_url: null,
    location: '잠실 롯데월드몰',
    latitude: 37.5133,
    longitude: 127.1028,
    category: 'fashion',
    goal_participants: 250,
    current_participants: 250,
    deadline_at: '2024-11-01T00:00:00Z',
    starts_at: '2024-11-10T00:00:00Z',
    ends_at: '2024-11-20T00:00:00Z',
    status: 'completed',
    progress_percent: 100,
    total_checkins: 198,
    conversion_rate: 79.2,
    created_at: '2024-10-01T00:00:00Z',
    updated_at: '2024-11-20T00:00:00Z',
  },
];

const statusFilters: { value: CampaignStatus | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'funding', label: '펀딩중' },
  { value: 'confirmed', label: '오픈 확정' },
  { value: 'active', label: '진행중' },
  { value: 'completed', label: '완료' },
];

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; icon: typeof Flame }
> = {
  draft: {
    label: '초안',
    bg: 'rgba(107, 114, 128, 0.2)',
    text: colors.text.secondary,
    icon: Clock,
  },
  funding: {
    label: '펀딩중',
    bg: 'rgba(255, 107, 91, 0.15)',
    text: colors.flame[500],
    icon: Flame,
  },
  confirmed: {
    label: '오픈 확정',
    bg: 'rgba(34, 197, 94, 0.15)',
    text: colors.success,
    icon: CheckCircle,
  },
  active: {
    label: '진행중',
    bg: 'rgba(59, 130, 246, 0.15)',
    text: colors.info,
    icon: Flame,
  },
  completed: {
    label: '완료',
    bg: 'rgba(107, 114, 128, 0.15)',
    text: colors.text.tertiary,
    icon: CheckCircle,
  },
  cancelled: {
    label: '취소됨',
    bg: 'rgba(239, 68, 68, 0.15)',
    text: colors.error,
    icon: XCircle,
  },
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<BrandCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setCampaigns(mockCampaigns);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <m.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">캠페인 관리</h1>
          <p className="mt-1" style={{ color: colors.text.secondary }}>
            {campaigns.length}개의 캠페인
          </p>
        </div>
        <Link href="/brand/campaigns/new">
          <m.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
            style={{
              background: gradients.flame,
              boxShadow: shadows.glow.primary,
            }}
          >
            <Plus size={20} />새 캠페인
          </m.button>
        </Link>
      </m.div>

      {/* Filters */}
      <m.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
        className="flex flex-col lg:flex-row gap-4"
      >
        {/* Search */}
        <div className="flex-1">
          <CosmicInput
            placeholder="캠페인 검색..."
            value={searchQuery}
            onChange={setSearchQuery}
            icon={<Search size={18} />}
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {statusFilters.map((filter) => (
            <m.button
              key={filter.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStatusFilter(filter.value)}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
              style={{
                background:
                  statusFilter === filter.value ? colors.flame[500] : 'rgba(255, 255, 255, 0.05)',
                color: statusFilter === filter.value ? '#fff' : colors.text.secondary,
                border: `1px solid ${
                  statusFilter === filter.value ? colors.flame[500] : colors.border.subtle
                }`,
              }}
            >
              {filter.label}
            </m.button>
          ))}
        </div>
      </m.div>

      {/* Campaign List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <m.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredCampaigns.length === 0 ? (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255, 107, 91, 0.1)' }}
                >
                  <Search size={24} style={{ color: colors.flame[400] }} />
                </div>
                <p className="text-white font-medium">캠페인을 찾을 수 없습니다</p>
                <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
                  다른 검색어나 필터를 시도해보세요
                </p>
              </m.div>
            ) : (
              filteredCampaigns.map((campaign) => {
                const status = statusConfig[campaign.status] || statusConfig.draft;
                const StatusIcon = status.icon;

                return (
                  <m.div
                    key={campaign.id}
                    variants={staggerItem}
                    layout
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Link href={`/brand/campaigns/${campaign.id}`}>
                      <GlassCard padding="none" hover glow="flame">
                        <div className="p-4 lg:p-5">
                          <div className="flex gap-4">
                            {/* Image */}
                            <div
                              className="w-20 h-20 lg:w-24 lg:h-24 rounded-xl flex-shrink-0 flex items-center justify-center"
                              style={{
                                background: gradients.cold,
                                border: `1px solid ${colors.border.subtle}`,
                              }}
                            >
                              <Flame size={28} style={{ color: colors.flame[400] }} />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold text-white truncate">
                                  {campaign.title}
                                </h3>
                                <span
                                  className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0"
                                  style={{
                                    background: status.bg,
                                    color: status.text,
                                  }}
                                >
                                  <StatusIcon size={12} />
                                  {status.label}
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                <p
                                  className="text-sm flex items-center gap-1"
                                  style={{ color: colors.text.secondary }}
                                >
                                  <MapPin size={14} />
                                  {campaign.location}
                                </p>
                                <p
                                  className="text-sm flex items-center gap-1"
                                  style={{ color: colors.text.secondary }}
                                >
                                  <Calendar size={14} />
                                  {formatDate(campaign.deadline_at)} 마감
                                </p>
                                <p
                                  className="text-sm flex items-center gap-1"
                                  style={{ color: colors.text.secondary }}
                                >
                                  <Users size={14} />
                                  {campaign.current_participants}/{campaign.goal_participants}명
                                </p>
                              </div>

                              {/* Progress */}
                              <div className="mt-3">
                                <div
                                  className="h-2 rounded-full overflow-hidden"
                                  style={{ background: 'rgba(255, 107, 91, 0.1)' }}
                                >
                                  <m.div
                                    initial={{ width: 0 }}
                                    animate={{
                                      width: `${campaign.progress_percent}%`,
                                    }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="h-full rounded-full"
                                    style={{
                                      background:
                                        campaign.progress_percent >= 100
                                          ? colors.success
                                          : gradients.flame,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Arrow */}
                            <div className="hidden lg:flex items-center">
                              <ChevronRight size={20} style={{ color: colors.text.tertiary }} />
                            </div>
                          </div>

                          {/* Stats Row */}
                          {(campaign.status === 'confirmed' ||
                            campaign.status === 'active' ||
                            campaign.status === 'completed') && (
                            <div
                              className="flex gap-6 mt-4 pt-4 border-t"
                              style={{ borderColor: colors.border.subtle }}
                            >
                              <div>
                                <p className="text-sm" style={{ color: colors.text.tertiary }}>
                                  체크인
                                </p>
                                <p className="font-semibold text-white">
                                  {campaign.total_checkins}회
                                </p>
                              </div>
                              <div>
                                <p className="text-sm" style={{ color: colors.text.tertiary }}>
                                  전환율
                                </p>
                                <p className="font-semibold" style={{ color: colors.success }}>
                                  {campaign.conversion_rate}%
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </GlassCard>
                    </Link>
                  </m.div>
                );
              })
            )}
          </AnimatePresence>
        </m.div>
      )}
    </div>
  );
}
