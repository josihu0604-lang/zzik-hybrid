'use client';

import { useState, useRef, useEffect } from 'react';
import { m } from 'framer-motion';

/**
 * FakeGlobe - Performance Optimized Globe Visualization
 * 
 * Uses pre-rendered video loop instead of Three.js to ensure 60fps on low-end devices.
 * Overlays HTML/CSS dots for interactivity.
 */

export function FakeGlobe() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fallback for low-power mode
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked or low-power mode
        console.warn('Video autoplay blocked');
      });
    }
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      {/* 1. Gradient Background (Base Layer) */}
      <div className="absolute inset-0 bg-gradient-to-b from-space-950 via-[#0a0a1a] to-black opacity-90 z-10" />

      {/* 2. Video Loop (The "3D" Globe) */}
      {/* Note: Replace 'globe_loop.mp4' with actual asset path */}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          isLoaded ? 'opacity-60' : 'opacity-0'
        }`}
        loop
        muted
        playsInline
        autoPlay
        onLoadedData={() => setIsLoaded(true)}
        poster="/assets/globe_poster.jpg" // Fallback image
      >
        {/* Using a placeholder solid color for now until asset is provided */}
        <source src="/assets/globe_loop.mp4" type="video/mp4" />
      </video>

      {/* 3. CSS Overlay Dots (Fake Live Data) */}
      {/* These dots simulate "Live Mining" activity */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <m.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-flame-500 shadow-[0_0_10px_#FF4500]"
            initial={{ 
              x: `${20 + Math.random() * 60}%`, 
              y: `${30 + Math.random() * 40}%`, 
              opacity: 0,
              scale: 0
            }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* 4. Grid Overlay (Cyberpunk Feel) */}
      <div 
        className="absolute inset-0 z-10 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  );
}
