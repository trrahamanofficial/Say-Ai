import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const SayAiLogo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = ''
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-5xl'
  };

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 3D Swirling Neon Spiral Emblem */}
      <div className={`relative ${iconSizes[size]} flex-shrink-0 flex items-center justify-center`}>
        {/* Ambient neon radial back-glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-fuchsia-600/60 via-purple-600/50 to-cyan-400/60 blur-md animate-pulse" />
        
        {/* Holographic swirling SVG emblem */}
        <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 drop-shadow-[0_0_12px_rgba(168,85,247,0.85)]">
          <defs>
            <linearGradient id="swirlGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f5ff" />
              <stop offset="40%" stopColor="#7928ca" />
              <stop offset="70%" stopColor="#d946ef" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <linearGradient id="swirlGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer orbital rings */}
          <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(147, 51, 234, 0.3)" strokeWidth="1.5" strokeDasharray="4 6" />
          
          {/* Main spiral arms simulating the dynamic SAY AI logo in the screenshots */}
          <path
            d="M50 10 C 72 10, 90 28, 90 50 C 90 68, 76 84, 58 88 C 42 92, 26 82, 20 68 C 14 54, 20 38, 32 30 C 44 22, 60 26, 66 38 C 72 50, 66 64, 54 68 C 44 72, 34 66, 32 56 C 30 48, 36 42, 44 42 C 50 42, 54 46, 54 50"
            fill="none"
            stroke="url(#swirlGrad1)"
            strokeWidth="9"
            strokeLinecap="round"
          />

          <path
            d="M50 90 C 28 90, 10 72, 10 50 C 10 32, 24 16, 42 12 C 58 8, 74 18, 80 32 C 86 46, 80 62, 68 70 C 56 78, 40 74, 34 62"
            fill="none"
            stroke="url(#swirlGrad2)"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Central core gem */}
          <circle cx="50" cy="50" r="7" fill="#ffffff" filter="url(#neonGlow)" />
          <circle cx="50" cy="50" r="4" fill="#a855f7" />
        </svg>
      </div>

      {/* Typography: "SAY AI" + Tagline */}
      <div className="flex flex-col leading-none">
        <div className={`font-black tracking-tight flex items-center gap-1 ${textSizes[size]}`}>
          <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">SAY</span>
          <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(192,132,252,0.6)]">
            AI
          </span>
        </div>
        {showSubtitle && (
          <div className={`flex items-center gap-1 text-slate-400 font-medium tracking-normal mt-0.5 ${subtitleSizes[size]}`}>
            <span>Your Personal AI Universe</span>
            <span className="text-amber-400 text-[10px]">👑</span>
          </div>
        )}
      </div>
    </div>
  );
};
