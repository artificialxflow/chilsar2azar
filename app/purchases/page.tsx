'use client';

import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  PackageCheck,
  Phone,
  Plus,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import {
  FilterTabs,
  KpiCard,
  Modal,
  PageHeader,
  StatusBadge,
} from '@/components/ui/Primitives';
import { useChilserStore } from '@/lib/store';
import { SupplierCategory } from '@/lib/mockData';
import { formatNumber, formatShamsiShort, formatToman } from '@/lib/formatters';

export default function PurchasesPage() {
  const { state, addSupplier, addPurchaseOrder, receivePurchaseOrder } =
    useChilserStore();
  const [tab, setTab] = useState<'orders' | 'suppliers'>('orders');
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [supModalOpen, setSupModalOpen] = useState(false);

  const purchasableItems = useMemo(
    () =>
      state.inventory.filter(
        (i) => i.category === 'GREEN_BEAN' || i.category === 'PACKAGING'
      ),
    [state.inventory]
  );

  // PO Form
  const [supplierId, setSupplierId] = useState(state.suppliers[0]?.id ?? '');
  const [itemId, setItemId] = useState(purchasableItems[0]?.id ?? '');
  const [lotNumber, setLotNumber] = useState('LOT-1405-92');
  const [quantity, setQuantity] = useState('120');
  const [unitCost, setUnitCost] = useState('980000');

  // Supplier Form
  const [supplierName, setSupplierName] = useState('');
  const [contactName, setContactName] = useState('');
  const [mobile, setMobile] = useState('');
  const [category, setCategory] = useState<SupplierCategory>('GREEN_BEAN');
  const [originRegion, setOriginRegion] = useState('');

  const handleAddPo = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = state.suppliers.find((s) => s.id === supplierId) ?? state.suppliers[0];
    const item = purchasableItems.find((i) => i.id === itemId) ?? purchasableItems[0];
    if (!sup || !item) return;

    addPurchaseOrder({
      supplierId: sup.id,
      supplierName: sup.supplierName,
      itemId: item.id,
      itemName: item.itemName,
      lotNumber: lotNumber.trim() || 'LOT-NEW',
      quantity: Number(quantity) || 0,
      unit: item.unit,
      unitCost: Number(unitCost) || item.unitCost,
      status: 'ORDERED',
      orderDate: new Date().toISOString(),
    });
    setPoModalOpen(false);
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim() || !contactName.trim()) return;
    addSupplier({
      supplierName: supplierName.trim(),
      contactName: contactName.trim(),
      mobile: mobile.trim() || '09120000000',
      category,
      originRegion: originRegion.trim() || 'تهران',
      rating: 4.5,
      isActive: true,
    });
    setSupplierName('');
    setContactName('');
    setMobile('');
    setOriginRegion('');
    setSupModalOpen(false);
  };

  const totalPurchaseAmount = state.purchaseOrders.reduce(
    (acc, p) => acc + p.totalCost,
    0
  );

  return (
    <AppShell>
      <PageHeader
        title="خرید مواد اولیه و تأمین‌کنندگان"
        subtitle="تأمین دانه سبز و ملزومات بسته‌بندی با دریافت مستقیم به انبار و ثبت خودکار سند مالی"
        actions={
          <>
            <button
              type="button"
              onClick={() => setSupModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-[#FFFEFC] text-[#29231F] text-sm font-medium shadow-sm inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-[#4B2E24]" />
              <span>تأمین‌کننده جدید</span>
            </button>
            <button
              type="button"
              onClick={() => setPoModalOpen(true)}
              className="px-6 py-2.5 rounded-full bg-[#C47A3C] hover:bg-[#AF682E] text-[#FFFEFC] text-sm font-bold inline-flex items-center gap-2 whitespace-nowrap"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>ثبت سفارش خرید</span>
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <KpiCard
          title="مجموع سفارش‌های خرید"
          value={formatToman(totalPurchaseAmount, false)}
          unit="تومان"
          badgeTone="espresso"
          icon={<ShoppingBag className="w-5 h-5" />}
        />
        <KpiCard
          title="محموله‌های در راه / سفارش‌داده‌شده"
          value={formatNumber(
            state.purchaseOrders.filter(
              (p) => p.status === 'ORDERED' || p.status === 'IN_TRANSIT'
            ).length,
            0
          )}
          unit="محموله"
          badgeTone="amber"
          icon={<Truck className="w-5 h-5" />}
        />
        <KpiCard
          title="تأمین‌کنندگان فعال"
          value={formatNumber(state.suppliers.length, 0)}
          unit="شرکت"
          badgeTone="olive"
          icon={<PackageCheck className="w-5 h-5" />}
        />
      </div>

      <div className="mb-6">
        <FilterTabs
          value={tab}
          onChange={setTab}
          options={[
            { value: 'orders', label: 'سفارش‌های خرید', count: state.purchaseOrders.length },
            { value: 'suppliers', label: 'فهرست تأمین‌کنندگان', count: state.suppliers.length },
          ]}
        />
      </div>

      {tab === 'orders' ? (
        <div className="bg-[#FFFEFC] rounded-3xl p-6 shadow-[0_2px_12px_rgba(41,35,31,0.035)] overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="border-b border-[#4B2E24]/8 text-xs text-[#786D65]">
                <th className="py-3 text-start pe-3">شماره خرید / لات</th>
                <th className="py-3 text-start px-3">کالا و تأمین‌کننده</th>
                <th className="py-3 text-start px-3">مقدار</th>
                <th className="py-3 text-start px-3">مبلغ کل</th>
                <th className="py-3 text-start px-3">تاریخ سفارش</th>
                <th className="py-3 text-start px-3">وضعیت</th>
                <th className="py-3 text-end ps-3">اقدام</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4B2E24]/6 text-xs">
              {state.purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-[#F7F4EF]/60">
                  <td className="py-4 pe-3">
                    <span className="font-bold text-[#4B2E24] tabular-nums block">
                      {po.poNumber}
                    </span>
                    <span className="text-[11px] text-[#786D65] tabular-nums">
                      {po.lotNumber}
                    </span>
                  </td>
                  <td className="py-4 px-3">
                    <span className="font-bold text-[#29231F] block">
                      {po.itemName}
                    </span>
                    <span className="text-[#786D65]">{po.supplierName}</span>
                  </td>
                  <td className="py-4 px-3 font-bold tabular-nums whitespace-nowrap">
                    {formatNumber(po.quantity, 0)}{' '}
                    {po.unit === 'KG' ? 'کیلوگرم' : 'عدد'}
                  </td>
                  <td className="py-4 px-3 font-bold tabular-nums whitespace-nowrap">
                    {formatToman(po.totalCost)}
                  </td>
                  <td className="py-4 px-3 text-[#786D65] tabular-nums">
                    {formatShamsiShort(po.orderDate)}
                  </td>
                  <td className="py-4 px-3">
                    <StatusBadge
                      label={
                        po.status === 'RECEIVED'
                          ? 'دریافت‌شده در انبار'
                          : po.status === 'IN_TRANSIT'
                          ? 'در مسیر حمل'
                          : po.status === 'ORDERED'
                          ? 'ثبت‌شده'
                          : 'لغوشده'
                      }
                      tone={
                        po.status === 'RECEIVED'
                          ? 'success'
                          : po.status === 'IN_TRANSIT'
                          ? 'copper'
                          : 'warning'
                      }
                    />
                  </td>
                  <td className="py-4 ps-3 text-end whitespace-nowrap">
                    {po.status !== 'RECEIVED' ? (
                      <button
                        type="button"
                        onClick={() => receivePurchaseOrder(po.id)}
                        className="px-4 py-1.5 rounded-full bg-[#5E7C52] hover:bg-[#4D6843] text-[#FFFEFC] font-bold inline-flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تایید دریافت به انبار</span>
                      </button>
                    ) : (
                      <span className="text-[#5E7C52] font-medium tabular-nums">
                        دریافت: {formatShamsiShort(po.receivedDate)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {state.suppliers.map((sup) => (
            <div
              key={sup.id}
              className="bg-[#FFFEFC] rounded-3xl p-6 shadow-[0_2px_12px_rgba(41,35,31,0.035)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] text-[#786D65] tabular-nums">
                    {sup.supplierCode}
                  </span>
                  <h3 className="text-base font-bold text-[#29231F] mt-1">
                    {sup.supplierName}
                  </h3>
                  <p className="text-xs text-[#786D65] mt-0.5">{sup.contactName}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#C47A3C] tabular-nums">
                  <Star className="w-3.5 h-3.5 fill-[#C47A3C]" />
                  {formatNumber(sup.rating, 1)}
                </span>
              </div>
              <p className="text-xs text-[#4B2E24] bg-[#F7F4EF] rounded-2xl px-3.5 py-2.5 mt-4">
                حوزه تأمین: {sup.originRegion}
              </p>
              <p className="mt-4 text-xs text-[#786D65] flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C47A3C]" />
                <span dir="ltr" className="tabular-nums">
                  {sup.mobile}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add PO Modal */}
      <Modal
        open={poModalOpen}
        onClose={() => setPoModalOpen(false)}
        title="ثبت سفارش خرید مواد اولیه"
        subtitle="پس از تایید دریافت محموله، موجودی انبار و سند پرداخت به صورت خودکار ثبت می‌شود"
      >
        <form onSubmit={handleAddPo} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5">تأمین‌کننده</label>
            <select
              name="supplierId"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
            >
              {state.suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.supplierName} ({s.originRegion})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">کالای درخواستی</label>
            <select
              name="itemId"
              value={itemId}
              onChange={(e) => {
                setItemId(e.target.value);
                const found = purchasableItems.find((i) => i.id === e.target.value);
                if (found) setUnitCost(String(found.unitCost));
              }}
              className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
            >
              {purchasableItems.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.itemName}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5">شماره لات</label>
              <input
                name="lotNumber"
                dir="ltr"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm text-left"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">مقدار</label>
              <input
                type="number"
                min={1}
                name="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">قیمت واحد (تومان)</label>
              <input
                type="number"
                min={1000}
                name="unitCost"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm tabular-nums"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#4B2E24] text-[#FFFEFC] flex items-center justify-between text-sm font-bold tabular-nums">
            <span>برآورد جمع فاکتور خرید:</span>
            <span>{formatToman((Number(quantity) || 0) * (Number(unitCost) || 0))}</span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPoModalOpen(false)}
              className="px-5 py-2.5 rounded-full bg-[#F7F4EF] text-sm font-medium"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#C47A3C] text-[#FFFEFC] text-sm font-bold"
            >
              ثبت سفارش خرید
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Supplier Modal */}
      <Modal
        open={supModalOpen}
        onClose={() => setSupModalOpen(false)}
        title="افزودن تأمین‌کننده جدید"
        subtitle="ثبت واردکننده دانه سبز یا تولیدکننده ملزومات بسته‌بندی"
      >
        <form onSubmit={handleAddSupplier} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5">نام شرکت تأمین‌کننده *</label>
              <input
                required
                name="supplierName"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">نام رابط فروش *</label>
              <input
                required
                name="contactName"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">شماره تماس</label>
              <input
                name="mobile"
                dir="ltr"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm text-left tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">دسته تأمین</label>
              <select
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as SupplierCategory)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              >
                <option value="GREEN_BEAN">دانه سبز قهوه</option>
                <option value="PACKAGING">پاکت و بسته‌بندی</option>
                <option value="EQUIPMENT">تجهیزات و قطعات رُستر</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">خاستگاه یا منطقه فعالیت</label>
            <input
              name="originRegion"
              value={originRegion}
              onChange={(e) => setOriginRegion(e.target.value)}
              placeholder="مثال: واردات مستقیم برزیل و هند"
              className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSupModalOpen(false)}
              className="px-5 py-2.5 rounded-full bg-[#F7F4EF] text-sm font-medium"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#4B2E24] text-[#FFFEFC] text-sm font-bold"
            >
              ذخیره تأمین‌کننده
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
