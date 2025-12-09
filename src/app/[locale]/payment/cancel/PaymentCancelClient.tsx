'use client';

import { m } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from '@/i18n/LanguageProvider';
import { cn } from '@/lib/utils';

const translations = {
  ko: {
    title: '결제가 취소되었습니다',
    subtitle: '결제가 완료되지 않았습니다. 언제든 다시 시도하실 수 있습니다.',
    reasons: '취소된 이유가 있으신가요?',
    reasonsList: [
      '결제 정보를 다시 확인하고 싶어서',
      '다른 멤버십 플랜을 선택하고 싶어서',
      '나중에 결제하고 싶어서',
    ],
    tryAgain: '다시 시도하기',
    backToHome: '홈으로 돌아가기',
    needHelp: '도움이 필요하신가요?',
    contactSupport: '고객센터 문의',
  },
  en: {
    title: 'Payment Cancelled',
    subtitle: 'Your payment was not completed. You can try again anytime.',
    reasons: 'Is there a reason you cancelled?',
    reasonsList: [
      'I wanted to review my payment details',
      'I wanted to choose a different plan',
      "I'll complete the payment later",
    ],
    tryAgain: 'Try Again',
    backToHome: 'Back to Home',
    needHelp: 'Need help?',
    contactSupport: 'Contact Support',
  },
  ja: {
    title: '決済がキャンセルされました',
    subtitle: '決済が完了していません。いつでも再試行できます。',
    reasons: 'キャンセルした理由はありますか？',
    reasonsList: [
      '決済情報を再確認したい',
      '別のメンバーシッププランを選びたい',
      '後で決済したい',
    ],
    tryAgain: 'もう一度試す',
    backToHome: 'ホームに戻る',
    needHelp: 'お困りですか？',
    contactSupport: 'サポートに連絡',
  },
  'zh-TW': {
    title: '付款已取消',
    subtitle: '付款未完成。您可以隨時重試。',
    reasons: '有取消的原因嗎？',
    reasonsList: [
      '想重新確認付款資訊',
      '想選擇其他會員方案',
      '想稍後付款',
    ],
    tryAgain: '重試',
    backToHome: '返回首頁',
    needHelp: '需要幫助嗎？',
    contactSupport: '聯繫客服',
  },
  th: {
    title: 'การชำระเงินถูกยกเลิก',
    subtitle: 'การชำระเงินไม่สำเร็จ คุณสามารถลองอีกครั้งได้ทุกเมื่อ',
    reasons: 'มีเหตุผลที่ยกเลิกหรือไม่?',
    reasonsList: [
      'ต้องการตรวจสอบข้อมูลการชำระเงินอีกครั้ง',
      'ต้องการเลือกแผนสมาชิกอื่น',
      'ต้องการชำระเงินภายหลัง',
    ],
    tryAgain: 'ลองอีกครั้ง',
    backToHome: 'กลับหน้าแรก',
    needHelp: 'ต้องการความช่วยเหลือ?',
    contactSupport: 'ติดต่อฝ่ายสนับสนุน',
  },
};

export default function PaymentCancelClient() {
  const { locale } = useTranslation();
  const t = translations[locale as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen bg-space-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-white/5 rounded-full blur-[128px]" />
      </div>

      <m.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative max-w-lg w-full"
      >
        {/* Main Card */}
        <div className="relative overflow-hidden rounded-3xl bg-space-850/80 backdrop-blur-xl border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="p-8 text-center bg-gradient-to-b from-white/[0.04] to-transparent">
            {/* Icon */}
            <m.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center"
            >
              <m.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="w-10 h-10 text-white/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </m.svg>
            </m.div>

            <m.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white mb-2"
            >
              {t.title}
            </m.h1>

            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/50"
            >
              {t.subtitle}
            </m.p>
          </div>

          {/* Reasons */}
          <div className="p-6 pt-0">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="font-medium text-white/70">{t.reasons}</h2>
            </div>

            <ul className="space-y-2 mb-6">
              {t.reasonsList.map((reason, index) => (
                <m.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-3 text-sm text-white/40"
                >
                  <span className="w-1.5 h-1.5 bg-white/20 rounded-full mt-2 flex-shrink-0" />
                  {reason}
                </m.li>
              ))}
            </ul>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href="/pricing"
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-medium',
                  'bg-flame-500 text-white hover:bg-flame-400',
                  'transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]'
                )}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t.tryAgain}
              </Link>

              <Link
                href="/"
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-medium',
                  'bg-white/[0.04] text-white/70 hover:bg-white/[0.08] border border-white/10',
                  'transition-all duration-200'
                )}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t.backToHome}
              </Link>
            </div>

            {/* Support Link */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-8 pt-6 border-t border-white/8 text-center"
            >
              <p className="text-sm text-white/40 mb-2">{t.needHelp}</p>
              <Link
                href="/support"
                className="inline-flex items-center gap-2 text-flame-400 hover:text-flame-300 font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {t.contactSupport}
              </Link>
            </m.div>
          </div>
        </div>
      </m.div>
    </div>
  );
}
