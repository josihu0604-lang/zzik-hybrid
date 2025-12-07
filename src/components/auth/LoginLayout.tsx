'use client';

/**
 * LoginLayout Component
 *
 * Layout wrapper for login/signup page with backgrounds and header
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ZzikLogo } from '@/components/cosmic';

type AuthMode = 'login' | 'signup';

interface LoginLayoutProps {
  children: React.ReactNode;
}

export function LoginLayout({ children }: LoginLayoutProps) {
  return (
    <div className="min-h-screen bg-space-950 pt-safe pb-safe overflow-hidden">
      {/* 다층 배경 시스템 */}
      <LoginBackground />

      {/* 컨텐츠 */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <LoginHeader />

        {/* Main */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function LoginBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Orange Orb */}
      <motion.div
        className="absolute -top-40 -right-40 w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255, 107, 91, 0.15) 0%, transparent 60%)',
          filter: 'blur(80px)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.4, 0.5, 0.4],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-[300px] h-[300px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255, 107, 91, 0.1) 0%, transparent 60%)',
          filter: 'blur(100px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 미세 그리드 */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 107, 91, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 107, 91, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}

function LoginHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="px-6 py-5"
    >
      <Link href="/" className="inline-flex items-center gap-3">
        <ZzikLogo size={32} />
        <span className="text-white/60 text-sm font-medium">ZZIK</span>
      </Link>
    </motion.header>
  );
}

interface LoginHeroProps {
  mode: AuthMode;
}

export function LoginHero({ mode }: LoginHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="mb-8 text-center"
    >
      {/* 미니 도장 */}
      <motion.div
        initial={{ scale: 1.5, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 20 }}
        className="w-20 h-20 mx-auto mb-5 rounded-[20px] flex items-center justify-center relative"
        style={{
          background: 'linear-gradient(135deg, #FF6B5B 0%, #FF8A7A 50%, #ffd54f 100%)',
          boxShadow: `
            inset 0 3px 0 rgba(255, 255, 255, 0.3),
            inset 0 -3px 0 rgba(0, 0, 0, 0.1),
            0 8px 32px rgba(255, 107, 91, 0.4)
          `,
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-1/2 rounded-t-[20px]"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
          }}
        />
        <span className="text-4xl font-black text-white relative z-10 drop-shadow-lg">Z</span>
      </motion.div>

      <h1
        className="font-black tracking-tighter mb-2 text-2xl md:text-3xl lg:text-4xl"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #ffffff80 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {mode === 'login' ? '다시 오셨네요!' : '환영합니다!'}
      </h1>
      <p className="text-white/50 text-sm md:text-base">
        {mode === 'login' ? '찍으면 진짜, 안 찍으면 안 간 거' : 'ZZIK으로 진짜 여행을 기록하세요'}
      </p>
    </motion.div>
  );
}

interface AuthCardProps {
  children: React.ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="w-full max-w-sm"
    >
      <div
        className="relative p-6 rounded-[28px] overflow-hidden"
        style={{
          background: 'rgba(18, 19, 20, 0.85)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: `
            inset 0 0 40px rgba(255, 255, 255, 0.03),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 16px 48px rgba(0, 0, 0, 0.5)
          `,
        }}
      >
        {/* Glass 하이라이트 */}
        <div
          className="absolute top-0 left-0 right-0 h-1/2 rounded-t-[28px] pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
          }}
        />
        {children}
      </div>
    </motion.div>
  );
}

interface ModeToggleProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div
      className="relative flex p-1.5 mb-6 rounded-[16px]"
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
      role="tablist"
    >
      {(['login', 'signup'] as const).map((m) => (
        <button
          key={m}
          id={`tab-${m}`}
          onClick={() => onModeChange(m)}
          role="tab"
          aria-selected={mode === m}
          aria-controls={`tabpanel-${m}`}
          aria-label={m === 'login' ? '로그인 탭' : '회원가입 탭'}
          className={`flex-1 min-h-[52px] py-3 px-4 rounded-[12px] text-sm font-semibold transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flame-500 ${
            mode === m ? '' : 'text-white/40 hover:text-white/60'
          }`}
          style={
            mode === m
              ? {
                  background:
                    'linear-gradient(135deg, rgba(255, 107, 91, 0.2) 0%, rgba(255, 107, 91, 0.1) 100%)',
                  color: '#FF6B5B',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                }
              : {}
          }
        >
          {m === 'login' ? '로그인' : '회원가입'}
        </button>
      ))}
    </div>
  );
}

export function AuthFooter() {
  return (
    <p className="mt-6 text-white/30 text-xs text-center leading-relaxed">
      계속 진행하면{' '}
      <Link
        href="/terms"
        className="text-white/50 hover:text-flame-500 underline underline-offset-2"
      >
        이용약관
      </Link>{' '}
      및{' '}
      <Link
        href="/privacy"
        className="text-white/50 hover:text-flame-500 underline underline-offset-2"
      >
        개인정보처리방침
      </Link>
      에 동의하는 것으로 간주됩니다.
    </p>
  );
}
