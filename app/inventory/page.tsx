'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownUp,
  Boxes,
  Coffee,
  Package,
  Plus,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import {
  FilterTabs,
  KpiCard,
  LocalAssetThumb,
  Modal,
  PageHeader,
  SearchInput,
  StatusBadge,
} from '@/components/ui/Primitives';
import { useChilserStore } from '@/lib/store';
import {
  InventoryCategory,
  InventoryUnit,
  MovementType,
} from '@/lib/mockData';
import { formatNumber, formatShamsiShort, formatToman } from '@/lib/formatters';

const CATEGORY_LABELS: Record<InventoryCategory, string> = {
  GREEN_BEAN: 'دانه سبز (مواد اولیه)',
  ROASTED_COFFEE: 'محصول برشته‌شده',
  PACKAGING: 'ملزومات بسته‌بندی',
};

const UNIT_LABELS: Record<InventoryUnit, string> = {
  KG: 'کیلوگرم',
  PACK: 'بسته',
  PIECE: 'عدد',
};

export default function InventoryPage() {
  const { state, addInventoryItem, recordStockMovement } = useChilserStore();
  const [tab, setTab] = useState<'stock' | 'movements'>('stock');
  const [catFilter, setCatFilter] = useState<'ALL' | InventoryCategory>('ALL');
  const [query, setQuery] = useState('');
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);

  // Stock Movement Form
  const [itemId, setItemId] = useState(state.inventory[0]?.id ?? '');
  const [movementType, setMovementType] = useState<MovementType>('IN');
  const [quantity, setQuantity] = useState('25');
  const [reason, setReason] = useState('');
  const [referenceCode, setReferenceCode] = useState('');

  // New Inventory Item Form
  const [skuCode, setSkuCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('GREEN_BEAN');
  const [origin, setOrigin] = useState('');
  const [unit, setUnit] = useState<InventoryUnit>('KG');
  const [currentStock, setCurrentStock] = useState('50');
  const [minStockLevel, setMinStockLevel] = useState('25');
  const [unitCost, setUnitCost] = useState('950000');
  const [warehouseZone, setWarehouseZone] = useState('انبار دانه سبز - ردیف B2');

  const filteredStock = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.inventory.filter((i) => {
      const matchCat = catFilter === 'ALL' || i.category === catFilter;
      const matchQ =
        !q ||
        i.itemName.toLowerCase().includes(q) ||
        i.skuCode.toLowerCase().includes(q) ||
        (i.origin?.toLowerCase().includes(q) ?? false);
      return matchCat && matchQ;
    });
  }, [state.inventory, catFilter, query]);

  const greenKgTotal = state.inventory
    .filter((i) => i.category === 'GREEN_BEAN')
    .reduce((acc, i) => acc + i.currentStock, 0);
  const roastedKgTotal = state.inventory
    .filter((i) => i.category === 'ROASTED_COFFEE')
    .reduce((acc, i) => acc + i.currentStock, 0);
  const lowStockCount = state.inventory.filter(
    (i) => i.currentStock <= i.minStockLevel * state.settings.lowStockAlertMultiplier
  ).length;

  const handleRecordMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId || !reason.trim()) return;
    recordStockMovement(
      itemId,
      movementType,
      Number(quantity) || 0,
      reason.trim(),
      referenceCode.trim() || undefined
    );
    setReason('');
    setReferenceCode('');
    setMoveModalOpen(false);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skuCode.trim() || !itemName.trim()) return;
    addInventoryItem({
      skuCode: skuCode.trim().toUpperCase(),
      itemName: itemName.trim(),
      category,
      origin: origin.trim() || undefined,
      unit,
      currentStock: Number(currentStock) || 0,
      minStockLevel: Number(minStockLevel) || 10,
      unitCost: Number(unitCost) || 0,
      warehouseZone: warehouseZone.trim() || 'انبار مرکزی',
    });
    setSkuCode('');
    setItemName('');
    setOrigin('');
    setItemModalOpen(false);
  };

  return (
    <AppShell>
      <PageHeader
        title="انبار و موجودی کالا"
        subtitle="مدیریت تفکیکی دانه سبز، قهوه برشته‌شده، ملزومات بسته‌بندی و اسناد ورود و خروج"
        actions={
          <>
            <button
              type="button"
              onClick={() => setItemModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-[#FFFEFC] text-[#29231F] text-sm font-medium shadow-sm inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-[#4B2E24]" />
              <span>تعریف کالای جدید</span>
            </button>
            <button
              type="button"
              onClick={() => setMoveModalOpen(true)}
              className="px-6 py-2.5 rounded-full bg-[#C47A3C] hover:bg-[#AF682E] text-[#FFFEFC] text-sm font-bold inline-flex items-center gap-2 whitespace-nowrap"
            >
              <ArrowDownUp className="w-4 h-4" />
              <span>ثبت ورود / خروج کالا</span>
            </button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <KpiCard
          title="موجودی کل دانه سبز"
          value={formatNumber(greenKgTotal, 1)}
          unit="کیلوگرم"
          badgeTone="olive"
          icon={<Boxes className="w-5 h-5" />}
        />
        <KpiCard
          title="موجودی قهوه برشته‌شده"
          value={formatNumber(roastedKgTotal, 1)}
          unit="کیلوگرم"
          badgeTone="espresso"
          icon={<Coffee className="w-5 h-5" />}
        />
        <KpiCard
          title="اقلام زیر نقطه سفارش"
          value={formatNumber(lowStockCount, 0)}
          unit="قلم کالا"
          badgeTone={lowStockCount > 0 ? 'brick' : 'olive'}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
      </div>

      {/* View Switcher + Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <FilterTabs
            value={tab}
            onChange={setTab}
            options={[
              { value: 'stock', label: 'موجودی انبارها', count: state.inventory.length },
              { value: 'movements', label: 'گردش ورود و خروج', count: state.stockMovements.length },
            ]}
          />
          {tab === 'stock' && (
            <FilterTabs
              value={catFilter}
              onChange={setCatFilter}
              options={[
                { value: 'ALL', label: 'همه' },
                { value: 'GREEN_BEAN', label: 'دانه سبز' },
                { value: 'ROASTED_COFFEE', label: 'محصول نهایی' },
                { value: 'PACKAGING', label: 'بسته‌بندی' },
              ]}
            />
          )}
        </div>

        {tab === 'stock' && (
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="جستجوی نام کالا، کد SKU یا خاستگاه..."
            className="w-full md:w-72"
          />
        )}
      </div>

      {tab === 'stock' ? (
        <div className="bg-[#FFFEFC] rounded-3xl p-6 shadow-[0_2px_12px_rgba(41,35,31,0.035)] overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="border-b border-[#4B2E24]/8 text-xs text-[#786D65]">
                <th className="py-3 text-start pe-3">کالا و کد SKU</th>
                <th className="py-3 text-start px-3">دسته و موقعیت</th>
                <th className="py-3 text-start px-3">موجودی فعلی</th>
                <th className="py-3 text-start px-3">حداقل مجاز</th>
                <th className="py-3 text-start px-3">بهای واحد</th>
                <th className="py-3 text-end ps-3">وضعیت موجودی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4B2E24]/6 text-xs">
              {filteredStock.map((item) => {
                const isLow =
                  item.currentStock <=
                  item.minStockLevel * state.settings.lowStockAlertMultiplier;
                return (
                  <tr key={item.id} className="hover:bg-[#F7F4EF]/60">
                    <td className="py-3.5 pe-3">
                      <div className="flex items-center gap-3">
                        <LocalAssetThumb
                          src={item.imageUrl}
                          alt={item.itemName}
                          category={item.category}
                        />
                        <div>
                          <p className="font-bold text-[#29231F]">{item.itemName}</p>
                          <p className="text-[11px] text-[#786D65] tabular-nums">
                            {item.skuCode}
                            {item.origin ? ` · ${item.origin}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-[#29231F] font-medium block">
                        {CATEGORY_LABELS[item.category]}
                      </span>
                      <span className="text-[11px] text-[#786D65]">
                        {item.warehouseZone}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-[#29231F] tabular-nums whitespace-nowrap">
                      {formatNumber(item.currentStock, 1)} {UNIT_LABELS[item.unit]}
                    </td>
                    <td className="py-3.5 px-3 text-[#786D65] tabular-nums whitespace-nowrap">
                      {formatNumber(item.minStockLevel, 0)} {UNIT_LABELS[item.unit]}
                    </td>
                    <td className="py-3.5 px-3 font-medium tabular-nums whitespace-nowrap">
                      {formatToman(item.unitCost)}
                    </td>
                    <td className="py-3.5 ps-3 text-end">
                      <StatusBadge
                        label={isLow ? 'کمبود موجودی' : 'موجودی ایمن'}
                        tone={isLow ? 'danger' : 'success'}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-[#FFFEFC] rounded-3xl p-6 shadow-[0_2px_12px_rgba(41,35,31,0.035)] overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="border-b border-[#4B2E24]/8 text-xs text-[#786D65]">
                <th className="py-3 text-start pe-3">کد سند</th>
                <th className="py-3 text-start px-3">نام کالا</th>
                <th className="py-3 text-start px-3">نوع سند</th>
                <th className="py-3 text-start px-3">مقدار</th>
                <th className="py-3 text-start px-3">مرجع و شرح</th>
                <th className="py-3 text-start px-3">ثبت‌کننده</th>
                <th className="py-3 text-end ps-3">تاریخ شمسی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4B2E24]/6 text-xs">
              {state.stockMovements.map((mov) => (
                <tr key={mov.id} className="hover:bg-[#F7F4EF]/60">
                  <td className="py-3.5 pe-3 font-bold text-[#4B2E24] tabular-nums">
                    {mov.movementCode}
                  </td>
                  <td className="py-3.5 px-3 font-medium text-[#29231F]">
                    {mov.itemName}
                  </td>
                  <td className="py-3.5 px-3">
                    <StatusBadge
                      label={
                        mov.movementType === 'IN'
                          ? 'ورود به انبار'
                          : mov.movementType === 'OUT'
                          ? 'خروج از انبار'
                          : 'اصلاح موجودی'
                      }
                      tone={
                        mov.movementType === 'IN'
                          ? 'success'
                          : mov.movementType === 'OUT'
                          ? 'copper'
                          : 'warning'
                      }
                    />
                  </td>
                  <td className="py-3.5 px-3 font-bold tabular-nums whitespace-nowrap">
                    {formatNumber(mov.quantity, 1)} {UNIT_LABELS[mov.unit]}
                  </td>
                  <td className="py-3.5 px-3 text-[#786D65]">
                    <span className="text-[#29231F] font-medium tabular-nums">
                      {mov.referenceCode}
                    </span>{' '}
                    · {mov.reason}
                  </td>
                  <td className="py-3.5 px-3 text-[#786D65]">{mov.operatorName}</td>
                  <td className="py-3.5 ps-3 text-end text-[#786D65] tabular-nums whitespace-nowrap">
                    {formatShamsiShort(mov.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stock Movement Modal */}
      <Modal
        open={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        title="ثبت سند ورود / خروج انبار"
        subtitle="تغییر مستقیم موجودی کالا با ثبت ردیف در دفتر گردش انبار"
      >
        <form onSubmit={handleRecordMovement} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5">انتخاب کالا *</label>
            <select
              name="itemId"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
            >
              {state.inventory.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.itemName} (موجودی: {formatNumber(i.currentStock, 1)} {UNIT_LABELS[i.unit]})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5">نوع تراکنش</label>
              <select
                name="movementType"
                value={movementType}
                onChange={(e) => setMovementType(e.target.value as MovementType)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              >
                <option value="IN">ورود کالا (+)</option>
                <option value="OUT">خروج کالا (-)</option>
                <option value="ADJUSTMENT">اصلاح موجودی (تنظیم مقدار دقیق)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">مقدار</label>
              <input
                type="number"
                step="0.1"
                min={0.1}
                required
                name="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm tabular-nums"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">کد سند مرجع (اختیاری)</label>
            <input
              name="referenceCode"
              value={referenceCode}
              onChange={(e) => setReferenceCode(e.target.value)}
              placeholder="مثال: INV-ADJ-1405"
              className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">علت و شرح *</label>
            <input
              required
              name="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: ارسال نمونه تست کاپینگ برای نمایشگاه"
              className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setMoveModalOpen(false)}
              className="px-5 py-2.5 rounded-full bg-[#F7F4EF] text-sm font-medium"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#C47A3C] text-[#FFFEFC] text-sm font-bold"
            >
              ثبت سند انبار
            </button>
          </div>
        </form>
      </Modal>

      {/* Add New Inventory Item Modal */}
      <Modal
        open={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        title="تعریف قلم کالای جدید"
        subtitle="افزودن دانه سبز، محصول برشته‌شده یا ملزومات بسته‌بندی جدید"
      >
        <form onSubmit={handleAddItem} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5">کد کالا (SKU) *</label>
              <input
                required
                dir="ltr"
                name="skuCode"
                value={skuCode}
                onChange={(e) => setSkuCode(e.target.value)}
                placeholder="GB-KEN-AA"
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm text-left"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">نام کالا *</label>
              <input
                required
                name="itemName"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="مثال: دانه سبز کنیا AA شسته"
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">دسته‌بندی</label>
              <select
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as InventoryCategory)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              >
                <option value="GREEN_BEAN">دانه سبز (مواد اولیه)</option>
                <option value="ROASTED_COFFEE">محصول برشته‌شده</option>
                <option value="PACKAGING">ملزومات بسته‌بندی</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">واحد شمارش</label>
              <select
                name="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as InventoryUnit)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              >
                <option value="KG">کیلوگرم</option>
                <option value="PIECE">عدد</option>
                <option value="PACK">بسته</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">موجودی اولیه</label>
              <input
                type="number"
                step="0.5"
                name="currentStock"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">نقطه هشدار (حداقل)</label>
              <input
                type="number"
                name="minStockLevel"
                value={minStockLevel}
                onChange={(e) => setMinStockLevel(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">بهای واحد (تومان)</label>
              <input
                type="number"
                name="unitCost"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">خاستگاه / مشخصات</label>
              <input
                name="origin"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="مثال: کنیا - نیری"
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">موقعیت قفسه در انبار</label>
            <input
              name="warehouseZone"
              value={warehouseZone}
              onChange={(e) => setWarehouseZone(e.target.value)}
              className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setItemModalOpen(false)}
              className="px-5 py-2.5 rounded-full bg-[#F7F4EF] text-sm font-medium"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#4B2E24] text-[#FFFEFC] text-sm font-bold"
            >
              ذخیره در انبار
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
