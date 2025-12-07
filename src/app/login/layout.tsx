import type { Metadata } from 'next';

/**
 * Login Page Layout
 *
 * 로그인/회원가입 페이지 레이아웃
 * - SEO 최적화 메타데이터
 * - Open Graph / Twitter Cards
 */

export const metadata: Metadata = {
  title: '로그인 | ZZIK - 참여하면, 열린다',
  description:
    'ZZIK에 로그인하고 좋아하는 브랜드의 팝업스토어 펀딩에 참여하세요. 카카오, 네이버, 구글 간편 로그인 지원.',
  keywords: ['로그인', '회원가입', 'ZZIK', '소셜로그인', '카카오로그인', '간편가입'],

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://zzik.app/login',
    siteName: 'ZZIK',
    title: '로그인 | ZZIK',
    description: 'ZZIK에 로그인하고 팝업 펀딩에 참여하세요.',
    images: [
      {
        url: '/api/og?title=로그인',
        width: 1200,
        height: 630,
        alt: 'ZZIK 로그인',
      },
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: '로그인 | ZZIK',
    description: 'ZZIK에 로그인하고 팝업 펀딩에 참여하세요.',
    images: ['/api/og?title=로그인'],
  },

  // Canonical
  alternates: {
    canonical: 'https://zzik.app/login',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
