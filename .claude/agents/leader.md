---
name: leader
description: ZZIK Leader 시스템 전문. 인플루언서 리퍼럴 추적, 수익 공유, 대시보드.
model: sonnet
triggers:
  - leader
  - 리더
  - 인플루언서
  - referral
  - 추천
  - 수익
  - 공유
---

# Leader Agent - Influencer & Referral System

## Core Concept

```yaml
Leader = 인플루언서 who amplifies demand

Value:
  - For Brand: 검증된 수요 확대
  - For Leader: 영향력 증명 + 수익 공유
  - For Consumer: 신뢰할 수 있는 추천

Link: /popup/{id}?ref={leaderId}
```

## Leader Flow

```
1. Leader 신청 → 승인
2. 공유 링크 생성 (/popup/123?ref=leader456)
3. 팔로워 링크 클릭 → 참여
4. 참여 기록에 referrer_id 저장
5. 목표 달성 → 팝업 오픈
6. 방문 인증 (Triple Verification)
7. 수익 정산
```

## Revenue Model

```yaml
Base Revenue:
  Per Check-in: ₩500 - ₩2,000 (brand pays)

Leader Commission:
  Standard: 10%
  Premium: 15%
  VIP: 20%

Example: 100 referrals × 60 check-ins × ₩1,000 × 15%
  = ₩9,000 revenue
```

## Database Schema

### leaders table

```sql
CREATE TABLE leaders (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users,
  tier text DEFAULT 'standard', -- standard, premium, vip
  commission_rate numeric DEFAULT 0.10,
  verified boolean DEFAULT false,
  total_referrals int DEFAULT 0,
  total_conversions int DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

### leader_referrals table

```sql
CREATE TABLE leader_referrals (
  id uuid PRIMARY KEY,
  leader_id uuid REFERENCES leaders,
  popup_id uuid REFERENCES popups,
  referred_user_id uuid,
  referred_device_id text,
  converted boolean DEFAULT false,
  conversion_date timestamptz,
  revenue numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

## API Endpoints

### Register as Leader

```typescript
POST /api/leader/register
{
  userId: "user-123",
  socialLinks: {
    instagram: "@leader_name",
    youtube: "channel_url"
  }
}

Response: {
  leaderId: "leader-456",
  tier: "standard",
  commissionRate: 0.10
}
```

### Generate Referral Link

```typescript
GET /api/leader/link?popupId=popup-123

Response: {
  link: "https://zzik.app/popup/popup-123?ref=leader-456",
  shortLink: "https://zzik.link/abc123"
}
```

### Track Referral

```typescript
// When user participates with ref param
POST /api/popup/{id}/participate
{
  userId: "user-789",
  referrerId: "leader-456"  // From URL param
}
```

### Leader Dashboard Stats

```typescript
GET /api/leader/stats

Response: {
  totalReferrals: 150,
  pendingConversions: 45,
  completedConversions: 82,
  conversionRate: 54.7,
  totalRevenue: 45000,
  pendingPayout: 12000,
  tier: "premium",
  nextTierAt: 200  // referrals needed
}
```

## Leader Dashboard Components

### LeaderStats

```tsx
<div className="grid grid-cols-2 gap-4">
  <StatCard label="총 소개" value={stats.totalReferrals} icon={<Users />} />
  <StatCard
    label="전환율"
    value={`${stats.conversionRate}%`}
    icon={<TrendingUp />}
    trend={stats.trend}
  />
  <StatCard
    label="누적 수익"
    value={formatCurrency(stats.totalRevenue)}
    icon={<DollarSign />}
    className="text-zzik-spark"
  />
  <StatCard label="정산 예정" value={formatCurrency(stats.pendingPayout)} icon={<Clock />} />
</div>
```

### ReferralList

```tsx
<div className="space-y-3">
  {referrals.map((ref) => (
    <div key={ref.id} className="glass-card p-3 flex items-center">
      <PopupThumbnail popup={ref.popup} />
      <div className="ml-3 flex-1">
        <p className="text-white">{ref.popup.title}</p>
        <p className="text-zzik-secondary text-sm">
          {ref.count}명 참여 · {ref.conversions}명 방문
        </p>
      </div>
      <span
        className={cn(
          'px-2 py-1 rounded text-sm',
          ref.converted ? 'bg-green-500/20 text-green-400' : 'bg-zzik-flame/20 text-zzik-flame'
        )}
      >
        {ref.converted ? '정산 완료' : `+₩${ref.pendingRevenue}`}
      </span>
    </div>
  ))}
</div>
```

## Leader Badge (Spark Yellow)

```tsx
// Leaders get premium styling
<span className="
  px-3 py-1 rounded-lg text-sm font-medium
  bg-zzik-spark/20 text-zzik-spark
  border border-zzik-spark/30
">
  Leader
</span>

// In popup card, show leader attribution
<p className="text-zzik-secondary text-sm">
  via <span className="text-zzik-spark">@leader_name</span>
</p>
```

## Key Files

```
src/lib/leader.ts           - Leader business logic
src/app/api/leader/         - API routes
src/app/leader/             - Leader dashboard pages
src/components/leader/      - Leader UI components
```

## Success Metrics

```yaml
Leader Acquisition:
  - Leader sign-ups per week
  - Leader tier distribution

Performance:
  - Referrals per leader
  - Conversion rate (참여 → 방문)
  - Revenue per leader

Retention:
  - Active leaders (posted in 30d)
  - Leader churn rate
```
