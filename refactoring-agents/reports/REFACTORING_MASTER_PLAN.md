# 🔧 Project U-100 Frontend Refactoring Master Plan
## 8-Agent System 기반 프론트엔드 재설계 로드맵

> **"566개 파일을 3-Pillar (Pay/Play/Beauty) 구조로 재편성"**
> 
> 8명의 전문 AI 에이전트가 설계한 체계적인 리팩토링 계획

---

## 📋 Executive Summary

| 항목 | 수치 |
|------|------|
| **총 태스크 수** | 31개 |
| **완료된 태스크** | 5개 (UX-001, PAY-001/002/003, BEAUTY-001) |
| **남은 태스크** | 26개 |
| **예상 총 작업시간** | 318시간 (약 40일) |
| **남은 작업시간** | 238시간 (약 30일) |
| **CRITICAL 태스크** | 5개 (1개 완료, 4개 남음) |
| **신규 페이지/컴포넌트** | 20+ |
| **수정 대상 파일** | 50+ |

---

## 🤖 8-Agent Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     🎯 PROJECT U-100 REFACTORING AGENTS                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TIER 1: CORE EXPERIENCE (P0 - MVP 필수)                                   │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐             │
│  │ 🎨 UX        │ 💳 Pay       │ 🗺️ Play      │ ✨ Beauty    │             │
│  │ Architect    │ Master       │ Curator      │ AI           │             │
│  │ 4 Tasks      │ 5 Tasks      │ 5 Tasks      │ 5 Tasks      │             │
│  │ 30h          │ 80h          │ 52h          │ 82h          │             │
│  └──────────────┴──────────────┴──────────────┴──────────────┘             │
│                                                                             │
│  TIER 2: SUPPORTING SYSTEMS (P1 - 런칭 전 완료)                            │
│  ┌──────────────┬──────────────┐                                           │
│  │ 🌍 i18n      │ 🔐 Auth      │                                           │
│  │ Global       │ Secure       │                                           │
│  │ 3 Tasks      │ 2 Tasks      │                                           │
│  │ 32h          │ 16h          │                                           │
│  └──────────────┴──────────────┘                                           │
│                                                                             │
│  TIER 3: OPTIMIZATION (P2 - 런칭 후 개선)                                  │
│  ┌──────────────┬──────────────┐                                           │
│  │ ⚡ Perf      │ 🧪 QA        │                                           │
│  │ Ninja        │ Guardian     │                                           │
│  │ 2 Tasks      │ 2 Tasks      │                                           │
│  │ 20h          │ 20h          │                                           │
│  └──────────────┴──────────────┘                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Phase별 실행 로드맵

### Phase 1: Foundation (Week 1-2) 
**목표: 핵심 인프라 및 UX 프레임워크 구축**

| ID | Agent | Task | 시간 | 의존성 |
|----|-------|------|------|--------|
| UX-001 | 🎨 UX | Bottom Tab Bar 재설계 | 4h | - |
| UX-002 | 🎨 UX | Tourist-First 온보딩 | 8h | - |
| I18N-001 | 🌍 i18n | 4개 언어 번역 파일 구조화 | 20h | - |
| I18N-003 | 🌍 i18n | 언어별 폰트 최적화 | 4h | - |
| AUTH-001 | 🔐 Auth | 소셜 로그인 통합 | 10h | - |

**Phase 1 산출물:**
- ✅ 새로운 Bottom Tab Bar (Pay/Play/Beauty/Profile)
- ✅ 외국인 온보딩 플로우
- ✅ 4개 언어 번역 시스템
- ✅ Google/Apple 로그인

---

### Phase 2: Pay System (Week 3-4)
**목표: 스테이블코인 결제 시스템 완성**

| ID | Agent | Task | 시간 | 의존성 |
|----|-------|------|------|--------|
| PAY-001 | 💳 Pay | Point System UI (VASP 우회) | 16h | - |
| PAY-003 | 💳 Pay | Account Abstraction 지갑 | 24h | PAY-001 |
| PAY-002 | 💳 Pay | QR Payment Flow | 20h | PAY-001 |
| PAY-004 | 💳 Pay | Point Charge UI | 12h | PAY-001 |
| PAY-005 | 💳 Pay | Transaction History | 8h | PAY-001 |

