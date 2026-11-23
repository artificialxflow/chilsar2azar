'use client';

import React, { useState } from 'react';
import { SALES_CHART_SERIES } from '@/lib/mockData';
import { formatNumber } from '@/lib/formatters';

type PeriodKey = '7d' | '30d' | '6m';

const PERIOD_LABELS: Record<PeriodKey, string> = {
  '7d': '۷ روز اخیر',
  '30d': '۳۰ روز اخیر',
  '6m': '۶ ماه اخیر',
};

export function SalesProductionChart() {
  const [period, setPeriod] = useState<PeriodKey>('6m');
  const [metric, setMetric] = useState<'sales' | 'roast'>('sales');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const data = SALES_CHART_SERIES[period];
  const values = data.map((d) => (metric === 'sales' ? d.salesMillion : d.roastKg));
  const maxVal = Math.max(...values, 10);
  const niceMax = Math.ceil(maxVal / 50) * 50;

  const width = 680;
  const height = 250;
  const padTop = 20;
  const padBottom = 38;
  const padLeft = 24;
  const padRight = 52;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;

  const points = data.map((d, idx) => {
    const val = metric === 'sales' ? d.salesMillion : d.roastKg;
    const x =
      data.length === 1
        ? padLeft + innerW / 2
        : padLeft + (idx / (data.length - 1)) * innerW;
    const y = padTop + innerH - (val / niceMax) * innerH;
    return { ...d, val, x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(padTop + innerH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padTop + innerH).toFixed(1)} Z`
      : '';

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    val: Math.round(niceMax * ratio),
    y: padTop + innerH - ratio * innerH,
  }));

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : points[points.length - 1];

  return (
    <div className="bg-[#FFFEFC] rounded-3xl p-6 shadow-[0_2px_12px_rgba(41,35,31,0.035)] h-full flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-[#29231F]">
            تحلیل فروش و تولید برشته‌کاری
          </h2>
          <p className="text-xs text-[#786D65] mt-0.5">
            {metric === 'sales'
              ? 'روند فروش ماهانه و دوره‌ای (میلیون تومان)'
              : 'حجم برشته‌کاری ثبت‌شده در کارگاه (کیلوگرم)'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1 p-1 bg-[#F7F4EF] rounded-xl">
            <button
              type="button"
              onClick={() => setMetric('sales')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                metric === 'sales'
                  ? 'bg-[#C47A3C] text-[#FFFEFC]'
                  : 'text-[#786D65] hover:text-[#29231F]'
              }`}
            >
              فروش
            </button>
            <button
              type="button"
              onClick={() => setMetric('roast')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                metric === 'roast'
                  ? 'bg-[#4B2E24] text-[#FFFEFC]'
                  : 'text-[#786D65] hover:text-[#29231F]'
              }`}
            >
              حجم تولید
            </button>
          </div>

          <select
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value as PeriodKey);
              setHoveredIdx(null);
            }}
            aria-label="بازه زمانی نمودار"
            className="bg-[#F7F4EF] text-[#29231F] text-xs font-medium rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C47A3C]/40"
          >
            {(Object.keys(PERIOD_LABELS) as PeriodKey[]).map((key) => (
              <option key={key} value={key}>
                {PERIOD_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Highlight Summary */}
      {activePoint && (
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#786D65] mb-3 px-1">
          <span>
            بازه انتخابی:{' '}
            <strong className="text-[#29231F]">{activePoint.label}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            فروش:{' '}
            <strong className="text-[#C47A3C] tabular-nums">
              {formatNumber(activePoint.salesMillion, 0)} میلیون تومان
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            تولید رُست:{' '}
            <strong className="text-[#4B2E24] tabular-nums">
              {formatNumber(activePoint.roastKg, 0)} کیلوگرم
            </strong>
          </span>
        </div>
      )}

      {/* Offline Interactive SVG Area Chart */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-[240px] min-w-[460px]"
          role="img"
          aria-label="نمودار روند فروش و تولید چیلسر"
        >
          <defs>
            <linearGradient id="chilserChartArea" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={metric === 'sales' ? '#C47A3C' : '#4B2E24'}
                stopOpacity="0.28"
              />
              <stop
                offset="100%"
                stopColor={metric === 'sales' ? '#C47A3C' : '#4B2E24'}
                stopOpacity="0.02"
              />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels */}
          {yTicks.map((tick) => (
            <g key={tick.val}>
              <line
                x1={padLeft}
                x2={width - padRight}
                y1={tick.y}
                y2={tick.y}
                stroke="#4B2E24"
                strokeOpacity="0.08"
                strokeDasharray="3 4"
              />
              <text
                x={width - padRight + 10}
                y={tick.y + 4}
                fill="#786D65"
                fontSize="11"
                textAnchor="start"
                className="tabular-nums"
              >
                {formatNumber(tick.val, 0)}
              </text>
            </g>
          ))}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#chilserChartArea)" />

          {/* Main Trend Line */}
          <path
            d={linePath}
            fill="none"
            stroke={metric === 'sales' ? '#C47A3C' : '#4B2E24'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Points */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g
                key={pt.label}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {isHovered && (
                  <line
                    x1={pt.x}
                    x2={pt.x}
                    y1={padTop}
                    y2={padTop + innerH}
                    stroke="#C47A3C"
                    strokeOpacity="0.35"
                    strokeDasharray="3 3"
                  />
                )}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6.5 : 4.5}
                  fill="#FFFEFC"
                  stroke={metric === 'sales' ? '#C47A3C' : '#4B2E24'}
                  strokeWidth="3"
                />
                {/* Invisible wider hover target */}
                <rect
                  x={pt.x - 24}
                  y={padTop}
                  width={48}
                  height={innerH + 24}
                  fill="transparent"
                />
                <text
                  x={pt.x}
                  y={height - 10}
                  fill={isHovered ? '#29231F' : '#786D65'}
                  fontWeight={isHovered ? '700' : '400'}
                  fontSize="11.5"
                  textAnchor="middle"
                >
                  {pt.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
