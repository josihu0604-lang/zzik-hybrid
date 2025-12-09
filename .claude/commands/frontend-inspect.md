# Frontend Inspection & Enhancement Command

프론트엔드 코드 검수 및 2026 트렌드 기반 개선 자동화

## 검수 워크플로우

### Step 1: 코드 품질 분석

```bash
# TypeScript 타입 체크
SKIP_ENV_VALIDATION=true pnpm tsc --noEmit

# ESLint 검사
pnpm lint

# 번들 사이즈 분석
ANALYZE=true pnpm build
```

### Step 2: 접근성 검사

```bash
# Axe-core 접근성 테스트
npx @axe-core/cli http://localhost:3000 --dir ./reports/accessibility

# 키보드 네비게이션 확인
# - Tab 순서
# - Focus 표시
# - ARIA 라벨
```

### Step 3: 성능 분석

```bash
# Lighthouse 성능 검사
npx lighthouse http://localhost:3000 \
  --output html \
  --output-path ./reports/lighthouse.html

# Core Web Vitals 확인
# - LCP < 2.5s
# - FID < 100ms
# - CLS < 0.1
```

### Step 4: 디자인 일관성 검사

대상 파일:

- `src/app/**/*.tsx`
- `src/components/**/*.tsx`
- `src/styles/**/*.css`

체크 항목:

1. **컬러 시스템**
   - ZZIK 브랜드 컬러 사용 확인
   - 90:10 비율 검증
   - 다크 모드 일관성

2. **타이포그래피**
   - 폰트 위계 (H1 > H2 > Body)
   - 폰트 사이즈 스케일 준수
   - 줄간격 (leading) 확인

3. **스페이싱**
   - 4px/8px 배수 확인
   - padding/margin 일관성
   - gap 사용 권장

4. **컴포넌트 패턴**
   - 호버/액티브 상태
   - 로딩 상태 (Skeleton)
   - 에러 상태

## 자동 개선 영역

### 필수 수정 (Auto-fix)

- 미사용 import 제거
- 콘솔 로그 제거
- 타입 에러 수정
- 접근성 필수 속성 추가

### 권장 개선 (Suggest)

- 성능 최적화 (memo, lazy)
- 애니메이션 개선
- 반응형 보완
- 코드 분할

## 검사 대상 페이지

| 페이지        | 경로          | 우선순위 |
| ------------- | ------------- | -------- |
| 홈            | `/`           | Critical |
| 팝업 상세     | `/popup/[id]` | High     |
| 지도          | `/map`        | High     |
| 프로필        | `/me`         | Medium   |
| 리더 대시보드 | `/leader`     | Medium   |

## 출력 형식

```markdown
## 검수 리포트 - [날짜]

### Critical Issues

- [ ] 문제 설명 및 위치

### Improvements

- [ ] 개선 권장 사항

### 2026 Trend Score

- Spatial Design: X/10
- Typography: X/10
- Motion: X/10
- Overall: X/10
```

## 관련 Skills

- `design-2026`: 2026 트렌드 가이드
- `frontend-design`: 디자인 시스템
- `accessibility`: WCAG 2.1 체크리스트
- `performance`: Core Web Vitals 최적화
- `animations`: Framer Motion 패턴

## 실행

이 커맨드 실행 시:

1. 모든 .tsx 파일 스캔
2. 디자인 토큰 사용 확인
3. 2026 트렌드 적합성 평가
4. 개선 사항 리포트 생성
5. 자동 수정 가능한 항목 처리
