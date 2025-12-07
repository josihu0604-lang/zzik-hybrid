'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  Shield,
  Globe,
  Trash2,
  FileText,
  HelpCircle,
  Info,
  LogOut,
  User,
  MapPin,
  Mail,
  Smartphone,
} from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button, IconButton } from '@/components/ui/Button';
import { colors, gradients, radii, liquidGlass } from '@/lib/design-tokens';

/**
 * Settings Page - 앱 설정
 *
 * App Store Requirements:
 * - 알림 설정
 * - 개인정보 설정
 * - 계정 삭제 링크 (iOS 필수!)
 * - 오픈소스 라이선스
 * - 고객 지원
 */

// ============================================================================
// TYPES
// ============================================================================

interface SettingsSection {
  id: string;
  title: string;
  items: SettingsItem[];
}

interface SettingsItem {
  id: string;
  icon: typeof Bell;
  label: string;
  description?: string;
  type: 'toggle' | 'link' | 'action';
  href?: string;
  value?: boolean;
  danger?: boolean;
}

// ============================================================================
// STYLES
// ============================================================================

const GLASS_CARD_STYLE = {
  ...liquidGlass.standard,
  borderRadius: radii.xl,
} as const;

const SECTION_HEADER_STYLE = {
  color: colors.text.tertiary,
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  marginBottom: '12px',
  paddingLeft: '4px',
};

// ============================================================================
// COMPONENTS
// ============================================================================

