// src/app/[locale]/k-experience/[category]/page.tsx
// K-Experience 카테고리 페이지

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryPageClient } from './CategoryPageClient';

const VALID_CATEGORIES = ['kpop', 'kdrama', 'kbeauty', 'kfood', 'kfashion'];

const CATEGORY_META: Record<string, { title: string; description: string }> = {
  kpop: {
    title: 'K-POP Experiences | ZZIK',
    description: 'Discover K-POP experiences - fan meetings, concert tours, dance classes, and more',
  },
  kdrama: {
    title: 'K-Drama Experiences | ZZIK',
    description: 'Visit iconic K-Drama filming locations and immerse yourself in Korean drama culture',
  },
  kbeauty: {
    title: 'K-Beauty Experiences | ZZIK',
    description: 'Learn Korean beauty secrets with makeup classes and skincare workshops',
  },
  kfood: {
    title: 'K-Food Experiences | ZZIK',
    description: 'Taste authentic Korean cuisine with cooking classes and food tours',
  },
  kfashion: {
    title: 'K-Fashion Experiences | ZZIK',
    description: 'Experience Korean fashion with hanbok rentals and styling sessions',
  },
};

interface PageProps {
  params: Promise<{
    locale: string;
    category: string;
  }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    tag?: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  
  if (!VALID_CATEGORIES.includes(category)) {
    return { title: 'Not Found' };
  }

  const meta = CATEGORY_META[category];
  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
    },
  };
}

export async function generateStaticParams() {
  return VALID_CATEGORIES.map((category) => ({
    category,
  }));
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { locale, category } = await params;
  const search = await searchParams;
  
  if (!VALID_CATEGORIES.includes(category)) {
    notFound();
  }

  return (
    <CategoryPageClient
      locale={locale}
      category={category}
      page={search.page ? parseInt(search.page) : 1}
      sort={search.sort || 'popular'}
      tag={search.tag}
    />
  );
}
