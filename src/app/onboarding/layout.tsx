import type { Metadata } from 'next';

/**
 * Onboarding Layout
 *
 * 온보딩 페이지 레이아웃
 * - 신규 사용자 환영 및 가이드
 * - SEO 최적화
 */

export const metadata: Metadata = {
  title: '시작하기 | ZZIK - 참여하면, 열린다',
  description:
    'ZZIK과 함께 원하는 팝업스토어를 직접 여는 여정을 시작하세요. 30초만에 시작하는 팝업 펀딩, 지금 바로 참여해보세요.',
  keywords: ['시작하기', '온보딩', '가이드', '튜토리얼', '첫참여', '팝업펀딩', 'ZZIK'],

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://zzik.app/onboarding',
    siteName: 'ZZIK',
    title: '시작하기 | ZZIK',
    description: 'ZZIK과 함께 원하는 팝업스토어를 직접 여는 여정을 시작하세요.',
    images: [
      {
        url: '/api/og?title=시작하기',
        width: 1200,
        height: 630,
        alt: 'ZZIK 시작하기',
      },
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: '시작하기 | ZZIK',
    description: 'ZZIK과 함께 원하는 팝업스토어를 직접 여는 여정을 시작하세요.',
    images: ['/api/og?title=시작하기'],
  },

  // Canonical
  alternates: {
    canonical: 'https://zzik.app/onboarding',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
