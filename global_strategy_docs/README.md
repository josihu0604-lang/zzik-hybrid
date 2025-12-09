# ZZIK 글로벌 피벗 전략 자료집
## ZZIK Global Pivot Strategy Documentation

**버전**: 1.0 FINAL  
**작성일**: 2025-12-07  
**작성자**: ZZIK Strategy Team  

---

## 📦 문서 구성

이 자료집은 ZZIK의 글로벌 피벗 전략을 위한 5개의 핵심 문서로 구성되어 있습니다.

| # | 문서명 | 내용 | 페이지 |
|---|--------|------|--------|
| 1 | **GLOBAL_PIVOT_STRATEGY.md** | 글로벌 피벗 마스터 전략 | ~25p |
| 2 | **GLOBAL_PRICING.md** | 글로벌 가격 정책 (B2C/B2B) | ~20p |
| 3 | **LOCALIZATION_ROADMAP.md** | 다국어 확장 로드맵 | ~20p |
| 4 | **K_EXPERIENCE_MARKETING.md** | K-Experience 마케팅 전략 | ~25p |
| 5 | **TECHNICAL_IMPLEMENTATION.md** | 기술 구현 로드맵 | ~30p |

---

## 🎯 핵심 요약

### Executive Summary

**ZZIK**는 한국 로컬 검증 플랫폼에서 **Global K-Experience Platform**으로 피벗합니다.

```
AS-IS: 한국 맛집/팝업 검증 플랫폼
TO-BE: 글로벌 K-POP/K-Drama/K-Beauty/K-Food 체험 검증 플랫폼
```

### 핵심 수치

| 지표 | Y1 | Y3 | Y5 |
|------|-----|-----|-----|
| 글로벌 MAU | 50,000 | 1,000,000 | 5,000,000 |
| 글로벌 매출 | 5억원 | 150억원 | 800억원 |
| 지원 언어 | 4개 | 8개 | 12개 |
| 진출 시장 | 4개국 | 10개국 | 20개국 |

### 타겟 시장 우선순위

1. 🇯🇵 **일본** (Phase 1) - K-POP 최대 시장
2. 🇹🇼 **대만** (Phase 1) - K-Drama 성지순례
3. 🇹🇭 **태국** (Phase 2) - K-POP 팬덤
4. 🇺🇸 **미국** (Phase 2) - K-Beauty/K-Food

---

## 📄 문서별 상세

### 1. GLOBAL_PIVOT_STRATEGY.md

**글로벌 피벗 전략 마스터 문서**

- 현황 분석 (As-Is / To-Be)
- 시장 기회 분석
- 타겟 시장 우선순위
- 수익 모델 전환
- 마일스톤 및 KPI
- 투자 계획

### 2. GLOBAL_PRICING.md

**글로벌 가격 정책**

- 가격 정책 철학
- B2C VIP 티켓 가격표 (6개 지역)
- B2B 브랜드 파트너십 플랜
- 결제 시스템 설계
- 프로모션 전략
- 수익 시뮬레이션

### 3. LOCALIZATION_ROADMAP.md

**다국어 확장 로드맵**

- 언어 우선순위
- 기술 구현 (i18n 구조)
- 번역 키 구조
- 폰트 시스템
- 품질 관리 프로세스
- 타임라인

### 4. K_EXPERIENCE_MARKETING.md

**K-Experience 마케팅 전략**

- 타겟 오디언스 세그먼트
- 브랜드 메시지
- 채널 전략 (TikTok, Instagram, YouTube)
- 인플루언서 마케팅
- 카테고리별 마케팅 (K-POP, K-Drama, K-Beauty, K-Food)
- 파트너십 전략
- 예산 계획

### 5. TECHNICAL_IMPLEMENTATION.md

**기술 구현 로드맵**

- 현재 기술 스택
- 글로벌 가격 시스템 (`global-pricing.ts`)
- VIP 티켓 모듈 (`vip-ticket.ts`)
- Stripe 결제 연동
- 지역 감지 시스템
- K-Experience 컴포넌트
- 데이터베이스 스키마
- 배포 체크리스트

---

## 🚀 실행 로드맵

### Phase 1: 글로벌 인프라 (Week 1-2)
- [ ] `src/lib/global-pricing.ts` 구현
- [ ] `src/lib/vip-ticket.ts` 구현
- [ ] `src/lib/currency.ts` 구현
- [ ] 일본어/중국어 번체 번역

### Phase 2: 결제 시스템 (Week 3-4)
- [ ] Stripe 연동
- [ ] 결제 API 구현
- [ ] Webhook 처리

### Phase 3: 글로벌 UX (Week 5-6)
- [ ] 지역 감지 시스템
- [ ] K-Experience 컴포넌트
- [ ] 글로벌 랜딩 페이지

### Phase 4: QA & 배포 (Week 7-8)
- [ ] 통합 테스트
- [ ] 보안 검토
- [ ] Production 배포
- [ ] 일본 베타 런칭

---

## 📊 투자 필요 자금

| 항목 | Y1 |
|------|-----|
| 인건비 | 15억원 |
| 마케팅 | 10억원 |
| 인프라 | 3억원 |
| 법률/회계 | 2억원 |
| 기타 | 2억원 |
| **합계** | **32억원** |

---

## 📞 문의

- **전략 문의**: strategy@zzik.app
- **기술 문의**: tech@zzik.app
- **파트너십 문의**: partnership@zzik.app

---

*© 2025 ZZIK Inc. All Rights Reserved.*

*본 문서는 ZZIK의 기밀 정보를 포함하고 있으며, 무단 복제 및 배포를 금합니다.*
