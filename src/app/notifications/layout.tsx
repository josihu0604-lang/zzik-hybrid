import type { Metadata } from 'next';

/**
 * Notifications Layout
 *
 * 알림 페이지 레이아웃
 * - 개인 알림으로 검색엔진 색인 제외
 * - 로그인 필수 페이지
 */

export const metadata: Metadata = {
  title: '알림 | ZZIK',
  description:
    '참여한 팝업의 오픈 소식, 마감 임박 알림, 리더 활동 알림을 확인하세요. ZZIK의 모든 소식을 놓치지 마세요.',
  keywords: ['알림', '푸시알림', '팝업오픈', '마감임박', '리더알림', 'ZZIK'],

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://zzik.app/notifications',
    siteName: 'ZZIK',
    title: '알림 | ZZIK',
    description: '나의 알림을 확인하세요.',
    images: [
      {
        url: '/api/og?title=알림',
        width: 1200,
        height: 630,
        alt: 'ZZIK 알림',
      },
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: '알림 | ZZIK',
    description: '나의 알림을 확인하세요.',
    images: ['/api/og?title=알림'],
  },

  // 개인 알림 페이지 - 검색엔진 색인 제외
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
