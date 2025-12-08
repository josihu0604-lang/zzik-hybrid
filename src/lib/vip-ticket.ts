// src/lib/vip-ticket.ts
// VIP Ticket Module - Manages VIP membership subscriptions
// Integrated with Supabase for persistence and Stripe for payments

import { TierType, getTierPrice, TIER_FEATURES, Region, Currency, REGION_CURRENCY } from './global-pricing';

// =============================================================================
// Types & Interfaces
// =============================================================================

export interface VIPTicket {
  id: string;
  userId: string;
  tier: TierType;
  region: Region;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  autoRenew: boolean;
  paymentMethod: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  stripePriceId?: string;
  metadata?: Record<string, unknown>;
  transactionHistory: Transaction[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Transaction {
  id: string;
  ticketId: string;
  userId: string;
  amount: number;
  currency: Currency;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  transactionType: 'subscription' | 'upgrade' | 'renewal' | 'refund' | 'one_time';
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeInvoiceId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  errorMessage?: string;
  createdAt: Date;
  completedAt?: Date;
}

// Database row types (snake_case for Supabase)
interface VIPTicketRow {
  id: string;
  user_id: string;
  tier: string;
  region: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  auto_renew: boolean;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  stripe_price_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

interface TransactionRow {
  id: string;
  ticket_id: string | null;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  transaction_type: string;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  stripe_invoice_id: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

// VIP 티켓 생성
export async function createVIPTicket(
  userId: string,
  tier: TierType,
  region: Region,
  period: 'monthly' | 'yearly'
): Promise<VIPTicket> {
  const price = getTierPrice(tier, region, period);
  
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + (period === 'yearly' ? 12 : 1));
  
  const ticket: VIPTicket = {
    id: generateTicketId(),
    userId,
    tier,
    region,
    startDate,
    endDate,
    isActive: false,  // 결제 완료 후 활성화
    autoRenew: true,
    paymentMethod: '',
    transactionHistory: [],
  };
  
  // Supabase에 저장
  await saveTicket(ticket);
  
  return ticket;
}

// 티켓 업그레이드
export async function upgradeTicket(
  ticketId: string,
  newTier: TierType
): Promise<VIPTicket> {
  const ticket = await getTicket(ticketId);
  
  if (!ticket) throw new Error('Ticket not found');
  
  // 업그레이드 가격 계산 (비례 계산)
  const remainingDays = getRemainingDays(ticket.endDate);
  const upgradePrice = calculateUpgradePrice(ticket.tier, newTier, remainingDays, ticket.region);
  
  // 결제 처리 후 업그레이드
  ticket.tier = newTier;
  await updateTicket(ticket);
  
  return ticket;
}

// 티켓 갱신
export async function renewTicket(ticketId: string): Promise<VIPTicket> {
  const ticket = await getTicket(ticketId);
  
  if (!ticket) throw new Error('Ticket not found');
  
  const newEndDate = new Date(ticket.endDate);
  newEndDate.setMonth(newEndDate.getMonth() + 1);
  
  ticket.endDate = newEndDate;
  await updateTicket(ticket);
  
  return ticket;
}

// 혜택 확인
export function getTicketBenefits(tier: TierType): string[] {
  return TIER_FEATURES[tier];
}

// 권한 확인
export function hasAccess(ticket: VIPTicket | null, feature: string): boolean {
  // 티어 계층 구조 정의
  const TIER_HIERARCHY: TierType[] = ['free', 'silver', 'gold', 'platinum'];
  
  // 티켓이 없거나 비활성 상태이면 무료 티어 혜택만 확인
  const currentTier = (ticket && ticket.isActive) ? ticket.tier : 'free';
  
  // 현재 티어와 그 하위 티어들의 모든 혜택을 확인
  const currentTierIndex = TIER_HIERARCHY.indexOf(currentTier);
  
  // 하위 티어부터 현재 티어까지 순회하며 기능 확인
  for (let i = 0; i <= currentTierIndex; i++) {
    const tierToCheck = TIER_HIERARCHY[i];
    if (TIER_FEATURES[tierToCheck].includes(feature)) {
      return true;
    }
  }
  
  return false;
}

// 유틸리티 함수들
function generateTicketId(): string {
  return `VIP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getRemainingDays(endDate: Date): number {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function calculateUpgradePrice(
  currentTier: TierType,
  newTier: TierType,
  remainingDays: number,
  region: Region
): number {
  const currentPrice = getTierPrice(currentTier, region, 'monthly');
  const newPrice = getTierPrice(newTier, region, 'monthly');
  
  const dailyDiff = (newPrice.amount - currentPrice.amount) / 30;
  return Math.max(0, dailyDiff * remainingDays);
}

// =============================================================================
// Supabase Integration Functions
// =============================================================================

/**
 * Save a new VIP ticket to Supabase
 * Called after successful payment completion via webhook
 */
async function saveTicket(ticket: VIPTicket): Promise<void> {
  // Dynamic import to avoid issues with server/client contexts
  const { createAdminClient, isAdminConfigured } = await import('./supabase/server');
  
  if (!isAdminConfigured()) {
    console.warn('[VIP-Ticket] Supabase admin not configured, skipping save');
    return;
  }
  
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('vip_tickets')
    .insert({
      id: ticket.id,
      user_id: ticket.userId,
      tier: ticket.tier,
      region: ticket.region,
      start_date: ticket.startDate.toISOString(),
      end_date: ticket.endDate.toISOString(),
      is_active: ticket.isActive,
      auto_renew: ticket.autoRenew,
      stripe_subscription_id: ticket.stripeSubscriptionId || null,
      stripe_customer_id: ticket.stripeCustomerId || null,
      stripe_price_id: ticket.stripePriceId || null,
      metadata: ticket.metadata || {},
    });
  
  if (error) {
    console.error('[VIP-Ticket] Failed to save ticket:', error);
    throw new Error(`Failed to save VIP ticket: ${error.message}`);
  }
}

/**
 * Get a VIP ticket by ID
 */
async function getTicket(ticketId: string): Promise<VIPTicket | null> {
  const { createAdminClient, isAdminConfigured } = await import('./supabase/server');
  
  if (!isAdminConfigured()) {
    console.warn('[VIP-Ticket] Supabase admin not configured');
    return null;
  }
  
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('vip_tickets')
    .select('*')
    .eq('id', ticketId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('[VIP-Ticket] Failed to get ticket:', error);
    throw new Error(`Failed to get VIP ticket: ${error.message}`);
  }
  
  return rowToTicket(data as VIPTicketRow);
}

/**
 * Get active VIP ticket for a user
 */
export async function getActiveTicketByUserId(userId: string): Promise<VIPTicket | null> {
  const { createAdminClient, isAdminConfigured } = await import('./supabase/server');
  
  if (!isAdminConfigured()) {
    console.warn('[VIP-Ticket] Supabase admin not configured');
    return null;
  }
  
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('vip_tickets')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('[VIP-Ticket] Failed to get user ticket:', error);
    return null;
  }
  
  return rowToTicket(data as VIPTicketRow);
}

/**
 * Get VIP ticket by Stripe subscription ID
 */
export async function getTicketByStripeSubscription(subscriptionId: string): Promise<VIPTicket | null> {
  const { createAdminClient, isAdminConfigured } = await import('./supabase/server');
  
  if (!isAdminConfigured()) {
    return null;
  }
  
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('vip_tickets')
    .select('*')
    .eq('stripe_subscription_id', subscriptionId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('[VIP-Ticket] Failed to get ticket by subscription:', error);
    return null;
  }
  
  return rowToTicket(data as VIPTicketRow);
}

/**
 * Update an existing VIP ticket
 */
async function updateTicket(ticket: VIPTicket): Promise<void> {
  const { createAdminClient, isAdminConfigured } = await import('./supabase/server');
  
  if (!isAdminConfigured()) {
    console.warn('[VIP-Ticket] Supabase admin not configured, skipping update');
    return;
  }
  
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('vip_tickets')
    .update({
      tier: ticket.tier,
      region: ticket.region,
      end_date: ticket.endDate.toISOString(),
      is_active: ticket.isActive,
      auto_renew: ticket.autoRenew,
      stripe_subscription_id: ticket.stripeSubscriptionId || null,
      stripe_customer_id: ticket.stripeCustomerId || null,
      stripe_price_id: ticket.stripePriceId || null,
      metadata: ticket.metadata || {},
    })
    .eq('id', ticket.id);
  
  if (error) {
    console.error('[VIP-Ticket] Failed to update ticket:', error);
    throw new Error(`Failed to update VIP ticket: ${error.message}`);
  }
}

/**
 * Activate a VIP ticket (called after successful payment)
 */
export async function activateTicket(
  ticketId: string,
  stripeSubscriptionId?: string,
  stripeCustomerId?: string
): Promise<VIPTicket | null> {
  const { createAdminClient, isAdminConfigured } = await import('./supabase/server');
  
  if (!isAdminConfigured()) {
    return null;
  }
  
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('vip_tickets')
    .update({
      is_active: true,
      stripe_subscription_id: stripeSubscriptionId,
      stripe_customer_id: stripeCustomerId,
    })
    .eq('id', ticketId)
    .select()
    .single();
  
  if (error) {
    console.error('[VIP-Ticket] Failed to activate ticket:', error);
    return null;
  }
  
  return rowToTicket(data as VIPTicketRow);
}

/**
 * Deactivate a VIP ticket (called on cancellation/expiration)
 */
export async function deactivateTicket(ticketId: string): Promise<void> {
  const { createAdminClient, isAdminConfigured } = await import('./supabase/server');
  
  if (!isAdminConfigured()) {
    return;
  }
  
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('vip_tickets')
    .update({
      is_active: false,
      auto_renew: false,
    })
    .eq('id', ticketId);
  
  if (error) {
    console.error('[VIP-Ticket] Failed to deactivate ticket:', error);
  }
}

/**
 * Deactivate ticket by user ID (for cancellation)
 */
export async function deactivateUserTicket(userId: string): Promise<void> {
  const { createAdminClient, isAdminConfigured } = await import('./supabase/server');
  
  if (!isAdminConfigured()) {
    return;
  }
  
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('vip_tickets')
    .update({
      is_active: false,
      auto_renew: false,
    })
    .eq('user_id', userId)
    .eq('is_active', true);
  
  if (error) {
    console.error('[VIP-Ticket] Failed to deactivate user ticket:', error);
  }
}

// =============================================================================
// Transaction Functions
// =============================================================================

/**
 * Create a payment transaction record
 */
export async function createTransaction(
  transaction: Omit<Transaction, 'id' | 'createdAt'>
): Promise<Transaction | null> {
  const { createAdminClient, isAdminConfigured } = await import('./supabase/server');
  
  if (!isAdminConfigured()) {
    return null;
  }
  
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('payment_transactions')
    .insert({
      ticket_id: transaction.ticketId || null,
      user_id: transaction.userId,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      transaction_type: transaction.transactionType,
      stripe_payment_intent_id: transaction.stripePaymentIntentId || null,
      stripe_charge_id: transaction.stripeChargeId || null,
      stripe_invoice_id: transaction.stripeInvoiceId || null,
      description: transaction.description || null,
      metadata: transaction.metadata || {},
      error_message: transaction.errorMessage || null,
      completed_at: transaction.completedAt?.toISOString() || null,
    })
    .select()
    .single();
  
  if (error) {
    console.error('[VIP-Ticket] Failed to create transaction:', error);
    return null;
  }
  
  return rowToTransaction(data as TransactionRow);
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: Transaction['status'],
  errorMessage?: string
): Promise<void> {
  const { createAdminClient, isAdminConfigured } = await import('./supabase/server');
  
  if (!isAdminConfigured()) {
    return;
  }
  
  const supabase = createAdminClient();
  
  const updateData: Record<string, unknown> = { status };
  if (errorMessage) {
    updateData.error_message = errorMessage;
  }
  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString();
  }
  
  const { error } = await supabase
    .from('payment_transactions')
    .update(updateData)
    .eq('id', transactionId);
  
  if (error) {
    console.error('[VIP-Ticket] Failed to update transaction:', error);
  }
}

/**
 * Get user's transaction history
 */
export async function getUserTransactions(userId: string, limit = 10): Promise<Transaction[]> {
  const { createAdminClient, isAdminConfigured } = await import('./supabase/server');
  
  if (!isAdminConfigured()) {
    return [];
  }
  
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('[VIP-Ticket] Failed to get user transactions:', error);
    return [];
  }
  
  return (data as TransactionRow[]).map(rowToTransaction);
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Convert database row to VIPTicket object
 */
function rowToTicket(row: VIPTicketRow): VIPTicket {
  return {
    id: row.id,
    userId: row.user_id,
    tier: row.tier as TierType,
    region: row.region as Region,
    startDate: new Date(row.start_date),
    endDate: new Date(row.end_date),
    isActive: row.is_active,
    autoRenew: row.auto_renew,
    paymentMethod: 'stripe', // Default to stripe
    stripeSubscriptionId: row.stripe_subscription_id || undefined,
    stripeCustomerId: row.stripe_customer_id || undefined,
    stripePriceId: row.stripe_price_id || undefined,
    metadata: row.metadata || undefined,
    transactionHistory: [], // Load separately if needed
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Convert database row to Transaction object
 */
function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    ticketId: row.ticket_id || '',
    userId: row.user_id,
    amount: row.amount,
    currency: row.currency as Currency,
    status: row.status as Transaction['status'],
    transactionType: row.transaction_type as Transaction['transactionType'],
    stripePaymentIntentId: row.stripe_payment_intent_id || undefined,
    stripeChargeId: row.stripe_charge_id || undefined,
    stripeInvoiceId: row.stripe_invoice_id || undefined,
    description: row.description || undefined,
    metadata: row.metadata || undefined,
    errorMessage: row.error_message || undefined,
    createdAt: new Date(row.created_at),
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
  };
}

/**
 * Check if a user has VIP access to a specific feature
 */
export async function checkUserAccess(userId: string, feature: string): Promise<boolean> {
  const ticket = await getActiveTicketByUserId(userId);
  return hasAccess(ticket, feature);
}

/**
 * Get user's current tier
 */
export async function getUserTier(userId: string): Promise<TierType> {
  const ticket = await getActiveTicketByUserId(userId);
  return ticket?.tier || 'free';
}

/**
 * Get formatted price for user's region
 */
export function getFormattedTierPrice(
  tier: TierType,
  region: Region,
  period: 'monthly' | 'yearly'
): { amount: number; currency: Currency; formatted: string } {
  return getTierPrice(tier, region, period);
}

/**
 * Get currency for a region
 */
export function getCurrencyForRegion(region: Region): Currency {
  return REGION_CURRENCY[region];
}
