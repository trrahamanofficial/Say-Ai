import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Provider = 'cloudflare' | 'huggingface';
type Config = { provider: Provider; model: string; apiKey: string; apiKeyConfigured?: boolean; enabled: boolean };
const defaults: Config = { provider: 'cloudflare', model: '@cf/black-forest-labs/flux-1-schnell', apiKey: '', enabled: true };
const cloudflareModel = '@cf/black-forest-labs/flux-1-schnell';
const huggingFaceModel = 'black-forest-labs/FLUX.1-schnell';
// Android WebView runs on localhost; use the live Cloudflare Pages API origin.
const API_BASE = 'https://say-ai.pages.dev';

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
        const response = await fetch(API_BASE + '/api/admin/image-config', { headers: { Authorization: 'Bearer ' + token } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load image settings.');
        setConfig({ ...defaults, ...data, apiKey: '' });
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Could not load image settings.');
      }
    })();
  }, []);

  const chooseBuiltIn = () => {
    setConfig(v => ({ ...v, provider: 'cloudflare', model: cloudflareModel }));
    setStatus('');
    setMessage('');
  };

  const chooseOwnKey = () => {
    setConfig(v => ({ ...v, provider: 'huggingface', model: v.provider === 'huggingface' ? v.model : huggingFaceModel }));
    setStatus('');
    setMessage('');
  };

  const save = async () => {
    setBusy(true);
    setMessage('');
    try {
      const token = await getToken();
      const response = await fetch(API_BASE + '/api/admin/image-config', {
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Save failed.');
      setConfig(v => ({ ...v, apiKey: '', apiKeyConfigured: data.apiKeyConfigured ?? v.apiKeyConfigured }));
      setMessage('Image AI settings saved securely.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Save failed.');
    } finally {
      setBusy(false);
    }
  };

  const test = async () => {
    setTesting(true);
    setStatus(config.provider === 'huggingface' ? 'Checking Hugging Face token…' : 'Checking built-in Cloudflare AI setup…');
    setMessage('');
    try {
      const token = await getToken();
      const response = await fetch(API_BASE + '/api/admin/image-config', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: config.provider, apiKey: config.apiKey })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Connection test failed.');
      setStatus(config.provider === 'huggingface'
        ? 'Hugging Face token authenticated. This does not guarantee that the selected image model is available or has free compute.'
        : 'Built-in Cloudflare AI is selected. Actual image generation has not been test-run.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Connection test failed.');
    } finally {
      setTesting(false);
    }
  };

  const ownKey = config.provider === 'huggingface';

  return <section className="space-y-4">
    <div className="rounded-2xl border border-purple-500/30 bg-[#0b1030] p-4">
      <h3 className="text-lg font-bold text-white">Image AI Management</h3>
      <p className="mt-1 text-xs text-slate-400">Choose one of the two image-generation options. These settings are private to the admin dashboard.</p>
    </div>

    <div className="rounded-2xl border border-purple-900/40 bg-[#0a0e2a] p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="font-bold text-white">Image generation</h4>
          <p className="text-xs text-slate-400">{config.enabled ? 'Image generation is enabled' : 'Image generation is disabled'}</p>
        </div>
        <button onClick={() => setConfig(v => ({ ...v, enabled: !v.enabled }))} className={'rounded-full px-3 py-2 text-xs font-bold ' + (config.enabled ? 'bg-emerald-700 text-white' : 'bg-slate-700 text-slate-200')}>{config.enabled ? 'Enabled' : 'Disabled'}</button>
      </div>

      <button type="button" onClick={chooseBuiltIn} aria-pressed={!ownKey} className={'w-full rounded-2xl border p-4 text-left transition ' + (!ownKey ? 'border-purple-400 bg-purple-950/50' : 'border-purple-900/50 bg-[#050614]')}>
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-700 text-lg font-bold text-white">1</span>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-white">Built-in Image AI</h4>
            <p className="text-xs text-slate-300">SAY AI নিজেই Cloudflare FLUX দিয়ে ছবি তৈরি করবে—কোনো API Key লাগবে না।</p>
          </div>
          <span className="text-sm font-bold text-purple-200">{!ownKey ? '✓ Selected' : 'Select'}</span>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">Model: {cloudflareModel}</p>
      </button>

      <button type="button" onClick={chooseOwnKey} aria-pressed={ownKey} className={'w-full rounded-2xl border p-4 text-left transition ' + (ownKey ? 'border-purple-400 bg-purple-950/50' : 'border-purple-900/50 bg-[#050614]')}>
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-700 text-lg font-bold text-white">2</span>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-white">Add Your Own API Key</h4>
            <p className="text-xs text-slate-300">নিজের Hugging Face Token ও Image Model ID যোগ করে ছবি তৈরি করুন।</p>
          </div>
          <span className="text-sm font-bold text-purple-200">{ownKey ? '✓ Selected' : 'Select'}</span>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">Provider: Hugging Face Inference API</p>
      </button>

      {ownKey && <div className="space-y-3 rounded-xl border border-purple-900/50 bg-[#050614] p-3">
        <label className="block text-xs text-slate-300">Image Model ID
          <input value={config.model} onChange={e => setConfig(v => ({ ...v, model: e.target.value }))} placeholder="e.g. black-forest-labs/FLUX.1-schnell" className="mt-1 w-full rounded-xl border border-purple-900 bg-[#0a0e2a] p-3 text-white" />
        </label>
        <label className="block text-xs text-slate-300">Hugging Face API Token
          <input type="password" autoComplete="off" value={config.apiKey} onChange={e => setConfig(v => ({ ...v, apiKey: e.target.value }))} placeholder={config.apiKeyConfigured ? 'Saved token — paste only to replace' : 'Paste your hf_ token here'} className="mt-1 w-full rounded-xl border border-purple-900 bg-[#0a0e2a] p-3 text-white" />
        </label>
        <p className="text-[11px] text-slate-400">{config.apiKeyConfigured ? 'A token is already saved securely. Leave the field empty to keep it.' : 'Your token will be stored securely on the server and will not be shown again.'}</p>
      </div>}

      <div className="flex flex-wrap gap-2 pt-1">
        <button onClick={test} disabled={testing || (ownKey && !config.apiKey && !config.apiKeyConfigured)} className="rounded-xl border border-purple-700 px-4 py-2 text-xs font-bold text-purple-200 disabled:opacity-40">{testing ? 'Testing…' : ownKey ? 'Test API Token' : 'Check Built-in AI'}</button>
        <button onClick={save} disabled={busy || (ownKey && !config.apiKey && !config.apiKeyConfigured)} className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-40">{busy ? 'Saving…' : 'Save Image AI Settings'}</button>
      </div>
      {status && <p role="status" className="rounded-xl border border-purple-500/30 bg-purple-950/30 p-3 text-xs text-slate-200">{status}</p>}
      {message && <p role="status" className="rounded-xl border border-purple-500/30 bg-purple-950/30 p-3 text-xs text-slate-200">{message}</p>}
      <p className="text-[11px] leading-relaxed text-amber-200/80">Hugging Face token verification does not guarantee model availability or free compute. Provider limits and charges may apply. Built-in Cloudflare usage is subject to Cloudflare plan limits.</p>
    </div>
  </section>;
};
