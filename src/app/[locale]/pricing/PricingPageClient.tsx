'use client';

import Link from 'next/link';
import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/i18n/LanguageProvider';
import { useCurrency } from '@/hooks/useCurrency';
import { TIER_FEATURES, formatCurrency } from '@/lib/global-pricing';
import { cn } from '@/lib/utils';

type TierType = 'free' | 'silver' | 'gold' | 'platinum';
type PeriodType = 'monthly' | 'yearly';

// Tier Visual Configuration Types
interface TierConfigItem {
  icon: React.ReactNode;
  gradient: string;
  borderGradient: string;
  iconBg: string;
  accentColor: string;
  buttonClass: string;
  popular?: boolean;
}

// Tier Visual Configuration
const TIER_CONFIG: Record<TierType, TierConfigItem> = {
  free: {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    gradient: 'from-white/5 to-white/[0.02]',
    borderGradient: 'from-white/10 to-white/5',
    iconBg: 'bg-white/10',
    accentColor: 'text-white/60',
    buttonClass: 'bg-white/10 text-white/60 cursor-default',
  },
  silver: {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    gradient: 'from-gray-400/10 to-gray-500/5',
    borderGradient: 'from-gray-400/30 to-gray-500/10',
    iconBg: 'bg-gradient-to-br from-gray-300 to-gray-500',
    accentColor: 'text-gray-300',
    buttonClass: 'bg-white/10 hover:bg-white/15 text-white',
  },
  gold: {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    gradient: 'from-yellow-500/15 to-amber-600/5',
    borderGradient: 'from-yellow-400/40 to-amber-500/20',
    iconBg: 'bg-gradient-to-br from-yellow-400 to-amber-500',
    accentColor: 'text-yellow-400',
    buttonClass: 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-semibold',
    popular: true,
  },
  platinum: {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    gradient: 'from-purple-500/15 to-violet-600/5',
    borderGradient: 'from-purple-400/40 to-violet-500/20',
    iconBg: 'bg-gradient-to-br from-purple-400 to-violet-500',
    accentColor: 'text-purple-400',
    buttonClass: 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white',
  },
};

