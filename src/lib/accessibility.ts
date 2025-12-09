/**
 * WCAG AAA Accessibility Utilities
 *
 * Enhanced accessibility features for WCAG 2.1 AAA compliance:
 * - Color contrast verification (7:1 for text, 4.5:1 for UI)
 * - Focus management utilities
 * - Screen reader announcements
 * - Motion preferences
 * - Keyboard navigation helpers
 */

// ============================================================================
// COLOR CONTRAST UTILITIES (WCAG AAA: 7:1)
// ============================================================================

/**
 * Calculate relative luminance of a color
 * WCAG 2.0 formula: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * WCAG AAA requires 7:1 for normal text, 4.5:1 for large text
 */
export function getContrastRatio(
  rgb1: [number, number, number],
  rgb2: [number, number, number]
): number {
  const l1 = getLuminance(...rgb1);
  const l2 = getLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG AAA standards
 */
export function meetsWCAGAAA(
  contrastRatio: number,
  textSize: 'normal' | 'large' = 'normal'
): boolean {
  // WCAG AAA: 7:1 for normal text, 4.5:1 for large text (18px+ or 14px bold)
  const threshold = textSize === 'large' ? 4.5 : 7;
  return contrastRatio >= threshold;
}

/**
 * Parse hex color to RGB
 */
export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error(`Invalid hex color: ${hex}`);
  return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
}

// ============================================================================
// FOCUS MANAGEMENT
// ============================================================================

/**
 * Trap focus within an element (for modals, dialogs)
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusableSelectors = [
    'button:not([disabled])',
    'a[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  const focusableElements = element.querySelectorAll<HTMLElement>(focusableSelectors);
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey && document.activeElement === firstFocusable) {
      e.preventDefault();
      lastFocusable?.focus();
    } else if (!e.shiftKey && document.activeElement === lastFocusable) {
      e.preventDefault();
      firstFocusable?.focus();
    }
  };

  element.addEventListener('keydown', handleKeyDown);
  firstFocusable?.focus();

  return () => element.removeEventListener('keydown', handleKeyDown);
}

/**
 * Restore focus to an element after modal closes
 */
export function createFocusRestorer(): {
  save: () => void;
  restore: () => void;
} {
  let savedElement: HTMLElement | null = null;

  return {
    save: () => {
      savedElement = document.activeElement as HTMLElement;
    },
    restore: () => {
      savedElement?.focus();
      savedElement = null;
    },
  };
}

// ============================================================================
// SCREEN READER ANNOUNCEMENTS
// ============================================================================

let announceRegion: HTMLElement | null = null;

/**
 * Initialize live region for screen reader announcements
 */
function ensureAnnounceRegion(): HTMLElement {
  if (announceRegion) return announceRegion;

  announceRegion = document.createElement('div');
  announceRegion.id = 'a11y-announce-region';
  announceRegion.setAttribute('role', 'status');
  announceRegion.setAttribute('aria-live', 'polite');
  announceRegion.setAttribute('aria-atomic', 'true');
  announceRegion.className = 'sr-only';
  document.body.appendChild(announceRegion);

  return announceRegion;
}

/**
 * Announce message to screen readers
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  if (typeof document === 'undefined') return;

  const region = ensureAnnounceRegion();
  region.setAttribute('aria-live', priority);

  // Clear and set with delay for reliable announcement
  region.textContent = '';
  setTimeout(() => {
    region.textContent = message;
  }, 100);
}

// ============================================================================
// KEYBOARD NAVIGATION
// ============================================================================

/**
 * Handle arrow key navigation in a list
 */
export function handleArrowNavigation(
  e: KeyboardEvent,
  items: HTMLElement[],
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both';
    loop?: boolean;
  } = {}
): void {
  const { orientation = 'vertical', loop = true } = options;
  const currentIndex = items.findIndex((item) => item === document.activeElement);

  if (currentIndex === -1) return;

  let nextIndex = currentIndex;
  const isVertical = orientation === 'vertical' || orientation === 'both';
  const isHorizontal = orientation === 'horizontal' || orientation === 'both';

  switch (e.key) {
    case 'ArrowUp':
      if (isVertical) {
        e.preventDefault();
        nextIndex = loop
          ? (currentIndex - 1 + items.length) % items.length
          : Math.max(0, currentIndex - 1);
      }
      break;
    case 'ArrowDown':
      if (isVertical) {
        e.preventDefault();
        nextIndex = loop
          ? (currentIndex + 1) % items.length
          : Math.min(items.length - 1, currentIndex + 1);
      }
      break;
    case 'ArrowLeft':
      if (isHorizontal) {
        e.preventDefault();
        nextIndex = loop
          ? (currentIndex - 1 + items.length) % items.length
          : Math.max(0, currentIndex - 1);
      }
      break;
    case 'ArrowRight':
      if (isHorizontal) {
        e.preventDefault();
        nextIndex = loop
          ? (currentIndex + 1) % items.length
          : Math.min(items.length - 1, currentIndex + 1);
      }
      break;
    case 'Home':
      e.preventDefault();
      nextIndex = 0;
      break;
    case 'End':
      e.preventDefault();
      nextIndex = items.length - 1;
      break;
  }

  if (nextIndex !== currentIndex) {
    items[nextIndex]?.focus();
  }
}

// ============================================================================
// MOTION PREFERENCES
// ============================================================================

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Subscribe to motion preference changes
 */
export function onMotionPreferenceChange(callback: (reduced: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handler = (e: MediaQueryListEvent) => callback(e.matches);

  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}

// ============================================================================
// SKIP LINK UTILITIES
// ============================================================================

/**
 * Create skip link configuration for common landmarks
 */
export const skipLinkTargets = {
  main: '#main-content',
  navigation: '#main-navigation',
  search: '#search-input',
  footer: '#footer',
} as const;

/**
 * Scroll element into view and focus
 */
export function skipTo(targetId: string): void {
  const target = document.querySelector<HTMLElement>(targetId);
  if (!target) return;

  // Ensure element is focusable
  if (!target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1');
  }

  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  target.focus({ preventScroll: true });
}

// ============================================================================
// FORM ACCESSIBILITY
// ============================================================================

/**
 * Generate unique ID for form field association
 */
export function generateFieldId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Connect form field with error message
 */
export function connectFieldError(
  fieldId: string,
  errorId: string,
  hasError: boolean
): { 'aria-invalid': boolean; 'aria-describedby': string | undefined } {
  return {
    'aria-invalid': hasError,
    'aria-describedby': hasError ? errorId : undefined,
  };
}

// ============================================================================
// PREBUILT ACCESSIBLE PATTERNS
// ============================================================================

/**
 * ARIA attributes for loading state
 */
export function getLoadingAria(isLoading: boolean): Record<string, string | boolean> {
  return {
    'aria-busy': isLoading,
    'aria-live': 'polite',
  };
}

/**
 * ARIA attributes for expandable content
 */
export function getExpandableAria(
  isExpanded: boolean,
  controlsId: string
): Record<string, string | boolean> {
  return {
    'aria-expanded': isExpanded,
    'aria-controls': controlsId,
  };
}

/**
 * ARIA attributes for toggle/switch
 */
export function getToggleAria(isPressed: boolean): Record<string, string | boolean> {
  return {
    role: 'switch',
    'aria-checked': isPressed,
  };
}
