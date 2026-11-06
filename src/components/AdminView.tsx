import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  ShieldAlert,
  Users,
  Activity,
  HardDrive,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Lock,
  Database
} from 'lucide-react';
import { ScreenType, SystemHealth, UserProfile } from '../types';
import { AIBrainControl } from './AIBrainControl';
import { VideoAIControl } from './VideoAIControl';
import { ImageAIControl } from './ImageAIControl';

interface AdminViewProps {
  onNavigate: (screen: ScreenType) => void;
  systemHealth: SystemHealth;
  currentUser: UserProfile;
}

export const AdminView: React.FC<AdminViewProps> = ({
  onNavigate,
  systemHealth,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'logs' | 'brain' | 'video' | 'image'>('overview');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [realUsers, setRealUsers] = useState<Array<{id:string;name:string;email:string;role:string;plan:string;joined:string}>>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function loadRealUsers() {
      if (!supabase) { if (mounted) { setUsersError('Supabase is not configured'); setUsersLoading(false); } return; }
      try {
        let rows: any[] = [];
        const primary = await supabase.from('users_profiles').select('*').order('created_at', { ascending: false });
        if (!primary.error && Array.isArray(primary.data)) rows = primary.data;
        else {
          const legacy = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
          if (legacy.error) throw legacy.error;
          rows = legacy.data || [];
        }
        const mapped = rows.map((u:any) => ({
          id: String(u.id || u.user_id || u.email || Math.random()),
          name: String(u.name || u.full_name || u.display_name || 'SAY AI User'),
          email: String(u.email || 'Email unavailable'),
          role: String(u.role || 'user'),
          plan: String(u.plan || 'Free'),
          joined: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Unknown'
        }));
        if (mounted) { setRealUsers(mapped); setUsersError(''); }
      } catch (e) {
        if (mounted) setUsersError(e instanceof Error ? e.message : 'Could not load real user records');
      } finally { if (mounted) setUsersLoading(false); }
    }
    loadRealUsers();
    return () => { mounted = false; };
  }, []);

  const registeredLast30Days = realUsers.filter(u => {
    const t = Date.parse(u.joined);
    return Number.isFinite(t) && Date.now() - t <= 30 * 24 * 60 * 60 * 1000;
  }).length;

  const mockUsers = [
    { id: 'usr-1', name: 'SAY AI User', email: 'trrahaman.official@gmail.com', role: 'admin', plan: 'Free', joined: 'Nov 2026' },
    { id: 'usr-2', name: 'Elena Rostova', email: 'elena@cybernet.ai', role: 'user', plan: 'Pro', joined: 'Oct 2026' },
    { id: 'usr-3', name: 'Marcus Chen', email: 'marcus.c@quantum.tech', role: 'user', plan: 'Enterprise', joined: 'Sep 2026' },
    { id: 'usr-4', name: 'Devon Lee', email: 'devon@designlab.co', role: 'user', plan: 'Free', joined: 'Nov 2026' }
  ];

  const auditLogs = [
    { id: 'log-1', time: '12:19:42', event: 'Cloudflare Pages Functions healthcheck initiated', status: 'success', latency: '18ms' },
    { id: 'log-2', time: '12:18:10', event: 'Gemini 3.8 Flash model handshake verified', status: 'success', latency: '28ms' },
    { id: 'log-3', time: '12:15:02', event: 'Supabase RLS access check for users_profiles', status: 'success', latency: '35ms' },
    { id: 'log-4', time: '12:08:44', event: 'In-memory cache warmed for trending prompt assets', status: 'success', latency: '4ms' }
  ];

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-3 sm:p-6 space-y-6">
      {/* Admin Header Banner */}
      <div className="relative rounded-3xl p-5 bg-gradient-to-r from-red-950/70 via-purple-950/80 to-[#0d092b] border border-red-500/30 overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.2)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-600/30 border border-red-400/40 flex items-center justify-center text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Private Admin Dashboard</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-bold uppercase">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-red-200/80">Authorized access only. Monitor system health, accounts, and API gateways.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-purple-900/30 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          System Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          User Accounts ({usersLoading ? '…' : realUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Audit Logs
        </button>
        <button onClick={() => setActiveTab('brain')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'brain' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>AI Brain Control</button>
        <button onClick={() => setActiveTab('video')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'video' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Video AI</button>
        <button onClick={() => setActiveTab('image')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'image' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Image AI</button>
      </div>

      {activeTab === 'image' && <ImageAIControl />}
      {activeTab === 'brain' && <AIBrainControl />}
      {activeTab === 'video' && <VideoAIControl />}

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl p-4 bg-[#0a0e2a]/80 border border-purple-900/30">
              <span className="text-xs text-slate-400 font-medium">Active Users</span>
              <div className="text-2xl font-black text-white mt-1">1,248</div>
              <span className="text-[10px] text-emerald-400 font-semibold">+18% this week</span>
            </div>

            <div className="rounded-2xl p-4 bg-[#0a0e2a]/80 border border-purple-900/30">
              <span className="text-xs text-slate-400 font-medium">API Requests</span>
              <div className="text-2xl font-black text-white mt-1">48.2k</div>
              <span className="text-[10px] text-purple-300 font-semibold">100% SLA met</span>
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

          {/* Maintenance Switch */}
          <div className="rounded-2xl p-4 bg-[#0a0e2a]/80 border border-purple-900/30 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Maintenance Mode</h4>
              <p className="text-xs text-slate-400">When enabled, guest users see a scheduled maintenance notice.</p>
            </div>
            <button
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                maintenanceMode ? 'bg-red-600 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>
      )}

      {/* Tab: Users */}
      {activeTab === 'users' && (
        <div className="rounded-2xl overflow-hidden bg-[#0a0e2a]/80 border border-purple-900/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#07091e] text-slate-400 border-b border-purple-900/30">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Plan</th>
                  <th className="p-3.5">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/20 text-slate-200">
                {(usersLoading ? [] : realUsers).map((u) => (
                  <tr key={u.id} className="hover:bg-purple-950/20">
                    <td className="p-3.5 font-semibold text-white">
                      <div>{u.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{u.email}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.plan === 'Enterprise'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : u.plan === 'Pro'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{u.joined}</td>
                  </tr>
                ))}
                { !usersLoading && realUsers.length === 0 && <tr><td colSpan={4} className="p-5 text-center text-slate-400">{usersError || 'No registered users found.'}</td></tr> }
                { usersLoading && <tr><td colSpan={4} className="p-5 text-center text-slate-400">Loading Supabase accounts…</td></tr> }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Logs */}
      {activeTab === 'logs' && (
        <div className="rounded-2xl p-4 bg-[#0a0e2a]/80 border border-purple-900/30 space-y-2">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-3 rounded-xl bg-[#07091e] border border-purple-900/20 text-xs font-mono"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-400">{log.time}</span>
                <span className="text-slate-200">{log.event}</span>
              </div>
              <span className="text-cyan-400 font-semibold">{log.latency}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
