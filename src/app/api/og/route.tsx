import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get title from query params or use default
    const title = searchParams.get('title') || 'ZZIK | 참여하면 열린다';
    const subtitle = searchParams.get('subtitle') || '팝업 스토어 크라우드펀딩 플랫폼';

    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#08090a',
          backgroundImage:
            'radial-gradient(circle at 25% 25%, rgba(255, 107, 91, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255, 107, 91, 0.1) 0%, transparent 50%)',
        }}
      >
        {/* Brand Logo/Name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {/* Flame Icon */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #FF6B5B 0%, #CC4A3A 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
            }}
          >
            🔥
          </div>
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#fff',
              letterSpacing: '-0.02em',
            }}
          >
            ZZIK
          </div>
        </div>

        {/* Main Title */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            color: '#fff',
            textAlign: 'center',
            lineHeight: '1.1',
            marginBottom: '24px',
            maxWidth: '900px',
            padding: '0 40px',
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '32px',
            color: 'rgba(255, 255, 255, 0.6)',
            textAlign: 'center',
            maxWidth: '800px',
            padding: '0 40px',
          }}
        >
          {subtitle}
        </div>

        {/* Flame Accent Bar */}
        <div
          style={{
            marginTop: '48px',
            width: '200px',
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #FF6B5B, transparent)',
            borderRadius: '2px',
          }}
        />
      </div>,
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    console.error('Failed to generate OG image:', e);
    return new Response('Failed to generate image', { status: 500 });
  }
}
