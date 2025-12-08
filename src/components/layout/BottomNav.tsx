'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { m } from 'framer-motion';
import { Flame, Map, User, type LucideIcon } from 'lucide-react';
import { colors, glass, radii, typography, brand } from '@/lib/design-tokens';
import { useHaptic } from '@/hooks/useHaptic';

/**
 * Bottom Navigation v2 - 2026 Production Design
 *
 * Navigation Structure:
 * - 펀딩중 (Live) - Current funding popups
 * - 맵 (Map) - Confirmed popup locations
 * - 마이 (Me) - My participations + Leader dashboard
 *
 * Design:
 * - Apple Liquid Glass (blur 24px + saturate 180%)
 * - 48px touch targets (Apple HIG)
 * - Lucide icons
 * - Design token system
 */

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  matchPaths?: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/',
    icon: Flame,
    label: '펀딩중',
    matchPaths: ['/', '/live', '/popup'],
  },
  {
    href: '/map',
    icon: Map,
    label: '맵',
    matchPaths: ['/map'],
  },
  {
    href: '/me',
    icon: User,
    label: '마이',
    matchPaths: ['/me', '/dashboard', '/profile', '/leader'],
  },
];

export function BottomNav() {
  const pathname = usePathname();
  // DES-029: 탭 전환 햅틱 피드백
  const haptic = useHaptic();

  const isActive = (item: NavItem) => {
    if (pathname === item.href) return true;
    if (item.matchPaths?.some((path) => pathname.startsWith(path) && path !== '/')) return true;
    if (item.href === '/' && pathname === '/') return true;
    return false;
  };

  return (
    <>
      {/* Spacer to prevent content from being hidden behind fixed nav */}
      <div className="h-20" aria-hidden="true" />

      {/* Fixed Bottom Navigation - Apple Liquid Glass */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: glass.heavy.background,
          backdropFilter: glass.heavy.backdropFilter,
          WebkitBackdropFilter: glass.heavy.backdropFilter,
          borderTop: `1px solid ${glass.heavy.border}`,
          boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        }}
        role="navigation"
        aria-label="주요 내비게이션"
      >
        <div className="max-w-lg mx-auto flex justify-around py-2 pb-safe px-safe" role="tablist">
          {NAV_ITEMS.map((item, index) => {
            const active = isActive(item);
            const Icon = item.icon;
            // A11Y-011: 활성 탭만 tabindex="0", 나머지는 "-1"
            const activeIndex = NAV_ITEMS.findIndex((navItem) => isActive(navItem));
            const tabIndex = active ? 0 : activeIndex === -1 && index === 0 ? 0 : -1;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  // DES-029: 탭 전환 시 햅틱
                  if (!active) {
                    haptic.selection();
                  }
                }}
                onKeyDown={(e) => {
                  // A11Y-011: ArrowLeft/Right 키 처리
                  if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const currentIndex = NAV_ITEMS.findIndex((i) => i.href === item.href);
                    const prevIndex = (currentIndex - 1 + NAV_ITEMS.length) % NAV_ITEMS.length;
                    const prevLink = e.currentTarget.parentElement?.children[
                      prevIndex
                    ] as HTMLElement;
                    prevLink?.focus();
                  } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    const currentIndex = NAV_ITEMS.findIndex((i) => i.href === item.href);
                    const nextIndex = (currentIndex + 1) % NAV_ITEMS.length;
                    const nextLink = e.currentTarget.parentElement?.children[
                      nextIndex
                    ] as HTMLElement;
                    nextLink?.focus();
                  }
                }}
                className="flex flex-col items-center justify-center gap-1 min-h-[56px] min-w-[64px] px-5 py-2 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2"
                style={{
                  borderRadius: radii.xl,
                  background: active ? colors.temperature.cold.bg : 'transparent',
                  outlineColor: brand.primary,
                  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)', // DES-122: 탭 전환 최적화
                }}
                aria-current={active ? 'page' : undefined}
                aria-label={`${item.label} ${active ? '(현재 페이지)' : ''}`}
                role="tab"
                aria-selected={active}
                tabIndex={tabIndex}
              >
                <Icon
                  size={24}
                  strokeWidth={active ? 2.5 : 2}
                  style={{
                    color: active ? brand.primary : colors.text.muted,
                    transition: 'color 200ms',
                  }}
                  aria-hidden="true"
                />
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: active
                      ? typography.fontWeight.semibold
                      : typography.fontWeight.normal,
                    color: active ? brand.primary : colors.text.secondary,
                    transition: 'color 200ms',
                    // DES-172: 탭 바 스타일 개선 - 더 나은 가독성
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                  }}
                  aria-hidden="true"
                >
                  {item.label}
                </span>
                {/* DES-159: 탭 인디케이터 애니메이션 - 슬라이드 효과 */}
                {active && (
                  <m.div
                    layoutId="activeTab"
                    className="flex gap-0.5 mt-0.5"
                    aria-hidden="true"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <m.div
                      className="w-1 h-1 rounded-full"
                      style={{
                        background: brand.primary,
                        boxShadow: `0 0 4px ${brand.primary}`,
                      }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                    />
                    <div
                      className="w-1 h-1 rounded-full"
                      style={{ background: brand.primary, opacity: 0.6 }}
                    />
                    <div
                      className="w-1 h-1 rounded-full"
                      style={{ background: brand.primary, opacity: 0.3 }}
                    />
                  </m.div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default BottomNav;
