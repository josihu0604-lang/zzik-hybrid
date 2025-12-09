/**
 * ♿ Accessibility Agent
 * =======================
 * 웹 접근성(a11y) 이슈를 자동으로 감지하고 수정하는 에이전트
 */

import { BaseAgent } from '../core/base-agent';
import type { AgentTask, TaskResult } from '../core/agent-types';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

export class AccessibilityAgent extends BaseAgent {
  id = 'accessibility-agent';
  name = 'Accessibility Agent';
  emoji = '♿';
  description = '웹 접근성(WCAG 2.1) 이슈를 자동으로 감지하고 수정합니다';
  category = 'uxui-improvement' as const;

  tasks: AgentTask[] = [
    this.createTask(
      'scan-missing-alt',
      '이미지 alt 속성 스캔',
      '이미지에 alt 속성이 누락된 경우 찾기',
      'high',
      ['src/components/**/*.tsx', 'src/app/**/*.tsx'],
      10
    ),
    this.createTask(
      'scan-aria-labels',
      'ARIA 레이블 스캔',
      '인터랙티브 요소에 ARIA 레이블이 누락된 경우 찾기',
      'high',
      ['src/components/**/*.tsx'],
      15
    ),
    this.createTask(
      'fix-color-contrast',
      '색상 대비 문제 감지',
      'WCAG AA 기준 미달 색상 조합 찾기',
      'medium',
      ['src/components/**/*.tsx'],
      20
    ),
    this.createTask(
      'add-focus-states',
      '포커스 상태 개선',
      '키보드 접근성을 위한 포커스 스타일 추가',
      'medium',
      ['src/components/catalyst/*.tsx', 'src/components/ui/*.tsx'],
      15
    ),
    this.createTask(
      'fix-semantic-html',
      '시맨틱 HTML 개선',
      'div 대신 적절한 시맨틱 요소 사용 권장',
      'low',
      ['src/components/**/*.tsx'],
      20
    )
  ];

  // 접근성 이슈 패턴
  private readonly A11Y_PATTERNS = {
    // alt 속성이 없는 img 태그
    missingAlt: /<img(?![^>]*alt=)[^>]*>/gi,
    // 빈 alt 속성 (장식용이 아닌 경우)
    emptyAlt: /<img[^>]*alt=""[^>]*>/gi,
    // aria-label 없는 버튼 (아이콘만 있는 경우)
    iconOnlyButton: /<button[^>]*>[\s]*<[^>]*Icon[^>]*\/?>[\s]*<\/button>/gi,
    // role이 필요한 div
    clickableDiv: /<div[^>]*onClick[^>]*>/gi,
    // tabIndex가 음수인 경우
    negativeTabIndex: /tabIndex="-1"/gi
  };

  // 위험한 색상 조합 (낮은 대비)
  private readonly LOW_CONTRAST_COMBINATIONS = [
    { bg: 'bg-gray-100', text: 'text-gray-400' },
    { bg: 'bg-white', text: 'text-gray-300' },
    { bg: 'bg-space-950', text: 'text-white/30' },
    { bg: 'bg-space-900', text: 'text-white/40' }
  ];

