'use client';

import { m, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, Share2, Wallet } from 'lucide-react';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any; // Type strictly in real app
}

export function RewardModal({ isOpen, onClose, data }: RewardModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FF4500', '#FFFFFF', '#FFD700']
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FF4500', '#FFFFFF', '#FFD700']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
            onClick={onClose}
          >
            {/* Modal Card */}
            <m.div
              initial={{ scale: 0.8, opacity: 0, rotateX: 15 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-full max-w-sm bg-space-900 border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl shadow-flame-500/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Image (The Vibe Card) */}
              <div className="relative aspect-[3/4] bg-space-950 group">
                {data?.card?.imageUrl && (
                  <img 
                    src={data.card.imageUrl} 
                    alt="Vibe Card" 
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-space-900 via-transparent to-transparent" />
                
                {/* Rarity Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-flame-500/20 border border-flame-500/50 backdrop-blur-md">
                  <span className="text-xs font-bold text-flame-400 tracking-wider">
                    {data?.card?.metadata?.rarity || 'RARE'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 relative -mt-20">
                <div className="text-center space-y-1 mb-6">
                  <h2 className="text-3xl font-black text-white italic tracking-tighter">
                    VIBE MINTED
                  </h2>
                  <p className="text-flame-500 font-mono text-sm">
                    + {data?.reward?.amount?.toFixed(2)} Z-CASH
                  </p>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => console.log('Share')}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    <Share2 size={18} />
                    <span className="text-sm font-bold">SHARE</span>
                  </button>
                  <button 
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-flame-600 hover:bg-flame-500 transition-colors text-white"
                  >
                    <Wallet size={18} />
                    <span className="text-sm font-bold">WALLET</span>
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-4 left-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </m.div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
