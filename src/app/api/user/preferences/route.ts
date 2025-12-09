// src/app/api/user/preferences/route.ts
// 사용자 설정 API

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { Region, Currency, REGION_CURRENCY } from '@/lib/global-pricing';

// 지원하는 로케일
type SupportedLocale = 'ko' | 'en' | 'ja' | 'zh-TW' | 'th';
const SUPPORTED_LOCALES: SupportedLocale[] = ['ko', 'en', 'ja', 'zh-TW', 'th'];
const SUPPORTED_REGIONS: Region[] = ['KR', 'JP', 'TW', 'CN', 'TH', 'US', 'EU', 'SEA', 'GLOBAL'];

// 사용자 설정 타입
interface UserPreferences {
  userId?: string;
  region: Region;
  locale: SupportedLocale;
  currency: Currency;
  timezone: string;
  notifications: {
    push: boolean;
    email: boolean;
    marketing: boolean;
  };
  theme: 'system' | 'light' | 'dark';
  createdAt?: string;
  updatedAt?: string;
}

// 기본 설정
const DEFAULT_PREFERENCES: Omit<UserPreferences, 'userId' | 'createdAt' | 'updatedAt'> = {
  region: 'GLOBAL',
  locale: 'en',
  currency: 'USD',
  timezone: 'UTC',
  notifications: {
    push: true,
    email: true,
    marketing: false,
  },
  theme: 'system',
};

/**
 * Supabase 클라이언트 생성
 */
async function createSupabaseClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

/**
 * GET /api/user/preferences
 * 
 * 사용자 설정 조회
 * - 인증된 사용자: DB에서 조회
 * - 비인증 사용자: 쿠키/기본값 반환
 */
