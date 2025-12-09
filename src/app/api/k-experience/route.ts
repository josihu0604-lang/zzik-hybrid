// src/app/api/k-experience/route.ts
// K-Experience API - 체험 목록 조회

import { NextResponse } from 'next/server';
import { MOCK_EXPERIENCES } from '@/lib/k-experience-data';

/**
 * GET /api/k-experience
 * 
 * Query Parameters:
 * - category: Filter by category (kpop, kdrama, kbeauty, kfood, kfashion)
 * - locale: Language for localized content (default: en)
 * - featured: Filter featured only (true/false)
 * - sort: Sort by (popular, latest, rating, price-low, price-high)
 * - limit: Number of results (default: 20)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const locale = url.searchParams.get('locale') || 'en';
    const featured = url.searchParams.get('featured');
    const sort = url.searchParams.get('sort') || 'popular';
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // 필터링
    let filtered = [...MOCK_EXPERIENCES];

    if (category) {
      filtered = filtered.filter((exp) => exp.category === category);
    }

    if (featured === 'true') {
      filtered = filtered.filter((exp) => exp.featured);
    }

    // 정렬
    switch (sort) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.pricing.amount - b.pricing.amount);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.pricing.amount - a.pricing.amount);
        break;
      case 'popular':
      default:
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    // 페이지네이션
    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    // 로케일에 맞게 데이터 변환
    const localized = paginated.map((exp) => ({
      id: exp.id,
      category: exp.category,
      title: exp.title[locale] || exp.title.en,
      description: exp.description[locale] || exp.description.en,
      thumbnail: exp.thumbnail,
      images: exp.images,
      location: {
        name: exp.location.name[locale] || exp.location.name.en,
        address: exp.location.address,
        coordinates: exp.location.coordinates,
      },
      pricing: exp.pricing,
      rating: exp.rating,
      reviewCount: exp.reviewCount,
      tags: exp.tags,
      verified: exp.verified,
      featured: exp.featured,
      availableSlots: exp.availableSlots,
      duration: exp.duration[locale] || exp.duration.en,
      language: exp.language,
      startDate: exp.startDate,
      endDate: exp.endDate,
    }));

    return NextResponse.json({
      success: true,
      data: {
        experiences: localized,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    });
  } catch (error) {
    console.error('K-Experience API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch experiences' },
      { status: 500 }
    );
  }
}
