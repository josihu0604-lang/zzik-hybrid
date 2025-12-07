'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, RefreshCw, Home, Wifi, Server } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * AI Demo Error Boundary
 *
 * Specialized error handling for AI-related features:
 * - API quota errors
 * - Model unavailable errors
 * - Network errors
 */

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AIDemoError({ error, reset }: ErrorProps) {
  const isQuotaError =
    error.message.includes('quota') ||
    error.message.includes('rate limit') ||
    error.message.includes('429');

  const isNetworkError =
    error.message.includes('network') ||
    error.message.includes('fetch') ||
    error.message.includes('timeout');

  useEffect(() => {
    console.error('[AI Demo Error]', error.message);
  }, [error]);

  const getErrorInfo = () => {
    if (isQuotaError) {
      return {
        icon: <Server className="w-10 h-10 text-amber-400" />,
        title: 'AI 서비스 사용량 초과',
        description: 'AI 서비스 사용량이 일시적으로 초과되었습니다. 잠시 후 다시 시도해주세요.',
        color: 'rgba(251, 191, 36, 0.2)',
        border: 'rgba(251, 191, 36, 0.3)',
      };
    }
    if (isNetworkError) {
      return {
        icon: <Wifi className="w-10 h-10 text-blue-400" />,
        title: '네트워크 연결 오류',
        description: '인터넷 연결을 확인하고 다시 시도해주세요.',
        color: 'rgba(59, 130, 246, 0.2)',
        border: 'rgba(59, 130, 246, 0.3)',
      };
    }
    return {
      icon: <Sparkles className="w-10 h-10 text-purple-400" />,
      title: 'AI 기능 오류',
      description: 'AI 기능을 처리하는 중 오류가 발생했습니다.',
      color: 'rgba(168, 85, 247, 0.2)',
      border: 'rgba(168, 85, 247, 0.3)',
    };
  };

  const errorInfo = getErrorInfo();

  return (
    <div className="min-h-screen bg-space-950 flex items-center justify-center p-4">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
          style={{
            background: `radial-gradient(circle, ${errorInfo.color} 0%, transparent 70%)`,
            filter: 'blur(80px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Error Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative max-w-md w-full p-8 rounded-2xl text-center"
        style={{
          background: 'rgba(18, 19, 20, 0.95)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: `1px solid ${errorInfo.border}`,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Icon */}
        <div className="relative mb-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
            style={{
              background: `linear-gradient(135deg, ${errorInfo.color} 0%, transparent 100%)`,
              border: `1px solid ${errorInfo.border}`,
            }}
          >
            {errorInfo.icon}
          </div>
        </div>

        {/* Message */}
        <h1 className="text-white text-2xl font-bold mb-3">{errorInfo.title}</h1>
        <p className="text-white/60 text-sm mb-6">{errorInfo.description}</p>

        {/* Retry suggestion for quota errors */}
        {isQuotaError && (
          <div
            className="mb-6 p-4 rounded-xl"
            style={{
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.2)',
            }}
          >
            <p className="text-amber-300 text-xs">
              AI 추천 기능은 1분에 10회까지 사용 가능합니다.
              <br />약 1분 후 다시 시도해주세요.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            leftIcon={<RefreshCw size={18} />}
            onClick={reset}
          >
            다시 시도
          </Button>

          <Link href="/" className="w-full">
            <Button variant="ghost" size="lg" fullWidth leftIcon={<Home size={18} />}>
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
