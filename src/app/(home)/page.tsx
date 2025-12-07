'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { m } from '@/lib/motion';
import { Flame, Bell, MapPin, Users, Ticket, Star, Calendar } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { hasCompletedOnboarding } from '@/components/onboarding';
import { ErrorBoundary } from '@/components/error';
import { useTranslation } from '@/i18n';
import { GlobalHero } from '@/components/home/GlobalHero';
import { getLocalizedPrice, type CountryCode } from '@/lib/currency';

/**
 * ZZIK Home Page - K-POP VIP Experience Platform
 *
 * Design: Linear Deep Space + Flame Coral Accent
 */

// Experience Types
type ExperienceType = 'hightough' | 'soundcheck' | 'backstage' | 'popup';

interface Experience {
  id: string;
  title: string;
  artistName: string;
  artistImage?: string;
  type: ExperienceType;
  location: string;
  date: string;
  basePrice: number;
  spotsLeft: number;
  totalSpots: number;
  imageUrl?: string;
}

// Mock Data - K-POP VIP Experiences
const MOCK_EXPERIENCES: Experience[] = [
  {
    id: '1',
    title: 'BLACKPINK World Tour',
    artistName: 'BLACKPINK',
    type: 'hightough',
    location: 'Bangkok, Thailand',
    date: '2025-03-15',
    basePrice: 150,
    spotsLeft: 12,
    totalSpots: 50,
  },
  {
    id: '2',
    title: 'BTS Comeback Special',
    artistName: 'BTS',
    type: 'soundcheck',
    location: 'Seoul, Korea',
    date: '2025-04-20',
    basePrice: 300,
    spotsLeft: 5,
    totalSpots: 30,
  },
  {
    id: '3',
    title: 'NewJeans Fan Meeting',
    artistName: 'NewJeans',
    type: 'backstage',
    location: 'Tokyo, Japan',
    date: '2025-05-10',
    basePrice: 1500,
    spotsLeft: 3,
    totalSpots: 10,
  },
  {
    id: '4',
    title: 'Stray Kids Concert',
    artistName: 'Stray Kids',
    type: 'hightough',
    location: 'Manila, Philippines',
    date: '2025-06-01',
    basePrice: 150,
    spotsLeft: 25,
    totalSpots: 100,
  },
  {
    id: '5',
    title: 'TWICE Dome Tour',
    artistName: 'TWICE',
    type: 'soundcheck',
    location: 'Osaka, Japan',
    date: '2025-06-15',
    basePrice: 300,
    spotsLeft: 8,
    totalSpots: 40,
  },
];

const EXPERIENCE_TYPE_LABELS: Record<ExperienceType, string> = {
  hightough: 'Meet & Greet',
  soundcheck: 'Soundcheck',
  backstage: 'Backstage',
  popup: 'Popup Event',
};

const EXPERIENCE_TYPE_COLORS: Record<ExperienceType, string> = {
  hightough: 'bg-flame-500/20 text-flame-400',
  soundcheck: 'bg-purple-500/20 text-purple-400',
  backstage: 'bg-spark-500/20 text-spark-400',
  popup: 'bg-blue-500/20 text-blue-400',
};

function ExperienceCard({ experience }: { experience: Experience }) {
  const { t } = useTranslation();
  const price = getLocalizedPrice(experience.basePrice, 'TH' as CountryCode);
  const progress = ((experience.totalSpots - experience.spotsLeft) / experience.totalSpots) * 100;

  return (
    <m.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-space-850 rounded-2xl overflow-hidden border border-white/[0.06]"
    >
      <Link href={`/experience/${experience.id}`} className="block">
        {/* Image Placeholder */}
        <div className="relative h-40 bg-gradient-to-br from-space-800 to-space-900 flex items-center justify-center">
          <div className="text-4xl font-bold text-white/10">{experience.artistName.charAt(0)}</div>

          {/* Type Badge */}
          <span
            className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${EXPERIENCE_TYPE_COLORS[experience.type]}`}
          >
            {EXPERIENCE_TYPE_LABELS[experience.type]}
          </span>

          {/* Spots Left */}
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white/80 flex items-center gap-1">
            <Ticket size={12} />
            {experience.spotsLeft} {t('experience.spotsLeft')}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-white/90 line-clamp-1">{experience.title}</h3>
              <p className="text-sm text-white/50 flex items-center gap-1 mt-0.5">
                <Star size={12} className="text-spark-400" />
                {experience.artistName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-flame-400 font-bold">{price.formatted}</p>
              <p className="text-xs text-white/40">per person</p>
            </div>
          </div>

          {/* Location & Date */}
          <div className="flex items-center gap-3 text-xs text-white/50 mb-3">
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {experience.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(experience.date).toLocaleDateString()}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 bg-space-800 rounded-full overflow-hidden">
            <m.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-flame-500 to-flame-400 rounded-full"
            />
          </div>
          <p className="text-xs text-white/40 mt-1">
            {Math.round(progress)}% {t('experience.booked')}
          </p>
        </div>
      </Link>
    </m.article>
  );
}

function HomeContent() {
  const router = useRouter();
  const { t } = useTranslation();
  const [experiences] = useState<Experience[]>(MOCK_EXPERIENCES);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  // Onboarding check
  useEffect(() => {
    if (!hasCompletedOnboarding()) {
      router.replace('/onboarding');
    } else {
      setIsCheckingOnboarding(false);
    }
  }, [router]);

  const totalBookings = experiences.reduce((sum, e) => sum + (e.totalSpots - e.spotsLeft), 0);

  if (isCheckingOnboarding) {
    return <div className="min-h-screen bg-space-950" aria-busy="true" />;
  }

  return (
    <div className="min-h-screen bg-space-950 text-white pb-24">
      {/* Compact App Header */}
      <header
        className="sticky top-0 z-50 bg-space-950/90 backdrop-blur-lg border-b border-white/[0.06]"
        role="banner"
      >
        <div className="flex items-center justify-between px-4 h-14">
          {/* Logo + Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Flame size={20} className="text-flame-500" />
              <span className="text-base font-bold tracking-tight">ZZIK</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-white/50">
              <Users size={12} />
              <span className="tabular-nums">{totalBookings.toLocaleString()}</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/map"
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
              aria-label={t('nav.map')}
            >
              <MapPin size={20} className="text-white/60" />
            </Link>
            <button
              className="p-2 rounded-full hover:bg-white/5 transition-colors relative"
              aria-label={t('notification.title')}
            >
              <Bell size={20} className="text-white/60" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-flame-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Global Hero Section */}
      <GlobalHero
        onGetStarted={() => {
          document.getElementById('experience-list')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Content */}
      <main className="px-5 pt-6" role="main" id="experience-list">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-flame-500 animate-pulse" />
            <h2 className="text-sm font-semibold text-white/80">
              {t('experience.trending')}{' '}
              <span className="text-flame-500">{experiences.length}</span>
            </h2>
          </div>
          <Link href="/experiences" className="text-xs text-white/40 hover:text-white/60">
            {t('experience.viewAll')}
          </Link>
        </div>

        {/* Experience Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {experiences.map((experience) => (
            <ExperienceCard key={experience.id} experience={experience} />
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

export default function Home() {
  return (
    <ErrorBoundary onError={(error) => console.error('Home page error:', error)}>
      <HomeContent />
    </ErrorBoundary>
  );
}
