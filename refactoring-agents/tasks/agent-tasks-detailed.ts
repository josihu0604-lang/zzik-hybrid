/**
 * 📋 8-Agent Detailed Refactoring Tasks
 * =====================================
 * 각 에이전트별 구체적인 태스크 정의
 */

export interface RefactoringTask {
  id: string;
  agentId: string;
  title: string;
  description: string;
  currentState: string;
  targetState: string;
  affectedFiles: string[];
  complexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedHours: number;
  dependencies?: string[];
  acceptanceCriteria: string[];
}

// ============================================================================
// 🎨 AGENT 1: UX ARCHITECT TASKS
// ============================================================================
export const UX_ARCHITECT_TASKS: RefactoringTask[] = [
  {
    id: 'UX-001',
    agentId: 'agent-ux-architect',
    title: 'Bottom Tab Bar 재설계 (3-Pillar)',
    description: '기존 5개 탭을 Pay/Play/Beauty 중심 3-4개로 재구성',
    currentState: '현재: Home, Map, Wallet, Notifications, Profile 5개 탭',
    targetState: '목표: Home(Play), Pay, Beauty, Profile 4개 탭',
    affectedFiles: [
      'src/components/navigation/BottomTabBar.tsx',
      'src/app/layout.tsx'
    ],
    complexity: 'MEDIUM',
    estimatedHours: 4,
    acceptanceCriteria: [
      '탭 아이콘이 외국인에게 직관적으로 인식됨',
      'Pay 탭에 지갑 아이콘 대신 QR 결제 아이콘 사용',
      'Beauty 탭에 AI/피부 관련 아이콘 사용'
    ]
  },
  {
    id: 'UX-002',
    agentId: 'agent-ux-architect',
    title: 'Tourist-First 온보딩 플로우',
    description: '외국인 관광객을 위한 3단계 온보딩 설계',
    currentState: '현재: 일반적인 앱 온보딩',
    targetState: '목표: 1) 언어선택 2) 통화선택 3) 3-Pillar 소개',
    affectedFiles: [
      'src/app/onboarding/**',
      'src/components/onboarding/**'
    ],
    complexity: 'HIGH',
    estimatedHours: 8,
    acceptanceCriteria: [
      '30초 내에 핵심 가치(환전 무료, 로컬 맛집, AI 피부분석) 전달',
      '언어 자동 감지 후 수동 변경 옵션 제공',
      'Skip 버튼으로 빠른 진입 가능'
    ]
  },
  {
    id: 'UX-003',
    agentId: 'agent-ux-architect',
    title: 'Home 화면 재설계 (Play 중심)',
    description: '홈 화면을 한남/성수 큐레이션 중심으로 재구성',
    currentState: '현재: 2026 Features 데모 화면',
    targetState: '목표: 오늘의 추천 장소 + 빠른 결제 + AI 진단 CTA',
    affectedFiles: [
      'src/app/(home)/page.tsx',
      'src/components/home/**'
    ],
    complexity: 'HIGH',
    estimatedHours: 12,
    acceptanceCriteria: [
      '상단에 현재 위치 기반 추천 장소 3개 표시',
      'Pay Now (QR 결제) 플로팅 버튼 추가',
      'AI Skin Check CTA 배너 추가'
    ]
  },
  {
    id: 'UX-004',
    agentId: 'agent-ux-architect',
    title: 'Landing Page 외국인 타겟팅',
    description: '랜딩 페이지를 외국인 관광객 설득용으로 재설계',
    currentState: '현재: 기술 중심 소개',
    targetState: '목표: "Zero Exchange Fee" 강조 + 사용 사례 중심',
    affectedFiles: [
      'src/app/landing/**',
      'src/components/landing/**'
    ],
    complexity: 'MEDIUM',
    estimatedHours: 6,
    acceptanceCriteria: [
      '히어로 섹션에 "No Exchange Fee" 대문짝 표시',
      '3-Pillar (Pay/Play/Beauty) 각각의 가치 제안 명시',
      'App Store/Google Play 다운로드 버튼 추가'
    ]
  }
];

