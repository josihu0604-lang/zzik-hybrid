# 🚀 ZZIK Wave 2 Development Plan

> **Version**: 2.0
> **Created**: 2025-12-09
> **Timeline**: 6 Weeks (Week 1-6)
> **Target**: Production-Ready Global K-Experience Platform

---

## 📋 Executive Summary

Wave 2 transforms ZZIK from a basic booking platform to a full-featured **K-Experience Super App** with:
- 📅 **Real-time Reservation System** with queue management
- 💳 **Multi-Payment Gateway** (Stripe, Z-Pay, Digital Wallets)
- ⭐ **Review & Rating System** with AI analysis
- 👥 **Social Features** (Friends, Groups, Sharing)
- 🎮 **Gamification** (Points, Badges, Leaderboards)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     ZZIK Wave 2 Architecture                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Next.js 15     │  │  Supabase       │  │  Redis      │ │
│  │  App Router     │  │  PostgreSQL     │  │  (Queue)    │ │
│  │  + API Routes   │  │  + RLS          │  │             │ │
│  └────────┬────────┘  └────────┬────────┘  └──────┬──────┘ │
│           │                    │                   │        │
│  ┌────────┴────────────────────┴───────────────────┴──────┐ │
│  │                    API Gateway Layer                    │ │
│  │  Rate Limiting │ Auth │ Validation │ Caching           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Payment  │ │ Queue    │ │ Review   │ │ Social   │      │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 External Integrations                │  │
│  │  Stripe │ Z-Pay │ KakaoPay │ LinePay │ GCash        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📅 Sprint Timeline

### Sprint 1 (Week 1-2): Advanced Reservation System

**Goal**: Real-time queue with DB persistence

#### Tasks

| ID | Task | Priority | Hours | Assignee |
|----|------|----------|-------|----------|
| RS-001 | Create `restaurant_queues` table migration | P0 | 4h | Backend |
| RS-002 | Create `queue_history` table migration | P0 | 2h | Backend |
| RS-003 | Implement queue persistence API | P0 | 8h | Backend |
| RS-004 | Create `/api/queue/join` endpoint | P0 | 4h | Backend |
| RS-005 | Create `/api/queue/leave` endpoint | P0 | 2h | Backend |
| RS-006 | Create `/api/queue/status` endpoint | P0 | 2h | Backend |
| RS-007 | Create `/api/queue/call-next` endpoint | P0 | 4h | Backend |
| RS-008 | Enhance SSE with DB sync | P0 | 8h | Backend |
| RS-009 | Create `QueueDashboard` component | P1 | 8h | Frontend |
| RS-010 | Create `QueueTicket` component | P1 | 4h | Frontend |
| RS-011 | Create `WaitlistManager` component | P1 | 6h | Frontend |
| RS-012 | Implement queue notifications | P1 | 6h | Full Stack |
| RS-013 | Unit tests for queue system | P1 | 8h | QA |
| RS-014 | E2E tests for queue flow | P2 | 6h | QA |

**Deliverables**:
- [ ] Queue entries persist to database
- [ ] Real-time position updates via SSE
- [ ] Queue management dashboard for restaurants
- [ ] Customer queue ticket with ETA

#### Database Schema

```sql
-- File: supabase/migrations/20251209_create_queue_system.sql

-- Restaurant queue configuration
CREATE TABLE restaurant_queue_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  max_queue_size INTEGER DEFAULT 100,
  avg_wait_per_party INTEGER DEFAULT 15, -- minutes
  auto_call_enabled BOOLEAN DEFAULT false,
  working_hours JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active queue entries
CREATE TABLE queue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  guest_name TEXT,
  phone_number TEXT,
  party_size INTEGER NOT NULL CHECK (party_size > 0 AND party_size <= 20),
  position INTEGER NOT NULL,
  estimated_wait_minutes INTEGER,
  estimated_seating_time TIMESTAMPTZ,
  status queue_entry_status DEFAULT 'waiting',
  special_requests TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  called_at TIMESTAMPTZ,
  seated_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  no_show_at TIMESTAMPTZ,
  
  CONSTRAINT unique_active_queue_entry UNIQUE (restaurant_id, user_id, status)
  WHERE status = 'waiting'
);

CREATE TYPE queue_entry_status AS ENUM (
  'waiting', 'called', 'seated', 'cancelled', 'no_show', 'expired'
);

-- Queue history for analytics
CREATE TABLE queue_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_entry_id UUID REFERENCES queue_entries(id),
  restaurant_id UUID NOT NULL,
  user_id UUID,
  party_size INTEGER,
  wait_duration_minutes INTEGER,
  final_status queue_entry_status,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_queue_entries_restaurant ON queue_entries(restaurant_id, status);
CREATE INDEX idx_queue_entries_user ON queue_entries(user_id);
CREATE INDEX idx_queue_history_restaurant ON queue_history(restaurant_id, created_at);

-- RLS Policies
ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own queue entries"
  ON queue_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can join queue"
  ON queue_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel their queue entry"
  ON queue_entries FOR UPDATE
  USING (auth.uid() = user_id AND status = 'waiting')
  WITH CHECK (status = 'cancelled');
```

