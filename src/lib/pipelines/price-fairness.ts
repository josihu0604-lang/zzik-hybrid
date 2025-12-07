/**
 * Price Fairness Module
 *
 * Prevents price inflation and ensures fair pricing in popup deals.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface PriceFairnessCheck {
  popupId: string;
  productId: string;
  marketPrice: number;
  offeredPrice: number;
  fairnessScore: number; // 0-100
  verdict: 'fair' | 'slightly_high' | 'overpriced' | 'suspicious';
  comparison: PriceComparison[];
}

export interface PriceComparison {
  source: string;
  price: number;
  date: string;
  url?: string;
}

// ============================================================================
// PRICE FAIRNESS CHECKS
// ============================================================================

/**
 * Check price fairness against market rates
 */
export function checkPriceFairness(
  offeredPrice: number,
  marketPrices: PriceComparison[]
): { fairnessScore: number; verdict: PriceFairnessCheck['verdict'] } {
  if (marketPrices.length === 0) {
    return { fairnessScore: 50, verdict: 'fair' }; // No data
  }

  const avgMarketPrice = marketPrices.reduce((sum, p) => sum + p.price, 0) / marketPrices.length;
  const priceRatio = offeredPrice / avgMarketPrice;

  // Fair: 0.85 - 1.15x market price
  // Slightly high: 1.15 - 1.30x
  // Overpriced: 1.30 - 1.50x
  // Suspicious: > 1.50x

  let fairnessScore: number;
  let verdict: PriceFairnessCheck['verdict'];

  if (priceRatio <= 0.85) {
    // Below market (suspicious low)
    fairnessScore = 70;
    verdict = 'fair';
  } else if (priceRatio <= 1.15) {
    fairnessScore = 100 - Math.abs(priceRatio - 1) * 100;
    verdict = 'fair';
  } else if (priceRatio <= 1.3) {
    fairnessScore = 70 - (priceRatio - 1.15) * 200;
    verdict = 'slightly_high';
  } else if (priceRatio <= 1.5) {
    fairnessScore = 40 - (priceRatio - 1.3) * 200;
    verdict = 'overpriced';
  } else {
    fairnessScore = Math.max(0, 20 - (priceRatio - 1.5) * 100);
    verdict = 'suspicious';
  }

  return {
    fairnessScore: Math.max(0, Math.min(100, fairnessScore)),
    verdict,
  };
}
