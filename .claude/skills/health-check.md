---
name: health-check
description: ZZIK 프로젝트 건강 상태 점검 스킬. 빌드, 타입, 린트, 의존성, 보안을 한번에 검사합니다.
---

# Health Check Skill

프로젝트 전반의 건강 상태를 신속하게 점검합니다.

## Quick Health Check

```bash
# 1단계: 빌드 검증 (가장 중요)
echo "=== BUILD CHECK ===" && SKIP_ENV_VALIDATION=true timeout 180 pnpm build 2>&1 | tail -30

# 2단계: TypeScript 검증
echo "=== TYPE CHECK ===" && SKIP_ENV_VALIDATION=true pnpm type-check 2>&1

# 3단계: Lint 검사
echo "=== LINT CHECK ===" && pnpm lint 2>&1 | tail -20

# 4단계: 의존성 검사
echo "=== DEPENDENCY CHECK ===" && pnpm audit 2>&1 | tail -10
```

## Detailed Checks

### 파일 구조 검증

```bash
# 필수 파일 존재 확인
for f in "src/app/layout.tsx" "src/app/page.tsx" "package.json" "tsconfig.json" "tailwind.config.ts"; do
  if [ -f "$f" ]; then
    echo "✅ $f"
  else
    echo "❌ $f (MISSING)"
  fi
done
```

### 환경 변수 검증

```bash
# .env.example과 실제 사용 비교
echo "=== ENV VARS USED IN CODE ==="
grep -roh "process.env.[A-Z_]*" src | sort | uniq -c | sort -rn | head -20
```

### Import 일관성

```bash
# 상대 경로 import (권장하지 않음)
echo "=== RELATIVE IMPORTS ==="
grep -rn "from '\\.\\." src --include="*.ts" --include="*.tsx" | wc -l
```

### 컴포넌트 일관성

```bash
# Props 인터페이스 정의 확인
echo "=== COMPONENTS WITHOUT PROPS INTERFACE ==="
for f in src/components/**/*.tsx; do
  if ! grep -q "interface.*Props" "$f" 2>/dev/null; then
    echo "⚠️ $f"
  fi
done 2>/dev/null | head -10
```

## Health Score Calculation

| 항목          | 가중치 | 기준                 |
| ------------- | ------ | -------------------- |
| Build Success | 40%    | 빌드 성공 여부       |
| Type Safety   | 25%    | TypeScript 오류 0개  |
| Lint Clean    | 15%    | ESLint 경고/오류 0개 |
| Test Pass     | 10%    | 테스트 통과율        |
| Security      | 10%    | 취약점 0개           |

## Common Issues & Fixes

### Build Fails

```bash
# 원인 파악
SKIP_ENV_VALIDATION=true pnpm build 2>&1 | grep -i "error"

# 일반적인 해결책
pnpm type-check  # 타입 오류 먼저 해결
```

### Type Errors

```bash
# 상세 오류 확인
SKIP_ENV_VALIDATION=true pnpm tsc --noEmit 2>&1

# 특정 파일만 검사
npx tsc --noEmit src/path/to/file.ts
```

### Lint Errors

```bash
# Auto-fix 가능한 것 자동 수정
pnpm lint --fix

# 특정 규칙 확인
pnpm lint --rule 'no-unused-vars'
```

## Maintenance Commands

```bash
# 캐시 정리
rm -rf .next node_modules/.cache

# 의존성 재설치
rm -rf node_modules && pnpm install

# 전체 재빌드
pnpm build --force
```

---

_ZZIK Health Check | 프로젝트 건강 상태를 한눈에_
