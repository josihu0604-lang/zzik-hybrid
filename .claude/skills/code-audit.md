---
name: code-audit
description: ZZIK 코드 심층 감사 스킬. 누락, 오류, 불일치, 개선점을 상세히 분석합니다.
---

# Code Audit Skill

코드베이스의 심층 감사를 수행합니다.

## 1. 누락 분석 (Missing Features)

### 필수 파일 체크

```bash
echo "=== REQUIRED FILES CHECK ==="

# 페이지 필수 요소
required_pages=("src/app/page.tsx" "src/app/layout.tsx" "src/app/not-found.tsx" "src/app/error.tsx" "src/app/loading.tsx")
for p in "${required_pages[@]}"; do
  [ -f "$p" ] && echo "✅ $p" || echo "❌ $p (MISSING)"
done

# API 라우트
echo -e "\n=== API ROUTES ==="
find src/app/api -name "route.ts" 2>/dev/null | head -20
```

### 컴포넌트 구조 검증

```bash
echo "=== COMPONENT STRUCTURE ==="

# index.ts 파일 누락
for dir in src/components/*/; do
  [ -f "${dir}index.ts" ] || echo "❌ Missing index.ts: $dir"
done

# 스켈레톤 컴포넌트
echo -e "\n=== SKELETON COMPONENTS ==="
grep -rln "Skeleton" src/components --include="*.tsx" | head -10
```

### Hook 커버리지

```bash
echo "=== HOOK COVERAGE ==="

# 기본 훅
hooks=("useForm" "useApi" "useToast" "useAuth" "useOffline")
for h in "${hooks[@]}"; do
  grep -rq "$h" src/hooks && echo "✅ $h" || echo "⚠️ $h not found"
done
```

## 2. 오류 분석 (Potential Bugs)

### 타입 안전성

```bash
echo "=== TYPE SAFETY ==="

# any 타입 사용
any_count=$(grep -rn ": any" src --include="*.ts" --include="*.tsx" | wc -l)
echo "any 타입 사용: $any_count건"

# @ts-ignore
ts_ignore=$(grep -rn "@ts-ignore\|@ts-expect-error" src --include="*.ts" --include="*.tsx" | wc -l)
echo "@ts-ignore: $ts_ignore건"

# 상세 위치
[ $any_count -gt 0 ] && echo -e "\n위치:" && grep -rn ": any" src --include="*.ts" --include="*.tsx" | head -5
```

### 에러 처리

```bash
echo "=== ERROR HANDLING ==="

# try-catch 사용
try_catch=$(grep -rn "try {" src --include="*.ts" --include="*.tsx" | wc -l)
echo "try-catch 블록: $try_catch건"

# ErrorBoundary 사용
error_boundary=$(grep -rn "ErrorBoundary" src/app --include="*.tsx" | wc -l)
echo "ErrorBoundary 사용: $error_boundary건"
```

### 메모리 누수 가능성

```bash
echo "=== MEMORY LEAK CHECK ==="

# useEffect cleanup 확인
useeffect_count=$(grep -rn "useEffect" src --include="*.tsx" | wc -l)
cleanup_count=$(grep -rn "return () =>" src --include="*.tsx" | wc -l)
echo "useEffect: $useeffect_count건, cleanup: $cleanup_count건"

# 이벤트 리스너
event_listeners=$(grep -rn "addEventListener" src --include="*.ts" --include="*.tsx" | wc -l)
remove_listeners=$(grep -rn "removeEventListener" src --include="*.ts" --include="*.tsx" | wc -l)
echo "addEventListener: $event_listeners, removeEventListener: $remove_listeners"
```

## 3. 개선 분석 (Improvements)

### 성능 최적화

```bash
echo "=== PERFORMANCE ==="

# useMemo/useCallback 사용
memo_count=$(grep -rn "useMemo\|useCallback" src --include="*.tsx" | wc -l)
echo "Memoization 사용: $memo_count건"

# 동적 임포트
dynamic_import=$(grep -rn "dynamic(" src --include="*.tsx" | wc -l)
echo "동적 임포트: $dynamic_import건"

# Image 최적화
next_image=$(grep -rn "next/image" src --include="*.tsx" | wc -l)
img_tag=$(grep -rn "<img " src --include="*.tsx" | wc -l)
echo "next/image: $next_image건, <img>: $img_tag건"
```

### 코드 복잡도

