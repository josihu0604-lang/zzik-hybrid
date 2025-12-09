---
name: linear-ui
description: ZZIK Design System 2.0 - Liquid Glass + Flame Coral (#FF6B5B)
---

# ZZIK Design System 2.0

## Brand Identity

```yaml
Name: ZZIK (찍)
Tagline: "참여하면 열린다" / "Join to Open"
Concept: Stamp (도장) + Flame (불꽃)
Story: "찍다" = 참여를 도장처럼 찍다
Theme: Dark Mode ONLY
Aesthetic: Linear 절제 + iOS 26 Liquid Glass + 참여의 열기
```

## Color System

### Base Colors (90%)

```css
--zzik-bg: #08090a; /* Deep Space */
--zzik-surface: #121314; /* Cards */
--zzik-elevated: #1a1c1f; /* Modals */
--zzik-text-primary: #f5f5f5;
--zzik-text-secondary: #a8a8a8;
--zzik-border: #262626;
```

### Accent Colors (10%)

```css
--zzik-flame: #ff6b5b; /* 참여의 열기 (Flame Coral) */
--zzik-ember: #cc4a3a; /* 진한 불꽃 (Deep Ember) */
--zzik-spark: #ffd93d; /* Leader Premium (Electric Yellow) */
```

### Semantic Colors

```css
--zzik-success: #22c55e;
--zzik-error: #ef4444;
--zzik-warning: #f59e0b;
```

## Progress Temperature

```yaml
Cold (0-30%):
  color: 'rgba(255, 107, 91, 0.3)'
  glow: none

Warm (30-70%):
  color: 'rgba(255, 107, 91, 0.6)'
  glow: subtle

Hot (70-99%):
  color: '#FF6B5B'
  glow: '0 0 20px rgba(255, 107, 91, 0.4)'
  animation: heatPulse

Done (100%):
  color: '#22c55e'
  effect: confetti
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

## Typography

```css
font-family: 'Inter', 'Pretendard', system-ui, sans-serif;
letter-spacing: -0.02em;

/* Scale */
--text-display: 36px / 1.15;
--text-h1: 28px / 1.2;
--text-h2: 24px / 1.25;
--text-body: 16px / 1.5;
--text-sm: 14px / 1.5;
--text-xs: 12px / 1.4;
```

## Component Patterns

### ParticipateButton (Primary CTA)

```tsx
<button
  className="
  w-full py-4 rounded-xl font-bold text-white
  bg-zzik-flame hover:bg-zzik-ember
  transition-colors duration-200
  shadow-lg shadow-zzik-flame/20
"
>
  참여하기
</button>
```

### ProgressBar

```tsx
<div className="h-2 bg-white/10 rounded-full overflow-hidden">
  <div
    className="h-full bg-zzik-flame rounded-full"
    style={{
      width: `${progress}%`,
      opacity: getOpacity(temperature),
      boxShadow: temperature === 'hot' ? '0 0 20px rgba(255, 107, 91, 0.4)' : 'none',
    }}
  />
</div>
```

### LeaderBadge (Spark Yellow)

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

## Animation Tokens

```tsx
// Page enter
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}

// Heat pulse (Hot state)
animate={{
  scale: [1, 1.02, 1],
  boxShadow: [
    "0 0 0 rgba(255, 107, 91, 0)",
    "0 0 20px rgba(255, 107, 91, 0.4)",
    "0 0 0 rgba(255, 107, 91, 0)"
  ]
}}
transition={{ repeat: Infinity, duration: 1.5 }}
```

## Rules

1. Dark Mode ONLY
2. Flame Coral (#FF6B5B) as primary accent
3. 90% Neutral : 10% Accent ratio
4. Glass morphism for cards
5. 44x44px minimum touch targets
6. Mobile-first responsive
