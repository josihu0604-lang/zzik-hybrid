/**
 * Social Store - Zustand state management for social features
 * 
 * Manages:
 * - User profiles
 * - Followers/Following
 * - Activity feed
 * - Social interactions
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ===========================================
// Types
// ===========================================

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  country: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  stats: {
    experiences: number;
    reviews: number;
    followers: number;
    following: number;
    badges: number;
    points: number;
  };
  badges: Badge[];
  recentActivity: Activity[];
  isFollowing?: boolean;
  isOwnProfile?: boolean;
}

export interface UserSummary {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  tier: string;
  isFollowing?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: string;
  earnedAt: string;
}

export type ActivityType = 'booking' | 'review' | 'badge' | 'checkin' | 'follow';

export interface Activity {
  id: string;
  type: ActivityType;
  content: object;
  createdAt: string;
}

export interface FeedItem {
  id: string;
  type: ActivityType;
  user: UserSummary;
  content: object;
  targetId?: string;
  targetType?: string;
  createdAt: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

export type FeedType = 'all' | 'following' | 'trending';

// ===========================================
// Store State Interface
// ===========================================

interface SocialState {
  // State - Current user's profile
  profile: UserProfile | null;
  
  // State - Viewed profiles (userId -> profile)
  profiles: Map<string, UserProfile>;
  
  // State - Followers/Following (userId -> users)
  followers: Map<string, UserSummary[]>;
  following: Map<string, UserSummary[]>;
  
  // State - Feed
  feed: FeedItem[];
  feedType: FeedType;
  feedPage: number;
  hasMoreFeed: boolean;
  
  // State - UI
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  
  // Actions - Profile
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  cacheProfile: (profile: UserProfile) => void;
  getCachedProfile: (userId: string) => UserProfile | undefined;
  
  // Actions - Follow
  setFollowers: (userId: string, users: UserSummary[]) => void;
  setFollowing: (userId: string, users: UserSummary[]) => void;
  addFollower: (userId: string, user: UserSummary) => void;
  removeFollower: (userId: string, targetId: string) => void;
  addFollowing: (userId: string, user: UserSummary) => void;
  removeFollowing: (userId: string, targetId: string) => void;
  
  // Actions - Feed
  setFeed: (items: FeedItem[]) => void;
  appendFeed: (items: FeedItem[]) => void;
  setFeedType: (type: FeedType) => void;
  setFeedPage: (page: number) => void;
  setHasMoreFeed: (hasMore: boolean) => void;
  likeFeedItem: (itemId: string) => void;
  unlikeFeedItem: (itemId: string) => void;
  
  // Actions - UI
  setLoading: (loading: boolean) => void;
  setLoadingMore: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Actions - Async
  fetchProfile: (userId: string) => Promise<UserProfile | null>;
  fetchMyProfile: () => Promise<void>;
  fetchFollowers: (userId: string, params?: { page?: number; limit?: number }) => Promise<void>;
  fetchFollowing: (userId: string, params?: { page?: number; limit?: number }) => Promise<void>;
  fetchFeed: (type?: FeedType, page?: number) => Promise<void>;
  follow: (targetUserId: string) => Promise<{ success: boolean; followersCount: number }>;
  unfollow: (targetUserId: string) => Promise<{ success: boolean; followersCount: number }>;
  updateMyProfile: (data: {
    displayName?: string;
    bio?: string;
    avatar?: string;
    country?: string;
  }) => Promise<void>;
  
  // Actions - Reset
  reset: () => void;
  clearFeed: () => void;
}

// ===========================================
// Initial State
// ===========================================

const initialState = {
  profile: null,
  profiles: new Map<string, UserProfile>(),
  followers: new Map<string, UserSummary[]>(),
  following: new Map<string, UserSummary[]>(),
  feed: [],
  feedType: 'all' as FeedType,
  feedPage: 1,
  hasMoreFeed: true,
  isLoading: false,
  isLoadingMore: false,
  error: null,
};

// ===========================================
// Store Implementation
// ===========================================

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Profile Actions
      setProfile: (profile) => {
        set({ profile });
        get().cacheProfile(profile);
      },
      
      updateProfile: (updates) => {
        set(state => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        }));
      },
      
      cacheProfile: (profile) => {
        set(state => {
          const newProfiles = new Map(state.profiles);
          newProfiles.set(profile.id, profile);
          return { profiles: newProfiles };
        });
      },
      
      getCachedProfile: (userId) => {
        return get().profiles.get(userId);
      },
      
      // Follow Actions
      setFollowers: (userId, users) => {
        set(state => {
          const newFollowers = new Map(state.followers);
          newFollowers.set(userId, users);
          return { followers: newFollowers };
        });
      },
      
      setFollowing: (userId, users) => {
        set(state => {
          const newFollowing = new Map(state.following);
          newFollowing.set(userId, users);
          return { following: newFollowing };
        });
      },
      
      addFollower: (userId, user) => {
        set(state => {
          const newFollowers = new Map(state.followers);
          const existing = newFollowers.get(userId) || [];
          newFollowers.set(userId, [user, ...existing]);
          return { followers: newFollowers };
        });
      },
      
      removeFollower: (userId, targetId) => {
        set(state => {
          const newFollowers = new Map(state.followers);
          const existing = newFollowers.get(userId) || [];
          newFollowers.set(userId, existing.filter(u => u.id !== targetId));
          return { followers: newFollowers };
        });
      },
      
      addFollowing: (userId, user) => {
        set(state => {
          const newFollowing = new Map(state.following);
          const existing = newFollowing.get(userId) || [];
          newFollowing.set(userId, [user, ...existing]);
          return { following: newFollowing };
        });
      },
      
      removeFollowing: (userId, targetId) => {
        set(state => {
          const newFollowing = new Map(state.following);
          const existing = newFollowing.get(userId) || [];
          newFollowing.set(userId, existing.filter(u => u.id !== targetId));
          return { following: newFollowing };
        });
      },
      
      // Feed Actions
      setFeed: (items) => {
        set({ feed: items });
      },
      
      appendFeed: (items) => {
        set(state => ({
          feed: [...state.feed, ...items],
        }));
      },
      
      setFeedType: (type) => {
        set({ feedType: type, feedPage: 1, hasMoreFeed: true });
      },
      
      setFeedPage: (page) => {
        set({ feedPage: page });
      },
      
      setHasMoreFeed: (hasMore) => {
        set({ hasMoreFeed: hasMore });
      },
      
      likeFeedItem: (itemId) => {
        set(state => ({
          feed: state.feed.map(item =>
            item.id === itemId
              ? { ...item, isLiked: true, likes: item.likes + 1 }
              : item
          ),
        }));
      },
      
      unlikeFeedItem: (itemId) => {
        set(state => ({
          feed: state.feed.map(item =>
            item.id === itemId
              ? { ...item, isLiked: false, likes: Math.max(0, item.likes - 1) }
              : item
          ),
        }));
      },
      
      // UI Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setLoadingMore: (loading) => set({ isLoadingMore: loading }),
      setError: (error) => set({ error }),
      
      // Async Actions
      fetchProfile: async (userId) => {
        const { setLoading, setError, cacheProfile, getCachedProfile } = get();
        
        // Check cache first
        const cached = getCachedProfile(userId);
        if (cached) {
          return cached;
        }
        
        setLoading(true);
        setError(null);
        
        try {
          const response = await fetch(`/api/social/users/${userId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch profile');
          }
          
          const data = await response.json();
          cacheProfile(data.user);
          return data.user;
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error');
          return null;
        } finally {
          setLoading(false);
        }
      },
      
      fetchMyProfile: async () => {
        const { setLoading, setError, setProfile } = get();
        setLoading(true);
        setError(null);
        
        try {
          const response = await fetch('/api/me');
          if (!response.ok) {
            throw new Error('Failed to fetch profile');
          }
          
          const data = await response.json();
          if (data.user) {
            setProfile(data.user);
          }
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error');
        } finally {
          setLoading(false);
        }
      },
      
      fetchFollowers: async (userId, params = {}) => {
        const { setLoading, setError, setFollowers } = get();
        setLoading(true);
        setError(null);
        
        try {
          const queryParams = new URLSearchParams({
            userId,
            type: 'followers',
            page: String(params.page || 1),
            limit: String(params.limit || 20),
          });
          
          const response = await fetch(`/api/social/followers?${queryParams}`);
          if (!response.ok) {
            throw new Error('Failed to fetch followers');
          }
          
          const data = await response.json();
          setFollowers(userId, data.users);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error');
        } finally {
          setLoading(false);
        }
      },
      
      fetchFollowing: async (userId, params = {}) => {
        const { setLoading, setError, setFollowing } = get();
        setLoading(true);
        setError(null);
        
        try {
          const queryParams = new URLSearchParams({
            userId,
            type: 'following',
            page: String(params.page || 1),
            limit: String(params.limit || 20),
          });
          
          const response = await fetch(`/api/social/followers?${queryParams}`);
          if (!response.ok) {
            throw new Error('Failed to fetch following');
          }
          
          const data = await response.json();
          setFollowing(userId, data.users);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error');
        } finally {
          setLoading(false);
        }
      },
      
      fetchFeed: async (type, page) => {
        const { feedType, feedPage, setLoading, setLoadingMore, setError, setFeed, appendFeed, setHasMoreFeed, setFeedPage } = get();
        
        const feedTypeToUse = type || feedType;
        const pageToUse = page || feedPage;
        const isFirstPage = pageToUse === 1;
        
        if (isFirstPage) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);
        
        try {
          const queryParams = new URLSearchParams({
            type: feedTypeToUse,
            page: String(pageToUse),
            limit: '20',
          });
          
          const response = await fetch(`/api/social/feed?${queryParams}`);
          if (!response.ok) {
            throw new Error('Failed to fetch feed');
          }
          
          const data = await response.json();
          
          if (isFirstPage) {
            setFeed(data.items);
          } else {
            appendFeed(data.items);
          }
          
          setHasMoreFeed(data.hasMore);
          setFeedPage(pageToUse + 1);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error');
        } finally {
          setLoading(false);
          setLoadingMore(false);
        }
      },
      
      follow: async (targetUserId) => {
        const { setError, profile, addFollowing, updateProfile, cacheProfile, profiles } = get();
        
        try {
          const response = await fetch('/api/social/follow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetUserId }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to follow user');
          }
          
          const data = await response.json();
          
          // Update following list
          if (profile) {
            const targetProfile = profiles.get(targetUserId);
            if (targetProfile) {
              addFollowing(profile.id, {
                id: targetProfile.id,
                username: targetProfile.username,
                displayName: targetProfile.displayName,
                avatar: targetProfile.avatar,
                bio: targetProfile.bio,
                tier: targetProfile.tier,
                isFollowing: true,
              });
              
              // Update cached profile
              cacheProfile({
                ...targetProfile,
                isFollowing: true,
                stats: {
                  ...targetProfile.stats,
                  followers: data.followersCount,
                },
              });
            }
            
            // Update own profile stats
            updateProfile({
              stats: {
                ...profile.stats,
                following: profile.stats.following + 1,
              },
            });
          }
          
          return { success: true, followersCount: data.followersCount };
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error');
          return { success: false, followersCount: 0 };
        }
      },
      
      unfollow: async (targetUserId) => {
        const { setError, profile, removeFollowing, updateProfile, cacheProfile, profiles } = get();
        
        try {
          const response = await fetch('/api/social/follow', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetUserId }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to unfollow user');
          }
          
          const data = await response.json();
          
          // Update following list
          if (profile) {
            removeFollowing(profile.id, targetUserId);
            
            // Update cached profile
            const targetProfile = profiles.get(targetUserId);
            if (targetProfile) {
              cacheProfile({
                ...targetProfile,
                isFollowing: false,
                stats: {
                  ...targetProfile.stats,
                  followers: data.followersCount,
                },
              });
            }
            
            // Update own profile stats
            updateProfile({
              stats: {
                ...profile.stats,
                following: Math.max(0, profile.stats.following - 1),
              },
            });
          }
          
          return { success: true, followersCount: data.followersCount };
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error');
          return { success: false, followersCount: 0 };
        }
      },
      
      updateMyProfile: async (data) => {
        const { setLoading, setError, updateProfile } = get();
        setLoading(true);
        setError(null);
        
        try {
          const response = await fetch('/api/account', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          
          if (!response.ok) {
            throw new Error('Failed to update profile');
          }
          
          updateProfile(data);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error');
          throw error;
        } finally {
          setLoading(false);
        }
      },
      
      // Reset
      reset: () => {
        set({
          ...initialState,
          profiles: new Map(),
          followers: new Map(),
          following: new Map(),
        });
      },
      
      clearFeed: () => {
        set({ feed: [], feedPage: 1, hasMoreFeed: true });
      },
    }),
    {
      name: 'zzik-social-storage',
      partialize: (state) => ({
        // Only persist basic profile info
        profile: state.profile ? {
          id: state.profile.id,
          username: state.profile.username,
          displayName: state.profile.displayName,
          avatar: state.profile.avatar,
          tier: state.profile.tier,
        } : null,
      }),
    }
  )
);

// ===========================================
// Selectors
// ===========================================

export const selectIsFollowing = (userId: string) => (state: SocialState) => {
  const profile = state.profiles.get(userId);
  return profile?.isFollowing || false;
};

export const selectFollowersCount = (userId: string) => (state: SocialState) => {
  const profile = state.profiles.get(userId);
  return profile?.stats.followers || 0;
};

export const selectFollowingCount = (userId: string) => (state: SocialState) => {
  const profile = state.profiles.get(userId);
  return profile?.stats.following || 0;
};
