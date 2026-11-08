import React, { useState } from 'react';
import {
  Search,
  Bell,
  MessageSquare,
  Image as ImageIcon,
  Mic,
  ArrowRight,
  CheckCircle2,
  Zap,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { ScreenType, UserProfile, SystemHealth } from '../types';

interface DashboardViewProps {
  onNavigate: (screen: ScreenType) => void;
  onOpenNotifications: () => void;
  onOpenPro: () => void;
  userProfile: UserProfile;
  systemHealth: SystemHealth;
  onSearch?: (query: string) => void;
  isMobileFrame?: boolean;
  onToggleMobileFrame?: () => void;
  onDownloadProjectZip?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNotifications,
  onOpenPro,
  userProfile,
  systemHealth,
  onSearch,
  isMobileFrame,
  onToggleMobileFrame,
  onDownloadProjectZip
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('chat');
    }
  };

  const recentChats = [
    {
      id: '1',
      title: 'AI Assistant',
      message: 'Hello! How can I help you today?',
      timeAgo: '2m ago',
      iconBg: 'bg-purple-600',
      icon: MessageSquare,
      target: 'chat' as ScreenType
    },
    {
      id: '2',
      title: 'Image Generator',
      message: 'A beautiful sunset...',
      timeAgo: '15m ago',
      iconBg: 'bg-fuchsia-600',
      icon: ImageIcon,
      target: 'image' as ScreenType
    },
    {
      id: '3',
      title: 'Voice Assistant',
      message: 'Listening...',
      timeAgo: '1h ago',
      iconBg: 'bg-emerald-500',
      icon: Mic,
      target: 'voice' as ScreenType
    },
    {
      id: '4',
      title: 'SAY AI',
      message: 'Always here for you!',
      timeAgo: '2h ago',
      iconBg: 'bg-blue-600',
      icon: MessageSquare,
      target: 'chat' as ScreenType
    },
  ];

  return (
    <div className="sayai-dashboard flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[.24em] text-cyan-300/80">Your personal AI workspace</p>
          <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Good to see you, {userProfile.name.split(' ')[0]}</h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">Everything you need, in one intelligent space.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto rounded-2xl border border-cyan-300/15 bg-[#0b2032]/80 px-3 py-2">
          <span className={`h-2 w-2 rounded-full ${systemHealth.backend ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.8)]' : 'bg-amber-400'}`} />
          <span className="text-[11px] font-semibold text-slate-200">{systemHealth.backend ? 'Workspace ready' : 'Connection check'}</span>
          <span className="mx-1 h-4 w-px bg-white/10" />
          <span className="text-[11px] text-cyan-200">{systemHealth.activeApis} AI services</span>
        </div>
      </section>
      {/* Top Search Bar & Notification Header matching Image 5 (Desktop) */}
      <div className="hidden lg:flex items-center justify-between gap-4">
        {/* Search input with magnifying glass */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anything..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#0c102a]/80 text-white placeholder-slate-400 border border-purple-900/30 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm transition-all shadow-inner"
          />
        </form>

        {/* Right profile / notification row in desktop header */}
        <div className="flex items-center gap-3">

          <button
            onClick={onOpenNotifications}
            aria-label="View notifications"
            className="relative p-2.5 rounded-xl bg-[#0c102a]/80 border border-purple-900/30 text-slate-300 hover:text-white hover:border-purple-500/50 transition-all cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#050614]">
              2
            </span>
          </button>

          <button
            onClick={() => onNavigate('profile')}
            aria-label="Profile"
            className="relative w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-base shadow-[0_0_12px_rgba(59,130,246,0.5)] border border-blue-400/40 cursor-pointer hover:scale-105 active:scale-95 transition-all"
          >
            <span>T</span>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0c102a]" />
          </button>
        </div>
      </div>

      {/* Hero Banner: "Welcome to SAY AI" matching Image 5 */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 lg:p-10 bg-gradient-to-r from-[#0c0d2b] via-[#151240] to-[#120d33] border border-purple-500/30 shadow-[0_0_35px_rgba(139,92,246,0.15)]">
        {/* Background glow sweeps */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-40 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-left space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              <span>Welcome to </span>
              <br className="hidden sm:inline" />
              <span className="text-white">SAY </span>
              <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(192,132,252,0.6)]">
                AI
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base font-normal max-w-lg leading-relaxed">
              Your Smart AI Assistant for Chat, Image &amp; Voice Experience
            </p>

            <button
              onClick={() => onNavigate('chat')}
              className="mt-2 inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm tracking-wide shadow-[0_0_20px_rgba(147,51,234,0.5)] active:scale-95 transition-all cursor-pointer"
            >
              <span>Start Chat</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Glowing neon brain in orbital ring graphic matching Image 5 */}
          <div className="relative flex-shrink-0 w-64 h-52 sm:w-80 sm:h-64 flex items-center justify-center">
            <img
              src="/assets/extracted/brain-orb.png"
              alt="SAY AI Neon Brain Orb"
              className="sayai-brain-orbit w-full h-full object-contain filter drop-shadow-[0_0_25px_rgba(0,190,255,0.65)]"
              onError={(e) => {
                // High-fidelity fallback SVG if asset file is missing
                const target = e.currentTarget;
                target.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {/* 3 Action Cards Grid matching Image 5 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: AI Chat */}
        <div
          onClick={() => onNavigate('chat')}
          className="group relative rounded-2xl p-5 bg-gradient-to-b from-[#0c1236]/90 to-[#080d28]/90 border border-blue-500/25 hover:border-blue-400/50 transition-all duration-300 shadow-lg cursor-pointer hover:-translate-y-1"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-blue-600/90 flex items-center justify-center text-white shadow-[0_0_15px_rgba(59,130,246,0.6)]">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-blue-500 transition-all shadow-md">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-bold text-white tracking-wide">AI Chat</h3>
            <p className="text-xs text-slate-300/80 mt-1">Talk with the most advanced AI</p>
          </div>
        </div>

        {/* Card 2: Image Generator */}
        <div
          onClick={() => onNavigate('image')}
          className="group relative rounded-2xl p-5 bg-gradient-to-b from-[#180f38]/90 to-[#0e0a2b]/90 border border-purple-500/25 hover:border-purple-400/50 transition-all duration-300 shadow-lg cursor-pointer hover:-translate-y-1"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-purple-600/90 flex items-center justify-center text-white shadow-[0_0_15px_rgba(168,85,247,0.6)]">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-purple-500 transition-all shadow-md">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-bold text-white tracking-wide">Image Generator</h3>
            <p className="text-xs text-purple-200/80 mt-1">Create stunning images with AI</p>
          </div>
        </div>

        {/* Card 3: Voice Assistant */}
        <div
          onClick={() => onNavigate('voice')}
          className="group relative rounded-2xl p-5 bg-gradient-to-b from-[#0a1e28]/90 to-[#06141d]/90 border border-teal-500/25 hover:border-teal-400/50 transition-all duration-300 shadow-lg cursor-pointer hover:-translate-y-1"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-teal-600/90 flex items-center justify-center text-white shadow-[0_0_15px_rgba(20,184,166,0.6)]">
              <Mic className="w-6 h-6" />
            </div>
            <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-teal-500 transition-all shadow-md">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-bold text-white tracking-wide">Voice Assistant</h3>
            <p className="text-xs text-teal-200/80 mt-1">Speak, listen &amp; get smart replies</p>
          </div>
        </div>
      </div>

      {/* Middle Row: Recent Chats (Left) & Usage Stats + System Status (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Recent Chats */}
        <div className="lg:col-span-7 rounded-2xl p-5 bg-[#0a0e2a]/80 border border-purple-900/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/20 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-600/30 flex items-center justify-center text-purple-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Recent Chats</h3>
              </div>
              <button
                onClick={() => onNavigate('history')}
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentChats.map((chat) => {
                const Icon = chat.icon;
                return (
                  <div
                    key={chat.id}
                    onClick={() => onNavigate(chat.target)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0e1338]/60 hover:bg-[#141b4d]/80 border border-purple-900/20 hover:border-purple-600/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${chat.iconBg} flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                          {chat.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-1">{chat.message}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 flex-shrink-0 font-medium">
                      {chat.timeAgo}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Usage Stats & System Status */}
        <div className="lg:col-span-5 space-y-4">
          {/* Your Usage Stats Card */}
          <div className="rounded-2xl p-5 bg-[#0a0e2a]/80 border border-purple-900/30">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Your Usage Stats</h3>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Stat 1: 92% Chat Used */}
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.1)" strokeWidth="4.5" fill="none" />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke="#10b981"
                      strokeWidth="4.5"
                      strokeDasharray={163.36}
                      strokeDashoffset={163.36 * (1 - 0.92)}
                      strokeLinecap="round"
                      fill="none"
                      className="filter drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-white">92%</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-2 font-medium">Chat</span>
                <span className="text-[10px] text-slate-400">Used</span>
              </div>

              {/* Stat 2: 75% Images Used */}
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.1)" strokeWidth="4.5" fill="none" />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke="#c084fc"
                      strokeWidth="4.5"
                      strokeDasharray={163.36}
                      strokeDashoffset={163.36 * (1 - 0.75)}
                      strokeLinecap="round"
                      fill="none"
                      className="filter drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-white">75%</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-2 font-medium">Images</span>
                <span className="text-[10px] text-slate-400">Used</span>
              </div>

              {/* Stat 3: 60% Voice Used */}
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.1)" strokeWidth="4.5" fill="none" />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke="#38bdf8"
                      strokeWidth="4.5"
                      strokeDasharray={163.36}
                      strokeDashoffset={163.36 * (1 - 0.60)}
                      strokeLinecap="round"
                      fill="none"
                      className="filter drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-white">60%</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-2 font-medium">Voice</span>
                <span className="text-[10px] text-slate-400">Used</span>
              </div>
            </div>
          </div>

          {/* System Status Card matching Image 5 */}
          <div className="rounded-2xl p-4 sm:p-5 bg-[#0a0e2a]/80 border border-purple-900/30 flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                <span className="text-sm font-bold text-white">System Status</span>
                <span className="text-[11px] font-semibold text-emerald-400">
                  • All Systems Online
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-300">Backend:</span>
                  <span className="text-emerald-400 font-medium">Connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-300">Edge Server:</span>
                  <span className="text-emerald-400 font-medium">Connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-300">Database:</span>
                  <span className="text-emerald-400 font-medium">Connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-300">APIs:</span>
                  <span className="text-emerald-400 font-medium">{systemHealth.activeApis} Active</span>
                </div>
              </div>
            </div>

            {/* 3D Glowing Server Stack Graphic */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 flex items-center justify-center">
              <img
                src="/assets/extracted/server-stack.png"
                alt="SAY AI Server Stack"
                className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(56,189,248,0.7)]"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Promo Banner matching Image 5 */}
      <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-purple-950/70 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            <Zap className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <div className="text-left">
            <h4 className="text-sm sm:text-base font-bold text-white tracking-wide">
              SAY AI – Smart • Fast • Free
            </h4>
            <p className="text-xs text-purple-200/80">
              Explore the Power of AI with SAY AI 🚀
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('chat')}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(168,85,247,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