---

### Sprint 2 (Week 2-3): Payment Integration

**Goal**: Multi-gateway payment system

#### Tasks

| ID | Task | Priority | Hours | Assignee |
|----|------|----------|-------|----------|
| PAY-001 | Z-Pay SDK integration research | P0 | 4h | Backend |
| PAY-002 | Create Z-Pay payment module | P0 | 16h | Backend |
| PAY-003 | Create `/api/zpay/checkout` endpoint | P0 | 6h | Backend |
| PAY-004 | Create `/api/zpay/webhook` endpoint | P0 | 6h | Backend |
| PAY-005 | Create `PaymentMethodSelector` component | P0 | 8h | Frontend |
| PAY-006 | Digital wallet balance system | P1 | 12h | Full Stack |
| PAY-007 | Create `/api/wallet/topup` endpoint | P1 | 4h | Backend |
| PAY-008 | Create `/api/wallet/withdraw` endpoint | P1 | 4h | Backend |
| PAY-009 | Create `WalletDashboard` component | P1 | 8h | Frontend |
| PAY-010 | Payment history tracking | P1 | 6h | Backend |
| PAY-011 | Refund processing system | P1 | 8h | Backend |
| PAY-012 | Payment gateway failover | P2 | 6h | Backend |
| PAY-013 | Unit tests for payment | P1 | 8h | QA |
| PAY-014 | Integration tests with Stripe test mode | P1 | 6h | QA |

**Deliverables**:
- [ ] Z-Pay integration for Korea market
- [ ] Digital wallet with balance management
- [ ] Multiple payment methods in checkout
- [ ] Payment history and receipts

#### Payment Flow

```typescript
// File: src/lib/payment/payment-gateway.ts

export interface PaymentGateway {
  name: string;
  supportedCurrencies: Currency[];
  supportedCountries: CountryCode[];
  
  createPaymentIntent(params: PaymentIntentParams): Promise<PaymentIntent>;
  confirmPayment(intentId: string): Promise<PaymentResult>;
  refund(chargeId: string, amount?: number): Promise<RefundResult>;
  handleWebhook(payload: string, signature: string): Promise<WebhookEvent>;
}

export const PaymentGateways: Record<string, PaymentGateway> = {
  stripe: new StripeGateway(),
  zpay: new ZPayGateway(),
  kakaopay: new KakaoPayGateway(), // Future
  linepay: new LinePayGateway(),   // Future
};

export async function processPayment(
  amount: number,
  currency: Currency,
  country: CountryCode,
  preferredGateway?: string
): Promise<PaymentResult> {
  // Select best gateway for country/currency
  const gateway = selectGateway(currency, country, preferredGateway);
  
  const intent = await gateway.createPaymentIntent({
    amount,
    currency,
    metadata: { /* ... */ },
  });
  
  return intent;
}

function selectGateway(
  currency: Currency,
  country: CountryCode,
  preferred?: string
): PaymentGateway {
  // Korea: Z-Pay preferred
  if (country === 'KR' && currency === 'KRW') {
    return PaymentGateways.zpay || PaymentGateways.stripe;
  }
  
  // Japan: Stripe or LinePay
  if (country === 'JP') {
    return PaymentGateways.stripe;
  }
  
  // Default to Stripe
  return PaymentGateways.stripe;
}
```

---

### Sprint 3 (Week 3-4): Review System

**Goal**: Full-featured review & rating system

#### Tasks

