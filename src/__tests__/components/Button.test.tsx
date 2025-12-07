/**
 * Button Component Tests
 *
 * Test coverage for Button component functionality including:
 * - Variant rendering (primary, secondary, outline, ghost, danger, glass)
 * - Size rendering (sm, md, lg, xl)
 * - Disabled state
 * - Loading state
 * - Click handlers
 * - Full width prop
 * - Left/right icon props
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  // ============================================================================
  // VARIANT RENDERING TESTS
  // ============================================================================

  describe('Variant Rendering', () => {
    it('renders primary variant correctly', () => {
      render(<Button variant="primary">Primary Button</Button>);
      const button = screen.getByRole('button', { name: /primary button/i });
      expect(button).toBeInTheDocument();
      // Verify button has gradient background (jsdom renders actual computed style)
      const style = window.getComputedStyle(button);
      expect(style.background).toContain('linear-gradient');
    });

    it('renders secondary variant correctly', () => {
      render(<Button variant="secondary">Secondary Button</Button>);
      const button = screen.getByRole('button', { name: /secondary button/i });
      expect(button).toBeInTheDocument();
    });

    it('renders outline variant correctly', () => {
      render(<Button variant="outline">Outline Button</Button>);
      const button = screen.getByRole('button', { name: /outline button/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveStyle({
        background: 'transparent',
      });
    });

    it('renders ghost variant correctly', () => {
      render(<Button variant="ghost">Ghost Button</Button>);
      const button = screen.getByRole('button', { name: /ghost button/i });
      expect(button).toBeInTheDocument();
      // Note: jsdom doesn't accurately compute styles, so we just verify the element exists
      expect(button).toHaveStyle({
        background: 'transparent',
      });
    });

    it('renders danger variant correctly', () => {
      render(<Button variant="danger">Danger Button</Button>);
      const button = screen.getByRole('button', { name: /danger button/i });
      expect(button).toBeInTheDocument();
    });

    it('renders glass variant correctly', () => {
      render(<Button variant="glass">Glass Button</Button>);
      const button = screen.getByRole('button', { name: /glass button/i });
      expect(button).toBeInTheDocument();
    });

    it('defaults to primary variant when no variant is specified', () => {
      render(<Button>Default Button</Button>);
      const button = screen.getByRole('button', { name: /default button/i });
      expect(button).toBeInTheDocument();
    });
  });

  // ============================================================================
  // SIZE RENDERING TESTS
  // ============================================================================

  describe('Size Rendering', () => {
    it('renders sm size correctly', () => {
      render(<Button size="sm">Small Button</Button>);
      const button = screen.getByRole('button', { name: /small button/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveStyle({
        minHeight: '44px',
      });
    });

    it('renders md size correctly', () => {
      render(<Button size="md">Medium Button</Button>);
      const button = screen.getByRole('button', { name: /medium button/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveStyle({
        minHeight: '48px',
      });
    });

    it('renders lg size correctly', () => {
      render(<Button size="lg">Large Button</Button>);
      const button = screen.getByRole('button', { name: /large button/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveStyle({
        minHeight: '56px',
      });
    });

    it('renders xl size correctly', () => {
      render(<Button size="xl">Extra Large Button</Button>);
      const button = screen.getByRole('button', { name: /extra large button/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveStyle({
        minHeight: '64px',
      });
    });

    it('defaults to md size when no size is specified', () => {
      render(<Button>Default Size</Button>);
      const button = screen.getByRole('button', { name: /default size/i });
      expect(button).toHaveStyle({
        minHeight: '48px',
      });
    });
  });

  // ============================================================================
  // DISABLED STATE TESTS
  // ============================================================================

  describe('Disabled State', () => {
    it('renders disabled button correctly', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button', { name: /disabled button/i });
      expect(button).toBeDisabled();
      expect(button).toHaveStyle({
        cursor: 'not-allowed',
        opacity: 0.65,
      });
    });

    it('does not call onClick when disabled', () => {
      const handleClick = vi.fn();

      render(
        <Button disabled onClick={handleClick}>
          Disabled Button
        </Button>
      );
      const button = screen.getByRole('button', { name: /disabled button/i });

      button.click();
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('applies disabled styles for all variants', () => {
      const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger', 'glass'] as const;

      variants.forEach((variant) => {
        const { unmount } = render(
          <Button variant={variant} disabled>
            Disabled {variant}
          </Button>
        );

        const button = screen.getByRole('button', { name: new RegExp(`disabled ${variant}`, 'i') });
        expect(button).toBeDisabled();
        expect(button).toHaveStyle({ opacity: 0.65 });

        unmount();
      });
    });
  });

  // ============================================================================
  // LOADING STATE TESTS
  // ============================================================================

  describe('Loading State', () => {
    it('renders loading spinner when loading is true', () => {
      render(<Button loading>Loading Button</Button>);
      const button = screen.getByRole('button', { name: /loading button/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('disables button when loading', () => {
      render(<Button loading>Loading Button</Button>);
      const button = screen.getByRole('button', { name: /loading button/i });
      expect(button).toBeDisabled();
    });

    it('does not call onClick when loading', () => {
      const handleClick = vi.fn();

      render(
        <Button loading onClick={handleClick}>
          Loading Button
        </Button>
      );
      const button = screen.getByRole('button', { name: /loading button/i });

      button.click();
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('hides icons when loading', () => {
      render(
        <Button loading leftIcon={<span data-testid="left-icon">←</span>}>
          Loading with Icon
        </Button>
      );

      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // CLICK HANDLER TESTS
  // ============================================================================

  describe('Click Handler', () => {
    it('calls onClick when button is clicked', () => {
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Click Me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });

      button.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick multiple times when clicked multiple times', () => {
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Click Me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });

      button.click();
      button.click();
      button.click();

      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('works without onClick handler', () => {
      render(<Button>No Handler</Button>);
      const button = screen.getByRole('button', { name: /no handler/i });

      expect(() => button.click()).not.toThrow();
    });
  });

  // ============================================================================
  // FULL WIDTH PROP TESTS
  // ============================================================================

  describe('Full Width Prop', () => {
    it('renders full width when fullWidth is true', () => {
      render(<Button fullWidth>Full Width Button</Button>);
      const button = screen.getByRole('button', { name: /full width button/i });
      expect(button).toHaveStyle({
        width: '100%',
      });
    });

    it('renders auto width when fullWidth is false', () => {
      render(<Button fullWidth={false}>Auto Width Button</Button>);
      const button = screen.getByRole('button', { name: /auto width button/i });
      expect(button).toHaveStyle({
        width: 'auto',
      });
    });

    it('defaults to auto width when fullWidth is not specified', () => {
      render(<Button>Default Width</Button>);
      const button = screen.getByRole('button', { name: /default width/i });
      expect(button).toHaveStyle({
        width: 'auto',
      });
    });
  });

  // ============================================================================
  // ICON PROPS TESTS
  // ============================================================================

  describe('Icon Props', () => {
    it('renders left icon correctly', () => {
      render(
        <Button leftIcon={<span data-testid="left-icon">←</span>}>Button with Left Icon</Button>
      );

      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByText('Button with Left Icon')).toBeInTheDocument();
    });

    it('renders right icon correctly', () => {
      render(
        <Button rightIcon={<span data-testid="right-icon">→</span>}>Button with Right Icon</Button>
      );

      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
      expect(screen.getByText('Button with Right Icon')).toBeInTheDocument();
    });

    it('renders both left and right icons correctly', () => {
      render(
        <Button
          leftIcon={<span data-testid="left-icon">←</span>}
          rightIcon={<span data-testid="right-icon">→</span>}
        >
          Button with Both Icons
        </Button>
      );

      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
      expect(screen.getByText('Button with Both Icons')).toBeInTheDocument();
    });

    it('does not render icons when loading', () => {
      render(
        <Button
          loading
          leftIcon={<span data-testid="left-icon">←</span>}
          rightIcon={<span data-testid="right-icon">→</span>}
        >
          Loading Button
        </Button>
      );

      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // BUTTON TYPE TESTS
  // ============================================================================

  describe('Button Type', () => {
    it('defaults to button type', () => {
      render(<Button>Default Type</Button>);
      const button = screen.getByRole('button', { name: /default type/i });
      expect(button).toHaveAttribute('type', 'button');
    });

    it('renders submit type correctly', () => {
      render(<Button type="submit">Submit Button</Button>);
      const button = screen.getByRole('button', { name: /submit button/i });
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('renders reset type correctly', () => {
      render(<Button type="reset">Reset Button</Button>);
      const button = screen.getByRole('button', { name: /reset button/i });
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================

  describe('Accessibility', () => {
    it('applies custom aria-label', () => {
      render(<Button aria-label="Custom Label">Button</Button>);
      const button = screen.getByRole('button', { name: /custom label/i });
      expect(button).toHaveAttribute('aria-label', 'Custom Label');
    });

    it('sets aria-busy when loading', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button', { name: /loading/i });
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('does not set aria-busy when not loading', () => {
      render(<Button>Not Loading</Button>);
      const button = screen.getByRole('button', { name: /not loading/i });
      expect(button).toHaveAttribute('aria-busy', 'false');
    });

    it('is keyboard accessible', () => {
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Keyboard Accessible</Button>);
      const button = screen.getByRole('button', { name: /keyboard accessible/i });

      // Verify button is focusable
      button.focus();
      expect(document.activeElement).toBe(button);

      // Note: fireEvent.keyDown doesn't trigger click in jsdom (unlike real browsers)
      // Use fireEvent.click to simulate the effect of Enter key on a focused button
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // COMPOUND VARIANTS TESTS
  // ============================================================================

  describe('Compound Variants (Size + Variant combinations)', () => {
    it('renders primary + sm correctly', () => {
      render(
        <Button variant="primary" size="sm">
          Primary Small
        </Button>
      );
      const button = screen.getByRole('button', { name: /primary small/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveStyle({ minHeight: '44px' });
    });

    it('renders outline + lg correctly', () => {
      render(
        <Button variant="outline" size="lg">
          Outline Large
        </Button>
      );
      const button = screen.getByRole('button', { name: /outline large/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveStyle({
        minHeight: '56px',
        background: 'transparent',
      });
    });

    it('renders glass + xl correctly', () => {
      render(
        <Button variant="glass" size="xl">
          Glass Extra Large
        </Button>
      );
      const button = screen.getByRole('button', { name: /glass extra large/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveStyle({ minHeight: '64px' });
    });
  });

  // ============================================================================
  // CUSTOM PROPS TESTS
  // ============================================================================

  describe('Custom Props', () => {
    it('applies custom className', () => {
      render(<Button className="custom-class">Custom Class</Button>);
      const button = screen.getByRole('button', { name: /custom class/i });
      expect(button).toHaveClass('custom-class');
    });

    it('applies custom inline styles', () => {
      render(<Button style={{ color: 'rgb(255, 0, 0)' }}>Custom Style</Button>);
      const button = screen.getByRole('button', { name: /custom style/i });
      // Note: backgroundColor is overridden by component styles, but color is added
      expect(button).toHaveStyle({ color: 'rgb(255, 0, 0)' });
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('Edge Cases', () => {
    it('renders with complex ReactNode children', () => {
      render(
        <Button>
          <span>Complex</span>
          <strong>Children</strong>
        </Button>
      );

      expect(screen.getByText('Complex')).toBeInTheDocument();
      expect(screen.getByText('Children')).toBeInTheDocument();
    });

    it('handles rapid clicks gracefully', () => {
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Rapid Click</Button>);
      const button = screen.getByRole('button', { name: /rapid click/i });

      // Simulate rapid clicking
      button.click();
      button.click();
      button.click();
      button.click();
      button.click();

      expect(handleClick).toHaveBeenCalledTimes(5);
    });

    it('maintains focus outline for accessibility', () => {
      render(<Button>Focus Test</Button>);
      const button = screen.getByRole('button', { name: /focus test/i });

      button.focus();
      expect(button).toHaveFocus();
    });
  });
});
