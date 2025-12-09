'use client';

import { useState, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ScanFace, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// 2026 Trend: Privacy-first On-device Analysis
// Target: Dermatology & Skincare Brands

export function SkinGlowAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ score: number; moisture: number; glow: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startAnalysis = () => {
    setAnalyzing(true);
    // Simulate On-device Vision AI processing
    setTimeout(() => {
      setResult({
        score: 92,
        moisture: 85,
        glow: 'Radiant'
      });
      setAnalyzing(false);
    }, 2500);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold bg-gradient-to-r from-pink-300 to-purple-400 bg-clip-text text-transparent">
            AI Glow Check
            </h3>
            <span className="text-[10px] uppercase tracking-wider bg-white/10 px-2 py-1 rounded text-white/60">
            2026 Vision Engine
            </span>
        </div>

        <div className="relative aspect-[3/4] bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center group">
          {!result && !analyzing && (
             <ScanFace size={48} className="text-white/30 group-hover:text-white/80 transition-colors" />
          )}
          
          {analyzing && (
            <>
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent animate-pulse" />
                <m.div 
                    className="absolute top-0 left-0 w-full h-1 bg-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.8)]"
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute center text-xs font-mono text-purple-300">Scanning Dermis...</div>
            </>
          )}

          {result && (
            <m.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-black/90 flex flex-col items-center justify-center p-6 text-center"
            >
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 to-violet-500 flex items-center justify-center mb-4 shadow-lg shadow-pink-500/30">
                    <span className="text-3xl font-black text-white">{result.score}</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-1">Excellent Condition</h4>
                <p className="text-sm text-gray-300 mb-4">Moisture Level: {result.moisture}%</p>
                
                <div className="flex gap-2 text-xs bg-white/5 p-2 rounded-lg">
                    <ShieldCheck size={14} className="text-green-400" />
                    <span className="text-gray-400">Verified by ZZIK Vision</span>
                </div>
            </m.div>
          )}
        </div>

        <div className="space-y-3">
            <p className="text-xs text-gray-400 leading-relaxed text-center">
                방문 전후 피부 상태를 AI로 증명하고<br/>
                <span className="text-pink-300">닥터자르트 팝업 스토어</span> 추가 보상을 획득하세요.
            </p>
            <Button 
                onClick={startAnalysis}
                disabled={analyzing || !!result}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 border-none h-12 text-lg font-bold shadow-lg shadow-purple-900/20"
            >
                {analyzing ? 'Analyzing...' : result ? 'Mint Proof' : 'Check My Glow'}
            </Button>
        </div>
      </div>
    </div>
  );
}
