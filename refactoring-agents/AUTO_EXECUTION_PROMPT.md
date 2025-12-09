# 🚀 8-Agent Guide-Based Sequential Execution Prompt

## 📋 System Instructions

당신은 **8개 전문 AI 에이전트를 운영하는 슈퍼 에이전트**입니다. 
아래 남은 태스크를 **가이드에 따라 순차적으로 구현**하고, 각 태스크 완료 시 **반드시 커밋 + PR 업데이트**를 수행하세요.

⚠️ **중요**: "자동 실행"이라는 용어는 오해를 불러일으킬 수 있습니다. AI가 각 태스크를 **실제로 코드 작성**해야 하며, 이 문서는 구현 가이드입니다.

---

## 🎯 실행 규칙

### 1. 필수 워크플로우 (MANDATORY)
```
FOR EACH TASK:
  1. Read task requirements from agent-tasks-detailed.ts
  2. Implement all acceptance criteria
  3. Test implementation (if applicable)
  4. git add -A
  5. git commit -m "feat(TASK-ID): [Detailed Description]"
  6. git push origin genspark_ai_developer
  7. Update TODO list
  8. Report completion status
```

### 2. 커밋 메시지 포맷
```
feat(TASK-ID): [Title]

🎯 Task: [TASK-ID] - [Full Title]
Agent: [Agent Name]
Complexity: [LOW/MEDIUM/HIGH/CRITICAL]
Time: [Hours]
Dependencies: [List or None]

✨ Changes:
- [File 1]: [Description]
- [File 2]: [Description]
...

📊 Impact:
- [Business impact 1]
- [Business impact 2]

🎯 Next Steps:
- [Next task ID]
```

### 3. 에러 처리
- 구현 중 에러 발생 시 → 다음 태스크로 스킵하지 말고 해결
- 파일 충돌 시 → 원격 코드 우선 (git fetch → rebase)
- 테스트 실패 시 → 수정 후 재시도

### 4. 진행 상황 보고
각 태스크 완료 시:
```
✅ [TASK-ID] COMPLETED
- Files: [N개]
- Lines: +[added] -[removed]
- Time: [estimated]
- PR: [updated]
```

---

## 📝 남은 태스크 리스트

### Phase 1: Foundation (3개 남음)

#### 🎨 UX Architect
```typescript
{
  id: 'UX-002',
  priority: 'HIGH',
  title: 'Tourist-First Onboarding Flow',
  estimatedHours: 8,
  acceptanceCriteria: [
    '30초 내 핵심 가치 전달 (환전 무료, 로컬 맛집, AI 피부분석)',
    '언어 자동 감지 + 수동 변경 옵션',
    'Skip 버튼으로 빠른 진입'
  ],
  files: [
    'src/app/onboarding/page.tsx (신규)',
    'src/components/onboarding/LanguageSelect.tsx (신규)',
    'src/components/onboarding/FeatureIntro.tsx (신규)'
  ],
  implementation: `
    1. Create 3-step onboarding:
       - Step 1: Language Selection (EN/KO/JP/ZH)
       - Step 2: Currency Selection (자동 감지)
       - Step 3: 3-Pillar Introduction (Pay/Play/Beauty)
    2. Add skip button (top-right)
    3. Use framer-motion for smooth transitions
    4. Store selection in localStorage
    5. Redirect to main app after completion
  `
}
```

```typescript
{
  id: 'UX-003',
  priority: 'HIGH',
  title: 'Home Screen Redesign (Play-centric)',
  estimatedHours: 12,
  acceptanceCriteria: [
    '상단에 현재 위치 기반 추천 장소 3개',
    'Pay Now 플로팅 버튼',
    'AI Skin Check CTA 배너'
  ],
  files: [
    'src/app/(home)/page.tsx',
    'src/components/home/RecommendedPlaces.tsx (신규)',
    'src/components/home/QuickActions.tsx (신규)'
  ],
  implementation: `
    1. Replace current 2026 demo with production home
    2. Add location-based recommendations (mock data)
    3. Floating QR button (bottom-right)
    4. Beauty CTA banner (below recommendations)
    5. Quick actions: Map, Beauty, Profile
  `
}
```

```typescript
{
  id: 'UX-004',
  priority: 'MEDIUM',
  title: 'Landing Page Tourist Targeting',
  estimatedHours: 6,
  acceptanceCriteria: [
    '"No Exchange Fee" 히어로 섹션',
    '3-Pillar 가치 제안',
    'App Store/Play Store 버튼'
  ],
  files: [
    'src/app/landing/page.tsx',
    'src/components/landing/HeroSection.tsx'
  ]
}
```

