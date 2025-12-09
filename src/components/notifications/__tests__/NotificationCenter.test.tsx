/**
 * NotificationCenter Component Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationCenter } from '../NotificationCenter';
import * as notificationsHook from '@/hooks/useNotifications';
import type { Notification, NotificationType, NotificationPriority } from '@/types/notification';

// Mock useNotifications hook
vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: vi.fn(),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
    button: ({ children, ...props }: React.HTMLAttributes<HTMLButtonElement>) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Helper to create a mock notification
function createMockNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: '1',
    user_id: 'user123',
    type: 'popup_opened' as NotificationType,
    title: 'Test Notification',
    message: 'Test message',
    read: false,
    created_at: new Date().toISOString(),
    priority: 'medium' as NotificationPriority,
    ...overrides,
  };
}

// Helper to create default mock return value with proper typing
function createMockNotificationsReturn(
  overrides: Partial<{
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: Error | null;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refreshNotifications: () => Promise<void>;
  }> = {}
) {
  return {
    notifications: [] as Notification[],
    unreadCount: 0,
    isLoading: false,
    error: null,
    markAsRead: vi.fn().mockResolvedValue(undefined) as (id: string) => Promise<void>,
    markAllAsRead: vi.fn().mockResolvedValue(undefined) as () => Promise<void>,
    refreshNotifications: vi.fn().mockResolvedValue(undefined) as () => Promise<void>,
    ...overrides,
  };
}

describe('NotificationCenter', () => {
  const mockUseNotifications = vi.mocked(notificationsHook.useNotifications);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when userId is null', () => {
    mockUseNotifications.mockReturnValue(createMockNotificationsReturn());

    const { container } = render(<NotificationCenter userId={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders bell icon when userId is provided', () => {
    mockUseNotifications.mockReturnValue(createMockNotificationsReturn());

    render(<NotificationCenter userId="user123" />);
    const bellButton = screen.getByLabelText('알림');
    expect(bellButton).toBeInTheDocument();
  });

  it('displays unread count badge when there are unread notifications', () => {
    mockUseNotifications.mockReturnValue(createMockNotificationsReturn({ unreadCount: 5 }));

    render(<NotificationCenter userId="user123" />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays 99+ for unread count greater than 99', () => {
    mockUseNotifications.mockReturnValue(createMockNotificationsReturn({ unreadCount: 150 }));

    render(<NotificationCenter userId="user123" />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('opens dropdown when bell button is clicked', () => {
    mockUseNotifications.mockReturnValue(createMockNotificationsReturn());

    render(<NotificationCenter userId="user123" />);
    const bellButton = screen.getByLabelText('알림');

    fireEvent.click(bellButton);

    expect(screen.getByText('알림')).toBeInTheDocument();
  });

  it('displays empty state when no notifications', () => {
    mockUseNotifications.mockReturnValue(createMockNotificationsReturn());

    render(<NotificationCenter userId="user123" />);
    fireEvent.click(screen.getByLabelText('알림'));

    expect(screen.getByText('알림이 없습니다')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    mockUseNotifications.mockReturnValue(createMockNotificationsReturn({ isLoading: true }));

    const { container } = render(<NotificationCenter userId="user123" />);
    fireEvent.click(screen.getByLabelText('알림'));

    const loadingSpinner = container.querySelector('.animate-spin');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('displays notification list', () => {
    const mockNotifications: Notification[] = [
      createMockNotification({
        id: '1',
        type: 'popup_opened' as NotificationType,
        title: '팝업이 오픈되었습니다!',
        message: '귀하가 참여한 팝업이 오픈되었습니다.',
        read: false,
        priority: 'medium' as NotificationPriority,
      }),
      createMockNotification({
        id: '2',
        type: 'participation_confirmed' as NotificationType,
        title: '참여 확정',
        message: '참여가 확정되었습니다.',
        read: true,
        priority: 'low' as NotificationPriority,
      }),
    ];

    mockUseNotifications.mockReturnValue(
      createMockNotificationsReturn({
        notifications: mockNotifications,
        unreadCount: 1,
      })
    );

    render(<NotificationCenter userId="user123" />);
    fireEvent.click(screen.getByLabelText('알림'));

    expect(screen.getByText('팝업이 오픈되었습니다!')).toBeInTheDocument();
    expect(screen.getByText('참여 확정')).toBeInTheDocument();
  });

  it('calls markAsRead when notification is clicked', async () => {
    const mockMarkAsRead = vi.fn().mockResolvedValue(undefined);
    const mockNotifications: Notification[] = [
      createMockNotification({
        id: '1',
        type: 'popup_opened' as NotificationType,
        title: '팝업이 오픈되었습니다!',
        message: '귀하가 참여한 팝업이 오픈되었습니다.',
        read: false,
        priority: 'medium' as NotificationPriority,
      }),
    ];

    mockUseNotifications.mockReturnValue(
      createMockNotificationsReturn({
        notifications: mockNotifications,
        unreadCount: 1,
        markAsRead: mockMarkAsRead as (id: string) => Promise<void>,
      })
    );

    render(<NotificationCenter userId="user123" />);
    fireEvent.click(screen.getByLabelText('알림'));

    const notificationButton = screen.getByText('팝업이 오픈되었습니다!').closest('button');
    fireEvent.click(notificationButton!);

    expect(mockMarkAsRead).toHaveBeenCalledWith('1');
  });

  it('calls markAllAsRead when "모두 읽음" button is clicked', () => {
    const mockMarkAllAsRead = vi.fn().mockResolvedValue(undefined);
    mockUseNotifications.mockReturnValue(
      createMockNotificationsReturn({
        notifications: [
          createMockNotification({
            id: '1',
            type: 'popup_opened' as NotificationType,
            title: '팝업이 오픈되었습니다!',
            message: '귀하가 참여한 팝업이 오픈되었습니다.',
            read: false,
            priority: 'high' as NotificationPriority,
          }),
        ],
        unreadCount: 1,
        markAllAsRead: mockMarkAllAsRead as () => Promise<void>,
      })
    );

    render(<NotificationCenter userId="user123" />);
    fireEvent.click(screen.getByLabelText('알림'));

    const markAllButton = screen.getByText('모두 읽음');
    fireEvent.click(markAllButton);

    expect(mockMarkAllAsRead).toHaveBeenCalled();
  });

  it('closes dropdown when close button is clicked', () => {
    mockUseNotifications.mockReturnValue(createMockNotificationsReturn());

    render(<NotificationCenter userId="user123" />);
    fireEvent.click(screen.getByLabelText('알림'));

    const closeButton = screen.getByLabelText('닫기');
    fireEvent.click(closeButton);

    // After closing, the dropdown content should be unmounted
    waitFor(() => {
      expect(screen.queryByText('알림이 없습니다')).not.toBeInTheDocument();
    });
  });
});
