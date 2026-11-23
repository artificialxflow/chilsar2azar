import React from 'react';

interface BrandLogoProps {
  variant?: 'dark' | 'light';
  compact?: boolean;
  showSubtitle?: boolean;
  className?: string;
}

export function BrandLogo({
  variant = 'dark',
  compact = false,
  showSubtitle = false,
  className = '',
}: BrandLogoProps) {
  const isDark = variant === 'dark';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Geometric Coffee Bean & Production Flow Emblem */}
      <div
        className={`relative flex items-center justify-center w-10 h-10 rounded-2xl shrink-0 transition-transform duration-200 ${
          isDark
            ? 'bg-[#4B2E24] ring-1 ring-white/10 shadow-sm'
            : 'bg-[#4B2E24] shadow-sm'
        }`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          className="w-7 h-7"
          aria-hidden="true"
        >
          <path
            d="M24 8C15.8 8 10.5 14.9 10.5 24C10.5 33.1 15.8 40 24 40C32.2 40 37.5 33.1 37.5 24C37.5 14.9 32.2 8 24 8Z"
            fill="#FFFEFC"
            fillOpacity="0.12"
            stroke="#FFFEFC"
            strokeWidth="2.4"
          />
          <path
            d="M26.8 10C21.2 15 21.4 20.4 24.5 24.4C27.6 28.4 27.8 33.8 21.6 38.2"
            stroke="#C47A3C"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          <circle cx="30.6" cy="15.2" r="2.1" fill="#C47A3C" />
        </svg>
      </div>

      {!compact && (
        <div className="flex flex-col leading-tight min-w-0">
          <span
            className={`text-lg font-bold tracking-tight whitespace-nowrap ${
              isDark ? 'text-[#FFFEFC]' : 'text-[#4B2E24]'
            }`}
          >
            چیلسر
          </span>
          {showSubtitle && (
            <span
              className={`text-[11px] font-medium whitespace-nowrap ${
                isDark ? 'text-[#C9BEB6]' : 'text-[#786D65]'
              }`}
            >
              مدیریت یکپارچه قهوه
            </span>
          )}
        </div>
      )}
    </div>
  );
}
