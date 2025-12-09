'use client';

import React from 'react';
import { useTranslation } from '@/i18n/LanguageProvider';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function PartnerLandingClient() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleApply = () => {
    // Navigate to dashboard or application form
    // For now, assume dashboard access or login check
    router.push('/partner/dashboard');
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white pb-20">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1533552097843-f61ba33b664d?q=80&w=2070&auto=format&fit=crop"
            alt="K-Culture"
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-900" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <m.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500"
          >
            {t('partner.heroTitle')}
          </m.h1>
          <m.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 whitespace-pre-line"
          >
            {t('partner.heroSubtitle')}
          </m.p>
          <m.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={handleApply}
            className="px-8 py-4 bg-pink-600 hover:bg-pink-700 rounded-full text-lg font-bold transition-all shadow-lg shadow-pink-600/30"
          >
            {t('partner.applyNow')}
          </m.button>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{t('partner.whyPartner')}</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <BenefitCard 
              title={t('partner.benefit1Title')}
              description={t('partner.benefit1Desc')}
              icon="🌍"
              delay={0}
            />
            <BenefitCard 
              title={t('partner.benefit2Title')}
              description={t('partner.benefit2Desc')}
              icon="⚡"
              delay={0.2}
            />
            <BenefitCard 
              title={t('partner.benefit3Title')}
              description={t('partner.benefit3Desc')}
              icon="💰"
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-neutral-800/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatCard label="Active Users" value="1M+" />
            <StatCard label="Countries" value="120+" />
            <StatCard label="Partner Earnings" value="$5M+" />
            <StatCard label="Growth" value="300%" />
          </div>
        </div>
      </section>
      
      {/* Bottom CTA */}
      <section className="py-20 text-center px-4">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-violet-900/50 to-pink-900/50 p-12 rounded-3xl border border-white/10">
          <h2 className="text-3xl font-bold mb-6">Ready to Start?</h2>
          <p className="text-gray-300 mb-8 text-lg">Join the fastest growing K-Culture platform today.</p>
          <button 
            onClick={handleApply}
            className="px-8 py-3 bg-white text-neutral-900 hover:bg-gray-100 rounded-full font-bold transition-colors"
          >
            {t('partner.applyNow')}
          </button>
        </div>
      </section>
    </div>
  );
}

function BenefitCard({ title, description, icon, delay }: { title: string, description: string, icon: string, delay: number }) {
  return (
    <m.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-neutral-800 p-8 rounded-2xl border border-white/5 hover:border-pink-500/30 transition-colors"
    >
      <div className="text-4xl mb-6">{icon}</div>
      <h3 className="text-xl font-bold mb-4 text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </m.div>
  );
}

function StatCard({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 mb-2">{value}</div>
      <div className="text-sm text-gray-400 uppercase tracking-wider">{label}</div>
    </div>
  );
}
