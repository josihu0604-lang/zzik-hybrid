'use client';

import Link from 'next/link';
import { m } from 'framer-motion';
import { Camera, Sparkles, Calendar, History } from 'lucide-react';
import { colors, rgba, gradients } from '@/lib/design-tokens';

/**
 * Beauty Hub - K-Beauty AI Platform
 * 
 * 🎯 UX-001 Implementation: Beauty Pillar
 * 
 * Features:
 * - AI Skin Analysis 진입점
 * - 개인화된 제품/시술 추천
 * - 병원 예약 시스템
 * - Before/After 증명
 */

interface FeatureCard {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Camera;
  href: string;
  color: string;
  gradient: string;
}

const FEATURES: FeatureCard[] = [
  {
    id: 'analyze',
    title: 'AI Skin Analysis',
    subtitle: 'Get personalized skincare advice',
    icon: Camera,
    href: '/beauty/analyze',
    color: colors.pink[500],
    gradient: 'from-pink-500 to-purple-500',
  },
  {
    id: 'recommend',
    title: 'K-Beauty Products',
    subtitle: 'Curated for your skin type',
    icon: Sparkles,
    href: '/beauty/products',
    color: colors.purple[500],
    gradient: 'from-purple-500 to-indigo-500',
  },
  {
    id: 'booking',
    title: 'Clinic Booking',
    subtitle: 'Reserve treatments & pay with Z-Point',
    icon: Calendar,
    href: '/beauty/booking',
    color: colors.indigo[500],
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    id: 'history',
    title: 'My Beauty Journey',
    subtitle: 'Track your transformation',
    icon: History,
    href: '/beauty/history',
    color: colors.blue[500],
    gradient: 'from-blue-500 to-cyan-500',
  },
];

export default function BeautyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-space-950 via-space-900 to-black">
      {/* Header */}
      <header className="px-6 pt-12 pb-8">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-black tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
              K-Beauty AI
            </span>
          </h1>
          <p className="mt-2 text-base" style={{ color: rgba.white[60] }}>
            Analyze, Discover, Transform
          </p>
        </m.div>
      </header>

      {/* Hero CTA */}
      <section className="px-6 mb-12">
        <Link href="/beauty/analyze">
          <m.div
            className="relative overflow-hidden rounded-3xl p-8"
            style={{
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(167, 139, 250, 0.2))',
              border: `1px solid ${rgba.white[10]}`,
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 blur-3xl" />
            
            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Start Analysis</h2>
                <p className="mt-1 text-sm" style={{ color: rgba.white[70] }}>
                  AI-powered skin diagnosis in 30 seconds
                </p>
              </div>
              <div 
                className="flex items-center justify-center w-16 h-16 rounded-2xl"
                style={{ background: gradients.flame }}
              >
                <Camera size={32} color="white" strokeWidth={2.5} />
              </div>
            </div>
          </m.div>
        </Link>
      </section>

      {/* Feature Grid */}
      <section className="px-6 pb-32">
        <h2 className="mb-6 text-lg font-semibold">Explore Services</h2>
        <div className="grid grid-cols-2 gap-4">
          {FEATURES.map((feature, index) => (
            <Link key={feature.id} href={feature.href}>
              <m.div
                className="relative overflow-hidden rounded-2xl p-6 h-48"
                style={{
                  background: rgba.space[92],
                  border: `1px solid ${rgba.white[10]}`,
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Icon */}
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                  style={{ background: `${feature.color}20` }}
                >
                  <feature.icon size={24} color={feature.color} strokeWidth={2} />
                </div>

                {/* Content */}
                <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: rgba.white[60] }}>
                  {feature.subtitle}
                </p>
              </m.div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
