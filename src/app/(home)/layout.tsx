import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ZZIK | 참여하면 열린다 - 팝업 크라우드펀딩',
  description:
    '좋아하는 브랜드 팝업에 참여하고 함께 열어요. 100명이 모이면 실제로 팝업이 열립니다. K-Fashion, K-Beauty, K-Pop 팝업 스토어 크라우드펀딩 플랫폼.',
  keywords: [
    '팝업스토어',
    '크라우드펀딩',
    'ZZIK',
    '찍',
    '팝업',
    'popup',
    'K-브랜드',
    '브랜드체험',
    '팝업예약',
    '팝업오픈',
  ],
  openGraph: {
    title: 'ZZIK | 참여하면 열린다',
    description:
      '좋아하는 브랜드 팝업에 참여하고 함께 열어요. 100명이 모이면 실제로 팝업이 열립니다.',
    type: 'website',
    url: 'https://zzik.app',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'ZZIK - 참여하면 열린다',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZZIK | 참여하면 열린다',
    description:
      '좋아하는 브랜드 팝업에 참여하고 함께 열어요. 100명이 모이면 실제로 팝업이 열립니다.',
    images: ['/api/og'],
  },
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
