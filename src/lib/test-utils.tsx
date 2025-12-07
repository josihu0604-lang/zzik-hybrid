/**
 * Test Utilities
 *
 * Helpers for testing React components and hooks
 * Note: This file should only be imported in Jest test environment
 */

import React, { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { LanguageProvider } from '@/i18n';

// ============================================
// Type Definitions for Test Environment
// ============================================

type MockFn<TReturn = unknown, TArgs extends unknown[] = unknown[]> = {
  (...args: TArgs): TReturn;
  mockImplementation: (fn: (...args: TArgs) => TReturn) => MockFn<TReturn, TArgs>;
  mockResolvedValue: (value: Awaited<TReturn>) => MockFn<TReturn, TArgs>;
  mockRejectedValue: (error: unknown) => MockFn<TReturn, TArgs>;
  mockReset: () => MockFn<TReturn, TArgs>;
  mockClear: () => MockFn<TReturn, TArgs>;
  mockReturnValue: (value: TReturn) => MockFn<TReturn, TArgs>;
};

declare const jest: {
  fn: <TReturn = unknown, TArgs extends unknown[] = unknown[]>(
    implementation?: (...args: TArgs) => TReturn
  ) => MockFn<TReturn, TArgs>;
};

// ============================================
// Test Providers
// ============================================

interface TestProvidersProps {
  children: ReactNode;
}

/**
 * AllProviders - Wraps components with all required providers for testing
 */
function AllProviders({ children }: TestProvidersProps): ReactElement {
  return <LanguageProvider initialLocale="ko">{children}</LanguageProvider>;
}

// ============================================
// Custom Render
// ============================================

/**
 * Custom render function that includes all providers
 */
function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>): RenderResult {
  return render(ui, { wrapper: AllProviders, ...options });
}

// ============================================
// Mock Functions
// ============================================

/**
 * Create a mock function with typed return value
 */
export function createMock<TReturn = unknown, TArgs extends unknown[] = unknown[]>(
  implementation?: (...args: TArgs) => TReturn
): MockFn<TReturn, TArgs> {
  if (typeof jest !== 'undefined') {
    return jest.fn(implementation) as MockFn<TReturn, TArgs>;
  }
  // Fallback for non-Jest environments
  const fn = (implementation || (() => undefined as unknown as TReturn)) as MockFn<TReturn, TArgs>;
  fn.mockImplementation = () => fn;
  fn.mockResolvedValue = () => fn;
  fn.mockRejectedValue = () => fn;
  fn.mockReset = () => fn;
  fn.mockClear = () => fn;
  fn.mockReturnValue = () => fn;
  return fn;
}

/**
 * Create a mock that resolves to a value
 */
export function createAsyncMock<T>(value: T): MockFn<Promise<T>> {
  if (typeof jest !== 'undefined') {
    return jest.fn<Promise<T>>().mockResolvedValue(value as Awaited<T>);
  }
  const fn = (() => Promise.resolve(value)) as MockFn<Promise<T>>;
  fn.mockImplementation = () => fn;
  fn.mockResolvedValue = () => fn;
  fn.mockRejectedValue = () => fn;
  fn.mockReset = () => fn;
  fn.mockClear = () => fn;
  fn.mockReturnValue = () => fn;
  return fn;
}

/**
 * Create a mock that rejects with an error
 */
export function createRejectMock(error: Error | string): MockFn<Promise<never>> {
  const errorObj = typeof error === 'string' ? new Error(error) : error;
  if (typeof jest !== 'undefined') {
    return jest.fn<Promise<never>>().mockRejectedValue(errorObj);
  }
  const fn = (() => Promise.reject(errorObj)) as MockFn<Promise<never>>;
  fn.mockImplementation = () => fn;
  fn.mockResolvedValue = () => fn;
  fn.mockRejectedValue = () => fn;
  fn.mockReset = () => fn;
  fn.mockClear = () => fn;
  fn.mockReturnValue = () => fn;
  return fn;
}

// ============================================
// Mock Data Generators
// ============================================

/**
 * Generate a mock popup
 */
