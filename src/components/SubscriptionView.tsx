import React from 'react';
import { ArrowLeft, Crown, CircleHelp } from 'lucide-react';
import { ScreenType, UserProfile } from '../types';

interface SubscriptionViewProps {
  onNavigate: (screen: ScreenType) => void;
  userProfile: UserProfile;
  onUpgradePlan: (plan: 'Free' | 'Pro' | 'Enterprise') => void;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({ onNavigate, userProfile }) => (
  <section className="flex-1 w-full max-w-xl mx-auto p-5 sm:p-8 flex items-center justify-center">
    <div className="w-full rounded-[2rem] border border-cyan-300/20 bg-gradient-to-b from-[#102a40] to-[#091827] p-7 sm:p-10 text-center shadow-[0_24px_80px_rgba(0,0,0,.3)]">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
        <Crown className="h-8 w-8" />
      </div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[.24em] text-cyan-300">SAY AI •  Upgrade</p>
      <h1 className="text-3xl font-black tracking-tight text-white">Not Found</h1>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-300">
        Upgrade plans are currently unavailable. SAY AI remains free to use. No payment or checkout is available.
      </p>
      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
        <CircleHelp className="h-4 w-4 text-cyan-300" />
        <span>Current plan: {userProfile.plan}</span>
      </div>
      <button onClick={() => onNavigate('dashboard')} className="mx-auto mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-950/40">
        <ArrowLeft className="h-4 w-4" /> Back to SAY AI
      </button>
    </div>
  </section>
);
