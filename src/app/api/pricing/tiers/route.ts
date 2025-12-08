// src/app/api/pricing/tiers/route.ts
// VIP 티어 가격 정보 API

import { NextResponse } from 'next/server';
import {
  Region,
  TierType,
  Currency,
  REGION_CURRENCY,
  TIER_PRICES_KRW,
  TIER_FEATURES,
  getTierPrice,
  formatCurrency,
} from '@/lib/global-pricing';

// 지원하는 지역 목록
const SUPPORTED_REGIONS: Region[] = ['KR', 'JP', 'TW', 'CN', 'TH', 'US', 'EU', 'SEA', 'GLOBAL'];
const SUPPORTED_TIERS: TierType[] = ['free', 'silver', 'gold', 'platinum'];

// 티어별 표시 이름
const TIER_DISPLAY_NAMES: Record<TierType, Record<string, string>> = {
  free: {
    en: 'Free',
    ko: '무료',
    ja: '無料',
    'zh-TW': '免費',
    th: 'ฟรี',
  },
  silver: {
    en: 'Silver',
    ko: '실버',
    ja: 'シルバー',
    'zh-TW': '銀牌',
    th: 'ซิลเวอร์',
  },
  gold: {
    en: 'Gold',
    ko: '골드',
    ja: 'ゴールド',
    'zh-TW': '金牌',
    th: 'โกลด์',
  },
  platinum: {
    en: 'Platinum',
    ko: '플래티넘',
    ja: 'プラチナ',
    'zh-TW': '白金',
    th: 'แพลทินัม',
  },
};

// 티어별 설명
const TIER_DESCRIPTIONS: Record<TierType, Record<string, string>> = {
  free: {
    en: 'Start your K-experience journey',
    ko: 'K-체험 여정을 시작하세요',
    ja: 'K体験の旅を始めよう',
    'zh-TW': '開始您的K體驗之旅',
    th: 'เริ่มต้นการเดินทาง K-experience',
  },
  silver: {
    en: 'Unlock premium features',
    ko: '프리미엄 기능을 잠금해제',
    ja: 'プレミアム機能をアンロック',
    'zh-TW': '解鎖高級功能',
    th: 'ปลดล็อคฟีเจอร์พรีเมียม',
  },
  gold: {
    en: 'Priority access to VIP experiences',
    ko: 'VIP 체험 우선 접근',
    ja: 'VIP体験への優先アクセス',
    'zh-TW': 'VIP體驗優先訪問',
    th: 'สิทธิ์เข้าถึงประสบการณ์ VIP ก่อนใคร',
  },
  platinum: {
    en: 'Ultimate K-fan experience',
    ko: '궁극의 K-팬 체험',
    ja: '究極のKファン体験',
    'zh-TW': '終極K粉絲體驗',
    th: 'ประสบการณ์ K-fan สูงสุด',
  },
};

// 기능 번역
const FEATURE_TRANSLATIONS: Record<string, Record<string, string>> = {
  basic_verification: {
    en: 'Basic verification',
    ko: '기본 인증',
    ja: '基本認証',
  },
  monthly_10_verifications: {
    en: '10 verifications/month',
    ko: '월 10회 인증',
    ja: '月10回認証',
  },
  standard_notifications: {
    en: 'Standard notifications',
    ko: '기본 알림',
    ja: '標準通知',
  },
  ads_included: {
    en: 'Ad-supported',
    ko: '광고 포함',
    ja: '広告あり',
  },
  unlimited_verifications: {
    en: 'Unlimited verifications',
    ko: '무제한 인증',
    ja: '認証無制限',
  },
  ad_free: {
    en: 'Ad-free experience',
    ko: '광고 없음',
    ja: '広告なし',
  },
  priority_notifications: {
    en: 'Priority notifications',
    ko: '우선 알림',
    ja: '優先通知',
  },
  detailed_stats: {
    en: 'Detailed statistics',
    ko: '상세 통계',
    ja: '詳細統計',
  },
  monthly_1_vip_entry: {
    en: '1 VIP entry/month',
    ko: '월 1회 VIP 입장',
    ja: '月1回VIP入場',
  },
  silver_badge: {
    en: 'Silver badge',
    ko: '실버 배지',
    ja: 'シルバーバッジ',
  },
  all_silver_features: {
    en: 'All Silver features',
    ko: '실버 기능 포함',
    ja: 'シルバー機能すべて',
  },
  vip_24h_early_access: {
    en: '24h VIP early access',
    ko: '24시간 VIP 사전 접근',
    ja: '24時間VIP先行アクセス',
  },
  fanmeeting_priority_2x: {
    en: '2x fanmeeting priority',
    ko: '팬미팅 우선권 2배',
    ja: 'ファンミーティング優先2倍',
  },
  monthly_3_vip_entries: {
    en: '3 VIP entries/month',
    ko: '월 3회 VIP 입장',
    ja: '月3回VIP入場',
  },
  exclusive_content: {
    en: 'Exclusive content',
    ko: '독점 콘텐츠',
    ja: '限定コンテンツ',
  },
  dedicated_support: {
    en: 'Dedicated support',
    ko: '전담 지원',
    ja: '専用サポート',
  },
  gold_badge: {
    en: 'Gold badge',
    ko: '골드 배지',
    ja: 'ゴールドバッジ',
  },
  all_gold_features: {
    en: 'All Gold features',
    ko: '골드 기능 포함',
    ja: 'ゴールド機能すべて',
  },
  vip_48h_early_access: {
    en: '48h VIP early access',
    ko: '48시간 VIP 사전 접근',
    ja: '48時間VIP先行アクセス',
  },
  fanmeeting_priority_5x: {
    en: '5x fanmeeting priority',
    ko: '팬미팅 우선권 5배',
    ja: 'ファンミーティング優先5倍',
  },
  unlimited_vip_entries: {
    en: 'Unlimited VIP entries',
    ko: '무제한 VIP 입장',
    ja: 'VIP入場無制限',
  },
  annual_premium_experience: {
    en: 'Annual premium experience',
    ko: '연간 프리미엄 체험',
    ja: '年間プレミアム体験',
  },
  concierge_service: {
    en: 'Concierge service',
    ko: '컨시어지 서비스',
    ja: 'コンシェルジュサービス',
  },
  quarterly_goods_package: {
    en: 'Quarterly goods package',
    ko: '분기별 굿즈 패키지',
    ja: '四半期グッズパッケージ',
  },
  platinum_badge_and_frame: {
    en: 'Platinum badge & frame',
    ko: '플래티넘 배지 및 프레임',
    ja: 'プラチナバッジ&フレーム',
  },
};

