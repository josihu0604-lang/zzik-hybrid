/**
 * ZZIK Leader Popup Pipeline - Types
 *
 * Type definitions for the pipeline module
 */

// ============================================================================
// PIPELINE TYPES
// ============================================================================

export type PipelineStage =
  | 'proposal'
  | 'matching'
  | 'negotiation'
  | 'contract'
  | 'funding'
  | 'execution'
  | 'settlement'
  | 'completed'
  | 'cancelled';

export interface LeaderPopupPipeline {
  id: string;
  stage: PipelineStage;
  createdAt: string;
  updatedAt: string;
  leaderId: string;
  brandId?: string;
  popupId?: string;

  // Stage data
  proposal: ProposalData;
  matching?: MatchingData;
  negotiation?: NegotiationData;
  contract?: ContractData;
  funding?: FundingData;
  execution?: ExecutionData;
  settlement?: SettlementData;

  // Metadata
  timeline: TimelineEvent[];
  messages: PipelineMessage[];
  documents: PipelineDocument[];
}

// ============================================================================
// STAGE 1: PROPOSAL (리더 제안)
// ============================================================================

export interface ProposalData {
  status: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'rejected';
  submittedAt?: string;

  // 기획 개요
  concept: {
    title: string;
    description: string;
    category: string;
    targetAudience: string;
    uniqueValue: string;
  };

  // 리더 역할
  leaderRole: {
    participationType: 'host' | 'collaborator' | 'ambassador';
    contentPlan: string[];
    promotionChannels: string[];
    expectedReach: number;
  };

  // 희망 조건
  desiredTerms: {
    preferredBrands: string[];
    excludedBrands: string[];
    budgetRange: { min: number; max: number };
    schedulePref: {
      preferredDates: string[];
      flexibleDates: boolean;
      duration: number;
    };
    revenueExpectation: {
      baseFee: number;
      commissionRate: number;
    };
  };

  // 포트폴리오
  portfolio: {
    previousPopups: string[];
    successMetrics: {
      avgParticipants: number;
      avgSales: number;
      avgEngagement: number;
    };
  };
}

// ============================================================================
// STAGE 2: MATCHING (브랜드 매칭)
// ============================================================================

export interface MatchingData {
  status: 'pending' | 'matching' | 'matched' | 'no_match';
  startedAt: string;
  matchedAt?: string;

  // 매칭 결과
  candidates: BrandCandidate[];
  selectedBrandId?: string;

  // 매칭 알고리즘 결과
  matchingScore?: number;
  matchingReasons?: string[];
}

export interface BrandCandidate {
  brandId: string;
  brandName: string;
  matchScore: number;
  categoryFit: number;
  audienceFit: number;
  budgetFit: number;
  scheduleFit: number;
  interestLevel: 'high' | 'medium' | 'low' | 'pending';
  responseAt?: string;
}

// ============================================================================
// STAGE 3: NEGOTIATION (조건 협상)
// ============================================================================

export interface NegotiationData {
  status: 'initial' | 'counter' | 'reviewing' | 'agreed' | 'failed';
  startedAt: string;
  agreedAt?: string;

  // 제안 내역
  offers: NegotiationOffer[];
  currentOffer?: NegotiationOffer;
  agreedTerms?: AgreedTerms;

  // 협상 진행
  negotiationRounds: number;
  lastActivity: string;
  deadlineAt?: string;
}

export interface NegotiationOffer {
  id: string;
  fromParty: 'leader' | 'brand' | 'platform';
  createdAt: string;
  status: 'pending' | 'accepted' | 'countered' | 'rejected';

  terms: {
    // 금전 조건
    baseFee: number;
    commissionRate: number;
    performanceBonus?: {
      threshold: number;
      bonusAmount: number;
    };
    paymentTerms: 'advance' | 'deferred' | 'split';

    // 일정 조건
    popupDates: { start: string; end: string };
    liveShowDates: string[];
    setupDays: number;

    // 역할 조건
    leaderResponsibilities: string[];
    brandResponsibilities: string[];
    exclusivity: boolean;
    contentRights: 'leader' | 'brand' | 'shared';
  };

  notes?: string;
}

export interface AgreedTerms {
  baseFee: number;
  commissionRate: number;
  performanceBonus?: { threshold: number; bonusAmount: number };
  paymentSchedule: PaymentSchedule;
  popupDates: { start: string; end: string };
  liveShowDates: string[];
  responsibilities: {
    leader: string[];
    brand: string[];
  };
  exclusivity: boolean;
  contentRights: 'leader' | 'brand' | 'shared';
  cancellationPolicy: CancellationPolicy;
}

export interface PaymentSchedule {
  type: 'advance' | 'deferred' | 'split';
  payments: ScheduledPayment[];
}

export interface ScheduledPayment {
  id: string;
  amount: number;
  dueDate: string;
  trigger: 'contract_signed' | 'funding_complete' | 'popup_start' | 'popup_end' | 'settlement';
  status: 'pending' | 'paid' | 'overdue';
}

export interface CancellationPolicy {
  leaderPenalty: { daysBeforeEvent: number; penaltyRate: number }[];
  brandPenalty: { daysBeforeEvent: number; penaltyRate: number }[];
  forceMajeure: string[];
}

// ============================================================================
// STAGE 4: CONTRACT (계약 체결)
// ============================================================================

export interface ContractData {
  status: 'drafting' | 'review' | 'signing' | 'signed' | 'voided';
  draftedAt: string;
  signedAt?: string;

  // 계약서
  contract: {
    id: string;
    version: number;
    templateId: string;
    terms: AgreedTerms;
    signatures: ContractSignature[];
    documentUrl?: string;
  };

