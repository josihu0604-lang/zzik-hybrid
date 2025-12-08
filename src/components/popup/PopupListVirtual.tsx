'use client';

import { VirtualList, LoadingIndicator, EmptyState } from '@/components/ux/VirtualList';
import { useVirtualScroll } from '@/hooks/useVirtualScroll';
import { PopupCard, PopupData } from './PopupCard';
import { Search } from 'lucide-react';

/**
 * PopupListVirtual - VirtualList를 사용한 팝업 리스트
 *
 * @features
 * - 가상화로 대량의 팝업 처리
 * - 스크롤 위치 복원 (페이지 이동 후)
 * - 무한 스크롤 지원
 * - 동적 높이 측정
 * - 검색 결과 하이라이트
 */

interface PopupListVirtualProps {
  /** 팝업 데이터 배열 */
  popups: PopupData[];
  /** 참여하기 핸들러 */
  onParticipate: (popupId: string) => void;
  /** 카드 클릭 핸들러 */
  onCardClick: (popupId: string) => void;
  /** 검색어 하이라이트 함수 */
  highlightText?: (text: string) => React.ReactNode;
  /** 무한 스크롤: 더 많은 팝업이 있는지 */
  hasMore?: boolean;
  /** 무한 스크롤: 더 로드하는 콜백 */
  onLoadMore?: () => void | Promise<void>;
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 에러 상태 */
  error?: Error | null;
  /** 스크롤 복원 키 */
  scrollRestorationKey?: string;
  /** 컨테이너 높이 */
  height?: string;
}

export function PopupListVirtual({
  popups,
  onParticipate,
  onCardClick,
  highlightText,
  hasMore = false,
  onLoadMore,
  isLoading = false,
  error = null,
  scrollRestorationKey = 'popup-list',
  height = 'calc(100vh - 200px)',
}: PopupListVirtualProps) {
  // 가상 스크롤 설정
  useVirtualScroll({
    items: popups,
    estimateSize: 450, // PopupCard 예상 높이
    overscan: 2,
    scrollRestorationKey,
    hasMore,
    onLoadMore,
    loadMoreThreshold: 3,
    enableDynamicSize: true,
  });

  return (
    <VirtualList
      items={popups}
      renderItem={(popup, _index) => (
        <PopupCard
          key={popup.id}
          popup={popup}
          onParticipate={onParticipate}
          onCardClick={onCardClick}
          highlightText={highlightText}
        />
      )}
      getItemKey={(popup) => popup.id}
      estimateSize={450}
      overscan={2}
      height={height}
      isLoading={isLoading}
      error={error}
      hasMore={hasMore}
      onLoadMore={onLoadMore}
      loadMoreThreshold={3}
      gap={16}
      padding={16}
      enableAnimation={true}
      renderEmpty={() => (
        <EmptyState
          icon={<Search size={32} className="text-linear-text-tertiary" />}
          title="진행 중인 팝업이 없습니다"
          description="곧 새로운 팝업이 열릴 예정이에요!"
        />
      )}
      renderLoading={() => <LoadingIndicator message="팝업을 불러오는 중..." />}
      className="popup-list-virtual"
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
      }}
    />
  );
}

/**
 * PopupGridVirtual - 그리드 레이아웃 팝업 리스트
 *
 * 태블릿/데스크톱에서 2열 그리드로 표시
 */
interface PopupGridVirtualProps extends PopupListVirtualProps {
  /** 열 개수 (기본: 2) */
  columns?: number;
}

export function PopupGridVirtual({ columns = 2, ...props }: PopupGridVirtualProps) {
  const { popups, onParticipate, onCardClick, highlightText } = props;

  // 행 단위로 데이터 재구성
  const rows = [];
  for (let i = 0; i < popups.length; i += columns) {
    rows.push(popups.slice(i, i + columns));
  }

  return (
    <VirtualList
      items={rows}
      renderItem={(rowPopups, _rowIndex) => (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
          }}
        >
          {rowPopups.map((popup) => (
            <PopupCard
              key={popup.id}
              popup={popup}
              onParticipate={onParticipate}
              onCardClick={onCardClick}
              highlightText={highlightText}
            />
          ))}
        </div>
      )}
      getItemKey={(_, rowIndex) => `row-${rowIndex}`}
      estimateSize={450 + 16} // Card height + gap
      overscan={1}
      height={props.height}
      isLoading={props.isLoading}
      error={props.error}
      hasMore={props.hasMore}
      onLoadMore={props.onLoadMore}
      gap={16}
      padding={16}
      enableAnimation={true}
      renderEmpty={() => (
        <EmptyState
          icon={<Search size={32} className="text-linear-text-tertiary" />}
          title="진행 중인 팝업이 없습니다"
          description="곧 새로운 팝업이 열릴 예정이에요!"
        />
      )}
      renderLoading={() => <LoadingIndicator message="팝업을 불러오는 중..." />}
    />
  );
}

export default PopupListVirtual;
