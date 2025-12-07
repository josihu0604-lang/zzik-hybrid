/**
 * Math Utilities
 *
 * Shared mathematical functions used across ZZIK algorithms
 * - Vector operations
 * - Similarity calculations
 * - Statistical functions
 */

// ============================================================================
// VECTOR OPERATIONS
// ============================================================================

/**
 * Calculate cosine similarity between two vectors
 *
 * Used in:
 * - Semantic search (embedding similarity)
 * - Recommendation engine (vibe matching)
 * - Collaborative filtering (user similarity)
 *
 * @param a First vector
 * @param b Second vector
 * @returns Similarity score between -1 and 1 (0 if vectors are incompatible)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator > 0 ? dotProduct / denominator : 0;
}

/**
 * Calculate Euclidean distance between two vectors
 *
 * @param a First vector
 * @param b Second vector
 * @returns Distance (0 if vectors are incompatible)
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

/**
 * Calculate dot product of two vectors
 *
 * @param a First vector
 * @param b Second vector
 * @returns Dot product (0 if vectors are incompatible)
 */
export function dotProduct(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result += a[i] * b[i];
  }

  return result;
}

/**
 * Calculate L2 norm (magnitude) of a vector
 *
 * @param v Vector
 * @returns Magnitude of the vector
 */
export function vectorNorm(v: number[]): number {
  if (v.length === 0) return 0;

  let sum = 0;
  for (let i = 0; i < v.length; i++) {
    sum += v[i] * v[i];
  }

  return Math.sqrt(sum);
}

/**
 * Normalize a vector to unit length
 *
 * @param v Vector to normalize
 * @returns Normalized vector (empty array if input is empty)
 */
export function normalizeVector(v: number[]): number[] {
  const norm = vectorNorm(v);
  if (norm === 0) return v;

  return v.map((x) => x / norm);
}

// ============================================================================
// STATISTICAL FUNCTIONS
// ============================================================================

/**
 * Calculate mean of an array of numbers
 *
 * @param values Array of numbers
 * @returns Mean value (0 if empty)
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calculate standard deviation of an array of numbers
 *
 * @param values Array of numbers
 * @returns Standard deviation (0 if empty)
 */
export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;

  const avg = mean(values);
  const squaredDiffs = values.map((v) => Math.pow(v - avg, 2));
  return Math.sqrt(mean(squaredDiffs));
}

/**
 * Clamp a value between min and max
 *
 * @param value Value to clamp
 * @param min Minimum value
 * @param max Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 *
 * @param a Start value
 * @param b End value
 * @param t Interpolation factor (0-1)
 * @returns Interpolated value
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}
