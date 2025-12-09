import { NextResponse } from 'next/server';

export function apiSuccess(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status = 500, details?: any) {
  return NextResponse.json({ error: message, details }, { status });
}
