/**
 * JSON-LD Component
 *
 * Renders structured data scripts for SEO
 */

'use client';

import Script from 'next/script';
import {
  generateOrganizationJsonLd,
  generateWebsiteJsonLd,
  generatePopupJsonLd,
  generateBreadcrumbJsonLd,
} from '@/lib/seo';

// ============================================
// Base JSON-LD Component

// ============================================
// Security: JSON-LD Sanitization
// ============================================

/**
 * SEC-007 FIX: Sanitize JSON-LD data to prevent XSS
 *
 * The main attack vector is injecting </script> tags within JSON values,
 * which would break out of the JSON-LD script and allow arbitrary JavaScript.
 */
function sanitizeJsonLdValue(value: unknown): unknown {
  if (typeof value === 'string') {
    // SEC-007 FIX: Remove/escape dangerous patterns that could break out of script
    return (
      value
        // Escape </script> to prevent script injection
        .replace(/<\/script>/gi, '<\\/script>')
        // Escape <!-- to prevent HTML comment injection
        .replace(/<!--/g, '<\\!--')
        // Escape --> to prevent HTML comment closure
        .replace(/-->/g, '--\\>')
        // Escape <script to prevent script tag injection
        .replace(/<script/gi, '<\\script')
    );
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeJsonLdValue);
  }

  if (value !== null && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      sanitized[key] = sanitizeJsonLdValue(val);
    }
    return sanitized;
  }

  return value;
}

/**
 * SEC-007 FIX: Safely stringify JSON-LD data
 */
function safeJsonLdStringify(data: JsonLdData): string {
  const sanitized = sanitizeJsonLdValue(data);
  return JSON.stringify(sanitized);
}

// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonLdData = Record<string, any>;

interface JsonLdProps {
  data: JsonLdData;
  id?: string;
}

/**
 * Render JSON-LD structured data
 */
export function JsonLd({ data, id }: JsonLdProps) {
  return (
    <Script
      id={id || 'json-ld'}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(data) }}
      strategy="afterInteractive"
    />
  );
}

// ============================================
// Organization JSON-LD
// ============================================

/**
 * Organization structured data
 */
export function OrganizationJsonLd() {
  const data = generateOrganizationJsonLd();
  return <JsonLd data={data} id="organization-jsonld" />;
}

// ============================================
// Website JSON-LD
// ============================================

/**
 * Website structured data with search action
 */
export function WebsiteJsonLd() {
  const data = generateWebsiteJsonLd();
  return <JsonLd data={data} id="website-jsonld" />;
}

// ============================================
// Popup Event JSON-LD
// ============================================

interface PopupJsonLdProps {
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
 * Popup Event structured data
 */
export function PopupJsonLd(props: PopupJsonLdProps) {
  const data = generatePopupJsonLd(props);
  return <JsonLd data={data} id={`popup-${props.id}-jsonld`} />;
}

// ============================================
// Breadcrumb JSON-LD
// ============================================

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumb structured data
 */
export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const data = generateBreadcrumbJsonLd(items);
  return <JsonLd data={data} id="breadcrumb-jsonld" />;
}

// ============================================
// FAQ JSON-LD
// ============================================

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQJsonLdProps {
  items: FAQItem[];
}

interface FAQJsonLdData {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: {
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }[];
}

/**
 * FAQ Page structured data
 */
export function FAQJsonLd({ items }: FAQJsonLdProps) {
  const data: FAQJsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return <JsonLd data={data} id="faq-jsonld" />;
}

// ============================================
// Product (Popup Campaign) JSON-LD
// ============================================

interface ProductJsonLdProps {
  name: string;
  description: string;
  image: string;
  brand: string;
  url: string;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

interface ProductJsonLdData {
  '@context': 'https://schema.org';
  '@type': 'Product';
  name: string;
  description: string;
  image: string;
  brand: {
    '@type': 'Brand';
    name: string;
  };
  url: string;
  offers: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
    availability: string;
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
  };
}

/**
 * Product structured data (for popup campaigns)
 */
export function ProductJsonLd({
  name,
  description,
  image,
  brand,
  url,
  aggregateRating,
}: ProductJsonLdProps) {
  const data: ProductJsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    url,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
      availability: 'https://schema.org/InStock',
    },
  };

  if (aggregateRating) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: aggregateRating.ratingValue,
      reviewCount: aggregateRating.reviewCount,
    };
  }

  return <JsonLd data={data} id="product-jsonld" />;
}

// ============================================
// Local Business JSON-LD
// ============================================

interface LocalBusinessJsonLdProps {
  name: string;
  description: string;
  image?: string;
  address: string;
  geo?: {
    latitude: number;
    longitude: number;
  };
  telephone?: string;
  openingHours?: string[];
  priceRange?: string;
}

interface LocalBusinessJsonLdData {
  '@context': 'https://schema.org';
  '@type': 'LocalBusiness';
  name: string;
  description: string;
  image?: string;
  address: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressCountry: 'KR';
  };
  geo?: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
  telephone?: string;
  openingHoursSpecification?: {
    '@type': 'OpeningHoursSpecification';
    dayOfWeek: string[];
    opens: string;
    closes: string;
  };
  priceRange?: string;
}

/**
 * Local Business structured data (for popup locations)
 */
export function LocalBusinessJsonLd({
  name,
  description,
  image,
  address,
  geo,
  telephone,
  openingHours,
  priceRange,
}: LocalBusinessJsonLdProps) {
  const data: LocalBusinessJsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    description,
    image,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressCountry: 'KR',
    },
    priceRange,
  };

  if (geo) {
    data.geo = {
      '@type': 'GeoCoordinates',
      latitude: geo.latitude,
      longitude: geo.longitude,
    };
  }

  if (telephone) {
    data.telephone = telephone;
  }

  if (openingHours && openingHours.length > 0) {
    // Parse simple format like "Mon-Fri 10:00-20:00"
    data.openingHoursSpecification = {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '10:00',
      closes: '20:00',
    };
  }

  return <JsonLd data={data} id="local-business-jsonld" />;
}

// ============================================
// Combined Base JSON-LD
// ============================================

/**
 * Base structured data for all pages
 * Includes Organization and Website schemas
 */
export function BaseJsonLd() {
  return (
    <>
      <OrganizationJsonLd />
      <WebsiteJsonLd />
    </>
  );
}

export default {
  JsonLd,
  OrganizationJsonLd,
  WebsiteJsonLd,
  PopupJsonLd,
  BreadcrumbJsonLd,
  FAQJsonLd,
  ProductJsonLd,
  LocalBusinessJsonLd,
  BaseJsonLd,
};
