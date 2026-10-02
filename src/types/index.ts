
export type PresenceStatus = 'ACTIVE' | 'IDLE' | 'OFFLINE';

export interface EmployeePresence {
  employeeId: string;
  status: PresenceStatus; // 'ACTIVE': Đang thao tác | 'IDLE': Treo tab | 'OFFLINE': Vắng mặt
  lastActive: number;
  currentActivity: string;
  device: 'WEB' | 'MOBILE';
}

export type UserRole = 'CEO' | 'MANAGER' | 'HR' | 'EMPLOYEE';

export type DepartmentId = string; // Supports both built-in (exec,tech,product,hr,sales) and dynamic IDs

export interface Department {
  id: DepartmentId;
  name: string;
  code: string;
  managerId: string;
  employeeCount: number;
  color: string;
  description?: string;
  parentId?: DepartmentId;
  level?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  foundedDate?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface Employee {
  id: string;
  name: string;
  code: string; // e.g. NV-001
  email: string;
  phone: string;
  role: UserRole;
  roleTitle: string; // e.g. "Tổng Giám Đốc", "Trưởng Phòng Kỹ Thuật"
  departmentId: DepartmentId;
  avatar: string;
  birthDate?: string; // YYYY-MM-DD
  joinDate: string;
  baseSalaryGrade: string;
  baseSalaryVND: number;
  status: 'ACTIVE' | 'ON_LEAVE' | 'PROBATION';
  annualLeaveRemaining: number;
  managerId?: string; // ID of direct supervisor for organizational chart
  password?: string; // Mật khẩu đăng nhập hệ thống
  accountStatus?: 'ACTIVE' | 'LOCKED' | 'NOT_CREATED'; // Trạng thái tài khoản
}

export interface UserAccount {
  employeeId: string;
  email: string;
  password?: string;
  role: UserRole;
  createdAt?: string;
  lastLogin?: string;
  status: 'ACTIVE' | 'LOCKED';
}

export type AttendanceStatus = 'ON_TIME' | 'LATE' | 'EARLY_LEAVE' | 'ABSENT' | 'LEAVE_PAID' | 'LEAVE_UNPAID' | 'HOLIDAY';
export type WorkLocation = 'OFFICE' | 'REMOTE' | 'BUSINESS_TRIP';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn?: string; // HH:mm:ss
  checkOut?: string; // HH:mm:ss
  workHours: number;
  overtimeHours: number;
  status: AttendanceStatus;
  location: WorkLocation;
  locationDetails?: string;
  ipAddress?: string;
  note?: string;
}

export type LeaveType = 'ANNUAL' | 'SICK' | 'MATERNITY' | 'UNPAID' | 'OVERTIME' | 'LATE_EARLY';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type BackgroundTheme =
  | 'glass_gradient'
  | 'modern_grid'
  | 'pure_white'
  | 'soft_mesh'
  | 'warm_zinc'
  | 'dark_executive';

export type FontFamilyOption =
  | 'Be Vietnam Pro'
  | 'Inter'
  | 'Plus Jakarta Sans'
  | 'Outfit'
  | 'Montserrat'
  | 'Roboto';

export type BrandColorPreset =
  | 'ocean_breeze'
  | 'glass_sunset' // Điểm nhấn Cam Hoàng Hôn: linear-gradient(25deg, #ee6a23 0%, #f9a533 100%)
  | 'emerald'      // Phong cách AeuxGlobal chuẩn mực
  | 'indigo'       // Xanh công nghệ & giải pháp số
  | 'violet'       // Tím hoàng gia & sáng tạo
  | 'cyan'         // Xanh cyan tương lai & AI
  | 'amber'        // Vàng đồng tài chính & thịnh vượng
  | 'rose'         // Đỏ thắm nhiệt huyết & quyết sách
  | 'slate'        // Xám than chì tối giản hiện đại
  | 'custom';

export type SidebarThemeOption =
  | 'glass_navy'     // Tone Xanh Glass Navy: linear-gradient(272deg, #00144b 0%, #003189 100%)
  | 'deep_emerald'   // #072a27 - Chuẩn AeuxGlobal
  | 'midnight_slate' // #0f172a - Slate Dark
  | 'royal_navy'     // #0a192f - Xanh Navy quyền quý
  | 'charcoal_dark'  // #18181b - Than chì Zinc tối giản
  | 'crisp_light';   // #ffffff - Giao diện sáng thanh lịch

export type LogoSymbolOption =
  | 'double_leaf'       // Song Diệp AeuxGlobal (sinh thái, bền vững, vươn tầm)
  | 'tech_hexagon'      // Lục Lăng Công Nghệ (kỹ thuật, kiến trúc số)
  | 'quantum_prism'     // Lăng Kính Tinh Hoa (đa chiều, sáng tạo)
  | 'globe_core'        // Mạng Lưới Toàn Cầu (hội nhập quốc tế)
  | 'crown_executive'   // Vương Miện Lãnh Đạo (vị thế dẫn đầu)
  | 'shield_crest';     // Khiên Bảo An Vững Chãi (bền vững, tin cậy)

