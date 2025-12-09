# 🤖 ZZIK Agent System v2.0

> **Claude 4.5 Sonnet 최적화 프론트엔드 개선 에이전트 시스템**
> 
> Ultra Deep Dive 연쇄추론 기반 점진적 개선 워크플로우

---

## 📋 개요

이 에이전트 시스템은 ZZIK 프로젝트의 프론트엔드를 자동으로 분석하고 개선합니다.

### 핵심 기능

- 🔧 **콘솔 오류 자동 수정**: Hydration, i18n, Auth 설정 문제 해결
- 🌙 **다크 모드 일관성**: ZZIK Design System 2.0 기반 스타일 통일
- ♿ **접근성 개선**: WCAG 2.1 AA 기준 자동 검사 및 수정
- 📱 **반응형 최적화**: 모바일 퍼스트 디자인 검증

### 아키텍처 패턴

Anthropic의 "Building Effective Agents" 가이드라인 적용:

1. **Orchestrator-Workers**: 중앙 오케스트레이터가 작업을 분배
2. **Evaluator-Optimizer**: 결과 평가 후 반복 개선
3. **Chain of Thought**: 연쇄추론 기반 의사결정

---

## 🚀 Quick Start

### 전체 에이전트 실행

```bash
cd /home/user/webapp
npx tsx agents/run-agents.ts
```

### 특정 카테고리만 실행

```bash
# 콘솔 오류 수정 에이전트
npx tsx agents/run-agents.ts --category console-fix

# UX/UI 개선 에이전트
npx tsx agents/run-agents.ts --category uxui-improvement
```

### 울트라씽크 모드 (심층 분석)

```bash
npx tsx agents/run-agents.ts --ultrathink
```

---

## 🤖 에이전트 목록

### Console Fix Agents

| ID | Name | Description |
|----|------|-------------|
| `hydration-fix-agent` | 🔧 Hydration Fix | SSR/CSR 불일치 해결 |
| `i18n-fix-agent` | 🌍 i18n Fix | 누락된 번역 키 추가 |
| `auth-config-fix-agent` | 🔐 Auth Config Fix | 인증 설정 폴백 처리 |

### UX/UI Improvement Agents

| ID | Name | Description |
|----|------|-------------|
| `dark-mode-consistency-agent` | 🌙 Dark Mode Consistency | 다크 모드 스타일 통일 |
| `accessibility-agent` | ♿ Accessibility | WCAG 2.1 AA 접근성 |
| `responsive-design-agent` | 📱 Responsive Design | 모바일 퍼스트 최적화 |

---

## 📁 디렉토리 구조

```
agents/
├── core/                           # 핵심 시스템
│   ├── agent-types.ts              # 기본 타입 정의
│   ├── base-agent.ts               # 베이스 에이전트 클래스
│   ├── agent-registry.ts           # 에이전트 레지스트리
│   ├── ultra-deep-dive-types.ts    # 연쇄추론 타입
│   ├── orchestrator.ts             # 오케스트레이터
│   └── index.ts                    # 익스포트
├── console-fix/                    # 콘솔 오류 수정
│   ├── hydration-fix-agent.ts
│   ├── i18n-fix-agent.ts
│   └── auth-config-fix-agent.ts
├── uxui-improvement/               # UX/UI 개선
│   ├── dark-mode-consistency-agent.ts
│   ├── accessibility-agent.ts
│   └── responsive-design-agent.ts
├── run-agents.ts                   # 실행 스크립트
├── ULTRA_AGENT_PROMPT.md           # AI 프롬프트 가이드
└── README.md                       # 이 파일
```

---

## 🌊 개선 웨이브 계획

### Wave 1: Critical Console Errors ⚡
- Hydration 오류 해결
- 누락된 번역 키 추가
- 인증 설정 폴백

### Wave 2: Dark Mode Consistency 🌙
- TouristHomeScreen 다크 모드 변환
- 전체 컴포넌트 배경색 통일

### Wave 3: Accessibility Enhancement ♿
- 이미지 alt 텍스트
- ARIA 레이블
- 포커스 상태

### Wave 4: Responsive Design 📱
- 터치 타겟 최적화 (44px+)
- Safe Area Insets

---

## 🧠 연쇄추론 프로세스

```
OBSERVATION → ANALYSIS → HYPOTHESIS → PLANNING → EVALUATION → REFINEMENT → CONCLUSION
     ↑                                                              │
     └──────────────────────────────────────────────────────────────┘
                              (반복)
```

---

## 📊 발견된 이슈 현황

### 콘솔 오류 (2025-12-09)

| 타입 | 심각도 | 상태 |
|------|--------|------|
| Hydration Mismatch | Critical | 🔧 수정 대기 |
| Missing Translations | Medium | ✅ 일부 수정 |
| Auth Config Warning | High | 🔧 수정 대기 |
| 404 Resources | Medium | 🔍 분석 중 |

### UX/UI 이슈

| 타입 | 심각도 | 상태 |
|------|--------|------|
| Dark Mode Inconsistency | High | 🔧 수정 대기 |
| Missing Alt Text | Medium | 🔍 분석 중 |
| Small Touch Targets | Medium | 🔍 분석 중 |

---

## 🔗 참고 자료

- [Anthropic: Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)
- [Claude 4.5 Best Practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices)
- [ZZIK Design System 2.0](../CLAUDE.md)
- [기존 리팩토링 에이전트](../refactoring-agents/README.md)

---

## 📝 라이선스

MIT License - ZZIK Inc.

---

**Built with 🧠 Ultra Deep Dive reasoning for Claude 4.5 Sonnet**
