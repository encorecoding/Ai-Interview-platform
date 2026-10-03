import React from 'react';

interface LogoProps {
  variant?: 'mark' | 'full' | 'image';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  badge?: string;
  subtitle?: string;
  className?: string;
  iconClassName?: string;
  animate?: boolean;
}

const SIZE_MAP = {
  xs: { box: 'w-6 h-6', img: 'w-4 h-4', text: 'text-sm', badge: 'text-[9px]', sub: 'text-[9px]' },
  sm: { box: 'w-8 h-8', img: 'w-5 h-5', text: 'text-base', badge: 'text-[10px]', sub: 'text-[10px]' },
  md: { box: 'w-10 h-10', img: 'w-7 h-7', text: 'text-lg', badge: 'text-[10px]', sub: 'text-[11px]' },
  lg: { box: 'w-12 h-12', img: 'w-8 h-8', text: 'text-xl', badge: 'text-xs', sub: 'text-xs' },
  xl: { box: 'w-16 h-16', img: 'w-11 h-11', text: 'text-2xl', badge: 'text-xs', sub: 'text-sm' },
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  badge,
  subtitle,
  className = '',
  iconClassName = '',
  animate = true,
}) => {
  const s = SIZE_MAP[size];

  if (variant === 'image') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <img
          src="/carrier-mantra-logo-dark.png"
          alt="Carrier Mantra"
          className="h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
        />
      </div>
    );
  }

  // The official emblem icon mark housed in a crisp, high-contrast white squircle
  const EmblemMark = (
    <div
      className={`relative ${s.box} rounded-xl bg-white p-1 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.25)] border border-white/80 transition-all duration-300 ${
        animate ? 'group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]' : ''
      } ${iconClassName}`}
    >
      <img
        src="/carrier-mantra-mark.png"
        alt="Carrier Mantra Emblem"
        className={`${s.img} object-contain transition-transform`}
      />
    </div>
  );

  if (variant === 'mark') {
    return <div className={`inline-flex ${className}`}>{EmblemMark}</div>;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {EmblemMark}
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={`${s.text} font-black tracking-tight text-white font-sans`}>
            Carrier<span className="text-brand-400">Mantra</span>
          </span>
          {badge && (
            <span
              className={`${s.badge} font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                badge === 'PRO'
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                  : 'bg-white/[0.08] text-gray-300 border border-white/10'
              }`}
            >
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className={`${s.sub} text-gray-400 font-mono tracking-wide mt-0.5`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default Logo;
