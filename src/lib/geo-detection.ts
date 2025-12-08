// src/lib/geo-detection.ts

import { Region } from './global-pricing';
import { useState, useEffect } from 'react';

// Using a type alias for Locale to avoid circular dependencies if i18n config imports this
export type Locale = 'ko' | 'en' | 'ja' | 'zh-TW' | 'zh-CN' | 'th';

interface GeoData {
  country: string;
  region: Region;
  locale: Locale;
  timezone: string;
  currency: string;
}

// IP-based Geo Detection
export async function detectGeoFromIP(): Promise<GeoData> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      throw new Error(`IP API failed: ${response.statusText}`);
    }
    const data = await response.json();
    
    const country = data.country_code || 'KR';
    
    return {
      country,
      region: countryToRegion(country),
      locale: countryToLocale(country),
      timezone: data.timezone || 'Asia/Seoul',
      currency: data.currency || 'KRW',
    };
  } catch (error) {
    console.error('Geo detection failed:', error);
    return getDefaultGeoData();
  }
}

// Browser-based Detection
export function detectGeoFromBrowser(): Partial<GeoData> {
  if (typeof navigator === 'undefined') return {};

  const browserLocale = navigator.language;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  return {
    locale: browserLocaleToLocale(browserLocale),
    timezone,
  };
}

// Country Code to Region Mapping
function countryToRegion(country: string): Region {
  const regionMap: Record<string, Region> = {
    KR: 'KR',
    JP: 'JP',
    TW: 'TW',
    CN: 'CN',
    HK: 'TW',  // Hong Kong mapped to TW region for currency/market similarity in this context
    TH: 'TH',
    VN: 'SEA',
    SG: 'SEA',
    MY: 'SEA',
    ID: 'SEA',
    PH: 'SEA',
    US: 'US',
    CA: 'US',
    GB: 'EU',
    DE: 'EU',
    FR: 'EU',
    // ... others
  };
  
  return regionMap[country] || 'GLOBAL';
}

// Country Code to Locale Mapping
function countryToLocale(country: string): Locale {
  const localeMap: Record<string, Locale> = {
    KR: 'ko',
    JP: 'ja',
    TW: 'zh-TW',
    CN: 'zh-CN',
    HK: 'zh-TW',
    TH: 'th',
    // English defaults
    US: 'en',
    GB: 'en',
    AU: 'en',
    CA: 'en',
  };
  
  return localeMap[country] || 'en';
}

// Browser Locale to App Locale Mapping
function browserLocaleToLocale(browserLocale: string): Locale {
  const [lang, region] = browserLocale.split('-');
  
  if (lang === 'ko') return 'ko';
  if (lang === 'ja') return 'ja';
  if (lang === 'th') return 'th';
  
  // Chinese Handling
  if (lang === 'zh') {
    if (region === 'TW' || region === 'HK') return 'zh-TW';
    return 'zh-CN';
  }
  
  // Default to English
  return 'en';
}

function getDefaultGeoData(): GeoData {
  return {
    country: 'KR',
    region: 'KR',
    locale: 'ko',
    timezone: 'Asia/Seoul',
    currency: 'KRW',
  };
}

// React Hook for Geo Detection
export function useGeoDetection() {
  const [geoData, setGeoData] = useState<GeoData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    async function detect() {
      // Check localStorage first
      const saved = localStorage.getItem('zzik_geo');
      if (saved) {
        try {
          setGeoData(JSON.parse(saved));
          setLoading(false);
          return;
        } catch (e) {
          console.error("Failed to parse saved geo data", e);
        }
      }
      
      // Fallback to browser detection initially for speed
      const browserData = detectGeoFromBrowser();
      const defaultData = getDefaultGeoData();
      
      const initialData: GeoData = {
        ...defaultData,
        ...browserData, // Override with browser specifics if available
      };

      setGeoData(initialData);
      
      // Then try more accurate IP detection
      try {
         // const ipData = await detectGeoFromIP();
         // setGeoData(ipData);
         // localStorage.setItem('zzik_geo', JSON.stringify(ipData));
         setLoading(false);
      } catch (e) {
         setLoading(false);
      }
    }
    
    detect();
  }, []);
  
  const updateRegion = (region: Region) => {
    if (geoData) {
      const newData = { ...geoData, region };
      setGeoData(newData);
      localStorage.setItem('zzik_geo', JSON.stringify(newData));
    }
  };
  
  return { geoData, loading, updateRegion };
}
