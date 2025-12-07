'use client';

import { SkeletonMainPage } from '@/components/ui/Skeleton';
import { colors } from '@/lib/design-tokens';

export default function HomeLoading() {
  return (
    <div className="min-h-screen" style={{ background: colors.space[950] }}>
      <SkeletonMainPage />
    </div>
  );
}
