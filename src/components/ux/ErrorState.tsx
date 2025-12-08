'use client';

import { useState, useCallback } from 'react';
import { m } from 'framer-motion';
import { ReactNode } from 'react';
import {
  AlertTriangle,
  WifiOff,
  ServerOff,
  Clock,
  RefreshCw,
  Home,
  ArrowLeft,
  HelpCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { colors } from '@/lib/design-tokens';

/**
 * ErrorState - 에러 상태 UI 컴포넌트
 *
 * Nielsen's Heuristics #9: Help users recognize, diagnose, and recover from errors
 * - 명확하고 친근한 에러 메시지
 * - 구체적인 복구 방법 제시
 * - 재시도 옵션 제공
 *
 * WCAG: role="alert", aria-live="assertive"
 */

export type ErrorVariant = 'generic' | 'network' | 'server' | 'timeout' | 'notFound' | 'forbidden';

export interface ErrorStateProps {
  /** 에러 유형 */
  variant?: ErrorVariant;
  /** 에러 객체 */
  error?: Error | null;
  /** 제목 */
  title?: string;
  /** 설명 */
  description?: string;
  /** 재시도 핸들러 */
  onRetry?: () => void | Promise<void>;
  /** 홈으로 이동 */
  onGoHome?: () => void;
  /** 뒤로 가기 */
  onGoBack?: () => void;
  /** 도움말 링크 */
  helpUrl?: string;
  /** 커스텀 아이콘 */
  icon?: ReactNode;
  /** 전체 화면 여부 */
  fullScreen?: boolean;
  /** 개발 모드에서 에러 상세 표시 */
  showDetails?: boolean;
  /** 추가 클래스 */
  className?: string;
}

// 에러 유형별 설정
const ERROR_CONFIG: Record<
  ErrorVariant,
  {
    icon: typeof AlertTriangle;
    title: string;
    description: string;
    color: string;
    retryLabel: string;
  }
> = {
  generic: {
    icon: AlertTriangle,
    title: '문제가 발생했어요',
    description: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    color: colors.flame[500],
    retryLabel: '다시 시도',
  },
  network: {
    icon: WifiOff,
    title: '네트워크 연결을 확인해주세요',
    description: '인터넷 연결이 불안정합니다. Wi-Fi나 모바일 데이터를 확인해주세요.',
    color: '#f97316', // Orange
    retryLabel: '다시 연결',
  },
  server: {
    icon: ServerOff,
    title: '서버에 연결할 수 없어요',
    description: '서버가 일시적으로 응답하지 않습니다. 잠시 후 다시 시도해주세요.',
    color: '#ef4444', // Red
    retryLabel: '다시 시도',
  },
  timeout: {
    icon: Clock,
    title: '응답 시간이 초과되었어요',
    description: '요청 처리 시간이 너무 오래 걸립니다. 다시 시도해주세요.',
    color: '#eab308', // Yellow
    retryLabel: '다시 시도',
  },
  notFound: {
    icon: HelpCircle,
    title: '페이지를 찾을 수 없어요',
    description: '요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.',
    color: '#6366f1', // Indigo
    retryLabel: '홈으로 가기',
  },
  forbidden: {
    icon: AlertTriangle,
    title: '접근 권한이 없어요',
    description: '이 페이지에 접근할 권한이 없습니다. 로그인이 필요할 수 있어요.',
    color: '#ec4899', // Pink
    retryLabel: '로그인하기',
  },
};

export function ErrorState({
  variant = 'generic',
  error,
  title,
  description,
  onRetry,
  onGoHome,
  onGoBack,
  helpUrl,
  icon,
  fullScreen = false,
  showDetails = process.env.NODE_ENV === 'development',
  className = '',
}: ErrorStateProps) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);
  const config = ERROR_CONFIG[variant];
  const IconComponent = config.icon;

  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  const handleRetry = useCallback(async () => {
    if (!onRetry) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry]);

  const handleGoHome = useCallback(() => {
    if (onGoHome) {
      onGoHome();
    } else {
      router.push('/');
    }
  }, [onGoHome, router]);

  const handleGoBack = useCallback(() => {
    if (onGoBack) {
      onGoBack();
    } else {
      router.back();
    }
  }, [onGoBack, router]);

  const containerClasses = fullScreen
    ? 'min-h-screen flex items-center justify-center bg-space-950'
    : 'min-h-[60vh] flex items-center justify-center';

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${containerClasses} px-6 py-12 ${className}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex flex-col items-center text-center max-w-md">
        {/* Icon */}
        <m.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
          style={{
            background: `${config.color}15`,
            border: `1px solid ${config.color}30`,
          }}
        >
          {icon || <IconComponent size={40} style={{ color: config.color }} aria-hidden="true" />}
        </m.div>

        {/* Title */}
        <m.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-xl font-bold text-white mb-2"
        >
          {displayTitle}
        </m.h1>

        {/* Description */}
        <m.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-linear-text-secondary text-sm max-w-sm mb-8"
        >
          {displayDescription}
        </m.p>

        {/* Error Details (Dev mode) */}
        {showDetails && error && (
          <m.details
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="w-full mb-6 text-left"
          >
            <summary className="text-linear-text-tertiary text-xs cursor-pointer hover:text-white/60 mb-2">
              오류 상세 (개발 모드)
            </summary>
            <div
              className="p-3 rounded-lg text-xs font-mono overflow-auto max-h-32"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              <p className="text-red-400 font-bold mb-1">
                {error.name}: {error.message}
              </p>
              {error.stack && (
                <pre className="text-red-300/70 whitespace-pre-wrap text-micro">
                  {error.stack.split('\n').slice(1, 5).join('\n')}
                </pre>
              )}
            </div>
          </m.details>
        )}

        {/* Action Buttons */}
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 w-full max-w-sm"
        >
          {/* Retry Button */}
          {onRetry && (
            <m.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium text-white disabled:opacity-50"
              style={{
                background: `linear-gradient(135deg, ${colors.flame[500]} 0%, ${colors.ember[500]} 100%)`,
                boxShadow: '0 4px 16px rgba(255, 107, 91, 0.3)',
              }}
              aria-label={isRetrying ? '재시도 중...' : config.retryLabel}
            >
              <RefreshCw
                size={18}
                className={isRetrying ? 'animate-spin' : ''}
                aria-hidden="true"
              />
              {isRetrying ? '재시도 중...' : config.retryLabel}
            </m.button>
          )}

          {/* Home Button */}
          <m.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoHome}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium transition-colors"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${colors.border.default}`,
              color: colors.text.secondary,
            }}
            aria-label="홈으로 이동"
          >
            <Home size={18} aria-hidden="true" />
            홈으로
          </m.button>
        </m.div>

        {/* Back Button */}
        <m.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={handleGoBack}
          className="mt-4 flex items-center gap-2 text-sm text-linear-text-secondary hover:text-white transition-colors"
          aria-label="이전 페이지로 돌아가기"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          이전 페이지로 돌아가기
        </m.button>

        {/* Help Link */}
        {helpUrl && (
          <m.a
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            href={helpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 text-xs text-linear-text-tertiary hover:text-flame-500 transition-colors"
          >
            도움이 필요하신가요?
          </m.a>
        )}
      </div>
    </m.div>
  );
}

