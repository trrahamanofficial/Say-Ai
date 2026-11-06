import React, { useState } from 'react';
import {
  ArrowLeft,
  Moon,
  Sun,
  User,
  UserPlus,
  LogOut,
  Info,
  Headphones,
  Shield,
  FileText,
  ChevronRight,
  Sliders
} from 'lucide-react';
import { SayAiLogo } from './Logo';
import { ScreenType, UserProfile } from '../types';

interface SettingsViewProps {
  onNavigate: (screen: ScreenType) => void;
  onOpenPro: () => void;
  onLogout: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onNavigate,
  onOpenPro,
  onLogout,
  userProfile,
  onUpdateProfile
}) => {
  const [darkMode, setDarkMode] = useState(userProfile.appearance.theme === 'dark');
  const [brightness, setBrightness] = useState(userProfile.appearance.brightness);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleToggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    onUpdateProfile({
      appearance: {
        theme: next ? 'dark' : 'light',
        brightness
      }
    });
  };

  const handleBrightnessChange = (val: number) => {
    setBrightness(val);
    onUpdateProfile({
      appearance: {
        theme: darkMode ? 'dark' : 'light',
        brightness: val
      }
    });
  };

  return (
    <div className="flex-1 max-w-xl mx-auto w-full p-3 sm:p-6 space-y-5">

      <div className="flex items-center gap-3 pb-3 border-b border-purple-900/20">
        <button
          onClick={() => onNavigate('dashboard')}
          aria-label="Back to dashboard"
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-purple-950/40 border border-purple-800/20 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <SayAiLogo size="sm" showSubtitle={false} />
          <h2 className="text-xl font-bold text-white tracking-tight">Settings</h2>
        </div>
      </div>

      <div className="relative rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-[#0e123b] to-[#1a1147] border border-purple-500/30 flex items-center justify-between shadow-[0_0_25px_rgba(147,51,234,0.2)]">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 to-purple-600 flex-shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <img
              src="/assets/extracted/user-avatar.png"
              alt="SAY AI User"
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
              }}
            />
          </div>

          <div className="text-left">
            <h3 className="text-base font-bold text-white tracking-wide">
              {userProfile.name}
            </h3>
            <p className="text-xs text-purple-200/80">
              {userProfile.plan} Plan
            </p>
          </div>
        </div>

        <button
          onClick={onOpenPro}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wide shadow-[0_0_15px_rgba(168,85,247,0.5)] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span className="text-sm">👑</span>
          <span>Upgrade</span>
        </button>
      </div>

      <div className="rounded-2xl p-4 bg-[#0a0e2a]/80 border border-purple-900/30 space-y-4">
        <div className="flex items-center gap-2 text-slate-300 text-sm font-bold pb-2 border-b border-purple-900/20">
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>Appearance</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-700/30 flex items-center justify-center text-cyan-400">
              <Moon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-white">Dark Mode</span>
          </div>

          <button
            onClick={handleToggleDark}
            aria-label="Toggle dark mode"
            className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
              darkMode ? 'bg-purple-600 justify-end shadow-[0_0_10px_rgba(168,85,247,0.7)]' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-700/30 flex items-center justify-center text-amber-400">
              <Sun className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-white">Light Mode</span>
          </div>

          <button
            onClick={handleToggleDark}
            aria-label="Toggle light mode"
            className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
              !darkMode ? 'bg-purple-600 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-700/30 flex items-center justify-center text-purple-300">
                <Sun className="w-4 h-4" />
              </div>
              <span>Brightness</span>
            </div>
            <span className="text-purple-300 font-bold">{brightness}%</span>
          </div>

          <input
            type="range"
            min="20"
            max="100"
            value={brightness}
            onChange={(e) => handleBrightnessChange(Number(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>
      </div>

      <div className="rounded-2xl p-4 bg-[#0a0e2a]/80 border border-purple-900/30 space-y-2">
        <div className="flex items-center gap-2 text-slate-300 text-sm font-bold pb-2 border-b border-purple-900/20">
          <User className="w-4 h-4 text-purple-400" />
          <span>Account</span>
        </div>

        <button
          onClick={() => setActiveModal('login')}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-purple-950/30 transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <UserPlus className="w-4 h-4 text-purple-300" />
            <span className="text-sm text-white font-medium">Login / Sign Up</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-red-950/20 transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400 font-medium">Logout</span>
          </div>
          <ChevronRight className="w-4 h-4 text-red-500/70" />
        </button>
      </div>

      <div className="rounded-2xl p-4 bg-[#0a0e2a]/80 border border-purple-900/30 space-y-2">
        <div className="flex items-center gap-2 text-slate-300 text-sm font-bold pb-2 border-b border-purple-900/20">
          <Info className="w-4 h-4 text-purple-400" />
          <span>About</span>
        </div>

        <button
          onClick={() => setActiveModal('about')}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-purple-950/30 transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <Info className="w-4 h-4 text-purple-300" />
            <span className="text-sm text-white font-medium">About SAY AI</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        <button
          onClick={() => setActiveModal('help')}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-purple-950/30 transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <Headphones className="w-4 h-4 text-purple-300" />
            <span className="text-sm text-white font-medium">Help &amp; Support</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        <button
          onClick={() => setActiveModal('privacy')}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-purple-950/30 transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-purple-300" />
            <span className="text-sm text-white font-medium">Privacy Policy</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        <button
          onClick={() => setActiveModal('terms')}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-purple-950/30 transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 text-purple-300" />
            <span className="text-sm text-white font-medium">Terms &amp; Conditions</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      <div className="pt-2 pb-6 flex justify-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/30 text-xs font-semibold text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          <span>💜</span>
          <span>Made with ❤️ for AI Lovers</span>
        </div>
      </div>

      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-[#0c0f30] border border-purple-500/40 p-6 space-y-4 shadow-[0_0_40px_rgba(147,51,234,0.4)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white capitalize">
                {activeModal === 'login' ? 'Authentication' : activeModal.replace('-', ' ')}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-sm text-slate-300 space-y-2 leading-relaxed">
              {activeModal === 'login' && (
                <div className="space-y-3">
                  <p>Sign in with your Supabase account or continue as Guest:</p>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    defaultValue="trrahaman.official@gmail.com"
                    className="w-full p-2.5 rounded-xl bg-[#07091e] border border-purple-800/40 text-white text-sm"
                  />
                  <input
                    type="password"
                    placeholder="••••••••"
                    defaultValue="password123"
                    className="w-full p-2.5 rounded-xl bg-[#07091e] border border-purple-800/40 text-white text-sm"
                  />
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm cursor-pointer shadow-md"
                  >
                    Continue
                  </button>
                </div>
              )}

              {activeModal === 'about' && (
                <p>
                  SAY AI is an all-in-one artificial intelligence ecosystem designed for maximum speed, security, and creativity. Equipped with state-of-the-art text, image, and voice models.
                </p>
              )}

              {activeModal === 'help' && (
                <p>
                  Need assistance? Our support team is available 24/7. Contact us at <span className="text-purple-300">support@sayai.universe</span> or browse our developer docs.
                </p>
              )}

              {activeModal === 'privacy' && (
                <p>
                  Your privacy is our utmost priority. Conversations and generated media are stored securely and encrypted at rest with Supabase RLS. We never sell your personal data.
                </p>
              )}

              {activeModal === 'terms' && (
                <p>
                  By using SAY AI, you agree to our standard terms of responsible AI usage, acceptable conduct, and service level agreements.
                </p>
              )}
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
