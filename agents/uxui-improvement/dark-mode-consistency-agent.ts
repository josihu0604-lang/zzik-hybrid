/**
 * 🌙 Dark Mode Consistency Agent
 * ===============================
 * 다크 모드 일관성을 자동으로 검사하고 수정하는 에이전트
 */

import { BaseAgent } from '../core/base-agent';
import type { AgentTask, TaskResult } from '../core/agent-types';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

export class DarkModeConsistencyAgent extends BaseAgent {
  id = 'dark-mode-consistency-agent';
  name = 'Dark Mode Consistency Agent';
  emoji = '🌙';
  description = '다크 모드 스타일 일관성을 검사하고 수정합니다';
  category = 'uxui-improvement' as const;

  tasks: AgentTask[] = [
    this.createTask(
      'scan-light-mode-issues',
      '라이트 모드 사용 스캔',
      '다크 테마 앱에서 라이트 모드 스타일을 사용하는 컴포넌트 찾기',
      'high',
      ['src/components/**/*.tsx'],
      15
    ),
    this.createTask(
      'fix-tourist-home-screen',
      'TouristHomeScreen 다크 모드 수정',
      'TouristHomeScreen의 라이트 모드를 다크 모드로 변환',
      'critical',
      ['src/components/home/TouristHomeScreen.tsx'],
      20
    ),
    this.createTask(
      'fix-background-colors',
      '배경색 일관성 수정',
      'bg-white를 bg-space-950으로, text-gray-*를 text-white/gray로 변환',
      'high',
      ['src/components/home/*.tsx'],
      15
    ),
    this.createTask(
      'update-design-tokens',
      '디자인 토큰 적용',
      'ZZIK Design System 2.0 토큰으로 일관성 있게 변환',
      'medium',
      ['src/components/**/*.tsx'],
      20
    )
  ];

  // ZZIK Design System 2.0 색상 토큰
  private readonly DESIGN_TOKENS = {
    backgrounds: {
      'bg-white': 'bg-space-950',
      'bg-gray-50': 'bg-space-900',
      'bg-gray-100': 'bg-space-800',
      'bg-gray-200': 'bg-space-700'
    },
    text: {
      'text-gray-900': 'text-white',
      'text-gray-800': 'text-white',
      'text-gray-700': 'text-white/90',
      'text-gray-600': 'text-white/70',
      'text-gray-500': 'text-white/50',
      'text-gray-400': 'text-white/40',
      'text-black': 'text-white'
    },
    borders: {
      'border-gray-100': 'border-white/10',
      'border-gray-200': 'border-white/15',
      'border-gray-300': 'border-white/20'
    },
    hover: {
      'hover:bg-gray-50': 'hover:bg-white/5',
      'hover:bg-gray-100': 'hover:bg-white/10'
    }
  };

  // 라이트 모드 감지 패턴
  private readonly LIGHT_MODE_PATTERNS = [
    /bg-white(?!\s*\/)/g,
    /bg-gray-50/g,
    /bg-gray-100/g,
    /text-gray-[5-9]00/g,
    /text-black/g,
    /border-gray-[1-3]00/g
  ];

  protected async executeTask(task: AgentTask): Promise<TaskResult> {
    switch (task.id) {
      case 'scan-light-mode-issues':
        return this.scanLightModeIssues(task);
      case 'fix-tourist-home-screen':
        return this.fixTouristHomeScreen(task);
      case 'fix-background-colors':
        return this.fixBackgroundColors(task);
      case 'update-design-tokens':
        return this.updateDesignTokens(task);
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
   * 라이트 모드 사용 스캔
   */
  private async scanLightModeIssues(task: AgentTask): Promise<TaskResult> {
    this.log('Scanning for light mode inconsistencies...');
    
    const issues: { file: string; patterns: string[]; count: number }[] = [];
    const files = glob.sync('src/components/**/*.tsx', { cwd: process.cwd() });

    for (const file of files) {
      const fullPath = path.join(process.cwd(), file);
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      const foundPatterns: string[] = [];
      let totalCount = 0;

      for (const pattern of this.LIGHT_MODE_PATTERNS) {
        const matches = content.match(pattern);
        if (matches && matches.length > 0) {
          foundPatterns.push(`${matches[0]} (${matches.length}x)`);
          totalCount += matches.length;
        }
      }

      if (foundPatterns.length > 0) {
        issues.push({ file, patterns: foundPatterns, count: totalCount });
      }
    }

    // 가장 많은 이슈를 가진 파일 순으로 정렬
    issues.sort((a, b) => b.count - a.count);

    this.log(`Found ${issues.length} files with light mode issues`);
    issues.slice(0, 10).forEach(issue => {
      this.log(`  - ${issue.file}: ${issue.count} occurrences`);
    });

    return {
      success: true,
      message: `Scanned ${files.length} files, found ${issues.length} with light mode issues`,
      filesModified: [],
      issuesFound: issues.reduce((sum, i) => sum + i.count, 0),
      issuesFixed: 0,
      details: { issues: issues.slice(0, 20) }
    };
  }

  /**
   * TouristHomeScreen 다크 모드 수정
   */
  private async fixTouristHomeScreen(task: AgentTask): Promise<TaskResult> {
    this.log('Converting TouristHomeScreen to dark mode...');
    
    const filePath = path.join(process.cwd(), 'src/components/home/TouristHomeScreen.tsx');
    
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        message: 'TouristHomeScreen.tsx not found',
        filesModified: [],
        issuesFound: 1,
        issuesFixed: 0
      };
    }

    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    let issuesFixed = 0;

    // 배경색 변환
    for (const [lightClass, darkClass] of Object.entries(this.DESIGN_TOKENS.backgrounds)) {
      const regex = new RegExp(lightClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, darkClass);
        issuesFixed += matches.length;
      }
    }