export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseClient();
    
    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      // 비인증 사용자: 쿠키 또는 기본값 반환
      const cookieStore = await cookies();
      const savedRegion = cookieStore.get('zzik_region')?.value as Region;
      const savedLocale = cookieStore.get('zzik_locale')?.value as SupportedLocale;
      const savedTheme = cookieStore.get('zzik_theme')?.value as 'system' | 'light' | 'dark';
      
      const preferences: UserPreferences = {
        ...DEFAULT_PREFERENCES,
        region: savedRegion && SUPPORTED_REGIONS.includes(savedRegion) ? savedRegion : DEFAULT_PREFERENCES.region,
        locale: savedLocale && SUPPORTED_LOCALES.includes(savedLocale) ? savedLocale : DEFAULT_PREFERENCES.locale,
        currency: savedRegion ? REGION_CURRENCY[savedRegion] || DEFAULT_PREFERENCES.currency : DEFAULT_PREFERENCES.currency,
        theme: savedTheme || DEFAULT_PREFERENCES.theme,
      };
      
      return NextResponse.json({
        success: true,
        data: {
          authenticated: false,
          preferences,
        },
      });
    }
    
    // 인증된 사용자: DB에서 조회
    const { data: dbPreferences, error: dbError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (dbError && dbError.code !== 'PGRST116') {
      // PGRST116 = 결과 없음 (404와 유사)
      console.error('Failed to fetch user preferences:', dbError);
    }
    
    // DB에 설정이 없으면 기본값 사용
    const preferences: UserPreferences = dbPreferences ? {
      userId: user.id,
      region: dbPreferences.region || DEFAULT_PREFERENCES.region,
      locale: dbPreferences.locale || DEFAULT_PREFERENCES.locale,
      currency: dbPreferences.currency || (dbPreferences.region && SUPPORTED_REGIONS.includes(dbPreferences.region as Region) ? REGION_CURRENCY[dbPreferences.region as Region] : DEFAULT_PREFERENCES.currency),
      timezone: dbPreferences.timezone || DEFAULT_PREFERENCES.timezone,
      notifications: dbPreferences.notifications || DEFAULT_PREFERENCES.notifications,
      theme: dbPreferences.theme || DEFAULT_PREFERENCES.theme,
      createdAt: dbPreferences.created_at,
      updatedAt: dbPreferences.updated_at,
    } : {
      ...DEFAULT_PREFERENCES,
      userId: user.id,
    };
    
    return NextResponse.json({
      success: true,
      data: {
        authenticated: true,
        preferences,
      },
    });
  } catch (error) {
    console.error('Get user preferences error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/preferences
 * 
 * 사용자 설정 업데이트
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { region, locale, currency, timezone, notifications, theme } = body;
    
    const supabase = await createSupabaseClient();
    
    // 입력 유효성 검사
    const updates: Partial<UserPreferences> = {};
    
    if (region && SUPPORTED_REGIONS.includes(region as Region)) {
      updates.region = region as Region;
      // 지역 변경 시 통화도 자동 업데이트 (명시적으로 지정하지 않은 경우)
      if (!currency) {
        updates.currency = REGION_CURRENCY[region as Region];
      }
    }
    
    if (locale && SUPPORTED_LOCALES.includes(locale)) {
      updates.locale = locale;
    }
    
    if (currency) {
      updates.currency = currency;
    }
    
    if (timezone) {
      updates.timezone = timezone;
    }
    
    if (notifications) {
      updates.notifications = {
        push: typeof notifications.push === 'boolean' ? notifications.push : DEFAULT_PREFERENCES.notifications.push,
        email: typeof notifications.email === 'boolean' ? notifications.email : DEFAULT_PREFERENCES.notifications.email,
        marketing: typeof notifications.marketing === 'boolean' ? notifications.marketing : DEFAULT_PREFERENCES.notifications.marketing,
      };
    }
    
    if (theme && ['system', 'light', 'dark'].includes(theme)) {
      updates.theme = theme;
    }
    
    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      // 비인증 사용자: 쿠키에 저장
      const cookieStore = await cookies();
      const cookieOptions = {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 60 * 60 * 24 * 365, // 1년
        path: '/',
      };
      
      if (updates.region) {
        cookieStore.set('zzik_region', updates.region, cookieOptions);
      }
      if (updates.locale) {
        cookieStore.set('zzik_locale', updates.locale, cookieOptions);
      }
      if (updates.theme) {
        cookieStore.set('zzik_theme', updates.theme, cookieOptions);
      }
      
      return NextResponse.json({
        success: true,
        data: {
          authenticated: false,
          message: 'Preferences saved to cookies',
          updates,
        },
      });
    }
    
    // 인증된 사용자: DB에 저장 (upsert)
    const { data: savedPreferences, error: saveError } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        region: updates.region,
        locale: updates.locale,
        currency: updates.currency,
        timezone: updates.timezone,
        notifications: updates.notifications,
        theme: updates.theme,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single();
    
    if (saveError) {
      console.error('Failed to save user preferences:', saveError);
      return NextResponse.json(
        { success: false, error: 'Failed to save preferences' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        authenticated: true,
        preferences: savedPreferences,
      },
    });
  } catch (error) {
    console.error('Update user preferences error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/preferences
 * 
 * 사용자 설정 초기화
 */
export async function DELETE(_: Request) {
  try {
    const supabase = await createSupabaseClient();
    
    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      // 비인증 사용자: 쿠키 삭제
      const cookieStore = await cookies();
      cookieStore.delete('zzik_region');
      cookieStore.delete('zzik_locale');
      cookieStore.delete('zzik_theme');
      
      return NextResponse.json({
        success: true,
        data: {
          authenticated: false,
          message: 'Preferences cookies cleared',
        },
      });
    }
    
    // 인증된 사용자: DB에서 삭제
    const { error: deleteError } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', user.id);
    
    if (deleteError) {
      console.error('Failed to delete user preferences:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete preferences' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        authenticated: true,
        message: 'Preferences reset to defaults',
      },
    });
  } catch (error) {
    console.error('Delete user preferences error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete preferences' },
      { status: 500 }
    );
  }
}
