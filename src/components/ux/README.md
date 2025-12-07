# ZZIK UX Components

UX 사용성 개선을 위한 컴포넌트 라이브러리입니다.
Nielsen's 10 Usability Heuristics와 Apple HIG를 기반으로 설계되었습니다.

---

## Usage

```tsx
import {
  EmptyState,
  ErrorState,
  NetworkStatus,
  AnimatedButton,
  FadeInOnScroll,
  TouchTarget,
  AsyncBoundary,
} from '@/components/ux';
```

---

## Components Overview

### 1. Empty States (빈 상태)

**파일**: `EmptyState.tsx`
**Nielsen Heuristic #10**: Help and Documentation

빈 목록, 검색 결과 없음 등 콘텐츠가 없을 때 사용자에게 다음 행동을 안내합니다.

```tsx
// 기본 사용
<EmptyState
  variant="search"
  title="검색 결과가 없어요"
  description="다른 키워드로 검색해보세요"
  actionLabel="다시 검색"
  onAction={() => handleRetry()}
/>

// 검색 특화
<SearchEmptyState
  query="검색어"
  onClear={() => clearSearch()}
  onRetry={() => retrySearch()}
/>

// 참여 특화
<ParticipationEmptyState onExplore={() => navigateToHome()} />
```

**변형 (variants)**:

- `search` - 검색 결과 없음
- `list` - 빈 목록
- `map` - 지도에 팝업 없음
- `favorites` - 좋아요 없음
- `notifications` - 알림 없음
- `participants` - 참여자 없음
- `funding` - 펀딩 없음
- `badges` - 배지 없음

---

### 2. Error States (에러 상태)

**파일**: `ErrorState.tsx`
**Nielsen Heuristic #9**: Help users recognize, diagnose, and recover from errors

명확한 에러 메시지와 복구 옵션을 제공합니다.

```tsx
// 기본 사용
<ErrorState
  variant="network"
  error={error}
  onRetry={async () => await refetch()}
/>

// 서버 에러
<ServerErrorState onRetry={handleRetry} />

// 타임아웃
<TimeoutErrorState onRetry={handleRetry} />
```

**변형 (variants)**:

- `generic` - 일반 에러
- `network` - 네트워크 에러
- `server` - 서버 에러
- `timeout` - 타임아웃
- `notFound` - 404
- `forbidden` - 권한 없음

---

### 3. Network Status (오프라인 상태)

**파일**: `NetworkStatus.tsx`
**Nielsen Heuristic #1**: Visibility of System Status

실시간 네트워크 상태를 표시합니다.

```tsx
// 배너 컴포넌트
<NetworkStatus
  position="top"
  dismissible
  onOffline={() => showOfflineMode()}
  onOnline={() => refetchData()}
  onRetry={() => checkConnection()}
/>;

// 훅 사용
const { isOnline, wasOffline } = useNetworkStatus();

// 오프라인 배너
<OfflineBanner hasCachedData={true} onRetry={() => reconnect()} />;
```

---

### 4. Micro Interactions (마이크로 인터랙션)

**파일**: `MicroInteractions.tsx`
**Nielsen Heuristic #1**: Visibility of System Status

버튼, 성공/실패 애니메이션 등 시각적 피드백을 제공합니다.

```tsx
// 애니메이션 버튼
<AnimatedButton
  onClick={async () => await handleSubmit()}
  variant="primary"
  successMessage="완료!"
  errorMessage="실패"
>
  제출하기
</AnimatedButton>

// 성공 애니메이션
<SuccessAnimation show={isSuccess} message="저장되었습니다" />

// 실패 애니메이션
<FailureAnimation show={isError} message="다시 시도해주세요" />

// 리플 이펙트
<RippleEffect>
  <button>클릭하세요</button>
</RippleEffect>

// 프레스 이펙트
<PressEffect onClick={handleTap}>
  <div>탭하세요</div>
</PressEffect>
```

---

### 5. Scroll Animations (스크롤 애니메이션)

**파일**: `ScrollAnimations.tsx`

스크롤에 따른 애니메이션 효과입니다.

```tsx
// 페이드인
<FadeInOnScroll delay={0.1}>
  <Card />
</FadeInOnScroll>

// 슬라이드인
<SlideInOnScroll direction="left" distance={50}>
  <Content />
</SlideInOnScroll>

// 스케일
<ScaleOnScroll startScale={0.9}>
  <Image />
</ScaleOnScroll>

// 순차 애니메이션
<StaggeredList staggerDelay={0.1}>
  {items.map(item => <ListItem key={item.id} {...item} />)}
</StaggeredList>

// 패럴랙스
<ParallaxScroll speed={0.5}>
  <BackgroundImage />
</ParallaxScroll>

// 스크롤 진행률
<ScrollProgress color="#FF6B5B" />

// 리빌 효과
<RevealOnScroll direction="up">
  <Headline />
</RevealOnScroll>
```

---

### 6. Touch Interactions (터치 인터랙션)

**파일**: `TouchInteraction.tsx`
**Apple HIG**: Touch Target Size (최소 44x44px)

