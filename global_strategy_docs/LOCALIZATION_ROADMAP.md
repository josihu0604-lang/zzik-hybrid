# ZZIK 다국어 확장 로드맵
## Localization & Internationalization Roadmap

**버전**: 1.0  
**작성일**: 2025-12-07  
**상태**: FINAL  

---

## 1. Executive Summary

### 1.1 현재 상태

- **지원 언어**: 한국어 (ko), 영어 (en)
- **i18n 시스템**: Next.js i18n + JSON 기반
- **번역 키 수**: 약 200개
- **커버리지**: 95% (일부 하드코딩)

### 1.2 목표 상태 (Y1 말)

- **지원 언어**: 6개 (ko, en, ja, zh-TW, zh-CN, th)
- **번역 키 수**: 500개+
- **커버리지**: 100%
- **품질 점수**: 95%+ (네이티브 검수)

---

## 2. 언어 우선순위

### 2.1 Phase 1 (0-3개월)

| 언어 | 코드 | 우선순위 | 근거 |
|------|------|---------|------|
| 🇯🇵 일본어 | ja | ★★★★★ | 최대 한류 시장, 높은 ARPU |
| 🇹🇼 중국어(번체) | zh-TW | ★★★★★ | K-Drama 성지순례 수요 |

### 2.2 Phase 2 (3-6개월)

| 언어 | 코드 | 우선순위 | 근거 |
|------|------|---------|------|
| 🇨🇳 중국어(간체) | zh-CN | ★★★★☆ | 대규모 팬덤, 미래 시장 |
| 🇹🇭 태국어 | th | ★★★★☆ | K-POP 팬덤 강세 |

### 2.3 Phase 3 (6-12개월)

| 언어 | 코드 | 우선순위 | 근거 |
|------|------|---------|------|
| 🇻🇳 베트남어 | vi | ★★★☆☆ | 성장하는 K-Culture 시장 |
| 🇮🇩 인도네시아어 | id | ★★★☆☆ | 거대 인구, K-POP 팬덤 |
| 🇵🇭 타갈로그어 | tl | ★★★☆☆ | 영어권 혼용 가능 |

### 2.4 Phase 4 (12개월+)

| 언어 | 코드 | 우선순위 | 근거 |
|------|------|---------|------|
| 🇪🇸 스페인어 | es | ★★☆☆☆ | 중남미 시장 |
| 🇫🇷 프랑스어 | fr | ★★☆☆☆ | 유럽 K-Culture |
| 🇩🇪 독일어 | de | ★★☆☆☆ | 유럽 시장 |
| 🇵🇹 포르투갈어 | pt-BR | ★★☆☆☆ | 브라질 시장 |

---

## 3. 기술 구현

### 3.1 현재 i18n 구조

```
src/
├── i18n/
│   ├── config.ts          # i18n 설정
│   ├── index.ts            # 내보내기
│   ├── LanguageProvider.tsx # 컨텍스트 프로바이더
│   └── locales/
│       ├── en.json         # 영어
│       └── ko.json         # 한국어
```

### 3.2 확장된 i18n 구조

```
src/
├── i18n/
│   ├── config.ts
│   ├── index.ts
│   ├── LanguageProvider.tsx
│   ├── utils/
│   │   ├── formatters.ts   # 지역별 포맷터
│   │   ├── pluralization.ts # 복수형 처리
│   │   └── rtl.ts          # RTL 지원 (미래)
│   └── locales/
│       ├── en.json
│       ├── ko.json
│       ├── ja.json         # 신규
│       ├── zh-TW.json      # 신규
│       ├── zh-CN.json      # 신규
│       ├── th.json         # 신규
│       └── namespaces/     # 네임스페이스 분리
│           ├── common/
│           ├── auth/
│           ├── popup/
│           └── kexperience/ # 신규 K-Experience
```

### 3.3 config.ts 업데이트

