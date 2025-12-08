# ZZIK API Documentation

## Overview

ZZIK provides a comprehensive API for managing K-POP VIP experiences with global pricing support across 11 countries.

## Base URL

```
Production: https://zzik.app
Development: http://localhost:3000
```

## Authentication

Most endpoints require authentication via Supabase Auth. Include the user's session token in the Authorization header:

```
Authorization: Bearer <session_token>
```

---

## Exchange Rates API

### GET `/api/exchange-rates`

Get current exchange rates for all supported currencies.

**Query Parameters:**
- `currency` (optional): Get rate for specific currency (e.g., `THB`, `IDR`)

**Response (All Rates):**
```json
{
  "rates": {
    "USD": 1,
    "THB": 35,
    "IDR": 15800,
    "PHP": 56,
    "KZT": 450,
    "TWD": 31,
    "SGD": 1.35,
    "MYR": 4.5,
    "JPY": 146,
    "KRW": 1330,
    "CNY": 7.25
  },
  "currencies": {
    "USD": {
      "code": "USD",
      "symbol": "$",
      "name": "US Dollar",
      "decimals": 2,
      "position": "before"
    },
    "THB": {
      "code": "THB",
      "symbol": "฿",
      "name": "Thai Baht",
      "decimals": 0,
      "position": "before"
    }
    // ... other currencies
  },
  "base": "USD",
  "updatedAt": "2024-12-08T00:00:00.000Z"
}
```

**Example:**
```bash
curl https://zzik.app/api/exchange-rates
curl https://zzik.app/api/exchange-rates?currency=THB
```

---

## Geo Detection API

### GET `/api/geo-detect`

Auto-detect user's country from IP geolocation headers or browser language.

**Detection Priority:**
1. Vercel geo header (`x-vercel-ip-country`)
2. Cloudflare header (`cf-ipcountry`)
3. Accept-Language header
4. Default to `US`

**Response:**
```json
{
  "countryCode": "TH",
  "country": {
    "code": "TH",
    "name": "Thailand",
    "currency": "THB",
    "locale": "th-TH",
    "flag": "🇹🇭",
    "tier": 1
  },
  "detectionMethod": "vercel-geo"
}
```

---

## Pricing Tiers API

### GET `/api/pricing/tiers`

Get localized pricing for K-experiences with PPP adjustments.

**Query Parameters:**
- `country` (optional): Filter by country code (e.g., `TH`, `ID`)
- `type` (optional): Filter by experience type (`popup`, `hightough`, `soundcheck`, `backstage`)

**Experience Types & Base Prices (USD):**
- `popup`: $5 - Basic popup event check-in
- `hightough`: $150 - Meet & Greet with artists
- `soundcheck`: $300 - Exclusive soundcheck access
- `backstage`: $1500 - Full backstage access

**PPP Indices (100 = US baseline):**
- Thailand: 60% (40% discount)
- Indonesia: 45% (55% discount)
- Philippines: 50% (50% discount)
- Kazakhstan: 40% (60% discount)
- Taiwan: 85% (15% discount)
- Singapore: 110% (10% premium)
- Malaysia: 55% (45% discount)
- Japan: 105% (5% premium)
- South Korea: 90% (10% discount)
- USA: 100% (no adjustment)
- China: 55% (45% discount)

---

## K-Experience API

### GET `/api/k-experience`

List K-experiences with filtering and sorting.

**Query Parameters:**
- `type`: Filter by type (`hightough`, `soundcheck`, `backstage`, `popup`)
- `country`: Filter by country code
- `artist`: Search by artist name (case-insensitive)
- `status`: Filter by status (`upcoming`, `ongoing`, `closed`)
- `sort`: Sort by (`deadline`, `popular`, `latest`, `price`)
- `limit`: Number of results (default: 20, max: 100)
- `offset`: Pagination offset (default: 0)

### POST `/api/k-experience`

Create a new K-experience (Admin only).

**Authentication:** Required (Admin role)

### GET `/api/k-experience/[id]`

Get details for a specific K-experience.

### PATCH `/api/k-experience/[id]`

Update a K-experience (Admin only).

### DELETE `/api/k-experience/[id]`

Delete a K-experience (Admin only).

---

## Supported Countries & Currencies

| Country | Code | Currency | Symbol | Tier |
|---------|------|----------|--------|------|
| USA | US | USD | $ | 3 |
| Thailand | TH | THB | ฿ | 1A |
| Indonesia | ID | IDR | Rp | 1A |
| Philippines | PH | PHP | ₱ | 1A |
| Kazakhstan | KZ | KZT | ₸ | 1B |
| Taiwan | TW | TWD | NT$ | 2 |
| Singapore | SG | SGD | S$ | 2 |
| Malaysia | MY | MYR | RM | 2 |
| Japan | JP | JPY | ¥ | 3 |
| South Korea | KR | KRW | ₩ | 3 |
| China | CN | CNY | ¥ | 4 |

---

## Error Handling

All endpoints return errors in the following format:

```json
{
  "error": "Error message"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error
