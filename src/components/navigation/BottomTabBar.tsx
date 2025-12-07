'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { m } from '@/lib/motion';
import { Home, Map, Flame, Bell, User } from 'lucide-react';
import { colors, layout, gradients, shadows, rgba } from '@/lib/design-tokens';
import { useHaptic } from '@/hooks/useHaptic';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/context/auth-context';

/**
 * BottomTabBar - 앱스토어 수준의 바텀 네비게이션
 *
 * Features:
 * - 5개 탭: 홈, 지도, FAB, 알림, MY
 * - 중앙 FAB 버튼 (돌출)
 * - 알림 배지
 * - 햅틱 피드백
 * - Safe Area 처리
 * - Glassmorphism 배경
 */

interface TabItem {
  id: string;
  label: string;
  icon: typeof Home;
  path: string;
  isCenter?: boolean;
}

const TABS: TabItem[] = [
  { id: 'home', label: '홈', icon: Home, path: '/' },
  { id: 'map', label: '지도', icon: Map, path: '/map' },
  { id: 'hot', label: '', icon: Flame, path: '/', isCenter: true },
  { id: 'alerts', label: '알림', icon: Bell, path: '/notifications' },
  { id: 'me', label: 'MY', icon: User, path: '/me' },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const haptic = useHaptic();
  const { user } = useAuth();
  const { unreadCount } = useNotifications(user?.id ?? null);

  // 특정 경로에서는 탭바 숨김 (팝업 상세, 온보딩 등)
  const hiddenPaths = ['/popup/', '/onboarding', '/checkin'];
  const shouldHide = hiddenPaths.some((p) => pathname.startsWith(p));

  if (shouldHide) return null;

  const handleTabPress = (tab: TabItem) => {
    if (tab.isCenter) {
      haptic.tap();
    } else {
      haptic.selection();
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        paddingBottom: layout.bottomNav.safeAreaBottom,
      }}
      role="navigation"
      aria-label="메인 네비게이션"
    >
      {/* Glassmorphism 배경 */}
      <div
        className="absolute inset-0"
        style={{
          background: rgba.space[92],
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderTop: `1px solid ${colors.border.subtle}`,
        }}
      />

      {/* 탭 컨테이너 */}
      <div
        className="relative flex items-end justify-around"
        style={{
          height: layout.bottomNav.height,
          padding: layout.bottomNav.padding,
        }}
      >
        {TABS.map((tab) => {
          const isActive = tab.isCenter
            ? false
            : pathname === tab.path || (tab.path !== '/' && pathname.startsWith(tab.path));

          // 중앙 FAB 버튼
          if (tab.isCenter) {
            return (
              <Link
                key={tab.id}
                href={tab.path}
                onClick={() => handleTabPress(tab)}
                className="relative -mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame-500 rounded-full"
                aria-label="핫 팝업 보기"
              >
                <m.div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 56,
                    height: 56,
                    background: gradients.flame,
                    boxShadow: shadows.glow.primary,
                  }}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <tab.icon size={28} color="#fff" strokeWidth={2.5} />
                </m.div>
              </Link>
            );
          }

          // 일반 탭 버튼
          return (
            <Link
              key={tab.id}
              href={tab.path}
              onClick={() => handleTabPress(tab)}
              className="relative flex flex-col items-center justify-center flex-1 h-full focus-visible:outline-none"
              aria-current={isActive ? 'page' : undefined}
            >
              <m.div className="flex flex-col items-center gap-1" whileTap={{ scale: 0.9 }}>
                {/* 아이콘 */}
                <div className="relative">
                  <tab.icon
                    size={24}
                    style={{
                      color: isActive ? colors.flame[500] : rgba.white[50],
                      strokeWidth: isActive ? 2.5 : 2,
                    }}
                  />

                  {/* 알림 배지 */}
                  {tab.id === 'alerts' && unreadCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-micro font-bold text-white rounded-full"
                      style={{ background: colors.flame[500] }}
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>

                {/* 라벨 */}
                <span
                  className="text-micro font-medium"
                  style={{
                    color: isActive ? colors.flame[500] : rgba.white[50],
                  }}
                >
                  {tab.label}
                </span>

                {/* 활성 인디케이터 */}
                {isActive && (
                  <m.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 w-1 h-1 rounded-full"
                    style={{ background: colors.flame[500] }}
                  />
                )}
              </m.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomTabBar;
