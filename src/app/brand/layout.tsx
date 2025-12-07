'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Megaphone, PlusCircle, BarChart3, Settings, ChevronLeft } from 'lucide-react';
import { ZzikLogoMark } from '@/components/cosmic';
import { colors, liquidGlass } from '@/lib/design-tokens';

interface BrandLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/brand', label: '대시보드', icon: Home },
  { href: '/brand/campaigns', label: '캠페인', icon: Megaphone },
  { href: '/brand/campaigns/new', label: '새 캠페인', icon: PlusCircle },
  { href: '/brand/analytics', label: '분석', icon: BarChart3 },
  { href: '/brand/settings', label: '설정', icon: Settings },
];

export default function BrandLayout({ children }: BrandLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-space-950 flex">
      {/* Sidebar - Desktop */}
      <aside
        className="hidden lg:flex flex-col w-64 border-r"
        style={{
          borderColor: colors.border.subtle,
          background: colors.space[900],
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 p-6 border-b"
          style={{ borderColor: colors.border.subtle }}
        >
          <ZzikLogoMark size={32} />
          <div>
            <p className="font-semibold text-white">ZZIK</p>
            <p className="text-xs" style={{ color: colors.text.secondary }}>
              Brand Dashboard
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
                  style={{
                    background: isActive ? `rgba(255, 107, 91, 0.15)` : 'transparent',
                    color: isActive ? colors.flame[500] : colors.text.secondary,
                  }}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Back to main */}
        <div className="p-4 border-t" style={{ borderColor: colors.border.subtle }}>
          <Link href="/">
            <motion.div
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{ color: colors.text.tertiary }}
            >
              <ChevronLeft size={18} />
              <span className="text-sm">메인으로 돌아가기</span>
            </motion.div>
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50">
        <header
          className="flex items-center justify-between px-4 py-3"
          style={{
            ...liquidGlass.standard,
            borderBottom: `1px solid ${colors.border.subtle}`,
          }}
        >
          <div className="flex items-center gap-3">
            <ZzikLogoMark size={28} />
            <span className="font-semibold text-white">Brand</span>
          </div>
          <Link href="/">
            <ChevronLeft size={24} style={{ color: colors.text.secondary }} />
          </Link>
        </header>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:overflow-auto">
        <div className="lg:pt-0 pt-14 pb-20 lg:pb-0">{children}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around py-2 pb-safe"
        style={{
          ...liquidGlass.standard,
          borderTop: `1px solid ${colors.border.subtle}`,
        }}
      >
        {navItems.slice(0, 4).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-1 px-4 py-2"
              >
                <Icon
                  size={22}
                  style={{
                    color: isActive ? colors.flame[500] : colors.text.tertiary,
                  }}
                />
                <span
                  className="text-micro"
                  style={{
                    color: isActive ? colors.flame[500] : colors.text.tertiary,
                  }}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
