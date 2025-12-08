// src/app/[locale]/k-experience/page.tsx
// K-Experience 메인 페이지

import { Metadata } from 'next';
import { KExperienceMain } from './KExperienceMain';

export const metadata: Metadata = {
  title: 'K-Experience | ZZIK',
  description: 'Discover authentic K-experiences - K-POP, K-Drama, K-Beauty, K-Food, and K-Fashion',
  openGraph: {
    title: 'K-Experience | ZZIK',
    description: 'Discover authentic K-experiences',
    images: ['/images/k-experience-og.jpg'],
  },
};

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function KExperiencePage({ params }: PageProps) {
  const { locale } = await params;
  
  return <KExperienceMain locale={locale} />;
}
