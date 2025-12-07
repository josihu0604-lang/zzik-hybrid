/**
 * ZZIK Pipelines Module
 *
 * End-to-end business process pipelines:
 * - Leader Popup Pipeline: Leader-initiated popup campaigns
 * - Anti-Fraud System: Trust & compliance enforcement
 */

// ============================================================================
// Leader Popup Pipeline - Types
// ============================================================================

export type {
  // Core types
  PipelineStage,
  LeaderPopupPipeline,
  PipelineAction,
  PipelineMetrics,

  // Stage data types
  ProposalData,
  MatchingData,
  NegotiationData,
  ContractData,
  FundingData,
  ExecutionData,
  SettlementData,

  // Sub-types
  BrandCandidate,
  NegotiationOffer,
  AgreedTerms,
  PaymentSchedule,
  ScheduledPayment,
  CancellationPolicy,
  ContractSignature,
  LiveShowExecution,
  ExecutionIssue,
  PayoutRecord,
  InvoiceItem,
  TaxInfo,

  // Communication
  TimelineEvent,
  PipelineMessage,
  PipelineDocument,
} from './types';

// ============================================================================
// Leader Popup Pipeline - Actions
// ============================================================================

export {
  // State machine
  PIPELINE_TRANSITIONS,
  canTransition,
  getNextStage,
  getPreviousStage,

  // Actions
  PIPELINE_ACTIONS,
  getAvailableActions,
  isActionAvailable,

  // Factory & Utils
  createPipeline,
  transitionPipeline,
  addTimelineEvent,
} from './actions';

// ============================================================================
// Leader Popup Pipeline - Calculations
// ============================================================================

export {
  // Settlement
  calculateSettlement,
  calculatePlatformFee,
  calculatePaymentFee,
  calculateLeaderCommission,
  checkPerformanceBonus,

  // Metrics
  calculatePipelineMetrics,
  calculateStageDuration,
  calculateFundingProgress,
  projectFundingCompletion,
  calculateLeaderImpact,
} from './calculations';

// ============================================================================
// Anti-Fraud & Trust System
// ============================================================================

export {
  // Compliance
  checkContentCompliance,
  type ContentComplianceCheck,
  type ComplianceResult,
  type ComplianceRule,

  // Cancellation policy
  generateCancellationPolicy,
  calculateRefund,
  type CancellationPolicy as AntiFraudCancellationPolicy,
  type CancellationRule,
  type RefundPolicy,

  // Price fairness
  checkPriceFairness,
  type PriceFairnessCheck,
  type PriceComparison,

  // No-show prevention
  predictNoShowRisk,
  type NoShowPrediction,
  type NoShowFactor,

  // Trust system
  calculateTrustScore,
  type TrustScore,
  type TrustTier,
  type TrustEvent,
  type TrustCategory,

  // Settlement audit
  generateSettlementAudit,
  type SettlementAudit,

  // Constants
  ZZIK_ADVANTAGES,
} from './anti-fraud-system';
