import React from 'react';
interface LogoProps { size?: 'sm'|'md'|'lg'|'xl'; showSubtitle?: boolean; className?: string }
export const SayAiLogo: React.FC<LogoProps> = ({ size='md', showSubtitle=true, className='' }) => {
  const sizes = { sm:'w-8 h-8', md:'w-10 h-10', lg:'w-14 h-14', xl:'w-20 h-20' };
  const text = { sm:'text-lg', md:'text-2xl', lg:'text-3xl', xl:'text-5xl' };
  const sub = { sm:'text-[9px]', md:'text-[11px]', lg:'text-xs', xl:'text-sm' };
  return <div className={`flex items-center gap-3 select-none ${className}`}>
    <img src="/assets/say-ai-logo.svg?v=5" alt="SAY AI logo" draggable={false} className={`${sizes[size]} flex-shrink-0 rounded-[24%] object-contain bg-white p-0 shadow-[0_4px_16px_rgba(28,126,230,.16)]`} />
    <div className="flex flex-col leading-none">
      <div className={`font-black tracking-tight flex items-center gap-1 ${text[size]}`}><span className="text-slate-900">SAY</span><span className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 bg-clip-text text-transparent">AI</span></div>
      {showSubtitle && <div className={`text-slate-500 font-medium mt-1 ${sub[size]}`}>Your Personal AI Assistant</div>}
    </div>
  </div>;
};
