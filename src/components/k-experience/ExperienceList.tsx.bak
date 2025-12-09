// src/components/k-experience/ExperienceList.tsx
// K-Experience 목록 컴포넌트

'use client';

import { useState, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/LanguageProvider';
import { ExperienceCard, ExperienceCardSkeleton, type KExperience } from './ExperienceCard';

type SortOption = 'popular' | 'latest' | 'price-low' | 'price-high' | 'rating';
type ViewMode = 'grid' | 'list';

interface ExperienceListProps {
  experiences: KExperience[];
  loading?: boolean;
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
  showSort?: boolean;
  showViewToggle?: boolean;
  defaultView?: ViewMode;
  emptyMessage?: string;
  className?: string;
}

export function ExperienceList({
  experiences,
  loading = false,
  title,
  subtitle,
  showFilters = true,
  showSort = true,
  showViewToggle = true,
  defaultView = 'grid',
  emptyMessage,
  className,
}: ExperienceListProps) {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // 모든 태그 추출
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    experiences.forEach((exp) => exp.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).slice(0, 10);
  }, [experiences]);

  // 정렬된 체험 목록
  const sortedExperiences = useMemo(() => {
    let filtered = [...experiences];

    // 태그 필터링
    if (selectedTags.length > 0) {
      filtered = filtered.filter((exp) =>
        selectedTags.some((tag) => exp.tags.includes(tag))
      );
    }

    // 정렬
    switch (sortBy) {
      case 'latest':
        filtered.sort((a, b) => {
          if (!a.startDate || !b.startDate) return 0;
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        });
        break;
      case 'price-low':
        filtered.sort((a, b) => a.pricing.amount - b.pricing.amount);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.pricing.amount - a.pricing.amount);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
      default:
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return filtered;
  }, [experiences, sortBy, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        {title && (
          <div className="px-4">
            <div className="h-8 bg-white/10 rounded w-1/3 mb-2 animate-pulse" />
            {subtitle && <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse" />}
          </div>
        )}
        
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4'
            : 'flex flex-col gap-4 px-4'
        )}>
          {[...Array(6)].map((_, i) => (
            <ExperienceCardSkeleton 
              key={i} 
              variant={viewMode === 'grid' ? 'default' : 'horizontal'} 
            />
          ))}
        </div>
      </div>
    );
  }

  // 빈 상태
  if (experiences.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16', className)}>
        <span className="text-6xl mb-4">🔍</span>
        <h3 className="text-xl font-semibold text-white mb-2">
          {emptyMessage || t('kexperience.noExperiences')}
        </h3>
        <p className="text-white/60 text-center max-w-md">
          {t('kexperience.noExperiencesDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      {(title || showSort || showViewToggle) && (
        <div className="px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {title && (
            <div>
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              {subtitle && <p className="text-white/70 mt-1">{subtitle}</p>}
            </div>
          )}

          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            {showSort && (
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className={cn(
                  'px-4 py-2 rounded-xl',
                  'bg-white/10 backdrop-blur-sm',
                  'border border-white/20',
                  'text-white text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-white/30'
                )}
              >
                <option value="popular">{t('sort.popular')}</option>
                <option value="latest">{t('sort.latest')}</option>
                <option value="price-low">{t('sort.priceLow')}</option>
                <option value="price-high">{t('sort.priceHigh')}</option>
                <option value="rating">{t('sort.rating')}</option>
              </select>
            )}

            {/* View Toggle */}
            {showViewToggle && (
              <div className="flex bg-white/10 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm transition-colors',
                    viewMode === 'grid'
                      ? 'bg-white/20 text-white'
                      : 'text-white/60 hover:text-white'
                  )}
                >
                  ⊞
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm transition-colors',
                    viewMode === 'list'
                      ? 'bg-white/20 text-white'
                      : 'text-white/60 hover:text-white'
                  )}
                >
                  ☰
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tag Filters */}
      {showFilters && allTags.length > 0 && (
        <div className="px-4 overflow-x-auto pb-2 -mx-4">
          <div className="flex gap-2 px-4">
            {allTags.map((tag) => (
              <m.button
                key={tag}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleTag(tag)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors',
                  selectedTags.includes(tag)
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                )}
              >
                #{tag}
              </m.button>
            ))}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="px-4 py-2 rounded-full text-sm text-white/60 hover:text-white"
              >
                {t('common.clearAll')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="px-4">
        <p className="text-white/60 text-sm">
          {sortedExperiences.length} {t('kexperience.experiences')}
          {selectedTags.length > 0 && ` (${t('common.filtered')})`}
        </p>
      </div>

      {/* Experience Grid/List */}
      <AnimatePresence mode="wait">
        <m.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            'px-4',
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'flex flex-col gap-4'
          )}
        >
          {sortedExperiences.map((experience, index) => (
            <m.div
              key={experience.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ExperienceCard
                experience={experience}
                variant={viewMode === 'grid' ? 'default' : 'horizontal'}
              />
            </m.div>
          ))}
        </m.div>
      </AnimatePresence>
    </div>
  );
}

export default ExperienceList;
