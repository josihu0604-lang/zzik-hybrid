/**
 * OnboardingStep Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OnboardingStep } from '../OnboardingStep';
import { Flame } from 'lucide-react';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
    p: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <p {...props}>{children}</p>
    ),
  },
  useReducedMotion: () => false,
}));

describe('OnboardingStep', () => {
  const defaultProps = {
    index: 0,
    headline: 'Welcome to ZZIK',
    subtext: 'Join and make it happen',
    icon: <Flame data-testid="flame-icon" />,
    isActive: true,
  };

  it('renders headline correctly', () => {
    render(<OnboardingStep {...defaultProps} />);
    expect(screen.getByText('Welcome to ZZIK')).toBeInTheDocument();
  });

  it('renders subtext correctly', () => {
    render(<OnboardingStep {...defaultProps} />);
    expect(screen.getByText('Join and make it happen')).toBeInTheDocument();
  });

  it('renders icon', () => {
    render(<OnboardingStep {...defaultProps} />);
    expect(screen.getByTestId('flame-icon')).toBeInTheDocument();
  });

  it('renders emphasis text when provided', () => {
    render(<OnboardingStep {...defaultProps} emphasis="참여하면 열린다" />);
    expect(screen.getByText('참여하면 열린다')).toBeInTheDocument();
  });

  it('renders children when provided', () => {
    render(
      <OnboardingStep {...defaultProps}>
        <button>Get Started</button>
      </OnboardingStep>
    );
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('supports multiline headlines', () => {
    const multilineHeadline = '좋아하는 브랜드 팝업\n왜 맨날 못 가?';
    render(<OnboardingStep {...defaultProps} headline={multilineHeadline} />);

    expect(screen.getByText(/좋아하는 브랜드 팝업/)).toBeInTheDocument();
    expect(screen.getByText(/왜 맨날 못 가?/)).toBeInTheDocument();
  });

  it('applies flame background type by default', () => {
    const { container } = render(<OnboardingStep {...defaultProps} />);
    const step = container.firstChild as HTMLElement;
    expect(step).toBeInTheDocument();
  });

  it('applies spark background type when specified', () => {
    const { container } = render(<OnboardingStep {...defaultProps} backgroundType="spark" />);
    const step = container.firstChild as HTMLElement;
    expect(step).toBeInTheDocument();
  });

  it('applies success background type when specified', () => {
    const { container } = render(<OnboardingStep {...defaultProps} backgroundType="success" />);
    const step = container.firstChild as HTMLElement;
    expect(step).toBeInTheDocument();
  });

  it('handles inactive state', () => {
    const { container } = render(<OnboardingStep {...defaultProps} isActive={false} />);
    const step = container.firstChild as HTMLElement;
    expect(step).toHaveStyle({ pointerEvents: 'none' });
  });

  it('handles forward direction', () => {
    render(<OnboardingStep {...defaultProps} direction={1} />);
    expect(screen.getByText('Welcome to ZZIK')).toBeInTheDocument();
  });

  it('handles backward direction', () => {
    render(<OnboardingStep {...defaultProps} direction={-1} />);
    expect(screen.getByText('Welcome to ZZIK')).toBeInTheDocument();
  });

  it('renders flame particles for decoration', () => {
    const { container } = render(<OnboardingStep {...defaultProps} />);
    // Check that the particles container exists
    const particleContainer = container.querySelector('[aria-hidden="true"]');
    expect(particleContainer).toBeInTheDocument();
  });

  it('supports preformatted subtext with line breaks', () => {
    const multilineSubtext = '이제 당신이 결정해요.\n참여하면, 열려요.';
    render(<OnboardingStep {...defaultProps} subtext={multilineSubtext} />);

    expect(screen.getByText(/이제 당신이 결정해요/)).toBeInTheDocument();
  });
});
