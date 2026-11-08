import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Image as ImageIcon,
  Mic,
  Sliders,
  History,
  Settings,
  User,
  Crown,
  LogOut,
  Video,
  ArrowRight,
  Sparkles,
  Download
} from 'lucide-react';
import { SayAiLogo } from './Logo';
import { ScreenType } from '../types';

interface SidebarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onOpenPro: () => void;
  onLogout: () => void;
  onDownloadProjectZip: () => void;
  className?: string;
  onCloseMobileDrawer?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  onOpenPro,
  onLogout,
  onDownloadProjectZip,
  className = '',
  onCloseMobileDrawer
}) => {
  const navItems = [
    { id: 'dashboard' as ScreenType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat' as ScreenType, label: 'AI Chat', icon: MessageSquare },
    { id: 'image' as ScreenType, label: 'Image Generator', icon: ImageIcon },
    { id: 'video' as ScreenType, label: 'Video Generator', icon: Video },
    { id: 'voice' as ScreenType, label: 'Voice Assistant', icon: Mic },
    { id: 'history' as ScreenType, label: 'Chat History', icon: History },
    { id: 'settings' as ScreenType, label: 'Settings', icon: Settings },
    { id: 'profile' as ScreenType, label: 'Profile', icon: User },
  ];

  const handleSelect = (id: ScreenType) => {
    onNavigate(id);
    if (onCloseMobileDrawer) onCloseMobileDrawer();
  };

  return (
    <aside className={`w-64 flex-shrink-0 flex flex-col justify-between bg-[#07091e]/90 border-r border-purple-900/30 p-4 select-none ${className}`}>
      {/* Brand Logo Header */}
      <div>
        <div className="pt-2 pb-6 px-2 border-b border-purple-900/20 mb-4">
          <button
            onClick={() => handleSelect('dashboard')}
            className="flex items-center text-left w-full cursor-pointer hover:opacity-95 transition-opacity"
          >
            <SayAiLogo size="md" showSubtitle={true} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)] border border-purple-400/40 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-purple-950/30 hover:border hover:border-purple-800/30'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-300'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Logout button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Bottom Pro Card & Project ZIP */}
      <div className="pt-4 space-y-3">
        {/* Pro Card matching Image 5 */}
        <div className="relative rounded-2xl p-4 bg-gradient-to-b from-purple-950/60 to-indigo-950/80 border border-purple-500/30 overflow-hidden shadow-[0_0_25px_rgba(147,51,234,0.2)]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">👑</span>
            <div className="text-sm font-bold text-white tracking-wide">
              SAY AI <span className="text-amber-400">Pro</span>
            </div>
          </div>
          <p className="text-xs text-purple-200/80 mb-3">Unlock More Power</p>
          
          <button
            onClick={onOpenPro}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wide shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <span>Upgrade Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Footer info matching photo */}
        <div className="text-center text-[11px] text-slate-500 leading-tight pt-2">
          <p>Version 1.0.0</p>
          <p>© 2026 SAY AI. All rights reserved.</p>
        </div>
      </div>
    </aside>
  );
};
