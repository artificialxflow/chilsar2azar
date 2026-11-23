// Centralized TypeScript interfaces & realistic Persian coffee domain mock data
// All field names match prisma/schema.prisma camelCase conventions 1:1.

export type UserRole = 'ADMIN' | 'SALES' | 'ROASTER' | 'WAREHOUSE' | 'ACCOUNTANT';

export interface User {
  id: string;
  fullName: string;
  mobile: string;
  email?: string;
  role: UserRole;
  department: string;
  isActive: boolean;
  permissions: string[];
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface OtpCode {
  id: string;
  mobile: string;
  code: string;
  expiresAt: string;
  consumed: boolean;
  createdAt: string;
}

export type CustomerSegment = 'CAFE' | 'WHOLESALE' | 'CORPORATE' | 'RETAIL';
export type CustomerStatus = 'ACTIVE' | 'VIP' | 'INACTIVE';

export interface CustomerInteraction {
  id: string;
  date: string;
  channel: 'تماس تلفنی' | 'جلسه حضوری' | 'ارسال نمونه' | 'پیام‌رسان';
  summary: string;
  authorName: string;
}

export interface Customer {
  id: string;
  customerCode: string;
  fullName: string;
  companyName: string;
  segment: CustomerSegment;
  mobile: string;
  city: string;
  address: string;
  creditLimit: number;
  totalSpent: number;
  ordersCount: number;
  status: CustomerStatus;
  notes?: string;
  lastOrderAt?: string;
  createdAt: string;
  interactions: CustomerInteraction[];
}

export type LeadSource = 'EXHIBITION' | 'INSTAGRAM' | 'REFERRAL' | 'WEBSITE' | 'COLD_CALL';
export type LeadStage = 'NEW' | 'CONTACTED' | 'SAMPLE_SENT' | 'NEGOTIATION' | 'CONVERTED' | 'LOST';

export interface Lead {
  id: string;
  leadCode: string;
  contactName: string;
  businessName: string;
  mobile: string;
  city: string;
  source: LeadSource;
  stage: LeadStage;
  estimatedValue: number;
  sampleProduct?: string;
  assignedTo: string;
  notes?: string;
  createdAt: string;
}

export type OrderStatus = 'PENDING' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';
export type GrindType = 'WHOLE_BEAN' | 'ESPRESSO' | 'FRENCH_PRESS' | 'TURKISH' | 'POUR_OVER';

export interface OrderItem {
  id: string;
  orderId: string;
  skuCode: string;
  productName: string;
  grindType: GrindType;
  packWeightGr: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  orderDate: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
}

export type RoastProfile = 'LIGHT' | 'MEDIUM' | 'MEDIUM_DARK' | 'DARK';
export type RoastBatchStatus = 'PLANNED' | 'ROASTING' | 'PACKAGING' | 'COMPLETED';

export interface RoastBatch {
  id: string;
  batchNumber: string;
  greenBeanItemId: string;
  greenBeanName: string;
  targetProductId: string;
  targetProductName: string;
  roastProfile: RoastProfile;
  roasterMachine: string;
  operatorName: string;
  inputGreenKg: number;
  outputRoastedKg: number;
  weightLossPct: number;
  roastTempC: number;
  roastDurationMin: number;
  packagedUnits: number;
  packSizeGr: number;
  status: RoastBatchStatus;
  scheduledDate: string;
  completedAt?: string;
  qualityNotes?: string;
}

export type InventoryCategory = 'GREEN_BEAN' | 'ROASTED_COFFEE' | 'PACKAGING';
export type InventoryUnit = 'KG' | 'PACK' | 'PIECE';

export interface InventoryItem {
  id: string;
  skuCode: string;
  itemName: string;
  category: InventoryCategory;
  origin?: string;
  unit: InventoryUnit;
  currentStock: number;
  minStockLevel: number;
  unitCost: number;
  warehouseZone: string;
  imageUrl?: string;
  updatedAt: string;
}

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface StockMovement {
  id: string;
  movementCode: string;
  itemId: string;
  itemName: string;
  movementType: MovementType;
  quantity: number;
  unit: InventoryUnit;
  referenceCode: string;
  reason: string;
  operatorName: string;
  createdAt: string;
}

export type SupplierCategory = 'GREEN_BEAN' | 'PACKAGING' | 'EQUIPMENT';

export interface Supplier {
  id: string;
  supplierCode: string;
  supplierName: string;
  contactName: string;
  mobile: string;
  category: SupplierCategory;
  originRegion: string;
  rating: number;
  isActive: boolean;
}

export type PurchaseOrderStatus = 'ORDERED' | 'IN_TRANSIT' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  itemId: string;
  itemName: string;
  lotNumber: string;
  quantity: number;
  unit: InventoryUnit;
  unitCost: number;
  totalCost: number;
  status: PurchaseOrderStatus;
  orderDate: string;
  receivedDate?: string;
}

export type CarrierName = 'CHILSER_COURIER' | 'TIPAX' | 'BARBARI' | 'EXPRESS_POST';
export type ShipmentStatus = 'READY' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED';

export interface Shipment {
  id: string;
  shipmentCode: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  destinationCity: string;
  carrierName: CarrierName;
  trackingCode: string;
  status: ShipmentStatus;
  dispatchedAt?: string;
  deliveredAt?: string;
  deliveryHours?: number;
  shippingCost: number;
}

export type TransactionType = 'RECEIPT' | 'PAYMENT' | 'EXPENSE';
export type PaymentMethod = 'BANK_TRANSFER' | 'POS' | 'CHEQUE' | 'CASH';
export type TransactionStatus = 'SETTLED' | 'PENDING' | 'OVERDUE';

export interface FinancialTransaction {
  id: string;
  transactionCode: string;
  type: TransactionType;
  category: string;
  title: string;
  counterparty: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  referenceCode?: string;
  transactionDate: string;
}

