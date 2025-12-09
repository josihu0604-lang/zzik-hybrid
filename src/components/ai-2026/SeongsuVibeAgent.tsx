'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';

export function SeongsuVibeAgent() {
  const [messages, setMessages] = useState([
    { role: 'agent', text: '성수동 바이브 분석 완료. 무엇을 찾으시나요?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
        const agentMsg = { 
            role: 'agent', 
            text: '현재 디올 성수 대기 42팀, 레이어57은 쾌적합니다. 힙한 인더스트리얼 무드라면 "텅 성수"를 추천해요. 지금 바로 예약할까요?' 
        };
        setMessages(prev => [...prev, agentMsg]);
    }, 1500);
  };

  return (
    <div className="bg-neutral-900 rounded-3xl overflow-hidden border border-orange-500/20 aspect-[3/4] flex flex-col relative shadow-2xl shadow-orange-900/20">
      {/* Header */}
      <div className="p-4 bg-neutral-800/50 border-b border-white/5 flex items-center justify-between backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-bold text-gray-200">Seongsu Curator</span>
        </div>
        <div className="text-[10px] text-orange-400 font-mono border border-orange-500/30 px-2 py-0.5 rounded">RAG ONLINE</div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-hide">
        <AnimatePresence>
            {messages.map((msg, i) => (
                <m.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-orange-600 text-white rounded-tr-none' 
                        : 'bg-neutral-800 text-gray-200 rounded-tl-none border border-white/10'
                    }`}>
                        {msg.text}
                    </div>
                </m.div>
            ))}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-neutral-800/80 backdrop-blur-md border-t border-white/5">
        <div className="flex gap-2">
            <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="조용한 카페 찾아줘..."
                className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-colors placeholder:text-gray-600"
            />
            <button 
                onClick={handleSend}
                className="bg-orange-500 hover:bg-orange-400 text-black rounded-xl px-4 font-bold transition-colors"
            >
                →
            </button>
        </div>
      </div>
    </div>
  );
}
