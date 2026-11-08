import React from 'react';
import { Home, MessageSquare, Mic, Settings, History } from 'lucide-react';
import { ScreenType } from '../types';

interface BottomNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onOpenPro: () => void;
  variant?: 'primary' | 'extended';
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const items = [
    { id: 'dashboard' as ScreenType, label: 'Home', icon: Home },
    { id: 'chat' as ScreenType, label: 'Chat', icon: MessageSquare },
    { id: 'voice' as ScreenType, label: 'Voice', icon: Mic },
    { id: 'history' as ScreenType, label: 'History', icon: History },
    { id: 'settings' as ScreenType, label: 'Settings', icon: Settings },
  ];

  return (
    <nav aria-label="Main navigation" className="sayai-bottom-nav fixed inset-x-0 bottom-0 z-40 sm:hidden">
      <div className="sayai-bottom-nav-inner mx-auto flex w-full max-w-lg items-center justify-around px-2">
        {items.map(({ id, label, icon: Icon }) => {
          const active = currentScreen === id;
          return (
            <button
              key={id}
              type="button"
              aria-current={active ? 'page' : undefined}
              aria-label={label}
              onClick={() => onNavigate(id)}
              className={`sayai-nav-item group flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 transition-all duration-200 active:scale-95 ${active ? 'is-active' : ''}`}
            >
              <span className="sayai-nav-icon flex h-9 w-10 items-center justify-center rounded-xl transition-all duration-200">
                <Icon className="h-[21px] w-[21px]" strokeWidth={active ? 2.4 : 1.9} />
              </span>
              <span className="text-[10px] font-semibold tracking-wide">{label}</span>
              <span className="sayai-nav-indicator h-[3px] w-5 rounded-full" />
            </button>
          );
        })}
      </div>
    </nav>
  );
};
