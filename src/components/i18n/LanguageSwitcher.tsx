'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageProvider';
import { LOCALES, LOCALE_NAMES, LOCALE_FLAGS, type Locale } from '@/i18n/config';

/**
 * LanguageSwitcher - 언어 전환 컴포넌트
 *
 * Variants:
 * - dropdown: 드롭다운 메뉴 (기본)
 * - toggle: 토글 버튼
 * - minimal: 아이콘만
 */

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'toggle' | 'minimal';
  className?: string;
}

export function LanguageSwitcher({ variant = 'dropdown', className = '' }: LanguageSwitcherProps) {
  const { locale, setLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const locales = Object.keys(LOCALES) as Locale[];

  // Toggle variant
  if (variant === 'toggle') {
    return (
      <div className={`flex items-center gap-1 p-1 rounded-lg bg-white/5 ${className}`}>
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => setLocale(loc)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              locale === loc
                ? 'bg-flame-500 text-white'
                : 'text-linear-text-secondary hover:text-white'
            }`}
          >
            {LOCALE_FLAGS[loc]} {LOCALE_NAMES[loc]}
          </button>
        ))}
      </div>
    );
  }

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <button
        onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}
        className={`p-2 rounded-full hover:bg-white/10 transition-colors ${className}`}
        aria-label="Switch language"
      >
        <span className="text-lg">{LOCALE_FLAGS[locale]}</span>
      </button>
    );
  }

  // Dropdown variant (default)
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe size={18} className="text-linear-text-secondary" />
        <span className="text-sm text-white">
          {LOCALE_FLAGS[locale]} {LOCALE_NAMES[locale]}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Dropdown menu */}
            <m.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-0 mt-2 w-40 rounded-xl overflow-hidden z-50"
              style={{
                background: 'rgba(26, 28, 31, 0.98)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
              role="listbox"
            >
              {locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    setLocale(loc);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                    locale === loc
                      ? 'bg-flame-500/10 text-flame-500'
                      : 'text-white hover:bg-white/5'
                  }`}
                  role="option"
                  aria-selected={locale === loc}
                >
                  <span className="flex items-center gap-2 text-sm">
                    <span>{LOCALE_FLAGS[loc]}</span>
                    <span>{LOCALE_NAMES[loc]}</span>
                  </span>
                  {locale === loc && <Check size={16} />}
                </button>
              ))}
            </m.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * LanguageSwitcherCompact - 컴팩트 버전 (헤더용)
 */
export function LanguageSwitcherCompact() {
  const { locale, setLocale } = useTranslation();

  return (
    <button
      onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}
      className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium
                 text-linear-text-secondary hover:text-white hover:bg-white/10 transition-colors"
      aria-label="Switch language"
    >
      <span>{LOCALE_FLAGS[locale]}</span>
      <span className="hidden sm:inline">{locale.toUpperCase()}</span>
    </button>
  );
}

export default LanguageSwitcher;