// ============================================================================
// 💳 AGENT 2: PAY MASTER TASKS
// ============================================================================
export const PAY_MASTER_TASKS: RefactoringTask[] = [
  {
    id: 'PAY-001',
    agentId: 'agent-pay-master',
    title: 'Point System UI (VASP 우회)',
    description: '"코인" 대신 "포인트" 용어로 전체 UI 재설계',
    currentState: '현재: USDT/USDC, 지갑 주소 직접 노출',
    targetState: '목표: "Z-Point" 포인트 시스템, 주소 숨김',
    affectedFiles: [
      'src/components/wallet/WalletCard.tsx',
      'src/app/wallet/page.tsx'
    ],
    complexity: 'CRITICAL',
    estimatedHours: 16,
    acceptanceCriteria: [
      '화면 어디에도 "crypto", "coin", "USDT" 문구 없음',
      '지갑 주소가 사용자에게 노출되지 않음',
      '"포인트 충전"이 환전 UX처럼 느껴짐'
    ]
  },
  {
    id: 'PAY-002',
    agentId: 'agent-pay-master',
    title: 'QR Payment Flow 설계',
    description: '3초 이내 결제 완료되는 QR 스캔 플로우',
    currentState: '현재: QR 결제 기능 미구현',
    targetState: '목표: 스캔 → 금액확인 → 승인 → 완료 (3초)',
    affectedFiles: [
      'src/app/wallet/pay/page.tsx (신규)',
      'src/components/wallet/QRScanner.tsx (신규)',
      'src/components/wallet/PaymentConfirm.tsx (신규)'
    ],
    complexity: 'CRITICAL',
    estimatedHours: 20,
    dependencies: ['PAY-001'],
    acceptanceCriteria: [
      'QR 스캔 후 1초 내 금액 표시',
      '결제 승인 후 2초 내 완료 화면',
      'Haptic Feedback으로 결제 완료 체감',
      '오프라인 결제 시 Optimistic UI 적용'
    ]
  },
  {
    id: 'PAY-003',
    agentId: 'agent-pay-master',
    title: 'Account Abstraction 지갑 생성',
    description: '사용자가 시드 구문 없이 지갑 생성하는 UX',
    currentState: '현재: 기존 지갑 연결 방식',
    targetState: '목표: 소셜 로그인만으로 자동 지갑 생성',
    affectedFiles: [
      'src/lib/wallet/**',
      'src/context/auth-context.tsx',
      'src/app/api/wallet/**'
    ],
    complexity: 'CRITICAL',
    estimatedHours: 24,
    acceptanceCriteria: [
      '사용자가 "지갑"이라는 개념을 인지하지 않음',
      'Google/Apple 로그인 → 즉시 결제 가능',
      'Recovery 옵션은 설정 깊숙이 숨김'
    ]
  },
  {
    id: 'PAY-004',
    agentId: 'agent-pay-master',
    title: 'Point Charge UI (충전 = 환전)',
    description: '외화 → 포인트 충전을 환전처럼 표현',
    currentState: '현재: 암호화폐 입금 방식',
    targetState: '목표: "USD → Z-Point" 환전 UI',
    affectedFiles: [
      'src/app/wallet/charge/page.tsx (신규)',
      'src/components/wallet/ChargeFlow.tsx (신규)'
    ],
    complexity: 'HIGH',
    estimatedHours: 12,
    acceptanceCriteria: [
      '환율 표시 (1 USD = 1,000 Z-Point 등)',
      '충전 수수료 0% 강조 배너',
      '결제 수단 (카드/PayPal/Apple Pay) 선택'
    ]
  },
  {
    id: 'PAY-005',
    agentId: 'agent-pay-master',
    title: 'Transaction History UI',
    description: '결제 내역을 깔끔하게 표시',
    currentState: '현재: 트랜잭션 해시 노출',
    targetState: '목표: 가맹점명 + 금액 + 날짜만 표시',
    affectedFiles: [
      'src/app/wallet/history/page.tsx (신규)',
      'src/components/wallet/TransactionList.tsx (신규)'
    ],
    complexity: 'MEDIUM',
    estimatedHours: 8,
    acceptanceCriteria: [
      '블록체인 용어 완전 제거',
      '가맹점 로고/이름 표시',
      '월별 지출 요약 차트'
    ]
  }
];

