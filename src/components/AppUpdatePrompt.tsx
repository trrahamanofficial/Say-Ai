import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as NativeApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';

const RELEASES_API = 'https://api.github.com/repos/trrahamanofficial/Say-Ai/releases/latest';

function versionParts(value: string): number[] {
  return value.replace(/^v/i, '').split('.').map(part => Number.parseInt(part, 10) || 0);
}

function isNewer(remote: string, local: string): boolean {
  const a = versionParts(remote);
  const b = versionParts(local);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const left = a[i] || 0;
    const right = b[i] || 0;
    if (left !== right) return left > right;
  }
  return false;
}

export function AppUpdatePrompt() {
  const [release, setRelease] = useState<{ version: string; url: string; notes: string } | null>(null);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let active = true;

    const checkForUpdate = async () => {
      try {
        const [installed, response] = await Promise.all([
          NativeApp.getInfo(),
          fetch(RELEASES_API, { cache: 'no-store', headers: { Accept: 'application/vnd.github+json' } })
        ]);
        if (!response.ok) return;
        const latest = await response.json();
        const version = String(latest.tag_name || '').replace(/^v/i, '');
        const apk = Array.isArray(latest.assets)
          ? latest.assets.find((asset: any) => String(asset.name || '') === 'SAY-AI-latest.apk') || latest.assets.find((asset: any) => String(asset.name || '').toLowerCase().endsWith('.apk'))
          : null;
        if (!active || !version || !apk?.browser_download_url) return;
        if (isNewer(version, installed.version || '1.0.0')) {
          setRelease({
            version,
            url: apk.browser_download_url,
            notes: String(latest.body || '').slice(0, 500)
          });
        }
      } catch {
        // Update checks are optional; the app remains usable offline.
      }
    };

    void checkForUpdate();
    return () => { active = false; };
  }, []);

  if (!release) return null;

  const startUpdate = async () => {
    setOpening(true);
    try {
      // Android opens the signed APK download in the browser; Android then asks
      // the user to approve installation. Silent installs are not allowed for
      // ordinary apps outside managed-device/system-app privileges.
      await Browser.open({ url: release.url, presentationStyle: 'popover' });
    } finally {
      setOpening(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-5 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-3xl border border-cyan-300/25 bg-[#0b1d32] p-6 text-white shadow-2xl">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/15 text-3xl">↻</div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">SAY AI Update</p>
        <h2 className="mt-2 text-2xl font-extrabold">Update available</h2>
        <p className="mt-2 text-sm text-slate-300">A newer version of SAY AI is ready to install.</p>
        <p className="mt-3 rounded-xl bg-white/5 px-3 py-2 text-sm text-cyan-200">Version {release.version}</p>
        {release.notes && <p className="mt-3 max-h-24 overflow-auto text-xs leading-5 text-slate-400">{release.notes}</p>}
        <button
          type="button"
          onClick={() => void startUpdate()}
          disabled={opening}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-bold text-white shadow-lg shadow-cyan-900/30 disabled:opacity-60"
        >
          {opening ? 'Opening download…' : 'Update Now'}
        </button>
        <p className="mt-3 text-center text-[11px] leading-4 text-slate-500">The APK will download. Android will then ask you to allow and confirm installation.</p>
      </div>
    </div>
  );
}
