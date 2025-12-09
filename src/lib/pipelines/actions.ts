/**
 * ZZIK Leader Popup Pipeline - Actions
 *
 * Pipeline state machine and action definitions
 */

import type { PipelineStage, PipelineAction, LeaderPopupPipeline, ProposalData } from './types';

// ============================================================================
// PIPELINE STATE MACHINE
// ============================================================================

export const PIPELINE_TRANSITIONS: Record<PipelineStage, PipelineStage[]> = {
  proposal: ['matching', 'cancelled'],
  matching: ['negotiation', 'proposal', 'cancelled'],
  negotiation: ['contract', 'matching', 'cancelled'],
  contract: ['funding', 'negotiation', 'cancelled'],
  funding: ['execution', 'cancelled'],
  execution: ['settlement', 'cancelled'],
  settlement: ['completed'],
  completed: [],
  cancelled: [],
};

/**
 * Check if transition is valid
 */
export function canTransition(from: PipelineStage, to: PipelineStage): boolean {
  return PIPELINE_TRANSITIONS[from].includes(to);
}

/**
 * Get next stage in pipeline
 */
export function getNextStage(current: PipelineStage): PipelineStage | null {
  const next = PIPELINE_TRANSITIONS[current][0];
  return next !== 'cancelled' ? next : null;
}

/**
 * Get previous stage in pipeline
 */
export function getPreviousStage(current: PipelineStage): PipelineStage | null {
  for (const [stage, transitions] of Object.entries(PIPELINE_TRANSITIONS)) {
    if (transitions.includes(current) && stage !== 'cancelled') {
      return stage as PipelineStage;
    }
  }
  return null;
}

// ============================================================================
// PIPELINE ACTIONS
// ============================================================================

export const PIPELINE_ACTIONS: PipelineAction[] = [
  // Proposal actions
  {
    name: 'submit_proposal',
    stage: 'proposal',
    requiredRole: 'leader',
    validate: (p) => p.proposal.status === 'draft',
  },
  {
    name: 'approve_proposal',
    stage: 'proposal',
    requiredRole: 'platform',
    validate: (p) => p.proposal.status === 'submitted',
  },

  // Matching actions
  {
    name: 'accept_match',
    stage: 'matching',
    requiredRole: 'brand',
    validate: (p) => p.matching?.status === 'matching',
  },
  {
    name: 'confirm_match',
    stage: 'matching',
    requiredRole: 'leader',
    validate: (p) => p.matching?.status === 'matched',
  },

  // Negotiation actions
  {
    name: 'make_offer',
    stage: 'negotiation',
    requiredRole: 'any',
    validate: (p) => p.negotiation?.status !== 'agreed' && p.negotiation?.status !== 'failed',
  },
  {
    name: 'accept_offer',
    stage: 'negotiation',
    requiredRole: 'any',
    validate: (p) => p.negotiation?.currentOffer?.status === 'pending',
  },

  // Contract actions
  {
    name: 'sign_contract',
    stage: 'contract',
    requiredRole: 'any',
    validate: (p) => p.contract?.status === 'signing',
  },

  // Funding actions
  {
    name: 'launch_funding',
    stage: 'funding',
    requiredRole: 'platform',
    validate: (p) => p.funding?.status === 'preparing',
  },

  // Execution actions
  {
    name: 'start_show',
    stage: 'execution',
    requiredRole: 'leader',
    validate: (p) => p.execution?.status === 'running',
  },

  // Settlement actions
  {
    name: 'approve_settlement',
    stage: 'settlement',
    requiredRole: 'any',
    validate: (p) => p.settlement?.status === 'pending_approval',
  },
  {
    name: 'dispute_settlement',
    stage: 'settlement',
    requiredRole: 'any',
    validate: (p) => p.settlement?.status === 'pending_approval',
  },
];

/**
 * Get available actions for a pipeline
 */
