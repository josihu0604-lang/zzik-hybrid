/**
 * Mock Data for E2E Tests
 * Test data generators and fixtures
 */

/**
 * Mock user data
 */
export const mockUser = {
  id: 'test-user-1',
  name: '테스트 유저',
  email: 'test@example.com',
  avatar: '/images/avatar-placeholder.png',
  bio: '테스트 사용자입니다.',
  followersCount: 100,
  followingCount: 50,
  reviewsCount: 25,
  points: 5000,
  level: 5,
  badges: ['early-adopter', 'reviewer', 'social-butterfly'],
};

/**
 * Mock review data
 */
export const mockReview = {
  id: 'review-1',
  userId: 'test-user-1',
  restaurantId: 'restaurant-1',
  rating: 5,
  comment: '정말 맛있었습니다! 대기 시간도 정확했고 서비스가 훌륭했어요.',
  photos: ['/images/review-1.jpg', '/images/review-2.jpg'],
  likes: 15,
  replies: 3,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Mock restaurant data
 */
export const mockRestaurant = {
  id: 'restaurant-1',
  name: '맛있는 식당',
  category: '한식',
  address: '서울특별시 강남구 테헤란로 123',
  phone: '02-1234-5678',
  rating: 4.5,
  reviewCount: 250,
  queueCount: 5,
  averageWaitTime: 30,
  photos: ['/images/restaurant-1.jpg'],
};

/**
 * Mock transaction data
 */
export const mockTransaction = {
  id: 'tx-1',
  type: 'charge',
  amount: 10000,
  status: 'completed',
  description: 'Z-Point 충전',
  createdAt: new Date().toISOString(),
  paymentMethod: 'card',
  receiptUrl: '/receipts/tx-1',
};

/**
 * Mock badge data
 */
export const mockBadge = {
  id: 'badge-1',
  name: '첫 리뷰어',
  description: '첫 리뷰를 작성하여 획득',
  icon: '🌟',
  rarity: 'common',
  earned: true,
  earnedAt: new Date().toISOString(),
  requirements: {
    type: 'review_count',
    target: 1,
    current: 1,
  },
};

/**
 * Mock achievement data
 */
export const mockAchievement = {
  id: 'achievement-1',
  name: '리뷰 마스터',
  description: '리뷰 50개 작성',
  points: 500,
  icon: '🏆',
  unlocked: false,
  progress: {
    current: 25,
    target: 50,
  },
};

/**
 * Mock leaderboard entry
 */
export const mockLeaderboardEntry = {
  rank: 1,
  userId: 'user-1',
  userName: '최고유저',
  avatar: '/images/avatar-1.png',
  points: 10000,
  level: 10,
  badges: 5,
};

/**
 * Mock feed activity
 */
export const mockActivity = {
  id: 'activity-1',
  userId: 'user-1',
  userName: '활동유저',
  type: 'review',
  content: '새로운 리뷰를 작성했습니다.',
  timestamp: new Date().toISOString(),
  likes: 10,
  comments: 3,
};

/**
 * Mock notification
 */
export const mockNotification = {
  id: 'notif-1',
  type: 'follow',
  userId: 'user-2',
  userName: '팔로워',
  message: '님이 회원님을 팔로우하기 시작했습니다.',
  read: false,
  createdAt: new Date().toISOString(),
};

/**
 * Generate mock reviews
 */
export function generateMockReviews(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    ...mockReview,
    id: `review-${i + 1}`,
    rating: Math.floor(Math.random() * 5) + 1,
    comment: `테스트 리뷰 ${i + 1}`,
    likes: Math.floor(Math.random() * 50),
    replies: Math.floor(Math.random() * 10),
  }));
}

/**
 * Generate mock transactions
 */
export function generateMockTransactions(count: number) {
  const types = ['charge', 'spend', 'refund', 'reward'];
  return Array.from({ length: count }, (_, i) => ({
    ...mockTransaction,
    id: `tx-${i + 1}`,
    type: types[Math.floor(Math.random() * types.length)],
    amount: Math.floor(Math.random() * 50000) + 1000,
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  }));
}

/**
 * Generate mock badges
 */
export function generateMockBadges(count: number) {
  const rarities = ['common', 'rare', 'epic', 'legendary'];
  return Array.from({ length: count }, (_, i) => ({
    ...mockBadge,
    id: `badge-${i + 1}`,
    name: `뱃지 ${i + 1}`,
    rarity: rarities[Math.floor(Math.random() * rarities.length)],
    earned: Math.random() > 0.5,
  }));
}

/**
 * Generate mock leaderboard
 */
export function generateMockLeaderboard(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    ...mockLeaderboardEntry,
    rank: i + 1,
    userId: `user-${i + 1}`,
    userName: `유저${i + 1}`,
    points: 10000 - i * 500,
    level: Math.max(1, 10 - Math.floor(i / 10)),
  }));
}

/**
 * Generate mock feed activities
 */
export function generateMockActivities(count: number) {
  const types = ['review', 'checkin', 'badge', 'follow'];
  return Array.from({ length: count }, (_, i) => ({
    ...mockActivity,
    id: `activity-${i + 1}`,
    userId: `user-${i + 1}`,
    userName: `유저${i + 1}`,
    type: types[Math.floor(Math.random() * types.length)],
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
  }));
}

/**
 * API response templates
 */
export const mockApiResponses = {
  success: (data: any) => ({
    success: true,
    data,
    message: '성공적으로 처리되었습니다.',
  }),
  
  error: (message: string, code = 'ERROR') => ({
    success: false,
    error: {
      code,
      message,
    },
  }),
  
  paginated: (data: any[], page = 1, limit = 20) => ({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total: data.length,
      hasMore: data.length === limit,
    },
  }),
};

/**
 * Test credentials
 */
export const testCredentials = {
  validUser: {
    email: 'test@example.com',
    password: 'Test123!@#',
  },
  invalidUser: {
    email: 'invalid@example.com',
    password: 'wrongpassword',
  },
  testCard: {
    number: '4242424242424242',
    expiry: '12/25',
    cvc: '123',
    zip: '12345',
  },
};

/**
 * Test URLs
 */
export const testUrls = {
  home: '/',
  demo: '/demo',
  reviews: '/demo#reviews',
  social: '/demo#social',
  gamification: '/demo#gamification',
  payment: '/demo#payment',
  queue: '/demo#queue',
};

/**
 * Selectors
 */
export const selectors = {
  // Common
  loading: '[data-testid="loading"]',
  error: '[data-testid="error"]',
  success: '[data-testid="success"]',
  modal: '[data-testid="modal"]',
  
  // Review
  reviewForm: '[data-testid="review-form"]',
  reviewList: '[data-testid="review-list"]',
  reviewItem: '[data-testid="review-item"]',
  
  // Social
  profileSection: '[data-testid="profile-section"]',
  feedList: '[data-testid="feed-list"]',
  userCard: '[data-testid="user-card"]',
  
  // Gamification
  pointsSection: '[data-testid="points-section"]',
  badgesSection: '[data-testid="badges-section"]',
  leaderboard: '[data-testid="leaderboard"]',
  
  // Payment
  walletSection: '[data-testid="wallet-section"]',
  transactionsList: '[data-testid="transactions-list"]',
  chargeModal: '[data-testid="charge-modal"]',
};