export type SurveyFollowUpStatus = 'NEW' | 'REVIEWED' | 'RESOLVED';

export interface SurveyResponse {
  id: string;
  surveyCode: string;
  customerName: string;
  orderNumber: string;
  overallScore: number;
  roastQuality: number;
  aromaFreshness: number;
  deliverySpeed: number;
  npsScore: number;
  comment: string;
  followUpStatus: SurveyFollowUpStatus;
  submittedAt: string;
}

export interface SystemSetting {
  id: string;
  companyName: string;
  brandSubtitle: string;
  roasteryBranch: string;
  phone: string;
  address: string;
  taxRatePercent: number;
  maxAllowedWeightLossPct: number;
  lowStockAlertMultiplier: number;
  currencyLabel: string;
}

export interface ChilserState {
  users: User[];
  customers: Customer[];
  leads: Lead[];
  orders: Order[];
  roastBatches: RoastBatch[];
  inventory: InventoryItem[];
  stockMovements: StockMovement[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  shipments: Shipment[];
  transactions: FinancialTransaction[];
  surveys: SurveyResponse[];
  settings: SystemSetting;
}

export const DEMO_MOBILE = '09126723365';
export const DEMO_OTP = '00000';

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'مدیر کل سیستم',
  SALES: 'مدیر فروش و CRM',
  ROASTER: 'استاد برشته‌کاری',
  WAREHOUSE: 'مسئول انبار و لجستیک',
  ACCOUNTANT: 'حسابدار عملیاتی',
};

export const SEGMENT_LABELS: Record<CustomerSegment, string> = {
  CAFE: 'کافه تخصصی',
  WHOLESALE: 'عمده‌فروش',
  CORPORATE: 'سازمانی',
  RETAIL: 'مصرف‌کننده نهایی',
};

export const GRIND_LABELS: Record<GrindType, string> = {
  WHOLE_BEAN: 'دانه کامل',
  ESPRESSO: 'آسیاب اسپرسو',
  FRENCH_PRESS: 'آسیاب فرنچ‌پرس',
  TURKISH: 'آسیاب ترک',
  POUR_OVER: 'آسیاب دمی (V60)',
};

export const ROAST_PROFILE_LABELS: Record<RoastProfile, string> = {
  LIGHT: 'لایت (دمی)',
  MEDIUM: 'مدیوم (بالانس)',
  MEDIUM_DARK: 'مدیوم-دارک (اسپرسو)',
  DARK: 'دارک (کلاسیک)',
};

export const CARRIER_LABELS: Record<CarrierName, string> = {
  CHILSER_COURIER: 'پیک اختصاصی چیلسر',
  TIPAX: 'تیپاکس',
  BARBARI: 'باربری بین‌شهری',
  EXPRESS_POST: 'پست پیشتاز',
};

export const SOURCE_LABELS: Record<LeadSource, string> = {
  EXHIBITION: 'نمایشگاه قهوه',
  INSTAGRAM: 'اینستاگرام',
  REFERRAL: 'معرفی مشتریان',
  WEBSITE: 'وب‌سایت چیلسر',
  COLD_CALL: 'تماس مستقیم',
};

