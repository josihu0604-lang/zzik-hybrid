# 🚀 Deployment Guide (ZZIK Hybrid)

## 📋 Build & Environment Setup

This project uses **Next.js 16** (App Router) with a hybrid architecture (Web + Capacitor).

### ✅ Build Configuration (Optimized)

The `next.config.ts` has been optimized for production with:
- `output: 'standalone'`: Ready for Docker/Self-hosted/Adapter-based deployments.
- `eslint.ignoreDuringBuilds`: Disabled (via env var) to prevent build-time lint blocking.
- `swcMinify`: Enabled implicitly.
- `headers`: Comprehensive security headers (CSP, HSTS).

### 🛠 Prerequisites

1.  **Node.js**: v18.17+ (v20+ recommended)
2.  **Package Manager**: `npm` or `pnpm`

---

## 🌍 Platform Specifics

### 1. Vercel (Recommended)

The project is optimized for Vercel out of the box.
- `vercel.json` is configured.
- Middleware and Server Actions work natively.

**Command:**
```bash
vercel deploy --prod
```

### 2. Cloudflare Pages

We have added `wrangler.toml` for Cloudflare configuration.
Since this app uses Server Components and API Routes, you should use the **Cloudflare Next.js Adapter**.

**Setup:**
1.  Install the adapter:
    ```bash
    npm install -D @cloudflare/next-on-pages
    ```
2.  Update `package.json` scripts:
    ```json
    "pages:build": "npx @cloudflare/next-on-pages",
    "preview": "npm run pages:build && wrangler pages dev .vercel/output/static",
    "deploy": "npm run pages:build && wrangler pages deploy .vercel/output/static"
    ```
3.  Deploy:
    ```bash
    npm run deploy
    ```

### 3. Docker (Self-Hosted)

With `output: 'standalone'`, a `.next/standalone` folder is generated.

**Dockerfile Snippet:**
```dockerfile
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
CMD ["node", "server.js"]
```

---

## ⚠️ Troubleshooting

### Linting Errors during Build
We have disabled strict linting during the build command to ensure deployment artifacts are generated even if minor style issues exist.
Run `npm run lint` separately in your CI/CD pipeline.

### Missing Environment Variables
The build requires basic environment variables. If you see Supabase connection errors at runtime, verify:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
