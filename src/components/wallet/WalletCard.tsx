'use client';

import Link from 'next/link';
import { m } from 'framer-motion';
import { useState } from 'react';
import { QrCode, Plus, History, Zap } from 'lucide-react';
import { colors, rgba, gradients } from '@/lib/design-tokens';

interface WalletCardProps {
  balance: number;
  address?: string;  // 주소는 선택적으로 (숨김)
}

/**
 * WalletCard - Point System UI (PAY-001)
 * 
 * 🎯 VASP 규제 우회 전략:
 * - "Z-Cash" → "Z-Point" 포인트 용어 전환
 * - "USDC" 제거 → KRW 원화 표시
 * - 지갑 주소 완전 숨김
 * - "충전" = 환전 느낌으로 UX 설계
 */

export function WalletCard({ balance, address }: WalletCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Z-Point → KRW 환산 (1 Z-Point = 1 KRW)
  const balanceKRW = balance;

  return (
    <div className="perspective-1000 w-full aspect-[1.58/1]">
      <m.div
        className="w-full h-full relative preserve-3d cursor-pointer transition-all duration-500"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front Face - Z-Point 잔액 */}
        <div className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden p-6 flex flex-col justify-between"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            border: `1px solid ${rgba.white[10]}`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Glow Effect */}
          <div className="absolute top-0 right-0 w-64 h-64 opacity-30 blur-[100px] rounded-full pointer-events-none"
            style={{ background: gradients.flame }}
          />
          
          {/* Header */}
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-2">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: gradients.flame }}
              >
                <Zap size={20} color="white" fill="white" />
              </div>
              <div>
                <div className="font-bold text-white text-base tracking-tight">Z-Point</div>
                <div className="text-xs" style={{ color: rgba.white[50] }}>Your balance</div>
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className="space-y-2 relative z-10">
            <div className="text-5xl font-black text-white tracking-tight">
              {balanceKRW.toLocaleString('ko-KR')}
              <span className="text-2xl ml-1" style={{ color: rgba.white[60] }}>P</span>
            </div>
            <div className="text-sm" style={{ color: rgba.white[50] }}>
              ≈ ₩{balanceKRW.toLocaleString('ko-KR')} KRW
            </div>
          </div>

          {/* Badge */}
          <div className="flex justify-between items-end relative z-10">
            <div className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{
                background: rgba.white[10],
                color: colors.flame[400],
                border: `1px solid ${colors.flame[500]}40`,
              }}
            >
              ⚡ Active Member
            </div>
          </div>
        </div>

        {/* Back Face - Actions (블록체인 용어 제거) */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl overflow-hidden p-6 flex flex-col justify-center items-center gap-4"
          style={{
            background: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)',
            border: `1px solid ${rgba.white[10]}`,
          }}
        >
          <div className="grid grid-cols-3 gap-3 w-full">
            {/* Charge Points */}
            <Link href="/wallet/charge" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl hover:scale-105 transition-transform"
              style={{ background: rgba.white[5] }}
            >
              <Plus size={24} color={colors.flame[500]} strokeWidth={2.5} />
              <span className="text-xs font-semibold text-white">Charge</span>
            </Link>

            {/* QR Payment */}
            <Link href="/wallet/pay" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl hover:scale-105 transition-transform"
              style={{ background: gradients.flame }}
            >
              <QrCode size={24} color="white" strokeWidth={2.5} />
              <span className="text-xs font-semibold text-white">Pay</span>
            </Link>

            {/* History */}
            <Link href="/wallet/history" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl hover:scale-105 transition-transform"
              style={{ background: rgba.white[5] }}
            >
              <History size={24} color={colors.flame[500]} strokeWidth={2.5} />
              <span className="text-xs font-semibold text-white">History</span>
            </Link>
          </div>

          {/* Security Badge (블록체인 용어 제거) */}
          <div className="mt-4 px-4 py-2 rounded-full text-xs font-medium"
            style={{
              background: rgba.white[5],
              color: rgba.white[60],
            }}
          >
            🔒 Secured Payment System
          </div>
        </div>
      </m.div>
    </div>
  );
}