function SettingsToggle({
  enabled,
  onChange,
  label,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}) {
  return (
    <motion.button
      onClick={() => onChange(!enabled)}
      className="relative w-12 h-7 rounded-full transition-colors"
      style={{
        background: enabled ? gradients.flame : 'rgba(255, 255, 255, 0.1)',
      }}
      whileTap={{ scale: 0.95 }}
      role="switch"
      aria-checked={enabled}
      aria-label={label}
    >
      <motion.div
        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
        animate={{ left: enabled ? '24px' : '4px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
}

function SettingsRow({
  item,
  onToggle,
}: {
  item: SettingsItem;
  onToggle?: (id: string, value: boolean) => void;
}) {
  const Icon = item.icon;
  const router = useRouter();

  const handleClick = () => {
    if (item.type === 'link' && item.href) {
      router.push(item.href);
    }
  };

  const content = (
    <div
      className="flex items-center justify-between py-4 px-4 cursor-pointer hover:bg-white/5 transition-colors"
      onClick={item.type === 'link' ? handleClick : undefined}
      style={{
        borderBottom: `1px solid ${colors.border.subtle}`,
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: item.danger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.06)',
          }}
        >
          <Icon size={20} style={{ color: item.danger ? colors.error : colors.text.secondary }} />
        </div>
        <div>
          <p
            className="font-medium"
            style={{ color: item.danger ? colors.error : colors.text.primary }}
          >
            {item.label}
          </p>
          {item.description && (
            <p className="text-micro mt-0.5" style={{ color: colors.text.tertiary }}>
              {item.description}
            </p>
          )}
        </div>
      </div>

      {item.type === 'toggle' && onToggle && (
        <SettingsToggle
          enabled={item.value ?? false}
          onChange={(value) => onToggle(item.id, value)}
          label={item.label}
        />
      )}

      {item.type === 'link' && <ChevronRight size={20} style={{ color: colors.text.tertiary }} />}
    </div>
  );

  return content;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SettingsPage() {
  const router = useRouter();

  // Settings state
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    marketingNotifications: false,
    locationServices: true,
    dataCollection: true,
  });

  const handleToggle = (id: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [id]: value }));
  };

  const handleLogout = () => {
    // TODO: Implement logout
    router.push('/login');
  };

  // Settings sections
  const sections: SettingsSection[] = [
    {
      id: 'notifications',
      title: '알림',
      items: [
        {
          id: 'pushNotifications',
          icon: Bell,
          label: '푸시 알림',
          description: '새로운 팝업, 진행률 업데이트',
          type: 'toggle',
          value: settings.pushNotifications,
        },
        {
          id: 'emailNotifications',
          icon: Mail,
          label: '이메일 알림',
          description: '주간 리포트, 새소식',
          type: 'toggle',
          value: settings.emailNotifications,
        },
        {
          id: 'marketingNotifications',
          icon: Smartphone,
          label: '마케팅 알림',
          description: '프로모션, 이벤트 안내',
          type: 'toggle',
          value: settings.marketingNotifications,
        },
      ],
    },
    {
      id: 'privacy',
      title: '개인정보',
      items: [
        {
          id: 'locationServices',
          icon: MapPin,
          label: '위치 서비스',
          description: '주변 팝업 검색, 체크인에 사용',
          type: 'toggle',
          value: settings.locationServices,
        },
        {
          id: 'dataCollection',
          icon: Shield,
          label: '데이터 수집',
          description: '서비스 개선을 위한 익명 데이터',
          type: 'toggle',
          value: settings.dataCollection,
        },
        {
          id: 'privacyPolicy',
          icon: FileText,
          label: '개인정보 처리방침',
          type: 'link',
          href: '/privacy',
        },
      ],
    },
    {
      id: 'account',
      title: '계정',
      items: [
        {
          id: 'profile',
          icon: User,
          label: '프로필 수정',
          type: 'link',
          href: '/profile',
        },
        {
          id: 'deleteAccount',
          icon: Trash2,
          label: '계정 삭제',
          description: '모든 데이터가 영구 삭제됩니다',
          type: 'link',
          href: '/account/delete',
          danger: true,
        },
      ],
    },
    {
      id: 'app',
      title: '앱 정보',
      items: [
        {
          id: 'language',
          icon: Globe,
          label: '언어',
          description: '한국어',
          type: 'link',
          href: '/settings/language',
        },
        {
          id: 'licenses',
          icon: FileText,
          label: '오픈소스 라이선스',
          type: 'link',
          href: '/licenses',
        },
        {
          id: 'terms',
          icon: FileText,
          label: '이용약관',
          type: 'link',
          href: '/terms',
        },
        {
          id: 'help',
          icon: HelpCircle,
          label: '고객 지원',
          type: 'link',
          href: '/help',
        },
        {
          id: 'appInfo',
          icon: Info,
          label: '앱 버전',
          description: 'v1.0.0',
          type: 'link',
          href: '#',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ background: colors.space[950] }}>
      {/* Header */}
      <div
        className="sticky top-0 z-30 px-4 py-4"
        style={{
          background: 'rgba(8, 9, 10, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${colors.border.subtle}`,
        }}
      >
        <div className="flex items-center gap-4">
          <IconButton
            icon={<ChevronLeft size={24} style={{ color: colors.text.primary }} />}
            onClick={() => router.back()}
            aria-label="뒤로 가기"
          />
          <h1 className="text-xl font-bold" style={{ color: colors.text.primary }}>
            설정
          </h1>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="p-4 space-y-6">
        {sections.map((section) => (
          <div key={section.id}>
            <p style={SECTION_HEADER_STYLE}>{section.title}</p>
            <div style={GLASS_CARD_STYLE} className="overflow-hidden">
              {section.items.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    borderBottom:
                      index === section.items.length - 1
                        ? 'none'
                        : `1px solid ${colors.border.subtle}`,
                  }}
                >
                  <SettingsRow item={item} onToggle={handleToggle} />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <Button
          variant="glass"
          size="lg"
          fullWidth
          leftIcon={<LogOut size={18} />}
          onClick={handleLogout}
        >
          로그아웃
        </Button>

        {/* App Info Footer */}
        <div className="text-center pt-4 pb-8">
          <p className="text-micro" style={{ color: colors.text.muted }}>
            ZZIK v1.0.0
          </p>
          <p className="text-micro mt-1" style={{ color: colors.text.muted }}>
            Made with love in Seoul
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
