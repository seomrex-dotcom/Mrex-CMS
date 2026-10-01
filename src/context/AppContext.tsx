import { verifyPassword, hashPassword, DEFAULT_PASSWORD_HASH } from '../utils/security';
import { StorageOptimizer } from '../services/storageOptimizer';
﻿import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ActiveNavTab,
  ChatMessage,
  AttendanceRecord,
  Department,
  Employee,
  LeaveRequest,
  OKRObjective,
  PerformanceReview,
  Announcement,
  BudgetApproval,
  PayrollRecord,
  Task,
  TaskStatus,
  WorkLocation,
  LeaveType,
  GoogleDocDeliverable,
  DocReviewStatus,
  ManagerDocNote,
  BackgroundTheme,
  FinancialVoucher,
  VoucherType,
  CompanyBrandConfig,
  ProjectContract,
  PaymentMilestone,
  WarehouseItem,
  WarehouseItemCategory,
  WarehouseItemStatus,
  InventoryAuditTicket,
  AuditItemDetail,
  QualityCheckStatus,
  AuditStatus,
  WarehouseInvoice,
  WarehouseInvoiceType,
  WarehouseInvoiceStatus,
  InvoiceItemDetail
} from '../types';
import {
  DEPARTMENTS,
  EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_OKRS,
  INITIAL_REVIEWS,
  INITIAL_TASKS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_BUDGET_APPROVALS,
  INITIAL_PAYROLL_RECORDS,
  INITIAL_GOOGLE_DOCS,
  INITIAL_VOUCHERS,
  DEFAULT_BRAND_CONFIG,
  INITIAL_CONTRACTS,
  INITIAL_WAREHOUSE_ITEMS,
  INITIAL_INVENTORY_AUDITS,
  INITIAL_WAREHOUSE_INVOICES,
  INITIAL_CHAT_MESSAGES,
  TODAY_STR,
} from '../data/mockData';

interface AppContextType {
  chatMessages: ChatMessage[];
  sendChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => { success: boolean; message: string };
  logout: () => void;

  currentUser: Employee;
  setCurrentUser: (user: Employee) => void;
  employees: Employee[];
  departments: Department[];
  addDepartment: (dept: Omit<Department, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>) => void;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  deleteDepartment: (id: string) => { success: boolean; message: string };
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;

  // Attendance
  attendanceRecords: AttendanceRecord[];
  todayAttendance: AttendanceRecord | undefined;
  checkIn: (location: WorkLocation, note?: string) => { success: boolean; message: string };
  checkOut: (note?: string) => { success: boolean; message: string };
  leaveRequests: LeaveRequest[];
  createLeaveRequest: (type: LeaveType, startDate: string, endDate: string, days: number, reason: string) => void;
  approveLeaveRequest: (id: string, note?: string) => void;
  rejectLeaveRequest: (id: string, note?: string) => void;

  // Tasks
  tasks: Task[];
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'comments'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addTaskComment: (taskId: string, content: string) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;

  // Performance & OKR
  okrs: OKRObjective[];
  reviews: PerformanceReview[];
  saveReview: (review: PerformanceReview) => void;

  // Board of Directors & Budget
  budgetApprovals: BudgetApproval[];
  approveBudget: (id: string) => void;
  rejectBudget: (id: string) => void;

  // HR & Payroll
  payrollRecords: PayrollRecord[];
  isPayrollLocked: boolean;
  togglePayrollLock: () => void;
  addEmployee: (emp: Employee) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  adjustEmployeeLeave: (employeeId: string, deltaDays: number) => void;
  resetEmployeePassword: (employeeId: string, newPassword: string) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  openProfileModal: () => void;
  closeProfileModal: () => void;

  // Announcements
  announcements: Announcement[];
  addAnnouncement: (title: string, content: string, category: Announcement['category'], isPinned: boolean) => void;

  // Google Docs Deliverables & Management Review
  googleDocs: GoogleDocDeliverable[];
  addGoogleDoc: (doc: Omit<GoogleDocDeliverable, 'id' | 'createdAt' | 'updatedAt' | 'notes'>) => void;
  updateGoogleDocStatus: (id: string, status: DocReviewStatus) => void;
  addDocManagerNote: (docId: string, content: string, sectionHint?: string, type?: ManagerDocNote['type']) => void;
  deleteGoogleDoc: (id: string) => void;

  // Financial Vouchers (Phiếu Thu / Chi & Sổ Quỹ Dòng Tiền)
  vouchers: FinancialVoucher[];
  addVoucher: (voucher: Omit<FinancialVoucher, 'id' | 'createdAt'>) => void;
  updateVoucher: (id: string, updates: Partial<FinancialVoucher>) => void;
  deleteVoucher: (id: string) => void;

  // Project Contracts & Revenue Reminders (Hợp Đồng Dự Án, Doanh Thu, Lịch Nhắc Thanh Toán)
  contracts: ProjectContract[];
  addContract: (contract: Omit<ProjectContract, 'id' | 'createdAt'>) => void;
  updateContract: (id: string, updates: Partial<ProjectContract>) => void;
  deleteContract: (id: string) => void;
  toggleMilestoneStatus: (contractId: string, milestoneId: string, status: 'PAID' | 'PENDING' | 'OVERDUE') => void;
  toggleMilestoneReminder: (contractId: string, milestoneId: string) => void;

  // Company Brand & Theme Customization (Ban Quản Trị)
  brandConfig: CompanyBrandConfig;
  updateBrandConfig: (updates: Partial<CompanyBrandConfig>) => void;
  resetBrandConfig: () => void;