export interface CompanyBrandConfig {
  companyName: string;
  tagline: string;
  description: string;
  logoType: 'preset_symbol' | 'custom_image';
  companyAddress?: string; // Đa chị văn phòng
  logoUrl?: string; // Base64 data URL hoặc URL ảnh
  logoSymbolId: LogoSymbolOption;
  primaryColorPreset: BrandColorPreset;
  primaryColorHex: string;
  sidebarTheme: SidebarThemeOption;
  backgroundTheme: BackgroundTheme;
  fontFamily: FontFamilyOption;
  updatedAt?: string;
  updatedBy?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: RequestStatus;
  approverId?: string;
  approverName?: string;
  approvalDate?: string;
  approvalNote?: string;
  createdAt: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export type TaskAssignmentType = 'INDIVIDUAL' | 'TEAM';

export interface TaskComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  departmentId: DepartmentId;
  assigneeId: string;
  assigneeIds?: string[];
  assignmentType?: TaskAssignmentType;
  teamName?: string;
  reporterId: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  progress: number; // 0 - 100
  subtasks: Subtask[];
  comments: TaskComment[];
  tags: string[];
  googleDocsUrl?: string; // Liên kết Google Docs (https://docs.google.com/...)
  googleDocsTitle?: string;
  completedAt?: string;     // Timestamp khi task được COMPLETED
  archivedAt?: string;      // Timestamp khi task bị auto-archive
  createdAt: string;
}

export type DocReviewStatus = 'DRAFT' | 'NEEDS_REVIEW' | 'REVISION_NEEDED' | 'APPROVED';

export interface ManagerDocNote {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  sectionHint?: string;
  type: 'SUGGESTION' | 'REQUEST_CHANGE' | 'APPROVAL' | 'GENERAL';
}

export interface GoogleDocDeliverable {
  id: string;
  title: string;
  docsUrl: string; // e.g. https://docs.google.com/document/d/...
  docType: 'CONTENT' | 'PROPOSAL' | 'SPEC' | 'REPORT' | 'OTHER';
  departmentId: DepartmentId;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  reviewerId: string; // Quản lý phụ trách duyệt & note
  reviewerName: string;
  taskId?: string;
  taskTitle?: string;
  status: DocReviewStatus;
  summary: string;
  notes: ManagerDocNote[];
  createdAt: string;
  updatedAt: string;
}

export interface OKRObjective {
  id: string;
  title: string;
  departmentId: DepartmentId;
  quarter: string; // e.g. "Q3/2026"
  progress: number;
  weight: number; // e.g. 30%
  status: 'PROPOSED' | 'APPROVED' | 'ACTIVE';
  keyResults: {
    id: string;
    description: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    progress: number;
  }[];
}

export type ReviewRating = 'A_PLUS' | 'A' | 'B' | 'C' | 'D';

export interface ReviewCriteria {
  id: string;
  name: string;
  weight: number; // Percentage, e.g. 30
  selfScore: number; // 1-5 scale
  managerScore: number; // 1-5 scale
  note?: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  period: string; // e.g. "Q3/2026", "2026-Annual"
  status: 'DRAFT' | 'SUBMITTED_BY_EMPLOYEE' | 'COMPLETED';
  criteria: ReviewCriteria[];
  selfScoreTotal: number;
  managerScoreTotal: number;
  finalRating: ReviewRating;
  employeeStrengths: string;
  employeeImprovements: string;
  managerFeedback: string;
  developmentPlan: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'GENERAL' | 'POLICY' | 'EVENT' | 'RECOGNITION';
  authorName: string;
  authorRole: string;
  isPinned: boolean;
  publishedAt: string;
}

export interface BudgetApproval {
  id: string;
  quarter: string;
  departmentId: DepartmentId;
  title: string;
  amountVND: number;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedBy: string;
  createdAt: string;
  approvedAt?: string;
}

export interface PayrollRecord {
  employeeId: string;
  employeeName: string;
  roleTitle: string;
  departmentName: string;
  standardDays: number;
  actualWorkedDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  lateTimes: number;
  otHours: number;
  baseSalaryVND: number;
  otSalaryVND: number;
  allowanceVND: number;
  deductionVND: number;
  netSalaryVND: number;
  isLocked: boolean;
}

export type VoucherType = 'RECEIPT' | 'PAYMENT'; // RECEIPT = Phiếu Thu, PAYMENT = Phiếu Chi
export type PaymentMethod = 'BANK_TRANSFER' | 'CASH';

