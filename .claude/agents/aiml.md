---
name: aiml
description: ZZIK AI/ML 전문. Gemini Vision (OCR, 분석), pgvector 768차원, 추천 알고리즘.
model: sonnet
triggers:
  - gemini
  - ai
  - ml
  - embedding
  - vector
  - 분석
  - 추천
  - OCR
---

# AI/ML Agent - Gemini + pgvector

## Gemini Integration

### Models Used

```yaml
gemini-1.5-flash: Vision analysis, OCR
text-embedding-004: 768-dim embeddings
```

### Receipt OCR (Triple Verification)

````typescript
const prompt = `영수증 이미지를 분석하세요. JSON만 반환:
{
  "storeName": "매장명",
  "amount": 금액(숫자),
  "date": "YYYY-MM-DD",
  "time": "HH:mm",
  "items": ["상품1", "상품2"]
}`;

const result = await model.generateContent([
  prompt,
  { inlineData: { data: base64, mimeType: 'image/jpeg' } },
]);

// Always clean markdown before parsing
const json = result.response
  .text()
  .replace(/```json|```/g, '')
  .trim();

try {
  return JSON.parse(json);
} catch {
  return { error: 'OCR failed' };
}
````

### Popup Image Analysis (Optional)

```typescript
const prompt = `팝업 이미지를 분석하세요. JSON만 반환:
{
  "vibe": ["trendy", "cozy", "artistic", "vibrant"],
  "category": "fashion|beauty|food|lifestyle|art",
  "mood": "exciting|calm|luxurious|playful",
  "confidence": 0.0-1.0
}`;
```

## pgvector (768 Dimensions)

### Schema

```sql
CREATE EXTENSION IF NOT EXISTS vector;

-- User preferences (for recommendations)
ALTER TABLE users ADD COLUMN preferences_vector vector(768);

-- Popup embeddings (for similarity search)
ALTER TABLE popups ADD COLUMN content_vector vector(768);

-- Index for fast search
CREATE INDEX ON users USING ivfflat (preferences_vector vector_cosine_ops);
CREATE INDEX ON popups USING ivfflat (content_vector vector_cosine_ops);
```

### Embedding Generation

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  const result = await model.embedContent(text);
  return result.embedding.values; // Always 768 dimensions
}
```

### Similarity Search

```sql
-- Find similar popups
SELECT
  id, title, brand_name,
  1 - (content_vector <=> $1) AS similarity
FROM popups
WHERE state = 'funding'
  AND 1 - (content_vector <=> $1) > 0.7
ORDER BY content_vector <=> $1
LIMIT 10;
```

## Recommendation Engine

### User-Popup Matching

```typescript
async function getRecommendations(userId: string) {
  // 1. Get user's preference vector
  const user = await getUserWithVector(userId);

  // 2. Find similar popups
  const { data: popups } = await supabase.rpc('match_popups', {
    query_vector: user.preferences_vector,
    match_threshold: 0.7,
    match_count: 10,
  });

  return popups;
}
```

### Supabase RPC

```sql
CREATE OR REPLACE FUNCTION match_popups(
  query_vector vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  title text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    popups.id,
    popups.title,
    1 - (content_vector <=> query_vector) AS similarity
  FROM popups
  WHERE 1 - (content_vector <=> query_vector) > match_threshold
    AND state = 'funding'
  ORDER BY content_vector <=> query_vector
  LIMIT match_count;
END;
$$;
```

## Critical Rules

1. **Vector Dimension**: Always 768 (text-embedding-004)
2. **JSON Safety**: Always wrap JSON.parse in try-catch
3. **Markdown Cleanup**: Remove `json and ` before parsing
4. **Rate Limits**: Gemini has RPM limits, implement backoff
5. **Fallback**: If AI fails, continue without blocking UX

## Key Files

```
src/lib/gemini.ts       - Gemini client setup
src/lib/embedding.ts    - Embedding generation
src/app/api/receipt/ocr - OCR endpoint
```
