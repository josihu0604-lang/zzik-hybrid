'use client';

import { m } from '@/lib/motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'orange' | 'white';
}

const sizeMap = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

const colorMap = {
  orange: 'border-linear-orange/30 border-t-linear-orange',
  white: 'border-white/30 border-t-white',
};

export function LoadingSpinner({ size = 'md', color = 'orange' }: LoadingSpinnerProps) {
  return (
    <m.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      className={`border-2 rounded-full ${sizeMap[size]} ${colorMap[color]}`}
    />
  );
}

export function FullPageLoader() {
  return (
    <div
      className="min-h-screen bg-cosmic flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="로딩 중"
    >
      <LoadingSpinner size="lg" color="orange" />
      <span className="sr-only">로딩 중입니다. 잠시만 기다려주세요.</span>
    </div>
  );
}
