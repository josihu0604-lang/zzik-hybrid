'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Building2, RefreshCw, Home, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * Brand Dashboard Error Boundary
 *
 * Specialized error handling for brand-related pages:
 * - Auth errors (redirects to login)
 * - Data fetch errors
 * - Permission errors
 */

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BrandError({ error, reset }: ErrorProps) {
  const isAuthError =
    error.message.includes('auth') ||
    error.message.includes('unauthorized') ||
    error.message.includes('session');

  useEffect(() => {
    // Log to monitoring (sanitized in global error handler pattern)
    console.error('[Brand Error]', error.message);
  }, [error]);

  return (
    <div className="min-h-screen bg-space-950 flex items-center justify-center p-4">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
          style={{
            background: isAuthError
              ? 'radial-gradient(circle, rgba(255, 217, 61, 0.12) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(239, 68, 68, 0.12) 0%, transparent 70%)',
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
          border: isAuthError
            ? '1px solid rgba(255, 217, 61, 0.2)'
            : '1px solid rgba(239, 68, 68, 0.2)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Icon */}
        <div className="relative mb-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
            style={{
              background: isAuthError
                ? 'linear-gradient(135deg, rgba(255, 217, 61, 0.2) 0%, rgba(255, 217, 61, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)',
              border: isAuthError
                ? '1px solid rgba(255, 217, 61, 0.3)'
                : '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            {isAuthError ? (
              <Building2 className="w-10 h-10 text-spark-400" />
            ) : (
              <AlertTriangle className="w-10 h-10 text-red-400" />
            )}
          </div>
        </div>

        {/* Message */}
        <h1 className="text-white text-2xl font-bold mb-3">
          {isAuthError ? '로그인이 필요합니다' : '브랜드 대시보드 오류'}
        </h1>
        <p className="text-white/60 text-sm mb-6">
          {isAuthError
            ? '브랜드 대시보드에 접근하려면 먼저 로그인해주세요.'
            : '대시보드 데이터를 불러오는 중 오류가 발생했습니다.'}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {isAuthError ? (
            <Link href="/login?redirect=/brand" className="w-full">
              <Button variant="secondary" size="lg" fullWidth leftIcon={<Building2 size={18} />}>
                브랜드 로그인
              </Button>
            </Link>
          ) : (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              leftIcon={<RefreshCw size={18} />}
              onClick={reset}
            >
              다시 시도
            </Button>
          )}

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
