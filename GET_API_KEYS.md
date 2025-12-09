# 🔑 API Keys 가이드 - 3개 키 설정 필요

**상태**: 5개 중 2개 완료 ✅

## ✅ 완료된 키 (2/5)

1. ✅ **SUPABASE_SERVICE_ROLE_KEY** - 설정 완료
2. ✅ **NEXT_PUBLIC_MAPBOX_TOKEN** - 설정 완료

---

## ⏳ 필요한 키 (3/5)

### 1️⃣ NEXT_PUBLIC_SUPABASE_ANON_KEY

**어디서 가져오나요?**
1. [Supabase Dashboard](https://app.supabase.com/project/xcbxhqsxnzhmegsrzymg/settings/api) 접속
2. 왼쪽 메뉴: **Settings** → **API**
3. **Project API keys** 섹션에서:
   - `anon` `public` 키 복사 (매우 긴 JWT 토큰)
   - 형식: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...` (300+ 글자)

**설정 방법:**
```bash
# .env.production 파일 열기
nano .env.production

# 17번 줄에 키 입력
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_키_붙여넣기
```

---

### 2️⃣ STRIPE_SECRET_KEY

**어디서 가져오나요?**
1. [Stripe Dashboard](https://dashboard.stripe.com/apikeys) 접속
2. **Developers** → **API keys** 메뉴
3. **Secret key** 확인:
   - 🧪 테스트 모드: `sk_test_...` (51글자)
   - 🔴 프로덕션: `sk_live_...` (51글자)
   
**⚠️ 주의**: Secret key는 **Reveal live key** 버튼을 클릭해야 보입니다!

**설정 방법:**
```bash
# .env.production 파일 열기
nano .env.production

# 31번 줄에 키 입력
STRIPE_SECRET_KEY=여기에_키_붙여넣기
```

---

### 3️⃣ GEMINI_API_KEY

**어디서 가져오나요?**
1. [Google AI Studio](https://aistudio.google.com/app/apikey) 접속
2. **Get API key** 또는 **Create API key** 클릭
3. 프로젝트 선택 또는 새로 생성
4. API key 복사:
   - 형식: `AIzaSy...` (39글자)

**무료 한도:**
- ✅ 1,500 requests/day (무료)
- ✅ gemini-2.0-flash-exp 모델 사용

**설정 방법:**
```bash
# .env.production 파일 열기
nano .env.production

# 47번 줄에 키 입력
GEMINI_API_KEY=여기에_키_붙여넣기
```

---

## 🚀 빠른 설정 (3개 키를 한 번에)

```bash
cd /home/user/webapp

# 환경변수 파일 편집
nano .env.production

# 아래 3줄 찾아서 키 입력:
# Line 17: NEXT_PUBLIC_SUPABASE_ANON_KEY=
# Line 31: STRIPE_SECRET_KEY=
# Line 47: GEMINI_API_KEY=
```

---

## ✅ 설정 확인

```bash
# 키 설정 확인 (비어있지 않은지)
grep -E "(SUPABASE_ANON_KEY|STRIPE_SECRET|GEMINI_API)" .env.production

# 빌드 테스트
pnpm build
```

---

## 📞 문제 해결

### Q: Supabase anon key가 없어요!
A: Supabase Dashboard → Project Settings → API → **Project API keys**에서 확인하세요.

### Q: Stripe 키가 안 보여요!
A: "Reveal live key" 버튼을 클릭해야 실제 키가 표시됩니다.

### Q: Gemini API 키 생성이 안 돼요!
A: Google Cloud 프로젝트가 필요합니다. AI Studio에서 자동으로 생성할 수 있습니다.

### Q: 무료로 사용 가능한가요?
A: 
- ✅ Supabase: Free tier (500MB DB, 1GB bandwidth)
- ✅ Stripe: 무료 (거래 수수료만 있음)
- ✅ Gemini: 1,500 requests/day 무료
- ✅ Mapbox: 50,000 map loads/month 무료

---

## 📝 다음 단계

키 설정 후:
```bash
# 1. 변경사항 커밋
git add .env.production
git commit -m "chore: configure production environment keys"

# 2. Vercel에 환경변수 설정
vercel env pull .env.local

# 3. 배포
vercel --prod
```

---

**작성일**: 2025-12-09
**프로젝트**: ZZIK Hybrid (zzik-hybrid.vercel.app)
**Supabase Project**: xcbxhqsxnzhmegsrzymg
