# ZZIK Agent Configuration

## Project: Popup Crowdfunding Platform

**Tagline**: "참여하면 열린다" / "Join to Open"

---

## Available Agents

### 1. Frontend Agent

**Trigger**: `UI`, `컴포넌트`, `디자인`, `프론트`, `UX`, `참여하기`
**Tools**: Read, Write, Edit, Glob, Grep, WebSearch
**Model**: opus

```yaml
name: frontend
specialization: ZZIK Design System 2.0
capabilities:
  - Liquid Glass + Flame Coral UI
  - Progress Temperature System
  - PopupCard, ParticipateButton
  - Framer Motion animations
```

### 2. Popup Agent

**Trigger**: `popup`, `팝업`, `펀딩`, `참여`, `캠페인`
**Tools**: All
**Model**: sonnet

```yaml
name: popup
specialization: Popup Crowdfunding Business Logic
capabilities:
  - Participation flow
  - Progress Temperature
  - FOMO engine
  - State management (funding → funded → scheduled → open)
```

### 3. Check-in Agent

**Trigger**: `checkin`, `체크인`, `방문인증`, `QR`, `GPS`
**Tools**: All
**Model**: sonnet

```yaml
name: checkin
specialization: Triple Verification System
capabilities:
  - GPS verification (40%)
  - QR verification (40%)
  - Receipt OCR (20%)
  - Trust score calculation
```

### 4. Leader Agent

**Trigger**: `leader`, `리더`, `인플루언서`, `referral`
**Tools**: All
**Model**: sonnet

```yaml
name: leader
specialization: Influencer & Referral System
capabilities:
  - Referral link generation
  - Commission tracking
  - Leader dashboard
  - Revenue calculation
```

### 5. Quality Agent

**Trigger**: `review`, `audit`, `test`, `security`, `quality`
**Tools**: Bash, Read, Grep, Glob
**Model**: sonnet

```yaml
name: quality
specialization: Code Quality & Security
capabilities:
  - TypeScript strict check
  - ESLint
  - Security audit (OWASP)
  - Test runner
```

### 6. AI/ML Agent

**Trigger**: `gemini`, `ai`, `ml`, `embedding`, `OCR`
**Tools**: Bash, Read, Write, Edit, Glob, Grep
**Model**: sonnet

```yaml
name: aiml
specialization: Gemini + pgvector
capabilities:
  - Receipt OCR
  - Image analysis
  - 768-dim embeddings
  - Recommendation engine
```

### 7. DevOps Agent

**Trigger**: `deploy`, `build`, `ci`, `vercel`, `supabase`
**Tools**: Bash, Read, Write, Edit
**Model**: sonnet

```yaml
name: devops
specialization: Deployment & Infrastructure
capabilities:
  - Vercel deployment
  - Supabase management
  - GitHub Actions
  - Environment configuration
```

### 8. Analyzer Agent

**Trigger**: `분석`, `analyze`, `누락`, `missing`, `개선`, `improve`, `점검`, `check`
**Tools**: All
**Model**: opus

```yaml
name: analyzer
specialization: Code Analysis & Improvement
capabilities:
  - 누락된 기능 탐지
  - 잠재적 오류 분석
  - 개선 기회 식별
  - 불일치 항목 검출
  - 상세 리포트 생성
```

---

## Agent Workflows

### Popup Funding Flow

```
1. [popup] → 펀딩 캠페인 생성/관리
2. [frontend] → UI 구현
3. [quality] → 코드 검증
4. [devops] → 배포
```

### Visit Verification Flow

```
1. [popup] → 목표 달성 확인
2. [checkin] → Triple Verification
3. [aiml] → Receipt OCR (if needed)
4. [leader] → Referral 정산
```

### Design Review Flow

```
1. [frontend] → 컴포넌트 디자인
2. [quality] → 코드 품질 검사
3. [devops] → 빌드 테스트
```

---

## MCP Servers

### Active Servers

| Server        | Command                                      | Purpose         |
| ------------- | -------------------------------------------- | --------------- |
| browser-tools | Native Playwright (see `src/lib/browser-tools.ts`) | 브라우저 자동화 |
| github        | `npx -y @modelcontextprotocol/server-github` | GitHub 연동     |
| memory        | Built-in                                     | Knowledge graph |
| context7      | Built-in                                     | 라이브러리 문서 |
| thinking      | Built-in                                     | 연쇄 추론       |

---

## Skills Reference

### Core Skills

| Skill              | Purpose              |
| ------------------ | -------------------- |
| `zzik-development` | 프로젝트 개발 가이드 |
| `biz-logic`        | 비즈니스 로직        |
| `linear-ui`        | Design System 2.0    |
| `tech-stack`       | 기술 스택            |

### Specialized Skills

| Skill                 | Purpose         |
| --------------------- | --------------- |
| `triple-verification` | 3중 검증 시스템 |
| `framer-animations`   | 애니메이션 패턴 |
| `ux-audit`            | UX 품질 검수    |
| `gemini`              | AI 통합         |

### Analysis Skills

| Skill          | Purpose                  |
| -------------- | ------------------------ |
| `health-check` | 프로젝트 건강 상태 점검  |
| `code-audit`   | 코드 심층 감사 및 리포트 |

---

## Usage Examples

### 팝업 펀딩 기능 개발

```
Use agent: popup
"새로운 펀딩 캠페인 생성 기능 구현"
```

### 디자인 시스템 적용

```
Use agent: frontend
"Progress Temperature 시스템 구현"
```

### 방문 인증 기능

```
Use agent: checkin
"QR 코드 검증 로직 구현"
```

### 전체 품질 검사

```
Use agent: quality
"pnpm type-check && pnpm lint && pnpm test"
```

---

## Brand Colors Reference

```yaml
Flame Coral: '#FF6B5B' # Primary accent
Deep Ember: '#CC4A3A' # Hover/Secondary
Spark Yellow: '#FFD93D' # Leader Premium
Background: '#08090a' # Deep Space
Surface: '#121314' # Cards
```

---

## Key Commands

```bash
pnpm dev          # Development
pnpm build        # Production build
pnpm type-check   # TypeScript
pnpm lint         # ESLint
pnpm test         # Vitest
```

---

_ZZIK | "참여하면 열린다" | Popup Crowdfunding Platform_
