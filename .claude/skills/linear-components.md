---
name: linear-components
description: ZZIK Linear Deep Space + Orange Point 디자인 시스템 컴포넌트
---

# Linear Components Skill

## Design Tokens

### Colors (CSS Variables)
```css
/* Space Backgrounds (Linear Deep Space) */
--linear-bg: #08090A;
--linear-bg-subtle: #0C0E10;
--linear-bg-muted: #121315;

/* Brand Color (Orange Point) */
--linear-orange: #ea8c15;
--linear-orange-hover: #f5a623;
--linear-orange-subtle: rgba(234, 140, 21, 0.15);
--linear-orange-border: rgba(234, 140, 21, 0.2);

/* Text Colors */
--linear-text-primary: rgba(255, 255, 255, 0.95);
--linear-text-secondary: rgba(255, 255, 255, 0.7);
--linear-text-tertiary: rgba(255, 255, 255, 0.5);

/* Glass Effect */
--glass-bg: linear-gradient(135deg, rgba(18, 19, 20, 0.9) 0%, rgba(8, 9, 10, 0.95) 100%);
--glass-border: 1px solid rgba(255, 255, 255, 0.06);
--glass-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.06);

/* Status Colors */
--linear-success: #22c55e;
--linear-warning: #f59e0b;
--linear-error: #ef4444;
```

## Component Templates

### 1. Primary Button (Orange CTA)
```tsx
import { motion } from 'framer-motion';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function PrimaryButton({ children, onClick, disabled, loading }: PrimaryButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(234, 140, 21, 0.3)' }}
      whileTap={{ scale: 0.98 }}
      disabled={disabled || loading}
      onClick={onClick}
      className="w-full py-4 px-6 rounded-xl font-semibold text-white relative overflow-hidden disabled:opacity-50"
      style={{
        background: 'linear-gradient(135deg, #ea8c15 0%, #f5a623 100%)',
        boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)' }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        )}
        {children}
      </span>
    </motion.button>
  );
}
```

### 2. Glass Card
```tsx
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  orangeAccent?: boolean;
}

export function GlassCard({ children, className = '', hover = true, orangeAccent = false }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.01, y: -2 } : undefined}
      className={`relative rounded-2xl p-5 overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(18, 19, 20, 0.9) 0%, rgba(8, 9, 10, 0.95) 100%)',
        backdropFilter: 'blur(40px)',
        border: orangeAccent
          ? '1px solid rgba(234, 140, 21, 0.2)'
          : '1px solid rgba(255, 255, 255, 0.06)',
        boxShadow: orangeAccent
          ? '0 0 30px rgba(234, 140, 21, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)'
          : 'inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1/3 rounded-t-2xl pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)' }}
      />
      {children}
    </motion.div>
  );
}
```

### 3. Linear Input
```tsx
'use client';
import { useState, forwardRef } from 'react';

interface LinearInputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  label?: string;
}

export const LinearInput = forwardRef<HTMLInputElement, LinearInputProps>(
  ({ type = 'text', placeholder, value, onChange, error, label }, ref) => {
    const [focused, setFocused] = useState(false);

    return (
      <div className="space-y-2">
        {label && <label className="text-sm text-white/60">{label}</label>}
        <div className={`relative rounded-xl transition-all duration-300 ${
          focused ? 'ring-2 ring-[#ea8c15]/50' : ''
        } ${error ? 'ring-2 ring-red-500/50' : ''}`}>
          <input
            ref={ref}
            type={type}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none transition-colors"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);
```

### 4. Orange Badge
```tsx
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'orange' | 'success' | 'warning' | 'error' | 'neutral';
}

const variantStyles = {
  orange: 'bg-[#ea8c15]/15 text-[#ea8c15] border-[#ea8c15]/20',
  success: 'bg-green-500/15 text-green-500 border-green-500/20',
  warning: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/20',
  error: 'bg-red-500/15 text-red-500 border-red-500/20',
  neutral: 'bg-white/10 text-white/70 border-white/10',
};

export function Badge({ children, variant = 'orange' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${variantStyles[variant]}`}>
      {children}
    </span>
  );
}
```

### 5. Floating Orb (Orange)
```tsx
import { motion } from 'framer-motion';

interface FloatingOrbProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  delay?: number;
}

const sizeMap = {
  sm: 'w-32 h-32',
  md: 'w-48 h-48',
  lg: 'w-64 h-64',
};

export function FloatingOrb({ size = 'lg', className = '', delay = 0 }: FloatingOrbProps) {
  return (
    <motion.div
      animate={{
        opacity: [0.2, 0.4, 0.2],
        scale: [1, 1.15, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
      className={`absolute rounded-full pointer-events-none ${sizeMap[size]} ${className}`}
      style={{
        background: 'radial-gradient(circle, rgba(234, 140, 21, 0.15) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }}
    />
  );
}
```

### 6. Loading Spinner
```tsx
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      className={`border-2 rounded-full ${sizeMap[size]}`}
      style={{
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderTopColor: '#ea8c15',
      }}
    />
  );
}
```

### 7. Verification Score Display
```tsx
import { motion } from 'framer-motion';

interface VerificationScoreProps {
  score: number; // 0-100
  label?: string;
}

export function VerificationScore({ score, label }: VerificationScoreProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90">
          <circle
            cx="32" cy="32" r="28"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="4"
          />
          <motion.circle
            cx="32" cy="32" r="28"
            fill="none"
            stroke="#ea8c15"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={175.93}
            initial={{ strokeDashoffset: 175.93 }}
            animate={{ strokeDashoffset: 175.93 * (1 - score / 100) }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">{score}%</span>
        </div>
      </div>
      {label && <span className="text-white/60 text-sm">{label}</span>}
    </div>
  );
}
```

## Page Layout Template
```tsx
import { FloatingOrb } from '@/components/linear/floating-orb';

export function LinearLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#08090A' }}>
      {/* Background Orbs */}
      <FloatingOrb className="-top-20 -right-20" />
      <FloatingOrb size="md" className="top-1/2 -left-20" delay={3} />

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
}
```

## Usage Rules
1. **Orange (#ea8c15)** as primary accent - NEVER use coral/cyan/violet
2. **Dark Mode ONLY** - No light theme
3. **Glass morphism** for elevated surfaces
4. **Subtle animations** - Not flashy
5. **44x44px minimum** touch targets
