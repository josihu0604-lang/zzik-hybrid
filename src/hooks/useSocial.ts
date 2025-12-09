/**
 * useSocial - Social features hooks
 * 
 * Provides easy-to-use interfaces for:
 * - User profiles
 * - Follow system
 * - Activity feed
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  useSocialStore,
  selectIsFollowing,
  selectFollowersCount,
  selectFollowingCount,
  type UserProfile,
  type UserSummary,
  type FeedItem,
  type FeedType,
} from '@/stores';
import { useHaptic } from './useHaptic';

// ===========================================
// useProfile - User profile hook
// ===========================================

export interface UseProfileOptions {
  userId?: string;
  autoFetch?: boolean;
}

export interface UseProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isOwnProfile: boolean;
  refresh: () => Promise<void>;
  updateProfile: (data: {
    displayName?: string;
    bio?: string;
    avatar?: string;
    country?: string;
  }) => Promise<boolean>;
}

export function useProfile(options: UseProfileOptions = {}): UseProfileReturn {
  const { userId, autoFetch = true } = options;
  
  const store = useSocialStore();
  const { triggerHaptic } = useHaptic();
  
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  // Fetch profile
  const fetchProfile = useCallback(async () => {
    if (userId) {
      const profile = await store.fetchProfile(userId);
      setProfileData(profile);
      setIsOwnProfile(profile?.isOwnProfile || false);
    } else {
      await store.fetchMyProfile();
      setProfileData(store.profile);
      setIsOwnProfile(true);
    }
  }, [store, userId]);
  
  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchProfile();
    }
  }, [autoFetch, fetchProfile]);
  
  // Update own profile
  const updateProfile = useCallback(async (data: {
    displayName?: string;
    bio?: string;
    avatar?: string;
    country?: string;
  }): Promise<boolean> => {
    if (!isOwnProfile) return false;
    
    try {
      await store.updateMyProfile(data);
      triggerHaptic('success');
      return true;
    } catch (error) {
      triggerHaptic('error');
      return false;
    }
  }, [store, isOwnProfile, triggerHaptic]);
  
  return {
    profile: userId ? profileData : store.profile,
    isLoading: store.isLoading,
    error: store.error,
    isOwnProfile,
    refresh: fetchProfile,
    updateProfile,
  };
}

// ===========================================
// useFollow - Follow/unfollow hook
// ===========================================

export interface UseFollowOptions {
  targetUserId: string;
  initialIsFollowing?: boolean;
}

export interface UseFollowReturn {
  isFollowing: boolean;
  followersCount: number;
  isLoading: boolean;
  toggle: () => Promise<void>;
  follow: () => Promise<void>;
  unfollow: () => Promise<void>;
}

export function useFollow(options: UseFollowOptions): UseFollowReturn {
  const { targetUserId, initialIsFollowing = false } = options;
  
  const store = useSocialStore();
  const { triggerHaptic } = useHaptic();
  
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Sync with store
  useEffect(() => {
    const profile = store.profiles.get(targetUserId);
    if (profile) {
      setIsFollowing(profile.isFollowing || false);
      setFollowersCount(profile.stats.followers);
    }
  }, [store.profiles, targetUserId]);
  
  // Follow
  const follow = useCallback(async () => {
    if (isFollowing || isLoading) return;
    
    setIsLoading(true);
    
    // Optimistic update
    setIsFollowing(true);
    setFollowersCount(prev => prev + 1);
    
    try {
      const result = await store.follow(targetUserId);
      if (!result.success) {
        // Revert on failure
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
      } else {
        setFollowersCount(result.followersCount);
        triggerHaptic('success');
      }
    } catch (error) {
      setIsFollowing(false);
      setFollowersCount(prev => prev - 1);
      triggerHaptic('error');
    } finally {
      setIsLoading(false);
    }
  }, [store, targetUserId, isFollowing, isLoading, triggerHaptic]);
  
  // Unfollow
  const unfollow = useCallback(async () => {
    if (!isFollowing || isLoading) return;
    
    setIsLoading(true);
    
    // Optimistic update
    setIsFollowing(false);
    setFollowersCount(prev => Math.max(0, prev - 1));
    
    try {
      const result = await store.unfollow(targetUserId);
      if (!result.success) {
        // Revert on failure
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      } else {
        setFollowersCount(result.followersCount);
        triggerHaptic('warning');
      }
    } catch (error) {
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
      triggerHaptic('error');
    } finally {
      setIsLoading(false);
    }
  }, [store, targetUserId, isFollowing, isLoading, triggerHaptic]);
  
  // Toggle
  const toggle = useCallback(async () => {
    if (isFollowing) {
      await unfollow();
    } else {
      await follow();
    }
  }, [isFollowing, follow, unfollow]);
  
  return {
    isFollowing,
    followersCount,
    isLoading,
    toggle,
    follow,
    unfollow,
  };
}

// ===========================================
// useFollowers - Followers/Following list hook
// ===========================================

export interface UseFollowersOptions {
  userId: string;
  type: 'followers' | 'following';
  autoFetch?: boolean;
}

export interface UseFollowersReturn {
  users: UserSummary[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  fetchMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useFollowers(options: UseFollowersOptions): UseFollowersReturn {
  const { userId, type, autoFetch = true } = options;
  
  const store = useSocialStore();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Get users from store
  const users = type === 'followers' 
    ? store.followers.get(userId) || []
    : store.following.get(userId) || [];
  
  // Fetch
  const fetchUsers = useCallback(async (pageNum = 1) => {
    if (type === 'followers') {
      await store.fetchFollowers(userId, { page: pageNum, limit: 20 });
    } else {
      await store.fetchFollowing(userId, { page: pageNum, limit: 20 });
    }
    setPage(pageNum);
  }, [store, userId, type]);
  
  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchUsers(1);
    }
  }, [autoFetch, fetchUsers]);
  
  // Fetch more
  const fetchMore = useCallback(async () => {
    if (!hasMore || store.isLoading) return;
    await fetchUsers(page + 1);
  }, [fetchUsers, page, hasMore, store.isLoading]);
  
  return {
    users,
    isLoading: store.isLoading,
    error: store.error,
    hasMore,
    fetchMore,
    refresh: () => fetchUsers(1),
  };
}

// ===========================================
// useFeed - Activity feed hook
// ===========================================

export interface UseFeedOptions {
  type?: FeedType;
  autoFetch?: boolean;
}

export interface UseFeedReturn {
  items: FeedItem[];
  feedType: FeedType;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  setFeedType: (type: FeedType) => void;
  fetchMore: () => Promise<void>;
  refresh: () => Promise<void>;
  likeFeedItem: (itemId: string) => void;
}

export function useFeed(options: UseFeedOptions = {}): UseFeedReturn {
  const { type: initialType = 'all', autoFetch = true } = options;
  
  const store = useSocialStore();
  const { triggerHaptic } = useHaptic();
  
  // Set initial type
  useEffect(() => {
    if (initialType !== store.feedType) {
      store.setFeedType(initialType);
    }
  }, []);
  
  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      store.fetchFeed();
    }
  }, [autoFetch, store.feedType]);
  
  // Set feed type
  const setFeedType = useCallback((type: FeedType) => {
    store.setFeedType(type);
    store.clearFeed();
    store.fetchFeed(type, 1);
  }, [store]);
  
  // Fetch more
  const fetchMore = useCallback(async () => {
    if (!store.hasMoreFeed || store.isLoadingMore) return;
    await store.fetchFeed(undefined, store.feedPage);
  }, [store]);
  
  // Like feed item
  const likeFeedItem = useCallback((itemId: string) => {
    const item = store.feed.find(i => i.id === itemId);
    if (item?.isLiked) {
      store.unlikeFeedItem(itemId);
    } else {
      store.likeFeedItem(itemId);
    }
    triggerHaptic('selection');
  }, [store, triggerHaptic]);
  
  return {
    items: store.feed,
    feedType: store.feedType,
    isLoading: store.isLoading,
    isLoadingMore: store.isLoadingMore,
    error: store.error,
    hasMore: store.hasMoreFeed,
    setFeedType,
    fetchMore,
    refresh: () => {
      store.clearFeed();
      return store.fetchFeed(store.feedType, 1);
    },
    likeFeedItem,
  };
}

// ===========================================
// useUserSearch - Search users hook
// ===========================================

export interface UseUserSearchReturn {
  results: UserSummary[];
  isLoading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clear: () => void;
}

export function useUserSearch(): UseUserSearchReturn {
  const [results, setResults] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search
  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/social/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setResults(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Clear
  const clear = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);
  
  return {
    results,
    isLoading,
    error,
    search,
    clear,
  };
}
