# ZZIK UI Components

> Design System 2.0 - 통합 UI 컴포넌트 라이브러리

## 개요

ZZIK 프로젝트의 모든 UI 컴포넌트를 통합 관리하는 디자인 시스템입니다. Atomic Design 원칙을 따르며, 타입 안전성, 접근성, 성능을 중점으로 설계되었습니다.

## 주요 특징

- ✅ **타입 안전**: TypeScript로 작성된 모든 컴포넌트
- ✅ **접근성**: WCAG 2.1 AA 준수를 위한 ARIA 속성
- ✅ **성능 최적화**: 최소 번들 크기, lazy loading 지원
- ✅ **디자인 토큰**: 중앙 집중식 스타일 관리
- ✅ **반응형**: 모바일 우선 디자인
- ✅ **4px Grid**: 일관된 spacing 시스템
- ✅ **다크 모드**: Liquid Glass 디자인 언어

## 빠른 시작

```tsx
import { Button, Typography, Icon, Container } from '@/components/ui';

function MyComponent() {
  return (
    <Container size="lg">
      <Typography variant="h1" color="primary">
        Welcome to ZZIK
      </Typography>
      <Button variant="primary" size="md">
        참여하기
      </Button>
    </Container>
  );
}
```

## 컴포넌트 목록

### Layout Components

#### Container

반응형 컨테이너 컴포넌트

```tsx
<Container size="lg" noPadding>
  {children}
</Container>
```

Props:

- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `noPadding`: boolean
- `noPaddingY`: boolean
- `as`: 'div' | 'section' | 'article' | 'main' | 'aside'

#### Grid

CSS Grid 레이아웃 시스템

```tsx
<Grid cols={3} gap={4}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>
```

Props:

- `cols`: number | responsive object
- `gap`: spacing key (0~24)
- `rowGap`: spacing key
- `colGap`: spacing key

#### Flex

Flexbox 레이아웃 헬퍼

```tsx
<Flex direction="row" align="center" justify="between" gap={3}>
  <div>Left</div>
  <div>Right</div>
</Flex>
```

Props:

- `direction`: 'row' | 'row-reverse' | 'column' | 'column-reverse'
- `align`: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
- `justify`: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
- `wrap`: 'nowrap' | 'wrap' | 'wrap-reverse'
- `gap`: spacing key

#### Stack

수직/수평 스택 컴포넌트

```tsx
<Stack spacing={4} direction="vertical">
  <div>Item 1</div>
  <div>Item 2</div>
</Stack>
```

### Typography

타입 안전한 텍스트 컴포넌트

```tsx
// 기본 사용
<Typography variant="h1" color="primary" align="center">
  Title
</Typography>

// 편의 컴포넌트
<Heading1>Main Title</Heading1>
<Heading2>Subtitle</Heading2>
<Body color="secondary">Body text</Body>
<Caption>Small text</Caption>
<Label>Form label</Label>
```

Variants:

- Headings: `h1` ~ `h6`
- Subtitles: `subtitle1`, `subtitle2`
- Body: `body`, `bodyLarge`, `bodySmall`
- Other: `caption`, `overline`, `label`

Colors:

- `primary`, `secondary`, `tertiary`, `muted`, `inverse`
- `flame`, `success`, `warning`, `error`

### Button

통합 버튼 컴포넌트 (DES-082~086)

```tsx
<Button
  variant="primary"
  size="md"
  loading={false}
  disabled={false}
  fullWidth={false}
  leftIcon={<HeartIcon />}
  onClick={handleClick}
>
  Click me
</Button>

<ButtonGroup gap={3} orientation="horizontal">
  <Button variant="primary">Submit</Button>
  <Button variant="secondary">Cancel</Button>
</ButtonGroup>
```

Variants:

- `primary`: 메인 액션 (Flame Coral gradient)
- `secondary`: 보조 액션
- `outline`: 테두리 버튼
- `ghost`: 투명 버튼
- `danger`: 위험한 액션

Sizes:

