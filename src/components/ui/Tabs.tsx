'use client';

import { useState, createContext, useContext, ReactNode } from 'react';
import { m } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab components must be used within Tabs');
  }
  return context;
}

export interface TabsProps {
  defaultValue: string;
  children: ReactNode;
  className?: string;
  onChange?: (value: string) => void;
}

export function Tabs({ defaultValue, children, className, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleChange = (value: string) => {
    setActiveTab(value);
    onChange?.(value);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleChange }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabListProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

export function TabList({ children, className, variant = 'default' }: TabListProps) {
  const variantClasses = {
    default: 'bg-white/[0.04] p-1 rounded-xl',
    pills: 'gap-2',
    underline: 'border-b border-white/10',
  };

  return (
    <div
      className={cn(
        'flex items-center',
        variantClasses[variant],
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  );
}

interface TabTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function TabTrigger({ value, children, className, disabled }: TabTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={cn(
        'relative flex-1 px-4 py-2 text-sm font-medium',
        'transition-colors duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-flame-500/50 rounded-lg',
        isActive ? 'text-white' : 'text-white/50 hover:text-white/70',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {isActive && (
        <m.div
          layoutId="activeTab"
          className="absolute inset-0 bg-white/10 rounded-lg"
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

interface TabContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabContent({ value, children, className }: TabContentProps) {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) return null;

  return (
    <m.div
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      role="tabpanel"
      id={`tabpanel-${value}`}
      className={cn('mt-4', className)}
    >
      {children}
    </m.div>
  );
}

// Re-export all tab components
Tabs.List = TabList;
Tabs.Trigger = TabTrigger;
Tabs.Content = TabContent;
