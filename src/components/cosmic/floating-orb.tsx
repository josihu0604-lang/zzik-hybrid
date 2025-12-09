'use client';

import { m } from 'framer-motion';

interface FloatingOrbProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  delay?: number;
}

const sizeMap = {
  sm: 'w-32 h-32',
  md: 'w-48 h-48',
  lg: 'w-64 h-64',
};

export function FloatingOrb({ size = 'lg', className = '', delay = 0 }: FloatingOrbProps) {
  return (
    <m.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: [0.2, 0.4, 0.2],
        scale: [1, 1.15, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
      className={`absolute rounded-full blur-3xl pointer-events-none ${sizeMap[size]} ${className}`}
      style={{
        background: 'radial-gradient(circle, rgba(255, 107, 91, 0.15) 0%, transparent 70%)',
      }}
    />
  );
}
