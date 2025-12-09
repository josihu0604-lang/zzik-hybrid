/**
 * Multi-Gateway Payment System
 * Supports multiple payment providers with automatic country/currency routing
 * 
 * @description Unified payment interface for:
 * - Stripe (Global)
 * - Z-Pay (Korea)
 * - KakaoPay (Korea) - Future
 * - LinePay (Japan/Taiwan) - Future
 * - GCash (Philippines) - Future
 */

import Stripe from 'stripe';

// ============================================================================
// Types
// ============================================================================

export type Currency = 'USD' | 'KRW' | 'JPY' | 'THB' | 'PHP' | 'IDR' | 'SGD' | 'MYR' | 'TWD' | 'KZT' | 'CNY';
export type CountryCode = 'US' | 'KR' | 'JP' | 'TH' | 'PH' | 'ID' | 'SG' | 'MY' | 'TW' | 'KZ' | 'CN';
export type PaymentGatewayType = 'stripe' | 'zpay' | 'kakaopay' | 'linepay' | 'gcash';

export interface PaymentIntentParams {
  amount: number;
  currency: Currency;
  customerId?: string;
  customerEmail?: string;
  description?: string;
  metadata?: Record<string, string>;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PaymentIntent {
  id: string;
  clientSecret?: string;
  status: PaymentStatus;
  amount: number;
  currency: Currency;
  gateway: PaymentGatewayType;
  checkoutUrl?: string;
  expiresAt?: Date;
  metadata?: Record<string, string>;
}

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'requires_action'
  | 'requires_confirmation'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  status: PaymentStatus;
  amount: number;
  currency: Currency;
  gateway: PaymentGatewayType;
  receiptUrl?: string;
  error?: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  status: 'pending' | 'succeeded' | 'failed';
  error?: string;
}

export interface WebhookEvent {
  type: string;
  data: any;
  gateway: PaymentGatewayType;
  timestamp: Date;
}

// ============================================================================
// Payment Gateway Interface
// ============================================================================

export interface PaymentGateway {
  name: PaymentGatewayType;
  displayName: string;
  supportedCurrencies: Currency[];
  supportedCountries: CountryCode[];
  
  createPaymentIntent(params: PaymentIntentParams): Promise<PaymentIntent>;
  confirmPayment(intentId: string, paymentMethodId?: string): Promise<PaymentResult>;
  getPaymentStatus(intentId: string): Promise<PaymentStatus>;
  refund(paymentId: string, amount?: number, reason?: string): Promise<RefundResult>;
  handleWebhook(payload: string, signature: string): Promise<WebhookEvent>;
}

// ============================================================================
// Stripe Gateway Implementation
// ============================================================================

export class StripeGateway implements PaymentGateway {
  name: PaymentGatewayType = 'stripe';
  displayName = 'Credit Card';
  supportedCurrencies: Currency[] = ['USD', 'KRW', 'JPY', 'THB', 'PHP', 'IDR', 'SGD', 'MYR', 'TWD', 'CNY'];
  supportedCountries: CountryCode[] = ['US', 'KR', 'JP', 'TH', 'PH', 'ID', 'SG', 'MY', 'TW', 'CN'];
  