// Translations
const translations = {
  ko: {
    title: 'VIP 멤버십',
    subtitle: '나에게 맞는 멤버십을 선택하고 독점 K-Experience 혜택을 누리세요',
    monthly: '월간',
    yearly: '연간',
    save: '20% 할인',
    perMonth: '/월',
    perYear: '/년',
    free: '무료',
    currentPlan: '현재 플랜',
    getStarted: '시작하기',
    upgrade: '업그레이드',
    processing: '처리 중...',
    popular: '인기',
    bestValue: '최고 가치',
    faq: '자주 묻는 질문',
    faqDesc: '더 궁금한 점이 있으신가요?',
    contactSupport: '고객센터에 문의하세요',
    tierNames: { free: '무료', silver: '실버', gold: '골드', platinum: '플래티넘' },
  },
  en: {
    title: 'VIP Membership',
    subtitle: 'Choose your membership and unlock exclusive K-Experience benefits',
    monthly: 'Monthly',
    yearly: 'Yearly',
    save: 'Save 20%',
    perMonth: '/mo',
    perYear: '/yr',
    free: 'Free',
    currentPlan: 'Current Plan',
    getStarted: 'Get Started',
    upgrade: 'Upgrade',
    processing: 'Processing...',
    popular: 'Popular',
    bestValue: 'Best Value',
    faq: 'Frequently Asked Questions',
    faqDesc: 'Have more questions?',
    contactSupport: 'Contact Support',
    tierNames: { free: 'Free', silver: 'Silver', gold: 'Gold', platinum: 'Platinum' },
  },
  ja: {
    title: 'VIPメンバーシップ',
    subtitle: '自分に合ったメンバーシップを選んで、独占K-Experience特典をお楽しみください',
    monthly: '月額',
    yearly: '年額',
    save: '20%オフ',
    perMonth: '/月',
    perYear: '/年',
    free: '無料',
    currentPlan: '現在のプラン',
    getStarted: '始める',
    upgrade: 'アップグレード',
    processing: '処理中...',
    popular: '人気',
    bestValue: 'お得',
    faq: 'よくある質問',
    faqDesc: 'ご不明な点がございますか？',
    contactSupport: 'サポートに連絡',
    tierNames: { free: '無料', silver: 'シルバー', gold: 'ゴールド', platinum: 'プラチナ' },
  },
  'zh-TW': {
    title: 'VIP會員',
    subtitle: '選擇適合您的會員資格，享受獨家K-Experience優惠',
    monthly: '每月',
    yearly: '每年',
    save: '節省20%',
    perMonth: '/月',
    perYear: '/年',
    free: '免費',
    currentPlan: '目前方案',
    getStarted: '開始',
    upgrade: '升級',
    processing: '處理中...',
    popular: '熱門',
    bestValue: '最佳價值',
    faq: '常見問題',
    faqDesc: '還有其他問題嗎？',
    contactSupport: '聯繫客服',
    tierNames: { free: '免費', silver: '銀級', gold: '金級', platinum: '白金級' },
  },
  th: {
    title: 'สมาชิก VIP',
    subtitle: 'เลือกสมาชิกที่เหมาะกับคุณและรับสิทธิพิเศษ K-Experience',
    monthly: 'รายเดือน',
    yearly: 'รายปี',
    save: 'ประหยัด 20%',
    perMonth: '/เดือน',
    perYear: '/ปี',
    free: 'ฟรี',
    currentPlan: 'แผนปัจจุบัน',
    getStarted: 'เริ่มต้น',
    upgrade: 'อัพเกรด',
    processing: 'กำลังดำเนินการ...',
    popular: 'ยอดนิยม',
    bestValue: 'คุ้มค่าที่สุด',
    faq: 'คำถามที่พบบ่อย',
    faqDesc: 'มีคำถามเพิ่มเติมหรือไม่?',
    contactSupport: 'ติดต่อฝ่ายสนับสนุน',
    tierNames: { free: 'ฟรี', silver: 'เงิน', gold: 'ทอง', platinum: 'แพลตินัม' },
  },
};

