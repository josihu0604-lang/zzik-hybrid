'use client';

import { useState, useMemo } from 'react';
import { m, AnimatePresence } from '@/lib/motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronDown, ChevronUp, ExternalLink, Search, Package } from 'lucide-react';
import { IconButton } from '@/components/ui/Button';
import { colors, radii, liquidGlass } from '@/lib/design-tokens';

/**
 * Open Source Licenses Page
 *
 * App Store Requirement:
 * - Must display all open source licenses used in the app
 * - Should be accessible from settings
 */

// ============================================================================
// LICENSE DATA
// ============================================================================

interface License {
  name: string;
  version: string;
  license: string;
  repository?: string;
  description?: string;
}

// Main dependencies with their licenses
const LICENSES: License[] = [
  // Core Framework
  {
    name: 'Next.js',
    version: '16.0.7',
    license: 'MIT',
    repository: 'https://github.com/vercel/next.js',
    description: 'The React Framework for the Web',
  },
  {
    name: 'React',
    version: '18.3.1',
    license: 'MIT',
    repository: 'https://github.com/facebook/react',
    description: 'A JavaScript library for building user interfaces',
  },
  {
    name: 'React DOM',
    version: '18.3.1',
    license: 'MIT',
    repository: 'https://github.com/facebook/react',
    description: 'React package for working with the DOM',
  },

  // UI & Animation
  {
    name: 'Framer Motion',
    version: '12.0.0',
    license: 'MIT',
    repository: 'https://github.com/framer/motion',
    description: 'Production-ready motion library for React',
  },
  {
    name: 'Lucide React',
    version: '0.555.0',
    license: 'ISC',
    repository: 'https://github.com/lucide-icons/lucide',
    description: 'Beautiful & consistent icon toolkit',
  },
  {
    name: 'Headless UI',
    version: '2.2.9',
    license: 'MIT',
    repository: 'https://github.com/tailwindlabs/headlessui',
    description: 'Completely unstyled, accessible UI components',
  },
  {
    name: 'Tailwind CSS',
    version: '4.1.17',
    license: 'MIT',
    repository: 'https://github.com/tailwindlabs/tailwindcss',
    description: 'A utility-first CSS framework',
  },

  // Backend & Database
  {
    name: 'Supabase JS',
    version: '2.84.0',
    license: 'MIT',
    repository: 'https://github.com/supabase/supabase-js',
    description: 'Isomorphic Javascript client for Supabase',
  },
  {
    name: 'Supabase SSR',
    version: '0.8.0',
    license: 'MIT',
    repository: 'https://github.com/supabase/auth-helpers',
    description: 'Server-side rendering helpers for Supabase',
  },

  // Maps & Location
  {
    name: 'Mapbox GL',
    version: '3.9.0',
    license: 'BSD-3-Clause',
    repository: 'https://github.com/mapbox/mapbox-gl-js',
    description: 'Interactive, customizable vector maps',
  },
  {
    name: 'React Map GL',
    version: '7.1.8',
    license: 'MIT',
    repository: 'https://github.com/visgl/react-map-gl',
    description: 'React wrapper for Mapbox GL JS',
  },

  // Utilities
  {
    name: 'date-fns',
    version: '4.1.0',
    license: 'MIT',
    repository: 'https://github.com/date-fns/date-fns',
    description: 'Modern JavaScript date utility library',
  },
  {
    name: 'Zod',
    version: '4.1.13',
    license: 'MIT',
    repository: 'https://github.com/colinhacks/zod',
    description: 'TypeScript-first schema validation',
  },
  {
    name: 'clsx',
    version: '2.1.1',
    license: 'MIT',
    repository: 'https://github.com/lukeed/clsx',
    description: 'A tiny utility for constructing className strings',
  },
  {
    name: 'tailwind-merge',
    version: '3.0.0',
    license: 'MIT',
    repository: 'https://github.com/dcastil/tailwind-merge',
    description: 'Merge Tailwind CSS classes without style conflicts',
  },

  // AI & ML
  {
    name: 'Google Generative AI',
    version: '0.24.0',
    license: 'Apache-2.0',
    repository: 'https://github.com/google/generative-ai-js',
    description: 'Google Generative AI SDK for JavaScript',
  },

  // Mobile (Capacitor)
  {
    name: 'Capacitor Core',
    version: '7.4.4',
    license: 'MIT',
    repository: 'https://github.com/ionic-team/capacitor',
    description: 'Cross-platform native runtime for web apps',
  },
  {
    name: 'Capacitor Camera',
    version: '7.0.2',
    license: 'MIT',
    repository: 'https://github.com/ionic-team/capacitor-plugins',
    description: 'Capacitor plugin for camera access',
  },
  {
    name: 'Capacitor Geolocation',
    version: '7.1.6',
    license: 'MIT',
    repository: 'https://github.com/ionic-team/capacitor-plugins',
    description: 'Capacitor plugin for geolocation',
  },

  // QR Code
  {
    name: 'html5-qrcode',
    version: '2.3.8',
    license: 'Apache-2.0',
    repository: 'https://github.com/mebjas/html5-qrcode',
    description: 'QR code & barcode scanner for HTML5',
  },

  // Push Notifications
  {
    name: 'web-push',
    version: '3.6.7',
    license: 'MIT',
    repository: 'https://github.com/web-push-libs/web-push',
    description: 'Web Push library for Node.js',
  },
];

