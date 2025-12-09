'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  // Ideally, we might want to fetch the session status from API here to confirm,
  // but for the success page, we assume the redirection means success (Stripe flow).

  return (
    <div className="min-h-screen bg-space-950 flex items-center justify-center p-4">
      <Card variant="glass" padding="lg" className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Welcome to VIP!</h1>
        <p className="text-slate-400 mb-8">
          Your subscription was successful. You now have access to exclusive K-Experiences and benefits.
        </p>

        {sessionId && (
          <p className="text-xs text-slate-600 mb-6 font-mono">
            Session ID: {sessionId.slice(0, 10)}...
          </p>
        )}

        <div className="space-y-3">
          <Link href="/k-experiences">
            <Button className="w-full h-12 text-lg" variant="primary">
              Explore Experiences <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/profile">
            <Button className="w-full" variant="ghost">
              Go to My Profile
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function VipSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-space-950 flex items-center justify-center text-white">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
