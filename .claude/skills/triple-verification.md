---
name: triple-verification
description: ZZIK Triple Verification (GPS 40% + QR 40% + Receipt 20%) 방문 인증 시스템
---

# Triple Verification System

## Context

```
펀딩 목표 달성 → 팝업 오픈 확정 → 실제 방문 인증 ← HERE
"찍으면 진짜" - 실제 방문만 인정
```

## Weight Distribution

```
GPS Verification:     40%
QR Code Verification: 40%
Receipt Verification: 20%
────────────────────────
Total:               100%

Pass Condition: 60점 이상 (2/3 성공)
```

## GPS Verification (40%)

### Rules

```typescript
const GPS_CONFIG = {
  MAX_ACCURACY: 50,      // 50m 이하만 유효
  GEOFENCE_DEFAULT: 50,  // 기본 반경 50m
};

// PDOP (Position Dilution of Precision)
PDOP <= 3: "excellent" (정상 반경)
PDOP <= 6: "good" (정상 반경)
PDOP > 6:  "poor" (반경 * 0.7)
```

### Fallback

```typescript
// GPS 정확도 낮을 때 (강남 빌딩숲)
if (accuracy > 50 && qrVerified) {
  qrWeight = 80; // 40 → 80
  gpsWeight = 0; // 40 → 0
}
```

### Distance Calculation

```typescript
// Haversine formula
function getDistance(lat1, lon1, lat2, lon2): number {
  const R = 6371e3; // Earth radius in meters
  // ... Haversine implementation
}
```

## QR Verification (40%)

### TOTP (Time-based One-Time Password)

```typescript
const TOTP_CONFIG = {
  WINDOW: 30000,  // 30초마다 변경
  TOLERANCE: 1,   // ±1 윈도우 허용 (총 90초)
};

// QR 포맷
Dynamic: 6자리 TOTP 코드
Static: ZZIK-POPUP-{ID}-QR (fallback)
```

### Store Display

```typescript
// 매장 측 QR 표시 (30초마다 갱신)
const code = generateTOTP(popupSecret);
const expiresIn = getNextRefreshTime();
```

## Receipt Verification (20%)

### OCR Process

```typescript
const RECEIPT_CONFIG = {
  TIME_WINDOW: 15 * 60 * 1000, // 15분
};

// Gemini Vision OCR Flow
1. 사진 촬영/갤러리 선택
2. Gemini Vision API 호출
3. 매장명/브랜드명 추출
4. 금액 추출 (optional)
5. 시간 검증 (±15분)
```

### Validation

```typescript
// 1. 매장명 포함 확인
normalizedReceipt.includes(normalizedBrand)

// 2. 시간 검증
|checkInTime - receiptTime| <= 15분
```

## Trust Score

```typescript
function calculateTrustScore(history: number, fraud: number): number {
  if (history === 0) return 1.0;

  const fraudRate = fraud / history;

  if (fraudRate > 0.2) return 0.8; // 패널티
  if (fraudRate < 0.05 && history >= 10) return 1.2; // 보너스
  if (history >= 5) return 1.1;

  return 1.0;
}

// Final Score
finalScore = baseScore * trustScore * (timingValid ? 1 : 0.8);
```

## API Usage

### Request

```typescript
POST /api/checkin
{
  popupId: "popup-001",
  userLat: 37.5172,
  userLng: 127.0473,
  userGpsAccuracy: 15,
  scannedQrCode: "123456",
  receiptText: "브랜드명...",
  receiptAmount: 15000
}
```

### Response

```typescript
{
  success: true,
  checkIn: {
    id: "checkin-001",
    gps_verified: true,
    qr_verified: true,
    receipt_verified: false,
    total_score: 80,
    passed: true,
    badge: "찍음"
  }
}
```

## Error Handling

```typescript
GPS_ERRORS = {
  PERMISSION_DENIED: '위치 권한이 필요합니다',
  LOW_ACCURACY: 'GPS 정확도가 낮습니다. QR 스캔을 시도해주세요',
};

QR_ERRORS = {
  INVALID_CODE: '잘못된 QR 코드입니다',
  EXPIRED: '만료된 QR 코드입니다',
};
```

## Key Files

```
src/lib/verification.ts       - Core logic
src/lib/geo.ts               - Haversine
src/app/api/checkin/route.ts - API
src/components/checkin/      - UI
```
