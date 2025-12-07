---
name: biz-logic
description: ZZIK Popup Crowdfunding 비즈니스 로직. 참여 → 펀딩 → 오픈 → 방문 인증.
---

# ZZIK Business Logic

## Core Concept

```yaml
Tagline: '참여하면 열린다'
Problem: 좋아하는 브랜드 팝업이 왜 안 오지?
Solution: 사용자 수요 증명 → 팝업 오픈

3-Way Marketplace:
  Consumer: 참여 → 팝업 오픈 → 방문
  Brand: 검증된 수요 → 팝업 개최 → 성과 과금
  Leader: 수요 확산 → 영향력 증명 → 수익 분배
```

## Popup Funding Flow

```
[FUNDING] → [FUNDED] → [SCHEDULED] → [OPEN] → [CLOSED]
   ↓           ↓            ↓           ↓
  참여 중    목표 달성    일정 확정    운영 중     종료
```

## Progress Temperature System

```typescript
type Temperature = 'cold' | 'warm' | 'hot' | 'done';

function getTemperature(progress: number): Temperature {
  if (progress >= 100) return 'done';
  if (progress >= 70) return 'hot';
  if (progress >= 30) return 'warm';
  return 'cold';
}

// UI Response
cold: { opacity: 30%, glow: none }
warm: { opacity: 60%, glow: none }
hot:  { opacity: 100%, glow: pulse }
done: { color: green, effect: confetti }
```

## Triple Verification (방문 인증)

```
GPS Verification:     40%  (50m 반경 내)
QR Code Verification: 40%  (TOTP 30초)
Receipt Verification: 20%  (OCR + 15분)
────────────────────────────────────────
Total:               100%

Pass Condition: 60점 이상 (2/3 성공)
GPS Fallback: GPS 실패 시 QR 80%로 상향
```

## Revenue Model

```yaml
Check-in Fee (핵심):
  - 브랜드가 체크인당 ₩500-2,000 지불
  - ZZIK 수수료: 20-30%

Leader Commission:
  - Standard: 10%
  - Premium: 15%
  - VIP: 20%

Premium Data (향후):
  - 참여자 인사이트 구독
```

## Key Metrics

```yaml
Conversion Funnel:
  View → Participate: 30%+
  Participate → Fund: 80%+
  Fund → Visit: 60%+
  Visit → Verify: 90%+
```

## Critical Rules

1. **원탭 참여**: 가입 없이 Guest 참여 가능
2. **3초 체크인**: QR 스캔 → 인증 완료 3초 이내
3. **FOMO 엔진**: Progress Temperature로 긴장감
4. **신뢰 기반**: Triple Verification으로 실제 방문만 인정
