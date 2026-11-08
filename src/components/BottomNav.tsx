import React from 'react';
import { Home, MessageSquare, Mic, Settings, History } from 'lucide-react';
import { ScreenType } from '../types';

interface BottomNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onOpenPro: () => void;
  variant?: 'primary' | 'extended';
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  onOpenPro,
  variant = 'primary'
}) => {
  // Primary items matching Images 1, 2, 3
  const primaryItems = [
    { id: 'dashboard' as ScreenType, label: 'Home', icon: Home },
    { id: 'chat' as ScreenType, label: 'Chat', icon: MessageSquare },
    { id: 'voice' as ScreenType, label: 'Voice', icon: Mic },
    { id: 'history' as ScreenType, label: 'History', icon: History },
    { id: 'settings' as ScreenType, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="sayai-bottom-nav fixed bottom-0 left-0 right-0 z-40 bg-[#07091e]/95 backdrop-blur-2xl border-t border-cyan-400/20 px-2 pt-2 sm:hidden transition-all shadow-[0_-5px_25px_rgba(5,6,20,0.8)]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          const isSpecialGlow = item.id === 'image' || item.id === 'voice';

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center justify-center relative py-1 px-3 min-w-[56px] text-center select-none active:scale-95 transition-all cursor-pointer group"
            >
              {/* Highlight background pill for active or special item */}
              {isActive && isSpecialGlow ? (
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-indigo-600 flex items-center justify-center shadow-[0_0_18px_rgba(168,85,247,0.7)] border border-purple-300/40 -mt-2">
                  <Icon className="w-5 h-5 text-white" />
                </div>
              ) : (
                <div className={`p-1.5 rounded-full transition-all ${
                  isActive
                    ? 'text-white bg-purple-600/30 shadow-[0_0_14px_rgba(168,85,247,0.5)]'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
              )}

              <span className={`text-[11px] font-medium tracking-tight mt-0.5 ${
                isActive ? 'text-purple-300 font-semibold' : 'text-slate-400'
              }`}>
                {item.label}
              </span>

              {/* Active neon indicator bar */}
              {isActive && (
                <span className="w-6 h-0.5 bg-gradient-to-r from-purple-400 to-fuchsia-400 rounded-full mt-0.5 shadow-[0_0_8px_rgba(192,132,252,0.9)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
