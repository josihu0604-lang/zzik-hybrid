'use client';

import { useTranslation } from '@/i18n';
import Link from 'next/link';

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-6">
            <span className="text-2xl">🚀</span>
            <span className="font-semibold">Tourist-First Travel App</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            {t('landing.hero.title')}
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto">
            {t('landing.hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/onboarding"
              className="px-8 py-4 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
            >
              {t('landing.hero.cta')}
            </Link>
            <Link
              href="/"
              className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl border-2 border-purple-600 hover:bg-purple-50 transition-colors"
            >
              {t('onboarding.startExploring')}
            </Link>
          </div>

          {/* Hero Image/Animation */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl opacity-20 blur-3xl"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-6 bg-blue-50 rounded-2xl">
                  <div className="text-4xl mb-2">💳</div>
                  <div className="font-bold text-blue-600">0% Fee</div>
                  <div className="text-sm text-gray-600">Payment</div>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-2xl">
                  <div className="text-4xl mb-2">🗺️</div>
                  <div className="font-bold text-purple-600">AI Map</div>
                  <div className="text-sm text-gray-600">Discovery</div>
                </div>
                <div className="text-center p-6 bg-pink-50 rounded-2xl">
                  <div className="text-4xl mb-2">✨</div>
                  <div className="font-bold text-pink-600">Skin AI</div>
                  <div className="text-sm text-gray-600">Analysis</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Pillar Features */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            {t('onboarding.threePillars')}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Pay Feature */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-3xl border border-blue-100">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-4xl">💳</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                {t('landing.features.pay.title')}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                {t('landing.features.pay.desc')}
              </p>
              <ul className="space-y-3">
                {['0% Exchange Fee', 'QR Code Payment', 'Auto Wallet Creation'].map((item) => (
                  <li key={item} className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Play Feature */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-3xl border border-purple-100">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-4xl">🗺️</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                {t('landing.features.play.title')}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                {t('landing.features.play.desc')}
              </p>
              <ul className="space-y-3">
                {['AI Recommendations', 'Real-time Waiting', 'Restaurant Booking'].map((item) => (
                  <li key={item} className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-purple-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Beauty Feature */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-8 rounded-3xl border border-pink-100">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-4xl">✨</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                {t('landing.features.beauty.title')}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                {t('landing.features.beauty.desc')}
              </p>
              <ul className="space-y-3">
                {['AI Skin Analysis', 'Clinic Matching', 'Before & After'].map((item) => (
                  <li key={item} className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-pink-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">{t('landing.download.title')}</h2>
          <p className="text-xl mb-10 opacity-90">
            Available on iOS and Android
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center space-x-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span>{t('landing.download.appStore')}</span>
            </button>

            <button className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center space-x-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
              </svg>
              <span>{t('landing.download.playStore')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-3xl font-bold mb-4">ZZIK</div>
          <p className="text-gray-400 mb-6">Your perfect travel companion</p>
          <div className="flex justify-center space-x-8 text-gray-400 text-sm">
            <Link href="/about" className="hover:text-white">{t('footer.company')}</Link>
            <Link href="/terms" className="hover:text-white">{t('footer.terms')}</Link>
            <Link href="/privacy" className="hover:text-white">{t('footer.privacy')}</Link>
            <Link href="/contact" className="hover:text-white">{t('footer.contact')}</Link>
          </div>
          <div className="mt-8 text-gray-500 text-sm">
            {t('footer.copyright')}
          </div>
        </div>
      </footer>
    </div>
  );
}
