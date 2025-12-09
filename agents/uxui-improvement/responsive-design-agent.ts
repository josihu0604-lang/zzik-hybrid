/**
 * 📱 Responsive Design Agent
 * ===========================
 * 반응형 디자인 이슈를 자동으로 감지하고 수정하는 에이전트
 */

import { BaseAgent } from '../core/base-agent';
import type { AgentTask, TaskResult } from '../core/agent-types';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

export class ResponsiveDesignAgent extends BaseAgent {
  id = 'responsive-design-agent';
  name = 'Responsive Design Agent';
  emoji = '📱';
  description = '반응형 디자인 이슈를 감지하고 모바일 퍼스트 디자인을 적용합니다';
  category = 'uxui-improvement' as const;

  tasks: AgentTask[] = [
    this.createTask(
      'scan-fixed-widths',
      '고정 너비 스캔',
      '반응형을 해치는 고정 픽셀 값 찾기',
      'high',
      ['src/components/**/*.tsx'],
      15
    ),
    this.createTask(
      'scan-mobile-breakpoints',
      '모바일 브레이크포인트 분석',
      'sm, md, lg 브레이크포인트 사용 패턴 분석',
      'medium',
      ['src/components/**/*.tsx'],
      10
    ),
    this.createTask(
      'fix-overflow-issues',
      '오버플로우 이슈 수정',
      '가로 스크롤을 일으키는 요소 감지 및 수정',
      'high',
      ['src/components/**/*.tsx'],
      15
    ),
    this.createTask(
      'optimize-touch-targets',
      '터치 타겟 최적화',
      '모바일에서 터치하기 어려운 작은 요소 감지',
      'medium',
      ['src/components/**/*.tsx'],
      10
    ),
    this.createTask(
      'add-safe-area-insets',
      'Safe Area Insets 추가',
      'iOS/Android 노치 및 홈 인디케이터 대응',
      'high',
      ['src/app/layout.tsx', 'src/components/navigation/BottomTabBar.tsx'],
      10
    )
  ];

