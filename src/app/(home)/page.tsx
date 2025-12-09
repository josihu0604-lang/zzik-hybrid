'use client';

import dynamic from 'next/dynamic';
import { m } from 'framer-motion';
import { SkinGlowAnalyzer } from '@/components/ai-2026/SkinGlowAnalyzer';
import { SeongsuVibeAgent } from '@/components/ai-2026/SeongsuVibeAgent';
import { VibePortal } from '@/components/landing/VibePortal';

// Force dynamic rendering for real-time vibe
export const dynamicMode = 'force-dynamic';

export default function Home() {
  return (
    <div className="bg-black min-h-screen text-white overflow-x-hidden">
      {/* 1. Hero Section (The Portal) */}
      <section className="relative h-screen">
        <VibePortal />
        
        {/* Scroll Indicator */}
        <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ delay: 2, duration: 2, repeat: Infinity }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-xs text-white/50 tracking-[0.2em] uppercase z-20 pointer-events-none"
        >
            Scroll for 2026 Features
        </m.div>
      </section>

      {/* 2. AI Skin Analysis Section */}
      <section className="relative py-24 px-6 bg-gradient-to-b from-black to-space-950">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
                <span className="text-pink-500 font-mono text-xs tracking-wider border border-pink-500/30 px-3 py-1 rounded-full">
                    NEW FEATURE
                </span>
                <h2 className="text-4xl md:text-5xl font-black leading-tight">
                    Proof of <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                        Glow & Care
                    </span>
                </h2>
                <p className="text-gray-400 leading-relaxed">
                    단순한 방문 인증은 옛말입니다. <br/>
                    이제 <strong>Vision AI</strong>가 당신의 피부 변화를 증명하고,
                    피부과 시술 효과를 블록체인에 영구 기록합니다.
                </p>
            </div>
            <div className="relative">
                <div className="absolute inset-0 bg-pink-500/20 blur-[100px] rounded-full pointer-events-none" />
                <SkinGlowAnalyzer />
            </div>
        </div>
      </section>

      {/* 3. Seongsu Agent Section */}
      <section className="relative py-24 px-6 bg-space-950 border-t border-white/5">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
            <div className="order-2 md:order-1 relative">
                <div className="absolute inset-0 bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />
                <SeongsuVibeAgent />
            </div>
            <div className="order-1 md:order-2 space-y-6">
                <span className="text-orange-500 font-mono text-xs tracking-wider border border-orange-500/30 px-3 py-1 rounded-full">
                    LOCAL INTELLIGENCE
                </span>
                <h2 className="text-4xl md:text-5xl font-black leading-tight">
                    Seongsu <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
                        Curator Agent
                    </span>
                </h2>
                <p className="text-gray-400 leading-relaxed">
                    "지금 가장 힙한 곳 어디야?" <br/>
                    검색하지 마세요. 대화하세요. <br/>
                    <strong>Local RAG Agent</strong>가 실시간 대기열과 분위기를 분석해
                    당신만을 위한 코스를 설계합니다.
                </p>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-white/20 text-xs border-t border-white/5">
        <p>ZZIK HYBRID PROTOCOL v2026.12.09</p>
        <p className="mt-2">Powered by Cloudflare Edge & Gemini Nano</p>
      </footer>
    </div>
  );
}
