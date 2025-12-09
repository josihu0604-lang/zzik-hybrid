'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/i18n';
import ConsentForm from '@/components/auth/ConsentForm';

export default function ConsentPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [consents, setConsents] = useState({
    cookies: false,
    dataProcessing: false,
    marketing: false,
  });

  const handleConsentChange = (key: keyof typeof consents, value: boolean) => {
    setConsents((prev) => ({ ...prev, [key]: value }));
  };

  const handleAgreeAll = () => {
    setConsents({
      cookies: true,
      dataProcessing: true,
      marketing: true,
    });
  };

  const handleSubmit = () => {
    // Required consents must be accepted
    if (!consents.cookies || !consents.dataProcessing) {
      alert('Please accept required consents');
      return;
    }

    // Save consents to localStorage
    localStorage.setItem('user_consents', JSON.stringify(consents));
    localStorage.setItem('consent_timestamp', new Date().toISOString());

    // Redirect to app
    router.push('/');
  };

  const canProceed = consents.cookies && consents.dataProcessing;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {t('consent.title')}
          </h1>
          <p className="text-gray-600">
            We value your privacy and data security
          </p>
        </div>

        {/* Consent Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <ConsentForm
            consents={consents}
            onChange={handleConsentChange}
            onAgreeAll={handleAgreeAll}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={handleSubmit}
            disabled={!canProceed}
            className={`w-full py-4 px-6 rounded-xl font-semibold transition-colors ${
              canProceed
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {t('common.confirm')}
          </button>

          <button
            onClick={() => router.back()}
            className="w-full py-4 px-6 rounded-xl border-2 border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t('common.back')}
          </button>
        </div>

        {/* GDPR Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            By continuing, you agree to our{' '}
            <a href="/privacy" className="text-purple-600 hover:underline">
              {t('consent.privacyPolicy')}
            </a>{' '}
            and{' '}
            <a href="/terms" className="text-purple-600 hover:underline">
              {t('consent.termsOfService')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
