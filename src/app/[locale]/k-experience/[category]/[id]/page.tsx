// src/app/[locale]/k-experience/[category]/[id]/page.tsx
// K-Experience 상세 페이지

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ExperienceDetailClient } from './ExperienceDetailClient';

interface PageProps {
  params: Promise<{
    locale: string;
    category: string;
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  // 실제로는 API에서 데이터 조회
  return {
    title: `Experience ${id} | ZZIK K-Experience`,
    description: 'Discover authentic K-experience',
  };
}

export default async function ExperienceDetailPage({ params }: PageProps) {
  const { locale, category, id } = await params;
  
  const validCategories = ['kpop', 'kdrama', 'kbeauty', 'kfood', 'kfashion'];
  if (!validCategories.includes(category)) {
    notFound();
  }

  return (
    <ExperienceDetailClient
      locale={locale}
      category={category}
      experienceId={id}
    />
  );
}
