'use client';

import { useState, useCallback, useMemo } from 'react';

/**
 * useSearch - 팝업 검색 및 필터 관리 훅
 *
 * Features:
 * - 키워드 검색
 * - 카테고리 필터
 * - 상태 필터
 * - 정렬 옵션
 */

export type PopupCategory =
  | 'fashion'
  | 'beauty'
  | 'kpop'
  | 'food'
  | 'cafe'
  | 'lifestyle'
  | 'culture'
  | 'tech';

export type PopupStatus = 'funding' | 'confirmed' | 'completed' | 'cancelled';

export type SortOption = 'deadline' | 'popular' | 'latest' | 'progress';

export interface SearchFilters {
  /** 검색어 */
  query: string;
  /** 카테고리 필터 (복수 선택 가능) */
  categories: PopupCategory[];
  /** 상태 필터 */
  status: PopupStatus | 'all';
  /** 정렬 옵션 */
  sort: SortOption;
}

export interface PopupItem {
  id: string;
  brandName: string;
  title: string;
  category: PopupCategory;
  status: PopupStatus;
  currentParticipants: number;
  goalParticipants: number;
  deadlineAt: string;
  location?: string;
}

export interface UseSearchReturn {
  /** 현재 필터 상태 */
  filters: SearchFilters;
  /** 검색어 설정 */
  setQuery: (query: string) => void;
  /** 카테고리 토글 */
  toggleCategory: (category: PopupCategory) => void;
  /** 카테고리 전체 설정 */
  setCategories: (categories: PopupCategory[]) => void;
  /** 상태 필터 설정 */
  setStatus: (status: PopupStatus | 'all') => void;
  /** 정렬 옵션 설정 */
  setSort: (sort: SortOption) => void;
  /** 필터 초기화 */
  resetFilters: () => void;
  /** 활성 필터 개수 */
  activeFilterCount: number;
  /** 팝업 목록 필터링 */
  filterPopups: (popups: PopupItem[]) => PopupItem[];
}

const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  categories: [],
  status: 'all',
  sort: 'deadline',
};

// 카테고리 라벨
export const CATEGORY_LABELS: Record<PopupCategory, string> = {
  fashion: '패션',
  beauty: '뷰티',
  kpop: 'K-Pop',
  food: '맛집',
  cafe: '카페',
  lifestyle: '라이프',
  culture: '문화',
  tech: '테크',
};

// 상태 라벨
export const STATUS_LABELS: Record<PopupStatus | 'all', string> = {
  all: '전체',
  funding: '펀딩 중',
  confirmed: '오픈 확정',
  completed: '종료',
  cancelled: '취소됨',
};

// 정렬 라벨
export const SORT_LABELS: Record<SortOption, string> = {
  deadline: '마감 임박',
  popular: '인기순',
  latest: '최신순',
  progress: '진행률순',
};

export function useSearch(): UseSearchReturn {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);

  // 검색어 설정
  const setQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, query }));
  }, []);

  // 카테고리 토글
  const toggleCategory = useCallback((category: PopupCategory) => {
    setFilters((prev) => {
      const exists = prev.categories.includes(category);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((c) => c !== category)
          : [...prev.categories, category],
      };
    });
  }, []);

  // 카테고리 전체 설정
  const setCategories = useCallback((categories: PopupCategory[]) => {
    setFilters((prev) => ({ ...prev, categories }));
  }, []);

  // 상태 필터 설정
  const setStatus = useCallback((status: PopupStatus | 'all') => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  // 정렬 옵션 설정
  const setSort = useCallback((sort: SortOption) => {
    setFilters((prev) => ({ ...prev, sort }));
  }, []);

  // 필터 초기화
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // 활성 필터 개수
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.query) count++;
    if (filters.categories.length > 0) count += filters.categories.length;
    if (filters.status !== 'all') count++;
    if (filters.sort !== 'deadline') count++;
    return count;
  }, [filters]);

  // 팝업 필터링
  const filterPopups = useCallback(
    (popups: PopupItem[]): PopupItem[] => {
      let result = [...popups];

      // 1. 검색어 필터
      if (filters.query) {
        const query = filters.query.toLowerCase();
        result = result.filter(
          (popup) =>
            popup.brandName.toLowerCase().includes(query) ||
            popup.title.toLowerCase().includes(query) ||
            popup.location?.toLowerCase().includes(query)
        );
      }

      // 2. 카테고리 필터
      if (filters.categories.length > 0) {
        result = result.filter((popup) => filters.categories.includes(popup.category));
      }

      // 3. 상태 필터
      if (filters.status !== 'all') {
        result = result.filter((popup) => popup.status === filters.status);
      }

      // 4. 정렬
      result.sort((a, b) => {
        switch (filters.sort) {
          case 'deadline':
            return new Date(a.deadlineAt).getTime() - new Date(b.deadlineAt).getTime();

          case 'popular':
            return b.currentParticipants - a.currentParticipants;

          case 'latest':
            return new Date(b.deadlineAt).getTime() - new Date(a.deadlineAt).getTime();

          case 'progress':
            const progressA = a.currentParticipants / a.goalParticipants;
            const progressB = b.currentParticipants / b.goalParticipants;
            return progressB - progressA;

          default:
            return 0;
        }
      });

      return result;
    },
    [filters]
  );

  return {
    filters,
    setQuery,
    toggleCategory,
    setCategories,
    setStatus,
    setSort,
    resetFilters,
    activeFilterCount,
    filterPopups,
  };
}

export default useSearch;
