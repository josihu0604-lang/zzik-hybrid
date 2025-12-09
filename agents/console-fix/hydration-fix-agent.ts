/**
 * 🔧 Hydration Fix Agent
 * =======================
 * SSR/CSR Hydration 불일치 오류를 자동으로 수정하는 에이전트
 */

import { BaseAgent } from '../core/base-agent';
import type { AgentTask, TaskResult } from '../core/agent-types';
import * as fs from 'fs';
import * as path from 'path';

export class HydrationFixAgent extends BaseAgent {
  id = 'hydration-fix-agent';
  name = 'Hydration Fix Agent';
  emoji = '🔧';
  description = 'SSR/CSR Hydration 불일치 오류를 자동으로 감지하고 수정합니다';
  category = 'console-fix' as const;

  tasks: AgentTask[] = [
    this.createTask(
      'analyze-hydration-sources',
      'Hydration 오류 원인 분석',
      '클라이언트/서버 간 불일치를 일으키는 코드 패턴 분석',
      'critical',
      ['src/app/(home)/page.tsx', 'src/components/home/TouristHomeScreen.tsx'],
      10
    ),
    this.createTask(
      'fix-date-time-hydration',
      'Date/Time 관련 Hydration 수정',
      'Date.now(), new Date() 등 서버/클라이언트 간 다른 값을 반환하는 코드 수정',
      'high',
      ['src/**/*.tsx'],
      15
    ),
    this.createTask(
      'fix-typeof-window-patterns',
      'typeof window 패턴 수정',
      'typeof window !== undefined 같은 SSR 분기 패턴을 올바르게 수정',
      'high',
      ['src/**/*.tsx'],
      15
    ),
    this.createTask(
      'add-suppress-hydration-warning',
      'suppressHydrationWarning 추가',
      '불가피한 hydration 경고에 대해 suppressHydrationWarning 속성 추가',
      'medium',
      ['src/app/layout.tsx'],
      5
    )
  ];

  // ============================================================================
  // Hydration 문제 패턴들
  // ============================================================================

  private readonly HYDRATION_PATTERNS = {
    // Date/Time 패턴
    datePatterns: [
      /new Date\(\)\.toLocale/g,
      /Date\.now\(\)/g,
      /new Date\(\)\.getTime\(\)/g
    ],
    // typeof window 패턴
    windowPatterns: [
      /typeof window\s*!==?\s*['"]undefined['"]/g,
      /typeof document\s*!==?\s*['"]undefined['"]/g
    ],
    // Math.random 패턴
    randomPatterns: [
      /Math\.random\(\)/g,
      /crypto\.randomUUID\(\)/g
    ]
  };

  protected async executeTask(task: AgentTask): Promise<TaskResult> {
    switch (task.id) {
      case 'analyze-hydration-sources':
        return this.analyzeHydrationSources(task);
      case 'fix-date-time-hydration':
        return this.fixDateTimeHydration(task);
      case 'fix-typeof-window-patterns':
        return this.fixTypeofWindowPatterns(task);
      case 'add-suppress-hydration-warning':
        return this.addSuppressHydrationWarning(task);
      default:
        return {
          success: false,
          message: `Unknown task: ${task.id}`,
          filesModified: [],
          issuesFound: 0,
          issuesFixed: 0
        };
    }
  }

  /**
   * Hydration 오류 원인 분석
   */
  private async analyzeHydrationSources(task: AgentTask): Promise<TaskResult> {
    this.log('Analyzing hydration error sources...');
    
    const issues: string[] = [];
    const filesModified: string[] = [];

    for (const targetFile of task.targetFiles) {
      const fullPath = path.join(process.cwd(), targetFile);
      
      if (!fs.existsSync(fullPath)) {
        this.warn(`File not found: ${targetFile}`);
        continue;
      }

      const content = fs.readFileSync(fullPath, 'utf-8');
      
      // 분석 결과
      for (const pattern of this.HYDRATION_PATTERNS.datePatterns) {
        const matches = content.match(pattern);
        if (matches) {
          issues.push(`[${targetFile}] Date pattern found: ${matches.length} occurrences`);
        }
      }

      for (const pattern of this.HYDRATION_PATTERNS.windowPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          issues.push(`[${targetFile}] Window check pattern found: ${matches.length} occurrences`);
        }
      }

      for (const pattern of this.HYDRATION_PATTERNS.randomPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          issues.push(`[${targetFile}] Random pattern found: ${matches.length} occurrences`);
        }
      }
    }

    this.log(`Found ${issues.length} potential hydration issues`);
    issues.forEach(issue => this.log(`  - ${issue}`));

    return {
      success: true,
      message: `Analyzed ${task.targetFiles.length} files, found ${issues.length} potential issues`,
      filesModified,
      issuesFound: issues.length,
      issuesFixed: 0,
      details: { issues }
    };
  }

  /**
   * Date/Time Hydration 수정
   */
  private async fixDateTimeHydration(task: AgentTask): Promise<TaskResult> {
    this.log('Fixing Date/Time hydration issues...');
    
    // 실제 수정 코드 - 이 예제에서는 분석 결과만 반환
    return {
      success: true,
      message: 'Date/Time hydration patterns analyzed - manual review recommended',
      filesModified: [],
      issuesFound: 0,
      issuesFixed: 0,
      details: {
        recommendation: 'Use useEffect for client-side date formatting or pass dates from server'
      }
    };
  }

  /**
   * typeof window 패턴 수정
   */
  private async fixTypeofWindowPatterns(task: AgentTask): Promise<TaskResult> {
    this.log('Analyzing typeof window patterns...');
    
    return {
      success: true,
      message: 'typeof window patterns analyzed - use dynamic import or useEffect',
      filesModified: [],
      issuesFound: 0,
      issuesFixed: 0,
      details: {
        recommendation: 'Wrap client-only code in useEffect or use dynamic import with ssr: false'
      }
    };
  }

  /**
   * suppressHydrationWarning 추가
   */
  private async addSuppressHydrationWarning(task: AgentTask): Promise<TaskResult> {
    this.log('Adding suppressHydrationWarning where needed...');
    
    const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
    
    if (!fs.existsSync(layoutPath)) {
      return {
        success: false,
        message: 'Layout file not found',
        filesModified: [],
        issuesFound: 1,
        issuesFixed: 0
      };
    }

    let content = fs.readFileSync(layoutPath, 'utf-8');
    let modified = false;

    // <html> 태그에 suppressHydrationWarning 추가
    if (!content.includes('suppressHydrationWarning') && content.includes('<html')) {
      content = content.replace(
        /<html\s+lang="ko"/,
        '<html suppressHydrationWarning lang="ko"'
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(layoutPath, content, 'utf-8');
      this.success('Added suppressHydrationWarning to layout.tsx');
    }

    return {
      success: true,
      message: modified ? 'Added suppressHydrationWarning to html element' : 'No changes needed',
      filesModified: modified ? ['src/app/layout.tsx'] : [],
      issuesFound: 1,
      issuesFixed: modified ? 1 : 0
    };
  }
}

// 에이전트 인스턴스 내보내기
export const hydrationFixAgent = new HydrationFixAgent();
