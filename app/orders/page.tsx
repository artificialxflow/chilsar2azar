'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Download,
  Plus,
  Trash2,
  Truck,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import {
  EmptyState,
  FilterTabs,
  KpiCard,
  Modal,
  PageHeader,
  SearchInput,
  StatusBadge,
} from '@/components/ui/Primitives';
import { useChilserStore } from '@/lib/store';
import {
  GRIND_LABELS,
  GrindType,
  OrderStatus,
  PaymentStatus,
} from '@/lib/mockData';
import {
  exportRowsToCsv,
  formatNumber,
  formatShamsiShort,
  formatToman,
} from '@/lib/formatters';

interface DraftOrderLine {
  skuCode: string;
  productName: string;
  grindType: GrindType;
  packWeightGr: number;
  quantity: number;
  unitPrice: number;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'در انتظار',
  PREPARING: 'در حال آماده‌سازی',
  SHIPPED: 'ارسال‌شده',
  DELIVERED: 'تحویل‌شده',
  CANCELLED: 'لغوشده',
};

export default function OrdersPage() {
  const { state, addOrder, updateOrderStatus, markOrderPaid, pushToast } =
    useChilserStore();
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const roastedProducts = useMemo(
    () => state.inventory.filter((i) => i.category === 'ROASTED_COFFEE'),
    [state.inventory]
  );

  // Order creation form state (exact camelCase fields matching prisma/schema.prisma)
  const [customerId, setCustomerId] = useState(state.customers[0]?.id ?? '');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PAID');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<DraftOrderLine[]>([
    {
      skuCode: roastedProducts[0]?.skuCode ?? 'RC-CH-ESP80',
      productName:
        roastedProducts[0]?.itemName ?? 'بلند اسپرسو اختصاصی چیلسر ۸۰-۲۰',
      grindType: 'WHOLE_BEAN',
      packWeightGr: 1000,
      quantity: 10,
      unitPrice: roastedProducts[0]?.unitCost ?? 1380000,
    },
  ]);

  // Open modal automatically if navigated from Dashboard CTA (?new=1)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.location.search.includes('new=1')) {
      return;
    }
    const timer = window.setTimeout(() => setModalOpen(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.orders.filter((o) => {
      const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
      const matchQ =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q);
      return matchStatus && matchQ;
    });
  }, [state.orders, statusFilter, query]);

  const subtotalAmount = lines.reduce(
    (acc, line) => acc + Math.round((line.unitPrice * (line.packWeightGr / 1000)) * line.quantity),
    0
  );
  const totalAmount = Math.max(0, subtotalAmount - (Number(discountAmount) || 0));

  const addDraftLine = () => {
    const first = roastedProducts[0];
    setLines((prev) => [
      ...prev,
      {
        skuCode: first?.skuCode ?? 'RC-CH-ESP80',
        productName: first?.itemName ?? 'بلند اسپرسو اختصاصی چیلسر ۸۰-۲۰',
        grindType: 'WHOLE_BEAN',
        packWeightGr: 1000,
        quantity: 5,
        unitPrice: first?.unitCost ?? 1380000,
      },
    ]);
  };

  const updateLine = (idx: number, patch: Partial<DraftOrderLine>) => {
    setLines((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, ...patch } : l))
    );
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = state.customers.find((c) => c.id === customerId) ?? state.customers[0];
    if (!customer || lines.length === 0) return;

    const preparedItems = lines.map((line, i) => {
      const unitForPack = Math.round(line.unitPrice * (line.packWeightGr / 1000));
      return {
        id: `draft-${i}`,
        orderId: '',
        skuCode: line.skuCode,
        productName: line.productName,
        grindType: line.grindType,
        packWeightGr: line.packWeightGr,
        quantity: line.quantity,
        unitPrice: unitForPack,
        lineTotal: unitForPack * line.quantity,
      };
    });

    addOrder({
      customerId: customer.id,
      customerName: `${customer.companyName} (${customer.fullName})`,
      orderDate: new Date().toISOString(),
      status: 'PENDING',
      paymentStatus,
      subtotalAmount,
      discountAmount: Number(discountAmount) || 0,
      totalAmount,
      notes: notes.trim() || undefined,
      items: preparedItems,
    });

    setDiscountAmount('0');
    setNotes('');
    setModalOpen(false);
  };

  const handleExportOrders = () => {
    exportRowsToCsv(
      'chilser-orders',
      ['شماره سفارش', 'مشتری', 'تاریخ', 'وضعیت', 'پرداخت', 'مبلغ کل (تومان)'],
      filtered.map((o) => [
        o.orderNumber,
        o.customerName,
        formatShamsiShort(o.orderDate),
        STATUS_LABELS[o.status],
        o.paymentStatus,
        o.totalAmount,
      ])
    );
    pushToast('گزارش سفارش‌ها (CSV) دانلود شد');
  };

  const totalSalesAmount = state.orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  return (
    <AppShell>
      <PageHeader
        title="سفارش‌ها و فروش"
        subtitle="ثبت سفارش چندقلمی قهوه، انتخاب نوع آسیاب و وزن بسته با کسر هوشمند از انبار"
        actions={
          <>
            <button
              type="button"
              onClick={handleExportOrders}
              className="px-5 py-2.5 rounded-full bg-[#FFFEFC] text-[#29231F] text-sm font-medium shadow-sm inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-[#4B2E24]" />
              <span>خروجی CSV</span>
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-6 py-2.5 rounded-full bg-[#C47A3C] hover:bg-[#AF682E] text-[#FFFEFC] text-sm font-bold inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت سفارش جدید</span>
            </button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <KpiCard
          title="مجموع فروش ثبت‌شده"
          value={formatToman(totalSalesAmount, false)}
          unit="تومان"
          badgeTone="copper"
          icon={<CreditCard className="w-5 h-5" />}
        />
        <KpiCard
          title="سفارش‌های در حال آماده‌سازی"
          value={formatNumber(
            state.orders.filter(
              (o) => o.status === 'PENDING' || o.status === 'PREPARING'
            ).length,
            0
          )}
          unit="سفارش"
          badgeTone="amber"
          icon={<ClipboardList className="w-5 h-5" />}
        />
        <KpiCard
          title="ارسال‌شده و تحویل‌شده"
          value={formatNumber(
            state.orders.filter(
              (o) => o.status === 'SHIPPED' || o.status === 'DELIVERED'
            ).length,
            0
          )}
          unit="سفارش"
          badgeTone="olive"
          icon={<Truck className="w-5 h-5" />}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <FilterTabs
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'ALL', label: 'همه', count: state.orders.length },
            { value: 'PENDING', label: 'در انتظار', count: state.orders.filter((o) => o.status === 'PENDING').length },
            { value: 'PREPARING', label: 'آماده‌سازی', count: state.orders.filter((o) => o.status === 'PREPARING').length },
            { value: 'SHIPPED', label: 'ارسال‌شده', count: state.orders.filter((o) => o.status === 'SHIPPED').length },
            { value: 'DELIVERED', label: 'تحویل‌شده', count: state.orders.filter((o) => o.status === 'DELIVERED').length },
          ]}
        />
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="جستجوی شماره سفارش یا مشتری..."
          className="w-full md:w-72"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-[#FFFEFC] rounded-3xl p-6 shadow-[0_2px_12px_rgba(41,35,31,0.035)]">
        {filtered.length === 0 ? (
          <EmptyState
            title="سفارشی یافت نشد"
            description="سفارش جدیدی ثبت کنید تا به صورت خودکار از انبار محصول کسر و مرسوله آن ایجاد شود."
            actionLabel="ثبت سفارش جدید"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="border-b border-[#4B2E24]/8 text-xs text-[#786D65]">
                  <th className="py-3 text-start pe-3">شماره سفارش</th>
                  <th className="py-3 text-start px-3">مشتری</th>
                  <th className="py-3 text-start px-3">اقلام و آسیاب</th>
                  <th className="py-3 text-start px-3">تاریخ</th>
                  <th className="py-3 text-start px-3">مبلغ کل</th>
                  <th className="py-3 text-start px-3">پرداخت</th>
                  <th className="py-3 text-start px-3">وضعیت سفارش</th>
                  <th className="py-3 text-end ps-3">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4B2E24]/6 text-xs">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F7F4EF]/60">
                    <td className="py-4 pe-3 font-bold text-[#4B2E24] tabular-nums whitespace-nowrap">
                      {order.orderNumber}
                    </td>
                    <td className="py-4 px-3 font-medium text-[#29231F]">
                      {order.customerName}
                    </td>
                    <td className="py-4 px-3 text-[#786D65]">
                      {order.items.map((it) => (
                        <div key={it.id} className="leading-relaxed">
                          <span className="text-[#29231F] font-medium">
                            {it.productName}
                          </span>{' '}
                          · {GRIND_LABELS[it.grindType]} ·{' '}
                          <span className="tabular-nums">
                            {formatNumber(it.quantity, 0)} ×{' '}
                            {it.packWeightGr >= 1000
                              ? `${it.packWeightGr / 1000} کیلو`
                              : `${it.packWeightGr} گرم`}
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="py-4 px-3 text-[#786D65] tabular-nums whitespace-nowrap">
                      {formatShamsiShort(order.orderDate)}
                    </td>
                    <td className="py-4 px-3 font-bold text-[#29231F] tabular-nums whitespace-nowrap">
                      {formatToman(order.totalAmount)}
                    </td>
                    <td className="py-4 px-3">
                      <StatusBadge
                        label={
                          order.paymentStatus === 'PAID'
                            ? 'تسویه‌شده'
                            : order.paymentStatus === 'PARTIAL'
                            ? 'علی‌الحساب'
                            : 'پرداخت‌نشده'
                        }
                        tone={
                          order.paymentStatus === 'PAID'
                            ? 'success'
                            : order.paymentStatus === 'PARTIAL'
                            ? 'warning'
                            : 'danger'
                        }
                      />
                    </td>
                    <td className="py-4 px-3">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value as OrderStatus)
                        }
                        aria-label={`تغییر وضعیت سفارش ${order.orderNumber}`}
                        className="bg-[#F7F4EF] rounded-xl px-2.5 py-1.5 text-xs font-medium text-[#29231F] focus:outline-none focus:ring-2 focus:ring-[#C47A3C]/40"
                      >
                        {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((st) => (
                          <option key={st} value={st}>
                            {STATUS_LABELS[st]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 ps-3 text-end whitespace-nowrap">
                      {order.paymentStatus !== 'PAID' ? (
                        <button
                          type="button"
                          onClick={() => markOrderPaid(order.id)}
                          className="px-3.5 py-1.5 rounded-full bg-[#5E7C52]/12 hover:bg-[#5E7C52]/20 text-[#5E7C52] font-bold inline-flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ثبت تسویه</span>
                        </button>
                      ) : (
                        <span className="text-[#786D65]">ثبت در مالی</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="ثبت سفارش فروش جدید"
        subtitle="پس از ثبت، موجودی انبار محصول کسر و مرسوله ارسال ایجاد می‌شود"
        maxWidthClass="max-w-3xl"
      >
        <form onSubmit={handleSubmitOrder} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5">انتخاب مشتری *</label>
              <select
                name="customerId"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              >
                {state.customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName} ({c.fullName}) — {c.city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">وضعیت پرداخت</label>
              <select
                name="paymentStatus"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              >
                <option value="PAID">تسویه نقدی / کارت‌به‌کارت (ثبت خودکار دریافت مالی)</option>
                <option value="PARTIAL">پیش‌پرداخت / علی‌الحساب</option>
                <option value="UNPAID">اعتباری / پرداخت‌نشده</option>
              </select>
            </div>
          </div>

          {/* Dynamic Coffee Order Lines */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4B2E24]">اقلام سفارش قهوه</span>
              <button
                type="button"
                onClick={addDraftLine}
                className="text-xs font-bold text-[#C47A3C] hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن ردیف کالا</span>
              </button>
            </div>

            {lines.map((line, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#F7F4EF] grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
              >
                <div className="sm:col-span-4">
                  <label className="block text-[11px] text-[#786D65] mb-1">محصول قهوه</label>
                  <select
                    value={line.skuCode}
                    onChange={(e) => {
                      const found = roastedProducts.find((p) => p.skuCode === e.target.value);
                      if (found) {
                        updateLine(idx, {
                          skuCode: found.skuCode,
                          productName: found.itemName,
                          unitPrice: found.unitCost,
                        });
                      }
                    }}
                    className="w-full bg-[#FFFEFC] rounded-xl px-3 py-2 text-xs"
                  >
                    {roastedProducts.map((p) => (
                      <option key={p.id} value={p.skuCode}>
                        {p.itemName} (موجودی: {formatNumber(p.currentStock, 1)} کیلو)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] text-[#786D65] mb-1">نوع آسیاب</label>
                  <select
                    value={line.grindType}
                    onChange={(e) =>
                      updateLine(idx, { grindType: e.target.value as GrindType })
                    }
                    className="w-full bg-[#FFFEFC] rounded-xl px-3 py-2 text-xs"
                  >
                    {(Object.keys(GRIND_LABELS) as GrindType[]).map((g) => (
                      <option key={g} value={g}>
                        {GRIND_LABELS[g]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-[#786D65] mb-1">وزن بسته</label>
                  <select
                    value={line.packWeightGr}
                    onChange={(e) =>
                      updateLine(idx, { packWeightGr: Number(e.target.value) })
                    }
                    className="w-full bg-[#FFFEFC] rounded-xl px-3 py-2 text-xs tabular-nums"
                  >
                    <option value={250}>۲۵۰ گرم</option>
                    <option value={500}>۵۰۰ گرم</option>
                    <option value={1000}>۱ کیلوگرم</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-[#786D65] mb-1">تعداد بسته</label>
                  <input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(e) =>
                      updateLine(idx, { quantity: Math.max(1, Number(e.target.value)) })
                    }
                    className="w-full bg-[#FFFEFC] rounded-xl px-3 py-2 text-xs tabular-nums"
                  />
                </div>

                <div className="sm:col-span-1 flex justify-end">
                  {lines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setLines((prev) => prev.filter((_, i) => i !== idx))}
                      className="w-8 h-8 rounded-xl bg-[#B84A3A]/10 text-[#B84A3A] flex items-center justify-center"
                      aria-label="حذف ردیف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5">تخفیف (تومان)</label>
              <input
                type="number"
                min={0}
                name="discountAmount"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">یادداشت ارسال / برشته‌کاری</label>
              <input
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: ارسال با تاریخ رُست روز"
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-[#4B2E24] text-[#FFFEFC] flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-[#D4C9C1]">
              جمع جزء:{' '}
              <span className="tabular-nums font-bold text-white">
                {formatToman(subtotalAmount)}
              </span>
            </div>
            <div className="text-base font-bold tabular-nums">
              مبلغ قابل پرداخت: {formatToman(totalAmount)}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 rounded-full bg-[#F7F4EF] text-sm font-medium"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#C47A3C] hover:bg-[#AF682E] text-[#FFFEFC] text-sm font-bold"
            >
              ثبت نهایی سفارش
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
