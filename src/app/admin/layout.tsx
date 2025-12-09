'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { m } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Store,
  CreditCard,
  AlertTriangle,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { colors } from '@/lib/design-tokens';

/**
 * Admin Dashboard Layout
 *
 * Features:
 * - Admin role verification
 * - Sidebar navigation
 * - Responsive design
 */

interface AdminLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: '대시보드', icon: LayoutDashboard, href: '/admin' },
  { id: 'users', label: '사용자 관리', icon: Users, href: '/admin/users' },
  { id: 'popups', label: '팝업 관리', icon: Store, href: '/admin/popups' },
  { id: 'payouts', label: '정산 관리', icon: CreditCard, href: '/admin/payouts' },
  { id: 'reports', label: '신고 관리', icon: AlertTriangle, href: '/admin/reports' },
  { id: 'settings', label: '설정', icon: Settings, href: '/admin/settings' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check admin authorization
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    async function checkAuth() {
      try {
        const response = await fetch('/api/me');
        const data = await response.json();

        if (!response.ok || !data.data) {
          router.push('/login?redirect=/admin');
          return;
        }

        if (data.data?.role !== 'admin') {
          router.push('/');
          return;
        }

        setIsAuthorized(true);
      } catch {
        router.push('/login?redirect=/admin');
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  // Show loading state
  if (isLoading || !isAuthorized) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: colors.space[900] }}
      >
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: colors.space[700],
              borderTopColor: colors.flame[500],
            }}
          />
          <p style={{ color: colors.text.secondary }}>권한 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: colors.space[900] }}>
      {/* Mobile menu button */}
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg"
        style={{ background: colors.space[800] }}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label={isSidebarOpen ? '메뉴 닫기' : '메뉴 열기'}
      >
        {isSidebarOpen ? (
          <X size={24} style={{ color: colors.text.primary }} />
        ) : (
          <Menu size={24} style={{ color: colors.text.primary }} />
        )}
      </button>

      {/* Sidebar overlay (mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <m.aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 transform transition-transform lg:transform-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          background: colors.space[850],
          borderRight: `1px solid ${colors.border.subtle}`,
        }}
      >
        {/* Logo */}
        <div
          className="h-16 flex items-center justify-center gap-2"
          style={{ borderBottom: `1px solid ${colors.border.subtle}` }}
        >
          <span className="text-2xl">🔥</span>
          <span className="text-xl font-bold" style={{ color: colors.text.primary }}>
            ZZIK Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              typeof window !== 'undefined' && window.location.pathname === item.href;

            return (
              <a
                key={item.id}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
                style={{
                  background: isActive ? `${colors.flame[500]}20` : 'transparent',
                  color: isActive ? colors.flame[500] : colors.text.secondary,
                }}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            type="button"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors"
            style={{
              color: colors.text.muted,
            }}
            onClick={() => router.push('/logout')}
          >
            <LogOut size={20} />
            <span className="font-medium">로그아웃</span>
          </button>
        </div>
      </m.aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
