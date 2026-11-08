import React, { useState } from 'react';
import {
  Search,
  Bell,
  MessageSquare,
  Image as ImageIcon,
  Video,
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
    <div className="sayai-screen sayai-screen-dashboard flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* SAY AI Creative Studio */}
      <section className="sayai-studio relative overflow-hidden rounded-[28px] border border-cyan-300/20 bg-gradient-to-br from-[#10254a] via-[#111b3d] to-[#21143f] p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,116,220,.16)]">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-sky-400/15 blur-3xl"/>
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-violet-500/15 blur-3xl"/>
        <div className="relative mb-5 flex items-end justify-between gap-3"><div><div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.22em] text-cyan-300"><Sparkles className="h-4 w-4"/> Your creative studio</div><h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">What would you like to create?</h2><p className="mt-1.5 text-xs text-slate-300 sm:text-sm">Your AI tools, together in one place.</p></div><span className="hidden rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-cyan-100 sm:inline-flex">SAY AI STUDIO</span></div>
        <div className="relative grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {[
            {title:'AI Chat',detail:'Ask anything',icon:MessageSquare,target:'chat' as ScreenType,style:'from-blue-500/25 to-sky-500/5 border-sky-300/25'},
            {title:'AI Images',detail:'Create pictures',icon:ImageIcon,target:'image' as ScreenType,style:'from-violet-500/25 to-fuchsia-500/5 border-violet-300/25'},
            {title:'AI Video',detail:'Create video scenes',icon:Video,target:'video' as ScreenType,style:'from-cyan-500/25 to-blue-500/5 border-cyan-300/25'},
            {title:'Voice AI',detail:'Talk naturally',icon:Mic,target:'voice' as ScreenType,style:'from-teal-500/25 to-emerald-500/5 border-teal-300/25'}
          ].map(item=>{const Icon=item.icon;return <button key={item.title} onClick={()=>onNavigate(item.target)} className={`sayai-studio-tile group relative flex min-h-[132px] flex-col items-start justify-between rounded-2xl border bg-gradient-to-br ${item.style} p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:brightness-110 active:scale-[.97] sm:min-h-[148px] sm:p-5`}><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/10 transition-transform group-hover:scale-110"><Icon className="h-5 w-5"/></span><span><strong className="block text-sm font-bold text-white sm:text-base">{item.title}</strong><span className="mt-1 block text-[11px] text-slate-300 sm:text-xs">{item.detail}</span></span><ArrowRight className="absolute right-4 top-4 h-4 w-4 text-white/40 transition-all group-hover:translate-x-1 group-hover:text-white"/></button>;})}
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
              className="w-full h-full object-contain filter drop-shadow-[0_0_25px_rgba(168,85,247,0.8)] hover:scale-105 transition-transform duration-500"
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

      <button onClick={() => onNavigate('video')} className="group flex w-full items-center justify-between rounded-2xl border border-cyan-500/25 bg-gradient-to-r from-[#071e36]/95 to-[#10123a]/95 p-4 text-left shadow-lg transition-all hover:-translate-y-0.5 hover:border-cyan-400/60">
        <span className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-600/20 text-cyan-300"><Video className="h-5 w-5" /></span><span><strong className="block text-sm text-white">Create a Video</strong><span className="text-xs text-slate-400">Open video creation from your AI workspace</span></span></span><ArrowRight className="h-5 w-5 text-cyan-300" />
      </button>

      {/* Premium Creative Studio */}
      <section className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-[#101a3b] via-[#10132e] to-[#19103b] p-5 shadow-[0_18px_50px_rgba(20,80,180,.16)] sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-blue-500/15 blur-3xl"/>
        <div className="relative mb-4 flex items-center justify-between gap-3"><div><div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-cyan-300"><Sparkles className="h-4 w-4"/> Creative Studio</div><h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">What would you like to create?</h2><p className="mt-1 text-sm text-slate-400">Your AI tools, together in one place.</p></div><span className="hidden rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200 sm:inline-flex">SAY AI</span></div>
        <div className="relative grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {title:'AI Chat',detail:'Ask anything',icon:MessageSquare,target:'chat' as ScreenType,style:'from-blue-500/20 to-indigo-500/5 border-blue-400/25'},
            {title:'AI Images',detail:'Create pictures',icon:ImageIcon,target:'image' as ScreenType,style:'from-violet-500/20 to-fuchsia-500/5 border-violet-400/25'},
            {title:'AI Video',detail:'Make videos',icon:Video,target:'video' as ScreenType,style:'from-cyan-500/20 to-sky-500/5 border-cyan-400/25'},
            {title:'Voice AI',detail:'Speak naturally',icon:Mic,target:'voice' as ScreenType,style:'from-emerald-500/20 to-teal-500/5 border-emerald-400/25'}
          ].map(item=>{const Icon=item.icon;return <button key={item.title} onClick={()=>onNavigate(item.target)} className={`flex min-h-[132px] flex-col items-start justify-between rounded-2xl border bg-gradient-to-br ${item.style} p-4 text-left shadow-[inset_0_1px_rgba(255,255,255,.05)] transition duration-200 hover:-translate-y-1 hover:brightness-110 active:scale-[.97]`}><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-cyan-100"><Icon className="h-5 w-5"/></span><span><strong className="block text-sm font-bold text-white">{item.title}</strong><span className="mt-1 block text-xs text-slate-400">{item.detail}</span></span></button>;})}
        </div>
      </section>

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
