'use client';

import { m } from 'framer-motion';
import { useState } from 'react';
import { QrCode, Send, CreditCard } from 'lucide-react';

interface WalletCardProps {
  balance: number;
  address: string;
}

export function WalletCard({ balance, address }: WalletCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="perspective-1000 w-full aspect-[1.58/1]">
      <m.div
        className="w-full h-full relative preserve-3d cursor-pointer transition-all duration-500"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front Face */}
        <div className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-space-900 to-black border border-white/10 shadow-2xl overflow-hidden p-6 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-flame-500/10 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-flame-500 flex items-center justify-center">
                <span className="font-bold text-white text-xs">Z</span>
              </div>
              <span className="font-mono text-white/60 text-sm tracking-wider">Z-CASH</span>
            </div>
            <CreditCard className="text-white/20" />
          </div>

          <div className="space-y-1">
            <span className="text-white/40 text-xs uppercase tracking-widest">Total Balance</span>
            <div className="text-4xl font-black text-white tracking-tighter">
              {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-flame-500 text-lg">Z</span>
            </div>
            <div className="text-white/30 text-xs font-mono">
              ≈ ${(balance / 100).toFixed(2)} USDC
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="font-mono text-white/40 text-xs">
              {address.slice(0, 6)}...{address.slice(-4)}
            </div>
            <div className="text-xs text-flame-400 font-bold border border-flame-500/30 px-2 py-1 rounded">
              VIP LEVEL 1
            </div>
          </div>
        </div>

        {/* Back Face (Actions) */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-space-800 border border-white/10 p-6 flex flex-col justify-center items-center gap-4">
          <div className="grid grid-cols-2 gap-4 w-full">
            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <Send className="text-flame-500" />
              <span className="text-xs font-bold text-white">SEND</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <QrCode className="text-flame-500" />
              <span className="text-xs font-bold text-white">PAY</span>
            </button>
          </div>
          <p className="text-white/30 text-[10px] text-center">
            Secured by Privy & Base L2
          </p>
        </div>
      </m.div>
    </div>
  );
}
