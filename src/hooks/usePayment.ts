/**
 * usePayment - Payment processing hooks
 * 
 * Provides easy-to-use interfaces for:
 * - Payment processing
 * - Wallet management
 * - Transaction history
 */

'use client';

import { useCallback, useEffect, useMemo } from 'react';
import {
  usePaymentStore,
  selectAvailableBalance,
  selectCanPay,
  selectDefaultPaymentMethod,
  selectRecentTransactions,
  type PaymentMethod,
  type Transaction,
  type PendingPayment,
} from '@/stores';
import { useHaptic } from './useHaptic';

// ===========================================
// usePayment - Main payment hook
// ===========================================

export interface UsePaymentOptions {
  autoFetchBalance?: boolean;
  autoFetchMethods?: boolean;
}

export interface UsePaymentReturn {
  // State
  balance: number;
  availableBalance: number;
  lockedBalance: number;
  pendingBalance: number;
  selectedMethod: PaymentMethod | null;
  pendingPayment: PendingPayment | null;
  isLoading: boolean;
  error: string | null;
  
  // Methods
  selectMethod: (method: PaymentMethod) => void;
  canPay: (amount: number) => boolean;
  initializePayment: (payment: PendingPayment) => void;
  confirmPayment: () => Promise<{ success: boolean; transactionId?: string }>;
  cancelPayment: () => void;
  refresh: () => Promise<void>;
}

export function usePayment(options: UsePaymentOptions = {}): UsePaymentReturn {
  const { autoFetchBalance = true, autoFetchMethods = true } = options;
  
  const store = usePaymentStore();
  const { triggerHaptic } = useHaptic();
  
  const availableBalance = usePaymentStore(selectAvailableBalance);
  
  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetchBalance) {
      store.fetchBalance();
    }
    if (autoFetchMethods) {
      store.fetchPaymentMethods();
    }
  }, [autoFetchBalance, autoFetchMethods]);
  
  // Select payment method
  const selectMethod = useCallback((method: PaymentMethod) => {
    store.selectMethod(method);
    triggerHaptic('selection');
  }, [store, triggerHaptic]);
  
  // Check if user can pay
  const canPay = useCallback((amount: number): boolean => {
    return availableBalance >= amount;
  }, [availableBalance]);
  
  // Initialize payment
  const initializePayment = useCallback((payment: PendingPayment) => {
    store.setPendingPayment(payment);
  }, [store]);
  
  // Confirm payment
  const confirmPayment = useCallback(async (): Promise<{ success: boolean; transactionId?: string }> => {
    const { pendingPayment, selectedMethod } = store;
    
    if (!pendingPayment) {
      return { success: false };
    }
    
    try {
      // Call payment API
      const response = await fetch('/api/payment/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: pendingPayment.amount,
          currency: pendingPayment.currency,
          merchantName: pendingPayment.merchantName,
          paymentMethod: selectedMethod?.type || pendingPayment.paymentMethod,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Payment failed');
      }
      
      const data = await response.json();
      
      // Add transaction to history
      const transaction: Transaction = {
        id: data.transactionId,
        type: 'payment',
        amount: pendingPayment.amount,
        currency: pendingPayment.currency,
        status: 'completed',
        description: pendingPayment.description,
        merchantName: pendingPayment.merchantName,
        merchantLogo: pendingPayment.merchantLogo,
        paymentMethod: selectedMethod?.type || pendingPayment.paymentMethod,
        createdAt: new Date(),
        completedAt: new Date(),
      };
      
      store.addTransaction(transaction);
      store.clearPendingPayment();
      
      triggerHaptic('success');
      
      return { success: true, transactionId: data.transactionId };
    } catch (error) {
      triggerHaptic('error');
      return { success: false };
    }
  }, [store, triggerHaptic]);
  
  // Cancel payment
  const cancelPayment = useCallback(() => {
    store.clearPendingPayment();
    triggerHaptic('warning');
  }, [store, triggerHaptic]);
  
  // Refresh all data
  const refresh = useCallback(async () => {
    await Promise.all([
      store.fetchBalance(),
      store.fetchPaymentMethods(),
    ]);
  }, [store]);
  
  return {
    balance: store.balance.balance,
    availableBalance,
    lockedBalance: store.balance.lockedBalance,
    pendingBalance: store.balance.pendingBalance,
    selectedMethod: store.selectedMethod,
    pendingPayment: store.pendingPayment,
    isLoading: store.isLoading,
    error: store.error,
    selectMethod,
    canPay,
    initializePayment,
    confirmPayment,
    cancelPayment,
    refresh,
  };
}

// ===========================================
// useWallet - Wallet management hook
// ===========================================

