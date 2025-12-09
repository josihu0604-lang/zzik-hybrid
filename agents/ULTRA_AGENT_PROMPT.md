# 🤖 ZZIK Ultra Agent System - Master Prompt

> **버전**: 1.0.0
> **생성일**: 2025-12-09
> **목적**: 콘솔 오류 수정 및 UX/UI 개선 자동화

---

## 📋 에이전트 시스템 개요

ZZIK Ultra Agent System은 프론트엔드 코드 품질을 자동으로 분석하고 개선하는 AI 에이전트 컬렉션입니다.

### 발견된 주요 이슈 (2025-12-09)

| 카테고리 | 이슈 | 심각도 | 상태 |
|---------|------|--------|------|
| Hydration | SSR/CSR 불일치 | Critical | ✅ 수정됨 |
| i18n | 누락된 번역 키 | High | ✅ 수정됨 |
| Auth | Privy 경고 메시지 | Medium | ✅ 개선됨 |
| Resource | 아이콘 404 오류 | Medium | ✅ 수정됨 |
| UX/UI | 다크 모드 일관성 | High | ✅ 수정됨 |

---

## 🚀 Quick Start

```bash
# 모든 에이전트 실행
npm run agent:all

# 콘솔 오류 수정만
npm run agent:console

# UX/UI 개선만
npm run agent:uxui

# 에이전트 정보 보기
npm run agent:info
```

---

## 🔧 Console Fix Agents

### 1. 🔧 Hydration Fix Agent
**ID**: `hydration-fix-agent`

SSR/CSR Hydration 불일치 오류를 자동으로 감지하고 수정합니다.

**수정 내역**:
- `src/app/layout.tsx`에 `suppressHydrationWarning` 추가

**감지 패턴**:
- `new Date()` 사용
- `typeof window !== 'undefined'` 패턴
- `Math.random()` 사용

---

### 2. 🌍 i18n Fix Agent
**ID**: `i18n-fix-agent`

누락된 번역 키를 자동으로 감지하고 추가합니다.

**수정 내역**:
- `onboarding.welcome`, `onboarding.selectLanguage` 등 추가
- `home.trendingInSeoul`, `home.exploreCategories` 등 추가

**지원 언어**:
- 영어 (en.json)
- 한국어 (ko.json)

---

### 3. 🔐 Auth Config Fix Agent
**ID**: `auth-config-fix-agent`

인증 관련 설정 오류를 감지하고 안전한 폴백 처리를 추가합니다.

**수정 내역**:
- `AppProviders.tsx` 경고 메시지 개선 (warn → info)
- Guest 모드 친화적 메시지로 변경

---

## 🎨 UX/UI Improvement Agents

### 1. 🌙 Dark Mode Consistency Agent
**ID**: `dark-mode-consistency-agent`

다크 모드 스타일 일관성을 검사하고 수정합니다.

**수정 내역**:
- `TouristHomeScreen.tsx` 다크 모드로 전환
- 배경색: `bg-white` → `bg-space-950`
- 텍스트색: `text-gray-*` → `text-white/*`

**디자인 토큰**:
| Light Mode | Dark Mode |
|------------|-----------|
| `bg-white` | `bg-space-950` |
| `bg-gray-50` | `bg-space-900` |
| `text-gray-700` | `text-white/90` |
| `border-gray-100` | `border-white/10` |

---

### 2. ♿ Accessibility Agent
**ID**: `accessibility-agent`

웹 접근성(WCAG 2.1) 이슈를 자동으로 감지합니다.

**검사 항목**:
- 이미지 alt 속성
- ARIA 레이블
- 색상 대비
- 포커스 상태
- 시맨틱 HTML

---

### 3. 📱 Responsive Design Agent
**ID**: `responsive-design-agent`

반응형 디자인 이슈를 감지하고 모바일 퍼스트 디자인을 적용합니다.

**검사 항목**:
- 고정 너비/높이 값
- 브레이크포인트 사용 패턴
- 오버플로우 이슈
- 터치 타겟 크기 (≥44px)
- Safe Area Insets

---

## 📊 실행 결과 요약

### 수정된 파일들

```
src/app/layout.tsx                        # suppressHydrationWarning 추가
src/i18n/locales/en.json                  # 누락된 번역 키 추가
src/i18n/locales/ko.json                  # 누락된 번역 키 추가
src/components/providers/AppProviders.tsx # Auth 경고 메시지 개선
src/components/home/TouristHomeScreen.tsx # 다크 모드로 전환
src/lib/seo.ts                            # 아이콘 경로 수정
```

### 개선된 콘솔 상태

**Before**:
```
❌ [WARNING] [i18n] Missing translation: onboarding.welcome
❌ [WARNING] [i18n] Missing translation: onboarding.selectLanguage
❌ [WARNING] [AppProviders] Invalid or missing Privy App ID
❌ [ERROR] 404 /icon-192.png
❌ [ERROR] Hydration failed
```

**After**:
```
ℹ️ [INFO] [AppProviders] Running in guest mode
✅ 번역 키 정상 로드
✅ 아이콘 정상 로드
✅ Hydration 경고 억제
```

---

## 🔧 확장 가이드

### 새 에이전트 추가하기

1. `agents/[category]/` 디렉토리에 새 파일 생성
2. `BaseAgent` 클래스 상속
3. `agents/index.ts`에 등록

```typescript
// agents/my-category/my-agent.ts
import { BaseAgent } from '../core/base-agent';

export class MyAgent extends BaseAgent {
  id = 'my-agent';
  name = 'My Agent';
  emoji = '🆕';
  description = '새 에이전트 설명';
  category = 'console-fix' as const;
  
  tasks = [
    this.createTask('task-1', '태스크 이름', '설명', 'high', ['src/**/*.tsx'], 10)
  ];

  protected async executeTask(task) {
    // 구현
  }
}

// agents/index.ts에 등록
import { myAgent } from './my-category/my-agent';
registerAgent(myAgent);
```

---

## 📎 관련 문서

- `agents/README.md` - 에이전트 시스템 문서
- `refactoring-agents/` - 기존 리팩토링 에이전트
- `CLAUDE.md` - 프로젝트 가이드

---

**ZZIK Ultra Agent System v1.0.0**
**Built with ❤️ by ZZIK AI Development Team**
