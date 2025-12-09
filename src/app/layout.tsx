import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/context/auth-context';
import { ToastProvider } from '@/components/ui/Toast';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import { PushNotificationPrompt } from '@/components/pwa/PushNotificationPrompt';
import { OfflineStatus } from '@/components/pwa/OfflineStatus';
import { LanguageProvider } from '@/i18n';
import { BaseJsonLd } from '@/components/seo';
import { baseMetadata, viewport as seoViewport, siteConfig } from '@/lib/seo';
import { MotionProvider } from '@/components/MotionProvider';
import { AppProviders } from '@/components/providers/AppProviders';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { AppEntry } from '@/components/app';
import { WebVitals } from '@/components/analytics/WebVitals';
import { WebVitalsMonitor } from '@/components/analytics/WebVitalsMonitor';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { CurrencyProvider } from '@/hooks/useCurrency';
import { PerformanceMonitor } from '@/hooks/usePerformanceMode';
import { getFontVariables } from '@/lib/fonts';
import { DynamicFontLoader } from '@/components/i18n/DynamicFontLoader';
import './globals.css';

export const dynamic = 'force-dynamic';

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
  const fontVariables = getFontVariables();
  
  return (
    <html lang="ko" className={`dark ${fontVariables}`}>
      <body className="min-h-screen bg-black text-white antialiased font-sans">
        <PerformanceMonitor />
        {/* Desktop Background Decoration */}
        <div className="hidden lg:block fixed inset-0 z-0 overflow-hidden pointer-events-none bg-space-900">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-flame-500/5 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px]" />
        </div>
        {/* Structured Data for SEO */}
        <BaseJsonLd />
        <MotionProvider>
          <AppProviders>
            <LanguageProvider>
              <DynamicFontLoader />
              <CurrencyProvider>
                <AuthProvider>
                  <ToastProvider>
                    {/* Desktop App Container */}
                    <div className="lg:max-w-[430px] lg:mx-auto lg:min-h-screen lg:shadow-2xl lg:border-x lg:border-white/10 bg-space-950 relative min-h-screen z-10 transform-gpu">
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
                          zIndex: 100,
                          boxShadow: '0 4px 12px rgba(255, 107, 91, 0.5)',
                        }}
                      >
                        메인 콘텐츠로 이동
                      </a>
                      {/* A11Y-015: 시맨틱 header 랜드마크 */}
                      <header role="banner" aria-label="사이트 헤더" />
                      {/* A11Y-014: 시맨틱 main 요소 */}
                      <main id="main-content" role="main" className="pb-20">
                        <AppEntry>{children}</AppEntry>
                      </main>
                      {/* A11Y-016: 시맨틱 footer 랜드마크 */}
                      <footer role="contentinfo" aria-label="사이트 푸터">
                        <BottomTabBar />
                      </footer>
                    </div>
                    <WebVitalsMonitor />
                  </ToastProvider>
                </AuthProvider>
              </CurrencyProvider>
            </LanguageProvider>
          </AppProviders>
        </MotionProvider>
      </body>
    </html>
  );
}