  // 반응형 문제 패턴
  private readonly RESPONSIVE_PATTERNS = {
    // 고정 너비 (큰 값)
    fixedWidths: /w-\[(\d+)(px|rem)\]/g,
    // 고정 높이 (큰 값)
    fixedHeights: /h-\[(\d+)(px|rem)\]/g,
    // 절대 위치 (문제가 될 수 있는)
    absolutePositions: /absolute[^}]*left-\[\d+px\]|absolute[^}]*right-\[\d+px\]/g,
    // 작은 터치 타겟
    smallTargets: /(w-[2-5]|h-[2-5])\s+[^}]*(onClick|href)/g,
    // overflow-visible (문제가 될 수 있는)
    overflowVisible: /overflow-visible/g
  };

  // 권장 터치 타겟 크기 (44x44px 이상)
  private readonly MIN_TOUCH_TARGET = 44;

  // 문제가 되는 고정 크기 임계값
  private readonly FIXED_SIZE_THRESHOLD = 400;

  protected async executeTask(task: AgentTask): Promise<TaskResult> {
    switch (task.id) {
      case 'scan-fixed-widths':
        return this.scanFixedWidths(task);
      case 'scan-mobile-breakpoints':
        return this.scanMobileBreakpoints(task);
      case 'fix-overflow-issues':
        return this.fixOverflowIssues(task);
      case 'optimize-touch-targets':
        return this.optimizeTouchTargets(task);
      case 'add-safe-area-insets':
        return this.addSafeAreaInsets(task);
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
   * 고정 너비 스캔
   */
  private async scanFixedWidths(task: AgentTask): Promise<TaskResult> {
    this.log('Scanning for fixed width/height values...');
    
    const issues: { file: string; value: string; line: number }[] = [];
    const files = glob.sync('src/components/**/*.tsx', { cwd: process.cwd() });

    for (const file of files) {
      const fullPath = path.join(process.cwd(), file);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // 고정 너비 검사
        const widthMatches = line.matchAll(/w-\[(\d+)px\]/g);
        for (const match of widthMatches) {
          const value = parseInt(match[1]);
          if (value > this.FIXED_SIZE_THRESHOLD) {
            issues.push({
              file,
              value: match[0],
              line: index + 1
            });
          }
        }

        // 인라인 스타일 검사
        const inlineWidths = line.matchAll(/width:\s*(\d+)px/g);
        for (const match of inlineWidths) {
          const value = parseInt(match[1]);
          if (value > this.FIXED_SIZE_THRESHOLD) {
            issues.push({
              file,
              value: `width: ${value}px`,
              line: index + 1
            });
          }
        }
      });
    }

    this.log(`Found ${issues.length} fixed width/height issues`);

    return {
      success: true,
      message: `Found ${issues.length} fixed sizes that may cause responsive issues`,
      filesModified: [],
      issuesFound: issues.length,
      issuesFixed: 0,
      details: { issues: issues.slice(0, 30) }
    };
  }

  /**
   * 모바일 브레이크포인트 분석
   */
  private async scanMobileBreakpoints(task: AgentTask): Promise<TaskResult> {
    this.log('Analyzing breakpoint usage patterns...');
    
    const breakpointStats: Record<string, number> = {
      sm: 0,
      md: 0,
      lg: 0,
      xl: 0,
      '2xl': 0
    };

    const mobileFirstIssues: { file: string; pattern: string }[] = [];
    const files = glob.sync('src/components/**/*.tsx', { cwd: process.cwd() });

    for (const file of files) {
      const fullPath = path.join(process.cwd(), file);
      const content = fs.readFileSync(fullPath, 'utf-8');

      // 각 브레이크포인트 사용 횟수 카운트
      for (const bp of Object.keys(breakpointStats)) {
        const regex = new RegExp(`${bp}:`, 'g');
        const matches = content.match(regex);
        if (matches) {
          breakpointStats[bp] += matches.length;
        }
      }

      // 데스크톱 퍼스트 패턴 감지 (lg:block + hidden)
      if (content.includes('lg:block') && content.includes('hidden')) {
        mobileFirstIssues.push({ file, pattern: 'Desktop-first pattern detected (lg:block with hidden)' });
      }

      // 데스크톱 전용 스타일 감지
      if (content.includes('lg:flex') && !content.includes('flex')) {
        mobileFirstIssues.push({ file, pattern: 'Missing mobile base style (lg:flex without base flex)' });
      }
    }

    this.log('Breakpoint usage statistics:');
    for (const [bp, count] of Object.entries(breakpointStats)) {
      this.log(`  - ${bp}: ${count} occurrences`);
    }

    return {
      success: true,
      message: `Analyzed breakpoint usage across ${files.length} files`,
      filesModified: [],
      issuesFound: mobileFirstIssues.length,
      issuesFixed: 0,
      details: { breakpointStats, mobileFirstIssues }
    };
  }

  /**
   * 오버플로우 이슈 수정
   */
  private async fixOverflowIssues(task: AgentTask): Promise<TaskResult> {
    this.log('Scanning for overflow issues...');
    
    const issues: { file: string; type: string; line: number }[] = [];
    const files = glob.sync('src/components/**/*.tsx', { cwd: process.cwd() });

    for (const file of files) {
      const fullPath = path.join(process.cwd(), file);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // 가로 스크롤을 일으킬 수 있는 패턴
        if (line.includes('overflow-x-visible') || line.includes('overflow-visible')) {
          issues.push({ file, type: 'overflow-visible', line: index + 1 });
        }

        // width: 100vw (body 마진 때문에 문제)
        if (line.includes('w-screen') || line.includes('width: 100vw')) {
          issues.push({ file, type: '100vw-without-overflow-hidden', line: index + 1 });
        }

        // 가로 스크롤 컨테이너 없이 flex nowrap
        if (line.includes('flex-nowrap') && !line.includes('overflow')) {
          issues.push({ file, type: 'flex-nowrap-without-overflow', line: index + 1 });
        }
      });
    }

    this.log(`Found ${issues.length} potential overflow issues`);

    return {
      success: true,
      message: `Found ${issues.length} potential overflow issues`,
      filesModified: [],
      issuesFound: issues.length,
      issuesFixed: 0,
      details: { issues }
    };
  }

  /**
   * 터치 타겟 최적화
   */
  private async optimizeTouchTargets(task: AgentTask): Promise<TaskResult> {
    this.log('Scanning for small touch targets...');
    
    const issues: { file: string; element: string; size: string }[] = [];
    const files = glob.sync('src/components/**/*.tsx', { cwd: process.cwd() });

    // Tailwind 크기를 픽셀로 변환
    const sizeToPixels: Record<string, number> = {
      '1': 4, '2': 8, '3': 12, '4': 16, '5': 20, '6': 24, '7': 28, '8': 32,
      '9': 36, '10': 40, '11': 44, '12': 48
    };

    for (const file of files) {
      const fullPath = path.join(process.cwd(), file);
      const content = fs.readFileSync(fullPath, 'utf-8');

      // 작은 클릭 가능 요소 검사
      const buttonPattern = /<button[^>]*className="[^"]*\b(w-(\d+)|h-(\d+))[^"]*"[^>]*>/gi;
      let match;
      
      while ((match = buttonPattern.exec(content)) !== null) {
        const size = match[2] || match[3];
        const pixels = sizeToPixels[size];
        
        if (pixels && pixels < this.MIN_TOUCH_TARGET) {
          issues.push({
            file,
            element: 'button',
            size: `${pixels}px (${match[1]})`
          });
        }
      }

      // 링크 검사
      const linkPattern = /<a[^>]*className="[^"]*\b(w-(\d+)|h-(\d+))[^"]*"[^>]*>/gi;
      while ((match = linkPattern.exec(content)) !== null) {
        const size = match[2] || match[3];
        const pixels = sizeToPixels[size];
        
        if (pixels && pixels < this.MIN_TOUCH_TARGET) {
          issues.push({
            file,
            element: 'link',
            size: `${pixels}px (${match[1]})`
          });
        }
      }
    }

    this.log(`Found ${issues.length} touch targets smaller than ${this.MIN_TOUCH_TARGET}px`);

    return {
      success: true,
      message: `Found ${issues.length} small touch targets (< ${this.MIN_TOUCH_TARGET}px)`,
      filesModified: [],
      issuesFound: issues.length,
      issuesFixed: 0,
      details: { 
        issues,
        recommendation: `Touch targets should be at least ${this.MIN_TOUCH_TARGET}px (w-11 h-11) for accessibility`
      }
    };
  }

  /**
   * Safe Area Insets 추가
   */
  private async addSafeAreaInsets(task: AgentTask): Promise<TaskResult> {
    this.log('Checking Safe Area Insets implementation...');
    
    const issues: string[] = [];
    let modified = false;

    // BottomTabBar 검사
    const bottomTabPath = path.join(process.cwd(), 'src/components/navigation/BottomTabBar.tsx');
    if (fs.existsSync(bottomTabPath)) {
      const content = fs.readFileSync(bottomTabPath, 'utf-8');
      
      if (!content.includes('pb-safe') && !content.includes('safe-area-inset')) {
        issues.push('BottomTabBar: Missing safe area padding for home indicator');
      }

      if (!content.includes('env(safe-area-inset')) {
        issues.push('BottomTabBar: Consider using env(safe-area-inset-bottom)');
      }
    }

    // Layout 검사
    const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
    if (fs.existsSync(layoutPath)) {
      const content = fs.readFileSync(layoutPath, 'utf-8');
      
      if (!content.includes('viewport-fit=cover')) {
        issues.push('Layout: viewport-fit=cover may be missing for notch support');
      }
    }

    this.log(`Found ${issues.length} Safe Area issues`);
    issues.forEach(issue => this.log(`  - ${issue}`));

    return {
      success: true,
      message: `Found ${issues.length} Safe Area implementation issues`,
      filesModified: [],
      issuesFound: issues.length,
      issuesFixed: 0,
      details: { 
        issues,
        recommendation: 'Add pb-safe or padding-bottom: env(safe-area-inset-bottom) to bottom fixed elements'
      }
    };
  }
}

// 에이전트 인스턴스 내보내기
export const responsiveDesignAgent = new ResponsiveDesignAgent();
