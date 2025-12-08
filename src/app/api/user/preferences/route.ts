import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { COUNTRIES, CURRENCIES, type CountryCode, type CurrencyCode } from '@/lib/currency';

/**
 * GET /api/user/preferences
 * 
 * Get user's currency and country preferences
 * Returns stored preferences or detected defaults
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user preferences from database
    const { data: userData, error } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('[API] User preferences fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user preferences' },
        { status: 500 }
      );
    }

    // For now, return default US preferences
    // In future, we can add currency_preference and country_preference columns
    const countryCode: CountryCode = 'US';
    const currencyCode: CurrencyCode = COUNTRIES[countryCode].currency;

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      name: userData?.name,
      countryCode,
      currencyCode,
      country: COUNTRIES[countryCode],
      currency: CURRENCIES[currencyCode],
    });
  } catch (error) {
    console.error('[API] User preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/preferences
 * 
 * Update user's currency and country preferences
 * 
 * Body:
 * {
 *   countryCode?: "TH",
 *   currencyCode?: "THB"
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { countryCode, currencyCode } = body;

    // Validate inputs
    if (countryCode && !(countryCode in COUNTRIES)) {
      return NextResponse.json(
        { error: 'Invalid country code' },
        { status: 400 }
      );
    }

    if (currencyCode && !(currencyCode in CURRENCIES)) {
      return NextResponse.json(
        { error: 'Invalid currency code' },
        { status: 400 }
      );
    }

    // TODO: Store preferences in database once columns are added
    // For now, just validate and return the preferences
    const finalCountry = (countryCode || 'US') as CountryCode;
    const finalCurrency = (currencyCode || COUNTRIES[finalCountry].currency) as CurrencyCode;

    return NextResponse.json({
      userId: user.id,
      countryCode: finalCountry,
      currencyCode: finalCurrency,
      country: COUNTRIES[finalCountry],
      currency: CURRENCIES[finalCurrency],
      updated: true,
    });
  } catch (error) {
    console.error('[API] User preferences update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
