import React, { useState } from 'react';
import { Crown, Check, ArrowRight, Zap, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import { ScreenType, UserProfile } from '../types';

interface SubscriptionViewProps {
  onNavigate: (screen: ScreenType) => void;
  userProfile: UserProfile;
  onUpgradePlan: (plan: 'Free' | 'Pro' | 'Enterprise') => void;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({
  onNavigate,
  userProfile,
  onUpgradePlan
}) => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [showNotFound, setShowNotFound] = useState(false);

  const plans = [
    {
      id: 'Free',
      name: 'Starter',
      price: '$0',
      period: '/month',
      badge: null,
      description: 'Essential AI capabilities for casual exploration and everyday questions.',
      features: [
        '50 AI Chat messages / day',
        '20 standard resolution images',
        '30 voice assistant interactions',
        'Standard response speed',
        'Community support'
      ],
      cta: 'Current Plan',
      isCurrent: userProfile.plan === 'Free',
      highlight: false
    },
    {
      id: 'Pro',
      name: 'SAY AI Pro',
      price: isAnnual ? '$15' : '$19',
      period: '/month',
      badge: 'Most Popular',
      description: 'Unleash full creative power with state-of-the-art multimodal AI models.',
      features: [
        'Unlimited AI Chat messages',
        '500 High-Def image generations / mo',
        'Real-time voice streaming with sub-second latency',
        'AI Video Generator access',
        'Priority API throughput & zero queue times',
        'Custom model fine-tuning support'
      ],
      cta: userProfile.plan === 'Pro' ? 'Current Plan' : 'Upgrade to Pro 👑',
      isCurrent: userProfile.plan === 'Pro',
      highlight: true
    },
    {
      id: 'Enterprise',
      name: 'Enterprise Universe',
      price: isAnnual ? '$39' : '$49',
      period: '/month',
      badge: 'Ultimate Power',
      description: 'Dedicated cloud computing infrastructure for teams, creators, and high-volume workloads.',
      features: [
        'Everything in Pro plan',
        'Unlimited 4K image and video generation',
        'Dedicated Supabase PostgreSQL instance',
        'Custom domain & white-label embedding',
        '24/7 dedicated engineering support & SLA',
        'Multi-seat team workspace management'
      ],
      cta: userProfile.plan === 'Enterprise' ? 'Current Plan' : 'Get Enterprise',
      isCurrent: userProfile.plan === 'Enterprise',
      highlight: false
    }
  ];

  const handleSelectPlan = (planId: string) => {
    if (planId === userProfile.plan || planId === 'Free') return;
    setShowNotFound(true);
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-3 sm:p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs tracking-wider uppercase">
          <span>👑</span>
          <span>SAY AI Premium Universe</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          Upgrade Your Creative Superpowers
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          Choose the right plan to unlock unlimited chat, high-resolution generative media, and lightning-fast edge response.
        </p>

        {/* Annual Toggle */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <span className={`text-xs font-semibold ${!isAnnual ? 'text-white' : 'text-slate-400'}`}>
            Monthly Billing
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-12 h-6 rounded-full bg-purple-600 p-1 flex items-center transition-colors cursor-pointer"
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <span className={`text-xs font-semibold flex items-center gap-1.5 ${isAnnual ? 'text-white' : 'text-slate-400'}`}>
            <span>Annual Billing</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Save 20%
            </span>
          </span>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 ${
              p.highlight
                ? 'bg-gradient-to-b from-[#1b103e] via-[#140e34] to-[#0d0926] border-2 border-purple-500 shadow-[0_0_35px_rgba(168,85,247,0.35)] scale-105 z-10'
                : 'bg-[#0a0e2a]/90 border border-purple-900/40 hover:border-purple-600/40'
            }`}
          >
            {p.badge && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[11px] font-extrabold tracking-wide uppercase shadow-md">
                {p.badge}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{p.name}</h3>
                {p.isCurrent && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Active
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-white">{p.price}</span>
                <span className="text-xs text-slate-400">{p.period}</span>
              </div>

              <p className="text-xs text-slate-300/80 mt-2 min-h-[36px]">{p.description}</p>

              <div className="my-5 border-t border-purple-900/30" />

              <div className="space-y-3">
                {p.features.map((f, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${p.highlight ? 'text-purple-400' : 'text-emerald-400'}`} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan(p.id)}
              disabled={p.isCurrent}
              className={`w-full mt-6 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all cursor-pointer ${
                p.isCurrent
                  ? 'bg-slate-800/80 text-slate-400 cursor-default'
                  : p.highlight
                  ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.6)] active:scale-95'
                  : 'bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 hover:text-white border border-purple-700/40'
              }`}
            >
              {p.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Paid upgrades are unavailable for now */}
      {showNotFound && (
        <div className="fixed inset-0 z-50 bg-[#050614] flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="text-6xl font-black text-purple-300">404</div>
            <h2 className="text-2xl font-bold text-white">Not Found</h2>
            <p className="text-sm text-slate-400">Paid upgrades are not available right now.</p>
            <button
              onClick={() => setShowNotFound(false)}
              className="mt-3 rounded-xl border border-purple-500/40 bg-purple-600/20 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-600/30"
            >
              Back to Plans
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
