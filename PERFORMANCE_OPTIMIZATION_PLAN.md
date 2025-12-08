# 🚨 긴급 성능 최적화 계획

## 🔴 발견된 심각한 문제들

### 1. Bundle Size 문제
- **Mapbox GL**: 2.7MB x 2 (중복 청크)
- **Framer Motion**: 688KB + 684KB (중복)
- **Total Dev Build**: 318MB (.next/)
- **node_modules**: 1.5GB

### 2. Framer Motion 오남용
- **170개 파일**이 직접 import
- LazyMotion 설정되어 있지만 **효과 없음**
- `motion.*` 사용 → `m.*`로 변경 필요

### 3. 렌더링 성능
- **295개 useEffect** hooks (과도함)
- 불필요한 리렌더링 다수

### 4. Web Vitals (현재 상태)
- **FCP**: 2,112ms ⚠️ (목표: <1,800ms)
- **LCP**: 2,844ms ⚠️ (목표: <2,500ms)
- **TTFB**: 432ms ✅ (양호)
- **CLS**: 0 ✅ (완벽)
- **Total Load**: 14.97s 🚨 (매우 느림)

---

## 🎯 즉시 조치 (P0) - 30분 내

### 1. Dynamic Import 전환
```tsx
// ❌ 기존 (모든 페이지에 로드)
import { MapboxMap } from '@/components/map/MapboxMap'

// ✅ 개선 (필요할 때만 로드)
const MapboxMap = dynamic(() => import('@/components/map/MapboxMap'), {
  ssr: false,
  loading: () => <MapSkeleton />
})
```

**대상 컴포넌트**:
- MapboxMap (2.7MB)
- Framer Motion heavy components
- Chart components
- QR Scanner
- 모든 admin/brand 페이지

### 2. Framer Motion 최적화
```tsx
// ❌ 기존
import { motion } from 'framer-motion'
<motion.div>

// ✅ 개선 (LazyMotion 사용)
import { m } from 'framer-motion'
<m.div>
```

**효과**: 번들 크기 ~50% 감소 (688KB → ~350KB)

### 3. Image Optimization
```tsx
// ❌ 기존
<img src="/image.jpg" />

// ✅ 개선
<Image
  src="/image.jpg"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
/>
```

### 4. Code Splitting (Route-based)
```tsx
// app/map/page.tsx
export default dynamic(() => import('./MapPage'), {
  ssr: false,
  loading: () => <PageSkeleton />
})
```

---

## ⚡ 단기 조치 (P1) - 2시간 내

### 5. useEffect 최적화
- useMemo/useCallback 추가
- 의존성 배열 최적화
- Custom hooks로 추출

### 6. React.memo 적용
```tsx
// 리스트 아이템, 카드 등
export const PopupCard = memo(function PopupCard(props) {
  // ...
})
```

### 7. Virtual Scrolling
```tsx
// 긴 리스트에 적용
import { Virtuoso } from 'react-virtuoso'

<Virtuoso
  data={items}
  itemContent={(index, item) => <Item {...item} />}
/>
```

### 8. Prefetching 최적화
```tsx
// next.config.ts
experimental: {
  optimizePackageImports: [
    'framer-motion',
    'lucide-react',
    'mapbox-gl'
  ],
  ppr: true,  // Partial Pre-rendering
}
```

---

## 🔧 중기 조치 (P2) - 1일 내

### 9. Font Optimization
```tsx
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})
```

### 10. Service Worker 최적화
- 정적 에셋 프리캐싱
- 런타임 캐싱 전략 개선
- Stale-while-revalidate

### 11. Database Query Optimization
- React Query 캐싱 전략
- Supabase RLS 최적화
- Pagination 구현

---

## 📊 예상 개선 효과

| 지표 | 현재 | 목표 | 개선율 |
|-----|------|------|--------|
| **FCP** | 2,112ms | 1,200ms | -43% |
| **LCP** | 2,844ms | 1,800ms | -37% |
| **번들 크기** | 318MB | 180MB | -43% |
| **Total Load** | 14.97s | 4.5s | -70% |

---

## 🚀 실행 우선순위

1. ✅ **즉시**: Dynamic imports (Map, Charts)
2. ✅ **10분**: Framer Motion → `m`
3. ✅ **20분**: Image optimization
4. ⏳ **40분**: Code splitting
5. ⏳ **1시간**: useEffect cleanup
6. ⏳ **2시간**: React.memo + Virtual scrolling

---

**작성자**: Gemini 3 Pro Agent  
**작성일**: 2025-12-08 15:07 UTC  
**심각도**: 🚨 CRITICAL
