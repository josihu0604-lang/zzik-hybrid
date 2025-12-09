/**
 * useTemperatureStyles Hook Tests
 *
 * Tests for ZZIK's temperature-based styling system:
 * - Temperature zone calculation
 * - Gradient generation
 * - Style generation per zone
 * - CSS helper functions
 */

import { describe, it, expect } from 'vitest';
import {
  getTemperatureZone,
  getTemperatureAnimationProps,
  getTemperatureClass,
  getTemperatureCSSVars,
} from '@/hooks/useTemperatureStyles';

// ============================================================================
// TEMPERATURE ZONE CALCULATION
// ============================================================================

describe('Temperature Zone Calculation', () => {
  it('should return cold for progress 0-29%', () => {
    expect(getTemperatureZone(0)).toBe('cold');
    expect(getTemperatureZone(0.1)).toBe('cold');
    expect(getTemperatureZone(0.29)).toBe('cold');
  });

  it('should return warm for progress 30-69%', () => {
    expect(getTemperatureZone(0.3)).toBe('warm');
    expect(getTemperatureZone(0.5)).toBe('warm');
    expect(getTemperatureZone(0.69)).toBe('warm');
  });

  it('should return hot for progress 70-99%', () => {
    expect(getTemperatureZone(0.7)).toBe('hot');
    expect(getTemperatureZone(0.85)).toBe('hot');
    expect(getTemperatureZone(0.99)).toBe('hot');
  });

  it('should return done for progress 100%', () => {
    expect(getTemperatureZone(1)).toBe('done');
    expect(getTemperatureZone(1.1)).toBe('done'); // over 100% still done
  });

  it('should handle edge cases', () => {
    expect(getTemperatureZone(-0.1)).toBe('cold'); // negative
    expect(getTemperatureZone(0.299)).toBe('cold'); // just under warm
    expect(getTemperatureZone(0.699)).toBe('warm'); // just under hot
    expect(getTemperatureZone(0.999)).toBe('hot'); // just under done
  });
});

// ============================================================================
// ANIMATION PROPS
// ============================================================================

describe('Temperature Animation Props', () => {
  it('should return base animation props for cold', () => {
    const props = getTemperatureAnimationProps('cold');

    expect(props.initial).toEqual({ opacity: 0, scale: 0.95 });
    expect(props.animate).toEqual({ opacity: 1, scale: 1 });
    expect(props.transition.duration).toBe(0.3);
  });

  it('should return base animation props for warm', () => {
    const props = getTemperatureAnimationProps('warm');

    expect(props.initial).toEqual({ opacity: 0, scale: 0.95 });
    expect(props.animate).toEqual({ opacity: 1, scale: 1 });
  });

  it('should include box shadow animation for hot', () => {
    const props = getTemperatureAnimationProps('hot');
    const animate = props.animate as { boxShadow?: string[] };
    const transition = props.transition as { boxShadow?: { repeat: number } };

    expect(animate.boxShadow).toBeDefined();
    expect(Array.isArray(animate.boxShadow)).toBe(true);
    expect(transition.boxShadow).toBeDefined();
    expect(transition.boxShadow?.repeat).toBe(Infinity);
  });

  it('should include scale animation for done', () => {
    const props = getTemperatureAnimationProps('done');

    expect(props.animate.scale).toBeDefined();
    expect(Array.isArray(props.animate.scale)).toBe(true);
  });
});

// ============================================================================
// CSS CLASS HELPER
// ============================================================================

describe('Temperature CSS Class', () => {
  it('should generate correct class for each zone', () => {
    expect(getTemperatureClass('cold')).toBe('temperature-indicator temperature-indicator--cold');
    expect(getTemperatureClass('warm')).toBe('temperature-indicator temperature-indicator--warm');
    expect(getTemperatureClass('hot')).toBe('temperature-indicator temperature-indicator--hot');
    expect(getTemperatureClass('done')).toBe('temperature-indicator temperature-indicator--done');
  });
});

// ============================================================================
// CSS VARIABLES
// ============================================================================

describe('Temperature CSS Variables', () => {
  it('should generate all required CSS variables', () => {
    const vars = getTemperatureCSSVars(0.5);

    expect(vars['--temperature-progress']).toBe('50%');
    expect(vars['--temperature-glow']).toBeDefined();
    expect(vars['--temperature-text']).toBeDefined();
    expect(vars['--temperature-bg']).toBeDefined();
    expect(vars['--temperature-border']).toBeDefined();
  });

  it('should generate correct progress percentage', () => {
    expect(getTemperatureCSSVars(0)['--temperature-progress']).toBe('0%');
    expect(getTemperatureCSSVars(0.25)['--temperature-progress']).toBe('25%');
    expect(getTemperatureCSSVars(0.75)['--temperature-progress']).toBe('75%');
    expect(getTemperatureCSSVars(1)['--temperature-progress']).toBe('100%');
  });

  it('should have different styles for each zone', () => {
    const coldVars = getTemperatureCSSVars(0.2);
    const warmVars = getTemperatureCSSVars(0.5);
    const hotVars = getTemperatureCSSVars(0.8);
    const doneVars = getTemperatureCSSVars(1);

    // Each zone should have distinct glow
    expect(coldVars['--temperature-glow']).not.toBe(hotVars['--temperature-glow']);
    expect(warmVars['--temperature-glow']).not.toBe(doneVars['--temperature-glow']);
  });
});
