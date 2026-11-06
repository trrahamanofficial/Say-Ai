import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Config = { provider: 'cloudflare'; model: string; enabled: boolean };
const defaults: Config = { provider: 'cloudflare', model: '@cf/black-forest-labs/flux-1-schnell', enabled: true };

export const ImageAIControl: React.FC = () => {
  const [config, setConfig] = useState<Config>(defaults);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const getToken = async () => {
    const { data } = await supabase?.auth.getSession() || { data: { session: null } };
    return data.session?.access_token || '';
  };
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const response = await fetch('/api/admin/image-config', { headers: { Authorization: 'Bearer ' + token } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load image settings.');
        setConfig(data);
      } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not load image settings.'); }
    })();
  }, []);
  const save = async () => {
    setBusy(true); setMessage('');
    try {
      const token = await getToken();
      const response = await fetch('/api/admin/image-config', {
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Save failed.');
      setMessage('Cloudflare Image AI settings saved securely.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Save failed.'); }
    finally { setBusy(false); }
  };
  return <section className="space-y-4">
    <div className="rounded-2xl border border-purple-500/30 bg-[#0b1030] p-4">
      <h3 className="text-lg font-bold text-white">Image AI Management</h3>
      <p className="mt-1 text-xs text-slate-400">Private admin controls for the image generator. Uses the existing Cloudflare Workers AI binding; no API key is needed.</p>
    </div>
    <div className="rounded-2xl border border-purple-900/40 bg-[#0a0e2a] p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div><h4 className="font-bold text-white">Cloudflare Workers AI</h4><p className="text-xs text-slate-400">FLUX.1 Schnell · 1024 × 1024</p></div>
        <button onClick={() => setConfig(v => ({ ...v, enabled: !v.enabled }))} className={'rounded-full px-3 py-2 text-xs font-bold ' + (config.enabled ? 'bg-emerald-700 text-white' : 'bg-slate-700 text-slate-200')}>{config.enabled ? 'Enabled' : 'Disabled'}</button>
      </div>
      <div className="rounded-xl bg-[#050614] border border-purple-900/40 p-3 text-xs text-slate-300">
        <p className="font-semibold text-white">Selected model</p>
        <p className="mt-1 break-all">{config.model}</p>
        <p className="mt-2 text-slate-400">No Hugging Face token or paid API key is required. Free usage is subject to Cloudflare plan limits.</p>
      </div>
      <button onClick={save} disabled={busy} className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40">{busy ? 'Saving…' : 'Save Image AI Settings'}</button>
      {message && <p role="status" className="rounded-xl border border-purple-500/30 bg-purple-950/30 p-3 text-xs text-slate-200">{message}</p>}
    </div>
  </section>;
};
