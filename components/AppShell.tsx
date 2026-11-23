'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Bell,
  Boxes,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Factory,
  Flame,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareHeart,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Target,
  Truck,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { BrandLogo } from './BrandLogo';
import { useChilserStore } from '@/lib/store';
import { ROLE_LABELS } from '@/lib/mockData';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'quick',
    label: 'دسترسی سریع',
    items: [
      { href: '/dashboard', label: 'داشبورد', icon: LayoutDashboard },
      { href: '/orders', label: 'سفارش‌ها و فروش', icon: ClipboardList },
      { href: '/production', label: 'برنامه و گزارش تولید', icon: Flame },
    ],
  },
  {
    id: 'sales',
    label: 'فروش و مشتریان',
    items: [
      { href: '/customers', label: 'مشتریان و CRM', icon: Users },
      { href: '/leads', label: 'سرنخ‌های فروش', icon: Target },
      { href: '/shipping', label: 'ارسال و تحویل', icon: Truck },
      { href: '/surveys', label: 'نظرسنجی و بازخورد', icon: MessageSquareHeart },
    ],
  },
  {
    id: 'operations',
    label: 'تولید و انبار',
    items: [
      { href: '/inventory', label: 'انبار و موجودی', icon: Boxes },
      { href: '/purchases', label: 'خرید و تأمین‌کنندگان', icon: ShoppingBag },
    ],
  },
  {
    id: 'management',
    label: 'مالی و مدیریت',
    items: [
      { href: '/accounting', label: 'حسابداری و مالی', icon: Wallet },
      { href: '/reports', label: 'گزارش‌های مدیریتی', icon: BarChart3 },
      { href: '/users', label: 'کاربران و دسترسی‌ها', icon: ShieldCheck },
      { href: '/settings', label: 'تنظیمات سامانه', icon: Settings },
    ],
  },
];