**Phase 2 산출물:**
- ✅ "Z-Point" 포인트 시스템 (코인 용어 제거)
- ✅ 3초 이내 QR 결제
- ✅ 소셜 로그인만으로 지갑 자동 생성
- ✅ 환전 느낌의 충전 UI

---

### Phase 3: Play System (Week 5-6)
**목표: 로컬 맵 & 큐레이션 고도화**

| ID | Agent | Task | 시간 | 의존성 |
|----|-------|------|------|--------|
| PLAY-001 | 🗺️ Play | Map 결제 가능 마커 | 6h | PAY-001 |
| PLAY-002 | 🗺️ Play | 장소 상세 다국어 | 10h | I18N-001 |
| PLAY-004 | 🗺️ Play | AI 큐레이션 추천 | 8h | - |
| PLAY-003 | 🗺️ Play | 실시간 웨이팅 정보 | 12h | - |
| PLAY-005 | 🗺️ Play | 예약 대행 플로우 | 16h | - |

**Phase 3 산출물:**
- ✅ Z-Pay 가능 매장 지도 표시
- ✅ 다국어 장소 정보
- ✅ AI 기반 맞춤 추천
- ✅ 예약 대행 기능

---

### Phase 4: Beauty System (Week 7-9)
**목표: K-뷰티 AI 시스템 완성**

| ID | Agent | Task | 시간 | 의존성 |
|----|-------|------|------|--------|
| BEAUTY-001 | ✨ Beauty | AI Skin Analysis 카메라 | 20h | - |
| BEAUTY-002 | ✨ Beauty | 피부 타입별 추천 | 14h | BEAUTY-001 |
| BEAUTY-003 | ✨ Beauty | 병원 매칭 UI | 12h | BEAUTY-001 |
| BEAUTY-004 | ✨ Beauty | 시술 예약 + 결제 | 20h | PAY-002 |
| BEAUTY-005 | ✨ Beauty | Before/After 비교 | 16h | BEAUTY-001 |

**Phase 4 산출물:**
- ✅ 실제 작동하는 AI 피부 분석
- ✅ 개인화된 제품/시술 추천
- ✅ 병원 예약 + Z-Point 결제
- ✅ 시술 효과 증명 기능

---

### Phase 5: Polish & Launch (Week 10-11)
**목표: 최적화 및 품질 보증**

| ID | Agent | Task | 시간 | 의존성 |
|----|-------|------|------|--------|
| UX-003 | 🎨 UX | Home 화면 재설계 | 12h | PLAY-004 |
| UX-004 | 🎨 UX | Landing Page 개편 | 6h | - |
| I18N-002 | 🌍 i18n | 통화 자동 변환 | 8h | - |
| AUTH-002 | 🔐 Auth | GDPR 동의 UI | 6h | - |
| PERF-001 | ⚡ Perf | Core Web Vitals | 12h | - |
| PERF-002 | ⚡ Perf | 번들 사이즈 최적화 | 8h | - |
| QA-001 | 🧪 QA | 결제 E2E 테스트 | 12h | PAY-002 |
| QA-002 | 🧪 QA | 다국어 QA | 8h | I18N-001 |

**Phase 5 산출물:**
- ✅ 최적화된 홈/랜딩 페이지
- ✅ 실시간 통화 변환
- ✅ GDPR 준수
- ✅ 성능 최적화 (LCP < 2.5s)
- ✅ E2E 테스트 완료

---

## 📁 신규 파일 목록

### 신규 페이지
```
src/app/
├── wallet/
│   ├── pay/page.tsx              # QR 결제 화면
│   ├── charge/page.tsx           # 포인트 충전 화면
│   └── history/page.tsx          # 거래 내역
├── beauty/
│   ├── analyze/page.tsx          # AI 피부 분석
│   ├── results/page.tsx          # 분석 결과
│   ├── booking/page.tsx          # 시술 예약
│   └── proof/page.tsx            # Before/After
├── booking/page.tsx              # 식당 예약
└── onboarding/
    └── consent/page.tsx          # GDPR 동의
```

