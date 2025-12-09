---
name: redesign-page
description: ZZIK Linear Deep Space + Orange Point 스타일로 페이지 리디자인
arguments:
  - name: page
    description: 리디자인할 페이지 경로 (예: /login, /checkin, /dashboard)
    required: true
---

# Page Redesign Command

페이지를 ZZIK Linear Deep Space + Orange Point 디자인 시스템으로 리디자인합니다.

## Target Page: $ARGUMENTS.page

## Design Tokens

```css
/* Brand Color (ONLY use this for accents) */
--linear-orange: #ea8c15;
--linear-orange-hover: #f5a623;
--linear-orange-subtle: rgba(234, 140, 21, 0.15);

/* Backgrounds */
--linear-bg: #08090A;
--linear-bg-subtle: #0C0E10;
--linear-bg-muted: #121315;

/* Text */
--linear-text-primary: rgba(255, 255, 255, 0.95);
--linear-text-secondary: rgba(255, 255, 255, 0.7);
--linear-text-tertiary: rgba(255, 255, 255, 0.5);

/* Glass Effect */
--glass-bg: linear-gradient(135deg, rgba(18, 19, 20, 0.9) 0%, rgba(8, 9, 10, 0.95) 100%);
--glass-border: 1px solid rgba(255, 255, 255, 0.06);
--glass-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.06);
```

## Redesign Checklist

### 1. 레이아웃 구조
- [ ] 배경: `style={{ background: '#08090A' }}`
- [ ] FloatingOrb 배경 요소 추가 (Orange 색상)
- [ ] 컨테이너: `relative z-10`

### 2. 컴포넌트 변환
- [ ] 버튼 → Orange gradient CTA
- [ ] 카드 → Glass Card with backdrop-blur
- [ ] 입력 → Orange focus ring
- [ ] 배지 → Orange/Success/Warning variants

### 3. 타이포그래피
- [ ] 제목: `font-bold text-white`
- [ ] 본문: `text-white/80`
- [ ] 강조: `text-[#ea8c15]` (Orange Point)

### 4. 애니메이션
- [ ] 페이지 진입: `initial={{ opacity: 0, y: 20 }}`
- [ ] 요소 stagger: `transition={{ delay: index * 0.1 }}`
- [ ] 버튼: `whileHover={{ scale: 1.02 }}` with orange glow
- [ ] 숫자: AnimatedCounter

### 5. 반응형
- [ ] 모바일 기준 (390px)
- [ ] 터치 타겟 44x44px
- [ ] Safe area padding

### 6. 상태 처리
- [ ] 로딩 상태: Orange spinner
- [ ] 에러 상태: 에러 메시지 + 재시도 버튼
- [ ] 빈 상태: 적절한 안내 메시지

## 실행 순서
1. 현재 페이지 코드 읽기
2. 디자인 시스템 적용 계획 수립
3. 컴포넌트별 변환 진행
4. 애니메이션 추가
5. 반응형 확인
6. TypeScript 에러 확인

## IMPORTANT
- **Orange (#ea8c15)** as primary accent
- **NEVER** use coral, cyan, violet (old design system)
- **Dark Mode ONLY** - No light theme