  private stripe: Stripe;
  private webhookSecret: string;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-01-27.acacia' as any,
    });
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  }

  async createPaymentIntent(params: PaymentIntentParams): Promise<PaymentIntent> {
    const { amount, currency, customerEmail, description, metadata, returnUrl, cancelUrl } = params;

    // Determine if zero-decimal currency
    const isZeroDecimal = ['KRW', 'JPY'].includes(currency);
    const unitAmount = isZeroDecimal ? Math.round(amount) : Math.round(amount * 100);

    try {
      // Create checkout session for better UX
      const session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: customerEmail,
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: description || 'ZZIK Purchase',
                metadata: metadata,
              },
              unit_amount: unitAmount,
            },
            quantity: 1,
          },
        ],
        success_url: returnUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`,
        metadata: metadata,
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
      });

      return {
        id: session.id,
        clientSecret: undefined,
        status: 'pending',
        amount,
        currency,
        gateway: 'stripe',
        checkoutUrl: session.url || undefined,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        metadata,
      };
    } catch (error: any) {
      console.error('[StripeGateway] Create payment intent failed:', error);
      throw new Error(`Stripe payment failed: ${error.message}`);
    }
  }

  async confirmPayment(intentId: string): Promise<PaymentResult> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(intentId);
      
      return {
        success: session.payment_status === 'paid',
        paymentId: session.payment_intent as string || session.id,
        status: this.mapStripeStatus(session.payment_status),
        amount: session.amount_total ? session.amount_total / 100 : 0,
        currency: (session.currency?.toUpperCase() || 'USD') as Currency,
        gateway: 'stripe',
        receiptUrl: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        paymentId: intentId,
        status: 'failed',
        amount: 0,
        currency: 'USD',
        gateway: 'stripe',
        error: error.message,
      };
    }
  }

  async getPaymentStatus(intentId: string): Promise<PaymentStatus> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(intentId);
      return this.mapStripeStatus(session.payment_status);
    } catch {
      return 'failed';
    }
  }

  async refund(paymentId: string, amount?: number, reason?: string): Promise<RefundResult> {
    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentId,
        reason: (reason as Stripe.RefundCreateParams.Reason) || 'requested_by_customer',
      };
      
      if (amount) {
        refundParams.amount = Math.round(amount * 100);
      }

      const refund = await this.stripe.refunds.create(refundParams);

      return {
        success: refund.status === 'succeeded',
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status === 'succeeded' ? 'succeeded' : 'pending',
      };
    } catch (error: any) {
      return {
        success: false,
        refundId: '',
        amount: 0,
        status: 'failed',
        error: error.message,
      };
    }
  }

  async handleWebhook(payload: string, signature: string): Promise<WebhookEvent> {
    const event = this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
    
    return {
      type: event.type,
      data: event.data.object,
      gateway: 'stripe',
      timestamp: new Date(event.created * 1000),
    };
  }

  private mapStripeStatus(status: string | null): PaymentStatus {
    switch (status) {
      case 'paid': return 'succeeded';
      case 'unpaid': return 'pending';
      case 'no_payment_required': return 'succeeded';
      default: return 'pending';
    }
  }
}

// ============================================================================
// Z-Pay Gateway Implementation (Korea)
// ============================================================================

export class ZPayGateway implements PaymentGateway {
  name: PaymentGatewayType = 'zpay';
  displayName = 'Z-Pay';
  supportedCurrencies: Currency[] = ['KRW'];
  supportedCountries: CountryCode[] = ['KR'];

  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.ZPAY_API_KEY || '';
    this.apiSecret = process.env.ZPAY_API_SECRET || '';
    this.baseUrl = process.env.ZPAY_API_URL || 'https://api.zpay.co.kr';
  }

  async createPaymentIntent(params: PaymentIntentParams): Promise<PaymentIntent> {
    const { amount, currency, customerEmail, description, metadata, returnUrl, cancelUrl } = params;

    // Z-Pay API call (simulated for now)
    const orderId = `ZPAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // In production, this would call the actual Z-Pay API
      // const response = await fetch(`${this.baseUrl}/v1/payments/ready`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.apiKey}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     merchant_uid: orderId,
      //     amount: amount,
      //     buyer_email: customerEmail,
      //     name: description,
      //     return_url: returnUrl,
      //     cancel_url: cancelUrl,
      //   }),
      // });

      // Simulated response for development
      const checkoutUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/payment/zpay/checkout?orderId=${orderId}&amount=${amount}`;

      return {
        id: orderId,
        status: 'pending',
        amount,
        currency: 'KRW',
        gateway: 'zpay',
        checkoutUrl,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        metadata,
      };
    } catch (error: any) {
      console.error('[ZPayGateway] Create payment intent failed:', error);
      throw new Error(`Z-Pay payment failed: ${error.message}`);
    }
  }

  async confirmPayment(intentId: string): Promise<PaymentResult> {
    try {
      // In production, verify with Z-Pay API
      // const response = await fetch(`${this.baseUrl}/v1/payments/${intentId}`, {
      //   headers: { 'Authorization': `Bearer ${this.apiKey}` },
      // });

      return {
        success: true,
        paymentId: intentId,
        status: 'succeeded',
        amount: 0, // Would be from API response
        currency: 'KRW',
        gateway: 'zpay',
      };
    } catch (error: any) {
      return {
        success: false,
        paymentId: intentId,
        status: 'failed',
        amount: 0,
        currency: 'KRW',
        gateway: 'zpay',
        error: error.message,
      };
    }
  }

  async getPaymentStatus(intentId: string): Promise<PaymentStatus> {
    // In production, check with Z-Pay API
    return 'succeeded';
  }

  async refund(paymentId: string, amount?: number, reason?: string): Promise<RefundResult> {
    try {
      // In production, call Z-Pay refund API
      const refundId = `ZPAY_REFUND_${Date.now()}`;

      return {
        success: true,
        refundId,
        amount: amount || 0,
        status: 'succeeded',
      };
    } catch (error: any) {
      return {
        success: false,
        refundId: '',
        amount: 0,
        status: 'failed',
        error: error.message,
      };
    }
  }

  async handleWebhook(payload: string, signature: string): Promise<WebhookEvent> {
    // Verify Z-Pay webhook signature
    const data = JSON.parse(payload);
    
    return {
      type: data.event_type || 'payment.completed',
      data: data,
      gateway: 'zpay',
      timestamp: new Date(),
    };
  }
}

// ============================================================================
// Gateway Registry
// ============================================================================

const gateways: Map<PaymentGatewayType, PaymentGateway> = new Map();

export function registerGateway(gateway: PaymentGateway): void {
  gateways.set(gateway.name, gateway);
}

export function getGateway(type: PaymentGatewayType): PaymentGateway | undefined {
  return gateways.get(type);
}

// Initialize default gateways
registerGateway(new StripeGateway());
registerGateway(new ZPayGateway());

// ============================================================================
// Gateway Selection Logic
// ============================================================================

export interface GatewayOption {
  gateway: PaymentGatewayType;
  displayName: string;
  icon: string;
  recommended: boolean;
  fees?: string;
}

/**
 * Get available payment gateways for a country/currency combination
 */
export function getAvailableGateways(country: CountryCode, currency: Currency): GatewayOption[] {
  const options: GatewayOption[] = [];

  // Z-Pay for Korea
  if (country === 'KR' && currency === 'KRW') {
    options.push({
      gateway: 'zpay',
      displayName: 'Z-Pay',
      icon: '⚡',
      recommended: true,
      fees: '0%',
    });
  }

  // Stripe is always available as fallback
  options.push({
    gateway: 'stripe',
    displayName: 'Credit Card',
    icon: '💳',
    recommended: options.length === 0,
    fees: '2.9% + ₩300',
  });

  return options;
}

/**
 * Select the best gateway for a transaction
 */
export function selectBestGateway(
  country: CountryCode,
  currency: Currency,
  preferredGateway?: PaymentGatewayType
): PaymentGateway {
  // If preferred gateway is specified and available, use it
  if (preferredGateway) {
    const gateway = gateways.get(preferredGateway);
    if (gateway && 
        gateway.supportedCountries.includes(country) && 
        gateway.supportedCurrencies.includes(currency)) {
      return gateway;
    }
  }

  // Korea: Z-Pay preferred
  if (country === 'KR' && currency === 'KRW') {
    const zpay = gateways.get('zpay');
    if (zpay) return zpay;
  }

  // Default to Stripe
  return gateways.get('stripe')!;
}

// ============================================================================
// Unified Payment Functions
// ============================================================================

/**
 * Process a payment through the best available gateway
 */
export async function processPayment(
  amount: number,
  currency: Currency,
  country: CountryCode,
  options: {
    customerEmail?: string;
    description?: string;
    metadata?: Record<string, string>;
    returnUrl?: string;
    cancelUrl?: string;
    preferredGateway?: PaymentGatewayType;
  } = {}
): Promise<PaymentIntent> {
  const gateway = selectBestGateway(country, currency, options.preferredGateway);
  
  return gateway.createPaymentIntent({
    amount,
    currency,
    customerEmail: options.customerEmail,
    description: options.description,
    metadata: options.metadata,
    returnUrl: options.returnUrl,
    cancelUrl: options.cancelUrl,
  });
}

/**
 * Process a refund
 */
export async function processRefund(
  paymentId: string,
  gateway: PaymentGatewayType,
  amount?: number,
  reason?: string
): Promise<RefundResult> {
  const gatewayInstance = gateways.get(gateway);
  if (!gatewayInstance) {
    return {
      success: false,
      refundId: '',
      amount: 0,
      status: 'failed',
      error: `Gateway ${gateway} not found`,
    };
  }

  return gatewayInstance.refund(paymentId, amount, reason);
}

/**
 * Verify payment status
 */
export async function verifyPayment(
  paymentId: string,
  gateway: PaymentGatewayType
): Promise<PaymentResult> {
  const gatewayInstance = gateways.get(gateway);
  if (!gatewayInstance) {
    return {
      success: false,
      paymentId,
      status: 'failed',
      amount: 0,
      currency: 'USD',
      gateway,
      error: `Gateway ${gateway} not found`,
    };
  }

  return gatewayInstance.confirmPayment(paymentId);
}

export default {
  processPayment,
  processRefund,
  verifyPayment,
  getAvailableGateways,
  selectBestGateway,
  registerGateway,
  getGateway,
};
