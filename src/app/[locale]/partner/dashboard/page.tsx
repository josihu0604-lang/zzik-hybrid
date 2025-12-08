import { Metadata } from 'next';
import PartnerDashboardClient from './PartnerDashboardClient';

export const metadata: Metadata = {
  title: 'Partner Dashboard | ZZIK',
  description: 'Manage your K-Experiences and view your earnings.',
};

export default function PartnerDashboardPage() {
  return <PartnerDashboardClient />;
}
