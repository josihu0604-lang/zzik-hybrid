import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '오픈 확정 팝업 지도 | ZZIK',
  description:
    '펀딩 목표를 달성하고 오픈이 확정된 팝업 스토어를 지도에서 확인하세요. 가까운 팝업을 찾아 방문하고 ZZIK 배지를 받아보세요.',
  keywords: ['팝업지도', '팝업위치', '오픈팝업', '확정팝업', '팝업스토어지도', 'ZZIK'],
  openGraph: {
    title: '오픈 확정 팝업 지도 | ZZIK',
    description: '펀딩 목표를 달성한 팝업 스토어를 지도에서 찾아보세요.',
    url: 'https://zzik.app/map',
    images: [
      {
        url: '/api/og?title=오픈 확정 팝업 지도',
        width: 1200,
        height: 630,
        alt: '오픈 확정 팝업 지도',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '오픈 확정 팝업 지도 | ZZIK',
    description: '펀딩 목표를 달성한 팝업 스토어를 지도에서 찾아보세요.',
    images: ['/api/og?title=오픈 확정 팝업 지도'],
  },
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
