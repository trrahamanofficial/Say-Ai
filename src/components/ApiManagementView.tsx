import React, { useState } from 'react';
import {
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Key,
  Database,
  Cloud,
  Cpu,
  Eye,
  EyeOff,
  Server
} from 'lucide-react';
import { AIProviderConfig, ScreenType } from '../types';

interface ApiManagementViewProps {
  onNavigate: (screen: ScreenType) => void;
  providers: AIProviderConfig[];
  onToggleProvider: (id: string) => void;
  onTestProvider: (id: string) => Promise<void>;
  onAddProvider: (provider: Omit<AIProviderConfig, 'id' | 'status'>) => void;
  isTestingId: string | null;
}

export const ApiManagementView: React.FC<ApiManagementViewProps> = ({
  onNavigate,
  providers,
  onToggleProvider,
  onTestProvider,
  onAddProvider,
  isTestingId
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});

  const [newProvider, setNewProvider] = useState({
    name: '',
    type: 'custom' as const,
    baseUrl: '',
    apiKey: '',
    model: '',
    isEnabled: true,
    isDefault: false
  });

  const toggleKeyReveal = (id: string) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvider.name || !newProvider.baseUrl) return;
    onAddProvider(newProvider);
    setShowAddModal(false);
    setNewProvider({
      name: '',
      type: 'custom',
      baseUrl: '',
      apiKey: '',
      model: '',
      isEnabled: true,
      isDefault: false
    });
  };

  return (
    <div className="sayai-api sayai-screen flex-1 max-w-4xl mx-auto w-full p-3 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-3xl p-5 bg-gradient-to-r from-purple-900/80 via-indigo-900/80 to-blue-950/80 border border-purple-500/30 overflow-hidden shadow-[0_0_25px_rgba(147,51,234,0.3)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">API &amp; Provider Management</h2>
              <p className="text-xs text-purple-200/80">Configure, benchmark, and toggle AI model providers and database connections</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Provider</span>
          </button>
        </div>
      </div>

      {/* Honest Status Callout */}
      <div className="rounded-2xl p-4 bg-[#0a0e2a]/90 border border-purple-900/40 flex items-start gap-3">
        <Server className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-slate-300 space-y-1">
          <p className="font-semibold text-white">Live Diagnostic Engine Active</p>
          <p className="text-slate-400">
            Provider connection latencies are measured through server-side ping verification. Private provider keys and service tokens are kept securely encrypted on the server.
          </p>
        </div>
      </div>

      {/* Providers List */}
      <div className="space-y-4">
        {providers.map((p) => {
          const isTesting = isTestingId === p.id;
          const isRevealed = Boolean(revealedKeys[p.id]);

          return (
            <div
              key={p.id}
              className={`rounded-2xl p-4 sm:p-5 bg-[#0c102f]/80 border transition-all ${
                p.isEnabled
                  ? 'border-purple-600/30 hover:border-purple-500/50 shadow-md'
                  : 'border-slate-800/60 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-900/20">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${
                    p.type === 'gemini'
                      ? 'bg-blue-600'
                      : p.type === 'cloudflare'
                      ? 'bg-amber-600'
                      : p.type === 'supabase'
                      ? 'bg-emerald-600'
                      : 'bg-purple-600'
                  }`}>
                    {p.type === 'supabase' ? <Database className="w-5 h-5" /> : <Cpu className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-white">{p.name}</h4>
                      {p.isDefault && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 font-semibold">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Model: {p.model} • {p.baseUrl}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {/* Status Badge */}
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    p.status === 'connected'
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/40'
                      : p.status === 'testing'
                      ? 'bg-yellow-950/60 text-yellow-300 border border-yellow-700/40'
                      : 'bg-red-950/60 text-red-300 border border-red-700/40'
                  }`}>
                    {p.status === 'connected' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : p.status === 'testing' ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-yellow-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                    )}
                    <span className="capitalize">{p.status}</span>
                    {p.pingMs ? <span className="font-mono text-[10px]">({p.pingMs}ms)</span> : null}
                  </div>

                  {/* Toggle Enable Switch */}
                  <button
                    onClick={() => onToggleProvider(p.id)}
                    aria-label={`Toggle ${p.name}`}
                    className={`w-11 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                      p.isEnabled ? 'bg-purple-600 justify-end' : 'bg-slate-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>
              </div>

              {/* Action row & masked key */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3">
                <div className="flex items-center gap-2 text-xs text-slate-400 w-full sm:w-auto">
                  <Key className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono text-[11px] bg-black/40 px-2 py-1 rounded-lg border border-purple-900/30">
                    {isRevealed
                      ? p.apiKey || 'Configured via Server Environment (.env)'
                      : p.apiKey
                      ? `${p.apiKey.slice(0, 4)}••••••••${p.apiKey.slice(-4)}`
                      : '•••••••••••••••• (Server Environment)'}
                  </span>
                  {p.apiKey && (
                    <button
                      onClick={() => toggleKeyReveal(p.id)}
                      className="p-1 hover:text-white transition-colors cursor-pointer"
                    >
                      {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                <button
                  onClick={() => onTestProvider(p.id)}
                  disabled={isTesting}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-700/30 text-purple-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Provider Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleAddSubmit}
            className="max-w-md w-full rounded-3xl bg-[#0c0f30] border border-purple-500/40 p-6 space-y-4 shadow-[0_0_40px_rgba(147,51,234,0.4)]"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Add Custom AI Provider</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-left">
              <div>
                <label className="text-xs text-slate-300 font-medium">Provider Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anthropic Claude"
                  value={newProvider.name}
                  onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#07091e] border border-purple-800/40 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">Base URL / Endpoint</label>
                <input
                  type="url"
                  required
                  placeholder="https://api.anthropic.com/v1"
                  value={newProvider.baseUrl}
                  onChange={(e) => setNewProvider({ ...newProvider, baseUrl: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#07091e] border border-purple-800/40 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">Model ID</label>
                <input
                  type="text"
                  placeholder="claude-3-5-sonnet"
                  value={newProvider.model}
                  onChange={(e) => setNewProvider({ ...newProvider, model: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#07091e] border border-purple-800/40 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">API Key (Encrypted server-side)</label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={newProvider.apiKey}
                  onChange={(e) => setNewProvider({ ...newProvider, apiKey: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#07091e] border border-purple-800/40 text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md cursor-pointer"
              >
                Save Provider
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
