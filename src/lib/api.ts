import { Capacitor } from '@capacitor/core';

// Native Android builds run inside Capacitor's local WebView, so relative /api
// requests would hit the local asset server and return the app's HTML shell.
// Route API calls to the deployed Cloudflare Pages backend on native builds.
export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : '/' + path;
  return Capacitor.isNativePlatform() ? 'https://say-ai.pages.dev' + normalized : normalized;
}
