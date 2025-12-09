import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { typedFrom } from '@/lib/supabase/typed-client';

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  // Using 'any' cast here because the typedFrom helper assumes a valid connection
  // and we just added 'experiences' to the types but maybe not the generic client definition
  let query = typedFrom(supabase, 'experiences').select('*');

  if (category) {
    query = query.eq('category', category);
  }

  // Active only by default
  query = query.eq('status', 'active');

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const json = await request.json();

    const { data, error } = await typedFrom(supabase, 'experiences')
      .insert({
        ...json,
        host_id: user.id,
        status: 'active',
        current_participants: 0,
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
    return NextResponse.json({ error: e.message || 'Invalid request' }, { status: 400 });
  }
}
