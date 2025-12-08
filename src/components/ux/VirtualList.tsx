'use client';

import { ReactNode, useCallback, useRef, CSSProperties } from 'react';
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';
import { m, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { colors, typography } from '@/lib/design-tokens';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * VirtualList - 고성능 가상화 리스트 컴포넌트
 *
 * @features
 * - @tanstack/react-virtual 기반 최적화
 * - 동적 높이 지원 (estimateSize)
 * - 무한 스크롤 통합
 * - 로딩/에러 상태 관리
 * - 스크롤 위치 복원
 * - 접근성 지원
 */

export interface VirtualListProps<T> {
  /** 렌더링할 아이템 배열 */
  items: T[];
  /** 아이템을 렌더링하는 함수 */
  renderItem: (item: T, index: number, virtualItem: VirtualItem) => ReactNode;
  /** 아이템 고유 키를 추출하는 함수 */
  getItemKey: (item: T, index: number) => string | number;
  /** 아이템 예상 높이 (동적 높이 측정에 사용) */
  estimateSize?: number;
  /** 오버스캔 카운트 (뷰포트 밖 렌더링 아이템 수) */
  overscan?: number;
  /** 컨테이너 높이 (CSS 단위) */
  height?: string | number;
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 에러 상태 */
  error?: Error | null;
  /** 무한 스크롤: 더 많은 아이템이 있는지 */
  hasMore?: boolean;
  /** 무한 스크롤: 더 로드하는 콜백 */
  onLoadMore?: () => void | Promise<void>;
  /** 무한 스크롤: 로드 트리거 임계값 (아이템 수) */
  loadMoreThreshold?: number;
  /** 빈 상태 렌더 함수 */
  renderEmpty?: () => ReactNode;
  /** 로딩 상태 렌더 함수 */
  renderLoading?: () => ReactNode;
  /** 에러 상태 렌더 함수 */
  renderError?: (error: Error) => ReactNode;
  /** 추가 컨테이너 className */
  className?: string;
  /** 추가 컨테이너 스타일 */
  style?: CSSProperties;
  /** 아이템 간격 (px) */
  gap?: number;
  /** 애니메이션 활성화 */
  enableAnimation?: boolean;
  /** 컨테이너 패딩 (px) */
  padding?: number;
}

/**
 * VirtualList Component
 * 대량의 아이템을 효율적으로 렌더링하는 가상화 리스트
 */
export function VirtualList<T>({
  items,
  renderItem,
  getItemKey,
  estimateSize = 80,
  overscan = 5,
  height = '100%',
  isLoading = false,
  error = null,
  hasMore = false,
  onLoadMore,
  loadMoreThreshold = 3,
  renderEmpty,
  renderLoading,
  renderError,
  className = '',
  style,
  gap = 0,
  enableAnimation = true,
  padding = 0,
}: VirtualListProps<T>) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = enableAnimation && !prefersReducedMotion;
  const parentRef = useRef<HTMLDivElement>(null);

  // 가상화 설정
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize + gap,
    overscan,
    // 동적 높이 측정
    measureElement:
      typeof window !== 'undefined' && typeof window.ResizeObserver !== 'undefined'
        ? (element: Element) => element.getBoundingClientRect().height + gap
        : undefined,
  });

  // 무한 스크롤 처리
  const handleScroll = useCallback(() => {
    if (!hasMore || !onLoadMore || isLoading) return;

    const virtualItems = virtualizer.getVirtualItems();
    if (virtualItems.length === 0) return;

    const lastItem = virtualItems[virtualItems.length - 1];
    if (lastItem && lastItem.index >= items.length - loadMoreThreshold) {
      onLoadMore();
    }
  }, [hasMore, onLoadMore, isLoading, virtualizer, items.length, loadMoreThreshold]);

  // 에러 상태
  if (error) {
    if (renderError) {
      return (
        <div className={className} style={style}>
          {renderError(error)}
        </div>
      );
    }
    return (
      <div
        className={`flex flex-col items-center justify-center p-8 ${className}`}
        style={{ height, ...style }}
        role="alert"
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ background: 'rgba(239, 68, 68, 0.1)' }}
        >
          <AlertCircle size={32} style={{ color: colors.error }} />
        </div>
        <p style={{ color: colors.text.primary, fontSize: typography.fontSize.base.size }}>
          데이터를 불러올 수 없습니다
        </p>
        <p
          style={{ color: colors.text.muted, fontSize: typography.fontSize.sm.size }}
          className="mt-1"
        >
          {error.message}
        </p>
      </div>
    );
  }

  // 빈 상태
  if (!isLoading && items.length === 0) {
    if (renderEmpty) {
      return (
        <div className={className} style={style}>
          {renderEmpty()}
        </div>
      );
    }
    return (
      <div
        className={`flex items-center justify-center p-8 ${className}`}
        style={{ height, ...style }}
        role="status"
      >
        <p style={{ color: colors.text.muted, fontSize: typography.fontSize.base.size }}>
          표시할 항목이 없습니다
        </p>
      </div>
    );
  }

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{
        height,
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        ...style,
      }}
      onScroll={handleScroll}
      role="list"
    >
      {/* 가상 스크롤 컨테이너 */}
      <div
        style={{
          height: `${totalSize}px`,
          width: '100%',
          position: 'relative',
          padding: `${padding}px`,
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {virtualItems.map((virtualItem) => {
            const item = items[virtualItem.index];
            const key = getItemKey(item, virtualItem.index);

            return (
              <m.div
                key={key}
                data-index={virtualItem.index}
                ref={(el) => {
                  if (el) {
                    virtualizer.measureElement(el);
                  }
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: padding,
                  right: padding,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                initial={shouldAnimate ? { opacity: 0, y: 10 } : undefined}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldAnimate ? { opacity: 0, scale: 0.95 } : undefined}
                transition={{ duration: 0.2 }}
                role="listitem"
              >
                {renderItem(item, virtualItem.index, virtualItem)}
              </m.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 로딩 인디케이터 */}
      {isLoading && (
        <div className="flex justify-center items-center p-4" role="status" aria-live="polite">
          {renderLoading ? (
            renderLoading()
          ) : (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <Loader2 size={20} style={{ color: colors.flame[400] }} className="animate-spin" />
              <span style={{ color: colors.text.secondary, fontSize: typography.fontSize.sm.size }}>
                불러오는 중...
              </span>
            </m.div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * VirtualGrid - 그리드 레이아웃 가상화 컴포넌트
 *
 * 그리드 형태로 아이템을 표시할 때 사용
 */
export interface VirtualGridProps<T> extends Omit<VirtualListProps<T>, 'gap' | 'estimateSize'> {
  /** 열 개수 */
  columns?: number;
  /** 아이템 간격 */
  gap?: number;
  /** 아이템 높이 */
  itemHeight?: number;
}

export function VirtualGrid<T>({
  items,
  renderItem,
  getItemKey,
  columns = 2,
  gap = 16,
  itemHeight = 200,
  ...restProps
}: VirtualGridProps<T>) {
  // 행 단위로 가상화
  const rows = Math.ceil(items.length / columns);
  const rowItems = Array.from({ length: rows }, (_, rowIndex) => {
    const startIndex = rowIndex * columns;
    return items.slice(startIndex, startIndex + columns);
  });

  return (
    <VirtualList
      items={rowItems}
      renderItem={(rowItemList, rowIndex, virtualItem) => (
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: `${gap}px`,
          }}
        >
          {rowItemList.map((item, colIndex) => {
            const itemIndex = rowIndex * columns + colIndex;
            return (
              <div key={getItemKey(item, itemIndex)}>
                {renderItem(item, itemIndex, virtualItem)}
              </div>
            );
          })}
        </div>
      )}
      getItemKey={(_, rowIndex) => `row-${rowIndex}`}
      estimateSize={itemHeight + gap}
      gap={gap}
      {...restProps}
    />
  );
}

/**
 * LoadingIndicator - 기본 로딩 인디케이터
 */
export function LoadingIndicator({ message = '불러오는 중...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center gap-3">
        <Loader2 size={24} style={{ color: colors.flame[400] }} className="animate-spin" />
        <span style={{ color: colors.text.secondary, fontSize: typography.fontSize.base.size }}>
          {message}
        </span>
      </div>
    </div>
  );
}

/**
 * EmptyState - 기본 빈 상태
 */
export function EmptyState({
  icon,
  title = '표시할 항목이 없습니다',
  description,
}: {
  icon?: ReactNode;
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      {icon && (
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ background: 'rgba(255, 255, 255, 0.05)' }}
        >
          {icon}
        </div>
      )}
      <p style={{ color: colors.text.primary, fontSize: typography.fontSize.base.size }}>{title}</p>
      {description && (
        <p
          style={{ color: colors.text.muted, fontSize: typography.fontSize.sm.size }}
          className="mt-1"
        >
          {description}
        </p>
      )}
    </div>
  );
}

export default VirtualList;
