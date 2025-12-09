/**
 * SEO Utilities
 *
 * Helpers for generating SEO metadata, OpenGraph tags,
 * JSON-LD structured data, and more.
 */

import type { Metadata, Viewport } from 'next';

// ============================================
// Site Configuration
// ============================================

export const siteConfig = {
  name: 'ZZIK',
  slogan: '참여하면 열린다',
  sloganEn: 'Join to Open',
  description: '팝업 스토어 크라우드펀딩 플랫폼. 원하는 브랜드 팝업에 참여하고, 함께 열어요!',
  descriptionEn:
    'Popup Store Crowdfunding Platform. Join your favorite brand popups and open them together!',
  url: 'https://zzik.app',
  ogImage: '/api/og',
  twitterHandle: '@zzik_app',
  locale: 'ko_KR',
  alternateLocale: 'en_US',
  themeColor: '#FF6B5B',
  backgroundColor: '#08090a',
  keywords: [
    '팝업스토어',
    '크라우드펀딩',
    'ZZIK',
    '찍',
    '팝업',
    'popup',
    'crowdfunding',
    'K-브랜드',
    '브랜드체험',
    '팝업예약',
  ],
} as const;

// ============================================
// Viewport Configuration
// ============================================

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: siteConfig.themeColor },
    { media: '(prefers-color-scheme: dark)', color: siteConfig.backgroundColor },
  ],
  colorScheme: 'dark',
};

// ============================================
// Base Metadata
// ============================================

export const baseMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.slogan}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: 'ZZIK Team' }],
  creator: 'ZZIK',
  publisher: 'ZZIK',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.svg' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/icon-192.png', sizes: '180x180' }],
    shortcut: '/favicon.svg',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    alternateLocale: siteConfig.alternateLocale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | ${siteConfig.slogan}`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - ${siteConfig.slogan}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} | ${siteConfig.slogan}`,
    description: siteConfig.description,
    creator: siteConfig.twitterHandle,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    // yandex: '',
    // bing: '',
  },
  alternates: {
    canonical: siteConfig.url,
    languages: {
      'ko-KR': `${siteConfig.url}/ko`,
      'en-US': `${siteConfig.url}/en`,
    },
  },
  category: 'technology',
};

// ============================================
// Page Metadata Generators
// ============================================

interface PageMetaOptions {
  title: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  noIndex?: boolean;
}

/**
 * Generate metadata for a page
 */
export function generatePageMeta({
  title,
  description = siteConfig.description,
  keywords = [],
  image = siteConfig.ogImage,
  url = siteConfig.url,
  noIndex = false,
}: PageMetaOptions): Metadata {
  const fullKeywords = [...siteConfig.keywords, ...keywords];

  return {
    title,
    description,
    keywords: fullKeywords,
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      title: `${title} | ${siteConfig.name}`,
      description,
      images: [image],
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
    alternates: {
      canonical: url,
    },
  };
}

// ============================================
// Popup Metadata Generator
// ============================================

interface PopupMetaOptions {
  id: string;
  name: string;
  brand: string;
  description: string;
  imageUrl?: string;
  category?: string;
  currentParticipants?: number;
  targetParticipants?: number;
}

/**
 * Generate metadata for popup detail page
 */
