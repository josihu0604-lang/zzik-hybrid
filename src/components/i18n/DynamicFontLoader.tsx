'use client';

import { useEffect } from 'react';
import { useTranslation } from '@/i18n';
import { getFontFamilyForLocale, preloadFontForLocale } from '@/lib/fonts';

/**
 * Dynamic Font Loader Component
 * 
 * Automatically applies the correct font family based on the user's locale
 * and preloads the font for better performance.
 * 
 * This component should be rendered once in the app layout.
 */
export function DynamicFontLoader() {
  const { locale } = useTranslation();

  useEffect(() => {
    if (!locale) return;

    // Preload font for current locale
    preloadFontForLocale(locale);

    // Apply font family to body
    const fontFamily = getFontFamilyForLocale(locale);
    document.body.style.fontFamily = fontFamily;

    // Cleanup on unmount
    return () => {
      // Reset to default font
      document.body.style.fontFamily = '';
    };
  }, [locale]);

  return null; // This component doesn't render anything
}
