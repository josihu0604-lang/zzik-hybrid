'use client';

import { m } from 'framer-motion';

export function VibePortal() {
  return (
    <div className="h-full flex flex-col items-center justify-center relative overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black" />
      
      <m.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="z-10 text-center px-6"
      >
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
            ZZIK
          </span>
          <span className="text-pink-500 text-2xl align-top ml-2">2026</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
            The <span className="text-white font-medium">Hyper-Personalized</span> & <br/>
            <span className="text-white font-medium">Local-First</span> Experience Protocol.
        </p>
      </m.div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
         <m.div 
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" 
         />
         <m.div 
            animate={{ y: [0, 20, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" 
         />
      </div>
    </div>
  );
}
