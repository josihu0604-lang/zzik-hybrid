import { Metadata } from 'next';
import { ReactNode } from 'react';

/**
 * Popup Detail Layout - Dynamic OG Meta Tags
 *
 * 팝업별 동적 메타데이터 생성
 * - SNS 공유 시 미리보기 최적화
 * - 리퍼럴 링크 공유 시 클릭률 향상
 */

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

// Fetch popup data for metadata
async function getPopupData(id: string) {
  try {
    // Use internal API or direct DB access
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://zzik.kr';
    const res = await fetch(`${baseUrl}/api/popup?id=${id}`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

// Generate dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const popup = await getPopupData(id);

  if (!popup) {
    return {
      title: 'ZZIK - 팝업 크라우드펀딩',
      description: '참여하면 열린다! 원하는 팝업에 참여하고 오픈을 이끌어보세요.',
    };
  }

  const progress = Math.round((popup.currentParticipants / popup.goalParticipants) * 100);
  const title = `[${popup.brandName}] ${popup.title}`;
  const description =
    popup.status === 'funding'
      ? `현재 ${popup.currentParticipants}/${popup.goalParticipants}명 참여중 (${progress}%) - 지금 참여하고 팝업 오픈에 함께하세요!`
      : popup.status === 'confirmed'
        ? `오픈 확정! ${popup.brandName} 팝업이 열립니다. 방문해서 체크인하세요!`
        : `${popup.brandName} 팝업 - ZZIK`;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://zzik.kr';
  const ogImage = popup.imageUrl || `${baseUrl}/og-default.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${baseUrl}/popup/${id}`,
      siteName: 'ZZIK - 팝업 크라우드펀딩',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${popup.brandName} 팝업`,
        },
      ],
      locale: 'ko_KR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    other: {
      'og:brand_name': popup.brandName,
      'og:progress': `${progress}%`,
      'og:status': popup.status,
    },
  };
}

export default function PopupLayout({ children }: LayoutProps) {
  return <>{children}</>;
}