export interface FinancialVoucher {
  id: string;
  code: string;               // e.g. "PT-202609-01", "PC-202609-01"
  type: VoucherType;
  title: string;              // Lý do nộp / chi
  category: string;           // Danh mục thu / chi
  amountVND: number;
  date: string;               // YYYY-MM-DD
  month: string;              // YYYY-MM (e.g. "2026-09")
  payerOrPayee: string;       // Họ tên người nộp (Phiếu Thu) / Người nhận (Phiếu Chi)
  payerOrPayeePhone?: string;
  payerOrPayeeAddress?: string;
  accountantName: string;     // Người lập phiếu
  approverName: string;       // Người duyệt (CEO / Quản lý)
  cashierName: string;        // Thủ quỹ
  paymentMethod: PaymentMethod;
  referenceDoc?: string;      // Chứng từ gốc kèm theo
  notes?: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  createdAt: string;
}

export interface PaymentMilestone {
  id: string;
  name: string;           // e.g. "Đợt 1: Tạm ứng khi ký HĐ"
  dueDate: string;        // YYYY-MM-DD
  amountVND: number;
  percentage: number;     // e.g. 30
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  paidDate?: string;
  reminderSent?: boolean;
  notes?: string;
}

export interface ProjectContract {
  id: string;
  contractCode: string;   // e.g. "HĐ-2026/VINSMART-ERP"
  projectName: string;    // e.g. "Triển khai hệ thống ERP OmniCorp"
  clientName: string;     // e.g. "Tập đoàn VinSmart"
  clientContact?: string; // Số điện thoại / email đại diện khách hàng
  signingDate: string;    // Ngày ký hợp đồng: YYYY-MM-DD
  startDate: string;      // Ngày bắt đầu triển khai: YYYY-MM-DD
  endDate: string;        // Ngày nghiệm thu bàn giao: YYYY-MM-DD
  totalValueVND: number;  // Doanh thu / Tổng giá trị hợp đồng
  collectedVND: number;   // Đã thu thực tế
  departmentId: DepartmentId;
  managerName: string;    // PM phụ trách
  status: 'ACTIVE' | 'PENDING_PAYMENT' | 'COMPLETED' | 'DRAFT';
  fileName?: string;      // Tên file hợp đồng scan / pdf
  fileUrl?: string;       // Data URL hoặc liên kết file
  fileSize?: string;      // e.g. "2.4 MB"
  milestones: PaymentMilestone[];
  notes?: string;
  createdAt: string;
}

export type ActiveNavTab =
  | 'dashboard'
  | 'attendance'
  | 'tasks'
  | 'finance'    // Sổ quỹ & Quản lý Thu - Chi: Phiếu thu, Phiếu chi, Tổng kết tháng
  | 'payroll'    // Khối Nhân Sự: Bảng tính công, chốt lương tháng, quỹ phép
  | 'docs'       // Văn bản, Content & Tài liệu Google Docs
  | 'performance'
  | 'reports'
  | 'employees'
  | 'board'      // Ban Quản Trị: Quyết sách, phê duyệt ngân sách quỹ thưởng, OKR
  | 'workload'   // Cấp Quản Lý: Cân bằng tải công việc phòng ban, nghiệm thu
  | 'announcements'
  | 'production'
  | 'chat'
  | 'resources'; // Tài liệu & Tư liệu cá nhân / công ty





// ==========================================
// TÀI LIỆU & TƯ LIỆU (Resource Links)
// ==========================================

export type ResourceAccessLevel = 'PERSONAL' | 'DEPARTMENT' | 'MANAGEMENT' | 'ALL';
export type ResourceCategory = 'TOOL' | 'DRIVE' | 'DOCS' | 'LINK' | 'OTHER';

