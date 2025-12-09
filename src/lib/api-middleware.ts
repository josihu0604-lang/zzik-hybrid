import { NextResponse } from 'next/server';
import { z } from 'zod';

export function apiSuccess(data: any, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400, details?: any) {
  return NextResponse.json({ success: false, error: message, details }, { status });
}

export function withMiddleware(handler: Function) {
  return async (req: Request, context: any) => {
    try {
      return await handler(req, context);
    } catch (error: any) {
      console.error('[API Error]', error);
      return apiError(error.message || 'Internal Server Error', 500, error);
    }
  };
}

export function validateRedirectUrl(url: string | null, fallback = '/') {
  if (!url) return fallback;
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  try {
    const parsed = new URL(url);
    if (parsed.origin === process.env.NEXT_PUBLIC_APP_URL) return url;
  } catch (e) {}
  return fallback;
}
