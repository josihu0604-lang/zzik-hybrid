/**
 * 🤖 Claude Agent Cross-Validation System
 * =========================================
 * Supreme Council 검증 결과를 교차 검수하는 독립적 AI 에이전트 시스템
 * 
 * 목적: 4대 에이전트(Alpha, Beta, Gamma, Delta)의 판단을 
 *       Claude의 다중 페르소나로 재검증하여 투자자 신뢰도 극대화
 */

export interface ClaudeAgentPersona {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  evaluationFocus: string[];
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  systemPrompt: string;
}

export interface ValidationResult {
  agentId: string;
  score: number;
  confidence: number;
  verdict: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  timestamp: string;
}

export interface CrossValidationReport {
  metadata: {
    generatedAt: string;
    totalAgents: number;
    consensusThreshold: number;
    version: string;
  };
  agentResults: ValidationResult[];
  consensus: {
    averageScore: number;
    standardDeviation: number;
    finalVerdict: string;
    agreementRate: number;
  };
  supremeCouncilComparison: {
    councilScore: number;
    claudeScore: number;
    deviation: number;
    alignment: 'ALIGNED' | 'MINOR_DEVIATION' | 'MAJOR_DEVIATION';
  };
}

/**
 * 🎭 Claude Agent Personas for Cross-Validation
 * 각 페르소나는 독립적 관점에서 Supreme Council 결과를 검증
 */
export const CLAUDE_AGENT_PERSONAS: ClaudeAgentPersona[] = [
  {
    id: 'claude-vc-hawk',
    name: 'VC Hawk (벤처캐피탈 독수리)',
    role: 'Venture Capital Partner',
    expertise: ['Series A/B Investment', 'Startup Valuation', 'Exit Strategy', 'Portfolio Management'],
    evaluationFocus: [
      'Unit Economics 타당성',
      'Scalability & TAM',
      'Exit Opportunity (M&A/IPO)',
      'Team Execution Capability'
    ],
    riskTolerance: 'aggressive',
    systemPrompt: `당신은 실리콘밸리 Top-tier VC 파트너입니다. 10년간 300개 이상의 스타트업을 평가해왔고, 
    그 중 5개의 유니콘을 발굴했습니다. 당신의 평가 기준은 냉정합니다:
    - "10x Return이 불가능하면 투자하지 않는다"
    - "시장을 독점할 수 없으면 의미 없다"
    - "팀이 미쳤는지 확인한다 (Good Crazy)"
    Project U-100을 평가할 때, Supreme Council의 판단이 VC 관점에서도 유효한지 검증하세요.`
  },
  {
    id: 'claude-devil-advocate',
    name: "Devil's Advocate (악마의 변호인)",
    role: 'Contrarian Analyst',
    expertise: ['Risk Assessment', 'Failure Pattern Analysis', 'Black Swan Events', 'Regulatory Risk'],
    evaluationFocus: [
      '숨겨진 리스크 발굴',
      '실패 시나리오 분석',
      '규제 리스크 심층 검토',
      '경쟁사 대응 시나리오'
    ],
    riskTolerance: 'conservative',
    systemPrompt: `당신은 "악마의 변호인" 역할을 수행합니다. 모든 것을 의심하고, 
    Supreme Council이 놓쳤을 수 있는 리스크를 찾아내는 것이 임무입니다.
    - "왜 이게 실패할 수 있는가?"
    - "규제 당국이 이걸 막으면?"
    - "경쟁사가 6개월 안에 따라잡으면?"
    - "시장이 예상과 다르게 움직이면?"
    긍정적인 결론이 나더라도, 반드시 3가지 이상의 치명적 리스크를 제시해야 합니다.`
  },
  {
    id: 'claude-market-oracle',
    name: 'Market Oracle (시장 신탁)',
    role: 'Market Research Specialist',
    expertise: ['Tourism Industry', 'Fintech Trends', 'K-Beauty Market', 'Web3 Adoption'],
    evaluationFocus: [
      '방한 관광객 트렌드 분석',
      '스테이블코인 결제 시장 전망',
      'K-뷰티 글로벌 시장 성장성',
      '경쟁 환경 분석'
    ],
    riskTolerance: 'moderate',
    systemPrompt: `당신은 글로벌 컨설팅펌의 수석 시장분석가입니다.
    McKinsey, BCG, Bain 출신으로 15년간 아시아 시장을 분석해왔습니다.
    데이터 기반의 객관적 시장 분석을 제공합니다:
    - "TAM/SAM/SOM이 현실적인가?"
    - "시장 성장률 가정이 합리적인가?"
    - "경쟁 강도는 어느 정도인가?"
    - "규제 환경은 우호적인가?"
    Supreme Council의 시장 분석 가정을 검증하세요.`
  },
  {
    id: 'claude-tech-sage',
    name: 'Tech Sage (기술 현자)',
    role: 'Chief Technology Architect',
    expertise: ['Blockchain/Web3', 'Account Abstraction', 'AI/ML', 'Scalable Architecture'],
    evaluationFocus: [
      '기술 아키텍처 검증',
      'Account Abstraction 구현 타당성',
      'AI 피부분석 정확도',
      '오프라인 결제 Latency 문제'
    ],
    riskTolerance: 'moderate',
    systemPrompt: `당신은 20년 경력의 CTO 출신 기술 고문입니다.
    Google, Meta, Coinbase에서 일했고, 여러 블록체인 프로젝트의 기술 자문을 했습니다.
    기술적 실현 가능성을 냉정하게 평가합니다:
    - "Account Abstraction으로 진짜 UX 개선이 가능한가?"
    - "오프라인 결제에서 3초 이내 확정이 가능한가?"
    - "AI 피부분석의 정확도는 얼마나 되는가?"
    - "시스템 확장성은 충분한가?"
    Supreme Council Gamma의 기술 평가를 재검증하세요.`
  },
  {
    id: 'claude-regulatory-sentinel',
    name: 'Regulatory Sentinel (규제 파수꾼)',
    role: 'Compliance & Regulatory Expert',
    expertise: ['VASP Regulation', 'Financial Sandbox', 'Cross-border Payment', 'Data Privacy'],
    evaluationFocus: [
      'VASP 이슈 심층 분석',
      '포인트 시스템 법적 구조',
      '금융 규제 샌드박스 전략',
      '해외 유사 규제 사례'
    ],
    riskTolerance: 'conservative',
    systemPrompt: `당신은 금융 규제 전문 변호사입니다. 김앤장, Latham & Watkins에서 
    핀테크 및 가상자산 규제 업무를 담당했습니다. 
    Supreme Council Delta의 법적 판단을 더 엄격하게 검증합니다:
    - "포인트 시스템 우회가 법적으로 안전한가?"
    - "금감원이 문제 삼을 가능성은?"
    - "규제 샌드박스 승인 확률은 얼마인가?"
    - "해외 확장 시 각국 규제는?"
    가장 보수적인 시나리오를 기준으로 평가하세요.`
  }
];

