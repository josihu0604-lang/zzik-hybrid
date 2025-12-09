#!/bin/bash
set -e

echo "🔍 환경변수 검증 중..."
echo ""

# 환경변수 로드
export $(cat .env.production | grep -v '^#' | xargs)

# 필수 키 검증
REQUIRED_KEYS=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "NEXT_PUBLIC_MAPBOX_TOKEN"
  "GEMINI_API_KEY"
  "STRIPE_SECRET_KEY"
)

MISSING=0

for key in "${REQUIRED_KEYS[@]}"; do
  value="${!key}"
  if [ -z "$value" ]; then
    echo "❌ $key: MISSING"
    MISSING=$((MISSING + 1))
  else
    # 키 길이 확인
    length=${#value}
    echo "✅ $key: SET ($length chars)"
  fi
done

echo ""
if [ $MISSING -eq 0 ]; then
  echo "🎉 모든 필수 환경변수가 설정되었습니다!"
  exit 0
else
  echo "⚠️  $MISSING 개의 환경변수가 누락되었습니다."
  exit 1
fi
