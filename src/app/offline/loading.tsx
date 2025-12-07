'use client';

import { colors } from '@/lib/design-tokens';

export default function OfflineLoading() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: colors.space[950] }}
    />
  );
}
