'use client';

import { useTranslation } from '@/i18n';

interface ConsentFormProps {
  consents: {
    cookies: boolean;
    dataProcessing: boolean;
    marketing: boolean;
  };
  onChange: (key: 'cookies' | 'dataProcessing' | 'marketing', value: boolean) => void;
  onAgreeAll: () => void;
}

interface ConsentItemProps {
  id: string;
  title: string;
  description: string;
  required: boolean;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ConsentItem({ id, title, description, required, checked, onChange }: ConsentItemProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
      />
      <div className="flex-1">
        <label htmlFor={id} className="flex items-center space-x-2 cursor-pointer">
          <span className="font-semibold text-gray-900">{title}</span>
          {required && (
            <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full font-medium">
              {t('consent.required')}
            </span>
          )}
          {!required && (
            <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full font-medium">
              {t('consent.optional')}
            </span>
          )}
        </label>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
        <button className="text-sm text-purple-600 hover:underline mt-2">
          {t('consent.viewDetails')} →
        </button>
      </div>
    </div>
  );
}

export default function ConsentForm({ consents, onChange, onAgreeAll }: ConsentFormProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Agree All Button */}
      <button
        onClick={onAgreeAll}
        className="w-full py-3 px-6 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
      >
        {t('consent.agreeAll')}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">or choose individually</span>
        </div>
      </div>

      {/* Individual Consents */}
      <div className="space-y-4">
        <ConsentItem
          id="cookies"
          title={t('consent.cookieConsent')}
          description={t('consent.cookieDesc')}
          required={true}
          checked={consents.cookies}
          onChange={(value) => onChange('cookies', value)}
        />

        <ConsentItem
          id="dataProcessing"
          title={t('consent.dataProcessing')}
          description={t('consent.dataProcessingDesc')}
          required={true}
          checked={consents.dataProcessing}
          onChange={(value) => onChange('dataProcessing', value)}
        />

        <ConsentItem
          id="marketing"
          title={t('consent.marketing')}
          description={t('consent.marketingDesc')}
          required={false}
          checked={consents.marketing}
          onChange={(value) => onChange('marketing', value)}
        />
      </div>

      {/* GDPR Compliance Note */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">ℹ️</div>
          <div className="flex-1 text-sm text-blue-900">
            <p className="font-semibold mb-1">GDPR Compliant</p>
            <p className="text-blue-700">
              We process your data in accordance with GDPR regulations. You can withdraw your consent
              at any time in Settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
