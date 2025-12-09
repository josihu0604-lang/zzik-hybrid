'use client';

import { useState, useCallback } from 'react';
import { m, useMotionValue, useTransform, animate } from 'framer-motion';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Fingerprint, Sparkles } from 'lucide-react';

/**
 * GoldenButton - The "Hold-to-Mint" Interaction
 * 
 * Design: 
 * - 3s Hold requirement
 * - Haptic feedback choreography
 * - SVG stroke animation
 */

interface GoldenButtonProps {
  onMintComplete: () => void;
}

export function GoldenButton({ onMintComplete }: GoldenButtonProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Motion Values
  const progress = useMotionValue(0);
  const scale = useTransform(progress, [0, 100], [1, 1.15]);
  const glow = useTransform(progress, [0, 100], [0, 30]);
  const fillOpacity = useTransform(progress, [0, 100], [0, 1]);
  
  // Haptic Engine
  const triggerHaptic = async (style: ImpactStyle) => {
    try {
      await Haptics.impact({ style });
    } catch {
      // Fallback for web (optional: navigator.vibrate)
    }
  };

  const startHolding = useCallback(() => {
    if (isSuccess) return;
    setIsHolding(true);
    triggerHaptic(ImpactStyle.Light);

    // Animate Progress (0 -> 100 in 3s)
    animate(progress, 100, {
      duration: 3,
      ease: "linear",
      onUpdate: (latest) => {
        // Haptic feedback choreography: vibrate every 20%
        if (latest > 0 && Math.floor(latest) % 20 === 0) {
          triggerHaptic(ImpactStyle.Medium);
        }
      },
      onComplete: () => {
        handleSuccess();
      }
    });
  }, [isSuccess, progress]);

  const stopHolding = useCallback(() => {
    if (isSuccess) return;
    setIsHolding(false);
    
    // Stop animation and reset
    progress.stop();
    animate(progress, 0, { duration: 0.3, ease: "backOut" });
    triggerHaptic(ImpactStyle.Light); // Fail feedback
  }, [isSuccess, progress]);

  const handleSuccess = async () => {
    setIsSuccess(true);
    await Haptics.notification({ type: NotificationType.Success });
    onMintComplete();
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Success Flash Overlay */}
      {isSuccess && (
        <m.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-white z-50 pointer-events-none"
        />
      )}

      {/* Main Button */}
      <m.button
        onPointerDown={startHolding}
        onPointerUp={stopHolding}
        onPointerLeave={stopHolding}
        style={{ scale, boxShadow: useTransform(glow, (v) => `0 0 ${v}px #FF4500`) }}
        className="relative w-28 h-28 rounded-full bg-gradient-to-b from-space-800 to-space-950 border border-flame-500/30 flex items-center justify-center overflow-hidden group"
      >
        {/* Inner Gradient */}
        <m.div 
          style={{ opacity: fillOpacity }}
          className="absolute inset-0 bg-gradient-to-t from-flame-600 to-spark-500"
        />

        {/* Icon */}
        <div className="z-10 relative text-white/80 group-active:text-white transition-colors">
          {isSuccess ? (
            <Sparkles size={40} className="animate-pulse text-white" />
          ) : (
            <Fingerprint size={40} strokeWidth={1.5} />
          )}
        </div>

        {/* Progress Ring (SVG) */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
          <circle
            cx="56"
            cy="56"
            r="54"
            fill="none"
            stroke="rgba(255, 69, 0, 0.2)" // Track color
            strokeWidth="4"
          />
          <m.circle
            cx="56"
            cy="56"
            r="54"
            fill="none"
            stroke="#FF4500" // Progress color
            strokeWidth="4"
            strokeLinecap="round"
            pathLength={useTransform(progress, [0, 100], [0, 1])}
          />
        </svg>
      </m.button>

      {/* Hint Text */}
      <m.p
        animate={{ opacity: isHolding ? 1 : 0.5, y: isHolding ? 10 : 0 }}
        className="mt-6 text-xs font-medium text-white/40 tracking-widest uppercase"
      >
        {isSuccess ? "MINTED" : isHolding ? "HOLD TO MINT" : "PRESS & HOLD"}
      </m.p>
    </div>
  );
}