    // 텍스트 색상 변환
    for (const [lightClass, darkClass] of Object.entries(this.DESIGN_TOKENS.text)) {
      const regex = new RegExp(lightClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, darkClass);
        issuesFixed += matches.length;
      }
    }

    // 테두리 색상 변환
    for (const [lightClass, darkClass] of Object.entries(this.DESIGN_TOKENS.borders)) {
      const regex = new RegExp(lightClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, darkClass);
        issuesFixed += matches.length;
      }
    }

    // hover 상태 변환
    for (const [lightClass, darkClass] of Object.entries(this.DESIGN_TOKENS.hover)) {
      const regex = new RegExp(lightClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, darkClass);
        issuesFixed += matches.length;
      }
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      this.success(`Converted ${issuesFixed} classes to dark mode`);
    }

    return {
      success: true,
      message: `Fixed ${issuesFixed} light mode classes in TouristHomeScreen`,
      filesModified: content !== originalContent ? ['src/components/home/TouristHomeScreen.tsx'] : [],
      issuesFound: issuesFixed,
      issuesFixed
    };
  }

  /**
   * 배경색 일관성 수정
   */
  private async fixBackgroundColors(task: AgentTask): Promise<TaskResult> {
    this.log('Fixing background color consistency...');
    
    const files = glob.sync('src/components/home/*.tsx', { cwd: process.cwd() });
    const filesModified: string[] = [];
    let totalIssuesFixed = 0;

    for (const file of files) {
      const fullPath = path.join(process.cwd(), file);
      let content = fs.readFileSync(fullPath, 'utf-8');
      const originalContent = content;
      let issuesFixed = 0;

      // 배경색 변환
      for (const [lightClass, darkClass] of Object.entries(this.DESIGN_TOKENS.backgrounds)) {
        const regex = new RegExp(lightClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const matches = content.match(regex);
        if (matches) {
          content = content.replace(regex, darkClass);
          issuesFixed += matches.length;
        }
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        filesModified.push(file);
        totalIssuesFixed += issuesFixed;
      }
    }

    return {
      success: true,
      message: `Fixed ${totalIssuesFixed} background colors in ${filesModified.length} files`,
      filesModified,
      issuesFound: totalIssuesFixed,
      issuesFixed: totalIssuesFixed
    };
  }

  /**
   * 디자인 토큰 적용
   */
  private async updateDesignTokens(task: AgentTask): Promise<TaskResult> {
    this.log('Updating design tokens across components...');
    
    // 이 작업은 전체 컴포넌트에 대한 광범위한 변환이므로
    // 분석 결과만 반환하고 수동 검토를 권장
    
    const files = glob.sync('src/components/**/*.tsx', { cwd: process.cwd() });
    let totalIssues = 0;

    for (const file of files) {
      const fullPath = path.join(process.cwd(), file);
      const content = fs.readFileSync(fullPath, 'utf-8');

      for (const pattern of this.LIGHT_MODE_PATTERNS) {
        const matches = content.match(pattern);
        if (matches) {
          totalIssues += matches.length;
        }
      }
    }

    return {
      success: true,
      message: `Found ${totalIssues} design token updates needed - manual review recommended`,
      filesModified: [],
      issuesFound: totalIssues,
      issuesFixed: 0,
      details: {
        recommendation: 'Run individual component fixes or batch update with careful review'
      }
    };
  }
}

// 에이전트 인스턴스 내보내기
export const darkModeConsistencyAgent = new DarkModeConsistencyAgent();
