/**
 * App Header with Notification Center
 *
 * Main application header with integrated notification bell
 * ZZIK Design System 2.0: Linear + iOS 26 Liquid Glass
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, User, LogOut } from 'lucide-react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { getSupabaseClient } from '@/lib/supabase/client';
import { colors, gradients, rgba, shadows } from '@/lib/design-tokens';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AppHeaderProps {
  transparent?: boolean;
}

/**
 * Main application header component
 */
export function AppHeader({ transparent = false }: AppHeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // a11y: Refs for focus management
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<HTMLButtonElement[]>([]);
  const focusedIndexRef = useRef(-1);

  // a11y: Handle keyboard navigation in dropdown
  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
    const items = menuItemsRef.current.filter(Boolean);

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        focusedIndexRef.current = Math.min(focusedIndexRef.current + 1, items.length - 1);
        items[focusedIndexRef.current]?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusedIndexRef.current = Math.max(focusedIndexRef.current - 1, 0);
        items[focusedIndexRef.current]?.focus();
        break;
      case 'Tab':
        // Allow tab to work but close menu on tab out
        if (e.shiftKey && focusedIndexRef.current === 0) {
          setIsMenuOpen(false);
        } else if (!e.shiftKey && focusedIndexRef.current === items.length - 1) {
          setIsMenuOpen(false);
        }
        break;
    }
  }, []);

  // a11y: Focus first item when menu opens
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (isMenuOpen && menuItemsRef.current[0]) {
      focusedIndexRef.current = 0;
      menuItemsRef.current[0].focus();
    }
  }, [isMenuOpen]);

  // a11y: Close menu on click outside
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (!isMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const supabase = getSupabaseClient();

    // Get initial user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all ${
        transparent ? 'bg-transparent border-transparent' : 'border-white/10'
      }`}
      style={
        transparent
          ? undefined
          : {
              background: rgba.space[85],
              backdropFilter: 'blur(24px) saturate(180%)',
            }
      }
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 group"
            aria-label="홈으로"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-all group-hover:scale-105"
              style={{
                background: gradients.flame,
                boxShadow: `${shadows.glow.primary}, inset 0 1px 0 ${rgba.white[15]}`,
              }}
            >
              찍
            </div>
            <span className="hidden sm:block text-xl font-bold text-white">ZZIK</span>
          </button>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/" label="펀딩" />
            <NavLink href="/map" label="지도" />
            <NavLink href="/me" label="마이" />
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Notification Center */}
            {user && <NotificationCenter userId={user.id} />}

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  ref={menuButtonRef}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                  aria-label="사용자 메뉴"
                  aria-expanded={isMenuOpen}
                  aria-haspopup="menu"
                  id="user-menu-button"
                >
                  <User className="w-5 h-5 text-white/70" />
                </button>

                {/* Dropdown Menu - a11y: focus trap, keyboard navigation */}
                {isMenuOpen && (
                  <div
                    ref={menuRef}
                    role="menu"
                    aria-labelledby="user-menu-button"
                    onKeyDown={handleMenuKeyDown}
                    className="absolute right-0 mt-2 w-48 rounded-xl border overflow-hidden"
                    style={{
                      background: rgba.space[95],
                      backdropFilter: 'blur(24px) saturate(180%)',
                      boxShadow: shadows.xl,
                      borderColor: colors.border.subtle,
                    }}
                  >
                    <button
                      ref={(el) => {
                        if (el) menuItemsRef.current[0] = el;
                      }}
                      role="menuitem"
                      onClick={() => {
                        setIsMenuOpen(false);
                        router.push('/me');
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-white/70 hover:text-white hover:bg-white/5 focus:bg-white/10 focus:outline-none transition-colors flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      마이페이지
                    </button>
                    <div className="h-px bg-white/10" aria-hidden="true" />
                    <button
                      ref={(el) => {
                        if (el) menuItemsRef.current[1] = el;
                      }}
                      role="menuitem"
                      onClick={handleSignOut}
                      className="w-full px-4 py-3 text-left text-sm text-white/70 hover:text-white hover:bg-white/5 focus:bg-white/10 focus:outline-none transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => router.push('/auth/signin')}
                className="px-4 py-2 rounded-xl font-medium text-sm text-white transition-all"
                style={{
                  background: gradients.flame,
                  boxShadow: `${shadows.glow.primary}, inset 0 1px 0 ${rgba.white[15]}`,
                }}
              >
                로그인
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-white/5 transition-colors"
              aria-label="메뉴"
            >
              <Menu className="w-5 h-5 text-white/70" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div
          className="md:hidden border-t"
          style={{
            background: rgba.space[95],
            backdropFilter: 'blur(24px) saturate(180%)',
            borderColor: colors.border.subtle,
          }}
        >
          <nav className="px-4 py-2 space-y-1">
            <MobileNavLink href="/" label="펀딩" onClick={() => setIsMenuOpen(false)} />
            <MobileNavLink href="/map" label="지도" onClick={() => setIsMenuOpen(false)} />
            <MobileNavLink href="/me" label="마이" onClick={() => setIsMenuOpen(false)} />
          </nav>
        </div>
      )}
    </header>
  );
}

/**
 * Desktop navigation link
 */
function NavLink({ href, label }: { href: string; label: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(href)}
      className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
    >
      {label}
    </button>
  );
}

/**
 * Mobile navigation link
 */
function MobileNavLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        router.push(href);
        onClick?.();
      }}
      className="w-full px-4 py-3 rounded-lg text-left text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
    >
      {label}
    </button>
  );
}
