import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
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

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  return (
    <main className="sayai-dashboard flex-1 w-full max-w-7xl mx-auto p-3 sm:p-6 lg:p-8">
      <section className="sayai-hero relative isolate overflow-hidden rounded-[2rem] border border-cyan-200/15 bg-[linear-gradient(135deg,#092d3a_0%,#102b4b_52%,#17234d_100%)] p-5 sm:p-7 lg:p-9 shadow-[0_18px_55px_rgba(0,0,0,.24)]">
        <div className="sayai-hero-glow sayai-hero-glow-one" aria-hidden="true" />
        <div className="sayai-hero-glow sayai-hero-glow-two" aria-hidden="true" />
        <div className="relative z-10 sayai-hero-copy min-w-0 text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-100/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[.2em] text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" /> Your AI, all in one place
          </span>
          <h1 className="mt-4 text-[1.65rem] sm:text-3xl lg:text-[2.5rem] font-extrabold tracking-tight leading-[1.12]">
            <span className="text-white">Welcome to </span>
            <span className="bg-gradient-to-r from-cyan-200 via-sky-300 to-violet-300 bg-clip-text text-transparent">SAY AI</span>
          </h1>
          <p className="mt-3 max-w-md text-sm sm:text-base text-slate-200/85 leading-relaxed">
            Chat, create images and use voice — all with one smart assistant.
          </p>
          <button
            onClick={() => onNavigate('chat')}
            className="sayai-hero-cta mt-5 inline-flex items-center gap-2.5 rounded-xl border border-white/15 bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(14,165,233,.24)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(14,165,233,.38)] active:scale-[.98] cursor-pointer"
          >
            <span>Start Chat</span><ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </main>
  );
};