- `sm`: 40px height
- `md`: 48px height (기본값)
- `lg`: 56px height

Features:

- ✅ 타입 안전한 children (ReactNode)
- ✅ Compound variants 지원
- ✅ 일관된 보더 (1.5px)
- ✅ 개선된 disabled 스타일 (opacity: 0.5)
- ✅ 로딩 상태 애니메이션
- ✅ 좌/우 아이콘 지원

### Icon

표준화된 아이콘 시스템 (DES-090~096)

```tsx
import {
  IconWrapper,
  IconButton,
  IconWithText,
  HeartIcon,
  StarIcon,
} from '@/components/ui';

// 기본 아이콘
<HeartIcon size="md" color="flame" />

// 커스텀 아이콘
<IconWrapper size="lg" color="primary" viewBox="0 0 24 24">
  <path d="..." />
</IconWrapper>

// 아이콘 버튼 (44x44px 터치 영역)
<IconButton
  icon={<HeartIcon />}
  onClick={handleClick}
  aria-label="좋아요"
/>

// 아이콘 + 텍스트
<IconWithText
  icon={<HeartIcon size="sm" />}
  iconPosition="left"
  gap={8}
>
  Like
</IconWithText>
```

Sizes:

- `sm`: 16px (인라인 텍스트)
- `md`: 20px (기본값)
- `lg`: 24px (헤더/강조)

Features:

- ✅ 표준화된 3가지 사이즈
- ✅ 일관된 viewBox (0 0 24 24)
- ✅ 고정 strokeWidth (스케일 안함)
- ✅ 수직 정렬 (vertical-align: middle)
- ✅ 최소 터치 영역 44x44px
- ✅ 아이콘-텍스트 gap 8px

Common Icons:

- HeartIcon, StarIcon, SearchIcon
- XIcon, CheckIcon, InfoIcon
- AlertCircleIcon, AlertTriangleIcon
- ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon
- LoaderIcon

### OptimizedImage

개선된 이미지 컴포넌트 (DES-097~104)

```tsx
import { OptimizedImage, ASPECT_RATIOS, IMAGE_SIZES } from '@/components/ui';

<OptimizedImage
  src="/popup-image.jpg"
  alt="Popup event"
  width={640}
  height={360}
  aspectRatio={ASPECT_RATIOS.video}
  sizes={IMAGE_SIZES.card}
  priority // LCP 최적화
  enableRetry
  maxRetries={3}
  skeletonTheme="dark"
  errorFallbackType="image"
  radius="lg"
/>;
```

Props:

- `aspectRatio`: string (e.g., '16/9', '1/1')
- `radius`: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
- `skeletonTheme`: 'dark' | 'light'
- `errorFallbackType`: 'image' | 'avatar' | 'video' | 'thumbnail'
- `enableRetry`: boolean (자동 재시도)
- `maxRetries`: number (기본값: 3)
- `retryDelay`: number (ms, 기본값: 1000)
- `priority`: boolean (LCP 최적화)

ASPECT_RATIOS:

- `square`: '1/1'
- `video`: '16/9'
- `portrait`: '3/4'
- `landscape`: '4/3'
- `ultrawide`: '21/9'

IMAGE_SIZES:

- `card`: '(max-width: 640px) 100vw, 640px'
- `grid2`: Half width on tablet+
- `grid3`: Third width on desktop
- `thumbnail`: '128px'
- `hero`: '100vw'
- `avatar`: '48px'

Features:

- ✅ 기본 aspect ratio 지원
- ✅ CLS 방지 dimensions
- ✅ 테마별 blur placeholder
- ✅ 다크/라이트 스켈레톤
- ✅ priority prop 활용
- ✅ 타입별 에러 아이콘
- ✅ 자동 재시도 로직
- ✅ loading="lazy" 최적화

### Loading Components

#### LoadingSpinner

```tsx
<LoadingSpinner size={40} accentColor={colors.flame[500]} />

<FullPageLoader />
<InlineSpinner size={20} />
```