### Phase 2: Pay System (2개 남음)

#### 💳 Pay Master
```typescript
{
  id: 'PAY-004',
  priority: 'HIGH',
  title: 'Point Charge UI (환전 느낌)',
  estimatedHours: 12,
  acceptanceCriteria: [
    '환율 표시 (1 USD = 1,000 Z-Point)',
    '충전 수수료 0% 강조',
    '결제 수단 선택 (Card/PayPal/Apple Pay)'
  ],
  files: [
    'src/app/wallet/charge/page.tsx (신규)',
    'src/components/wallet/ChargeFlow.tsx (신규)',
    'src/components/wallet/PaymentMethodSelect.tsx (신규)'
  ],
  implementation: `
    1. Amount input with currency converter
    2. Payment method selector (3 options)
    3. Exchange rate display (real-time mock)
    4. "0% Fee" banner (prominent)
    5. Confirm button → Mock success
  `
}
```

```typescript
{
  id: 'PAY-005',
  priority: 'MEDIUM',
  title: 'Transaction History UI',
  estimatedHours: 8,
  acceptanceCriteria: [
    '가맹점 로고/이름 표시',
    '월별 지출 요약 차트',
    '블록체인 용어 완전 제거'
  ],
  files: [
    'src/app/wallet/history/page.tsx (신규)',
    'src/components/wallet/TransactionList.tsx (신규)',
    'src/components/wallet/MonthlyChart.tsx (신규)'
  ],
  implementation: `
    1. List view with merchant logo + name
    2. Date grouping (Today, Yesterday, This Week)
    3. Monthly spending chart (bar chart)
    4. Filter by type (All, Pay, Charge, Rewards)
    5. Pull-to-refresh
  `
}
```

### Phase 3: Play System (5개 남음)

#### 🗺️ Play Curator
```typescript
{
  id: 'PLAY-001',
  priority: 'MEDIUM',
  title: 'Map Z-Pay Marker Display',
  estimatedHours: 6,
  dependencies: ['PAY-001'],
  files: [
    'src/components/map/PopupMarker.tsx',
    'src/components/map/MapboxMap.tsx'
  ],
  implementation: `
    1. Add 'zpayEnabled' property to marker data
    2. Show purple badge for Z-Pay locations
    3. Add filter toggle "Z-Pay Only"
    4. Update marker icon for Z-Pay stores
  `
}
```

```typescript
{
  id: 'PLAY-002',
  priority: 'HIGH',
  title: 'Place Detail Multilingual',
  estimatedHours: 10,
  dependencies: ['I18N-001'],
  files: [
    'src/components/popup/PopupBottomSheet.tsx',
    'src/components/map/PopupBottomSheet.tsx'
  ],
  implementation: `
    1. Fetch translations based on user language
    2. Menu name translation (or romanization)
    3. Address in English format
    4. Operating hours in local format
  `
}
```

```typescript
{
  id: 'PLAY-003',
  priority: 'HIGH',
  title: 'Real-time Waiting Info UI',
  estimatedHours: 12,
  files: [
    'src/components/map/PopupBottomSheet.tsx',
    'src/app/api/places/[id]/waiting/route.ts (신규)'
  ],
  implementation: `
    1. Mock waiting data (teams count, estimated time)
    2. Update every 30 seconds (polling)
    3. Push notification "Almost ready"
    4. Link to booking flow
  `
}
```

```typescript
{
  id: 'PLAY-004',
  priority: 'MEDIUM',
  title: 'AI Curation Recommendation',
  estimatedHours: 8,
  files: [
    'src/components/ai/AIRecommendations.tsx (신규)',
    'src/app/api/ai/recommendations/route.ts (신규)'
  ],
  implementation: `
    1. Time-based recommendations (lunch/dinner)
    2. "Based on your taste" personalization
    3. 1-line reason display
    4. Carousel UI with 5 recommendations
  `
}
```

```typescript
{
  id: 'PLAY-005',
  priority: 'HIGH',
  title: 'Booking Agency Flow',
  estimatedHours: 16,
  files: [
    'src/app/booking/page.tsx (신규)',
    'src/components/booking/BookingForm.tsx (신규)',
    'src/components/booking/CalendarPicker.tsx (신규)'
  ],
  implementation: `
    1. Date picker (calendar view)
    2. Time slot selection (available slots)
    3. Party size selector
    4. Special requests textarea
    5. Confirmation with push notification
  `
}
```

