/**
 * Vitest Setup File
 *
 * Global test configuration and mocks
 */

import '@testing-library/jest-dom';
import { vi, beforeAll, afterAll, afterEach } from 'vitest';

// ============================================================================
// GLOBAL MOCKS
// ============================================================================

console.log('Test setup file loaded!');

// Mock Stripe
vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(function() {
      return {
        checkout: {
          sessions: {
            create: vi.fn().mockResolvedValue({
              id: 'cs_test_123',
              url: 'https://checkout.stripe.com/test',
            }),
          },
        },
        billingPortal: {
          sessions: {
            create: vi.fn().mockResolvedValue({
              url: 'https://billing.stripe.com/test',
            }),
          },
        },
        subscriptions: {
          update: vi.fn().mockResolvedValue({
            id: 'sub_123',
            status: 'active',
          }),
          retrieve: vi.fn().mockResolvedValue({
            id: 'sub_123',
            items: {
              data: [{ id: 'si_123', price: { id: 'price_123', recurring: { interval: 'month' } } }],
            },
          }),
        },
        webhooks: {
          constructEvent: vi.fn().mockReturnValue({
            type: 'checkout.session.completed',
            data: { object: {} },
          }),
        },
      };
    }),
  };
});

// Mock framer-motion
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  const m = {
    div: 'div',
    span: 'span',
    button: 'button',
    a: 'a',
    ul: 'ul',
    li: 'li',
    nav: 'nav',
    section: 'section',
    article: 'article',
    aside: 'aside',
    header: 'header',
    footer: 'footer',
    main: 'main',
    form: 'form',
    input: 'input',
    label: 'label',
    p: 'p',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    img: 'img',
    svg: 'svg',
    path: 'path',
    circle: 'circle',
    rect: 'rect',
    line: 'line',
    polyline: 'polyline',
    polygon: 'polygon',
  };

  return {
    ...actual,
    m: m,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: {
      ...m,
      custom: (component: any) => component,
    },
  };
});

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(callback: IntersectionObserverCallback) {
    // Store callback for potential use
    this.callback = callback;
  }

  private callback: IntersectionObserverCallback;

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
}

global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.ResizeObserver = MockResizeObserver;

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16);
  return 0;
});

global.cancelAnimationFrame = vi.fn();

// Mock navigator.vibrate
Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: vi.fn().mockReturnValue(true),
});

// ============================================================================
// ENVIRONMENT SETUP
// ============================================================================

// Suppress console errors in tests
beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});

// Reset mocks between tests
afterEach(() => {
  vi.clearAllMocks();
});
