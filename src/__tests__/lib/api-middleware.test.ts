/**
 * API Middleware Tests
 */
import { describe, it, expect } from 'vitest';
import {
  apiError,
  apiSuccess,
  validateRedirectUrl,
  PopupParticipationSchema,
  PopupQuerySchema,
} from '@/lib/api-middleware';

// ============================================================================
// API ERROR TESTS
// ============================================================================

describe('apiError', () => {
  it('should return JSON error response with default status 400', async () => {
    const response = apiError('Test error');
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({ success: false, error: 'Test error' });
  });

  it('should return custom status code', async () => {
    const response = apiError('Not found', 404);
    expect(response.status).toBe(404);
  });

  it('should include details when provided', async () => {
    const response = apiError('Validation error', 422, {
      validation: [{ field: 'email', message: 'Invalid' }],
    });
    const body = await response.json();
    expect(body.details).toBeDefined();
  });
});

// ============================================================================
// API SUCCESS TESTS
// ============================================================================

describe('apiSuccess', () => {
  it('should return JSON success response', async () => {
    const response = apiSuccess({ id: '123' });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ success: true, data: { id: '123' } });
  });

  it('should return custom status code', async () => {
    const response = apiSuccess({ message: 'Created' }, 201);
    expect(response.status).toBe(201);
  });
});

// ============================================================================
// REDIRECT URL VALIDATION TESTS
// ============================================================================

describe('validateRedirectUrl', () => {
  it('should allow valid relative paths', () => {
    expect(validateRedirectUrl('/home')).toBe('/home');
    expect(validateRedirectUrl('/popup/123')).toBe('/popup/123');
  });

  it('should return fallback for null', () => {
    expect(validateRedirectUrl(null)).toBe('/');
    expect(validateRedirectUrl(null, '/home')).toBe('/home');
  });

  it('should block protocol-relative URLs', () => {
    expect(validateRedirectUrl('//evil.com')).toBe('/');
  });

  it('should block absolute URLs', () => {
    expect(validateRedirectUrl('http://evil.com')).toBe('/');
  });

  it('should block javascript protocol', () => {
    expect(validateRedirectUrl('/javascript:alert(1)')).toBe('/');
  });

  it('should block data protocol', () => {
    expect(validateRedirectUrl('/data:text/html,test')).toBe('/');
  });
});

// ============================================================================
// VALIDATION SCHEMA TESTS
// ============================================================================

describe('PopupParticipationSchema', () => {
  it('should validate correct data', () => {
    const result = PopupParticipationSchema.safeParse({
      popupId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid UUID', () => {
    const result = PopupParticipationSchema.safeParse({ popupId: 'invalid' });
    expect(result.success).toBe(false);
  });
});

describe('PopupQuerySchema', () => {
  it('should validate default values', () => {
    const result = PopupQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(20);
      expect(result.data.offset).toBe(0);
    }
  });

  it('should validate status filter', () => {
    ['funding', 'confirmed', 'completed', 'cancelled'].forEach((status) => {
      const result = PopupQuerySchema.safeParse({ status });
      expect(result.success).toBe(true);
    });
  });

  it('should reject invalid status', () => {
    const result = PopupQuerySchema.safeParse({ status: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('should reject limit out of range', () => {
    expect(PopupQuerySchema.safeParse({ limit: 0 }).success).toBe(false);
    expect(PopupQuerySchema.safeParse({ limit: 101 }).success).toBe(false);
  });
});
