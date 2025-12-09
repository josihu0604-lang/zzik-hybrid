'use client';

import { m } from 'framer-motion';
import Link from 'next/link';
import { Flame, Users, MapPin, Sparkles, Download, ChevronRight, Star } from 'lucide-react';
import { colors, gradients } from '@/lib/design-tokens';
import { getAppStoreLinks, isMobileDevice } from '@/lib/platform';
import { useReducedMotion } from '@/hooks/useAccessibility';

/**
 * ZZIK Landing Page - 마케팅 랜딩페이지
 *
 * 웹 방문자를 위한 서비스 소개 및 앱 다운로드 유도 페이지
 * - 히어로 섹션: 핵심 가치 전달
 * - 기능 소개: 서비스 특징
 * - 앱 다운로드 CTA
 * - SEO 최적화
 */

const features = [
  {
    icon: Users,
    title: '함께 열어요',
    description: '원하는 팝업에 참여하고 목표 인원을 채우면 팝업이 열려요',
    color: colors.flame[500],
  },
  {
    icon: MapPin,
    title: '내 주변 팝업',
    description: '지도에서 확정된 팝업 위치를 확인하고 방문해요',
    color: colors.spark[400],
  },
  {
    icon: Sparkles,
    title: '특별한 경험',
    description: '방문 인증하고 찍음 배지를 받아 특별한 경험을 기록해요',
    color: colors.success,
  },
];

const stats = [
  { value: '10,000+', label: '참여자' },
  { value: '150+', label: '팝업 오픈' },
  { value: '95%', label: '목표 달성률' },
];

export default function LandingPage() {
  const prefersReducedMotion = useReducedMotion();
  const appStoreLinks = getAppStoreLinks();
  const isMobile = typeof window !== 'undefined' && isMobileDevice();

  const containerVariants = prefersReducedMotion
    ? undefined
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1 },
        },
      };

  const itemVariants = prefersReducedMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      };

  return (
    <div className="min-h-screen bg-space-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-space-950/80 backdrop-blur-xl border-b border-white/[0.06]">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2">
            <Flame size={24} className="text-flame-500" />
            <span className="text-xl font-bold tracking-tight">ZZIK</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-white/60 hover:text-white transition-colors min-h-[44px] flex items-center px-3"
            >
              로그인
            </Link>
            <Link
              href="/"
              className="text-sm font-semibold px-4 py-2.5 min-h-[44px] flex items-center rounded-full transition-all"
              style={{
                background: gradients.flame,
                boxShadow: `0 4px 16px ${colors.flame[500]}40`,
              }}
            >
              시작하기
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${colors.flame[500]}15 0%, transparent 70%)`,
          }}
        />

        <m.div
          className="max-w-4xl mx-auto text-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <m.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{
              background: 'rgba(255, 107, 91, 0.1)',
              border: '1px solid rgba(255, 107, 91, 0.2)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-flame-500 animate-pulse" />
            <span className="text-sm text-flame-400">팝업 크라우드펀딩 플랫폼</span>
          </m.div>

          {/* Headline */}
          <m.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6"
          >
            참여하면,{' '}
            <span
              style={{
                background: gradients.flame,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              열린다
            </span>
          </m.h1>

          {/* Subheadline */}
          <m.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10"
          >
            좋아하는 브랜드의 팝업스토어, 이제 당신이 결정해요.
            <br className="hidden sm:block" />
            참여하고, 목표를 채우고, 함께 열어요.
          </m.p>

          {/* CTAs */}
          <m.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-4 min-h-[56px] rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
              style={{
                background: gradients.flame,
                boxShadow: `0 8px 32px ${colors.flame[500]}40`,
              }}
            >
              <Flame size={22} />
              지금 참여하기
              <ChevronRight size={20} />
            </Link>

            {isMobile && (
              <a
                href={appStoreLinks.ios}
                className="w-full sm:w-auto px-8 py-4 min-h-[56px] rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all hover:bg-white/10"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Download size={20} />앱 다운로드
              </a>
            )}
          </m.div>

          {/* Stats */}
          <m.div
            variants={itemVariants}
            className="flex items-center justify-center gap-8 sm:gap-16 mt-16 pt-8 border-t border-white/[0.06]"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/40">{stat.label}</div>
              </div>
            ))}
          </m.div>
        </m.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <m.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">어떻게 작동하나요?</h2>
            <p className="text-white/60 max-w-xl mx-auto">
              원하는 팝업에 참여하면 목표 인원이 모였을 때 팝업이 열려요
            </p>
          </m.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <m.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feature.color}20` }}
                >
                  <feature.icon size={24} style={{ color: feature.color }} />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-white/60">{feature.description}</p>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-6 bg-space-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={24} fill={colors.spark[400]} stroke={colors.spark[400]} />
              ))}
            </div>
            <blockquote className="text-xl sm:text-2xl font-medium mb-6">
              &ldquo;좋아하는 브랜드 팝업에 드디어 갈 수 있게 됐어요!
              <br />
              참여하니까 진짜 열리더라구요&rdquo;
            </blockquote>
            <cite className="text-white/40 not-italic">- 김**님, ZZIK 사용자</cite>
          </m.div>
        </div>
      </section>

      {/* Download CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${colors.space[800]} 0%, ${colors.space[900]} 100%)`,
              border: '1px solid rgba(255, 107, 91, 0.2)',
            }}
          >
            {/* Background Glow */}
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${colors.flame[500]}20 0%, transparent 70%)`,
                transform: 'translate(30%, -30%)',
              }}
            />

            <h2 className="text-3xl sm:text-4xl font-bold mb-4 relative z-10">
              지금 바로 시작하세요
            </h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto relative z-10">
              앱을 다운로드하고 원하는 팝업에 참여하세요.
              <br />
              당신의 참여가 팝업을 열어요!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <a
                href={appStoreLinks.ios}
                className="w-full sm:w-auto px-6 py-3 min-h-[48px] rounded-xl flex items-center justify-center gap-3 bg-white text-black font-semibold transition-transform hover:scale-[1.02]"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                App Store
              </a>
              <a
                href={appStoreLinks.android}
                className="w-full sm:w-auto px-6 py-3 min-h-[48px] rounded-xl flex items-center justify-center gap-3 bg-white text-black font-semibold transition-transform hover:scale-[1.02]"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                  <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.25-.84-.76-.84-1.35m13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27m3.35-4.31c.34.27.59.69.59 1.19s-.22.9-.57 1.18l-2.29 1.32-2.5-2.5 2.5-2.5 2.27 1.31M6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49z" />
                </svg>
                Google Play
              </a>
            </div>
          </m.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Flame size={20} className="text-flame-500" />
              <span className="font-bold">ZZIK</span>
              <span className="text-white/40 text-sm">| 참여하면, 열린다</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/40">
              <Link href="/privacy" className="hover:text-white/60 min-h-[44px] flex items-center">
                개인정보처리방침
              </Link>
              <Link href="/licenses" className="hover:text-white/60 min-h-[44px] flex items-center">
                서비스 이용약관
              </Link>
              <Link href="/help" className="hover:text-white/60 min-h-[44px] flex items-center">
                고객센터
              </Link>
            </div>
          </div>
          <p className="text-center text-white/30 text-xs mt-8">
            &copy; 2024 ZZIK. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
