import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '리더 대시보드 | ZZIK',
  description:
    'ZZIK 리더로 등록하고 팝업 펀딩을 추천하세요. 추천한 참여자가 팝업을 방문하면 수익을 얻을 수 있습니다. 인플루언서 프로그램.',
  keywords: ['리더', '인플루언서', '추천수익', '팝업마케팅', 'ZZIK리더', '리더오퍼'],
  openGraph: {
    title: '리더 대시보드 | ZZIK',
    description: 'ZZIK 리더로 등록하고 팝업 펀딩을 추천하세요. 추천 수익을 얻을 수 있습니다.',
    url: 'https://zzik.app/leader',
    images: [
      {
        url: '/api/og?title=리더 대시보드',
        width: 1200,
        height: 630,
        alt: '리더 대시보드',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '리더 대시보드 | ZZIK',
    description: 'ZZIK 리더로 등록하고 팝업 펀딩을 추천하세요.',
    images: ['/api/og?title=리더 대시보드'],
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function LeaderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
