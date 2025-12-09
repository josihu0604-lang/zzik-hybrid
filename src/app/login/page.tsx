'use client';

/**
 * ZZIK Login Page - "찍으면 진짜"
 *
 * Refactored to use extracted auth components:
 * - LoginLayout: Layout with background effects
 * - LoginHero: Logo and title section
 * - LoginForm: Email/password form
 * - SocialLoginButtons: Social auth buttons
 *
 * ZZIK SEAL DESIGN SYSTEM:
 * - 도장(Seal) = 물리적 인증의 디지털 표현
 * - 투명(Glass) = 신뢰할 수 있는 검증 과정
 * - 3중 레이어 = GPS + QR + Receipt
 */

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { LoginLoading } from '@/components/ui/LoadingSpinner';
import { ErrorBoundary } from '@/components/error';
import {
  LoginLayout,
  LoginHero,
  AuthCard,
  ModeToggle,
  AuthFooter,
  LoginForm,
  SocialLoginButtons,
  AuthDivider,
} from '@/components/auth';

type AuthMode = 'login' | 'signup';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithKakao,
    signInWithApple,
    user,
    loading,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // U002: Validate redirect URL to prevent open redirect attacks
  const rawRedirect = searchParams.get('redirect') || '/';
  const redirectTo = (() => {
    // Must start with single slash, not double slash
    if (!rawRedirect.startsWith('/') || rawRedirect.startsWith('//')) {
      return '/';
    }
    // Block dangerous patterns
    if (/^\/[^/]*:|%2f|%5c|javascript:|data:/i.test(rawRedirect)) {
      return '/';
    }
    return rawRedirect;
  })();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (user && !loading) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setError(
            error.message === 'Invalid login credentials'
              ? '이메일 또는 비밀번호가 올바르지 않습니다.'
              : error.message
          );
        }
      } else {
        if (password.length < 6) {
          setError('비밀번호는 6자 이상이어야 합니다.');
          setIsSubmitting(false);
          return;
        }
        const { error } = await signUpWithEmail(email, password, nickname);
        if (error) {
          setError(
            error.message === 'User already registered'
              ? '이미 가입된 이메일입니다.'
              : error.message
          );
        }
      }
    } catch {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setError('Google 로그인에 실패했습니다.');
    }
  };

  const handleKakaoLogin = async () => {
    setError(null);
    const { error } = await signInWithKakao();
    if (error) {
      setError('카카오 로그인에 실패했습니다.');
    }
  };

  const handleAppleLogin = async () => {
    setError(null);
    const { error } = await signInWithApple();
    if (error) {
      setError('Apple 로그인에 실패했습니다.');
    }
  };

  if (loading) {
    return <LoginLoading />;
  }

  return (
    <LoginLayout>
      {/* 도장 로고 + 타이틀 */}
      <LoginHero mode={mode} />

      {/* Auth Card - Liquid Glass */}
      <AuthCard>
        {/* Mode Toggle */}
        <ModeToggle mode={mode} onModeChange={setMode} />

        {/* Form */}
        <LoginForm
          mode={mode}
          email={email}
          password={password}
          nickname={nickname}
          error={error}
          isSubmitting={isSubmitting}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onNicknameChange={setNickname}
          onSubmit={handleSubmit}
        />

        {/* Divider */}
        <AuthDivider />

        {/* Social Login */}
        <SocialLoginButtons
          onGoogleLogin={handleGoogleLogin}
          onKakaoLogin={handleKakaoLogin}
          onAppleLogin={handleAppleLogin}
        />
      </AuthCard>

      {/* Footer */}
      <AuthFooter />
    </LoginLayout>
  );
}

export default function LoginPage() {
  return (
    <ErrorBoundary
      onError={(error) => {
        console.error('Login page error:', error);
      }}
    >
      <Suspense fallback={<LoginLoading />}>
        <LoginContent />
      </Suspense>
    </ErrorBoundary>
  );
}