모바일 터치에 최적화된 인터랙션입니다.

```tsx
// 터치 타겟 (최소 44x44px)
<TouchTarget minSize={44} onClick={handleClick}>
  <Icon />
</TouchTarget>

// 스와이프 액션
<SwipeAction
  rightActions={[
    { type: 'delete', label: '삭제', onAction: handleDelete },
    { type: 'edit', label: '수정', onAction: handleEdit },
  ]}
>
  <ListItem />
</SwipeAction>

// 롱프레스 메뉴
<LongPressMenu
  items={[
    { label: '공유', icon: <Share />, onClick: handleShare },
    { label: '삭제', icon: <Trash />, onClick: handleDelete, destructive: true },
  ]}
>
  <Card />
</LongPressMenu>

// 더블탭 좋아요
<DoubleTapLike isLiked={liked} onLike={handleLike}>
  <Image />
</DoubleTapLike>
```

---

### 7. Pull to Refresh (당겨서 새로고침)

**파일**: `PullToRefresh.tsx`
**Nielsen Heuristic #3**: User Control and Freedom

사용자가 직접 데이터를 새로고침할 수 있습니다.

```tsx
// 당겨서 새로고침
<PullToRefresh onRefresh={async () => await refetch()}>
  <List>{items.map(item => <Item key={item.id} {...item} />)}</List>
</PullToRefresh>

// 무한 스크롤
<InfiniteScroll
  onLoadMore={async () => await loadMore()}
  hasMore={hasNextPage}
  isLoading={isFetching}
  endMessage="모든 항목을 불러왔습니다"
>
  {items.map(item => <Card key={item.id} {...item} />)}
</InfiniteScroll>
```

---

### 8. Optimistic Updates (낙관적 업데이트)

**파일**: `OptimisticButton.tsx`
**Nielsen Heuristic #1**: Visibility of System Status

즉각적인 피드백으로 응답성을 향상시킵니다.

```tsx
// 좋아요 버튼
<LikeButton
  isLiked={liked}
  count={likeCount}
  onLike={async (newState) => await toggleLike(newState)}
/>

// 북마크 버튼
<BookmarkButton
  isBookmarked={saved}
  onBookmark={async (newState) => await toggleBookmark(newState)}
  showLabel
/>

// 커스텀 낙관적 버튼
<OptimisticButton
  isActive={subscribed}
  onAction={async (newState) => await toggleSubscription(newState)}
  activeIcon={<BellOff />}
  inactiveIcon={<Bell />}
  activeLabel="구독 취소"
  inactiveLabel="구독"
/>
```

---

### 9. Async Boundary (비동기 경계)

**파일**: `AsyncBoundary.tsx`

로딩과 에러를 자동으로 처리합니다.

```tsx
// 기본 사용
<AsyncBoundary
  loadingFallback={<SkeletonCard />}
  errorFallback={({ error, resetErrorBoundary }) => (
    <ErrorState error={error} onRetry={resetErrorBoundary} />
  )}
>
  <AsyncComponent />
</AsyncBoundary>

// 데이터 경계
<DataBoundary
  data={data}
  isLoading={isLoading}
  error={error}
  onRetry={refetch}
  loadingFallback={<Skeleton />}
  emptyFallback={<EmptyState variant="list" />}
>
  {(data) => <List items={data.items} />}
</DataBoundary>

// 로딩 오버레이
<LoadingOverlay
  isLoading={isSubmitting}
  message="저장 중..."
  fullScreen
/>
```

---

## Design Principles

### 1. Visibility of System Status

모든 인터랙션에 즉각적인 피드백을 제공합니다.

### 2. User Control and Freedom

사용자가 언제든 취소하거나 뒤로 갈 수 있도록 합니다.

### 3. Error Prevention

에러가 발생하기 전에 예방하고, 발생 시 명확한 복구 방법을 제공합니다.

### 4. Recognition Rather Than Recall

사용자가 기억해야 할 것을 최소화합니다.

### 5. Flexibility and Efficiency

파워 유저를 위한 제스처와 단축키를 제공합니다.

---

## Accessibility (A11y)

모든 컴포넌트는 다음 접근성 가이드라인을 준수합니다:

- WCAG 2.1 AA 기준 충족
- 적절한 ARIA 속성 사용
- 키보드 네비게이션 지원
- 충분한 색상 대비
- 최소 44x44px 터치 타겟

---

## Performance

- GPU 가속 애니메이션 사용
- `will-change` 속성으로 리페인트 최적화
- Framer Motion의 `layout` 애니메이션 활용
- Intersection Observer로 뷰포트 최적화

---

## Related Components

- `@/components/ui/LoadingSpinner` - 로딩 스피너
- `@/components/ui/Skeleton` - 스켈레톤 UI
- `@/components/ui/Toast` - 토스트 알림
- `@/components/error/ErrorBoundary` - 에러 경계

---

_ZZIK UX Components v1.0 | Nielsen's 10 Heuristics + Apple HIG_
