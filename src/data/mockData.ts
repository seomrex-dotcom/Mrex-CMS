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

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'leave-sample-today-1',
    employeeId: 'emp-05',
    employeeName: 'Phạm Thuỳ Linh',
    type: 'ANNUAL',
    startDate: '2026-10-02',
    endDate: '2026-10-02',
    totalDays: 1,
    reason: 'Nghỉ giải quyết việc gia đình cá nhân',
    status: 'APPROVED',
    approverId: 'emp-01',
    approverName: 'Trần Hoàng Nam',
    approvalDate: '2026-10-01',
    approvalNote: 'Đã duyệt kế hoạch bàn giao công việc nhóm đầy đủ',
    createdAt: '2026-10-01 14:00:00'
  },
  {
    id: 'leave-sample-today-2',
    employeeId: 'emp-04',
    employeeName: 'Đặng Minh Đức',
    type: 'SICK',
    startDate: '2026-10-02',
    endDate: '2026-10-03',
    totalDays: 2,
    reason: 'Khám sức khỏe định kỳ & phục hồi thể trạng',
    status: 'APPROVED',
    approverId: 'emp-01',
    approverName: 'Trần Hoàng Nam',
    approvalDate: '2026-10-01',
    approvalNote: 'Đã duyệt nghỉ dưỡng bệnh theo quy chế',
    createdAt: '2026-10-01 16:30:00'
  },
  {
    id: 'leave-sample-1',
    employeeId: 'emp-01',
    employeeName: 'Trần Hoàng Nam',
    type: 'ANNUAL',
    startDate: '2026-10-15',
    endDate: '2026-10-16',
    totalDays: 2,
    reason: 'Nghỉ giải quyết việc gia đình',
    status: 'APPROVED',
    approverId: 'emp-3',
    approverName: 'Nguyễn Lan Chi',
    approvalDate: '2026-10-01',
    approvalNote: 'Đã duyệt kế hoạch bàn giao công việc',
    createdAt: '2026-10-01 09:30:00'
  },
  {
    id: 'leave-sample-2',
    employeeId: 'emp-01',
    employeeName: 'Trần Hoàng Nam',
    type: 'OVERTIME',
    startDate: '2026-10-05',
    endDate: '2026-10-05',
    totalDays: 1,
    reason: 'Làm thêm giờ tối hoàn thiện kế hoạch Q4',
    status: 'PENDING',
    createdAt: '2026-10-02 08:00:00'
  },
  {
    id: 'leave-sample-3',
    employeeId: 'emp-2',
    employeeName: 'Lê Minh Tuấn',
    type: 'SICK',
    startDate: '2026-10-03',
    endDate: '2026-10-03',
    totalDays: 1,
    reason: 'Khám sức khỏe định kỳ',
    status: 'PENDING',
    createdAt: '2026-10-02 07:45:00'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-sample-team-1',
    title: 'Triển khai chiến dịch truyền thông ra mắt sản phẩm Q4',
    description: 'Phối hợp liên phòng ban xây dựng nội dung, viral video và chạy quảng cáo đa kênh cho sự kiện ra mắt.',
    departmentId: 'social',
    assignmentType: 'TEAM',
    teamName: 'Phòng Social Media',
    assigneeId: 'emp-06',
    assigneeIds: ['emp-06', 'emp-08', 'emp-05'],
    reporterId: 'emp-01',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    startDate: '2026-10-01',
    dueDate: '2026-10-15',
    estimatedHours: 48,
    actualHours: 20,
    progress: 60,
    subtasks: [
      { id: 'sb-1', title: 'Lập kế hoạch nội dung & thông điệp chính', completed: true },
      { id: 'sb-2', title: 'Thiết kế bộ nhận diện & banner truyền thông', completed: true },
      { id: 'sb-3', title: 'Thiết lập các chiến dịch quảng cáo TikTok & Facebook', completed: false },
      { id: 'sb-4', title: 'Báo cáo chỉ số tương tác và chuyển đổi', completed: false }
    ],
    comments: [
      {
        id: 'cm-1',
        authorId: 'emp-06',
        authorName: 'Hoàng Kim Oanh',
        authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
        content: 'Team đã hoàn thành bộ ấn phẩm giai đoạn 1, đang tiến hành setup ad campaigns.',
        createdAt: '2026-10-01 16:30'
      }
    ],
    tags: ['Việc Team', 'Social Media', 'Chiến Dịch Q4'],
    createdAt: '2026-10-01 09:00'
  },
  {
    id: 'task-sample-ind-1',
    title: 'Tối ưu hóa Core Web Vitals và Technical SEO cho Landing Page',
    description: 'Nâng điểm Google PageSpeed lên trên 90, nén ảnh định dạng WebP và tối ưu TTFB máy chủ.',
    departmentId: 'it_seo',
    assignmentType: 'INDIVIDUAL',
    assigneeId: 'emp-02',
    reporterId: 'emp-01',
    status: 'TODO',
    priority: 'MEDIUM',
    startDate: '2026-10-02',
    dueDate: '2026-10-08',
    estimatedHours: 16,
    actualHours: 0,
    progress: 0,
    subtasks: [
      { id: 'sb-5', title: 'Audit toàn diện báo cáo PageSpeed Insights', completed: false },
      { id: 'sb-6', title: 'Tối ưu lazy load và bộ nhớ cache trình duyệt', completed: false }
    ],
    comments: [],
    tags: ['Việc Cá Nhân', 'IT & SEO', 'Tối Ưu Tốc Độ'],
    createdAt: '2026-10-02 08:00'
  },
  {
    id: 'task-sample-ind-2',
    title: 'Phê duyệt định biên nhân sự và ngân sách chiến lược quý 4/2026',
    description: 'Rà soát kế hoạch tuyển dụng, chi phí vận hành và phương án đầu tư công cụ làm việc số.',
    departmentId: 'exec',
    assignmentType: 'INDIVIDUAL',
    assigneeId: 'emp-01',
    reporterId: 'emp-01',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    startDate: '2026-10-01',
    dueDate: '2026-10-05',
    estimatedHours: 8,
    actualHours: 4,
    progress: 50,
    subtasks: [
      { id: 'sb-7', title: 'Xem xét báo cáo tài chính tháng 9', completed: true },
      { id: 'sb-8', title: 'Ký duyệt hạn mức ngân sách các phòng ban', completed: false }
    ],
    comments: [],
    tags: ['Việc Cá Nhân', 'Ban Giám Đốc', 'Kế Hoạch'],
    createdAt: '2026-10-01 08:30'
  },
  {
    id: 'task-sample-urgent-wh',
    title: '[Khẩn Cấp] Kiểm kê gấp vật tư chiến dịch Q4 & bàn giao xuất kho',
    description: 'Xử lý khẩn cấp yêu cầu kiểm kê và bàn giao vật tư quà tặng, ấn phẩm truyền thông cho sự kiện chiều nay.',
    departmentId: 'production',
    assignmentType: 'INDIVIDUAL',
    assigneeId: 'emp-08',
    reporterId: 'emp-07',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    startDate: '2026-10-02',
    dueDate: '2026-10-02',
    estimatedHours: 4,
    actualHours: 2,
    progress: 50,
    subtasks: [
      { id: 'sb-wh-1', title: 'Kiểm tra tồn kho vật tư banner và quà tặng', completed: true },
      { id: 'sb-wh-2', title: 'Ký bàn giao biên bản vận chuyển cho đối tác', completed: false }
    ],
    comments: [],
    tags: ['Khẩn Cấp', 'Kho Vận', 'Việc Cá Nhân'],
    createdAt: '2026-10-02 08:15'
  }
];

