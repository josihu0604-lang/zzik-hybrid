'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { m } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from '@/i18n/LanguageProvider';
import { cn } from '@/lib/utils';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  velocity: { x: number; y: number };
}

// Custom confetti effect
function useConfetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const colors = ['#FF6B5B', '#FFD93D', '#22c55e', '#a855f7', '#3b82f6'];
    const particles: Particle[] = [];
    
    // Create particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        id: i,
        x: canvas.width / 2,
        y: canvas.height / 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        velocity: {
          x: (Math.random() - 0.5) * 20,
          y: (Math.random() - 0.5) * 20 - 10,
        },
      });
    }
    
    let animationId: number;
    const gravity = 0.3;
    const friction = 0.99;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        p.velocity.y += gravity;
        p.velocity.x *= friction;
        p.velocity.y *= friction;
        p.x += p.velocity.x;
        p.y += p.velocity.y;
        p.size *= 0.99;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      
      if (particles.some(p => p.size > 0.5)) {
        animationId = requestAnimationFrame(animate);
      }
    };
    
    animate();
    
    return () => cancelAnimationFrame(animationId);
  }, []);
  
  return canvasRef;
}

const translations = {
  ko: {
    title: '결제 완료!',
    subtitle: 'VIP 멤버십이 활성화되었습니다',
    benefits: '멤버십 혜택',
    benefitsList: [
      'VIP 전용 입장권 혜택',
      '우선 예약 및 얼리 액세스',
      '독점 K-Experience 콘텐츠',
      'VIP 전용 이벤트 초대',
    ],
    emailSent: '확인 이메일을 발송했습니다',
    goToProfile: '프로필로 이동',
    exploreExperiences: 'K-Experience 둘러보기',
    orderRef: '주문 번호',
  },
  en: {
    title: 'Payment Complete!',
    subtitle: 'Your VIP membership has been activated',
    benefits: 'Membership Benefits',
    benefitsList: [
      'VIP exclusive entry benefits',
      'Priority booking & early access',
      'Exclusive K-Experience content',
      'VIP-only event invitations',
    ],
    emailSent: 'Confirmation email sent',
    goToProfile: 'Go to Profile',
    exploreExperiences: 'Explore K-Experiences',
    orderRef: 'Order Reference',
  },
  ja: {
    title: '決済完了！',
    subtitle: 'VIPメンバーシップが有効化されました',
    benefits: 'メンバーシップ特典',
    benefitsList: [
      'VIP専用入場特典',
      '優先予約・早期アクセス',
      '限定K-Experienceコンテンツ',
      'VIP専用イベント招待',
    ],
    emailSent: '確認メールを送信しました',
    goToProfile: 'プロフィールへ',
    exploreExperiences: 'K-Experienceを探索',
    orderRef: '注文番号',
  },
  'zh-TW': {
    title: '付款完成！',
    subtitle: 'VIP會員已啟用',
    benefits: '會員福利',
    benefitsList: [
      'VIP專屬入場優惠',
      '優先預訂和早期訪問',
      '獨家K-Experience內容',
      'VIP專屬活動邀請',
    ],
    emailSent: '確認郵件已發送',
    goToProfile: '前往個人資料',
    exploreExperiences: '探索K-Experience',
    orderRef: '訂單編號',
  },
  th: {
    title: 'ชำระเงินสำเร็จ!',
    subtitle: 'สมาชิก VIP ถูกเปิดใช้งานแล้ว',
    benefits: 'สิทธิประโยชน์สมาชิก',
    benefitsList: [
      'สิทธิ์การเข้าชม VIP พิเศษ',
      'การจองล่วงหน้าและการเข้าถึงก่อนใคร',
      'เนื้อหา K-Experience พิเศษ',
      'คำเชิญงานอีเวนต์ VIP',
    ],
    emailSent: 'อีเมลยืนยันถูกส่งแล้ว',
    goToProfile: 'ไปที่โปรไฟล์',
    exploreExperiences: 'สำรวจ K-Experience',
    orderRef: 'หมายเลขคำสั่งซื้อ',
  },
};

const tierGradients: Record<string, string> = {
  silver: 'from-gray-400 via-gray-300 to-gray-500',
  gold: 'from-yellow-400 via-amber-300 to-yellow-500',
  platinum: 'from-purple-400 via-violet-300 to-purple-500',
};

export default function PaymentSuccessClient() {
  const { locale } = useTranslation();
  const searchParams = useSearchParams();
  const confettiRef = useConfetti();
  const [orderDetails, setOrderDetails] = useState<{
    tier?: string;
    email?: string;
  } | null>(null);

  const sessionId = searchParams.get('session_id');
  const t = translations[locale as keyof typeof translations] || translations.en;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (sessionId) {
      fetch(`/api/payment/verify?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setOrderDetails(data.order);
          }
        })
        .catch(console.error);
    }
  }, [sessionId]);

  const tier = orderDetails?.tier || 'gold';

  return (
    <div className="min-h-screen bg-space-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Confetti canvas */}
      <canvas
        ref={confettiRef}
        className="fixed inset-0 pointer-events-none z-50"
      />

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-flame-500/20 rounded-full blur-[128px] animate-pulse" />
      </div>

      <m.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative max-w-lg w-full"
      >
        {/* Main Card */}
        <div className="relative overflow-hidden rounded-3xl bg-space-850/80 backdrop-blur-xl border border-white/10 shadow-2xl">
          {/* Header with gradient */}
          <div className={cn(
            'relative p-8 text-center overflow-hidden',
            'bg-gradient-to-br',
            tierGradients[tier] || tierGradients.gold
          )}>
            {/* Animated rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(3)].map((_, i) => (
                <m.div
                  key={i}
                  initial={{ scale: 0, opacity: 0.5 }}
                  animate={{ scale: 2 + i, opacity: 0 }}
                  transition={{
                    duration: 2,
                    delay: i * 0.4,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                  className="absolute w-24 h-24 rounded-full border-2 border-white/30"
                />
              ))}
            </div>

            {/* Success icon */}
            <m.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="relative z-10 w-24 h-24 mx-auto mb-6 rounded-full bg-white shadow-xl flex items-center justify-center"
            >
              <m.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="w-12 h-12 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <m.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </m.svg>
            </m.div>

            <m.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative z-10 text-3xl font-bold text-white mb-2"
            >
              {t.title}
            </m.h1>

            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative z-10 text-white/80"
            >
              {t.subtitle}
            </m.p>
          </div>

          {/* Benefits */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-flame-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              <h2 className="font-semibold text-white">{t.benefits}</h2>
            </div>

            <ul className="space-y-3">
              {t.benefitsList.map((benefit, index) => (
                <m.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-sm text-white/70">{benefit}</span>
                </m.li>
              ))}
            </ul>

            {/* Email notification */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-6 p-4 bg-white/[0.04] rounded-xl flex items-center gap-3 border border-white/8"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm text-white/60">{t.emailSent}</span>
            </m.div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <Link
                href="/profile"
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-medium',
                  'bg-flame-500 text-white hover:bg-flame-400',
                  'transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]'
                )}
              >
                {t.goToProfile}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/k-experience"
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-medium',
                  'bg-white/[0.04] text-white/80 hover:bg-white/[0.08] border border-white/10',
                  'transition-all duration-200'
                )}
              >
                {t.exploreExperiences}
              </Link>
            </div>
          </div>
        </div>

        {/* Order Reference */}
        {sessionId && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 text-center"
          >
            <p className="text-xs text-white/30">
              {t.orderRef}: {sessionId.slice(0, 24)}...
            </p>
          </m.div>
        )}
      </m.div>
    </div>
  );
}