export function getAvailableActions(
  pipeline: LeaderPopupPipeline,
  role: 'leader' | 'brand' | 'platform'
): PipelineAction[] {
  return PIPELINE_ACTIONS.filter((action) => {
    if (action.stage !== pipeline.stage) return false;
    if (action.requiredRole !== 'any' && action.requiredRole !== role) return false;
    return action.validate(pipeline);
  });
}

/**
 * Check if action is available
 */
export function isActionAvailable(
  pipeline: LeaderPopupPipeline,
  actionName: string,
  role: 'leader' | 'brand' | 'platform'
): boolean {
  const action = PIPELINE_ACTIONS.find((a) => a.name === actionName);
  if (!action) return false;
  if (action.stage !== pipeline.stage) return false;
  if (action.requiredRole !== 'any' && action.requiredRole !== role) return false;
  return action.validate(pipeline);
}

// ============================================================================
// PIPELINE FACTORY
// ============================================================================

/**
 * Create a new pipeline
 */
export function createPipeline(
  leaderId: string,
  proposalData: Partial<ProposalData>
): LeaderPopupPipeline {
  const now = new Date().toISOString();

  return {
    id: `pipeline-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    stage: 'proposal',
    createdAt: now,
    updatedAt: now,
    leaderId,

    proposal: {
      status: 'draft',
      concept: proposalData.concept || {
        title: '',
        description: '',
        category: '',
        targetAudience: '',
        uniqueValue: '',
      },
      leaderRole: proposalData.leaderRole || {
        participationType: 'host',
        contentPlan: [],
        promotionChannels: [],
        expectedReach: 0,
      },
      desiredTerms: proposalData.desiredTerms || {
        preferredBrands: [],
        excludedBrands: [],
        budgetRange: { min: 0, max: 0 },
        schedulePref: {
          preferredDates: [],
          flexibleDates: true,
          duration: 7,
        },
        revenueExpectation: {
          baseFee: 0,
          commissionRate: 0.1,
        },
      },
      portfolio: proposalData.portfolio || {
        previousPopups: [],
        successMetrics: {
          avgParticipants: 0,
          avgSales: 0,
          avgEngagement: 0,
        },
      },
    },

    timeline: [
      {
        id: `event-${Date.now()}`,
        timestamp: now,
        stage: 'proposal',
        eventType: 'pipeline_created',
        description: '파이프라인이 생성되었습니다',
        actor: 'leader',
      },
    ],
    messages: [],
    documents: [],
  };
}

/**
 * Transition pipeline to next stage
 */
export function transitionPipeline(
  pipeline: LeaderPopupPipeline,
  targetStage: PipelineStage,
  actor: 'leader' | 'brand' | 'platform' | 'system'
): LeaderPopupPipeline {
  if (!canTransition(pipeline.stage, targetStage)) {
    throw new Error(`Cannot transition from ${pipeline.stage} to ${targetStage}`);
  }

  const now = new Date().toISOString();

  return {
    ...pipeline,
    stage: targetStage,
    updatedAt: now,
    timeline: [
      ...pipeline.timeline,
      {
        id: `event-${Date.now()}`,
        timestamp: now,
        stage: targetStage,
        eventType: 'stage_transition',
        description: `파이프라인이 ${targetStage} 단계로 전환되었습니다`,
        actor,
      },
    ],
  };
}

/**
 * Add timeline event
 */
export function addTimelineEvent(
  pipeline: LeaderPopupPipeline,
  eventType: string,
  description: string,
  actor: 'leader' | 'brand' | 'platform' | 'system',
  metadata?: Record<string, unknown>
): LeaderPopupPipeline {
  const now = new Date().toISOString();

  return {
    ...pipeline,
    updatedAt: now,
    timeline: [
      ...pipeline.timeline,
      {
        id: `event-${Date.now()}`,
        timestamp: now,
        stage: pipeline.stage,
        eventType,
        description,
        actor,
        metadata,
      },
    ],
  };
}
