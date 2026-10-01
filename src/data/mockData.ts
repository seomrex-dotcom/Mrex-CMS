import { DEFAULT_PASSWORD_HASH } from '../utils/security';
import {
  WarehouseItem,
  InventoryAuditTicket,
  WarehouseInvoice,
  Department,
  Employee,
  AttendanceRecord,
  LeaveRequest,
  Task,
  OKRObjective,
  PerformanceReview,
  Announcement,
  BudgetApproval,
  PayrollRecord,
  GoogleDocDeliverable,
  FinancialVoucher,
  CompanyBrandConfig,
  ProjectContract,
  ChatMessage
} from '../types';

import avatarCeo from '../assets/images/avatar_ceo_tran_1790767301272.jpg';
import avatarPm from '../assets/images/avatar_pm_lan_1790767317591.jpg';
import avatarHr from '../assets/images/avatar_hr_minh_1790767332684.jpg';
import avatarDev from '../assets/images/avatar_dev_duc_1790767344338.jpg';

export const DEPARTMENTS: Department[] = [
  {
    id: 'exec', name: 'Ban Giám Đốc', code: 'BGD', managerId: 'emp-01', employeeCount: 2, color: '#4F46E5',
    description: 'Cơ quan lãnh đạo cao nhất của doanh nghiệp, chịu trách nhiệm định hướng chiến lược và ra quyết định toàn công ty.',
    level: 1, status: 'ACTIVE', foundedDate: '2021-03-15',
    createdAt: '2021-03-15 08:00', updatedAt: '2026-09-01 09:00', updatedBy: 'Hệ thống'
  },
  {
    id: 'production', name: 'Khối Sản Xuất & Kho Vận', code: 'PROD-WH', managerId: 'emp-07', employeeCount: 14, color: '#0284C7',
    description: 'Chịu trách nhiệm gia công, quản lý hệ thống kho bãi, kiểm định chất lượng hàng hóa và lập hóa đơn nhập/xuất vật tư thành phẩm.',
    parentId: 'exec', level: 2, status: 'ACTIVE', foundedDate: '2022-03-01',
    createdAt: '2022-03-01 08:00', updatedAt: '2026-09-01 09:00', updatedBy: 'Hệ thống'
  },
  {
    id: 'hr', name: 'Phòng Nhân Sự & Hành Chính', code: 'HRAD', managerId: 'emp-03', employeeCount: 5, color: '#10B981',
    description: 'Quản lý tuyển dụng, đào tạo, phúc lợi nhân viên và các công tác hành chính nội bộ của doanh nghiệp.',
    parentId: 'exec', level: 2, status: 'ACTIVE', foundedDate: '2021-03-15',
    createdAt: '2021-03-15 08:00', updatedAt: '2026-09-01 09:00', updatedBy: 'Hệ thống'
  },
  {
    id: 'social', name: 'Phòng Social Media', code: 'SMD', managerId: 'emp-06', employeeCount: 8, color: '#EC4899',
    description: 'Quản lý và phát triển các kênh mạng xã hội, sản xuất nội dung, xây dựng thương hiệu trên nền tảng số.',
    parentId: 'exec', level: 2, status: 'ACTIVE', foundedDate: '2022-01-10',
    createdAt: '2022-01-10 08:00', updatedAt: '2026-09-01 09:00', updatedBy: 'Hệ thống'
  },
  {
    id: 'it_seo', name: 'Phòng IT & SEO', code: 'ITSEO', managerId: 'emp-02', employeeCount: 10, color: '#0EA5E9',
    description: 'Phụ trách hạ tầng công nghệ thông tin, phát triển website, tối ưu hoá công cụ tìm kiếm (SEO) và vận hành kỹ thuật.',
    parentId: 'exec', level: 2, status: 'ACTIVE', foundedDate: '2021-06-01',
    createdAt: '2021-06-01 08:00', updatedAt: '2026-09-01 09:00', updatedBy: 'Hệ thống'
  },
  {
    id: 'internal_comms', name: 'Phòng Truyền Thông Nội Bộ', code: 'TTNB', managerId: 'emp-05', employeeCount: 5, color: '#F59E0B',
    description: 'Xây dựng văn hoá doanh nghiệp, tổ chức sự kiện nội bộ, quản lý kênh truyền thông nội bộ và gắn kết nhân viên.',
    parentId: 'exec', level: 2, status: 'ACTIVE', foundedDate: '2021-09-01',
    createdAt: '2021-09-01 08:00', updatedAt: '2026-09-01 09:00', updatedBy: 'Hệ thống'
  },
];

