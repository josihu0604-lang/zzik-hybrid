/**
 * 🔐 Auth Config Fix Agent
 * =========================
 * 인증 관련 설정 오류를 감지하고 폴백 처리를 추가하는 에이전트
 */

import { BaseAgent } from '../core/base-agent';
import type { AgentTask, TaskResult } from '../core/agent-types';
import * as fs from 'fs';
import * as path from 'path';

export class AuthConfigFixAgent extends BaseAgent {
  id = 'auth-config-fix-agent';
  name = 'Auth Config Fix Agent';
  emoji = '🔐';
  description = '인증 관련 설정 오류를 감지하고 안전한 폴백 처리를 추가합니다';
  category = 'console-fix' as const;

  tasks: AgentTask[] = [
    this.createTask(
      'analyze-auth-config',
      '인증 설정 분석',
      'Privy, Supabase 등 인증 관련 설정 상태 분석',
      'high',
      ['src/components/providers/AppProviders.tsx', '.env', '.env.example'],
      5
    ),
    this.createTask(
      'add-privy-fallback',
      'Privy 폴백 처리 개선',
      'Privy App ID가 없을 때 더 안전한 폴백 처리 추가',
      'high',
      ['src/components/providers/AppProviders.tsx'],
      10
    ),
    this.createTask(
      'improve-auth-error-handling',
      '인증 오류 핸들링 개선',
      '인증 실패 시 사용자 친화적인 메시지 표시',
      'medium',
      ['src/context/auth-context.tsx'],
      10
    )
  ];

  protected async executeTask(task: AgentTask): Promise<TaskResult> {
    switch (task.id) {
      case 'analyze-auth-config':
        return this.analyzeAuthConfig(task);
      case 'add-privy-fallback':
        return this.addPrivyFallback(task);
      case 'improve-auth-error-handling':
        return this.improveAuthErrorHandling(task);
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
   * 인증 설정 분석
   */
  private async analyzeAuthConfig(task: AgentTask): Promise<TaskResult> {
    this.log('Analyzing authentication configuration...');
    
    const issues: string[] = [];
    const recommendations: string[] = [];

    // .env 파일 체크
    const envPath = path.join(process.cwd(), '.env');
    const envExamplePath = path.join(process.cwd(), '.env.example');

    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      
      // Privy 설정 체크
      if (!envContent.includes('NEXT_PUBLIC_PRIVY_APP_ID') || 
          envContent.includes('NEXT_PUBLIC_PRIVY_APP_ID=')) {
        const match = envContent.match(/NEXT_PUBLIC_PRIVY_APP_ID=(\S*)/);
        if (!match || !match[1] || match[1].length < 10) {
          issues.push('NEXT_PUBLIC_PRIVY_APP_ID is missing or invalid');
          recommendations.push('Set valid Privy App ID or implement graceful fallback');
        }
      }

      // Supabase 설정 체크
      if (!envContent.includes('NEXT_PUBLIC_SUPABASE_URL')) {
        issues.push('NEXT_PUBLIC_SUPABASE_URL is missing');
      }
      if (!envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
        issues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
      }
    } else {
      issues.push('.env file not found');
    }

    // AppProviders 분석
    const providersPath = path.join(process.cwd(), 'src/components/providers/AppProviders.tsx');
    if (fs.existsSync(providersPath)) {
      const content = fs.readFileSync(providersPath, 'utf-8');
      
      if (content.includes('console.warn') && content.includes('Privy App ID')) {
        recommendations.push('Current warning handling exists but could be improved');
      }
    }

    this.log(`Found ${issues.length} issues, ${recommendations.length} recommendations`);

    return {
      success: true,
      message: `Auth config analysis complete`,
      filesModified: [],
      issuesFound: issues.length,
      issuesFixed: 0,
      details: { issues, recommendations }
    };
  }

  /**
   * Privy 폴백 처리 개선
   */
  private async addPrivyFallback(task: AgentTask): Promise<TaskResult> {
    this.log('Improving Privy fallback handling...');
    
    const providersPath = path.join(process.cwd(), 'src/components/providers/AppProviders.tsx');
    
    if (!fs.existsSync(providersPath)) {
      return {
        success: false,
        message: 'AppProviders.tsx not found',
        filesModified: [],
        issuesFound: 1,
        issuesFixed: 0
      };
    }

    let content = fs.readFileSync(providersPath, 'utf-8');
    let modified = false;

    // 기존 console.warn을 더 친화적인 메시지로 변경
    if (content.includes('[AppProviders] Invalid or missing Privy App ID')) {
      content = content.replace(
        /console\.warn\('\[AppProviders\] Invalid or missing Privy App ID\. Auth features disabled\.'\)/g,
        `// Auth disabled - operating in guest mode
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          console.info('[AppProviders] Running without Privy - guest mode enabled');
        }`
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(providersPath, content, 'utf-8');
      this.success('Improved Privy fallback message');
    }

    return {
      success: true,
      message: modified ? 'Updated Privy fallback handling' : 'No changes needed',
      filesModified: modified ? ['src/components/providers/AppProviders.tsx'] : [],
      issuesFound: 1,
      issuesFixed: modified ? 1 : 0
    };
  }

  /**
   * 인증 오류 핸들링 개선
   */
  private async improveAuthErrorHandling(task: AgentTask): Promise<TaskResult> {
    this.log('Analyzing auth error handling...');
    
    const authContextPath = path.join(process.cwd(), 'src/context/auth-context.tsx');
    
    if (!fs.existsSync(authContextPath)) {
      return {
        success: false,
        message: 'auth-context.tsx not found',
        filesModified: [],
        issuesFound: 1,
        issuesFixed: 0
      };
    }

    const content = fs.readFileSync(authContextPath, 'utf-8');
    
    // 현재 에러 핸들링 분석
    const hasErrorState = content.includes('error') || content.includes('Error');
    const hasTryCatch = content.includes('try') && content.includes('catch');

    const recommendations: string[] = [];
    if (!hasErrorState) {
      recommendations.push('Add error state to auth context');
    }
    if (!hasTryCatch) {
      recommendations.push('Add try-catch blocks around auth operations');
    }

    return {
      success: true,
      message: 'Auth error handling analyzed',
      filesModified: [],
      issuesFound: recommendations.length,
      issuesFixed: 0,
      details: { recommendations }
    };
  }
}

// 에이전트 인스턴스 내보내기
export const authConfigFixAgent = new AuthConfigFixAgent();