/**
 * NetworkErrorState - 네트워크 에러 특화
 *
 * @deprecated This component is currently unused in the project.
 * Consider using ErrorState with variant="network" instead.
 * This component may be removed in a future version.
 */
export function NetworkErrorState({
  onRetry,
  ...props
}: Omit<ErrorStateProps, 'variant'> & { onRetry?: () => void | Promise<void> }) {
  return <ErrorState variant="network" onRetry={onRetry} {...props} />;
}

/**
 * ServerErrorState - 서버 에러 특화
 *
 * @deprecated This component is currently unused in the project.
 * Consider using ErrorState with variant="server" instead.
 * This component may be removed in a future version.
 */
export function ServerErrorState({
  onRetry,
  ...props
}: Omit<ErrorStateProps, 'variant'> & { onRetry?: () => void | Promise<void> }) {
  return <ErrorState variant="server" onRetry={onRetry} {...props} />;
}

/**
 * TimeoutErrorState - 타임아웃 에러 특화
 *
 * @deprecated This component is currently unused in the project.
 * Consider using ErrorState with variant="timeout" instead.
 * This component may be removed in a future version.
 */
export function TimeoutErrorState({
  onRetry,
  ...props
}: Omit<ErrorStateProps, 'variant'> & { onRetry?: () => void | Promise<void> }) {
  return <ErrorState variant="timeout" onRetry={onRetry} {...props} />;
}

export default ErrorState;
