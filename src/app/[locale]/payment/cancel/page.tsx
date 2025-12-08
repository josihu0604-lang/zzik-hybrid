import { Metadata } from 'next';
import PaymentCancelClient from './PaymentCancelClient';

export const metadata: Metadata = {
  title: 'Payment Cancelled | ZZIK',
  description: 'Your payment was cancelled. You can try again anytime.',
};

export default function PaymentCancelPage() {
  return <PaymentCancelClient />;
}
