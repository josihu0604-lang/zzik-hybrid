# Mobile Development Fix - Quick Reference

## Problem (Before)
```bash
# Mobile device tries to access
https://localhost:3000  ❌

# Issues:
# - localhost refers to mobile device, not the computer
# - HTTPS not available in dev mode
# - Dev server only listens on 127.0.0.1
```

## Solution (After)

### 1. Start Dev Server
```bash
# Old way (only works for browser on same computer)
pnpm dev

# New way (accessible from mobile devices)
pnpm dev:mobile
# This binds to 0.0.0.0:3000, accessible from network
```

### 2. Get Setup Instructions
```bash
pnpm mobile:setup
```

Output example:
```
🚀 ZZIK Mobile Development Setup

✅ Local IP Address: 192.168.1.10

📋 Instructions:
1. pnpm dev:mobile
2. CAPACITOR_DEV=true CAPACITOR_SERVER_URL=http://192.168.1.10:3000 pnpm cap:run:android
```

### 3. Run Mobile App

**Real Device (iPhone/Android phone):**
```bash
CAPACITOR_DEV=true CAPACITOR_SERVER_URL=http://192.168.1.10:3000 pnpm cap:run:android
CAPACITOR_DEV=true CAPACITOR_SERVER_URL=http://192.168.1.10:3000 pnpm cap:run:ios
```

**Emulator/Simulator:**
```bash
CAPACITOR_DEV=true pnpm cap:run:android
CAPACITOR_DEV=true pnpm cap:run:ios
```

## Key Changes

| File | Change |
|------|--------|
| `package.json` | Added `dev:mobile`, `mobile:setup`, `mobile:ip` scripts |
| `capacitor.config.ts` | Added `CAPACITOR_SERVER_URL` environment variable support |
| `MOBILE_DEV.md` | Complete troubleshooting guide |
| `scripts/mobile-dev-setup.js` | Automatic IP detection and instructions |
| `.env.example` | Documented CAPACITOR_DEV and CAPACITOR_SERVER_URL |

## Network Diagram

```
Before:
┌──────────┐
│  Mobile  │──❌──→ localhost:3000 (refers to itself)
└──────────┘

After:
┌──────────┐         WiFi          ┌──────────┐
│  Mobile  │──✅──→ 192.168.1.10  │ Computer │
└──────────┘        :3000          │ (dev:mobile)
                                   └──────────┘
```

## Troubleshooting Commands

```bash
# Check local IP
pnpm mobile:ip

# Get complete setup guide
pnpm mobile:setup

# Verify dev server is accessible
curl http://192.168.1.10:3000  # From another device

# Check if port is in use
lsof -i :3000
```

## See Also
- [MOBILE_DEV.md](./MOBILE_DEV.md) - Complete guide
- [README.md](./README.md#mobile-apps) - Quick start
