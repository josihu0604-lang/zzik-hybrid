import type { Metadata } from 'next';

/**
 * My Page Layout
 *
 * 마이페이지 레이아웃
 * - 개인정보 포함으로 검색엔진 색인 제외
 * - 로그인 필수 페이지
 */

export const metadata: Metadata = {
  title: '마이페이지 | ZZIK',
  description:
    '나의 팝업 참여 내역, 찍음 배지, 리더 활동을 확인하세요. ZZIK에서 나만의 팝업 여정을 관리하세요.',
  keywords: ['마이페이지', '참여내역', '배지', '리더활동', 'ZZIK'],

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://zzik.app/me',
    siteName: 'ZZIK',
    title: '마이페이지 | ZZIK',
    description: '나의 팝업 참여 내역과 활동을 확인하세요.',
    images: [
      {
        url: '/api/og?title=마이페이지',
        width: 1200,
        height: 630,
        alt: 'ZZIK 마이페이지',
      },
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: '마이페이지 | ZZIK',
    description: '나의 팝업 참여 내역과 활동을 확인하세요.',
    images: ['/api/og?title=마이페이지'],
  },

  // 개인정보 페이지 - 검색엔진 색인 제외
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function MeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
