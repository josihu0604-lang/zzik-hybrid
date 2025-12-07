'use client';

import { motion } from 'framer-motion';
import { AnimatedCounter } from './animated-counter';

interface StatCardProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  color?: 'white' | 'orange' | 'success' | 'error';
  delay?: number;
  format?: (n: number) => string;
}

const colorMap = {
  white: 'text-white',
  orange: 'text-linear-orange',
  success: 'text-green-400',
  error: 'text-red-400',
};

export function StatCard({
  value,
  suffix,
  prefix,
  label,
  color = 'white',
  delay = 0,
  format,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card rounded-2xl p-4"
    >
      <p className={`text-2xl font-bold font-outfit ${colorMap[color]}`}>
        <AnimatedCounter value={value} suffix={suffix} prefix={prefix} format={format} />
      </p>
      <p className="text-white/50 text-xs mt-1">{label}</p>
    </motion.div>
  );
}
