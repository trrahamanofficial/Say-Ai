import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type VideoConfig = { provider: 'huggingface'; model: string; apiKey: string; apiKeyConfigured?: boolean; enabled: boolean };
const defaults: VideoConfig = { provider: 'huggingface', model: 'Wan-AI/Wan2.2-TI2V-5B', apiKey: '', enabled: false };

export const VideoAIControl: React.FC = () => {
  const [config, setConfig] = useState<VideoConfig>(defaults);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const getToken = async () => {
    const { data } = await supabase?.auth.getSession() || { data: { session: null } };
    return data.session?.access_token || '';
  };

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const response = await fetch('/api/admin/video-config', { headers: { Authorization: 'Bearer ' + token } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load video settings.');
        setConfig(data);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Could not load video settings.');
      }
    })();
  }, []);

  const save = async () => {
    setBusy(true); setMessage('');
    try {
      const token = await getToken();
      const response = await fetch('/api/admin/video-config', {
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Save failed.');
      setConfig(value => ({ ...value, apiKey: '', apiKeyConfigured: true }));
      setMessage('Hugging Face settings saved securely in global server storage.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Save failed.');
    } finally { setBusy(false); }
  };

  const test = async () => {
    setTesting(true); setStatus('Checking Hugging Face token…'); setMessage('');
    try {
      const token = await getToken();
      const response = await fetch('/api/admin/video-config', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: config.apiKey })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Token test failed.');
      setStatus('Token authenticated with Hugging Face. This does not yet confirm that the selected video model is available.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Token test failed.');
    } finally { setTesting(false); }
  };

  return <section className="space-y-4">
    <div className="rounded-2xl border border-purple-500/30 bg-[#0b1030] p-4">
      <h3 className="text-lg font-bold text-white">Video AI Management</h3>
      <p className="mt-1 text-xs text-slate-400">Private admin controls. Hugging Face token is stored server-side in Cloudflare KV and is never returned to the browser.</p>
    </div>
    <div className="rounded-2xl border border-purple-900/40 bg-[#0a0e2a] p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div><h4 className="font-bold text-white">Hugging Face</h4><p className="text-xs text-slate-400">{config.apiKeyConfigured ? 'Token saved securely' : 'Token not configured'}</p></div>
        <button onClick={() => setConfig(v => ({ ...v, enabled: !v.enabled }))} className={'rounded-full px-3 py-2 text-xs font-bold ' + (config.enabled ? 'bg-emerald-700 text-white' : 'bg-slate-700 text-slate-200')}>{config.enabled ? 'Enabled' : 'Disabled'}</button>
      </div>
      <label className="block text-xs text-slate-300">Video Model ID
        <input value={config.model} onChange={e => setConfig(v => ({ ...v, model: e.target.value }))} placeholder="e.g. Wan-AI/Wan2.1-T2V-1.3B" className="mt-1 w-full rounded-xl border border-purple-900 bg-[#050614] p-3 text-white" />
      </label>
      <label className="block text-xs text-slate-300">Hugging Face Access Token
        <input type="password" autoComplete="off" value={config.apiKey} onChange={e => setConfig(v => ({ ...v, apiKey: e.target.value }))} placeholder={config.apiKeyConfigured ? 'Saved token — paste only to replace' : 'Paste hf_… token here'} className="mt-1 w-full rounded-xl border border-purple-900 bg-[#050614] p-3 text-white" />
      </label>
      <div className="flex flex-wrap gap-2">
        <button onClick={test} disabled={testing || (!config.apiKey && !config.apiKeyConfigured)} className="rounded-xl border border-purple-700 px-4 py-2 text-xs font-bold text-purple-200 disabled:opacity-40">{testing ? 'Testing…' : 'Test Token'}</button>
        <button onClick={save} disabled={busy || (!config.apiKey && !config.apiKeyConfigured)} className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-40">{busy ? 'Saving…' : 'Save Video API'}</button>
      </div>
      {status && <p role="status" className="rounded-xl border border-purple-500/30 bg-purple-950/30 p-3 text-xs text-slate-200">{status}</p>}
      {message && <p role="status" className="rounded-xl border border-purple-500/30 bg-purple-950/30 p-3 text-xs text-slate-200">{message}</p>}
      <p className="text-[11px] leading-relaxed text-amber-200/80">Token authentication does not test video generation. The backend now uses Hugging Face Text-to-Video through Fal AI. Hugging Face Free accounts receive only a small monthly credit (currently $0.10); video generation may exceed it. No paid fallback is used, and generation may fail when free credits are exhausted.</p>
    </div>
  </section>;
};
