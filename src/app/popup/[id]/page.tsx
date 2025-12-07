'use client';

/**
 * Experience Detail Page - VIP K-POP Experience Detail
 *
 * Displays experience details and booking flow.
 * Redirect to /experience/[id] for canonical URL.
 */

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function PopupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // Redirect to experience page (canonical URL)
  useEffect(() => {
    if (id) {
      router.replace(`/experience/${id}`);
    }
  }, [id, router]);

  return (
    <div className="min-h-screen bg-space-950 flex items-center justify-center">
      <div className="text-white/60 text-sm">Redirecting...</div>
    </div>
  );
}
