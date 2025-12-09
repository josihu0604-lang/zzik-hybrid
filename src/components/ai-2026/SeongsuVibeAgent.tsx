'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Send, Sparkles, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// 2026 Trend: Hyper-Local Agentic Workflow
// Target: Seongsu-dong Local Brands & Pop-ups

export function SeongsuVibeAgent() {
  const [messages, setMessages] = useState<{role: 'ai' | 'user', text: string}[]>([
    { role: 'ai', text: '안녕! 성수동 바이브 탐색기야. 지금 땡기는 분위기 있어? (예: 힙한 공장형 카페, 조용한 위스키바)' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    // Mock AI Response (RAG simulation)
    setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { 
            role: 'ai', 
            text: `"${userMsg}" 느낌이라면... \n\n📍 [포인트 오브 뷰] 어때? 지금 대기 0명이야. \n그 다음엔 📍 [피치스 도원] 가서 팝업 구경하면 딱일 듯! \n\n두 곳 다 방문하면 '성수 마스터' 뱃지 줄게.` 
        }]);
    }, 1500);
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-space-900/80 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[400px]">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-space-950/50">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-500 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
        </div>
        <div>
            <h4 className="text-sm font-bold text-white">Seongsu Curator</h4>
            <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-gray-400">Online • 2026 Model</span>
            </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg, idx) => (
            <m.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
                <div 
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-white text-black rounded-tr-none font-medium' 
                        : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/5'
                    }`}
                >
                    {msg.text.split('\n').map((line, i) => (
                        <span key={i} className="block min-h-[1.2em]">{line}</span>
                    ))}
                </div>
            </m.div>
        ))}
        {isTyping && (
            <div className="flex justify-start">
                <div className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-200" />
                </div>
            </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-space-950/50 border-t border-white/5 flex gap-2">
        <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="성수동 어디 갈까?"
            className="flex-1 bg-space-800 text-white text-sm rounded-xl px-4 py-2 border border-transparent focus:border-white/20 outline-none placeholder:text-gray-500"
        />
        <Button 
            size="icon" 
            className="w-10 h-10 rounded-xl bg-white text-black hover:bg-gray-200"
            onClick={handleSend}
        >
            <Send size={16} />
        </Button>
      </div>
    </div>
  );
}
