'use client';

import { m } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/i18n';
import { Chrome, Apple } from 'lucide-react';
import Image from 'next/image';

interface SocialLoginButtonsProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export default function SocialLoginButtons({
  onSuccess,
  onError,
  className = '',
}: SocialLoginButtonsProps) {
  const { signInWithGoogle, signInWithKakao, signInWithApple } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading('google');
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        onError?.(error);
      } else {
        onSuccess?.();
      }
    } catch (err) {
      onError?.(err as Error);
    } finally {
      setLoading(null);
    }
  };

  const handleKakaoLogin = async () => {
    setLoading('kakao');
    try {
      const { error } = await signInWithKakao();
      if (error) {
        onError?.(error);
      } else {
        onSuccess?.();
      }
    } catch (err) {
      onError?.(err as Error);
    } finally {
      setLoading(null);
    }
  };

  const handleAppleLogin = async () => {
    setLoading('apple');
    try {
      const { error } = await signInWithApple();
      if (error) {
        onError?.(error);
      } else {
        onSuccess?.();
      }
    } catch (err) {
      onError?.(err as Error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Google Login */}
      <m.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={handleGoogleLogin}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading === 'google' ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        ) : (
          <Chrome className="w-5 h-5" />
        )}
        <span>{t('auth.googleLogin')}</span>
      </m.button>

      {/* Kakao Login */}
      <m.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={handleKakaoLogin}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#FEE500] text-[#191919] font-semibold hover:bg-[#FDD835] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading === 'kakao' ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-[#191919] rounded-full animate-spin" />
        ) : (
          <KakaoIcon />
        )}
        <span>{t('auth.kakaoLogin')}</span>
      </m.button>

      {/* Apple Login */}
      <m.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={handleAppleLogin}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-800"
      >
        {loading === 'apple' ? (
          <div className="w-5 h-5 border-2 border-gray-700 border-t-white rounded-full animate-spin" />
        ) : (
          <Apple className="w-5 h-5" />
        )}
        <span>{t('auth.appleLogin')}</span>
      </m.button>
    </div>
  );
}

// Kakao Icon Component
function KakaoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 3C5.582 3 2 5.896 2 9.5C2 11.637 3.438 13.496 5.579 14.594L4.718 17.801C4.657 18.019 4.897 18.199 5.088 18.074L9.045 15.417C9.357 15.447 9.676 15.462 10 15.462C14.418 15.462 18 12.566 18 8.962C18 5.358 14.418 3 10 3Z"
        fill="#191919"
      />
    </svg>
  );
}

/**
 * Compact Social Login Buttons (for modals or small spaces)
 */
export function CompactSocialLogin({
  onSuccess,
  onError,
  className = '',
}: SocialLoginButtonsProps) {
  const { signInWithGoogle, signInWithKakao, signInWithApple } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleLogin = async (provider: 'google' | 'kakao' | 'apple') => {
    setLoading(provider);
    try {
      let error;
      if (provider === 'google') {
        ({ error } = await signInWithGoogle());
      } else if (provider === 'kakao') {
        ({ error } = await signInWithKakao());
      } else {
        ({ error } = await signInWithApple());
      }

      if (error) {
        onError?.(error);
      } else {
        onSuccess?.();
      }
    } catch (err) {
      onError?.(err as Error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={`flex gap-3 justify-center ${className}`}>
      {/* Google */}
      <button
        onClick={() => handleLogin('google')}
        disabled={loading !== null}
        className="flex-1 flex items-center justify-center p-3 rounded-xl bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
        aria-label="Sign in with Google"
      >
        {loading === 'google' ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        ) : (
          <Chrome className="w-5 h-5 text-gray-900" />
        )}
      </button>

      {/* Kakao */}
      <button
        onClick={() => handleLogin('kakao')}
        disabled={loading !== null}
        className="flex-1 flex items-center justify-center p-3 rounded-xl bg-[#FEE500] hover:bg-[#FDD835] transition-colors disabled:opacity-50"
        aria-label="Sign in with Kakao"
      >
        {loading === 'kakao' ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-[#191919] rounded-full animate-spin" />
        ) : (
          <KakaoIcon />
        )}
      </button>

      {/* Apple */}
      <button
        onClick={() => handleLogin('apple')}
        disabled={loading !== null}
        className="flex-1 flex items-center justify-center p-3 rounded-xl bg-black hover:bg-gray-900 transition-colors disabled:opacity-50 border border-gray-800"
        aria-label="Sign in with Apple"
      >
        {loading === 'apple' ? (
          <div className="w-5 h-5 border-2 border-gray-700 border-t-white rounded-full animate-spin" />
        ) : (
          <Apple className="w-5 h-5 text-white" />
        )}
      </button>
    </div>
  );
}
