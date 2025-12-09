/**
 * AI-Powered Restaurant Recommendations Component
 * Personalized suggestions with explanations
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  MapPin,
  Star,
  Clock,
  DollarSign,
  Heart,
  ChevronRight,
  RefreshCw,
  Zap,
} from 'lucide-react';
import type { Restaurant, RecommendationScore } from '@/lib/ai-recommendation';

interface AIRecommendationsProps {
  recommendations: RecommendationScore[];
  restaurants: Restaurant[];
  onRestaurantClick: (restaurantId: string) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  locale?: string;
}

export function AIRecommendations({
  recommendations,
  restaurants,
  onRestaurantClick,
  isLoading = false,
  onRefresh,
  locale = 'en',
}: AIRecommendationsProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <RecommendationSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          {getText('noRecommendations', locale)}
        </h3>
        <p className="text-gray-500 mb-4">
          {getText('exploreMore', locale)}
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {getText('refresh', locale)}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {getText('aiPicks', locale)}
            </h2>
            <p className="text-sm text-gray-600">
              {getText('personalizedForYou', locale)}
            </p>
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-gray-700" />
          </button>
        )}
      </div>

      {/* Recommendations List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {recommendations.map((recommendation, index) => {
            const restaurant = restaurants.find(
              r => r.id === recommendation.restaurantId
            );
            if (!restaurant) return null;

            return (
              <RecommendationCard
                key={recommendation.restaurantId}
                recommendation={recommendation}
                restaurant={restaurant}
                index={index}
                isExpanded={expandedCard === recommendation.restaurantId}
                onExpand={() =>
                  setExpandedCard(
                    expandedCard === recommendation.restaurantId
                      ? null
                      : recommendation.restaurantId
                  )
                }
                onClick={() => onRestaurantClick(restaurant.id)}
                locale={locale}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Individual Recommendation Card
 */