export function generatePopupMeta({
  id,
  name,
  brand,
  description,
  imageUrl,
  category,
  currentParticipants,
  targetParticipants,
}: PopupMetaOptions): Metadata {
  const title = `${name} | ${brand}`;
  const metaDescription = description.slice(0, 160);
  const url = `${siteConfig.url}/popup/${id}`;
  const image = imageUrl || siteConfig.ogImage;

  const keywords: string[] = [brand, name, '팝업스토어', '팝업', category || ''].filter(Boolean);

  // Add participation info to description if available
  const enhancedDescription =
    currentParticipants && targetParticipants
      ? `${metaDescription} | ${currentParticipants}/${targetParticipants}명 참여중`
      : metaDescription;

  return {
    title,
    description: enhancedDescription,
    keywords,
    openGraph: {
      type: 'article',
      title: `${title} | ${siteConfig.name}`,
      description: enhancedDescription,
      url,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${brand} - ${name}`,
        },
      ],
      authors: [brand],
      tags: keywords,
    },
    twitter: {
      title: `${title} | ${siteConfig.name}`,
      description: enhancedDescription,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  };
}

// ============================================
// JSON-LD Structured Data
// ============================================

interface OrganizationJsonLd {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  sameAs?: string[];
  contactPoint?: {
    '@type': 'ContactPoint';
    telephone: string;
    contactType: string;
  };
}

/**
 * Generate Organization JSON-LD
 */
export function generateOrganizationJsonLd(): OrganizationJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    sameAs: ['https://instagram.com/zzik_app', 'https://twitter.com/zzik_app'],
  };
}

interface WebsiteJsonLd {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  description: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

/**
 * Generate Website JSON-LD
 */
export function generateWebsiteJsonLd(): WebsiteJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

interface EventJsonLd {
  '@context': 'https://schema.org';
  '@type': 'Event';
  name: string;
  description: string;
  url: string;
  image?: string;
  startDate?: string;
  endDate?: string;
  location?: {
    '@type': 'Place';
    name: string;
    address?: string;
  };
  organizer?: {
    '@type': 'Organization';
    name: string;
    url?: string;
  };
  offers?: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
    availability: string;
  };
}

interface PopupJsonLdOptions {
  id: string;
  name: string;
  brand: string;
  description: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  location?: {
    name: string;
    address: string;
  };
}

/**
 * Generate Event JSON-LD for popup
 */
export function generatePopupJsonLd({
  id,
  name,
  brand,
  description,
  imageUrl,
  startDate,
  endDate,
  location,
}: PopupJsonLdOptions): EventJsonLd {
  const eventJsonLd: EventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `${brand} - ${name}`,
    description,
    url: `${siteConfig.url}/popup/${id}`,
    image: imageUrl,
    organizer: {
      '@type': 'Organization',
      name: brand,
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
      availability: 'https://schema.org/InStock',
    },
  };

  if (startDate) {
    eventJsonLd.startDate = startDate;
  }
  if (endDate) {
    eventJsonLd.endDate = endDate;
  }
  if (location) {
    eventJsonLd.location = {
      '@type': 'Place',
      name: location.name,
      address: location.address,
    };
  }

  return eventJsonLd;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbJsonLd {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: {
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }[];
}

/**
 * Generate BreadcrumbList JSON-LD
 */
export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]): BreadcrumbJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteConfig.url}${item.url}`,
    })),
  };
}

// ============================================
// JSON-LD Script Generator
// ============================================

/**
 * Generate JSON-LD script tag content
 */
export function jsonLdScript(data: Record<string, unknown>): string {
  return JSON.stringify(data);
}

// ============================================
// Canonical URL Generator
// ============================================

/**
 * Generate canonical URL for a page
 */
export function generateCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${siteConfig.url}${cleanPath}`;
}

// ============================================
// Sitemap Helpers
// ============================================

interface SitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Generate sitemap entry
 */
export function sitemapEntry(path: string, options?: Omit<SitemapEntry, 'url'>): SitemapEntry {
  return {
    url: generateCanonicalUrl(path),
    lastModified: options?.lastModified || new Date(),
    changeFrequency: options?.changeFrequency || 'weekly',
    priority: options?.priority || 0.5,
  };
}

/**
 * Static pages for sitemap
 */
export const staticPages: SitemapEntry[] = [
  sitemapEntry('/', { changeFrequency: 'daily', priority: 1 }),
  sitemapEntry('/map', { changeFrequency: 'daily', priority: 0.8 }),
  sitemapEntry('/live', { changeFrequency: 'daily', priority: 0.8 }),
  sitemapEntry('/onboarding', { changeFrequency: 'monthly', priority: 0.6 }),
  sitemapEntry('/auth/login', { changeFrequency: 'monthly', priority: 0.5 }),
  sitemapEntry('/help', { changeFrequency: 'monthly', priority: 0.5 }),
  sitemapEntry('/privacy', { changeFrequency: 'monthly', priority: 0.5 }),
];

// ============================================
// Robots.txt Helpers
// ============================================

export const robotsConfig = {
  rules: [
    {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/auth/callback', '/me/', '/leader/'],
    },
  ],
  sitemap: `${siteConfig.url}/sitemap.xml`,
};

export default {
  siteConfig,
  viewport,
  baseMetadata,
  generatePageMeta,
  generatePopupMeta,
  generateOrganizationJsonLd,
  generateWebsiteJsonLd,
  generatePopupJsonLd,
  generateBreadcrumbJsonLd,
  jsonLdScript,
  generateCanonicalUrl,
  sitemapEntry,
  staticPages,
  robotsConfig,
};
