/**
 * useTemperatureStyles Hook
 *
 * Generates temperature-based styles for progress indicators.
 * Implements ZZIK's "온도계" (thermometer) concept - Cold→Warm→Hot→Done.
 */

import { useMemo } from 'react';
import { colors } from '@/lib/design-tokens';

export type Temperature = 'cold' | 'warm' | 'hot' | 'done';

interface TemperatureStyles {
  /** CSS gradient for the progress bar fill */
  gradient: string;
  /** Glow/shadow effect for heat intensity */
  glow: string;
  /** Text color for labels */
  textColor: string;
  /** Background color for container */
  backgroundColor: string;
  /** Border color */
  borderColor: string;
  /** Whether to show heat pulse animation */
  showPulse: boolean;
  /** Temperature value (0-100 scale) */
  temperatureValue: number;
  /** Current temperature zone */
  zone: Temperature;
}

interface UseTemperatureStylesOptions {
  /** Current progress (0-1) */
  progress: number;
  /** Override the calculated temperature zone */
  forceZone?: Temperature;
  /** Enable/disable glow effects */
  enableGlow?: boolean;
  /** Scale factor for glow intensity */
  glowIntensity?: number;
}

/**
 * Get temperature zone from progress value
 */
export function getTemperatureZone(progress: number): Temperature {
  if (progress >= 1) return 'done';
  if (progress >= 0.7) return 'hot';
  if (progress >= 0.3) return 'warm';
  return 'cold';
}

/**
 * Generate temperature gradient based on progress
 */
function generateTemperatureGradient(progress: number): string {
  if (progress >= 1) {
    return `linear-gradient(90deg, ${colors.success} 0%, #34d399 100%)`;
  }
  if (progress >= 0.7) {
    return `linear-gradient(90deg, ${colors.flame[500]} 0%, ${colors.flame[400]} 100%)`;
  }
  if (progress >= 0.3) {
    return `linear-gradient(90deg, ${colors.flame[500]}99 0%, ${colors.flame[400]}99 100%)`;
  }
  return `linear-gradient(90deg, ${colors.flame[500]}66 0%, ${colors.flame[400]}66 100%)`;
}

/**
 * Custom hook for temperature-based styling
 */
export function useTemperatureStyles(options: UseTemperatureStylesOptions): TemperatureStyles {
  const { progress, forceZone, enableGlow = true, glowIntensity = 1 } = options;

  return useMemo(() => {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const zone = forceZone ?? getTemperatureZone(clampedProgress);
    const temperatureValue = Math.round(clampedProgress * 100);

    // Get base gradient
    const gradient = generateTemperatureGradient(clampedProgress);

    // Calculate zone-specific styles
    const styles = getZoneStyles(zone, clampedProgress, glowIntensity, enableGlow);

    return {
      gradient,
      ...styles,
      temperatureValue,
      zone,
    };
  }, [progress, forceZone, enableGlow, glowIntensity]);
}

/**
 * Get styles for a specific temperature zone
 */
function getZoneStyles(
  zone: Temperature,
  progress: number,
  glowIntensity: number,
  enableGlow: boolean
): Omit<TemperatureStyles, 'gradient' | 'temperatureValue' | 'zone'> {
  switch (zone) {
    case 'cold':
      return {
        glow: enableGlow ? `0 0 ${8 * glowIntensity}px ${colors.flame[500]}30` : 'none',
        textColor: colors.text.secondary,
        backgroundColor: colors.space[850],
        borderColor: colors.border.default,
        showPulse: false,
      };

    case 'warm':
      return {
        glow: enableGlow ? `0 0 ${12 * glowIntensity}px ${colors.flame[500]}50` : 'none',
        textColor: colors.flame[400],
        backgroundColor: colors.space[800],
        borderColor: `${colors.flame[500]}40`,
        showPulse: false,
      };

    case 'hot':
      return {
        glow: enableGlow
          ? `0 0 ${20 * glowIntensity}px ${colors.flame[500]}70, 0 0 ${40 * glowIntensity}px ${colors.ember[500]}40`
          : 'none',
        textColor: colors.flame[400],
        backgroundColor: colors.space[800],
        borderColor: colors.flame[500],
        showPulse: progress >= 0.9, // Pulse when close to goal
      };

    case 'done':
      return {
        glow: enableGlow ? `0 0 ${24 * glowIntensity}px ${colors.success}50` : 'none',
        textColor: colors.success,
        backgroundColor: colors.space[800],
        borderColor: colors.success,
        showPulse: false,
      };
  }
}

/**
 * Get Framer Motion animation props for temperature transitions
 */
export function getTemperatureAnimationProps(zone: Temperature) {
  const baseProps = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 },
  };

  switch (zone) {
    case 'hot':
      return {
        ...baseProps,
        animate: {
          ...baseProps.animate,
          boxShadow: [
            `0 0 20px ${colors.flame[500]}60`,
            `0 0 30px ${colors.flame[500]}80`,
            `0 0 20px ${colors.flame[500]}60`,
          ],
        },
        transition: {
          ...baseProps.transition,
          boxShadow: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        },
      };

    case 'done':
      return {
        ...baseProps,
        animate: {
          ...baseProps.animate,
          scale: [1, 1.02, 1],
        },
        transition: {
          ...baseProps.transition,
          scale: {
            duration: 0.6,
            times: [0, 0.5, 1],
          },
        },
      };

    default:
      return baseProps;
  }
}

/**
 * CSS class helper for temperature zones
 */
export function getTemperatureClass(zone: Temperature): string {
  const baseClass = 'temperature-indicator';
  return `${baseClass} ${baseClass}--${zone}`;
}

/**
 * Generate CSS variables for temperature styling
 */
export function getTemperatureCSSVars(progress: number): Record<string, string> {
  const zone = getTemperatureZone(progress);
  const styles = getZoneStyles(zone, progress, 1, true);

  return {
    '--temperature-progress': `${progress * 100}%`,
    '--temperature-glow': styles.glow,
    '--temperature-text': styles.textColor,
    '--temperature-bg': styles.backgroundColor,
    '--temperature-border': styles.borderColor,
  };
}

export default useTemperatureStyles;
