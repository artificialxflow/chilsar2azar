'use client';

import React, { useMemo, useState } from 'react';
import {
  Building2,
  MapPin,
  MessageSquarePlus,
  Phone,
  Plus,
  Star,
  Users,
  Wallet,
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
  Customer,
  CustomerSegment,
  CustomerStatus,
  SEGMENT_LABELS,
} from '@/lib/mockData';
import { formatNumber, formatShamsiDate, formatToman } from '@/lib/formatters';

export default function CustomersPage() {
  const { state, addCustomer, addCustomerInteraction } = useChilserStore();
  const [segmentFilter, setSegmentFilter] = useState<'ALL' | CustomerSegment>('ALL');
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Add Customer form state (exact camelCase fields matching prisma/schema.prisma)
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [segment, setSegment] = useState<CustomerSegment>('CAFE');
  const [mobile, setMobile] = useState('');
  const [city, setCity] = useState('تهران');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState('50000000');
  const [status, setStatus] = useState<CustomerStatus>('ACTIVE');
  const [notes, setNotes] = useState('');

  // Interaction form
  const [intChannel, setIntChannel] =
    useState<Customer['interactions'][number]['channel']>('تماس تلفنی');
  const [intSummary, setIntSummary] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.customers.filter((c) => {
      const matchSeg = segmentFilter === 'ALL' || c.segment === segmentFilter;
      const matchQ =
        !q ||
        c.companyName.toLowerCase().includes(q) ||
        c.fullName.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.customerCode.toLowerCase().includes(q);
      return matchSeg && matchQ;
    });
  }, [state.customers, segmentFilter, query]);

  const totalRevenue = state.customers.reduce((acc, c) => acc + c.totalSpent, 0);
  const vipCount = state.customers.filter((c) => c.status === 'VIP').length;

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !companyName.trim() || !mobile.trim()) return;
    addCustomer({
      fullName: fullName.trim(),
      companyName: companyName.trim(),
      segment,
      mobile: mobile.trim(),
      city: city.trim() || 'تهران',
      address: address.trim() || 'ثبت نشده',
      creditLimit: Number(creditLimit) || 0,
      status,
      notes: notes.trim() || undefined,
    });
    setFullName('');
    setCompanyName('');
    setMobile('');
    setAddress('');
    setNotes('');
    setModalOpen(false);
  };

  const handleAddInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !intSummary.trim()) return;
    addCustomerInteraction(selectedCustomer.id, intChannel, intSummary.trim());
    setIntSummary('');
  };

  const activeCustomerDetail = selectedCustomer
    ? state.customers.find((c) => c.id === selectedCustomer.id) ?? null
    : null;

  return (
    <AppShell>
      <PageHeader
        title="مشتریان و CRM"
        subtitle="مدیریت کافه‌ها، عمده‌فروشان، مشتریان سازمانی و سوابق ارتباط با مشتری"
        actions={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-6 py-2.5 rounded-full bg-[#C47A3C] hover:bg-[#AF682E] text-[#FFFEFC] text-sm font-bold inline-flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن مشتری جدید</span>
          </button>
        }
      />

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <KpiCard
          title="کل مشتریان ثبت‌شده"
          value={formatNumber(state.customers.length, 0)}
          unit="مجموعه"
          badgeTone="espresso"
          icon={<Users className="w-5 h-5" />}
        />
        <KpiCard
          title="مشتریان ویژه (VIP)"
          value={formatNumber(vipCount, 0)}
          unit="کافه و پخش"
          badgeTone="copper"
          icon={<Star className="w-5 h-5" />}
        />
        <KpiCard
          title="حجم خرید تجمیعی مشتریان"
          value={formatToman(totalRevenue, false)}
          unit="تومان"
          badgeTone="olive"
          icon={<Wallet className="w-5 h-5" />}
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <FilterTabs
          value={segmentFilter}
          onChange={setSegmentFilter}
          options={[
            { value: 'ALL', label: 'همه', count: state.customers.length },
            {
              value: 'CAFE',
              label: 'کافه تخصصی',
              count: state.customers.filter((c) => c.segment === 'CAFE').length,
            },
            {
              value: 'WHOLESALE',
              label: 'عمده‌فروش',
              count: state.customers.filter((c) => c.segment === 'WHOLESALE').length,
            },
            {
              value: 'CORPORATE',
              label: 'سازمانی',
              count: state.customers.filter((c) => c.segment === 'CORPORATE').length,
            },
          ]}
        />
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="جستجوی نام کافه، مدیر، شهر یا کد..."
          className="w-full md:w-72"
        />
      </div>

      {/* Customers Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#FFFEFC] rounded-3xl shadow-[0_2px_12px_rgba(41,35,31,0.035)]">
          <EmptyState
            title="مشتری با این مشخصات یافت نشد"
            description="فیلترها را تغییر دهید یا نخستین مشتری جدید چیلسر را ثبت کنید."
            actionLabel="ثبت مشتری جدید"
            onAction={() => setModalOpen(true)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((customer) => (
            <div
              key={customer.id}
              className="bg-[#FFFEFC] rounded-3xl p-6 shadow-[0_2px_12px_rgba(41,35,31,0.035)] flex flex-col justify-between hover:shadow-[0_6px_20px_rgba(75,46,36,0.07)] transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-[#786D65] tabular-nums">
                      {customer.customerCode} · {SEGMENT_LABELS[customer.segment]}
                    </p>
                    <h3 className="text-base font-bold text-[#29231F] mt-1">
                      {customer.companyName}
                    </h3>
                    <p className="text-xs text-[#786D65] mt-0.5">
                      {customer.fullName}
                    </p>
                  </div>
                  <StatusBadge
                    label={
                      customer.status === 'VIP'
                        ? 'مشتری ویژه'
                        : customer.status === 'ACTIVE'
                        ? 'فعال'
                        : 'غیرفعال'
                    }
                    tone={
                      customer.status === 'VIP'
                        ? 'copper'
                        : customer.status === 'ACTIVE'
                        ? 'success'
                        : 'neutral'
                    }
                  />
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-[#786D65]">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#C47A3C]" />
                    <span dir="ltr" className="tabular-nums">
                      {customer.mobile}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#C47A3C]" />
                    <span className="truncate">
                      {customer.city} — {customer.address}
                    </span>
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#4B2E24]/8 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#786D65] block">مجموع خرید</span>
                    <strong className="text-[#29231F] tabular-nums mt-0.5 block">
                      {formatToman(customer.totalSpent)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#786D65] block">تعداد سفارش</span>
                    <strong className="text-[#29231F] tabular-nums mt-0.5 block">
                      {formatNumber(customer.ordersCount, 0)} سفارش
                    </strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(customer)}
                className="mt-5 w-full py-2.5 rounded-full bg-[#F7F4EF] hover:bg-[#EDE6DC] text-[#4B2E24] text-xs font-bold transition-colors inline-flex items-center justify-center gap-2"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>پرونده مشتری و ثبت تعامل</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Customer Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="ثبت مشتری جدید"
        subtitle="اطلاعات کافه، عمده‌فروش یا شرکت طرف قرارداد"
      >
        <form onSubmit={handleAddCustomer} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#29231F] mb-1.5">
                نام مجموعه / کافه *
              </label>
              <input
                required
                name="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="مثال: کافه تخصصی دارچین"
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C47A3C]/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#29231F] mb-1.5">
                نام و نام خانوادگی مسئول *
              </label>
              <input
                required
                name="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="مثال: آرمان شفیعی"
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C47A3C]/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#29231F] mb-1.5">
                شماره موبایل *
              </label>
              <input
                required
                name="mobile"
                dir="ltr"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="09120000000"
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm text-left tabular-nums focus:outline-none focus:ring-2 focus:ring-[#C47A3C]/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#29231F] mb-1.5">
                دسته‌بندی مشتری
              </label>
              <select
                name="segment"
                value={segment}
                onChange={(e) => setSegment(e.target.value as CustomerSegment)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C47A3C]/50"
              >
                <option value="CAFE">کافه تخصصی</option>
                <option value="WHOLESALE">عمده‌فروش</option>
                <option value="CORPORATE">سازمانی</option>
                <option value="RETAIL">مصرف‌کننده نهایی</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#29231F] mb-1.5">
                شهر
              </label>
              <input
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C47A3C]/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#29231F] mb-1.5">
                سقف اعتبار (تومان)
              </label>
              <input
                type="number"
                name="creditLimit"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-[#C47A3C]/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#29231F] mb-1.5">
              نشانی کامل
            </label>
            <input
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="خیابان، پلاک، واحد"
              className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C47A3C]/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#29231F] mb-1.5">
                وضعیت مشتری
              </label>
              <select
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as CustomerStatus)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C47A3C]/50"
              >
                <option value="ACTIVE">فعال</option>
                <option value="VIP">مشتری ویژه (VIP)</option>
                <option value="INACTIVE">غیرفعال</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#29231F] mb-1.5">
                یادداشت پروفیل مصرف قهوه
              </label>
              <input
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: مصرف هفتگی ۲۰ کیلو بلند اسپرسو"
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C47A3C]/50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 rounded-full bg-[#F7F4EF] text-[#29231F] text-sm font-medium"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#C47A3C] hover:bg-[#AF682E] text-[#FFFEFC] text-sm font-bold"
            >
              ذخیره مشتری
            </button>
          </div>
        </form>
      </Modal>

      {/* Customer Detail & CRM Interactions Modal */}
      <Modal
        open={Boolean(activeCustomerDetail)}
        onClose={() => setSelectedCustomer(null)}
        title={activeCustomerDetail?.companyName ?? ''}
        subtitle={
          activeCustomerDetail
            ? `${activeCustomerDetail.fullName} · ${activeCustomerDetail.customerCode} · ${activeCustomerDetail.city}`
            : ''
        }
        maxWidthClass="max-w-2xl"
      >
        {activeCustomerDetail && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-[#F7F4EF] rounded-2xl p-4 text-xs">
              <div>
                <span className="text-[#786D65] block">مجموع خرید</span>
                <strong className="text-[#29231F] tabular-nums mt-1 block">
                  {formatToman(activeCustomerDetail.totalSpent)}
                </strong>
              </div>
              <div>
                <span className="text-[#786D65] block">سقف اعتبار</span>
                <strong className="text-[#29231F] tabular-nums mt-1 block">
                  {formatToman(activeCustomerDetail.creditLimit)}
                </strong>
              </div>
              <div>
                <span className="text-[#786D65] block">آخرین سفارش</span>
                <strong className="text-[#29231F] tabular-nums mt-1 block">
                  {formatShamsiDate(activeCustomerDetail.lastOrderAt)}
                </strong>
              </div>
            </div>

            {activeCustomerDetail.notes && (
              <p className="text-xs text-[#29231F] bg-[#C47A3C]/8 rounded-2xl p-3.5 leading-relaxed">
                <strong>یادداشت فروش:</strong> {activeCustomerDetail.notes}
              </p>
            )}

            {/* Add Interaction Form */}
            <form onSubmit={handleAddInteraction} className="space-y-3">
              <h3 className="text-sm font-bold text-[#29231F] flex items-center gap-2">
                <MessageSquarePlus className="w-4 h-4 text-[#C47A3C]" />
                <span>ثبت تعامل یا پیگیری جدید</span>
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={intChannel}
                  onChange={(e) =>
                    setIntChannel(
                      e.target.value as Customer['interactions'][number]['channel']
                    )
                  }
                  className="bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-xs font-medium"
                >
                  <option value="تماس تلفنی">تماس تلفنی</option>
                  <option value="جلسه حضوری">جلسه حضوری</option>
                  <option value="ارسال نمونه">ارسال نمونه</option>
                  <option value="پیام‌رسان">پیام‌رسان</option>
                </select>
                <input
                  value={intSummary}
                  onChange={(e) => setIntSummary(e.target.value)}
                  placeholder="خلاصه تماس، درخواست نمونه یا نتیجه جلسه..."
                  className="flex-1 bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#C47A3C]/50"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#4B2E24] text-[#FFFEFC] text-xs font-bold whitespace-nowrap"
                >
                  ثبت تعامل
                </button>
              </div>
            </form>

            {/* Interaction History */}
            <div>
              <h3 className="text-xs font-bold text-[#786D65] mb-3">
                تاریخچه تعاملات ({formatNumber(activeCustomerDetail.interactions.length, 0)})
              </h3>
              {activeCustomerDetail.interactions.length === 0 ? (
                <p className="text-xs text-[#786D65] py-4 text-center bg-[#F7F4EF]/60 rounded-2xl">
                  هنوز تعاملی برای این مشتری ثبت نشده است.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {activeCustomerDetail.interactions.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-[#F7F4EF]/70 text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px] text-[#786D65] mb-1">
                        <span className="font-bold text-[#4B2E24]">
                          {item.channel} · {item.authorName}
                        </span>
                        <span className="tabular-nums">
                          {formatShamsiDate(item.date)}
                        </span>
                      </div>
                      <p className="text-[#29231F] leading-relaxed">
                        {item.summary}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
