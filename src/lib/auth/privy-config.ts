import { PrivyClientConfig } from '@privy-io/react-auth';
import { base } from 'viem/chains';

// Validate that Privy App ID is configured
if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
  console.warn('[Privy] NEXT_PUBLIC_PRIVY_APP_ID is not configured. Privy features will not work.');
}

export const privyConfig: PrivyClientConfig = {
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  loginMethods: ['email', 'google', 'apple'],
  appearance: {
    theme: 'dark',
    accentColor: '#FF4500', // Flame
    logo: 'https://github.com/josihu0604-lang/zzik-hybrid/raw/main/public/logo.png',
    showWalletLoginFirst: false,
  },
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    noPromptOnSignature: true, // Invisible signature
  },
  defaultChain: base,
  supportedChains: [base],
};
