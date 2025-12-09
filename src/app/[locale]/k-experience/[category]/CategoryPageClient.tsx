// src/app/[locale]/k-experience/[category]/CategoryPageClient.tsx
// K-Experience 카테고리 페이지 클라이언트 컴포넌트

'use client';

import { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/LanguageProvider';
import { ExperienceList, type KExperience } from '@/components/k-experience';

// 카테고리 설정
const CATEGORY_CONFIG: Record<string, {
  icon: string;
  gradient: string;
  bgImage: string;
}> = {
  kpop: {
    icon: '🎤',
    gradient: 'from-pink-500 to-purple-600',
    bgImage: '/images/categories/kpop-bg.jpg',
  },
  kdrama: {
    icon: '🎬',
    gradient: 'from-blue-500 to-cyan-600',
    bgImage: '/images/categories/kdrama-bg.jpg',
  },
  kbeauty: {
    icon: '💄',
    gradient: 'from-rose-400 to-pink-500',
    bgImage: '/images/categories/kbeauty-bg.jpg',
  },
  kfood: {
    icon: '🍜',
    gradient: 'from-orange-400 to-red-500',
    bgImage: '/images/categories/kfood-bg.jpg',
  },
  kfashion: {
    icon: '👗',
    gradient: 'from-violet-500 to-purple-600',
    bgImage: '/images/categories/kfashion-bg.jpg',
  },
};

// 하위 카테고리 필터
const SUB_CATEGORIES: Record<string, string[]> = {
  kpop: ['fanmeeting', 'concert', 'dance', 'vocal', 'tour'],
  kdrama: ['filmingLocation', 'actorMeet', 'workshop', 'tour'],
  kbeauty: ['makeup', 'skincare', 'hairStyling', 'nailArt'],
  kfood: ['cookingClass', 'foodTour', 'market', 'restaurant'],
  kfashion: ['hanbok', 'styling', 'shopping', 'designer'],
};

interface CategoryPageClientProps {
  locale: string;
  category: string;
  page: number;
  sort: string;
  tag?: string;
}

// Mock 데이터 생성 함수 (API 연동으로 대체됨)
// function generateMockExperiences(category: string): KExperience[] { ... }

export function CategoryPageClient({
  locale,
  category,
  page,
  sort,
  tag,
}: CategoryPageClientProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [experiences, setExperiences] = useState<KExperience[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(tag || null);

  const config = CATEGORY_CONFIG[category];
  const subCategories = SUB_CATEGORIES[category] || [];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchExperiences = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams({
          category,
          locale,
          sort,
          limit: '20',
          offset: ((page - 1) * 20).toString(),
        });

        if (selectedSubCategory) {
          // Note: The API currently filters by category (kpop, etc.) not sub-tags,
          // but we can add tag filtering if needed. 
          // For now, client-side filtering is handled in ExperienceList if needed,
          // or we can pass it to API if API supports 'tag' param.
          // The current API mock implementation doesn't support 'tag' param,
          // so we rely on client-side filtering or update API.
          // Let's assume the API returns items for the category, and we filter client-side 
          // or just display what we get.
        }

        const response = await fetch(`/api/k-experience?${queryParams.toString()}`);
        const data = await response.json();

        if (data.success) {
          setExperiences(data.data.experiences);
        } else {
          console.error('Failed to fetch experiences:', data.error);
        }
      } catch (error) {
        console.error('Error fetching experiences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperiences();
  }, [category, page, sort, locale, selectedSubCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      {/* Hero Section */}
      <section className={cn(
        'relative py-20 px-4',
        'bg-gradient-to-br',
        config.gradient
      )}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        </div>

        {/* Breadcrumb */}
        <div className="relative max-w-6xl mx-auto mb-8">
          <nav className="flex items-center gap-2 text-white/70 text-sm">
            <Link href={`/${locale}`} className="hover:text-white transition-colors">
              {t('common.home')}
            </Link>
            <span>/</span>
            <Link href={`/${locale}/k-experience`} className="hover:text-white transition-colors">
              K-Experience
            </Link>
            <span>/</span>
            <span className="text-white">
              {t(`kexperience.categories.${category}`)}
            </span>
          </nav>
        </div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-center max-w-3xl mx-auto"
        >
          <span className="text-7xl mb-6 block">{config.icon}</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t(`kexperience.categories.${category}`)}
          </h1>
          <p className="text-xl text-white/80 mb-8">
            {t(`kexperience.categoryDescriptions.${category}`)}
          </p>

          {/* Sub-category Filters */}
          {subCategories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setSelectedSubCategory(null)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  selectedSubCategory === null
                    ? 'bg-white text-gray-900'
                    : 'bg-white/20 text-white hover:bg-white/30'
                )}
              >
                {t('common.all')}
              </button>
              {subCategories.map((subCat) => (
                <button
                  key={subCat}
                  onClick={() => setSelectedSubCategory(subCat)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all',
                    selectedSubCategory === subCat
                      ? 'bg-white text-gray-900'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  )}
                >
                  {t(`kexperience.subCategories.${subCat}`)}
                </button>
              ))}
            </div>
          )}
        </m.div>
      </section>

      {/* Stats Section */}
      <section className="py-8 px-4 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{experiences.length}+</p>
            <p className="text-white/60 text-sm">{t('kexperience.totalExperiences')}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">4.8</p>
            <p className="text-white/60 text-sm">{t('kexperience.averageRating')}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">50K+</p>
            <p className="text-white/60 text-sm">{t('kexperience.happyCustomers')}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">100+</p>
            <p className="text-white/60 text-sm">{t('kexperience.verifiedPartners')}</p>
          </div>
        </div>
      </section>

      {/* Experience List */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto">
          <ExperienceList
            experiences={experiences}
            loading={isLoading}
            showFilters={true}
            showSort={true}
            showViewToggle={true}
          />
        </div>
      </section>

      {/* Related Categories */}
      <section className="py-12 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">
            {t('kexperience.relatedCategories')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(CATEGORY_CONFIG)
              .filter(([key]) => key !== category)
              .map(([key, catConfig]) => (
                <Link
                  key={key}
                  href={`/${locale}/k-experience/${key}`}
                  className={cn(
                    'p-6 rounded-2xl text-center',
                    'bg-gradient-to-br',
                    catConfig.gradient,
                    'hover:scale-105 transition-transform'
                  )}
                >
                  <span className="text-4xl block mb-2">{catConfig.icon}</span>
                  <span className="text-white font-medium">
                    {t(`kexperience.categories.${key}`)}
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <m.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className={cn(
            'max-w-4xl mx-auto p-8 md:p-12 rounded-3xl text-center',
            'bg-gradient-to-br',
            config.gradient
          )}
        >
          <span className="text-5xl block mb-4">{config.icon}</span>
          <h2 className="text-3xl font-bold text-white mb-4">
            {t('kexperience.categoryCtaTitle', { category: t(`kexperience.categories.${category}`) })}
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            {t('kexperience.categoryCtaDescription')}
          </p>
          <m.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-xl bg-white text-gray-900 font-semibold shadow-lg"
          >
            {t('kexperience.subscribeUpdates')}
          </m.button>
        </m.div>
      </section>
    </div>
  );
}

export default CategoryPageClient;