| ID | Task | Priority | Hours | Assignee |
|----|------|----------|-------|----------|
| REV-001 | Create `reviews` table migration | P0 | 4h | Backend |
| REV-002 | Create `review_photos` table migration | P0 | 2h | Backend |
| REV-003 | Create `review_votes` table migration | P0 | 2h | Backend |
| REV-004 | Create `/api/reviews` CRUD endpoints | P0 | 8h | Backend |
| REV-005 | Create `/api/reviews/[id]/vote` endpoint | P1 | 3h | Backend |
| REV-006 | Photo upload to Supabase Storage | P0 | 6h | Backend |
| REV-007 | AI sentiment analysis integration | P2 | 12h | Backend |
| REV-008 | Create `ReviewCard` component | P0 | 6h | Frontend |
| REV-009 | Create `ReviewForm` component | P0 | 8h | Frontend |
| REV-010 | Create `ReviewList` with filters | P1 | 6h | Frontend |
| REV-011 | Create `PhotoGallery` component | P1 | 6h | Frontend |
| REV-012 | Review moderation system | P2 | 8h | Backend |
| REV-013 | Unit tests for reviews | P1 | 6h | QA |

**Deliverables**:
- [ ] Users can write reviews with photos
- [ ] Rating aggregation on experiences
- [ ] Helpful/unhelpful voting
- [ ] AI-powered sentiment analysis

#### Database Schema

```sql
-- File: supabase/migrations/20251209_create_review_system.sql

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  experience_id UUID REFERENCES k_experiences(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id),
  
  -- Rating
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
  atmosphere_rating INTEGER CHECK (atmosphere_rating >= 1 AND atmosphere_rating <= 5),
  
  -- Content
  title TEXT,
  content TEXT NOT NULL CHECK (char_length(content) >= 10),
  
  -- AI Analysis
  sentiment_score DECIMAL(3,2), -- -1.00 to 1.00
  sentiment_label TEXT, -- 'positive', 'neutral', 'negative'
  extracted_keywords TEXT[],
  
  -- Metadata
  is_verified_purchase BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  unhelpful_count INTEGER DEFAULT 0,
  report_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT one_review_per_booking UNIQUE (user_id, booking_id)
);

CREATE TABLE review_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'unhelpful', 'report')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE (review_id, user_id, vote_type)
);

-- Indexes
CREATE INDEX idx_reviews_experience ON reviews(experience_id, created_at DESC);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(overall_rating);
CREATE INDEX idx_review_photos_review ON review_photos(review_id);

-- Trigger to update helpful_count
CREATE OR REPLACE FUNCTION update_review_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'helpful' THEN
      UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
    ELSIF NEW.vote_type = 'unhelpful' THEN
      UPDATE reviews SET unhelpful_count = unhelpful_count + 1 WHERE id = NEW.review_id;
    ELSIF NEW.vote_type = 'report' THEN
      UPDATE reviews SET report_count = report_count + 1 WHERE id = NEW.review_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'helpful' THEN
      UPDATE reviews SET helpful_count = helpful_count - 1 WHERE id = OLD.review_id;
    ELSIF OLD.vote_type = 'unhelpful' THEN
      UPDATE reviews SET unhelpful_count = unhelpful_count - 1 WHERE id = OLD.review_id;
    ELSIF OLD.vote_type = 'report' THEN
      UPDATE reviews SET report_count = report_count - 1 WHERE id = OLD.review_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_vote_count_trigger
AFTER INSERT OR DELETE ON review_votes
FOR EACH ROW EXECUTE FUNCTION update_review_vote_counts();
```

---

### Sprint 4 (Week 4-5): Social Features

**Goal**: Friend system and social sharing

#### Tasks

| ID | Task | Priority | Hours | Assignee |
|----|------|----------|-------|----------|
| SOC-001 | Create `friendships` table migration | P0 | 3h | Backend |
| SOC-002 | Create `friend_requests` table migration | P0 | 2h | Backend |
| SOC-003 | Create `/api/friends` endpoints | P0 | 8h | Backend |
| SOC-004 | Create `/api/friends/requests` endpoints | P0 | 6h | Backend |
| SOC-005 | Create `booking_groups` table migration | P1 | 4h | Backend |
| SOC-006 | Create `/api/groups` endpoints | P1 | 8h | Backend |
| SOC-007 | Create `FriendsList` component | P0 | 6h | Frontend |
| SOC-008 | Create `FriendRequestCard` component | P0 | 4h | Frontend |
| SOC-009 | Create `ShareModal` component | P1 | 6h | Frontend |
| SOC-010 | Create `GroupBookingFlow` component | P1 | 12h | Frontend |
| SOC-011 | Social share deep links | P1 | 6h | Full Stack |
| SOC-012 | Activity feed for friends | P2 | 10h | Full Stack |
| SOC-013 | Unit tests for social | P1 | 6h | QA |

