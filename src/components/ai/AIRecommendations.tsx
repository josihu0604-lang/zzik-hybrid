/**
 * AI Recommendations Component
 *
 * Displays personalized popup recommendations with strategy tabs
 */
'use client';

import { useState } from 'react';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';
import type { RecommendationResult } from '@/lib/ai/types';

interface AIRecommendationsProps {
  userId?: string;
  limit?: number;
  demoMode?: boolean;
  onPopupClick?: (popupId: string) => void;
}

type Strategy = 'hybrid' | 'collaborative' | 'content' | 'popular' | 'trending';

const STRATEGY_LABELS: Record<Strategy, { label: string; emoji: string; description: string }> = {
  hybrid: { label: '맞춤 추천', emoji: '🎯', description: 'AI가 분석한 당신의 취향' },
  collaborative: { label: '비슷한 취향', emoji: '👥', description: '비슷한 유저들이 참여' },
  content: { label: '취향 기반', emoji: '✨', description: '선호 카테고리 기반' },
  popular: { label: '인기순', emoji: '🔥', description: '많은 사람들이 참여' },
  trending: { label: '트렌딩', emoji: '📈', description: '지금 가장 핫한' },
};

export function AIRecommendations({
  userId,
  limit = 10,
  demoMode = false,
  onPopupClick,
}: AIRecommendationsProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy>('hybrid');

  const { recommendations, isLoading, error, refetch } = useAIRecommendations({
    userId,
    strategy: selectedStrategy,
    limit,
    demoMode,
  });

  return (
    <div className="space-y-4">
      {/* Strategy Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(Object.keys(STRATEGY_LABELS) as Strategy[]).map((strategy) => {
          const info = STRATEGY_LABELS[strategy];
          const isActive = selectedStrategy === strategy;

          return (
            <button
              key={strategy}
              onClick={() => setSelectedStrategy(strategy)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all
                ${
                  isActive
                    ? 'bg-flame text-white shadow-lg'
                    : 'bg-elevated text-secondary hover:bg-elevated/80'
                }
              `}
            >
              <span className="mr-1">{info.emoji}</span>
              {info.label}
            </button>
          );
        })}
      </div>

      {/* Strategy Description */}
      <div className="text-sm text-secondary">{STRATEGY_LABELS[selectedStrategy].description}</div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-elevated rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-elevated border border-flame/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1">
              <div className="font-medium text-flame">추천 로딩 실패</div>
              <div className="text-sm text-secondary mt-1">{error.message}</div>
              <button onClick={refetch} className="mt-3 text-sm text-flame hover:underline">
                다시 시도
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Grid */}
      {!isLoading && !error && recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.popupId} recommendation={rec} onClick={onPopupClick} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && recommendations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <div className="text-lg font-medium">추천 팝업이 없습니다</div>
          <div className="text-sm text-secondary mt-2">다른 전략을 선택해보세요</div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Recommendation Card
// ============================================================================

interface RecommendationCardProps {
  recommendation: RecommendationResult;
  onClick?: (popupId: string) => void;
}

function RecommendationCard({ recommendation, onClick }: RecommendationCardProps) {
  const { popupId, score, reasons, breakdown } = recommendation;

  return (
    <div
      onClick={() => onClick?.(popupId)}
      className="
        bg-elevated rounded-xl p-4 cursor-pointer
        transition-all duration-200
        hover:bg-elevated/80 hover:scale-[1.02]
        border border-border hover:border-flame/30
      "
    >
      {/* Popup Info (placeholder - would fetch real data) */}
      <div className="aspect-video bg-surface rounded-lg mb-3 flex items-center justify-center">
        <span className="text-4xl">🎪</span>
      </div>

      <div className="space-y-2">
        {/* Title */}
        <div className="font-medium line-clamp-1">팝업 #{popupId}</div>

        {/* Score Bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-flame to-ember transition-all"
              style={{ width: `${score * 100}%` }}
            />
          </div>
          <div className="text-xs text-secondary font-mono">{Math.round(score * 100)}%</div>
        </div>

        {/* Reasons */}
        <div className="space-y-1">
          {reasons.slice(0, 2).map((reason, i) => (
            <div key={i} className="text-xs text-secondary flex items-start gap-1">
              <span className="text-flame">•</span>
              <span className="line-clamp-1">{reason}</span>
            </div>
          ))}
        </div>

        {/* Breakdown (Debug Info) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-secondary/60 font-mono pt-2 border-t border-border">
            CF:{breakdown.collaborative.toFixed(2)} | CB:{breakdown.content.toFixed(2)} | Pop:
            {breakdown.popularity.toFixed(2)} | Trend:{breakdown.trending.toFixed(2)}
            {breakdown.aiBoost !== undefined && ` | AI:${breakdown.aiBoost.toFixed(2)}`}
          </div>
        )}
      </div>
    </div>
  );
}
