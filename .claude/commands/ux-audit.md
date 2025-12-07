---
name: ux-audit
description: BrowserTools MCP로 현재 페이지 UX/UI 감사 실행
arguments:
  - name: url
    description: 감사할 페이지 URL (기본값: http://localhost:3000)
    required: false
---

# UX/UI Audit Command

## Target: $ARGUMENTS.url (기본값: http://localhost:3000)

BrowserTools MCP를 사용하여 현재 페이지의 UX/UI 품질을 감사합니다.

## 사전 요구사항
```bash
# BrowserTools 서버 확인
pnpm mcp:start

# Chrome에서 대상 페이지 열기
# DevTools 열기 (F12)
# BrowserTools 패널 확인
```

## 감사 항목

### 1. 콘솔 로그 검사
도구: `mcp__browser-tools__getConsoleLogs`
- 에러 수집 및 분석
- 경고 확인
- 불필요한 console.log 제거

### 2. 네트워크 분석
도구: `mcp__browser-tools__getNetworkLogs`
- API 응답 시간 확인
- 실패한 요청 식별
- 불필요한 요청 최적화

### 3. 접근성 감사
도구: `mcp__browser-tools__runAccessibilityAudit`
- WCAG 2.1 AA 준수
- 색상 대비
- 키보드 네비게이션
- 스크린 리더 호환성

### 4. 성능 감사
도구: `mcp__browser-tools__runPerformanceAudit`
- Lighthouse 점수
- Core Web Vitals
- 로딩 최적화

### 5. SEO 감사
도구: `mcp__browser-tools__runSEOAudit`
- 메타 태그
- 구조화된 데이터
- 검색 최적화

### 6. 스크린샷
도구: `mcp__browser-tools__takeScreenshot`
- 현재 상태 캡처
- 비교용 저장

## 리포트 템플릿

```markdown
# UX/UI Audit Report
- 검사 일시: {timestamp}
- 대상: {url}

## 점수 요약
| 항목 | 점수 | 상태 |
|------|------|------|
| 접근성 | /100 | |
| 성능 | /100 | |
| SEO | /100 | |

## 발견된 이슈
1. [심각도] {이슈 설명}
   - 해결방안: {solution}

## 권장사항
- {recommendation}
```
