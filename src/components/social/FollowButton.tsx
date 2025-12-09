'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { UserPlus, UserMinus, Check, Loader2 } from 'lucide-react';
import { colors, rgba, gradients } from '@/lib/design-tokens';
import { useLocale } from '@/providers/LocaleProvider';

// ============================================
// Types & Interfaces
// ============================================

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  isFollowedBy?: boolean;
  onFollow: (userId: string) => Promise<void>;
  onUnfollow: (userId: string) => Promise<void>;
  variant?: 'default' | 'compact' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showUnfollowOnHover?: boolean;
  className?: string;
}

// ============================================
// Main Component
// ============================================

export function FollowButton({
  userId,
  isFollowing,
  isFollowedBy = false,
  onFollow,
  onUnfollow,
  variant = 'default',
  size = 'md',
  showUnfollowOnHover = true,
  className = '',
}: FollowButtonProps) {
  const { locale } = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (isFollowing) {
        await onUnfollow(userId);
      } else {
        await onFollow(userId);
      }
    } catch (error) {
      console.error('Follow action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Size configurations
  const sizeConfig = {
    sm: { padding: 'px-3 py-1.5', text: 'text-xs', icon: 14 },
    md: { padding: 'px-4 py-2', text: 'text-sm', icon: 16 },
    lg: { padding: 'px-6 py-3', text: 'text-base', icon: 18 },
  };

  const config = sizeConfig[size];

  // Determine button state
  const showUnfollow = isFollowing && isHovered && showUnfollowOnHover;
  
  // Labels
  const labels = {
    follow: locale === 'ko' ? '팔로우' : 'Follow',
    following: locale === 'ko' ? '팔로잉' : 'Following',
    unfollow: locale === 'ko' ? '언팔로우' : 'Unfollow',
    followBack: locale === 'ko' ? '맞팔로우' : 'Follow Back',
  };

  // Get current label
  const getLabel = () => {
    if (isLoading) return '';
    if (isFollowing) {
      return showUnfollow ? labels.unfollow : labels.following;
    }
    return isFollowedBy ? labels.followBack : labels.follow;
  };

  // Get icon
  const getIcon = () => {
    if (isLoading) {
      return <Loader2 size={config.icon} className="animate-spin" />;
    }
    if (isFollowing) {
      return showUnfollow ? <UserMinus size={config.icon} /> : <Check size={config.icon} />;
    }
    return <UserPlus size={config.icon} />;
  };

  // Styles based on variant and state
  const getStyles = () => {
    if (variant === 'outline') {
      if (isFollowing) {
        return {
          background: showUnfollow ? colors.red[500] + '10' : 'transparent',
          border: `1px solid ${showUnfollow ? colors.red[500] : rgba.white[30]}`,
          color: showUnfollow ? colors.red[500] : 'white',
        };
      }
      return {
        background: 'transparent',
        border: `1px solid ${colors.flame[500]}`,
        color: colors.flame[500],
      };
    }

    if (isFollowing) {
      return {
        background: showUnfollow ? colors.red[500] + '20' : rgba.white[5],
        border: `1px solid ${showUnfollow ? colors.red[500] + '40' : rgba.white[10]}`,
        color: showUnfollow ? colors.red[400] : 'white',
      };
    }

    return {
      background: gradients.flame,
      border: 'none',
      color: 'white',
    };
  };

  const styles = getStyles();

  // Compact variant
  if (variant === 'compact') {
    return (
      <m.button
        onClick={handleClick}
        disabled={isLoading}
        className={`rounded-full disabled:opacity-50 ${config.padding} ${config.text} font-semibold transition-colors ${className}`}
        style={styles}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isLoading ? (
          <Loader2 size={config.icon} className="animate-spin" />
        ) : (
          getLabel()
        )}
      </m.button>
    );
  }

  // Default & Outline variant
  return (
    <m.button
      onClick={handleClick}
      disabled={isLoading}
      className={`rounded-xl disabled:opacity-50 ${config.padding} ${config.text} font-semibold flex items-center gap-2 transition-colors ${className}`}
      style={styles}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {getIcon()}
      <span>{getLabel()}</span>
    </m.button>
  );
}

// ============================================
// Follow Stats Component
// ============================================

interface FollowStatsProps {
  followers: number;
  following: number;
  userId: string;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
  className?: string;
}

export function FollowStats({
  followers,
  following,
  userId,
  onFollowersClick,
  onFollowingClick,
  className = '',
}: FollowStatsProps) {
  const { locale } = useLocale();

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <button
        onClick={onFollowersClick}
        className="text-center hover:opacity-80 transition-opacity"
      >
        <span className="font-bold text-white">{followers.toLocaleString()}</span>
        <span className="text-sm ml-1" style={{ color: rgba.white[50] }}>
          {locale === 'ko' ? '팔로워' : 'Followers'}
        </span>
      </button>
      <button
        onClick={onFollowingClick}
        className="text-center hover:opacity-80 transition-opacity"
      >
        <span className="font-bold text-white">{following.toLocaleString()}</span>
        <span className="text-sm ml-1" style={{ color: rgba.white[50] }}>
          {locale === 'ko' ? '팔로잉' : 'Following'}
        </span>
      </button>
    </div>
  );
}

// ============================================
// Exports
// ============================================

export default FollowButton;
