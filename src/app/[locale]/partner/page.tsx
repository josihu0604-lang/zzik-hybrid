import { Metadata } from 'next';
import PartnerLandingClient from './PartnerLandingClient';

export const metadata: Metadata = {
  title: 'Become a Partner | ZZIK',
  description: 'Join ZZIK as a partner and share your K-Experience with the world.',
  openGraph: {
    title: 'Become a Partner | ZZIK',
    description: 'Join ZZIK as a partner and share your K-Experience with the world.',
    type: 'website',
  },
};

export default function PartnerPage() {
  return <PartnerLandingClient />;
}
