'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { WalletCard } from '@/components/wallet/WalletCard';
import { VibeGrid } from '@/components/wallet/VibeGrid';
import { m } from 'framer-motion';
import { TrendingUp, ShoppingBag, Gift, ArrowRight } from 'lucide-react';
import { colors, rgba } from '@/lib/design-tokens';

/**
 * Wallet Page - Point System Hub (PAY-001)
 * 
 * 🎯 VASP 우회 전략:
 * - "MY ASSETS" → "My Z-Points" 포인트 중심
 * - 크립토 용어 완전 제거
 * - 포인트 사용처 강조 (Pay/Play/Beauty)
 */

export default function WalletPage() {
  // Fetch Balance (Z-Point로 표시)
  const { data: walletData } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: async () => {
      const res = await fetch('/api/wallet/balance');
      return res.json();
    }
  });

  // Fetch Vibe Cards
  const { data: vibeData } = useQuery({
    queryKey: ['vibe-list'],
    queryFn: async () => {
      const res = await fetch('/api/vibe/list');
      return res.json();
    }
  });

  // Z-Point 잔액 (address 전달 안 함 - 숨김 처리)
  const zPointBalance = walletData?.zCash?.balance || 150000;

  return (
    <div className="min-h-screen bg-gradient-to-b from-space-950 via-space-900 to-black text-white p-6 pb-24">
      {/* Header */}
      <header className="mb-8 pt-8">
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-black tracking-tight">
            My <span style={{ color: colors.flame[500] }}>Z-Points</span>
          </h1>
          <p className="mt-1 text-sm" style={{ color: rgba.white[60] }}>
            Use everywhere with Z-Pay
          </p>
        </m.div>
      </header>

      {/* Wallet Card Section */}
      <section className="mb-8 relative z-10">
        <WalletCard balance={zPointBalance} />
      </section>

      {/* Quick Actions */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          <Link href="/wallet/charge">
            <m.div
              className="p-4 rounded-2xl text-center"
              style={{ background: rgba.space[92], border: `1px solid ${rgba.white[10]}` }}
              whileTap={{ scale: 0.95 }}
            >
              <TrendingUp size={24} color={colors.flame[500]} className="mx-auto mb-2" />
              <p className="text-xs font-medium">Charge</p>
            </m.div>
          </Link>

          <Link href="/map">
            <m.div
              className="p-4 rounded-2xl text-center"
              style={{ background: rgba.space[92], border: `1px solid ${rgba.white[10]}` }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingBag size={24} color={colors.flame[500]} className="mx-auto mb-2" />
              <p className="text-xs font-medium">Spend</p>
            </m.div>
          </Link>

          <Link href="/wallet/history">
            <m.div
              className="p-4 rounded-2xl text-center"
              style={{ background: rgba.space[92], border: `1px solid ${rgba.white[10]}` }}
              whileTap={{ scale: 0.95 }}
            >
              <Gift size={24} color={colors.flame[500]} className="mx-auto mb-2" />
              <p className="text-xs font-medium">Rewards</p>
            </m.div>
          </Link>
        </div>
      </section>

      {/* Benefits Banner */}
      <section className="mb-8">
        <m.div
          className="p-6 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 107, 91, 0.1), rgba(236, 72, 153, 0.1))',
            border: `1px solid ${rgba.white[10]}`,
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base mb-1">0% Exchange Fee</h3>
              <p className="text-xs" style={{ color: rgba.white[70] }}>
                Save money on every transaction
              </p>
            </div>
            <ArrowRight size={20} color={colors.flame[500]} />
          </div>
        </m.div>
      </section>

      {/* Stats Row */}
      <section className="flex justify-between mb-8 px-2">
        <div className="text-center">
          <div className="text-xs mb-1" style={{ color: rgba.white[40] }}>THIS MONTH</div>
          <div className="text-xl font-bold">{(zPointBalance * 0.3).toLocaleString('ko-KR')} P</div>
        </div>
        <div className="text-center">
          <div className="text-xs mb-1" style={{ color: rgba.white[40] }}>SAVED FEES</div>
          <div className="text-xl font-bold" style={{ color: colors.flame[500] }}>₩12,400</div>
        </div>
        <div className="text-center">
          <div className="text-xs mb-1" style={{ color: rgba.white[40] }}>TRANSACTIONS</div>
          <div className="text-xl font-bold">24</div>
        </div>
      </section>

      {/* Vibe Grid Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Recent Activity</h2>
          <Link href="/wallet/history" className="text-xs font-bold" style={{ color: colors.flame[500] }}>
            VIEW ALL
          </Link>
        </div>
        <VibeGrid items={vibeData?.data || []} />
      </section>
    </div>
  );
}