```bash
echo "=== CODE COMPLEXITY ==="

# 긴 파일 (200줄 이상)
echo "200줄 이상 파일:"
find src -name "*.ts" -o -name "*.tsx" | xargs wc -l 2>/dev/null | sort -rn | awk '$1 > 200 {print}' | head -10
```

### 의존성 분석

```bash
echo "=== DEPENDENCIES ==="

# 프로덕션 의존성 크기 (상위 10개)
pnpm list --prod --depth=0 2>/dev/null | head -15

# 미사용 의존성 후보
echo -e "\n미사용 의존성 후보 (수동 검증 필요):"
for pkg in $(jq -r '.dependencies | keys[]' package.json 2>/dev/null | head -10); do
  count=$(grep -rn "from ['\"]$pkg" src --include="*.ts" --include="*.tsx" | wc -l)
  [ $count -eq 0 ] && echo "⚠️ $pkg (import 없음)"
done
```

## 4. 불일치 분석 (Inconsistencies)

### 네이밍 컨벤션

```bash
echo "=== NAMING CONVENTIONS ==="

# 컴포넌트 파일명 (PascalCase)
echo "PascalCase 위반 (컴포넌트):"
find src/components -name "*.tsx" | while read f; do
  base=$(basename "$f" .tsx)
  [[ ! "$base" =~ ^[A-Z] ]] && echo "⚠️ $f"
done | head -5

# Hook 파일명 (use* prefix)
echo -e "\n'use' prefix 누락 (hooks):"
find src/hooks -name "*.ts" | while read f; do
  base=$(basename "$f" .ts)
  [[ ! "$base" =~ ^use ]] && [[ "$base" != "index" ]] && echo "⚠️ $f"
done | head -5
```

### Export 패턴

```bash
echo "=== EXPORT PATTERNS ==="

# default vs named export
default_exports=$(grep -rn "export default" src --include="*.ts" --include="*.tsx" | wc -l)
named_exports=$(grep -rn "export {" src --include="*.ts" --include="*.tsx" | wc -l)
echo "default export: $default_exports건"
echo "named export: $named_exports건"
```

### 스타일 일관성

```bash
echo "=== STYLE CONSISTENCY ==="

# CSS 모듈 vs Tailwind
css_files=$(find src -name "*.module.css" | wc -l)
tailwind_usage=$(grep -rn "className=" src --include="*.tsx" | wc -l)
echo "CSS 모듈: $css_files개"
echo "Tailwind className: $tailwind_usage건"

# 인라인 스타일
inline_style=$(grep -rn "style={{" src --include="*.tsx" | wc -l)
echo "인라인 스타일: $inline_style건"
```

## 5. 전체 리포트 생성

```bash
echo "
========================================
      ZZIK CODE AUDIT REPORT
========================================
Date: $(date '+%Y-%m-%d %H:%M')

FILES
-----
Total TSX: $(find src -name '*.tsx' | wc -l)
Total TS: $(find src -name '*.ts' | wc -l)
Total Lines: $(find src -name '*.ts' -o -name '*.tsx' | xargs wc -l 2>/dev/null | tail -1)

TYPE SAFETY
-----------
any types: $(grep -rn ': any' src --include='*.ts' --include='*.tsx' | wc -l)
ts-ignore: $(grep -rn '@ts-ignore' src --include='*.ts' --include='*.tsx' | wc -l)

QUALITY
-------
Error boundaries: $(grep -rn 'ErrorBoundary' src/app --include='*.tsx' | wc -l)
Loading states: $(grep -rn 'isLoading' src --include='*.tsx' | wc -l)
Skeletons: $(grep -rln 'Skeleton' src/components --include='*.tsx' | wc -l)

PERFORMANCE
-----------
useMemo: $(grep -rn 'useMemo' src --include='*.tsx' | wc -l)
useCallback: $(grep -rn 'useCallback' src --include='*.tsx' | wc -l)
next/image: $(grep -rn 'next/image' src --include='*.tsx' | wc -l)

CONSISTENCY
-----------
default exports: $(grep -rn 'export default' src --include='*.ts' --include='*.tsx' | wc -l)
relative imports: $(grep -rn "from '\\.\\./" src --include='*.ts' --include='*.tsx' | wc -l)

========================================
"
```

---

_ZZIK Code Audit | 코드 품질의 모든 것을 분석합니다_