interface TierInfo {
  id: TierType;
  name: string;
  description: string;
  pricing: {
    monthly: {
      amount: number;
      currency: Currency;
      formatted: string;
    };
    yearly: {
      amount: number;
      currency: Currency;
      formatted: string;
      savingsPercent: number;
    };
  };
  features: Array<{
    key: string;
    label: string;
  }>;
  recommended?: boolean;
}

/**
 * GET /api/pricing/tiers
 * 
 * Query Parameters:
 * - region: Region code (default: GLOBAL)
 * - locale: Language for translations (default: en)
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     region: Region,
 *     currency: Currency,
 *     tiers: TierInfo[]
 *   }
 * }
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const regionParam = url.searchParams.get('region')?.toUpperCase() || 'GLOBAL';
    const locale = url.searchParams.get('locale') || 'en';
    
    // 지역 유효성 검사
    const region = SUPPORTED_REGIONS.includes(regionParam as Region) 
      ? (regionParam as Region) 
      : 'GLOBAL';
    
    const currency = REGION_CURRENCY[region];
    
    // 모든 티어 정보 생성
    const tiers: TierInfo[] = SUPPORTED_TIERS.map((tierId) => {
      const monthly = getTierPrice(tierId, region, 'monthly');
      const yearly = getTierPrice(tierId, region, 'yearly');
      
      // 연간 할인율 계산
      const monthlyTotal = monthly.amount * 12;
      const savingsPercent = monthlyTotal > 0 
        ? Math.round((1 - yearly.amount / monthlyTotal) * 100)
        : 0;
      
      // 기능 번역
      const features = TIER_FEATURES[tierId].map((featureKey) => ({
        key: featureKey,
        label: FEATURE_TRANSLATIONS[featureKey]?.[locale] 
          || FEATURE_TRANSLATIONS[featureKey]?.['en'] 
          || featureKey,
      }));
      
      return {
        id: tierId,
        name: TIER_DISPLAY_NAMES[tierId][locale] || TIER_DISPLAY_NAMES[tierId]['en'],
        description: TIER_DESCRIPTIONS[tierId][locale] || TIER_DESCRIPTIONS[tierId]['en'],
        pricing: {
          monthly: {
            amount: monthly.amount,
            currency: monthly.currency,
            formatted: monthly.formatted,
          },
          yearly: {
            amount: yearly.amount,
            currency: yearly.currency,
            formatted: yearly.formatted,
            savingsPercent,
          },
        },
        features,
        recommended: tierId === 'gold', // Gold를 추천 플랜으로 표시
      };
    });
    
    return NextResponse.json({
      success: true,
      data: {
        region,
        currency,
        locale,
        tiers,
      },
    });
  } catch (error) {
    console.error('Pricing tiers API error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pricing information' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pricing/tiers/compare
 * 
 * Compare pricing across regions
 * 
 * Body:
 * {
 *   tier: TierType,
 *   regions: Region[]
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tier, regions, period = 'monthly' } = body;
    
    // 유효성 검사
    if (!tier || !SUPPORTED_TIERS.includes(tier)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tier', supportedTiers: SUPPORTED_TIERS },
        { status: 400 }
      );
    }
    
    const targetRegions = regions?.length > 0 
      ? regions.filter((r: string) => SUPPORTED_REGIONS.includes(r as Region))
      : SUPPORTED_REGIONS;
    
    // 각 지역별 가격 계산
    const comparison = targetRegions.map((region: Region) => {
      const price = getTierPrice(tier, region, period as 'monthly' | 'yearly');
      return {
        region,
        currency: price.currency,
        amount: price.amount,
        formatted: price.formatted,
      };
    });
    
    return NextResponse.json({
      success: true,
      data: {
        tier,
        period,
        comparison,
      },
    });
  } catch (error) {
    console.error('Pricing comparison error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to compare pricing' },
      { status: 500 }
    );
  }
}