// ============================================================================
// 🗺️ AGENT 3: PLAY CURATOR TASKS
// ============================================================================
export const PLAY_CURATOR_TASKS: RefactoringTask[] = [
  {
    id: 'PLAY-001',
    agentId: 'agent-play-curator',
    title: 'Map에 결제 가능 마커 표시',
    description: 'Z-Point 결제 가능 매장을 지도에서 구분',
    currentState: '현재: 모든 마커 동일',
    targetState: '목표: 결제 가능 매장에 특별 마커 + 뱃지',
    affectedFiles: [
      'src/components/map/PopupMarker.tsx',
      'src/components/map/MapboxMap.tsx'
    ],
    complexity: 'MEDIUM',
    estimatedHours: 6,
    acceptanceCriteria: [
      '결제 가능 매장에 "Z-Pay" 뱃지 표시',
      '필터로 "결제 가능 매장만" 토글',
      '마커 색상으로 구분 (결제 가능: 보라색)'
    ]
  },
  {
    id: 'PLAY-002',
    agentId: 'agent-play-curator',
    title: '장소 상세 다국어 지원',
    description: '장소 정보를 EN/JP/ZH/KO로 표시',
    currentState: '현재: 한국어 위주 + 일부 영어',
    targetState: '목표: 사용자 언어 설정에 따라 자동 전환',
    affectedFiles: [
      'src/components/popup/PopupBottomSheet.tsx',
      'src/components/map/PopupBottomSheet.tsx'
    ],
    complexity: 'HIGH',
    estimatedHours: 10,
    dependencies: ['I18N-001'],
    acceptanceCriteria: [
      '메뉴 이름 번역 (또는 음역)',
      '주소를 영어 주소로 변환',
      '영업시간 현지 표기'
    ]
  },
  {
    id: 'PLAY-003',
    agentId: 'agent-play-curator',
    title: '실시간 웨이팅 정보 UI',
    description: '현재 대기 시간/인원 실시간 표시',
    currentState: '현재: 웨이팅 정보 없음',
    targetState: '목표: "현재 대기 5팀 / 약 15분"',
    affectedFiles: [
      'src/components/map/PopupBottomSheet.tsx',
      'src/app/api/places/[id]/waiting/route.ts (신규)'
    ],
    complexity: 'HIGH',
    estimatedHours: 12,
    acceptanceCriteria: [
      '대기 시간 실시간 업데이트 (30초 간격)',
      '푸시 알림 "곧 입장 가능합니다"',
      '예약 대행 버튼 연동'
    ]
  },
  {
    id: 'PLAY-004',
    agentId: 'agent-play-curator',
    title: 'AI 큐레이션 추천 섹션',
    description: '"오늘의 AI 추천" 섹션 추가',
    currentState: '현재: 정적 추천 리스트',
    targetState: '목표: 사용자 취향 + 현재 시간 기반 동적 추천',
    affectedFiles: [
      'src/components/ai/AIRecommendations.tsx',
      'src/app/api/ai/recommendations/route.ts'
    ],
    complexity: 'MEDIUM',
    estimatedHours: 8,
    acceptanceCriteria: [
      '"점심 추천" / "저녁 추천" 시간대별 전환',
      '"당신의 취향 기반" 개인화 문구',
      '추천 이유 1줄 표시'
    ]
  },
  {
    id: 'PLAY-005',
    agentId: 'agent-play-curator',
    title: '예약 대행 플로우',
    description: '인기 식당 예약 대행 기능',
    currentState: '현재: 예약 기능 없음',
    targetState: '목표: 날짜/시간/인원 선택 → 예약 요청',
    affectedFiles: [
      'src/app/booking/page.tsx (신규)',
      'src/components/booking/BookingForm.tsx (신규)'
    ],
    complexity: 'HIGH',
    estimatedHours: 16,
    acceptanceCriteria: [
      '캘린더에서 날짜 선택',
      '시간대 슬롯 표시',
      '예약 확정 푸시 알림'
    ]
  }
];

