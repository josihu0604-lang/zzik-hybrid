/**
 * 🌍 i18n Fix Agent
 * ==================
 * 누락된 번역 키를 자동으로 감지하고 추가하는 에이전트
 */

import { BaseAgent } from '../core/base-agent';
import type { AgentTask, TaskResult } from '../core/agent-types';
import * as fs from 'fs';
import * as path from 'path';

export class I18nFixAgent extends BaseAgent {
  id = 'i18n-fix-agent';
  name = 'i18n Fix Agent';
  emoji = '🌍';
  description = '누락된 번역 키를 자동으로 감지하고 추가합니다';
  category = 'console-fix' as const;

  tasks: AgentTask[] = [
    this.createTask(
      'scan-missing-translations',
      '누락된 번역 키 스캔',
      '코드베이스에서 사용되는 모든 번역 키를 스캔하여 누락된 키 찾기',
      'high',
      ['src/i18n/locales/en.json', 'src/i18n/locales/ko.json'],
      10
    ),
    this.createTask(
      'add-onboarding-translations',
      'Onboarding 번역 추가',
      'onboarding.welcome, onboarding.selectLanguage 등 누락된 키 추가',
      'critical',
      ['src/i18n/locales/en.json', 'src/i18n/locales/ko.json'],
      5
    ),
    this.createTask(
      'add-home-translations',
      'Home 화면 번역 추가',
      '홈 화면에서 사용되는 하드코딩된 텍스트의 번역 키 추가',
      'high',
      ['src/i18n/locales/en.json', 'src/i18n/locales/ko.json'],
      10
    )
  ];

  // 추가할 번역 키들
  private readonly MISSING_TRANSLATIONS = {
    en: {
      onboarding: {
        welcome: 'Welcome to ZZIK',
        selectLanguage: 'Select your language',
        selectCountry: 'Select your country',
        letsGo: "Let's Go!",
        skip: 'Skip',
        getStarted: 'Get Started',
        continueButton: 'Continue'
      },
      home: {
        trendingInSeoul: 'Trending in Seoul',
        exploreCategories: 'Explore Categories',
        welcomeBack: 'Welcome back',
        morningGreeting: 'Good morning',
        afternoonGreeting: 'Good afternoon',
        eveningGreeting: 'Good evening',
        notifications: 'Notifications',
        settings: 'Settings',
        categories: {
          food: 'Food',
          cafe: 'Cafe',
          kpop: 'K-POP',
          beauty: 'Beauty',
          shopping: 'Shop',
          nightlife: 'Night',
          culture: 'Culture',
          more: 'More'
        }
      }
    },
    ko: {
      onboarding: {
        welcome: 'ZZIK에 오신 것을 환영합니다',
        selectLanguage: '언어를 선택하세요',
        selectCountry: '국가를 선택하세요',
        letsGo: '시작하기!',
        skip: '건너뛰기',
        getStarted: '시작하기',
        continueButton: '계속하기'
      },
      home: {
        trendingInSeoul: '서울에서 인기',
        exploreCategories: '카테고리 탐색',
        welcomeBack: '다시 오셨군요',
        morningGreeting: '좋은 아침이에요',
        afternoonGreeting: '좋은 오후예요',
        eveningGreeting: '좋은 저녁이에요',
        notifications: '알림',
        settings: '설정',
        categories: {
          food: '맛집',
          cafe: '카페',
          kpop: 'K-POP',
          beauty: '뷰티',
          shopping: '쇼핑',
          nightlife: '나이트라이프',
          culture: '문화',
          more: '더보기'
        }
      }
    }
  };

