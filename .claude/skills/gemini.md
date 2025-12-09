---
name: gemini
description: Gemini Vision API, 768차원 Embedding, JSON 파싱
---

# Gemini Integration

## Setup
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
```

## Photo Analysis
```typescript
export async function analyzePhotoVibe(imageBase64: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const prompt = `Analyze this travel photo. Return JSON only (no markdown):
{
  "vibe": "cozy|modern|traditional|peaceful|artistic|vintage|vibrant|romantic",
  "location_type": "cafe|restaurant|nature|urban|beach|mountain|temple|museum",
  "mood": "relaxing|energetic|romantic|mysterious|joyful",
  "visual_tags": ["tag1", "tag2", "tag3"],
  "confidence": 0.0-1.0
}`;

  try {
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
    ]);

    // CRITICAL: Remove markdown backticks
    const text = result.response.text();
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return null;
  }
}
```

## Embedding (768 dimensions)
```typescript
export async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values; // 768 dimensions
}

// Usage
const embedding = await generateEmbedding(
  `Vibe: ${analysis.vibe}, Location: ${analysis.location_type}, Tags: ${analysis.visual_tags.join(', ')}`
);
```

## Critical Rules
1. **Vector: 768 dimensions** (text-embedding-004)
2. **Always try-catch** JSON.parse
3. **Remove markdown** before parsing
4. **Model versions:**
   - Vision: `gemini-2.0-flash-exp`
   - Embedding: `text-embedding-004`