const BRANCH_OPTIONS = [
  'کارگاه برشته‌کاری مرکزی',
  'واحد فروش عمده تهران',
  'انبار مرکزی دانه سبز',
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    state,
    currentUser,
    authReady,
    activeBranch,
    setActiveBranch,
    notifications,
    logout,
    switchUserById,
  } = useChilserStore();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    quick: true,
    sales: true,
    operations: true,
    management: true,
  });
  const [globalQuery, setGlobalQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [branchOpen, setBranchOpen] = useState(false);

  useEffect(() => {
    if (authReady && !currentUser) {
      router.replace('/login');
    }
  }, [authReady, currentUser, router]);

  // Global cross-module instant search
  const searchResults = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    if (!q) return [];
    const results: Array<{ id: string; title: string; subtitle: string; href: string }> = [];

    state.orders
      .filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .forEach((o) =>
        results.push({
          id: o.id,
          title: `سفارش ${o.orderNumber}`,
          subtitle: o.customerName,
          href: '/orders',
        })
      );

    state.customers
      .filter(
        (c) =>
          c.companyName.toLowerCase().includes(q) ||
          c.fullName.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .forEach((c) =>
        results.push({
          id: c.id,
          title: c.companyName,
          subtitle: `${c.fullName} · ${c.city}`,
          href: '/customers',
        })
      );

    state.roastBatches
      .filter(
        (b) =>
          b.batchNumber.toLowerCase().includes(q) ||
          b.targetProductName.toLowerCase().includes(q)
      )
      .slice(0, 2)
      .forEach((b) =>
        results.push({
          id: b.id,
          title: `بچ ${b.batchNumber}`,
          subtitle: b.targetProductName,
          href: '/production',
        })
      );

    state.inventory
      .filter(
        (i) =>
          i.itemName.toLowerCase().includes(q) ||
          i.skuCode.toLowerCase().includes(q)
      )
      .slice(0, 2)
      .forEach((i) =>
        results.push({
          id: i.id,
          title: i.itemName,
          subtitle: `کد ${i.skuCode}`,
          href: '/inventory',
        })
      );

    return results;
  }, [globalQuery, state.orders, state.customers, state.roastBatches, state.inventory]);

  if (!authReady || !currentUser) {
    return (
      <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <BrandLogo variant="light" showSubtitle />
          <p className="text-xs text-[#786D65]">در حال بارگذاری محیط کار...</p>
        </div>
      </div>
    );
  }

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const renderSidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full bg-[#261914] text-[#D4C9C1]">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/8">
        <Link
          href="/dashboard"
          onClick={() => setMobileMenuOpen(false)}
          className="focus:outline-none"
        >
          <BrandLogo
            variant="dark"
            compact={!isMobile && collapsed}
            showSubtitle={!collapsed || isMobile}
          />
        </Link>
        {isMobile ? (
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#C9BEB6] hover:bg-white/10"
            aria-label="بستن منو"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#C9BEB6] hover:bg-white/10 transition-colors"
            aria-label={collapsed ? 'باز کردن منو' : 'جمع کردن منو'}
          >
            {collapsed ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {NAV_GROUPS.map((group) => {
          const isOpen = openGroups[group.id];
          return (
            <div key={group.id}>
              {(!collapsed || isMobile) && (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-medium text-[#9E8F85] hover:text-[#EDE7DF] transition-colors"
                >
                  <span>{group.label}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isOpen ? 'rotate-0' : 'rotate-90'
                    }`}
                  />
                </button>
              )}

              {(isOpen || (!isMobile && collapsed)) && (
                <ul className="mt-1 space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          title={!isMobile && collapsed ? item.label : undefined}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm transition-all whitespace-nowrap ${
                            active
                              ? 'bg-[#C47A3C] text-[#FFFEFC] font-bold shadow-[0_4px_14px_rgba(196,122,60,0.35)]'
                              : 'text-[#CFC3BA] hover:bg-white/6 hover:text-[#FFFEFC]'
                          } ${!isMobile && collapsed ? 'justify-center px-0' : ''}`}
                        >
                          <Icon className="w-[18px] h-[18px] shrink-0" />
                          {(!collapsed || isMobile) && (
                            <span className="truncate">{item.label}</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Logout */}
      <div className="p-3 border-t border-white/8">
        <button
          type="button"
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-[#E88A7D] hover:bg-[#B84A3A]/20 transition-colors whitespace-nowrap ${
            !isMobile && collapsed ? 'justify-center px-0' : ''
          }`}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {(!collapsed || isMobile) && <span>خروج از سیستم</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F4EF] flex">
      {/* Desktop RTL Right Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 sticky top-0 h-screen transition-[width] duration-200 z-30 ${
          collapsed ? 'w-[80px]' : 'w-[260px]'
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-[272px] max-w-[85vw] h-full shadow-2xl">
            {renderSidebarContent(true)}
          </div>
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="flex-1 bg-[#261914]/50 backdrop-blur-[1px]"
          />
        </div>
      )}

      {/* Main Content Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar (Nexapoint-inspired blended clean header) */}
        <header className="sticky top-0 z-20 bg-[#F7F4EF]/90 backdrop-blur-md border-b border-[#4B2E24]/6">
          <div className="px-4 md:px-8 h-16 flex items-center justify-between gap-4">
            {/* Start (Right in RTL): Mobile Menu + Branch Switcher */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden w-10 h-10 rounded-full bg-[#FFFEFC] flex items-center justify-center text-[#4B2E24] shadow-sm"
                aria-label="باز کردن منو"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => {
                    setBranchOpen((v) => !v);
                    setNotifOpen(false);
                    setProfileOpen(false);
                  }}
                  className="inline-flex items-center gap-2.5 bg-[#FFFEFC] rounded-full ps-2 pe-4 py-1.5 shadow-[0_1px_6px_rgba(41,35,31,0.04)] text-xs font-medium text-[#29231F] hover:bg-white transition-colors whitespace-nowrap"
                >
                  <span className="w-7 h-7 rounded-full bg-[#C47A3C]/15 text-[#C47A3C] flex items-center justify-center font-bold">
                    <Factory className="w-3.5 h-3.5" />
                  </span>
                  <span>{activeBranch}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#786D65]" />
                </button>

                {branchOpen && (
                  <div className="absolute start-0 mt-2 w-56 bg-[#FFFEFC] rounded-2xl shadow-xl border border-[#4B2E24]/8 p-1.5 z-40">
                    {BRANCH_OPTIONS.map((branch) => (
                      <button
                        key={branch}
                        type="button"
                        onClick={() => {
                          setActiveBranch(branch);
                          setBranchOpen(false);
                        }}
                        className={`w-full text-start px-3 py-2 rounded-xl text-xs transition-colors ${
                          activeBranch === branch
                            ? 'bg-[#C47A3C]/12 text-[#4B2E24] font-bold'
                            : 'text-[#786D65] hover:bg-[#F7F4EF] hover:text-[#29231F]'
                        }`}
                      >
                        {branch}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Center: Pill Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#786D65] absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={globalQuery}
                onChange={(e) => setGlobalQuery(e.target.value)}
                placeholder="جستجو در سفارش‌ها، مشتریان، بچ رُست و انبار..."
                className="w-full bg-[#FFFEFC] rounded-full ps-10 pe-4 py-2.5 text-xs md:text-sm text-[#29231F] placeholder:text-[#786D65]/80 shadow-[0_1px_6px_rgba(41,35,31,0.04)] focus:outline-none focus:ring-2 focus:ring-[#C47A3C]/40"
              />

              {searchResults.length > 0 && (
                <div className="absolute inset-x-0 mt-2 bg-[#FFFEFC] rounded-2xl shadow-xl border border-[#4B2E24]/8 p-2 z-40">
                  {searchResults.map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => {
                        setGlobalQuery('');
                        router.push(res.href);
                      }}
                      className="w-full text-start px-3 py-2 rounded-xl hover:bg-[#F7F4EF] transition-colors flex items-center justify-between gap-2"
                    >
                      <span className="text-xs font-bold text-[#29231F]">
                        {res.title}
                      </span>
                      <span className="text-[11px] text-[#786D65] truncate">
                        {res.subtitle}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* End (Left in RTL): Notifications + User Profile */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Notifications */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen((v) => !v);
                    setProfileOpen(false);
                    setBranchOpen(false);
                  }}
                  aria-label="اعلان‌های سیستم"
                  className="relative w-10 h-10 rounded-full bg-[#FFFEFC] flex items-center justify-center text-[#4B2E24] shadow-[0_1px_6px_rgba(41,35,31,0.04)] hover:bg-white transition-colors"
                >
                  <Bell className="w-[18px] h-[18px]" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#B84A3A] text-[#FFFEFC] text-[10px] font-bold flex items-center justify-center tabular-nums">
                      {notifications.length.toLocaleString('fa-IR')}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute end-0 mt-2 w-80 bg-[#FFFEFC] rounded-3xl shadow-xl border border-[#4B2E24]/8 p-4 z-40">
                    <div className="flex items-center justify-between pb-3 border-b border-[#4B2E24]/8">
                      <span className="text-sm font-bold text-[#29231F]">
                        هشدارها و اعلان‌ها
                      </span>
                      <span className="text-xs text-[#786D65] tabular-nums">
                        {notifications.length.toLocaleString('fa-IR')} مورد
                      </span>
                    </div>
                    <div className="mt-2 space-y-2 max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-[#786D65] py-4 text-center">
                          اعلان جدیدی ثبت نشده است.
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => {
                              setNotifOpen(false);
                              router.push(n.href);
                            }}
                            className="w-full text-start p-2.5 rounded-2xl hover:bg-[#F7F4EF] transition-colors"
                          >
                            <p className="text-xs font-bold text-[#29231F]">
                              {n.title}
                            </p>
                            <p className="text-[11px] text-[#786D65] mt-0.5">
                              {n.description}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen((v) => !v);
                    setNotifOpen(false);
                    setBranchOpen(false);
                  }}
                  className="inline-flex items-center gap-2.5 bg-[#FFFEFC] rounded-full ps-2 pe-3.5 py-1.5 shadow-[0_1px_6px_rgba(41,35,31,0.04)] hover:bg-white transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#C47A3C]/18 text-[#4B2E24] font-bold text-xs flex items-center justify-center shrink-0">
                    {currentUser.fullName.slice(0, 1)}
                  </div>
                  <div className="hidden sm:flex flex-col text-start leading-tight">
                    <span className="text-xs font-bold text-[#29231F] whitespace-nowrap">
                      {currentUser.fullName}
                    </span>
                    <span className="text-[10px] text-[#786D65] whitespace-nowrap">
                      {ROLE_LABELS[currentUser.role]}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#786D65] hidden sm:block" />
                </button>

                {profileOpen && (
                  <div className="absolute end-0 mt-2 w-64 bg-[#FFFEFC] rounded-3xl shadow-xl border border-[#4B2E24]/8 p-3 z-40">
                    <p className="px-2.5 py-1.5 text-[11px] font-medium text-[#786D65]">
                      تغییر سریع نقش کاربری (دمو)
                    </p>
                    <div className="space-y-1 mt-1">
                      {state.users
                        .filter((u) => u.isActive)
                        .map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              switchUserById(u.id);
                              setProfileOpen(false);
                            }}
                            className={`w-full text-start px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                              u.id === currentUser.id
                                ? 'bg-[#C47A3C]/14 text-[#4B2E24] font-bold'
                                : 'text-[#29231F] hover:bg-[#F7F4EF]'
                            }`}
                          >
                            <span>{u.fullName}</span>
                            <span className="text-[10px] text-[#786D65]">
                              {ROLE_LABELS[u.role]}
                            </span>
                          </button>
                        ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-[#4B2E24]/8">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-start px-3 py-2 rounded-xl text-xs font-medium text-[#B84A3A] hover:bg-[#B84A3A]/8 transition-colors"
                      >
                        خروج از حساب کاربری
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Animated Viewport */}
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-[1440px] w-full mx-auto"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