```typescript
// src/i18n/config.ts

export const SUPPORTED_LOCALES = [
  'ko',      // 한국어 (기본)
  'en',      // 영어
  'ja',      // 일본어
  'zh-TW',   // 중국어 번체
  'zh-CN',   // 중국어 간체
  'th',      // 태국어
] as const;

export type Locale = typeof SUPPORTED_LOCALES[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  'zh-TW': '繁體中文',
  'zh-CN': '简体中文',
  th: 'ภาษาไทย',
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  ko: '🇰🇷',
  en: '🇺🇸',
  ja: '🇯🇵',
  'zh-TW': '🇹🇼',
  'zh-CN': '🇨🇳',
  th: '🇹🇭',
};

export const DEFAULT_LOCALE: Locale = 'ko';

// 지역별 날짜/숫자 포맷
export const LOCALE_FORMATS: Record<Locale, LocaleFormat> = {
  ko: {
    dateFormat: 'YYYY년 MM월 DD일',
    timeFormat: 'HH:mm',
    currency: 'KRW',
    currencySymbol: '₩',
    numberFormat: { thousand: ',', decimal: '.' },
  },
  en: {
    dateFormat: 'MMM DD, YYYY',
    timeFormat: 'h:mm A',
    currency: 'USD',
    currencySymbol: '$',
    numberFormat: { thousand: ',', decimal: '.' },
  },
  ja: {
    dateFormat: 'YYYY年MM月DD日',
    timeFormat: 'HH:mm',
    currency: 'JPY',
    currencySymbol: '¥',
    numberFormat: { thousand: ',', decimal: '.' },
  },
  'zh-TW': {
    dateFormat: 'YYYY年MM月DD日',
    timeFormat: 'HH:mm',
    currency: 'TWD',
    currencySymbol: 'NT$',
    numberFormat: { thousand: ',', decimal: '.' },
  },
  'zh-CN': {
    dateFormat: 'YYYY年MM月DD日',
    timeFormat: 'HH:mm',
    currency: 'CNY',
    currencySymbol: '¥',
    numberFormat: { thousand: ',', decimal: '.' },
  },
  th: {
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    currency: 'THB',
    currencySymbol: '฿',
    numberFormat: { thousand: ',', decimal: '.' },
  },
};
```

### 3.4 자동 감지 시스템

```typescript
// src/lib/geo-detection.ts

export async function detectUserLocale(): Promise<Locale> {
  // 1. 저장된 설정 확인
  const stored = localStorage.getItem('zzik_locale');
  if (stored && isValidLocale(stored)) return stored;

  // 2. 브라우저 언어 확인
  const browserLang = navigator.language.split('-')[0];
  if (isValidLocale(browserLang)) return browserLang;

  // 3. IP 기반 지역 감지
  try {
    const geo = await fetch('/api/geo-detect');
    const { country } = await geo.json();
    return countryToLocale(country);
  } catch {
    return DEFAULT_LOCALE;
  }
}

const COUNTRY_LOCALE_MAP: Record<string, Locale> = {
  KR: 'ko',
  JP: 'ja',
  TW: 'zh-TW',
  CN: 'zh-CN',
  HK: 'zh-TW',
  TH: 'th',
  US: 'en',
  GB: 'en',
  AU: 'en',
  // ... 기타 국가
};
```

---

## 4. 번역 키 구조

### 4.1 네임스페이스 분류

| 네임스페이스 | 키 수 (예상) | 우선순위 |
|-------------|-------------|---------|
| common | 50 | ★★★★★ |
| auth | 30 | ★★★★★ |
| popup | 40 | ★★★★★ |
| kexperience | 60 | ★★★★☆ |
| leader | 25 | ★★★★☆ |
| profile | 35 | ★★★☆☆ |
| settings | 20 | ★★★☆☆ |
| notifications | 25 | ★★★☆☆ |
| errors | 40 | ★★★★★ |
| onboarding | 30 | ★★★★☆ |

### 4.2 신규 K-Experience 키 (ja.json 예시)

```json
{
  "kexperience": {
    "title": "K-エクスペリエンス",
    "subtitle": "本物のK体験を発見しよう",
    "categories": {
      "kpop": "K-POP",
      "kdrama": "K-ドラマ",
      "kbeauty": "K-ビューティー",
      "kfood": "K-フード",
      "kfashion": "K-ファッション"
    },
    "events": {
      "concert": "コンサート",
      "fanmeeting": "ファンミーティング",
      "popup": "ポップアップストア",
      "exhibition": "展示会",
      "filming_location": "撮影地"
    },
    "actions": {
      "verify": "検証する",
      "checkin": "チェックイン",
      "share": "シェア",
      "save": "保存"
    },
    "verified_badge": "ZZIK検証済み",
    "authentic": "本物保証",
    "pilgrimage": {
      "title": "聖地巡礼",
      "description": "あなたの好きなK-ドラマの撮影地を探索",
      "distance": "{{distance}}離れています",
      "visited_count": "{{count}}人が訪問"
    }
  }
}
```

### 4.3 zh-TW.json 예시

