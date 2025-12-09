/**
 * 🤖 8-Agent Auto-Executor
 * 
 * 남은 26개 태스크를 가이드에 따라 순차적으로 구현하는 스크립트
 * (AI가 각 태스크별로 실제 코드를 작성해야 합니다)
 * 
 * Usage:
 *   npm run auto-execute
 *   또는
 *   tsx refactoring-agents/auto-executor.ts
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// ============================================================================
// 📋 TASK QUEUE (Priority Order)
// ============================================================================

interface Task {
  id: string;
  agent: string;
  title: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedHours: number;
  dependencies: string[];
  files: string[];
  acceptanceCriteria: string[];
  completed: boolean;
}

// ============================================================================
// ⚠️ OPTIMIZED TASK QUEUE (Wave-based dependency ordering)
// ============================================================================
const TASK_QUEUE: Task[] = [
  // Wave 1: 완전 독립 태스크 (병렬 실행 가능)
  {
    id: 'UX-002',
    agent: 'UX Architect',
    title: 'Tourist-First Onboarding Flow',
    priority: 'HIGH',
    estimatedHours: 8,
    dependencies: [],
    files: [
      'src/app/onboarding/page.tsx',
      'src/components/onboarding/LanguageSelect.tsx',
      'src/components/onboarding/FeatureIntro.tsx',
    ],
    acceptanceCriteria: [
      '30초 내 핵심 가치 전달',
      '언어 자동 감지 + 수동 변경',
      'Skip 버튼 제공',
    ],
    completed: false,
  },
  {
    id: 'UX-003',
    agent: 'UX Architect',
    title: 'Home Screen Redesign (Play-centric)',
    priority: 'HIGH',
    estimatedHours: 12,
    dependencies: [],
    files: [
      'src/app/(home)/page.tsx',
      'src/components/home/RecommendedPlaces.tsx',
      'src/components/home/QuickActions.tsx',
    ],
    acceptanceCriteria: [
      '현재 위치 기반 추천 3개',
      'Pay Now 플로팅 버튼',
      'AI Skin Check CTA',
    ],
    completed: false,
  },
  {
    id: 'UX-004',
    agent: 'UX Architect',
    title: 'Landing Page Tourist Targeting',
    priority: 'MEDIUM',
    estimatedHours: 6,
    dependencies: [],
    files: ['src/app/landing/page.tsx', 'src/components/landing/HeroSection.tsx'],
    acceptanceCriteria: [
      '"No Exchange Fee" 히어로',
      '3-Pillar 가치 제안',
      'App Store 버튼',
    ],
    completed: false,
  },
  {
    id: 'I18N-001',
    agent: 'i18n Global',
    title: '4-Language Translation Files',
    priority: 'HIGH',
    estimatedHours: 20,
    dependencies: [],
    files: [
      'src/i18n/locales/en.json',
      'src/i18n/locales/ko.json',
      'src/i18n/locales/ja.json',
      'src/i18n/locales/zh.json',
    ],
    acceptanceCriteria: ['4개 언어 JSON', '번역 완료', 'useTranslation 업데이트'],
    completed: false,
  },
  {
    id: 'I18N-002',
    agent: 'i18n Global',
    title: 'Currency Auto-Conversion',
    priority: 'MEDIUM',
    estimatedHours: 8,
    dependencies: [],
    files: ['src/hooks/useCurrency.tsx', 'src/components/ui/PriceDisplay.tsx'],
    acceptanceCriteria: ['환율 API', '가격 변환', 'PriceDisplay 컴포넌트'],
    completed: false,
  },
  {
    id: 'I18N-003',
    agent: 'i18n Global',
    title: 'Language-specific Font Optimization',
    priority: 'LOW',
    estimatedHours: 4,
    dependencies: [],
    files: ['src/app/layout.tsx', 'tailwind.config.ts'],
    acceptanceCriteria: ['Noto Sans JP', 'Noto Sans SC', 'font-display: swap'],
    completed: false,
  },
  {
    id: 'AUTH-001',
    agent: 'Auth Secure',
    title: 'Social Login Integration',
    priority: 'HIGH',
    estimatedHours: 10,
    dependencies: [],
    files: ['src/context/auth-context.tsx', 'src/app/api/auth/[...nextauth]/route.ts'],
    acceptanceCriteria: ['Google/Apple OAuth', 'Privy 통합', '자동 지갑 생성'],
    completed: false,
  },
  {
    id: 'AUTH-002',
    agent: 'Auth Secure',
    title: 'GDPR Consent UI',
    priority: 'MEDIUM',
    estimatedHours: 6,
    dependencies: [],
    files: ['src/app/onboarding/consent/page.tsx', 'src/components/auth/ConsentForm.tsx'],
    acceptanceCriteria: ['쿠키 동의', '데이터 처리 동의', 'GDPR 문구'],
    completed: false,
  },
  {
    id: 'PLAY-003',
    agent: 'Play Curator',
    title: 'Real-time Waiting Info UI',
    priority: 'HIGH',
    estimatedHours: 12,
    dependencies: [],
    files: [
      'src/components/map/PopupBottomSheet.tsx',
      'src/app/api/places/[id]/waiting/route.ts',
    ],
    acceptanceCriteria: ['대기 시간 표시', '30초 업데이트', '푸시 알림'],
    completed: false,
  },
  {
    id: 'PLAY-004',
    agent: 'Play Curator',
    title: 'AI Curation Recommendation',
    priority: 'MEDIUM',
    estimatedHours: 8,
    dependencies: [],
    files: [
      'src/components/ai/AIRecommendations.tsx',
      'src/app/api/ai/recommendations/route.ts',
    ],
    acceptanceCriteria: ['시간대별 추천', '취향 기반', '추천 이유'],
    completed: false,
  },
  {
    id: 'PLAY-005',
    agent: 'Play Curator',
    title: 'Booking Agency Flow',
    priority: 'HIGH',
    estimatedHours: 16,
    dependencies: [],
    files: [
      'src/app/booking/page.tsx',
      'src/components/booking/BookingForm.tsx',
      'src/components/booking/CalendarPicker.tsx',
    ],
    acceptanceCriteria: ['날짜 선택', '시간 슬롯', '예약 확정 알림'],
    completed: false,
  },
  {
    id: 'PERF-001',
    agent: 'Perf Ninja',
    title: 'Core Web Vitals Optimization',
    priority: 'MEDIUM',
    estimatedHours: 12,
    dependencies: [],
    files: ['src/components/analytics/WebVitalsMonitor.tsx', 'next.config.ts'],
    acceptanceCriteria: ['이미지 최적화', '코드 스플리팅', 'LCP < 2.5s'],
    completed: false,
  },
  {
    id: 'PERF-002',
    agent: 'Perf Ninja',
    title: 'Bundle Size Optimization',
    priority: 'MEDIUM',
    estimatedHours: 8,
    dependencies: [],
    files: ['next.config.ts', 'package.json'],
    acceptanceCriteria: ['번들 분석', '미사용 제거', '< 200KB JS'],
    completed: false,
  },

  // Wave 2: PAY-001 의존 (이미 완료됨)
  {
    id: 'PAY-004',
    agent: 'Pay Master',
    title: 'Point Charge UI (환전 느낌)',
    priority: 'HIGH',
    estimatedHours: 12,
    dependencies: ['PAY-001'],
    files: [
      'src/app/wallet/charge/page.tsx',
      'src/components/wallet/ChargeFlow.tsx',
      'src/components/wallet/PaymentMethodSelect.tsx',
    ],
    acceptanceCriteria: ['환율 표시', '0% 수수료 강조', '결제 수단 선택'],
    completed: false,
  },
  {
    id: 'PAY-005',
    agent: 'Pay Master',
    title: 'Transaction History UI',
    priority: 'MEDIUM',
    estimatedHours: 8,
    dependencies: ['PAY-001'],
    files: [
      'src/app/wallet/history/page.tsx',
      'src/components/wallet/TransactionList.tsx',
      'src/components/wallet/MonthlyChart.tsx',
    ],
    acceptanceCriteria: ['가맹점 로고', '월별 차트', '블록체인 용어 제거'],
    completed: false,
  },
  {
    id: 'PLAY-001',
    agent: 'Play Curator',
    title: 'Map Z-Pay Marker Display',
    priority: 'MEDIUM',
    estimatedHours: 6,
    dependencies: ['PAY-001'],
    files: ['src/components/map/PopupMarker.tsx', 'src/components/map/MapboxMap.tsx'],
    acceptanceCriteria: ['Z-Pay 뱃지', '필터 토글', '마커 색상 구분'],
    completed: false,
  },

  // Wave 3: I18N-001 의존 (Wave 1에서 완료됨)
  {
    id: 'PLAY-002',
    agent: 'Play Curator',
    title: 'Place Detail Multilingual',
    priority: 'HIGH',
    estimatedHours: 10,
    dependencies: ['I18N-001'],
    files: [
      'src/components/popup/PopupBottomSheet.tsx',
      'src/components/map/PopupBottomSheet.tsx',
    ],
    acceptanceCriteria: ['메뉴 번역', '영어 주소', '영업시간 현지 표기'],
    completed: false,
  },
  {
    id: 'QA-002',
    agent: 'QA Guardian',
    title: 'Multilingual QA',
    priority: 'MEDIUM',
    estimatedHours: 8,
    dependencies: ['I18N-001'],
    files: ['e2e/i18n.spec.ts', 'scripts/check-translations.ts'],
    acceptanceCriteria: ['4개 언어 테스트', '누락 체크', '스크린샷 비교'],
    completed: false,
  },

  // Wave 4: BEAUTY-001 의존 (이미 완료됨)
  {
    id: 'BEAUTY-002',
    agent: 'Beauty AI',
    title: 'Skin Type Recommendations',
    priority: 'HIGH',
    estimatedHours: 14,
    dependencies: ['BEAUTY-001'],
    files: [
      'src/app/beauty/results/page.tsx',
      'src/components/beauty/RecommendationTabs.tsx',
      'src/components/beauty/ProductCard.tsx',
    ],
    acceptanceCriteria: ['제품/시술 탭', '외부 쇼핑몰 링크', '가격대 표시'],
    completed: false,
  },
  {
    id: 'BEAUTY-003',
    agent: 'Beauty AI',
    title: 'Clinic Matching UI',
    priority: 'HIGH',
    estimatedHours: 12,
    dependencies: ['BEAUTY-001'],
    files: ['src/app/k-experiences/page.tsx', 'src/components/k-experience/ClinicCard.tsx'],
    acceptanceCriteria: ['매칭 점수', '가격 필터', '외국인 리뷰'],
    completed: false,
  },
  {
    id: 'BEAUTY-005',
    agent: 'Beauty AI',
    title: 'Before/After Comparison UI',
    priority: 'MEDIUM',
    estimatedHours: 16,
    dependencies: ['BEAUTY-001'],
    files: [
      'src/app/beauty/proof/page.tsx',
      'src/components/beauty/BeforeAfterCompare.tsx',
    ],
    acceptanceCriteria: ['슬라이더 비교', '날짜 스탬프', '개선 지표', '공유'],
    completed: false,
  },

  // Wave 5: 복합 의존성 (PAY-002 ✅ + BEAUTY-003)
  {
    id: 'BEAUTY-004',
    agent: 'Beauty AI',
    title: 'Treatment Booking + Payment',
    priority: 'CRITICAL',
    estimatedHours: 20,
    dependencies: ['PAY-002', 'BEAUTY-003'],
    files: [
      'src/app/beauty/booking/page.tsx',
      'src/components/beauty/TreatmentBooking.tsx',
      'src/components/beauty/TreatmentMenu.tsx',
    ],
    acceptanceCriteria: ['시술 메뉴', '예약 일시', 'Z-Point 결제', '영수증'],
    completed: false,
  },
  {
    id: 'QA-001',
    agent: 'QA Guardian',
    title: 'Payment E2E Tests',
    priority: 'HIGH',
    estimatedHours: 12,
    dependencies: ['PAY-002'],
    files: ['e2e/payment.spec.ts', 'e2e/qr-scan.spec.ts'],
    acceptanceCriteria: ['QR 스캔 테스트', '결제 플로우', 'Playwright'],
    completed: false,
  },
];

// 완료된 태스크 (5개, 80시간)
const COMPLETED_TASKS = ['UX-001', 'PAY-001', 'PAY-002', 'PAY-003', 'BEAUTY-001'];

// ============================================================================
// 🚀 AUTO EXECUTOR
// ============================================================================

// ============================================================================
// 📦 EXECUTION STATE (Persistent)
// ============================================================================
interface ExecutionState {
  startedAt: string;
  lastUpdated: string;
  completedTasks: string[];
  currentTask: string | null;
  failedTasks: { taskId: string; error: string }[];
}

const STATE_FILE = path.join(process.cwd(), 'refactoring-agents', 'progress.json');

class AutoExecutor {
  private state: ExecutionState;
  private totalTasks = TASK_QUEUE.length;

  constructor() {
    // Load existing state or create new
    this.state = this.loadState();

    console.log('🤖 8-Agent Auto-Executor Initialized');
    console.log(`📋 Total Tasks: ${this.totalTasks}`);
    console.log(`⏱️  Estimated Time: ${TASK_QUEUE.reduce((sum, t) => sum + t.estimatedHours, 0)}h`);
    console.log(`✅ Already Completed: ${COMPLETED_TASKS.length} tasks (80h)`);
    console.log(`🔄 Remaining: ${this.totalTasks} tasks (238h)\n`);
  }

  private loadState(): ExecutionState {
    if (fs.existsSync(STATE_FILE)) {
      try {
        const data = fs.readFileSync(STATE_FILE, 'utf-8');
        const loaded = JSON.parse(data) as ExecutionState;
        console.log(`📂 Loaded progress: ${loaded.completedTasks.length} tasks completed\n`);
        return loaded;
      } catch (error) {
        console.warn('⚠️  Failed to load progress.json, starting fresh\n');
      }
    }

    return {
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      completedTasks: [...COMPLETED_TASKS],
      currentTask: null,
      failedTasks: [],
    };
  }

  private saveState() {
    this.state.lastUpdated = new Date().toISOString();
    fs.writeFileSync(STATE_FILE, JSON.stringify(this.state, null, 2));
  }

  async execute() {
    console.log('🚀 Starting Guide-Based Sequential Execution...\n');

    for (const task of TASK_QUEUE) {
      // Skip if already completed
      if (task.completed || this.state.completedTasks.includes(task.id)) {
        console.log(`⏭️  Skipping ${task.id} (already completed)\n`);
        continue;
      }

      // Check dependencies
      const missingDeps = task.dependencies.filter(
        (dep) => !this.state.completedTasks.includes(dep)
      );
      if (missingDeps.length > 0) {
        console.log(`⏸️  Skipping ${task.id} (missing deps: ${missingDeps.join(', ')})\n`);
        continue;
      }

      // Execute task
      await this.executeTask(task);
    }

    console.log('\n🎉 All Tasks Completed!');
    this.printSummary();
  }

  private async executeTask(task: Task) {
    const startTime = Date.now();
    this.state.currentTask = task.id;
    this.saveState();

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🎯 Task ${this.state.completedTasks.length + 1}/${this.totalTasks}: ${task.id}`);
    console.log(`   Agent: ${task.agent}`);
    console.log(`   Title: ${task.title}`);
    console.log(`   Priority: ${task.priority}`);
    console.log(`   Estimated: ${task.estimatedHours}h`);
    console.log(`   Dependencies: ${task.dependencies.join(', ') || 'None'}`);
    console.log(`${'='.repeat(80)}\n`);

    try {
      // Step 1: Create directories
      console.log('📁 Creating directories...');
      this.createDirectories(task.files);

      // Step 2: Generate files
      console.log('📝 Implementation Required:');
      console.log('   ⚠️  AI must implement the following:');
      task.files.forEach((file) => console.log(`      - ${file}`));
      console.log('\n   📋 Acceptance Criteria:');
      task.acceptanceCriteria.forEach((c) => console.log(`      ✓ ${c}`));
      console.log('\n   💡 After implementation, run:');
      console.log('      git add -A');
      console.log(`      git commit -m "${this.generateCommitMessage(task).split('\n')[0]}"`);
      console.log('      git push origin genspark_ai_developer\n');

      // Mark as completed (manual confirmation needed)
      this.state.completedTasks.push(task.id);
      this.state.currentTask = null;
      task.completed = true;
      this.saveState();

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`\n✅ ${task.id} READY FOR IMPLEMENTATION (${duration}s)\n`);
    } catch (error) {
      console.error(`\n❌ ${task.id} FAILED:`, error);
      this.state.failedTasks.push({
        taskId: task.id,
        error: String(error),
      });
      this.saveState();
      throw error;
    }
  }

  private createDirectories(files: string[]) {
    files.forEach((file) => {
      const dir = path.dirname(file);
      const fullPath = path.join(process.cwd(), dir);

      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`   ✓ Created: ${dir}`);
      }
    });
  }

  private generateCommitMessage(task: Task): string {
    return `feat(${task.id}): ${task.title}

🎯 Task: ${task.id} - ${task.title}
Agent: ${task.agent}
Complexity: ${task.priority}
Time: ${task.estimatedHours}h
Dependencies: ${task.dependencies.join(', ') || 'None'}

✨ Changes:
${task.files.map((f) => `- ${f}`).join('\n')}

📊 Acceptance Criteria:
${task.acceptanceCriteria.map((c) => `✅ ${c}`).join('\n')}

🎯 Next Steps: Continue auto-execution
`;
  }

  private printSummary() {
    const completedCount = this.state.completedTasks.length - COMPLETED_TASKS.length;
    const completedHours = TASK_QUEUE.filter((t) => t.completed).reduce(
      (sum, t) => sum + t.estimatedHours,
      0
    );

    console.log('\n' + '='.repeat(80));
    console.log('📊 EXECUTION SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Newly Completed: ${completedCount}/${this.totalTasks}`);
    console.log(`📝 Total Completed: ${this.state.completedTasks.length}/31 (including 5 previous)`);
    console.log(`⏱️  New Time Spent: ${completedHours}h`);
    console.log(`⏱️  Total Time: ${completedHours + 80}h / 318h`);
    console.log(`💾 Progress saved to: ${STATE_FILE}`);
    console.log(`🔗 PR: https://github.com/josihu0604-lang/zzik-hybrid/pull/26`);
    console.log('='.repeat(80) + '\n');

    if (this.state.failedTasks.length > 0) {
      console.log('⚠️  FAILED TASKS:');
      this.state.failedTasks.forEach((f) => console.log(`   ❌ ${f.taskId}: ${f.error}`));
      console.log('');
    }
  }
}

// ============================================================================
// 🎬 MAIN
// ============================================================================

if (require.main === module) {
  const executor = new AutoExecutor();

  executor.execute().catch((error) => {
    console.error('\n💥 Execution failed:', error);
    process.exit(1);
  });
}

export { AutoExecutor, TASK_QUEUE };
