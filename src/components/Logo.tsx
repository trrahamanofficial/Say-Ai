import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const SayAiLogo: React.FC<LogoProps> = ({ size = 'md', showSubtitle = true, className = '' }) => {
  const sizes = { sm: 'w-7 h-7', md: 'w-10 h-10', lg: 'w-14 h-14', xl: 'w-20 h-20' };
  const textSizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl', xl: 'text-5xl' };
  const subtitleSizes = { sm: 'text-[9px]', md: 'text-[11px]', lg: 'text-xs', xl: 'text-sm' };
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <img src="/assets/say-ai-logo.png" alt="SAY AI logo" className={`${sizes[size]} flex-shrink-0 rounded-[28%] object-contain drop-shadow-[0_3px_12px_rgba(0,160,255,.24)]`} />
      <div className="flex flex-col leading-none">
        <div className={`font-black tracking-tight flex items-center gap-1 ${textSizes[size]}`}>
          <span className="text-white">SAY</span>
          <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">AI</span>
        </div>
        {showSubtitle && <div className={`flex items-center gap-1 text-slate-400 font-medium tracking-normal mt-1 ${subtitleSizes[size]}`}>Your Personal AI Universe <span className="text-amber-400">✦</span></div>}
      </div>
    </div>
  );
};
