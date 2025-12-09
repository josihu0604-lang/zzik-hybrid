---
name: tailwind-plus-workflow
description: Tailwind Plus + BrowserTools MCP 통합 디자인 워크플로우. UI Blocks, Catalyst, 실시간 품질 검증.
---

# Tailwind Plus + BrowserTools MCP Workflow

## Overview

Tailwind Plus 유료 기능과 BrowserTools MCP를 통합한 지능형 디자인 개발 워크플로우.

```
┌─────────────────────────────────────────────────────────────┐
│                    DESIGN WORKFLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. UI Block 선택 ──► 2. 코드 적용 ──► 3. 실시간 검증      │
│        │                    │                │              │
│        ▼                    ▼                ▼              │
│  Tailwind Plus         Catalyst         BrowserTools       │
│  500+ Blocks           Components       MCP Audit          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 1: Tailwind Plus UI Blocks

### 1.1 Available Categories (500+ Components)

#### Marketing Blocks
| Category | Components | Use Case |
|----------|------------|----------|
| Hero Sections | 12 | 랜딩 페이지 히어로 |
| Feature Sections | 15 | 기능 소개 |
| CTA Sections | 11 | 행동 유도 |
| Pricing | 12 | 가격표 |
| Testimonials | 8 | 후기/리뷰 |
| FAQ | 7 | 자주 묻는 질문 |
| Footer | 7 | 푸터 |
| Newsletter | 6 | 뉴스레터 구독 |
| Team | 9 | 팀 소개 |
| Stats | 8 | 통계 수치 |
| Bento Grid | 3 | 벤토 그리드 레이아웃 |

#### Application UI Blocks
| Category | Components | Use Case |
|----------|------------|----------|
| Tables | 8 | 데이터 테이블 |
| Forms | 12 | 입력 폼 레이아웃 |
| Modals | 6 | 모달 다이얼로그 |
| Navbars | 10 | 네비게이션 |
| Sidebars | 8 | 사이드바 |
| Command Palettes | 4 | 검색/명령 팔레트 |
| Feeds | 6 | 피드/타임라인 |

#### Ecommerce Blocks
| Category | Components | Use Case |
|----------|------------|----------|
| Product Overview | 8 | 상품 상세 |
| Product List | 10 | 상품 목록 |
| Shopping Cart | 6 | 장바구니 |
| Checkout | 8 | 결제 폼 |
| Reviews | 5 | 상품 리뷰 |

### 1.2 Code Formats

Tailwind Plus 제공 형식:
- **React** (with Headless UI) - 권장
- **Vue** (with Headless UI)
- **HTML** (with Tailwind Plus Elements) - 새로운 vanilla JS 지원

### 1.3 New Features (2025)

1. **Dark Mode Support** - 모든 블록에 다크모드 지원
2. **Tailwind Plus Elements** - React/Vue 없이 인터랙티브 컴포넌트
3. **Bento Grid Layouts** - 트렌디한 그리드 레이아웃
4. **Glass Card Effects** - 글래스모피즘 디자인

---

## Part 2: Catalyst UI Kit (프로젝트 설치됨)

### 2.1 설치된 컴포넌트 (30개)

```
src/components/catalyst/
├── alert.tsx         # 알림 메시지
├── avatar.tsx        # 사용자 아바타
├── badge.tsx         # 배지/태그
├── button.tsx        # 버튼 (12KB - 가장 큼)
├── checkbox.tsx      # 체크박스
├── combobox.tsx      # 콤보박스/자동완성
├── description-list.tsx  # 설명 목록
├── dialog.tsx        # 모달 다이얼로그
├── divider.tsx       # 구분선
├── dropdown.tsx      # 드롭다운 메뉴
├── fieldset.tsx      # 폼 필드셋
├── heading.tsx       # 제목
├── input.tsx         # 텍스트 입력
├── link.tsx          # 링크
├── listbox.tsx       # 리스트박스
├── navbar.tsx        # 네비게이션 바
├── pagination.tsx    # 페이지네이션
├── radio.tsx         # 라디오 버튼
├── select.tsx        # 셀렉트박스
├── sidebar.tsx       # 사이드바
├── sidebar-layout.tsx    # 사이드바 레이아웃
├── stacked-layout.tsx    # 스택 레이아웃
├── switch.tsx        # 토글 스위치
├── table.tsx         # 테이블
├── text.tsx          # 텍스트
├── textarea.tsx      # 텍스트에어리어
└── index.ts          # 내보내기
```

### 2.2 사용 예시

```tsx
import {
  Button,
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogActions,
} from '@/components/catalyst';