export default function PricingPageClient() {
  const { locale } = useTranslation();
  const { region, currency, getTierPricing } = useCurrency();
  const [period, setPeriod] = useState<PeriodType>('monthly');
  const [loading, setLoading] = useState<TierType | null>(null);
  const [hoveredTier, setHoveredTier] = useState<TierType | null>(null);

  const t = translations[locale as keyof typeof translations] || translations.en;
  const tiers: TierType[] = ['free', 'silver', 'gold', 'platinum'];

  const handleSubscribe = async (tier: TierType) => {
    if (tier === 'free') return;
    
    setLoading(tier);
    try {
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, period, region, locale }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(null);
    }
  };

  const getPrice = (tier: TierType) => {
    if (tier === 'free') return 0;
    const pricing = getTierPricing(tier, period);
    return pricing?.amount || 0;
  };

  const getOriginalPrice = (tier: TierType) => {
    if (tier === 'free' || period === 'monthly') return null;
    const monthlyPrice = getTierPricing(tier, 'monthly');
    return monthlyPrice ? monthlyPrice.amount * 12 : null;
  };

  return (
    <div className="min-h-screen bg-space-950 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-flame-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <m.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-flame-500/10 border border-flame-500/20 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-flame-500 animate-pulse" />
            <span className="text-sm font-medium text-flame-400">VIP Benefits</span>
          </m.div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
            {t.title}
          </h1>
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </m.div>

        {/* Period Toggle */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="relative bg-white/[0.04] backdrop-blur-xl rounded-full p-1.5 border border-white/10">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPeriod('monthly')}
                className={cn(
                  'relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300',
                  period === 'monthly' ? 'text-white' : 'text-white/50 hover:text-white/70'
                )}
              >
                {period === 'monthly' && (
                  <m.div
                    layoutId="periodToggle"
                    className="absolute inset-0 bg-flame-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{t.monthly}</span>
              </button>
              <button
                onClick={() => setPeriod('yearly')}
                className={cn(
                  'relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2',
                  period === 'yearly' ? 'text-white' : 'text-white/50 hover:text-white/70'
                )}
              >
                {period === 'yearly' && (
                  <m.div
                    layoutId="periodToggle"
                    className="absolute inset-0 bg-flame-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{t.yearly}</span>
                <span className="relative z-10 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  {t.save}
                </span>
              </button>
            </div>
          </div>
        </m.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {tiers.map((tier, index) => {
            const config = TIER_CONFIG[tier];
            const features = TIER_FEATURES[tier];
            const price = getPrice(tier);
            const originalPrice = getOriginalPrice(tier);
            const isHovered = hoveredTier === tier;
            const isPopular = config.popular;

            return (
              <m.div
                key={tier}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                onHoverStart={() => setHoveredTier(tier)}
                onHoverEnd={() => setHoveredTier(null)}
                className={cn(
                  'relative group',
                  isPopular && 'lg:-mt-4 lg:mb-4'
                )}
              >
                {/* Popular/Best Value Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <m.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: 'spring' }}
                      className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-bold px-4 py-1.5 rounded-full shadow-lg"
                    >
                      {t.popular} ⭐
                    </m.div>
                  </div>
                )}

                {/* Card */}
                <div
                  className={cn(
                    'relative overflow-hidden rounded-2xl transition-all duration-500',
                    'bg-gradient-to-b',
                    config.gradient,
                    'border border-white/10',
                    isPopular && 'border-yellow-400/30',
                    isHovered && 'scale-[1.02] shadow-2xl'
                  )}
                >
                  {/* Gradient border effect */}
                  <div className={cn(
                    'absolute inset-0 rounded-2xl p-[1px]',
                    'bg-gradient-to-b',
                    config.borderGradient,
                    'opacity-0 group-hover:opacity-100 transition-opacity duration-500'
                  )} />

                  {/* Inner content */}
                  <div className="relative p-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        config.iconBg,
                        tier === 'free' && 'text-white/60',
                        tier !== 'free' && 'text-white'
                      )}>
                        {config.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {t.tierNames[tier as keyof typeof t.tierNames]}
                        </h3>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      {originalPrice && (
                        <span className="text-sm text-white/40 line-through mr-2">
                          {formatCurrency(originalPrice, currency)}
                        </span>
                      )}
                      <div className="flex items-end gap-1">
                        <span className={cn('text-4xl font-bold', config.accentColor, tier !== 'free' && 'text-white')}>
                          {tier === 'free' ? t.free : formatCurrency(price, currency)}
                        </span>
                        {tier !== 'free' && (
                          <span className="text-white/40 text-sm mb-1.5">
                            {period === 'monthly' ? t.perMonth : t.perYear}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-6">
                      {features.map((feature, i) => (
                        <m.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <svg
                            className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.accentColor)}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm text-white/70">{feature}</span>
                        </m.li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <m.button
                      whileHover={{ scale: tier === 'free' ? 1 : 1.02 }}
                      whileTap={{ scale: tier === 'free' ? 1 : 0.98 }}
                      onClick={() => handleSubscribe(tier)}
                      disabled={loading === tier || tier === 'free'}
                      className={cn(
                        'w-full py-3.5 px-4 rounded-xl font-medium transition-all duration-300',
                        config.buttonClass,
                        loading === tier && 'opacity-70 cursor-wait'
                      )}
                    >
                      {loading === tier ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          {t.processing}
                        </span>
                      ) : tier === 'free' ? (
                        t.currentPlan
                      ) : (
                        t.getStarted
                      )}
                    </m.button>
                  </div>
                </div>
              </m.div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-20 text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-3">{t.faq}</h2>
          <p className="text-white/50">
            {t.faqDesc}{' '}
            <Link href="/support" className="text-flame-400 hover:text-flame-300 hover:underline transition-colors">
              {t.contactSupport}
            </Link>
          </p>
        </m.div>

        {/* Trust badges */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 flex flex-wrap justify-center items-center gap-8 text-white/30"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Secure Payment</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            <span className="text-sm">Cancel Anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">24/7 Support</span>
          </div>
        </m.div>
      </div>
    </div>
  );
}
