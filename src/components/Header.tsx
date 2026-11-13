import React from 'react';
import { Menu, Bell, Download, Smartphone, Monitor } from 'lucide-react';
import { SayAiLogo } from './Logo';
import { ScreenType } from '../types';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  onOpenNotifications: () => void;
  onOpenPro: () => void;
  onOpenMobileMenu?: () => void;
  onDownloadProjectZip: () => void;
  unreadCount?: number;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  isMobileFrame,
  onToggleMobileFrame,
  onOpenNotifications,
  onOpenPro,
  onOpenMobileMenu,
  onDownloadProjectZip,
  unreadCount = 2,
  userName = 'Guest User'
}) => {
  return (
    <header className="sticky top-0 z-[100] w-full shrink-0 bg-[#050614]/95 backdrop-blur-xl border-b border-purple-900/30 px-3 sm:px-6 pt-3 pb-2.5 transition-all lg:hidden">
      <div className="flex items-center justify-between gap-2">
        {/* Mobile Left: Menu + Logo */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMobileMenu}
            aria-label="Open Navigation Menu"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-purple-950/40 border border-purple-800/20 active:scale-95 transition-all cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-1.5 text-left cursor-pointer"
          >
            <SayAiLogo size="sm" showSubtitle={true} />
          </button>
        </div>

        {/* Mobile Right: Pro + Notifications + Avatar */}
        <div className="flex items-center gap-2">
          {/* Golden Pro Button matching Image 1/2/3/4 */}
          <button
            onClick={onOpenPro}
            aria-label="Upgrade to Pro"
            className="px-3 py-1 rounded-full bg-gradient-to-b from-amber-400 via-amber-500 to-yellow-600 text-black font-extrabold text-xs shadow-[0_0_12px_rgba(245,158,11,0.5)] active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>👑</span>
            <span>Pro</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            aria-label="Notifications"
            className="relative p-1.5 rounded-xl text-slate-300 hover:text-white cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Avatar */}
          <button
            onClick={() => onNavigate('profile')}
            aria-label="User Profile"
            className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs border border-blue-400/40 cursor-pointer"
          >
            {(userName.trim()[0] || 'G').toUpperCase()}
          </button>
        </div>
      </div>
    </header>
  );
};
