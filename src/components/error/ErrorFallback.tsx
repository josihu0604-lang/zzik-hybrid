'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { colors, opacity } from '@/lib/design-tokens';
import { Button } from '@/components/ui/Button';

/**
 * ErrorFallback - Error UI Component
 *
 * Displays user-friendly error message with recovery options
 */

interface ErrorFallbackProps {
  /** Error object */
  error?: Error | null;
  /** Reset handler */
  onReset?: () => void;
  /** Error type for custom styling */
  type?: 'generic' | 'network' | 'notFound' | 'server';
  /** Custom title */
  title?: string;
  /** Custom message */
  message?: string;
}

const ERROR_CONFIG = {
  generic: {
    icon: AlertTriangle,
    title: '오류가 발생했습니다',
    titleEn: 'Something went wrong',
    message: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    messageEn: 'A temporary error occurred. Please try again later.',
    color: colors.flame[500],
  },
  network: {
    icon: AlertTriangle,
    title: '네트워크 오류',
    titleEn: 'Network Error',
    message: '인터넷 연결을 확인해주세요.',
    messageEn: 'Please check your internet connection.',
    color: colors.warning,
  },
  notFound: {
    icon: AlertTriangle,
    title: '페이지를 찾을 수 없습니다',
    titleEn: 'Page not found',
    message: '요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.',
    messageEn: 'The requested page does not exist or may have been moved.',
    color: colors.info,
  },
  server: {
    icon: AlertTriangle,
    title: '서버 오류',
    titleEn: 'Server Error',
    message: '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    messageEn: 'A server error occurred. Please try again later.',
    color: colors.error,
  },
};

export function ErrorFallback({
  error,
  onReset,
  type = 'generic',
  title,
  message,
}: ErrorFallbackProps) {
  const router = useRouter();
  const config = ERROR_CONFIG[type];
  const Icon = config.icon;

  const displayTitle = title || config.title;
  const displayMessage = message || config.message;

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-12"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.1 }}
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{
          background: `rgba(${parseInt(config.color.slice(1, 3), 16)}, ${parseInt(config.color.slice(3, 5), 16)}, ${parseInt(config.color.slice(5, 7), 16)}, ${opacity[5]})`,
          border: `1px solid rgba(${parseInt(config.color.slice(1, 3), 16)}, ${parseInt(config.color.slice(3, 5), 16)}, ${parseInt(config.color.slice(5, 7), 16)}, ${opacity[15]})`,
        }}
      >
        <Icon size={40} style={{ color: config.color }} />
      </motion.div>

      {/* Title */}
      <h1 className="text-xl font-bold text-white mb-2 text-center">{displayTitle}</h1>

      {/* Message */}
      <p className="text-linear-text-secondary text-sm text-center max-w-sm mb-8">
        {displayMessage}
      </p>

      {/* Error details (dev only) */}
      {process.env.NODE_ENV === 'development' && error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-md mb-8 p-4 rounded-xl text-xs font-mono overflow-auto"
          style={{
            background: `${colors.error}1a`, // 10% opacity
            border: `1px solid ${colors.error}33`, // 20% opacity
          }}
        >
          <p className="text-red-400 font-bold mb-2">
            {error.name}: {error.message}
          </p>
          {error.stack && (
            <pre className="text-red-300/70 whitespace-pre-wrap text-micro">
              {error.stack.split('\n').slice(1, 6).join('\n')}
            </pre>
          )}
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        {/* Retry Button */}
        <div className="flex-1">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            leftIcon={<RefreshCw size={18} />}
            onClick={handleReset}
          >
            다시 시도
          </Button>
        </div>

        {/* Home Button */}
        <div className="flex-1">
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            leftIcon={<Home size={18} />}
            onClick={handleGoHome}
          >
            홈으로
          </Button>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-4">
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />} onClick={handleGoBack}>
          이전 페이지로 돌아가기
        </Button>
      </div>
    </motion.div>
  );
}

/**
 * NetworkErrorFallback - Network error specific fallback
 */
export function NetworkErrorFallback({ onReset }: { onReset?: () => void }) {
  return <ErrorFallback type="network" onReset={onReset} />;
}

/**
 * NotFoundFallback - 404 error fallback
 */
export function NotFoundFallback({ onReset }: { onReset?: () => void }) {
  return <ErrorFallback type="notFound" onReset={onReset} />;
}

/**
 * ServerErrorFallback - Server error fallback
 */
export function ServerErrorFallback({ onReset }: { onReset?: () => void }) {
  return <ErrorFallback type="server" onReset={onReset} />;
}

export default ErrorFallback;
