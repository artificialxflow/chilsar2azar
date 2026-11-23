'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Coffee,
  EyeOff,
  Info,
  Package,
  Search,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useChilserStore } from '@/lib/store';

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      <div className="min-w-0">
        <h1 className="text-2xl md:text-[28px] font-bold text-[#29231F] tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-[#786D65] mt-1">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-3 shrink-0">{actions}</div>
      )}
    </div>
  );
}

export interface KpiCardProps {
  title: string;
  value: string;
  unit?: string;
  trend?: {
    direction: 'up' | 'down' | 'live' | 'neutral';
    label: string;
  };
  icon: React.ReactNode;
  badgeTone: 'copper' | 'espresso' | 'olive' | 'amber' | 'brick';
  compact?: boolean;
  onHide?: () => void;
}

const BADGE_TONE_CLASSES: Record<KpiCardProps['badgeTone'], string> = {
  copper: 'bg-[#C47A3C]/12 text-[#C47A3C]',
  espresso: 'bg-[#4B2E24]/10 text-[#4B2E24]',
  olive: 'bg-[#5E7C52]/12 text-[#5E7C52]',
  amber: 'bg-[#D99A32]/14 text-[#B57B1B]',
  brick: 'bg-[#B84A3A]/12 text-[#B84A3A]',
};

