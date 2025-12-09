---
name: ux-audit
description: ZZIK UX/UI 품질 검수. WCAG 2.1, Core Web Vitals, Mobile-first.
---

# UX Audit Checklist

## ZZIK UX Principles

### 1. 원탭 참여 (Zero Friction)

```
Good: 참여하기 (원탭) → 완료
Bad: 가입 → 로그인 → 프로필 → 참여
```

### 2. FOMO 엔진

- Progress Temperature 정확한 표현
- D-Day 카운트다운 명확
- Hot state (70%+)에서 Heat Pulse 애니메이션

### 3. 즉각적 피드백

- 버튼 탭 시 즉시 scale 반응
- 참여 후 즉시 Progress 업데이트
- 성공/실패 토스트 즉시 표시

### 4. 투명한 진행 상황

- "72/100명 참여" 항상 표시
- 마감 시간 명확히 표시
- 상태 변화 실시간 반영

## Accessibility (WCAG 2.1 AA)

### Color Contrast

```yaml
Required:
  - Normal text: 4.5:1
  - Large text: 3:1
  - UI components: 3:1

ZZIK Colors:
  -  #f5f5f5 on #08090a: 18.3:1 ✓
  -  #a8a8a8 on #08090a: 8.5:1 ✓
  -  #FF6B5B on #08090a: 5.2:1 ✓
```

### Touch Targets

```css
/* Minimum 44x44px */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}
```

### Focus States

```css
.focus-visible:ring-2 .focus-visible:ring-zzik-flame
```

### Screen Reader

```tsx
// ARIA labels
<button aria-label="팝업에 참여하기">참여하기</button>

// Live regions
<div role="status" aria-live="polite">
  {`${count}명 참여`}
</div>
```

## Performance (Core Web Vitals)

### LCP (Largest Contentful Paint)

```yaml
Target: < 2.5s
Techniques:
  - Hero image preload
  - Font preload (Inter, Pretendard)
  - Server-side rendering
```

### FID/INP (Interaction)

```yaml
Target: < 100ms
Techniques:
  - Avoid heavy JS on main thread
  - Use React.lazy() for code splitting
  - Defer non-critical scripts
```

### CLS (Cumulative Layout Shift)

```yaml
Target: < 0.1
Techniques:
  - Set image dimensions (aspect-ratio)
  - Reserve space for dynamic content
  - Avoid inserting content above fold
```

## Mobile-First Checklist

### Viewport

```tsx
// Safe area insets
className="pb-safe"  // iOS bottom bar

// Responsive breakpoints
sm: 640px
md: 768px
lg: 1024px
```

### Gestures

- Swipe to dismiss bottom sheets
- Pull to refresh on lists
- Tap, not hover, for primary actions

### Bottom Navigation

- Fixed bottom nav for key actions
- "참여하기" always accessible
- Safe area padding for iPhone

## Component Checklist

### PopupCard

- [ ] Progress Temperature 정확한 색상 (Flame Coral #FF6B5B)
- [ ] Hover/Tap 애니메이션
- [ ] Image lazy loading
- [ ] Skeleton loading state

### ParticipateButton

- [ ] 44px minimum height
- [ ] Disabled state styling
- [ ] Loading spinner
- [ ] Success feedback

### ProgressBar

- [ ] Temperature에 따른 색상/투명도
- [ ] Hot state에서 glow
- [ ] Smooth animation
- [ ] ARIA progressbar role

## Design Check

- [ ] Dark Mode ONLY
- [ ] Flame Coral (#FF6B5B) accent 일관성
- [ ] Liquid Glass Effect 적용
- [ ] 90% Neutral : 10% Accent 비율
- [ ] 로딩 상태 구현
- [ ] 에러 상태 구현

## Audit Commands

### Lighthouse

```bash
npx lighthouse http://localhost:3000 --view
```

### Accessibility

```bash
npx @axe-core/cli http://localhost:3000
```

### Bundle Size

```bash
npx @next/bundle-analyzer
```

## Quality Gates

```yaml
Required:
  - Lighthouse Performance: > 90
  - Lighthouse Accessibility: > 95
  - No critical axe violations
  - No layout shifts > 0.1
  - First load JS < 500KB
```
