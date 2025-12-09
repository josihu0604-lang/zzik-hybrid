'use client';

import { ReactNode } from 'react';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { layout } from '@/lib/design-tokens';

/**
 * AppShell - 앱 레이아웃 래퍼
 *
 * Features:
 * - 바텀 탭 바 통합
 * - Safe Area 처리 (상/하단)
 * - 탭바 공간 확보를 위한 패딩
 *
 * Usage:
 * 모든 메인 페이지에서 사용
 * (팝업 상세, 온보딩 등 전체화면 페이지는 제외)
 */

interface AppShellProps {
  children: ReactNode;
  /** 바텀 탭 바 숨기기 */
  hideTabBar?: boolean;
  /** 추가 클래스 */
  className?: string;
}

export function AppShell({ children, hideTabBar = false, className = '' }: AppShellProps) {
  return (
    <div
      className={`min-h-screen flex flex-col ${className}`}
      style={{
        // 상단 Safe Area
        paddingTop: 'env(safe-area-inset-top, 0px)',
        // 하단 Safe Area + 탭바 높이
        paddingBottom: hideTabBar
          ? 'env(safe-area-inset-bottom, 0px)'
          : `calc(${layout.bottomNav.height} + env(safe-area-inset-bottom, 0px))`,
      }}
    >
      {/* 메인 콘텐츠 */}
      <div className="flex-1">{children}</div>

      {/* 바텀 탭 바 */}
      {!hideTabBar && <BottomTabBar />}
    </div>
  );
}

export default AppShell;