export const EMPLOYEES: Employee[] = [
  {
    id: 'emp-07',
    birthDate: '1990-10-22',
    name: 'Võ Văn Lực',
    code: 'NV-071',
    email: 'luc.vo@mrex.vn',
    phone: '0978 889 900',
    role: 'MANAGER',
    roleTitle: 'Quản Đốc Phân Xưởng Sản Xuất',
    departmentId: 'production',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    joinDate: '2022-03-15',
    baseSalaryGrade: 'Bậc 6 (Director)',
    baseSalaryVND: 38000000,
    status: 'ACTIVE',
    annualLeaveRemaining: 12,
    managerId: 'emp-01',
    password: DEFAULT_PASSWORD_HASH,
    accountStatus: 'ACTIVE',
  },
  {
    id: 'emp-08',
    birthDate: '1995-11-05',
    name: 'Hoàng Kim Oanh',
    code: 'NV-082',
    email: 'oanh.hoang@mrex.vn',
    phone: '0966 554 433',
    role: 'EMPLOYEE',
    roleTitle: 'Thủ Kho & Quản Lý Kho Vận',
    departmentId: 'production',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    joinDate: '2022-05-10',
    baseSalaryGrade: 'Bậc 4 (Senior)',
    baseSalaryVND: 22000000,
    status: 'ACTIVE',
    annualLeaveRemaining: 10,
    managerId: 'emp-07',
    password: DEFAULT_PASSWORD_HASH,
    accountStatus: 'ACTIVE',
  },
  {
    id: 'emp-01',
    birthDate: '1988-10-15',
    name: 'Trần Hoàng Nam',
    code: 'NV-001',
    email: 'nam.tran@mrex.vn',
    phone: '0912 345 678',
    role: 'CEO',
    roleTitle: 'Tổng Giám Đốc (CEO)',
    departmentId: 'exec',
    avatar: avatarCeo,
    joinDate: '2021-03-15',
    baseSalaryGrade: 'Bậc 8 (Executive)',
    baseSalaryVND: 65000000,
    status: 'ACTIVE',
    annualLeaveRemaining: 14,
    managerId: undefined, // Top executive
    password: DEFAULT_PASSWORD_HASH,
    accountStatus: 'ACTIVE',
  },
  {
    id: 'emp-02',
    birthDate: '1993-12-14',
    name: 'Lê Phương Lan',
    code: 'NV-012',
    email: 'lan.le@mrex.vn',
    phone: '0988 765 432',
    role: 'MANAGER',
    roleTitle: 'Trưởng Phòng IT & SEO',
    departmentId: 'it_seo',
    avatar: avatarPm,
    joinDate: '2022-06-01',
    baseSalaryGrade: 'Bậc 6 (Director)',
    baseSalaryVND: 42000000,
    status: 'ACTIVE',
    annualLeaveRemaining: 10,
    managerId: 'emp-01',
    password: DEFAULT_PASSWORD_HASH,
    accountStatus: 'ACTIVE',
  },
  {
    id: 'emp-03',
    birthDate: '1992-10-08',
    name: 'Nguyễn Văn Minh',
    code: 'NV-025',
    email: 'minh.nguyen@mrex.vn',
    phone: '0903 889 911',
    role: 'HR',
    roleTitle: 'Trưởng Phòng Nhân Sự & Vận Hành',
    departmentId: 'hr',
    avatar: avatarHr,
    joinDate: '2023-01-10',
    baseSalaryGrade: 'Bậc 5 (Manager)',
    baseSalaryVND: 35000000,
    status: 'ACTIVE',
    annualLeaveRemaining: 11,
    managerId: 'emp-01',
    password: DEFAULT_PASSWORD_HASH,
    accountStatus: 'ACTIVE',
  },
  {
    id: 'emp-04',
    birthDate: '1996-10-28',
    name: 'Đặng Minh Đức',
    code: 'NV-048',
    email: 'duc.dang@mrex.vn',
    phone: '0977 123 999',
    role: 'EMPLOYEE',
    roleTitle: 'Kỹ Sư Phần Mềm & SEO Technical Lead',
    departmentId: 'it_seo',
    avatar: avatarDev,
    joinDate: '2023-08-20',
    baseSalaryGrade: 'Bậc 4 (Senior)',
    baseSalaryVND: 28000000,
    status: 'ACTIVE',
    annualLeaveRemaining: 8,
    managerId: 'emp-02',
    password: DEFAULT_PASSWORD_HASH,
    accountStatus: 'ACTIVE',
  },
  {
    id: 'emp-05',
    birthDate: '1995-07-25',
    name: 'Phạm Thuỳ Linh',
    code: 'NV-053',
    email: 'linh.pham@mrex.vn',
    phone: '0934 567 890',
    role: 'EMPLOYEE',
    roleTitle: 'Trưởng Phòng Truyền Thông Nội Bộ',
    departmentId: 'internal_comms',
    avatar: avatarPm,
    joinDate: '2024-02-15',
    baseSalaryGrade: 'Bậc 3 (Specialist)',
    baseSalaryVND: 20000000,
    status: 'ACTIVE',
    annualLeaveRemaining: 12,
    managerId: 'emp-02',
    password: DEFAULT_PASSWORD_HASH,
    accountStatus: 'ACTIVE',
  },
  {
    id: 'emp-06',
    birthDate: '1994-04-18',
    name: 'Vũ Quốc Bảo',
    code: 'NV-062',
    email: 'bao.vu@mrex.vn',
    phone: '0965 222 333',
    role: 'EMPLOYEE',
    roleTitle: 'Trưởng Phòng Social Media',
    departmentId: 'social',
    avatar: avatarDev,
    joinDate: '2024-04-01',
    baseSalaryGrade: 'Bậc 3 (Specialist)',
    baseSalaryVND: 18000000,
    status: 'ACTIVE',
    annualLeaveRemaining: 9,
    managerId: 'emp-01',
    password: DEFAULT_PASSWORD_HASH,
    accountStatus: 'ACTIVE',
  }
];