export const INITIAL_CHILSER_STATE: ChilserState = {
  users: [
    {
      id: 'usr-1',
      fullName: 'کارن لهاک',
      mobile: '09126723365',
      email: 'karen@chilser.ir',
      role: 'ADMIN',
      department: 'مدیریت اجرایی',
      isActive: true,
      permissions: ['dashboard', 'customers', 'leads', 'orders', 'production', 'inventory', 'purchases', 'shipping', 'accounting', 'surveys', 'reports', 'users', 'settings'],
      avatarUrl: '/images/avatars/admin-avatar.webp',
      lastLoginAt: '2026-11-23T08:15:00Z',
      createdAt: '2026-04-01T08:00:00Z',
    },
    {
      id: 'usr-2',
      fullName: 'سارا رادمنش',
      mobile: '09123458821',
      email: 'sara@chilser.ir',
      role: 'SALES',
      department: 'فروش و ارتباط با مشتریان',
      isActive: true,
      permissions: ['dashboard', 'customers', 'leads', 'orders', 'shipping', 'surveys', 'reports'],
      lastLoginAt: '2026-11-22T15:30:00Z',
      createdAt: '2026-04-12T08:00:00Z',
    },
    {
      id: 'usr-3',
      fullName: 'امیرحسین بهرامی',
      mobile: '09198224510',
      email: 'roast@chilser.ir',
      role: 'ROASTER',
      department: 'کارگاه برشته‌کاری',
      isActive: true,
      permissions: ['dashboard', 'production', 'inventory', 'reports'],
      lastLoginAt: '2026-11-23T06:40:00Z',
      createdAt: '2026-05-03T08:00:00Z',
    },
    {
      id: 'usr-4',
      fullName: 'مهرداد قاسمی',
      mobile: '09127119034',
      email: 'warehouse@chilser.ir',
      role: 'WAREHOUSE',
      department: 'انبار و توزیع',
      isActive: true,
      permissions: ['dashboard', 'inventory', 'purchases', 'shipping', 'orders'],
      lastLoginAt: '2026-11-22T11:20:00Z',
      createdAt: '2026-05-18T08:00:00Z',
    },
    {
      id: 'usr-5',
      fullName: 'نیلوفر شریعتی',
      mobile: '09124406198',
      email: 'finance@chilser.ir',
      role: 'ACCOUNTANT',
      department: 'امور مالی و حسابداری',
      isActive: true,
      permissions: ['dashboard', 'accounting', 'orders', 'purchases', 'reports'],
      lastLoginAt: '2026-11-22T17:05:00Z',
      createdAt: '2026-06-01T08:00:00Z',
    },
  ],

  customers: [
    {
      id: 'cust-1',
      customerCode: 'CH-1001',
      fullName: 'پویا کیانی',
      companyName: 'کافه رویای سپید',
      segment: 'CAFE',
      mobile: '09123104455',
      city: 'تهران',
      address: 'خیابان فرشته، پلاک ۴۲، طبقه همکف',
      creditLimit: 120000000,
      totalSpent: 168500000,
      ordersCount: 14,
      status: 'VIP',
      notes: 'مصرف ثابت هفتگی ۴۰ کیلو بلند اسپرسو ۸۰-۲۰ و ۱۰ کیلو تک‌خاستگاه اتیوپی.',
      lastOrderAt: '2026-11-22T09:30:00Z',
      createdAt: '2026-05-10T08:00:00Z',
      interactions: [
        { id: 'int-1', date: '2026-11-20T10:00:00Z', channel: 'تماس تلفنی', summary: 'تایید سفارش هفتگی آذرماه و درخواست پروفیل رُست کمی روشن‌تر برای اتیوپی.', authorName: 'سارا رادمنش' },
        { id: 'int-2', date: '2026-11-08T14:20:00Z', channel: 'ارسال نمونه', summary: 'ارسال نمونه ۵۰۰ گرمی کلمبیا هویلا برای منوی دمی پاییز.', authorName: 'امیرحسین بهرامی' },
      ],
    },
    {
      id: 'cust-2',
      customerCode: 'CH-1002',
      fullName: 'مریم کاظمی',
      companyName: 'پخش تخصصی باریستا پارس',
      segment: 'WHOLESALE',
      mobile: '09131149876',
      city: 'اصفهان',
      address: 'خیابان چهارباغ بالا، مجتمع کوثر، واحد ۲۱۰',
      creditLimit: 250000000,
      totalSpent: 294000000,
      ordersCount: 9,
      status: 'VIP',
      notes: 'تسویه ۵۰ درصد نقد و ۵۰ درصد چک ۳۰ روزه صیادی.',
      lastOrderAt: '2026-11-21T12:15:00Z',
      createdAt: '2026-05-22T08:00:00Z',
      interactions: [
        { id: 'int-3', date: '2026-11-18T11:00:00Z', channel: 'جلسه حضوری', summary: 'توافق تامین ماهانه ۲۰۰ کیلوگرم دانه برشته برای کافه‌های طرف قرارداد اصفهان.', authorName: 'کارن لهاک' },
      ],
    },
    {
      id: 'cust-3',
      customerCode: 'CH-1003',
      fullName: 'حامد فرهادی',
      companyName: 'هتل بوتیک ارگ',
      segment: 'CORPORATE',
      mobile: '09155023319',
      city: 'مشهد',
      address: 'بلوار سجاد، نبش بهارستان، هتل ارگ',
      creditLimit: 80000000,
      totalSpent: 74200000,
      ordersCount: 6,
      status: 'ACTIVE',
      notes: 'بسته‌بندی ۱ کیلویی سوپاپ‌دار با تاریخ رُست روز ارسال.',
      lastOrderAt: '2026-11-19T08:45:00Z',
      createdAt: '2026-06-14T08:00:00Z',
      interactions: [
        { id: 'int-4', date: '2026-11-15T09:15:00Z', channel: 'پیام‌رسان', summary: 'ارسال پیش‌فاکتور آذرماه و هماهنگی باربری.', authorName: 'سارا رادمنش' },
      ],
    },
    {
      id: 'cust-4',
      customerCode: 'CH-1004',
      fullName: 'الهام نصیری',
      companyName: 'کافه گالری بامداد',
      segment: 'CAFE',
      mobile: '09128091244',
      city: 'تهران',
      address: 'خیابان کریم‌خان زند، خیابان ایرانشهر، پلاک ۱۸',
      creditLimit: 60000000,
      totalSpent: 52800000,
      ordersCount: 8,
      status: 'ACTIVE',
      notes: 'تمرکز روی قهوه‌های دمی و تک‌خاستگاه‌های آفریقایی.',
      lastOrderAt: '2026-11-17T16:10:00Z',
      createdAt: '2026-07-02T08:00:00Z',
      interactions: [],
    },
    {
      id: 'cust-5',
      customerCode: 'CH-1005',
      fullName: 'رضا طاهری',
      companyName: 'شرکت فناوری همگامان',
      segment: 'CORPORATE',
      mobile: '09126053911',
      city: 'تهران',
      address: 'شهرک غرب، بلوار دادمان، برج فناوری، طبقه ۶',
      creditLimit: 45000000,
      totalSpent: 39600000,
      ordersCount: 5,
      status: 'ACTIVE',
      notes: 'سفارش اشتراکی اول هر ماه برای کافی‌بار پرسنل.',
      lastOrderAt: '2026-11-10T10:30:00Z',
      createdAt: '2026-08-19T08:00:00Z',
      interactions: [],
    },
  ],

  leads: [
    {
      id: 'lead-1',
      leadCode: 'LD-401',
      contactName: 'سیاوش نادری',
      businessName: 'کافه کتاب سمرقند',
      mobile: '09125547712',
      city: 'تهران',
      source: 'EXHIBITION',
      stage: 'SAMPLE_SENT',
      estimatedValue: 48000000,
      sampleProduct: 'بلند اسپرسو ۷۰-۳۰ چیلسر + اتیوپی یرگاچف',
      assignedTo: 'سارا رادمنش',
      notes: 'پک تست ۱ کیلویی ارسال شد؛ قرار کاپینگ روز چهارشنبه.',
      createdAt: '2026-11-18T10:00:00Z',
    },
    {
      id: 'lead-2',
      leadCode: 'LD-402',
      contactName: 'نگار افشاری',
      businessName: 'مجموعه کافه‌های لمیز شیراز',
      mobile: '09173098841',
      city: 'شیراز',
      source: 'REFERRAL',
      stage: 'NEGOTIATION',
      estimatedValue: 135000000,
      sampleProduct: 'بلند اختصاصی ۸۰-۲۰ عربیکا',
      assignedTo: 'کارن لهاک',
      notes: 'بررسی لیست قیمت عمده و شرایط ارسال با باربری یخچالی.',
      createdAt: '2026-11-15T11:30:00Z',
    },
    {
      id: 'lead-3',
      leadCode: 'LD-403',
      contactName: 'فرزاد مرادی',
      businessName: 'نان و قهوه آفتاب',
      mobile: '09129041123',
      city: 'کرج',
      source: 'INSTAGRAM',
      stage: 'CONTACTED',
      estimatedValue: 32000000,
      assignedTo: 'سارا رادمنش',
      notes: 'درخواست مشاوره برای راه‌اندازی منوی اسپرسو و دمی.',
      createdAt: '2026-11-21T09:00:00Z',
    },
    {
      id: 'lead-4',
      leadCode: 'LD-404',
      contactName: 'شهاب کریمی',
      businessName: 'کافه مدرن رشت',
      mobile: '09112316670',
      city: 'رشت',
      source: 'WEBSITE',
      stage: 'NEW',
      estimatedValue: 26000000,
      assignedTo: 'سارا رادمنش',
      notes: 'فرم درخواست همکاری عمده از وب‌سایت.',
      createdAt: '2026-11-22T14:15:00Z',
    },
  ],

  inventory: [
    {
      id: 'inv-1',
      skuCode: 'GB-ETH-YIRG',
      itemName: 'دانه سبز اتیوپی یرگاچف گرید ۱',
      category: 'GREEN_BEAN',
      origin: 'اتیوپی - یرگاچف',
      unit: 'KG',
      currentStock: 185,
      minStockLevel: 80,
      unitCost: 980000,
      warehouseZone: 'انبار دانه سبز - ردیف A1',
      imageUrl: '/images/products/green-beans-sack.webp',
      updatedAt: '2026-11-22T10:00:00Z',
    },
    {
      id: 'inv-2',
      skuCode: 'GB-COL-SUP',
      itemName: 'دانه سبز کلمبیا سوپریمو هویلا',
      category: 'GREEN_BEAN',
      origin: 'کلمبیا - هویلا',
      unit: 'KG',
      currentStock: 62,
      minStockLevel: 80,
      unitCost: 1050000,
      warehouseZone: 'انبار دانه سبز - ردیف A2',
      imageUrl: '/images/products/green-beans-sack.webp',
      updatedAt: '2026-11-22T11:30:00Z',
    },
    {
      id: 'inv-3',
      skuCode: 'GB-BRA-SAN',
      itemName: 'دانه سبز برزیل سانتوس NY2',
      category: 'GREEN_BEAN',
      origin: 'برزیل - میناس گرایس',
      unit: 'KG',
      currentStock: 310,
      minStockLevel: 120,
      unitCost: 790000,
      warehouseZone: 'انبار دانه سبز - ردیف A3',
      imageUrl: '/images/products/green-beans-sack.webp',
      updatedAt: '2026-11-21T16:00:00Z',
    },
    {
      id: 'inv-4',
      skuCode: 'GB-IND-ROB',
      itemName: 'دانه سبز روبوستا چری AA هند',
      category: 'GREEN_BEAN',
      origin: 'هند - کارناتاکا',
      unit: 'KG',
      currentStock: 140,
      minStockLevel: 90,
      unitCost: 620000,
      warehouseZone: 'انبار دانه سبز - ردیف B1',
      imageUrl: '/images/products/green-beans-sack.webp',
      updatedAt: '2026-11-20T09:00:00Z',
    },
    {
      id: 'inv-5',
      skuCode: 'RC-CH-ESP80',
      itemName: 'بلند اسپرسو اختصاصی چیلسر ۸۰-۲۰',
      category: 'ROASTED_COFFEE',
      origin: 'ترکیب برزیل و هند',
      unit: 'KG',
      currentStock: 94,
      minStockLevel: 45,
      unitCost: 1380000,
      warehouseZone: 'انبار محصول نهایی - قفسه R1',
      imageUrl: '/images/products/espresso-blend.webp',
      updatedAt: '2026-11-23T07:20:00Z',
    },
    {
      id: 'inv-6',
      skuCode: 'RC-CH-ETH',
      itemName: 'تک‌خاستگاه اتیوپی یرگاچف (رُست مدیوم)',
      category: 'ROASTED_COFFEE',
      origin: 'اتیوپی',
      unit: 'KG',
      currentStock: 38,
      minStockLevel: 25,
      unitCost: 1690000,
      warehouseZone: 'انبار محصول نهایی - قفسه R2',
      imageUrl: '/images/products/single-origin-ethiopia.webp',
      updatedAt: '2026-11-22T14:40:00Z',
    },
    {
      id: 'inv-7',
      skuCode: 'RC-CH-COL',
      itemName: 'تک‌خاستگاه کلمبیا سوپریمو (رُست دمی)',
      category: 'ROASTED_COFFEE',
      origin: 'کلمبیا',
      unit: 'KG',
      currentStock: 18,
      minStockLevel: 25,
      unitCost: 1750000,
      warehouseZone: 'انبار محصول نهایی - قفسه R2',
      imageUrl: '/images/products/single-origin-ethiopia.webp',
      updatedAt: '2026-11-22T12:00:00Z',
    },
    {
      id: 'inv-8',
      skuCode: 'PK-BAG-1KG',
      itemName: 'پاکت کرافت سوپاپ‌دار ۱ کیلویی چیلسر',
      category: 'PACKAGING',
      unit: 'PIECE',
      currentStock: 420,
      minStockLevel: 500,
      unitCost: 28000,
      warehouseZone: 'انبار بسته‌بندی - قفسه P1',
      updatedAt: '2026-11-21T10:00:00Z',
    },
    {
      id: 'inv-9',
      skuCode: 'PK-BAG-250G',
      itemName: 'پاکت زیپ‌دار مات ۲۵۰ گرمی چیلسر',
      category: 'PACKAGING',
      unit: 'PIECE',
      currentStock: 1150,
      minStockLevel: 400,
      unitCost: 19500,
      warehouseZone: 'انبار بسته‌بندی - قفسه P2',
      updatedAt: '2026-11-21T10:00:00Z',
    },
  ],

  roastBatches: [
    {
      id: 'rb-1',
      batchNumber: 'RB-1405-081',
      greenBeanItemId: 'inv-3',
      greenBeanName: 'دانه سبز برزیل سانتوس NY2',
      targetProductId: 'inv-5',
      targetProductName: 'بلند اسپرسو اختصاصی چیلسر ۸۰-۲۰',
      roastProfile: 'MEDIUM_DARK',
      roasterMachine: 'رُستر صنعتی ۳۰ کیلویی پروبات',
      operatorName: 'امیرحسین بهرامی',
      inputGreenKg: 60,
      outputRoastedKg: 50.1,
      weightLossPct: 16.5,
      roastTempC: 211,
      roastDurationMin: 13,
      packagedUnits: 50,
      packSizeGr: 1000,
      status: 'COMPLETED',
      scheduledDate: '2026-11-22T07:00:00Z',
      completedAt: '2026-11-22T10:30:00Z',
      qualityNotes: 'ترک اول دقیقه ۹:۱۵، بادی شکلاتی متعادل، تایید کاپینگ.',
    },
    {
      id: 'rb-2',
      batchNumber: 'RB-1405-082',
      greenBeanItemId: 'inv-1',
      greenBeanName: 'دانه سبز اتیوپی یرگاچف گرید ۱',
      targetProductId: 'inv-6',
      targetProductName: 'تک‌خاستگاه اتیوپی یرگاچف (رُست مدیوم)',
      roastProfile: 'MEDIUM',
      roasterMachine: 'رُستر ۱۵ کیلویی گیسن',
      operatorName: 'امیرحسین بهرامی',
      inputGreenKg: 30,
      outputRoastedKg: 25.6,
      weightLossPct: 14.7,
      roastTempC: 204,
      roastDurationMin: 11,
      packagedUnits: 0,
      packSizeGr: 250,
      status: 'PACKAGING',
      scheduledDate: '2026-11-23T06:30:00Z',
      qualityNotes: 'نت‌های گلی و مرکباتی بسیار شفاف؛ در حال گاززدایی و بسته‌بندی.',
    },
    {
      id: 'rb-3',
      batchNumber: 'RB-1405-083',
      greenBeanItemId: 'inv-2',
      greenBeanName: 'دانه سبز کلمبیا سوپریمو هویلا',
      targetProductId: 'inv-7',
      targetProductName: 'تک‌خاستگاه کلمبیا سوپریمو (رُست دمی)',
      roastProfile: 'LIGHT',
      roasterMachine: 'رُستر ۱۵ کیلویی گیسن',
      operatorName: 'امیرحسین بهرامی',
      inputGreenKg: 25,
      outputRoastedKg: 21.5,
      weightLossPct: 14.0,
      roastTempC: 199,
      roastDurationMin: 10,
      packagedUnits: 0,
      packSizeGr: 250,
      status: 'ROASTING',
      scheduledDate: '2026-11-23T09:00:00Z',
      qualityNotes: 'بچ اختصاصی برای سفارش کافه بامداد.',
    },
    {
      id: 'rb-4',
      batchNumber: 'RB-1405-084',
      greenBeanItemId: 'inv-3',
      greenBeanName: 'دانه سبز برزیل سانتوس NY2',
      targetProductId: 'inv-5',
      targetProductName: 'بلند اسپرسو اختصاصی چیلسر ۸۰-۲۰',
      roastProfile: 'MEDIUM_DARK',
      roasterMachine: 'رُستر صنعتی ۳۰ کیلویی پروبات',
      operatorName: 'امیرحسین بهرامی',
      inputGreenKg: 90,
      outputRoastedKg: 75.2,
      weightLossPct: 16.4,
      roastTempC: 212,
      roastDurationMin: 14,
      packagedUnits: 0,
      packSizeGr: 1000,
      status: 'PLANNED',
      scheduledDate: '2026-11-24T07:00:00Z',
      qualityNotes: 'برنامه‌ریزی شده برای تامین سفارش عمده اصفهان.',
    },
  ],

  stockMovements: [
    {
      id: 'mov-1',
      movementCode: 'SM-901',
      itemId: 'inv-3',
      itemName: 'دانه سبز برزیل سانتوس NY2',
      movementType: 'OUT',
      quantity: 60,
      unit: 'KG',
      referenceCode: 'RB-1405-081',
      reason: 'مصرف تولید بچ برشته‌کاری',
      operatorName: 'امیرحسین بهرامی',
      createdAt: '2026-11-22T07:10:00Z',
    },
    {
      id: 'mov-2',
      movementCode: 'SM-902',
      itemId: 'inv-5',
      itemName: 'بلند اسپرسو اختصاصی چیلسر ۸۰-۲۰',
      movementType: 'IN',
      quantity: 50.1,
      unit: 'KG',
      referenceCode: 'RB-1405-081',
      reason: 'ورود محصول برشته‌شده از خط تولید',
      operatorName: 'امیرحسین بهرامی',
      createdAt: '2026-11-22T10:35:00Z',
    },
    {
      id: 'mov-3',
      movementCode: 'SM-903',
      itemId: 'inv-5',
      itemName: 'بلند اسپرسو اختصاصی چیلسر ۸۰-۲۰',
      movementType: 'OUT',
      quantity: 40,
      unit: 'KG',
      referenceCode: 'ORD-1405-204',
      reason: 'خروج بابت سفارش کافه رویای سپید',
      operatorName: 'مهرداد قاسمی',
      createdAt: '2026-11-22T12:15:00Z',
    },
    {
      id: 'mov-4',
      movementCode: 'SM-904',
      itemId: 'inv-1',
      itemName: 'دانه سبز اتیوپی یرگاچف گرید ۱',
      movementType: 'IN',
      quantity: 120,
      unit: 'KG',
      referenceCode: 'PO-1405-041',
      reason: 'دریافت محموله خرید از بازرگانی دانه طلایی',
      operatorName: 'مهرداد قاسمی',
      createdAt: '2026-11-20T11:00:00Z',
    },
  ],

  orders: [
    {
      id: 'ord-1',
      orderNumber: 'ORD-1405-204',
      customerId: 'cust-1',
      customerName: 'کافه رویای سپید (پویا کیانی)',
      orderDate: '2026-11-22T09:30:00Z',
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      subtotalAmount: 72100000,
      discountAmount: 2100000,
      totalAmount: 70000000,
      notes: 'تحویل صبح قبل از ساعت ۱۱ با پیک اختصاصی.',
      createdAt: '2026-11-22T09:30:00Z',
      items: [
        {
          id: 'oi-1',
          orderId: 'ord-1',
          skuCode: 'RC-CH-ESP80',
          productName: 'بلند اسپرسو اختصاصی چیلسر ۸۰-۲۰',
          grindType: 'WHOLE_BEAN',
          packWeightGr: 1000,
          quantity: 40,
          unitPrice: 1380000,
          lineTotal: 55200000,
        },
        {
          id: 'oi-2',
          orderId: 'ord-1',
          skuCode: 'RC-CH-ETH',
          productName: 'تک‌خاستگاه اتیوپی یرگاچف (رُست مدیوم)',
          grindType: 'POUR_OVER',
          packWeightGr: 1000,
          quantity: 10,
          unitPrice: 1690000,
          lineTotal: 16900000,
        },
      ],
    },
    {
      id: 'ord-2',
      orderNumber: 'ORD-1405-205',
      customerId: 'cust-2',
      customerName: 'پخش تخصصی باریستا پارس (مریم کاظمی)',
      orderDate: '2026-11-21T12:15:00Z',
      status: 'SHIPPED',
      paymentStatus: 'PARTIAL',
      subtotalAmount: 138000000,
      discountAmount: 6000000,
      totalAmount: 132000000,
      notes: 'ارسال با باربری وطن؛ پیش‌پرداخت ۶۶ میلیون واریز شد.',
      createdAt: '2026-11-21T12:15:00Z',
      items: [
        {
          id: 'oi-3',
          orderId: 'ord-2',
          skuCode: 'RC-CH-ESP80',
          productName: 'بلند اسپرسو اختصاصی چیلسر ۸۰-۲۰',
          grindType: 'WHOLE_BEAN',
          packWeightGr: 1000,
          quantity: 100,
          unitPrice: 1380000,
          lineTotal: 138000000,
        },
      ],
    },
    {
      id: 'ord-3',
      orderNumber: 'ORD-1405-206',
      customerId: 'cust-3',
      customerName: 'هتل بوتیک ارگ (حامد فرهادی)',
      orderDate: '2026-11-22T15:00:00Z',
      status: 'PREPARING',
      paymentStatus: 'PAID',
      subtotalAmount: 42300000,
      discountAmount: 0,
      totalAmount: 42300000,
      notes: 'نیاز به درج برچسب تاریخ رُست به زبان فارسی و انگلیسی.',
      createdAt: '2026-11-22T15:00:00Z',
      items: [
        {
          id: 'oi-4',
          orderId: 'ord-3',
          skuCode: 'RC-CH-ETH',
          productName: 'تک‌خاستگاه اتیوپی یرگاچف (رُست مدیوم)',
          grindType: 'WHOLE_BEAN',
          packWeightGr: 1000,
          quantity: 15,
          unitPrice: 1690000,
          lineTotal: 25350000,
        },
        {
          id: 'oi-5',
          orderId: 'ord-3',
          skuCode: 'RC-CH-ETH',
          productName: 'تک‌خاستگاه اتیوپی یرگاچف (رُست مدیوم)',
          grindType: 'ESPRESSO',
          packWeightGr: 1000,
          quantity: 10,
          unitPrice: 1695000,
          lineTotal: 16950000,
        },
      ],
    },
    {
      id: 'ord-4',
      orderNumber: 'ORD-1405-207',
      customerId: 'cust-4',
      customerName: 'کافه گالری بامداد (الهام نصیری)',
      orderDate: '2026-11-23T08:00:00Z',
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      subtotalAmount: 26250000,
      discountAmount: 750000,
      totalAmount: 25500000,
      notes: 'در انتظار تکمیل بچ کلمبیا سوپریمو RB-1405-083.',
      createdAt: '2026-11-23T08:00:00Z',
      items: [
        {
          id: 'oi-6',
          orderId: 'ord-4',
          skuCode: 'RC-CH-COL',
          productName: 'تک‌خاستگاه کلمبیا سوپریمو (رُست دمی)',
          grindType: 'WHOLE_BEAN',
          packWeightGr: 1000,
          quantity: 15,
          unitPrice: 1750000,
          lineTotal: 26250000,
        },
      ],
    },
  ],

  suppliers: [
    {
      id: 'sup-1',
      supplierCode: 'SUP-01',
      supplierName: 'بازرگانی دانه طلایی خاورمیانه',
      contactName: 'مهندس خسرو جلالی',
      mobile: '09121084432',
      category: 'GREEN_BEAN',
      originRegion: 'واردات مستقیم اتیوپی و کنیا',
      rating: 4.8,
      isActive: true,
    },
    {
      id: 'sup-2',
      supplierCode: 'SUP-02',
      supplierName: 'تأمین قهوه سبز آند',
      contactName: 'آرش مجیدی',
      mobile: '09122149088',
      category: 'GREEN_BEAN',
      originRegion: 'کلمبیا، برزیل و پرو',
      rating: 4.6,
      isActive: true,
    },
    {
      id: 'sup-3',
      supplierCode: 'SUP-03',
      supplierName: 'صنایع بسته‌بندی پاکت‌نگار',
      contactName: 'فاطمه زارعی',
      mobile: '09125337190',
      category: 'PACKAGING',
      originRegion: 'تهران - شهرک صنعتی شمس‌آباد',
      rating: 4.7,
      isActive: true,
    },
  ],

  purchaseOrders: [
    {
      id: 'po-1',
      poNumber: 'PO-1405-041',
      supplierId: 'sup-1',
      supplierName: 'بازرگانی دانه طلایی خاورمیانه',
      itemId: 'inv-1',
      itemName: 'دانه سبز اتیوپی یرگاچف گرید ۱',
      lotNumber: 'LOT-ETH-2611',
      quantity: 120,
      unit: 'KG',
      unitCost: 980000,
      totalCost: 117600000,
      status: 'RECEIVED',
      orderDate: '2026-11-16T09:00:00Z',
      receivedDate: '2026-11-20T11:00:00Z',
    },
    {
      id: 'po-2',
      poNumber: 'PO-1405-042',
      supplierId: 'sup-2',
      supplierName: 'تأمین قهوه سبز آند',
      itemId: 'inv-2',
      itemName: 'دانه سبز کلمبیا سوپریمو هویلا',
      lotNumber: 'LOT-COL-2614',
      quantity: 150,
      unit: 'KG',
      unitCost: 1050000,
      totalCost: 157500000,
      status: 'IN_TRANSIT',
      orderDate: '2026-11-21T10:30:00Z',
    },
    {
      id: 'po-3',
      poNumber: 'PO-1405-043',
      supplierId: 'sup-3',
      supplierName: 'صنایع بسته‌بندی پاکت‌نگار',
      itemId: 'inv-8',
      itemName: 'پاکت کرافت سوپاپ‌دار ۱ کیلویی چیلسر',
      lotNumber: 'LOT-PK-889',
      quantity: 1000,
      unit: 'PIECE',
      unitCost: 28000,
      totalCost: 28000000,
      status: 'ORDERED',
      orderDate: '2026-11-22T13:00:00Z',
    },
  ],

  shipments: [
    {
      id: 'shp-1',
      shipmentCode: 'SHP-501',
      orderId: 'ord-1',
      orderNumber: 'ORD-1405-204',
      customerName: 'کافه رویای سپید (پویا کیانی)',
      destinationCity: 'تهران',
      carrierName: 'CHILSER_COURIER',
      trackingCode: 'CH-TEH-8841',
      status: 'DELIVERED',
      dispatchedAt: '2026-11-22T10:30:00Z',
      deliveredAt: '2026-11-22T12:15:00Z',
      deliveryHours: 1.8,
      shippingCost: 450000,
    },
    {
      id: 'shp-2',
      shipmentCode: 'SHP-502',
      orderId: 'ord-2',
      orderNumber: 'ORD-1405-205',
      customerName: 'پخش تخصصی باریستا پارس (مریم کاظمی)',
      destinationCity: 'اصفهان',
      carrierName: 'BARBARI',
      trackingCode: 'VTN-902341',
      status: 'IN_TRANSIT',
      dispatchedAt: '2026-11-21T16:00:00Z',
      deliveryHours: 18.5,
      shippingCost: 2100000,
    },
    {
      id: 'shp-3',
      shipmentCode: 'SHP-503',
      orderId: 'ord-3',
      orderNumber: 'ORD-1405-206',
      customerName: 'هتل بوتیک ارگ (حامد فرهادی)',
      destinationCity: 'مشهد',
      carrierName: 'TIPAX',
      trackingCode: 'TPX-771920',
      status: 'READY',
      shippingCost: 1350000,
    },
  ],

  transactions: [
    {
      id: 'trx-1',
      transactionCode: 'FIN-1405-301',
      type: 'RECEIPT',
      category: 'فروش محصول',
      title: 'وصول کامل فاکتور کافه رویای سپید',
      counterparty: 'کافه رویای سپید',
      amount: 70000000,
      paymentMethod: 'BANK_TRANSFER',
      status: 'SETTLED',
      referenceCode: 'ORD-1405-204',
      transactionDate: '2026-11-22T10:00:00Z',
    },
    {
      id: 'trx-2',
      transactionCode: 'FIN-1405-302',
      type: 'RECEIPT',
      category: 'فروش عمده',
      title: 'پیش‌پرداخت سفارش پخش باریستا پارس',
      counterparty: 'پخش تخصصی باریستا پارس',
      amount: 198000000,
      paymentMethod: 'BANK_TRANSFER',
      status: 'SETTLED',
      referenceCode: 'ORD-1405-205',
      transactionDate: '2026-11-21T14:20:00Z',
    },
    {
      id: 'trx-3',
      transactionCode: 'FIN-1405-303',
      type: 'RECEIPT',
      category: 'فروش سازمانی',
      title: 'واریز فاکتور هتل بوتیک ارگ',
      counterparty: 'هتل بوتیک ارگ',
      amount: 42300000,
      paymentMethod: 'POS',
      status: 'SETTLED',
      referenceCode: 'ORD-1405-206',
      transactionDate: '2026-11-22T15:30:00Z',
    },
    {
      id: 'trx-4',
      transactionCode: 'FIN-1405-304',
      type: 'PAYMENT',
      category: 'خرید دانه سبز',
      title: 'تسویه محموله اتیوپی یرگاچف',
      counterparty: 'بازرگانی دانه طلایی خاورمیانه',
      amount: 117600000,
      paymentMethod: 'BANK_TRANSFER',
      status: 'SETTLED',
      referenceCode: 'PO-1405-041',
      transactionDate: '2026-11-20T12:00:00Z',
    },
    {
      id: 'trx-5',
      transactionCode: 'FIN-1405-305',
      type: 'EXPENSE',
      category: 'انرژی و کارگاه',
      title: 'هزینه گاز و برق صنعتی کارگاه برشته‌کاری آبان',
      counterparty: 'اداره برق و گاز صنعتی',
      amount: 18400000,
      paymentMethod: 'BANK_TRANSFER',
      status: 'SETTLED',
      transactionDate: '2026-11-19T09:00:00Z',
    },
    {
      id: 'trx-6',
      transactionCode: 'FIN-1405-306',
      type: 'EXPENSE',
      category: 'اجاره و نگهداری',
      title: 'اجاره سوله برشته‌کاری و سرویس دوره‌ای پروبات',
      counterparty: 'مجتمع صنعتی پارس',
      amount: 64000000,
      paymentMethod: 'CHEQUE',
      status: 'PENDING',
      transactionDate: '2026-11-23T08:00:00Z',
    },
    {
      id: 'trx-7',
      transactionCode: 'FIN-1405-307',
      type: 'RECEIPT',
      category: 'فروش کافه‌ای',
      title: 'وصول چک ماهانه کافه گالری بامداد',
      counterparty: 'کافه گالری بامداد',
      amount: 123600000,
      paymentMethod: 'CHEQUE',
      status: 'SETTLED',
      transactionDate: '2026-11-14T11:00:00Z',
    },
    {
      id: 'trx-8',
      transactionCode: 'FIN-1405-308',
      type: 'PAYMENT',
      category: 'خرید دانه سبز',
      title: 'پیش‌پرداخت محموله کلمبیا سوپریمو',
      counterparty: 'تأمین قهوه سبز آند',
      amount: 156000000,
      paymentMethod: 'BANK_TRANSFER',
      status: 'SETTLED',
      referenceCode: 'PO-1405-042',
      transactionDate: '2026-11-21T11:00:00Z',
    },
  ],

  surveys: [
    {
      id: 'srv-1',
      surveyCode: 'SV-101',
      customerName: 'کافه رویای سپید (پویا کیانی)',
      orderNumber: 'ORD-1405-204',
      overallScore: 5,
      roastQuality: 5,
      aromaFreshness: 5,
      deliverySpeed: 5,
      npsScore: 10,
      comment: 'یکنواختی رُست این بچ فوق‌العاده بود و کرمای اسپرسو کاملاً پایدار شد. تحویل هم دقیقاً سر وقت انجام شد.',
      followUpStatus: 'RESOLVED',
      submittedAt: '2026-11-22T18:00:00Z',
    },
    {
      id: 'srv-2',
      surveyCode: 'SV-102',
      customerName: 'پخش تخصصی باریستا پارس (مریم کاظمی)',
      orderNumber: 'ORD-1405-205',
      overallScore: 4,
      roastQuality: 5,
      aromaFreshness: 5,
      deliverySpeed: 4,
      npsScore: 9,
      comment: 'کیفیت دانه و عطر بسته‌بندی عالی است. پیشنهاد می‌کنیم کارتن‌های مادر برای ارسال باربری کمی ضخیم‌تر انتخاب شود.',
      followUpStatus: 'REVIEWED',
      submittedAt: '2026-11-21T20:15:00Z',
    },
    {
      id: 'srv-3',
      surveyCode: 'SV-103',
      customerName: 'هتل بوتیک ارگ (حامد فرهادی)',
      orderNumber: 'ORD-1405-206',
      overallScore: 5,
      roastQuality: 5,
      aromaFreshness: 4,
      deliverySpeed: 5,
      npsScore: 9,
      comment: 'مهمانان صبحانه هتل از طعم متعادل اتیوپی بسیار راضی بودند.',
      followUpStatus: 'NEW',
      submittedAt: '2026-11-22T19:40:00Z',
    },
  ],

  settings: {
    id: 'default',
    companyName: 'چیلسر',
    brandSubtitle: 'سامانه یکپارچه تولید، برشته‌کاری و فروش قهوه',
    roasteryBranch: 'کارگاه برشته‌کاری مرکزی تهران',
    phone: '021-88459210',
    address: 'تهران، شهرک صنعتی فناوری، بلوار صنعت، پلاک ۱۴، کارگاه برشته‌کاری چیلسر',
    taxRatePercent: 10,
    maxAllowedWeightLossPct: 18,
    lowStockAlertMultiplier: 1.0,
    currencyLabel: 'تومان',
  },
};

