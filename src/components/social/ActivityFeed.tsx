'use client';

import { useState, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
  Star,
  Camera,
  MapPin,
  Heart,
  MessageCircle,
  Award,
  UserPlus,
  Users,
  Bookmark,
  Clock,
  ChevronDown,
  RefreshCw,
  Bell,
  Filter,
  MoreHorizontal,
} from 'lucide-react';
import { colors, rgba, gradients } from '@/lib/design-tokens';
import { useLocale } from '@/providers/LocaleProvider';
import Image from 'next/image';
import Link from 'next/link';

// ============================================
// Types & Interfaces
// ============================================

export type ActivityType = 
  | 'review'
  | 'photo'
  | 'checkin'
  | 'like'
  | 'comment'
  | 'badge'
  | 'follow'
  | 'save'
  | 'level_up';

export interface ActivityUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

export interface ActivityTarget {
  id: string;
  type: 'place' | 'review' | 'user' | 'experience';
  name: string;
  image?: string;
  rating?: number;
}

export interface Activity {
  id: string;
  type: ActivityType;
  user: ActivityUser;
  target?: ActivityTarget;
  content?: string;
  images?: string[];
  rating?: number;
  badgeName?: string;
  badgeIcon?: string;
  level?: number;
  timestamp: Date;
  isLiked?: boolean;
  likeCount: number;
  commentCount: number;
  metadata?: Record<string, unknown>;
}

