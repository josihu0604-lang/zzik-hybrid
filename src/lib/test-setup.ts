/**
 * Test Setup
 *
 * Global setup for Jest tests
 * Note: This file should only be imported in Jest test environment
 */

/// <reference types="@testing-library/jest-dom" />

// ============================================
// Type Definitions for Test Environment
// ============================================

type MockFn = {
  (...args: unknown[]): unknown;
  mockImplementation: (fn: (...args: unknown[]) => unknown) => MockFn;
  mockResolvedValue: (value: unknown) => MockFn;
  mockReset: () => MockFn;
  mockClear: () => MockFn;
};

declare const jest: {
  fn: (implementation?: (...args: unknown[]) => unknown) => MockFn;
  clearAllMocks: () => void;
};

declare function beforeAll(fn: () => void): void;
declare function afterAll(fn: () => void): void;
declare function afterEach(fn: () => void): void;

// ============================================
// Global Mocks
// ============================================

// Mock IntersectionObserver
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}

  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
}

// Mock ResizeObserver
class MockResizeObserver {
  constructor(_callback: ResizeObserverCallback) {}
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: MockResizeObserver,
  });
}

// Mock matchMedia
if (typeof window !== 'undefined' && typeof jest !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((...args: unknown[]) => ({
      matches: false,
      media: args[0] as string,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock scrollTo
  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: jest.fn(),
  });

  // Mock Notification
  Object.defineProperty(window, 'Notification', {
    writable: true,
    value: {
      permission: 'default',
      requestPermission: jest.fn().mockResolvedValue('granted'),
    },
  });

  // Mock fetch
  (global as unknown as { fetch: MockFn }).fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    headers: new Headers(),
  });
}

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });
}

// Mock navigator
if (typeof navigator !== 'undefined') {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: true,
  });
}

// ============================================
// Console Silencing
// ============================================

// Silence specific console errors during tests
const originalError = console.error;
const originalWarn = console.warn;

if (typeof beforeAll !== 'undefined') {
  beforeAll(() => {
    console.error = (...args: unknown[]) => {
      const message = args[0]?.toString() || '';
      if (
        message.includes('act(...)') ||
        message.includes('Warning: ReactDOM.render') ||
        message.includes('Warning: useLayoutEffect')
      ) {
        return;
      }
      originalError.apply(console, args);
    };

    console.warn = (...args: unknown[]) => {
      const message = args[0]?.toString() || '';
      if (message.includes('componentWillReceiveProps')) {
        return;
      }
      originalWarn.apply(console, args);
    };
  });
}

if (typeof afterAll !== 'undefined') {
  afterAll(() => {
    console.error = originalError;
    console.warn = originalWarn;
  });
}

// ============================================
// Cleanup
// ============================================

if (typeof afterEach !== 'undefined' && typeof jest !== 'undefined') {
  afterEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Clear localStorage
    localStorageMock.clear();

    // Reset fetch mock
    const globalFetch = (global as unknown as { fetch: MockFn }).fetch;
    if (globalFetch?.mockReset) {
      globalFetch.mockReset().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
        headers: new Headers(),
      });
    }
  });
}

export {};
