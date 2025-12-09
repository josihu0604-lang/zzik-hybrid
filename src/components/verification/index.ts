/**
 * Verification Components
 * 체크인 인증 관련 컴포넌트 모음
 */

export { GPSStep } from './GPSStep';
export { QRStep } from './QRStep';
export { VerificationModal } from './VerificationModal';
export { VerificationSuccess } from './VerificationSuccess';
export { VerificationBadge, VerificationStamp } from './VerificationBadge';

// Types re-export
export type { GpsVerificationResult, Coordinates } from '@/lib/geo';
export type { VerificationResult, VerificationMethod } from '@/lib/verification';
