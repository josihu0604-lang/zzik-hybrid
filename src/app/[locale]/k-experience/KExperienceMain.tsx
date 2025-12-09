// src/app/[locale]/k-experience/KExperienceMain.tsx
// K-Experience 메인 페이지 클라이언트 컴포넌트

'use client';

import { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/LanguageProvider';
import { 
  KExperienceBentoGrid, 
  ExperienceList, 
  ExperienceCard,
  type KExperience 
} from '@/components/k-experience';

interface KExperienceMainProps {
  locale: string;
}

// Placeholder image URL for demo mode
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop';

// Category-specific placeholder images
const CATEGORY_PLACEHOLDERS: Record<string, string> = {
  kpop: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop',
  kdrama: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=600&fit=crop',
  kbeauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop',
  kfood: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&h=600&fit=crop',
  kfashion: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=600&fit=crop',
};

// Mock 데이터 (실제로는 API에서 가져옴)
const FEATURED_EXPERIENCES: KExperience[] = [
  {
    id: 'exp-1',
    category: 'kpop',
    title: 'BTS 성지순례 투어',
    description: 'BTS의 뮤직비디오 촬영지와 멤버들의 추천 맛집을 방문하는 프리미엄 투어',
    thumbnail: CATEGORY_PLACEHOLDERS.kpop,
    images: [],
    location: { name: '서울 용산구', address: '서울특별시 용산구' },
    pricing: { currency: 'KRW', amount: 89000, originalAmount: 120000, discountPercent: 26 },
    rating: 4.9,
    reviewCount: 1234,
    tags: ['BTS', 'ARMY', '성지순례'],
    verified: true,
    featured: true,
    availableSlots: 12,
    duration: '4시간',
    language: ['ko', 'en', 'ja'],
  },
  {
    id: 'exp-2',
    category: 'kdrama',
    title: '도깨비 촬영지 투어',
    description: '드라마 도깨비의 주요 촬영 장소를 방문하는 로맨틱 투어',
    thumbnail: CATEGORY_PLACEHOLDERS.kdrama,
    images: [],
    location: { name: '강원도 강릉', address: '강원도 강릉시' },
    pricing: { currency: 'KRW', amount: 65000 },
    rating: 4.7,
    reviewCount: 856,
    tags: ['도깨비', 'K-Drama', '강릉'],
    verified: true,
    featured: false,
    availableSlots: 8,
    duration: '6시간',
    language: ['ko', 'en'],
  },
  {
    id: 'exp-3',
    category: 'kbeauty',
    title: '강남 K-뷰티 마스터클래스',
    description: '전문 메이크업 아티스트에게 배우는 K-뷰티 메이크업 클래스',
    thumbnail: CATEGORY_PLACEHOLDERS.kbeauty,
    images: [],
    location: { name: '서울 강남구', address: '서울특별시 강남구 신사동' },
    pricing: { currency: 'KRW', amount: 150000, originalAmount: 200000, discountPercent: 25 },
    rating: 4.8,
    reviewCount: 423,
    tags: ['K-뷰티', '메이크업', '강남'],
    verified: true,
    featured: false,
    availableSlots: 6,
    duration: '3시간',
    language: ['ko', 'en', 'zh'],
  },
  {
    id: 'exp-4',
    category: 'kfood',
    title: '전통 한식 쿠킹클래스',
    description: '비빔밥, 김치찌개 등 정통 한식을 배우는 요리 클래스',
    thumbnail: CATEGORY_PLACEHOLDERS.kfood,
    images: [],
    location: { name: '서울 종로구', address: '서울특별시 종로구 인사동' },
    pricing: { currency: 'KRW', amount: 75000 },
    rating: 4.9,
    reviewCount: 2156,
    tags: ['한식', '쿠킹클래스', '인사동'],
    verified: true,
    featured: false,
    availableSlots: 10,
    duration: '2시간 30분',
    language: ['ko', 'en', 'ja', 'zh'],
  },
  {
    id: 'exp-5',
    category: 'kfashion',
    title: '한복 체험 & 경복궁 투어',
    description: '고급 한복을 입고 경복궁을 자유롭게 관람하는 체험',
    thumbnail: CATEGORY_PLACEHOLDERS.kfashion,
    images: [],
    location: { name: '서울 종로구', address: '서울특별시 종로구 경복궁' },
    pricing: { currency: 'KRW', amount: 45000, originalAmount: 60000, discountPercent: 25 },
    rating: 4.6,
    reviewCount: 3421,
    tags: ['한복', '경복궁', '전통'],
    verified: true,
    featured: false,
    availableSlots: 50,
    duration: '4시간',
    language: ['ko', 'en', 'ja', 'zh'],
  },
  {
    id: 'exp-6',
    category: 'kpop',
    title: 'BLACKPINK 댄스 워크샵',
    description: '전문 안무가에게 배우는 블랙핑크 댄스 커버 클래스',
    thumbnail: CATEGORY_PLACEHOLDERS.kpop,
    images: [],
    location: { name: '서울 마포구', address: '서울특별시 마포구 홍대' },
    pricing: { currency: 'KRW', amount: 55000 },
    rating: 4.8,
    reviewCount: 678,
    tags: ['BLACKPINK', 'K-POP', '댄스'],
    verified: true,
    featured: false,
    availableSlots: 15,
    duration: '2시간',
    language: ['ko', 'en'],
  },
];

export function KExperienceMain({ locale }: KExperienceMainProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [experiences, setExperiences] = useState<KExperience[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // API 호출 시뮬레이션
    const fetchExperiences = async () => {
      setIsLoading(true);
      // 실제로는 API 호출
      await new Promise((resolve) => setTimeout(resolve, 500));
      setExperiences(FEATURED_EXPERIENCES);
      setIsLoading(false);
    };

    fetchExperiences();
  }, [locale]);

  const featuredExperience = experiences.find((exp) => exp.featured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      {/* Hero Section */}
      <section className="relative py-16 px-4">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="text-6xl mb-4 block">🇰🇷</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('kexperience.title')}
          </h1>
          <p className="text-xl text-white/70 mb-8">
            {t('kexperience.subtitle')}
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder={t('kexperience.searchPlaceholder')}
              className={cn(
                'w-full px-6 py-4 rounded-2xl',
                'bg-white/10 backdrop-blur-xl',
                'border border-white/20',
                'text-white placeholder-white/50',
                'focus:outline-none focus:ring-2 focus:ring-white/30',
                'text-lg'
              )}
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
              🔍
            </button>
          </div>
        </m.div>
      </section>

      {/* Category BentoGrid */}
      <KExperienceBentoGrid />

      {/* Featured Experience */}
      {featuredExperience && (
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6 px-4">
              ⭐ {t('kexperience.featuredExperience')}
            </h2>
            <ExperienceCard
              experience={featuredExperience}
              variant="featured"
            />
          </div>
        </section>
      )}

      {/* All Experiences */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto">
          <ExperienceList
            experiences={experiences.filter((exp) => !exp.featured)}
            loading={isLoading}
            title={t('kexperience.allExperiences')}
            subtitle={t('kexperience.discoverMore')}
            showFilters={true}
            showSort={true}
            showViewToggle={true}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <m.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className={cn(
            'max-w-4xl mx-auto p-8 md:p-12 rounded-3xl',
            'bg-gradient-to-br from-purple-600 to-pink-600',
            'text-center'
          )}
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            {t('kexperience.ctaTitle')}
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            {t('kexperience.ctaDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <m.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-xl bg-white text-purple-600 font-semibold shadow-lg"
            >
              {t('kexperience.becomePartner')}
            </m.button>
            <m.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-xl bg-white/20 text-white font-semibold backdrop-blur-sm"
            >
              {t('common.learnMore')}
            </m.button>
          </div>
        </m.div>
      </section>
    </div>
  );
}

export default KExperienceMain;