#### Skeleton

```tsx
// 기본 스켈레톤
<Skeleton width="100%" height={200} radius="lg" variant="shimmer" />
<SkeletonCircle size={40} />
<SkeletonText width="80%" height="16px" />

// 복합 스켈레톤
<SkeletonCard />
<SkeletonProfile />
<SkeletonListItem />

// 페이지 스켈레톤
<SkeletonMainPage />
<SkeletonLivePage />
<SkeletonMapPage />
<SkeletonMePage />
```

## Design Tokens

모든 컴포넌트는 중앙 집중식 디자인 토큰을 사용합니다.

```tsx
import {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  liquidGlass,
  zIndex,
} from '@/lib/design-tokens';

// 색상
colors.flame[500]; // #FF6B5B (Primary)
colors.ember[500]; // #CC4A3A (Secondary)
colors.spark[500]; // #FFD93D (Accent)
colors.text.primary; // #f5f5f5
colors.text.secondary; // #a8a8a8

// 타이포그래피
typography.fontSize.base.size; // '15px'
typography.fontSize.base.lineHeight; // '24px'
typography.fontWeight.semibold; // 600

// Spacing (4px grid)
spacing[1]; // 4px
spacing[2]; // 8px
spacing[4]; // 16px
spacing[8]; // 32px

// Border Radius
radii.sm; // 6px
radii.md; // 10px
radii.lg; // 14px
radii.xl; // 20px
radii['2xl']; // 24px

// Liquid Glass
liquidGlass.standard; // Primary card glass
liquidGlass.intense; // Modal/dialog glass
liquidGlass.deep; // Hero section glass

// Z-index
zIndex.dropdown; // 10
zIndex.modal; // 50
zIndex.tooltip; // 70
```

## 마이그레이션

### Legacy → New

```tsx
// ❌ Old
import { PrimaryButton } from '@/components/cosmic/buttons';
<PrimaryButton>Click</PrimaryButton>

// ✅ New
import { Button } from '@/components/ui';
<Button variant="primary">Click</Button>

// ❌ Old
<span style={{ fontSize: '24px', fontWeight: 700 }}>Title</span>

// ✅ New
import { Heading2 } from '@/components/ui';
<Heading2>Title</Heading2>

// ❌ Old
<div style={{ maxWidth: '1024px', margin: '0 auto', padding: '0 20px' }}>

// ✅ New
import { Container } from '@/components/ui';
<Container size="lg">
```

## 접근성 (Accessibility)

모든 컴포넌트는 접근성을 고려하여 설계되었습니다:

- ✅ Semantic HTML 사용
- ✅ ARIA 속성 지원
- ✅ 키보드 네비게이션
- ✅ 포커스 관리
- ✅ 스크린 리더 지원
- ✅ 색상 대비 4.5:1 이상

```tsx
// 올바른 접근성 사용
<Button
  variant="primary"
  onClick={handleClick}
  aria-label="팝업 참여하기"
>
  참여하기
</Button>

<IconButton
  icon={<HeartIcon />}
  onClick={handleLike}
  aria-label="좋아요" // Required!
/>

<OptimizedImage
  src="/image.jpg"
  alt="팝업 이벤트 이미지" // Required!
  width={640}
  height={480}
/>
```

## 성능 최적화

### Bundle Size

- Tree-shaking 지원
- 개별 컴포넌트 import 가능
- 최소 dependency

```tsx
// ✅ Good - Tree-shakable
import { Button, Typography } from '@/components/ui';

// ❌ Avoid - Imports everything
import * as UI from '@/components/ui';
```

### 이미지 최적화

```tsx
// LCP 이미지 (Above the fold)
<OptimizedImage
  src="/hero.jpg"
  alt="Hero"
  priority // Eager loading
  sizes={IMAGE_SIZES.hero}
/>

// 일반 이미지 (Below the fold)
<OptimizedImage
  src="/content.jpg"
  alt="Content"
  loading="lazy" // Lazy loading (default)
  enableRetry
/>
```

