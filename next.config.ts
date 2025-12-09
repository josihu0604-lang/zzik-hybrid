import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Package import optimizations - tree shaking
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
      '@headlessui/react',
      'date-fns',
      'react-map-gl',
      'mapbox-gl',
      '@supabase/supabase-js',
      'react-hook-form',
    ],
    // Performance optimizations
    optimizeCss: false,
    optimizeServerReact: true,
    // Partial Prerendering is now enabled via cacheComponents
    // Note: PPR feature moved to cacheComponents in Next.js 15+
  },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Optimize bundle splitting
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Separate vendor chunks
            mapbox: {
              test: /[\\/]node_modules[\\/](mapbox-gl|react-map-gl)[\\/]/,
              name: 'mapbox',
              priority: 20,
            },
            framer: {
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              name: 'framer',
              priority: 15,
            },
            supabase: {
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              name: 'supabase',
              priority: 10,
            },
          },
        },
      };
    }
    return config;
  },

  // Production optimizations
  productionBrowserSourceMaps: false,
  poweredByHeader: false,

  // Enable standalone output for Docker/Cloudflare optimizations
  output: 'standalone',

  // Headers for caching, security, and performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // PERF-001: Preconnect to critical third-party origins
          // Reduces connection latency by establishing early connections
          {
            key: 'Link',
            value: [
              '<https://fonts.googleapis.com>; rel=preconnect',
              '<https://fonts.gstatic.com>; rel=preconnect; crossorigin',
              '<https://api.mapbox.com>; rel=preconnect',
              '<https://www.googletagmanager.com>; rel=preconnect',
              '<https://www.google-analytics.com>; rel=preconnect',
            ].join(', '),
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
          {
            // CSP: Removed unsafe-eval (not needed), kept unsafe-inline for GA inline script
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://api.mapbox.com; " +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.mapbox.com; " +
              "font-src 'self' https://fonts.gstatic.com; " +
              "img-src 'self' data: blob: https://*.supabase.co https://*.mapbox.com; " +
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://*.mapbox.com https://*.ingest.sentry.io; " +
              "worker-src 'self' blob:; " +
              "frame-src 'self'; " +
              "frame-ancestors 'self'; " +
              "base-uri 'self'; " +
              "form-action 'self'; " +
              'upgrade-insecure-requests;',
          },
        ],
      },
      {
        // Static assets caching
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

// Apply Sentry configuration
const configWithSentry = withSentryConfig(withBundleAnalyzer(nextConfig), {
  // Sentry organization and project
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Hides source maps from generated client bundles
  sourcemaps: {
    disable: true,
  },

  // Automatically tree-shake Sentry logger statements
  disableLogger: true,

  // Routes browser requests to Sentry through a Next.js rewrite
  tunnelRoute: '/monitoring',

  // Enable automatic instrumentation of Vercel Cron Monitors
  automaticVercelMonitors: true,

  // Upload source maps during build
  widenClientFileUpload: true,
});

export default configWithSentry;
