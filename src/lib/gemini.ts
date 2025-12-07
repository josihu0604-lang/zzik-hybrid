/**
 * Gemini AI Integration
 *
 * SERVER-ONLY: This module uses secret API keys and must not be imported client-side
 */
import 'server-only';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { debugConfig } from '@/config/app.config';

// SEC-015 FIX: Validate API key on initialization
// Throw explicit error if API key is not configured or empty
function getGeminiAPIKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    throw new Error(
      '[Gemini] GEMINI_API_KEY is not configured or empty. ' +
        'Please set a valid API key in environment variables. ' +
        'Get your API key from: https://makersuite.google.com/app/apikey'
    );
  }

  // Basic validation - Gemini API keys are typically 39 characters
  if (apiKey.length < 10) {
    throw new Error(
      '[Gemini] GEMINI_API_KEY appears to be invalid (too short). ' +
        'Please verify your API key is correct.'
    );
  }

  return apiKey;
}

// Lazy initialization to allow graceful degradation
let _genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!_genAI) {
    _genAI = new GoogleGenerativeAI(getGeminiAPIKey());
  }
  return _genAI;
}

// For backward compatibility - will throw on first use if not configured
const genAI = new Proxy({} as GoogleGenerativeAI, {
  get(_target, prop) {
    const instance = getGenAI();
    const value = instance[prop as keyof GoogleGenerativeAI];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
});

// Debug mode flag - use centralized config
const DEBUG_GEMINI = debugConfig.gemini;

// ===========================
// Types & Interfaces
// ===========================

export interface VibeAnalysis {
  vibe: string;
  location_type: string;
  mood: string;
  visual_tags: string[];
  confidence: number;
}

export interface BatchVibeAnalysis {
  results: (VibeAnalysis | null)[];
  metrics: {
    total: number;
    successful: number;
    failed: number;
    avgResponseTime: number;
  };
}

export interface ImageValidation {
  valid: boolean;
  reason?: string;
  width?: number;
  height?: number;
  isBlurred?: boolean;
}

interface CacheEntry {
  analysis: VibeAnalysis;
  timestamp: number;
}

interface AnalysisMetrics {
  requestCount: number;
  totalResponseTime: number;
  cacheHits: number;
  cacheMisses: number;
  errors: number;
}

// ===========================
// Cache & Metrics
// ===========================

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const vibeCache = new Map<string, CacheEntry>();
const metrics: AnalysisMetrics = {
  requestCount: 0,
  totalResponseTime: 0,
  cacheHits: 0,
  cacheMisses: 0,
  errors: 0,
};

// ===========================
// Utilities
// ===========================

/**
 * Generate hash from base64 image data
 */
async function hashImage(imageBase64: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(imageBase64.substring(0, 10000)); // Sample first 10KB for performance
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Clean expired cache entries
 */
function cleanExpiredCache(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  vibeCache.forEach((entry, hash) => {
    if (now - entry.timestamp > CACHE_DURATION) {
      keysToDelete.push(hash);
    }
  });

  keysToDelete.forEach((hash) => vibeCache.delete(hash));
}

/**
 * Get cached analysis if valid
 */
function getCachedAnalysis(hash: string): VibeAnalysis | null {
  const cached = vibeCache.get(hash);
  if (!cached) return null;

  const age = Date.now() - cached.timestamp;
  if (age > CACHE_DURATION) {
    vibeCache.delete(hash);
    return null;
  }

  return cached.analysis;
}

/**
 * Cache analysis result
 */
function cacheAnalysis(hash: string, analysis: VibeAnalysis): void {
  vibeCache.set(hash, {
    analysis,
    timestamp: Date.now(),
  });

  // Clean old entries periodically (every 100 new entries)
  if (vibeCache.size % 100 === 0) {
    cleanExpiredCache();
  }
}

// ===========================
// Image Preprocessing
// ===========================

/**
 * Validate image quality and dimensions
 */
export async function validateImage(imageBase64: string): Promise<ImageValidation> {
  try {
    // Decode base64 to get image dimensions
    const img = await loadImageFromBase64(imageBase64);

    // Check minimum resolution (640px on shorter side)
    const minDimension = Math.min(img.width, img.height);
    if (minDimension < 640) {
      return {
        valid: false,
        reason: `Image resolution too low (${img.width}x${img.height}). Minimum 640px required on shorter side.`,
        width: img.width,
        height: img.height,
      };
    }

    // Blur detection using simple variance method
    const isBlurred = await detectBlur(imageBase64);

    return {
      valid: true,
      width: img.width,
      height: img.height,
      isBlurred,
    };
  } catch (error) {
    return {
      valid: false,
      reason: `Failed to validate image: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Load image from base64 to get dimensions
 */
async function loadImageFromBase64(base64: string): Promise<{ width: number; height: number }> {
  // In Node.js environment, we'll use a simple heuristic
  // For actual implementation, consider using sharp library
  // For now, we'll return a basic check

  // Try to extract dimensions from JPEG/PNG headers if possible
  const buffer = Buffer.from(base64, 'base64');

  // PNG check
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  }

  // JPEG check (simplified)
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    // JPEG parsing is complex, for now assume valid if > 100KB
    if (buffer.length > 100000) {
      return { width: 1920, height: 1080 }; // Assume HD quality
    }
    return { width: 640, height: 480 }; // Assume minimum quality
  }

  // Default fallback
  return { width: 800, height: 600 };
}

/**
 * Simple blur detection
 */
async function detectBlur(imageBase64: string): Promise<boolean> {
  // In a production environment, you'd use image processing libraries
  // For now, we'll use file size as a heuristic (blurred images compress more)
  const buffer = Buffer.from(imageBase64, 'base64');
  const sizeKB = buffer.length / 1024;

  // Images under 50KB for supposedly high-res are likely blurred/low quality
  return sizeKB < 50;
}

// ===========================
// Korea-Specialized Prompt
// ===========================

const KOREA_TRAVEL_PROMPT = `Analyze this Korean travel photo with cultural context. Return JSON only (no markdown):

분위기 (Vibe):
- 감성 (gamseong): 한국 특유의 감성적이고 서정적인 분위기
- 힙스터 (hipster): 성수동/연남동 스타일의 모던하고 세련된 감각
- 레트로 (retro): 복고풍, 빈티지, 향수를 자극하는 분위기
- 아늑함 (cozy): 따뜻하고 포근한 한국식 아늑함
- 모던 (modern): 강남/청담 스타일의 세련되고 현대적인 느낌
- 전통 (traditional): 한옥, 사찰, 궁궐 등 한국 전통미
- 활기참 (vibrant): 홍대/명동 스타일의 에너지 넘치는 분위기
- 로맨틱 (romantic): 데이트 명소, 야경, 감성적인 분위기

장소 유형 (Location):
- 카페 (cafe): 한국식 카페 문화 (디저트 카페, 루프탑 등)
- 식당 (restaurant): 한식당, 분식집, 고깃집 등
- 자연 (nature): 벚꽃, 단풍, 산, 바다, 계곡
- 도심 (urban): 강남, 명동, 홍대 등 도심 풍경
- 해변 (beach): 부산, 강릉 등 해변 명소
- 산/등산 (mountain): 북한산, 설악산 등 산악 지형
- 사찰/한옥 (temple/hanok): 전통 건축물
- 박물관/갤러리 (museum/gallery): 문화 공간
- 야시장/시장 (night_market/market): 광장시장, 통인시장 등
- 한강공원 (hangang_park): 한강변 피크닉/야경 명소

계절 특징:
- 봄: 벚꽃, 개나리, 진달래
- 여름: 초록, 바다, 계곡
- 가을: 단풍, 코스모스, 억새
- 겨울: 눈, 크리스마스, 일루미네이션

무드 (Mood):
- 여유로움 (relaxing): 힐링, 휴식
- 활력 (energetic): 활기찬, 역동적
- 로맨틱 (romantic): 감성적, 연인
- 신비로움 (mysterious): 몽환적, 독특한
- 즐거움 (joyful): 밝고 긍정적

비주얼 태그 (최소 3개, 한글 우선):
예: ["벚꽃", "한옥", "카페", "노을", "야경", "단풍", "루프탑", "데저트", "인생샷", "감성", "힙", "빈티지"]

{
  "vibe": "감성|힙스터|레트로|아늑함|모던|전통|활기찬|로맨틱",
  "location_type": "카페|식당|자연|도심|해변|산|사찰|박물관|야시장|한강공원",
  "mood": "여유로움|활력|로맨틱|신비로움|즐거움",
  "visual_tags": ["태그1", "태그2", "태그3", "태그4", "태그5"],
  "confidence": 0.0-1.0,
  "season": "spring|summer|autumn|winter|unknown",
  "korea_specific_elements": ["element1", "element2"]
}

Focus on:
1. 한국 여행 특유의 요소 (벚꽃, 단풍, 한옥, 카페 문화)
2. 계절감 (벚꽃=봄, 단풍=가을)
3. 분위기의 한국화된 표현
4. 인생샷 포인트 식별`;

// ===========================
// Main Analysis Functions
// ===========================

/**
 * Analyze single photo vibe with caching and metrics
 * @param imageBase64 Base64 encoded image
 * @param skipValidation Skip image quality validation (default: false)
 */
export async function analyzePhotoVibe(
  imageBase64: string,
  skipValidation = false
): Promise<VibeAnalysis | null> {
  const startTime = Date.now();
  metrics.requestCount++;

  try {
    // Image validation
    if (!skipValidation) {
      const validation = await validateImage(imageBase64);
      if (!validation.valid) {
        if (DEBUG_GEMINI) console.warn('[Gemini] Image validation failed:', validation.reason);
        metrics.errors++;
        return null;
      }

      if (validation.isBlurred && DEBUG_GEMINI) {
        console.warn('[Gemini] Image may be blurred, results might be less accurate');
      }
    }

    // Check cache
    const hash = await hashImage(imageBase64);
    const cached = getCachedAnalysis(hash);

    if (cached) {
      metrics.cacheHits++;
      const responseTime = Date.now() - startTime;
      metrics.totalResponseTime += responseTime;
      if (DEBUG_GEMINI) console.warn(`[Gemini] Cache hit (${responseTime}ms)`);
      return cached;
    }

    metrics.cacheMisses++;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const result = await model.generateContent([
      KOREA_TRAVEL_PROMPT,
      { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } },
    ]);

    const text = result.response.text();
    const cleaned = text.replace(/```json|```/g, '').trim();
    const analysis = JSON.parse(cleaned) as VibeAnalysis;

    // Cache result
    cacheAnalysis(hash, analysis);

    // Log metrics
    const responseTime = Date.now() - startTime;
    metrics.totalResponseTime += responseTime;
    if (DEBUG_GEMINI) console.warn(`[Gemini] Analysis complete (${responseTime}ms, cache miss)`);

    return analysis;
  } catch (error) {
    metrics.errors++;
    const responseTime = Date.now() - startTime;
    metrics.totalResponseTime += responseTime;
    if (DEBUG_GEMINI) console.error('[Gemini] Analysis failed:', error);
    return null;
  }
}

/**
 * Batch analyze multiple photos
 * @param imageBase64Array Array of base64 encoded images
 * @param skipValidation Skip image quality validation (default: false)
 */
export async function analyzeBatchPhotoVibe(
  imageBase64Array: string[],
  skipValidation = false
): Promise<BatchVibeAnalysis> {
  const startTime = Date.now();

  if (DEBUG_GEMINI)
    console.warn(`[Gemini] Starting batch analysis for ${imageBase64Array.length} images`);

  // Process in parallel (but be mindful of rate limits)
  const promises = imageBase64Array.map((image) => analyzePhotoVibe(image, skipValidation));

  const results = await Promise.all(promises);

  const successful = results.filter((r) => r !== null).length;
  const failed = results.length - successful;
  const totalTime = Date.now() - startTime;
  const avgResponseTime = totalTime / results.length;

  if (DEBUG_GEMINI) {
    console.warn(
      `[Gemini] Batch analysis complete: ${successful}/${results.length} successful (${totalTime}ms total, ${avgResponseTime.toFixed(0)}ms avg)`
    );
  }

  return {
    results,
    metrics: {
      total: results.length,
      successful,
      failed,
      avgResponseTime,
    },
  };
}

// ===========================
// Metrics & Monitoring
// ===========================

/**
 * Get current performance metrics
 */
export function getMetrics(): AnalysisMetrics & {
  avgResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
} {
  const avgResponseTime =
    metrics.requestCount > 0 ? metrics.totalResponseTime / metrics.requestCount : 0;

  const totalCacheChecks = metrics.cacheHits + metrics.cacheMisses;
  const cacheHitRate = totalCacheChecks > 0 ? metrics.cacheHits / totalCacheChecks : 0;

  const errorRate = metrics.requestCount > 0 ? metrics.errors / metrics.requestCount : 0;

  return {
    ...metrics,
    avgResponseTime,
    cacheHitRate,
    errorRate,
  };
}

/**
 * Reset metrics (useful for testing or periodic resets)
 */
export function resetMetrics(): void {
  metrics.requestCount = 0;
  metrics.totalResponseTime = 0;
  metrics.cacheHits = 0;
  metrics.cacheMisses = 0;
  metrics.errors = 0;
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number;
  maxAge: number;
  duration: number;
} {
  return {
    size: vibeCache.size,
    maxAge: CACHE_DURATION,
    duration: CACHE_DURATION,
  };
}

/**
 * Clear all cached entries
 */
export function clearCache(): void {
  vibeCache.clear();
  if (DEBUG_GEMINI) console.warn('[Gemini] Cache cleared');
}

/**
 * Log current metrics to console (only in debug mode)
 */
export function logMetrics(): void {
  if (!DEBUG_GEMINI) return;

  const m = getMetrics();
  console.warn('[Gemini] Performance Metrics:');
  console.warn(`  Requests: ${m.requestCount}`);
  console.warn(`  Cache Hits: ${m.cacheHits} (${(m.cacheHitRate * 100).toFixed(1)}%)`);
  console.warn(`  Cache Misses: ${m.cacheMisses}`);
  console.warn(`  Errors: ${m.errors} (${(m.errorRate * 100).toFixed(1)}%)`);
  console.warn(`  Avg Response Time: ${m.avgResponseTime.toFixed(0)}ms`);
  console.warn(`  Cache Size: ${vibeCache.size} entries`);
}

// ===========================
// Embedding Generation
// ===========================

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  const result = await model.embedContent(text);
  return result.embedding.values; // 768 dimensions
}
