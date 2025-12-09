/**
 * Popup Components Module
 *
 * Refactored for better maintainability:
 * - PopupCard split into header, stats, and CTA subcomponents
 * - Memoization for performance optimization
 * - Clean barrel exports
 */

// Main Components
export { PopupCard } from './PopupCard';
export type { PopupData } from './PopupCard';
export { ProgressBar } from './ProgressBar';
export { LiveStats } from './LiveStats';
export { CategoryFilter, CATEGORY_LIST } from './CategoryFilter';
export type { Category, CategoryFilterProps } from './CategoryFilter';
export { ParticipateButton } from './ParticipateButton';
export { CelebrationModal } from './CelebrationModal';
export { CountdownTimer, UrgentBadge } from './CountdownTimer';

// Subcomponents (for advanced use cases)
export { PopupCardHeader } from './PopupCardHeader';
export { PopupCardStats } from './PopupCardStats';
export { PopupCardCTA } from './PopupCardCTA';

// Popup Detail Page Components
export { PopupHero, useParallax } from './PopupHero';
export {
  PopupMainCard,
  PopupBenefits,
  PopupDescription,
  PopupLocation,
  PopupStats,
} from './PopupContent';
export { PopupCTASection, PopupFundingCTA, PopupConfirmedCTA } from './PopupCTA';

// Skeleton Components (re-exported from unified ui/Skeleton)
export {
  PopupCardSkeletonAlt,
  ProgressBarSkeleton,
  LiveStatsSkeleton,
  PageSkeleton,
  TextSkeleton,
} from '@/components/ui/Skeleton';
