# 🎯 ZZIK Master Prompt - AI 개발 시스템 설계 문서

> **Version**: 2.0  
> **Created**: 2025-12-09  
> **Purpose**: ZZIK 프로젝트의 전체 시스템 아키텍처 및 AI 개발 가이드라인

---

## 📋 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [시스템 아키텍처](#2-시스템-아키텍처)
3. [핵심 모듈 설계](#3-핵심-모듈-설계)
4. [API 엔드포인트 명세](#4-api-엔드포인트-명세)
5. [상태 관리 (Zustand)](#5-상태-관리-zustand)
6. [커스텀 훅](#6-커스텀-훅)
7. [데이터베이스 스키마](#7-데이터베이스-스키마)
8. [디자인 시스템](#8-디자인-시스템)
9. [보안 및 인증](#9-보안-및-인증)
10. [테스트 전략](#10-테스트-전략)

---

## 1. 프로젝트 개요

### 1.1 비전
```yaml
Name: ZZIK (찍)
Tagline: "Your K-POP VIP Experience"
Mission: 글로벌 K-Experience 슈퍼앱
```

### 1.2 핵심 가치
| 기능 | 설명 | 우선순위 |
|------|------|----------|
| **Pay** | 스테이블코인 결제, Z-Point 시스템 | P0 |
| **Play** | K-Experience 큐레이션, 실시간 대기열 | P0 |
| **Beauty** | AI 피부 진단, K-뷰티 매칭 | P1 |
| **Social** | 팔로우, 피드, 프로필 | P1 |
| **Gamification** | 뱃지, 리더보드, 포인트 | P2 |

### 1.3 타겟 시장
```yaml
Tier 1A: Thailand, Indonesia, Philippines
Tier 1B: Kazakhstan (CIS gateway)  
Tier 2: Taiwan, Singapore, Malaysia
Tier 3: Japan, South Korea, USA
Tier 4: China (future)
```

---

## 2. 시스템 아키텍처

### 2.1 기술 스택
```yaml
Frontend:
  - Next.js 15 (App Router)
  - TypeScript 5.6
  - Tailwind CSS
  - Framer Motion
  - Zustand (State Management)

Backend:
  - Supabase (Auth, DB, Storage, Realtime)
  - Redis (Queue, Cache)
  - Stripe (Payments)
  - Server-Sent Events (SSE)

Mobile:
  - Capacitor (iOS/Android Hybrid)
  - PWA Support

Infrastructure:
  - Vercel (Hosting)
  - Sentry (Error Monitoring)
  - Google Analytics 4
```

### 2.2 레이어 아키텍처
```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  (Components, Pages, Hooks)                                  │
├─────────────────────────────────────────────────────────────┤
│                    State Management Layer                    │
│  (Zustand Stores)                                           │
├─────────────────────────────────────────────────────────────┤
│                    API Layer                                 │
│  (Next.js API Routes, Middleware)                           │
├─────────────────────────────────────────────────────────────┤
│                    Service Layer                             │
│  (Business Logic, Algorithms, Pipelines)                    │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                                │
│  (Supabase Client, Redis, External APIs)                    │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 폴더 구조
```
src/
├── app/                    # Next.js App Router
│   ├── (home)/            # Homepage routes
│   ├── api/               # API endpoints
│   └── [locale]/          # i18n routes
├── components/            # React components
│   ├── ui/               # Primitives (Button, Card, etc.)
│   ├── layout/           # Layout components
│   ├── payment/          # Payment components
│   ├── review/           # Review components
│   ├── social/           # Social components
│   ├── gamification/     # Gamification components
│   └── queue/            # Queue components
├── stores/               # Zustand stores
├── hooks/                # Custom React hooks
├── lib/                  # Utilities & services
│   ├── payment/         # Payment logic
│   ├── ai/              # AI services
│   ├── algorithms/      # Business algorithms
│   └── supabase/        # Supabase client
├── i18n/                 # Internationalization
└── types/                # TypeScript types
```

---

## 3. 핵심 모듈 설계

### 3.1 결제 시스템 (Payment Module)

#### 3.1.1 결제 흐름
```
User → PaymentMethodSelector → PaymentConfirm → Webhook → Transaction Complete
           │                        │
           ├─ Z-Point               ├─ Stripe Checkout
           ├─ Card                  └─ Crypto Settlement
           └─ Crypto (USDC)
```

#### 3.1.2 핵심 컴포넌트
| 컴포넌트 | 위치 | 설명 |
|----------|------|------|
| PaymentMethodSelector | `payment/` | 결제 수단 선택 |
| WalletDashboard | `payment/` | Z-Point 대시보드 |
| TransactionHistory | `payment/` | 거래 내역 |
| RefundRequestModal | `payment/` | 환불 신청 |

#### 3.1.3 Z-Point 시스템
```typescript
interface ZPoint {
  balance: number;        // KRW 기준
  pendingBalance: number; // 대기 중 잔액
  lockedBalance: number;  // 잠금 잔액
  lastUpdated: Date;
}

// 환율: 1 Z-Point = 1 KRW
// USDC 연동: 1 USDC ≈ 1,350 KRW (실시간)
```

### 3.2 대기열 시스템 (Queue Module)

#### 3.2.1 실시간 대기열 흐름
```
User Join → Queue Entry Created → SSE Position Updates → Called → Check-in
                    │
                    ├─ Realtime Position Display
                    ├─ Estimated Wait Time
                    └─ Notifications
```

#### 3.2.2 핵심 컴포넌트
| 컴포넌트 | 설명 |
|----------|------|
| QueueDashboard | 레스토랑 대기열 관리 |
| QueueTicket | 고객 대기 티켓 |
| WaitlistManager | 대기 명단 관리 |
| RealtimePositionDisplay | 실시간 순번 표시 |
| QueueAnalyticsDashboard | 대기열 분석 |

### 3.3 리뷰 시스템 (Review Module)

#### 3.3.1 리뷰 데이터 구조
```typescript
interface Review {
  id: string;
  userId: string;
  targetType: 'experience' | 'restaurant' | 'product';
  targetId: string;
  rating: number;        // 1-5
  content: string;
  images: string[];
  tags: string[];
  likes: number;
  isVerified: boolean;   // 실제 구매/방문 확인
  createdAt: Date;
}
```

### 3.4 소셜 시스템 (Social Module)

#### 3.4.1 핵심 기능
- **UserProfile**: 사용자 프로필 표시
- **FollowButton**: 팔로우/언팔로우
- **ActivityFeed**: 활동 피드

### 3.5 게이미피케이션 (Gamification Module)

#### 3.5.1 뱃지 시스템
```typescript
type BadgeCategory = 
  | 'experience'    // 경험 뱃지
  | 'collector'     // 수집 뱃지
  | 'social'        // 소셜 뱃지
  | 'achievement';  // 업적 뱃지

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirement: number;
  earnedAt?: Date;
}
```

---

## 4. API 엔드포인트 명세

### 4.1 Review API

#### `GET /api/reviews`
```typescript
// Query Parameters
interface ReviewListParams {
  targetType?: 'experience' | 'restaurant' | 'product';
  targetId?: string;
  userId?: string;
  sortBy?: 'recent' | 'rating' | 'likes';
  page?: number;
  limit?: number;
}

// Response
interface ReviewListResponse {
  reviews: Review[];
  total: number;
  page: number;
  hasMore: boolean;
}
```

#### `POST /api/reviews`
```typescript
// Request Body
interface CreateReviewRequest {
  targetType: 'experience' | 'restaurant' | 'product';
  targetId: string;
  rating: number;
  content: string;
  images?: string[];
  tags?: string[];
}

// Response
interface CreateReviewResponse {
  review: Review;
  earnedBadges?: Badge[];  // 리뷰 작성으로 획득한 뱃지
}
```

#### `PUT /api/reviews/[id]`
```typescript
interface UpdateReviewRequest {
  rating?: number;
  content?: string;
  images?: string[];
  tags?: string[];
}
```

#### `DELETE /api/reviews/[id]`

#### `POST /api/reviews/[id]/like`

#### `GET /api/reviews/[id]/replies`

### 4.2 Social API

#### `GET /api/social/users/[id]`
```typescript
interface UserProfileResponse {
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    bio: string;
    country: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    stats: {
      experiences: number;
      reviews: number;
      followers: number;
      following: number;
      badges: number;
    };
    badges: Badge[];
    isFollowing?: boolean;
  };
}
```

#### `POST /api/social/follow`
```typescript
interface FollowRequest {
  targetUserId: string;
}

interface FollowResponse {
  success: boolean;
  isFollowing: boolean;
  followersCount: number;
}
```

#### `DELETE /api/social/follow`

#### `GET /api/social/feed`
```typescript
interface FeedParams {
  type?: 'all' | 'following' | 'trending';
  page?: number;
  limit?: number;
}

interface FeedItem {
  id: string;
  type: 'booking' | 'review' | 'badge' | 'checkin' | 'follow';
  user: UserSummary;
  content: object;
  createdAt: Date;
  likes: number;
  comments: number;
}
```

### 4.3 Gamification API

#### `GET /api/gamification/badges`
```typescript
interface BadgesResponse {
  earned: Badge[];
  available: Badge[];
  progress: BadgeProgress[];
}

interface BadgeProgress {
  badgeId: string;
  current: number;
  required: number;
  percentage: number;
}
```

#### `GET /api/gamification/leaderboard`
```typescript
interface LeaderboardParams {
  type: 'points' | 'experiences' | 'referrals' | 'reviews';
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
  country?: string;
  limit?: number;
}

interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  userRank?: LeaderboardEntry;
  total: number;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  country: string;
  tier: string;
  score: number;
  change: number;  // 순위 변동
}
```

#### `GET /api/gamification/points`
```typescript
interface PointsResponse {
  total: number;
  available: number;  // 사용 가능 포인트
  pending: number;    // 대기 중 포인트
  history: PointTransaction[];
}

interface PointTransaction {
  id: string;
  type: 'earn' | 'spend' | 'expire' | 'refund';
  amount: number;
  source: string;
  description: string;
  createdAt: Date;
}
```

#### `POST /api/gamification/achievements/claim`
```typescript
interface ClaimAchievementRequest {
  achievementId: string;
}

interface ClaimAchievementResponse {
  success: boolean;
  points: number;
  badge?: Badge;
}
```

---

## 5. 상태 관리 (Zustand)

### 5.1 Store 설계 원칙
```typescript
// 1. 단일 책임 원칙
// 각 store는 하나의 도메인만 관리

// 2. 불변성 유지
// immer 미들웨어 사용 권장

// 3. 영속성 지원
// persist 미들웨어로 localStorage 동기화

// 4. 타입 안전성
// 모든 store는 완전한 타입 정의
```

### 5.2 Payment Store
```typescript
interface PaymentState {
  // State
  balance: ZPoint;
  transactions: Transaction[];
  selectedMethod: PaymentMethod | null;
  pendingPayment: PendingPayment | null;
  
  // Actions
  setBalance: (balance: ZPoint) => void;
  addTransaction: (tx: Transaction) => void;
  selectMethod: (method: PaymentMethod) => void;
  setPendingPayment: (payment: PendingPayment | null) => void;
  
  // Async Actions
  fetchBalance: () => Promise<void>;
  fetchTransactions: (params?: TransactionParams) => Promise<void>;
  createPayment: (data: CreatePaymentData) => Promise<PaymentResult>;
  requestRefund: (txId: string, reason: string) => Promise<void>;
}
```

### 5.3 Review Store
```typescript
interface ReviewState {
  // State
  reviews: Map<string, Review[]>;  // targetId -> reviews
  userReviews: Review[];
  drafts: Map<string, ReviewDraft>;
  
  // Actions
  setReviews: (targetId: string, reviews: Review[]) => void;
  addReview: (review: Review) => void;
  updateReview: (id: string, data: Partial<Review>) => void;
  deleteReview: (id: string) => void;
  saveDraft: (targetId: string, draft: ReviewDraft) => void;
  clearDraft: (targetId: string) => void;
  
  // Async Actions
  fetchReviews: (targetId: string, params?: ReviewParams) => Promise<void>;
  submitReview: (data: CreateReviewData) => Promise<Review>;
  likeReview: (reviewId: string) => Promise<void>;
}
```

### 5.4 Social Store
```typescript
interface SocialState {
  // State
  profile: UserProfile | null;
  followers: UserSummary[];
  following: UserSummary[];
  feed: FeedItem[];
  feedPage: number;
  hasMoreFeed: boolean;
  
  // Actions
  setProfile: (profile: UserProfile) => void;
  setFollowers: (users: UserSummary[]) => void;
  setFollowing: (users: UserSummary[]) => void;
  addFeedItem: (item: FeedItem) => void;
  
  // Async Actions
  fetchProfile: (userId: string) => Promise<void>;
  fetchFeed: (type?: FeedType) => Promise<void>;
  follow: (userId: string) => Promise<void>;
  unfollow: (userId: string) => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
}
```

### 5.5 Gamification Store
```typescript
interface GamificationState {
  // State
  points: PointsData;
  badges: Badge[];
  progress: BadgeProgress[];
  leaderboard: LeaderboardEntry[];
  achievements: Achievement[];
  
  // Actions
  setPoints: (points: PointsData) => void;
  addBadge: (badge: Badge) => void;
  updateProgress: (progress: BadgeProgress) => void;
  setLeaderboard: (entries: LeaderboardEntry[]) => void;
  
  // Async Actions
  fetchPoints: () => Promise<void>;
  fetchBadges: () => Promise<void>;
  fetchLeaderboard: (params: LeaderboardParams) => Promise<void>;
  claimAchievement: (achievementId: string) => Promise<ClaimResult>;
}
```

---

## 6. 커스텀 훅

### 6.1 Payment Hooks
```typescript
// usePayment - 결제 처리 훅
const usePayment = () => {
  const { balance, selectedMethod, createPayment } = usePaymentStore();
  
  return {
    balance,
    selectedMethod,
    pay: async (amount: number, metadata?: object) => {...},
    canPay: (amount: number) => balance.balance >= amount,
  };
};

// useWallet - 지갑 관리 훅
const useWallet = () => {
  const { balance, transactions, fetchBalance, fetchTransactions } = usePaymentStore();
  
  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, []);
  
  return {
    balance,
    transactions,
    refresh: () => Promise.all([fetchBalance(), fetchTransactions()]),
  };
};

// useTransactions - 거래 내역 훅
const useTransactions = (params?: TransactionParams) => {...};
```

### 6.2 Review Hooks
```typescript
// useReviews - 리뷰 목록 훅
const useReviews = (targetId: string, targetType: TargetType) => {
  const { reviews, fetchReviews, submitReview } = useReviewStore();
  
  useEffect(() => {
    fetchReviews(targetId, { targetType });
  }, [targetId, targetType]);
  
  return {
    reviews: reviews.get(targetId) || [],
    submit: (data: CreateReviewData) => submitReview(data),
    refresh: () => fetchReviews(targetId, { targetType }),
  };
};

// useReviewForm - 리뷰 작성 폼 훅
const useReviewForm = (targetId: string) => {
  const { drafts, saveDraft, clearDraft, submitReview } = useReviewStore();
  
  return {
    draft: drafts.get(targetId),
    save: (data: ReviewDraft) => saveDraft(targetId, data),
    clear: () => clearDraft(targetId),
    submit: async (data: CreateReviewData) => {...},
  };
};
```

### 6.3 Social Hooks
```typescript
// useProfile - 프로필 훅
const useProfile = (userId?: string) => {...};

// useFollow - 팔로우 훅
const useFollow = (targetUserId: string) => {
  const { follow, unfollow } = useSocialStore();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const toggle = async () => {
    setIsLoading(true);
    try {
      if (isFollowing) {
        await unfollow(targetUserId);
      } else {
        await follow(targetUserId);
      }
      setIsFollowing(!isFollowing);
    } finally {
      setIsLoading(false);
    }
  };
  
  return { isFollowing, isLoading, toggle };
};

// useFeed - 피드 훅
const useFeed = (type: FeedType = 'all') => {...};
```

### 6.4 Gamification Hooks
```typescript
// usePoints - 포인트 훅
const usePoints = () => {...};

// useBadges - 뱃지 훅
const useBadges = () => {...};

// useLeaderboard - 리더보드 훅
const useLeaderboard = (params: LeaderboardParams) => {...};

// useAchievements - 업적 훅
const useAchievements = () => {...};
```

---

## 7. 데이터베이스 스키마

### 7.1 Reviews Table
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('experience', 'restaurant', 'product')),
  target_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_target UNIQUE (user_id, target_type, target_id)
);

-- Indexes
CREATE INDEX idx_reviews_target ON reviews(target_type, target_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);
```

### 7.2 Social Tables
```sql
-- User Profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  country TEXT,
  tier TEXT DEFAULT 'bronze',
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follows
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES auth.users(id) NOT NULL,
  following_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_follow UNIQUE (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Activity Feed
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT NOT NULL,
  content JSONB NOT NULL,
  target_id UUID,
  target_type TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_user ON activities(user_id, created_at DESC);
CREATE INDEX idx_activities_type ON activities(type);
```

### 7.3 Gamification Tables
```sql
-- Badges
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  category TEXT NOT NULL,
  tier TEXT NOT NULL,
  requirement INTEGER NOT NULL,
  points_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Badges
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  badge_id UUID REFERENCES badges(id) NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_badge UNIQUE (user_id, badge_id)
);

-- Points Transactions
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend', 'expire', 'refund')),
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  description TEXT,
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_points_user ON point_transactions(user_id, created_at DESC);

-- Leaderboard (materialized view for performance)
CREATE MATERIALIZED VIEW leaderboard_weekly AS
SELECT 
  user_id,
  SUM(amount) FILTER (WHERE type = 'earn') as total_points,
  ROW_NUMBER() OVER (ORDER BY SUM(amount) FILTER (WHERE type = 'earn') DESC) as rank
FROM point_transactions
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY user_id;

CREATE UNIQUE INDEX idx_leaderboard_weekly ON leaderboard_weekly(user_id);
```

---

## 8. 디자인 시스템

### 8.1 ZZIK Design System 2.0
```typescript
// Color Palette
const colors = {
  // Base (90% usage)
  base: {
    bg: '#08090a',
    surface: '#121314',
    elevated: '#1a1c1f',
    textPrimary: '#f5f5f5',
    textSecondary: '#a8a8a8',
    border: '#262626',
  },
  
  // Accent (10% usage)
  accent: {
    flame: '#FF6B5B',      // Primary CTA
    ember: '#CC4A3A',      // Secondary CTA
    spark: '#FFD93D',      // Premium/Leader
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#EF4444',
  },
};

// Typography
const typography = {
  fontFamily: 'var(--font-pretendard), system-ui, sans-serif',
  sizes: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem',   // 32px
  },
};

// Spacing
const spacing = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
};

// Effects
const effects = {
  liquidGlass: {
    background: 'rgba(18, 19, 20, 0.75)',
    backdropFilter: 'blur(24px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
    md: '0 4px 6px rgba(0, 0, 0, 0.5)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
  },
};
```

### 8.2 Animation Standards
```typescript
// Framer Motion Presets
const transitions = {
  spring: {
    type: 'spring',
    stiffness: 500,
    damping: 30,
  },
  easeOut: {
    type: 'tween',
    ease: 'easeOut',
    duration: 0.2,
  },
};

const variants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
  },
};
```

---

## 9. 보안 및 인증

### 9.1 인증 흐름
```yaml
Primary: Supabase Auth
  - Email/Password
  - OAuth (Google, Apple, KakaoTalk, LINE)
  - Magic Link

Session: JWT + Refresh Token
RLS: Row Level Security (모든 테이블)
```

### 9.2 보안 규칙
```typescript
// 1. API 보안
// - Rate Limiting: 100 req/min per IP
// - CSRF Protection: Double Submit Cookie
// - Input Validation: Zod schemas

// 2. 데이터 보안
// - RLS: 사용자는 자신의 데이터만 접근
// - Encryption: 민감 데이터 암호화
// - Audit Log: 주요 작업 로깅

// 3. 결제 보안
// - Idempotency: 중복 결제 방지
// - Webhook Verification: Stripe 서명 검증
// - Amount Validation: 서버 측 금액 검증
```

---

## 10. 테스트 전략

### 10.1 테스트 피라미드
```
         /\
        /  \     E2E Tests (Playwright)
       /----\    - Critical user flows
      /      \   - 10% coverage
     /--------\  
    / Integration \  Integration Tests (Vitest)
   /    Tests     \  - API endpoints
  /----------------\ - 30% coverage
 /   Unit Tests     \ Unit Tests (Vitest)
/____________________\ - Business logic
                       - 60% coverage
```

### 10.2 테스트 파일 구조
```
__tests__/
├── unit/
│   ├── lib/
│   │   ├── payment.test.ts
│   │   ├── review.test.ts
│   │   └── gamification.test.ts
│   └── components/
│       └── *.test.tsx
├── integration/
│   └── api/
│       ├── reviews.test.ts
│       ├── social.test.ts
│       └── gamification.test.ts
└── e2e/
    ├── payment-flow.spec.ts
    ├── review-flow.spec.ts
    └── social-flow.spec.ts
```

### 10.3 테스트 커버리지 목표
| 영역 | 목표 | 현재 |
|------|------|------|
| Payment | 90% | - |
| Queue | 85% | - |
| Review | 80% | - |
| Social | 75% | - |
| Gamification | 75% | - |

---

## 📌 AI 개발 가이드라인

### 코드 생성 규칙

1. **TypeScript 필수**: `any` 타입 금지, 완전한 타입 정의
2. **Dark Mode Only**: ZZIK Design System 2.0 준수
3. **i18n**: 모든 텍스트는 번역 키 사용
4. **Mobile First**: 반응형 디자인 (모바일 우선)
5. **Framer Motion**: 모든 애니메이션에 적용
6. **Error Handling**: 모든 비동기 작업에 에러 처리

### 파일 생성 시 체크리스트

- [ ] TypeScript strict mode 준수
- [ ] ESLint/Prettier 통과
- [ ] 적절한 테스트 추가
- [ ] i18n 키 추가
- [ ] 타입 export
- [ ] index.ts에 export 추가

### 커밋 메시지 규칙

```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Scopes: payment, review, social, gamification, queue, ui, api
```

---

**Last Updated**: 2025-12-09  
**Maintainer**: ZZIK AI Development Team

*ZZIK Inc. All Rights Reserved.*
