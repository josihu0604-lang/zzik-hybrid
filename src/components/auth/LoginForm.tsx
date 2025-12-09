'use client';

/**
 * LoginForm Component
 *
 * Email/password form for login and signup
 */

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type AuthMode = 'login' | 'signup';

interface LoginFormProps {
  mode: AuthMode;
  email: string;
  password: string;
  nickname: string;
  error: string | null;
  isSubmitting: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onNicknameChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function LoginForm({
  mode,
  email,
  password,
  nickname,
  error,
  isSubmitting,
  onEmailChange,
  onPasswordChange,
  onNicknameChange,
  onSubmit,
}: LoginFormProps) {
  // DES-043: 비밀번호 보기 토글
  const [showPassword, setShowPassword] = useState(false);

  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(255, 107, 91, 0.5)';
    e.target.style.boxShadow = '0 0 0 3px rgba(255, 107, 91, 0.15)';
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
    e.target.style.boxShadow = 'none';
  };

  // Field-level validation
  const emailError = error && !email ? '이메일을 입력해주세요' : null;
  const passwordError = error && !password ? '비밀번호를 입력해주세요' : null;
  const nicknameError = mode === 'signup' && error && !nickname ? '닉네임을 입력해주세요' : null;

  return (
    <>
      {/* Error Summary - A11Y-016 */}
      <AnimatePresence>
        {error && (
          <m.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="mb-4 p-4 rounded-[16px] overflow-hidden"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <p className="text-red-400 text-sm font-semibold mb-2 flex items-center gap-2">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              폼 제출 오류
            </p>
            <ul className="text-red-400 text-xs space-y-1 ml-6 list-disc">
              {nicknameError && <li>{nicknameError}</li>}
              {emailError && <li>{emailError}</li>}
              {passwordError && <li>{passwordError}</li>}
              {!nicknameError && !emailError && !passwordError && <li>{error}</li>}
            </ul>
          </m.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form
        onSubmit={onSubmit}
        className="space-y-4"
        role="tabpanel"
        id={`tabpanel-${mode}`}
        aria-labelledby={`tab-${mode}`}
      >
        <AnimatePresence mode="wait">
          {mode === 'signup' && (
            <m.div
              key="nickname"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label
                htmlFor="nickname-input"
                className="block text-white/50 text-xs font-medium mb-2"
              >
                닉네임 <span className="text-red-400">*</span>
              </label>
              <input
                id="nickname-input"
                type="text"
                value={nickname}
                onChange={(e) => onNicknameChange(e.target.value)}
                placeholder="ZZIK 유저"
                required
                aria-required="true"
                aria-invalid={nicknameError ? 'true' : 'false'}
                aria-describedby={nicknameError ? 'nickname-error' : undefined}
                className="w-full min-h-[52px] px-4 py-3.5 rounded-[14px] text-base text-white placeholder-white/60 transition-all duration-200 focus:outline-none"
                style={inputStyle}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
              {nicknameError && (
                <p id="nickname-error" className="mt-1 text-xs text-red-400" role="alert">
                  {nicknameError}
                </p>
              )}
            </m.div>
          )}
        </AnimatePresence>

        <div>
          <label htmlFor="email-input" className="block text-white/50 text-xs font-medium mb-2">
            이메일
          </label>
          <input
            id="email-input"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="hello@zzik.app"
            required
            inputMode="email"
            autoComplete={mode === 'login' ? 'email' : 'email username'}
            aria-required="true"
            aria-invalid={emailError ? 'true' : 'false'}
            aria-describedby={emailError ? 'email-error' : undefined}
            className="w-full min-h-[52px] px-4 py-3.5 rounded-[14px] text-sm text-white placeholder-white/60 transition-all duration-200 focus:outline-none"
            style={inputStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          {emailError && (
            <p id="email-error" className="mt-1 text-xs text-red-400" role="alert">
              {emailError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password-input" className="block text-white/50 text-xs font-medium mb-2">
            비밀번호
          </label>
          <div className="relative">
            <input
              id="password-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              aria-required="true"
              aria-invalid={passwordError ? 'true' : 'false'}
              aria-describedby={passwordError ? 'password-error' : undefined}
              className="w-full min-h-[52px] px-4 py-3.5 pr-12 rounded-[14px] text-sm text-white placeholder-white/60 transition-all duration-200 focus:outline-none"
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
            {/* DES-043: 비밀번호 보기 토글 */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-white/70 transition-colors"
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {passwordError && (
            <p id="password-error" className="mt-1 text-xs text-red-400" role="alert">
              {passwordError}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={isSubmitting}
          leftIcon={
            isSubmitting ? undefined : mode === 'login' ? (
              <Lock size={20} />
            ) : (
              <UserPlus size={20} />
            )
          }
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <m.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
              검증 중...
            </span>
          ) : mode === 'login' ? (
            'ZZIK 로그인'
          ) : (
            '가입하기'
          )}
        </Button>
      </form>
    </>
  );
}
