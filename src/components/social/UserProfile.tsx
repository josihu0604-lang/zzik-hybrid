'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Edit2,
  MapPin,
  Calendar,
  Star,
  Award,
  Users,
  Heart,
  Grid3X3,
  Bookmark,
  Camera,
  Share2,
  MessageCircle,
  UserPlus,
  UserMinus,
  Check,
  Crown,
  Verified,
  Globe,
  Instagram,
  Twitter,
  Link as LinkIcon,
  MoreHorizontal,
  ChevronRight,
} from 'lucide-react';
import { colors, rgba, gradients } from '@/lib/design-tokens';
import { useLocale } from '@/providers/LocaleProvider';
import Image from 'next/image';
import Link from 'next/link';

// ============================================
// Types & Interfaces
// ============================================

export interface UserBadge {
  id: string;
  name: string;
  nameKo: string;
  icon: string;
  color: string;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  earnedAt: Date;
}

export interface UserStats {
  reviews: number;
  photos: number;
  checkins: number;
  followers: number;
  following: number;
  points: number;
  helpfulVotes: number;
  savedPlaces: number;
}

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  website?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  joinedAt: Date;
  isVerified: boolean;
  isVip: boolean;
  vipTier?: 'silver' | 'gold' | 'platinum';
  badges: UserBadge[];
  stats: UserStats;
  socialLinks?: SocialLinks;
  favoriteCategories?: string[];
  isFollowing?: boolean;
  isFollowedBy?: boolean;
}

interface UserProfileProps {
  profile: UserProfile;
  isOwnProfile?: boolean;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  onMessage?: (userId: string) => void;
  onShare?: (userId: string) => void;
  onEditProfile?: () => void;
  className?: string;
}

type ProfileTab = 'reviews' | 'photos' | 'badges' | 'saved';

// ============================================
// Constants
// ============================================

const VIP_TIER_CONFIG = {
  silver: { color: colors.gray[300], label: 'Silver', labelKo: '실버' },
  gold: { color: colors.yellow[400], label: 'Gold', labelKo: '골드' },
  platinum: { color: colors.purple[400], label: 'Platinum', labelKo: '플래티넘' },
};

// ============================================
// Sub-Components
// ============================================

