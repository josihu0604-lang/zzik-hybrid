'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * useBookmark - 팝업 북마크 관리 훅
 *
 * localStorage 기반 북마크 저장
 * - 로그인 사용자: 추후 Supabase 동기화 가능
 * - 게스트: localStorage만 사용
 */

const STORAGE_KEY = 'zzik_bookmarks';

export interface BookmarkItem {
  popupId: string;
  bookmarkedAt: string;
}

export interface UseBookmarkReturn {
  /** 북마크된 팝업 ID 목록 */
  bookmarks: string[];
  /** 특정 팝업이 북마크되었는지 확인 */
  isBookmarked: (popupId: string) => boolean;
  /** 북마크 추가 */
  addBookmark: (popupId: string) => void;
  /** 북마크 제거 */
  removeBookmark: (popupId: string) => void;
  /** 북마크 토글 */
  toggleBookmark: (popupId: string) => boolean;
  /** 전체 북마크 초기화 */
  clearBookmarks: () => void;
  /** 북마크 개수 */
  count: number;
}

/**
 * localStorage에서 북마크 로드
 */
function loadBookmarks(): BookmarkItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('[useBookmark] Failed to load bookmarks:', error);
  }

  return [];
}

/**
 * localStorage에 북마크 저장
 */
function saveBookmarks(bookmarks: BookmarkItem[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (error) {
    console.error('[useBookmark] Failed to save bookmarks:', error);
  }
}

export function useBookmark(): UseBookmarkReturn {
  const [bookmarkItems, setBookmarkItems] = useState<BookmarkItem[]>([]);

  // 초기 로드
  useEffect(() => {
    setBookmarkItems(loadBookmarks());
  }, []);

  // 북마크 ID 목록
  const bookmarks = bookmarkItems.map((item) => item.popupId);

  // 북마크 여부 확인
  const isBookmarked = useCallback(
    (popupId: string): boolean => {
      return bookmarks.includes(popupId);
    },
    [bookmarks]
  );

  // 북마크 추가
  const addBookmark = useCallback((popupId: string): void => {
    setBookmarkItems((prev) => {
      // 이미 존재하면 무시
      if (prev.some((item) => item.popupId === popupId)) {
        return prev;
      }

      const newBookmarks = [
        ...prev,
        {
          popupId,
          bookmarkedAt: new Date().toISOString(),
        },
      ];

      saveBookmarks(newBookmarks);
      return newBookmarks;
    });
  }, []);

  // 북마크 제거
  const removeBookmark = useCallback((popupId: string): void => {
    setBookmarkItems((prev) => {
      const newBookmarks = prev.filter((item) => item.popupId !== popupId);
      saveBookmarks(newBookmarks);
      return newBookmarks;
    });
  }, []);

  // 북마크 토글 (추가/제거)
  const toggleBookmark = useCallback(
    (popupId: string): boolean => {
      const wasBookmarked = isBookmarked(popupId);

      if (wasBookmarked) {
        removeBookmark(popupId);
        return false;
      } else {
        addBookmark(popupId);
        return true;
      }
    },
    [isBookmarked, addBookmark, removeBookmark]
  );

  // 전체 초기화
  const clearBookmarks = useCallback((): void => {
    setBookmarkItems([]);
    saveBookmarks([]);
  }, []);

  return {
    bookmarks,
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    clearBookmarks,
    count: bookmarks.length,
  };
}

/**
 * 특정 팝업의 북마크 상태만 관리하는 간단한 훅
 */
export function usePopupBookmark(popupId: string) {
  const { isBookmarked, toggleBookmark } = useBookmark();

  const bookmarked = isBookmarked(popupId);

  const toggle = useCallback(() => {
    return toggleBookmark(popupId);
  }, [popupId, toggleBookmark]);

  return {
    isBookmarked: bookmarked,
    toggle,
  };
}

export default useBookmark;
