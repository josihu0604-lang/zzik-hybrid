'use client';

/**
 * SocialLoginButtons Component
 *
 * Social authentication buttons (Google, Kakao, Apple)
 */

import { motion } from 'framer-motion';
import { GoogleIcon, KakaoIcon } from '@/components/cosmic';

interface SocialLoginButtonsProps {
  onGoogleLogin: () => void;
  onKakaoLogin: () => void;
  onAppleLogin: () => void;
}

export function SocialLoginButtons({
  onGoogleLogin,
  onKakaoLogin,
  onAppleLogin,
}: SocialLoginButtonsProps) {
  return (
    <div className="space-y-3">
      {/* Google */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.02, borderColor: 'rgba(255, 255, 255, 0.2)' }}
        whileTap={{ scale: 0.98 }}
        onClick={onGoogleLogin}
        aria-label="Google 계정으로 로그인"
        className="w-full min-h-[52px] py-4 rounded-[14px] text-sm font-medium flex items-center justify-center gap-3 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flame-500"
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          color: 'rgba(255, 255, 255, 0.9)',
        }}
      >
        <GoogleIcon size={20} aria-hidden="true" />
        Google로 계속하기
      </motion.button>

      {/* Kakao */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(254, 229, 0, 0.25)' }}
        whileTap={{ scale: 0.98 }}
        onClick={onKakaoLogin}
        aria-label="카카오 계정으로 로그인"
        className="w-full min-h-[52px] py-4 rounded-[14px] text-sm font-bold flex items-center justify-center gap-3 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flame-500 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #FEE500 0%, #FFEB3B 100%)',
          boxShadow: 'inset 0 2px 0 rgba(255, 255, 255, 0.3)',
          color: '#191919',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-1/2 rounded-t-[14px] pointer-events-none"
          aria-hidden="true"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
          }}
        />
        <div className="relative flex items-center gap-3">
          <KakaoIcon size={20} aria-hidden="true" />
          카카오로 계속하기
        </div>
      </motion.button>

      {/* Apple */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.02, borderColor: 'rgba(255, 255, 255, 0.25)' }}
        whileTap={{ scale: 0.98 }}
        onClick={onAppleLogin}
        aria-label="Apple 계정으로 로그인"
        className="w-full min-h-[52px] py-4 rounded-[14px] text-sm font-medium flex items-center justify-center gap-3 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flame-500 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
          boxShadow: 'inset 0 2px 0 rgba(255, 255, 255, 0.5)',
          color: 'black',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-1/2 rounded-t-[14px] pointer-events-none"
          aria-hidden="true"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
          }}
        />
        <div className="relative flex items-center gap-3">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          Apple로 계속하기
        </div>
      </motion.button>
    </div>
  );
}

export function AuthDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-white/10" />
      </div>
      <div className="relative flex justify-center">
        <span className="px-4 bg-space-850 text-white/30 text-xs">또는</span>
      </div>
    </div>
  );
}