### 신규 컴포넌트
```
src/components/
├── wallet/
│   ├── QRScanner.tsx             # QR 스캐너
│   ├── PaymentConfirm.tsx        # 결제 확인
│   ├── ChargeFlow.tsx            # 충전 플로우
│   └── TransactionList.tsx       # 거래 목록
├── beauty/
│   ├── RecommendationTabs.tsx    # 추천 탭
│   ├── TreatmentBooking.tsx      # 시술 예약
│   └── BeforeAfterCompare.tsx    # 전후 비교
├── booking/
│   └── BookingForm.tsx           # 예약 폼
├── auth/
│   └── ConsentForm.tsx           # 동의 폼
└── ui/
    └── PriceDisplay.tsx          # 통화 표시
```

---

## 🎯 CRITICAL TASKS (최우선 처리)

| 순서 | ID | Task | 이유 |
|------|-----|------|------|
| 1 | PAY-001 | Point System UI | VASP 규제 우회의 핵심 |
| 2 | PAY-003 | Account Abstraction | Web3 UX 혁신의 핵심 |
| 3 | PAY-002 | QR Payment Flow | 3초 결제 달성 |
| 4 | BEAUTY-001 | AI Skin Analysis | K-뷰티 차별화 기능 |
| 5 | BEAUTY-004 | 시술 예약+결제 | High-Ticket 수익원 |

---

## 📊 작업량 분포

### Agent별 작업량
```
💳 Pay Master      ████████████████████████████████████████  80h (25.2%)
✨ Beauty AI       ████████████████████████████████████████  82h (25.8%)
🗺️ Play Curator    ██████████████████████████               52h (16.4%)
🌍 i18n Global     ████████████████                         32h (10.1%)
🎨 UX Architect    ███████████████                          30h (9.4%)
⚡ Perf Ninja      ██████████                               20h (6.3%)
🧪 QA Guardian     ██████████                               20h (6.3%)
🔐 Auth Secure     ████████                                 16h (5.0%)
─────────────────────────────────────────────────────────────────
TOTAL                                                       318h
```

### Complexity 분포
```
CRITICAL  █████                    5 tasks (16.1%)
HIGH      ██████████████████      13 tasks (41.9%)
MEDIUM    ████████████████        11 tasks (35.5%)
LOW       ██                       2 tasks (6.5%)
```

---

## 🗓️ Timeline Summary

```
Week 1-2   [Phase 1: Foundation]     46h   ▓▓▓▓▓░░░░░░░░░░░░░░░
Week 3-4   [Phase 2: Pay System]     80h   ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░
Week 5-6   [Phase 3: Play System]    52h   ▓▓▓▓▓▓▓░░░░░░░░░░░░░
Week 7-9   [Phase 4: Beauty System]  82h   ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░
Week 10-11 [Phase 5: Polish]         72h   ▓▓▓▓▓▓▓▓░░░░░░░░░░░░
───────────────────────────────────────────────────────────────
TOTAL                                318h  (약 40 working days)
```

---

## ✅ 성공 기준 (Definition of Done)

### MVP Launch Criteria
- [ ] 외국인이 30초 내에 앱 가치 이해
- [ ] QR 결제 3초 이내 완료
- [ ] "코인/지갑" 용어 완전 제거
- [ ] 4개 언어 UI 완벽 지원
- [ ] AI 피부 분석 → 시술 예약 → 결제 원스톱

### Quality Gates
- [ ] Lighthouse Performance 90+
- [ ] E2E 테스트 주요 시나리오 통과
- [ ] 번역 누락 0개
- [ ] 결제 오류율 < 0.1%

---

## 🚨 Risk & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| AA 지갑 구현 복잡성 | HIGH | MEDIUM | 외부 SDK (Privy, Thirdweb) 활용 |
| AI 피부분석 정확도 | HIGH | LOW | 기존 검증된 API 사용 |
| 결제 Latency | HIGH | MEDIUM | L2 + Optimistic UI |
| 번역 품질 | MEDIUM | MEDIUM | 전문 번역 검수 |

---

## 📎 관련 문서

- `agents/eight-agents-config.ts` - 8개 에이전트 상세 설정
- `tasks/agent-tasks-detailed.ts` - 31개 태스크 상세 정의
- `../BUSINESS_OVERVIEW.md` - 사업 개요
- `../cross-validation-engine/reports/SUPREME_COUNCIL_VERDICT_IR.md` - 검증 리포트

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-12-09  
**Generated by:** 8-Agent Refactoring System

---

*"이 문서는 8개 AI 에이전트가 협력하여 설계한 체계적인 리팩토링 계획입니다."*
