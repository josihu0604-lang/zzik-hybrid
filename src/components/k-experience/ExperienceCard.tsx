// src/components/k-experience/ExperienceCard.tsx
// K-Experience 개별 체험 카드 컴포넌트

'use client';

import { useState, memo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/LanguageProvider';
import { formatCurrency as formatCurrencyGlobal, type Currency } from '@/lib/global-pricing';
import Image from 'next/image';
import Link from 'next/link';

// 체험 타입 정의
export interface KExperience {
  id: string;
  category: 'kpop' | 'kdrama' | 'kbeauty' | 'kfood' | 'kfashion';
  title: string;
  description: string;
  thumbnail: string;
  images: string[];
  location: {
    name: string;
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  pricing: {
    currency: string;
    amount: number;
    originalAmount?: number;
    discountPercent?: number;
  };
  rating: number;
  reviewCount: number;
  tags: string[];
  verified: boolean;
  featured: boolean;
  availableSlots: number;
  duration: string; // e.g., "2 hours", "3 days"
  language: string[]; // Available languages
  startDate?: string;
  endDate?: string;
}

// 카테고리 색상 맵
const CATEGORY_COLORS: Record<string, string> = {
  kpop: 'from-pink-500 to-purple-600',
  kdrama: 'from-blue-500 to-cyan-600',
  kbeauty: 'from-rose-400 to-pink-500',
  kfood: 'from-orange-400 to-red-500',
  kfashion: 'from-violet-500 to-purple-600',
};

const CATEGORY_ICONS: Record<string, string> = {
  kpop: '🎤',
  kdrama: '🎬',
  kbeauty: '💄',
  kfood: '🍜',
  kfashion: '👗',
};

interface ExperienceCardProps {
  experience: KExperience;
  variant?: 'default' | 'compact' | 'featured' | 'horizontal';
  showActions?: boolean;
  onBookmark?: (id: string) => void;
  onShare?: (id: string) => void;
  className?: string;
}

export function ExperienceCard({
  experience,
  variant = 'default',
  showActions = true,
  onBookmark,
  onShare,
  className,
}: ExperienceCardProps) {
  const { t } = useTranslation();
  
  // Use global pricing formatCurrency for currency-aware formatting
  const formatPrice = (amount: number, currency: string) => {
    return formatCurrencyGlobal(amount, currency as Currency);
  };
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    onBookmark?.(experience.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(experience.id);
  };

  // 할인가 계산
  const displayPrice = experience.pricing.amount;
  const hasDiscount = experience.pricing.discountPercent && experience.pricing.discountPercent > 0;

  // 별점 렌더링
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} className="text-yellow-400">★</span>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} className="text-yellow-400">☆</span>
        );
      } else {
        stars.push(
          <span key={i} className="text-gray-400">☆</span>
        );
      }
    }
    return stars;
  };

  // Featured 변형
  if (variant === 'featured') {
    return (
      <Link href={`/k-experience/${experience.category}/${experience.id}`}>
        <m.article
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'relative overflow-hidden rounded-3xl',
            'bg-gradient-to-br',
            CATEGORY_COLORS[experience.category],
            'backdrop-blur-xl',
            'border border-white/20',
            'shadow-2xl shadow-black/20',
            'col-span-2 row-span-2',
            'min-h-[400px]',
            className
          )}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            {!imageError ? (
              <Image
                src={experience.thumbnail}
                alt={experience.title}
                fill
                className="object-cover opacity-60"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full p-6 flex flex-col justify-between">
            {/* Top Section */}
            <div className="flex justify-between items-start">
              <div className="flex gap-2">
                {experience.verified && (
                  <span className="px-3 py-1 rounded-full bg-green-500/20 backdrop-blur-sm text-xs font-medium text-green-300">
                    ✓ {t('kexperience.verified')}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium text-white">
                  {CATEGORY_ICONS[experience.category]} {t(`kexperience.categories.${experience.category}`)}
                </span>
              </div>
              
              {showActions && (
                <div className="flex gap-2">
                  <button
                    onClick={handleBookmark}
                    className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                  >
                    <span className={isBookmarked ? 'text-red-500' : 'text-white'}>
                      {isBookmarked ? '❤️' : '🤍'}
                    </span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                  >
                    <span>📤</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Section */}
            <div>
              <span className="text-6xl mb-4 block">{CATEGORY_ICONS[experience.category]}</span>
              
              <h3 className="text-2xl font-bold text-white mb-2">
                {experience.title}
              </h3>
              
              <p className="text-white/80 text-sm mb-4 line-clamp-2">
                {experience.description}
              </p>

              {/* Rating & Location */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {renderStars(experience.rating)}
                  <span className="text-white/80 text-sm ml-1">
                    {experience.rating.toFixed(1)} ({experience.reviewCount})
                  </span>
                </div>
                <span className="text-white/60">|</span>
                <span className="text-white/80 text-sm">📍 {experience.location.name}</span>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <div>
                  {hasDiscount && (
                    <span className="text-white/60 line-through text-sm mr-2">
                      {formatPrice(experience.pricing.originalAmount!, experience.pricing.currency)}
                    </span>
                  )}
                  <span className="text-2xl font-bold text-white">
                    {formatPrice(displayPrice, experience.pricing.currency)}
                  </span>
                  {hasDiscount && (
                    <span className="ml-2 px-2 py-1 bg-red-500 rounded-full text-xs text-white">
                      -{experience.pricing.discountPercent}%
                    </span>
                  )}
                </div>
                
                <span className="text-white/60 text-sm">
                  {experience.availableSlots} {t('kexperience.slotsLeft')}
                </span>
              </div>
            </div>
          </div>
        </m.article>
      </Link>
    );
  }

  // Horizontal 변형
  if (variant === 'horizontal') {
    return (
      <Link href={`/k-experience/${experience.category}/${experience.id}`}>
        <m.article
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={cn(
            'relative overflow-hidden rounded-2xl',
            'bg-white/5 backdrop-blur-xl',
            'border border-white/10',
            'flex gap-4 p-4',
            className
          )}
        >
          {/* Thumbnail */}
          <div className="relative w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden">
            {!imageError ? (
              <Image
                src={experience.thumbnail}
                alt={experience.title}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={cn('w-full h-full bg-gradient-to-br', CATEGORY_COLORS[experience.category])} />
            )}
            {experience.verified && (
              <div className="absolute top-2 left-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{CATEGORY_ICONS[experience.category]}</span>
              <span className="text-xs text-white/60">
                {t(`kexperience.categories.${experience.category}`)}
              </span>
            </div>
            
            <h3 className="font-semibold text-white truncate mb-1">
              {experience.title}
            </h3>
            
            <p className="text-white/60 text-sm truncate mb-2">
              📍 {experience.location.name}
            </p>

            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {renderStars(experience.rating)}
              </div>
              <span className="text-white/60 text-xs">({experience.reviewCount})</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-bold text-white">
                {formatPrice(displayPrice, experience.pricing.currency)}
              </span>
              {hasDiscount && (
                <span className="px-2 py-0.5 bg-red-500/20 rounded text-xs text-red-400">
                  -{experience.pricing.discountPercent}%
                </span>
              )}
            </div>
          </div>
        </m.article>
      </Link>
    );
  }

  // Compact 변형
  if (variant === 'compact') {
    return (
      <Link href={`/k-experience/${experience.category}/${experience.id}`}>
        <m.article
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={cn(
            'relative overflow-hidden rounded-2xl',
            'bg-white/5 backdrop-blur-xl',
            'border border-white/10',
            'p-3',
            className
          )}
        >
          <div className="relative h-28 rounded-xl overflow-hidden mb-3">
            {!imageError ? (
              <Image
                src={experience.thumbnail}
                alt={experience.title}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={cn('w-full h-full bg-gradient-to-br', CATEGORY_COLORS[experience.category])} />
            )}
          </div>
          
          <h4 className="font-medium text-white text-sm truncate mb-1">
            {experience.title}
          </h4>
          
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-xs">
              {CATEGORY_ICONS[experience.category]}
            </span>
            <span className="font-semibold text-white text-sm">
              {formatPrice(displayPrice, experience.pricing.currency)}
            </span>
          </div>
        </m.article>
      </Link>
    );
  }

  // Default 변형
  return (
    <Link href={`/k-experience/${experience.category}/${experience.id}`}>
      <m.article
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'relative overflow-hidden rounded-3xl',
          'bg-white/5 backdrop-blur-xl',
          'border border-white/10',
          'shadow-xl shadow-black/10',
          className
        )}
      >
        {/* Thumbnail */}
        <div className="relative h-48 overflow-hidden">
          {!imageError ? (
            <Image
              src={experience.thumbnail}
              alt={experience.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={cn('w-full h-full bg-gradient-to-br', CATEGORY_COLORS[experience.category])} />
          )}
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span className={cn(
              'px-3 py-1.5 rounded-full',
              'bg-gradient-to-r',
              CATEGORY_COLORS[experience.category],
              'text-white text-xs font-medium'
            )}>
              {CATEGORY_ICONS[experience.category]} {t(`kexperience.categories.${experience.category}`)}
            </span>
          </div>

          {/* Badges */}
          <div className="absolute top-4 right-4 flex gap-2">
            {experience.verified && (
              <span className="p-1.5 rounded-full bg-green-500/90 text-white text-xs">
                ✓
              </span>
            )}
            {experience.featured && (
              <span className="px-2 py-1 rounded-full bg-yellow-500/90 text-white text-xs">
                ⭐
              </span>
            )}
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              <m.button
                whileTap={{ scale: 0.9 }}
                onClick={handleBookmark}
                className="p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
              >
                <span className={isBookmarked ? 'text-red-500' : 'text-white'}>
                  {isBookmarked ? '❤️' : '🤍'}
                </span>
              </m.button>
              <m.button
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
              >
                <span className="text-white">📤</span>
              </m.button>
            </div>
          )}

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute bottom-4 left-4">
              <span className="px-3 py-1 bg-red-500 rounded-full text-white text-sm font-bold">
                -{experience.pricing.discountPercent}%
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-white text-lg mb-2 line-clamp-1">
            {experience.title}
          </h3>
          
          <p className="text-white/70 text-sm mb-3 line-clamp-2">
            {experience.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {experience.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full bg-white/10 text-white/70 text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Location & Duration */}
          <div className="flex items-center gap-3 text-white/60 text-sm mb-3">
            <span>📍 {experience.location.name}</span>
            <span>⏱️ {experience.duration}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-0.5">
              {renderStars(experience.rating)}
            </div>
            <span className="text-white/80 text-sm">
              {experience.rating.toFixed(1)}
            </span>
            <span className="text-white/50 text-sm">
              ({experience.reviewCount} {t('kexperience.reviews')})
            </span>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between">
            <div>
              {hasDiscount && experience.pricing.originalAmount && (
                <span className="text-white/50 line-through text-sm mr-2">
                  {formatPrice(experience.pricing.originalAmount, experience.pricing.currency)}
                </span>
              )}
              <span className="text-xl font-bold text-white">
                {formatPrice(displayPrice, experience.pricing.currency)}
              </span>
            </div>
            
            <m.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'px-4 py-2 rounded-xl',
                'bg-gradient-to-r',
                CATEGORY_COLORS[experience.category],
                'text-white text-sm font-medium',
                'shadow-lg'
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Handle booking
              }}
            >
              {t('kexperience.book')}
            </m.button>
          </div>
        </div>
      </m.article>
    </Link>
  );
}

// 로딩 스켈레톤
export function ExperienceCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' | 'horizontal' }) {
  if (variant === 'horizontal') {
    return (
      <div className="flex gap-4 p-4 bg-white/5 rounded-2xl animate-pulse">
        <div className="w-32 h-32 bg-white/10 rounded-xl" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-white/10 rounded w-1/4" />
          <div className="h-5 bg-white/10 rounded w-3/4" />
          <div className="h-4 bg-white/10 rounded w-1/2" />
          <div className="h-6 bg-white/10 rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="p-3 bg-white/5 rounded-2xl animate-pulse">
        <div className="h-28 bg-white/10 rounded-xl mb-3" />
        <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
        <div className="h-4 bg-white/10 rounded w-1/2" />
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-3xl overflow-hidden animate-pulse">
      <div className="h-48 bg-white/10" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-white/10 rounded w-3/4" />
        <div className="h-4 bg-white/10 rounded w-full" />
        <div className="h-4 bg-white/10 rounded w-2/3" />
        <div className="flex gap-2">
          <div className="h-6 bg-white/10 rounded-full w-16" />
          <div className="h-6 bg-white/10 rounded-full w-16" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-8 bg-white/10 rounded w-24" />
          <div className="h-10 bg-white/10 rounded-xl w-20" />
        </div>
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(ExperienceCard);
