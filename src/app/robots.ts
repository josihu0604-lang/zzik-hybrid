/**
 * Robots.txt Generator
 *
 * Controls search engine crawling
 */

import { MetadataRoute } from 'next';
import { siteConfig, robotsConfig } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: robotsConfig.rules.map((rule) => ({
      userAgent: rule.userAgent,
      allow: rule.allow,
      disallow: rule.disallow,
    })),
    sitemap: robotsConfig.sitemap,
    host: siteConfig.url,
  };
}
