'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { m } from 'framer-motion';
import { Map, QrCode, Sparkles, User } from 'lucide-react';
import { colors, layout, gradients, shadows, rgba } from '@/lib/design-tokens';
import { useHaptic } from '@/hooks/useHaptic';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/context/auth-context';

/**
 * BottomTabBar - 3-Pillar 구조 (Pay/Play/Beauty)
 *
 * 🌟 Features (UX-001):
 * - 4개 탭: Play(Map), Pay(QR), Beauty(AI), Profile
 * - 외국인 친화적 아이콘 (텍스트 최소화)
 * - "코인/지갑" 용어 제거 → "Pay" 사용
 * - 햅틱 피드백
 * - Safe Area 처리
 * - Glassmorphism 배경
 *
 * 🎯 Design Goals:
 * - 30초 내 기능 이해 가능
 * - 아이콘만으로도 직관적 인식
 * - 3-Pillar 명확한 구분
 */

interface TabItem {
  id: string;
  label: string;
  labelEn: string;  // 외국인용 영문 라벨
  icon: typeof Map;
  path: string;
  ariaLabel: string;
}

const TABS: TabItem[] = [
  { 
    id: 'play', 
    label: '탐색', 
    labelEn: 'Play',
    icon: Map, 
    path: '/map',
    ariaLabel: 'Explore local places with Z-Pay'
  },
  { 
    id: 'pay', 
    label: '결제', 
    labelEn: 'Pay',
    icon: QrCode, 
    path: '/wallet/pay',
    ariaLabel: 'Pay with QR code in 3 seconds'
  },
  { 
    id: 'beauty', 
    label: '뷰티', 
    labelEn: 'Beauty',
    icon: Sparkles, 
    path: '/beauty',
    ariaLabel: 'AI Skin Analysis & K-Beauty'
  },
  { 
    id: 'profile', 
    label: '프로필', 
    labelEn: 'Me',
    icon: User, 
    path: '/me',
    ariaLabel: 'My profile and settings'
  },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const haptic = useHaptic();
  const { user } = useAuth();

  // 특정 경로에서는 탭바 숨김 (팝업 상세, 온보딩 등)
  const hiddenPaths = ['/popup/', '/onboarding', '/checkin', '/beauty/analyze'];
  const shouldHide = hiddenPaths.some((p) => pathname.startsWith(p));

  if (shouldHide) return null;

  const handleTabPress = (tab: TabItem) => {
    haptic.selection();
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:w-[430px] lg:left-1/2 lg:-translate-x-1/2"
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
        className="relative flex items-center justify-around"
        style={{
          height: layout.bottomNav.height,
          padding: layout.bottomNav.padding,
        }}
      >
        {TABS.map((tab) => {
          const isActive = pathname === tab.path || (tab.path !== '/' && pathname.startsWith(tab.path));

          return (
            <Link
              key={tab.id}
              href={tab.path}
              onClick={() => handleTabPress(tab)}
              className="relative flex flex-col items-center justify-center flex-1 h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame-500 rounded-lg"
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.ariaLabel}
            >
              <m.div 
                className="flex flex-col items-center gap-1" 
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                {/* 아이콘 */}
                <div className="relative">
                  <tab.icon
                    size={26}
                    style={{
                      color: isActive ? colors.flame[500] : rgba.white[50],
                      strokeWidth: isActive ? 2.5 : 2,
                    }}
                  />
                </div>

                {/* 라벨 (영문 우선 표시) */}
                <span
                  className="text-micro font-medium tracking-tight"
                  style={{
                    color: isActive ? colors.flame[500] : rgba.white[50],
                  }}
                >
                  {tab.labelEn}
                </span>

                {/* 활성 인디케이터 */}
                {isActive && (
                  <m.div
                    layoutId="activeTab"
                    className="absolute -bottom-2 w-12 h-0.5 rounded-full"
                    style={{ background: gradients.flame }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
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