  // Production & Warehouse Management (Khối Sản Xuất & Quản Lý Kho Vận)
  warehouseItems: WarehouseItem[];
  addWarehouseItem: (item: Omit<WarehouseItem, 'id'>) => void;
  updateWarehouseItem: (id: string, updates: Partial<WarehouseItem>) => void;
  deleteWarehouseItem: (id: string) => void;
  adjustWarehouseStock: (id: string, deltaQuantity: number, reason?: string) => void;

  inventoryAudits: InventoryAuditTicket[];
  createInventoryAudit: (audit: Omit<InventoryAuditTicket, 'id' | 'createdAt'>) => void;
  approveInventoryAudit: (id: string, approvedBy: string, approvalNotes?: string) => void;
  deleteInventoryAudit: (id: string) => void;

  warehouseInvoices: WarehouseInvoice[];
  createWarehouseInvoice: (invoice: Omit<WarehouseInvoice, 'id'>) => void;
  updateWarehouseInvoiceStatus: (id: string, status: WarehouseInvoiceStatus, paymentStatus?: 'PAID' | 'PARTIAL' | 'UNPAID') => void;
  deleteWarehouseInvoice: (id: string) => void;

  // Utilities
  bgTheme: BackgroundTheme;
  setBgTheme: (theme: BackgroundTheme) => void;
  resetToDefaultData: () => void;
  celebrate: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'mrex_v7_current_user_id',
  ATTENDANCE: 'mrex_v7_attendance',
  LEAVE_REQUESTS: 'mrex_v7_leave_requests',
  TASKS: 'mrex_v7_tasks',
  REVIEWS: 'mrex_v7_reviews',
  OKRS: 'mrex_v7_okrs',
  ANNOUNCEMENTS: 'mrex_v7_announcements',
  EMPLOYEES: 'mrex_v7_employees',
  DEPARTMENTS: 'mrex_v7_departments',
  GOOGLE_DOCS: 'mrex_v7_google_docs',
  VOUCHERS: 'mrex_v7_vouchers',
  CONTRACTS: 'mrex_v7_contracts',
  BG_THEME: 'mrex_v7_bg_theme',
  BRAND_CONFIG: 'mrex_v7_brand_config',
  WAREHOUSE_ITEMS: 'mrex_v7_warehouse_items',
  INVENTORY_AUDITS: 'mrex_v7_inventory_audits',
  WAREHOUSE_INVOICES: 'mrex_v7_warehouse_invoices',
  CHAT_MESSAGES: 'mrex_v7_chat_messages',
  BUDGETS: 'mrex_v7_budgets',
  PAYROLL: 'mrex_v7_payroll',
  PAYROLL_LOCKED: 'mrex_v7_payroll_locked',
};

