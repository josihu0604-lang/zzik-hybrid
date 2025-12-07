import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '진행 중인 펀딩 | ZZIK',
  description:
    '현재 펀딩 중인 모든 팝업 스토어를 확인하고 참여하세요. K-Fashion, K-Beauty, K-Pop, K-Food 등 다양한 브랜드 팝업이 여러분을 기다립니다.',
  keywords: ['팝업펀딩', '진행중팝업', '펀딩중', '팝업참여', 'K-브랜드', 'ZZIK'],
  openGraph: {
    title: '진행 중인 펀딩 | ZZIK',
    description: '현재 펀딩 중인 모든 팝업 스토어를 확인하고 참여하세요.',
    url: 'https://zzik.app/live',
    images: [
      {
        url: '/api/og?title=진행 중인 펀딩',
        width: 1200,
        height: 630,
        alt: '진행 중인 펀딩',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '진행 중인 펀딩 | ZZIK',
    description: '현재 펀딩 중인 모든 팝업 스토어를 확인하고 참여하세요.',
    images: ['/api/og?title=진행 중인 펀딩'],
  },
};

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
