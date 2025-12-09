'use client';

import { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import { colors, gradients } from '@/lib/design-tokens';

/**
 * SplashScreen - ZZIK 브랜드 스플래시 화면
 *
 * Features:
 * - 로고 애니메이션 (불꽃 + 도장 메타포)
 * - 브랜드 슬로건 표시
 * - 2.5초 후 자동 종료
 * - 부드러운 페이드아웃
 *
 * Brand Identity:
 * - ZZIK = "찍다" (참여를 도장처럼 찍다)
 * - Flame Coral (#FF6B5B) 메인 컬러
 */

interface SplashScreenProps {
  /** 스플래시 종료 콜백 */
  onComplete: () => void;
  /** 최소 표시 시간 (ms) */
  minDuration?: number;
}

export function SplashScreen({ onComplete, minDuration = 2500 }: SplashScreenProps) {
  const [phase, setPhase] = useState<'logo' | 'tagline' | 'exit'>('logo');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const timers: NodeJS.Timeout[] = [];

    // Phase 1: Logo appears (0-800ms)
    // Phase 2: Tagline appears (800-2000ms)
    timers.push(setTimeout(() => setPhase('tagline'), 800));

    // Phase 3: Exit animation starts (2000ms)
    timers.push(setTimeout(() => setPhase('exit'), minDuration - 500));

    // Complete callback
    timers.push(setTimeout(onComplete, minDuration));

    return () => timers.forEach(clearTimeout);
  }, [minDuration, onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'exit' && (
        <m.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: colors.space[950] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {/* 배경 그라디언트 */}
          <div className="absolute inset-0 overflow-hidden">
            {/* 중앙 글로우 */}
            <m.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
              style={{
                background: `radial-gradient(circle, ${colors.flame[500]}15 0%, transparent 70%)`,
                filter: 'blur(60px)',
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* 하단 글로우 */}
            <m.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px]"
              style={{
                background: `linear-gradient(180deg, transparent 0%, ${colors.flame[500]}10 100%)`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            />
          </div>

          {/* 로고 컨테이너 */}
          <m.div
            className="relative z-10 flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {/* 로고 아이콘 */}
            <m.div
              className="relative mb-6"
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* 불꽃 배경 링 */}
              <m.div
                className="absolute inset-0 -m-4 rounded-full"
                style={{
                  background: `conic-gradient(from 0deg, ${colors.flame[500]}, ${colors.spark[500]}, ${colors.ember[500]}, ${colors.flame[500]})`,
                  filter: 'blur(20px)',
                  opacity: 0.4,
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />

              {/* 메인 로고 원 */}
              <m.div
                className="relative w-28 h-28 rounded-full flex items-center justify-center"
                style={{
                  background: gradients.flame,
                  boxShadow: `0 0 60px ${colors.flame[500]}80, 0 0 120px ${colors.flame[500]}40`,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.2,
                  duration: 0.5,
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                }}
              >
                {/* 내부 하이라이트 */}
                <div
                  className="absolute top-2 left-4 right-4 h-8 rounded-full"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
                  }}
                />

                {/* 불꽃 아이콘 */}
                <m.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4, duration: 0.4, type: 'spring' }}
                >
                  <Flame size={52} className="text-white drop-shadow-lg" strokeWidth={2.5} />
                </m.div>
              </m.div>

              {/* 파티클 효과 */}
              {[...Array(6)].map((_, i) => (
                <m.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: i % 2 === 0 ? colors.flame[500] : colors.spark[500],
                    left: '50%',
                    top: '50%',
                  }}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                  animate={{
                    x: Math.cos((i * Math.PI * 2) / 6) * 80,
                    y: Math.sin((i * Math.PI * 2) / 6) * 80,
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    delay: 0.6 + i * 0.1,
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
              ))}
            </m.div>

            {/* 브랜드명 */}
            <m.h1
              className="text-5xl font-black tracking-tight mb-2"
              style={{
                background: gradients.flame,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: `0 0 40px ${colors.flame[500]}60`,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              ZZIK
            </m.h1>

            {/* 슬로건 */}
            <AnimatePresence>
              {phase === 'tagline' && (
                <m.p
                  className="text-lg font-medium"
                  style={{ color: colors.text.secondary }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  참여하면, 열려요
                </m.p>
              )}
            </AnimatePresence>
          </m.div>

          {/* 로딩 인디케이터 */}
          <m.div
            className="absolute bottom-20 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <m.div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ background: colors.flame[500] }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.15,
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

export default SplashScreen;
