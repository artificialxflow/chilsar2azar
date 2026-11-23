'use client';

import React, { useState } from 'react';
import { Check, Plus, ShieldCheck, UserCheck, Users } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import {
  KpiCard,
  Modal,
  PageHeader,
  StatusBadge,
} from '@/components/ui/Primitives';
import { useChilserStore } from '@/lib/store';
import { ROLE_LABELS, UserRole } from '@/lib/mockData';
import { formatNumber, formatShamsiShort } from '@/lib/formatters';

const MODULE_LABELS: Array<{ key: string; label: string }> = [
  { key: 'dashboard', label: 'داشبورد' },
  { key: 'orders', label: 'سفارش‌ها' },
  { key: 'customers', label: 'مشتریان' },
  { key: 'production', label: 'تولید و رُست' },
  { key: 'inventory', label: 'انبار' },
  { key: 'purchases', label: 'خرید' },
  { key: 'accounting', label: 'حسابداری' },
  { key: 'users', label: 'کاربران' },
];

export default function UsersPage() {
  const { state, addUser, toggleUserActive, updateUserRole, switchUserById, currentUser } =
    useChilserStore();
  const [modalOpen, setModalOpen] = useState(false);

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('SALES');
  const [department, setDepartment] = useState('فروش و ارتباط با مشتریان');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !mobile.trim()) return;
    addUser({
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      email: email.trim() || undefined,
      role,
      department: department.trim() || 'عملیات',
      isActive: true,
      permissions: [],
    });
    setFullName('');
    setMobile('');
    setEmail('');
    setModalOpen(false);
  };

  return (
    <AppShell>
      <PageHeader
        title="کاربران و سطح دسترسی"
        subtitle="مدیریت پرسنل چیلسر، نقش‌های سازمانی و ماتریس دسترسی ماژول‌ها"
        actions={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-6 py-2.5 rounded-full bg-[#C47A3C] hover:bg-[#AF682E] text-[#FFFEFC] text-sm font-bold inline-flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن کاربر جدید</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <KpiCard
          title="کل کاربران سامانه"
          value={formatNumber(state.users.length, 0)}
          unit="کاربر"
          badgeTone="espresso"
          icon={<Users className="w-5 h-5" />}
        />
        <KpiCard
          title="کاربران فعال"
          value={formatNumber(state.users.filter((u) => u.isActive).length, 0)}
          unit="نفر"
          badgeTone="olive"
          icon={<UserCheck className="w-5 h-5" />}
        />
        <KpiCard
          title="نقش‌های تعریف‌شده"
          value={formatNumber(Object.keys(ROLE_LABELS).length, 0)}
          unit="سطح دسترسی"
          badgeTone="copper"
          icon={<ShieldCheck className="w-5 h-5" />}
        />
      </div>

      {/* Users & Permissions Table */}
      <div className="bg-[#FFFEFC] rounded-3xl p-6 shadow-[0_2px_12px_rgba(41,35,31,0.035)] overflow-x-auto">
        <table className="w-full text-start border-collapse">
          <thead>
            <tr className="border-b border-[#4B2E24]/8 text-xs text-[#786D65]">
              <th className="py-3 text-start pe-3">نام و واحد</th>
              <th className="py-3 text-start px-3">موبایل ورود (OTP)</th>
              <th className="py-3 text-start px-3">نقش سازمانی</th>
              <th className="py-3 text-start px-3">دسترسی ماژول‌ها</th>
              <th className="py-3 text-start px-3">آخرین ورود</th>
              <th className="py-3 text-start px-3">وضعیت</th>
              <th className="py-3 text-end ps-3">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#4B2E24]/6 text-xs">
            {state.users.map((u) => (
              <tr key={u.id} className="hover:bg-[#F7F4EF]/60">
                <td className="py-4 pe-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#4B2E24] text-[#FFFEFC] font-bold flex items-center justify-center shrink-0">
                      {u.fullName.slice(0, 1)}
                    </div>
                    <div>
                      <p className="font-bold text-[#29231F]">{u.fullName}</p>
                      <p className="text-[11px] text-[#786D65]">{u.department}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-3 tabular-nums text-[#29231F]" dir="ltr">
                  {u.mobile}
                </td>
                <td className="py-4 px-3">
                  <select
                    value={u.role}
                    onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                    aria-label={`تغییر نقش ${u.fullName}`}
                    className="bg-[#F7F4EF] rounded-xl px-3 py-1.5 text-xs font-medium"
                  >
                    {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-4 px-3">
                  <div className="flex flex-wrap gap-1.5 max-w-xs">
                    {MODULE_LABELS.filter((m) => u.permissions.includes(m.key)).map(
                      (m) => (
                        <span
                          key={m.key}
                          className="inline-flex items-center gap-0.5 text-[11px] text-[#4B2E24] bg-[#F7F4EF] px-2 py-0.5 rounded-lg"
                        >
                          <Check className="w-3 h-3 text-[#5E7C52]" />
                          {m.label}
                        </span>
                      )
                    )}
                  </div>
                </td>
                <td className="py-4 px-3 text-[#786D65] tabular-nums whitespace-nowrap">
                  {formatShamsiShort(u.lastLoginAt)}
                </td>
                <td className="py-4 px-3">
                  <StatusBadge
                    label={u.isActive ? 'فعال' : 'غیرفعال'}
                    tone={u.isActive ? 'success' : 'danger'}
                  />
                </td>
                <td className="py-4 ps-3 text-end whitespace-nowrap space-x-2 space-x-reverse">
                  {u.id !== currentUser?.id && u.isActive && (
                    <button
                      type="button"
                      onClick={() => switchUserById(u.id)}
                      className="px-3 py-1.5 rounded-full bg-[#C47A3C]/12 text-[#A66128] font-bold hover:bg-[#C47A3C]/20"
                    >
                      تست با این نقش
                    </button>
                  )}
                  {u.id !== currentUser?.id && (
                    <button
                      type="button"
                      onClick={() => toggleUserActive(u.id)}
                      className="px-3 py-1.5 rounded-full bg-[#F7F4EF] text-[#29231F] font-medium hover:bg-[#EDE6DC]"
                    >
                      {u.isActive ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="افزودن کاربر سازمانی جدید"
        subtitle="کاربر می‌تواند با شماره موبایل و کد تایید ۵ رقمی وارد سامانه شود"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5">نام و نام خانوادگی *</label>
              <input
                required
                name="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">شماره موبایل *</label>
              <input
                required
                dir="ltr"
                name="mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="0912..."
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm text-left tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">نقش کاربری</label>
              <select
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              >
                {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">واحد سازمانی</label>
              <input
                name="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">ایمیل سازمانی (اختیاری)</label>
            <input
              type="email"
              dir="ltr"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@chilser.ir"
              className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm text-left"
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
              ایجاد کاربر
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
