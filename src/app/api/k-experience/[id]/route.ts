
// src/app/api/k-experience/[id]/route.ts
// K-Experience API - 개별 체험 상세 조회

import { NextResponse } from 'next/server';
import { MOCK_EXPERIENCES } from '@/lib/k-experience-data';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const locale = url.searchParams.get('locale') || 'en';

    // Mock 데이터에서 조회
    const experience = MOCK_EXPERIENCES.find((exp) => exp.id === id);

    if (!experience) {
      return NextResponse.json(
        { success: false, error: 'Experience not found' },
        { status: 404 }
      );
    }

    // 로케일에 맞게 데이터 변환
    const localized = {
      id: experience.id,
      category: experience.category,
      title: experience.title[locale] || experience.title.en,
      description: experience.description[locale] || experience.description.en,
      thumbnail: experience.thumbnail,
      images: experience.images,
      location: {
        name: experience.location.name[locale] || experience.location.name.en,
        address: experience.location.address,
        coordinates: experience.location.coordinates,
      },
      pricing: experience.pricing,
      rating: experience.rating,
      reviewCount: experience.reviewCount,
      tags: experience.tags,
      verified: experience.verified,
      featured: experience.featured,
      availableSlots: experience.availableSlots,
      duration: experience.duration[locale] || experience.duration.en,
      language: experience.language,
      startDate: experience.startDate,
      endDate: experience.endDate,
      
      // Detailed fields
      fullDescription: experience.fullDescription?.[locale] || experience.fullDescription?.en || experience.description[locale],
      includes: experience.includes?.[locale] || experience.includes?.en || [],
      notIncludes: experience.notIncludes?.[locale] || experience.notIncludes?.en || [],
      schedule: experience.schedule?.map(item => ({
        time: item.time,
        activity: item.activity[locale] || item.activity.en
      })) || [],
      meetingPoint: experience.meetingPoint?.[locale] || experience.meetingPoint?.en || experience.location.address,
      host: experience.host ? {
        ...experience.host,
        description: experience.host.description[locale] || experience.host.description.en
      } : undefined,
      reviews: experience.reviews || [],
      faqs: experience.faqs?.map(faq => ({
        question: faq.question[locale] || faq.question.en,
        answer: faq.answer[locale] || faq.answer.en
      })) || []
    };

    return NextResponse.json({
      success: true,
      data: localized,
    });
  } catch (error) {
    console.error('K-Experience Detail API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch experience details' },
      { status: 500 }
    );
  }
}
