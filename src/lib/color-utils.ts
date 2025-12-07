/**
 * Color Utility Functions
 *
 * 공통 색상 유틸리티 (중복 제거)
 */

import { colors } from '@/lib/design-tokens';

/**
 * 이름 기반 색상 해싱
 *
 * 일관된 색상을 생성하기 위해 이름을 해싱
 * 동일한 이름은 항상 동일한 색상 반환
 */

// 브랜드 색상 팔레트
export const AVATAR_COLORS = [
  colors.flame[500], // '#FF6B5B' - Flame Coral
  colors.ember[500], // '#CC4A3A' - Deep Ember
  colors.spark[500], // '#FFD93D' - Electric Yellow
  colors.success, // '#22c55e' - Green
  '#6B8EFF', // Blue
  colors.info, // '#A855F7' - Purple
  '#FF4D8F', // Pink
  '#14b8a6', // Teal
] as const;

/**
 * 이름에서 색상 가져오기
 *
 * @param name - 사용자 이름 또는 식별자
 * @returns 해싱된 색상
 */
export function getColorFromName(name: string): string {
  if (!name) return AVATAR_COLORS[0];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 32비트 정수로 변환
  }

  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/**
 * 이름에서 이니셜 가져오기
 *
 * @param name - 사용자 이름
 * @returns 첫 글자 (한글/영문)
 */
export function getInitialFromName(name: string): string {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
}

/**
 * 색상 밝기 계산
 *
 * @param color - HEX 색상
 * @returns 0-255 사이의 밝기 값
 */
export function getLuminance(color: string): number {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // 표준 휘도 공식
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * 색상에 따른 텍스트 색상 결정
 *
 * @param backgroundColor - 배경색
 * @returns 텍스트 색상 (흰색 또는 검정)
 */
export function getContrastTextColor(backgroundColor: string): string {
  return getLuminance(backgroundColor) > 128 ? '#000000' : '#FFFFFF';
}

/**
 * 색상에 투명도 추가
 *
 * @param color - HEX 색상
 * @param opacity - 0-1 사이 투명도
 * @returns RGBA 색상
 */
export function addOpacity(color: string, opacity: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * 카테고리별 색상 매핑
 */
export const CATEGORY_COLORS: Record<string, string> = {
  fashion: colors.flame[500],
  beauty: '#FF4D8F',
  kpop: colors.spark[500],
  food: '#14b8a6',
  cafe: '#8B5CF6',
  lifestyle: '#6B8EFF',
  culture: colors.ember[500],
  tech: '#22c55e',
  default: colors.flame[500],
} as const;

/**
 * 카테고리에서 색상 가져오기
 */
export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category.toLowerCase()] || CATEGORY_COLORS.default;
}

/**
 * 티어별 색상
 */
export const TIER_COLORS = {
  Bronze: '#CD7F32',
  Silver: '#C0C0C0',
  Gold: '#FFD700',
  Platinum: '#E5E4E2',
} as const;

export type TierName = keyof typeof TIER_COLORS;

/**
 * 티어에서 색상 가져오기
 */
export function getTierColor(tier: TierName): string {
  return TIER_COLORS[tier];
}
