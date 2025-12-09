/**
 * 🔧 8-Agent Frontend Refactoring System
 * =======================================
 * Project U-100 프론트엔드를 뜯어고치기 위한 8개 전문 에이전트
 * 
 * 목표: 기존 566개 파일(297 TSX + 269 TS)을 
 *       Project U-100 v2.0 (외국인 관광객 타겟) 에 맞게 재설계
 */

export interface RefactoringAgent {
  id: string;
  name: string;
  emoji: string;
  role: string;
  domain: string[];
  responsibilities: string[];
  targetFiles: string[];
  priority: 'P0' | 'P1' | 'P2';
  estimatedTasks: number;
  keyQuestions: string[];
}

/**
 * 🎯 8개 리팩토링 에이전트 정의
 * 
 * 각 에이전트는 특정 도메인을 담당하며,
 * Project U-100의 3-Pillar (Pay, Play, Beauty)에 맞춰 재설계
 */
export const REFACTORING_AGENTS: RefactoringAgent[] = [
  // ============================================================================
  // TIER 1: CORE EXPERIENCE (P0 - 필수)
  // ============================================================================
  {
    id: 'agent-ux-architect',
    name: 'UX Architect',
    emoji: '🎨',
    role: 'User Experience & Flow Designer',
    domain: ['User Journey', 'Navigation', 'Onboarding', 'Layout'],
    responsibilities: [
      '외국인 관광객 중심 UX 플로우 재설계',
      '언어/통화 자동 감지 온보딩 설계',
      '3-Pillar (Pay/Play/Beauty) 네비게이션 구조',
      'Bottom Tab Bar 메뉴 재구성',
      '첫 사용자 경험(FTUE) 최적화'
    ],
    targetFiles: [
      'src/app/layout.tsx',
      'src/app/(home)/page.tsx',
      'src/components/navigation/BottomTabBar.tsx',
      'src/components/onboarding/**',
      'src/app/landing/**'
    ],
    priority: 'P0',
    estimatedTasks: 15,
    keyQuestions: [
      '외국인이 앱 설치 후 30초 내에 핵심 가치를 이해하는가?',
      'Pay/Play/Beauty 3개 탭으로 충분한가?',
      '현재 BottomTabBar 메뉴가 관광객에게 직관적인가?'
    ]
  },
  {
    id: 'agent-pay-master',
    name: 'Pay Master',
    emoji: '💳',
    role: 'Payment & Wallet System Architect',
    domain: ['Stablecoin', 'Wallet', 'QR Payment', 'Account Abstraction'],
    responsibilities: [
      '스테이블코인(USDT/USDC) 결제 플로우 설계',
      'Account Abstraction 지갑 UX 구현',
      'QR 코드 결제 화면 설계',
      '포인트 시스템(VASP 우회) UI 설계',
      '결제 Latency 최적화 (3초 이내)'
    ],
    targetFiles: [
      'src/app/wallet/**',
      'src/components/wallet/**',
      'src/app/api/wallet/**',
      'src/app/api/payment/**',
      'src/lib/wallet/**'
    ],
    priority: 'P0',
    estimatedTasks: 20,
    keyQuestions: [
      '사용자가 "코인"이라는 단어를 인지하지 않고 결제할 수 있는가?',
      'QR 스캔 → 결제 완료까지 3초 이내 가능한가?',
      '포인트 충전 UI가 환전 느낌을 주는가?'
    ]
  },
  {
    id: 'agent-play-curator',
    name: 'Play Curator',
    emoji: '🗺️',
    role: 'Map & Place Discovery Architect',
    domain: ['Map', 'Search', 'Place Details', 'Reviews', 'Booking'],
    responsibilities: [
      '한남/성수 핫플레이스 맵 UI 재설계',
      '외국어(EN/JP/ZH) 장소 정보 표시',
      '실시간 웨이팅 정보 UI',
      '예약 대행 플로우 설계',
      'AI 큐레이션 추천 UI'
    ],
    targetFiles: [
      'src/app/map/**',
      'src/components/map/**',
      'src/components/popup/**',
      'src/app/search/**',
      'src/components/search/**'
    ],
    priority: 'P0',
    estimatedTasks: 18,
    keyQuestions: [
      '지도에서 "스테이블코인 결제 가능" 매장이 구분되는가?',
      '장소 상세 페이지에 영어/일본어/중국어가 표시되는가?',
      '"AI가 추천" 섹션이 눈에 띄는가?'
    ]
  },
  {
    id: 'agent-beauty-ai',
    name: 'Beauty AI',
    emoji: '✨',
    role: 'K-Beauty & AI Skin Analysis Architect',
    domain: ['AI Skin Analysis', 'Beauty Recommendation', 'Clinic Booking', 'Treatment'],
    responsibilities: [
      'AI 피부 분석 카메라 UI 설계',
      '피부 타입별 제품/시술 추천 UI',
      '피부과/성형외과 매칭 플로우',
      '시술 예약 및 결제 통합',
      'Before/After 비교 UI (Proof of Glow)'
    ],
    targetFiles: [
      'src/components/ai/**',
      'src/components/ai-2026/**',
      'src/app/ai-demo/**',
      'src/app/k-experiences/**',
      'src/components/k-experience/**'
    ],
    priority: 'P0',
    estimatedTasks: 16,
    keyQuestions: [
      'AI 피부 분석 결과가 신뢰감을 주는가?',
      '추천 병원 리스트가 광고처럼 보이지 않는가?',
      '시술 예약 → 결제까지 원스톱인가?'
    ]
  },

  // ============================================================================
  // TIER 2: SUPPORTING SYSTEMS (P1 - 중요)
  // ============================================================================
  {
    id: 'agent-i18n-global',
    name: 'i18n Global',
    emoji: '🌍',
    role: 'Internationalization & Localization Architect',
    domain: ['i18n', 'Currency', 'Timezone', 'RTL Support'],
    responsibilities: [
      '다국어 지원 시스템 (EN/JP/ZH/KO)',
      '통화 자동 변환 표시 (USD/JPY/CNY/KRW)',
      '날짜/시간 포맷 현지화',
      'SEO 다국어 메타 태그',
      '언어별 폰트 최적화'
    ],
    targetFiles: [
      'src/i18n/**',
      'src/hooks/useCurrency.ts',
      'src/components/i18n/**',
      'src/lib/seo/**',
      'src/middleware.ts'
    ],
    priority: 'P1',
    estimatedTasks: 12,
    keyQuestions: [
      '브라우저 언어 감지가 자동으로 작동하는가?',
      '가격이 사용자 통화로 표시되는가?',
      '일본어/중국어 폰트가 깨지지 않는가?'
    ]
  },
  {
    id: 'agent-auth-secure',
    name: 'Auth Secure',
    emoji: '🔐',
    role: 'Authentication & Security Architect',
    domain: ['Auth', 'OAuth', 'Wallet Connect', 'Session', 'Privacy'],
    responsibilities: [
      '소셜 로그인 (Google/Apple/Kakao) 통합',
      '지갑 연결 없는 Account Abstraction 인증',
      '세션 관리 및 보안 강화',
      'GDPR/개인정보 처리 동의 UI',
      '2FA/생체 인증 옵션'
    ],
    targetFiles: [
      'src/app/auth/**',
      'src/app/login/**',
      'src/context/auth-context.tsx',
      'src/components/auth/**',
      'src/app/api/account/**'
    ],
    priority: 'P1',
    estimatedTasks: 10,
    keyQuestions: [
      '외국인이 한국 번호 없이 가입할 수 있는가?',
      '지갑 주소가 노출되지 않는가?',
      '로그인 → 결제까지 몇 번의 클릭이 필요한가?'
    ]
  },

  // ============================================================================
  // TIER 3: OPTIMIZATION & QUALITY (P2 - 선택)
  // ============================================================================
  {
    id: 'agent-perf-ninja',
    name: 'Perf Ninja',
    emoji: '⚡',
    role: 'Performance & Optimization Architect',
    domain: ['Core Web Vitals', 'Bundle Size', 'Lazy Loading', 'Caching'],
    responsibilities: [
      'Core Web Vitals 최적화 (LCP/FID/CLS)',
      '번들 사이즈 분석 및 코드 스플리팅',
      '이미지/폰트 최적화',
      'Prefetching/Preloading 전략',
      'Cloudflare Edge 캐싱 설정'
    ],
    targetFiles: [
      'src/components/lazy.tsx',
      'src/components/loading/**',
      'src/hooks/usePerformanceMode.ts',
      'next.config.ts',
      'src/components/analytics/**'
    ],
    priority: 'P2',
    estimatedTasks: 8,
    keyQuestions: [
      'LCP가 2.5초 이내인가?',
      '3G 네트워크에서도 사용 가능한가?',
      '초기 JS 번들이 200KB 이하인가?'
    ]
  },
  {
    id: 'agent-qa-guardian',
    name: 'QA Guardian',
    emoji: '🧪',
    role: 'Quality Assurance & Testing Architect',
    domain: ['Unit Test', 'E2E Test', 'A11Y', 'Error Handling'],
    responsibilities: [
      '컴포넌트 단위 테스트 커버리지 확보',
      'E2E 테스트 시나리오 (결제 플로우)',
      '접근성(A11Y) 검증',
      '에러 바운더리 및 폴백 UI',
      '다국어 QA 체크리스트'
    ],
    targetFiles: [
      'src/__tests__/**',
      'e2e/**',
      'src/components/error/**',
      'src/app/error.tsx',
      'src/app/global-error.tsx'
    ],
    priority: 'P2',
    estimatedTasks: 10,
    keyQuestions: [
      '결제 실패 시 사용자에게 명확한 피드백이 있는가?',
      '스크린 리더로 앱을 사용할 수 있는가?',
      '테스트 커버리지가 70% 이상인가?'
    ]
  }
];