**Deliverables**:
- [ ] Send/accept friend requests
- [ ] View friends' activities
- [ ] Share experiences to social media
- [ ] Group booking with invite links

#### Database Schema

```sql
-- File: supabase/migrations/20251209_create_social_system.sql

CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status friendship_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  
  CONSTRAINT unique_friendship UNIQUE (user_id, friend_id),
  CONSTRAINT no_self_friendship CHECK (user_id != friend_id)
);

CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'blocked');

CREATE TABLE booking_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  experience_id UUID REFERENCES k_experiences(id),
  booking_date TIMESTAMPTZ,
  max_members INTEGER DEFAULT 10,
  current_members INTEGER DEFAULT 1,
  invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'base64'),
  status group_status DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE group_status AS ENUM ('open', 'closed', 'confirmed', 'cancelled');

CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES booking_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role member_role DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE (group_id, user_id)
);

CREATE TYPE member_role AS ENUM ('creator', 'admin', 'member');

CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  target_type TEXT, -- 'experience', 'review', 'booking', 'badge'
  target_id UUID,
  metadata JSONB,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE activity_type AS ENUM (
  'booking_made', 'review_posted', 'badge_earned',
  'friend_added', 'group_created', 'experience_shared'
);

-- Indexes
CREATE INDEX idx_friendships_user ON friendships(user_id, status);
CREATE INDEX idx_friendships_friend ON friendships(friend_id, status);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_activity_feed_user ON activity_feed(user_id, created_at DESC);
```

---

### Sprint 5 (Week 5-6): Gamification

**Goal**: Points, badges, and leaderboards

#### Tasks

| ID | Task | Priority | Hours | Assignee |
|----|------|----------|-------|----------|
| GAM-001 | Create `user_points` table migration | P0 | 3h | Backend |
| GAM-002 | Create `achievements` table migration | P0 | 3h | Backend |
| GAM-003 | Create `leaderboards` table migration | P0 | 3h | Backend |
| GAM-004 | Create points calculation service | P0 | 8h | Backend |
| GAM-005 | Create `/api/points` endpoints | P0 | 6h | Backend |
| GAM-006 | Create `/api/achievements` endpoints | P1 | 6h | Backend |
| GAM-007 | Create `/api/leaderboard` endpoints | P1 | 6h | Backend |
| GAM-008 | Achievement trigger system | P0 | 10h | Backend |
| GAM-009 | Create `PointsDisplay` component | P0 | 4h | Frontend |
| GAM-010 | Create `AchievementCard` component | P0 | 6h | Frontend |
| GAM-011 | Create `Leaderboard` component | P1 | 8h | Frontend |
| GAM-012 | Create `LevelProgress` component | P1 | 4h | Frontend |
| GAM-013 | Achievement notifications | P1 | 6h | Full Stack |
| GAM-014 | Weekly/Monthly challenges | P2 | 12h | Full Stack |
| GAM-015 | Unit tests for gamification | P1 | 6h | QA |

**Deliverables**:
- [ ] Points earned for activities
- [ ] Achievement badges with progress tracking
- [ ] Global and regional leaderboards
- [ ] Level system with tiers

#### Gamification System

