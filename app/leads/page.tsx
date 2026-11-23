'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Columns3,
  List,
  Plus,
  Target,
  UserCheck,
  Wallet,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import {
  KpiCard,
  Modal,
  PageHeader,
  SearchInput,
  StatusBadge,
} from '@/components/ui/Primitives';
import { useChilserStore } from '@/lib/store';
import { LeadSource, LeadStage, SOURCE_LABELS } from '@/lib/mockData';
import { formatNumber, formatShamsiShort, formatToman } from '@/lib/formatters';

const STAGE_ORDER: Array<{ key: LeadStage; label: string }> = [
  { key: 'NEW', label: 'سرنخ جدید' },
  { key: 'CONTACTED', label: 'تماس اولیه' },
  { key: 'SAMPLE_SENT', label: 'ارسال نمونه قهوه' },
  { key: 'NEGOTIATION', label: 'مذاکره قیمت' },
  { key: 'CONVERTED', label: 'تبدیل‌شده' },
];

export default function LeadsPage() {
  const { state, addLead, updateLeadStage, convertLeadToCustomer } = useChilserStore();
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Add Lead form fields (camelCase matching prisma/schema.prisma)
  const [contactName, setContactName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [mobile, setMobile] = useState('');
  const [city, setCity] = useState('تهران');
  const [source, setSource] = useState<LeadSource>('EXHIBITION');
  const [estimatedValue, setEstimatedValue] = useState('40000000');
  const [sampleProduct, setSampleProduct] = useState('بلند اسپرسو اختصاصی چیلسر ۸۰-۲۰');
  const [notes, setNotes] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.leads.filter(
      (l) =>
        !q ||
        l.businessName.toLowerCase().includes(q) ||
        l.contactName.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q)
    );
  }, [state.leads, query]);

  const pipelineValue = state.leads
    .filter((l) => l.stage !== 'LOST')
    .reduce((acc, l) => acc + l.estimatedValue, 0);

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !businessName.trim()) return;
    addLead({
      contactName: contactName.trim(),
      businessName: businessName.trim(),
      mobile: mobile.trim() || '09120000000',
      city: city.trim() || 'تهران',
      source,
      stage: 'NEW',
      estimatedValue: Number(estimatedValue) || 0,
      sampleProduct: sampleProduct.trim() || undefined,
      assignedTo: 'سارا رادمنش',
      notes: notes.trim() || undefined,
    });
    setContactName('');
    setBusinessName('');
    setMobile('');
    setNotes('');
    setModalOpen(false);
  };

  const getNextStage = (stage: LeadStage): LeadStage | null => {
    const idx = STAGE_ORDER.findIndex((s) => s.key === stage);
    if (idx === -1 || idx >= STAGE_ORDER.length - 2) return null;
    return STAGE_ORDER[idx + 1].key;
  };

  return (
    <AppShell>
      <PageHeader
        title="سرنخ‌های فروش"
        subtitle="پیگیری فرصت‌های فروش، ارسال نمونه قهوه برای کافه‌ها و تبدیل به مشتری رسمی"
        actions={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-6 py-2.5 rounded-full bg-[#C47A3C] hover:bg-[#AF682E] text-[#FFFEFC] text-sm font-bold inline-flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت سرنخ جدید</span>
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <KpiCard
          title="فرصت‌های فعال پایپ‌لاین"
          value={formatNumber(
            state.leads.filter((l) => l.stage !== 'CONVERTED' && l.stage !== 'LOST').length,
            0
          )}
          unit="سرنخ"
          badgeTone="copper"
          icon={<Target className="w-5 h-5" />}
        />
        <KpiCard
          title="ارزش تخمینی پایپ‌لاین"
          value={formatToman(pipelineValue, false)}
          unit="تومان"
          badgeTone="espresso"
          icon={<Wallet className="w-5 h-5" />}
        />
        <KpiCard
          title="تبدیل‌شده به مشتری"
          value={formatNumber(
            state.leads.filter((l) => l.stage === 'CONVERTED').length,
            0
          )}
          unit="مشتری"
          badgeTone="olive"
          icon={<UserCheck className="w-5 h-5" />}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="جستجوی نام کافه، مخاطب یا شهر..."
          className="w-full sm:w-72"
        />
        <div className="inline-flex items-center gap-1 p-1 bg-[#EDE7DF]/80 rounded-2xl">
          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 ${
              viewMode === 'kanban'
                ? 'bg-[#FFFEFC] text-[#4B2E24] font-bold shadow-sm'
                : 'text-[#786D65]'
            }`}
          >
            <Columns3 className="w-3.5 h-3.5" />
            <span>نمای کانبان</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 ${
              viewMode === 'table'
                ? 'bg-[#FFFEFC] text-[#4B2E24] font-bold shadow-sm'
                : 'text-[#786D65]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>نمای جدولی</span>
          </button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {STAGE_ORDER.map((col) => {
            const items = filtered.filter((l) => l.stage === col.key);
            return (
              <div
                key={col.key}
                className="bg-[#EDE7DF]/55 rounded-3xl p-4 flex flex-col min-h-[340px]"
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-xs font-bold text-[#4B2E24]">{col.label}</h3>
                  <span className="text-[11px] text-[#786D65] tabular-nums">
                    {formatNumber(items.length, 0)}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {items.map((lead) => {
                    const next = getNextStage(lead.stage);
                    return (
                      <div
                        key={lead.id}
                        className="bg-[#FFFEFC] rounded-2xl p-4 shadow-[0_2px_10px_rgba(41,35,31,0.03)] space-y-2.5"
                      >
                        <div className="flex items-center justify-between text-[11px] text-[#786D65]">
                          <span className="tabular-nums">{lead.leadCode}</span>
                          <span>{SOURCE_LABELS[lead.source]}</span>
                        </div>
                        <h4 className="text-sm font-bold text-[#29231F]">
                          {lead.businessName}
                        </h4>
                        <p className="text-xs text-[#786D65]">
                          {lead.contactName} · {lead.city}
                        </p>
                        {lead.sampleProduct && (
                          <p className="text-[11px] text-[#4B2E24] bg-[#F7F4EF] rounded-xl px-2.5 py-1.5">
                            نمونه: {lead.sampleProduct}
                          </p>
                        )}
                        <p className="text-xs font-bold text-[#C47A3C] tabular-nums">
                          {formatToman(lead.estimatedValue)}
                        </p>

                        <div className="pt-2 border-t border-[#4B2E24]/8 flex flex-wrap gap-1.5">
                          {next && (
                            <button
                              type="button"
                              onClick={() => updateLeadStage(lead.id, next)}
                              className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#F7F4EF] hover:bg-[#EDE6DC] text-[#29231F] text-[11px] font-medium inline-flex items-center justify-center gap-1"
                            >
                              <span>مرحله بعد</span>
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}
                          {lead.stage !== 'CONVERTED' && (
                            <button
                              type="button"
                              onClick={() => convertLeadToCustomer(lead.id)}
                              className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#5E7C52]/12 hover:bg-[#5E7C52]/20 text-[#5E7C52] text-[11px] font-bold inline-flex items-center justify-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>تبدیل به مشتری</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#FFFEFC] rounded-3xl p-6 shadow-[0_2px_12px_rgba(41,35,31,0.035)] overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="border-b border-[#4B2E24]/8 text-xs text-[#786D65]">
                <th className="py-3 text-start pe-3">کد</th>
                <th className="py-3 text-start px-3">کسب‌وکار / مخاطب</th>
                <th className="py-3 text-start px-3">منبع</th>
                <th className="py-3 text-start px-3">ارزش تخمینی</th>
                <th className="py-3 text-start px-3">تاریخ</th>
                <th className="py-3 text-start px-3">مرحله</th>
                <th className="py-3 text-end ps-3">اقدام</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4B2E24]/6 text-xs">
              {filtered.map((lead) => (
                <tr key={lead.id} className="hover:bg-[#F7F4EF]/60">
                  <td className="py-3.5 pe-3 font-bold text-[#4B2E24] tabular-nums">
                    {lead.leadCode}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-[#29231F] block">
                      {lead.businessName}
                    </span>
                    <span className="text-[#786D65]">
                      {lead.contactName} · {lead.city}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-[#786D65]">
                    {SOURCE_LABELS[lead.source]}
                  </td>
                  <td className="py-3.5 px-3 font-bold tabular-nums">
                    {formatToman(lead.estimatedValue)}
                  </td>
                  <td className="py-3.5 px-3 text-[#786D65] tabular-nums">
                    {formatShamsiShort(lead.createdAt)}
                  </td>
                  <td className="py-3.5 px-3">
                    <StatusBadge
                      label={
                        STAGE_ORDER.find((s) => s.key === lead.stage)?.label ??
                        lead.stage
                      }
                      tone={
                        lead.stage === 'CONVERTED'
                          ? 'success'
                          : lead.stage === 'NEGOTIATION'
                          ? 'copper'
                          : 'neutral'
                      }
                    />
                  </td>
                  <td className="py-3.5 ps-3 text-end">
                    {lead.stage !== 'CONVERTED' ? (
                      <button
                        type="button"
                        onClick={() => convertLeadToCustomer(lead.id)}
                        className="px-3.5 py-1.5 rounded-full bg-[#5E7C52]/12 text-[#5E7C52] font-bold hover:bg-[#5E7C52]/20"
                      >
                        تبدیل به مشتری
                      </button>
                    ) : (
                      <span className="text-[#5E7C52] font-medium">ثبت‌شده در CRM</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Lead Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="ثبت سرنخ فروش جدید"
        subtitle="ثبت فرصت همکاری با کافه‌ها و خریداران عمده قهوه"
      >
        <form onSubmit={handleAddLead} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5">
                نام کافه یا کسب‌وکار *
              </label>
              <input
                required
                name="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="مثال: کافه تخصصی سرو"
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">
                نام مخاطب *
              </label>
              <input
                required
                name="contactName"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="مثال: کسری مجیدی"
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">موبایل</label>
              <input
                name="mobile"
                dir="ltr"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="0912..."
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm text-left tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">شهر</label>
              <input
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">منبع آشنایی</label>
              <select
                name="source"
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              >
                <option value="EXHIBITION">نمایشگاه قهوه</option>
                <option value="INSTAGRAM">اینستاگرام</option>
                <option value="REFERRAL">معرفی مشتریان</option>
                <option value="WEBSITE">وب‌سایت چیلسر</option>
                <option value="COLD_CALL">تماس مستقیم</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">
                ارزش تخمینی ماهانه (تومان)
              </label>
              <input
                type="number"
                name="estimatedValue"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5">
              محصول پیشنهادی برای ارسال نمونه
            </label>
            <input
              name="sampleProduct"
              value={sampleProduct}
              onChange={(e) => setSampleProduct(e.target.value)}
              className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5">توضیحات</label>
            <textarea
              rows={2}
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              ثبت سرنخ
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
