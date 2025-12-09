'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface SubscribeButtonProps {
  tier: string;
  priceId?: string; // Optional if free
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline' | 'glass' | 'default';
  cta: string;
}

export function SubscribeButton({ tier, priceId, variant = 'primary', cta }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      if (tier === 'Free') {
        // Just redirect or simple API call
        // For now, nothing
        return;
      }

      // Hardcoded test price IDs if not provided (for demo)
      const actualPriceId = priceId || 'price_test_placeholder';

      const response = await fetch('/api/vip/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: actualPriceId,
          tier,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned', data);
        alert('Failed to initiate checkout.');
      }

    } catch (error) {
      console.error('Subscription error:', error);
      alert('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant={variant}
      className="w-full"
      onClick={handleSubscribe}
      isLoading={loading}
    >
      {cta}
    </Button>
  );
}
