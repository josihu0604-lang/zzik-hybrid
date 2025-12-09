'use client';

import { useState } from 'react';
import { m } from 'framer-motion';

export default function LeaderDashboard() {
  const [balance, setBalance] = useState(12540.50); // Live Revenue
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHistory, setTxHistory] = useState<any[]>([]);

  const handlePayout = async () => {
    setIsProcessing(true);
    
    // Simulate API Call to src/lib/crypto/stable-settlement.ts
    setTimeout(() => {
      setIsProcessing(false);
      setTxHistory(prev => [{
        id: Date.now(),
        amount: balance,
        status: 'CONFIRMED',
        hash: '0x71C...9A2F',
        time: 'Just now'
      }, ...prev]);
      setBalance(0);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black italic">ZZIK <span className="text-pink-500">LEADER</span></h1>
          <p className="text-gray-400 text-xs">Influencer Commerce Console</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500" />
      </header>

      {/* 1. Revenue Card */}
      <section className="bg-neutral-900 rounded-3xl p-6 border border-white/10 mb-6 relative overflow-hidden">
        <div className="relative z-10">
            <div className="text-gray-400 text-sm font-medium mb-1">Total Unsettled Revenue</div>
            <div className="text-4xl font-black text-white mb-6">
                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                <span className="text-lg text-gray-500 font-normal ml-2">USDC</span>
            </div>
            
            <button 
                onClick={handlePayout}
                disabled={balance === 0 || isProcessing}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                    balance > 0 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50' 
                    : 'bg-neutral-800 text-gray-500 cursor-not-allowed'
                }`}
            >
                {isProcessing ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Settling on Blockchain...
                    </>
                ) : (
                    <>
                        Instant Payout ⚡️
                    </>
                )}
            </button>
        </div>
        
        {/* Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[50px] rounded-full pointer-events-none" />
      </section>

      {/* 2. Active Campaigns */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            Live Campaigns
            <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded border border-red-500/30 animate-pulse">ON AIR</span>
        </h2>
        
        <div className="bg-neutral-900 rounded-2xl p-4 border border-white/5 flex gap-4 items-center">
            <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden relative">
                 <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-xs text-white/50">Thumbnail</div>
            </div>
            <div className="flex-1">
                <div className="text-sm font-bold text-white mb-1">Tamburins Egg Perfume Launch</div>
                <div className="text-xs text-gray-400">Seongsu Flagship • 12.4k Viewers</div>
            </div>
            <div className="text-right">
                <div className="text-xs text-gray-500">Sales</div>
                <div className="text-sm font-bold text-green-400">+$2,400</div>
            </div>
        </div>
      </section>

      {/* 3. Transaction History */}
      <section>
        <h2 className="text-lg font-bold mb-4">Payout History</h2>
        <div className="space-y-3">
            {txHistory.length === 0 && (
                <div className="text-center text-gray-600 text-sm py-4">No recent transactions</div>
            )}
            {txHistory.map((tx) => (
                <m.div 
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-between items-center p-4 bg-neutral-900/50 rounded-xl border border-white/5"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                            ↗
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white">Withdrawal</div>
                            <div className="text-xs text-gray-500">{tx.hash}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-bold text-white">-${tx.amount.toLocaleString()}</div>
                        <div className="text-[10px] text-gray-400">{tx.time}</div>
                    </div>
                </m.div>
            ))}
        </div>
      </section>
    </div>
  );
}