  protected async executeTask(task: AgentTask): Promise<TaskResult> {
    switch (task.id) {
      case 'scan-missing-alt':
        return this.scanMissingAlt(task);
      case 'scan-aria-labels':
        return this.scanAriaLabels(task);
      case 'fix-color-contrast':
        return this.fixColorContrast(task);
      case 'add-focus-states':
        return this.addFocusStates(task);
      case 'fix-semantic-html':
        return this.fixSemanticHtml(task);
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
   * 이미지 alt 속성 스캔
   */
  private async scanMissingAlt(task: AgentTask): Promise<TaskResult> {
    this.log('Scanning for missing alt attributes...');
    
    const issues: { file: string; line: number; snippet: string }[] = [];
    const componentFiles = glob.sync('src/components/**/*.tsx', { cwd: process.cwd() });
    const appFiles = glob.sync('src/app/**/*.tsx', { cwd: process.cwd() });
    const files = [...componentFiles, ...appFiles];

    for (const file of files) {
      const fullPath = path.join(process.cwd(), file);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // <img 태그 검사
        if (line.includes('<img') && !line.includes('alt=')) {
          issues.push({
            file,
            line: index + 1,
            snippet: line.trim().substring(0, 100)
          });
        }
        
        // Next.js Image 컴포넌트 검사
        if ((line.includes('<Image') || line.includes('<next/image')) && !line.includes('alt=')) {
          issues.push({
            file,
            line: index + 1,
            snippet: line.trim().substring(0, 100)
          });
        }
      });
    }

    this.log(`Found ${issues.length} images without alt attributes`);
    issues.slice(0, 10).forEach(issue => {
      this.log(`  - ${issue.file}:${issue.line}`);
    });

    return {
      success: true,
      message: `Scanned ${files.length} files, found ${issues.length} missing alt attributes`,
      filesModified: [],
      issuesFound: issues.length,
      issuesFixed: 0,
      details: { issues: issues.slice(0, 50) }
    };
  }

  /**
   * ARIA 레이블 스캔
   */
  private async scanAriaLabels(task: AgentTask): Promise<TaskResult> {
    this.log('Scanning for missing ARIA labels...');
    
    const issues: { file: string; type: string; count: number }[] = [];
    const files = glob.sync('src/components/**/*.tsx', { cwd: process.cwd() });

    for (const file of files) {
      const fullPath = path.join(process.cwd(), file);
      const content = fs.readFileSync(fullPath, 'utf-8');

      // 아이콘만 있는 버튼 검사
      const iconButtons = content.match(/<button[^>]*>[\s\n]*<[^>]*(?:Icon|Lucide)[^>]*\/?>/gi);
      if (iconButtons) {
        const withoutLabel = iconButtons.filter(btn => 
          !btn.includes('aria-label') && !btn.includes('aria-labelledby')
        );
        if (withoutLabel.length > 0) {
          issues.push({ file, type: 'icon-button-without-label', count: withoutLabel.length });
        }
      }

      // 클릭 가능한 div 검사
      const clickableDivs = content.match(/<div[^>]*onClick[^>]*>/gi);
      if (clickableDivs) {
        const withoutRole = clickableDivs.filter(div => 
          !div.includes('role=') && !div.includes('tabIndex')
        );
        if (withoutRole.length > 0) {
          issues.push({ file, type: 'clickable-div-without-role', count: withoutRole.length });
        }
      }

      // 링크가 아닌 클릭 요소 검사
      const clickableSpans = content.match(/<span[^>]*onClick[^>]*>/gi);
      if (clickableSpans) {
        issues.push({ file, type: 'clickable-span', count: clickableSpans.length });
      }
    }

    const totalIssues = issues.reduce((sum, i) => sum + i.count, 0);
    this.log(`Found ${totalIssues} ARIA label issues in ${issues.length} files`);

    return {
      success: true,
      message: `Scanned ${files.length} files, found ${totalIssues} ARIA issues`,
      filesModified: [],
      issuesFound: totalIssues,
      issuesFixed: 0,
      details: { issues }
    };
  }

  /**
   * 색상 대비 문제 감지
   */
  private async fixColorContrast(task: AgentTask): Promise<TaskResult> {
    this.log('Scanning for color contrast issues...');
    
    const issues: { file: string; combination: string; occurrences: number }[] = [];
    const files = glob.sync('src/components/**/*.tsx', { cwd: process.cwd() });

    for (const file of files) {
      const fullPath = path.join(process.cwd(), file);
      const content = fs.readFileSync(fullPath, 'utf-8');

      for (const combo of this.LOW_CONTRAST_COMBINATIONS) {
        // 같은 요소에 배경과 텍스트 색상이 함께 있는 경우 검사
        const pattern = new RegExp(`${combo.bg}[^"]*${combo.text}|${combo.text}[^"]*${combo.bg}`, 'gi');
        const matches = content.match(pattern);
        if (matches) {
          issues.push({
            file,
            combination: `${combo.bg} + ${combo.text}`,
            occurrences: matches.length
          });
        }
      }
    }

    const totalIssues = issues.reduce((sum, i) => sum + i.occurrences, 0);
    this.log(`Found ${totalIssues} potential color contrast issues`);

    return {
      success: true,
      message: `Found ${totalIssues} potential contrast issues - manual review recommended`,
      filesModified: [],
      issuesFound: totalIssues,
      issuesFixed: 0,
      details: { issues }
    };
  }

