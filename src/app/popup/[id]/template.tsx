'use client';

import { ReactNode } from 'react';
import { m } from '@/lib/motion';

/**
 * Popup Detail Template - iOS 스타일 슬라이드 전환
 *
 * 상세 페이지는 오른쪽에서 슬라이드 인
 */

interface TemplateProps {
  children: ReactNode;
}

export default function PopupDetailTemplate({ children }: TemplateProps) {
  return (
    <m.div
      initial={{ opacity: 0, x: '30%' }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.35,
        ease: [0.32, 0.72, 0, 1], // iOS 스타일 easing
      }}
      style={{ minHeight: '100vh' }}
    >
      {children}
    </m.div>
  );
}