  // 보증금
  deposit?: {
    amount: number;
    paidAt?: string;
    refundedAt?: string;
    status: 'pending' | 'paid' | 'held' | 'refunded' | 'forfeited';
  };
}

export interface ContractSignature {
  party: 'leader' | 'brand' | 'platform';
  signedAt?: string;
  signatureMethod: 'electronic' | 'physical';
  signatureId?: string;
  ipAddress?: string;
}

// ============================================================================
// STAGE 5: FUNDING (크라우드펀딩)
// ============================================================================

export interface FundingData {
  status: 'preparing' | 'live' | 'successful' | 'failed' | 'extended';
  launchedAt?: string;
  endedAt?: string;

  // 펀딩 목표
  goals: {
    minParticipants: number;
    targetParticipants: number;
    stretchGoals?: { participants: number; reward: string }[];
    deadline: string;
  };

  // 현재 상태
  progress: {
    currentParticipants: number;
    progressRate: number;
    trend: 'accelerating' | 'steady' | 'slowing';
    projectedCompletion?: string;
  };

  // 리더 영향력
  leaderImpact: {
    referrals: number;
    referralRate: number;
    contentViews: number;
    conversionRate: number;
  };
}

// ============================================================================
// STAGE 6: EXECUTION (라이브 실행)
// ============================================================================

export interface ExecutionData {
  status: 'setup' | 'running' | 'live_active' | 'completed' | 'cancelled';
  startedAt?: string;
  completedAt?: string;

  // 팝업 운영
  popupOperation: {
    venueSetupComplete: boolean;
    staffingComplete: boolean;
    inventoryReady: boolean;
    streamingReady: boolean;
  };

  // 라이브 쇼
  liveShows: LiveShowExecution[];

  // 실시간 지표
  realTimeMetrics: {
    totalVisitors: number;
    currentVisitors: number;
    totalSales: number;
    avgTransactionValue: number;
    leaderGeneratedSales: number;
    satisfactionScore?: number;
  };

  // 이슈 로그
  issues: ExecutionIssue[];
}

export interface LiveShowExecution {
  id: string;
  scheduledAt: string;
  actualStartAt?: string;
  actualEndAt?: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';

  performance: {
    peakViewers: number;
    avgViewers: number;
    totalOrders: number;
    totalSales: number;
    conversionRate: number;
    highlights?: string[];
  };
}

export interface ExecutionIssue {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'technical' | 'operational' | 'customer' | 'content' | 'other';
  description: string;
  resolution?: string;
  resolvedAt?: string;
}

// ============================================================================
// STAGE 7: SETTLEMENT (정산)
// ============================================================================

export interface SettlementData {
  status: 'calculating' | 'pending_approval' | 'approved' | 'processing' | 'completed' | 'disputed';
  calculatedAt?: string;
  completedAt?: string;

  // 매출 집계
  salesSummary: {
    grossSales: number;
    refunds: number;
    netSales: number;
    leaderAttributedSales: number;
    directSales: number;
  };

  // 수수료 계산
  feeBreakdown: {
    platformFee: number;
    paymentProcessingFee: number;
    brandNetRevenue: number;
    leaderBaseFee: number;
    leaderCommission: number;
    leaderBonus: number;
    leaderTotal: number;
  };

  // 정산 스케줄
  payouts: PayoutRecord[];

  // 정산서
  invoice?: {
    id: string;
    generatedAt: string;
    documentUrl: string;
    items: InvoiceItem[];
    taxInfo: TaxInfo;
  };

  // 분쟁
  dispute?: {
    raisedBy: 'leader' | 'brand';
    raisedAt: string;
    reason: string;
    status: 'open' | 'investigating' | 'resolved';
    resolution?: string;
  };
}

export interface PayoutRecord {
  id: string;
  recipient: 'leader' | 'brand';
  amount: number;
  currency: 'KRW';
  scheduledDate: string;
  processedAt?: string;
  status: 'scheduled' | 'processing' | 'completed' | 'failed';
  method: 'bank_transfer' | 'platform_credit';
  reference?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate: number;
}

export interface TaxInfo {
  businessNumber?: string;
  taxType: 'vat' | 'withholding' | 'exempt';
  taxAmount: number;
  withholdingTax?: number;
}

// ============================================================================
// TIMELINE & COMMUNICATION
// ============================================================================

export interface TimelineEvent {
  id: string;
  timestamp: string;
  stage: PipelineStage;
  eventType: string;
  description: string;
  actor: 'leader' | 'brand' | 'platform' | 'system';
  metadata?: Record<string, unknown>;
}

export interface PipelineMessage {
  id: string;
  timestamp: string;
  from: 'leader' | 'brand' | 'platform';
  to: 'leader' | 'brand' | 'platform';
  subject: string;
  content: string;
  attachments?: string[];
  readAt?: string;
}

export interface PipelineDocument {
  id: string;
  uploadedAt: string;
  uploadedBy: 'leader' | 'brand' | 'platform';
  type: 'proposal' | 'contract' | 'invoice' | 'report' | 'other';
  name: string;
  url: string;
  size: number;
}

// ============================================================================
// PIPELINE ACTION TYPES
// ============================================================================

export interface PipelineAction {
  name: string;
  stage: PipelineStage;
  requiredRole: 'leader' | 'brand' | 'platform' | 'any';
  validate: (pipeline: LeaderPopupPipeline) => boolean;
}

// ============================================================================
// PIPELINE METRICS TYPES
// ============================================================================

export interface PipelineMetrics {
  stageConversionRates: Record<PipelineStage, number>;
  avgTimePerStage: Record<PipelineStage, number>;
  totalPipelines: number;
  activePipelines: number;
  completedPipelines: number;
  totalRevenue: number;
  avgRevenuePerPipeline: number;
}