```json
{
  "kexperience": {
    "title": "K-體驗",
    "subtitle": "探索真正的K體驗",
    "categories": {
      "kpop": "K-POP",
      "kdrama": "韓劇",
      "kbeauty": "K-美妝",
      "kfood": "韓食",
      "kfashion": "K-時尚"
    },
    "events": {
      "concert": "演唱會",
      "fanmeeting": "粉絲見面會",
      "popup": "快閃店",
      "exhibition": "展覽",
      "filming_location": "拍攝地"
    },
    "actions": {
      "verify": "驗證",
      "checkin": "打卡",
      "share": "分享",
      "save": "收藏"
    },
    "verified_badge": "ZZIK認證",
    "authentic": "正品保證",
    "pilgrimage": {
      "title": "朝聖之旅",
      "description": "探索您喜愛的韓劇拍攝地",
      "distance": "距離{{distance}}",
      "visited_count": "{{count}}人已造訪"
    }
  }
}
```

---

## 5. 폰트 시스템

### 5.1 언어별 폰트 스택

| 언어 | Primary | Fallback | CDN |
|------|---------|----------|-----|
| 한국어 | Noto Sans KR | Apple SD Gothic Neo | Google Fonts |
| 영어 | Inter | -apple-system | Google Fonts |
| 일본어 | Noto Sans JP | Hiragino Sans | Google Fonts |
| 중국어(번체) | Noto Sans TC | PingFang TC | Google Fonts |
| 중국어(간체) | Noto Sans SC | PingFang SC | Google Fonts |
| 태국어 | Noto Sans Thai | Thonburi | Google Fonts |

### 5.2 Tailwind 폰트 설정

```javascript
// tailwind.config.ts

fontFamily: {
  sans: [
    'var(--font-primary)',
    'Inter Variable',
    'Noto Sans KR',
    'Noto Sans JP',
    'Noto Sans TC',
    'Noto Sans SC',
    'Noto Sans Thai',
    '-apple-system',
    'BlinkMacSystemFont',
    'sans-serif',
  ],
  display: [
    'var(--font-display)',
    'Inter Variable',
    'sans-serif',
  ],
}
```

### 5.3 동적 폰트 로딩

```typescript
// src/lib/fonts.ts

export function loadFontsForLocale(locale: Locale) {
  const fontMap: Record<Locale, string[]> = {
    ko: ['Noto+Sans+KR:wght@400;500;700'],
    en: ['Inter:wght@400;500;600;700'],
    ja: ['Noto+Sans+JP:wght@400;500;700'],
    'zh-TW': ['Noto+Sans+TC:wght@400;500;700'],
    'zh-CN': ['Noto+Sans+SC:wght@400;500;700'],
    th: ['Noto+Sans+Thai:wght@400;500;700'],
  };

  const fonts = fontMap[locale];
  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${fonts.join('&family=')}&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}
```

---

## 6. 지역화 작업 프로세스

### 6.1 번역 워크플로우

```
1. 키 추출
   └── i18n-scanner로 코드에서 키 추출

2. 기준 번역 (한국어)
   └── 개발팀에서 한국어 키/값 작성

3. 1차 번역 (기계)
   └── DeepL/Google Translate로 초안

4. 2차 번역 (전문가)
   └── 네이티브 번역가 검수

5. 3차 검수 (QA)
   └── 컨텍스트 확인, UI 피팅

6. 배포
   └── 버전 관리 및 배포
```

### 6.2 번역 품질 기준

| 항목 | 기준 | 검증 방법 |
|------|------|----------|
| 정확성 | 의미 정확 전달 | 네이티브 검수 |
| 자연스러움 | 현지인이 자연스럽게 느낌 | 사용자 피드백 |
| 일관성 | 용어 통일 | 용어집 활용 |
| 길이 | UI에 맞는 길이 | 시각적 QA |
| 문화적 적합성 | 문화적 금기 회피 | 현지 전문가 |

### 6.3 용어집 (Glossary)

| 한국어 | 영어 | 일본어 | 중국어(번체) |
|--------|------|--------|-------------|
| 찍다 | ZZIK | ジック | ZZIK |
| 검증 | Verification | 検証 | 驗證 |
| 체크인 | Check-in | チェックイン | 打卡 |
| 팝업 | Popup | ポップアップ | 快閃店 |
| 성지순례 | Pilgrimage | 聖地巡礼 | 朝聖 |
| K-체험 | K-Experience | K体験 | K體驗 |
| 리더 | Leader | リーダー | 達人 |
| 배지 | Badge | バッジ | 徽章 |

