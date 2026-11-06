import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.trofficial.sayai',
  appName: 'SAY AI',
  webDir: 'dist',
  server: {
    // Load the production Cloudflare Pages app so its /api/* routes remain same-origin.
    url: 'https://say-ai.pages.dev',
    cleartext: false,
    allowNavigation: [
      'say-ai.pages.dev',
      '*.supabase.co',
      'accounts.google.com'
    ]
  }
};

export default config;
