import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Provider = 'cloudflare' | 'huggingface';
type Config = { provider: Provider; model: string; apiKey: string; apiKeyConfigured?: boolean; enabled: boolean };
const defaults: Config = { provider: 'cloudflare', model: '@cf/black-forest-labs/flux-1-schnell', apiKey: '', enabled: true };

export const ImageAIControl: React.FC = () => {
  const [config, setConfig] = useState<Config>(defaults);
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
        const response = await fetch('/api/admin/image-config', { headers: { Authorization: 'Bearer ' + token } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load image settings.');
        setConfig({ ...defaults, ...data, apiKey: '' });
      } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not load image settings.'); }
    })();
  }, []);
  const save = async () => {
    setBusy(true); setMessage('');
    try {
      const token = await getToken();
      const response = await fetch('/api/admin/image-config', {
        method: 'PUT', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Save failed.');
      setConfig(v => ({ ...v, apiKey: '', apiKeyConfigured: data.apiKeyConfigured ?? v.apiKeyConfigured }));
      setMessage('Image AI settings saved securely in global server storage.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Save failed.'); }
    finally { setBusy(false); }
  };
  const test = async () => {
    setTesting(true); setStatus('Testing provider credentials…'); setMessage('');
    try {
      const token = await getToken();
      const response = await fetch('/api/admin/image-config', {
        method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: config.provider, apiKey: config.apiKey })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Connection test failed.');
      setStatus(config.provider === 'huggingface'
        ? 'Hugging Face token authenticated. This does not guarantee that the selected image model is available or has free compute.'
        : 'Cloudflare AI binding is configured for this project. A live image-generation test has not been run.');
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Connection test failed.'); }
    finally { setTesting(false); }
  };
  const isHF = config.provider === 'huggingface';
  return <section className="space-y-4">
    <div className="rounded-2xl border border-purple-500/30 bg-[#0b1030] p-4">
      <h3 className="text-lg font-bold text-white">Image AI Management</h3>
      <p className="mt-1 text-xs text-slate-400">Private admin controls. Provider credentials are stored server-side and are never sent back to the browser.</p>
    </div>
    <div className="rounded-2xl border border-purple-900/40 bg-[#0a0e2a] p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div><h4 className="font-bold text-white">Image provider</h4><p className="text-xs text-slate-400">{config.enabled ? 'Image generation enabled' : 'Image generation disabled'}</p></div>
        <button onClick={() => setConfig(v => ({ ...v, enabled: !v.enabled }))} className={'rounded-full px-3 py-2 text-xs font-bold ' + (config.enabled ? 'bg-emerald-700 text-white' : 'bg-slate-700 text-slate-200')}>{config.enabled ? 'Enabled' : 'Disabled'}</button>
      </div>
      <label className="block text-xs text-slate-300">Provider
        <select value={config.provider} onChange={e => setConfig(v => ({ ...v, provider: e.target.value as Provider, model: e.target.value === 'cloudflare' ? '@cf/black-forest-labs/flux-1-schnell' : 'black-forest-labs/FLUX.1-schnell' }))} className="mt-1 w-full rounded-xl border border-purple-900 bg-[#050614] p-3 text-white">
          <option value="cloudflare">Cloudflare Workers AI (no API key)</option>
          <option value="huggingface">Hugging Face Inference API (token)</option>
        </select>
      </label>
      <label className="block text-xs text-slate-300">Image Model ID
        <input value={config.model} onChange={e => setConfig(v => ({ ...v, model: e.target.value }))} placeholder="Provider model ID" className="mt-1 w-full rounded-xl border border-purple-900 bg-[#050614] p-3 text-white" />
      </label>
      {isHF ? <label className="block text-xs text-slate-300">Hugging Face Access Token
        <input type="password" autoComplete="off" value={config.apiKey} onChange={e => setConfig(v => ({ ...v, apiKey: e.target.value }))} placeholder={config.apiKeyConfigured ? 'Saved token — paste only to replace' : 'Paste hf_… token here'} className="mt-1 w-full rounded-xl border border-purple-900 bg-[#050614] p-3 text-white" />
      </label> : <div className="rounded-xl bg-[#050614] border border-purple-900/40 p-3 text-xs text-slate-300">Cloudflare Workers AI uses the existing <b>AI</b> binding. No API key is required.</div>}
      <div className="flex flex-wrap gap-2">
        <button onClick={test} disabled={testing || (isHF && !config.apiKey && !config.apiKeyConfigured)} className="rounded-xl border border-purple-700 px-4 py-2 text-xs font-bold text-purple-200 disabled:opacity-40">{testing ? 'Testing…' : 'Test Connection'}</button>
        <button onClick={save} disabled={busy || (isHF && !config.apiKey && !config.apiKeyConfigured)} className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-40">{busy ? 'Saving…' : 'Save Image AI'}</button>
      </div>
      {status && <p role="status" className="rounded-xl border border-purple-500/30 bg-purple-950/30 p-3 text-xs text-slate-200">{status}</p>}
      {message && <p role="status" className="rounded-xl border border-purple-500/30 bg-purple-950/30 p-3 text-xs text-slate-200">{message}</p>}
      <p className="text-[11px] leading-relaxed text-amber-200/80">A valid token does not guarantee model availability or free usage. Hugging Face inference may be rate-limited, unavailable for a model, or require paid compute. Cloudflare usage is subject to your Cloudflare plan limits.</p>
    </div>
  </section>;
};
