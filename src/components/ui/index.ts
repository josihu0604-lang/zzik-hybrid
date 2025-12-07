/**
 * ZZIK UI Components - Central Export
 *
 * Design System 2.0 통합 컴포넌트
 * 모든 UI 컴포넌트를 한 곳에서 import 가능
 *
 * Usage:
 * import { Button, Typography, Icon, Container } from '@/components/ui'
 */

// Layout Components (DES-087~088)
export { Container, Grid, Flex, Stack } from './Container';

// Typography (DES-080)
export {
  Typography,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Body,
  BodyLarge,
  BodySmall,
  Caption,
  Label,
} from './Typography';

// Button Components (DES-082~086)
export { Button, ButtonGroup } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

// Icon Components (DES-090~096)
export {
  IconWrapper,
  IconButton,
  IconWithText,
  // Common Icons
  HeartIcon,
  StarIcon,
  SearchIcon,
  XIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InfoIcon,
  AlertCircleIcon,
  AlertTriangleIcon,
  LoaderIcon,
} from './Icon';
export type { IconSize, IconColor } from './Icon';

// Image Components (DES-097~104)
export { OptimizedImage, IMAGE_SIZES, ASPECT_RATIOS } from './OptimizedImage';
export type { ErrorFallbackType, SkeletonTheme } from './OptimizedImage';

// Loading Components
export {
  LoadingSpinner,
  FullPageLoader,
  LoginLoading,
  LeaderSkeleton,
  InlineSpinner,
} from './LoadingSpinner';

// Skeleton Components
export {
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonMap,
  SkeletonProfile,
  SkeletonListItem,
  SkeletonHeader,
  SkeletonCategoryFilter,
  SkeletonStatsBar,
  SkeletonMainPage,
  SkeletonLivePage,
  SkeletonMapPage,
  SkeletonMePage,
  TextSkeleton,
  ProgressBarSkeleton,
  PopupCardSkeletonAlt,
  LiveStatsSkeleton,
  PageSkeleton,
  NotificationSkeleton,
  SkeletonGrid,
  SkeletonWrapper,
} from './Skeleton';

// Toast/Notification
export { ToastProvider, useToast } from './Toast';

// Re-export types
export type { default as OptimizedImageType } from './OptimizedImage';
