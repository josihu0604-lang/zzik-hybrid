import { Metadata } from 'next';
import PricingPageClient from './PricingPageClient';

export const metadata: Metadata = {
  title: 'VIP Membership | ZZIK',
  description: 'Choose your VIP membership tier and unlock exclusive K-Experience benefits',
};

export default function PricingPage() {
  return <PricingPageClient />;
}
