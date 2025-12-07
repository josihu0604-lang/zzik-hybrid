/**
 * Content Compliance Module
 *
 * Prevents false advertising and exaggerated claims in popup content.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ContentComplianceCheck {
  id: string;
  contentType: 'proposal' | 'promotion' | 'live_show';
  status: 'pending' | 'approved' | 'flagged' | 'rejected';
  checkResults: ComplianceResult[];
  reviewedAt?: string;
  reviewedBy?: 'ai' | 'human';
}

export interface ComplianceResult {
  rule: ComplianceRule;
  passed: boolean;
  details?: string;
  evidence?: string;
}

export type ComplianceRule =
  | 'no_false_claims' // 허위 사실 금지
  | 'no_exaggeration' // 과장 금지
  | 'price_transparency' // 가격 투명성
  | 'terms_disclosure' // 조건 공개
  | 'sponsor_disclosure'; // 협찬 표시

// ============================================================================
// COMPLIANCE CHECKS
// ============================================================================

/**
 * Automated content compliance check
 */
export function checkContentCompliance(
  content: string,
  contentType: ContentComplianceCheck['contentType']
): ContentComplianceCheck {
  const results: ComplianceResult[] = [];

  // Rule 1: No false claims
  const falseClaimPatterns = [/100%\s*보장/gi, /무조건\s*(환불|반품)/gi, /최저가\s*보장/gi];
  const hasFalseClaims = falseClaimPatterns.some((pattern) => pattern.test(content));
  results.push({
    rule: 'no_false_claims',
    passed: !hasFalseClaims,
    details: hasFalseClaims ? '허위 또는 불가능한 약속이 포함되어 있습니다' : undefined,
  });

  // Rule 2: No exaggeration
  const exaggerationPatterns = [/세계\s*(최초|유일)/gi, /역대급/gi, /전무후무/gi];
  const hasExaggeration = exaggerationPatterns.some((pattern) => pattern.test(content));
  results.push({
    rule: 'no_exaggeration',
    passed: !hasExaggeration,
    details: hasExaggeration ? '과장된 표현이 포함되어 있습니다' : undefined,
  });

  // Rule 3: Price transparency
  const pricePatterns = [/가격|금액|비용|원|₩/gi];
  const hasPriceInfo = pricePatterns.some((pattern) => pattern.test(content));
  results.push({
    rule: 'price_transparency',
    passed: contentType === 'proposal' || hasPriceInfo,
    details: !hasPriceInfo ? '가격 정보가 명시되어야 합니다' : undefined,
  });

  const allPassed = results.every((r) => r.passed);

  return {
    id: `compliance-${Date.now()}`,
    contentType,
    status: allPassed ? 'approved' : 'flagged',
    checkResults: results,
    reviewedAt: new Date().toISOString(),
    reviewedBy: 'ai',
  };
}
