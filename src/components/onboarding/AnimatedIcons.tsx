'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Frown, Users, Flame, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { colors } from '@/lib/design-tokens';

/**
 * AnimatedIcons - 온보딩용 애니메이션 아이콘
 */

/** Slide 1: Pain Point - 슬픈 얼굴 + 긴 줄 */
export function PainPointIcon() {
  return (
    <div className="relative w-48 h-48">
      {/* 배경 원 */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `${colors.flame[500]}1a`,
          border: `1px solid ${colors.flame[500]}33`,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* 줄 서있는 사람들 (작은 원들) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex gap-1.5">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-4 h-4 rounded-full"
              style={{
                background: i === 0 ? colors.flame[500] : 'rgba(255, 255, 255, 0.2)',
              }}
              initial={{ y: 0 }}
              animate={{ y: [0, -5, 0] }}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />
          ))}
          {/* 더 많은 사람들 표시 (점점 작아지며) */}
          <span className="text-linear-text-tertiary text-sm ml-1">...</span>
        </div>
      </div>

      {/* 슬픈 얼굴 */}
      <motion.div
        className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${colors.flame[500]} 0%, ${colors.ember[500]} 100%)`,
          boxShadow: `0 8px 24px ${colors.flame[500]}66`,
        }}
        animate={{
          rotate: [0, -5, 5, 0],
        }}
        // DES-220: opacity 완화 - ease 추가
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Frown size={40} className="text-white" />
      </motion.div>
    </div>
  );
}

/** Slide 2: Solution - 프로그레스바 채워지는 효과 */
export function SolutionIcon() {
  return (
    <div className="relative w-64 h-48">
      {/* 프로그레스 바 컨테이너 */}
      <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2">
        {/* 배경 바 */}
        <div
          className="h-4 rounded-full overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* 채워지는 바 */}
          {/* DES-216: width → scaleX 애니메이션 (GPU 가속) */}
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${colors.flame[500]} 0%, ${colors.spark[500]} 100%)`,
              transformOrigin: 'left',
              width: '100%',
              willChange: 'transform',
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 1,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* 퍼센트 텍스트 */}
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          // DES-220: opacity 완화 - transition 추가
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.span
            className="text-4xl font-black"
            style={{ color: colors.flame[500] }}
            animate={{
              color: [colors.flame[500], colors.spark[500], colors.success],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          >
            <Counter />
          </motion.span>
          <span className="text-white text-2xl font-bold">%</span>
        </motion.div>
      </div>

      {/* 참여자 아바타들 */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex -space-x-3">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-linear-bg"
            style={{
              background: `hsl(${i * 30 + 10}, 70%, 60%)`,
            }}
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{
              delay: i * 0.2 + 0.5,
              type: 'spring',
            }}
          >
            <Users size={16} className="text-white" />
          </motion.div>
        ))}
      </div>

      {/* 완료 시 불꽃 */}
      <motion.div
        className="absolute -bottom-2 right-0"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 1.2, 1],
          opacity: [0, 1, 1],
        }}
        transition={{
          duration: 0.5,
          delay: 3,
          repeat: Infinity,
          repeatDelay: 4,
        }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${colors.success} 0%, ${colors.successLight} 100%)`,
            boxShadow: `0 4px 16px ${colors.success}66`,
          }}
        >
          <Flame size={28} className="text-white" />
        </div>
      </motion.div>
    </div>
  );
}

/** Counter 컴포넌트 (0-100 카운트업) */
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let animationFrame: number;
    let startTime: number | null = null;
    const duration = 3000; // 3초

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutQuad 이징
      const eased = 1 - Math.pow(1 - progress, 2);
      setCount(Math.floor(eased * 100));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        // 완료 후 1초 대기 후 리셋
        setTimeout(() => {
          setCount(0);
          startTime = null;
          animationFrame = requestAnimationFrame(animate);
        }, 1000);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <motion.span
      key={count}
      initial={{ opacity: 0.8, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.1 }}
      aria-live="polite"
      aria-label={`진행률 ${count}%`}
    >
      {count}
    </motion.span>
  );
}

/** Slide 3: Action - 팝업 카드 미리보기 */
export function ActionIcon() {
  return (
    <div className="relative w-48 h-48">
      {/* 스파클 효과 */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.3,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        >
          <Sparkles
            size={16}
            style={{ color: i % 2 === 0 ? colors.spark[500] : colors.flame[500] }}
          />
        </motion.div>
      ))}

      {/* 메인 카드 */}
      <motion.div
        className="absolute inset-0 rounded-2xl p-4 flex flex-col justify-between"
        style={{
          background: `linear-gradient(135deg, ${colors.flame[500]}33 0%, ${colors.spark[500]}1a 100%)`,
          border: `1px solid ${colors.flame[500]}4d`,
          boxShadow: `0 8px 32px ${colors.flame[500]}33`,
        }}
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* 카드 상단 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${colors.flame[500]}4d` }}
            >
              <MapPin size={16} style={{ color: colors.flame[500] }} />
            </div>
            <div>
              <p className="text-white text-xs font-bold">성수동 팝업</p>
              <p className="text-linear-text-tertiary text-micro">K-Fashion</p>
            </div>
          </div>
        </div>

        {/* 프로그레스 */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-linear-text-tertiary text-micro">72/100명</span>
            <span className="text-micro" style={{ color: colors.flame[500] }}>
              72%
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: colors.flame[500], width: '72%' }}
              animate={{
                width: ['72%', '85%', '72%'],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
        </div>
      </motion.div>

      {/* 참여하기 화살표 */}
      <motion.div
        className="absolute -right-8 top-1/2 -translate-y-1/2"
        animate={{
          x: [0, 10, 0],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
        }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${colors.flame[500]} 0%, ${colors.ember[500]} 100%)`,
            boxShadow: `0 4px 16px ${colors.flame[500]}66`,
          }}
        >
          <ArrowRight size={24} className="text-white" />
        </div>
      </motion.div>
    </div>
  );
}

export default { PainPointIcon, SolutionIcon, ActionIcon };
