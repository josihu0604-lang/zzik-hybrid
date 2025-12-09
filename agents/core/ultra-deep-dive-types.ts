/**
 * 🧠 Ultra Deep Dive Agent Types
 * ================================
 * Claude 4.5 Sonnet 최적화된 연쇄추론(Chain of Thought) 기반
 * 울트라 딥다이브 에이전트 시스템 타입 정의
 * 
 * 참고: Anthropic의 "Building Effective Agents" 패턴 적용
 * - Evaluator-Optimizer 워크플로우
 * - Orchestrator-Workers 패턴
 * - Extended Thinking 모드 활용
 */

// ============================================================================
// 연쇄추론 (Chain of Thought) 타입
// ============================================================================

export interface ThinkingStep {
  id: string;
  phase: ThinkingPhase;
  thought: string;
  reasoning: string;
  confidence: number; // 0-1
  duration: number; // ms
  dependencies?: string[];
  artifacts?: ThinkingArtifact[];
}

export type ThinkingPhase = 
  | 'observation'     // 현재 상태 관찰
  | 'analysis'        // 문제 분석
  | 'hypothesis'      // 가설 수립
  | 'planning'        // 계획 수립
  | 'execution'       // 실행
  | 'evaluation'      // 평가
  | 'refinement'      // 개선
  | 'conclusion';     // 결론

export interface ThinkingArtifact {
  type: 'code' | 'analysis' | 'diagram' | 'recommendation';
  content: string;
  metadata?: Record<string, unknown>;
}

export interface ReasoningChain {
  id: string;
  goal: string;
  steps: ThinkingStep[];
  totalDuration: number;
  finalConfidence: number;
  iterations: number;
  outcome: 'success' | 'partial' | 'failed';
}

// ============================================================================
// 울트라 딥다이브 모드
// ============================================================================

export type ThinkingDepth = 'quick' | 'standard' | 'deep' | 'ultrathink';

export interface ThinkingConfig {
  depth: ThinkingDepth;
  maxIterations: number;
  confidenceThreshold: number;
  enableSelfReflection: boolean;
  enableCrossValidation: boolean;
  timeoutMs: number;
}

export const THINKING_PRESETS: Record<ThinkingDepth, ThinkingConfig> = {
  quick: {
    depth: 'quick',
    maxIterations: 1,
    confidenceThreshold: 0.7,
    enableSelfReflection: false,
    enableCrossValidation: false,
    timeoutMs: 5000
  },
  standard: {
    depth: 'standard',
    maxIterations: 3,
    confidenceThreshold: 0.8,
    enableSelfReflection: true,
    enableCrossValidation: false,
    timeoutMs: 15000
  },
  deep: {
    depth: 'deep',
    maxIterations: 5,
    confidenceThreshold: 0.85,
    enableSelfReflection: true,
    enableCrossValidation: true,
    timeoutMs: 30000
  },
  ultrathink: {
    depth: 'ultrathink',
    maxIterations: 10,
    confidenceThreshold: 0.95,
    enableSelfReflection: true,
    enableCrossValidation: true,
    timeoutMs: 60000
  }
};

// ============================================================================
// Evaluator-Optimizer 패턴
// ============================================================================

export interface Evaluation {
  score: number; // 0-100
  metrics: EvaluationMetric[];
  feedback: string[];
  improvements: ImprovementSuggestion[];
  passThreshold: boolean;
}

export interface EvaluationMetric {
  name: string;
  value: number;
  target: number;
  weight: number;
  passed: boolean;
}

export interface ImprovementSuggestion {
  priority: 'critical' | 'high' | 'medium' | 'low';
  area: string;
  suggestion: string;
  expectedImpact: number; // 예상 점수 향상
}

export interface OptimizationLoop {
  iteration: number;
  input: string;
  output: string;
  evaluation: Evaluation;
  appliedImprovements: string[];
  deltaScore: number;
}

// ============================================================================
// Orchestrator-Workers 패턴
// ============================================================================

export interface OrchestratorConfig {
  maxConcurrentWorkers: number;
  taskDecompositionStrategy: 'sequential' | 'parallel' | 'hybrid';
  workerSelectionStrategy: 'round-robin' | 'expertise-based' | 'load-balanced';
  aggregationStrategy: 'merge' | 'vote' | 'consensus';
}

export interface WorkerTask {
  id: string;
  workerId: string;
  taskType: string;
  input: unknown;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: unknown;
  startTime?: Date;
  endTime?: Date;
}

export interface OrchestratorState {
  activeTasks: WorkerTask[];
  completedTasks: WorkerTask[];
  failedTasks: WorkerTask[];
  aggregatedResults: Map<string, unknown>;
}

// ============================================================================
// 프론트엔드 개선 전용 타입
// ============================================================================

