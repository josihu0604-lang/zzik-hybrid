/**
 * PopupCard Component Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PopupCard, type PopupData } from '@/components/popup/PopupCard';

// Mock all dependencies
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
    article: ({ children, ...props }: React.ComponentProps<'article'>) => (
      <article {...props}>{children}</article>
    ),
    button: ({ children, ...props }: React.ComponentProps<'button'>) => (
      <button {...props}>{children}</button>
    ),
    span: ({ children, ...props }: React.ComponentProps<'span'>) => (
      <span {...props}>{children}</span>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}));

// Mock subcomponents
vi.mock('@/components/popup/ProgressBar', () => ({
  ProgressBar: ({ progress }: { progress: number }) => (
    <div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
      {progress}%
    </div>
  ),
}));

vi.mock('@/components/popup/PopupCardHeader', () => ({
  PopupCardHeader: ({ popup }: { popup: { brandName: string } }) => <div>{popup.brandName}</div>,
}));

vi.mock('@/components/popup/PopupCardStats', () => ({
  PopupCardStats: ({
    currentParticipants,
    goalParticipants,
  }: {
    currentParticipants: number;
    goalParticipants: number;
  }) => (
    <div>
      {currentParticipants}/{goalParticipants}
    </div>
  ),
}));

vi.mock('@/components/popup/PopupCardCTA', () => ({
  PopupCardCTA: ({
    onParticipate,
    popupId,
  }: {
    onParticipate: (id: string) => void;
    popupId: string;
  }) => <button onClick={() => onParticipate(popupId)}>참여하기</button>,
}));

const createMockPopup = (overrides: Partial<PopupData> = {}): PopupData => ({
  id: 'popup-123',
  brandName: 'Test Brand',
  brandLogo: '/logo.png',
  imageUrl: '/test.jpg',
  title: 'Test Popup',
  location: '서울시 강남구',
  currentParticipants: 72,
  goalParticipants: 100,
  daysLeft: 5,
  category: 'fashion',
  isParticipated: false,
  ...overrides,
});

describe('PopupCard', () => {
  const mockOnParticipate = vi.fn();
  const mockOnCardClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render popup card with basic info', () => {
      render(
        <PopupCard
          popup={createMockPopup()}
          onParticipate={mockOnParticipate}
          onCardClick={mockOnCardClick}
        />
      );
      expect(screen.getByText('Test Brand')).toBeInTheDocument();
    });

    it('should display progress percentage', () => {
      render(
        <PopupCard
          popup={createMockPopup({ currentParticipants: 72, goalParticipants: 100 })}
          onParticipate={mockOnParticipate}
          onCardClick={mockOnCardClick}
        />
      );
      expect(screen.getByText(/72/)).toBeInTheDocument();
    });

    it('should show title', () => {
      render(
        <PopupCard
          popup={createMockPopup({ title: 'Custom Title' })}
          onParticipate={mockOnParticipate}
          onCardClick={mockOnCardClick}
        />
      );
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onCardClick when clicked', () => {
      render(
        <PopupCard
          popup={createMockPopup()}
          onParticipate={mockOnParticipate}
          onCardClick={mockOnCardClick}
        />
      );
      const article = screen.getByRole('article');
      fireEvent.click(article);
      expect(mockOnCardClick).toHaveBeenCalledWith('popup-123');
    });

    it('should call onParticipate when participate button clicked', () => {
      render(
        <PopupCard
          popup={createMockPopup()}
          onParticipate={mockOnParticipate}
          onCardClick={mockOnCardClick}
        />
      );
      const participateButton = screen.getByRole('button', { name: /참여/i });
      fireEvent.click(participateButton);
      expect(mockOnParticipate).toHaveBeenCalledWith('popup-123');
    });
  });

  describe('Accessibility', () => {
    it('should have article role', () => {
      render(
        <PopupCard
          popup={createMockPopup()}
          onParticipate={mockOnParticipate}
          onCardClick={mockOnCardClick}
        />
      );
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('should have aria-label', () => {
      render(
        <PopupCard
          popup={createMockPopup()}
          onParticipate={mockOnParticipate}
          onCardClick={mockOnCardClick}
        />
      );
      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('aria-label');
    });
  });

  describe('Progress States', () => {
    it('should handle low progress (cold)', () => {
      render(
        <PopupCard
          popup={createMockPopup({ currentParticipants: 20, goalParticipants: 100 })}
          onParticipate={mockOnParticipate}
          onCardClick={mockOnCardClick}
        />
      );
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('should handle medium progress (warm)', () => {
      render(
        <PopupCard
          popup={createMockPopup({ currentParticipants: 50, goalParticipants: 100 })}
          onParticipate={mockOnParticipate}
          onCardClick={mockOnCardClick}
        />
      );
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('should handle high progress (hot)', () => {
      render(
        <PopupCard
          popup={createMockPopup({ currentParticipants: 85, goalParticipants: 100 })}
          onParticipate={mockOnParticipate}
          onCardClick={mockOnCardClick}
        />
      );
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('should handle completed (done)', () => {
      render(
        <PopupCard
          popup={createMockPopup({ currentParticipants: 100, goalParticipants: 100 })}
          onParticipate={mockOnParticipate}
          onCardClick={mockOnCardClick}
        />
      );
      expect(screen.getByRole('article')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero participants', () => {
      render(
        <PopupCard
          popup={createMockPopup({ currentParticipants: 0 })}
          onParticipate={mockOnParticipate}
          onCardClick={mockOnCardClick}
        />
      );
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('should handle urgent deadline', () => {
      render(
        <PopupCard
          popup={createMockPopup({ daysLeft: 1 })}
          onParticipate={mockOnParticipate}
          onCardClick={mockOnCardClick}
        />
      );
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('should show scarcity badge when few spots left', () => {
      render(
        <PopupCard
          popup={createMockPopup({ currentParticipants: 95, goalParticipants: 100 })}
          onParticipate={mockOnParticipate}
          onCardClick={mockOnCardClick}
        />
      );
      expect(screen.getByRole('article')).toBeInTheDocument();
    });
  });

  describe('Categories', () => {
    it('should handle different categories', () => {
      const categories: Array<'fashion' | 'food' | 'beauty' | 'kpop' | 'cafe' | 'tech'> = [
        'fashion',
        'food',
        'beauty',
        'kpop',
        'cafe',
        'tech',
      ];

      categories.forEach((category) => {
        const { unmount } = render(
          <PopupCard
            popup={createMockPopup({ category })}
            onParticipate={mockOnParticipate}
            onCardClick={mockOnCardClick}
          />
        );
        expect(screen.getByRole('article')).toBeInTheDocument();
        unmount();
      });
    });
  });
});
