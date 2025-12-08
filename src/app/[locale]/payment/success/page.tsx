import { Metadata } from 'next';
import PaymentSuccessClient from './PaymentSuccessClient';

export const metadata: Metadata = {
  title: 'Payment Successful | ZZIK',
  description: 'Your VIP membership has been activated successfully',
};

export default function PaymentSuccessPage() {
  return <PaymentSuccessClient />;
}
