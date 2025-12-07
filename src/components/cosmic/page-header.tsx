'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  action?: React.ReactNode;
  sticky?: boolean;
}

export function PageHeader({ title, subtitle, backHref, action, sticky = true }: PageHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${sticky ? 'sticky top-0 z-50' : ''} bg-space-950/80 backdrop-blur-xl border-b border-white/5`}
    >
      <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <svg
              className="w-5 h-5 text-white/70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-semibold font-outfit truncate">{title}</h1>
          {subtitle && <p className="text-white/50 text-sm truncate">{subtitle}</p>}
        </div>
        {action}
      </div>
    </motion.header>
  );
}
