'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Shirt,
  Sparkles,
  Music,
  UtensilsCrossed,
  Coffee,
  Heart,
  Palette,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';
import { colors, radii, categoryColors } from '@/lib/design-tokens';

// ============================================================================
// Types
// ============================================================================

interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  count?: number;
}

const CATEGORY_LIST: Category[] = [
  { id: 'all', name: '전체', icon: Flame, color: categoryColors.all },
  { id: 'fashion', name: '패션', icon: Shirt, color: categoryColors.fashion },
  { id: 'beauty', name: '뷰티', icon: Sparkles, color: categoryColors.beauty },
  { id: 'kpop', name: 'K-Pop', icon: Music, color: categoryColors.kpop },
  { id: 'food', name: '맛집', icon: UtensilsCrossed, color: categoryColors.food },
  { id: 'cafe', name: '카페', icon: Coffee, color: categoryColors.cafe },
  { id: 'lifestyle', name: '라이프', icon: Heart, color: categoryColors.lifestyle },
  { id: 'culture', name: '문화', icon: Palette, color: categoryColors.culture },
  { id: 'tech', name: '테크', icon: Smartphone, color: categoryColors.tech },
];

interface CategoryFilterProps {
  categories?: Category[];
  selected?: string;
  onSelect?: (categoryId: string) => void;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function CategoryFilter({
  categories = CATEGORY_LIST,
  selected = 'all',
  onSelect,
  className = '',
}: CategoryFilterProps) {
  const [selectedId, setSelectedId] = useState(selected);
  const [isSticky, setIsSticky] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // DES-113: useMemo로 카테고리 리스트 메모이제이션
  const memoizedCategories = useMemo(() => categories, [categories]);

  // Intersection Observer for sticky detection
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, []);

