
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  createVIPTicket, 
  upgradeTicket, 
  hasAccess 
} from '../vip-ticket';
import { VIPTicket } from '../vip-ticket';

// Mock Supabase integration
vi.mock('../vip-ticket', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../vip-ticket')>();
  return {
    ...actual,
    // We only mock the DB persistence parts
    // But createVIPTicket calls saveTicket which is internal...
    // Since saveTicket is not exported, we can't mock it directly if we import createVIPTicket from the module.
    // However, we can mock the Supabase client inside the module if we could.
    // Alternatively, since we are in unit tests, we can rely on mocking the 'saveTicket' if it was exported or mock the dependencies.
    
    // Better approach: Mock the entire module's DB functions if we want to test the high-level flows
    // But to test logic inside createVIPTicket, we need it to run.
    // The actual createVIPTicket imports saveTicket from same file. 
    // We might need to refactor or mock the server import inside.
  };
});

// Mocking the internal dynamic import of supabase/server
vi.mock('../supabase/server', () => ({
  createAdminClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ error: null }),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: 'ticket_mock' }, error: null }),
    update: vi.fn().mockResolvedValue({ error: null }),
  }),
  isAdminConfigured: vi.fn().mockReturnValue(true),
}));

describe('VIP Ticket Module', () => {
  describe('createVIPTicket', () => {
    it('should create a ticket with correct dates for monthly plan', async () => {
      const ticket = await createVIPTicket('user_123', 'silver', 'KR', 'monthly');
      
      expect(ticket.tier).toBe('silver');
      expect(ticket.region).toBe('KR');
      expect(ticket.isActive).toBe(false); // Initially inactive until payment
      
      // Check dates
      const now = new Date();
      const oneMonthLater = new Date();
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      
      // Allow some tiny time difference
      expect(ticket.startDate.getTime()).toBeCloseTo(now.getTime(), -3); // within 1s
      // Approximate month check
      expect(ticket.endDate.getMonth()).toBe(oneMonthLater.getMonth());
    });

    it('should create a ticket with correct dates for yearly plan', async () => {
      const ticket = await createVIPTicket('user_123', 'gold', 'US', 'yearly');
      
      const oneYearLater = new Date();
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      
      expect(ticket.endDate.getFullYear()).toBe(oneYearLater.getFullYear());
    });
  });

  describe('hasAccess', () => {
    const mockTicket: VIPTicket = {
      id: 't1',
      userId: 'u1',
      tier: 'gold',
      region: 'KR',
      startDate: new Date(),
      endDate: new Date(),
      isActive: true,
      autoRenew: true,
      paymentMethod: 'stripe',
      transactionHistory: []
    };

    it('should allow access to features included in the tier', () => {
      // Gold includes 'gold_badge'
      expect(hasAccess(mockTicket, 'gold_badge')).toBe(true);
    });

    it('should allow access to lower tier features', () => {
      // Gold includes Silver features
      expect(hasAccess(mockTicket, 'silver_badge')).toBe(true);
    });

    it('should deny access to higher tier features', () => {
      // Gold does NOT include 'platinum_badge_and_frame'
      expect(hasAccess(mockTicket, 'platinum_badge_and_frame')).toBe(false);
    });

    it('should deny access if ticket is inactive', () => {
      const inactiveTicket = { ...mockTicket, isActive: false };
      // Should only have free features
      expect(hasAccess(inactiveTicket, 'silver_badge')).toBe(false);
      expect(hasAccess(inactiveTicket, 'basic_verification')).toBe(true); // Free feature
    });
  });
});