---

## 7. 타임라인

### 7.1 Phase 1: 일본어/중국어(번체) (Week 1-6)

| 주차 | 작업 | 담당 | 산출물 |
|------|------|------|--------|
| W1 | 키 추출 및 정리 | 개발팀 | 키 목록 |
| W2 | 일본어 1차 번역 | AI + 번역팀 | ja.json (초안) |
| W3 | 일본어 검수 | 일본인 검수자 | ja.json (검수) |
| W4 | 중국어 번체 번역 | AI + 번역팀 | zh-TW.json |
| W5 | UI 피팅 QA | QA팀 | 버그 리포트 |
| W6 | 배포 | 개발팀 | 프로덕션 |

### 7.2 Phase 2: 중국어(간체)/태국어 (Week 7-12)

| 주차 | 작업 | 담당 | 산출물 |
|------|------|------|--------|
| W7-8 | 중국어 간체 번역 | 번역팀 | zh-CN.json |
| W9-10 | 태국어 번역 | 번역팀 | th.json |
| W11 | 전체 QA | QA팀 | 버그 리포트 |
| W12 | 배포 | 개발팀 | 프로덕션 |

### 7.3 예상 비용

| 항목 | Phase 1 | Phase 2 | 합계 |
|------|---------|---------|------|
| 번역 (전문가) | ₩3,000,000 | ₩3,000,000 | ₩6,000,000 |
| 검수 (네이티브) | ₩1,500,000 | ₩1,500,000 | ₩3,000,000 |
| 도구/플랫폼 | ₩500,000 | ₩500,000 | ₩1,000,000 |
| **합계** | **₩5,000,000** | **₩5,000,000** | **₩10,000,000** |

---

## 8. 품질 관리

### 8.1 자동화 검증

```typescript
// scripts/i18n-check.ts

// 1. 키 누락 검사
function checkMissingKeys(base: string, target: string): string[] {
  const baseKeys = Object.keys(flatten(require(base)));
  const targetKeys = Object.keys(flatten(require(target)));
  return baseKeys.filter(k => !targetKeys.includes(k));
}

// 2. 미번역 검사 (동일값)
function checkUntranslated(base: string, target: string): string[] {
  const baseObj = flatten(require(base));
  const targetObj = flatten(require(target));
  return Object.keys(baseObj).filter(k => baseObj[k] === targetObj[k]);
}

// 3. 플레이스홀더 검사
function checkPlaceholders(base: string, target: string): string[] {
  const errors: string[] = [];
  // {{variable}} 패턴 검사
  // ...
  return errors;
}
```

### 8.2 CI/CD 파이프라인

```yaml
# .github/workflows/i18n-check.yml

name: i18n Quality Check
on:
  pull_request:
    paths:
      - 'src/i18n/**'

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check missing keys
        run: npm run i18n:check
      - name: Check untranslated
        run: npm run i18n:untranslated
      - name: Validate JSON
        run: npm run i18n:validate
```

### 8.3 사용자 피드백 시스템

- **인앱 피드백**: 번역 오류 신고 버튼
- **커뮤니티**: 언어별 Discord 채널
- **정기 리뷰**: 분기별 번역 품질 감사

---

## 9. 성공 지표

### 9.1 KPI

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| 번역 커버리지 | 100% | 자동 스캔 |
| 네이티브 만족도 | 90%+ | 설문조사 |
| 번역 오류 신고 | < 10건/월 | 피드백 시스템 |
| 언어별 전환율 | 기준 대비 +5% | Analytics |

### 9.2 A/B 테스트 계획

- **테스트 1**: 일본어 온보딩 문구 최적화
- **테스트 2**: 대만 CTA 버튼 문구
- **테스트 3**: 언어 선택 UI 위치

---

## 10. 결론

### 10.1 핵심 요약

1. **Phase 1 우선**: 일본어 + 중국어 번체 (6주)
2. **품질 우선**: 기계번역 → 전문가 검수 → 네이티브 QA
3. **자동화**: CI/CD로 품질 검증 자동화
4. **피드백 루프**: 지속적 개선 체계

### 10.2 다음 단계

1. ✅ i18n 구조 확장 설계
2. 🔄 일본어 번역 착수 (W1)
3. ⏳ 번역 파트너 계약
4. ⏳ QA 프로세스 구축

---

**문서 종료**

*© 2025 ZZIK Inc. All Rights Reserved.*
