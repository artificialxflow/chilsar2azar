'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  ChilserState,
  Customer,
  DEMO_MOBILE,
  DEMO_OTP,
  FinancialTransaction,
  INITIAL_CHILSER_STATE,
  InventoryItem,
  Lead,
  LeadStage,
  MovementType,
  Order,
  OrderStatus,
  PurchaseOrder,
  RoastBatch,
  RoastBatchStatus,
  Shipment,
  ShipmentStatus,
  Supplier,
  SurveyFollowUpStatus,
  SurveyResponse,
  SystemSetting,
  TransactionStatus,
  User,
  UserRole,
} from './mockData';
import { calculateWeightLossPct } from './formatters';

const STORAGE_KEY = 'chilser_erp_state_v1';
const AUTH_KEY = 'chilser_erp_auth_v1';

export interface ToastItem {
  id: string;
  title: string;
  tone: 'success' | 'warning' | 'danger' | 'info';
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  tone: 'warning' | 'info' | 'danger';
  href: string;
}

interface ChilserContextValue {
  state: ChilserState;
  currentUser: User | null;
  authReady: boolean;
  activeBranch: string;
  setActiveBranch: (branch: string) => void;
  toasts: ToastItem[];
  notifications: AppNotification[];
  pushToast: (title: string, tone?: ToastItem['tone']) => void;
  dismissToast: (id: string) => void;

  // Auth
  loginWithOtp: (mobile: string, code: string) => { ok: boolean; error?: string };
  loginDemo: () => void;
  logout: () => void;
  switchUserById: (userId: string) => void;

  // Customers & Leads
  addCustomer: (data: Omit<Customer, 'id' | 'customerCode' | 'createdAt' | 'interactions' | 'totalSpent' | 'ordersCount'>) => void;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  addCustomerInteraction: (customerId: string, channel: Customer['interactions'][number]['channel'], summary: string) => void;
  addLead: (data: Omit<Lead, 'id' | 'leadCode' | 'createdAt'>) => void;
  updateLeadStage: (id: string, stage: LeadStage) => void;
  convertLeadToCustomer: (leadId: string) => void;

