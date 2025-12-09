'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { FakeGlobe } from './FakeGlobe';
import { GoldenButton } from '../action/GoldenButton';
import { RewardModal } from '../feedback/RewardModal';
import { colors } from '@/lib/design-tokens';

/**
 * VibePortal - The New Landing Container
 * 
 * Integrates "Fake 3D Globe" and "Hold-to-Mint" button.
 * Handles the transition from "Portal" to "Main App".
 */

export function VibePortal() {
  const [status, setStatus] = useState<'IDLE' | 'MINTING' | 'SUCCESS'>('IDLE');
  const [rewardData, setRewardData] = useState<any>(null);

  const handleMintRequest = async () => {
    setStatus('MINTING');
    
    try {
      // Call Mint API
      const res = await fetch('/api/vibe/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: { name: 'Portal', lat: 37.5, lng: 127.0 } // Mock GPS
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setRewardData(data);
        setStatus('SUCCESS');
      } else {
        // Handle Error (Reset)
        alert('Minting failed. Try again.');
        setStatus('IDLE');
      }
    } catch (e) {
      console.error(e);
      setStatus('IDLE');
    }
  };

  const handleCloseModal = () => {
    // Navigate to main app or reset
    window.location.href = '/dashboard';
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-space-950 text-white font-sans">
      {/* Background: Fake 3D Globe */}
      <FakeGlobe />

      {/* Reward Modal */}
      <RewardModal 
        isOpen={status === 'SUCCESS'} 
        onClose={handleCloseModal}
        data={rewardData}
      />

      {/* Overlay Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-between pb-20 pt-32 px-6 pointer-events-none">
        
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center space-y-2"
        >
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
            WHERE IS<br />YOUR VIBE?
          </h1>
          <p className="text-sm text-white/40 tracking-[0.2em] uppercase">
            The Proof of Experience Protocol (v2025-12-09 DeepDive)
          </p>
        </m.div>

        {/* Action Area */}
        <div className="pointer-events-auto">
          <AnimatePresence mode="wait">
            {status !== 'SUCCESS' && (
              <m.div
                key="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
                transition={{ delay: 1, type: 'spring' }}
              >
                {status === 'MINTING' ? (
                  <div className="flex flex-col items-center gap-4">
                     <div className="w-16 h-16 rounded-full border-4 border-flame-500 border-t-transparent animate-spin" />
                     <p className="text-flame-500 font-mono animate-pulse">MINING BLOCK...</p>
                  </div>
                ) : (
                  <GoldenButton onMintComplete={handleMintRequest} />
                )}
              </m.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Stats (Fake Ticker) */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-0 right-0 flex justify-center"
        >
          <div className="px-4 py-1 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-white/50 font-mono">
              LIVE: 1,240 MINTS / 24H
            </span>
          </div>
        </m.div>
      </div>
    </div>
  );
}
