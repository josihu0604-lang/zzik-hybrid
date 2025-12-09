/**
 * useConfetti Hook
 *
 * Handles confetti animation logic extracted from CelebrationModal, ProgressBar, etc.
 * Uses canvas-confetti for performance-optimized particle animations.
 */

import { useCallback, useRef, useEffect } from 'react';

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
  colors?: string[];
  origin?: { x: number; y: number };
  scalar?: number;
  gravity?: number;
  ticks?: number;
  shapes?: ('circle' | 'square')[];
}

interface UseConfettiReturn {
  fire: (options?: ConfettiOptions) => void;
  fireMultiple: (bursts: number, interval?: number, options?: ConfettiOptions) => void;
  celebrationBurst: () => void;
  cleanup: () => void;
}

// ZZIK brand colors for confetti
const ZZIK_CONFETTI_COLORS = [
  '#FF6B5B', // Flame Coral
  '#CC4A3A', // Deep Ember
  '#FFD93D', // Spark Yellow
  '#22c55e', // Success Green
  '#f5f5f5', // White
];

/**
 * Custom hook for confetti animations
 * Provides reusable confetti effects across the app
 */
export function useConfetti(): UseConfettiReturn {
  const animationFrameRef = useRef<number | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  /**
   * Fire a single confetti burst
   */
  const fire = useCallback((options: ConfettiOptions = {}) => {
    const {
      particleCount = 50,
      spread = 70,
      startVelocity = 30,
      colors = ZZIK_CONFETTI_COLORS,
      origin = { x: 0.5, y: 0.5 },
      scalar = 1,
      gravity = 1,
      ticks = 200,
      shapes = ['circle', 'square'],
    } = options;

    // Create canvas-based confetti without external library
    createConfettiParticles({
      particleCount,
      spread,
      startVelocity,
      colors,
      origin,
      scalar,
      gravity,
      ticks,
      shapes,
    });
  }, []);

  /**
   * Fire multiple confetti bursts with intervals
   */
  const fireMultiple = useCallback(
    (bursts: number, interval: number = 200, options: ConfettiOptions = {}) => {
      for (let i = 0; i < bursts; i++) {
        const timeout = setTimeout(() => {
          fire({
            ...options,
            particleCount: (options.particleCount || 50) * (1 - (i / bursts) * 0.3),
          });
        }, i * interval);
        timeoutsRef.current.push(timeout);
      }
    },
    [fire]
  );

  /**
   * ZZIK celebration burst - optimized for goal completion
   */
  const celebrationBurst = useCallback(() => {
    // Center burst
    fire({
      particleCount: 100,
      spread: 100,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.6 },
    });

    // Side bursts with delay
    const leftTimeout = setTimeout(() => {
      fire({
        particleCount: 50,
        spread: 60,
        startVelocity: 35,
        origin: { x: 0.2, y: 0.7 },
      });
    }, 150);
    timeoutsRef.current.push(leftTimeout);

    const rightTimeout = setTimeout(() => {
      fire({
        particleCount: 50,
        spread: 60,
        startVelocity: 35,
        origin: { x: 0.8, y: 0.7 },
      });
    }, 300);
    timeoutsRef.current.push(rightTimeout);
  }, [fire]);

  /**
   * Cleanup all animations
   */
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  return {
    fire,
    fireMultiple,
    celebrationBurst,
    cleanup,
  };
}

// ============================================================================
// CONFETTI PARTICLE SYSTEM (Lightweight implementation)
// ============================================================================

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  size: number;
  shape: 'circle' | 'square';
  life: number;
  maxLife: number;
  gravity: number;
}

interface ParticleOptions {
  particleCount: number;
  spread: number;
  startVelocity: number;
  colors: string[];
  origin: { x: number; y: number };
  scalar: number;
  gravity: number;
  ticks: number;
  shapes: ('circle' | 'square')[];
}

function createConfettiParticles(options: ParticleOptions) {
  // Check if we're in browser
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  // Find or create canvas
  let canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement | null;

  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set canvas size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Create particles
  const particles: Particle[] = [];
  const originX = options.origin.x * canvas.width;
  const originY = options.origin.y * canvas.height;

  for (let i = 0; i < options.particleCount; i++) {
    const angle = (Math.random() - 0.5) * options.spread * (Math.PI / 180);
    const velocity = options.startVelocity * (0.7 + Math.random() * 0.6);

    particles.push({
      x: originX,
      y: originY,
      vx: Math.sin(angle) * velocity,
      vy: -Math.cos(angle) * velocity - Math.random() * 5,
      color: options.colors[Math.floor(Math.random() * options.colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      size: (5 + Math.random() * 5) * options.scalar,
      shape: options.shapes[Math.floor(Math.random() * options.shapes.length)],
      life: 0,
      maxLife: options.ticks,
      gravity: options.gravity * 0.3,
    });
  }

  // Animation loop
  let animationFrame: number;

  function animate() {
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let aliveCount = 0;

    for (const particle of particles) {
      if (particle.life >= particle.maxLife) continue;

      aliveCount++;
      particle.life++;

      // Physics
      particle.vy += particle.gravity;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.99;
      particle.rotation += particle.rotationSpeed;

      // Fade out
      const alpha = 1 - particle.life / particle.maxLife;

      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate((particle.rotation * Math.PI) / 180);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;

      if (particle.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
      }

      ctx.restore();
    }

    if (aliveCount > 0) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      // Cleanup canvas when done
      canvas.remove();
    }
  }

  animationFrame = requestAnimationFrame(animate);

  // Ensure cleanup after max duration
  setTimeout(() => {
    cancelAnimationFrame(animationFrame);
    canvas?.remove();
  }, options.ticks * 20);
}

export default useConfetti;
