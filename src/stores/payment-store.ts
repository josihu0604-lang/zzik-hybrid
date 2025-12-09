/**
 * Payment Store - Zustand state management for payments and wallet
 * 
 * Manages:
 * - Z-Point balance
 * - Payment methods
 * - Transaction history
 * - Pending payments
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ===========================================
// Types
// ===========================================

export interface ZPoint {
  balance: number;         // Available balance (KRW)
  pendingBalance: number;  // Pending deposits
  lockedBalance: number;   // Locked for pending payments
  lastUpdated: Date;
}

export type PaymentMethodType = 'z-point' | 'card' | 'crypto' | 'bank-transfer';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  name: string;
  last4?: string;
  expiryDate?: string;
  isDefault: boolean;
  createdAt: Date;
}

export type TransactionType = 'charge' | 'payment' | 'refund' | 'withdrawal' | 'transfer';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  description: string;
  merchantName?: string;
  merchantLogo?: string;
  paymentMethod?: PaymentMethodType;
  referenceId?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface PendingPayment {
  id: string;
  amount: number;
  currency: string;
  merchantName: string;
  merchantLogo?: string;
  description: string;
  expiresAt: Date;
  paymentMethod: PaymentMethodType;
}

// ===========================================
// Store State Interface
// ===========================================

interface PaymentState {
  // State
  balance: ZPoint;
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  selectedMethod: PaymentMethod | null;
  pendingPayment: PendingPayment | null;
  isLoading: boolean;
  error: string | null;
  
  // Computed
  totalSpentThisMonth: number;
  
  // Actions - Balance
  setBalance: (balance: ZPoint) => void;
  updateBalance: (updates: Partial<ZPoint>) => void;
  
  // Actions - Payment Methods
  setPaymentMethods: (methods: PaymentMethod[]) => void;
  addPaymentMethod: (method: PaymentMethod) => void;
  removePaymentMethod: (methodId: string) => void;
  setDefaultMethod: (methodId: string) => void;
  selectMethod: (method: PaymentMethod | null) => void;
  
  // Actions - Transactions
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  
  // Actions - Pending Payment
  setPendingPayment: (payment: PendingPayment | null) => void;
  clearPendingPayment: () => void;
  
  // Actions - Loading/Error
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Actions - Async (to be called with API)
  fetchBalance: () => Promise<void>;
  fetchTransactions: (params?: { page?: number; limit?: number }) => Promise<void>;
  fetchPaymentMethods: () => Promise<void>;
  
  // Actions - Reset
  reset: () => void;
}

// ===========================================
// Initial State
// ===========================================

const initialState = {
  balance: {
    balance: 0,
    pendingBalance: 0,
    lockedBalance: 0,
    lastUpdated: new Date(),
  },
  paymentMethods: [],
  transactions: [],
  selectedMethod: null,
  pendingPayment: null,
  isLoading: false,
  error: null,
  totalSpentThisMonth: 0,
};

// ===========================================
// Store Implementation
// ===========================================

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Balance Actions
      setBalance: (balance) => {
        set({ balance });
      },
      
      updateBalance: (updates) => {
        set(state => ({
          balance: {
            ...state.balance,
            ...updates,
            lastUpdated: new Date(),
          },
        }));
      },
      
      // Payment Methods Actions
      setPaymentMethods: (methods) => {
        set({ paymentMethods: methods });
        
        // Auto-select default method
        const defaultMethod = methods.find(m => m.isDefault);
        if (defaultMethod && !get().selectedMethod) {
          set({ selectedMethod: defaultMethod });
        }
      },
      
      addPaymentMethod: (method) => {
        set(state => ({
          paymentMethods: [...state.paymentMethods, method],
        }));
        
        // If it's the first method, set as default
        if (get().paymentMethods.length === 1) {
          get().setDefaultMethod(method.id);
        }
      },
      
      removePaymentMethod: (methodId) => {
        set(state => {
          const newMethods = state.paymentMethods.filter(m => m.id !== methodId);
          
          // If removed method was selected, clear selection
          const newSelectedMethod = 
            state.selectedMethod?.id === methodId ? null : state.selectedMethod;
          
          return {
            paymentMethods: newMethods,
            selectedMethod: newSelectedMethod,
          };
        });
      },
      
      setDefaultMethod: (methodId) => {
        set(state => ({
          paymentMethods: state.paymentMethods.map(m => ({
            ...m,
            isDefault: m.id === methodId,
          })),
        }));
      },
      
      selectMethod: (method) => {
        set({ selectedMethod: method });
      },
      
      // Transactions Actions
      setTransactions: (transactions) => {
        set({ transactions });
        
        // Calculate monthly spending
        const now = new Date();
        const thisMonth = transactions
          .filter(t => 
            t.type === 'payment' &&
            t.status === 'completed' &&
            new Date(t.createdAt).getMonth() === now.getMonth() &&
            new Date(t.createdAt).getFullYear() === now.getFullYear()
          )
          .reduce((sum, t) => sum + t.amount, 0);
        
        set({ totalSpentThisMonth: thisMonth });
      },
      
      addTransaction: (transaction) => {
        set(state => ({
          transactions: [transaction, ...state.transactions],
        }));
        
        // Update balance based on transaction type
        if (transaction.status === 'completed') {
          const { updateBalance } = get();
          switch (transaction.type) {
            case 'charge':
              updateBalance({ balance: get().balance.balance + transaction.amount });
              break;
            case 'payment':
            case 'withdrawal':
              updateBalance({ balance: get().balance.balance - transaction.amount });
              break;
            case 'refund':
              updateBalance({ balance: get().balance.balance + transaction.amount });
              break;
          }
        }
      },
      
      updateTransaction: (id, updates) => {
        set(state => ({
          transactions: state.transactions.map(t =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },
      
      // Pending Payment Actions
      setPendingPayment: (payment) => {
        set({ pendingPayment: payment });
        
        // Lock the amount in balance
        if (payment) {
          get().updateBalance({
            lockedBalance: get().balance.lockedBalance + payment.amount,
          });
        }
      },
      
      clearPendingPayment: () => {
        const pending = get().pendingPayment;
        if (pending) {
          get().updateBalance({
            lockedBalance: Math.max(0, get().balance.lockedBalance - pending.amount),
          });
        }
        set({ pendingPayment: null });
      },
      
      // Loading/Error Actions
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
      
      setError: (error) => {
        set({ error });
      },
      
      // Async Actions
      fetchBalance: async () => {
        const { setLoading, setError, setBalance } = get();
        setLoading(true);
        setError(null);
        
        try {
          const response = await fetch('/api/wallet/balance');
          if (!response.ok) {
            throw new Error('Failed to fetch balance');
          }
          
          const data = await response.json();
          setBalance({
            balance: data.balance || 0,
            pendingBalance: data.pendingBalance || 0,
            lockedBalance: data.lockedBalance || 0,
            lastUpdated: new Date(),
          });
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error');
        } finally {
          setLoading(false);
        }
      },
      
      fetchTransactions: async (params = {}) => {
        const { setLoading, setError, setTransactions } = get();
        setLoading(true);
        setError(null);
        
        try {
          const queryParams = new URLSearchParams();
          if (params.page) queryParams.set('page', String(params.page));
          if (params.limit) queryParams.set('limit', String(params.limit));
          
          const response = await fetch(`/api/wallet/transactions?${queryParams}`);
          if (!response.ok) {
            throw new Error('Failed to fetch transactions');
          }
          
          const data = await response.json();
          setTransactions(data.transactions || []);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error');
        } finally {
          setLoading(false);
        }
      },
      
      fetchPaymentMethods: async () => {
        const { setLoading, setError, setPaymentMethods } = get();
        setLoading(true);
        setError(null);
        
        try {
          const response = await fetch('/api/payment/methods');
          if (!response.ok) {
            throw new Error('Failed to fetch payment methods');
          }
          
          const data = await response.json();
          setPaymentMethods(data.methods || []);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error');
        } finally {
          setLoading(false);
        }
      },
      
      // Reset
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'zzik-payment-storage',
      partialize: (state) => ({
        balance: state.balance,
        paymentMethods: state.paymentMethods,
        selectedMethod: state.selectedMethod,
        // Don't persist transactions or pending payments
      }),
    }
  )
);

// ===========================================
// Selectors
// ===========================================

export const selectAvailableBalance = (state: PaymentState) =>
  state.balance.balance - state.balance.lockedBalance;

export const selectCanPay = (amount: number) => (state: PaymentState) =>
  selectAvailableBalance(state) >= amount;

export const selectDefaultPaymentMethod = (state: PaymentState) =>
  state.paymentMethods.find(m => m.isDefault);

export const selectRecentTransactions = (limit: number = 5) => (state: PaymentState) =>
  state.transactions.slice(0, limit);
