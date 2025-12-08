import { PrivyClientConfig } from '@privy-io/react-auth';
import { base } from 'viem/chains';

export const privyConfig: PrivyClientConfig = {
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cm4j28x5u02a1104u5g275152', // Placeholder or Env
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
