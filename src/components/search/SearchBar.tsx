'use client';

import { useState, useRef, useEffect } from 'react';
import { m, AnimatePresence } from '@/lib/motion';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { colors, spacing, typography } from '@/lib/design-tokens';

/**
 * SearchBar - 검색바 컴포넌트
 *
 * Features:
 * - 검색 입력
 * - 클리어 버튼
 * - 필터 버튼
 * - 애니메이션 확장
 */

interface SearchBarProps {
  /** 현재 검색어 */
  value: string;
  /** 검색어 변경 핸들러 */
  onChange: (value: string) => void;
  /** 검색 실행 핸들러 */
  onSearch?: (value: string) => void;
  /** 필터 버튼 클릭 핸들러 */
  onFilterClick?: () => void;
  /** 활성 필터 개수 */
  activeFilterCount?: number;
  /** 플레이스홀더 */
  placeholder?: string;
  /** 자동 포커스 */
  autoFocus?: boolean;
  /** 추가 클래스 */
  className?: string;
  /** 에러 상태 */
  hasError?: boolean;
  /** 에러 메시지 */
  errorMessage?: string;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  onFilterClick,
  activeFilterCount = 0,
  placeholder = '브랜드, 팝업명 검색',
  autoFocus = false,
  className = '',
  hasError = false,
  errorMessage,
}: SearchBarProps) {
  const errorId = 'search-error-message';
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 자동 포커스
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // 검색 실행
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(value);
    inputRef.current?.blur();
  };

  // 클리어
  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <m.div
        className="flex items-center rounded-xl transition-all"
        // DES-220: gap을 spacing 토큰으로 통일
        style={{
          gap: spacing[2],
          background: isFocused ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)',
          // DES-205: 보더 색상 토큰 사용
          border: isFocused
            ? `1px solid ${colors.border.emphasis}`
            : `1px solid ${colors.border.subtle}`,
        }}
        animate={{
          boxShadow: isFocused ? `0 0 0 2px ${colors.focus.ringOpacity}` : 'none',
        }}
      >
        {/* Search Icon */}
        <div className="pl-3">
          <Search
            size={18}
            className={isFocused ? 'text-flame-500' : 'text-linear-text-tertiary'}
            style={{ color: isFocused ? colors.flame[500] : undefined }}
          />
        </div>

        {/* Input - 16px font to prevent iOS auto-zoom */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          autoComplete="off"
          className="flex-1 py-3 bg-transparent text-white placeholder-linear-text-tertiary outline-none text-base"
          aria-label="검색"
          aria-invalid={hasError}
          aria-describedby={hasError && errorMessage ? errorId : undefined}
        />
        {/* Error message for screen readers */}
        {hasError && errorMessage && (
          <span id={errorId} className="sr-only" role="alert">
            {errorMessage}
          </span>
        )}

        {/* Clear Button - 48px touch target for accessibility */}
        <AnimatePresence>
          {value && (
            <m.button
              type="button"
              onClick={handleClear}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full hover:bg-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-flame-500"
              aria-label="검색어 지우기"
            >
              <X size={18} className="text-linear-text-tertiary" />
            </m.button>
          )}
        </AnimatePresence>

        {/* Filter Button - 48px touch target */}
        {onFilterClick && (
          <button
            type="button"
            onClick={onFilterClick}
            className="relative p-3 min-w-[48px] min-h-[48px] flex items-center justify-center border-l border-white/10 hover:bg-white/5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-flame-500"
            aria-label="필터 열기"
          >
            <SlidersHorizontal
              size={18}
              className={activeFilterCount > 0 ? '' : 'text-linear-text-secondary'}
              style={{ color: activeFilterCount > 0 ? colors.flame[500] : undefined }}
            />

            {/* Filter Count Badge */}
            {activeFilterCount > 0 && (
              <m.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full font-bold flex items-center justify-center"
                style={{
                  background: colors.flame[500],
                  color: 'white',
                  fontSize: typography.fontSize.xs.size,
                  lineHeight: typography.fontSize.xs.lineHeight,
                }}
              >
                {activeFilterCount > 9 ? '9+' : activeFilterCount}
              </m.span>
            )}
          </button>
        )}
      </m.div>
    </form>
  );
}

/**
 * SearchBarCompact - 컴팩트 검색바 (헤더용)
 */
export function SearchBarCompact({
  onClick,
  placeholder = '검색',
  className = '',
}: {
  onClick: () => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-flame-500 ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.06)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
      aria-label="검색 열기"
    >
      <Search size={16} className="text-linear-text-tertiary" />
      <span className="text-linear-text-tertiary text-sm">{placeholder}</span>
    </button>
  );
}

export default SearchBar;
