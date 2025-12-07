import type { Metadata } from 'next';

/**
 * Profile Settings Layout
 *
 * 프로필 설정 페이지 레이아웃
 * - 개인정보 포함으로 검색엔진 색인 제외
 * - 로그인 필수 페이지
 */

export const metadata: Metadata = {
  title: '프로필 설정 | ZZIK',
  description:
    '프로필 정보, 알림 설정, 계정 관리를 할 수 있습니다. ZZIK 개인 설정을 맞춤 설정하세요.',
  keywords: ['프로필', '설정', '개인정보', '알림설정', '계정관리', 'ZZIK'],

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://zzik.app/profile',
    siteName: 'ZZIK',
    title: '프로필 설정 | ZZIK',
    description: '프로필 정보와 계정 설정을 관리하세요.',
    images: [
      {
        url: '/api/og?title=프로필 설정',
        width: 1200,
        height: 630,
        alt: 'ZZIK 프로필 설정',
      },
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: '프로필 설정 | ZZIK',
    description: '프로필 정보와 계정 설정을 관리하세요.',
    images: ['/api/og?title=프로필 설정'],
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

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
