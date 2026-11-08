import React from 'react';
import { Bell, Sparkles, Crown, X, Check } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
  unreadCount: number;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onClear,
  unreadCount
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'notif-1',
      title: 'Welcome to SAY AI Universe! 🚀',
      time: '10m ago',
      message: 'Your personal AI assistant is ready. Ask questions, generate visuals, or speak commands effortlessly.',
      icon: Sparkles,
      iconColor: 'text-purple-400 bg-purple-950/60'
    },
    {
      id: 'notif-2',
      title: 'New Neural Models Connected 👑',
      time: '1h ago',
      message: 'Gemini 3.8 Flash, Cloudflare Workers AI, and Supabase integration are active and ready.',
      icon: Crown,
      iconColor: 'text-amber-400 bg-amber-950/60'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl bg-[#0c0f30] border border-purple-500/40 p-5 space-y-4 shadow-[0_0_40px_rgba(147,51,234,0.4)]">
        <div className="flex items-center justify-between pb-2 border-b border-purple-900/30">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-300" />
            <h3 className="text-base font-bold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white font-bold">
                {unreadCount} new
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                className="p-3.5 rounded-2xl bg-[#07091e] border border-purple-900/30 flex items-start gap-3"
              >
                <div className={`w-9 h-9 rounded-xl ${n.iconColor} flex items-center justify-center flex-shrink-0 border border-purple-800/30`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{n.title}</h4>
                    <span className="text-[10px] text-slate-500">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClear}
            className="flex-1 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-purple-700/30 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark All as Read</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