  protected async executeTask(task: AgentTask): Promise<TaskResult> {
    switch (task.id) {
      case 'scan-missing-translations':
        return this.scanMissingTranslations(task);
      case 'add-onboarding-translations':
        return this.addOnboardingTranslations(task);
      case 'add-home-translations':
        return this.addHomeTranslations(task);
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
   * 누락된 번역 키 스캔
   */
  private async scanMissingTranslations(task: AgentTask): Promise<TaskResult> {
    this.log('Scanning for missing translation keys...');
    
    const missingKeys: string[] = [];
    
    // 알려진 누락 키들
    const knownMissing = [
      'onboarding.welcome',
      'onboarding.selectLanguage',
      'onboarding.selectCountry',
      'home.trendingInSeoul',
      'home.exploreCategories'
    ];

    for (const file of task.targetFiles) {
      const fullPath = path.join(process.cwd(), file);
      
      if (!fs.existsSync(fullPath)) {
        this.warn(`File not found: ${file}`);
        continue;
      }

      const content = fs.readFileSync(fullPath, 'utf-8');
      const translations = JSON.parse(content);

      for (const key of knownMissing) {
        const parts = key.split('.');
        let current = translations;
        let found = true;

        for (const part of parts) {
          if (current && typeof current === 'object' && part in current) {
            current = current[part];
          } else {
            found = false;
            break;
          }
        }

        if (!found) {
          missingKeys.push(`[${file}] ${key}`);
        }
      }
    }

    this.log(`Found ${missingKeys.length} missing translation keys`);
    missingKeys.forEach(key => this.log(`  - ${key}`));

    return {
      success: true,
      message: `Scanned ${task.targetFiles.length} files, found ${missingKeys.length} missing keys`,
      filesModified: [],
      issuesFound: missingKeys.length,
      issuesFixed: 0,
      details: { missingKeys }
    };
  }

  /**
   * Onboarding 번역 추가
   */
  private async addOnboardingTranslations(task: AgentTask): Promise<TaskResult> {
    this.log('Adding missing onboarding translations...');
    
    const filesModified: string[] = [];
    let issuesFixed = 0;

    // 영어 번역 추가
    const enPath = path.join(process.cwd(), 'src/i18n/locales/en.json');
    if (fs.existsSync(enPath)) {
      const enContent = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
      
      if (!enContent.onboarding) {
        enContent.onboarding = {};
      }
      
      // 누락된 키만 추가 (기존 키 덮어쓰지 않음)
      const enOnboarding = this.MISSING_TRANSLATIONS.en.onboarding;
      for (const [key, value] of Object.entries(enOnboarding)) {
        if (!(key in enContent.onboarding)) {
          enContent.onboarding[key] = value;
          issuesFixed++;
        }
      }

      fs.writeFileSync(enPath, JSON.stringify(enContent, null, 2) + '\n', 'utf-8');
      filesModified.push('src/i18n/locales/en.json');
      this.success('Updated en.json with onboarding translations');
    }

    // 한국어 번역 추가
    const koPath = path.join(process.cwd(), 'src/i18n/locales/ko.json');
    if (fs.existsSync(koPath)) {
      const koContent = JSON.parse(fs.readFileSync(koPath, 'utf-8'));
      
      if (!koContent.onboarding) {
        koContent.onboarding = {};
      }
      
      const koOnboarding = this.MISSING_TRANSLATIONS.ko.onboarding;
      for (const [key, value] of Object.entries(koOnboarding)) {
        if (!(key in koContent.onboarding)) {
          koContent.onboarding[key] = value;
          issuesFixed++;
        }
      }

      fs.writeFileSync(koPath, JSON.stringify(koContent, null, 2) + '\n', 'utf-8');
      filesModified.push('src/i18n/locales/ko.json');
      this.success('Updated ko.json with onboarding translations');
    }

    return {
      success: true,
      message: `Added ${issuesFixed} onboarding translation keys`,
      filesModified,
      issuesFound: Object.keys(this.MISSING_TRANSLATIONS.en.onboarding).length * 2,
      issuesFixed
    };
  }

  /**
   * Home 화면 번역 추가
   */
  private async addHomeTranslations(task: AgentTask): Promise<TaskResult> {
    this.log('Adding missing home translations...');
    
    const filesModified: string[] = [];
    let issuesFixed = 0;

    // 영어 번역
    const enPath = path.join(process.cwd(), 'src/i18n/locales/en.json');
    if (fs.existsSync(enPath)) {
      const enContent = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
      
      if (!enContent.home) {
        enContent.home = {};
      }

      const enHome = this.MISSING_TRANSLATIONS.en.home;
      for (const [key, value] of Object.entries(enHome)) {
        if (!(key in enContent.home)) {
          enContent.home[key] = value;
          issuesFixed++;
        }
      }

      fs.writeFileSync(enPath, JSON.stringify(enContent, null, 2) + '\n', 'utf-8');
      filesModified.push('src/i18n/locales/en.json');
    }

    // 한국어 번역
    const koPath = path.join(process.cwd(), 'src/i18n/locales/ko.json');
    if (fs.existsSync(koPath)) {
      const koContent = JSON.parse(fs.readFileSync(koPath, 'utf-8'));
      
      if (!koContent.home) {
        koContent.home = {};
      }

      const koHome = this.MISSING_TRANSLATIONS.ko.home;
      for (const [key, value] of Object.entries(koHome)) {
        if (!(key in koContent.home)) {
          koContent.home[key] = value;
          issuesFixed++;
        }
      }

      fs.writeFileSync(koPath, JSON.stringify(koContent, null, 2) + '\n', 'utf-8');
      filesModified.push('src/i18n/locales/ko.json');
    }

    return {
      success: true,
      message: `Added ${issuesFixed} home translation keys`,
      filesModified,
      issuesFound: Object.keys(this.MISSING_TRANSLATIONS.en.home).length * 2,
      issuesFixed
    };
  }
}

// 에이전트 인스턴스 내보내기
export const i18nFixAgent = new I18nFixAgent();
