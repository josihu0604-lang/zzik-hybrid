# ZZIK UI Component Hierarchy

> Design System 2.0 컴포넌트 계층 구조 (DES-079)

## 컴포넌트 계층 (Atomic Design)

```
┌─────────────────────────────────────────────────────────┐
│                    PAGES (Routes)                        │
│  /app/page.tsx, /app/popup/[id]/page.tsx, etc.         │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    TEMPLATES                             │
│  Page layouts with specific slot structure              │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    ORGANISMS                             │
│  ├─ PopupCard (popup/)                                  │
│  ├─ PopupCardHeader                                     │
│  ├─ PopupCardStats                                      │
│  ├─ PopupCardCTA                                        │
│  ├─ CategoryFilter                                      │
│  ├─ LiveStats                                           │
│  └─ Navigation components                               │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    MOLECULES                             │
│  ├─ Button (ui/)                                        │
│  ├─ ButtonGroup                                         │
│  ├─ IconButton                                          │
│  ├─ IconWithText                                        │
│  ├─ ProgressBar (popup/)                                │
│  ├─ Toast (ui/)                                         │
│  └─ Various card components                             │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      ATOMS                               │
│  ├─ Typography (ui/)                     [NEW - DES-080]│
│  │   ├─ Heading1, Heading2, ...                         │
│  │   ├─ Body, BodyLarge, BodySmall                      │
│  │   └─ Caption, Label                                  │
│  ├─ Icon (ui/)                          [NEW - DES-090] │
│  │   ├─ IconWrapper                                     │
│  │   └─ Common icons (Heart, Star, etc.)                │
│  ├─ Container (ui/)                     [NEW - DES-087] │
│  ├─ Grid (ui/)                          [NEW - DES-088] │
│  ├─ Flex (ui/)                                          │
│  ├─ Stack (ui/)                                         │
│  ├─ Skeleton (ui/)                                      │
│  ├─ LoadingSpinner (ui/)                                │
│  └─ OptimizedImage (ui/)                [ENH - DES-097] │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  DESIGN TOKENS                           │
│  @/lib/design-tokens.ts                                 │
│  ├─ colors                                              │
│  ├─ typography                                          │
│  ├─ spacing (4px grid)                                  │
│  ├─ radii                                               │
│  ├─ shadows                                             │
│  ├─ liquidGlass                                         │
│  └─ zIndex                              [DES-089]        │
└─────────────────────────────────────────────────────────┘
```

## 주요 개선사항 (DES-079~104)

### 컴포넌트 (DES-079~089)

✅ **DES-079**: 명확한 컴포넌트 계층 구조 (Atomic Design)

- Atoms → Molecules → Organisms → Templates → Pages

✅ **DES-080**: Typography atom 컴포넌트 생성

- 타입 안전한 텍스트 스타일
- 디자인 토큰 통합
- 접근성 지원

✅ **DES-081**: PopupCard 이미 분리됨 (170줄 → 서브컴포넌트)

- PopupCardHeader, PopupCardStats, PopupCardCTA

✅ **DES-082**: children 타입 안전성 (ReactNode)

- 모든 컴포넌트에서 명시적 ReactNode 타입 사용

✅ **DES-083**: size prop API 통일

- 모든 컴포넌트: sm | md | lg

✅ **DES-084**: disabled 스타일 대비 개선

- opacity: 0.5 + cursor: not-allowed
- 명확한 비활성화 상태 표시

✅ **DES-085**: compound variants 지원

- Button 컴포넌트에서 variant + size 조합

✅ **DES-086**: 보더 너비 통일

- 모든 보더: 1.5px 일관성

✅ **DES-087**: Container 컴포넌트 생성

- 반응형 max-width
- 4px grid 통합

✅ **DES-088**: Grid System 구현

- Grid, Flex, Stack 컴포넌트
- 일관된 spacing

✅ **DES-089**: z-index 문서화 완료

- design-tokens.ts에 zIndex 스케일

### 아이콘 (DES-090~096)

✅ **DES-090**: 아이콘 사이즈 3종류로 표준화

- sm: 16px, md: 20px, lg: 24px

✅ **DES-091**: SVG viewBox 통일

- 모든 아이콘: viewBox="0 0 24 24"

✅ **DES-092**: strokeWidth 고정

- 기본 2, 상태 변경 없음

✅ **DES-093**: strokeWidth 스케일 안함

- size만 조정, stroke는 일정

✅ **DES-094**: 아이콘-텍스트 gap 통일

- IconWithText: gap 8px (spacing[2])

✅ **DES-095**: 아이콘 수직 정렬

- vertical-align: middle

✅ **DES-096**: 아이콘 버튼 터치 영역

- 최소 44x44px (Apple HIG)

### 이미지 (DES-097~104)

✅ **DES-097**: 기본 aspect ratio 지원

- ASPECT_RATIOS 상수 제공

✅ **DES-098**: CLS 방지 dimensions

- aspectRatio prop 자동 적용

✅ **DES-099**: 테마별 blur placeholder

- dark/light 2가지 placeholder

✅ **DES-100**: 스켈레톤 테마

