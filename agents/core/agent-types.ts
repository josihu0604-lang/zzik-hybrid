/**
 * 🤖 ZZIK Agent System - Core Types
 * ================================
 * 콘솔 오류 수정 및 UX/UI 개선을 위한 에이전트 시스템의 핵심 타입 정의
 */

// ============================================================================
// Agent 기본 타입
// ============================================================================

export interface AgentTask {
  id: string;
  name: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedMinutes: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  targetFiles: string[];
  dependencies?: string[];
  result?: TaskResult;
}

export interface TaskResult {
  success: boolean;
  message: string;
  filesModified: string[];
  issuesFound: number;
  issuesFixed: number;
  details?: Record<string, unknown>;
}

export interface Agent {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: 'console-fix' | 'uxui-improvement' | 'performance' | 'accessibility';
  tasks: AgentTask[];
  run(): Promise<AgentExecutionResult>;
}

export interface AgentExecutionResult {
  agentId: string;
  startTime: Date;
  endTime: Date;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  skippedTasks: number;
  summary: string;
  taskResults: TaskResult[];
}

// ============================================================================
// 콘솔 오류 타입
// ============================================================================

export interface ConsoleError {
  type: 'error' | 'warning' | 'info';
  message: string;
  source: string;
  line?: number;
  column?: number;
  category: ConsoleErrorCategory;
  severity: 'critical' | 'high' | 'medium' | 'low';
  suggestedFix?: string;
}

export type ConsoleErrorCategory = 
  | 'hydration'
  | 'missing-resource'
  | 'missing-translation'
  | 'auth-config'
  | 'api-error'
  | 'runtime-error'
  | 'deprecation'
  | 'network';

export interface ConsoleErrorAnalysis {
  errors: ConsoleError[];
  totalCount: number;
  byCategoryCount: Record<ConsoleErrorCategory, number>;
  criticalCount: number;
  autoFixableCount: number;
}

// ============================================================================
// UX/UI 개선 타입
// ============================================================================

export interface UXUIIssue {
  id: string;
  type: UXUIIssueType;
  component: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  suggestedFix: string;
  codeChanges?: CodeChange[];
}

export type UXUIIssueType = 
  | 'color-contrast'
  | 'responsive-design'
  | 'accessibility'
  | 'performance'
  | 'user-flow'
  | 'visual-consistency'
  | 'i18n'
  | 'dark-mode'
  | 'animation'
  | 'form-ux';

export interface CodeChange {
  file: string;
  oldCode: string;
  newCode: string;
  description: string;
}

// ============================================================================
// Agent Registry
// ============================================================================

export interface AgentRegistry {
  agents: Map<string, Agent>;
  register(agent: Agent): void;
  get(id: string): Agent | undefined;
  getAll(): Agent[];
  getByCategory(category: Agent['category']): Agent[];
  runAll(): Promise<AgentExecutionResult[]>;
  runByCategory(category: Agent['category']): Promise<AgentExecutionResult[]>;
}

// ============================================================================
// 현재 프로젝트의 발견된 이슈들
// ============================================================================

export const DISCOVERED_ISSUES = {
  consoleErrors: [
    {
      type: 'hydration',
      message: 'Hydration failed because the server rendered HTML didn\'t match the client',
      severity: 'critical',
      suggestedFix: 'SSR과 CSR간의 불일치 해결 - suppressHydrationWarning 사용 또는 클라이언트 전용 렌더링'
    },
    {
      type: 'missing-translation',
      message: '[i18n] Missing translation: onboarding.welcome, onboarding.selectLanguage',
      severity: 'medium',
      suggestedFix: 'i18n 로케일 파일에 누락된 번역 키 추가'
    },
    {
      type: 'auth-config',
      message: '[AppProviders] Invalid or missing Privy App ID. Auth features disabled.',
      severity: 'high',
      suggestedFix: 'Privy App ID 환경변수 확인 또는 폴백 처리'
    },
    {
      type: 'missing-resource',
      message: 'Failed to load resource: the server responded with a status of 404',
      severity: 'medium',
      suggestedFix: '누락된 리소스 파일 확인 및 경로 수정'
    }
  ],
  uxuiIssues: [
    {
      type: 'color-contrast',
      description: 'TouristHomeScreen uses bg-white with white/light text in some areas',
      severity: 'medium'
    },
    {
      type: 'dark-mode',
      description: 'Inconsistent dark/light mode - layout uses dark but TouristHomeScreen uses light',
      severity: 'high'
    },
    {
      type: 'i18n',
      description: 'Hardcoded English text in TouristHomeScreen components',
      severity: 'medium'
    },
    {
      type: 'visual-consistency',
      description: 'Design system colors not consistently applied across components',
      severity: 'medium'
    }
  ]
} as const;
