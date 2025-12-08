// src/app/api/geo-detect/route.ts
// IP 기반 지역 감지 API 엔드포인트

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Region, Currency, REGION_CURRENCY } from '@/lib/global-pricing';

// 지원하는 로케일 목록
export type SupportedLocale = 'ko' | 'en' | 'ja' | 'zh-TW' | 'th';

interface GeoData {
  country: string;          // ISO 3166-1 alpha-2 (예: KR, JP)
  countryName: string;      // 국가명
  region: Region;           // ZZIK 지역 코드
  city?: string;
  timezone: string;
  locale: SupportedLocale;
  currency: Currency;
  ip?: string;
  source: 'ip-api' | 'headers' | 'fallback';
}

// 국가 코드 → 지역 매핑
const COUNTRY_TO_REGION: Record<string, Region> = {
  // 한국
  'KR': 'KR',
  // 일본
  'JP': 'JP',
  // 대만
  'TW': 'TW',
  // 중국, 홍콩, 마카오
  'CN': 'CN',
  'HK': 'CN',
  'MO': 'CN',
  // 태국
  'TH': 'TH',
  // 미국, 캐나다
  'US': 'US',
  'CA': 'US',
  // 유럽
  'DE': 'EU',
  'FR': 'EU',
  'GB': 'EU',
  'IT': 'EU',
  'ES': 'EU',
  'NL': 'EU',
  'BE': 'EU',
  'AT': 'EU',
  'CH': 'EU',
  // 동남아시아
  'SG': 'SEA',
  'MY': 'SEA',
  'ID': 'SEA',
  'PH': 'SEA',
  'VN': 'SEA',
};

// 국가 코드 → 로케일 매핑
const COUNTRY_TO_LOCALE: Record<string, SupportedLocale> = {
  'KR': 'ko',
  'JP': 'ja',
  'TW': 'zh-TW',
  'CN': 'zh-TW',  // 간체자 지원 시 'zh-CN'으로 변경
  'HK': 'zh-TW',
  'TH': 'th',
};

// 기본값
const DEFAULT_GEO: GeoData = {
  country: 'US',
  countryName: 'United States',
  region: 'GLOBAL',
  timezone: 'America/New_York',
  locale: 'en',
  currency: 'USD',
  source: 'fallback',
};

/**
 * IP-API.com에서 지역 정보 가져오기 (무료, 초당 45요청 제한)
 */
async function fetchFromIpApi(ip: string): Promise<GeoData | null> {
  try {
    // IP가 로컬호스트인 경우 스킵
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return null;
    }

    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,city,timezone`,
      {
        next: { revalidate: 86400 }, // 24시간 캐싱
      }
    );

    if (!response.ok) {
      throw new Error(`IP-API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'fail') {
      console.warn('IP-API lookup failed:', data.message);
      return null;
    }

    const countryCode = data.countryCode;
    const region = COUNTRY_TO_REGION[countryCode] || 'GLOBAL';
    const locale = COUNTRY_TO_LOCALE[countryCode] || 'en';
    const currency = REGION_CURRENCY[region];

    return {
      country: countryCode,
      countryName: data.country,
      region,
      city: data.city,
      timezone: data.timezone,
      locale,
      currency,
      ip,
      source: 'ip-api',
    };
  } catch (error) {
    console.error('IP-API fetch error:', error);
    return null;
  }
}

/**
 * HTTP 헤더에서 지역 정보 추출 (Cloudflare, Vercel 등)
 */
async function getGeoFromHeaders(): Promise<Partial<GeoData> | null> {
  try {
    const headersList = await headers();
    
    // Cloudflare 헤더
    const cfCountry = headersList.get('cf-ipcountry');
    // Vercel 헤더
    const vercelCountry = headersList.get('x-vercel-ip-country');
    const vercelCity = headersList.get('x-vercel-ip-city');
    const vercelTimezone = headersList.get('x-vercel-ip-timezone');
    
    const countryCode = cfCountry || vercelCountry;
    
    if (!countryCode || countryCode === 'XX') {
      return null;
    }

    const region = COUNTRY_TO_REGION[countryCode] || 'GLOBAL';
    const locale = COUNTRY_TO_LOCALE[countryCode] || 'en';
    const currency = REGION_CURRENCY[region];

    return {
      country: countryCode,
      region,
      city: vercelCity || undefined,
      timezone: vercelTimezone || getTimezoneForRegion(region),
      locale,
      currency,
      source: 'headers',
    };
  } catch {
    return null;
  }
}

/**
 * 클라이언트 IP 추출
 */
async function getClientIP(): Promise<string | null> {
  try {
    const headersList = await headers();
    
    // 다양한 헤더에서 IP 추출 시도
    const forwarded = headersList.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    const realIP = headersList.get('x-real-ip');
    if (realIP) {
      return realIP;
    }

    const cfIP = headersList.get('cf-connecting-ip');
    if (cfIP) {
      return cfIP;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * 지역별 기본 타임존
 */
function getTimezoneForRegion(region: Region): string {
  const timezones: Record<Region, string> = {
    KR: 'Asia/Seoul',
    JP: 'Asia/Tokyo',
    TW: 'Asia/Taipei',
    CN: 'Asia/Shanghai',
    TH: 'Asia/Bangkok',
    US: 'America/New_York',
    EU: 'Europe/Berlin',
    SEA: 'Asia/Singapore',
    GLOBAL: 'UTC',
  };
  return timezones[region];
}

/**
 * GET /api/geo-detect
 * 
 * 응답 형식:
 * {
 *   success: boolean,
 *   data: {
 *     country: "KR",
 *     countryName: "South Korea",
 *     region: "KR",
 *     city: "Seoul",
 *     timezone: "Asia/Seoul",
 *     locale: "ko",
 *     currency: "KRW",
 *     source: "ip-api" | "headers" | "fallback"
 *   }
 * }
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const forceIP = url.searchParams.get('ip');
    
    // 1. 먼저 HTTP 헤더에서 시도 (CDN/프록시가 제공하는 정보)
    const headerGeo = await getGeoFromHeaders();
    
    if (headerGeo?.country) {
      const countryName = getCountryName(headerGeo.country);
      
      return NextResponse.json({
        success: true,
        data: {
          ...DEFAULT_GEO,
          ...headerGeo,
          countryName,
        } as GeoData,
      });
    }

    // 2. IP-API로 조회
    const clientIP = forceIP || await getClientIP();
    
    if (clientIP) {
      const ipGeo = await fetchFromIpApi(clientIP);
      
      if (ipGeo) {
        return NextResponse.json({
          success: true,
          data: ipGeo,
        });
      }
    }

    // 3. 폴백
    return NextResponse.json({
      success: true,
      data: DEFAULT_GEO,
    });
  } catch (error) {
    console.error('Geo detection error:', error);
    
    return NextResponse.json({
      success: true,
      data: DEFAULT_GEO,
    });
  }
}

/**
 * 국가 코드로 국가명 반환
 */
function getCountryName(code: string): string {
  const names: Record<string, string> = {
    KR: 'South Korea',
    JP: 'Japan',
    TW: 'Taiwan',
    CN: 'China',
    HK: 'Hong Kong',
    TH: 'Thailand',
    US: 'United States',
    CA: 'Canada',
    GB: 'United Kingdom',
    DE: 'Germany',
    FR: 'France',
    SG: 'Singapore',
    MY: 'Malaysia',
    ID: 'Indonesia',
    PH: 'Philippines',
    VN: 'Vietnam',
  };
  return names[code] || code;
}