- dark/light 스켈레톤 색상

✅ **DES-101**: priority prop 활용

- LCP 최적화를 위한 priority 지원

✅ **DES-102**: 다양한 에러 아이콘

- image, avatar, video, thumbnail 타입별 아이콘

✅ **DES-103**: 이미지 재시도 로직

- 최대 3회 자동 재시도 (설정 가능)

✅ **DES-104**: 이미지 로딩 최적화

- loading="lazy" 기본값
- priority 이미지는 "eager"

## 컴포넌트 사용 가이드

### 1. Typography

```tsx
import { Typography, Heading1, Body } from '@/components/ui';

// 기본 사용
<Typography variant="h1">Title</Typography>

// 편의 컴포넌트
<Heading1>Title</Heading1>
<Body color="secondary">Text content</Body>
```

### 2. Layout

```tsx
import { Container, Grid, Flex, Stack } from '@/components/ui';

<Container size="lg">
  <Grid cols={3} gap={4}>
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
  </Grid>
</Container>

<Flex direction="row" align="center" justify="between" gap={3}>
  <div>Left</div>
  <div>Right</div>
</Flex>

<Stack spacing={4}>
  <div>Item 1</div>
  <div>Item 2</div>
</Stack>
```

### 3. Button

```tsx
import { Button, ButtonGroup, IconButton } from '@/components/ui';
import { HeartIcon } from '@/components/ui';

<Button variant="primary" size="md">
  Click me
</Button>

<Button variant="outline" disabled>
  Disabled
</Button>

<Button variant="secondary" loading>
  Loading...
</Button>

<IconButton
  icon={<HeartIcon size="md" />}
  onClick={handleClick}
  aria-label="Like"
/>
```

### 4. Icon

```tsx
import { Icon, IconWithText, HeartIcon } from '@/components/ui';

<HeartIcon size="md" color="flame" />

<IconWithText
  icon={<HeartIcon size="sm" />}
  iconPosition="left"
  gap={8}
>
  Like
</IconWithText>
```

### 5. Image

```tsx
import { OptimizedImage, ASPECT_RATIOS, IMAGE_SIZES } from '@/components/ui';

<OptimizedImage
  src="/image.jpg"
  alt="Description"
  width={640}
  height={480}
  aspectRatio={ASPECT_RATIOS.video}
  sizes={IMAGE_SIZES.card}
  priority // LCP 이미지
  enableRetry
  maxRetries={3}
  skeletonTheme="dark"
  errorFallbackType="image"
/>;
```

## 파일 구조

```
src/components/
├── ui/                              # Atomic components
│   ├── Typography.tsx               # DES-080
│   ├── Button.tsx                   # DES-082~086
│   ├── Icon.tsx                     # DES-090~096
│   ├── Container.tsx                # DES-087~088
│   ├── OptimizedImage.tsx           # DES-097~104
│   ├── LoadingSpinner.tsx
│   ├── Skeleton.tsx
│   ├── Toast.tsx
│   ├── index.ts                     # Central export
│   ├── COMPONENT_HIERARCHY.md       # This file
│   └── README.md                    # Component docs
├── popup/                           # Popup organisms
│   ├── PopupCard.tsx                # Main card
│   ├── PopupCardHeader.tsx
│   ├── PopupCardStats.tsx
│   ├── PopupCardCTA.tsx
│   ├── ProgressBar.tsx
│   ├── CategoryFilter.tsx
│   └── LiveStats.tsx
├── cosmic/                          # Cosmic design components
│   ├── buttons.tsx                  # Legacy (use ui/Button.tsx)
│   ├── icons.tsx                    # Brand icons
│   └── glass-card.tsx
└── [other feature folders]/

src/lib/
├── design-tokens.ts                 # Design system tokens
├── animations.ts                    # Animation presets
└── [other utilities]/
```

## 마이그레이션 가이드

### Legacy → New Components

```tsx
// ❌ Old (cosmic/buttons.tsx)
import { PrimaryButton } from '@/components/cosmic/buttons';

// ✅ New (ui/Button.tsx)
import { Button } from '@/components/ui';
<Button variant="primary">Click me</Button>

// ❌ Old (inline styles)
<span style={{ fontSize: '24px', fontWeight: 700 }}>Title</span>

// ✅ New (Typography)
import { Heading2 } from '@/components/ui';
<Heading2>Title</Heading2>

// ❌ Old (manual icon sizing)
<HeartIcon size={20} strokeWidth={2} />

// ✅ New (standardized)
import { HeartIcon } from '@/components/ui';
<HeartIcon size="md" />
```

## 다음 단계

1. **페이지별 마이그레이션**: Legacy 컴포넌트를 새 컴포넌트로 교체
2. **Storybook 추가**: 컴포넌트 문서화 및 테스트
3. **테마 시스템 확장**: 다크/라이트 모드 완전 지원
4. **접근성 개선**: WCAG 2.1 AA 준수
5. **성능 최적화**: Bundle size 분석 및 최적화

---

**Last Updated**: 2025-12-05
**Version**: 2.0
**Status**: ✅ All issues (DES-079~104) resolved