// ============================================================================
// ✨ AGENT 4: BEAUTY AI TASKS
// ============================================================================
export const BEAUTY_AI_TASKS: RefactoringTask[] = [
  {
    id: 'BEAUTY-001',
    agentId: 'agent-beauty-ai',
    title: 'AI Skin Analysis 카메라 UI',
    description: '얼굴 촬영 → AI 분석 플로우 재설계',
    currentState: '현재: SkinGlowAnalyzer 데모 컴포넌트',
    targetState: '목표: 실제 작동하는 피부 분석 플로우',
    affectedFiles: [
      'src/components/ai-2026/SkinGlowAnalyzer.tsx',
      'src/app/beauty/analyze/page.tsx (신규)'
    ],
    complexity: 'CRITICAL',
    estimatedHours: 20,
    acceptanceCriteria: [
      '카메라 프레임에 얼굴 가이드 오버레이',
      '조명 상태 체크 ("더 밝은 곳으로 이동하세요")',
      '분석 중 로딩 애니메이션',
      '결과 화면에 피부 타입 + 점수 표시'
    ]
  },
  {
    id: 'BEAUTY-002',
    agentId: 'agent-beauty-ai',
    title: '피부 타입별 추천 UI',
    description: '분석 결과 기반 제품/시술 추천',
    currentState: '현재: 추천 기능 없음',
    targetState: '목표: 화장품 추천 + 시술 추천 탭',
    affectedFiles: [
      'src/app/beauty/results/page.tsx (신규)',
      'src/components/beauty/RecommendationTabs.tsx (신규)'
    ],
    complexity: 'HIGH',
    estimatedHours: 14,
    dependencies: ['BEAUTY-001'],
    acceptanceCriteria: [
      '피부 고민별 탭 (주름, 색소침착, 모공 등)',
      '추천 제품 구매 링크 (외부 쇼핑몰)',
      '추천 시술 상세 정보 + 가격대'
    ]
  },
  {
    id: 'BEAUTY-003',
    agentId: 'agent-beauty-ai',
    title: '피부과/성형외과 매칭 UI',
    description: 'AI 분석 결과 기반 병원 추천 리스트',
    currentState: '현재: K-Experience 리스트 존재',
    targetState: '목표: "당신의 피부에 맞는 병원" 개인화',
    affectedFiles: [
      'src/app/k-experiences/page.tsx',
      'src/components/k-experience/**'
    ],
    complexity: 'HIGH',
    estimatedHours: 12,
    dependencies: ['BEAUTY-001'],
    acceptanceCriteria: [
      '병원별 전문 분야 매칭 점수 표시',
      '가격대 필터 ($$, $$$, $$$$)',
      '외국인 리뷰 우선 표시'
    ]
  },
  {
    id: 'BEAUTY-004',
    agentId: 'agent-beauty-ai',
    title: '시술 예약 + 결제 통합',
    description: '병원 선택 → 시술 선택 → 결제까지 원스톱',
    currentState: '현재: 예약/결제 기능 없음',
    targetState: '목표: 앱 내에서 예약 + Z-Point 결제',
    affectedFiles: [
      'src/app/beauty/booking/page.tsx (신규)',
      'src/components/beauty/TreatmentBooking.tsx (신규)'
    ],
    complexity: 'CRITICAL',
    estimatedHours: 20,
    dependencies: ['PAY-002', 'BEAUTY-003'],
    acceptanceCriteria: [
      '시술 메뉴 선택 UI',
      '예약 일시 선택 캘린더',
      'Z-Point 또는 카드 결제 선택',
      '예약 확정 영수증 화면'
    ]
  },
  {
    id: 'BEAUTY-005',
    agentId: 'agent-beauty-ai',
    title: 'Before/After 비교 UI (Proof of Glow)',
    description: '시술 전후 피부 변화 기록 기능',
    currentState: '현재: 개념만 존재',
    targetState: '목표: 시술 전 촬영 → 시술 후 촬영 → AI 비교',
    affectedFiles: [
      'src/app/beauty/proof/page.tsx (신규)',
      'src/components/beauty/BeforeAfterCompare.tsx (신규)'
    ],
    complexity: 'HIGH',
    estimatedHours: 16,
    dependencies: ['BEAUTY-001'],
    acceptanceCriteria: [
      '좌우 슬라이드 비교 UI',
      'AI가 개선도 점수 계산',
      'SNS 공유 기능 (선택적 블러 처리)'
    ]
  }
];

