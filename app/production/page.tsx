'use client';

import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Flame,
  Gauge,
  PackageCheck,
  Play,
  Plus,
  Scale,
  Thermometer,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import {
  EmptyState,
  FilterTabs,
  KpiCard,
  Modal,
  PageHeader,
  StatusBadge,
} from '@/components/ui/Primitives';
import { useChilserStore } from '@/lib/store';
import {
  ROAST_PROFILE_LABELS,
  RoastBatch,
  RoastBatchStatus,
  RoastProfile,
} from '@/lib/mockData';
import {
  calculateWeightLossPct,
  formatNumber,
  formatShamsiShort,
} from '@/lib/formatters';

export default function ProductionPage() {
  const { state, addRoastBatch, advanceRoastBatch } = useChilserStore();
  const [statusFilter, setStatusFilter] = useState<'ALL' | RoastBatchStatus>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [completingBatch, setCompletingBatch] = useState<RoastBatch | null>(null);
  const [actualOutputKg, setActualOutputKg] = useState('');
  const [actualPacks, setActualPacks] = useState('');

  const greenBeans = useMemo(
    () => state.inventory.filter((i) => i.category === 'GREEN_BEAN'),
    [state.inventory]
  );
  const roastedSkus = useMemo(
    () => state.inventory.filter((i) => i.category === 'ROASTED_COFFEE'),
    [state.inventory]
  );

  // New Roast Batch Form (exact camelCase fields matching prisma/schema.prisma)
  const [greenBeanItemId, setGreenBeanItemId] = useState(greenBeans[0]?.id ?? '');
  const [targetProductId, setTargetProductId] = useState(roastedSkus[0]?.id ?? '');
  const [roastProfile, setRoastProfile] = useState<RoastProfile>('MEDIUM_DARK');
  const [roasterMachine, setRoasterMachine] = useState('رُستر صنعتی ۳۰ کیلویی پروبات');
  const [inputGreenKg, setInputGreenKg] = useState('40');
  const [outputRoastedKg, setOutputRoastedKg] = useState('33.6');
  const [roastTempC, setRoastTempC] = useState('210');
  const [roastDurationMin, setRoastDurationMin] = useState('13');
  const [packSizeGr, setPackSizeGr] = useState('1000');
  const [qualityNotes, setQualityNotes] = useState('');

  const liveLossPct = calculateWeightLossPct(
    Number(inputGreenKg) || 0,
    Number(outputRoastedKg) || 0
  );

  const filtered = useMemo(
    () =>
      state.roastBatches.filter(
        (b) => statusFilter === 'ALL' || b.status === statusFilter
      ),
    [state.roastBatches, statusFilter]
  );

  const totalRoastedKg = state.roastBatches
    .filter((b) => b.status === 'COMPLETED')
    .reduce((acc, b) => acc + b.outputRoastedKg, 0);

  const avgLossPct =
    state.roastBatches.length > 0
      ? state.roastBatches.reduce((acc, b) => acc + b.weightLossPct, 0) /
        state.roastBatches.length
      : 0;

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const gb = greenBeans.find((g) => g.id === greenBeanItemId) ?? greenBeans[0];
    const target = roastedSkus.find((r) => r.id === targetProductId) ?? roastedSkus[0];
    if (!gb || !target) return;

    addRoastBatch({
      greenBeanItemId: gb.id,
      greenBeanName: gb.itemName,
      targetProductId: target.id,
      targetProductName: target.itemName,
      roastProfile,
      roasterMachine,
      operatorName: 'امیرحسین بهرامی',
      inputGreenKg: Number(inputGreenKg) || 0,
      outputRoastedKg: Number(outputRoastedKg) || 0,
      roastTempC: Number(roastTempC) || 205,
      roastDurationMin: Number(roastDurationMin) || 12,
      packagedUnits: 0,
      packSizeGr: Number(packSizeGr) || 1000,
      status: 'PLANNED',
      scheduledDate: new Date().toISOString(),
      qualityNotes: qualityNotes.trim() || undefined,
    });

    setQualityNotes('');
    setModalOpen(false);
  };

  const openCompleteModal = (batch: RoastBatch) => {
    setCompletingBatch(batch);
    setActualOutputKg(String(batch.outputRoastedKg));
    const estUnits = Math.floor((batch.outputRoastedKg * 1000) / batch.packSizeGr);
    setActualPacks(String(estUnits));
  };

  const handleConfirmComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingBatch) return;
    advanceRoastBatch(
      completingBatch.id,
      'COMPLETED',
      Number(actualOutputKg) || completingBatch.outputRoastedKg,
      Number(actualPacks) || 0
    );
    setCompletingBatch(null);
  };

  return (
    <AppShell>
      <PageHeader
        title="برنامه و گزارش تولید (برشته‌کاری)"
        subtitle="چرخه تخصصی دانه سبز ← بچ برشته‌کاری ← محاسبه افت وزن ← بسته‌بندی و ورود به انبار محصول"
        actions={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-6 py-2.5 rounded-full bg-[#C47A3C] hover:bg-[#AF682E] text-[#FFFEFC] text-sm font-bold inline-flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>تعریف بچ برشته‌کاری جدید</span>
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <KpiCard
          title="تولید تکمیل‌شده (خروجی رُست)"
          value={formatNumber(totalRoastedKg, 1)}
          unit="کیلوگرم"
          badgeTone="copper"
          icon={<Flame className="w-5 h-5" />}
        />
        <KpiCard
          title="میانگین درصد افت وزن"
          value={`${formatNumber(avgLossPct, 1)}٪`}
          unit={`سقف ${formatNumber(state.settings.maxAllowedWeightLossPct, 0)}٪`}
          badgeTone={
            avgLossPct > state.settings.maxAllowedWeightLossPct ? 'brick' : 'olive'
          }
          icon={<Scale className="w-5 h-5" />}
        />
        <KpiCard
          title="بچ‌های فعال در خط"
          value={formatNumber(
            state.roastBatches.filter((b) => b.status !== 'COMPLETED').length,
            0
          )}
          unit="بچ"
          badgeTone="espresso"
          icon={<Gauge className="w-5 h-5" />}
        />
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <FilterTabs
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'ALL', label: 'همه بچ‌ها', count: state.roastBatches.length },
            { value: 'PLANNED', label: 'برنامه‌ریزی', count: state.roastBatches.filter((b) => b.status === 'PLANNED').length },
            { value: 'ROASTING', label: 'در حال برشته‌کاری', count: state.roastBatches.filter((b) => b.status === 'ROASTING').length },
            { value: 'PACKAGING', label: 'گاززدایی و بسته‌بندی', count: state.roastBatches.filter((b) => b.status === 'PACKAGING').length },
            { value: 'COMPLETED', label: 'تکمیل و ورود به انبار', count: state.roastBatches.filter((b) => b.status === 'COMPLETED').length },
          ]}
        />
      </div>

      {/* Roast Batch Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#FFFEFC] rounded-3xl shadow-[0_2px_12px_rgba(41,35,31,0.035)]">
          <EmptyState
            title="بچ برشته‌کاری در این وضعیت وجود ندارد"
            description="یک بچ جدید تعریف کنید و چرخه تولید را از دانه سبز تا بسته‌بندی پایش کنید."
            actionLabel="تعریف بچ جدید"
            onAction={() => setModalOpen(true)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((batch) => {
            const highLoss =
              batch.weightLossPct > state.settings.maxAllowedWeightLossPct;
            return (
              <div
                key={batch.id}
                className="bg-[#FFFEFC] rounded-3xl p-6 shadow-[0_2px_12px_rgba(41,35,31,0.035)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] text-[#786D65] tabular-nums">
                        {batch.batchNumber} · {formatShamsiShort(batch.scheduledDate)} ·{' '}
                        {batch.roasterMachine}
                      </p>
                      <h3 className="text-base font-bold text-[#29231F] mt-1">
                        {batch.targetProductName}
                      </h3>
                      <p className="text-xs text-[#786D65] mt-0.5">
                        ماده اولیه: {batch.greenBeanName}
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

                  {/* Technical Roasting Telemetry Grid */}
                  <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F7F4EF] rounded-2xl p-4 text-xs">
                    <div>
                      <span className="text-[#786D65] block">ورودی دانه سبز</span>
                      <strong className="text-[#29231F] tabular-nums mt-0.5 block">
                        {formatNumber(batch.inputGreenKg, 1)} کیلو
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#786D65] block">خروجی برشته</span>
                      <strong className="text-[#4B2E24] tabular-nums mt-0.5 block">
                        {formatNumber(batch.outputRoastedKg, 1)} کیلو
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#786D65] block">درصد افت وزن</span>
                      <strong
                        className={`tabular-nums mt-0.5 block ${
                          highLoss ? 'text-[#B84A3A]' : 'text-[#5E7C52]'
                        }`}
                      >
                        {formatNumber(batch.weightLossPct, 1)}٪
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#786D65] block">پروفیل و دما</span>
                      <strong className="text-[#29231F] tabular-nums mt-0.5 block">
                        {ROAST_PROFILE_LABELS[batch.roastProfile]} ({formatNumber(batch.roastTempC, 0)}°)
                      </strong>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-[#786D65]">
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Thermometer className="w-3.5 h-3.5 text-[#C47A3C]" />
                      مدت رُست: {formatNumber(batch.roastDurationMin, 0)} دقیقه
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>استاد رُست: {batch.operatorName}</span>
                    {batch.packagedUnits > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#5E7C52] font-bold tabular-nums">
                          بسته‌بندی‌شده: {formatNumber(batch.packagedUnits, 0)} بسته{' '}
                          {batch.packSizeGr >= 1000
                            ? `${batch.packSizeGr / 1000} کیلویی`
                            : `${batch.packSizeGr} گرمی`}
                        </span>
                      </>
                    )}
                  </div>

                  {batch.qualityNotes && (
                    <p className="mt-3 text-xs text-[#786D65] leading-relaxed">
                      یادداشت کنترل کیفیت: {batch.qualityNotes}
                    </p>
                  )}
                </div>

                {/* Stage Progression Action */}
                <div className="mt-5 pt-4 border-t border-[#4B2E24]/8 flex items-center justify-end gap-2">
                  {batch.status === 'PLANNED' && (
                    <button
                      type="button"
                      onClick={() => advanceRoastBatch(batch.id, 'ROASTING')}
                      className="px-5 py-2 rounded-full bg-[#C47A3C] hover:bg-[#AF682E] text-[#FFFEFC] text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>شروع برشته‌کاری</span>
                    </button>
                  )}
                  {batch.status === 'ROASTING' && (
                    <button
                      type="button"
                      onClick={() => advanceRoastBatch(batch.id, 'PACKAGING')}
                      className="px-5 py-2 rounded-full bg-[#D99A32] hover:bg-[#BE8424] text-[#FFFEFC] text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>پایان رُست و ارسال به بسته‌بندی</span>
                    </button>
                  )}
                  {batch.status === 'PACKAGING' && (
                    <button
                      type="button"
                      onClick={() => openCompleteModal(batch)}
                      className="px-5 py-2 rounded-full bg-[#5E7C52] hover:bg-[#4E6944] text-[#FFFEFC] text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>تایید نهایی وزن و ورود به انبار محصول</span>
                    </button>
                  )}
                  {batch.status === 'COMPLETED' && (
                    <span className="text-xs font-medium text-[#5E7C52] inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>انبار دانه سبز و محصول نهایی همگام‌سازی شد</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create New Roast Batch Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="تعریف بچ برشته‌کاری جدید"
        subtitle="تعیین دانه سبز ورودی، پروفیل رُست و تخمین افت وزن"
        maxWidthClass="max-w-2xl"
      >
        <form onSubmit={handleCreateBatch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5">دانه سبز ورودی *</label>
              <select
                name="greenBeanItemId"
                value={greenBeanItemId}
                onChange={(e) => setGreenBeanItemId(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              >
                {greenBeans.map((gb) => (
                  <option key={gb.id} value={gb.id}>
                    {gb.itemName} (موجودی: {formatNumber(gb.currentStock, 1)} کیلو)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">محصول خروجی هدف *</label>
              <select
                name="targetProductId"
                value={targetProductId}
                onChange={(e) => setTargetProductId(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              >
                {roastedSkus.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.itemName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">پروفیل برشته‌کاری</label>
              <select
                name="roastProfile"
                value={roastProfile}
                onChange={(e) => setRoastProfile(e.target.value as RoastProfile)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              >
                {(Object.keys(ROAST_PROFILE_LABELS) as RoastProfile[]).map((k) => (
                  <option key={k} value={k}>
                    {ROAST_PROFILE_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">دستگاه رُستر</label>
              <select
                name="roasterMachine"
                value={roasterMachine}
                onChange={(e) => setRoasterMachine(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              >
                <option value="رُستر صنعتی ۳۰ کیلویی پروبات">رُستر صنعتی ۳۰ کیلویی پروبات</option>
                <option value="رُستر ۱۵ کیلویی گیسن">رُستر ۱۵ کیلویی گیسن</option>
                <option value="رُستر نمونه ۲ کیلویی">رُستر نمونه ۲ کیلویی</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">وزن دانه سبز ورودی (کیلوگرم)</label>
              <input
                type="number"
                step="0.5"
                min={1}
                name="inputGreenKg"
                value={inputGreenKg}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setInputGreenKg(e.target.value);
                  if (v > 0) setOutputRoastedKg(String(Math.round(v * 0.84 * 10) / 10));
                }}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">تخمین وزن برشته‌شده (کیلوگرم)</label>
              <input
                type="number"
                step="0.1"
                min={0.5}
                name="outputRoastedKg"
                value={outputRoastedKg}
                onChange={(e) => setOutputRoastedKg(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">دمای تخلیه (سانتی‌گراد)</label>
              <input
                type="number"
                name="roastTempC"
                value={roastTempC}
                onChange={(e) => setRoastTempC(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">مدت زمان رُست (دقیقه)</label>
              <input
                type="number"
                name="roastDurationMin"
                value={roastDurationMin}
                onChange={(e) => setRoastDurationMin(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm tabular-nums"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#4B2E24]/6 flex items-center justify-between text-xs">
            <span>درصد افت وزن محاسبه‌شده:</span>
            <strong
              className={`tabular-nums text-sm ${
                liveLossPct > state.settings.maxAllowedWeightLossPct
                  ? 'text-[#B84A3A]'
                  : 'text-[#5E7C52]'
              }`}
            >
              {formatNumber(liveLossPct, 1)}٪
            </strong>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5">سایز بسته‌بندی هدف</label>
              <select
                name="packSizeGr"
                value={packSizeGr}
                onChange={(e) => setPackSizeGr(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              >
                <option value="1000">پاکت ۱ کیلویی سوپاپ‌دار</option>
                <option value="250">پاکت ۲۵۰ گرمی زیپ‌دار</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">یادداشت کاپینگ / کیفیت</label>
              <input
                name="qualityNotes"
                value={qualityNotes}
                onChange={(e) => setQualityNotes(e.target.value)}
                placeholder="مثال: ترک اول دقیقه ۹، اسیدیته متعادل"
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
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
              ثبت بچ برشته‌کاری
            </button>
          </div>
        </form>
      </Modal>

      {/* Complete Batch & Sync Inventory Modal */}
      <Modal
        open={Boolean(completingBatch)}
        onClose={() => setCompletingBatch(null)}
        title={`تکمیل نهایی بچ ${completingBatch?.batchNumber ?? ''}`}
        subtitle="با تایید نهایی، وزن دانه سبز از انبار کسر و وزن خروجی برشته‌شده به انبار محصول افزوده می‌شود"
      >
        {completingBatch && (
          <form onSubmit={handleConfirmComplete} className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#F7F4EF] text-xs space-y-1">
              <p>
                دانه سبز مصرفی: <strong>{completingBatch.greenBeanName}</strong> (
                <span className="tabular-nums">
                  {formatNumber(completingBatch.inputGreenKg, 1)} کیلوگرم
                </span>
                )
              </p>
              <p>
                محصول نهایی: <strong>{completingBatch.targetProductName}</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5">
                  وزن نهایی توزین‌شده پس از رُست (کیلوگرم)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={actualOutputKg}
                  onChange={(e) => setActualOutputKg(e.target.value)}
                  className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5">
                  تعداد بسته تولیدشده ({completingBatch.packSizeGr} گرمی)
                </label>
                <input
                  type="number"
                  required
                  value={actualPacks}
                  onChange={(e) => setActualPacks(e.target.value)}
                  className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm tabular-nums"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#5E7C52]/10 text-[#5E7C52] text-xs font-bold flex items-center justify-between">
              <span>درصد افت وزن واقعی این بچ:</span>
              <span className="tabular-nums">
                {formatNumber(
                  calculateWeightLossPct(
                    completingBatch.inputGreenKg,
                    Number(actualOutputKg) || 0
                  ),
                  1
                )}
                ٪
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCompletingBatch(null)}
                className="px-5 py-2.5 rounded-full bg-[#F7F4EF] text-sm font-medium"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#5E7C52] text-[#FFFEFC] text-sm font-bold"
              >
                تایید و ثبت در انبار
              </button>
            </div>
          </form>
        )}
      </Modal>
    </AppShell>
  );
}