export interface ResourceLink {
  id: string;
  title: string;                   // Tên tài liệu / công cụ
  url: string;                     // URL link
  description?: string;            // Mô tả ngắn
  category: ResourceCategory;      // Loại tài nguyên
  accessLevel: ResourceAccessLevel;// Phạm vi: Cá nhân, Phòng ban, Quản lý, Toàn công ty
  departmentId?: string;           // Nếu accessLevel = DEPARTMENT
  ownerId: string;                 // Người tạo / sở hữu
  ownerName: string;
  ownerRole: string;
  isPinned?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ==========================================
// BỘ PHẬN SẢN XUẤT & QUẢN LÝ KHO HÀNG
// ==========================================

export type WarehouseItemCategory = 'RAW_MATERIAL' | 'SEMI_FINISHED' | 'FINISHED_GOODS' | 'PACKAGING';
export type WarehouseItemStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface WarehouseItem {
  id: string;
  sku: string;                    // Mã phân loại hàng hóa (SKU)
  name: string;                   // Tên hàng hóa / vật tư / sản phẩm
  category: WarehouseItemCategory;// Phân loại: Nguyên liệu, Bán thành phẩm, Thành phẩm, Bao bì
  unit: string;                   // Đơn vị tính: Bộ, Thùng, Chiếc, Kg, Cuộn
  quantity: number;               // Tồn kho thực tế
  minStock: number;               // Định mức tồn tối thiểu (ngưỡng cảnh báo)
  maxStock: number;               // Định mức tồn tối đa
  unitPrice: number;              // Đơn giá vốn / nhập kho (VNĐ)
  sellingPrice?: number;          // Đơn giá xuất / bán lẻ (VNĐ)
  warehouseLocation: string;      // Vị trí lưu kho (VD: Kho Tổng A - Kệ 03)
  status: WarehouseItemStatus;    // Đủ hàng, Sắp hết, Hết hàng
  lastCheckedDate: string;        // Ngày kiểm đếm gần nhất
  specification?: string;         // Quy cách đóng gói, thông số kỹ thuật
  createdAt?: string;
  updatedAt?: string;
}

export type QualityCheckStatus = 'QUALIFIED' | 'DEFECTIVE' | 'EXPIRED';
export type AuditStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED';

export interface AuditItemDetail {
  itemId: string;
  itemName: string;
  sku: string;
  unit: string;
  systemQty: number;              // Số lượng sổ sách trên phần mềm
  actualQty: number;              // Số lượng thực tế kiểm đếm
  difference: number;             // Chênh lệch (actualQty - systemQty)
  qualityStatus: QualityCheckStatus; // Đạt chuẩn 100%, Lỗi kỹ thuật / Xước vỡ, Cần xuất hủy
  note?: string;                  // Ghi chú cụ thể
}

export interface InventoryAuditTicket {
  id: string;
  code: string;                   // Mã phiếu kiểm: PKH-xxxx
  title: string;                  // Tên đợt kiểm hàng
  auditorId: string;              // Nhân sự kiểm hàng (Thủ kho / NV sản xuất)
  auditorName: string;
  auditDate: string;              // Ngày thực hiện kiểm kê
  warehouseName: string;          // Kho thực hiện kiểm tra
  items: AuditItemDetail[];       // Danh mục hàng hóa kiểm kê
  status: AuditStatus;            // Nháp, Đang kiểm, Hoàn tất, Đã chốt duyệt
  approvedBy?: string;            // Ban Quản trị / Quản đốc ký duyệt
  approvalDate?: string;
  summaryNote?: string;
  createdAt: string;
}

export type WarehouseInvoiceType = 'IMPORT' | 'EXPORT';
export type WarehouseInvoiceStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';

export interface InvoiceItemDetail {
  itemId: string;
  itemName: string;
  sku: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
}

export interface WarehouseInvoice {
  id: string;
  code: string;                   // Mã hóa đơn: NK-xxxx (Nhập) hoặc XK-xxxx (Xuất)
  type: WarehouseInvoiceType;     // IMPORT = Nhập kho, EXPORT = Xuất kho
  title: string;                  // Tên giao dịch / Đợt hàng
  partnerName: string;            // Nhà cung cấp (Nhập) hoặc Khách hàng / Đại lý / Dự án (Xuất)
  contactPhone: string;           // Số điện thoại liên hệ đối tác
  createdDate: string;            // Ngày lập hóa đơn
  deliveryDate?: string;          // Ngày giao nhận thực tế
  creatorId: string;              // Nhân sự lập phiếu
  creatorName: string;
  items: InvoiceItemDetail[];     // Danh mục mặt hàng
  totalAmount: number;            // Tiền hàng trước thuế
  taxVND: number;                 // Thuế VAT (nếu có)
  grandTotal: number;             // Tổng thanh toán (VNĐ)
  status: WarehouseInvoiceStatus; // Chờ duyệt, Đã duyệt, Đã nhập/xuất, Hủy
  warehouseName: string;          // Kho nhập / Kho xuất
  note?: string;                  // Ghi chú giao hàng
  paymentStatus: 'PAID' | 'UNPAID' | 'PARTIAL'; // Tình trạng thanh toán
}


export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderRoleTitle: string;
  senderAvatar: string;
  departmentId: string;
  channelId: string;
  channelName?: string;
  content: string;
  timestamp: string;
  type?: 'TEXT' | 'BIRTHDAY_WISH' | 'ANNOUNCEMENT' | 'IMAGE';
  reactions?: { emoji: string; count: number; users: string[] }[];
}

export interface StorageHealth {
  usedBytes: number;
  usedFormatted: string;
  maxRecommendedBytes: number;
  percentUsage: number;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  totalItems: number;
  vpsRamSimulated: {
    usedMb: number;
    totalMb: number;
    percent: number;
  };
  lastOptimizedAt?: string;
  lowMemoryMode: boolean;
}
