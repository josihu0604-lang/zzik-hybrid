---
name: framer-animations
description: ZZIK Framer Motion 애니메이션 패턴. Progress Temperature, Heat Pulse, Confetti.
---

# Framer Motion Patterns for ZZIK

## Core Principles

```yaml
Philosophy: "Purposeful Motion"
- Every animation serves a purpose
- Subtle over dramatic
- Performance-conscious
- Consistent timing

Timing:
  micro: 150ms    # Hover, focus
  fast: 200ms     # Toggles, small changes
  normal: 300ms   # Page transitions, modals
  slow: 500ms     # Complex sequences
```

## Page Transitions

```tsx
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

<motion.div
  variants={pageVariants}
  initial="initial"
  animate="animate"
  exit="exit"
  transition={{ duration: 0.3, ease: 'easeOut' }}
>
  {children}
</motion.div>;
```

## PopupCard Hover

```tsx
<motion.div
  whileHover={{ y: -2, scale: 1.01 }}
  whileTap={{ scale: 0.99 }}
  transition={{ duration: 0.15 }}
>
  <PopupCard />
</motion.div>
```

## Progress Bar Animation

```tsx
<motion.div
  className="bg-zzik-flame rounded-full h-2"
  initial={{ width: 0 }}
  animate={{ width: `${progress}%` }}
  transition={{ duration: 0.5, ease: 'easeOut' }}
/>
```

## Heat Pulse (마감 임박)

```tsx
// Hot state (70-99%)일 때 적용
const heatPulse = {
  scale: [1, 1.02, 1],
  boxShadow: [
    '0 0 0 rgba(255, 107, 91, 0)', // Flame Coral
    '0 0 20px rgba(255, 107, 91, 0.4)',
    '0 0 0 rgba(255, 107, 91, 0)',
  ],
};

<motion.div
  animate={temperature === 'hot' ? heatPulse : {}}
  transition={{ repeat: Infinity, duration: 1.5 }}
/>;
```

## Participate Button

```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.1 }}
  className="bg-zzik-flame"
>
  참여하기
</motion.button>
```

## Button with Flame Glow

```tsx
<motion.button
  whileHover={{
    scale: 1.02,
    boxShadow: '0 0 30px rgba(255, 107, 91, 0.3)'
  }}
  whileTap={{ scale: 0.98 }}
>
```

## Stagger Children

```tsx
const containerVariants = {
  animate: {
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

<motion.ul variants={containerVariants} animate="animate">
  {popups.map((popup) => (
    <motion.li key={popup.id} variants={itemVariants}>
      <PopupCard popup={popup} />
    </motion.li>
  ))}
</motion.ul>;
```

## Success Celebration

```tsx
import confetti from 'canvas-confetti';

const celebrate = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#FF6B5B', '#FFD93D', '#22c55e'], // Flame, Spark, Success
  });
};

// 목표 달성 시 호출
if (progress >= 100) {
  celebrate();
}
```

## Bottom Sheet

```tsx
const sheetVariants = {
  hidden: { y: '100%' },
  visible: { y: 0 },
};

<motion.div
  variants={sheetVariants}
  initial="hidden"
  animate="visible"
  exit="hidden"
  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
>
  <SheetContent />
</motion.div>;
```

## Loading Spinner

```tsx
<motion.div
  animate={{ rotate: 360 }}
  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
  className="w-5 h-5 border-2 rounded-full"
  style={{
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderTopColor: '#FF6B5B', // Flame Coral
  }}
/>
```

## Floating Flame Orb

```tsx
<motion.div
  animate={{
    opacity: [0.2, 0.4, 0.2],
    scale: [1, 1.15, 1],
  }}
  transition={{
    duration: 8,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
  className="absolute w-64 h-64 rounded-full pointer-events-none"
  style={{
    background: 'radial-gradient(circle, rgba(255, 107, 91, 0.15) 0%, transparent 70%)',
    filter: 'blur(60px)',
  }}
/>
```

## AnimatePresence

```tsx
import { AnimatePresence } from 'framer-motion';

<AnimatePresence mode="wait">
  {isVisible && (
    <motion.div
      key="unique-key"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Content
    </motion.div>
  )}
</AnimatePresence>;
```

## Performance Tips

1. **Prefer `transform`**: GPU accelerated (scale, rotate, translate)
2. **Avoid animating `width/height`**: Use `scale` instead
3. **Use `will-change` sparingly**: Only for known animations
4. **Use `useReducedMotion`**: Respect user preferences

```tsx
import { useReducedMotion } from 'framer-motion';

const prefersReducedMotion = useReducedMotion();
const animation = prefersReducedMotion ? {} : fullAnimation;
```

## Color Reference (ZZIK Brand)

```css
/* Brand Colors - Use for animations */
--zzik-flame: #ff6b5b; /* Primary */
--zzik-ember: #cc4a3a; /* Hover/Deep */
--zzik-spark: #ffd93d; /* Leader/Premium */
--zzik-flame-glow: rgba(255, 107, 91, 0.3);

/* Background */
--zzik-bg: #08090a;
```

## Anti-Patterns

1. Bouncy everything - Reserve spring for intentional playfulness
2. Long durations (> 500ms for UI elements)
3. Multiple animated properties
4. Blocking interactions during animation
