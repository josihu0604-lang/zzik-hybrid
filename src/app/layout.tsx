import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_KR } from 'next/font/google';
import { AuthProvider } from '@/context/auth-context';
import { ToastProvider } from '@/components/ui/Toast';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import { PushNotificationPrompt } from '@/components/pwa/PushNotificationPrompt';
import { OfflineStatus } from '@/components/pwa/OfflineStatus';
import { LanguageProvider } from '@/i18n';
import { BaseJsonLd } from '@/components/seo';
import { baseMetadata, viewport as seoViewport, siteConfig } from '@/lib/seo';
import { MotionProvider } from '@/components/MotionProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { AppEntry } from '@/components/app';
import { WebVitals } from '@/components/analytics/WebVitals';
import { WebVitalsMonitor } from '@/components/analytics/WebVitalsMonitor';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import './globals.css';

// Inter - Latin (English, numbers) - Primary font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

// Noto Sans KR - Korean font (from Google Fonts)
// Alternative to Pretendard with similar aesthetics
const notoSansKR = Noto_Sans_KR({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-noto-sans-kr',
  preload: true,
});

// Extended metadata with SEO base
export const metadata: Metadata = {
  ...baseMetadata,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: siteConfig.name,
  },
};

// Viewport configuration (themeColor moved here per Next.js 14+ requirements)
export const viewport: Viewport = {
  ...seoViewport,
  viewportFit: 'cover',
  // DES-190: 상태 바 테마 색상
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#FF6B5B' },
    { media: '(prefers-color-scheme: light)', color: '#FF6B5B' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`dark ${inter.variable} ${notoSansKR.variable}`}>
      <body className="min-h-screen bg-space-950 text-white antialiased font-sans">
        {/* Structured Data for SEO */}
        <BaseJsonLd />
        <MotionProvider>
          <QueryProvider>
            <LanguageProvider>
              <AuthProvider>
                <ToastProvider>
                  <ServiceWorkerRegistration />
                  <PushNotificationPrompt />
                  <OfflineStatus />
                  {/* Analytics Integration */}
                  <GoogleAnalytics />
                  <WebVitals />
                  {/* A11Y-014: Skip to main content for accessibility */}
                  <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold focus:outline-none focus:ring-3 focus:ring-white focus:ring-offset-2 focus:ring-offset-space-950"
                    style={{
                      background: '#FF6B5B',
                      color: 'white',
                      zIndex: 100, // Accessibility - higher than modals
                      boxShadow: '0 4px 12px rgba(255, 107, 91, 0.5)',
                    }}
                  >
                    메인 콘텐츠로 이동
                  </a>
                  {/* A11Y-015: 시맨틱 header 랜드마크 - 스크린 리더 탐색용 */}
                  <header role="banner" aria-label="사이트 헤더">
                    {/*
                    Header landmark for screen readers.
                    Actual header content (logo, nav) rendered by page components.
                    This provides a structural landmark for accessibility tools.
                  */}
                  </header>
                  {/* A11Y-014: 시맨틱 main 요소 with explicit role */}
                  <main id="main-content" role="main" className="pb-20">
                    <AppEntry>{children}</AppEntry>
                  </main>
                  {/* A11Y-016: 시맨틱 footer 랜드마크 - 네비게이션 포함 */}
                  <footer role="contentinfo" aria-label="사이트 푸터">
                    {/* 앱 바텀 네비게이션 - footer 내부로 이동 */}
                    <BottomTabBar />
                  </footer>
                  {/* Web Vitals Monitor (Dev only) */}
                  <WebVitalsMonitor />
                </ToastProvider>
              </AuthProvider>
            </LanguageProvider>
          </QueryProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
