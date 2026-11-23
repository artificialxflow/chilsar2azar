'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle2, Clock, MapPin, Plus, Truck } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import {
  FilterTabs,
  KpiCard,
  Modal,
  PageHeader,
  StatusBadge,
} from '@/components/ui/Primitives';
import { useChilserStore } from '@/lib/store';
import { CARRIER_LABELS, CarrierName, ShipmentStatus } from '@/lib/mockData';
import { formatNumber, formatShamsiShort, formatToman } from '@/lib/formatters';

const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  READY: 'آماده ارسال',
  DISPATCHED: 'تحویل به حامل',
  IN_TRANSIT: 'در مسیر تحویل',
  DELIVERED: 'تحویل‌شده',
};

export default function ShippingPage() {
  const { state, addShipment, updateShipmentStatus } = useChilserStore();
  const [statusFilter, setStatusFilter] = useState<'ALL' | ShipmentStatus>('ALL');
  const [modalOpen, setModalOpen] = useState(false);

  const [orderId, setOrderId] = useState(state.orders[0]?.id ?? '');
  const [destinationCity, setDestinationCity] = useState('تهران');
  const [carrierName, setCarrierName] = useState<CarrierName>('CHILSER_COURIER');
  const [trackingCode, setTrackingCode] = useState('CH-904512');
  const [shippingCost, setShippingCost] = useState('450000');

  const filtered = useMemo(
    () =>
      state.shipments.filter(
        (s) => statusFilter === 'ALL' || s.status === statusFilter
      ),
    [state.shipments, statusFilter]
  );

  const delivered = state.shipments.filter((s) => s.status === 'DELIVERED');
  const avgHours =
    delivered.length > 0
      ? delivered.reduce((acc, s) => acc + (s.deliveryHours ?? 0), 0) /
        delivered.length
      : 0;

  const handleAddShipment = (e: React.FormEvent) => {
    e.preventDefault();
    const order = state.orders.find((o) => o.id === orderId) ?? state.orders[0];
    if (!order) return;
    addShipment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      destinationCity: destinationCity.trim() || 'تهران',
      carrierName,
      trackingCode: trackingCode.trim() || `CH-${Date.now().toString().slice(-6)}`,
      status: 'READY',
      shippingCost: Number(shippingCost) || 0,
    });
    setModalOpen(false);
  };

  return (
    <AppShell>
      <PageHeader
        title="ارسال و تحویل سفارش‌ها"
        subtitle="برنامه‌ریزی پیک اختصاصی، تیپاکس و باربری بین‌شهری با پایش زمان تحویل"
        actions={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-6 py-2.5 rounded-full bg-[#C47A3C] hover:bg-[#AF682E] text-[#FFFEFC] text-sm font-bold inline-flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت مرسوله جدید</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <KpiCard
          title="در مسیر / آماده ارسال"
          value={formatNumber(
            state.shipments.filter((s) => s.status !== 'DELIVERED').length,
            0
          )}
          unit="مرسوله"
          badgeTone="copper"
          icon={<Truck className="w-5 h-5" />}
        />
        <KpiCard
          title="تحویل موفق"
          value={formatNumber(delivered.length, 0)}
          unit="مرسوله"
          badgeTone="olive"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <KpiCard
          title="میانگین زمان تحویل"
          value={avgHours > 0 ? formatNumber(avgHours, 1) : '—'}
          unit="ساعت"
          badgeTone="espresso"
          icon={<Clock className="w-5 h-5" />}
        />
      </div>

      <div className="mb-6">
        <FilterTabs
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'ALL', label: 'همه مرسولات', count: state.shipments.length },
            { value: 'READY', label: 'آماده ارسال', count: state.shipments.filter((s) => s.status === 'READY').length },
            { value: 'DISPATCHED', label: 'تحویل به حامل', count: state.shipments.filter((s) => s.status === 'DISPATCHED').length },
            { value: 'IN_TRANSIT', label: 'در مسیر', count: state.shipments.filter((s) => s.status === 'IN_TRANSIT').length },
            { value: 'DELIVERED', label: 'تحویل‌شده', count: delivered.length },
          ]}
        />
      </div>

      <div className="bg-[#FFFEFC] rounded-3xl p-6 shadow-[0_2px_12px_rgba(41,35,31,0.035)] overflow-x-auto">
        <table className="w-full text-start border-collapse">
          <thead>
            <tr className="border-b border-[#4B2E24]/8 text-xs text-[#786D65]">
              <th className="py-3 text-start pe-3">کد مرسوله / سفارش</th>
              <th className="py-3 text-start px-3">مشتری و مقصد</th>
              <th className="py-3 text-start px-3">روش ارسال و رهگیری</th>
              <th className="py-3 text-start px-3">هزینه حمل</th>
              <th className="py-3 text-start px-3">زمان تحویل</th>
              <th className="py-3 text-start px-3">وضعیت</th>
              <th className="py-3 text-end ps-3">بروزرسانی مرحله</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#4B2E24]/6 text-xs">
            {filtered.map((shp) => (
              <tr key={shp.id} className="hover:bg-[#F7F4EF]/60">
                <td className="py-4 pe-3">
                  <span className="font-bold text-[#4B2E24] tabular-nums block">
                    {shp.shipmentCode}
                  </span>
                  <span className="text-[11px] text-[#786D65] tabular-nums">
                    {shp.orderNumber}
                  </span>
                </td>
                <td className="py-4 px-3">
                  <span className="font-bold text-[#29231F] block">
                    {shp.customerName}
                  </span>
                  <span className="text-[#786D65] inline-flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#C47A3C]" />
                    {shp.destinationCity}
                  </span>
                </td>
                <td className="py-4 px-3">
                  <span className="text-[#29231F] font-medium block">
                    {CARRIER_LABELS[shp.carrierName]}
                  </span>
                  <span className="text-[11px] text-[#786D65] tabular-nums" dir="ltr">
                    {shp.trackingCode}
                  </span>
                </td>
                <td className="py-4 px-3 font-medium tabular-nums whitespace-nowrap">
                  {formatToman(shp.shippingCost)}
                </td>
                <td className="py-4 px-3 text-[#786D65] tabular-nums whitespace-nowrap">
                  {shp.deliveredAt
                    ? `${formatShamsiShort(shp.deliveredAt)} (${formatNumber(shp.deliveryHours ?? 0, 1)} ساعت)`
                    : shp.dispatchedAt
                    ? `ارسال: ${formatShamsiShort(shp.dispatchedAt)}`
                    : '—'}
                </td>
                <td className="py-4 px-3">
                  <StatusBadge
                    label={SHIPMENT_STATUS_LABELS[shp.status]}
                    tone={
                      shp.status === 'DELIVERED'
                        ? 'success'
                        : shp.status === 'IN_TRANSIT' || shp.status === 'DISPATCHED'
                        ? 'copper'
                        : 'warning'
                    }
                  />
                </td>
                <td className="py-4 ps-3 text-end whitespace-nowrap">
                  {shp.status === 'READY' && (
                    <button
                      type="button"
                      onClick={() => updateShipmentStatus(shp.id, 'DISPATCHED')}
                      className="px-4 py-1.5 rounded-full bg-[#C47A3C] text-[#FFFEFC] font-bold"
                    >
                      ارسال مرسوله
                    </button>
                  )}
                  {(shp.status === 'DISPATCHED' || shp.status === 'IN_TRANSIT') && (
                    <button
                      type="button"
                      onClick={() => updateShipmentStatus(shp.id, 'DELIVERED')}
                      className="px-4 py-1.5 rounded-full bg-[#5E7C52] text-[#FFFEFC] font-bold"
                    >
                      تایید تحویل به مشتری
                    </button>
                  )}
                  {shp.status === 'DELIVERED' && (
                    <span className="text-[#5E7C52] font-medium">تحویل تکمیل شد</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Shipment Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="ثبت مرسوله ارسال جدید"
        subtitle="تخصیص کد رهگیری و روش حمل به سفارش مشتری"
      >
        <form onSubmit={handleAddShipment} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5">انتخاب سفارش</label>
            <select
              name="orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
            >
              {state.orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} — {o.customerName}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5">شهر مقصد</label>
              <input
                name="destinationCity"
                value={destinationCity}
                onChange={(e) => setDestinationCity(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">حامل / روش ارسال</label>
              <select
                name="carrierName"
                value={carrierName}
                onChange={(e) => setCarrierName(e.target.value as CarrierName)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              >
                {(Object.keys(CARRIER_LABELS) as CarrierName[]).map((c) => (
                  <option key={c} value={c}>
                    {CARRIER_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">کد رهگیری</label>
              <input
                name="trackingCode"
                dir="ltr"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm text-left"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">هزینه ارسال (تومان)</label>
              <input
                type="number"
                name="shippingCost"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm tabular-nums"
              />
            </div>
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
              ثبت مرسوله
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