interface ActivityFeedProps {
  activities: Activity[];
  feedType?: 'personal' | 'following' | 'nearby' | 'trending';
  onLike?: (activityId: string) => void;
  onComment?: (activityId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  showFilter?: boolean;
  currentUserId?: string;
  className?: string;
}

type FeedFilter = 'all' | 'reviews' | 'photos' | 'checkins' | 'social';

// ============================================
// Constants
// ============================================

const ACTIVITY_CONFIG: Record<ActivityType, {
  icon: React.ReactNode;
  color: string;
  action: string;
  actionKo: string;
}> = {
  review: {
    icon: <Star size={16} fill="currentColor" />,
    color: colors.yellow[400],
    action: 'wrote a review',
    actionKo: '리뷰를 작성했습니다',
  },
  photo: {
    icon: <Camera size={16} />,
    color: colors.blue[400],
    action: 'added photos',
    actionKo: '사진을 추가했습니다',
  },
  checkin: {
    icon: <MapPin size={16} />,
    color: colors.green[400],
    action: 'checked in at',
    actionKo: '체크인했습니다',
  },
  like: {
    icon: <Heart size={16} fill="currentColor" />,
    color: colors.red[400],
    action: 'liked',
    actionKo: '좋아요를 눌렀습니다',
  },
  comment: {
    icon: <MessageCircle size={16} />,
    color: colors.cyan[400],
    action: 'commented on',
    actionKo: '댓글을 남겼습니다',
  },
  badge: {
    icon: <Award size={16} />,
    color: colors.purple[400],
    action: 'earned a badge',
    actionKo: '뱃지를 획득했습니다',
  },
  follow: {
    icon: <UserPlus size={16} />,
    color: colors.flame[500],
    action: 'started following',
    actionKo: '팔로우하기 시작했습니다',
  },
  save: {
    icon: <Bookmark size={16} fill="currentColor" />,
    color: colors.purple[400],
    action: 'saved',
    actionKo: '저장했습니다',
  },
  level_up: {
    icon: <Award size={16} />,
    color: colors.flame[500],
    action: 'leveled up to',
    actionKo: '레벨 업!',
  },
};

// ============================================
// Sub-Components
// ============================================

// Feed Filter Tabs
function FeedFilterTabs({
  filter,
  setFilter,
  locale,
}: {
  filter: FeedFilter;
  setFilter: (filter: FeedFilter) => void;
  locale: string;
}) {
  const tabs: { id: FeedFilter; label: string; labelKo: string }[] = [
    { id: 'all', label: 'All', labelKo: '전체' },
    { id: 'reviews', label: 'Reviews', labelKo: '리뷰' },
    { id: 'photos', label: 'Photos', labelKo: '사진' },
    { id: 'checkins', label: 'Check-ins', labelKo: '체크인' },
    { id: 'social', label: 'Social', labelKo: '소셜' },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setFilter(tab.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors`}
          style={{
            background: filter === tab.id ? colors.flame[500] : rgba.white[5],
            color: filter === tab.id ? 'white' : rgba.white[60],
          }}
        >
          {locale === 'ko' ? tab.labelKo : tab.label}
        </button>
      ))}
    </div>
  );
}

// Activity Card
function ActivityCard({
  activity,
  locale,
  onLike,
  onComment,
  isOwnActivity,
}: {
  activity: Activity;
  locale: string;
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
  isOwnActivity: boolean;
}) {
  const config = ACTIVITY_CONFIG[activity.type];
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return locale === 'ko' ? '방금 전' : 'Just now';
    if (diffMins < 60) return locale === 'ko' ? `${diffMins}분 전` : `${diffMins}m ago`;
    if (diffHours < 24) return locale === 'ko' ? `${diffHours}시간 전` : `${diffHours}h ago`;
    if (diffDays < 7) return locale === 'ko' ? `${diffDays}일 전` : `${diffDays}d ago`;
    
    return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // Render star rating if present
  const renderRating = () => {
    if (!activity.rating) return null;
    return (
      <div className="flex items-center gap-1 mt-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            fill={star <= activity.rating! ? colors.yellow[400] : 'transparent'}
            color={star <= activity.rating! ? colors.yellow[400] : rgba.white[30]}
          />
        ))}
      </div>
    );
  };

  // Render images if present
  const renderImages = () => {
    if (!activity.images || activity.images.length === 0) return null;
    
    const displayCount = Math.min(activity.images.length, 4);
    const hasMore = activity.images.length > 4;

    return (
      <div className={`grid gap-1 mt-3 ${displayCount === 1 ? 'grid-cols-1' : displayCount === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
        {activity.images.slice(0, displayCount).map((img, index) => (
          <div
            key={index}
            className={`relative rounded-lg overflow-hidden ${displayCount === 1 ? 'aspect-video' : 'aspect-square'}`}
          >
            <Image
              src={img}
              alt={`Activity image ${index + 1}`}
              fill
              className="object-cover"
            />
            {index === 3 && hasMore && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-semibold">+{activity.images!.length - 4}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render badge info if present
  const renderBadgeInfo = () => {
    if (activity.type !== 'badge') return null;
    return (
      <div 
        className="mt-3 p-3 rounded-xl flex items-center gap-3"
        style={{ background: config.color + '15', border: `1px solid ${config.color}30` }}
      >
        <span className="text-2xl">{activity.badgeIcon}</span>
        <div>
          <p className="font-semibold text-white">{activity.badgeName}</p>
          <p className="text-xs" style={{ color: rgba.white[50] }}>
            {locale === 'ko' ? '새 뱃지 획득!' : 'New badge earned!'}
          </p>
        </div>
      </div>
    );
  };

  // Render level up info
  const renderLevelUp = () => {
    if (activity.type !== 'level_up') return null;
    return (
      <div 
        className="mt-3 p-4 rounded-xl text-center"
        style={{ background: `linear-gradient(135deg, ${colors.flame[500]}20, ${colors.purple[500]}20)` }}
      >
        <div className="text-4xl mb-2">🎉</div>
        <p className="font-bold text-white text-lg">Level {activity.level}</p>
        <p className="text-sm" style={{ color: rgba.white[60] }}>
          {locale === 'ko' ? '레벨 업을 축하합니다!' : 'Congratulations on leveling up!'}
        </p>
      </div>
    );
  };

  return (
    <m.div
      className="p-4 rounded-2xl"
      style={{ background: rgba.white[5], border: `1px solid ${rgba.white[10]}` }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Link href={`/user/${activity.user.id}`}>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10">
            {activity.user.avatar ? (
              <Image
                src={activity.user.avatar}
                alt={activity.user.name}
                width={40}
                height={40}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-white">
                {activity.user.name[0].toUpperCase()}
              </div>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* User & Action */}
          <p className="text-sm">
            <Link href={`/user/${activity.user.id}`} className="font-semibold text-white hover:underline">
              {activity.user.name}
            </Link>
            <span style={{ color: rgba.white[60] }}>
              {' '}{locale === 'ko' ? config.actionKo : config.action}{' '}
            </span>
            {activity.target && (
              <Link 
                href={`/${activity.target.type}/${activity.target.id}`}
                className="font-semibold text-white hover:underline"
              >
                {activity.target.name}
              </Link>
            )}
          </p>

          {/* Timestamp */}
          <div className="flex items-center gap-2 mt-0.5">
            <span 
              className="flex items-center gap-1 text-xs"
              style={{ color: config.color }}
            >
              {config.icon}
            </span>
            <span className="text-xs" style={{ color: rgba.white[40] }}>
              {formatTime(activity.timestamp)}
            </span>
          </div>
        </div>

        {/* More Menu */}
        <button className="p-1 rounded-lg hover:bg-white/5">
          <MoreHorizontal size={18} style={{ color: rgba.white[40] }} />
        </button>
      </div>

      {/* Rating */}
      {renderRating()}

      {/* Content */}
      {activity.content && (
        <p className="mt-3 text-sm" style={{ color: rgba.white[80] }}>
          {activity.content}
        </p>
      )}

      {/* Target Preview */}
      {activity.target?.image && activity.type !== 'photo' && (
        <Link href={`/${activity.target.type}/${activity.target.id}`}>
          <div 
            className="mt-3 p-3 rounded-xl flex items-center gap-3"
            style={{ background: rgba.white[5] }}
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden relative">
              <Image
                src={activity.target.image}
                alt={activity.target.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">{activity.target.name}</p>
              {activity.target.rating && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={12} fill={colors.yellow[400]} color={colors.yellow[400]} />
                  <span className="text-xs" style={{ color: rgba.white[50] }}>
                    {activity.target.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Link>
      )}

      {/* Images */}
      {renderImages()}

      {/* Badge */}
      {renderBadgeInfo()}

      {/* Level Up */}
      {renderLevelUp()}

      {/* Actions */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t" style={{ borderColor: rgba.white[10] }}>
        <button
          onClick={() => onLike?.(activity.id)}
          className="flex items-center gap-2 text-sm"
          style={{ color: activity.isLiked ? colors.red[400] : rgba.white[60] }}
        >
          <Heart size={18} fill={activity.isLiked ? 'currentColor' : 'none'} />
          {activity.likeCount > 0 && <span>{activity.likeCount}</span>}
        </button>
        <button
          onClick={() => onComment?.(activity.id)}
          className="flex items-center gap-2 text-sm"
          style={{ color: rgba.white[60] }}
        >
          <MessageCircle size={18} />
          {activity.commentCount > 0 && <span>{activity.commentCount}</span>}
        </button>
      </div>
    </m.div>
  );
}

// Empty State
function EmptyFeed({ locale }: { locale: string }) {
  return (
    <div 
      className="py-16 text-center rounded-2xl"
      style={{ background: rgba.white[5] }}
    >
      <Bell size={48} className="mx-auto mb-4" style={{ color: rgba.white[20] }} />
      <p className="font-semibold text-white mb-2">
        {locale === 'ko' ? '아직 활동이 없습니다' : 'No activities yet'}
      </p>
      <p className="text-sm" style={{ color: rgba.white[50] }}>
        {locale === 'ko' 
          ? '팔로우한 사람들의 활동이 여기에 표시됩니다'
          : 'Activities from people you follow will appear here'}
      </p>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function ActivityFeed({
  activities,
  feedType = 'following',
  onLike,
  onComment,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  showFilter = true,
  currentUserId,
  className = '',
}: ActivityFeedProps) {
  const { locale } = useLocale();
  const [filter, setFilter] = useState<FeedFilter>('all');

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (filter === 'all') return activities;
    
    switch (filter) {
      case 'reviews':
        return activities.filter(a => a.type === 'review');
      case 'photos':
        return activities.filter(a => a.type === 'photo');
      case 'checkins':
        return activities.filter(a => a.type === 'checkin');
      case 'social':
        return activities.filter(a => ['follow', 'like', 'comment', 'badge', 'level_up'].includes(a.type));
      default:
        return activities;
    }
  }, [activities, filter]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          {feedType === 'personal' && (locale === 'ko' ? '내 활동' : 'My Activity')}
          {feedType === 'following' && (locale === 'ko' ? '피드' : 'Feed')}
          {feedType === 'nearby' && (locale === 'ko' ? '주변 활동' : 'Nearby')}
          {feedType === 'trending' && (locale === 'ko' ? '인기 활동' : 'Trending')}
        </h2>
      </div>

      {/* Filters */}
      {showFilter && (
        <FeedFilterTabs filter={filter} setFilter={setFilter} locale={locale} />
      )}

      {/* Activity List */}
      {filteredActivities.length === 0 ? (
        <EmptyFeed locale={locale} />
      ) : (
        <div className="space-y-4">
          {filteredActivities.map((activity, index) => (
            <m.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ActivityCard
                activity={activity}
                locale={locale}
                onLike={onLike}
                onComment={onComment}
                isOwnActivity={currentUserId === activity.user.id}
              />
            </m.div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={isLoading}
          className="w-full py-4 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
          style={{ background: rgba.white[5], color: colors.flame[500] }}
        >
          {isLoading ? (
            <RefreshCw size={18} className="animate-spin mx-auto" />
          ) : (
            locale === 'ko' ? '더 보기' : 'Load More'
          )}
        </button>
      )}
    </div>
  );
}

// ============================================
// Exports
// ============================================

export default ActivityFeed;
