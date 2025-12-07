'use client';

import { useState, useEffect } from 'react';
import { m } from '@/lib/motion';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import {
  UserIcon,
  SettingsIcon,
  BellIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ShieldIcon,
  HelpCircleIcon,
  LogOutIcon,
} from '@/components/cosmic';
import { BottomNav } from '@/components/layout/BottomNav';
import { Switch } from '@/components/catalyst';
import { ErrorBoundary } from '@/components/error';
import { Button, IconButton } from '@/components/ui/Button';

/**
 * ZZIK Profile Page
 * Linear 2026 Deep Space + Orange Point Color
 * User settings and account management
 */

interface SettingItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  description?: string;
  value?: string | boolean;
  type: 'link' | 'toggle' | 'info';
  href?: string;
  onClick?: () => void;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

function ProfilePageContent() {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // User stats (would come from API in real implementation)
  const [stats, setStats] = useState({
    totalCheckIns: 0,
    vipStores: 0,
    memberSince: '',
  });

  useEffect(() => {
    if (user) {
      // Fetch user stats
      const fetchStats = async () => {
        try {
          const response = await fetch('/api/loyalty');
          const data = await response.json();
          if (data.success) {
            setStats({
              totalCheckIns: data.stats?.totalVisits || 0,
              vipStores: data.stats?.vipCount || 0,
              memberSince: user.created_at
                ? new Date(user.created_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                  })
                : '',
            });
          }
        } catch (error) {
          console.error('Failed to fetch stats:', error);
        }
      };
      fetchStats();
    }
  }, [user]);

  const settingSections: SettingSection[] = [
    {
      title: '알림 설정',
      items: [
        {
          id: 'push-notifications',
          icon: <BellIcon size={20} className="text-linear-text-secondary" />,
          label: '푸시 알림',
          description: '체크인 및 혜택 알림 받기',
          value: notifications,
          type: 'toggle',
          onClick: () => setNotifications(!notifications),
        },
        {
          id: 'marketing',
          icon: <BellIcon size={20} className="text-linear-text-secondary" />,
          label: '마케팅 알림',
          description: '이벤트 및 프로모션 소식',
          value: marketingEmails,
          type: 'toggle',
          onClick: () => setMarketingEmails(!marketingEmails),
        },
      ],
    },
    {
      title: '계정',
      items: [
        {
          id: 'security',
          icon: <ShieldIcon size={20} className="text-linear-text-secondary" />,
          label: '보안 설정',
          description: '비밀번호 및 2단계 인증',
          type: 'link',
          href: '#',
        },
        {
          id: 'privacy',
          icon: <SettingsIcon size={20} className="text-linear-text-secondary" />,
          label: '개인정보 관리',
          description: '데이터 다운로드 및 삭제',
          type: 'link',
          href: '#',
        },
      ],
    },
    {
      title: '지원',
      items: [
        {
          id: 'help',
          icon: <HelpCircleIcon size={20} className="text-linear-text-secondary" />,
          label: '도움말',
          type: 'link',
          href: '#',
        },
        {
          id: 'terms',
          icon: <ShieldIcon size={20} className="text-linear-text-secondary" />,
          label: '이용약관',
          type: 'link',
          href: '#',
        },
        {
          id: 'privacy-policy',
          icon: <ShieldIcon size={20} className="text-linear-text-secondary" />,
          label: '개인정보처리방침',
          type: 'link',
          href: '#',
        },
      ],
    },
  ];

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-linear-bg pt-safe pb-safe flex items-center justify-center p-4">
        {/* Background Glow */}
        <div className="fixed inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255, 107, 91, 0.1) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
        </div>

        <m.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative max-w-sm w-full p-6 rounded-2xl overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, rgba(18, 19, 20, 0.9) 0%, rgba(8, 9, 10, 0.95) 100%)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.06), 0 20px 60px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-1/3 rounded-t-2xl pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
            }}
          />

          <div className="relative text-center">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(255, 255, 255, 0.04)' }}
            >
              <UserIcon size={32} className="text-linear-text-tertiary" />
            </div>
            <h2 className="text-linear-text-primary text-h3 font-semibold mb-2">
              로그인이 필요합니다
            </h2>
            <p className="text-linear-text-tertiary text-body-sm mb-6">
              프로필을 보려면 로그인해주세요.
            </p>
            <Link href="/login">
              <Button variant="primary" size="lg" fullWidth>
                로그인
              </Button>
            </Link>
          </div>
        </m.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-bg pt-safe pb-safe overflow-hidden">
      {/* Animated Background (GPU accelerated) */}
      <div className="fixed inset-0 pointer-events-none">
        <m.div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 107, 91, 0.12) 0%, transparent 70%)',
            filter: 'blur(60px)',
            willChange: 'transform, opacity',
            transform: 'translateZ(0)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <m.div
          className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 107, 91, 0.08) 0%, transparent 70%)',
            filter: 'blur(80px)',
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <m.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-4"
          style={{
            background: 'linear-gradient(180deg, rgba(8, 9, 10, 0.95) 0%, transparent 100%)',
          }}
        >
          <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <IconButton
                  icon={<ChevronLeftIcon size={20} className="text-linear-text-secondary" />}
                  aria-label="뒤로 가기"
                />
              </Link>
              <div>
                <h1 className="text-linear-text-primary text-headline font-semibold">설정</h1>
                <p className="text-linear-text-quaternary text-body-xs">계정 및 앱 설정</p>
              </div>
            </div>
          </div>
        </m.header>

        {/* User Info Card */}
        <div className="max-w-lg mx-auto px-6 py-4 w-full">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative p-6 rounded-2xl overflow-hidden mb-6"
            style={{
              background:
                'linear-gradient(135deg, rgba(255, 107, 91, 0.08) 0%, rgba(255, 107, 91, 0.02) 100%)',
              backdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255, 107, 91, 0.15)',
              boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
            }}
          >
            {/* Glass highlight */}
            <div
              className="absolute top-0 left-0 right-0 h-1/3 rounded-t-2xl pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
              }}
            />

            <div className="relative flex items-center gap-4">
              {/* Avatar */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #FF6B5B 0%, #FF8A7A 100%)',
                  boxShadow: '0 4px 20px rgba(255, 107, 91, 0.3)',
                }}
              >
                {user?.email?.charAt(0).toUpperCase() || 'Z'}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-linear-text-primary text-h4 font-semibold truncate">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'ZZIK 유저'}
                </h2>
                <p className="text-linear-text-quaternary text-body-sm truncate">{user?.email}</p>
                {stats.memberSince && (
                  <p className="text-linear-text-quaternary text-body-xs mt-1">
                    {stats.memberSince}부터 함께
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div
              className="grid grid-cols-1 xs:grid-cols-2 gap-4 mt-6 pt-6"
              style={{ borderTop: '1px solid rgba(255, 107, 91, 0.15)' }}
            >
              <div className="text-center">
                <p className="text-linear-orange text-h3 font-bold">{stats.totalCheckIns}</p>
                <p className="text-linear-text-quaternary text-body-xs">총 체크인</p>
              </div>
              <div className="text-center">
                <p className="text-linear-orange text-h3 font-bold">{stats.vipStores}</p>
                <p className="text-linear-text-quaternary text-body-xs">VIP 매장</p>
              </div>
            </div>
          </m.div>

          {/* Settings Sections */}
          <div className="space-y-6">
            {settingSections.map((section, sectionIdx) => (
              <m.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIdx * 0.1 }}
              >
                <h3 className="text-linear-text-tertiary text-body-sm font-medium mb-3 px-1">
                  {section.title}
                </h3>
                <div
                  className="rounded-xl overflow-hidden"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  {section.items.map((item, idx) => (
                    <div key={item.id}>
                      {item.type === 'link' ? (
                        <Link href={item.href || '#'}>
                          <div
                            className="flex items-center justify-between p-4 transition-colors hover:bg-white/[0.02]"
                            style={{
                              borderBottom:
                                idx < section.items.length - 1
                                  ? '1px solid rgba(255, 255, 255, 0.04)'
                                  : 'none',
                            }}
                          >
                            <div className="flex items-center gap-3">
                              {item.icon}
                              <div>
                                <p className="text-linear-text-primary text-body font-medium">
                                  {item.label}
                                </p>
                                {item.description && (
                                  <p className="text-linear-text-quaternary text-body-xs">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <ChevronRightIcon size={18} className="text-linear-text-quaternary" />
                          </div>
                        </Link>
                      ) : item.type === 'toggle' ? (
                        <button
                          onClick={item.onClick}
                          className="w-full flex items-center justify-between p-4 transition-colors hover:bg-white/[0.02]"
                          aria-label={`${item.label} ${item.value ? '비활성화' : '활성화'}`}
                          style={{
                            borderBottom:
                              idx < section.items.length - 1
                                ? '1px solid rgba(255, 255, 255, 0.04)'
                                : 'none',
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {item.icon}
                            <div className="text-left">
                              <p className="text-linear-text-primary text-body font-medium">
                                {item.label}
                              </p>
                              {item.description && (
                                <p className="text-linear-text-quaternary text-body-xs">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                          {/* Catalyst Switch */}
                          <Switch
                            checked={item.value as boolean}
                            onChange={item.onClick}
                            color="orange"
                          />
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </m.div>
            ))}
          </div>

          {/* Logout Button */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Button
              variant="danger"
              size="lg"
              fullWidth
              leftIcon={<LogOutIcon size={20} />}
              onClick={() => signOut()}
            >
              로그아웃
            </Button>
          </m.div>

          {/* App Version */}
          <div className="text-center mt-8 mb-4">
            <p className="text-linear-text-quaternary text-body-xs">ZZIK Hybrid v2.0.0</p>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ErrorBoundary
      onError={(error) => {
        console.error('Profile page error:', error);
      }}
    >
      <ProfilePageContent />
    </ErrorBoundary>
  );
}