// Automatic purge of all old demo storage keys to guarantee 100% empty business dataset
try {
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && (k.startsWith('mrex_') || k.startsWith('omnicorp_')) && !k.startsWith('mrex_v7_')) {
      toRemove.push(k);
    }
  }
  toRemove.forEach(k => localStorage.removeItem(k));
} catch (e) {
  // Ignore
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (saved) {
      try {
        const parsed: Employee[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map(e => e.id));
        const missing = EMPLOYEES.filter(e => !existingIds.has(e.id));
        return [...parsed, ...missing].map(e => ({
          ...e,
          password: e.password && e.password.startsWith('mrex_hash_') ? e.password : (e.password ? hashPassword(e.password) : DEFAULT_PASSWORD_HASH),
          accountStatus: e.accountStatus || 'ACTIVE'
        }));
      } catch (err) {
        console.error('Error parsing saved employees', err);
      }
    }
    return EMPLOYEES;
  });
  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    if (saved) {
      try {
        const parsed: Department[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map(d => d.id));
        const missing = DEPARTMENTS.filter(d => !existingIds.has(d.id));
        return [...parsed, ...missing];
      } catch (err) {
        console.error('Error parsing saved departments', err);
      }
    }
    return DEPARTMENTS;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const authState = localStorage.getItem('mrex_auth');
    return authState !== null ? authState === 'true' : true;
  });

  // Active current user - defaults to CEO or saved ID
  const [currentUser, setCurrentUserState] = useState<Employee>(() => {
    const savedId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    const found = EMPLOYEES.find(e => e.id === savedId);
    return found || EMPLOYEES[0];
  });

  // Cài đặt giao diện & thương hiệu của Ban Giám Đốc (áp dụng đồng bộ cho toàn bộ các cấp)
  const [brandConfig, setBrandConfig] = useState<CompanyBrandConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BRAND_CONFIG);
    if (saved) {
      try {
        return { ...DEFAULT_BRAND_CONFIG, ...JSON.parse(saved) };
      } catch {
        // fallback to default
      }
    }
    return DEFAULT_BRAND_CONFIG;
  });

  // Nền không gian làm việc luôn luôn đồng bộ theo cấu hình của Ban Giám Đốc cho toàn bộ nhân sự
  const [bgTheme, setBgThemeState] = useState<BackgroundTheme>(() => {
    const savedBrand = localStorage.getItem(STORAGE_KEYS.BRAND_CONFIG);
    if (savedBrand) {
      try {
        const parsed = JSON.parse(savedBrand);
        if (parsed.backgroundTheme) return parsed.backgroundTheme;
      } catch {}
    }
    return DEFAULT_BRAND_CONFIG.backgroundTheme || 'glass_gradient';
  });

  // Khi Ban Giám Đốc thay đổi kiểu nền, cập nhật và lưu vào cấu hình thương hiệu chung toàn công ty
  const setBgTheme = (theme: BackgroundTheme) => {
    setBgThemeState(theme);
    localStorage.setItem(STORAGE_KEYS.BG_THEME, theme);

    // Cập nhật cấu hình thương hiệu toàn công ty để áp dụng cho tất cả tài khoản
    setBrandConfig(prev => {
      const next: CompanyBrandConfig = {
        ...prev,
        backgroundTheme: theme,
        updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        updatedBy: `${currentUser.name} (${currentUser.roleTitle})`
      };
      localStorage.setItem(STORAGE_KEYS.BRAND_CONFIG, JSON.stringify(next));
      return next;
    });
  };

  // Cập nhật cấu hình thương hiệu toàn doanh nghiệp từ Ban Giám Đốc
  const updateBrandConfig = (updates: Partial<CompanyBrandConfig>) => {
    setBrandConfig(prev => {
      const next: CompanyBrandConfig = {
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        updatedBy: `${currentUser.name} (${currentUser.roleTitle})`
      };
      localStorage.setItem(STORAGE_KEYS.BRAND_CONFIG, JSON.stringify(next));
      if (next.backgroundTheme) {
        setBgThemeState(next.backgroundTheme);
        localStorage.setItem(STORAGE_KEYS.BG_THEME, next.backgroundTheme);
      }
      return next;
    });
  };

  const resetBrandConfig = () => {
    setBrandConfig(DEFAULT_BRAND_CONFIG);
    setWarehouseItems(INITIAL_WAREHOUSE_ITEMS);
    setInventoryAudits(INITIAL_INVENTORY_AUDITS);
    setWarehouseInvoices(INITIAL_WAREHOUSE_INVOICES);
    localStorage.setItem(STORAGE_KEYS.BRAND_CONFIG, JSON.stringify(DEFAULT_BRAND_CONFIG));
    setBgTheme(DEFAULT_BRAND_CONFIG.backgroundTheme);
    celebrate();
  };

  // Áp dụng cài đặt giao diện của Ban Giám Đốc cho toàn bộ hệ thống
  useEffect(() => {
    // 1. Màu chủ đạo doanh nghiệp
    document.documentElement.style.setProperty('--brand-primary', brandConfig.primaryColorHex);

    // 2. Phông chữ chuẩn toàn hệ thống
    const fontStack = `"${brandConfig.fontFamily}", system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    document.documentElement.style.setProperty('--brand-font', fontStack);
    document.documentElement.style.fontFamily = fontStack;
    document.body.style.fontFamily = fontStack;

    // 3. Tên thương hiệu trên thanh tiêu đề
    if (brandConfig.companyName) {
      document.title = `${brandConfig.companyName} - Quản Trị Doanh Nghiệp`;
    }

    // 4. Đồng bộ nền không gian làm việc (backgroundTheme) cho tất cả các cấp
    if (brandConfig.backgroundTheme && brandConfig.backgroundTheme !== bgTheme) {
      setBgThemeState(brandConfig.backgroundTheme);
      localStorage.setItem(STORAGE_KEYS.BG_THEME, brandConfig.backgroundTheme);
    }
  }, [brandConfig]);

  const setCurrentUser = (user: Employee) => {
    setCurrentUserState(user);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
  };

  const login = (email: string, password?: string) => {
    const normalized = email.trim().toLowerCase();
    const found = employees.find(e => e.email.toLowerCase() === normalized);
    if (!found) {
      return { success: false, message: 'Tài khoản email không tồn tại trong hệ thống. Vui lòng kiểm tra lại.' };
    }

    if (found.accountStatus === 'LOCKED') {
      return { success: false, message: 'Tài khoản này hiện đang bị tạm khóa. Vui lòng liên hệ Quản trị viên.' };
    }

    // Password verification
    const inputPass = (password !== undefined ? password : '').trim();
    if (!inputPass) {
      return { success: false, message: 'Vui lòng nhập mật khẩu đăng nhập.' };
    }

    const isPasswordValid = verifyPassword(inputPass, found.password);
    if (!isPasswordValid) {
      return { success: false, message: 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.' };
    }

    setCurrentUser(found);
    setIsAuthenticated(true);
    localStorage.setItem('mrex_auth', 'true');
    celebrate();
    return { success: true, message: `Chào mừng ${found.name} (${found.roleTitle}) đăng nhập thành công!` };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('mrex_auth', 'false');
  };

  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  // Attendance Records
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  // Leave & OT Requests
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS);
    return saved ? JSON.parse(saved) : INITIAL_LEAVE_REQUESTS;
  });

  // Tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  // Performance Reviews
  const [reviews, setReviews] = useState<PerformanceReview[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  // OKRs
  const [okrs] = useState<OKRObjective[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OKRS);
    return saved ? JSON.parse(saved) : INITIAL_OKRS;
  });

  // Announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  // Board Budget Approvals
  const [budgetApprovals, setBudgetApprovals] = useState<BudgetApproval[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return saved ? JSON.parse(saved) : INITIAL_BUDGET_APPROVALS;
  });

  // HR Payroll Records
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYROLL);
    return saved ? JSON.parse(saved) : INITIAL_PAYROLL_RECORDS;
  });

  const [isPayrollLocked, setIsPayrollLocked] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.PAYROLL_LOCKED) === 'true';
  });

  // Google Docs Deliverables & Management Review
  const [googleDocs, setGoogleDocs] = useState<GoogleDocDeliverable[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOOGLE_DOCS);
    return saved ? JSON.parse(saved) : INITIAL_GOOGLE_DOCS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOOGLE_DOCS, JSON.stringify(googleDocs));
  }, [googleDocs]);

  useEffect(() => {
    localStorage.setItem('mrex_budgets_v1', JSON.stringify(budgetApprovals));
  }, [budgetApprovals]);

  useEffect(() => {
    localStorage.setItem('mrex_payroll_v1', JSON.stringify(payrollRecords));
  }, [payrollRecords]);

  useEffect(() => {
    localStorage.setItem('mrex_payroll_locked_v1', String(isPayrollLocked));
  }, [isPayrollLocked]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
  }, [announcements]);

  // Current user's today attendance
  const todayAttendance = attendanceRecords.find(
    r => r.employeeId === currentUser.id && r.date === TODAY_STR
  );

  const celebrate = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#4F46E5', '#10B981', '#F59E0B', '#0EA5E9'],
      });
    } catch {
      // ignore
    }
  };

  // Check In handler
  const checkIn = (location: WorkLocation, note?: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0]; // e.g. "08:15:30"
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Standard working time begins at 08:00 AM (Ca làm việc: 8:00 AM - 17:30 PM)
    const isLate = hours > 8 || (hours === 8 && minutes > 0);

    const existingIndex = attendanceRecords.findIndex(
      r => r.employeeId === currentUser.id && r.date === TODAY_STR
    );

    if (existingIndex >= 0 && attendanceRecords[existingIndex].checkIn) {
      return { success: false, message: 'Bạn đã thực hiện chấm công vào hôm nay rồi!' };
    }

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: currentUser.id,
      date: TODAY_STR,
      checkIn: timeStr,
      checkOut: undefined,
      workHours: 8.0,
      overtimeHours: 0,
      status: isLate ? 'LATE' : 'ON_TIME',
      location: location,
      locationDetails:
        location === 'OFFICE'
          ? 'Trụ sở Tầng 18, Keangnam Landmark 72 (GPS Verified)'
          : location === 'REMOTE'
          ? 'Làm việc từ xa (WFH - Đã đăng ký)'
          : 'Công tác ngoại nghiệp / Gặp khách hàng',
      ipAddress: '118.70.180.25 (OmniCorp_HQ_Secure)',
      note: note || undefined,
    };

    if (existingIndex >= 0) {
      const updated = [...attendanceRecords];
      updated[existingIndex] = { ...updated[existingIndex], ...newRecord };
      setAttendanceRecords(updated);
    } else {
      setAttendanceRecords([newRecord, ...attendanceRecords]);
    }

    celebrate();
    return {
      success: true,
      message: `Chấm công vào thành công lúc ${timeStr}! Trạng thái: ${isLate ? 'Đi trễ (sau 08:00 AM)' : 'Đúng giờ'}`,
    };
  };

  // Check Out handler
  const checkOut = (note?: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const existingIndex = attendanceRecords.findIndex(
      r => r.employeeId === currentUser.id && r.date === TODAY_STR
    );

    if (existingIndex < 0 || !attendanceRecords[existingIndex].checkIn) {
      return { success: false, message: 'Bạn chưa chấm công vào hôm nay để có thể chấm công ra!' };
    }

    const record = attendanceRecords[existingIndex];
    if (record.checkOut) {
      return { success: false, message: 'Bạn đã thực hiện chấm công ra trước đó rồi!' };
    }

    // Calculate actual work hours
    const checkInTime = record.checkIn || '08:00:00';
    const [inH, inM] = checkInTime.split(':').map(Number);
    const outH = now.getHours();
    const outM = now.getMinutes();
    const diffHours = Math.max(1, Number(((outH * 60 + outM - (inH * 60 + inM)) / 60).toFixed(1)));
    const ot = diffHours > 8.5 ? Number((diffHours - 8.0).toFixed(1)) : 0;

    const updated = [...attendanceRecords];
    updated[existingIndex] = {
      ...record,
      checkOut: timeStr,
      workHours: diffHours,
      overtimeHours: ot,
      note: note ? (record.note ? `${record.note} | ${note}` : note) : record.note,
    };

    setAttendanceRecords(updated);
    celebrate();
    return {
      success: true,
      message: `Chấm công ra thành công lúc ${timeStr}! Tổng thời gian làm việc: ${diffHours} giờ (${ot > 0 ? `OT: ${ot}h` : 'Không có OT'}).`,
    };
  };

  // Create leave request
  const createLeaveRequest = (type: LeaveType, startDate: string, endDate: string, days: number, reason: string) => {
    const newReq: LeaveRequest = {
      id: `req-${Date.now()}`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      type,
      startDate,
      endDate,
      totalDays: days,
      reason,
      status: 'PENDING',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setLeaveRequests([newReq, ...leaveRequests]);
  };

  const approveLeaveRequest = (id: string, note?: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setLeaveRequests(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              status: 'APPROVED',
              approverId: currentUser.id,
              approverName: currentUser.name,
              approvalDate: now,
              approvalNote: note || 'Đồng ý phê duyệt đề xuất.',
            }
          : r
      )
    );
  };

  const rejectLeaveRequest = (id: string, note?: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setLeaveRequests(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              status: 'REJECTED',
              approverId: currentUser.id,
              approverName: currentUser.name,
              approvalDate: now,
              approvalNote: note || 'Từ chối phê duyệt do không phù hợp lịch công tác.',
            }
          : r
      )
    );
  };

  // Tasks actions
  const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'comments'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      comments: [],
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setTasks([newTask, ...tasks]);
    celebrate();
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const isDone = status === 'COMPLETED';
          if (isDone && t.status !== 'COMPLETED') {
            celebrate();
          }
          return {
            ...t,
            status,
            progress: isDone ? 100 : t.progress === 100 ? 75 : t.progress,
          };
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (selectedTaskId === id) setSelectedTaskId(null);
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id !== taskId) return task;
        const newSubtasks = task.subtasks.map(s =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        const completedCount = newSubtasks.filter(s => s.completed).length;
        const progress = newSubtasks.length > 0
          ? Math.round((completedCount / newSubtasks.length) * 100)
          : task.progress;
        return {
          ...task,
          subtasks: newSubtasks,
          progress,
          status: progress === 100 ? 'COMPLETED' : task.status,
        };
      })
    );
  };

  const addTaskComment = (taskId: string, content: string) => {
    const comment = {
      id: `cm-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, comments: [...task.comments, comment] } : task
      )
    );
  };

  // Performance reviews
  const saveReview = (review: PerformanceReview) => {
    setReviews(prev => {
      const idx = prev.findIndex(r => r.id === review.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = review;
        return copy;
      }
      return [review, ...prev];
    });
    celebrate();
  };

  // Announcements
  const addAnnouncement = (
    title: string,
    content: string,
    category: Announcement['category'],
    isPinned: boolean
  ) => {
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title,
      content,
      category,
      authorName: currentUser.name,
      authorRole: currentUser.roleTitle,
      isPinned,
      publishedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setAnnouncements([newAnn, ...announcements]);
    celebrate();
  };

  // Board actions
  const approveBudget = (id: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setBudgetApprovals(prev =>
      prev.map(b => (b.id === id ? { ...b, status: 'APPROVED', approvedAt: now } : b))
    );
    celebrate();
  };

  const rejectBudget = (id: string) => {
    setBudgetApprovals(prev =>
      prev.map(b => (b.id === id ? { ...b, status: 'REJECTED' } : b))
    );
  };

  // HR actions
  const togglePayrollLock = () => {
    setIsPayrollLocked(prev => {
      const next = !prev;
      setPayrollRecords(records => records.map(r => ({ ...r, isLocked: next })));
      return next;
    });
    celebrate();
  };

  const addEmployee = (emp: Employee) => {
    const newEmp: Employee = {
      ...emp,
      password: hashPassword(emp.password?.trim() || '123456'),
      accountStatus: emp.accountStatus || 'ACTIVE'
    };
    setEmployees(prev => {
      const next = [...prev, newEmp];
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(next));
      return next;
    });
    celebrate();
  };

  const resetEmployeePassword = (employeeId: string, newPassword: string) => {
    updateEmployee(employeeId, { password: hashPassword(newPassword.trim() || '123456') });
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    const safeUpdates = { ...updates };
    if (safeUpdates.password && !safeUpdates.password.startsWith('mrex_hash_')) {
      safeUpdates.password = hashPassword(safeUpdates.password);
    }
    setEmployees(prev => {
      const next = prev.map(e => (e.id === id ? { ...e, ...safeUpdates } : e));
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(next));
      return next;
    });

    // If current active user was edited, update currentUser state too
    if (currentUser.id === id) {
      setCurrentUserState(prev => {
        const updated = { ...prev, ...safeUpdates };
        return updated;
      });
    }
    celebrate();
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => {
      const next = prev.filter(e => e.id !== id);
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(next));
      return next;
    });
  };

  const adjustEmployeeLeave = (employeeId: string, deltaDays: number) => {
    setEmployees(prev => {
      const next = prev.map(e =>
        e.id === employeeId
          ? { ...e, annualLeaveRemaining: Math.max(0, e.annualLeaveRemaining + deltaDays) }
          : e
      );
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(next));
      return next;
    });
  };

  // Google Docs actions
  const addGoogleDoc = (docData: Omit<GoogleDocDeliverable, 'id' | 'createdAt' | 'updatedAt' | 'notes'>) => {
    const newDoc: GoogleDocDeliverable = {
      ...docData,
      id: `doc-${Date.now()}`,
      notes: [],
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setGoogleDocs(prev => [newDoc, ...prev]);
    celebrate();
  };

  const updateGoogleDocStatus = (id: string, status: DocReviewStatus) => {
    setGoogleDocs(prev =>
      prev.map(doc => {
        if (doc.id !== id) return doc;
        return {
          ...doc,
          status,
          updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        };
      })
    );
    if (status === 'APPROVED') {
      celebrate();
    }
  };

  const addDocManagerNote = (
    docId: string,
    content: string,
    sectionHint?: string,
    type: ManagerDocNote['type'] = 'GENERAL'
  ) => {
    const newNote: ManagerDocNote = {
      id: `note-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.roleTitle,
      authorAvatar: currentUser.avatar,
      content: content.trim(),
      sectionHint: sectionHint?.trim(),
      type,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setGoogleDocs(prev =>
      prev.map(doc => {
        if (doc.id !== docId) return doc;
        return {
          ...doc,
          notes: [...doc.notes, newNote],
          updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        };
      })
    );
  };

  const deleteGoogleDoc = (id: string) => {
    setGoogleDocs(prev => prev.filter(d => d.id !== id));
  };

  // Financial Vouchers (Phiếu Thu / Chi) state
  const [vouchers, setVouchers] = useState<FinancialVoucher[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VOUCHERS);
    return saved ? JSON.parse(saved) : INITIAL_VOUCHERS;
  });

  const addVoucher = (voucherData: Omit<FinancialVoucher, 'id' | 'createdAt'>) => {
    const newVoucher: FinancialVoucher = {
      ...voucherData,
      id: `v-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    const updated = [newVoucher, ...vouchers];
    setVouchers(updated);
    localStorage.setItem(STORAGE_KEYS.VOUCHERS, JSON.stringify(updated));
    celebrate();
  };

  const updateVoucher = (id: string, updates: Partial<FinancialVoucher>) => {
    const updated = vouchers.map(v => v.id === id ? { ...v, ...updates } : v);
    setVouchers(updated);
    localStorage.setItem(STORAGE_KEYS.VOUCHERS, JSON.stringify(updated));
  };

  const deleteVoucher = (id: string) => {
    const updated = vouchers.filter(v => v.id !== id);
    setVouchers(updated);
    localStorage.setItem(STORAGE_KEYS.VOUCHERS, JSON.stringify(updated));
  };

  // Project Contracts & Revenue Reminders state
  const [contracts, setContracts] = useState<ProjectContract[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONTRACTS);
    return saved ? JSON.parse(saved) : INITIAL_CONTRACTS;
  });

  const addContract = (contractData: Omit<ProjectContract, 'id' | 'createdAt'>) => {
    const newContract: ProjectContract = {
      ...contractData,
      id: `contract-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    const updated = [newContract, ...contracts];
    setContracts(updated);
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(updated));
    celebrate();
  };

  const updateContract = (id: string, updates: Partial<ProjectContract>) => {
    const updated = contracts.map(c => c.id === id ? { ...c, ...updates } : c);
    setContracts(updated);
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(updated));
  };

  const deleteContract = (id: string) => {
    const updated = contracts.filter(c => c.id !== id);
    setContracts(updated);
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(updated));
  };

  const toggleMilestoneStatus = (
    contractId: string,
    milestoneId: string,
    newStatus: 'PAID' | 'PENDING' | 'OVERDUE'
  ) => {
    const updated = contracts.map(c => {
      if (c.id !== contractId) return c;
      const updatedMilestones = c.milestones.map(m => {
        if (m.id !== milestoneId) return m;
        return {
          ...m,
          status: newStatus,
          paidDate: newStatus === 'PAID' ? new Date().toISOString().slice(0, 10) : undefined
        };
      });
      // Recalculate collectedVND
      const newCollected = updatedMilestones
        .filter(m => m.status === 'PAID')
        .reduce((sum, m) => sum + m.amountVND, 0);

      return {
        ...c,
        milestones: updatedMilestones,
        collectedVND: newCollected,
        status: newCollected >= c.totalValueVND ? ('COMPLETED' as const) : c.status
      };
    });

    setContracts(updated);
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(updated));
    if (newStatus === 'PAID') {
      celebrate();
    }
  };

  const toggleMilestoneReminder = (contractId: string, milestoneId: string) => {
    const updated = contracts.map(c => {
      if (c.id !== contractId) return c;
      return {
        ...c,
        milestones: c.milestones.map(m => {
          if (m.id !== milestoneId) return m;
          return { ...m, reminderSent: !m.reminderSent };
        })
      };
    });
    setContracts(updated);
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(updated));
  };


  // Department CRUD actions
  const addDepartment = (deptData: Omit<Department, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>) => {
    const newDept: Department = {
      ...deptData,
      id: `dept-${Date.now()}`,
      status: deptData.status || 'ACTIVE',
      level: deptData.level || 2,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updatedBy: `\ (\)`,
    };
    setDepartments(prev => {
      const next = [...prev, newDept];
      localStorage.setItem('mrex_departments_v3', JSON.stringify(next));
      return next;
    });
    celebrate();
  };

  const updateDepartment = (id: string, updates: Partial<Department>) => {
    setDepartments(prev => {
      const next = prev.map(d =>
        d.id === id
          ? {
              ...d,
              ...updates,
              updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
              updatedBy: `\ (\)`,
            }
          : d
      );
      localStorage.setItem('mrex_departments_v3', JSON.stringify(next));
      return next;
    });
    celebrate();
  };

  const deleteDepartment = (id: string): { success: boolean; message: string } => {
    const hasEmployees = employees.some(e => e.departmentId === id);
    if (hasEmployees) {
      return { success: false, message: 'Không thể xoá phòng ban đang có nhân viên. Hãy chuyển nhân viên trước.' };
    }
    const hasChildren = departments.some(d => d.parentId === id);
    if (hasChildren) {
      return { success: false, message: 'Không thể xoá phòng ban có đơn vị con trực thuộc.' };
    }
    setDepartments(prev => {
      const next = prev.filter(d => d.id !== id);
      localStorage.setItem('mrex_departments_v3', JSON.stringify(next));
      return next;
    });
    return { success: true, message: 'Đã xoá phòng ban thành công.' };
  };

  // Reset demo data
  // ==========================================
  // Production & Warehouse Management State & Handlers
  // ==========================================
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WAREHOUSE_ITEMS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved warehouse items', e);
      }
    }
    return INITIAL_WAREHOUSE_ITEMS;
  });

  const [inventoryAudits, setInventoryAudits] = useState<InventoryAuditTicket[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY_AUDITS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved inventory audits', e);
      }
    }
    return INITIAL_INVENTORY_AUDITS;
  });

  
  // Company-wide Group Chat State with auto-pruning to avoid VPS crash
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
      if (saved) {
        const parsed = JSON.parse(saved);
        return StorageOptimizer.pruneChatMessages(parsed, 80);
      }
    } catch (e) {
      console.warn("Error reading chat messages", e);
    }
    return (typeof INITIAL_CHAT_MESSAGES !== "undefined") ? INITIAL_CHAT_MESSAGES : [];
  });

  const sendChatMessage = (msg: Omit<ChatMessage, "id" | "timestamp">) => {
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const newMsg: ChatMessage = {
      ...msg,
      id: "msg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      timestamp: now,
    };
    setChatMessages(prev => {
      const updated = StorageOptimizer.pruneChatMessages([...prev, newMsg], 80);
      try {
        localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(updated));
      } catch (err) {
        console.warn("Storage limit reached, auto-pruning older messages", err);
        const emergencyPruned = StorageOptimizer.pruneChatMessages(updated, 40);
        localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(emergencyPruned));
        return emergencyPruned;
      }
      return updated;
    });
  };

  const [warehouseInvoices, setWarehouseInvoices] = useState<WarehouseInvoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WAREHOUSE_INVOICES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved warehouse invoices', e);
      }
    }
    return INITIAL_WAREHOUSE_INVOICES;
  });

  const addWarehouseItem = (itemData: Omit<WarehouseItem, 'id'>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newItem: WarehouseItem = {
      ...itemData,
      id: `item-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      lastCheckedDate: itemData.lastCheckedDate || now.slice(0, 10)
    };
    const updated = [newItem, ...warehouseItems];
    setWarehouseItems(updated);
    localStorage.setItem(STORAGE_KEYS.WAREHOUSE_ITEMS, JSON.stringify(updated));
    celebrate();
  };

  const updateWarehouseItem = (id: string, updates: Partial<WarehouseItem>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const updated = warehouseItems.map(item => {
      if (item.id !== id) return item;
      const merged: WarehouseItem = { ...item, ...updates, updatedAt: now };
      if (merged.quantity <= 0) {
        merged.status = 'OUT_OF_STOCK';
      } else if (merged.quantity <= merged.minStock) {
        merged.status = 'LOW_STOCK';
      } else {
        merged.status = 'IN_STOCK';
      }
      return merged;
    });
    setWarehouseItems(updated);
    localStorage.setItem(STORAGE_KEYS.WAREHOUSE_ITEMS, JSON.stringify(updated));
  };

  const deleteWarehouseItem = (id: string) => {
    const updated = warehouseItems.filter(i => i.id !== id);
    setWarehouseItems(updated);
    localStorage.setItem(STORAGE_KEYS.WAREHOUSE_ITEMS, JSON.stringify(updated));
  };

  const adjustWarehouseStock = (id: string, deltaQuantity: number, reason?: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const today = now.slice(0, 10);
    const updated = warehouseItems.map(item => {
      if (item.id !== id) return item;
      const newQty = Math.max(0, item.quantity + deltaQuantity);
      let newStatus: WarehouseItemStatus = 'IN_STOCK';
      if (newQty <= 0) newStatus = 'OUT_OF_STOCK';
      else if (newQty <= item.minStock) newStatus = 'LOW_STOCK';

      return {
        ...item,
        quantity: newQty,
        status: newStatus,
        lastCheckedDate: today,
        updatedAt: now
      };
    });
    setWarehouseItems(updated);
    localStorage.setItem(STORAGE_KEYS.WAREHOUSE_ITEMS, JSON.stringify(updated));
  };

  const createInventoryAudit = (auditData: Omit<InventoryAuditTicket, 'id' | 'createdAt'>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newAudit: InventoryAuditTicket = {
      ...auditData,
      id: `audit-${Date.now()}`,
      createdAt: now
    };
    const updated = [newAudit, ...inventoryAudits];
    setInventoryAudits(updated);
    localStorage.setItem(STORAGE_KEYS.INVENTORY_AUDITS, JSON.stringify(updated));
    celebrate();
  };

  const approveInventoryAudit = (id: string, approvedBy: string, approvalNotes?: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const today = now.slice(0, 10);
    let targetAudit: InventoryAuditTicket | undefined;

    const updatedAudits: InventoryAuditTicket[] = inventoryAudits.map(audit => {
      if (audit.id !== id) return audit;
      const approved: InventoryAuditTicket = {
        ...audit,
        status: 'APPROVED' as AuditStatus,
        approvedBy,
        approvalDate: today,
        summaryNote: approvalNotes
          ? `${audit.summaryNote ? audit.summaryNote + ' | ' : ''}${approvalNotes}`
          : audit.summaryNote
      };
      targetAudit = approved;
      return approved;
    });

    setInventoryAudits(updatedAudits);
    localStorage.setItem(STORAGE_KEYS.INVENTORY_AUDITS, JSON.stringify(updatedAudits));

    // Synchronize actual stock counts into warehouseItems
    if (targetAudit && targetAudit.items) {
      const stockMap = new Map<string, number>();
      targetAudit.items.forEach(it => {
        stockMap.set(it.itemId, it.actualQty);
      });

      const updatedItems = warehouseItems.map(item => {
        if (stockMap.has(item.id)) {
          const actualQty = stockMap.get(item.id)!;
          let newStatus: WarehouseItemStatus = 'IN_STOCK';
          if (actualQty <= 0) newStatus = 'OUT_OF_STOCK';
          else if (actualQty <= item.minStock) newStatus = 'LOW_STOCK';
          return {
            ...item,
            quantity: actualQty,
            status: newStatus,
            lastCheckedDate: today,
            updatedAt: now
          };
        }
        return item;
      });

      setWarehouseItems(updatedItems);
      localStorage.setItem(STORAGE_KEYS.WAREHOUSE_ITEMS, JSON.stringify(updatedItems));
    }
    celebrate();
  };

  const deleteInventoryAudit = (id: string) => {
    const updated = inventoryAudits.filter(a => a.id !== id);
    setInventoryAudits(updated);
    localStorage.setItem(STORAGE_KEYS.INVENTORY_AUDITS, JSON.stringify(updated));
  };

  const createWarehouseInvoice = (invoiceData: Omit<WarehouseInvoice, 'id'>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const today = now.slice(0, 10);
    const newInvoice: WarehouseInvoice = {
      ...invoiceData,
      id: `inv-${Date.now()}`
    };
    const updated = [newInvoice, ...warehouseInvoices];
    setWarehouseInvoices(updated);
    localStorage.setItem(STORAGE_KEYS.WAREHOUSE_INVOICES, JSON.stringify(updated));

    // If invoice is already COMPLETED, apply inventory adjustment immediately
    if (newInvoice.status === 'COMPLETED' && newInvoice.items && newInvoice.items.length > 0) {
      let updatedItems = [...warehouseItems];
      newInvoice.items.forEach(invItem => {
        const delta = newInvoice.type === 'IMPORT' ? invItem.quantity : -invItem.quantity;
        updatedItems = updatedItems.map(item => {
          if (item.id !== invItem.itemId) return item;
          const newQty = Math.max(0, item.quantity + delta);
          let newStatus: WarehouseItemStatus = 'IN_STOCK';
          if (newQty <= 0) newStatus = 'OUT_OF_STOCK';
          else if (newQty <= item.minStock) newStatus = 'LOW_STOCK';
          return {
            ...item,
            quantity: newQty,
            status: newStatus,
            lastCheckedDate: today,
            updatedAt: now
          };
        });
      });
      setWarehouseItems(updatedItems);
      localStorage.setItem(STORAGE_KEYS.WAREHOUSE_ITEMS, JSON.stringify(updatedItems));
    }

    celebrate();
  };

  const updateWarehouseInvoiceStatus = (
    id: string,
    status: WarehouseInvoiceStatus,
    paymentStatus?: 'PAID' | 'PARTIAL' | 'UNPAID'
  ) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const today = now.slice(0, 10);
    let targetInv: WarehouseInvoice | undefined;
    let oldStatus: WarehouseInvoiceStatus | undefined;

    const updated = warehouseInvoices.map(inv => {
      if (inv.id !== id) return inv;
      oldStatus = inv.status;
      targetInv = {
        ...inv,
        status,
        ...(paymentStatus ? { paymentStatus } : {})
      };
      return targetInv;
    });

    setWarehouseInvoices(updated);
    localStorage.setItem(STORAGE_KEYS.WAREHOUSE_INVOICES, JSON.stringify(updated));

    // If transitioned from non-COMPLETED to COMPLETED, update stock
    if (oldStatus !== 'COMPLETED' && status === 'COMPLETED' && targetInv && targetInv.items) {
      let updatedItems = [...warehouseItems];
      targetInv.items.forEach(invItem => {
        const delta = targetInv!.type === 'IMPORT' ? invItem.quantity : -invItem.quantity;
        updatedItems = updatedItems.map(item => {
          if (item.id !== invItem.itemId) return item;
          const newQty = Math.max(0, item.quantity + delta);
          let newStatus: WarehouseItemStatus = 'IN_STOCK';
          if (newQty <= 0) newStatus = 'OUT_OF_STOCK';
          else if (newQty <= item.minStock) newStatus = 'LOW_STOCK';
          return {
            ...item,
            quantity: newQty,
            status: newStatus,
            lastCheckedDate: today,
            updatedAt: now
          };
        });
      });
      setWarehouseItems(updatedItems);
      localStorage.setItem(STORAGE_KEYS.WAREHOUSE_ITEMS, JSON.stringify(updatedItems));
    }
  };

  const deleteWarehouseInvoice = (id: string) => {
    const updated = warehouseInvoices.filter(i => i.id !== id);
    setWarehouseInvoices(updated);
    localStorage.setItem(STORAGE_KEYS.WAREHOUSE_INVOICES, JSON.stringify(updated));
  };

    const resetToDefaultData = () => {
    localStorage.clear();
    setAttendanceRecords(INITIAL_ATTENDANCE);
    setLeaveRequests(INITIAL_LEAVE_REQUESTS);
    setTasks(INITIAL_TASKS);
    setReviews(INITIAL_REVIEWS);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setBudgetApprovals(INITIAL_BUDGET_APPROVALS);
    setPayrollRecords(INITIAL_PAYROLL_RECORDS);
    setGoogleDocs(INITIAL_GOOGLE_DOCS);
    setVouchers(INITIAL_VOUCHERS);
    setContracts(INITIAL_CONTRACTS);
    setBrandConfig(DEFAULT_BRAND_CONFIG);
    setIsPayrollLocked(false);
    setDepartments(DEPARTMENTS);
    setDepartments(DEPARTMENTS);
    setEmployees(EMPLOYEES);
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setCurrentUserState(EMPLOYEES[0]);
    celebrate();
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        chatMessages,
        sendChatMessage,
        login,
        logout,
        currentUser,
        setCurrentUser,
        employees,
        departments,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        activeTab,
        setActiveTab,
        attendanceRecords,
        todayAttendance,
        checkIn,
        checkOut,
        leaveRequests,
        createLeaveRequest,
        approveLeaveRequest,
        rejectLeaveRequest,
        tasks,
        createTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        toggleSubtask,
        addTaskComment,
        selectedTaskId,
        setSelectedTaskId,
        okrs,
        reviews,
        saveReview,
        announcements,
        addAnnouncement,
        budgetApprovals,
        approveBudget,
        rejectBudget,
        payrollRecords,
        isPayrollLocked,
        togglePayrollLock,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        adjustEmployeeLeave,
        resetEmployeePassword,
        isProfileModalOpen,
        setIsProfileModalOpen,
        openProfileModal,
        closeProfileModal,
        googleDocs,
        addGoogleDoc,
        updateGoogleDocStatus,
        addDocManagerNote,
        deleteGoogleDoc,
        vouchers,
        addVoucher,
        updateVoucher,
        deleteVoucher,
        contracts,
        addContract,
        updateContract,
        deleteContract,
        toggleMilestoneStatus,
        toggleMilestoneReminder,
        brandConfig,
        updateBrandConfig,
        resetBrandConfig,
        // Production & Warehouse
        warehouseItems,
        addWarehouseItem,
        updateWarehouseItem,
        deleteWarehouseItem,
        adjustWarehouseStock,
        inventoryAudits,
        createInventoryAudit,
        approveInventoryAudit,
        deleteInventoryAudit,
        warehouseInvoices,
        createWarehouseInvoice,
        updateWarehouseInvoiceStatus,
        deleteWarehouseInvoice,

        bgTheme,
        setBgTheme,
        resetToDefaultData,
        celebrate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};




