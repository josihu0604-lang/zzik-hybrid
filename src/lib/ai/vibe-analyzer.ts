/**
 * Enhanced Vibe Analyzer for ZZIK
 *
 * Analyzes popup descriptions and generates vibe tags automatically
 * Supports both real Gemini API and demo mode
 */
import 'server-only';

import type { PopupVibeAnalysis } from './types';

// ============================================================================
// Gemini Integration (with graceful degradation)
// ============================================================================

let geminiAvailable = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let analyzePhotoVibe: ((imageBase64: string) => Promise<any>) | null = null;
let generateEmbedding: ((text: string) => Promise<number[]>) | null = null;

// Dynamic import for Gemini (graceful degradation)
async function initGemini() {
  try {
    const gemini = await import('@/lib/gemini');
    analyzePhotoVibe = gemini.analyzePhotoVibe;
    generateEmbedding = gemini.generateEmbedding;
    geminiAvailable = true;
  } catch {
    console.warn('[VibeAnalyzer] Gemini not available, using demo mode');
    geminiAvailable = false;
  }
}
initGemini();

// ============================================================================
// Text-to-Vibe Analysis (Gemini)
// ============================================================================

const POPUP_VIBE_PROMPT = `다음 팝업 설명을 분석하여 감성 태그를 추출하세요. JSON만 반환 (마크다운 없이):

분위기 카테고리:
- 감성 (gamseong): 서정적이고 감성적인
- 힙스터 (hipster): 모던하고 세련된
- 레트로 (retro): 복고풍, 빈티지
- 아늑함 (cozy): 따뜻하고 포근한
- 모던 (modern): 현대적이고 세련된
- 전통 (traditional): 한국 전통미
- 활기참 (vibrant): 에너지 넘치는
- 로맨틱 (romantic): 감성적이고 낭만적

타겟층:
- 10대, 20대, 30대, 40대+
- MZ세대, 밀레니얼, Z세대
- 커플, 친구, 가족, 1인

어필 키워드:
- 인생샷, 힐링, 데이트, 포토존, 체험, 한정판, 콜라보 등

{
  "vibe": "감성|힙스터|레트로|아늑함|모던|전통|활기참|로맨틱",
  "location_type": "카페|식당|갤러리|팝업스토어|체험관|전시관",
  "mood": "여유로움|활력|로맨틱|신비로움|즐거움",
  "visual_tags": ["태그1", "태그2", "태그3"],
  "confidence": 0.0-1.0,
  "categories": ["패션", "뷰티", "K-POP", "라이프스타일"],
  "target_demographics": ["MZ세대", "20대"],
  "appeal_keywords": ["인생샷", "포토존", "한정판"]
}`;

/**
 * Analyze popup description and generate vibe tags
 */
