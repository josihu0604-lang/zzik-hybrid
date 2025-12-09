'use client';

import { useRef, useEffect } from 'react';
import { m } from 'framer-motion';
import { colors } from '@/lib/design-tokens';
import { duration } from '@/lib/animations';
import { useHaptic } from '@/hooks/useHaptic';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * CategoryFilter - 모바일 앱 스타일 카테고리 탭 필터
 *
 * Features:
 * - 가로 스크롤 (scrollbar hidden)
 * - 선택된 카테고리 자동 스크롤
 * - 햅틱 피드백
 * - 애니메이션 인디케이터
 */

export interface Category {
  value: string;
  label: string;
  emoji?: string;
}

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const haptic = useHaptic();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // 선택된 카테고리로 자동 스크롤
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const active = activeRef.current;
      // 중앙 정렬 스크롤
      const scrollLeft = active.offsetLeft - container.offsetWidth / 2 + active.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeCategory]);

  const handleCategoryClick = (category: string) => {
    if (category !== activeCategory) {
      haptic.selection();
      onCategoryChange(category);
    }
  };

  return (
    <div
      ref={scrollRef}
      className="overflow-x-auto scrollbar-hide"
      style={{
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <div className="flex gap-2 px-4 py-3" role="tablist" aria-label="카테고리 필터">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.value;
          return (
            <m.button
              key={cat.value}
              ref={isActive ? activeRef : undefined}
              onClick={() => handleCategoryClick(cat.value)}
              className="relative px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-flame-500"
              style={{
                background: isActive ? colors.flame[500] : 'rgba(255, 255, 255, 0.06)',
                color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.6)',
                border: isActive ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                willChange: prefersReducedMotion ? 'auto' : 'transform',
              }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
              transition={
                prefersReducedMotion ? { duration: 0 } : { duration: duration.tap, ease: 'easeOut' }
              }
              role="tab"
              aria-selected={isActive}
              aria-controls="popup-list"
            >
              {cat.emoji && <span className="mr-1">{cat.emoji}</span>}
              {cat.label}
            </m.button>
          );
        })}
      </div>
    </div>
  );
}

// 기본 카테고리 목록
export const DEFAULT_CATEGORIES: Category[] = [
  { value: 'all', label: '전체', emoji: '🔥' },
  { value: 'fashion', label: '패션', emoji: '👗' },
  { value: 'beauty', label: '뷰티', emoji: '💄' },
  { value: 'kpop', label: 'K-Pop', emoji: '🎤' },
  { value: 'food', label: '맛집', emoji: '🍜' },
  { value: 'cafe', label: '카페', emoji: '☕' },
  { value: 'lifestyle', label: '라이프', emoji: '🏠' },
  { value: 'culture', label: '문화', emoji: '🎨' },
  { value: 'tech', label: '테크', emoji: '📱' },
];

export default CategoryFilter;