```typescript
// File: src/lib/gamification/points.ts

export const POINT_VALUES = {
  // Bookings
  BOOKING_COMPLETE: 100,
  BOOKING_FIRST: 500, // First-time bonus
  BOOKING_VIP: 200,   // VIP experience bonus
  
  // Reviews
  REVIEW_POSTED: 50,
  REVIEW_WITH_PHOTO: 75,
  REVIEW_HELPFUL_VOTE: 10,
  
  // Social
  FRIEND_INVITED: 100,
  GROUP_CREATED: 50,
  EXPERIENCE_SHARED: 25,
  
  // Engagement
  DAILY_LOGIN: 10,
  STREAK_7_DAYS: 100,
  STREAK_30_DAYS: 500,
  
  // Check-in
  CHECKIN_VERIFIED: 150,
  CHECKIN_GPS_BONUS: 50,
};

export const LEVEL_THRESHOLDS = [
  { level: 1, name: 'Rookie', minPoints: 0, maxPoints: 499 },
  { level: 2, name: 'Explorer', minPoints: 500, maxPoints: 1499 },
  { level: 3, name: 'Enthusiast', minPoints: 1500, maxPoints: 3999 },
  { level: 4, name: 'Expert', minPoints: 4000, maxPoints: 9999 },
  { level: 5, name: 'Master', minPoints: 10000, maxPoints: 24999 },
  { level: 6, name: 'Legend', minPoints: 25000, maxPoints: Infinity },
];

export const ACHIEVEMENTS = [
  // Booking achievements
  { id: 'first_booking', name: 'First Steps', description: 'Make your first booking', condition: 'bookings >= 1', points: 500 },
  { id: 'booking_5', name: 'Regular', description: 'Complete 5 bookings', condition: 'bookings >= 5', points: 1000 },
  { id: 'booking_25', name: 'Dedicated Fan', description: 'Complete 25 bookings', condition: 'bookings >= 25', points: 2500 },
  { id: 'vip_experience', name: 'VIP Treatment', description: 'Book a VIP experience', condition: 'vip_bookings >= 1', points: 750 },
  
  // Review achievements
  { id: 'first_review', name: 'Voice Heard', description: 'Write your first review', condition: 'reviews >= 1', points: 300 },
  { id: 'helpful_10', name: 'Helpful Guide', description: 'Get 10 helpful votes', condition: 'helpful_votes >= 10', points: 500 },
  { id: 'photo_pro', name: 'Photo Pro', description: 'Upload 50 review photos', condition: 'review_photos >= 50', points: 1000 },
  
  // Social achievements
  { id: 'social_butterfly', name: 'Social Butterfly', description: 'Add 10 friends', condition: 'friends >= 10', points: 500 },
  { id: 'group_leader', name: 'Group Leader', description: 'Create 5 group bookings', condition: 'groups_created >= 5', points: 750 },
  
  // Streak achievements
  { id: 'streak_7', name: 'Week Warrior', description: '7-day login streak', condition: 'streak >= 7', points: 300 },
  { id: 'streak_30', name: 'Monthly Master', description: '30-day login streak', condition: 'streak >= 30', points: 1000 },
];
```

#### Database Schema

```sql
-- File: supabase/migrations/20251209_create_gamification_system.sql

CREATE TABLE user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  source_type TEXT, -- 'booking', 'review', 'social', 'achievement'
  source_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  target INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE (user_id, achievement_id)
);

CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  period TEXT NOT NULL, -- 'weekly', 'monthly', 'all_time'
  period_start DATE,
  period_end DATE,
  points INTEGER DEFAULT 0,
  rank INTEGER,
  region TEXT, -- Optional for regional leaderboards
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE (user_id, period, period_start)
);

-- Function to update user level
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.level := CASE
    WHEN NEW.total_points >= 25000 THEN 6
    WHEN NEW.total_points >= 10000 THEN 5
    WHEN NEW.total_points >= 4000 THEN 4
    WHEN NEW.total_points >= 1500 THEN 3
    WHEN NEW.total_points >= 500 THEN 2
    ELSE 1
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_level_trigger
BEFORE UPDATE ON user_points
FOR EACH ROW
WHEN (OLD.total_points IS DISTINCT FROM NEW.total_points)
EXECUTE FUNCTION update_user_level();

-- Indexes
CREATE INDEX idx_point_transactions_user ON point_transactions(user_id, created_at DESC);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_leaderboards_period ON leaderboards(period, period_start, rank);
```

---

## 📊 Resource Requirements

### Team Structure

| Role | Count | Focus |
|------|-------|-------|
| Backend Developer | 2 | APIs, DB, Integrations |
| Frontend Developer | 2 | Components, UX |
| Full Stack Developer | 1 | Queue System, Real-time |
| DevOps Engineer | 1 | Infrastructure, CI/CD |
| QA Engineer | 1 | Testing, Quality |
| Product Manager | 1 | Coordination |

### Infrastructure

| Service | Purpose | Estimated Cost/Month |
|---------|---------|---------------------|
| Supabase Pro | Database, Auth | $25 |
| Vercel Pro | Hosting | $20 |
| Redis (Upstash) | Queue, Cache | $10 |
| Stripe | Payments | % of transactions |
| Sentry | Monitoring | $26 |
| **Total** | | **~$81/month** |

---

## 🎯 Success Metrics

### Sprint 1 (Reservation)
- [ ] Queue wait time accuracy: ±5 minutes
- [ ] SSE connection stability: 99.5%
- [ ] Queue join-to-seated flow: < 3 clicks

### Sprint 2 (Payment)
- [ ] Payment success rate: > 98%
- [ ] Checkout completion: < 2 minutes
- [ ] Gateway failover: < 5 seconds

### Sprint 3 (Reviews)
- [ ] Review submission rate: +30%
- [ ] Photo upload success: > 95%
- [ ] Average review length: > 50 chars

