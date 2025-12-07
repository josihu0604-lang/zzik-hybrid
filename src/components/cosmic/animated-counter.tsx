'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  format?: (n: number) => string;
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 2,
  format,
}: AnimatedCounterProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, { duration, ease: 'easeOut' });
    const unsubscribe = rounded.on('change', (v) => setDisplayValue(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [count, rounded, value, duration]);

  const formatted = format ? format(displayValue) : displayValue.toLocaleString();

  return (
    <motion.span className="tabular-nums">
      {prefix}
      {formatted}
      {suffix}
    </motion.span>
  );
}
