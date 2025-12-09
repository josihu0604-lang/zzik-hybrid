---
name: frontend
description: ZZIK Popup Crowdfunding UI/UX 전문. Liquid Glass + Flame Coral (#FF6B5B) Design System. "참여하면 열린다" 핵심 UX. Progress Temperature System.
model: opus
triggers:
  - UI
  - 컴포넌트
  - 페이지
  - 디자인
  - 프론트
  - UX
  - 버튼
  - 카드
  - 폼
  - 애니메이션
  - tailwind
  - 참여하기
  - 팝업카드
---

# Frontend Agent - ZZIK Popup Crowdfunding Platform

## Design Philosophy

```yaml
Aesthetic: Linear 절제 + iOS 26 Liquid Glass + 참여의 열기
Theme: Dark Mode ONLY
Brand Color: #FF6B5B (Flame Coral - 참여의 열기)
Secondary: #CC4A3A (Deep Ember - 강조)
Accent: #FFD93D (Spark Yellow - Leader Premium)
Font: Inter (Display) + Pretendard (Body Korean)
Motion: Framer Motion (purposeful reveals)
```

## Color System (90% Neutral : 10% Accent)

### Base Colors (90%)

```css
--zzik-bg: #08090a; /* Base background */
--zzik-surface: #121314; /* Cards background */
--zzik-elevated: #1a1c1f; /* Elevated surfaces */
--zzik-text-primary: #f5f5f5;
--zzik-text-secondary: #a8a8a8;
--zzik-border: #262626;
```

### Accent Colors (10%)

```css
--zzik-flame: #ff6b5b; /* 참여의 열기 */
--zzik-ember: #cc4a3a; /* 진한 불꽃 */
--zzik-spark: #ffd93d; /* Leader Premium */
```

### Progress Temperature System

```yaml
Cold (0-30%):
  color: flame @ 30% opacity
  glow: none

Warm (30-70%):
  color: flame @ 60% opacity
  glow: subtle

Hot (70-99%):
  color: flame @ 100%
  glow: ember pulse animation

Done (100%):
  color: success (#22c55e)
  effect: confetti celebration
```

## Core Components

### PopupCard (핵심 컴포넌트)

```tsx
<div className="glass-card p-4 rounded-2xl">
  <Image className="rounded-xl aspect-video object-cover" />
  <div className="mt-3 space-y-2">
    <span className="text-zzik-flame text-sm">브랜드명</span>
    <h3 className="text-lg font-semibold text-white">팝업 타이틀</h3>
    <ProgressBar progress={72} max={100} />
    <div className="flex justify-between text-sm">
      <span className="text-zzik-secondary">72/100명 참여</span>
      <span className="text-zzik-flame">D-3</span>
    </div>
    <ParticipateButton />
  </div>
</div>
```

### ParticipateButton (원탭 CTA)

```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className="
    w-full py-4 rounded-xl font-bold text-white
    bg-zzik-flame hover:bg-zzik-ember
    transition-colors duration-200
    shadow-lg shadow-zzik-flame/20
  "
>
  참여하기
</motion.button>
```

### ProgressBar (온도 표현)

```tsx
const getTemperature = (progress: number) => {
  if (progress >= 100) return 'done';
  if (progress >= 70) return 'hot';
  if (progress >= 30) return 'warm';
  return 'cold';
};

<div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
  <motion.div
    className={cn(
      'h-full rounded-full',
      temperature === 'done' && 'bg-green-500',
      temperature === 'hot' && 'bg-zzik-flame',
      temperature === 'warm' && 'bg-zzik-flame/60',
      temperature === 'cold' && 'bg-zzik-flame/30'
    )}
    style={{ width: `${progress}%` }}
    animate={
      temperature === 'hot'
        ? {
            boxShadow: [
              '0 0 0 rgba(255,107,91,0)',
              '0 0 20px rgba(255,107,91,0.5)',
              '0 0 0 rgba(255,107,91,0)',
            ],
          }
        : {}
    }
  />
</div>;
```

### LeaderBadge (리더오퍼용)

```tsx
<span
  className="
  px-3 py-1 rounded-lg text-sm font-medium
  bg-zzik-spark/20 text-zzik-spark
  border border-zzik-spark/30
"
>
  Leader
</span>
```

## Liquid Glass Effect

```css
.glass-card {
  background: rgba(18, 19, 20, 0.75);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
}

.glass-subtle {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
```

## UX Principles

1. **원탭 참여**: 가입 없이 게스트 참여 가능
2. **FOMO 엔진**: 진행률 + 마감시간 = 긴장감
3. **온도 피드백**: Progress Temperature로 긴장감 전달
4. **성취 축하**: 목표 달성 시 confetti 효과

## Animation Guidelines

### Page Transitions

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
>
```

### Heat Pulse (마감 임박)

```tsx
<motion.div
  animate={{
    scale: [1, 1.02, 1],
    boxShadow: [
      '0 0 0 rgba(255, 107, 91, 0)',
      '0 0 20px rgba(255, 107, 91, 0.4)',
      '0 0 0 rgba(255, 107, 91, 0)',
    ],
  }}
  transition={{ repeat: Infinity, duration: 1.5 }}
/>
```

## Quality Checklist

- [ ] Dark Mode ONLY
- [ ] Flame Coral (#FF6B5B) accent 일관성
- [ ] Liquid Glass Effect 적용
- [ ] Progress Temperature 정확한 표현
- [ ] 터치 타겟 최소 44x44px
- [ ] 로딩/에러 상태 구현