### Sprint 4 (Social)
- [ ] Friend request acceptance: > 60%
- [ ] Group booking conversion: > 40%
- [ ] Share-to-booking rate: > 5%

### Sprint 5 (Gamification)
- [ ] DAU increase: +25%
- [ ] Retention (7-day): +15%
- [ ] Achievement completion: > 30%

---

## 🚨 Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Z-Pay integration delays | Medium | High | Stripe fallback ready |
| SSE scaling issues | Medium | High | Redis pub/sub backup |
| Database performance | Low | High | Indexes, materialized views |
| i18n gaps | Medium | Medium | Automated translation QA |
| Payment compliance | Low | High | Legal review, PCI compliance |

---

## 📁 File Structure (New Files)

```
src/
├── app/
│   └── api/
│       ├── queue/
│       │   ├── route.ts              # GET queue, POST join
│       │   ├── [entryId]/route.ts    # PATCH update, DELETE cancel
│       │   └── stream/route.ts       # SSE endpoint (enhanced)
│       ├── reviews/
│       │   ├── route.ts              # GET list, POST create
│       │   └── [id]/
│       │       ├── route.ts          # GET, PATCH, DELETE
│       │       └── vote/route.ts     # POST vote
│       ├── friends/
│       │   ├── route.ts              # GET list, POST add
│       │   ├── [id]/route.ts         # DELETE remove
│       │   └── requests/route.ts     # GET/POST requests
│       ├── groups/
│       │   ├── route.ts              # GET list, POST create
│       │   ├── [id]/route.ts         # GET, PATCH, DELETE
│       │   ├── [id]/join/route.ts    # POST join via invite
│       │   └── [id]/members/route.ts # GET members
│       ├── points/
│       │   ├── route.ts              # GET user points
│       │   └── history/route.ts      # GET transaction history
│       ├── achievements/
│       │   └── route.ts              # GET user achievements
│       ├── leaderboard/
│       │   └── route.ts              # GET leaderboard
│       └── zpay/
│           ├── checkout/route.ts     # POST create checkout
│           └── webhook/route.ts      # POST handle webhook
├── components/
│   ├── queue/
│   │   ├── QueueDashboard.tsx
│   │   ├── QueueTicket.tsx
│   │   ├── WaitlistManager.tsx
│   │   └── QueueStatusCard.tsx
│   ├── reviews/
│   │   ├── ReviewCard.tsx
│   │   ├── ReviewForm.tsx
│   │   ├── ReviewList.tsx
│   │   ├── PhotoGallery.tsx
│   │   └── RatingStars.tsx
│   ├── social/
│   │   ├── FriendsList.tsx
│   │   ├── FriendRequestCard.tsx
│   │   ├── ShareModal.tsx
│   │   ├── GroupBookingFlow.tsx
│   │   └── ActivityFeed.tsx
│   └── gamification/
│       ├── PointsDisplay.tsx
│       ├── AchievementCard.tsx
│       ├── AchievementGrid.tsx
│       ├── Leaderboard.tsx
│       ├── LevelProgress.tsx
│       └── StreakCounter.tsx
├── lib/
│   ├── payment/
│   │   ├── payment-gateway.ts        # Multi-gateway abstraction
│   │   └── zpay.ts                   # Z-Pay integration
│   ├── gamification/
│   │   ├── points.ts                 # Points calculation
│   │   ├── achievements.ts           # Achievement logic
│   │   └── leaderboard.ts            # Leaderboard queries
│   └── social/
│       ├── friends.ts                # Friend operations
│       └── groups.ts                 # Group operations
└── stores/
    ├── friends-store.ts              # Zustand friend state
    ├── points-store.ts               # Zustand points state
    └── achievements-store.ts         # Zustand achievements state
```

---

## 📅 Delivery Timeline

```
Week 1  [████████░░░░░░░░░░░░░░░░] 35% - Queue System Foundation
Week 2  [████████████████░░░░░░░░] 65% - Queue + Payment Start
Week 3  [████████████████████░░░░] 80% - Payment + Reviews Start
Week 4  [████████████████████████] 90% - Reviews + Social Start
Week 5  [████████████████████████] 95% - Social + Gamification
Week 6  [████████████████████████] 100% - Gamification + QA + Launch
```

---

**Document Version**: 2.0
**Last Updated**: 2025-12-09
**Owner**: ZZIK Development Team

---

_ZZIK Wave 2 - Building the Future of K-Experience_
