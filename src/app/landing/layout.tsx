import type { Metadata, Viewport } from 'next';

/**
 * Landing Page Layout
 *
 * 마케팅 랜딩페이지 전용 레이아웃
 * - SEO 최적화 메타데이터
 * - Open Graph / Twitter Cards
 * - 구조화된 데이터
 */

export const metadata: Metadata = {
  title: 'ZZIK - 참여하면, 열린다 | 팝업 크라우드펀딩 플랫폼',
  description:
    '좋아하는 브랜드의 팝업스토어, 이제 당신이 결정해요. 참여하고 목표를 채우면 팝업이 열립니다. ZZIK에서 원하는 팝업에 참여하세요.',
  keywords: [
    '팝업스토어',
    '크라우드펀딩',
    '팝업',
    'ZZIK',
    '찍',
    'K-브랜드',
    '패션',
    '뷰티',
    'K-POP',
  ],
  authors: [{ name: 'ZZIK Team' }],
  creator: 'ZZIK',
  publisher: 'ZZIK',

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://zzik.kr',
    siteName: 'ZZIK',
    title: 'ZZIK - 참여하면, 열린다',
    description: '좋아하는 브랜드의 팝업스토어, 이제 당신이 결정해요. 참여하고 함께 열어요.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ZZIK - 팝업 크라우드펀딩 플랫폼',
      },
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'ZZIK - 참여하면, 열린다',
    description: '좋아하는 브랜드의 팝업스토어, 이제 당신이 결정해요.',
    images: ['/og-image.png'],
  },

  // App Links
  appLinks: {
    ios: {
      url: 'https://apps.apple.com/app/zzik/id123456789',
      app_store_id: '123456789',
    },
    android: {
      package: 'kr.zzik.app',
      app_name: 'ZZIK',
    },
    web: {
      url: 'https://zzik.kr',
    },
  },

  // Other
  alternates: {
    canonical: 'https://zzik.kr/landing',
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#08090a',
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