// License texts (abbreviated)
const LICENSE_TEXTS: Record<string, string> = {
  MIT: `MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.`,

  'Apache-2.0': `Apache License 2.0

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.`,

  ISC: `ISC License

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE.`,

  'BSD-3-Clause': `BSD 3-Clause License

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.`,
};

// ============================================================================
// STYLES
// ============================================================================

const GLASS_CARD_STYLE = {
  ...liquidGlass.standard,
  borderRadius: radii.xl,
} as const;

// ============================================================================
// COMPONENTS
// ============================================================================

function LicenseItem({ license }: { license: License }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      style={{
        borderBottom: `1px solid ${colors.border.subtle}`,
      }}
    >
      <m.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-4 px-4 flex items-center justify-between text-left"
        whileTap={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255, 107, 91, 0.1)' }}
          >
            <Package size={18} style={{ color: colors.flame[500] }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate" style={{ color: colors.text.primary }}>
                {license.name}
              </p>
              <span
                className="text-micro px-2 py-0.5 rounded-full flex-shrink-0"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: colors.text.tertiary,
                }}
              >
                {license.version}
              </span>
            </div>
            <p className="text-micro mt-0.5" style={{ color: colors.text.tertiary }}>
              {license.license}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp size={20} style={{ color: colors.text.tertiary }} />
        ) : (
          <ChevronDown size={20} style={{ color: colors.text.tertiary }} />
        )}
      </m.button>

      <AnimatePresence>
        {isExpanded && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3" style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
              {license.description && (
                <p className="text-sm" style={{ color: colors.text.secondary }}>
                  {license.description}
                </p>
              )}

              {license.repository && (
                <a
                  href={license.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm"
                  style={{ color: colors.flame[500] }}
                >
                  <ExternalLink size={14} />
                  GitHub
                </a>
              )}

              <div
                className="p-3 rounded-lg text-micro font-mono whitespace-pre-wrap"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  color: colors.text.tertiary,
                  maxHeight: '200px',
                  overflow: 'auto',
                }}
              >
                {LICENSE_TEXTS[license.license] || `${license.license} License`}
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LicensesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLicenses = useMemo(() => {
    if (!searchQuery) return LICENSES;
    const query = searchQuery.toLowerCase();
    return LICENSES.filter(
      (license) =>
        license.name.toLowerCase().includes(query) || license.license.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Group by license type
  const licenseStats = useMemo(() => {
    const stats: Record<string, number> = {};
    LICENSES.forEach((license) => {
      stats[license.license] = (stats[license.license] || 0) + 1;
    });
    return stats;
  }, []);

  return (
    <div className="min-h-screen pb-8" style={{ background: colors.space[950] }}>
      {/* Header */}
      <div
        className="sticky top-0 z-30 px-4 py-4"
        style={{
          background: 'rgba(8, 9, 10, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${colors.border.subtle}`,
        }}
      >
        <div className="flex items-center gap-4">
          <IconButton
            icon={<ChevronLeft size={24} style={{ color: colors.text.primary }} />}
            onClick={() => router.back()}
            aria-label="뒤로 가기"
          />
          <div>
            <h1 className="text-xl font-bold" style={{ color: colors.text.primary }}>
              오픈소스 라이선스
            </h1>
            <p className="text-micro" style={{ color: colors.text.tertiary }}>
              {LICENSES.length}개의 오픈소스 패키지
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Stats */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Object.entries(licenseStats).map(([license, count]) => (
            <div
              key={license}
              className="flex-shrink-0 px-3 py-2 rounded-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${colors.border.subtle}`,
              }}
            >
              <p className="text-micro font-medium" style={{ color: colors.text.secondary }}>
                {license}
              </p>
              <p className="text-lg font-bold" style={{ color: colors.text.primary }}>
                {count}
              </p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: colors.text.tertiary }}
          />
          <input
            type="text"
            placeholder="패키지 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${colors.border.default}`,
              color: colors.text.primary,
              outline: 'none',
            }}
          />
        </div>

        {/* License List */}
        <div style={GLASS_CARD_STYLE} className="overflow-hidden">
          {filteredLicenses.length > 0 ? (
            filteredLicenses.map((license) => <LicenseItem key={license.name} license={license} />)
          ) : (
            <div className="py-12 text-center">
              <Package size={48} className="mx-auto mb-4" style={{ color: colors.text.muted }} />
              <p style={{ color: colors.text.tertiary }}>검색 결과가 없습니다</p>
            </div>
          )}
        </div>

        {/* Attribution */}
        <div
          className="p-4 rounded-xl text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: `1px solid ${colors.border.subtle}`,
          }}
        >
          <p className="text-micro" style={{ color: colors.text.muted }}>
            ZZIK는 위 오픈소스 프로젝트들의 기여자분들께 감사드립니다.
          </p>
        </div>
      </div>
    </div>
  );
}
