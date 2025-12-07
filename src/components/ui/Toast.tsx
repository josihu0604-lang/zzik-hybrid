'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { zIndex } from '@/lib/design-tokens';

// ============================================================================
// Toast Types
// ============================================================================

type ToastType = 'success' | 'error' | 'info' | 'celebration';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  emoji?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  show: (options: Omit<Toast, 'id'>) => void;
  success: (message: string, emoji?: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  celebrate: (message: string) => void;
  dismiss: (id: string) => void;
}

// ============================================================================
// Context
// ============================================================================

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ============================================================================
// Haptic Feedback Helper
// ============================================================================

function triggerHaptic(intensity: 'light' | 'medium' | 'heavy' = 'light') {
  if ('vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: [30, 20, 30],
    };
    navigator.vibrate(patterns[intensity]);
  }
}

// ============================================================================
// Toast Item Component
// ============================================================================

const toastStyles: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'bg-green-500/10 dark:bg-green-500/20',
    border: 'border-green-500/30',
    icon: '✓',
  },
  error: {
    bg: 'bg-red-500/10 dark:bg-red-500/20',
    border: 'border-red-500/30',
    icon: '✕',
  },
  info: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    border: 'border-blue-500/30',
    icon: 'ℹ',
  },
  celebration: {
    bg: 'bg-orange-500/10 dark:bg-orange-500/20',
    border: 'border-orange-500/30',
    icon: '🎉',
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const styles = toastStyles[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      onClick={onDismiss}
      className={`
        relative flex items-center gap-3 px-4 py-4
        rounded-2xl border backdrop-blur-xl
        shadow-lg cursor-pointer
        ${styles.bg} ${styles.border}
      `}
      role="button"
      aria-label={`${toast.message} 알림 닫기`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onDismiss();
        }
      }}
    >
      {/* Icon/Emoji */}
      <span className="text-xl flex-shrink-0">{toast.emoji || styles.icon}</span>

      {/* Message */}
      <p className="text-sm font-medium text-gray-900 dark:text-white">{toast.message}</p>

      {/* Celebration glow effect */}
      {toast.type === 'celebration' && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-orange-500/20 blur-xl -z-10"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        />
      )}
    </motion.div>
  );
}

// ============================================================================
// Toast Container Component
// ============================================================================

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 flex flex-col gap-2 pointer-events-none"
      role="region"
      aria-live="polite"
      aria-label="알림"
      style={{
        top: 'calc(1rem + env(safe-area-inset-top))',
        zIndex: zIndex.notification,
      }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={() => onDismiss(toast.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Toast Provider
// ============================================================================

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (options: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const duration = options.duration ?? 3000;

      // Haptic feedback
      if (options.type === 'celebration') {
        triggerHaptic('medium');
      } else if (options.type === 'success') {
        triggerHaptic('light');
      } else if (options.type === 'error') {
        triggerHaptic('heavy');
      }

      setToasts((prev) => [...prev, { ...options, id }]);

      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss]
  );

  const success = useCallback(
    (message: string, emoji?: string) => {
      show({ type: 'success', message, emoji });
    },
    [show]
  );

  const error = useCallback(
    (message: string) => {
      show({ type: 'error', message });
    },
    [show]
  );

  const info = useCallback(
    (message: string) => {
      show({ type: 'info', message });
    },
    [show]
  );

  const celebrate = useCallback(
    (message: string) => {
      show({ type: 'celebration', message, emoji: '🎉', duration: 4000 });
    },
    [show]
  );

  return (
    <ToastContext.Provider value={{ toasts, show, success, error, info, celebrate, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ============================================================================
// useToast Hook
// ============================================================================

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastProvider;
