'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowUpLeft,
  Clock,
  Download,
  Eye,
  Flame,
  Plus,
  ShoppingBag,
  SlidersHorizontal,
  TrendingUp,
  Users,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import {
  KpiCard,
  PageHeader,
  SearchInput,
  StatusBadge,
} from '@/components/ui/Primitives';
import { SalesProductionChart } from '@/components/charts/SalesProductionChart';
import { useChilserStore } from '@/lib/store';
import {
  exportRowsToCsv,
  formatNumber,
  formatShamsiHeaderDate,
  formatShamsiShort,
  formatToman,
} from '@/lib/formatters';
import { ROAST_PROFILE_LABELS } from '@/lib/mockData';

export default function DashboardPage() {
  const { state, activeBranch, pushToast } = useChilserStore();
  const [widgetQuery, setWidgetQuery] = useState('');
  const [compactView, setCompactView] = useState(false);
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>([]);

  // Live aggregated KPIs from the unified store
  const metrics = useMemo(() => {
    const totalReceipts = state.transactions
      .filter((t) => t.type === 'RECEIPT')
      .reduce((acc, t) => acc + t.amount, 0);

    const totalPayments = state.transactions
      .filter((t) => t.type === 'PAYMENT' || t.type === 'EXPENSE')
      .reduce((acc, t) => acc + t.amount, 0);

    const activeCustomers = state.customers.filter(
      (c) => c.status !== 'INACTIVE'
    ).length;

    const deliveredShipments = state.shipments.filter(
      (s) => typeof s.deliveryHours === 'number'
    );
    const avgDeliveryHours =
      deliveredShipments.length > 0
        ? deliveredShipments.reduce((acc, s) => acc + (s.deliveryHours ?? 0), 0) /
          deliveredShipments.length
        : 0;

    const completedBatches = state.roastBatches.filter(
      (b) => b.status === 'COMPLETED'
    );
    const activeBatches = state.roastBatches.filter(
      (b) => b.status === 'ROASTING' || b.status === 'PACKAGING'
    );
    const productionCompletionPct =
      state.roastBatches.length > 0
        ? Math.round(
            ((completedBatches.length + activeBatches.length * 0.5) /
              state.roastBatches.length) *
              100
          )
        : 0;

    const avgLoss =
      state.roastBatches.length > 0
        ? state.roastBatches.reduce((acc, b) => acc + b.weightLossPct, 0) /
          state.roastBatches.length
        : 0;

    const lowStockItems = state.inventory.filter(
      (i) => i.currentStock <= i.minStockLevel * state.settings.lowStockAlertMultiplier
    );

    return {
      totalReceipts,
      totalPayments,
      activeCustomers,
      avgDeliveryHours,
      productionCompletionPct,
      avgLoss,
      lowStockItems,
    };
  }, [state]);

  const kpiCards = [
    {
      id: 'receipts',
      title: 'جمع دریافت',
      value: formatToman(metrics.totalReceipts, false),
      unit: 'تومان',
      badgeTone: 'olive' as const,
      trend: { direction: 'up' as const, label: '+ ۱۲٪ این ماه' },
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      id: 'payments',
      title: 'جمع پرداخت و هزینه‌ها',
      value: formatToman(metrics.totalPayments, false),
      unit: 'تومان',
      badgeTone: 'brick' as const,
      trend: { direction: 'down' as const, label: 'خرید دانه و کارگاه' },
      icon: <ShoppingBag className="w-5 h-5" />,
    },
    {
      id: 'customers',
      title: 'تعداد مشتریان فعال',
      value: formatNumber(metrics.activeCustomers, 0),
      unit: 'مشتری',
      badgeTone: 'espresso' as const,
      trend: { direction: 'live' as const, label: 'زنده · CRM' },
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'delivery',
      title: 'میانگین زمان تحویل',
      value:
        metrics.avgDeliveryHours > 0
          ? formatNumber(metrics.avgDeliveryHours, 1)
          : '—',
      unit: metrics.avgDeliveryHours > 0 ? 'ساعت' : undefined,
      badgeTone: 'copper' as const,
      trend: { direction: 'neutral' as const, label: 'پیک و باربری' },
      icon: <Clock className="w-5 h-5" />,
    },
  ];

  const visibleKpis = kpiCards.filter(
    (card) =>
      !hiddenWidgets.includes(card.id) &&
      (widgetQuery.trim() === '' ||
        card.title.includes(widgetQuery.trim()))
  );

  const handleExportSummary = () => {
    exportRowsToCsv(
      'chilser-dashboard-orders',
      ['شماره سفارش', 'مشتری', 'تاریخ', 'وضعیت', 'وضعیت پرداخت', 'مبلغ کل (تومان)'],
      state.orders.map((o) => [
        o.orderNumber,
        o.customerName,
        formatShamsiShort(o.orderDate),
        o.status,
        o.paymentStatus,
        o.totalAmount,
      ])
    );
    pushToast('فایل خروجی گزارش داشبورد (CSV) آماده و دانلود شد');
  };

  return (
    <AppShell>
      {/* Page Title & Primary Actions (Nexapoint structure adapted to Chilser palette) */}
      <PageHeader
        title="داشبورد مدیریتی"
        subtitle={`${activeBranch} · ${formatShamsiHeaderDate()}`}
        actions={
          <>
            <button
              type="button"
              onClick={handleExportSummary}
              className="px-5 py-2.5 rounded-full bg-[#FFFEFC] text-[#29231F] text-sm font-medium shadow-[0_2px_8px_rgba(41,35,31,0.05)] hover:bg-white transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4 text-[#4B2E24]" />
              <span>خروجی گزارش</span>
            </button>
            <Link
              href="/orders?new=1"
              className="px-6 py-2.5 rounded-full bg-[#C47A3C] hover:bg-[#AF682E] text-[#FFFEFC] text-sm font-bold shadow-[0_4px_14px_rgba(196,122,60,0.3)] transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت سفارش جدید</span>
            </Link>
          </>
        }
      />

      {/* Widget Controls Row (matches Nexapoint's widget filter + compact toggle) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <SearchInput
            value={widgetQuery}
            onChange={setWidgetQuery}
            placeholder="فیلتر ویجت‌های داشبورد..."
            className="w-full sm:w-64"
          />
          <button
            type="button"
            onClick={() => setCompactView((v) => !v)}
            className={`px-4 py-2.5 rounded-full text-xs font-medium transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 ${
              compactView
                ? 'bg-[#4B2E24] text-[#FFFEFC]'
                : 'bg-[#FFFEFC] text-[#29231F] shadow-[0_1px_6px_rgba(41,35,31,0.04)] hover:bg-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>نمایش فشرده</span>
          </button>
        </div>

        {hiddenWidgets.length > 0 && (
          <button
            type="button"
            onClick={() => setHiddenWidgets([])}
            className="px-4 py-2 rounded-full bg-[#C47A3C]/12 text-[#A66128] text-xs font-medium inline-flex items-center gap-1.5 hover:bg-[#C47A3C]/20 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>
              بازگردانی ویجت‌های مخفی ({formatNumber(hiddenWidgets.length, 0)})
            </span>
          </button>
        )}
      </div>

      {/* Top 4 KPI Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        {visibleKpis.map((card) => (
          <KpiCard
            key={card.id}
            title={card.title}
            value={card.value}
            unit={card.unit}
            badgeTone={card.badgeTone}
            trend={card.trend}
            icon={card.icon}
            compact={compactView}
            onHide={() => setHiddenWidgets((prev) => [...prev, card.id])}
          />
        ))}
      </section>

      {/* Main Analytics Asymmetric Split (8 cols chart / 4 cols production status) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-stretch">
        <div className="lg:col-span-8">
          <SalesProductionChart />
        </div>

        {/* Production & Roasting Status Card (Nexapoint left card re-engineered for Coffee Roastery) */}
        <div className="lg:col-span-4 bg-[#FFFEFC] rounded-3xl p-6 shadow-[0_2px_12px_rgba(41,35,31,0.035)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-5">
              <div>
                <h2 className="text-lg font-bold text-[#29231F]">وضعیت تولید</h2>
                <p className="text-xs text-[#786D65] mt-0.5">
                  پیشرفت برنامه برشته‌کاری جاری
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#C47A3C]/12 text-[#C47A3C] flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[#786D65]">تحقق برنامه رُست</span>
                <span className="font-bold text-[#29231F] tabular-nums">
                  {formatNumber(metrics.productionCompletionPct, 0)}٪
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#F7F4EF] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#C47A3C] transition-all duration-300"
                  style={{ width: `${metrics.productionCompletionPct}%` }}
                />
              </div>
              <p className="text-[11px] text-[#786D65] mt-2 tabular-nums">
                میانگین افت وزن برشته‌کاری:{' '}
                <strong className="text-[#4B2E24]">
                  {formatNumber(metrics.avgLoss, 1)}٪
                </strong>{' '}
                (سقف مجاز {formatNumber(state.settings.maxAllowedWeightLossPct, 0)}٪)
              </p>
            </div>

            {/* Active Batches List */}
            <div className="space-y-3">
              {state.roastBatches.slice(0, 3).map((batch) => (
                <div
                  key={batch.id}
                  className="p-3 rounded-2xl bg-[#F7F4EF]/80 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#29231F] truncate">
                      {batch.targetProductName}
                    </p>
                    <p className="text-[11px] text-[#786D65] mt-0.5 tabular-nums">
                      {batch.batchNumber} · {ROAST_PROFILE_LABELS[batch.roastProfile]} ·{' '}
                      {formatNumber(batch.inputGreenKg, 0)} کیلو
                    </p>
                  </div>
                  <StatusBadge
                    label={
                      batch.status === 'COMPLETED'
                        ? 'تکمیل‌شده'
                        : batch.status === 'PACKAGING'
                        ? 'بسته‌بندی'
                        : batch.status === 'ROASTING'
                        ? 'در حال رُست'
                        : 'برنامه‌ریزی'
                    }
                    tone={
                      batch.status === 'COMPLETED'
                        ? 'success'
                        : batch.status === 'ROASTING'
                        ? 'copper'
                        : batch.status === 'PACKAGING'
                        ? 'warning'
                        : 'neutral'
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/production"
            className="mt-6 w-full py-2.5 rounded-full text-center text-xs font-bold text-[#C47A3C] hover:bg-[#C47A3C]/10 transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <span>مشاهده جزئیات تولید</span>
            <ArrowUpLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Operational Bottom Row: Recent Orders + Low Stock Alerts */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-[#FFFEFC] rounded-3xl p-6 shadow-[0_2px_12px_rgba(41,35,31,0.035)]">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-[#29231F]">
                آخرین سفارش‌های ثبت‌شده
              </h2>
              <p className="text-xs text-[#786D65] mt-0.5">
                وضعیت فروش و آماده‌سازی سفارش‌های کافه‌ای و عمده
              </p>
            </div>
            <Link
              href="/orders"
              className="text-xs font-bold text-[#C47A3C] hover:underline whitespace-nowrap"
            >
              مشاهده همه سفارش‌ها
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="border-b border-[#4B2E24]/8 text-[11px] font-medium text-[#786D65]">
                  <th className="py-3 text-start pe-3">شماره سفارش</th>
                  <th className="py-3 text-start px-3">مشتری</th>
                  <th className="py-3 text-start px-3">تاریخ</th>
                  <th className="py-3 text-start px-3">وضعیت</th>
                  <th className="py-3 text-end ps-3">مبلغ کل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4B2E24]/6 text-xs">
                {state.orders.slice(0, 5).map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[#F7F4EF]/60 transition-colors"
                  >
                    <td className="py-3.5 pe-3 font-bold text-[#4B2E24] tabular-nums whitespace-nowrap">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-3 text-[#29231F] font-medium">
                      {order.customerName}
                    </td>
                    <td className="py-3.5 px-3 text-[#786D65] tabular-nums whitespace-nowrap">
                      {formatShamsiShort(order.orderDate)}
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge
                        label={
                          order.status === 'DELIVERED'
                            ? 'تحویل‌شده'
                            : order.status === 'SHIPPED'
                            ? 'ارسال‌شده'
                            : order.status === 'PREPARING'
                            ? 'در حال آماده‌سازی'
                            : order.status === 'CANCELLED'
                            ? 'لغوشده'
                            : 'در انتظار'
                        }
                        tone={
                          order.status === 'DELIVERED'
                            ? 'success'
                            : order.status === 'SHIPPED'
                            ? 'copper'
                            : order.status === 'PREPARING'
                            ? 'warning'
                            : order.status === 'CANCELLED'
                            ? 'danger'
                            : 'neutral'
                        }
                      />
                    </td>
                    <td className="py-3.5 ps-3 text-end font-bold text-[#29231F] tabular-nums whitespace-nowrap">
                      {formatToman(order.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 bg-[#FFFEFC] rounded-3xl p-6 shadow-[0_2px_12px_rgba(41,35,31,0.035)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-bold text-[#29231F]">
                  هشدار موجودی انبار
                </h2>
                <p className="text-xs text-[#786D65] mt-0.5">
                  اقلام زیر نقطه سفارش مجاز
                </p>
              </div>
              <div className="w-9 h-9 rounded-2xl bg-[#D99A32]/14 text-[#A8721A] flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>

            {metrics.lowStockItems.length === 0 ? (
              <p className="text-xs text-[#5E7C52] bg-[#5E7C52]/10 rounded-2xl p-4">
                موجودی تمامی دانه سبزها، محصولات و بسته‌بندی‌ها در سطح ایمن است.
              </p>
            ) : (
              <div className="space-y-3">
                {metrics.lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-[#F7F4EF]/90 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#29231F] truncate">
                        {item.itemName}
                      </p>
                      <p className="text-[11px] text-[#786D65] mt-0.5 tabular-nums">
                        حداقل مجاز: {formatNumber(item.minStockLevel, 0)}{' '}
                        {item.unit === 'KG' ? 'کیلو' : 'عدد'}
                      </p>
                    </div>
                    <div className="text-end shrink-0">
                      <span className="text-sm font-bold text-[#B84A3A] tabular-nums">
                        {formatNumber(item.currentStock, 1)}
                      </span>
                      <span className="block text-[10px] text-[#786D65]">
                        {item.unit === 'KG' ? 'کیلوگرم' : 'عدد'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/purchases"
            className="mt-5 w-full py-2.5 rounded-full bg-[#4B2E24] hover:bg-[#3A221A] text-[#FFFEFC] text-xs font-medium text-center transition-colors"
          >
            ثبت سفارش خرید مواد اولیه
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