/**
 * 📊 에이전트별 우선순위 요약
 */
export const AGENT_PRIORITY_SUMMARY = {
  P0: {
    label: '🔴 Critical (MVP 필수)',
    agents: ['UX Architect', 'Pay Master', 'Play Curator', 'Beauty AI'],
    totalTasks: 69,
    description: 'Project U-100 핵심 가치 구현에 필수적인 리팩토링'
  },
  P1: {
    label: '🟡 Important (런칭 전 완료)',
    agents: ['i18n Global', 'Auth Secure'],
    totalTasks: 22,
    description: '외국인 사용자 경험에 직접 영향을 미치는 기능'
  },
  P2: {
    label: '🟢 Nice-to-Have (런칭 후 개선)',
    agents: ['Perf Ninja', 'QA Guardian'],
    totalTasks: 18,
    description: '품질 및 성능 개선 (점진적 적용)'
  }
};

/**
 * 🎯 3-Pillar 매핑
 */
export const THREE_PILLAR_MAPPING = {
  Pay: {
    primaryAgent: 'agent-pay-master',
    supportAgents: ['agent-auth-secure', 'agent-ux-architect'],
    description: '환전 없는 스테이블코인 결제'
  },
  Play: {
    primaryAgent: 'agent-play-curator',
    supportAgents: ['agent-i18n-global', 'agent-ux-architect'],
    description: '로컬 핫플레이스 큐레이션'
  },
  Beauty: {
    primaryAgent: 'agent-beauty-ai',
    supportAgents: ['agent-pay-master', 'agent-i18n-global'],
    description: 'AI 피부분석 & K-뷰티 시술 매칭'
  }
};

export type AgentId = typeof REFACTORING_AGENTS[number]['id'];
