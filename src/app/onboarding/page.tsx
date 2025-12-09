'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSelect from '@/components/onboarding/LanguageSelect';
import FeatureIntro from '@/components/onboarding/FeatureIntro';
import { useTranslation } from '@/i18n';

type OnboardingStep = 'language' | 'currency' | 'features';

export default function OnboardingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [step, setStep] = useState<OnboardingStep>('language');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  // 클라이언트 마운트 상태 추적 - Hydration 오류 방지
  const [isMounted, setIsMounted] = useState(false);

  // 클라이언트 마운트 확인
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if user has completed onboarding
  useEffect(() => {
    if (!isMounted) return;
    const onboardingCompleted = localStorage.getItem('onboarding_completed');
    if (onboardingCompleted === 'true') {
      router.push('/');
    }
  }, [router, isMounted]);

  // Auto-detect language based on browser
  useEffect(() => {
    if (!isMounted) return;
    // SSR 안전: navigator는 클라이언트에서만 접근
    const browserLang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'en';
    const supportedLangs = ['en', 'ko', 'ja', 'zh'];
    if (supportedLangs.includes(browserLang)) {
      setSelectedLanguage(browserLang);
    }
  }, [isMounted]);

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    router.push('/');
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('user_language', selectedLanguage);
    localStorage.setItem('user_currency', selectedCurrency);
    router.push('/');
  };

  const handleNext = () => {
    if (step === 'language') {
      setStep('currency');
    } else if (step === 'currency') {
      setStep('features');
    }
  };

  const handleBack = () => {
    if (step === 'currency') {
      setStep('language');
    } else if (step === 'features') {
      setStep('currency');
    }
  };

  // Hydration 안전: 클라이언트 마운트 전까지 스켈레톤 표시
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-space-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-space-800" />
          <div className="h-4 w-32 bg-space-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-space-900 to-space-950 relative overflow-hidden">
      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 z-50 text-white/60 hover:text-white font-medium transition-colors"
      >
        {t('common.skip')}
      </button>

      {/* Progress Indicator */}
      <div className="absolute top-6 left-6 z-50 flex space-x-2">
        {['language', 'currency', 'features'].map((s, i) => (
          <div
            key={s}
            className={`h-1.5 w-12 rounded-full transition-colors ${
              step === s
                ? 'bg-flame-500'
                : i < ['language', 'currency', 'features'].indexOf(step)
                  ? 'bg-flame-400'
                  : 'bg-space-700'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 pb-24">
        <AnimatePresence mode="wait">
          {step === 'language' && (
            <motion.div
              key="language"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md"
            >
              <h1 className="text-3xl font-bold text-center mb-3 text-white">
                {t('onboarding.welcome')}
              </h1>
              <p className="text-center text-white/70 mb-8">
                {t('onboarding.selectLanguage')}
              </p>
              <LanguageSelect
                selected={selectedLanguage}
                onChange={setSelectedLanguage}
              />
            </motion.div>
          )}

          {step === 'currency' && (
            <motion.div
              key="currency"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md"
            >
              <h1 className="text-3xl font-bold text-center mb-3 text-white">
                {t('onboarding.selectCurrency')}
              </h1>
              <p className="text-center text-white/70 mb-8">
                {t('onboarding.currencyDescription')}
              </p>
              <div className="space-y-3">
                {[
                  { code: 'USD', symbol: '$', name: 'US Dollar' },
                  { code: 'KRW', symbol: '₩', name: 'Korean Won' },
                  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
                  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
                  { code: 'EUR', symbol: '€', name: 'Euro' },
                ].map((currency) => (
                  <button
                    key={currency.code}
                    onClick={() => setSelectedCurrency(currency.code)}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      selectedCurrency === currency.code
                        ? 'border-flame-500 bg-flame-500/10'
                        : 'border-space-700 hover:border-flame-400 bg-space-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{currency.symbol}</span>
                        <div className="text-left">
                          <div className="font-semibold text-white">
                            {currency.code}
                          </div>
                          <div className="text-sm text-white/60">
                            {currency.name}
                          </div>
                        </div>
                      </div>
                      {selectedCurrency === currency.code && (
                        <div className="w-6 h-6 bg-flame-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'features' && (
            <motion.div
              key="features"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md"
            >
              <h1 className="text-3xl font-bold text-center mb-3 text-white">
                {t('onboarding.threePillars')}
              </h1>
              <p className="text-center text-white/70 mb-8">
                {t('onboarding.featureDescription')}
              </p>
              <FeatureIntro />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-space-900/95 backdrop-blur-lg border-t border-white/10 p-6 safe-area-bottom">
        <div className="max-w-md mx-auto flex space-x-3">
          {step !== 'language' && (
            <button
              onClick={handleBack}
              className="flex-1 py-4 px-6 rounded-xl border-2 border-space-600 font-semibold text-white hover:bg-space-800 transition-colors"
            >
              {t('common.back')}
            </button>
          )}
          {step !== 'features' ? (
            <button
              onClick={handleNext}
              className="flex-1 py-4 px-6 rounded-xl bg-flame-500 font-semibold text-white hover:bg-flame-600 transition-colors shadow-lg shadow-flame-500/30"
            >
              {t('common.next')}
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="flex-1 py-4 px-6 rounded-xl bg-flame-500 font-semibold text-white hover:bg-flame-600 transition-colors shadow-lg shadow-flame-500/30"
            >
              {t('onboarding.startExploring')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
