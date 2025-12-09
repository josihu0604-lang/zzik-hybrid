/**
 * ZZIK Leader Popup Pipeline (Re-export)
 *
 * This file re-exports from the modular pipeline files.
 * For new code, import directly from '@/lib/pipelines'
 *
 * Complete end-to-end pipeline for Leader-initiated popup campaigns:
 * STAGE 1: Proposal (리더 제안)
 * STAGE 2: Matching (브랜드 매칭)
 * STAGE 3: Negotiation (조건 협상)
 * STAGE 4: Contract (계약 체결)
 * STAGE 5: Funding (크라우드펀딩)
 * STAGE 6: Execution (라이브 실행)
 * STAGE 7: Settlement (정산)
 *
 * Revenue Flow:
 * Consumer -> ZZIK Platform -> Brand + Leader
 */

// Re-export all types
export * from './types';

// Re-export actions
export * from './actions';

// Re-export calculations
export * from './calculations';
