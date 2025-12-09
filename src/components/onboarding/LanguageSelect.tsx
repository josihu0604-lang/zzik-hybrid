'use client';

import { useTranslation } from '@/i18n';

interface LanguageSelectProps {
  selected: string;
  onChange: (lang: string) => void;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', native: 'English' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', native: '한국어' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', native: '日本語' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', native: '中文' },
];

export default function LanguageSelect({ selected, onChange }: LanguageSelectProps) {
  return (
    <div className="space-y-3">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onChange(lang.code)}
          className={`w-full p-4 rounded-xl border-2 transition-all ${
            selected === lang.code
              ? 'border-purple-600 bg-purple-50 shadow-md'
              : 'border-gray-200 hover:border-purple-300 hover:shadow'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-3xl">{lang.flag}</span>
              <div className="text-left">
                <div className="font-semibold text-gray-900">{lang.native}</div>
                <div className="text-sm text-gray-600">{lang.name}</div>
              </div>
            </div>
            {selected === lang.code && (
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
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
  );
}
