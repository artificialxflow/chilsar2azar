'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Download,
  Plus,
  Wallet,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import {
  FilterTabs,
  KpiCard,
  Modal,
  PageHeader,
  SearchInput,
  StatusBadge,
} from '@/components/ui/Primitives';
import { useChilserStore } from '@/lib/store';
import {
  PaymentMethod,
  TransactionStatus,
  TransactionType,
} from '@/lib/mockData';
import {
  exportRowsToCsv,
  formatShamsiShort,
  formatToman,
} from '@/lib/formatters';

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  BANK_TRANSFER: 'انتقال بانکی / پایا',
  POS: 'کارت‌خوان',
  CHEQUE: 'چک صیادی',
  CASH: 'نقدی',
};

const TYPE_LABELS: Record<TransactionType, string> = {
  RECEIPT: 'دریافت (ورودی)',
  PAYMENT: 'پرداخت به تأمین‌کننده',
  EXPENSE: 'هزینه جاری کارگاه',
};

export default function AccountingPage() {
  const { state, addTransaction, updateTransactionStatus, pushToast } =
    useChilserStore();
  const [typeFilter, setTypeFilter] = useState<'ALL' | TransactionType>('ALL');
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Add Transaction Form
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [category, setCategory] = useState('انرژی و کارگاه');
  const [title, setTitle] = useState('');
  const [counterparty, setCounterparty] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [status, setStatus] = useState<TransactionStatus>('SETTLED');
  const [referenceCode, setReferenceCode] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.transactions.filter((t) => {
      const matchType = typeFilter === 'ALL' || t.type === typeFilter;
      const matchQ =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.counterparty.toLowerCase().includes(q) ||
        t.transactionCode.toLowerCase().includes(q);
      return matchType && matchQ;
    });
  }, [state.transactions, typeFilter, query]);

  const totalReceipts = state.transactions
    .filter((t) => t.type === 'RECEIPT')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalOutflow = state.transactions
    .filter((t) => t.type === 'PAYMENT' || t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);
  const netBalance = totalReceipts - totalOutflow;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !counterparty.trim() || !amount) return;
    addTransaction({
      type,
      category,
      title: title.trim(),
      counterparty: counterparty.trim(),
      amount: Number(amount) || 0,
      paymentMethod,
      status,
      referenceCode: referenceCode.trim() || undefined,
      transactionDate: new Date().toISOString(),
    });
    setTitle('');
    setCounterparty('');
    setAmount('');
    setReferenceCode('');
    setModalOpen(false);
  };

  const handleExport = () => {
    exportRowsToCsv(
      'chilser-accounting-ledger',
      ['کد سند', 'نوع', 'شرح', 'طرف حساب', 'روش پرداخت', 'تاریخ', 'مبلغ (تومان)', 'وضعیت'],
      filtered.map((t) => [
        t.transactionCode,
        TYPE_LABELS[t.type],
        t.title,
        t.counterparty,
        PAYMENT_METHOD_LABELS[t.paymentMethod],
        formatShamsiShort(t.transactionDate),
        t.amount,
        t.status,
      ])
    );
    pushToast('دفتر کل مالی (CSV) دانلود شد');
  };

  return (
    <AppShell>
      <PageHeader
        title="حسابداری و امور مالی"
        subtitle="مدیریت دریافت‌های فروش، پرداخت‌های خرید دانه سبز، هزینه‌های کارگاه و تراز نقدینگی"
        actions={
          <>
            <button
              type="button"
              onClick={handleExport}
              className="px-5 py-2.5 rounded-full bg-[#FFFEFC] text-[#29231F] text-sm font-medium shadow-sm inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-[#4B2E24]" />
              <span>خروجی دفتر مالی</span>
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-6 py-2.5 rounded-full bg-[#C47A3C] hover:bg-[#AF682E] text-[#FFFEFC] text-sm font-bold inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت سند مالی جدید</span>
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <KpiCard
          title="مجموع دریافت‌ها"
          value={formatToman(totalReceipts, false)}
          unit="تومان"
          badgeTone="olive"
          icon={<ArrowDownLeft className="w-5 h-5" />}
        />
        <KpiCard
          title="مجموع پرداخت‌ها و هزینه‌ها"
          value={formatToman(totalOutflow, false)}
          unit="تومان"
          badgeTone="brick"
          icon={<ArrowUpRight className="w-5 h-5" />}
        />
        <KpiCard
          title="تراز خالص نقدینگی"
          value={formatToman(netBalance, false)}
          unit="تومان"
          badgeTone={netBalance >= 0 ? 'copper' : 'brick'}
          icon={<Wallet className="w-5 h-5" />}
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <FilterTabs
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { value: 'ALL', label: 'همه اسناد', count: state.transactions.length },
            { value: 'RECEIPT', label: 'دریافت‌ها', count: state.transactions.filter((t) => t.type === 'RECEIPT').length },
            { value: 'PAYMENT', label: 'پرداخت‌ها', count: state.transactions.filter((t) => t.type === 'PAYMENT').length },
            { value: 'EXPENSE', label: 'هزینه‌های جاری', count: state.transactions.filter((t) => t.type === 'EXPENSE').length },
          ]}
        />
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="جستجوی شرح سند، کد یا طرف حساب..."
          className="w-full md:w-72"
        />
      </div>

      <div className="bg-[#FFFEFC] rounded-3xl p-6 shadow-[0_2px_12px_rgba(41,35,31,0.035)] overflow-x-auto">
        <table className="w-full text-start border-collapse">
          <thead>
            <tr className="border-b border-[#4B2E24]/8 text-xs text-[#786D65]">
              <th className="py-3 text-start pe-3">کد سند</th>
              <th className="py-3 text-start px-3">نوع و دسته</th>
              <th className="py-3 text-start px-3">شرح و طرف حساب</th>
              <th className="py-3 text-start px-3">روش پرداخت</th>
              <th className="py-3 text-start px-3">تاریخ</th>
              <th className="py-3 text-start px-3">مبلغ</th>
              <th className="py-3 text-start px-3">وضعیت</th>
              <th className="py-3 text-end ps-3">اقدام</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#4B2E24]/6 text-xs">
            {filtered.map((trx) => (
              <tr key={trx.id} className="hover:bg-[#F7F4EF]/60">
                <td className="py-4 pe-3 font-bold text-[#4B2E24] tabular-nums whitespace-nowrap">
                  {trx.transactionCode}
                </td>
                <td className="py-4 px-3">
                  <StatusBadge
                    label={
                      trx.type === 'RECEIPT'
                        ? 'دریافت'
                        : trx.type === 'PAYMENT'
                        ? 'پرداخت'
                        : 'هزینه'
                    }
                    tone={
                      trx.type === 'RECEIPT'
                        ? 'success'
                        : trx.type === 'PAYMENT'
                        ? 'copper'
                        : 'warning'
                    }
                  />
                  <span className="block text-[11px] text-[#786D65] mt-1">
                    {trx.category}
                  </span>
                </td>
                <td className="py-4 px-3">
                  <span className="font-bold text-[#29231F] block">{trx.title}</span>
                  <span className="text-[#786D65]">
                    {trx.counterparty}
                    {trx.referenceCode ? ` · مرجع: ${trx.referenceCode}` : ''}
                  </span>
                </td>
                <td className="py-4 px-3 text-[#786D65]">
                  {PAYMENT_METHOD_LABELS[trx.paymentMethod]}
                </td>
                <td className="py-4 px-3 text-[#786D65] tabular-nums whitespace-nowrap">
                  {formatShamsiShort(trx.transactionDate)}
                </td>
                <td
                  className={`py-4 px-3 font-bold tabular-nums whitespace-nowrap ${
                    trx.type === 'RECEIPT' ? 'text-[#5E7C52]' : 'text-[#B84A3A]'
                  }`}
                >
                  {trx.type === 'RECEIPT' ? '+' : '-'} {formatToman(trx.amount)}
                </td>
                <td className="py-4 px-3">
                  <StatusBadge
                    label={
                      trx.status === 'SETTLED'
                        ? 'تسویه‌شده'
                        : trx.status === 'PENDING'
                        ? 'در انتظار'
                        : 'سررسید گذشته'
                    }
                    tone={
                      trx.status === 'SETTLED'
                        ? 'success'
                        : trx.status === 'PENDING'
                        ? 'warning'
                        : 'danger'
                    }
                  />
                </td>
                <td className="py-4 ps-3 text-end whitespace-nowrap">
                  {trx.status !== 'SETTLED' ? (
                    <button
                      type="button"
                      onClick={() => updateTransactionStatus(trx.id, 'SETTLED')}
                      className="px-3.5 py-1.5 rounded-full bg-[#5E7C52]/12 hover:bg-[#5E7C52]/20 text-[#5E7C52] font-bold inline-flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>تایید تسویه</span>
                    </button>
                  ) : (
                    <span className="text-[#786D65]">قطعی‌شده</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Financial Transaction Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="ثبت سند دریافت، پرداخت یا هزینه"
        subtitle="ثبت مستقیم در دفتر مالی عملیاتی چیلسر"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5">نوع سند</label>
              <select
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value as TransactionType)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              >
                <option value="RECEIPT">دریافت از مشتری</option>
                <option value="PAYMENT">پرداخت به تأمین‌کننده</option>
                <option value="EXPENSE">هزینه جاری کارگاه</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">دسته‌بندی هزینه/درآمد</label>
              <select
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              >
                <option value="فروش محصول">فروش محصول</option>
                <option value="خرید دانه سبز">خرید دانه سبز</option>
                <option value="انرژی و کارگاه">انرژی و کارگاه (برق/گاز رُستر)</option>
                <option value="اجاره و نگهداری">اجاره و نگهداری دستگاه</option>
                <option value="حمل و ارسال">حمل و ارسال</option>
                <option value="حقوق و دستمزد">حقوق و دستمزد</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5">شرح سند *</label>
            <input
              required
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: سرویس دوره‌ای درام رُستر پروبات"
              className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5">طرف حساب *</label>
              <input
                required
                name="counterparty"
                value={counterparty}
                onChange={(e) => setCounterparty(e.target.value)}
                placeholder="نام شرکت یا شخص"
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">مبلغ (تومان) *</label>
              <input
                required
                type="number"
                min={1000}
                name="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">روش پرداخت</label>
              <select
                name="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              >
                {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((m) => (
                  <option key={m} value={m}>
                    {PAYMENT_METHOD_LABELS[m]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">وضعیت سند</label>
              <select
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TransactionStatus)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              >
                <option value="SETTLED">تسویه‌شده</option>
                <option value="PENDING">در انتظار سررسید</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5">شماره مرجع / پیگیری (اختیاری)</label>
            <input
              name="referenceCode"
              value={referenceCode}
              onChange={(e) => setReferenceCode(e.target.value)}
              className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 rounded-full bg-[#F7F4EF] text-sm font-medium"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#C47A3C] text-[#FFFEFC] text-sm font-bold"
            >
              ثبت سند مالی
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