export function mockPopup(overrides?: Partial<MockPopup>): MockPopup {
  return {
    id: `popup_${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test Popup',
    brand: 'Test Brand',
    description: 'Test description',
    imageUrl: '/test-image.jpg',
    category: 'fashion',
    currentParticipants: 50,
    targetParticipants: 100,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'funding',
    location: {
      address: '서울시 강남구 테스트로 123',
      lat: 37.5665,
      lng: 126.978,
    },
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

interface MockPopup {
  id: string;
  name: string;
  brand: string;
  description: string;
  imageUrl: string;
  category: string;
  currentParticipants: number;
  targetParticipants: number;
  deadline: string;
  status: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  createdAt: string;
}

/**
 * Generate a mock user
 */
export function mockUser(overrides?: Partial<MockUser>): MockUser {
  return {
    id: `user_${Math.random().toString(36).substr(2, 9)}`,
    email: 'test@example.com',
    name: '테스트 유저',
    nickname: 'tester',
    avatarUrl: null,
    role: 'user',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

interface MockUser {
  id: string;
  email: string;
  name: string;
  nickname: string;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
}

/**
 * Generate a mock notification
 */
export function mockNotification(overrides?: Partial<MockNotification>): MockNotification {
  return {
    id: `notif_${Math.random().toString(36).substr(2, 9)}`,
    type: 'participation',
    priority: 'normal',
    title: 'Test Notification',
    message: 'This is a test notification',
    read: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

interface MockNotification {
  id: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

/**
 * Generate multiple items
 */
export function mockList<T>(generator: (index: number) => T, count: number): T[] {
  return Array.from({ length: count }, (_, i) => generator(i));
}

// ============================================
// Wait Utilities
// ============================================

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  options?: { timeout?: number; interval?: number }
): Promise<void> {
  const { timeout = 5000, interval = 50 } = options || {};
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) return;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error('waitFor timed out');
}

/**
 * Wait for a specific amount of time
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// LocalStorage Mock
// ============================================

interface LocalStorageMock {
  getItem: MockFn<string | null, [string]>;
  setItem: MockFn<void, [string, string]>;
  removeItem: MockFn<void, [string]>;
  clear: MockFn<void, []>;
  store: Record<string, string>;
}

/**
 * Mock localStorage for testing
 */
export function mockLocalStorage(): LocalStorageMock {
  const store: Record<string, string> = {};

  const mock: LocalStorageMock = {
    getItem: createMock((key: string) => store[key] || null),
    setItem: createMock((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: createMock((key: string) => {
      delete store[key];
    }),
    clear: createMock(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
    store,
  };

  Object.defineProperty(window, 'localStorage', { value: mock });

  return mock;
}

// ============================================
// Fetch Mock
// ============================================

interface MockFetchResponse {
  data: unknown;
  ok?: boolean;
  status?: number;
  headers?: Record<string, string>;
}

/**
 * Mock fetch for testing
 */
export function mockFetch(responses: MockFetchResponse[]): MockFn<Promise<Response>> {
  let callIndex = 0;

  const fetchFn = () => {
    const response = responses[callIndex] || responses[responses.length - 1];
    callIndex++;

    return Promise.resolve({
      ok: response.ok ?? true,
      status: response.status ?? 200,
      json: () => Promise.resolve(response.data),
      text: () => Promise.resolve(JSON.stringify(response.data)),
      headers: new Headers(response.headers || {}),
    } as Response);
  };

  const mock = createMock<Promise<Response>>(fetchFn);
  (global as unknown as { fetch: typeof mock }).fetch = mock;
  return mock;
}

/**
 * Reset fetch mock
 */
export function resetFetchMock(): void {
  const globalFetch = (global as unknown as { fetch: MockFn }).fetch;
  globalFetch?.mockReset?.();
}

// ============================================
// Event Helpers
// ============================================

/**
 * Create a mock change event
 */
export function createChangeEvent(
  name: string,
  value: string
): React.ChangeEvent<HTMLInputElement> {
  return {
    target: { name, value, type: 'text' },
    currentTarget: { name, value, type: 'text' },
  } as React.ChangeEvent<HTMLInputElement>;
}

/**
 * Create a mock form event
 */
export function createFormEvent(): React.FormEvent {
  return {
    preventDefault: createMock(),
    stopPropagation: createMock(),
  } as unknown as React.FormEvent;
}

// ============================================
// Re-exports
// ============================================

export * from '@testing-library/react';
export { customRender as render };
