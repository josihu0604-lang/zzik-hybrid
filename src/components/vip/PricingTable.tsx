'use client';

import { Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { SubscribeButton } from '@/components/vip/SubscribeButton';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'For casual fans exploring K-Culture.',
    features: [
      'Access to standard K-Experiences',
      'Basic GPS Verification',
      'Community Access',
      'Digital Badge Collection',
    ],
    cta: 'Current Plan',
    variant: 'outlined' as const,
    priceId: '',
  },
  {
    name: 'Silver',
    price: '$9.99',
    period: '/month',
    description: 'For dedicated fans who want more.',
    features: [
      'All Free features',
      'Priority Verification Queue',
      'Silver-exclusive Events',
      '2x Points on Check-ins',
      'Ad-free Experience',
    ],
    cta: 'Upgrade to Silver',
    variant: 'glass' as const,
    popular: false,
    priceId: 'price_silver_monthly',
  },
  {
    name: 'Gold',
    price: '$19.99',
    period: '/month',
    description: 'The ultimate VIP experience.',
    features: [
      'All Silver features',
      'VIP Fast Pass (Skip Lines)',
      'Gold-exclusive Fan Meetings',
      'Early Access to Tickets',
      '5x Points on Check-ins',
      'Exclusive Physical Merch',
    ],
    cta: 'Upgrade to Gold',
    variant: 'elevated' as const,
    popular: true,
    glow: 'spark' as const,
    priceId: 'price_gold_monthly',
  },
  {
      name: 'Platinum',
      price: '$49.99',
      period: '/month',
      description: 'Elite status for industry insiders.',
      features: [
          'All Gold features',
          'Backstage Access Opportunities',
          'Private 1-on-1 Concierge',
          'Global Lounge Access',
          '10x Points on Check-ins',
      ],
      cta: 'Contact Sales',
      variant: 'glass' as const,
      priceId: 'price_platinum_monthly',
  }
];

export function PricingTable() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {tiers.map((tier) => (
        <Card
          key={tier.name}
          variant={tier.variant}
          glow={tier.glow || 'none'}
          className={cn(
            "relative flex flex-col h-full",
            tier.popular && "border-flame-500/50 bg-space-800/80"
          )}
          padding="lg"
        >
          {tier.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge variant="flame" className="bg-flame-500 text-white border-0 shadow-lg shadow-flame-500/20">
                Most Popular
              </Badge>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">{tier.price}</span>
              {tier.period && <span className="text-slate-400 text-sm">{tier.period}</span>}
            </div>
            <p className="text-sm text-slate-400 mt-2">{tier.description}</p>
          </div>

          <div className="flex-1 space-y-4 mb-6">
            {tier.features.map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-white/10 mt-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-slate-300">{feature}</span>
              </div>
            ))}
          </div>

          <SubscribeButton 
            tier={tier.name}
            priceId={tier.priceId}
            cta={tier.cta}
            variant={tier.popular ? "primary" : "secondary"}
          />
        </Card>
      ))}
    </div>
  );
}
