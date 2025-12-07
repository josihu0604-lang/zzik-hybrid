# 📱 Mobile Development Guide

Complete guide for developing ZZIK mobile apps (iOS/Android) with live reload.

## Quick Start

1. **Check your local IP and get setup instructions:**
   ```bash
   pnpm mobile:setup
   ```

2. **Start development server** (accessible from mobile devices):
   ```bash
   pnpm dev:mobile
   ```

3. **Run mobile app** (in a new terminal):
   ```bash
   # For real devices (use the IP from step 1)
   CAPACITOR_DEV=true CAPACITOR_SERVER_URL=http://YOUR_IP:3000 pnpm cap:run:android
   CAPACITOR_DEV=true CAPACITOR_SERVER_URL=http://YOUR_IP:3000 pnpm cap:run:ios
   
   # For emulators/simulators
   CAPACITOR_DEV=true pnpm cap:run:android
   CAPACITOR_DEV=true pnpm cap:run:ios
   ```

## Understanding the Setup

### Why can't mobile devices access `localhost:3000`?

- `localhost` refers to the device itself, not your computer
- Mobile devices need to connect to your computer's network IP address
- The dev server must bind to all network interfaces (`0.0.0.0`)

### Solution Overview

```
┌──────────────┐         WiFi Network        ┌──────────────┐
│   Computer   │◄──────────────────────────►│ Mobile Device│
│              │                              │              │
│  Next.js Dev │  http://192.168.1.x:3000   │ Capacitor App│
│  0.0.0.0:3000│                              │              │
└──────────────┘                              └──────────────┘
```

## Development Modes

### Real Devices (Physical iPhone/Android)

**Requirements:**
- ✅ Computer and mobile device on same WiFi network
- ✅ Firewall allows port 3000
- ✅ Know your computer's local IP

**Steps:**
```bash
# 1. Find your IP
pnpm mobile:setup

# 2. Start dev server
pnpm dev:mobile

# 3. Run app with your IP
CAPACITOR_DEV=true CAPACITOR_SERVER_URL=http://192.168.1.10:3000 pnpm cap:run:android
```

### Emulators/Simulators

**iOS Simulator:**
- Uses `localhost:3000` (works automatically)
- No IP configuration needed

**Android Emulator:**
- Uses `10.0.2.2:3000` (mapped to host's localhost)
- No IP configuration needed

**Steps:**
```bash
# 1. Start dev server
pnpm dev:mobile

# 2. Run emulator
CAPACITOR_DEV=true pnpm cap:run:android  # or ios
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev:mobile` | Start Next.js dev server on 0.0.0.0 (accessible from network) |
| `pnpm mobile:setup` | Show complete setup instructions with detected IP |
| `pnpm mobile:ip` | Show local IP address only |
| `pnpm cap:run:android` | Run Android app |
| `pnpm cap:run:ios` | Run iOS app |
| `pnpm cap:sync` | Sync web build to native projects |

## Environment Variables

### `CAPACITOR_DEV`
- **Default:** `false`
- **Values:** `true` | `false`
- **Purpose:** Enable development mode with live reload

```bash
CAPACITOR_DEV=true pnpm cap:run:android
```

### `CAPACITOR_SERVER_URL`
- **Default:** `http://localhost:3000`
- **Format:** `http://IP:PORT`
- **Purpose:** Custom dev server URL for real devices

```bash
CAPACITOR_SERVER_URL=http://192.168.1.10:3000
```

## Troubleshooting

### ❌ "Connection refused" / "ERR_CONNECTION_REFUSED"

**Cause:** Dev server not running or not accessible

**Solutions:**
1. Ensure dev server is running: `pnpm dev:mobile`
2. Check if port 3000 is in use: `lsof -i :3000` (Mac/Linux)
3. Verify server binds to 0.0.0.0, not just 127.0.0.1

### ❌ "Network error" / "Failed to fetch"

**Cause:** Mobile device can't reach computer's IP

**Solutions:**
1. Verify same WiFi network:
   ```bash
   # On computer
   ifconfig | grep "inet "  # Mac/Linux
   ipconfig                  # Windows
   ```
2. Check firewall settings:
   - Mac: System Preferences → Security → Firewall → Allow port 3000
   - Windows: Windows Defender Firewall → Allow port 3000
3. Try different network interface IP (if multiple IPs detected)

### ❌ "Unable to load app" / White screen

**Cause:** Wrong server URL or HTTPS mismatch

**Solutions:**
1. Ensure using `http://` not `https://` for dev
2. Check `capacitor.config.ts` server configuration
3. Clear app data and reinstall

### ❌ Can't find local IP

**Cause:** Not connected to network or using VPN

**Solutions:**
1. Connect to WiFi or Ethernet
2. Disable VPN temporarily
3. Use emulator/simulator instead

## Network Requirements

### For Real Devices

| Requirement | Details |
|-------------|---------|
| Same Network | Computer and device on same WiFi |
| Firewall | Allow TCP port 3000 |
| IP Address | Computer must have local IP (not just 127.0.0.1) |
| Protocol | HTTP (not HTTPS) for development |

### For Emulators

| Platform | Address | Notes |
|----------|---------|-------|
| iOS Simulator | `localhost:3000` | Shares host network |
| Android Emulator | `10.0.2.2:3000` | Special alias for host |

## Production Build

For app store releases (no dev server):

```bash
# Build web app
pnpm build

# Sync to native projects
pnpm cap:sync

# Build native apps
pnpm mobile:build:android
pnpm mobile:build:ios
```

Production builds connect to: `https://zzik.kr`

## Advanced Configuration

### Custom Port

```bash
# Start dev server on custom port
pnpm next dev --turbo --hostname 0.0.0.0 --port 8080

# Use custom port in mobile app
CAPACITOR_SERVER_URL=http://192.168.1.10:8080 pnpm cap:run:android
```

### Multiple Interfaces

If `pnpm mobile:setup` shows multiple IPs, try each one:

```bash
# Try first IP
CAPACITOR_SERVER_URL=http://192.168.1.10:3000 pnpm cap:run:android

# If that fails, try second IP
CAPACITOR_SERVER_URL=http://10.0.1.5:3000 pnpm cap:run:android
```

Priority order:
1. WiFi interface (en0, wlan0)
2. Ethernet interface (eth0)
3. Other interfaces

## Security Notes

⚠️ **Development mode security:**
- Dev server accessible from network (0.0.0.0)
- Only use on trusted networks
- Don't expose to public internet
- Use VPN for remote development if needed

## Workflow Example

**Daily development:**

```bash
# Terminal 1: Dev server
pnpm dev:mobile

# Terminal 2: First time or after changes
pnpm mobile:setup  # Get IP and instructions
CAPACITOR_DEV=true CAPACITOR_SERVER_URL=http://192.168.1.10:3000 pnpm cap:run:android

# After that, app has live reload - just save files and see changes!
```

## Tips

💡 **Pro tips:**
- Save the `CAPACITOR_SERVER_URL` command for your network
- Use emulator for quick iterations, real device for testing hardware features
- Keep dev server running in background
- Use `pnpm cap:sync` after installing new Capacitor plugins
- Check mobile device console in Chrome DevTools for debugging

## See Also

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Next.js CLI Options](https://nextjs.org/docs/api-reference/cli)
- [Network Debugging Guide](./NETWORK_DEBUG.md)
