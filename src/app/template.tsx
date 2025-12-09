'use client';

import { ReactNode } from 'react';
import { m } from 'framer-motion';

/**
 * App Template - 페이지 전환 애니메이션
 *
 * template.tsx는 라우트 변경마다 리마운트됨 (layout.tsx와 다름)
 * → AnimatePresence 없이도 전환 효과 적용 가능
 * 
 * Strategy: "Scale Fade" - iOS App Open 스타일
 */

interface TemplateProps {
  children: ReactNode;
}

export default function Template({ children }: TemplateProps) {
  return (
    <m.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="h-full w-full"
    >
      {children}
    </m.div>
  );
}
