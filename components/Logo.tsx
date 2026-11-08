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
      {/* Official SAY AI app mark: blue interlocking symbol on a white grid tile */}
      <div className={`relative ${iconSizes[size]} flex-shrink-0 overflow-hidden rounded-[28%] bg-white shadow-[0_3px_18px_rgba(0,140,255,.22)]`}>
        <svg viewBox="0 0 512 512" className="h-full w-full" role="img" aria-label="SAY AI logo">
          <defs>
            <clipPath id="sayaiLogoClip"><rect width="512" height="512" rx="112"/></clipPath>
            <linearGradient id="sayaiBlue" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#20b9f2"/><stop offset="1" stopColor="#0878ef"/>
            </linearGradient>
          </defs>
          <g clipPath="url(#sayaiLogoClip)">
            <rect width="512" height="512" fill="#fff"/>
            <g stroke="#dce8fa" strokeWidth="3" opacity=".9">
              <path d="M-90 90 422 602M-20 -40 552 532M90 -90 602 422M-150 250 262 662M250 -150 662 262"/>
              <path d="M-90 422 422 -90M-20 552 552 -20M90 602 602 90M-150 262 262 -150M250 662 662 250"/>
            </g>
            <path d="M147 193 230 276 147 359 111 323 158 276 111 229Z" fill="url(#sayaiBlue)"/>
            <path d="M229 111 312 194 395 111 432 148 349 231 432 314 395 351 312 268 229 351 192 314 275 231 192 148Z" fill="url(#sayaiBlue)"/>
            <path d="M147 359 230 276 313 359 276 396 230 350 184 396Z" fill="url(#sayaiBlue)"/>
          </g>
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
