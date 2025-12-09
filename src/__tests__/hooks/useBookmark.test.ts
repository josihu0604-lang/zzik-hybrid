/**
 * useBookmark Hook Tests (TST-021)
 *
 * Tests for bookmark management hook:
 * - Add/remove bookmarks
 * - LocalStorage persistence
 * - Bookmark status checking
 * - Toggle functionality
 * - usePopupBookmark variant
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBookmark, usePopupBookmark } from '@/hooks/useBookmark';

// ============================================================================
// SETUP & MOCKING
// ============================================================================

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  mockLocalStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ============================================================================
// BASIC FUNCTIONALITY
// ============================================================================

describe('useBookmark - Basic Functionality', () => {
  it('should initialize with empty bookmarks', () => {
    const { result } = renderHook(() => useBookmark());

    expect(result.current.bookmarks).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it('should add bookmark', () => {
    const { result } = renderHook(() => useBookmark());

    act(() => {
      result.current.addBookmark('popup-123');
    });

    expect(result.current.bookmarks).toContain('popup-123');
    expect(result.current.count).toBe(1);
  });

  it('should remove bookmark', () => {
    const { result } = renderHook(() => useBookmark());

    act(() => {
      result.current.addBookmark('popup-123');
      result.current.removeBookmark('popup-123');
    });

    expect(result.current.bookmarks).not.toContain('popup-123');
    expect(result.current.count).toBe(0);
  });

  it('should check if bookmark exists', () => {
    const { result } = renderHook(() => useBookmark());

    act(() => {
      result.current.addBookmark('popup-123');
    });

    expect(result.current.isBookmarked('popup-123')).toBe(true);
    expect(result.current.isBookmarked('popup-456')).toBe(false);
  });

  it('should toggle bookmark on', () => {
    const { result } = renderHook(() => useBookmark());

    let wasBookmarked: boolean = false;

    act(() => {
      wasBookmarked = result.current.toggleBookmark('popup-123');
    });

    expect(wasBookmarked).toBe(true);
    expect(result.current.isBookmarked('popup-123')).toBe(true);
  });

  it('should toggle bookmark off', () => {
    const { result } = renderHook(() => useBookmark());

    act(() => {
      result.current.addBookmark('popup-123');
    });

    let wasBookmarked: boolean = true;

    act(() => {
      wasBookmarked = result.current.toggleBookmark('popup-123');
    });

    expect(wasBookmarked).toBe(false);
    expect(result.current.isBookmarked('popup-123')).toBe(false);
  });
});

// ============================================================================
// MULTIPLE BOOKMARKS
// ============================================================================

describe('useBookmark - Multiple Bookmarks', () => {
  it('should add multiple bookmarks', () => {
    const { result } = renderHook(() => useBookmark());

    act(() => {
      result.current.addBookmark('popup-1');
      result.current.addBookmark('popup-2');
      result.current.addBookmark('popup-3');
    });

    expect(result.current.bookmarks).toHaveLength(3);
    expect(result.current.count).toBe(3);
  });

  it('should maintain order of bookmarks', () => {
    const { result } = renderHook(() => useBookmark());

    act(() => {
      result.current.addBookmark('popup-1');
      result.current.addBookmark('popup-2');
      result.current.addBookmark('popup-3');
    });

    expect(result.current.bookmarks).toEqual(['popup-1', 'popup-2', 'popup-3']);
  });

  it('should not add duplicate bookmarks', () => {
    const { result } = renderHook(() => useBookmark());

    act(() => {
      result.current.addBookmark('popup-123');
      result.current.addBookmark('popup-123');
      result.current.addBookmark('popup-123');
    });

    expect(result.current.bookmarks).toHaveLength(1);
    expect(result.current.count).toBe(1);
  });

  it('should remove specific bookmark from list', () => {
    const { result } = renderHook(() => useBookmark());

    act(() => {
      result.current.addBookmark('popup-1');
      result.current.addBookmark('popup-2');
      result.current.addBookmark('popup-3');
      result.current.removeBookmark('popup-2');
    });

    expect(result.current.bookmarks).toEqual(['popup-1', 'popup-3']);
    expect(result.current.count).toBe(2);
  });

  it('should clear all bookmarks', () => {
    const { result } = renderHook(() => useBookmark());

    act(() => {
      result.current.addBookmark('popup-1');
      result.current.addBookmark('popup-2');
      result.current.addBookmark('popup-3');
      result.current.clearBookmarks();
    });

    expect(result.current.bookmarks).toEqual([]);
    expect(result.current.count).toBe(0);
  });
});

// ============================================================================
// LOCALSTORAGE PERSISTENCE
// ============================================================================

describe('useBookmark - LocalStorage Persistence', () => {
  it('should save bookmarks to localStorage', () => {
    const { result } = renderHook(() => useBookmark());

    act(() => {
      result.current.addBookmark('popup-123');
    });

    const stored = mockLocalStorage.getItem('zzik_bookmarks');
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].popupId).toBe('popup-123');
  });

  it('should load bookmarks from localStorage on mount', () => {
    // Pre-populate localStorage
    const existingBookmarks = [
      { popupId: 'popup-1', bookmarkedAt: new Date().toISOString() },
      { popupId: 'popup-2', bookmarkedAt: new Date().toISOString() },
    ];

    mockLocalStorage.setItem('zzik_bookmarks', JSON.stringify(existingBookmarks));

    const { result } = renderHook(() => useBookmark());

    expect(result.current.bookmarks).toEqual(['popup-1', 'popup-2']);
    expect(result.current.count).toBe(2);
  });

  it('should include timestamp when adding bookmark', () => {
    const { result } = renderHook(() => useBookmark());

    act(() => {
      result.current.addBookmark('popup-123');
    });

    const stored = mockLocalStorage.getItem('zzik_bookmarks');
    const parsed = JSON.parse(stored!);

    expect(parsed[0].bookmarkedAt).toBeTruthy();
    expect(new Date(parsed[0].bookmarkedAt).getTime()).toBeGreaterThan(0);
  });

  it('should update localStorage when removing bookmark', () => {
    const { result } = renderHook(() => useBookmark());

    act(() => {
      result.current.addBookmark('popup-1');
      result.current.addBookmark('popup-2');
      result.current.removeBookmark('popup-1');
    });

    const stored = mockLocalStorage.getItem('zzik_bookmarks');
    const parsed = JSON.parse(stored!);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].popupId).toBe('popup-2');
  });

  it('should clear localStorage when clearing all bookmarks', () => {
    const { result } = renderHook(() => useBookmark());

    act(() => {
      result.current.addBookmark('popup-1');
    });

    expect(result.current.bookmarks).toHaveLength(1);

    act(() => {
      result.current.clearBookmarks();
    });

    const stored = mockLocalStorage.getItem('zzik_bookmarks');
    const parsed = JSON.parse(stored!);

    expect(parsed).toEqual([]);
    expect(result.current.bookmarks).toEqual([]);
  });

  it('should handle corrupted localStorage data', () => {
    mockLocalStorage.setItem('zzik_bookmarks', 'invalid json');

    const { result } = renderHook(() => useBookmark());

    expect(result.current.bookmarks).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it('should handle localStorage errors gracefully', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock mockLocalStorage.setItem to throw
    const originalSetItem = mockLocalStorage.setItem;
    mockLocalStorage.setItem = () => {
      throw new Error('Storage quota exceeded');
    };

    const { result } = renderHook(() => useBookmark());

    act(() => {
      result.current.addBookmark('popup-123');
    });

    expect(consoleError).toHaveBeenCalledWith(
      '[useBookmark] Failed to save bookmarks:',
      expect.any(Error)
    );

    // Restore
    mockLocalStorage.setItem = originalSetItem;
    consoleError.mockRestore();
  });
});

// ============================================================================
// usePopupBookmark - Specific Popup Variant
// ============================================================================

describe('usePopupBookmark - Single Popup Variant', () => {
  it('should check bookmark status for specific popup', () => {
    // Pre-populate with bookmark
    const existingBookmarks = [{ popupId: 'popup-123', bookmarkedAt: new Date().toISOString() }];
    mockLocalStorage.setItem('zzik_bookmarks', JSON.stringify(existingBookmarks));

    const { result } = renderHook(() => usePopupBookmark('popup-123'));

    expect(result.current.isBookmarked).toBe(true);
  });

  it('should return false for non-bookmarked popup', () => {
    const { result } = renderHook(() => usePopupBookmark('popup-456'));

    expect(result.current.isBookmarked).toBe(false);
  });

  it('should toggle bookmark for specific popup', () => {
    const { result } = renderHook(() => usePopupBookmark('popup-123'));

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isBookmarked).toBe(true);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isBookmarked).toBe(false);
  });

  it('should update when toggled', () => {
    const { result } = renderHook(() => usePopupBookmark('popup-123'));

    expect(result.current.isBookmarked).toBe(false);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isBookmarked).toBe(true);
  });

  it('should work independently for different popups', () => {
    const { result: result1 } = renderHook(() => usePopupBookmark('popup-1'));
    const { result: result2 } = renderHook(() => usePopupBookmark('popup-2'));

    act(() => {
      result1.current.toggle();
    });

    expect(result1.current.isBookmarked).toBe(true);
    expect(result2.current.isBookmarked).toBe(false);

    act(() => {
      result2.current.toggle();
    });

    expect(result1.current.isBookmarked).toBe(true);
    expect(result2.current.isBookmarked).toBe(true);
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('useBookmark - Edge Cases', () => {
  it('should handle empty popup ID', () => {
    const { result } = renderHook(() => useBookmark());

    act(() => {
      result.current.addBookmark('');
    });

    expect(result.current.bookmarks).toContain('');
  });

  it('should handle special characters in popup ID', () => {
    const { result } = renderHook(() => useBookmark());

    act(() => {
      result.current.addBookmark('popup-123-@#$%');
    });

    expect(result.current.isBookmarked('popup-123-@#$%')).toBe(true);
  });

  it('should handle removing non-existent bookmark', () => {
    const { result } = renderHook(() => useBookmark());

    act(() => {
      result.current.removeBookmark('non-existent');
    });

    expect(result.current.bookmarks).toEqual([]);
  });

  it('should maintain state across re-renders', () => {
    const { result, rerender } = renderHook(() => useBookmark());

    act(() => {
      result.current.addBookmark('popup-123');
    });

    rerender();

    expect(result.current.bookmarks).toContain('popup-123');
  });
});
