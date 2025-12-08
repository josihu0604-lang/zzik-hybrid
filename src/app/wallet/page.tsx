'use client';

import { useQuery } from '@tanstack/react-query';
import { WalletCard } from '@/components/wallet/WalletCard';
import { VibeGrid } from '@/components/wallet/VibeGrid';
import { m } from 'framer-motion';

export default function WalletPage() {
  // Fetch Balance
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

  return (
    <div className="min-h-screen bg-space-950 text-white p-6 pb-24">
      <header className="mb-8 pt-8">
        <h1 className="text-2xl font-black tracking-tight">MY ASSETS</h1>
      </header>

      {/* Wallet Card Section */}
      <section className="mb-10 relative z-10">
        <WalletCard 
          balance={walletData?.zCash?.balance || 0} 
          address={walletData?.walletAddress || '0x...'}
        />
      </section>

      {/* Stats Row */}
      <section className="flex justify-between mb-8 px-2">
        <div className="text-center">
          <div className="text-xs text-white/40 mb-1">COLLECTION</div>
          <div className="text-xl font-bold">{vibeData?.data?.length || 0}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/40 mb-1">RANK</div>
          <div className="text-xl font-bold text-flame-500">#420</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/40 mb-1">STREAK</div>
          <div className="text-xl font-bold">7 Days</div>
        </div>
      </section>

      {/* Vibe Grid Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">My Vibes</h2>
          <button className="text-xs text-flame-500 font-bold">VIEW ALL</button>
        </div>
        <VibeGrid items={vibeData?.data || []} />
      </section>
    </div>
  );
}