// Cover Image with Avatar
function ProfileHeader({
  profile,
  isOwnProfile,
  onEditProfile,
}: {
  profile: UserProfile;
  isOwnProfile: boolean;
  onEditProfile?: () => void;
}) {
  return (
    <div className="relative">
      {/* Cover Image */}
      <div 
        className="h-36 sm:h-48 w-full relative rounded-b-3xl overflow-hidden"
        style={{ 
          background: profile.coverImage 
            ? undefined 
            : `linear-gradient(135deg, ${colors.flame[600]} 0%, ${colors.purple[600]} 100%)` 
        }}
      >
        {profile.coverImage && (
          <Image
            src={profile.coverImage}
            alt="Cover"
            fill
            className="object-cover"
          />
        )}
        {/* Gradient Overlay */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' 
          }}
        />

        {/* Edit Cover Button */}
        {isOwnProfile && (
          <button
            onClick={onEditProfile}
            className="absolute top-4 right-4 p-2 rounded-full backdrop-blur-md"
            style={{ background: rgba.black[50] }}
          >
            <Camera size={18} color="white" />
          </button>
        )}
      </div>

      {/* Avatar */}
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
        <div className="relative">
          <div 
            className="w-32 h-32 rounded-full border-4 overflow-hidden"
            style={{ borderColor: colors.space[900], background: rgba.white[10] }}
          >
            {profile.avatar ? (
              <Image
                src={profile.avatar}
                alt={profile.displayName}
                width={128}
                height={128}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white">
                {profile.displayName[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* VIP Badge */}
          {profile.isVip && profile.vipTier && (
            <div 
              className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${VIP_TIER_CONFIG[profile.vipTier].color} 0%, ${colors.space[900]} 100%)`,
                border: `3px solid ${colors.space[900]}`,
              }}
            >
              <Crown size={18} style={{ color: VIP_TIER_CONFIG[profile.vipTier].color }} />
            </div>
          )}

          {/* Verified Badge */}
          {profile.isVerified && !profile.isVip && (
            <div 
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: colors.blue[500], border: `3px solid ${colors.space[900]}` }}
            >
              <Verified size={14} color="white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// User Info Section
function UserInfo({
  profile,
  locale,
}: {
  profile: UserProfile;
  locale: string;
}) {
  const joinedDate = new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
  }).format(profile.joinedAt);

  return (
    <div className="text-center mt-20 px-4">
      {/* Name & Username */}
      <div className="flex items-center justify-center gap-2 mb-1">
        <h1 className="text-2xl font-bold text-white">{profile.displayName}</h1>
        {profile.isVerified && (
          <Verified size={20} style={{ color: colors.blue[500] }} />
        )}
      </div>
      <p className="text-sm" style={{ color: rgba.white[50] }}>@{profile.username}</p>

      {/* VIP Badge */}
      {profile.isVip && profile.vipTier && (
        <div 
          className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full"
          style={{ 
            background: VIP_TIER_CONFIG[profile.vipTier].color + '20',
            border: `1px solid ${VIP_TIER_CONFIG[profile.vipTier].color}40`,
          }}
        >
          <Crown size={14} style={{ color: VIP_TIER_CONFIG[profile.vipTier].color }} />
          <span 
            className="text-sm font-semibold"
            style={{ color: VIP_TIER_CONFIG[profile.vipTier].color }}
          >
            {locale === 'ko' 
              ? `VIP ${VIP_TIER_CONFIG[profile.vipTier].labelKo}`
              : `VIP ${VIP_TIER_CONFIG[profile.vipTier].label}`}
          </span>
        </div>
      )}

      {/* Bio */}
      {profile.bio && (
        <p 
          className="mt-3 text-sm max-w-md mx-auto"
          style={{ color: rgba.white[70] }}
        >
          {profile.bio}
        </p>
      )}

      {/* Location & Joined */}
      <div className="flex items-center justify-center gap-4 mt-3 text-sm" style={{ color: rgba.white[50] }}>
        {profile.location && (
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {profile.location}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar size={14} />
          {locale === 'ko' ? `${joinedDate} 가입` : `Joined ${joinedDate}`}
        </span>
      </div>

      {/* Social Links */}
      {profile.socialLinks && (
        <div className="flex items-center justify-center gap-3 mt-3">
          {profile.socialLinks.instagram && (
            <a 
              href={`https://instagram.com/${profile.socialLinks.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full"
              style={{ background: rgba.white[5] }}
            >
              <Instagram size={18} style={{ color: rgba.white[60] }} />
            </a>
          )}
          {profile.socialLinks.twitter && (
            <a 
              href={`https://twitter.com/${profile.socialLinks.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full"
              style={{ background: rgba.white[5] }}
            >
              <Twitter size={18} style={{ color: rgba.white[60] }} />
            </a>
          )}
          {profile.socialLinks.website && (
            <a 
              href={profile.socialLinks.website}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full"
              style={{ background: rgba.white[5] }}
            >
              <LinkIcon size={18} style={{ color: rgba.white[60] }} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// Stats Bar
function StatsBar({
  stats,
  locale,
  userId,
}: {
  stats: UserStats;
  locale: string;
  userId: string;
}) {
  const statItems = [
    { 
      value: stats.reviews, 
      label: locale === 'ko' ? '리뷰' : 'Reviews',
      href: `/user/${userId}/reviews`,
    },
    { 
      value: stats.followers, 
      label: locale === 'ko' ? '팔로워' : 'Followers',
      href: `/user/${userId}/followers`,
    },
    { 
      value: stats.following, 
      label: locale === 'ko' ? '팔로잉' : 'Following',
      href: `/user/${userId}/following`,
    },
  ];

  return (
    <div 
      className="grid grid-cols-3 divide-x mt-6 py-4 mx-4 rounded-xl"
      style={{ background: rgba.white[5], divideColor: rgba.white[10] }}
    >
      {statItems.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className="text-center hover:opacity-80 transition-opacity"
        >
          <p className="text-xl font-bold text-white">{item.value.toLocaleString()}</p>
          <p className="text-xs" style={{ color: rgba.white[50] }}>{item.label}</p>
        </Link>
      ))}
    </div>
  );
}

// Action Buttons
function ActionButtons({
  profile,
  isOwnProfile,
  onFollow,
  onUnfollow,
  onMessage,
  onShare,
  onEditProfile,
  locale,
}: {
  profile: UserProfile;
  isOwnProfile: boolean;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  onMessage?: (userId: string) => void;
  onShare?: (userId: string) => void;
  onEditProfile?: () => void;
  locale: string;
}) {
  const [followLoading, setFollowLoading] = useState(false);

  const handleFollowToggle = async () => {
    setFollowLoading(true);
    if (profile.isFollowing) {
      await onUnfollow?.(profile.id);
    } else {
      await onFollow?.(profile.id);
    }
    setFollowLoading(false);
  };

  if (isOwnProfile) {
    return (
      <div className="flex gap-3 px-4 mt-4">
        <Link href="/settings/profile" className="flex-1">
          <button
            className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
            style={{ background: rgba.white[5], color: 'white' }}
          >
            <Edit2 size={18} />
            {locale === 'ko' ? '프로필 수정' : 'Edit Profile'}
          </button>
        </Link>
        <button
          onClick={() => onShare?.(profile.id)}
          className="p-3 rounded-xl"
          style={{ background: rgba.white[5] }}
        >
          <Share2 size={20} style={{ color: rgba.white[60] }} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-3 px-4 mt-4">
      <button
        onClick={handleFollowToggle}
        disabled={followLoading}
        className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        style={{ 
          background: profile.isFollowing ? rgba.white[5] : gradients.flame,
          color: 'white',
        }}
      >
        {profile.isFollowing ? (
          <>
            <Check size={18} />
            {locale === 'ko' ? '팔로잉' : 'Following'}
          </>
        ) : (
          <>
            <UserPlus size={18} />
            {locale === 'ko' ? '팔로우' : 'Follow'}
          </>
        )}
      </button>
      {onMessage && (
        <button
          onClick={() => onMessage(profile.id)}
          className="p-3 rounded-xl"
          style={{ background: rgba.white[5] }}
        >
          <MessageCircle size={20} style={{ color: rgba.white[60] }} />
        </button>
      )}
      <button
        onClick={() => onShare?.(profile.id)}
        className="p-3 rounded-xl"
        style={{ background: rgba.white[5] }}
      >
        <Share2 size={20} style={{ color: rgba.white[60] }} />
      </button>
    </div>
  );
}

// Badges Section
function BadgesSection({
  badges,
  locale,
}: {
  badges: UserBadge[];
  locale: string;
}) {
  if (badges.length === 0) return null;

  const displayBadges = badges.slice(0, 6);
  const hasMore = badges.length > 6;

  return (
    <div className="mt-6 px-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white">
          {locale === 'ko' ? '뱃지' : 'Badges'}
        </h3>
        {hasMore && (
          <Link 
            href="#badges"
            className="text-sm flex items-center gap-1"
            style={{ color: colors.flame[500] }}
          >
            {locale === 'ko' ? '전체 보기' : 'View All'}
            <ChevronRight size={14} />
          </Link>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {displayBadges.map((badge) => (
          <div
            key={badge.id}
            className="shrink-0 w-16 text-center"
          >
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-1"
              style={{ 
                background: `${badge.color}20`,
                border: `2px solid ${badge.color}40`,
              }}
            >
              {badge.icon}
            </div>
            <p className="text-xs font-medium truncate" style={{ color: rgba.white[70] }}>
              {locale === 'ko' ? badge.nameKo : badge.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Extended Stats Grid
function ExtendedStats({
  stats,
  locale,
}: {
  stats: UserStats;
  locale: string;
}) {
  const statItems = [
    { icon: <Star size={18} />, value: stats.reviews, label: locale === 'ko' ? '리뷰' : 'Reviews', color: colors.yellow[400] },
    { icon: <Camera size={18} />, value: stats.photos, label: locale === 'ko' ? '사진' : 'Photos', color: colors.blue[400] },
    { icon: <MapPin size={18} />, value: stats.checkins, label: locale === 'ko' ? '체크인' : 'Check-ins', color: colors.green[400] },
    { icon: <Heart size={18} />, value: stats.helpfulVotes, label: locale === 'ko' ? '도움됨' : 'Helpful', color: colors.red[400] },
    { icon: <Bookmark size={18} />, value: stats.savedPlaces, label: locale === 'ko' ? '저장' : 'Saved', color: colors.purple[400] },
    { icon: <Award size={18} />, value: stats.points, label: locale === 'ko' ? '포인트' : 'Points', color: colors.flame[500] },
  ];

  return (
    <div className="mt-6 px-4">
      <h3 className="font-semibold text-white mb-3">
        {locale === 'ko' ? '활동 통계' : 'Activity Stats'}
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {statItems.map((item, index) => (
          <div
            key={index}
            className="p-3 rounded-xl text-center"
            style={{ background: rgba.white[5] }}
          >
            <div 
              className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-2"
              style={{ background: item.color + '20', color: item.color }}
            >
              {item.icon}
            </div>
            <p className="font-bold text-white">{item.value.toLocaleString()}</p>
            <p className="text-xs" style={{ color: rgba.white[50] }}>{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function UserProfileComponent({
  profile,
  isOwnProfile = false,
  onFollow,
  onUnfollow,
  onMessage,
  onShare,
  onEditProfile,
  className = '',
}: UserProfileProps) {
  const { locale } = useLocale();
  const [activeTab, setActiveTab] = useState<ProfileTab>('reviews');

  const tabs: { id: ProfileTab; label: string; labelKo: string; icon: React.ReactNode }[] = [
    { id: 'reviews', label: 'Reviews', labelKo: '리뷰', icon: <Star size={18} /> },
    { id: 'photos', label: 'Photos', labelKo: '사진', icon: <Grid3X3 size={18} /> },
    { id: 'badges', label: 'Badges', labelKo: '뱃지', icon: <Award size={18} /> },
    { id: 'saved', label: 'Saved', labelKo: '저장', icon: <Bookmark size={18} /> },
  ];

  return (
    <div className={`pb-6 ${className}`}>
      {/* Header with Cover & Avatar */}
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEditProfile={onEditProfile}
      />

      {/* User Info */}
      <UserInfo profile={profile} locale={locale} />

      {/* Stats Bar */}
      <StatsBar stats={profile.stats} locale={locale} userId={profile.id} />

      {/* Action Buttons */}
      <ActionButtons
        profile={profile}
        isOwnProfile={isOwnProfile}
        onFollow={onFollow}
        onUnfollow={onUnfollow}
        onMessage={onMessage}
        onShare={onShare}
        onEditProfile={onEditProfile}
        locale={locale}
      />

      {/* Mutual Follow Badge */}
      {!isOwnProfile && profile.isFollowedBy && (
        <div 
          className="mx-4 mt-4 p-3 rounded-xl flex items-center gap-2"
          style={{ background: colors.blue[500] + '15', border: `1px solid ${colors.blue[500]}30` }}
        >
          <Users size={16} style={{ color: colors.blue[400] }} />
          <span className="text-sm" style={{ color: colors.blue[400] }}>
            {locale === 'ko' ? '서로 팔로우 중' : 'Follows you'}
          </span>
        </div>
      )}

      {/* Badges Section */}
      <BadgesSection badges={profile.badges} locale={locale} />

      {/* Extended Stats */}
      <ExtendedStats stats={profile.stats} locale={locale} />

      {/* Favorite Categories */}
      {profile.favoriteCategories && profile.favoriteCategories.length > 0 && (
        <div className="mt-6 px-4">
          <h3 className="font-semibold text-white mb-3">
            {locale === 'ko' ? '관심 카테고리' : 'Interests'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.favoriteCategories.map((category, index) => (
              <span
                key={index}
                className="px-3 py-1.5 rounded-full text-sm"
                style={{ background: colors.flame[500] + '20', color: colors.flame[400] }}
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-6 border-b" style={{ borderColor: rgba.white[10] }}>
        <div className="flex px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-3 flex items-center justify-center gap-2 relative"
              style={{ 
                color: activeTab === tab.id ? colors.flame[500] : rgba.white[50] 
              }}
            >
              {tab.icon}
              <span className="text-sm font-medium hidden sm:inline">
                {locale === 'ko' ? tab.labelKo : tab.label}
              </span>
              {activeTab === tab.id && (
                <m.div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: colors.flame[500] }}
                  layoutId="activeTab"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Placeholder */}
      <div className="px-4 mt-4">
        <div 
          className="py-16 text-center rounded-xl"
          style={{ background: rgba.white[5] }}
        >
          <p style={{ color: rgba.white[50] }}>
            {activeTab === 'reviews' && (locale === 'ko' ? '리뷰 목록이 여기에 표시됩니다' : 'Reviews will appear here')}
            {activeTab === 'photos' && (locale === 'ko' ? '사진이 여기에 표시됩니다' : 'Photos will appear here')}
            {activeTab === 'badges' && (locale === 'ko' ? '뱃지가 여기에 표시됩니다' : 'Badges will appear here')}
            {activeTab === 'saved' && (locale === 'ko' ? '저장한 장소가 여기에 표시됩니다' : 'Saved places will appear here')}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Exports
// ============================================

export { UserProfileComponent as UserProfile };
export default UserProfileComponent;
