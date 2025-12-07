#!/usr/bin/env node

/**
 * Get Local IP Address for Mobile Development
 * 
 * This script detects the local network IP address for mobile device access.
 * Mobile devices need to connect to this IP instead of localhost.
 * 
 * Usage: node scripts/get-local-ip.js
 */

import { networkInterfaces } from 'os';

function getLocalIpAddress() {
  const nets = networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip internal (i.e. 127.0.0.1) and non-IPv4 addresses
      // 'IPv4' is in Node <= 17, 'IPv4' is in Node >= 18
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

if (addresses.length === 0) {
  console.log('❌ No local network IP address found.');
  console.log('Make sure you are connected to a network (WiFi or Ethernet).');
  process.exit(1);
}

console.log('\n📱 Mobile Development Setup\n');
console.log('═══════════════════════════════════════════════════════════════\n');

if (addresses.length === 1) {
  console.log(`✅ Local IP Address: ${addresses[0].address}`);
  console.log(`   Network Interface: ${addresses[0].name}\n`);
} else {
  console.log('Found multiple network interfaces:\n');
  addresses.forEach((addr, index) => {
    console.log(`${index + 1}. ${addr.address} (${addr.name})`);
  });
  console.log('\nUse the IP address that matches your network connection.');
  console.log('(Usually Wi-Fi or Ethernet, not VPN or Docker)\n');
}

console.log('═══════════════════════════════════════════════════════════════\n');
console.log('📋 Instructions:\n');
console.log('1. Start development server:');
console.log('   pnpm dev:mobile\n');
console.log('2. Update capacitor.config.ts with your IP:');
console.log('   url: isDev ? \'http://YOUR_IP:3000\' : \'https://zzik.kr\'\n');
console.log('3. Make sure mobile device is on the same WiFi network\n');
console.log('4. Run mobile app:');
console.log('   pnpm mobile:run:android  or  pnpm mobile:run:ios\n');
console.log('═══════════════════════════════════════════════════════════════\n');
