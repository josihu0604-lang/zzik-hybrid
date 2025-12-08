// src/app/[locale]/k-experience/[category]/[id]/ExperienceDetailClient.tsx
// K-Experience 상세 페이지 클라이언트 컴포넌트

'use client';

import { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/LanguageProvider';
import { type KExperience } from '@/components/k-experience';
import { formatCurrency as formatCurrencyGlobal, type Currency } from '@/lib/global-pricing';

interface ExperienceDetailClientProps {
  locale: string;
  category: string;
  experienceId: string;
}

interface ExperienceDetail extends KExperience {
  fullDescription: string;
  includes: string[];
  notIncludes: string[];
  schedule: { time: string; activity: string }[];
  meetingPoint: string;
  host: {
    name: string;
    avatar: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
    description: string;
  };
  reviews: {
    id: string;
    user: string;
    avatar: string;
    rating: number;
    comment: string;
    date: string;
  }[];
  faqs: { question: string; answer: string }[];
}

export function ExperienceDetailClient({
  locale,
  category,
  experienceId,
}: ExperienceDetailClientProps) {
  const { t } = useTranslation();
  
  // Use global pricing formatCurrency for currency-aware formatting
  const formatPrice = (amount: number, currency: string) => {
    return formatCurrencyGlobal(amount, currency as Currency);
  };
  const [experience, setExperience] = useState<ExperienceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'faqs'>('overview');
  const [showAllReviews, setShowAllReviews] = useState(false);
  
  // Booking state
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchExperience = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/k-experience/${experienceId}?locale=${locale}`);
        const data = await response.json();
        
        if (data.success) {
          setExperience(data.data);
        } else {
          console.error('Failed to fetch experience:', data.error);
        }
      } catch (error) {
        console.error('Error fetching experience:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperience();
  }, [experienceId, locale]);

  // 날짜 선택 옵션 (다음 14일)
  const dateOptions = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return date.toISOString().split('T')[0];
  });

  // 시간 옵션
  const timeOptions = ['09:00', '14:00'];

  // 총 가격 계산
  const totalPrice = experience ? experience.pricing.amount * guests : 0;

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !experience) return;
    
    setIsBooking(true);
    setBookingError(null);

    try {
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'payment', // Indicate this is a one-time payment
          title: experience.title,
          amount: totalPrice,
          currency: experience.pricing.currency,
          experienceId: experience.id,
          date: selectedDate,
          time: selectedTime,
          guests,
          tier: 'standard', // Fallback for existing validation
          region: 'GLOBAL', // Fallback
          period: 'one_time' // Fallback
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        // If it's a 401, redirect to login
        if (response.status === 401) {
           window.location.href = `/login?redirect=${window.location.pathname}`;
           return;
        }
        setBookingError(data.error || 'Failed to initiate checkout');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setBookingError('An unexpected error occurred');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading || !experience) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
      </div>
    );
  }

  // 별점 렌더링
  const renderStars = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      {/* Breadcrumb */}
      <div className="px-4 py-4 max-w-6xl mx-auto">
        <nav className="flex items-center gap-2 text-white/60 text-sm">
          <Link href={`/${locale}`} className="hover:text-white">
            {t('common.home')}
          </Link>
          <span>/</span>
          <Link href={`/${locale}/k-experience`} className="hover:text-white">
            K-Experience
          </Link>
          <span>/</span>
          <Link href={`/${locale}/k-experience/${category}`} className="hover:text-white">
            {t(`kexperience.categories.${category}`)}
          </Link>
          <span>/</span>
          <span className="text-white truncate max-w-[150px]">{experience.title}</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-video rounded-3xl overflow-hidden bg-gray-800">
                <Image
                  src={experience.thumbnail}
                  alt={experience.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://placehold.co/800x450/1f2937/9ca3af?text=${encodeURIComponent(experience.title)}`;
                  }}
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {experience.verified && (
                    <span className="px-3 py-1 rounded-full bg-green-500/90 text-white text-sm font-medium">
                      ✓ {t('kexperience.verified')}
                    </span>
                  )}
                  {experience.featured && (
                    <span className="px-3 py-1 rounded-full bg-yellow-500/90 text-white text-sm font-medium">
                      ⭐ {t('kexperience.featured')}
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnail Gallery */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {experience.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                      'relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0',
                      selectedImage === idx && 'ring-2 ring-white'
                    )}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Rating */}
            <div>
              <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                <span className="text-2xl">🎤</span>
                <span>{t(`kexperience.categories.${category}`)}</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">{experience.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-white/80">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">{renderStars(experience.rating)}</span>
                  <span className="font-medium">{experience.rating.toFixed(1)}</span>
                  <span className="text-white/60">({experience.reviewCount} {t('kexperience.reviews')})</span>
                </div>
                <span className="text-white/40">|</span>
                <span>📍 {experience.location.name}</span>
                <span className="text-white/40">|</span>
                <span>⏱️ {experience.duration}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {experience.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Tabs */}
            <div className="border-b border-white/10">
              <div className="flex gap-8">
                {(['overview', 'reviews', 'faqs'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'py-4 font-medium transition-colors',
                      activeTab === tab
                        ? 'text-white border-b-2 border-white'
                        : 'text-white/60 hover:text-white'
                    )}
                  >
                    {t(`kexperience.tabs.${tab}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <m.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {/* Description */}
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                      {t('kexperience.aboutExperience')}
                    </h2>
                    <p className="text-white/80 whitespace-pre-line">
                      {experience.fullDescription}
                    </p>
                  </div>

                  {/* Schedule */}
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                      {t('kexperience.schedule')}
                    </h2>
                    <div className="space-y-3">
                      {experience.schedule.map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-start">
                          <span className="text-white/60 font-mono w-16">{item.time}</span>
                          <span className="text-white">{item.activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Includes */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        ✓ {t('kexperience.includes')}
                      </h3>
                      <ul className="space-y-2">
                        {experience.includes.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-white/80">
                            <span className="text-green-400">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        ✗ {t('kexperience.notIncludes')}
                      </h3>
                      <ul className="space-y-2">
                        {experience.notIncludes.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-white/60">
                            <span className="text-red-400">✗</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Host */}
                  <div className="p-6 bg-white/5 rounded-2xl">
                    <h2 className="text-xl font-semibold text-white mb-4">
                      {t('kexperience.hostedBy')}
                    </h2>
                    <div className="flex items-start gap-4">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-700">
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          👤
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">
                            {experience.host.name}
                          </h3>
                          {experience.host.verified && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                              {t('kexperience.verifiedHost')}
                            </span>
                          )}
                        </div>
                        <p className="text-white/60 text-sm mb-2">
                          ⭐ {experience.host.rating} ({experience.host.reviewCount} {t('kexperience.reviews')})
                        </p>
                        <p className="text-white/80">{experience.host.description}</p>
                      </div>
                    </div>
                  </div>
                </m.div>
              )}

              {activeTab === 'reviews' && (
                <m.div
                  key="reviews"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Rating Summary */}
                  <div className="p-6 bg-white/5 rounded-2xl text-center">
                    <p className="text-5xl font-bold text-white mb-2">{experience.rating.toFixed(1)}</p>
                    <p className="text-yellow-400 text-xl mb-2">{renderStars(experience.rating)}</p>
                    <p className="text-white/60">{experience.reviewCount} {t('kexperience.reviews')}</p>
                  </div>

                  {/* Review List */}
                  <div className="space-y-4">
                    {(showAllReviews ? experience.reviews : experience.reviews.slice(0, 3)).map((review) => (
                      <div key={review.id} className="p-4 bg-white/5 rounded-xl">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                            👤
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-white">{review.user}</span>
                              <span className="text-white/40 text-sm">{review.date}</span>
                            </div>
                            <p className="text-yellow-400 text-sm mb-2">{renderStars(review.rating)}</p>
                            <p className="text-white/80">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {experience.reviews.length > 3 && (
                    <button
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="w-full py-3 text-white/80 hover:text-white transition-colors"
                    >
                      {showAllReviews ? t('common.showLess') : t('common.showMore')}
                    </button>
                  )}
                </m.div>
              )}

              {activeTab === 'faqs' && (
                <m.div
                  key="faqs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {experience.faqs.map((faq, idx) => (
                    <details
                      key={idx}
                      className="p-4 bg-white/5 rounded-xl group"
                    >
                      <summary className="font-medium text-white cursor-pointer list-none flex items-center justify-between">
                        {faq.question}
                        <span className="text-white/40 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <p className="mt-3 text-white/70 pl-4 border-l-2 border-white/20">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </m.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 space-y-6">
              {/* Price */}
              <div>
                {experience.pricing.discountPercent && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white/60 line-through">
                      {formatPrice(experience.pricing.originalAmount!, experience.pricing.currency)}
                    </span>
                    <span className="px-2 py-0.5 bg-red-500 rounded text-white text-sm font-medium">
                      -{experience.pricing.discountPercent}%
                    </span>
                  </div>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">
                    {formatPrice(experience.pricing.amount, experience.pricing.currency)}
                  </span>
                  <span className="text-white/60">/ {t('kexperience.perPerson')}</span>
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-white/80 text-sm mb-2">
                  {t('kexperience.selectDate')}
                </label>
                <select
                  value={selectedDate || ''}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white"
                >
                  <option value="">{t('kexperience.chooseDatePlaceholder')}</option>
                  {dateOptions.map((date) => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString(locale, { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-white/80 text-sm mb-2">
                  {t('kexperience.selectTime')}
                </label>
                <div className="flex gap-2">
                  {timeOptions.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={cn(
                        'flex-1 py-3 rounded-xl text-center transition-colors',
                        selectedTime === time
                          ? 'bg-white text-gray-900'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guest Count */}
              <div>
                <label className="block text-white/80 text-sm mb-2">
                  {t('kexperience.guests')}
                </label>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/10 border border-white/20">
                  <button
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="w-10 h-10 rounded-full bg-white/10 text-white text-xl hover:bg-white/20"
                    disabled={guests <= 1}
                  >
                    -
                  </button>
                  <span className="text-white text-lg font-medium">{guests}</span>
                  <button
                    onClick={() => setGuests(Math.min(10, guests + 1))}
                    className="w-10 h-10 rounded-full bg-white/10 text-white text-xl hover:bg-white/20"
                    disabled={guests >= 10}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Price */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white/80">{t('kexperience.total')}</span>
                  <span className="text-2xl font-bold text-white">
                    {formatPrice(totalPrice, experience.pricing.currency)}
                  </span>
                </div>

                <m.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!selectedDate || !selectedTime || isBooking}
                  onClick={handleBooking}
                  className={cn(
                    'w-full py-4 rounded-xl font-semibold text-lg',
                    'bg-gradient-to-r from-pink-500 to-purple-600',
                    'text-white shadow-lg',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'transition-opacity'
                  )}
                >
                  {isBooking ? t('common.loading') : t('kexperience.bookNow')}
                </m.button>
                {bookingError && (
                  <p className="text-red-400 text-sm text-center mt-2">{bookingError}</p>
                )}
              </div>

              {/* Availability */}
              <p className="text-center text-white/60 text-sm">
                🔥 {experience.availableSlots} {t('kexperience.slotsLeft')}
              </p>

              {/* Language Support */}
              <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
                🌐 {experience.language.map((lang) => lang.toUpperCase()).join(' · ')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExperienceDetailClient;
