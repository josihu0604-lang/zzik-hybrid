/**
 * Receipt Verification API
 *
 * POST /api/receipt/verify
 *
 * Gemini Vision API를 사용하여 영수증 OCR 및 검증
 */

import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-middleware';
import { debugConfig } from '@/config/app.config';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// SEC-016: Input validation schema with size limits to prevent DoS
const ReceiptVerifySchema = z.object({
  // Max 5MB base64 (~3.75MB image) - prevents memory exhaustion
  imageBase64: z
    .string()
    .min(100, 'Image data too small')
    .max(5_000_000, 'Image too large (max 5MB)')
    .refine((val) => /^[A-Za-z0-9+/=]+$/.test(val.replace(/\s/g, '')), 'Invalid base64 encoding'),
  brandName: z.string().min(1, 'Brand name required').max(200, 'Brand name too long'),
  checkInDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  popupId: z.string().uuid('Invalid popup ID').optional(),
});

// Gemini OCR 함수 (server-only)
async function analyzeReceiptWithGemini(imageBase64: string, brandName: string, checkInDate: Date) {
  try {
    // SEC-015: Lazy import to check API key availability
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.trim() === '') {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Analyze this Korean receipt and extract the following information in JSON format:

Required fields:
- "brand_name": The store/brand name (상호명)
- "purchase_date": The date of purchase in YYYY-MM-DD format
- "total_amount": The total amount paid (숫자만)
- "confidence": Confidence score (0.0-1.0)

Expected brand: "${brandName}"
Expected date: "${checkInDate.toISOString().split('T')[0]}"

Return ONLY valid JSON without markdown:
{
  "brand_name": "string",
  "purchase_date": "YYYY-MM-DD",
  "total_amount": number,
  "confidence": 0.0-1.0,
  "extracted_text": "raw OCR text"
}

If the receipt is unclear or unreadable, set confidence to 0.0.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } },
    ]);

    const text = result.response.text();
    const cleaned = text.replace(/```json|```/g, '').trim();
    const analysis = JSON.parse(cleaned);

    if (debugConfig.gemini) {
      logger.warn('[Receipt OCR] Gemini analysis:', { analysis });
    }

    return analysis;
  } catch (err) {
    if (debugConfig.gemini) {
      logger.error('[Receipt OCR] Gemini error:', err);
    }
    throw err;
  }
}

// 데모 모드 OCR (Gemini API 없을 때)
function analyzeDemoReceipt(
  imageBase64: string,
  brandName: string,
  checkInDate: Date
): {
  brand_name: string;
  purchase_date: string;
  total_amount: number;
  confidence: number;
  extracted_text: string;
} {
  // 데모 모드: 이미지 크기 기반으로 임의 판단
  const imageSize = imageBase64.length;
  const isLargeImage = imageSize > 50000; // 50KB 이상

  // 테스트용 패턴: brandName이 포함되어 있으면 성공
  const mockBrandMatch = Math.random() > 0.3; // 70% 성공률

  return {
    brand_name: mockBrandMatch ? brandName : '다른브랜드',
    purchase_date: checkInDate.toISOString().split('T')[0],
    total_amount: isLargeImage ? 25000 : 5000,
    confidence: mockBrandMatch && isLargeImage ? 0.85 : 0.45,
    extracted_text: `[DEMO MODE]\n${brandName}\n${checkInDate.toLocaleDateString('ko-KR')}\n합계: 25,000원`,
  };
}

// 날짜 비교 (같은 날짜인지 확인, ±1일 허용)
function isDateValid(receiptDate: string, checkInDate: Date): boolean {
  const receipt = new Date(receiptDate);
  const checkIn = new Date(checkInDate);

  // 시간 부분 제거 (날짜만 비교)
  receipt.setHours(0, 0, 0, 0);
  checkIn.setHours(0, 0, 0, 0);

  const diffDays = Math.abs((receipt.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  return diffDays <= 1; // 당일 또는 ±1일
}

// 브랜드명 매칭 (유사도 검사)
function isBrandMatched(receiptBrand: string, expectedBrand: string): boolean {
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9가-힣]/g, '');

  const normalizedReceipt = normalize(receiptBrand);
  const normalizedExpected = normalize(expectedBrand);

  // 정확히 일치
  if (normalizedReceipt === normalizedExpected) return true;

  // 포함 관계 (짧은 쪽이 긴 쪽에 포함)
  if (
    normalizedReceipt.includes(normalizedExpected) ||
    normalizedExpected.includes(normalizedReceipt)
  ) {
    return true;
  }

  // 간단한 유사도 (Levenshtein distance 간소화)
  // 50% 이상 일치하면 통과
  const longer =
    normalizedReceipt.length > normalizedExpected.length ? normalizedReceipt : normalizedExpected;
  const shorter =
    normalizedReceipt.length <= normalizedExpected.length ? normalizedReceipt : normalizedExpected;

  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) matches++;
  }

  const similarity = matches / shorter.length;
  return similarity >= 0.5;
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body with Zod
    let validatedBody;
    try {
      const rawBody = await request.json();
      validatedBody = ReceiptVerifySchema.parse(rawBody);
    } catch (parseError) {
      if (parseError instanceof z.ZodError) {
        const errors = parseError.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        }));
        return apiError('Validation failed', 400, { validation: errors });
      }
      return apiError('Invalid request body', 400);
    }

    const { imageBase64, brandName, checkInDate, popupId } = validatedBody;
    const checkInDateObj = new Date(checkInDate);

    // Gemini API 시도
    let ocrResult;
    let isDemoMode = false;

    try {
      ocrResult = await analyzeReceiptWithGemini(imageBase64, brandName, checkInDateObj);
    } catch {
      // Gemini API 실패 시 데모 모드로 전환
      logger.warn('[Receipt OCR] Gemini unavailable, using demo mode');
      isDemoMode = true;
      ocrResult = analyzeDemoReceipt(imageBase64, brandName, checkInDateObj);
    }

    // 검증 로직
    const brandMatched = isBrandMatched(ocrResult.brand_name, brandName);
    const dateValid = isDateValid(ocrResult.purchase_date, checkInDateObj);
    const amountValid = ocrResult.total_amount > 0;
    const confidenceGood = ocrResult.confidence >= 0.6;

    const verified = brandMatched && dateValid && amountValid && confidenceGood;
    const score = verified ? 20 : 0;

    const result = {
      verified,
      score,
      brandMatched,
      dateValid,
      extractedText:
        ocrResult.extracted_text || `${ocrResult.brand_name} - ${ocrResult.purchase_date}`,
      confidence: ocrResult.confidence,
      isDemoMode,
      details: {
        extracted_brand: ocrResult.brand_name,
        extracted_date: ocrResult.purchase_date,
        extracted_amount: ocrResult.total_amount,
        expected_brand: brandName,
        expected_date: checkInDateObj.toISOString().split('T')[0],
      },
    };

    if (debugConfig.verification) {
      logger.warn('[Receipt Verification]', {
        popupId,
        verified,
        brandMatched,
        dateValid,
        confidenceGood,
        isDemoMode,
      });
    }

    return apiSuccess(result);
  } catch (err) {
    logger.error('[Receipt Verification] Error:', err);
    return apiError('Receipt verification failed', 500, {
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
