import type { Metadata } from 'next';

/**
 * Help & FAQ Layout
 *
 * 고객지원 및 FAQ 페이지 레이아웃
 * - SEO 최적화 (검색 유입 중요)
 * - 자주 묻는 질문, 이용가이드
 */

export const metadata: Metadata = {
  title: '고객지원 | ZZIK - 자주 묻는 질문',
  description:
    'ZZIK 팝업 펀딩 플랫폼 이용에 관한 자주 묻는 질문과 답변. 참여 방법, 환불 정책, 리더 프로그램 등 궁금한 점을 해결하세요.',
  keywords: [
    '고객지원',
    'FAQ',
    '자주묻는질문',
    '이용가이드',
    '참여방법',
    '환불',
    '리더프로그램',
    'ZZIK',
  ],

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://zzik.app/help',
    siteName: 'ZZIK',
    title: '고객지원 | ZZIK',
    description: 'ZZIK 이용에 관한 자주 묻는 질문과 답변을 확인하세요.',
    images: [
      {
        url: '/api/og?title=고객지원',
        width: 1200,
        height: 630,
        alt: 'ZZIK 고객지원',
      },
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: '고객지원 | ZZIK',
    description: 'ZZIK 이용에 관한 자주 묻는 질문과 답변을 확인하세요.',
    images: ['/api/og?title=고객지원'],
  },

  // Canonical
  alternates: {
    canonical: 'https://zzik.app/help',
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

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
