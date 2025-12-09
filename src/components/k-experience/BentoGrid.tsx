// src/components/k-experience/BentoGrid.tsx

'use client';

import { m } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/LanguageProvider';

interface KExperienceCategory {
  id: string;
  translationKey: string;
  icon: string;
  color: string;
  count: number;
  featured?: boolean;
}

const categories: KExperienceCategory[] = [
  { id: 'kpop', translationKey: 'kexperience.categories.kpop', icon: '🎤', color: 'from-pink-500 to-purple-600', count: 234, featured: true },
  { id: 'kdrama', translationKey: 'kexperience.categories.kdrama', icon: '🎬', color: 'from-blue-500 to-cyan-600', count: 156 },
  { id: 'kbeauty', translationKey: 'kexperience.categories.kbeauty', icon: '💄', color: 'from-rose-400 to-pink-500', count: 189 },
  { id: 'kfood', translationKey: 'kexperience.categories.kfood', icon: '🍜', color: 'from-orange-400 to-red-500', count: 312 },
  { id: 'kfashion', translationKey: 'kexperience.categories.kfashion', icon: '👗', color: 'from-violet-500 to-purple-600', count: 98 },
];

export function KExperienceBentoGrid() {
  const { t } = useTranslation();

  return (
    <section className="py-8">
      {/* Section Header */}
      <div className="px-4 mb-6">
        <h2 className="text-2xl font-bold text-white">
          {t('kexperience.title')}
        </h2>
        <p className="text-white/70 mt-1">
          {t('kexperience.subtitle')}
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
        {categories.map((category, index) => (
          <m.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'relative overflow-hidden rounded-3xl cursor-pointer',
              'bg-gradient-to-br',
              category.color,
              category.featured ? 'col-span-2 row-span-2' : 'col-span-1',
              // iOS 26 Liquid Glass
              'backdrop-blur-xl',
              'border border-white/20',
              'shadow-xl shadow-black/10',
              // Hover effect
              'transition-transform duration-300',
              'hover:scale-[1.02] active:scale-[0.98]',
            )}
          >
            {/* Liquid Glass Overlay */}
            <div className="absolute inset-0 bg-white/10 backdrop-saturate-150" />
            
            <div className="relative p-6 h-full flex flex-col justify-between min-h-[140px]">
              {/* Icon */}
              <span className={cn(
                'text-4xl',
                category.featured && 'text-6xl'
              )}>
                {category.icon}
              </span>
              
              {/* Content */}
              <div>
                <h3 className={cn(
                  'font-bold text-white',
                  category.featured ? 'text-2xl' : 'text-lg'
                )}>
                  {t(category.translationKey)}
                </h3>
                <p className="text-white/80 text-sm mt-1">
                  {category.count} {t('kexperience.experiences')}
                </p>
              </div>
              
              {/* Featured Badge */}
              {category.featured && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                  <span className="text-xs font-medium text-white">
                    {t('kexperience.featured')}
                  </span>
                </div>
              )}
            </div>
            
            {/* Interactive Ripple Effect */}
            <m.div
              className="absolute inset-0 bg-white/20 pointer-events-none"
              initial={{ scale: 0, opacity: 0 }}
              whileTap={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          </m.div>
        ))}
      </div>
    </section>
  );
}

/**
 * K-Experience Category Card (Standalone)
 */
interface CategoryCardProps {
  id: string;
  title: string;
  icon: string;
  color: string;
  count: number;
  featured?: boolean;
  verified?: boolean;
  onClick?: () => void;
}

export function KExperienceCategoryCard({
  id,
  title,
  icon,
  color,
  count,
  featured = false,
  verified = false,
  onClick,
}: CategoryCardProps) {
  const { t } = useTranslation();

  return (
    <m.div
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative overflow-hidden rounded-3xl cursor-pointer',
        'bg-gradient-to-br',
        color,
        featured ? 'col-span-2 row-span-2' : 'col-span-1',
        'backdrop-blur-xl',
        'border border-white/20',
        'shadow-xl shadow-black/10',
      )}
    >
      <div className="absolute inset-0 bg-white/10 backdrop-saturate-150" />
      
      <div className="relative p-6 h-full flex flex-col justify-between min-h-[140px]">
        <span className={cn('text-4xl', featured && 'text-6xl')}>
          {icon}
        </span>
        
        <div>
          <h3 className={cn(
            'font-bold text-white',
            featured ? 'text-2xl' : 'text-lg'
          )}>
            {title}
          </h3>
          <p className="text-white/80 text-sm mt-1">
            {count} {t('kexperience.experiences')}
          </p>
        </div>
        
        {/* Badges */}
        <div className="absolute top-4 right-4 flex gap-2">
          {featured && (
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium text-white">
              {t('kexperience.featured')}
            </span>
          )}
          {verified && (
            <span className="px-3 py-1 rounded-full bg-green-500/20 backdrop-blur-sm text-xs font-medium text-green-300">
              ✓ {t('kexperience.verified')}
            </span>
          )}
        </div>
      </div>
    </m.div>
  );
}

export default KExperienceBentoGrid;