export async function analyzePopupDescription(
  description: string,
  _imageUrl?: string
): Promise<PopupVibeAnalysis | null> {
  // Demo mode fallback
  if (!geminiAvailable || !generateEmbedding) {
    return generateDemoVibe(description);
  }

  try {
    // Use Gemini for text analysis
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `${POPUP_VIBE_PROMPT}\n\n팝업 설명:\n${description}`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json|```/g, '').trim();
    const analysis = JSON.parse(cleaned) as PopupVibeAnalysis;

    return analysis;
  } catch (error) {
    console.error('[VibeAnalyzer] Analysis failed:', error);
    return generateDemoVibe(description);
  }
}

/**
 * Generate embedding vector for popup
 */
export async function generatePopupEmbedding(popup: {
  title: string;
  description?: string;
  category: string;
  location: string;
}): Promise<number[] | null> {
  if (!geminiAvailable || !generateEmbedding) {
    return generateDemoEmbedding();
  }

  try {
    const text = `
      Title: ${popup.title}
      Description: ${popup.description || ''}
      Category: ${popup.category}
      Location: ${popup.location}
    `;

    const embedding = await generateEmbedding(text);
    return embedding;
  } catch (error) {
    console.error('[VibeAnalyzer] Embedding generation failed:', error);
    return generateDemoEmbedding();
  }
}

// ============================================================================
// Demo Mode Implementations
// ============================================================================

function generateDemoVibe(description: string): PopupVibeAnalysis {
  // Simple keyword-based analysis for demo
  const text = description.toLowerCase();

  let vibe = 'modern';
  if (text.includes('감성') || text.includes('서정')) vibe = 'gamseong';
  else if (text.includes('힙') || text.includes('세련')) vibe = 'hipster';
  else if (text.includes('복고') || text.includes('빈티지')) vibe = 'retro';
  else if (text.includes('아늑') || text.includes('포근')) vibe = 'cozy';
  else if (text.includes('전통') || text.includes('한옥')) vibe = 'traditional';
  else if (text.includes('활기') || text.includes('에너지')) vibe = 'vibrant';
  else if (text.includes('로맨틱') || text.includes('낭만')) vibe = 'romantic';

  const categories: string[] = [];
  if (text.includes('패션') || text.includes('옷') || text.includes('의류'))
    categories.push('패션');
  if (text.includes('뷰티') || text.includes('화장품') || text.includes('메이크업'))
    categories.push('뷰티');
  if (text.includes('아이돌') || text.includes('k-pop') || text.includes('케이팝'))
    categories.push('K-POP');
  if (text.includes('음식') || text.includes('맛집')) categories.push('음식');
  if (text.includes('카페') || text.includes('커피')) categories.push('카페');

  const appeal: string[] = [];
  if (text.includes('인생샷') || text.includes('포토')) appeal.push('인생샷');
  if (text.includes('한정') || text.includes('리미티드')) appeal.push('한정판');
  if (text.includes('콜라보') || text.includes('협업')) appeal.push('콜라보');
  if (text.includes('체험')) appeal.push('체험');

  return {
    vibe,
    location_type: text.includes('카페') ? 'cafe' : 'popup_store',
    mood: 'joyful',
    visual_tags: appeal.length > 0 ? appeal : ['팝업스토어'],
    confidence: 0.6,
    categories: categories.length > 0 ? categories : ['라이프스타일'],
    target_demographics: ['MZ세대', '20대'],
    appeal_keywords: appeal.length > 0 ? appeal : ['체험', '한정판'],
  };
}

function generateDemoEmbedding(): number[] {
  // Generate random 768-dimensional vector for demo
  // In production, this would be from Gemini text-embedding-004
  const embedding: number[] = [];
  for (let i = 0; i < 768; i++) {
    embedding.push(Math.random() * 2 - 1); // Range: -1 to 1
  }

  // Normalize
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map((val) => val / norm);
}

// ============================================================================
// Batch Processing
// ============================================================================

export async function analyzePopupsBatch(
  popups: Array<{ id: string; title: string; description?: string; category: string }>
): Promise<Map<string, PopupVibeAnalysis>> {
  const results = new Map<string, PopupVibeAnalysis>();

  // Process in parallel with rate limiting
  const batchSize = 5;
  for (let i = 0; i < popups.length; i += batchSize) {
    const batch = popups.slice(i, i + batchSize);
    const promises = batch.map(async (popup) => {
      const analysis = await analyzePopupDescription(popup.description || popup.title);
      if (analysis) {
        results.set(popup.id, analysis);
      }
    });

    await Promise.all(promises);

    // Rate limiting: wait between batches
    if (i + batchSize < popups.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

// ============================================================================
// Service Status
// ============================================================================

export function isGeminiAvailable(): boolean {
  return geminiAvailable;
}

export function getServiceInfo() {
  return {
    available: geminiAvailable,
    demoMode: !geminiAvailable,
    features: {
      textAnalysis: geminiAvailable,
      embedding: geminiAvailable,
      imageAnalysis: geminiAvailable && analyzePhotoVibe !== null,
    },
  };
}
