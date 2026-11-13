import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  CheckCircle
} from 'lucide-react';
import { ScreenType, SystemHealth, UserProfile } from '../types';
import { supabase } from '../lib/supabase';

interface AdminViewProps {
  onNavigate: (screen: ScreenType) => void;
  systemHealth: SystemHealth;
  currentUser: UserProfile;
}

type LiveUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  joined_at: string;
  last_seen_at: string | null;
  is_active: boolean;
};

type LiveMetrics = {
  total_users: number;
  active_users: number;
  users: LiveUser[];
};

const compactCount = (value: number) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value || 0);

export const AdminView: React.FC<AdminViewProps> = ({
  onNavigate,
  systemHealth,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'logs'>('overview');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [metrics, setMetrics] = useState<LiveMetrics>({ total_users: 0, active_users: 0, users: [] });
  const [metricsError, setMetricsError] = useState('');

  useEffect(() => {
    if (!supabase || currentUser.role !== 'admin') return;
    let alive = true;
    const loadMetrics = async () => {
      const { data, error } = await supabase.rpc('say_ai_admin_user_metrics');
      if (!alive) return;
      if (error) {
        setMetricsError(error.message || 'Could not load live user statistics.');
        return;
      }
      setMetricsError('');
      setMetrics({
        total_users: Number(data?.total_users || 0),
        active_users: Number(data?.active_users || 0),
        users: Array.isArray(data?.users) ? data.users : []
      });
    };
    void loadMetrics();
    const timer = window.setInterval(() => { void loadMetrics(); }, 15000);
    return () => { alive = false; window.clearInterval(timer); };
  }, [currentUser.role]);

  const auditLogs = [
    { id: 'log-1', time: '12:19:42', event: 'Cloudflare Pages Functions healthcheck initiated', status: 'success', latency: '18ms' },
    { id: 'log-2', time: '12:18:10', event: 'Gemini 3.8 Flash model handshake verified', status: 'success', latency: '28ms' },
    { id: 'log-3', time: '12:15:02', event: 'Supabase RLS access check for users_profiles', status: 'success', latency: '35ms' },
    { id: 'log-4', time: '12:08:44', event: 'In-memory cache warmed for trending prompt assets', status: 'success', latency: '4ms' }
  ];

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-3 sm:p-6 space-y-6">
      <div className="relative rounded-3xl p-5 bg-gradient-to-r from-red-950/70 via-purple-950/80 to-[#0d092b] border border-red-500/30 overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.2)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-600/30 border border-red-400/40 flex items-center justify-center text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Private Admin Dashboard</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-bold uppercase">Super Admin</span>
              </div>
              <p className="text-xs text-red-200/80">Authorized access only. Monitor system health, accounts, and API gateways.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-purple-900/30 pb-2">
        <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'overview' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>System Overview</button>
        <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'users' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>User Accounts ({metrics.total_users})</button>
        <button onClick={() => setActiveTab('logs')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'logs' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Audit Logs</button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl p-4 bg-[#0a0e2a]/80 border border-purple-900/30">
              <span className="text-xs text-slate-400 font-medium">Active Users</span>
              <div className="text-2xl font-black text-white mt-1">{compactCount(metrics.active_users)}</div>
              <span className="text-[10px] text-emerald-400 font-semibold">Live · last 5 minutes</span>
            </div>
            <div className="rounded-2xl p-4 bg-[#0a0e2a]/80 border border-purple-900/30">
              <span className="text-xs text-slate-400 font-medium">Users</span>
              <div className="text-2xl font-black text-white mt-1">{compactCount(metrics.total_users)}</div>
              <span className="text-[10px] text-purple-300 font-semibold">Registered accounts</span>
            </div>
            <div className="rounded-2xl p-4 bg-[#0a0e2a]/80 border border-purple-900/30">
              <span className="text-xs text-slate-400 font-medium">Avg Edge Latency</span>
              <div className="text-2xl font-black text-cyan-400 mt-1">{systemHealth.latencyMs}ms</div>
              <span className="text-[10px] text-slate-400">Global Cloudflare</span>
            </div>
            <div className="rounded-2xl p-4 bg-[#0a0e2a]/80 border border-purple-900/30">
              <span className="text-xs text-slate-400 font-medium">Error Rate</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">0.02%</div>
              <span className="text-[10px] text-emerald-400 font-semibold">Healthy status</span>
            </div>
          </div>
          {metricsError && <p className="text-xs text-amber-300">{metricsError}</p>}
          <div className="rounded-2xl p-4 bg-[#0a0e2a]/80 border border-purple-900/30 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Maintenance Mode</h4>
              <p className="text-xs text-slate-400">When enabled, guest users see a scheduled maintenance notice.</p>
            </div>
            <button onClick={() => setMaintenanceMode(!maintenanceMode)} className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${maintenanceMode ? 'bg-red-600 justify-end' : 'bg-slate-700 justify-start'}`}>
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="rounded-2xl overflow-hidden bg-[#0a0e2a]/80 border border-purple-900/30">
          {metricsError && <p className="p-3 text-xs text-amber-300">{metricsError}</p>}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#07091e] text-slate-400 border-b border-purple-900/30">
                <tr><th className="p-3.5">User</th><th className="p-3.5">Role</th><th className="p-3.5">Plan</th><th className="p-3.5">Joined</th></tr>
              </thead>
              <tbody className="divide-y divide-purple-900/20 text-slate-200">
                {metrics.users.map((u) => (
                  <tr key={u.id} className="hover:bg-purple-950/20">
                    <td className="p-3.5 font-semibold text-white"><div>{u.name}</div><div className="text-[11px] text-slate-400 font-normal">{u.email}</div></td>
                    <td className="p-3.5"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-slate-800 text-slate-300'}`}>{u.role}</span></td>
                    <td className="p-3.5"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">{u.plan}</span></td>
                    <td className="p-3.5 text-slate-400">{u.joined_at ? new Date(u.joined_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
                {metrics.users.length === 0 && <tr><td colSpan={4} className="p-5 text-center text-slate-400">No registered users found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="rounded-2xl p-4 bg-[#0a0e2a]/80 border border-purple-900/30 space-y-2">
          {auditLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-[#07091e] border border-purple-900/20 text-xs font-mono">
              <div className="flex items-center gap-2.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /><span className="text-slate-400">{log.time}</span><span className="text-slate-200">{log.event}</span></div>
              <span className="text-cyan-400 font-semibold">{log.latency}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
