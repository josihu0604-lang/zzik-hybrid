'use client';

import { m } from '@/lib/motion';
import Link from 'next/link';
import { Home, Search, ArrowLeft, MapPin } from 'lucide-react';
import { colors } from '@/lib/design-tokens';
import { Button } from '@/components/ui/Button';

/**
 * NotFound - 404 Page
 *
 * User-friendly 404 error page with ZZIK branding
 */

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-space-950"
      role="main"
    >
      {/* Lost Icon Animation (DES-199: 404 페이지 브랜드 적용) */}
      <m.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="relative mb-8"
        aria-label="404 에러 아이콘"
      >
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${colors.flame[500]}20 0%, ${colors.flame[600]}10 100%)`,
            border: `1px solid ${colors.flame[500]}30`,
          }}
          aria-hidden="true"
        >
          <MapPin size={48} style={{ color: colors.flame[500] }} aria-hidden="true" />
        </div>

        {/* Floating question mark */}
        <m.span
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute -top-2 -right-2 text-2xl"
          aria-hidden="true"
        >
          ?
        </m.span>
      </m.div>

      {/* 404 Text */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <h1
          className="text-6xl font-black mb-4"
          style={{
            background: `linear-gradient(135deg, ${colors.flame[500]} 0%, ${colors.flame[400]} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          404
        </h1>
        <h2 className="text-xl font-bold text-white mb-2">페이지를 찾을 수 없습니다</h2>
        <p className="text-linear-text-secondary text-sm max-w-sm">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          <br />
          URL을 다시 확인해주세요.
        </p>
      </m.div>

      {/* Action Buttons */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3 w-full max-w-sm"
      >
        {/* Home Button */}
        <Link href="/" className="flex-1">
          <Button variant="primary" size="lg" fullWidth leftIcon={<Home size={18} />}>
            홈으로 가기
          </Button>
        </Link>

        {/* Search Button */}
        <Link href="/?search=true" className="flex-1">
          <Button variant="ghost" size="lg" fullWidth leftIcon={<Search size={18} />}>
            팝업 검색
          </Button>
        </Link>
      </m.div>

      {/* Back Link */}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6"
      >
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => window.history.back()}
        >
          이전 페이지로 돌아가기
        </Button>
      </m.div>

      {/* Decorative Elements */}
      <div
        className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center bottom, ${colors.flame[500]}05 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}