## 개발 가이드

### 새 컴포넌트 추가

1. **Atomic Design 원칙 따르기**
   - Atom: 가장 작은 단위 (Button, Icon)
   - Molecule: Atoms 조합 (IconButton, SearchInput)
   - Organism: Molecules 조합 (PopupCard, Navigation)

2. **TypeScript 타입 정의**

   ```tsx
   export interface MyComponentProps {
     children: ReactNode; // DES-082
     variant?: 'primary' | 'secondary';
     size?: 'sm' | 'md' | 'lg'; // DES-083
     disabled?: boolean; // DES-084
   }
   ```

3. **디자인 토큰 사용**

   ```tsx
   import { colors, spacing, radii } from '@/lib/design-tokens';

   style={{
     padding: spacing[4],
     borderRadius: radii.lg,
     background: colors.flame[500],
   }}
   ```

4. **접근성 고려**

   ```tsx
   <button
     type="button"
     aria-label="Action description"
     aria-pressed={isActive}
     disabled={disabled}
   >
     {children}
   </button>
   ```

5. **Export 추가**
   ```tsx
   // src/components/ui/index.ts
   export { MyComponent } from './MyComponent';
   export type { MyComponentProps } from './MyComponent';
   ```

## 문제 해결

### 일반적인 이슈

**Q: 컴포넌트 import 에러**

```tsx
// ❌ Wrong
import Button from '@/components/ui/Button';

// ✅ Correct
import { Button } from '@/components/ui';
```

**Q: 타입 에러 (children)**

```tsx
// ❌ Wrong
interface Props {
  children: string;
}

// ✅ Correct (DES-082)
interface Props {
  children: ReactNode;
}
```

**Q: Size prop 불일치**

```tsx
// ❌ Wrong
<Button size="medium" />

// ✅ Correct (DES-083)
<Button size="md" />
```

## 지원 환경

- Next.js 15+
- React 18+
- TypeScript 5+
- Modern browsers (Chrome, Firefox, Safari, Edge)

## 참고 자료

- [컴포넌트 계층 구조](./COMPONENT_HIERARCHY.md)
- [디자인 토큰 가이드](/src/lib/design-tokens.ts)
- [Atomic Design](https://atomicdesign.bradfrost.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 업데이트 로그

### v2.0 (2025-12-05)

모든 DES-079~104 이슈 해결:

**컴포넌트**

- ✅ DES-079: 컴포넌트 계층 명확화
- ✅ DES-080: Typography atom 생성
- ✅ DES-081: PopupCard 분리 (이미 완료)
- ✅ DES-082: children 타입 안전성
- ✅ DES-083: size prop API 통일
- ✅ DES-084: disabled 스타일 개선
- ✅ DES-085: compound variants 지원
- ✅ DES-086: 보더 너비 통일 (1.5px)
- ✅ DES-087: Container 컴포넌트
- ✅ DES-088: Grid System
- ✅ DES-089: z-index 문서화 (완료)

**아이콘**

- ✅ DES-090: 사이즈 3종 표준화 (sm/md/lg)
- ✅ DES-091: SVG viewBox 통일
- ✅ DES-092: strokeWidth 고정
- ✅ DES-093: strokeWidth 스케일 안함
- ✅ DES-094: 아이콘-텍스트 gap 통일
- ✅ DES-095: 아이콘 수직 정렬
- ✅ DES-096: 터치 영역 44x44px

**이미지**

- ✅ DES-097: aspect ratio 지원
- ✅ DES-098: CLS 방지
- ✅ DES-099: 테마별 blur placeholder
- ✅ DES-100: 스켈레톤 테마
- ✅ DES-101: priority prop
- ✅ DES-102: 타입별 에러 아이콘
- ✅ DES-103: 재시도 로직
- ✅ DES-104: 로딩 최적화

---

**Maintained by**: ZZIK Development Team
**Last Updated**: 2025-12-05
**Version**: 2.0.0
