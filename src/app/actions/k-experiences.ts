'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { typedFrom } from '@/lib/supabase/typed-client';

export type KExperience = {
  id: string;
  title: any; // JSONB
  description: any; // JSONB
  category: string;
  location_lat: number | null;
  location_lng: number | null;
  address: any; // JSONB
  cover_image: string | null;
  images: string[] | null;
  rating: number | null;
  review_count: number | null;
};

export async function getKExperiences(category?: string) {
  const supabase = await createServerSupabaseClient();
  
  let query = typedFrom(supabase, 'k_experiences')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching K-Experiences:', error);
    return [];
  }

  return data;
}

export async function getKExperienceById(id: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await typedFrom(supabase, 'k_experiences')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching K-Experience ${id}:`, error);
    return null;
  }

  return data;
}

export async function verifyExperience(experienceId: string, method: 'gps' | 'qr' | 'receipt', data: any) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    // Check if already verified
    const { data: existing } = await typedFrom(supabase, 'experience_verifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('experience_id', experienceId)
        .single();

    if (existing) return { error: 'Already verified' };

    const { error } = await typedFrom(supabase, 'experience_verifications')
        .insert({
            user_id: user.id,
            experience_id: experienceId,
            verification_method: method,
            status: 'verified', // Auto-verify for now, or pending if manual
            verification_data: data,
            created_at: new Date().toISOString(),
            verified_at: new Date().toISOString(),
        });

    if (error) return { error: error.message };

    return { success: true };
}
