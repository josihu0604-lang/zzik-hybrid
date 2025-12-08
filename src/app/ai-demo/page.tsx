/**
 * AI Features Demo Page
 *
 * Showcases all AI features:
 * - Recommendations
 * - Semantic Search
 * - Vibe Analysis
 * - Smart Notifications
 */
'use client';

import { useState, useEffect } from 'react';
import { AIRecommendations, SemanticSearchBar } from '@/components/ai';

type Tab = 'recommendations' | 'search' | 'vibe' | 'notifications';

interface AIStatus {
  geminiAvailable: boolean;
  metrics?: {
    requestCount: number;
    cacheHitRate: number;
    avgResponseTime: number;
  };
}

export default function AIDemoPage() {
  const [activeTab, setActiveTab] = useState<Tab>('recommendations');
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);

  // Fetch AI service status on mount (client-side only)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/ai/status');
        const data = await response.json();
        setAiStatus(data.data);
      } catch (error) {
        console.error('[AI Demo] Failed to fetch status:', error);
      }
    };

    fetchStatus();
  }, []);

  return (
    <div className="min-h-screen bg-bg text-primary">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-bg/80 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">ZZIK AI Features</h1>
              <p className="text-sm text-secondary mt-1">Gemini 2.0 Flash 기반 AI 기능 데모</p>
            </div>

            {/* Status Badge */}
            {aiStatus && (
              <div
                className={`
                px-3 py-1.5 rounded-full text-xs font-medium
                ${aiStatus.geminiAvailable ? 'bg-green-500/20 text-green-400' : 'bg-ember/20 text-flame'}
              `}
              >
                {aiStatus.geminiAvailable ? '🟢 Gemini API 활성' : '🟡 데모 모드'}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {[
              { id: 'recommendations', label: '추천 시스템', emoji: '🎯' },
              { id: 'search', label: '의미 검색', emoji: '🔍' },
              { id: 'vibe', label: 'Vibe 분석', emoji: '✨' },
              { id: 'notifications', label: '스마트 알림', emoji: '🔔' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`
                  px-4 py-3 text-sm font-medium transition-all
                  border-b-2
                  ${
                    activeTab === tab.id
                      ? 'border-flame text-flame'
                      : 'border-transparent text-secondary hover:text-primary'
                  }
                `}
              >
                <span className="mr-2">{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'recommendations' && <RecommendationsTab />}
        {activeTab === 'search' && <SearchTab />}
        {activeTab === 'vibe' && <VibeAnalysisTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-sm text-secondary text-center">
            <div className="mb-2">
              Powered by <span className="text-flame font-medium">Gemini 2.0 Flash</span>
            </div>
            {aiStatus?.metrics && (
              <div className="flex justify-center gap-4 text-xs">
                <span>요청: {aiStatus.metrics.requestCount}</span>
                <span>•</span>
                <span>캐시 히트: {Math.round(aiStatus.metrics.cacheHitRate * 100)}%</span>
                <span>•</span>
                <span>평균 응답: {Math.round(aiStatus.metrics.avgResponseTime)}ms</span>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================================
// Tab Components
// ============================================================================

function RecommendationsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">AI 기반 팝업 추천</h2>
        <p className="text-sm text-secondary">
          사용자 참여 이력, 취향, 유사 사용자 분석을 통한 개인화 추천
        </p>
      </div>

      <AIRecommendations
        userId="demo-user"
        limit={12}
        demoMode={true}
        onPopupClick={(id) => alert(`팝업 클릭: ${id}`)}
      />
    </div>
  );
}

function SearchTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">자연어 의미 검색</h2>
        <p className="text-sm text-secondary mb-6">
          자연어로 검색하면 AI가 의미를 파악하여 관련 팝업을 찾아줍니다
        </p>

        <SemanticSearchBar
          userId="demo-user"
          placeholder="예: 성수 감성 카페 팝업, 이번 주말 홍대 패션 팝업"
          onResultClick={(id) => alert(`팝업 클릭: ${id}`)}
        />
      </div>

      {/* Example Queries */}
      <div className="bg-elevated rounded-xl p-6">
        <h3 className="font-medium mb-3">검색 예시</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {[
            '성수 감성 카페 팝업',
            '이번 주말 강남 패션 팝업',
            '마감 임박한 뷰티 팝업',
            '아늑한 분위기 팝업',
            '홍대 힙한 팝업',
            '데이트하기 좋은 팝업',
          ].map((example) => (
            <div key={example} className="text-secondary">
              • {example}
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            emoji: '🧠',
            title: '의미 기반 검색',
            desc: '단순 키워드가 아닌 의미를 파악',
          },
          {
            emoji: '🎯',
            title: '카테고리 자동 인식',
            desc: '패션, 뷰티, 카페 등 자동 분류',
          },
          {
            emoji: '📍',
            title: '위치 인식',
            desc: '성수, 강남, 홍대 등 지역 파악',
          },
        ].map((feature) => (
          <div key={feature.title} className="bg-elevated rounded-xl p-4">
            <div className="text-3xl mb-2">{feature.emoji}</div>
            <div className="font-medium mb-1">{feature.title}</div>
            <div className="text-sm text-secondary">{feature.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface VibeAnalysis {
  vibe: string;
  location_type: string;
  mood: string;
  confidence: number;
  visual_tags?: string[];
  categories?: string[];
  target_demographics?: string[];
}

function VibeAnalysisTab() {
  const [description, setDescription] = useState('');
  const [analysis, setAnalysis] = useState<VibeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeVibe = async () => {
    if (!description.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/vibe-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      const data = await response.json();
      if (data.success) {
        setAnalysis(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">팝업 Vibe 자동 분석</h2>
        <p className="text-sm text-secondary">
          팝업 설명을 입력하면 AI가 자동으로 분위기, 타겟층, 키워드를 분석합니다
        </p>
      </div>

      <div className="bg-elevated rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">팝업 설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="예: 성수동의 감성 가득한 카페 팝업. 따뜻한 분위기에서 인생샷을 남겨보세요. 한정판 디저트와 함께하는 특별한 경험."
            rows={5}
            className="w-full px-4 py-3 bg-surface text-primary border border-border rounded-lg resize-none focus:outline-none focus:border-flame/50"
          />
        </div>

        <button
          onClick={analyzeVibe}
          disabled={!description.trim() || isAnalyzing}
          className="w-full py-3 bg-flame text-white rounded-lg font-medium hover:bg-ember disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isAnalyzing ? '분석 중...' : 'Vibe 분석하기'}
        </button>
      </div>

      {/* Analysis Result */}
      {analysis && (
        <div className="bg-elevated rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-lg">분석 결과</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface rounded-lg p-4">
              <div className="text-sm text-secondary mb-1">Vibe</div>
              <div className="font-medium">{analysis.vibe}</div>
            </div>

            <div className="bg-surface rounded-lg p-4">
              <div className="text-sm text-secondary mb-1">장소 유형</div>
              <div className="font-medium">{analysis.location_type}</div>
            </div>

            <div className="bg-surface rounded-lg p-4">
              <div className="text-sm text-secondary mb-1">무드</div>
              <div className="font-medium">{analysis.mood}</div>
            </div>

            <div className="bg-surface rounded-lg p-4">
              <div className="text-sm text-secondary mb-1">신뢰도</div>
              <div className="font-medium">{Math.round(analysis.confidence * 100)}%</div>
            </div>
          </div>

          {/* Visual Tags */}
          {analysis.visual_tags && (
            <div>
              <div className="text-sm text-secondary mb-2">비주얼 태그</div>
              <div className="flex flex-wrap gap-2">
                {analysis.visual_tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-flame/20 text-flame rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {analysis.categories && (
            <div>
              <div className="text-sm text-secondary mb-2">카테고리</div>
              <div className="flex flex-wrap gap-2">
                {analysis.categories.map((cat: string) => (
                  <span
                    key={cat}
                    className="px-3 py-1 bg-surface text-primary rounded-full text-sm"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Target Demographics */}
          {analysis.target_demographics && (
            <div>
              <div className="text-sm text-secondary mb-2">타겟층</div>
              <div className="text-primary">{analysis.target_demographics.join(', ')}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">스마트 알림 시스템</h2>
        <p className="text-sm text-secondary">
          사용자의 활동 패턴을 분석하여 최적의 시간에 개인화된 알림 전송
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            emoji: '⏰',
            title: '타이밍 최적화',
            desc: '사용자가 가장 반응할 확률이 높은 시간 계산',
            features: ['과거 참여 시간 분석', '요일별 패턴 학습', '알림 피로도 방지'],
          },
          {
            emoji: '✍️',
            title: '메시지 개인화',
            desc: 'AI가 사용자에게 맞춤형 알림 메시지 생성',
            features: ['선호 카테고리 반영', '긴급도 자동 조정', '이모지 최적화'],
          },
          {
            emoji: '📊',
            title: '배치 처리',
            desc: '스팸 방지를 위한 지능형 알림 그룹화',
            features: ['알림 다이제스트', '조용한 시간대 존중', '최대 알림 수 제한'],
          },
          {
            emoji: '🎯',
            title: '타입별 전략',
            desc: '알림 종류에 따른 차별화된 전송 전략',
            features: ['마감 임박', '목표 달성 근접', '유사 팝업 추천'],
          },
        ].map((feature) => (
          <div key={feature.title} className="bg-elevated rounded-xl p-6">
            <div className="text-4xl mb-3">{feature.emoji}</div>
            <h3 className="font-medium mb-2">{feature.title}</h3>
            <p className="text-sm text-secondary mb-3">{feature.desc}</p>
            <ul className="space-y-1 text-sm text-secondary">
              {feature.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-flame">•</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Example Notifications */}
      <div className="bg-elevated rounded-xl p-6">
        <h3 className="font-medium mb-4">알림 예시</h3>
        <div className="space-y-3">
          {[
            {
              type: '마감 임박',
              emoji: '🔥',
              message: '성수 카페 팝업이 2일 후 마감돼요! 지금 참여하세요',
              time: '오후 7:32',
              urgency: 'high',
            },
            {
              type: '목표 근접',
              emoji: '🎉',
              message: '강남 패션 팝업이 95% 달성! 5명만 더 참여하면 오픈됩니다',
              time: '오후 6:15',
              urgency: 'medium',
            },
            {
              type: '맞춤 추천',
              emoji: '✨',
              message: '좋아하시는 뷰티 카테고리의 새 팝업이 등록되었어요',
              time: '오후 1:20',
              urgency: 'low',
            },
          ].map((notif) => (
            <div
              key={notif.message}
              className={`
                p-4 rounded-lg border
                ${notif.urgency === 'high' ? 'border-flame/30 bg-flame/5' : 'border-border bg-surface'}
              `}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{notif.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-secondary">{notif.type}</span>
                    <span className="text-xs text-border">•</span>
                    <span className="text-xs text-secondary">{notif.time}</span>
                  </div>
                  <div className="text-sm">{notif.message}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
