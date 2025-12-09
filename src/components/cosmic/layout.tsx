'use client';

import { FloatingOrb } from './floating-orb';

interface CosmicLayoutProps {
  children: React.ReactNode;
  className?: string;
  orbs?: boolean;
}

export function CosmicLayout({ children, className = '', orbs = true }: CosmicLayoutProps) {
  return (
    <div className={`min-h-screen bg-cosmic noise-overlay overflow-hidden relative ${className}`}>
      {orbs && (
        <>
          <FloatingOrb className="-top-20 -left-20" />
          <FloatingOrb size="md" className="top-1/3 -right-32" delay={2} />
          <FloatingOrb size="sm" className="bottom-20 left-1/4" delay={4} />
        </>
      )}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
}