export interface SalesChartPoint {
  label: string;
  salesMillion: number;
  roastKg: number;
}

export const SALES_CHART_SERIES: Record<'7d' | '30d' | '6m', SalesChartPoint[]> = {
  '7d': [
    { label: 'شنبه', salesMillion: 42, roastKg: 65 },
    { label: 'یک‌شنبه', salesMillion: 58, roastKg: 82 },
    { label: 'دوشنبه', salesMillion: 74, roastKg: 95 },
    { label: 'سه‌شنبه', salesMillion: 63, roastKg: 78 },
    { label: 'چهارشنبه', salesMillion: 91, roastKg: 112 },
    { label: 'پنج‌شنبه', salesMillion: 118, roastKg: 135 },
    { label: 'امروز', salesMillion: 86, roastKg: 104 },
  ],
  '30d': [
    { label: 'هفته ۱', salesMillion: 185, roastKg: 290 },
    { label: 'هفته ۲', salesMillion: 240, roastKg: 345 },
    { label: 'هفته ۳', salesMillion: 215, roastKg: 318 },
    { label: 'هفته ۴', salesMillion: 312, roastKg: 420 },
  ],
  '6m': [
    { label: 'خرداد', salesMillion: 210, roastKg: 340 },
    { label: 'تیر', salesMillion: 265, roastKg: 410 },
    { label: 'مرداد', salesMillion: 298, roastKg: 455 },
    { label: 'شهریور', salesMillion: 342, roastKg: 510 },
    { label: 'مهر', salesMillion: 388, roastKg: 590 },
    { label: 'آبان', salesMillion: 434, roastKg: 665 },
  ],
};