### Phase 4: Beauty System (4개 남음)

#### ✨ Beauty AI
```typescript
{
  id: 'BEAUTY-002',
  priority: 'HIGH',
  title: 'Skin Type Recommendations',
  estimatedHours: 14,
  dependencies: ['BEAUTY-001'],
  files: [
    'src/app/beauty/results/page.tsx (업데이트)',
    'src/components/beauty/RecommendationTabs.tsx (신규)',
    'src/components/beauty/ProductCard.tsx (신규)'
  ],
  implementation: `
    1. Tabs: Products, Treatments, Clinics
    2. Product recommendations (K-Beauty brands)
    3. External shopping mall links
    4. Treatment info + price range
    5. Save to favorites
  `
}
```

```typescript
{
  id: 'BEAUTY-003',
  priority: 'HIGH',
  title: 'Clinic Matching UI',
  estimatedHours: 12,
  dependencies: ['BEAUTY-001'],
  files: [
    'src/app/k-experiences/page.tsx (업데이트)',
    'src/components/k-experience/ClinicCard.tsx (신규)'
  ],
  implementation: `
    1. Personalized clinic list based on analysis
    2. Matching score display (0-100)
    3. Price filter ($, $$, $$$, $$$$)
    4. Foreign reviews prioritized
    5. "Best Match" badge
  `
}
```

```typescript
{
  id: 'BEAUTY-004',
  priority: 'CRITICAL',
  title: 'Treatment Booking + Payment',
  estimatedHours: 20,
  dependencies: ['PAY-002', 'BEAUTY-003'],
  files: [
    'src/app/beauty/booking/page.tsx (신규)',
    'src/components/beauty/TreatmentBooking.tsx (신규)',
    'src/components/beauty/TreatmentMenu.tsx (신규)'
  ],
  implementation: `
    1. Treatment menu selection (checkbox)
    2. Calendar + time slot picker
    3. Z-Point or Card payment choice
    4. Booking confirmation screen
    5. Receipt with QR code
  `
}
```

```typescript
{
  id: 'BEAUTY-005',
  priority: 'MEDIUM',
  title: 'Before/After Comparison UI',
  estimatedHours: 16,
  files: [
    'src/app/beauty/proof/page.tsx (신규)',
    'src/components/beauty/BeforeAfterCompare.tsx (신규)'
  ],
  implementation: `
    1. Side-by-side image comparison
    2. Slider to compare (before ↔ after)
    3. Date stamps on images
    4. Improvement metrics (skin score change)
    5. Share to social media
  `
}
```

### Phase 5: Supporting Systems (5개 남음)

#### 🌍 i18n Global
```typescript
{
  id: 'I18N-001',
  priority: 'HIGH',
  title: '4-Language Translation Files',
  estimatedHours: 20,
  files: [
    'src/i18n/locales/en.json',
    'src/i18n/locales/ko.json',
    'src/i18n/locales/ja.json',
    'src/i18n/locales/zh.json'
  ],
  implementation: `
    1. Extract all UI strings to JSON
    2. Translate to 4 languages (use AI)
    3. Update useTranslation hook
    4. Test all pages with language switch
  `
}
```

```typescript
{
  id: 'I18N-002',
  priority: 'MEDIUM',
  title: 'Currency Auto-Conversion',
  estimatedHours: 8,
  files: [
    'src/hooks/useCurrency.tsx',
    'src/components/ui/PriceDisplay.tsx (신규)'
  ],
  implementation: `
    1. Fetch exchange rates from API
    2. Convert all prices to user currency
    3. PriceDisplay component (KRW/USD/JPY/CNY)
    4. Update on language change
  `
}
```

```typescript
{
  id: 'I18N-003',
  priority: 'LOW',
  title: 'Language-specific Font Optimization',
  estimatedHours: 4,
  files: [
    'src/app/layout.tsx',
    'tailwind.config.ts'
  ],
  implementation: `
    1. Load Noto Sans JP for Japanese
    2. Load Noto Sans SC for Chinese
    3. Keep existing Inter + Noto Sans KR
    4. font-display: swap
  `
}
```

#### 🔐 Auth Secure
```typescript
{
  id: 'AUTH-001',
  priority: 'HIGH',
  title: 'Social Login Integration',
  estimatedHours: 10,
  files: [
    'src/context/auth-context.tsx',
    'src/app/api/auth/[...nextauth]/route.ts'
  ],
  implementation: `
    1. NextAuth.js setup (Google, Apple)
    2. Privy integration (existing)
    3. OAuth callback handling
    4. Session management
    5. Auto wallet creation on signup
  `
}
```

