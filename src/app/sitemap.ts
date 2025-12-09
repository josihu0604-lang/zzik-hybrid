/**
 * Dynamic Sitemap Generator
 *
 * Generates sitemap.xml for SEO
 */

import { MetadataRoute } from 'next';
import { staticPages, sitemapEntry } from '@/lib/seo';
import { createServerSupabaseClient } from '@/lib/supabase/server';

async function getPopups(): Promise<{ id: string; updatedAt: Date; status: string }[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from('popups')
      .select('id, updated_at, status')
      .in('status', ['funding', 'confirmed'])
      .order('updated_at', { ascending: false });

    if (!data) return [];

    return data.map((popup) => ({
      id: popup.id,
      updatedAt: new Date(popup.updated_at),
      status: popup.status,
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages (already include full URLs from siteConfig.url)
  const staticUrls = staticPages.map((page) => ({
    url: page.url,
    lastModified: page.lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // Dynamic popup pages
  const popups = await getPopups();
  const popupUrls = popups.map((popup) =>
    sitemapEntry(`/popup/${popup.id}`, {
      lastModified: popup.updatedAt,
      changeFrequency: popup.status === 'funding' ? 'hourly' : 'daily',
      priority: popup.status === 'funding' ? 0.9 : 0.7,
    })
  );

  return [...staticUrls, ...popupUrls] as MetadataRoute.Sitemap;
}
