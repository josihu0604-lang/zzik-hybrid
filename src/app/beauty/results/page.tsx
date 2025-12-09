'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { m } from 'framer-motion';
import { Sparkles, ShoppingBag, Calendar, Download, Share2 } from 'lucide-react';
import { colors, rgba, gradients } from '@/lib/design-tokens';

/**
 * Skin Analysis Results (BEAUTY-001 Result Screen)
 * 
 * 🎯 Features:
 * - 피부 타입 + 점수 표시
 * - 피부 고민 분석
 * - 제품/시술 추천 CTA
 * - 결과 저장/공유
 */

interface SkinConcern {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

const SKIN_TYPES: Record<string, { name: string; description: string; color: string }> = {
  combination: {
    name: 'Combination',
    description: 'Oily T-zone with dry cheeks',
    color: colors.indigo[500],
  },
  oily: {
    name: 'Oily',
    description: 'Excess sebum production',
    color: colors.yellow[500],
  },
  dry: {
    name: 'Dry',
    description: 'Lacks moisture and oil',
    color: colors.cyan[500],
  },
  sensitive: {
    name: 'Sensitive',
    description: 'Easily irritated',
    color: colors.pink[500],
  },
};

export default function SkinResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const score = parseInt(searchParams.get('score') || '85');
  const skinType = searchParams.get('type') || 'combination';
  
  const typeInfo = SKIN_TYPES[skinType] || SKIN_TYPES.combination;

  // Mock 피부 고민 데이터
  const concerns: SkinConcern[] = [
    { id: '1', name: 'Pores', severity: 'high', description: 'Enlarged pores on nose and cheeks' },
    { id: '2', name: 'Fine Lines', severity: 'medium', description: 'Early signs around eyes' },
    { id: '3', name: 'Dullness', severity: 'low', description: 'Uneven skin tone' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return colors.red[500];
      case 'medium': return colors.yellow[500];
      case 'low': return colors.green[500];
      default: return rgba.white[50];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-space-950 via-space-900 to-black text-white pb-24">
      {/* Header */}
      <header className="px-6 pt-12 pb-6">
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => router.push('/beauty')}
            className="text-sm font-medium mb-4"
            style={{ color: rgba.white[60] }}
          >
            ← Back to Beauty Hub
          </button>
          <h1 className="text-3xl font-black">Your Skin Profile</h1>
        </m.div>
      </header>

      {/* Score Card */}
      <section className="px-6 mb-8">
        <m.div
          className="relative overflow-hidden rounded-3xl p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
            border: `1px solid ${rgba.white[10]}`,
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl" />
          
          <div className="relative z-10 text-center">
            {/* Score */}
            <div className="mb-4">
              <div className="text-7xl font-black">{score}</div>
              <div className="text-sm" style={{ color: rgba.white[70] }}>/ 100 Skin Health Score</div>
            </div>

            {/* Skin Type Badge */}
            <div 
              className="inline-block px-6 py-3 rounded-2xl font-bold"
              style={{ 
                background: `${typeInfo.color}20`,
                border: `2px solid ${typeInfo.color}`,
              }}
            >
              <div className="flex items-center gap-2">
                <Sparkles size={20} color={typeInfo.color} />
                <span>{typeInfo.name} Skin</span>
              </div>
            </div>

            <p className="mt-3 text-sm" style={{ color: rgba.white[70] }}>
              {typeInfo.description}
            </p>
          </div>
        </m.div>
      </section>

      {/* Skin Concerns */}
      <section className="px-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Detected Concerns</h2>
        <div className="space-y-3">
          {concerns.map((concern, index) => (
            <m.div
              key={concern.id}
              className="p-4 rounded-2xl"
              style={{ 
                background: rgba.space[92],
                border: `1px solid ${rgba.white[10]}`,
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{concern.name}</h3>
                <span 
                  className="text-xs font-bold px-3 py-1 rounded-full uppercase"
                  style={{ 
                    background: `${getSeverityColor(concern.severity)}20`,
                    color: getSeverityColor(concern.severity),
                  }}
                >
                  {concern.severity}
                </span>
              </div>
              <p className="text-sm" style={{ color: rgba.white[60] }}>
                {concern.description}
              </p>
            </m.div>
          ))}
        </div>
      </section>

      {/* Action Cards */}
      <section className="px-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Recommended Actions</h2>
        <div className="space-y-3">
          {/* Product Recommendations */}
          <Link href="/beauty/products">
            <m.div
              className="p-5 rounded-2xl flex items-center justify-between"
              style={{ 
                background: gradients.flame,
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <ShoppingBag size={24} color="white" />
                </div>
                <div>
                  <h3 className="font-bold">K-Beauty Products</h3>
                  <p className="text-xs" style={{ color: rgba.white[80] }}>
                    Personalized for {typeInfo.name.toLowerCase()} skin
                  </p>
                </div>
              </div>
              <div className="text-2xl">→</div>
            </m.div>
          </Link>

          {/* Clinic Booking */}
          <Link href="/beauty/booking">
            <m.div
              className="p-5 rounded-2xl flex items-center justify-between"
              style={{ 
                background: rgba.space[92],
                border: `1px solid ${rgba.white[10]}`,
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: colors.indigo[500] }}
                >
                  <Calendar size={24} color="white" />
                </div>
                <div>
                  <h3 className="font-bold">Book Clinic Treatment</h3>
                  <p className="text-xs" style={{ color: rgba.white[60] }}>
                    Professional care for your concerns
                  </p>
                </div>
              </div>
              <div className="text-2xl">→</div>
            </m.div>
          </Link>
        </div>
      </section>

      {/* Share Actions */}
      <section className="px-6">
        <div className="grid grid-cols-2 gap-3">
          <button
            className="py-4 rounded-2xl font-semibold flex items-center justify-center gap-2"
            style={{ 
              background: rgba.space[92],
              border: `1px solid ${rgba.white[10]}`,
            }}
          >
            <Download size={20} />
            <span>Save Result</span>
          </button>
          <button
            className="py-4 rounded-2xl font-semibold flex items-center justify-center gap-2"
            style={{ 
              background: rgba.space[92],
              border: `1px solid ${rgba.white[10]}`,
            }}
          >
            <Share2 size={20} />
            <span>Share</span>
          </button>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="px-6 mt-8">
        <p className="text-xs text-center" style={{ color: rgba.white[40] }}>
          AI analysis for reference only. Consult dermatologist for medical advice.
        </p>
      </section>
    </div>
  );
}
