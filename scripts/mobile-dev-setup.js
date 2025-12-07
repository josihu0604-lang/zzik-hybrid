#!/usr/bin/env node

/**
 * Mobile Development Setup Script
 * 
 * This script provides complete instructions for mobile development,
 * including IP detection and setup commands.
 * 
 * Usage: node scripts/mobile-dev-setup.js
 */

import { networkInterfaces } from 'os';

function getLocalIpAddress() {
  const nets = networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
      if (net.family === familyV4Value && !net.internal) {
        results.push({
          name,
          address: net.address,
        });
      }
    }
  }

  return results;
}

const addresses = getLocalIpAddress();

console.log('\n🚀 ZZIK Mobile Development Setup\n');
console.log('═══════════════════════════════════════════════════════════════\n');

if (addresses.length === 0) {
  console.log('❌ No local network IP address found.');
  console.log('   Make sure you are connected to a network (WiFi or Ethernet).\n');
  console.log('═══════════════════════════════════════════════════════════════\n');
  process.exit(1);
}

// Select the most likely IP (prefer non-docker/vpn interfaces)
let selectedIp = addresses[0].address;
let selectedInterface = addresses[0].name;

if (addresses.length > 1) {
  // Prefer eth0, en0, wlan0 over docker/vpn interfaces
  const preferred = addresses.find((addr) =>
    ['eth0', 'en0', 'wlan0', 'Wi-Fi', 'Ethernet'].includes(addr.name)
  );
  if (preferred) {
    selectedIp = preferred.address;
    selectedInterface = preferred.name;
  }
}

console.log(`✅ Detected Network Interface: ${selectedInterface}`);
console.log(`✅ Local IP Address: ${selectedIp}\n`);

if (addresses.length > 1) {
  console.log('⚠️  Multiple interfaces detected. Using: ' + selectedIp);
  console.log('   Other available IPs:');
  addresses.forEach((addr) => {
    if (addr.address !== selectedIp) {
      console.log(`   - ${addr.address} (${addr.name})`);
    }
  });
  console.log('');
}

console.log('═══════════════════════════════════════════════════════════════\n');
console.log('📋 Step-by-Step Instructions:\n');

console.log('1️⃣  Start the development server (accessible from mobile):');
console.log('    pnpm dev:mobile\n');

console.log('2️⃣  In a NEW terminal, run the mobile app:\n');

console.log('    For Android (Real Device):');
console.log(`    CAPACITOR_DEV=true CAPACITOR_SERVER_URL=http://${selectedIp}:3000 pnpm cap:run:android\n`);

console.log('    For iOS (Real Device):');
console.log(`    CAPACITOR_DEV=true CAPACITOR_SERVER_URL=http://${selectedIp}:3000 pnpm cap:run:ios\n`);

console.log('    For Android Emulator:');
console.log('    CAPACITOR_DEV=true pnpm cap:run:android\n');

console.log('    For iOS Simulator:');
console.log('    CAPACITOR_DEV=true pnpm cap:run:ios\n');

console.log('═══════════════════════════════════════════════════════════════\n');
console.log('💡 Pro Tips:\n');
console.log('• Emulators use special addresses (10.0.2.2 for Android, localhost for iOS)');
console.log('• Real devices MUST be on the same WiFi network as your computer');
console.log('• Check firewall settings if mobile can\'t connect');
console.log('• The dev server must bind to 0.0.0.0 (done by dev:mobile script)\n');

console.log('═══════════════════════════════════════════════════════════════\n');
console.log('🔧 Troubleshooting:\n');
console.log('• Connection refused: Check if dev server is running (pnpm dev:mobile)');
console.log('• Different network: Ensure mobile and computer are on same WiFi');
console.log('• Firewall: Allow port 3000 in your firewall settings');
console.log('• Wrong IP: Try other detected IPs shown above\n');
console.log('═══════════════════════════════════════════════════════════════\n');