// ============================================================================
// 🌍 AGENT 5: I18N GLOBAL TASKS
// ============================================================================
export const I18N_GLOBAL_TASKS: RefactoringTask[] = [
  {
    id: 'I18N-001',
    agentId: 'agent-i18n-global',
    title: '4개 언어 번역 파일 구조화',
    description: 'EN/JP/ZH/KO 번역 파일 체계적 구성',
    currentState: '현재: i18n 폴더에 일부 번역만 존재',
    targetState: '목표: 모든 UI 텍스트 4개 언어 지원',
    affectedFiles: [
      'src/i18n/**'
    ],
    complexity: 'HIGH',
    estimatedHours: 20,
    acceptanceCriteria: [
      'JSON 기반 번역 파일 (en.json, ja.json, zh.json, ko.json)',
      '누락 번역 자동 감지 스크립트',
      '컴포넌트별 namespace 분리'
    ]
  },
  {
    id: 'I18N-002',
    agentId: 'agent-i18n-global',
    title: '통화 자동 변환 표시',
    description: '사용자 설정에 따라 가격을 USD/JPY/CNY/KRW로 표시',
    currentState: '현재: KRW만 표시',
    targetState: '목표: 선택 통화로 자동 변환 표시',
    affectedFiles: [
      'src/hooks/useCurrency.ts',
      'src/components/ui/PriceDisplay.tsx (신규)'
    ],
    complexity: 'MEDIUM',
    estimatedHours: 8,
    acceptanceCriteria: [
      '실시간 환율 API 연동',
      '가격 옆에 원화 표시 (참고용)',
      '소수점 처리 (JPY는 정수, USD는 2자리)'
    ]
  },
  {
    id: 'I18N-003',
    agentId: 'agent-i18n-global',
    title: '언어별 폰트 최적화',
    description: 'JP/ZH 문자가 깨지지 않도록 폰트 설정',
    currentState: '현재: Inter + Noto Sans KR',
    targetState: '목표: JP는 Noto Sans JP, ZH는 Noto Sans SC',
    affectedFiles: [
      'src/app/layout.tsx',
      'tailwind.config.ts'
    ],
    complexity: 'LOW',
    estimatedHours: 4,
    acceptanceCriteria: [
      '일본어 글자 렌더링 정상',
      '중국어 간체 렌더링 정상',
      '폰트 로딩 성능 유지'
    ]
  }
];

// ============================================================================
// 🔐 AGENT 6: AUTH SECURE TASKS
// ============================================================================
export const AUTH_SECURE_TASKS: RefactoringTask[] = [
  {
    id: 'AUTH-001',
    agentId: 'agent-auth-secure',
    title: '소셜 로그인 통합 (Google/Apple)',
    description: '외국인이 한국 번호 없이 가입할 수 있는 방식',
    currentState: '현재: 다양한 로그인 방식 혼재',
    targetState: '목표: Google/Apple 우선, Kakao 선택적',
    affectedFiles: [
      'src/app/login/page.tsx',
      'src/components/auth/**',
      'src/app/api/auth/**'
    ],
    complexity: 'MEDIUM',
    estimatedHours: 10,
    acceptanceCriteria: [
      'Google 로그인 버튼 최상단 배치',
      'Apple 로그인 (iOS 필수)',
      '한국 번호 입력 단계 생략 가능'
    ]
  },
  {
    id: 'AUTH-002',
    agentId: 'agent-auth-secure',
    title: 'GDPR 동의 UI',
    description: '유럽 사용자를 위한 개인정보 동의 절차',
    currentState: '현재: 한국 개인정보 동의만',
    targetState: '목표: GDPR 준수 동의 화면 추가',
    affectedFiles: [
      'src/app/onboarding/consent/page.tsx (신규)',
      'src/components/auth/ConsentForm.tsx (신규)'
    ],
    complexity: 'MEDIUM',
    estimatedHours: 6,
    acceptanceCriteria: [
      '필수/선택 동의 항목 구분',
      '각 항목 상세 내용 펼치기',
      '동의 철회 방법 안내'
    ]
  }
];

