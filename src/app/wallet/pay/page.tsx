'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { QrCode, Scan, CreditCard, Zap } from 'lucide-react';
import { colors, rgba, gradients, shadows } from '@/lib/design-tokens';
import { QRScanner } from '@/components/wallet/QRScanner';
import { PaymentConfirm } from '@/components/wallet/PaymentConfirm';

/**
 * Pay Hub - QR Payment System
 * 
 * 🎯 Complete 3-Second Payment Flow (PAY-002):
 * 1. Scan QR (1s) - QRScanner component
 * 2. Confirm Amount (1s) - PaymentConfirm component
 * 3. Complete (1s) - Optimistic UI
 * 
 * Features:
 * - Real QR Scanner (camera access)
 * - Instant confirmation UI
 * - Z-Point balance integration (PAY-001)
 * - Haptic feedback on success
 */

type PayMode = 'idle' | 'scanning' | 'confirming';

interface PaymentData {
  merchantId: string;
  merchantName: string;
  amount: number;
}

export default function PayPage() {
  const [mode, setMode] = useState<PayMode>('idle');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  
  // Mock balance (실제로는 API에서 가져옴)
  const balance = 150000;

  const handleScanComplete = (data: PaymentData) => {
    setPaymentData(data);
    setMode('confirming');
  };

  const handleConfirm = () => {
    setMode('idle');
    setPaymentData(null);
  };

  const handleCancel = () => {
    setMode('idle');
    setPaymentData(null);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-space-950 via-space-900 to-black">
        {/* Header */}
        <header className="px-6 pt-12 pb-8">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-black tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
                Z-Pay
              </span>
            </h1>
            <p className="mt-2 text-base" style={{ color: rgba.white[60] }}>
              Pay in 3 seconds with QR
            </p>
          </m.div>
        </header>

        {/* Balance Card */}
        <section className="px-6 mb-8">
          <m.div
            className="relative overflow-hidden rounded-3xl p-6"
            style={{
              background: gradients.flame,
              boxShadow: shadows.glow.primary,
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: rgba.white[80] }}>
                  Z-Point Balance
                </p>
                <p className="mt-1 text-4xl font-black text-white">
                  ₩ {balance.toLocaleString('ko-KR')}
                </p>
              </div>
              <div
                className="flex items-center justify-center w-14 h-14 rounded-2xl"
                style={{ background: rgba.white[20] }}
              >
                <Zap size={28} color="white" fill="white" />
              </div>
            </div>
            
            {/* Charge Button */}
            <button
              className="mt-4 w-full py-3 rounded-xl font-semibold text-sm"
              style={{
                background: rgba.white[20],
                color: 'white',
              }}
            >
              + Charge Points
            </button>
          </m.div>
        </section>

        {/* Quick Scan Button */}
        <section className="px-6 mb-8">
          <button
            onClick={() => setMode('scanning')}
            className="w-full py-5 rounded-2xl font-bold text-lg text-white flex items-center justify-center gap-3"
            style={{ background: gradients.flame }}
          >
            <Scan size={28} strokeWidth={2.5} />
            Scan to Pay
          </button>
        </section>
        {/* Payment Instructions */}
        <section className="px-6 pb-32">
          <h2 className="text-lg font-semibold mb-4">How It Works</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold flex-shrink-0"
                style={{ background: colors.flame[500] }}
              >
                1
              </div>
              <div>
                <p className="font-semibold mb-1">Find Z-Pay Merchant</p>
                <p className="text-sm" style={{ color: rgba.white[70] }}>
                  Look for the Z-Pay Accepted sign at stores
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold flex-shrink-0"
                style={{ background: colors.flame[500] }}
              >
                2
              </div>
              <div>
                <p className="font-semibold mb-1">Scan QR Code</p>
                <p className="text-sm" style={{ color: rgba.white[70] }}>
                  Point your camera at the merchant's QR code
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold flex-shrink-0"
                style={{ background: colors.flame[500] }}
              >
                3
              </div>
              <div>
                <p className="font-semibold mb-1">Confirm & Pay</p>
                <p className="text-sm" style={{ color: rgba.white[70] }}>
                  Check the amount and confirm in 3 seconds ⚡
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* QR Scanner Modal */}
      {mode === 'scanning' && (
        <QRScanner
          onScan={handleScanComplete}
          onClose={() => setMode('idle')}
        />
      )}

      {/* Payment Confirmation Modal */}
      {mode === 'confirming' && paymentData && (
        <PaymentConfirm
          data={paymentData}
          balance={balance}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}


