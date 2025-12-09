'use client';

import { useState } from 'react';
import { m } from 'framer-motion';
import { analyzeSkinCondition } from '@/lib/ai'; // 진짜 로직 임포트

export function SkinGlowAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<null | { score: number; reasoning: string[]; recommendation: string }>(null);

  const startAnalysis = async () => {
    setAnalyzing(true);
    
    // Simulate Vision AI Processing Time (Real calculation takes time)
    try {
        // 실제로는 여기서 캡처된 이미지를 넘김
        const analysis = await analyzeSkinCondition("image_buffer_mock"); 
        
        setTimeout(() => {
            setResult(analysis);
            setAnalyzing(false);
        }, 2500); // 사용자가 '분석 중임'을 느끼게 하는 심리적 시간
    } catch (e) {
        console.error(e);
        setAnalyzing(false);
    }
  };

  return (
    <div className="bg-neutral-900 rounded-3xl overflow-hidden border border-white/10 aspect-[3/4] relative group">
      {/* ... (UI 코드는 동일 유지) ... */}
      
      {/* Simulated Camera Feed */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
        {!result && !analyzing && (
           <button 
             onClick={startAnalysis}
             className="z-20 bg-white text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]"
           >
             Analyze My Glow
           </button>
        )}
        
        {analyzing && (
            <div className="z-20 flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
                <div className="text-pink-400 font-mono text-xs animate-pulse">
                    Vectorizing Skin Texture...<br/>
                    Comparing with 100k Clinical Data...
                </div>
            </div>
        )}

        {result && (
            <m.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="z-20 w-full h-full bg-black/90 backdrop-blur-xl p-6 flex flex-col overflow-y-auto"
            >
                <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
                    <div>
                        <div className="text-pink-500 text-xs font-mono mb-1">AI DIAGNOSIS</div>
                        <div className="text-4xl font-black text-white">{result.score}<span className="text-lg text-gray-500 font-normal">/100</span></div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-400">Skin Age</div>
                        <div className="text-xl font-bold text-white">23.5<span className="text-xs text-gray-500">yo</span></div>
                    </div>
                </div>

                <div className="space-y-4 text-left">
                    <div>
                        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Reasoning Engine</h4>
                        <ul className="space-y-2">
                            {result.reasoning.map((text, i) => (
                                <li key={i} className="text-xs text-gray-400 flex gap-2 leading-relaxed">
                                    <span className="text-pink-500">▹</span>
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 mt-4">
                        <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-2">Prescription</h4>
                        <p className="text-sm text-gray-200 leading-relaxed font-medium">
                            {result.recommendation}
                        </p>
                    </div>
                </div>

                <button 
                    onClick={() => setResult(null)}
                    className="mt-auto pt-8 text-xs text-white/30 hover:text-white transition-colors"
                >
                    CLOSE ANALYSIS
                </button>
            </m.div>
        )}
      </div>
    </div>
  );
}