  // Orders
  addOrder: (data: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  markOrderPaid: (orderId: string) => void;

  // Production (Roast Batches)
  addRoastBatch: (data: Omit<RoastBatch, 'id' | 'batchNumber' | 'weightLossPct'>) => void;
  advanceRoastBatch: (batchId: string, nextStatus: RoastBatchStatus, actualOutputKg?: number, packagedUnits?: number) => void;

  // Inventory
  addInventoryItem: (data: Omit<InventoryItem, 'id' | 'updatedAt'>) => void;
  recordStockMovement: (itemId: string, movementType: MovementType, quantity: number, reason: string, referenceCode?: string) => void;

  // Purchases & Suppliers
  addSupplier: (data: Omit<Supplier, 'id' | 'supplierCode'>) => void;
  addPurchaseOrder: (data: Omit<PurchaseOrder, 'id' | 'poNumber' | 'totalCost'>) => void;
  receivePurchaseOrder: (poId: string) => void;

  // Shipping
  addShipment: (data: Omit<Shipment, 'id' | 'shipmentCode'>) => void;
  updateShipmentStatus: (shipmentId: string, status: ShipmentStatus) => void;

  // Accounting
  addTransaction: (data: Omit<FinancialTransaction, 'id' | 'transactionCode'>) => void;
  updateTransactionStatus: (trxId: string, status: TransactionStatus) => void;

  // Surveys
  addSurvey: (data: Omit<SurveyResponse, 'id' | 'surveyCode' | 'submittedAt'>) => void;
  updateSurveyStatus: (surveyId: string, status: SurveyFollowUpStatus) => void;

  // Users & Settings
  addUser: (data: Omit<User, 'id' | 'createdAt'>) => void;
  toggleUserActive: (userId: string) => void;
  updateUserRole: (userId: string, role: UserRole) => void;
  updateSettings: (patch: Partial<SystemSetting>) => void;
  resetDemoData: () => void;
}

const ChilserContext = createContext<ChilserContextValue | null>(null);

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

const ROLE_PERMISSIONS_MAP: Record<UserRole, string[]> = {
  ADMIN: ['dashboard', 'customers', 'leads', 'orders', 'production', 'inventory', 'purchases', 'shipping', 'accounting', 'surveys', 'reports', 'users', 'settings'],
  SALES: ['dashboard', 'customers', 'leads', 'orders', 'shipping', 'surveys', 'reports'],
  ROASTER: ['dashboard', 'production', 'inventory', 'reports'],
  WAREHOUSE: ['dashboard', 'inventory', 'purchases', 'shipping', 'orders'],
  ACCOUNTANT: ['dashboard', 'accounting', 'orders', 'purchases', 'reports'],
};

export function ChilserStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ChilserState>(INITIAL_CHILSER_STATE);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [activeBranch, setActiveBranch] = useState('کارگاه برشته‌کاری مرکزی');
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Hydrate from localStorage safely on client mount
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as ChilserState;
          if (parsed && Array.isArray(parsed.orders) && Array.isArray(parsed.inventory)) {
            setState(parsed);
          }
        }
        const savedUserId = window.localStorage.getItem(AUTH_KEY);
        if (savedUserId) {
          setCurrentUserId(savedUserId);
        }
      } catch {
        // Fallback gracefully to initial dataset
      } finally {
        setAuthReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Persist changes to localStorage
  useEffect(() => {
    if (!authReady) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state, authReady]);

  const currentUser = useMemo(() => {
    if (!currentUserId) return null;
    return state.users.find((u) => u.id === currentUserId) ?? state.users[0] ?? null;
  }, [currentUserId, state.users]);

  const pushToast = (title: string, tone: ToastItem['tone'] = 'success') => {
    const id = makeId('toast');
    setToasts((prev) => [...prev.slice(-3), { id, title, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const notifications = useMemo<AppNotification[]>(() => {
    const items: AppNotification[] = [];
    state.inventory
      .filter((i) => i.currentStock <= i.minStockLevel * state.settings.lowStockAlertMultiplier)
      .forEach((item) => {
        items.push({
          id: `low-${item.id}`,
          title: `هشدار کمبود موجودی: ${item.itemName}`,
          description: `موجودی فعلی ${item.currentStock} کمتر از حداقل مجاز (${item.minStockLevel}) است.`,
          tone: 'warning',
          href: '/inventory',
        });
      });

    state.orders
      .filter((o) => o.status === 'PENDING')
      .forEach((order) => {
        items.push({
          id: `ord-${order.id}`,
          title: `سفارش در انتظار آماده‌سازی (${order.orderNumber})`,
          description: `مشتری: ${order.customerName}`,
          tone: 'info',
          href: '/orders',
        });
      });

    state.transactions
      .filter((t) => t.status === 'PENDING' || t.status === 'OVERDUE')
      .slice(0, 3)
      .forEach((trx) => {
        items.push({
          id: `trx-${trx.id}`,
          title: `تراکنش مالی در انتظار تسویه`,
          description: `${trx.title} (${trx.counterparty})`,
          tone: trx.status === 'OVERDUE' ? 'danger' : 'warning',
          href: '/accounting',
        });
      });

    return items.slice(0, 7);
  }, [state.inventory, state.orders, state.transactions, state.settings.lowStockAlertMultiplier]);

  // --- Auth Actions ---
  const loginWithOtp = (mobile: string, code: string) => {
    const cleanMobile = mobile.trim().replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
    const cleanCode = code.trim().replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));

    if (!/^09\d{9}$/.test(cleanMobile)) {
      return { ok: false, error: 'شماره موبایل معتبر نیست (با ۰۹ شروع شود و ۱۱ رقم باشد).' };
    }
    if (cleanCode !== DEMO_OTP && cleanCode.length !== 5) {
      return { ok: false, error: 'کد تایید باید ۵ رقم باشد (کد دمو: 00000).' };
    }
    if (cleanCode !== DEMO_OTP) {
      return { ok: false, error: 'کد تایید واردشده نادرست است. از کد دمو 00000 استفاده کنید.' };
    }

    const matched =
      state.users.find((u) => u.mobile === cleanMobile) ??
      state.users.find((u) => u.mobile === DEMO_MOBILE) ??
      state.users[0];

    setCurrentUserId(matched.id);
    window.localStorage.setItem(AUTH_KEY, matched.id);
    pushToast(`خوش آمدید، ${matched.fullName}`, 'success');
    return { ok: true };
  };

  const loginDemo = () => {
    const admin = state.users[0];
    setCurrentUserId(admin.id);
    window.localStorage.setItem(AUTH_KEY, admin.id);
    pushToast(`ورود سریع با حساب ${admin.fullName} انجام شد`, 'success');
  };

  const logout = () => {
    setCurrentUserId(null);
    window.localStorage.removeItem(AUTH_KEY);
    pushToast('از سامانه خارج شدید', 'info');
  };

  const switchUserById = (userId: string) => {
    const found = state.users.find((u) => u.id === userId);
    if (!found) return;
    setCurrentUserId(found.id);
    window.localStorage.setItem(AUTH_KEY, found.id);
    pushToast(`نقش فعال به «${found.fullName}» تغییر یافت`, 'info');
  };

  // --- Customers & Leads ---
  const addCustomer: ChilserContextValue['addCustomer'] = (data) => {
    const nextCode = `CH-${1001 + state.customers.length}`;
    const newCustomer: Customer = {
      ...data,
      id: makeId('cust'),
      customerCode: nextCode,
      totalSpent: 0,
      ordersCount: 0,
      createdAt: new Date().toISOString(),
      interactions: [],
    };
    setState((prev) => ({ ...prev, customers: [newCustomer, ...prev.customers] }));
    pushToast(`مشتری «${data.companyName}» با کد ${nextCode} ثبت شد`);
  };

  const updateCustomer: ChilserContextValue['updateCustomer'] = (id, patch) => {
    setState((prev) => ({
      ...prev,
      customers: prev.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
    pushToast('اطلاعات مشتری بروزرسانی شد');
  };

  const addCustomerInteraction: ChilserContextValue['addCustomerInteraction'] = (
    customerId,
    channel,
    summary
  ) => {
    const authorName = currentUser?.fullName ?? 'کارن لهاک';
    setState((prev) => ({
      ...prev,
      customers: prev.customers.map((c) =>
        c.id === customerId
          ? {
              ...c,
              interactions: [
                {
                  id: makeId('int'),
                  date: new Date().toISOString(),
                  channel,
                  summary,
                  authorName,
                },
                ...c.interactions,
              ],
            }
          : c
      ),
    }));
    pushToast('گزارش تعامل با مشتری ثبت شد');
  };

  const addLead: ChilserContextValue['addLead'] = (data) => {
    const leadCode = `LD-${401 + state.leads.length}`;
    const lead: Lead = {
      ...data,
      id: makeId('lead'),
      leadCode,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, leads: [lead, ...prev.leads] }));
    pushToast(`سرنخ فروش «${data.businessName}» اضافه شد`);
  };

  const updateLeadStage: ChilserContextValue['updateLeadStage'] = (id, stage) => {
    setState((prev) => ({
      ...prev,
      leads: prev.leads.map((l) => (l.id === id ? { ...l, stage } : l)),
    }));
    pushToast('مرحله سرنخ فروش بروزرسانی شد', 'info');
  };

  const convertLeadToCustomer: ChilserContextValue['convertLeadToCustomer'] = (leadId) => {
    const lead = state.leads.find((l) => l.id === leadId);
    if (!lead || lead.stage === 'CONVERTED') return;

    const nextCode = `CH-${1001 + state.customers.length}`;
    const newCustomer: Customer = {
      id: makeId('cust'),
      customerCode: nextCode,
      fullName: lead.contactName,
      companyName: lead.businessName,
      segment: 'CAFE',
      mobile: lead.mobile,
      city: lead.city,
      address: `${lead.city} — ثبت‌شده از طریق سرنخ ${lead.leadCode}`,
      creditLimit: 50000000,
      totalSpent: 0,
      ordersCount: 0,
      status: 'ACTIVE',
      notes: lead.notes,
      createdAt: new Date().toISOString(),
      interactions: [
        {
          id: makeId('int'),
          date: new Date().toISOString(),
          channel: 'تماس تلفنی',
          summary: `تبدیل سرنخ ${lead.leadCode} به مشتری رسمی چیلسر.`,
          authorName: currentUser?.fullName ?? 'سارا رادمنش',
        },
      ],
    };

    setState((prev) => ({
      ...prev,
      leads: prev.leads.map((l) => (l.id === leadId ? { ...l, stage: 'CONVERTED' } : l)),
      customers: [newCustomer, ...prev.customers],
    }));
    pushToast(`سرنخ «${lead.businessName}» با موفقیت به مشتری تبدیل شد`);
  };

  // --- Orders (Cross-Module Sync: Inventory + Customer + Shipment + Accounting) ---
  const addOrder: ChilserContextValue['addOrder'] = (data) => {
    const orderNumber = `ORD-1405-${204 + state.orders.length}`;
    const orderId = makeId('ord');
    const items = data.items.map((item) => ({ ...item, id: makeId('oi'), orderId }));
    const newOrder: Order = {
      ...data,
      id: orderId,
      orderNumber,
      items,
      createdAt: new Date().toISOString(),
    };

    const operatorName = currentUser?.fullName ?? 'کارن لهاک';
    const newMovements: ChilserState['stockMovements'] = [];

    const updatedInventory = state.inventory.map((inv) => {
      const matchedItems = items.filter((it) => it.skuCode === inv.skuCode);
      if (matchedItems.length === 0) return inv;
      const totalKgDeducted = matchedItems.reduce(
        (acc, it) => acc + (it.packWeightGr * it.quantity) / 1000,
        0
      );
      newMovements.push({
        id: makeId('mov'),
        movementCode: `SM-${901 + state.stockMovements.length + newMovements.length}`,
        itemId: inv.id,
        itemName: inv.itemName,
        movementType: 'OUT',
        quantity: Math.round(totalKgDeducted * 10) / 10,
        unit: inv.unit,
        referenceCode: orderNumber,
        reason: `خروج بابت سفارش ${data.customerName}`,
        operatorName,
        createdAt: new Date().toISOString(),
      });
      return {
        ...inv,
        currentStock: Math.max(0, Math.round((inv.currentStock - totalKgDeducted) * 10) / 10),
        updatedAt: new Date().toISOString(),
      };
    });

    const matchedCustomer = state.customers.find((c) => c.id === data.customerId);
    const updatedCustomers = state.customers.map((c) =>
      c.id === data.customerId
        ? {
            ...c,
            ordersCount: c.ordersCount + 1,
            totalSpent: c.totalSpent + data.totalAmount,
            lastOrderAt: data.orderDate,
          }
        : c
    );

    const newShipment: Shipment = {
      id: makeId('shp'),
      shipmentCode: `SHP-${501 + state.shipments.length}`,
      orderId,
      orderNumber,
      customerName: data.customerName,
      destinationCity: matchedCustomer?.city ?? 'تهران',
      carrierName: matchedCustomer?.city === 'تهران' ? 'CHILSER_COURIER' : 'TIPAX',
      trackingCode: `CH-${Math.floor(100000 + Math.random() * 899999)}`,
      status: 'READY',
      shippingCost: matchedCustomer?.city === 'تهران' ? 450000 : 1200000,
    };

    const newTransactions = [...state.transactions];
    if (data.paymentStatus === 'PAID') {
      newTransactions.unshift({
        id: makeId('trx'),
        transactionCode: `FIN-1405-${301 + state.transactions.length}`,
        type: 'RECEIPT',
        category: 'فروش محصول',
        title: `دریافت بابت سفارش ${orderNumber}`,
        counterparty: data.customerName,
        amount: data.totalAmount,
        paymentMethod: 'BANK_TRANSFER',
        status: 'SETTLED',
        referenceCode: orderNumber,
        transactionDate: data.orderDate,
      });
    }

    setState((prev) => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
      inventory: updatedInventory,
      stockMovements: [...newMovements, ...prev.stockMovements],
      customers: updatedCustomers,
      shipments: [newShipment, ...prev.shipments],
      transactions: newTransactions,
    }));
    pushToast(`سفارش ${orderNumber} ثبت شد و موجودی انبار و مرسوله همگام‌سازی گردید`);
  };

  const updateOrderStatus: ChilserContextValue['updateOrderStatus'] = (orderId, status) => {
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
      shipments: prev.shipments.map((s) => {
        if (s.orderId !== orderId) return s;
        if (status === 'SHIPPED') return { ...s, status: 'DISPATCHED', dispatchedAt: new Date().toISOString() };
        if (status === 'DELIVERED') return { ...s, status: 'DELIVERED', deliveredAt: new Date().toISOString(), deliveryHours: s.deliveryHours ?? 4.5 };
        return s;
      }),
    }));
    pushToast('وضعیت سفارش بروزرسانی شد', 'info');
  };

  const markOrderPaid: ChilserContextValue['markOrderPaid'] = (orderId) => {
    const order = state.orders.find((o) => o.id === orderId);
    if (!order || order.paymentStatus === 'PAID') return;

    const newTrx: FinancialTransaction = {
      id: makeId('trx'),
      transactionCode: `FIN-1405-${301 + state.transactions.length}`,
      type: 'RECEIPT',
      category: 'فروش محصول',
      title: `تسویه فاکتور سفارش ${order.orderNumber}`,
      counterparty: order.customerName,
      amount: order.totalAmount,
      paymentMethod: 'BANK_TRANSFER',
      status: 'SETTLED',
      referenceCode: order.orderNumber,
      transactionDate: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === orderId ? { ...o, paymentStatus: 'PAID' } : o)),
      transactions: [newTrx, ...prev.transactions],
    }));
    pushToast(`پرداخت سفارش ${order.orderNumber} تایید و در حسابداری ثبت شد`);
  };

  // --- Production (Specialized Coffee Roasting Sync) ---
  const addRoastBatch: ChilserContextValue['addRoastBatch'] = (data) => {
    const batchNumber = `RB-1405-${81 + state.roastBatches.length}`;
    const weightLossPct = calculateWeightLossPct(data.inputGreenKg, data.outputRoastedKg);
    const batch: RoastBatch = {
      ...data,
      id: makeId('rb'),
      batchNumber,
      weightLossPct,
    };
    setState((prev) => ({ ...prev, roastBatches: [batch, ...prev.roastBatches] }));
    pushToast(`بچ برشته‌کاری ${batchNumber} برنامه‌ریزی شد`);
  };

  const advanceRoastBatch: ChilserContextValue['advanceRoastBatch'] = (
    batchId,
    nextStatus,
    actualOutputKg,
    packagedUnits
  ) => {
    const batch = state.roastBatches.find((b) => b.id === batchId);
    if (!batch) return;

    const outputKg = actualOutputKg ?? batch.outputRoastedKg;
    const weightLossPct = calculateWeightLossPct(batch.inputGreenKg, outputKg);
    const operatorName = currentUser?.fullName ?? batch.operatorName;

    let updatedInventory = [...state.inventory];
    const addedMovements: ChilserState['stockMovements'] = [];

    // When completing a roast batch, deduct green beans & add roasted finished coffee to inventory!
    if (nextStatus === 'COMPLETED' && batch.status !== 'COMPLETED') {
      updatedInventory = updatedInventory.map((item) => {
        if (item.id === batch.greenBeanItemId) {
          addedMovements.push({
            id: makeId('mov'),
            movementCode: `SM-${901 + state.stockMovements.length + addedMovements.length}`,
            itemId: item.id,
            itemName: item.itemName,
            movementType: 'OUT',
            quantity: batch.inputGreenKg,
            unit: item.unit,
            referenceCode: batch.batchNumber,
            reason: `مصرف دانه سبز برای بچ ${batch.batchNumber}`,
            operatorName,
            createdAt: new Date().toISOString(),
          });
          return {
            ...item,
            currentStock: Math.max(0, Math.round((item.currentStock - batch.inputGreenKg) * 10) / 10),
            updatedAt: new Date().toISOString(),
          };
        }
        if (item.id === batch.targetProductId) {
          addedMovements.push({
            id: makeId('mov'),
            movementCode: `SM-${901 + state.stockMovements.length + addedMovements.length}`,
            itemId: item.id,
            itemName: item.itemName,
            movementType: 'IN',
            quantity: outputKg,
            unit: item.unit,
            referenceCode: batch.batchNumber,
            reason: `ورود محصول برشته‌شده از بچ ${batch.batchNumber} (افت ${weightLossPct}٪)`,
            operatorName,
            createdAt: new Date().toISOString(),
          });
          return {
            ...item,
            currentStock: Math.round((item.currentStock + outputKg) * 10) / 10,
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      });
    }

    setState((prev) => ({
      ...prev,
      roastBatches: prev.roastBatches.map((b) =>
        b.id === batchId
          ? {
              ...b,
              status: nextStatus,
              outputRoastedKg: outputKg,
              weightLossPct,
              packagedUnits: packagedUnits ?? b.packagedUnits,
              completedAt: nextStatus === 'COMPLETED' ? new Date().toISOString() : b.completedAt,
            }
          : b
      ),
      inventory: updatedInventory,
      stockMovements: [...addedMovements, ...prev.stockMovements],
    }));

    if (nextStatus === 'COMPLETED') {
      pushToast(`بچ ${batch.batchNumber} تکمیل شد؛ موجودی دانه سبز کسر و محصول نهایی به انبار افزوده شد`);
    } else {
      pushToast(`وضعیت بچ ${batch.batchNumber} بروزرسانی شد`, 'info');
    }
  };

  // --- Inventory ---
  const addInventoryItem: ChilserContextValue['addInventoryItem'] = (data) => {
    const newItem: InventoryItem = {
      ...data,
      id: makeId('inv'),
      updatedAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, inventory: [newItem, ...prev.inventory] }));
    pushToast(`کالای «${data.itemName}» به انبار اضافه شد`);
  };

  const recordStockMovement: ChilserContextValue['recordStockMovement'] = (
    itemId,
    movementType,
    quantity,
    reason,
    referenceCode
  ) => {
    const item = state.inventory.find((i) => i.id === itemId);
    if (!item || quantity <= 0) return;

    const movementCode = `SM-${901 + state.stockMovements.length}`;
    const nextStock =
      movementType === 'IN'
        ? item.currentStock + quantity
        : movementType === 'OUT'
        ? Math.max(0, item.currentStock - quantity)
        : quantity;

    const movement = {
      id: makeId('mov'),
      movementCode,
      itemId,
      itemName: item.itemName,
      movementType,
      quantity,
      unit: item.unit,
      referenceCode: referenceCode || movementCode,
      reason,
      operatorName: currentUser?.fullName ?? 'مهرداد قاسمی',
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      inventory: prev.inventory.map((i) =>
        i.id === itemId
          ? { ...i, currentStock: Math.round(nextStock * 10) / 10, updatedAt: new Date().toISOString() }
          : i
      ),
      stockMovements: [movement, ...prev.stockMovements],
    }));
    pushToast(`سند انبار ${movementCode} با موفقیت ثبت شد`);
  };

  // --- Purchases & Suppliers ---
  const addSupplier: ChilserContextValue['addSupplier'] = (data) => {
    const supplierCode = `SUP-0${state.suppliers.length + 1}`;
    setState((prev) => ({
      ...prev,
      suppliers: [{ ...data, id: makeId('sup'), supplierCode }, ...prev.suppliers],
    }));
    pushToast(`تأمین‌کننده «${data.supplierName}» ثبت شد`);
  };

  const addPurchaseOrder: ChilserContextValue['addPurchaseOrder'] = (data) => {
    const poNumber = `PO-1405-0${41 + state.purchaseOrders.length}`;
    const totalCost = Math.round(data.quantity * data.unitCost);
    const newPo: PurchaseOrder = {
      ...data,
      id: makeId('po'),
      poNumber,
      totalCost,
    };
    setState((prev) => ({ ...prev, purchaseOrders: [newPo, ...prev.purchaseOrders] }));
    pushToast(`سفارش خرید ${poNumber} ثبت شد`);
  };

  const receivePurchaseOrder: ChilserContextValue['receivePurchaseOrder'] = (poId) => {
    const po = state.purchaseOrders.find((p) => p.id === poId);
    if (!po || po.status === 'RECEIVED') return;

    const operatorName = currentUser?.fullName ?? 'مهرداد قاسمی';
    const movementCode = `SM-${901 + state.stockMovements.length}`;
    const newMovement = {
      id: makeId('mov'),
      movementCode,
      itemId: po.itemId,
      itemName: po.itemName,
      movementType: 'IN' as const,
      quantity: po.quantity,
      unit: po.unit,
      referenceCode: po.poNumber,
      reason: `دریافت خرید از ${po.supplierName} (لات ${po.lotNumber})`,
      operatorName,
      createdAt: new Date().toISOString(),
    };

    const newTrx: FinancialTransaction = {
      id: makeId('trx'),
      transactionCode: `FIN-1405-${301 + state.transactions.length}`,
      type: 'PAYMENT',
      category: 'خرید مواد اولیه',
      title: `پرداخت بابت سفارش خرید ${po.poNumber} (${po.itemName})`,
      counterparty: po.supplierName,
      amount: po.totalCost,
      paymentMethod: 'BANK_TRANSFER',
      status: 'SETTLED',
      referenceCode: po.poNumber,
      transactionDate: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      purchaseOrders: prev.purchaseOrders.map((p) =>
        p.id === poId ? { ...p, status: 'RECEIVED', receivedDate: new Date().toISOString() } : p
      ),
      inventory: prev.inventory.map((i) =>
        i.id === po.itemId
          ? { ...i, currentStock: Math.round((i.currentStock + po.quantity) * 10) / 10, updatedAt: new Date().toISOString() }
          : i
      ),
      stockMovements: [newMovement, ...prev.stockMovements],
      transactions: [newTrx, ...prev.transactions],
    }));
    pushToast(`محموله ${po.poNumber} دریافت شد؛ موجودی انبار افزایش و سند پرداخت ثبت گردید`);
  };

  // --- Shipping ---
  const addShipment: ChilserContextValue['addShipment'] = (data) => {
    const shipmentCode = `SHP-${501 + state.shipments.length}`;
    setState((prev) => ({
      ...prev,
      shipments: [{ ...data, id: makeId('shp'), shipmentCode }, ...prev.shipments],
    }));
    pushToast(`مرسوله ${shipmentCode} ایجاد شد`);
  };

  const updateShipmentStatus: ChilserContextValue['updateShipmentStatus'] = (shipmentId, status) => {
    const shipment = state.shipments.find((s) => s.id === shipmentId);
    setState((prev) => ({
      ...prev,
      shipments: prev.shipments.map((s) => {
        if (s.id !== shipmentId) return s;
        return {
          ...s,
          status,
          dispatchedAt: status === 'DISPATCHED' && !s.dispatchedAt ? new Date().toISOString() : s.dispatchedAt,
          deliveredAt: status === 'DELIVERED' ? new Date().toISOString() : s.deliveredAt,
          deliveryHours: status === 'DELIVERED' ? s.deliveryHours ?? 3.5 : s.deliveryHours,
        };
      }),
      orders:
        shipment && (status === 'DISPATCHED' || status === 'DELIVERED')
          ? prev.orders.map((o) =>
              o.id === shipment.orderId
                ? { ...o, status: status === 'DELIVERED' ? 'DELIVERED' : 'SHIPPED' }
                : o
            )
          : prev.orders,
    }));
    pushToast('وضعیت مرسوله بروزرسانی شد', 'info');
  };

  // --- Accounting ---
  const addTransaction: ChilserContextValue['addTransaction'] = (data) => {
    const transactionCode = `FIN-1405-${301 + state.transactions.length}`;
    setState((prev) => ({
      ...prev,
      transactions: [{ ...data, id: makeId('trx'), transactionCode }, ...prev.transactions],
    }));
    pushToast(`سند مالی ${transactionCode} با موفقیت ثبت شد`);
  };

  const updateTransactionStatus: ChilserContextValue['updateTransactionStatus'] = (trxId, status) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) => (t.id === trxId ? { ...t, status } : t)),
    }));
    pushToast('وضعیت تراکنش مالی بروزرسانی شد', 'info');
  };

  // --- Surveys ---
  const addSurvey: ChilserContextValue['addSurvey'] = (data) => {
    const surveyCode = `SV-${101 + state.surveys.length}`;
    setState((prev) => ({
      ...prev,
      surveys: [
        { ...data, id: makeId('srv'), surveyCode, submittedAt: new Date().toISOString() },
        ...prev.surveys,
      ],
    }));
    pushToast(`بازخورد مشتری ${surveyCode} ثبت شد`);
  };

  const updateSurveyStatus: ChilserContextValue['updateSurveyStatus'] = (surveyId, status) => {
    setState((prev) => ({
      ...prev,
      surveys: prev.surveys.map((s) => (s.id === surveyId ? { ...s, followUpStatus: status } : s)),
    }));
    pushToast('وضعیت پیگیری بازخورد بروزرسانی شد', 'info');
  };

  // --- Users & Settings ---
  const addUser: ChilserContextValue['addUser'] = (data) => {
    const newUser: User = {
      ...data,
      id: makeId('usr'),
      permissions: ROLE_PERMISSIONS_MAP[data.role],
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, users: [...prev.users, newUser] }));
    pushToast(`کاربر «${data.fullName}» به سامانه اضافه شد`);
  };

  const toggleUserActive: ChilserContextValue['toggleUserActive'] = (userId) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u)),
    }));
    pushToast('وضعیت دسترسی کاربر تغییر یافت', 'info');
  };

  const updateUserRole: ChilserContextValue['updateUserRole'] = (userId, role) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === userId ? { ...u, role, permissions: ROLE_PERMISSIONS_MAP[role] } : u
      ),
    }));
    pushToast('سطح دسترسی نقش کاربر بروزرسانی شد', 'info');
  };

  const updateSettings: ChilserContextValue['updateSettings'] = (patch) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
    }));
    pushToast('تنظیمات سامانه ذخیره شد');
  };

  const resetDemoData = () => {
    setState(INITIAL_CHILSER_STATE);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CHILSER_STATE));
    pushToast('تمامی داده‌های سامانه به حالت نمونه اولیه بازنشانی شد', 'info');
  };

  return (
    <ChilserContext.Provider
      value={{
        state,
        currentUser,
        authReady,
        activeBranch,
        setActiveBranch,
        toasts,
        notifications,
        pushToast,
        dismissToast,
        loginWithOtp,
        loginDemo,
        logout,
        switchUserById,
        addCustomer,
        updateCustomer,
        addCustomerInteraction,
        addLead,
        updateLeadStage,
        convertLeadToCustomer,
        addOrder,
        updateOrderStatus,
        markOrderPaid,
        addRoastBatch,
        advanceRoastBatch,
        addInventoryItem,
        recordStockMovement,
        addSupplier,
        addPurchaseOrder,
        receivePurchaseOrder,
        addShipment,
        updateShipmentStatus,
        addTransaction,
        updateTransactionStatus,
        addSurvey,
        updateSurveyStatus,
        addUser,
        toggleUserActive,
        updateUserRole,
        updateSettings,
        resetDemoData,
      }}
    >
      {children}
    </ChilserContext.Provider>
  );
}

export function useChilserStore() {
  const ctx = useContext(ChilserContext);
  if (!ctx) {
    throw new Error('useChilserStore must be used inside ChilserStoreProvider');
  }
  return ctx;
}