function Example() {
  return (
    <Dialog open={isOpen} onClose={setIsOpen}>
      <DialogTitle>확인</DialogTitle>
      <DialogDescription>
        정말 삭제하시겠습니까?
      </DialogDescription>
      <DialogBody>
        <p>이 작업은 되돌릴 수 없습니다.</p>
      </DialogBody>
      <DialogActions>
        <Button plain onClick={() => setIsOpen(false)}>
          취소
        </Button>
        <Button color="red" onClick={handleDelete}>
          삭제
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

---

## Part 3: BrowserTools MCP Integration

### 3.1 실시간 디자인 검증 도구

| Tool | Purpose | Command |
|------|---------|---------|
| `getConsoleLogs` | JS 에러 수집 | 콘솔 에러 0개 확인 |
| `getNetworkLogs` | API 요청 분석 | 네트워크 에러 확인 |
| `takeScreenshot` | 스크린샷 캡처 | 시각적 기록 |
| `runAccessibilityAudit` | WCAG 검사 | 접근성 90+ 목표 |
| `runPerformanceAudit` | Lighthouse 성능 | Performance 90+ 목표 |
| `runSEOAudit` | SEO 검사 | SEO 90+ 목표 |
| `runBestPracticesAudit` | 웹 표준 | Best Practices 확인 |
| `runDebuggerMode` | 전체 디버깅 | 모든 디버깅 순차 실행 |
| `runAuditMode` | 전체 감사 | 모든 감사 순차 실행 |

### 3.2 검증 기준

```yaml
Performance:
  LCP: < 2.5s (Largest Contentful Paint)
  FID: < 100ms (First Input Delay)
  CLS: < 0.1 (Cumulative Layout Shift)
  TTI: < 3.8s (Time to Interactive)

Accessibility (WCAG 2.1 AA):
  - 색상 대비: 4.5:1 이상
  - 터치 타겟: 44x44px 이상
  - alt 텍스트: 모든 이미지
  - 키보드 접근: 모든 인터랙티브 요소

SEO:
  - meta title/description
  - Open Graph 태그
  - 구조화된 데이터
```

---

## Part 4: Integrated Workflow

### 4.1 디자인 개발 플로우

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  STEP 1: UI Block 선택                                       │
│  ────────────────────                                        │
│  Tailwind Plus에서 적절한 UI Block 선택                      │
│  https://tailwindcss.com/plus/ui-blocks                      │
│                                                              │
│  STEP 2: ZZIK 테마 적용                                      │
│  ─────────────────────                                       │
│  - bg-linear-bg (#08090a)                                    │
│  - text-linear-orange (#ea8c15)                              │
│  - glass-card 클래스 사용                                    │
│                                                              │
│  STEP 3: Catalyst 컴포넌트 활용                              │
│  ──────────────────────────                                  │
│  import { Button, Dialog, ... } from '@/components/catalyst' │
│                                                              │
│  STEP 4: 실시간 검증                                         │
│  ───────────────────                                         │
│  BrowserTools MCP로 콘솔/네트워크/접근성 확인                │
│                                                              │
│  STEP 5: 품질 감사                                           │
│  ─────────────                                               │
│  runAuditMode로 전체 품질 검사                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Quick Commands

```bash
# 1. 개발 서버 시작
pnpm dev

# 2. BrowserTools 서버 시작 (별도 터미널)
npx @agentdeskai/browser-tools-server@latest

# 3. Chrome에서 개발 페이지 열기
# Chrome DevTools > BrowserToolsMCP 패널 열기

# 4. Claude Code에서 검증
# "이 페이지의 접근성을 검사해줘"
# "콘솔 에러 확인해줘"
# "성능 감사 실행해줘"
```

### 4.3 자동화 스크립트

```json
// package.json에 추가
{
  "scripts": {
    "uxui:audit": "echo 'BrowserTools MCP로 감사 실행'",
    "uxui:screenshot": "echo 'BrowserTools로 스크린샷 캡처'"
  }
}
```

---

## Part 5: ZZIK Hybrid 적용 가이드

### 5.1 컴포넌트 매핑

| ZZIK 페이지 | Tailwind Plus Block | Catalyst 컴포넌트 |
|------------|---------------------|-------------------|
| 홈 | Hero + Stats | Button, Badge |
| 로그인 | Sign-in Form | Input, Button |
| 지도 | Map + Sidebar | Sidebar, Dropdown |
| 대시보드 | Stats + Table | Table, Badge, Avatar |
| 체크인 | Form + Progress | Input, Button, Dialog |
| 프로필 | Profile + Settings | Avatar, Switch, Fieldset |

### 5.2 디자인 토큰 (ZZIK)

```css
/* 필수 색상 */
--linear-bg: #08090a;
--linear-orange: #ea8c15;
--linear-orange-hover: #f5a623;
--glass-bg: rgba(8, 9, 10, 0.8);
--glass-border: rgba(255, 255, 255, 0.06);

/* 필수 클래스 */
.glass-card { /* 글래스 카드 */ }
.btn-primary { /* 주황 그라데이션 버튼 */ }
.btn-secondary { /* 글래스 버튼 */ }
.input { /* 입력 필드 */ }
.badge-orange { /* 주황 배지 */ }
```

### 5.3 접근성 체크리스트

- [ ] 모든 버튼에 aria-label
- [ ] 모든 이미지에 alt
- [ ] 폼 필드에 label 연결
- [ ] 색상 대비 4.5:1+
- [ ] 키보드 탐색 가능
- [ ] 포커스 표시 명확

---

## Part 6: Templates

### 6.1 사용 가능한 템플릿

| Template | Type | Use Case |
|----------|------|----------|
| Spotlight | Personal | 개인 포트폴리오 |
| Radiant | SaaS | SaaS 마케팅 |
| Compass | Course | 온라인 강좌 |
| Salient | SaaS | SaaS 마케팅 |
| Studio | Agency | 에이전시 |
| Protocol | API | API 문서 |
| Syntax | Docs | 기술 문서 |

### 6.2 템플릿 적용 가이드

```bash
# 1. 템플릿 다운로드 (Tailwind Plus 계정 로그인 필요)
# https://tailwindcss.com/plus/templates

# 2. 필요한 컴포넌트 추출

# 3. ZZIK 테마 적용
# - 색상 변경
# - 폰트 변경
# - 간격 조정
```

---

## Quick Reference

### BrowserTools MCP 도구 요약

```
디버깅:
- getConsoleLogs: 콘솔 로그
- getNetworkLogs: 네트워크 요청
- takeScreenshot: 스크린샷

감사:
- runAccessibilityAudit: 접근성
- runPerformanceAudit: 성능
- runSEOAudit: SEO
- runBestPracticesAudit: 웹 표준

통합:
- runDebuggerMode: 전체 디버깅
- runAuditMode: 전체 감사
```

### Tailwind Plus 접근

```
URL: https://tailwindcss.com/plus
UI Blocks: https://tailwindcss.com/plus/ui-blocks
Templates: https://tailwindcss.com/plus/templates
Changelog: https://tailwindcss.com/plus/changelog
```

---

*Tailwind Plus + BrowserTools MCP Integrated Workflow*
*ZZIK Hybrid V2 Design System*
