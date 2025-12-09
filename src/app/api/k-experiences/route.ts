import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { typedFrom } from '@/lib/supabase/typed-client';

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);
  
  const category = searchParams.get('category');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') || '10'; // km

  // Start query
  let query = typedFrom(supabase, 'k_experiences')
    .select('*')
    .eq('is_active', true);

  if (category) {
    query = query.eq('category', category);
  }

  // Note: PostGIS distance sorting would typically go here if enabled.
  // For now, we fetch and can filter/sort in memory if needed, or rely on simple filters.
  // Since 'location_lat' and 'location_lng' are standard decimals in this schema:
  
  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Simple in-memory distance filtering if coordinates provided
  let results = data;
  if (lat && lng && results) {
    const centerLat = parseFloat(lat);
    const centerLng = parseFloat(lng);
    const rad = parseFloat(radius);
    
    results = results.filter((item: any) => {
      if (!item.location_lat || !item.location_lng) return false;
      const d = getDistanceFromLatLonInKm(centerLat, centerLng, item.location_lat, item.location_lng);
      return d <= rad;
    });
  }

  return NextResponse.json({ data: results });
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const json = await request.json();
    
    // Basic validation
    if (!json.title || !json.category) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await typedFrom(supabase, 'k_experiences')
      .insert({
        ...json,
        is_active: true,
        is_verified: false,
        verification_count: 0,
        view_count: 0,
        rating: 0,
        review_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

// Helper: Haversine Formula
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
