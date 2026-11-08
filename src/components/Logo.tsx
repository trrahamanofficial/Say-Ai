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
      {/* Official SAY AI blue emblem */}
      <div className={`${iconSizes[size]} flex-shrink-0 flex items-center justify-center`}>
        <img src="/assets/say-ai-logo.svg" alt="SAY AI" className="h-full w-full object-contain drop-shadow-[0_3px_12px_rgba(0,145,255,.25)]" />
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