export const INITIAL_OKRS: OKRObjective[] = [];

export const INITIAL_REVIEWS: PerformanceReview[] = [
  {
    id: 'rev-sample-1',
    employeeId: 'emp-04',
    reviewerId: 'emp-02',
    period: 'Q3/2026',
    status: 'COMPLETED',
    criteria: [
      { id: 'cr-1', name: 'Hoàn thành khối lượng công việc & Tiến độ cam kết', weight: 35, selfScore: 4.5, managerScore: 4.5 },
      { id: 'cr-2', name: 'Chất lượng chuyên môn, kiến trúc & Giải quyết vấn đề', weight: 25, selfScore: 4.5, managerScore: 5.0 },
      { id: 'cr-3', name: 'Tinh thần phối hợp đồng đội & Lắng nghe phản hồi', weight: 20, selfScore: 4.0, managerScore: 4.5 },
      { id: 'cr-4', name: 'Kỷ luật công việc, chấm công & Tuân thủ quy định', weight: 10, selfScore: 4.0, managerScore: 4.5 },
      { id: 'cr-5', name: 'Sáng kiến cải tiến quy trình & Đóng góp ý tưởng mới', weight: 10, selfScore: 4.0, managerScore: 4.5 },
    ],
    selfScoreTotal: 4.25,
    managerScoreTotal: 4.65,
    finalRating: 'A_PLUS',
    employeeStrengths: 'Chuyên môn kỹ thuật vững vàng, giải quyết dứt điểm các sự cố hệ thống và chủ động nghiên cứu công nghệ mới.',
    employeeImprovements: 'Cần tài liệu hóa kiến trúc chi tiết hơn cho các module phát triển mới.',
    managerFeedback: 'Lê Phương Lan (Trưởng Phòng IT & SEO): Đạt xuất sắc các chỉ số KPI kỹ thuật quý 3. Khả năng làm việc độc lập và hỗ trợ đồng đội rất tốt.',
    developmentPlan: 'Tham gia khóa bồi dưỡng Quản trị Kiến trúc Hệ thống Phân tán và AI Integration.',
    updatedAt: '2026-10-01 15:30'
  },
  {
    id: 'rev-sample-2',
    employeeId: 'emp-08',
    reviewerId: 'emp-07',
    period: 'Q3/2026',
    status: 'COMPLETED',
    criteria: [
      { id: 'cr-1', name: 'Hoàn thành khối lượng công việc & Tiến độ cam kết', weight: 35, selfScore: 4.0, managerScore: 4.0 },
      { id: 'cr-2', name: 'Chất lượng chuyên môn, kiến trúc & Giải quyết vấn đề', weight: 25, selfScore: 4.0, managerScore: 4.5 },
      { id: 'cr-3', name: 'Tinh thần phối hợp đồng đội & Lắng nghe phản hồi', weight: 20, selfScore: 4.0, managerScore: 4.0 },
      { id: 'cr-4', name: 'Kỷ luật công việc, chấm công & Tuân thủ quy định', weight: 10, selfScore: 4.5, managerScore: 4.5 },
      { id: 'cr-5', name: 'Sáng kiến cải tiến quy trình & Đóng góp ý tưởng mới', weight: 10, selfScore: 4.0, managerScore: 4.0 },
    ],
    selfScoreTotal: 4.05,
    managerScoreTotal: 4.15,
    finalRating: 'A',
    employeeStrengths: 'Quản lý xuất nhập tồn kho vận chặt chẽ, kiểm kê vật tư chính xác không để xảy ra thất thoát.',
    employeeImprovements: 'Cần đẩy nhanh tiến độ số hóa biên bản giấy lên phần mềm quản lý.',
    managerFeedback: 'Võ Văn Lực (Quản Đốc Phân Xưởng): Hoàn thành tốt định mức KPI kho vận, bảo đảm an toàn hàng hóa.',
    developmentPlan: 'Bồi dưỡng nghiệp vụ Quản trị Chuỗi cung ứng và Tối ưu hóa Sắp xếp Kho.',
    updatedAt: '2026-10-01 16:00'
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-sample-1',
    title: 'Chúc mừng ngày Phụ Nữ Việt Nam 20/10 & Khen thưởng nội bộ',
    content: 'Ban Giám Đốc trân trọng gửi lời chúc mừng tốt đẹp nhất tới toàn thể nữ cán bộ nhân viên Mrex Agency. Chúc các chị em luôn tràn đầy năng lượng, hạnh phúc và thành công trên mọi chặng đường phát triển cùng công ty!',
    category: 'RECOGNITION',
    authorName: 'Trần Hoàng Nam',
    authorRole: 'Tổng Giám Đốc (CEO)',
    isPinned: true,
    publishedAt: '2026-10-02 08:00'
  },
  {
    id: 'ann-sample-2',
    title: 'Thông báo quy chế làm việc nghỉ xen kẽ Thứ 7 & chuẩn 24 ngày công',
    content: 'Kể từ tháng 10/2026, Mrex Agency chính thức áp dụng lịch làm việc nghỉ xen kẽ Thứ 7: Mỗi tháng nhân sự làm việc 2 ngày Thứ 7 và nghỉ 2 ngày Thứ 7 (nghỉ toàn bộ Chủ Nhật). Tổng số ngày công tiêu chuẩn hàng tháng là 24 ngày công.',
    category: 'POLICY',
    authorName: 'Trần Hoàng Nam',
    authorRole: 'Tổng Giám Đốc (CEO)',
    isPinned: false,
    publishedAt: '2026-10-01 09:00'
  },
  {
    id: 'ann-sample-3',
    title: 'Ra mắt chiến dịch truyền thông ra mắt sản phẩm Q4/2026',
    content: 'Toàn thể các bộ phận Social Media, IT & SEO, Sản Xuất Kho Vận phối hợp đẩy mạnh tiến độ các hạng mục chiến dịch Q4 đúng hạn định.',
    category: 'EVENT',
    authorName: 'Vũ Quốc Bảo',
    authorRole: 'Trưởng Phòng Social Media',
    isPinned: false,
    publishedAt: '2026-10-01 14:30'
  }
];

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
