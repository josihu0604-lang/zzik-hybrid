# ZZIK API Documentation

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://zzik.app/api`

---

## Authentication

Most API endpoints require authentication via Supabase Auth. Include the auth token in headers:

```
Authorization: Bearer <supabase-access-token>
```

---

## API Endpoints

### 1. Exchange Rates `/api/exchange-rates`

Get real-time currency exchange rates.

#### GET `/api/exchange-rates`

Fetch current exchange rates with KRW as base.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| base | string | No | Base currency (default: KRW) |
| currencies | string | No | Comma-separated target currencies |

**Response:**
```json
{
  "success": true,
  "data": {
    "base": "KRW",
    "timestamp": "2024-01-15T10:30:00Z",
    "rates": {
      "USD": 0.00075,
      "JPY": 0.11,
      "EUR": 0.00069,
      "CNY": 0.0053,
      "THB": 0.026,
      "TWD": 0.024,
      "SGD": 0.001
    },
    "source": "openexchangerates",
    "cached": true
  }
}
```

#### POST `/api/exchange-rates`

Convert amount between currencies.

**Request Body:**
```json
{
  "from": "USD",
  "to": "KRW",
  "amount": 100
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "from": "USD",
    "to": "KRW",
    "amount": 100,
    "result": 133333.33,
    "rate": 1333.3333
  }
}
```

---

### 2. Geo Detection `/api/geo-detect`

Detect user's geographic location for localization.

#### GET `/api/geo-detect`

Auto-detect region from IP address or browser headers.

**Response:**
```json
{
  "success": true,
  "data": {
    "region": "KR",
    "locale": "ko",
    "currency": "KRW",
    "timezone": "Asia/Seoul",
    "detectionMethod": "cf-ipcountry"
  }
}
```

**Detection Methods:**
1. `cf-ipcountry` - Cloudflare header
2. `x-vercel-ip-country` - Vercel header
3. `timezone` - Browser timezone inference
4. `language` - Accept-Language header
5. `fallback` - Default (GLOBAL)

---

### 3. Pricing Tiers `/api/pricing/tiers`

Get VIP membership tier pricing.

#### GET `/api/pricing/tiers`

Fetch all tier pricing for a region.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| region | string | No | Region code (default: GLOBAL) |
| locale | string | No | Language for translations (default: en) |

**Supported Regions:** KR, JP, TW, CN, TH, US, EU, SEA, GLOBAL

**Response:**
```json
{
  "success": true,
  "data": {
    "region": "KR",
    "currency": "KRW",
    "locale": "ko",
    "tiers": [
      {
        "id": "free",
        "name": "무료",
        "description": "K-체험 여정을 시작하세요",
        "pricing": {
          "monthly": { "amount": 0, "currency": "KRW", "formatted": "₩0" },
          "yearly": { "amount": 0, "currency": "KRW", "formatted": "₩0", "savingsPercent": 0 }
        },
        "features": [
          { "key": "basic_verification", "label": "기본 인증" },
          { "key": "monthly_10_verifications", "label": "월 10회 인증" }
        ],
        "recommended": false
      },
      {
        "id": "gold",
        "name": "골드",
        "description": "VIP 체험 우선 접근",
        "pricing": {
          "monthly": { "amount": 19900, "currency": "KRW", "formatted": "₩19,900" },
          "yearly": { "amount": 190800, "currency": "KRW", "formatted": "₩190,800", "savingsPercent": 20 }
        },
        "features": [...],
        "recommended": true
      }
    ]
  }
}
```

#### POST `/api/pricing/tiers`

Compare pricing across regions.

**Request Body:**
```json
{
  "tier": "gold",
  "regions": ["KR", "JP", "US"],
  "period": "monthly"
}
```

---

### 4. User Preferences `/api/user/preferences`

Manage user locale/currency preferences.

#### GET `/api/user/preferences`

Get current user's preferences.

**Response (Authenticated):**
```json
{
  "success": true,
  "data": {
    "authenticated": true,
    "preferences": {
      "userId": "user-uuid",
      "region": "KR",
      "locale": "ko",
      "currency": "KRW",
      "timezone": "Asia/Seoul",
      "notifications": {
        "push": true,
        "email": true,
        "marketing": false
      },
      "theme": "system",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

**Response (Guest):**
```json
{
  "success": true,
  "data": {
    "authenticated": false,
    "preferences": {
      "region": "GLOBAL",
      "locale": "en",
      "currency": "USD",
      "timezone": "UTC",
      "notifications": { "push": true, "email": true, "marketing": false },
      "theme": "system"
    }
  }
}
```

#### PUT `/api/user/preferences`

Update user preferences.

**Request Body:**
```json
{
  "region": "JP",
  "locale": "ja",
  "theme": "dark",
  "notifications": {
    "marketing": true
  }
}
```

#### DELETE `/api/user/preferences`

Reset preferences to defaults.

---

### 5. Payment Checkout `/api/payment/checkout`

Create Stripe checkout session.

#### POST `/api/payment/checkout`

**Request Body:**
```json
{
  "tier": "gold",
  "period": "yearly",
  "region": "KR"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/...",
    "sessionId": "cs_test_..."
  }
}
```

---

### 6. Payment Webhook `/api/payment/webhook`

Handle Stripe webhook events.

**Method:** POST  
**Authentication:** Stripe signature verification

**Handled Events:**
- `checkout.session.completed` - New subscription
- `customer.subscription.updated` - Plan changes
- `customer.subscription.deleted` - Cancellation
- `invoice.payment_succeeded` - Renewal
- `invoice.payment_failed` - Failed payment

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Common Error Codes:**
| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid request parameters |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

---

## Rate Limiting

- Anonymous: 60 requests/minute
- Authenticated: 120 requests/minute
- Premium: 300 requests/minute

---

## Supported Locales

| Code | Language | Flag |
|------|----------|------|
| ko | 한국어 | 🇰🇷 |
| en | English | 🇺🇸 |
| ja | 日本語 | 🇯🇵 |
| zh-TW | 繁體中文 | 🇹🇼 |
| th | ภาษาไทย | 🇹🇭 |

---

## Supported Currencies

| Code | Currency | Symbol |
|------|----------|--------|
| KRW | Korean Won | ₩ |
| JPY | Japanese Yen | ¥ |
| USD | US Dollar | $ |
| EUR | Euro | € |
| TWD | Taiwan Dollar | NT$ |
| THB | Thai Baht | ฿ |
| CNY | Chinese Yuan | ¥ |
| SGD | Singapore Dollar | S$ |

---

## SDK Examples

### JavaScript/TypeScript

```typescript
// Fetch pricing tiers
const response = await fetch('/api/pricing/tiers?region=KR&locale=ko');
const { data } = await response.json();

// Convert currency
const conversion = await fetch('/api/exchange-rates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ from: 'USD', to: 'KRW', amount: 100 })
});

// Create checkout session
const checkout = await fetch('/api/payment/checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({ tier: 'gold', period: 'yearly', region: 'KR' })
});
const { data: { checkoutUrl } } = await checkout.json();
window.location.href = checkoutUrl;
```

---

## Changelog

### v1.0.0 (2024-01-15)
- Initial API release
- Exchange rates API
- Geo detection API
- Pricing tiers API
- User preferences API
- Payment checkout & webhook

---

*Last updated: 2024-12-08*