export function KpiCard({
  title,
  value,
  unit,
  trend,
  icon,
  badgeTone,
  compact = false,
  onHide,
}: KpiCardProps) {
  return (
    <div
      className={`bg-[#FFFEFC] rounded-3xl shadow-[0_2px_12px_rgba(41,35,31,0.035)] transition-shadow duration-200 hover:shadow-[0_6px_20px_rgba(75,46,36,0.07)] flex flex-col justify-between ${
        compact ? 'p-4' : 'p-6'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${BADGE_TONE_CLASSES[badgeTone]}`}
        >
          {icon}
        </div>
        {trend && (
          <div
            className={`inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap ${
              trend.direction === 'up' || trend.direction === 'live'
                ? 'text-[#5E7C52]'
                : trend.direction === 'down'
                ? 'text-[#B84A3A]'
                : 'text-[#786D65]'
            }`}
          >
            {trend.direction === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
            {trend.direction === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
            <span>{trend.label}</span>
          </div>
        )}
      </div>

      <div className={compact ? 'mt-3' : 'mt-5'}>
        <p className="text-xs font-medium text-[#786D65]">{title}</p>
        <div className="flex items-baseline gap-1.5 mt-1.5 flex-wrap">
          <span
            className={`font-bold text-[#29231F] tabular-nums ${
              compact ? 'text-xl' : 'text-2xl'
            }`}
          >
            {value}
          </span>
          {unit && <span className="text-xs text-[#786D65]">{unit}</span>}
        </div>
      </div>

      {onHide && !compact && (
        <div className="mt-4 pt-3 border-t border-[#4B2E24]/6 flex justify-center">
          <button
            type="button"
            onClick={onHide}
            className="inline-flex items-center gap-1.5 text-[11px] text-[#786D65] hover:text-[#4B2E24] transition-colors"
          >
            <EyeOff className="w-3 h-3" />
            <span>مخفی کردن ویجت</span>
          </button>
        </div>
      )}
    </div>
  );
}

export type SemanticTone = 'success' | 'warning' | 'danger' | 'neutral' | 'copper';

const STATUS_STYLE: Record<SemanticTone, string> = {
  success: 'text-[#5E7C52] bg-[#5E7C52]/10',
  warning: 'text-[#A8721A] bg-[#D99A32]/14',
  danger: 'text-[#B84A3A] bg-[#B84A3A]/10',
  copper: 'text-[#A66128] bg-[#C47A3C]/12',
  neutral: 'text-[#5C534C] bg-[#4B2E24]/6',
};

export function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: SemanticTone;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium whitespace-nowrap ${STATUS_STYLE[tone]}`}
    >
      {label}
    </span>
  );
}

export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string; count?: number }>;
  value: T;
  onChange: (val: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#EDE7DF]/75 rounded-2xl">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              active
                ? 'bg-[#FFFEFC] text-[#4B2E24] shadow-sm font-bold'
                : 'text-[#786D65] hover:text-[#29231F]'
            }`}
          >
            <span>{opt.label}</span>
            {typeof opt.count === 'number' && (
              <span
                className={`tabular-nums text-[11px] ${
                  active ? 'text-[#C47A3C]' : 'text-[#786D65]/80'
                }`}
              >
                ({opt.count.toLocaleString('fa-IR')})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'جستجو...',
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="w-4 h-4 text-[#786D65] absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#FFFEFC] text-sm text-[#29231F] placeholder:text-[#786D65]/80 rounded-full ps-10 pe-4 py-2.5 shadow-[0_1px_6px_rgba(41,35,31,0.04)] focus:outline-none focus:ring-2 focus:ring-[#C47A3C]/40 transition-shadow"
      />
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidthClass = 'max-w-xl',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidthClass?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#261914]/45 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.18 }}
            className={`relative z-10 w-full ${maxWidthClass} bg-[#FFFEFC] rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden`}
          >
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[#4B2E24]/8">
              <div>
                <h2 className="text-lg font-bold text-[#29231F]">{title}</h2>
                {subtitle && (
                  <p className="text-xs text-[#786D65] mt-0.5">{subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="بستن"
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#786D65] hover:bg-[#F7F4EF] hover:text-[#29231F] transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="py-12 px-6 text-center flex flex-col items-center justify-center">
      <div className="w-14 h-14 rounded-2xl bg-[#F7F4EF] text-[#C47A3C] flex items-center justify-center mb-4">
        <Coffee className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-[#29231F]">{title}</h3>
      <p className="text-sm text-[#786D65] mt-1 max-w-md">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 px-6 py-2.5 rounded-full bg-[#C47A3C] text-[#FFFEFC] text-sm font-medium hover:bg-[#AF682E] transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function LocalAssetThumb({
  src,
  alt,
  category = 'ROASTED_COFFEE',
  sizeClass = 'w-11 h-11',
}: {
  src?: string;
  alt: string;
  category?: 'GREEN_BEAN' | 'ROASTED_COFFEE' | 'PACKAGING' | 'AVATAR';
  sizeClass?: string;
}) {
  const [failed, setFailed] = useState(!src);

  const fallbackStyle =
    category === 'GREEN_BEAN'
      ? 'bg-gradient-to-br from-[#5E7C52]/20 to-[#4B2E24]/15 text-[#5E7C52]'
      : category === 'PACKAGING'
      ? 'bg-gradient-to-br from-[#D99A32]/20 to-[#C47A3C]/15 text-[#A8721A]'
      : 'bg-gradient-to-br from-[#4B2E24]/15 to-[#C47A3C]/20 text-[#4B2E24]';

  if (failed || !src) {
    return (
      <div
        className={`${sizeClass} rounded-2xl ${fallbackStyle} flex items-center justify-center shrink-0`}
        title={alt}
      >
        {category === 'PACKAGING' ? (
          <Package className="w-5 h-5" />
        ) : (
          <Coffee className="w-5 h-5" />
        )}
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-2xl overflow-hidden bg-[#F7F4EF] shrink-0`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export function ToastContainer() {
  const { toasts, dismissToast } = useChilserStore();

  return (
    <div className="fixed bottom-5 start-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            className="pointer-events-auto bg-[#261914] text-[#FFFEFC] rounded-2xl px-4 py-3 shadow-xl flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {toast.tone === 'success' && (
                <CheckCircle2 className="w-4 h-4 text-[#8AB878] shrink-0" />
              )}
              {toast.tone === 'warning' && (
                <AlertCircle className="w-4 h-4 text-[#D99A32] shrink-0" />
              )}
              {toast.tone === 'danger' && (
                <AlertCircle className="w-4 h-4 text-[#E07A6B] shrink-0" />
              )}
              {toast.tone === 'info' && (
                <Info className="w-4 h-4 text-[#C47A3C] shrink-0" />
              )}
              <span className="text-xs font-medium leading-relaxed">
                {toast.title}
              </span>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-[#C9BEB6] hover:text-white transition-colors shrink-0"
              aria-label="بستن پیام"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