export const INITIAL_BUDGET_APPROVALS: BudgetApproval[] = [];

export const INITIAL_PAYROLL_RECORDS: PayrollRecord[] = [];

export const TODAY_STR = '2026-10-01';

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_OKRS: OKRObjective[] = [];

export const INITIAL_REVIEWS: PerformanceReview[] = [];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [];

export const INITIAL_GOOGLE_DOCS: GoogleDocDeliverable[] = [];

export const INITIAL_VOUCHERS: FinancialVoucher[] = [];

export const DEFAULT_BRAND_CONFIG: CompanyBrandConfig = {
  companyName: 'Mrex Agency',
  tagline: 'Giải Pháp Marketing Thông Minh & Toàn Diện',
  description: 'Hệ thống quản trị doanh nghiệp toàn diện: Chấm công thông minh, Giao việc & Dự án, Đánh giá hiệu suất KPI/OKR và Báo cáo điều hành.',
  companyAddress: 'T17-31 Khu Manhattan Glory, Vinhomes Grand Park, Quận 9',
  logoType: 'custom_image',
  logoUrl: '/logo.png',
  logoSymbolId: 'double_leaf',
  primaryColorPreset: 'ocean_breeze',
  primaryColorHex: '#1e3a8a',
  sidebarTheme: 'glass_navy',
  backgroundTheme: 'glass_gradient',
  fontFamily: 'Be Vietnam Pro',
  updatedAt: '2026-10-01 17:00',
  updatedBy: 'Hệ thống'
};

export const INITIAL_CONTRACTS: ProjectContract[] = [];

export const INITIAL_WAREHOUSE_ITEMS: WarehouseItem[] = [];

export const INITIAL_INVENTORY_AUDITS: InventoryAuditTicket[] = [];

export const INITIAL_WAREHOUSE_INVOICES: WarehouseInvoice[] = [];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];
