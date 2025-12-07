import type { CapacitorConfig } from '@capacitor/cli';

/**
 * ZZIK Capacitor Configuration
 *
 * Build Modes:
 * - Development: CAPACITOR_DEV=true - Hot reload with localhost or custom host
 * - App Store: Default - Connects to production server with offline fallback
 *
 * Mobile Development:
 * - Set CAPACITOR_SERVER_URL to your local IP (e.g., http://192.168.1.10:3000)
 * - Run `pnpm mobile:ip` to find your local IP address
 * - Use `pnpm dev:mobile` to start dev server accessible from mobile devices
 *
 * App Store Requirements:
 * - Native functionality (Push, Camera, Geolocation)
 * - Offline fallback page
 * - Proper splash screen and icons
 */
const isDev = process.env.CAPACITOR_DEV === 'true';
const customServerUrl = process.env.CAPACITOR_SERVER_URL;

// Determine the server URL for development
const getDevServerUrl = () => {
  if (customServerUrl) {
    return customServerUrl;
  }
  // Default to localhost (works for iOS Simulator and Android Emulator)
  return 'http://localhost:3000';
};

const config: CapacitorConfig = {
  appId: 'kr.zzik.app',
  appName: 'ZZIK',
  webDir: 'public', // Contains offline fallback assets

  // Server configuration
  server: {
    url: isDev ? getDevServerUrl() : 'https://zzik.kr',
    cleartext: isDev,
    androidScheme: 'https',
    iosScheme: 'capacitor',
    hostname: 'zzik.kr',
    // Enable error page for offline
    errorPath: '/offline.html',
  },

  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'zzik',
    backgroundColor: '#08090a',
    scrollEnabled: true,
    allowsLinkPreview: true,
    limitsNavigationsToAppBoundDomains: false,
    // App Store compliance
    handleApplicationNotifications: true,
  },

  android: {
    backgroundColor: '#08090a',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: isDev,
    minWebViewVersion: 60,
    // Play Store compliance
    buildOptions: {
      keystorePath: 'android/zzik-release.keystore',
      keystoreAlias: 'zzik',
    },
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 500,
      backgroundColor: '#08090a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#08090a',
      overlaysWebView: true,
    },
    Keyboard: {
      resize: 'body',
      style: 'Dark',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Camera: {
      // Required for app store - using camera for receipt verification
    },
    Geolocation: {
      // Required for app store - GPS verification
    },
    CapacitorHttp: {
      enabled: true,
    },
  },

  // App behavior
  loggingBehavior: isDev ? 'debug' : 'production',

  // Include native features list for app store review
  includePlugins: [
    '@capacitor/camera',
    '@capacitor/geolocation',
    '@capacitor/push-notifications',
    '@capacitor/share',
    '@capacitor/preferences',
    '@capacitor/haptics',
    '@capacitor/keyboard',
    '@capacitor/status-bar',
    '@capacitor/splash-screen',
    '@capacitor/app',
  ],
};

export default config;