export interface FrontendImprovementContext {
  // 현재 상태
  currentState: {
    consoleErrors: ConsoleErrorSummary[];
    uxuiIssues: UXUIIssueSummary[];
    performanceMetrics: PerformanceMetrics;
    accessibilityScore: number;
  };
  
  // 목표
  goals: {
    targetErrorCount: number;
    targetAccessibilityScore: number;
    targetPerformanceScore: number;
    designSystemCompliance: number;
  };
  
  // 제약사항
  constraints: {
    maxFilesToModify: number;
    preserveExistingFunctionality: boolean;
    maintainBackwardCompatibility: boolean;
    allowBreakingChanges: boolean;
  };
}

export interface ConsoleErrorSummary {
  category: string;
  count: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  autoFixable: boolean;
}

export interface UXUIIssueSummary {
  type: string;
  count: number;
  affectedComponents: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
}

export interface PerformanceMetrics {
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  bundleSize: number;
}

// ============================================================================
// 점진적 개선 워크플로우
// ============================================================================

export interface ImprovementWave {
  waveNumber: number;
  name: string;
  description: string;
  phases: ImprovementPhase[];
  estimatedDuration: number; // hours
  priority: number;
  dependencies?: number[]; // 이전 웨이브 번호들
}

export interface ImprovementPhase {
  id: string;
  name: string;
  agentIds: string[];
  tasks: string[];
  successCriteria: string[];
  rollbackPlan?: string;
}

export interface ImprovementPlan {
  totalWaves: number;
  waves: ImprovementWave[];
  estimatedTotalDuration: number;
  riskAssessment: RiskAssessment;
  rollbackStrategy: string;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  risks: Risk[];
  mitigations: string[];
}

export interface Risk {
  id: string;
  description: string;
  probability: number; // 0-1
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}

// ============================================================================
// 에이전트 협업 타입
// ============================================================================

export interface AgentCollaboration {
  sessionId: string;
  participants: AgentParticipant[];
  sharedContext: SharedContext;
  communicationLog: AgentMessage[];
  consensusDecisions: ConsensusDecision[];
}

export interface AgentParticipant {
  agentId: string;
  role: 'orchestrator' | 'worker' | 'evaluator' | 'specialist';
  expertise: string[];
  currentTask?: string;
}

export interface SharedContext {
  projectInfo: Record<string, unknown>;
  discoveredIssues: unknown[];
  appliedFixes: unknown[];
  pendingTasks: string[];
  globalState: Record<string, unknown>;
}

export interface AgentMessage {
  timestamp: Date;
  fromAgent: string;
  toAgent: string | 'broadcast';
  type: 'info' | 'request' | 'response' | 'alert' | 'completion';
  content: string;
  metadata?: Record<string, unknown>;
}

export interface ConsensusDecision {
  topic: string;
  participants: string[];
  votes: Map<string, string>;
  finalDecision: string;
  confidence: number;
  timestamp: Date;
}

// ============================================================================
// 프롬프트 템플릿 (Claude 4.5 최적화)
// ============================================================================

export const CLAUDE_45_PROMPTS = {
  // 울트라씽크 모드 활성화
  ULTRATHINK_PREFIX: `
<ultrathink>
Before responding, engage in deep multi-step reasoning:
1. OBSERVE: Carefully analyze the current state and context
2. DECOMPOSE: Break down the problem into atomic sub-problems
3. HYPOTHESIZE: Generate multiple solution hypotheses
4. EVALUATE: Cross-validate each hypothesis
5. PLAN: Create a detailed execution plan
6. VERIFY: Self-check the plan for completeness and correctness
</ultrathink>
`,

  // 자기 반성 프롬프트
  SELF_REFLECTION: `
<reflect>
Before finalizing, verify your reasoning:
- Have I considered all edge cases?
- Are there any assumptions I'm making?
- Could this solution cause unintended side effects?
- Is this the simplest solution that works?
- Does this align with the project's design system?
</reflect>
`,

  // 프론트엔드 전문가 역할
  FRONTEND_EXPERT_ROLE: `
You are an expert Frontend Architect specializing in:
- Next.js 15+ with App Router and Server Components
- React 19 with concurrent features
- TypeScript 5.7+ with strict mode
- Tailwind CSS v4 and modern CSS
- Web accessibility (WCAG 2.1 AA)
- Performance optimization (Core Web Vitals)
- Mobile-first responsive design
- Design system implementation

Your approach:
1. Always consider SSR/CSR hydration implications
2. Prioritize accessibility and performance
3. Follow the project's ZZIK Design System 2.0
4. Write type-safe, maintainable code
5. Test your reasoning before suggesting changes
`,

  // 점진적 개선 지시
  INCREMENTAL_IMPROVEMENT: `
When improving code:
1. Start with the highest-impact, lowest-risk changes
2. Preserve existing functionality
3. Make changes atomic and reversible
4. Document reasoning for each change
5. Verify no regressions are introduced
6. Consider the ripple effect on dependent components
`
};