function RecommendationCard({
  recommendation,
  restaurant,
  index,
  isExpanded,
  onExpand,
  onClick,
  locale,
}: {
  recommendation: RecommendationScore;
  restaurant: Restaurant;
  index: number;
  isExpanded: boolean;
  onExpand: () => void;
  onClick: () => void;
  locale: string;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-blue-500 to-cyan-500';
    return 'from-purple-500 to-pink-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return getText('perfectMatch', locale);
    if (score >= 80) return getText('greatMatch', locale);
    if (score >= 70) return getText('goodMatch', locale);
    return getText('recommended', locale);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className="relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
    >
      {/* Rank Badge */}
      {index < 3 && (
        <div className="absolute top-3 left-3 z-10">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
              index === 0
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                : index === 1
                ? 'bg-gradient-to-br from-gray-300 to-gray-400'
                : 'bg-gradient-to-br from-orange-400 to-yellow-600'
            }`}
          >
            {index + 1}
          </div>
        </div>
      )}

      {/* Restaurant Image */}
      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
        {restaurant.images.length > 0 ? (
          <img
            src={restaurant.images[0]}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Sparkles className="w-16 h-16 text-purple-300" />
          </div>
        )}

        {/* Match Score Badge */}
        <div className="absolute top-3 right-3">
          <div
            className={`px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full flex items-center gap-1 shadow-lg`}
          >
            <Zap className={`w-3 h-3 text-transparent bg-gradient-to-r ${getScoreColor(recommendation.score)} bg-clip-text`} />
            <span className="text-sm font-bold text-gray-900">
              {recommendation.score}%
            </span>
          </div>
        </div>

        {/* Wait Time Badge */}
        {restaurant.waitTime !== undefined && (
          <div className="absolute bottom-3 right-3">
            <div className="px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3 text-white" />
              <span className="text-xs text-white font-medium">
                {restaurant.waitTime} min
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Restaurant Name & Rating */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {restaurant.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{restaurant.rating}</span>
              </div>
              <span>·</span>
              <span>{restaurant.cuisineType.join(', ')}</span>
              <span>·</span>
              <span>{'$'.repeat(restaurant.priceLevel)}</span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="w-10 h-10 rounded-full bg-purple-50 hover:bg-purple-100 flex items-center justify-center transition-colors"
          >
            <Heart className="w-5 h-5 text-purple-600" />
          </button>
        </div>

        {/* Match Label */}
        <div className="mb-3">
          <div
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r ${getScoreColor(
              recommendation.score
            )} text-white text-xs font-semibold`}
          >
            <TrendingUp className="w-3 h-3" />
            {getScoreLabel(recommendation.score)}
          </div>
        </div>

        {/* Reasons */}
        <div className="space-y-2 mb-3">
          {recommendation.reasons.slice(0, isExpanded ? undefined : 2).map((reason, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-2 text-sm text-gray-700"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 flex-shrink-0" />
              <span>{reason}</span>
            </motion.div>
          ))}
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 pt-3 border-t border-gray-100"
            >
              {/* Factor Breakdown */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">
                  {getText('matchBreakdown', locale)}
                </h4>
                {Object.entries(recommendation.factors).map(([key, value]) => (
                  <FactorBar
                    key={key}
                    label={getText(key, locale)}
                    value={value}
                  />
                ))}
              </div>

              {/* Features */}
              {restaurant.features.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    {getText('features', locale)}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {restaurant.features.map(feature => (
                      <span
                        key={feature}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg"
                      >
                        {feature.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Confidence */}
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-gray-600">
                  {getText('confidence', locale)}:{' '}
                  <span className="font-semibold text-gray-900">
                    {Math.round(recommendation.confidence * 100)}%
                  </span>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={onExpand}
            className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
          >
            {isExpanded ? getText('showLess', locale) : getText('showMore', locale)}
          </button>
          <button
            onClick={onClick}
            className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            {getText('viewDetails', locale)}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Factor Bar Component
 */
function FactorBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span className="font-semibold">{Math.round(value * 100)}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
        />
      </div>
    </div>
  );
}

/**
 * Loading Skeleton
 */
function RecommendationSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    </div>
  );
}

/**
 * Localization helper
 */
function getText(key: string, locale: string): string {
  const texts: Record<string, Record<string, string>> = {
    aiPicks: {
      en: 'AI Picks',
      ko: 'AI 추천',
      ja: 'AIおすすめ',
      zh: 'AI推荐',
    },
    personalizedForYou: {
      en: 'Personalized for you',
      ko: '맞춤 추천',
      ja: 'あなたのために',
      zh: '为您推荐',
    },
    noRecommendations: {
      en: 'No recommendations yet',
      ko: '아직 추천이 없습니다',
      ja: 'まだおすすめはありません',
      zh: '暂无推荐',
    },
    exploreMore: {
      en: 'Rate some restaurants to get personalized recommendations',
      ko: '레스토랑을 평가하면 맞춤 추천을 받을 수 있습니다',
      ja: 'レストランを評価してパーソナライズされたおすすめを取得',
      zh: '评价一些餐厅以获得个性化推荐',
    },
    refresh: {
      en: 'Refresh',
      ko: '새로고침',
      ja: '更新',
      zh: '刷新',
    },
    perfectMatch: {
      en: 'Perfect Match',
      ko: '완벽한 매치',
      ja: '完璧なマッチ',
      zh: '完美匹配',
    },
    greatMatch: {
      en: 'Great Match',
      ko: '훌륭한 매치',
      ja: '素晴らしいマッチ',
      zh: '非常匹配',
    },
    goodMatch: {
      en: 'Good Match',
      ko: '좋은 매치',
      ja: '良いマッチ',
      zh: '不错的匹配',
    },
    recommended: {
      en: 'Recommended',
      ko: '추천',
      ja: 'おすすめ',
      zh: '推荐',
    },
    matchBreakdown: {
      en: 'Match Breakdown',
      ko: '매칭 분석',
      ja: 'マッチング分析',
      zh: '匹配分析',
    },
    preferenceMatch: {
      en: 'Preference Match',
      ko: '선호도 일치',
      ja: '好みのマッチ',
      zh: '偏好匹配',
    },
    behaviorMatch: {
      en: 'Behavior Match',
      ko: '행동 패턴',
      ja: '行動パターン',
      zh: '行为匹配',
    },
    contextMatch: {
      en: 'Context Match',
      ko: '상황 적합성',
      ja: 'コンテキストマッチ',
      zh: '情境匹配',
    },
    popularityScore: {
      en: 'Popularity',
      ko: '인기도',
      ja: '人気度',
      zh: '热门度',
    },
    distanceScore: {
      en: 'Distance',
      ko: '거리',
      ja: '距離',
      zh: '距离',
    },
    priceScore: {
      en: 'Price Match',
      ko: '가격 적합성',
      ja: '価格マッチ',
      zh: '价格匹配',
    },
    features: {
      en: 'Features',
      ko: '특징',
      ja: '特徴',
      zh: '特色',
    },
    confidence: {
      en: 'Confidence',
      ko: '신뢰도',
      ja: '信頼度',
      zh: '置信度',
    },
    showLess: {
      en: 'Show Less',
      ko: '접기',
      ja: '閉じる',
      zh: '收起',
    },
    showMore: {
      en: 'Show More',
      ko: '더보기',
      ja: 'もっと見る',
      zh: '查看更多',
    },
    viewDetails: {
      en: 'View Details',
      ko: '자세히 보기',
      ja: '詳細を見る',
      zh: '查看详情',
    },
  };

  return texts[key]?.[locale] || texts[key]?.['en'] || key;
}
