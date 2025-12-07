'use client';

import { motion } from 'framer-motion';
import { Sparkles, Globe, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/i18n';

/**
 * GlobalHero - K-POP VIP Experience Hero Section
 *
 * Rebranded hero for global market expansion
 * - Dynamic headline based on locale
 * - Market indicators (Thailand, Indonesia, Philippines, Kazakhstan)
 * - Premium VIP experience positioning
 */

interface GlobalHeroProps {
  onGetStarted?: () => void;
}

export function GlobalHero({ onGetStarted }: GlobalHeroProps) {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-flame-500/10 via-transparent to-transparent" />

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-flame-400/30"
            initial={{
              x: Math.random() * 100 + '%',
              y: '100%',
              opacity: 0
            }}
            animate={{
              y: '-20%',
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'linear'
            }}
          />
        ))}
      </div>

      <div className="relative px-5 pt-8 pb-6">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                     bg-spark-500/10 border border-spark-500/20 mb-4"
        >
          <Sparkles size={12} className="text-spark-400" />
          <span className="text-xs font-medium text-spark-400">VIP Experience</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight"
        >
          {t('hero.headline')}
        </motion.h1>

        {/* Subheadline - Experience Types */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-flame-400 font-medium mb-3"
        >
          {t('hero.subheadline')}
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-white/60 mb-5 max-w-sm"
        >
          {t('hero.description')}
        </motion.p>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={onGetStarted}
          className="group flex items-center gap-2 px-5 py-2.5 rounded-full
                     bg-gradient-to-r from-flame-500 to-ember-500
                     text-white text-sm font-semibold
                     shadow-lg shadow-flame-500/25
                     hover:shadow-xl hover:shadow-flame-500/30
                     transition-all duration-300"
        >
          {t('hero.cta')}
          <ChevronRight
            size={16}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </motion.button>

        {/* Market Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-2 mt-5 text-xs text-white/40"
        >
          <Globe size={12} />
          <span>{t('hero.markets')}</span>
        </motion.div>

        {/* Price Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-2 text-xs text-white/30"
        >
          {t('hero.fromPrice')}
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-space-950 to-transparent" />
    </section>
  );
}
