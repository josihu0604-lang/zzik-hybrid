'use client';

import { m } from 'framer-motion';
import { Wallet, Plus, ArrowUpRight } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import Link from 'next/link';

interface ZPayBalanceCardProps {
  balance: number; // Balance in USD
  className?: string;
}

export default function ZPayBalanceCard({ balance, className = '' }: ZPayBalanceCardProps) {
  const { formatPrice, currency } = useCurrency();

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 p-6 ${className}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.5),rgba(255,255,255,0))]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-white/90 text-sm font-medium">Z-Pay Balance</span>
          </div>
          <Link
            href="/zpay/history"
            className="text-white/80 hover:text-white transition-colors"
          >
            <ArrowUpRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Balance Amount */}
        <div className="mb-6">
          <div className="text-4xl font-black text-white mb-1">
            {formatPrice(balance)}
          </div>
          {currency !== 'USD' && (
            <div className="text-white/70 text-sm">≈ ${balance.toFixed(2)} USD</div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link
            href="/zpay/charge"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-purple-600 font-semibold hover:bg-white/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Charge</span>
          </Link>
          <Link
            href="/zpay/send"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/20 text-white font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Send</span>
          </Link>
        </div>
      </div>
    </m.div>
  );
}