export interface UseWalletReturn {
  balance: number;
  availableBalance: number;
  pendingBalance: number;
  tier: string;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  charge: (amount: number) => Promise<{ success: boolean; redirectUrl?: string }>;
  withdraw: (amount: number) => Promise<{ success: boolean }>;
}

export function useWallet(): UseWalletReturn {
  const store = usePaymentStore();
  const availableBalance = usePaymentStore(selectAvailableBalance);
  
  // Fetch balance on mount
  useEffect(() => {
    store.fetchBalance();
  }, []);
  
  // Charge wallet
  const charge = useCallback(async (amount: number): Promise<{ success: boolean; redirectUrl?: string }> => {
    try {
      const response = await fetch('/api/wallet/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      
      if (!response.ok) {
        throw new Error('Charge failed');
      }
      
      const data = await response.json();
      return { success: true, redirectUrl: data.redirectUrl };
    } catch (error) {
      return { success: false };
    }
  }, []);
  
  // Withdraw from wallet
  const withdraw = useCallback(async (amount: number): Promise<{ success: boolean }> => {
    if (availableBalance < amount) {
      return { success: false };
    }
    
    try {
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      
      if (!response.ok) {
        throw new Error('Withdrawal failed');
      }
      
      await store.fetchBalance();
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }, [availableBalance, store]);
  
  return {
    balance: store.balance.balance,
    availableBalance,
    pendingBalance: store.balance.pendingBalance,
    tier: 'basic', // TODO: Implement tiers
    isLoading: store.isLoading,
    error: store.error,
    refresh: store.fetchBalance,
    charge,
    withdraw,
  };
}

// ===========================================
// useTransactions - Transaction history hook
// ===========================================

export interface UseTransactionsOptions {
  limit?: number;
  autoFetch?: boolean;
}

export interface UseTransactionsReturn {
  transactions: Transaction[];
  recentTransactions: Transaction[];
  totalSpentThisMonth: number;
  isLoading: boolean;
  error: string | null;
  fetchMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useTransactions(options: UseTransactionsOptions = {}): UseTransactionsReturn {
  const { limit = 20, autoFetch = true } = options;
  
  const store = usePaymentStore();
  const recentTransactions = usePaymentStore(selectRecentTransactions(5));
  
  // Fetch on mount
  useEffect(() => {
    if (autoFetch) {
      store.fetchTransactions({ limit });
    }
  }, [autoFetch, limit]);
  
  // Fetch more transactions
  const fetchMore = useCallback(async () => {
    const currentPage = Math.ceil(store.transactions.length / limit) + 1;
    await store.fetchTransactions({ page: currentPage, limit });
  }, [store, limit]);
  
  return {
    transactions: store.transactions,
    recentTransactions,
    totalSpentThisMonth: store.totalSpentThisMonth,
    isLoading: store.isLoading,
    error: store.error,
    fetchMore,
    refresh: () => store.fetchTransactions({ limit }),
  };
}

// ===========================================
// usePaymentMethods - Payment methods hook
// ===========================================

export interface UsePaymentMethodsReturn {
  methods: PaymentMethod[];
  defaultMethod: PaymentMethod | undefined;
  selectedMethod: PaymentMethod | null;
  isLoading: boolean;
  error: string | null;
  select: (method: PaymentMethod) => void;
  setDefault: (methodId: string) => void;
  add: (method: Omit<PaymentMethod, 'id' | 'createdAt'>) => Promise<{ success: boolean }>;
  remove: (methodId: string) => Promise<{ success: boolean }>;
  refresh: () => Promise<void>;
}

export function usePaymentMethods(): UsePaymentMethodsReturn {
  const store = usePaymentStore();
  const defaultMethod = usePaymentStore(selectDefaultPaymentMethod);
  
  // Fetch on mount
  useEffect(() => {
    store.fetchPaymentMethods();
  }, []);
  
  // Add payment method
  const add = useCallback(async (
    method: Omit<PaymentMethod, 'id' | 'createdAt'>
  ): Promise<{ success: boolean }> => {
    try {
      const response = await fetch('/api/payment/methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(method),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add payment method');
      }
      
      const data = await response.json();
      store.addPaymentMethod(data.method);
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }, [store]);
  
  // Remove payment method
  const remove = useCallback(async (methodId: string): Promise<{ success: boolean }> => {
    try {
      const response = await fetch(`/api/payment/methods/${methodId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove payment method');
      }
      
      store.removePaymentMethod(methodId);
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }, [store]);
  
  return {
    methods: store.paymentMethods,
    defaultMethod,
    selectedMethod: store.selectedMethod,
    isLoading: store.isLoading,
    error: store.error,
    select: store.selectMethod,
    setDefault: store.setDefaultMethod,
    add,
    remove,
    refresh: store.fetchPaymentMethods,
  };
}