/**
 * 📊 Evaluation Criteria Matrix
 */
export const EVALUATION_CRITERIA = {
  market: {
    weight: 0.25,
    factors: [
      { name: 'TAM Size', weight: 0.3 },
      { name: 'Growth Rate', weight: 0.25 },
      { name: 'Competition Intensity', weight: 0.25 },
      { name: 'Entry Barrier', weight: 0.2 }
    ]
  },
  technology: {
    weight: 0.25,
    factors: [
      { name: 'Technical Feasibility', weight: 0.3 },
      { name: 'Innovation Level', weight: 0.25 },
      { name: 'Scalability', weight: 0.25 },
      { name: 'UX Quality', weight: 0.2 }
    ]
  },
  business: {
    weight: 0.25,
    factors: [
      { name: 'Unit Economics', weight: 0.3 },
      { name: 'Revenue Model', weight: 0.25 },
      { name: 'Competitive Advantage', weight: 0.25 },
      { name: 'Execution Plan', weight: 0.2 }
    ]
  },
  risk: {
    weight: 0.25,
    factors: [
      { name: 'Regulatory Risk', weight: 0.35 },
      { name: 'Market Risk', weight: 0.25 },
      { name: 'Technology Risk', weight: 0.2 },
      { name: 'Operational Risk', weight: 0.2 }
    ]
  }
};

/**
 * 🎯 Verdict Mapping
 */
export const VERDICT_THRESHOLDS = {
  STRONG_BUY: { min: 85, label: '🚀 STRONG BUY', color: '#00C851' },
  BUY: { min: 70, label: '✅ BUY', color: '#33b5e5' },
  HOLD: { min: 55, label: '⏸️ HOLD', color: '#ffbb33' },
  SELL: { min: 40, label: '⚠️ SELL', color: '#ff8800' },
  STRONG_SELL: { min: 0, label: '🛑 STRONG SELL', color: '#ff4444' }
};

export function getVerdict(score: number): string {
  if (score >= VERDICT_THRESHOLDS.STRONG_BUY.min) return 'STRONG_BUY';
  if (score >= VERDICT_THRESHOLDS.BUY.min) return 'BUY';
  if (score >= VERDICT_THRESHOLDS.HOLD.min) return 'HOLD';
  if (score >= VERDICT_THRESHOLDS.SELL.min) return 'SELL';
  return 'STRONG_SELL';
}

export function calculateConsensus(results: ValidationResult[]): CrossValidationReport['consensus'] {
  const scores = results.map(r => r.score);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  
  // Agreement rate: % of agents within 10 points of average
  const agreementCount = scores.filter(s => Math.abs(s - avg) <= 10).length;
  const agreementRate = (agreementCount / scores.length) * 100;
  
  return {
    averageScore: Math.round(avg * 100) / 100,
    standardDeviation: Math.round(stdDev * 100) / 100,
    finalVerdict: getVerdict(avg),
    agreementRate: Math.round(agreementRate * 100) / 100
  };
}