// ============================================================================
// ⚡ AGENT 7: PERF NINJA TASKS
// ============================================================================
export const PERF_NINJA_TASKS: RefactoringTask[] = [
  {
    id: 'PERF-001',
    agentId: 'agent-perf-ninja',
    title: 'Core Web Vitals 최적화',
    description: 'LCP < 2.5s, FID < 100ms, CLS < 0.1 달성',
    currentState: '현재: 측정 필요',
    targetState: '목표: 모든 지표 Good 등급',
    affectedFiles: [
      'src/components/analytics/WebVitals.tsx',
      'next.config.ts'
    ],
    complexity: 'HIGH',
    estimatedHours: 12,
    acceptanceCriteria: [
      'Lighthouse Performance 90+ 점수',
      'LCP 원인 분석 및 해결',
      '이미지 lazy loading 적용'
    ]
  },
  {
    id: 'PERF-002',
    agentId: 'agent-perf-ninja',
    title: '번들 사이즈 분석 및 최적화',
    description: '초기 JS 번들 200KB 이하 목표',
    currentState: '현재: 분석 필요',
    targetState: '목표: 코드 스플리팅으로 초기 로딩 최소화',
    affectedFiles: [
      'src/components/lazy.tsx',
      'next.config.ts'
    ],
    complexity: 'MEDIUM',
    estimatedHours: 8,
    acceptanceCriteria: [
      'Bundle Analyzer 리포트 생성',
      '미사용 패키지 제거',
      'Dynamic Import 적극 활용'
    ]
  }
];

// ============================================================================
// 🧪 AGENT 8: QA GUARDIAN TASKS
// ============================================================================
export const QA_GUARDIAN_TASKS: RefactoringTask[] = [
  {
    id: 'QA-001',
    agentId: 'agent-qa-guardian',
    title: '결제 플로우 E2E 테스트',
    description: 'QR 스캔 → 결제 완료 전체 플로우 테스트',
    currentState: '현재: E2E 테스트 없음',
    targetState: '목표: Playwright 기반 결제 시나리오 테스트',
    affectedFiles: [
      'e2e/payment.spec.ts (신규)',
      'playwright.config.ts'
    ],
    complexity: 'HIGH',
    estimatedHours: 12,
    dependencies: ['PAY-002'],
    acceptanceCriteria: [
      '정상 결제 시나리오 통과',
      '잔액 부족 시나리오 통과',
      '네트워크 오류 시나리오 통과'
    ]
  },
  {
    id: 'QA-002',
    agentId: 'agent-qa-guardian',
    title: '다국어 QA 체크리스트',
    description: '4개 언어별 UI 깨짐/누락 체크',
    currentState: '현재: 체크리스트 없음',
    targetState: '목표: 언어별 스크린샷 비교 자동화',
    affectedFiles: [
      'e2e/i18n.spec.ts (신규)'
    ],
    complexity: 'MEDIUM',
    estimatedHours: 8,
    dependencies: ['I18N-001'],
    acceptanceCriteria: [
      '긴 텍스트 오버플로우 없음',
      '번역 누락 항목 0개',
      'RTL(아랍어) 대응 준비'
    ]
  }
];

// ============================================================================
// 📊 TASK SUMMARY
// ============================================================================
export const ALL_TASKS = [
  ...UX_ARCHITECT_TASKS,
  ...PAY_MASTER_TASKS,
  ...PLAY_CURATOR_TASKS,
  ...BEAUTY_AI_TASKS,
  ...I18N_GLOBAL_TASKS,
  ...AUTH_SECURE_TASKS,
  ...PERF_NINJA_TASKS,
  ...QA_GUARDIAN_TASKS
];

export const TASK_SUMMARY = {
  totalTasks: ALL_TASKS.length,
  totalHours: ALL_TASKS.reduce((sum, t) => sum + t.estimatedHours, 0),
  byComplexity: {
    LOW: ALL_TASKS.filter(t => t.complexity === 'LOW').length,
    MEDIUM: ALL_TASKS.filter(t => t.complexity === 'MEDIUM').length,
    HIGH: ALL_TASKS.filter(t => t.complexity === 'HIGH').length,
    CRITICAL: ALL_TASKS.filter(t => t.complexity === 'CRITICAL').length
  },
  byAgent: {
    'UX Architect': UX_ARCHITECT_TASKS.length,
    'Pay Master': PAY_MASTER_TASKS.length,
    'Play Curator': PLAY_CURATOR_TASKS.length,
    'Beauty AI': BEAUTY_AI_TASKS.length,
    'i18n Global': I18N_GLOBAL_TASKS.length,
    'Auth Secure': AUTH_SECURE_TASKS.length,
    'Perf Ninja': PERF_NINJA_TASKS.length,
    'QA Guardian': QA_GUARDIAN_TASKS.length
  }
};
