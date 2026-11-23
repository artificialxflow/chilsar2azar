'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  FolderCheck,
  RotateCcw,
  Save,
  Settings,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/ui/Primitives';
import { useChilserStore } from '@/lib/store';

export default function SettingsPage() {
  const { state, updateSettings, resetDemoData } = useChilserStore();

  const [companyName, setCompanyName] = useState(state.settings.companyName);
  const [brandSubtitle, setBrandSubtitle] = useState(state.settings.brandSubtitle);
  const [roasteryBranch, setRoasteryBranch] = useState(state.settings.roasteryBranch);
  const [phone, setPhone] = useState(state.settings.phone);
  const [address, setAddress] = useState(state.settings.address);
  const [taxRatePercent, setTaxRatePercent] = useState(
    String(state.settings.taxRatePercent)
  );
  const [maxAllowedWeightLossPct, setMaxAllowedWeightLossPct] = useState(
    String(state.settings.maxAllowedWeightLossPct)
  );
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyName: companyName.trim() || 'چیلسر',
      brandSubtitle: brandSubtitle.trim(),
      roasteryBranch: roasteryBranch.trim(),
      phone: phone.trim(),
      address: address.trim(),
      taxRatePercent: Number(taxRatePercent) || 10,
      maxAllowedWeightLossPct: Number(maxAllowedWeightLossPct) || 18,
    });
  };

  return (
    <AppShell>
      <PageHeader
        title="تنظیمات سامانه"
        subtitle="پیکربندی اطلاعات برند چیلسر، استانداردهای برشته‌کاری و مدیریت داده‌های محلی"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Company & Production Settings Form */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-8 bg-[#FFFEFC] rounded-3xl p-6 md:p-7 shadow-[0_2px_12px_rgba(41,35,31,0.035)] space-y-5"
        >
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#4B2E24]/8">
            <div className="w-10 h-10 rounded-2xl bg-[#4B2E24]/10 text-[#4B2E24] flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#29231F]">
                مشخصات سازمانی و پارامترهای تولید
              </h2>
              <p className="text-xs text-[#786D65]">
                تغییرات بلافاصله در محاسبات هشدار و هدر گزارش‌ها اعمال می‌شود
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5">نام برند</label>
              <input
                name="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">شعبه / کارگاه مرکزی</label>
              <input
                name="roasteryBranch"
                value={roasteryBranch}
                onChange={(e) => setRoasteryBranch(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1.5">توضیح کوتاه سامانه</label>
              <input
                name="brandSubtitle"
                value={brandSubtitle}
                onChange={(e) => setBrandSubtitle(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">تلفن تماس کارگاه</label>
              <input
                dir="ltr"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm text-left tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">واحد پول رسمی</label>
              <input
                disabled
                value={state.settings.currencyLabel}
                className="w-full bg-[#EDE7DF]/60 text-[#786D65] rounded-2xl px-4 py-2.5 text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">
                حداکثر درصد افت وزن مجاز رُست (٪)
              </label>
              <input
                type="number"
                step="0.5"
                name="maxAllowedWeightLossPct"
                value={maxAllowedWeightLossPct}
                onChange={(e) => setMaxAllowedWeightLossPct(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">
                نرخ مالیات بر ارزش افزوده (٪)
              </label>
              <input
                type="number"
                name="taxRatePercent"
                value={taxRatePercent}
                onChange={(e) => setTaxRatePercent(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5">نشانی کارگاه و دفتر مرکزی</label>
            <textarea
              rows={2}
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#C47A3C] hover:bg-[#AF682E] text-[#FFFEFC] text-sm font-bold inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره تنظیمات</span>
            </button>
          </div>
        </form>

        {/* Right Side: Local Offline Assets Checklist & Reset Demo Data */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#FFFEFC] rounded-3xl p-6 shadow-[0_2px_12px_rgba(41,35,31,0.035)]">
            <div className="flex items-center gap-2 mb-4">
              <FolderCheck className="w-5 h-5 text-[#5E7C52]" />
              <h3 className="text-sm font-bold text-[#29231F]">
                فهرست دارایی‌های آفلاین محلی
              </h3>
            </div>
            <p className="text-xs text-[#786D65] leading-relaxed mb-4">
              این سامانه بدون نیاز به اینترنت یا CDN خارجی طراحی شده است. مسیر فایل‌های
              محلی در پوشه <code dir="ltr" className="text-[#4B2E24]">public/</code>:
            </p>
            <ul className="space-y-2 text-xs text-[#29231F]" dir="ltr">
              {[
                '/fonts/font-regular.woff2 (400)',
                '/fonts/font-medium.woff2 (500)',
                '/fonts/font-bold.woff2 (700)',
                '/images/logo.svg (آماده)',
                '/favicon.svg (آماده)',
                '/images/products/*.webp (دارای جایگزین SVG)',
              ].map((asset) => (
                <li
                  key={asset}
                  className="flex items-center gap-2 bg-[#F7F4EF] rounded-xl px-3 py-2 text-[11px]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#5E7C52] shrink-0" />
                  <span className="truncate">{asset}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#FFFEFC] rounded-3xl p-6 shadow-[0_2px_12px_rgba(41,35,31,0.035)]">
            <h3 className="text-sm font-bold text-[#29231F]">
              مدیریت حافظه محلی مرورگر (localStorage)
            </h3>
            <p className="text-xs text-[#786D65] mt-1.5 leading-relaxed">
              تمامی سفارش‌ها، بچ‌های تولید و اسناد مالی شما به صورت خودکار در مرورگر
              ذخیره می‌شوند. برای بازگشت به داده‌های نمونه اولیه از دکمه زیر استفاده کنید.
            </p>

            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="mt-4 w-full py-2.5 px-5 rounded-full bg-[#B84A3A]/10 hover:bg-[#B84A3A]/18 text-[#B84A3A] text-xs font-bold inline-flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>بازنشانی داده‌های نمونه</span>
              </button>
            ) : (
              <div className="mt-4 p-3.5 rounded-2xl bg-[#B84A3A]/8 space-y-3">
                <p className="text-xs font-bold text-[#B84A3A]">
                  آیا از بازنشانی همه تغییرات محلی مطمئن هستید؟
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetDemoData();
                      setConfirmReset(false);
                    }}
                    className="flex-1 py-2 rounded-full bg-[#B84A3A] text-[#FFFEFC] text-xs font-bold"
                  >
                    بله، بازنشانی شود
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 py-2 rounded-full bg-[#FFFEFC] text-[#29231F] text-xs font-medium"
                  >
                    انصراف
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
