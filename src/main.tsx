import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import AuthGate from './AuthGate.tsx';
import './index.css';

declare global {
  interface Window {
    SayAiAndroid?: { openExternal: (url: string) => void };
    SayAiOAuthPendingUrl?: string;
    handleSayAiGoogleCallback?: (code: string, error?: string) => void;
  }
}

if (Capacitor.isNativePlatform()) {
  window.SayAiAndroid = {
    openExternal: (url: string) => { void Browser.open({ url }); }
  };

  const receiveOAuthUrl = async (url: string) => {
    if (!url.startsWith('com.trofficial.sayai://login-callback')) return;
    window.SayAiOAuthPendingUrl = url;
    const callback = new URL(url);
    const code = callback.searchParams.get('code') || '';
    const error = callback.searchParams.get('error_description') || callback.searchParams.get('error') || undefined;
    if (window.handleSayAiGoogleCallback) {
      await window.handleSayAiGoogleCallback(code, error);
      window.SayAiOAuthPendingUrl = undefined;
    }
    await Browser.close().catch(() => undefined);
  };

  void App.addListener('appUrlOpen', ({ url }) => { void receiveOAuthUrl(url); });
  void App.getLaunchUrl().then((launch) => {
    if (launch?.url) return receiveOAuthUrl(launch.url);
  }).catch(() => undefined);
}

createRoot(document.getElementById('root')!).render(<AuthGate />);
