'use client';

import React, { useMemo } from 'react';
import {
  BarChart3,
  Download,
  Flame,
  TrendingUp,
  Users,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { KpiCard, PageHeader } from '@/components/ui/Primitives';
import { SalesProductionChart } from '@/components/charts/SalesProductionChart';
import { useChilserStore } from '@/lib/store';
import {
  exportRowsToCsv,
  formatNumber,
  formatShamsiShort,
  formatToman,
} from '@/lib/formatters';

export default function ReportsPage() {
  const { state, pushToast } = useChilserStore();

  const analytics = useMemo(() => {
    const receipts = state.transactions
      .filter((t) => t.type === 'RECEIPT')
      .reduce((a, b) => a + b.amount, 0);
    const expenses = state.transactions
      .filter((t) => t.type !== 'RECEIPT')
      .reduce((a, b) => a + b.amount, 0);
    const grossMarginPct =
      receipts > 0 ? Math.round(((receipts - expenses) / receipts) * 100) : 0;

    const totalInputKg = state.roastBatches.reduce((a, b) => a + b.inputGreenKg, 0);
    const totalOutputKg = state.roastBatches.reduce((a, b) => a + b.outputRoastedKg, 0);
    const overallYieldPct =
      totalInputKg > 0 ? Math.round((totalOutputKg / totalInputKg) * 1000) / 10 : 0;

    const topCustomers = [...state.customers]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
    const maxCustomerSpend = topCustomers[0]?.totalSpent || 1;

    return {
      receipts,
      expenses,
      grossMarginPct,
      totalOutputKg,
      overallYieldPct,
      topCustomers,
      maxCustomerSpend,
    };
  }, [state]);

  const downloadProductionReport = () => {
    exportRowsToCsv(
      'chilser-production-report',
      ['شماره بچ', 'محصول', 'دانه سبز', 'ورودی (کیلو)', 'خروجی (کیلو)', 'افت وزن (٪)', 'تاریخ'],
      state.roastBatches.map((b) => [
        b.batchNumber,
        b.targetProductName,
        b.greenBeanName,
        b.inputGreenKg,
        b.outputRoastedKg,
        b.weightLossPct,
        formatShamsiShort(b.scheduledDate),
      ])
    );
    pushToast('گزارش تولید و افت وزن (CSV) دانلود شد');
  };

  const downloadInventoryReport = () => {
    exportRowsToCsv(
      'chilser-inventory-valuation',
      ['کد SKU', 'نام کالا', 'موجودی', 'بهای واحد (تومان)', 'ارزش کل (تومان)'],
      state.inventory.map((i) => [
        i.skuCode,
        i.itemName,
        i.currentStock,
        i.unitCost,
        Math.round(i.currentStock * i.unitCost),
      ])
    );
    pushToast('گزارش ارزش‌گذاری انبار (CSV) دانلود شد');
  };

  return (
    <AppShell>
      <PageHeader
        title="گزارش‌های مدیریتی"
        subtitle="تحلیل سودآوری، راندمان خط برشته‌کاری، مشتریان برتر و خروجی‌های اکسل (CSV)"
        actions={
          <>
            <button
              type="button"
              onClick={downloadInventoryReport}
              className="px-5 py-2.5 rounded-full bg-[#FFFEFC] text-[#29231F] text-sm font-medium shadow-sm inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-[#4B2E24]" />
              <span>ارزش‌گذاری انبار (CSV)</span>
            </button>
            <button
              type="button"
              onClick={downloadProductionReport}
              className="px-6 py-2.5 rounded-full bg-[#C47A3C] hover:bg-[#AF682E] text-[#FFFEFC] text-sm font-bold inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>گزارش تولید و افت وزن</span>
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <KpiCard
          title="حاشیه نقدینگی عملیاتی"
          value={`${formatNumber(analytics.grossMarginPct, 0)}٪`}
          badgeTone={analytics.grossMarginPct >= 0 ? 'olive' : 'brick'}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <KpiCard
          title="راندمان تبدیل دانه سبز به رُست"
          value={`${formatNumber(analytics.overallYieldPct, 1)}٪`}
          unit={`${formatNumber(analytics.totalOutputKg, 1)} کیلو`}
          badgeTone="copper"
          icon={<Flame className="w-5 h-5" />}
        />
        <KpiCard
          title="ارزش موجودی کل انبار"
          value={formatToman(
            state.inventory.reduce((acc, i) => acc + i.currentStock * i.unitCost, 0),
            false
          )}
          unit="تومان"
          badgeTone="espresso"
          icon={<BarChart3 className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-stretch">
        <div className="lg:col-span-8">
          <SalesProductionChart />
        </div>

        {/* Top Customers Bar Breakdown */}
        <div className="lg:col-span-4 bg-[#FFFEFC] rounded-3xl p-6 shadow-[0_2px_12px_rgba(41,35,31,0.035)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-[#29231F]">
                مشتریان برتر بر اساس حجم خرید
              </h2>
              <p className="text-xs text-[#786D65] mt-0.5">
                رتبه‌بندی تجمیعی فروش کافه‌ها و عمده‌فروشان
              </p>
            </div>
            <Users className="w-5 h-5 text-[#C47A3C]" />
          </div>

          <div className="space-y-4">
            {analytics.topCustomers.map((c) => {
              const pct = Math.round((c.totalSpent / analytics.maxCustomerSpend) * 100);
              return (
                <div key={c.id}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-[#29231F] truncate">
                      {c.companyName}
                    </span>
                    <span className="font-bold text-[#4B2E24] tabular-nums shrink-0 ms-2">
                      {formatToman(c.totalSpent)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#F7F4EF] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#C47A3C]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Roast Batch Efficiency Report Table */}
      <div className="bg-[#FFFEFC] rounded-3xl p-6 shadow-[0_2px_12px_rgba(41,35,31,0.035)] overflow-x-auto">
        <h2 className="text-base font-bold text-[#29231F] mb-4">
          گزارش عملکرد بچ‌های برشته‌کاری و کنترل افت وزن
        </h2>
        <table className="w-full text-start border-collapse">
          <thead>
            <tr className="border-b border-[#4B2E24]/8 text-xs text-[#786D65]">
              <th className="py-3 text-start pe-3">شماره بچ</th>
              <th className="py-3 text-start px-3">محصول هدف</th>
              <th className="py-3 text-start px-3">ورودی دانه سبز</th>
              <th className="py-3 text-start px-3">خروجی برشته‌شده</th>
              <th className="py-3 text-start px-3">افت وزن</th>
              <th className="py-3 text-end ps-3">تاریخ اجرا</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#4B2E24]/6 text-xs">
            {state.roastBatches.map((b) => (
              <tr key={b.id} className="hover:bg-[#F7F4EF]/60">
                <td className="py-3.5 pe-3 font-bold text-[#4B2E24] tabular-nums">
                  {b.batchNumber}
                </td>
                <td className="py-3.5 px-3 font-medium text-[#29231F]">
                  {b.targetProductName}
                </td>
                <td className="py-3.5 px-3 tabular-nums">
                  {formatNumber(b.inputGreenKg, 1)} کیلوگرم
                </td>
                <td className="py-3.5 px-3 font-bold tabular-nums">
                  {formatNumber(b.outputRoastedKg, 1)} کیلوگرم
                </td>
                <td className="py-3.5 px-3 font-bold tabular-nums text-[#5E7C52]">
                  {formatNumber(b.weightLossPct, 1)}٪
                </td>
                <td className="py-3.5 ps-3 text-end text-[#786D65] tabular-nums">
                  {formatShamsiShort(b.scheduledDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
