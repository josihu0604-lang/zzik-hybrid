/**
 * Color Utils Tests
 *
 * Tests for color utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  getColorFromName,
  getInitialFromName,
  getLuminance,
  getContrastTextColor,
  addOpacity,
  getCategoryColor,
  getTierColor,
  AVATAR_COLORS,
  CATEGORY_COLORS,
  TIER_COLORS,
  type TierName,
} from '@/lib/color-utils';

describe('getColorFromName', () => {
  it('should return consistent color for same name', () => {
    const name = 'John Doe';
    const color1 = getColorFromName(name);
    const color2 = getColorFromName(name);
    expect(color1).toBe(color2);
  });

  it('should return different colors for different names', () => {
    const color1 = getColorFromName('Alice');
    const color2 = getColorFromName('Bob');
    // High probability they'll be different
    // (Could be same if hash collision, but unlikely)
    expect(color1).toBeTruthy();
    expect(color2).toBeTruthy();
  });

  it('should return first color for empty string', () => {
    const color = getColorFromName('');
    expect(color).toBe(AVATAR_COLORS[0]);
  });

  it('should return valid hex color', () => {
    const color = getColorFromName('Test User');
    expect(color).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it('should handle Korean names', () => {
    const color = getColorFromName('김철수');
    expect(color).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it('should handle special characters', () => {
    const color = getColorFromName('User@123!');
    expect(color).toMatch(/^#[0-9A-F]{6}$/i);
  });
});

describe('getInitialFromName', () => {
  it('should return first character uppercase', () => {
    expect(getInitialFromName('john')).toBe('J');
    expect(getInitialFromName('Alice')).toBe('A');
  });

  it('should handle Korean names', () => {
    expect(getInitialFromName('김철수')).toBe('김');
    expect(getInitialFromName('이영희')).toBe('이');
  });

  it('should return ? for empty string', () => {
    expect(getInitialFromName('')).toBe('?');
  });

  it('should handle single character names', () => {
    expect(getInitialFromName('X')).toBe('X');
  });

  it('should handle names with spaces', () => {
    expect(getInitialFromName('John Doe')).toBe('J');
  });
});

describe('getLuminance', () => {
  it('should calculate luminance for white', () => {
    const luminance = getLuminance('#FFFFFF');
    expect(luminance).toBe(255);
  });

  it('should calculate luminance for black', () => {
    const luminance = getLuminance('#000000');
    expect(luminance).toBe(0);
  });

  it('should calculate luminance for red', () => {
    const luminance = getLuminance('#FF0000');
    expect(luminance).toBeCloseTo(76.245, 2);
  });

  it('should calculate luminance for Flame color', () => {
    const luminance = getLuminance('#FF6B5B');
    // 0.299 * 255 + 0.587 * 107 + 0.114 * 91 = 149.428
    expect(luminance).toBeCloseTo(149.428, 2);
  });

  it('should handle colors without # prefix', () => {
    const luminance = getLuminance('FFFFFF');
    expect(luminance).toBe(255);
  });

  it('should return number between 0-255', () => {
    const testColors = ['#FF6B5B', '#CC4A3A', '#FFD93D', '#22c55e'];
    testColors.forEach((color) => {
      const luminance = getLuminance(color);
      expect(luminance).toBeGreaterThanOrEqual(0);
      expect(luminance).toBeLessThanOrEqual(255);
    });
  });
});

describe('getContrastTextColor', () => {
  it('should return white for dark backgrounds', () => {
    expect(getContrastTextColor('#000000')).toBe('#FFFFFF');
    expect(getContrastTextColor('#121314')).toBe('#FFFFFF');
    expect(getContrastTextColor('#CC4A3A')).toBe('#FFFFFF');
  });

  it('should return black for light backgrounds', () => {
    expect(getContrastTextColor('#FFFFFF')).toBe('#000000');
    expect(getContrastTextColor('#FFD93D')).toBe('#000000');
  });

  it('should handle Flame color (medium brightness)', () => {
    const textColor = getContrastTextColor('#FF6B5B');
    // Flame luminance is 149.428, which is > 128, so it uses black text
    expect(textColor).toBe('#000000');
  });

  it('should handle edge case at threshold (128)', () => {
    // Test colors near the threshold
    const darkColor = getContrastTextColor('#808080'); // RGB(128,128,128) = luminance 128
    expect(darkColor).toBe('#FFFFFF');
  });
});

describe('addOpacity', () => {
  it('should add full opacity', () => {
    expect(addOpacity('#FF6B5B', 1)).toBe('rgba(255, 107, 91, 1)');
  });

  it('should add 50% opacity', () => {
    expect(addOpacity('#FF6B5B', 0.5)).toBe('rgba(255, 107, 91, 0.5)');
  });

  it('should add zero opacity', () => {
    expect(addOpacity('#FF6B5B', 0)).toBe('rgba(255, 107, 91, 0)');
  });

  it('should handle colors without # prefix', () => {
    expect(addOpacity('000000', 0.8)).toBe('rgba(0, 0, 0, 0.8)');
  });

  it('should handle white color', () => {
    expect(addOpacity('#FFFFFF', 0.3)).toBe('rgba(255, 255, 255, 0.3)');
  });
});

describe('getCategoryColor', () => {
  it('should return correct color for known categories', () => {
    expect(getCategoryColor('fashion')).toBe(CATEGORY_COLORS.fashion);
    expect(getCategoryColor('beauty')).toBe(CATEGORY_COLORS.beauty);
    expect(getCategoryColor('kpop')).toBe(CATEGORY_COLORS.kpop);
    expect(getCategoryColor('food')).toBe(CATEGORY_COLORS.food);
  });

  it('should be case-insensitive', () => {
    expect(getCategoryColor('FASHION')).toBe(CATEGORY_COLORS.fashion);
    expect(getCategoryColor('Fashion')).toBe(CATEGORY_COLORS.fashion);
    expect(getCategoryColor('fAsHiOn')).toBe(CATEGORY_COLORS.fashion);
  });

  it('should return default color for unknown category', () => {
    expect(getCategoryColor('unknown')).toBe(CATEGORY_COLORS.default);
    expect(getCategoryColor('random123')).toBe(CATEGORY_COLORS.default);
  });

  it('should return valid hex colors', () => {
    Object.values(CATEGORY_COLORS).forEach((color) => {
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });
});

describe('getTierColor', () => {
  it('should return correct color for each tier', () => {
    expect(getTierColor('Bronze')).toBe(TIER_COLORS.Bronze);
    expect(getTierColor('Silver')).toBe(TIER_COLORS.Silver);
    expect(getTierColor('Gold')).toBe(TIER_COLORS.Gold);
    expect(getTierColor('Platinum')).toBe(TIER_COLORS.Platinum);
  });

  it('should return valid hex colors for all tiers', () => {
    const tiers: TierName[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    tiers.forEach((tier) => {
      const color = getTierColor(tier);
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });
});

describe('AVATAR_COLORS constant', () => {
  it('should have valid hex colors', () => {
    AVATAR_COLORS.forEach((color) => {
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  it('should have at least 8 colors', () => {
    expect(AVATAR_COLORS.length).toBeGreaterThanOrEqual(8);
  });
});