  /**
   * 포커스 상태 개선
   */
  private async addFocusStates(task: AgentTask): Promise<TaskResult> {
    this.log('Analyzing focus state coverage...');
    
    const catalystFiles = glob.sync('src/components/catalyst/*.tsx', { cwd: process.cwd() });
    const uiFiles = glob.sync('src/components/ui/*.tsx', { cwd: process.cwd() });
    const files = [...catalystFiles, ...uiFiles];
    
    const issues: { file: string; type: string }[] = [];

    for (const file of files) {
      const fullPath = path.join(process.cwd(), file);
      const content = fs.readFileSync(fullPath, 'utf-8');

      // 포커스 스타일이 없는 인터랙티브 요소 검사
      const hasInteractive = content.includes('<button') || 
                            content.includes('<a ') || 
                            content.includes('<input') ||
                            content.includes('onClick');
      
      const hasFocusStyle = content.includes('focus:') || 
                           content.includes('focus-visible:') ||
                           content.includes(':focus');

      if (hasInteractive && !hasFocusStyle) {
        issues.push({ file, type: 'missing-focus-style' });
      }

      // outline-none 사용 검사
      if (content.includes('outline-none') && !content.includes('focus:ring')) {
        issues.push({ file, type: 'outline-none-without-alternative' });
      }
    }

    this.log(`Found ${issues.length} files with focus state issues`);

    return {
      success: true,
      message: `Found ${issues.length} focus state issues`,
      filesModified: [],
      issuesFound: issues.length,
      issuesFixed: 0,
      details: { issues }
    };
  }

  /**
   * 시맨틱 HTML 개선
   */
  private async fixSemanticHtml(task: AgentTask): Promise<TaskResult> {
    this.log('Analyzing semantic HTML usage...');
    
    const files = glob.sync('src/components/**/*.tsx', { cwd: process.cwd() });
    const issues: { file: string; suggestion: string; count: number }[] = [];

    for (const file of files) {
      const fullPath = path.join(process.cwd(), file);
      const content = fs.readFileSync(fullPath, 'utf-8');

      // nav 대신 div 사용
      if (content.includes('navigation') || content.includes('navbar') || content.includes('menu')) {
        if (!content.includes('<nav') && content.includes('<div')) {
          issues.push({ file, suggestion: 'Consider using <nav> for navigation', count: 1 });
        }
      }

      // header 대신 div 사용
      if (content.includes('header') && !content.includes('<header') && content.includes('className="header')) {
        issues.push({ file, suggestion: 'Consider using <header> element', count: 1 });
      }

      // section 대신 div 사용
      const sections = content.match(/className="[^"]*section[^"]*"/gi);
      if (sections && !content.includes('<section')) {
        issues.push({ file, suggestion: 'Consider using <section> for content sections', count: sections.length });
      }

      // 리스트 대신 div 사용
      const listPatterns = content.match(/\.map\([^)]+\)\s*=>\s*\(\s*<div/gi);
      if (listPatterns) {
        issues.push({ file, suggestion: 'Consider using <ul>/<li> for lists', count: listPatterns.length });
      }
    }

    const totalIssues = issues.reduce((sum, i) => sum + i.count, 0);
    this.log(`Found ${totalIssues} semantic HTML suggestions`);

    return {
      success: true,
      message: `Found ${totalIssues} semantic HTML improvement opportunities`,
      filesModified: [],
      issuesFound: totalIssues,
      issuesFixed: 0,
      details: { issues }
    };
  }
}

// 에이전트 인스턴스 내보내기
export const accessibilityAgent = new AccessibilityAgent();
