# ZZIK Components Documentation

> DES-207: 컴포넌트 문서화

## Directory Structure

```
components/
├── auth/           # 인증 관련 컴포넌트
├── bookmark/       # 북마크 기능
├── brand/          # 브랜드 로고 등
├── catalyst/       # Catalyst UI 라이브러리 (Headless UI 기반)
├── checkin/        # 체크인 검증
├── cosmic/         # Cosmic 디자인 시스템 컴포넌트
├── error/          # 에러 처리 컴포넌트
├── form/           # 폼 입력 컴포넌트
├── i18n/           # 다국어 지원
├── layout/         # 레이아웃 (BottomNav 등)
├── leader/         # 리더 시스템
├── loading/        # 로딩 상태
├── map/            # 지도 (Mapbox)
├── notification/   # 알림
├── onboarding/     # 온보딩
├── popup/          # 팝업 카드 및 관련 컴포넌트
├── pwa/            # PWA 설치 프롬프트
├── realtime/       # 실시간 기능
├── search/         # 검색 및 필터
├── seo/            # SEO 메타데이터
├── share/          # 공유 기능
├── ui/             # 기본 UI 컴포넌트 (Toast, Skeleton 등)
└── verification/   # Triple 검증 시스템
```

## Core Components

### Layout Components

#### BottomNav

**경로**: `layout/BottomNav.tsx`
**용도**: 모바일 하단 네비게이션 바

**Props**: 없음 (내부 라우팅 자동 감지)

**특징**:

- Apple Liquid Glass 디자인
- 48px 터치 영역 (Apple HIG 준수)
- 햅틱 피드백 지원
- Triple Layer 인디케이터

**사용 예시**:

```tsx
import { BottomNav } from '@/components/layout/BottomNav';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
```

---

### Popup Components

#### PopupCard

**경로**: `popup/PopupCard.tsx`
**용도**: 팝업 펀딩 카드 (메인 컴포넌트)

**Props**:

```typescript
interface PopupCardProps {
  popup: Popup;
  onParticipate?: (popupId: string) => void;
  onBookmark?: (popupId: string) => void;
  priority?: boolean;
}
```

**특징**:

- Temperature 기반 진행률 (Cold/Warm/Hot)
- FOMO 엔진 통합
- 참여 애니메이션
- 북마크 기능

---

#### ProgressBar

**경로**: `popup/ProgressBar.tsx`
**용도**: 온도 기반 진행률 바

**Props**:

```typescript
interface ProgressBarProps {
  current: number;
  goal: number;
  temperature?: 'cold' | 'warm' | 'hot' | 'done';
}
```

**Temperature 시스템**:

- **cold** (0-30%): `rgba(255, 107, 91, 0.3)`
- **warm** (30-70%): `rgba(255, 107, 91, 0.6)`
- **hot** (70-99%): `rgba(255, 107, 91, 1.0)` + glow
- **done** (100%): `#22c55e` (green) + confetti

---

### UI Components

#### Toast

**경로**: `ui/Toast.tsx`
**용도**: 알림 토스트 메시지

**사용 예시**:

```tsx
import { useToast } from '@/components/ui/Toast';

const { showToast } = useToast();

showToast({
  message: '참여 완료!',
  type: 'success',
  duration: 3000,
});
```

**Types**: `success | error | info | warning`

---

#### LoadingSpinner

**경로**: `ui/LoadingSpinner.tsx`
**용도**: 로딩 스피너

**Props**:

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}
```

---

### Verification Components

#### VerificationModal

**경로**: `verification/VerificationModal.tsx`
**용도**: Triple 검증 시스템 (GPS + QR + Photo)

**Steps**:

1. GPS 위치 검증
2. QR 코드 스캔
3. 사진 업로드 (선택)

---

### Map Components

#### MapboxMap

**경로**: `map/MapboxMap.tsx`
**용도**: 오픈 확정 팝업 지도

**Props**:

```typescript
interface MapboxMapProps {
  popups: PopupLocation[];
  onPopupSelect?: (popup: PopupLocation | null) => void;
  selectedPopup?: PopupLocation | null;
}
```

**특징**:

- Mapbox GL JS 기반
- 커스텀 마커 (카테고리별 색상)
- 호버/선택 애니메이션
- 툴팁 표시

---

## Design System Integration

### Catalyst UI (Headless UI)

**경로**: `catalyst/`

**컴포넌트**:

- Button
- Dropdown
- Dialog/Modal
- Input
- Select
- Checkbox/Radio
- Badge
- Table
- Avatar
- Alert

**ZZIK 커스터마이징**:

- Flame Coral 액센트 색상
- Liquid Glass 배경
- Dark 모드 전용

---

### Cosmic Components

**경로**: `cosmic/`

**레거시 컴포넌트** (점진적 Catalyst 마이그레이션 중):

- CosmicButton
- CosmicInput
- GlassCard
- FloatingOrb
- StatCard

---

## Best Practices

### 1. Props 타입 안전성

모든 컴포넌트는 TypeScript로 작성되며 명시적 타입을 사용합니다.

```tsx
// ✅ Good
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onClick: () => void;
  children: React.ReactNode;
}

// ❌ Bad
interface ButtonProps {
  variant: string;
  size?: any;
  onClick: Function;
  children: any;
}
```

### 2. Accessibility

모든 인터랙티브 요소는 접근성 속성을 포함합니다.

```tsx
<button aria-label="팝업 참여하기" aria-pressed={isParticipating} tabIndex={0}>
  참여하기
</button>
```

### 3. 애니메이션

Framer Motion을 사용하며 `prefers-reduced-motion`을 준수합니다.

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>;
```

### 4. 디자인 토큰 사용

하드코딩 대신 디자인 토큰을 사용합니다.

```tsx
import { colors, brand } from '@/lib/design-tokens';

// ✅ Good
<div style={{ color: brand.primary }}>

// ❌ Bad
<div style={{ color: '#FF6B5B' }}>
```

---

## Icon Library

**Library**: Lucide React
**Version**: ^0.555.0

**사용 예시**:

```tsx
import { Flame, Map, User, Check } from 'lucide-react';

<Flame size={24} strokeWidth={2} color="#FF6B5B" />;
```

**아이콘 크기 표준**:

- `size={16}`: 작은 아이콘 (버튼 내부)
- `size={20}`: 중간 아이콘 (리스트 아이템)
- `size={24}`: 기본 아이콘 (네비게이션)
- `size={32}`: 큰 아이콘 (헤더)

---

## Testing

### Component Tests

**Framework**: Vitest + Testing Library

**예시**:

```tsx
import { render, screen } from '@testing-library/react';
import { PopupCard } from './PopupCard';

test('renders popup card with correct data', () => {
  render(<PopupCard popup={mockPopup} />);
  expect(screen.getByText('테스트 팝업')).toBeInTheDocument();
});
```

---

## Contributing

새 컴포넌트 추가 시:

1. TypeScript로 작성
2. Props 인터페이스 정의
3. JSDoc 주석 추가
4. 접근성 속성 포함
5. 디자인 토큰 사용
6. 테스트 작성

---

_ZZIK Components v2.0 | Last Updated: 2025-12-05_
