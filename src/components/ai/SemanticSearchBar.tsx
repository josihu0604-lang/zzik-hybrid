/**
 * Semantic Search Bar Component
 *
 * Natural language search with AI-powered suggestions
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import { useSemanticSearch } from '@/hooks/useSemanticSearch';

interface SemanticSearchBarProps {
  userId?: string;
  placeholder?: string;
  onResultClick?: (popupId: string) => void;
  filters?: {
    categories?: string[];
    locations?: string[];
    status?: string[];
  };
}

export function SemanticSearchBar({
  userId,
  placeholder = '자연어로 검색해보세요 (예: 성수 감성 카페 팝업)',
  onResultClick,
  filters,
}: SemanticSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { query, setQuery, results, isSearching, error, clear } = useSemanticSearch({
    userId,
    limit: 8,
    debounceMs: 300,
    filters,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (popupId: string) => {
    onResultClick?.(popupId);
    setIsFocused(false);
    clear();
  };

  return (
    <div className="relative w-full max-w-2xl" ref={inputRef}>
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="
            w-full px-4 py-3 pl-12 pr-10
            bg-elevated text-primary
            border border-border rounded-xl
            focus:outline-none focus:border-flame/50
            transition-all
          "
        />

        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary">
          {isSearching ? (
            <div className="w-5 h-5 border-2 border-flame border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>

        {/* Clear Button */}
        {query && (
          <button
            onClick={clear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isFocused && query && (
        <div
          className="
            absolute top-full left-0 right-0 mt-2
            bg-elevated border border-border rounded-xl
            shadow-2xl max-h-96 overflow-y-auto
            z-50
          "
        >
          {/* Error State */}
          {error && (
            <div className="p-4 text-sm text-flame">
              검색 중 오류가 발생했습니다: {error.message}
            </div>
          )}

          {/* Empty State */}
          {!isSearching && !error && results.length === 0 && query.trim().length > 0 && (
            <div className="p-6 text-center">
              <div className="text-4xl mb-2">🔍</div>
              <div className="text-sm text-secondary">"{query}"에 대한 검색 결과가 없습니다</div>
            </div>
          )}

          {/* Results List */}
          {results.length > 0 && (
            <div className="divide-y divide-border">
              {results.map((result) => (
                <SearchResultItem
                  key={result.popupId}
                  result={result}
                  onClick={handleResultClick}
                  query={query}
                />
              ))}
            </div>
          )}

          {/* Footer */}
          {results.length > 0 && (
            <div className="p-3 text-xs text-secondary text-center border-t border-border">
              AI 의미 검색으로 {results.length}개 결과 찾음
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Search Result Item
// ============================================================================

interface SearchResultItemProps {
  result: {
    popupId: string;
    relevanceScore: number;
    matchType: string;
    keywordMatches: string[];
    highlights?: {
      title?: string;
      description?: string;
      category?: string;
    };
  };
  onClick: (popupId: string) => void;
  query: string;
}

function SearchResultItem({ result, onClick, query: _query }: SearchResultItemProps) {
  const { popupId, relevanceScore, matchType, highlights } = result;

  // Get match type emoji
  const matchTypeEmoji: Record<string, string> = {
    exact: '🎯',
    semantic: '🧠',
    category: '📁',
    location: '📍',
    vibe: '✨',
  };

  return (
    <button
      onClick={() => onClick(popupId)}
      className="
        w-full p-4 text-left
        hover:bg-surface/50 transition-colors
        focus:outline-none focus:bg-surface/50
      "
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-12 h-12 bg-surface rounded-lg flex-shrink-0 flex items-center justify-center text-2xl">
          🎪
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="font-medium line-clamp-1">{highlights?.title || `팝업 #${popupId}`}</div>

          {/* Description */}
          {highlights?.description && (
            <div className="text-sm text-secondary line-clamp-2 mt-1">{highlights.description}</div>
          )}

          {/* Match Info */}
          <div className="flex items-center gap-2 mt-2 text-xs text-secondary">
            <span>
              {matchTypeEmoji[matchType] || '🔍'} {matchType}
            </span>
            <span className="text-border">•</span>
            <span>{Math.round(relevanceScore * 100)}% 일치</span>
            {highlights?.category && (
              <>
                <span className="text-border">•</span>
                <span>{highlights.category}</span>
              </>
            )}
          </div>
        </div>

        {/* Relevance Score Bar */}
        <div className="w-1 h-12 bg-surface rounded-full overflow-hidden flex-shrink-0">
          <div
            className="w-full bg-gradient-to-b from-flame to-ember transition-all"
            style={{ height: `${relevanceScore * 100}%` }}
          />
        </div>
      </div>
    </button>
  );
}
