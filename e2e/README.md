# E2E Tests - ZZIK Hybrid V2

End-to-End 테스트 스위트입니다. Playwright를 사용하여 전체 사용자 플로우를 테스트합니다.

## 📋 목차

- [개요](#개요)
- [설치](#설치)
- [실행 방법](#실행-방법)
- [테스트 구조](#테스트-구조)
- [작성된 테스트](#작성된-테스트)
- [헬퍼 유틸리티](#헬퍼-유틸리티)
- [베스트 프랙티스](#베스트-프랙티스)

## 개요

이 E2E 테스트 스위트는 다음을 테스트합니다:

- ✅ **Review System**: 리뷰 작성, 수정, 삭제, 상호작용
- ✅ **Social Features**: 프로필, 팔로우, 피드, 알림
- ✅ **Gamification**: 포인트, 뱃지, 리더보드, 업적
- ✅ **Payment Integration**: Z-Point 지갑, 충전, 거래내역
- ✅ **Mobile Responsiveness**: 모바일 뷰포트 테스트

## 설치

Playwright가 이미 설치되어 있습니다. 브라우저를 설치하려면:

```bash
pnpm exec playwright install
```

특정 브라우저만 설치:

```bash
pnpm exec playwright install chromium
pnpm exec playwright install webkit
pnpm exec playwright install firefox
```

## 실행 방법

### 기본 실행 (헤드리스 모드)

```bash
pnpm test:e2e
```

### UI 모드 (추천)

테스트를 시각적으로 디버깅:

```bash
pnpm test:e2e:ui
```

### 헤드 모드 (브라우저 표시)

```bash
pnpm test:e2e:headed
```

### 특정 테스트 파일 실행

```bash
pnpm exec playwright test review-system.spec.ts
pnpm exec playwright test social-features.spec.ts
pnpm exec playwright test gamification-system.spec.ts
pnpm exec playwright test payment-integration.spec.ts
```

### 특정 브라우저에서 실행

```bash
pnpm exec playwright test --project=chromium
pnpm exec playwright test --project=mobile-chrome
```

### 디버그 모드

```bash
pnpm exec playwright test --debug
```

### 태그로 필터링

```bash
pnpm exec playwright test --grep @smoke
pnpm exec playwright test --grep @critical
```

## 테스트 구조

```
e2e/
├── helpers/
│   ├── test-utils.ts         # 공통 유틸리티 함수
│   └── mock-data.ts           # 테스트 데이터 생성
├── review-system.spec.ts      # 리뷰 시스템 테스트
├── social-features.spec.ts    # 소셜 기능 테스트
├── gamification-system.spec.ts # 게이미피케이션 테스트
├── payment-integration.spec.ts # 결제 통합 테스트
└── README.md                  # 이 파일
```

## 작성된 테스트

### 1. Review System (`review-system.spec.ts`)

**테스트 시나리오:**
- ✅ 리뷰 폼 표시
- ✅ 유효한 데이터로 리뷰 작성
- ✅ 빈 리뷰 유효성 검증
- ✅ 최소 글자 수 검증
- ✅ 임시 저장 기능
- ✅ 리뷰 좋아요/좋아요 취소
- ✅ 답글 작성
- ✅ 별점별 필터링
- ✅ 정렬 (최신순, 인기순)
- ✅ 평균 평점 표시
- ✅ 모바일 반응형

**실행:**
```bash
pnpm exec playwright test review-system.spec.ts
```

### 2. Social Features (`social-features.spec.ts`)

**테스트 시나리오:**
- ✅ 프로필 정보 표시
- ✅ 프로필 통계 (팔로워, 팔로잉, 리뷰)
- ✅ 프로필 수정
- ✅ 사용자 팔로우/언팔로우
- ✅ 팔로워/팔로잉 목록
- ✅ 사용자 검색
- ✅ 소셜 피드 표시
- ✅ 피드 아이템 좋아요
- ✅ 피드 댓글 작성
- ✅ 무한 스크롤
- ✅ 추천 사용자
- ✅ 알림 시스템

**실행:**
```bash
pnpm exec playwright test social-features.spec.ts
```

### 3. Gamification System (`gamification-system.spec.ts`)

**테스트 시나리오:**
- ✅ 포인트 표시 및 분석
- ✅ 포인트 히스토리
- ✅ 포인트 획득 애니메이션
- ✅ 레벨 및 진행 상황
- ✅ 뱃지 컬렉션
- ✅ 획득/미획득 뱃지 구분
- ✅ 뱃지 상세 정보
- ✅ 뱃지 카테고리 필터
- ✅ 리더보드 표시
- ✅ 사용자 순위
- ✅ 현재 사용자 강조
- ✅ 기간별 리더보드 (주간, 월간, 전체)
- ✅ 업적 시스템
- ✅ 업적 보상 클레임
- ✅ 연속 출석 스트릭
- ✅ 도전 과제

**실행:**
```bash
pnpm exec playwright test gamification-system.spec.ts
```

### 4. Payment Integration (`payment-integration.spec.ts`)

**테스트 시나리오:**
- ✅ 지갑 잔액 표시
- ✅ 지갑 주소 표시 및 복사
- ✅ 충전 모달 열기
- ✅ 충전 금액 옵션
- ✅ 커스텀 금액 입력
- ✅ 최소 충전 금액 검증
- ✅ 결제 수단 선택
- ✅ 충전 플로우 완료
- ✅ 거래 내역 표시
- ✅ 거래 상세 정보
- ✅ 거래 타입별 필터링
- ✅ 거래 검색
- ✅ 영수증 표시
- ✅ 저장된 결제 수단
- ✅ 결제 수단 추가
- ✅ 기본 결제 수단 설정
- ✅ 결제 수단 삭제
- ✅ Z-Point 사용
- ✅ 사용 통계
- ✅ 사용 한도 설정

**실행:**
```bash
pnpm exec playwright test payment-integration.spec.ts
```

## 헬퍼 유틸리티

### `test-utils.ts`

공통 테스트 함수들:

```typescript
import { waitForElement, fillFormField, verifyToast } from './helpers/test-utils';

// 엘리먼트 대기
const button = await waitForElement(page, '[data-testid="submit"]');

// 폼 필드 채우기
await fillFormField(page, '[data-testid="email"]', 'test@example.com');

// Toast 메시지 검증
await verifyToast(page, '성공적으로 저장되었습니다', 'success');
```

**주요 함수:**
- `waitForElement()` - 엘리먼트가 보일 때까지 대기
- `fillFormField()` - 폼 필드 채우기 및 검증
- `clickAndWaitForNavigation()` - 클릭 후 네비게이션 대기
- `waitForApiResponse()` - API 응답 대기
- `getNumericValue()` - 텍스트에서 숫자 추출
- `verifyToast()` - Toast 메시지 검증
- `fillRating()` - 별점 선택
- `setMobileViewport()` - 모바일 뷰포트 설정

### `mock-data.ts`

테스트 데이터 생성:

```typescript
import { mockUser, generateMockReviews, mockApiResponses } from './helpers/mock-data';

// 단일 Mock 데이터
const user = mockUser;
const review = mockReview;

// 여러 데이터 생성
const reviews = generateMockReviews(10);
const transactions = generateMockTransactions(20);

// API 응답 Mock
const response = mockApiResponses.success({ user });
const error = mockApiResponses.error('에러 메시지');
```

**주요 함수:**
- `generateMockReviews()` - 리뷰 데이터 생성
- `generateMockTransactions()` - 거래 데이터 생성
- `generateMockBadges()` - 뱃지 데이터 생성
- `generateMockLeaderboard()` - 리더보드 생성
- `mockApiResponses` - API 응답 템플릿

## 베스트 프랙티스

### 1. 테스트 격리

각 테스트는 독립적이어야 합니다:

```typescript
test.beforeEach(async ({ page }) => {
  // 각 테스트 전에 초기 상태로
  await page.goto('/demo');
  await clearLocalStorage(page);
});
```

### 2. data-testid 사용

안정적인 셀렉터 사용:

```typescript
// 좋음 ✅
const button = page.locator('[data-testid="submit-button"]');

// 나쁨 ❌
const button = page.locator('.btn.btn-primary.submit');
```

### 3. 명시적 대기

암묵적 대기 대신 명시적 대기:

```typescript
// 좋음 ✅
await expect(element).toBeVisible({ timeout: 5000 });

// 나쁨 ❌
await page.waitForTimeout(5000);
```

### 4. 의미있는 테스트 이름

```typescript
// 좋음 ✅
test('should display validation error when submitting empty review', async ({ page }) => {
  // ...
});

// 나쁨 ❌
test('test1', async ({ page }) => {
  // ...
});
```

### 5. Arrange-Act-Assert 패턴

```typescript
test('should like a review', async ({ page }) => {
  // Arrange - 준비
  const review = page.locator('[data-testid="review-item"]').first();
  const likeButton = review.locator('[data-testid="like-button"]');
  
  // Act - 실행
  await likeButton.click();
  
  // Assert - 검증
  await expect(likeButton).toHaveAttribute('data-liked', 'true');
});
```

### 6. 에러 처리

```typescript
test('should handle API errors gracefully', async ({ page }) => {
  // Mock API error
  await mockApiResponse(page, '/api/reviews', { error: 'Server error' }, 500);
  
  // Verify error handling
  const errorMessage = page.locator('[data-testid="error-message"]');
  await expect(errorMessage).toBeVisible();
});
```

### 7. 모바일 테스트

```typescript
test('should display correctly on mobile', async ({ page }) => {
  await setMobileViewport(page);
  
  // Mobile-specific tests
  const mobileMenu = page.locator('[data-testid="mobile-menu"]');
  await expect(mobileMenu).toBeVisible();
});
```

## 디버깅

### 1. UI 모드 사용

가장 쉬운 디버깅 방법:

```bash
pnpm test:e2e:ui
```

### 2. 스크린샷 캡처

```typescript
await page.screenshot({ path: 'screenshot.png', fullPage: true });
```

### 3. 비디오 녹화

`playwright.config.ts`에서 설정됨:

```typescript
use: {
  video: 'retain-on-failure',
}
```

### 4. Trace 보기

```bash
pnpm exec playwright show-trace trace.zip
```

### 5. 콘솔 로그 확인

```typescript
page.on('console', msg => console.log('PAGE LOG:', msg.text()));
```

## CI/CD 통합

GitHub Actions에서 실행:

```yaml
- name: Run E2E tests
  run: pnpm test:e2e
  
- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## 보고서

테스트 실행 후 HTML 보고서:

```bash
pnpm exec playwright show-report
```

## 문제 해결

### 테스트가 느린 경우

```typescript
// Timeout 증가
test.setTimeout(60000);

// 또는 개별 assertion
await expect(element).toBeVisible({ timeout: 10000 });
```

### 간헐적 실패

```typescript
// 재시도 설정
test.describe.configure({ retries: 2 });
```

### 네트워크 문제

```typescript
// 네트워크 idle 대기
await page.waitForLoadState('networkidle');
```

## 추가 리소스

- [Playwright 공식 문서](https://playwright.dev)
- [베스트 프랙티스 가이드](https://playwright.dev/docs/best-practices)
- [Selector 가이드](https://playwright.dev/docs/selectors)

## 기여

새로운 E2E 테스트 추가 시:

1. 적절한 파일에 테스트 추가 또는 새 파일 생성
2. `data-testid` 속성 사용
3. 헬퍼 유틸리티 활용
4. 테스트가 통과하는지 확인
5. README 업데이트

---

**Happy Testing! 🎉**
