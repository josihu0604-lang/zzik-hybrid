# 🚀 Vibe Protocol - Deployment Guide

This guide provides step-by-step instructions for deploying the Vibe Protocol (Web3 Social Platform) to production.

## 📋 Pre-Deployment Checklist

Before deploying to production, ensure you have:

- [ ] Supabase project set up
- [ ] Privy account created and configured
- [ ] Environment variables configured
- [ ] Database schema executed
- [ ] SSL/TLS certificates configured (handled by Vercel)
- [ ] Domain configured (optional)

---

## 🗄️ Database Setup

### Step 1: Execute Schema Migration

The Vibe Protocol requires additional database tables for:
- **Wallet addresses** and user balances
- **Vibe cards** (NFT metadata)
- **Transactions** (ledger)

**Location**: `/src/lib/db/schema.sql`

**Instructions**:

1. Log in to your [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to **SQL Editor**
3. Copy the contents of `src/lib/db/schema.sql`
4. Paste and execute the SQL commands
5. Verify the following changes were applied:
   - `users` table now has `wallet_address`, `vip_level`, and `z_cash_balance` columns
   - `vibe_cards` table created
   - `transactions` table created

**Schema Overview**:

```sql
-- Users Extension
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS vip_level INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS z_cash_balance DECIMAL(18, 2) DEFAULT 0;

-- Vibe Cards (NFT Metadata)
CREATE TABLE IF NOT EXISTS vibe_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  popup_id UUID REFERENCES popups(id),
  token_id TEXT,
  image_url TEXT NOT NULL,
  metadata JSONB,
  is_minted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions (Ledger)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  amount DECIMAL(18, 2),
  type TEXT,
  status TEXT,
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Step 2: Configure Row Level Security (RLS)

Row Level Security policies are included in the `schema.sql` file and will be created automatically when you execute the script. The policies ensure:

- Users can only read and insert their own vibe cards
- Users can only read and insert their own transactions
- A helper function `increment_z_cash_balance()` is available for atomic balance updates

**Note**: The schema.sql script is idempotent and safe to run multiple times.

---

## 🔐 Environment Variables

### Step 1: Configure Privy

1. Sign up at [Privy Dashboard](https://dashboard.privy.io/)
2. Create a new application
3. Note your **App ID** and **App Secret**
4. Configure supported chains (add **Base L2**)
5. Enable social login providers (Google, Apple, Email)

### Step 2: Set Environment Variables

Add the following to your Vercel project or `.env.local`:

```bash
# ============================================
# PRIVY (WEB3 WALLET) [REQUIRED]
# ============================================
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
PRIVY_APP_SECRET=your-privy-app-secret
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org

# ============================================
# SUPABASE [REQUIRED]
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ============================================
# MAPBOX [REQUIRED]
# ============================================
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Verify Configuration

Run the following command to validate environment variables:

```bash
pnpm env:check
```

---

## 🛠️ API Implementation

### Replace Mock Data

The following API routes contain mock data and need to be updated with real Supabase integration:

#### 1. `/api/vibe/mint/route.ts`

**Current State**: Returns mock vibe card data

**Required Changes**:
- Integrate with Supabase to create vibe card records
- Update user Z-CASH balance
- Create transaction record
- Optional: Integrate with Privy for on-chain minting

#### 2. `/api/vibe/list/route.ts`

**Current State**: Returns mock NFT collection

**Required Changes**:
- Query `vibe_cards` table filtered by authenticated user
- Return real user vibe cards

**Example Implementation** (see below):

```typescript
// /api/vibe/list/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Query user's vibe cards
  const { data, error } = await supabase
    .from('vibe_cards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Vibe List] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch vibe cards' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: data || []
  });
}
```

---

## 🧪 Testing

### Local Testing

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Test the Vibe Protocol flow:
   - Navigate to the home page
   - Click the Golden Button (hold for 3 seconds)
   - Verify the Reward Modal appears
   - Check wallet balance in the dashboard

3. Test API endpoints:
   ```bash
   curl http://localhost:3000/api/vibe/list
   ```

### Production Testing

After deployment:

1. Test wallet creation with a new user account
2. Verify Z-CASH minting works correctly
3. Check that vibe cards appear in the user's collection
4. Test haptic feedback on mobile devices
5. Verify GPS-based check-in still works

---

## 🚢 Deployment to Vercel

### Step 1: Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import your GitHub repository
4. Select the branch to deploy (e.g., `main` or `genspark_ai_developer`)

### Step 2: Configure Build Settings

Vercel should auto-detect Next.js. Verify:

- **Framework Preset**: Next.js
- **Build Command**: `pnpm build` or `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install` or `npm install`

### Step 3: Add Environment Variables

In Vercel project settings:

1. Navigate to **Settings → Environment Variables**
2. Add all required environment variables (see above)
3. Set variables for **Production**, **Preview**, and **Development** environments

### Step 4: Deploy

1. Click **Deploy**
2. Wait for the build to complete
3. Verify deployment at your Vercel URL (e.g., `https://your-app.vercel.app`)

---

## 📊 Post-Deployment Verification

### Checklist

- [ ] Homepage loads without errors
- [ ] Users can log in with Privy (Email, Google, Apple)
- [ ] Wallet is automatically created for new users
- [ ] Golden Button minting flow works
- [ ] Reward Modal displays after minting
- [ ] Wallet card shows correct balance
- [ ] Vibe Grid displays user's NFT collection
- [ ] GPS check-in still functions
- [ ] Mobile app works (if using Capacitor)

### Monitoring

1. **Error Tracking**: Configure Sentry (optional but recommended)
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=https://...
   ```

2. **Analytics**: Enable Google Analytics (optional)
   ```bash
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

3. **Performance**: Monitor Vercel Analytics
   - Navigate to **Analytics** in Vercel Dashboard
   - Check Web Vitals (LCP, FID, CLS)

---

## 🐛 Troubleshooting

### Issue: "Privy App ID not found"

**Solution**: Verify `NEXT_PUBLIC_PRIVY_APP_ID` is set in environment variables

### Issue: "Database error: relation 'vibe_cards' does not exist"

**Solution**: Execute the schema migration in Supabase SQL Editor

### Issue: "Mock data still appearing in production"

**Solution**: Update API routes to use real Supabase queries (see "API Implementation" section)

### Issue: "Wallet not created automatically"

**Solution**: 
1. Check Privy configuration in dashboard
2. Verify `PRIVY_APP_SECRET` is set correctly
3. Check browser console for Privy errors

---

## 🔒 Security Considerations

### Best Practices

1. **Never commit secrets**: Use `.env.local` for local development
2. **Use RLS policies**: Ensure all Supabase tables have proper RLS enabled
3. **Validate user input**: All API routes should validate request bodies
4. **Rate limiting**: Consider adding rate limiting for mint endpoints
5. **CORS configuration**: Restrict CORS to your domain only

### Environment Variable Security

- Use **Vercel Environment Variables** for production secrets
- Rotate `SUPABASE_SERVICE_ROLE_KEY` periodically
- Keep `PRIVY_APP_SECRET` confidential (never expose client-side)

---

## 📈 Performance Optimization (Phase 4)

After successful deployment, consider:

1. **Code-split PrivyProvider** (~120KB bundle size)
2. **Optimize images** with Next.js Image component
3. **Enable ISR** (Incremental Static Regeneration) for static pages
4. **Add CDN caching** for API responses

---

## 🎯 Success Metrics

Track the following KPIs:

- **User Registration Rate**: Users creating accounts via Privy
- **Minting Rate**: Users successfully minting vibe cards
- **Wallet Engagement**: Users checking wallet balance
- **Mobile App Downloads**: iOS/Android installs (if applicable)
- **Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1

---

## 📚 Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Privy Documentation](https://docs.privy.io/)
- [Vercel Documentation](https://vercel.com/docs)
- [Base L2 Network](https://docs.base.org/)

---

## 🆘 Support

For issues or questions:

1. Check the [GitHub Issues](https://github.com/josihu0604-lang/zzik-hybrid/issues)
2. Review the [Troubleshooting](#troubleshooting) section above
3. Contact the development team

---

**Deployment Status**: ⚠️ **Ready for Deployment** (after completing checklist)

**Last Updated**: December 8, 2025

---

**Project**: ZZIK - K-POP VIP Experience Platform  
**Version**: Vibe Protocol v1.0 (Phases 1-3)  
**Audited by**: G3-Pro Auditor Mode
