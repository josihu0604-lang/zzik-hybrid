'use client';

import { colors } from '@/lib/design-tokens';

export default function OnboardingLoading() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: colors.space[950] }}
    >
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full animate-pulse"
            style={{
              background: colors.flame[500],
              animationDelay: `${i * 150}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
