'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  FileText,
  Bell,
  Shield,
  CreditCard,
  LogOut,
  ChevronRight,
  Save,
} from 'lucide-react';
import { GlassCard, CosmicInput, PrimaryButton } from '@/components/cosmic';
import { colors } from '@/lib/design-tokens';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';

interface BrandProfile {
  brand_name: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  business_registration_number: string;
  description: string;
}

const mockProfile: BrandProfile = {
  brand_name: 'ZZIK Brand',
  contact_email: 'brand@zzik.io',
  contact_phone: '02-1234-5678',
  website: 'https://brand.zzik.io',
  business_registration_number: '123-45-67890',
  description: '팝업 크라우드펀딩 플랫폼 ZZIK의 공식 브랜드 계정입니다.',
};

const settingsMenu = [
  {
    icon: Bell,
    label: '알림 설정',
    description: '푸시 알림 및 이메일 알림 설정',
  },
  {
    icon: CreditCard,
    label: '결제 정보',
    description: '결제 수단 및 청구서 관리',
  },
  {
    icon: Shield,
    label: '보안 설정',
    description: '비밀번호 및 2단계 인증',
  },
  {
    icon: FileText,
    label: '계약 정보',
    description: '이용약관 및 계약서 확인',
  },
];

export default function SettingsPage() {
  const [profile, setProfile] = useState<BrandProfile>(mockProfile);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateProfile = (key: keyof BrandProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setHasChanges(false);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">설정</h1>
        <p className="mt-1" style={{ color: colors.text.secondary }}>
          브랜드 정보 및 계정 설정을 관리하세요
        </p>
      </motion.div>

      {/* Profile Section */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        <GlassCard padding="lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `${colors.flame[500]}20` }}
              >
                <Building2 size={24} style={{ color: colors.flame[500] }} />
              </div>
              <div>
                <h2 className="font-semibold text-white">브랜드 정보</h2>
                <p className="text-sm" style={{ color: colors.text.secondary }}>
                  기본 정보를 관리합니다
                </p>
              </div>
            </div>
            {hasChanges && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  background: colors.flame[500],
                  color: 'white',
                }}
              >
                수정됨
              </motion.span>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <CosmicInput
              label="브랜드명"
              value={profile.brand_name}
              onChange={(v) => updateProfile('brand_name', v)}
              icon={<Building2 size={18} />}
            />
            <CosmicInput
              label="담당자 이메일"
              type="email"
              value={profile.contact_email}
              onChange={(v) => updateProfile('contact_email', v)}
              icon={<Mail size={18} />}
            />
            <CosmicInput
              label="연락처"
              type="tel"
              value={profile.contact_phone}
              onChange={(v) => updateProfile('contact_phone', v)}
              icon={<Phone size={18} />}
            />
            <CosmicInput
              label="웹사이트"
              type="url"
              value={profile.website}
              onChange={(v) => updateProfile('website', v)}
              icon={<Globe size={18} />}
            />
            <CosmicInput
              label="사업자 등록번호"
              value={profile.business_registration_number}
              onChange={(v) => updateProfile('business_registration_number', v)}
              icon={<FileText size={18} />}
            />
          </div>

          <div className="mt-5">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.text.secondary }}
            >
              브랜드 소개
            </label>
            <textarea
              value={profile.description}
              onChange={(e) => updateProfile('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl resize-none"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${colors.border.subtle}`,
                color: colors.text.primary,
              }}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <PrimaryButton
              onClick={handleSave}
              loading={saving}
              disabled={!hasChanges}
              className="min-w-[140px]"
            >
              <Save size={18} />
              저장하기
            </PrimaryButton>
          </div>
        </GlassCard>
      </motion.section>

      {/* Settings Menu */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {settingsMenu.map((item, _idx) => {
          const Icon = item.icon;

          return (
            <motion.div key={item.label} variants={staggerItem}>
              <motion.button whileHover={{ x: 4 }} whileTap={{ scale: 0.99 }} className="w-full">
                <GlassCard padding="md" hover={false}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                      >
                        <Icon size={20} style={{ color: colors.text.secondary }} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-white">{item.label}</p>
                        <p className="text-sm" style={{ color: colors.text.tertiary }}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} style={{ color: colors.text.tertiary }} />
                  </div>
                </GlassCard>
              </motion.button>
            </motion.div>
          );
        })}
      </motion.section>

      {/* Danger Zone */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.5 }}
      >
        <GlassCard padding="lg">
          <h3 className="font-semibold text-white mb-4">계정</h3>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full flex items-center justify-between p-4 rounded-xl transition-colors"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: `1px solid rgba(239, 68, 68, 0.2)`,
            }}
          >
            <div className="flex items-center gap-3">
              <LogOut size={20} style={{ color: colors.error }} />
              <span style={{ color: colors.error }}>로그아웃</span>
            </div>
            <ChevronRight size={20} style={{ color: colors.error }} />
          </motion.button>
        </GlassCard>
      </motion.section>

      {/* Footer */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.6 }}
        className="text-center pt-4"
      >
        <p className="text-sm" style={{ color: colors.text.tertiary }}>
          ZZIK Brand Dashboard v1.0.0
        </p>
        <p className="text-xs mt-1" style={{ color: colors.text.muted }}>
          "참여하면 열린다" | Join to Open
        </p>
      </motion.div>
    </div>
  );
}