```typescript
{
  id: 'AUTH-002',
  priority: 'MEDIUM',
  title: 'GDPR Consent UI',
  estimatedHours: 6,
  files: [
    'src/app/onboarding/consent/page.tsx (신규)',
    'src/components/auth/ConsentForm.tsx (신규)'
  ],
  implementation: `
    1. Cookie consent banner
    2. Data processing agreement
    3. Optional marketing consent
    4. Store in user preferences
    5. GDPR-compliant wording
  `
}
```

### Phase 6: Optimization (4개 남음)

#### ⚡ Perf Ninja
```typescript
{
  id: 'PERF-001',
  priority: 'MEDIUM',
  title: 'Core Web Vitals Optimization',
  estimatedHours: 12,
  files: [
    'src/components/analytics/WebVitalsMonitor.tsx',
    'next.config.ts'
  ],
  implementation: `
    1. Image optimization (next/image)
    2. Code splitting (dynamic imports)
    3. Prefetch critical routes
    4. Reduce LCP to < 2.5s
    5. Monitor with Real User Monitoring
  `
}
```

```typescript
{
  id: 'PERF-002',
  priority: 'MEDIUM',
  title: 'Bundle Size Optimization',
  estimatedHours: 8,
  files: [
    'next.config.ts',
    'package.json'
  ],
  implementation: `
    1. Analyze bundle with @next/bundle-analyzer
    2. Remove unused dependencies
    3. Replace heavy libraries (e.g., moment → date-fns)
    4. Tree shaking verification
    5. Target: < 200KB initial JS
  `
}
```

#### 🧪 QA Guardian
```typescript
{
  id: 'QA-001',
  priority: 'HIGH',
  title: 'Payment E2E Tests',
  estimatedHours: 12,
  dependencies: ['PAY-002'],
  files: [
    'e2e/payment.spec.ts (신규)',
    'e2e/qr-scan.spec.ts (신규)'
  ],
  implementation: `
    1. Test QR scan flow (mock camera)
    2. Test payment confirmation
    3. Test insufficient balance
    4. Test success/error states
    5. Playwright automation
  `
}
```

```typescript
{
  id: 'QA-002',
  priority: 'MEDIUM',
  title: 'Multilingual QA',
  estimatedHours: 8,
  dependencies: ['I18N-001'],
  files: [
    'e2e/i18n.spec.ts (신규)',
    'scripts/check-translations.ts (신규)'
  ],
  implementation: `
    1. Test all 4 languages
    2. Check for missing translations
    3. Verify RTL support (if needed)
    4. Screenshot comparison
    5. Automated script for translation coverage
  `
}
```

---

## 🚀 Auto-Execution Command

**당신의 미션**: 위 태스크를 **순차적으로 자동 실행**하세요.

### 실행 예시:
```
[Starting Auto-Execution Mode]

🎯 Task 1/26: UX-002 - Tourist-First Onboarding
├─ Reading requirements... ✓
├─ Creating files... ✓
│  ├─ src/app/onboarding/page.tsx
│  ├─ src/components/onboarding/LanguageSelect.tsx
│  └─ src/components/onboarding/FeatureIntro.tsx
├─ Implementing logic... ✓
├─ Testing... ✓
├─ git commit... ✓
├─ git push... ✓
└─ ✅ COMPLETED (8h estimated)

🎯 Task 2/26: UX-003 - Home Screen Redesign
...
```

### 중단 조건:
- 모든 26개 태스크 완료
- 또는 사용자 명령 "STOP"

### 재개 조건:
- 마지막 완료된 태스크부터 재시작
- TODO 리스트로 진행 상황 추적

---

## 📊 최종 목표

```
✅ 총 26개 태스크 완료
✅ 238시간 상당 작업 (약 30일, 완료된 80h 제외)
✅ PR #26 업데이트 (26개 커밋)
✅ 3-Pillar (Pay/Play/Beauty) 100% 완성
✅ MVP 런칭 준비 완료
```

---

## 📝 진행 상태 추적

진행 상태는 `refactoring-agents/progress.json`에 자동 저장됩니다:
- 완료된 태스크 목록
- 현재 작업 중인 태스크
- 실패한 태스크 및 오류 메시지
- AI 세션 중단 시에도 상태 유지

---

## 🔥 START COMMAND

**"START GUIDE-BASED EXECUTION"** - 이 명령어로 가이드 기반 순차 구현 시작

**Ready to implement? 🚀**