  // Handle category selection
  const handleSelect = useCallback(
    (categoryId: string) => {
      setSelectedId(categoryId);
      onSelect?.(categoryId);

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(8);
      }
    },
    [onSelect]
  );

  // Handle keyboard navigation for category buttons
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, categoryId: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelect(categoryId);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const currentIndex = memoizedCategories.findIndex((c) => c.id === categoryId);
        let nextIndex: number;

        if (e.key === 'ArrowRight') {
          nextIndex = currentIndex < memoizedCategories.length - 1 ? currentIndex + 1 : 0;
        } else {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : memoizedCategories.length - 1;
        }

        const nextCategory = memoizedCategories[nextIndex];
        const nextButton = scrollRef.current?.querySelector<HTMLButtonElement>(
          `[data-category="${nextCategory.id}"]`
        );
        if (nextButton) {
          nextButton.focus();
        }
      } else if (e.key === 'Home') {
        // DES-118: Home 키 - 첫 번째 카테고리로
        e.preventDefault();
        const firstButton = scrollRef.current?.querySelector<HTMLButtonElement>(
          `[data-category="${memoizedCategories[0]?.id}"]`
        );
        firstButton?.focus();
      } else if (e.key === 'End') {
        // DES-118: End 키 - 마지막 카테고리로
        e.preventDefault();
        const lastButton = scrollRef.current?.querySelector<HTMLButtonElement>(
          `[data-category="${memoizedCategories[memoizedCategories.length - 1]?.id}"]`
        );
        lastButton?.focus();
      }
    },
    [handleSelect, memoizedCategories]
  );

  // Scroll selected item into view
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (!scrollRef.current) return;

    const selectedElement = scrollRef.current.querySelector(`[data-category="${selectedId}"]`);
    if (selectedElement) {
      selectedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [selectedId]);

  return (
    <>
      {/* Sentinel */}
      <div ref={sentinelRef} className="h-0 w-full" aria-hidden="true" />

      {/* Filter Container */}
      <div
        className={`sticky top-0 z-50 w-full transition-all duration-200 ${className}`}
        style={{
          background: isSticky ? 'rgba(8, 9, 10, 0.85)' : 'transparent',
          backdropFilter: isSticky ? 'blur(24px) saturate(180%)' : 'none',
          WebkitBackdropFilter: isSticky ? 'blur(24px) saturate(180%)' : 'none',
          boxShadow: isSticky ? '0 1px 0 rgba(255,255,255,0.05)' : 'none',
        }}
      >
        {/* Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto px-5 py-3"
          role="tablist"
          aria-label="카테고리 필터 - 좌우로 스크롤 가능"
          aria-orientation="horizontal"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: 'x mandatory',
            overscrollBehavior: 'contain', // DES-115: Pull-to-refresh 방지
            WebkitTouchCallout: 'none', // 길게 누르기 메뉴 방지
          }}
        >
          <AnimatePresence mode="popLayout">
            {memoizedCategories.map((category, index) => {
              const isSelected = category.id === selectedId;
              const IconComponent = category.icon;

              return (
                <m.button
                  key={category.id}
                  data-category={category.id}
                  onClick={() => handleSelect(category.id)}
                  onKeyDown={(e) => handleKeyDown(e, category.id)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.02 }}
                  className="relative flex-shrink-0 flex items-center gap-2 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus:outline-none"
                  role="tab"
                  aria-selected={isSelected}
                  aria-label={`${category.name} 카테고리`}
                  tabIndex={isSelected ? 0 : -1}
                  style={{
                    padding: '10px 16px',
                    borderRadius: radii.lg,
                    // DES-119: 접근성 개선 - focus-visible 스타일
                    outlineColor: category.color,
                    // DES-149: 카테고리 배지 색상 로직 개선
                    background: isSelected
                      ? `linear-gradient(135deg, ${category.color} 0%, ${category.color}dd 100%)`
                      : `linear-gradient(135deg, ${category.color}18 0%, ${category.color}10 100%)`,
                    border: `1px solid ${isSelected ? category.color : `${category.color}30`}`,
                    color: isSelected ? '#fff' : category.color,
                    // DES-120: 폰트 확대 대응 (clamp 사용)
                    fontSize: 'clamp(0.75rem, 0.8125rem, 0.875rem)', // 12px-13px-14px
                    fontWeight: isSelected ? 600 : 500,
                    letterSpacing: '-0.003em', // DES-147 적용
                    boxShadow: isSelected
                      ? `0 4px 12px ${category.color}40, inset 0 1px 0 rgba(255,255,255,0.15)`
                      : `0 2px 4px ${category.color}10`,
                    scrollSnapAlign: 'start',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Icon */}
                  <IconComponent
                    size={16}
                    strokeWidth={isSelected ? 2.5 : 2}
                    style={{
                      color: isSelected ? '#fff' : category.color,
                    }}
                  />

                  {/* Label */}
                  <span>{category.name}</span>

                  {/* Count Badge */}
                  {category.count !== undefined && category.count > 0 && (
                    <m.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-0.5"
                      style={{
                        padding: '2px 6px',
                        borderRadius: radii.full,
                        background: isSelected ? 'rgba(255,255,255,0.2)' : `${category.color}20`,
                        color: isSelected ? '#fff' : category.color,
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      {category.count}
                    </m.span>
                  )}
                </m.button>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Edge Gradients - using design tokens */}
        <div
          className="absolute left-0 top-0 bottom-0 w-6 pointer-events-none"
          style={{
            background: isSticky
              ? `linear-gradient(90deg, ${colors.space[950]}d9 0%, transparent 100%)`
              : `linear-gradient(90deg, ${colors.space[950]} 0%, transparent 100%)`,
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-6 pointer-events-none"
          style={{
            background: isSticky
              ? `linear-gradient(270deg, ${colors.space[950]}d9 0%, transparent 100%)`
              : `linear-gradient(270deg, ${colors.space[950]} 0%, transparent 100%)`,
          }}
        />
      </div>
    </>
  );
}

export default CategoryFilter;
export { CATEGORY_LIST };
export type { Category, CategoryFilterProps };
