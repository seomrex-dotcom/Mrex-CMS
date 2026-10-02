import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  CheckCircle,
  XCircle,
  Eye,
  Edit3,
  Sparkles,
  ArrowRight,
  Server,
  Database,
  Cpu,
  RefreshCw,
  Trash2,
  Cake,
  MessageCircle,
  Boxes,
  FileSpreadsheet,
  Lock,
  Layers,
  Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Employee, UserRole, ActiveNavTab } from '../../types';
import { StorageOptimizer } from '../../services/storageOptimizer';

export const RoleTestingView: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    employees,
    departments,
    setActiveTab,
    celebrate
  } = useApp();

  const [storageHealth, setStorageHealth] = useState(() => StorageOptimizer.getStorageHealth());
  const [optimizerMessage, setOptimizerMessage] = useState<string | null>(null);

  const refreshHealth = () => {
    setStorageHealth(StorageOptimizer.getStorageHealth());
  };

  const handleSwitchUser = (emp: Employee) => {
    setCurrentUser(emp);
    celebrate();
    setOptimizerMessage(`Đã chuyển phiên làm việc sang: ${emp.name} (${emp.roleTitle})`);
    setTimeout(() => setOptimizerMessage(null), 3500);
  };

  const handleVacuumVPS = () => {
    const res = StorageOptimizer.vacuumAndOptimize();
    refreshHealth();
    celebrate();
    setOptimizerMessage(res.message);
    setTimeout(() => setOptimizerMessage(null), 4000);
  };

  // Group employees by department
  const roleCards = [
    {
      role: 'CEO' as UserRole,
      title: 'Ban Giám Đốc (CEO)',
      departmentId: 'exec',
      deptName: 'Ban Giám Đốc',
      color: '#4F46E5',
      badge: '👑 Toàn Quyền Lãnh Đạo',
      description: 'Quyền phê duyệt cao nhất: Quản lý ngân sách, ký duyệt OKR, xem toàn bộ báo cáo doanh thu - chi phí, cấu hình thương hiệu công ty.',
      allowedTabs: ['dashboard', 'board', 'finance', 'attendance', 'tasks', 'production', 'payroll', 'employees', 'docs', 'performance', 'reports', 'announcements', 'chat'],
      sampleId: 'emp-01',
    },
    {
      role: 'MANAGER' as UserRole,
      title: 'Khối Sản Xuất & Kho Vận',
      departmentId: 'production',
      deptName: 'Khối Sản Xuất & Kho Vận',
      color: '#0284C7',
      badge: '📦 Quản Đốc & Thủ Kho',
      description: 'Quản lý toàn bộ kho vật tư, kiểm kê đối soát, lập và in hóa đơn nhập/xuất kho, cập nhật số lượng tồn kho theo thời gian thực.',
      allowedTabs: ['dashboard', 'production', 'tasks', 'attendance', 'workload', 'docs', 'reports', 'announcements', 'chat'],
      sampleId: 'emp-07',
    },
    {
      role: 'HR' as UserRole,
      title: 'Phòng Nhân Sự & Hành Chính',
      departmentId: 'hr',
      deptName: 'Phòng Nhân Sự & Hành Chính',
      color: '#10B981',
      badge: '👥 Quản Trị Nhân Sự & Lương',
      description: 'Quản lý hồ sơ nhân viên, duyệt đơn xin nghỉ phép, chấm công tính lương, theo dõi ngày sinh nhật nhân sự và tổ chức văn hóa công ty.',
      allowedTabs: ['dashboard', 'payroll', 'attendance', 'employees', 'tasks', 'docs', 'performance', 'reports', 'announcements', 'chat'],
      sampleId: 'emp-03',
    },
    {
      role: 'MANAGER' as UserRole,
      title: 'Phòng IT & SEO',
      departmentId: 'it_seo',
      deptName: 'Phòng IT & SEO',
      color: '#0EA5E9',
      badge: '💻 Quản Trị Hạ Tầng & VPS',
      description: 'Vận hành hệ thống kỹ thuật, tối ưu tài nguyên VPS chống sập, quản lý dự án website & SEO, giao việc kỹ thuật cho các kỹ sư.',
      allowedTabs: ['dashboard', 'tasks', 'workload', 'attendance', 'docs', 'performance', 'reports', 'announcements', 'chat', 'role_testing'],
      sampleId: 'emp-02',
    },
    {
      role: 'EMPLOYEE' as UserRole,
      title: 'Phòng Social Media',
      departmentId: 'social',
      deptName: 'Phòng Social Media',
      color: '#EC4899',
      badge: '📱 Sáng Tạo Nội Dung & Mạng Xã Hội',
      description: 'Triển khai các chiến dịch truyền thông đa nền tảng (Facebook, TikTok), lên lịch bài đăng, quản lý tương tác và sản xuất ấn phẩm số.',
      allowedTabs: ['dashboard', 'tasks', 'attendance', 'docs', 'performance', 'announcements', 'chat'],
      sampleId: 'emp-06',
    },
    {
      role: 'EMPLOYEE' as UserRole,
      title: 'Phòng Truyền Thông Nội Bộ',
      departmentId: 'internal_comms',
      deptName: 'Phòng Truyền Thông Nội Bộ',
      color: '#F59E0B',
      badge: '✨ Gắn Kết Văn Hóa & Sự Kiện',
      description: 'Phát hành bản tin nội bộ, tổ chức chúc mừng sinh nhật cán bộ nhân viên, điều phối kênh trao đổi thông tin toàn công ty.',
      allowedTabs: ['dashboard', 'announcements', 'attendance', 'tasks', 'docs', 'performance', 'chat'],
      sampleId: 'emp-05',
    },
  ];

  // Feature Matrix Definition
  const featureMatrix = [
    {
      feature: 'Sổ Quỹ Thu - Chi & Phiếu Thu/Chi',
      ceo: '✅ Toàn quyền',
      production: '🔒 Không có quyền',
      hr: '👁️ Xem phiếu lương',
      itSeo: '🔒 Không có quyền',
      social: '🔒 Không có quyền',
      internalComms: '🔒 Không có quyền',
      tabId: 'finance' as ActiveNavTab,
    },
    {
      feature: 'Quản Lý Kho Hàng & Hóa Đơn Nhập/Xuất',
      ceo: '👁️ Xem & Duyệt',
      production: '✅ Toàn quyền (Quản đốc/Thủ kho)',
      hr: '🔒 Không có quyền',
      itSeo: '🔒 Không có quyền',
      social: '🔒 Không có quyền',
      internalComms: '🔒 Không có quyền',
      tabId: 'production' as ActiveNavTab,
    },
    {
      feature: 'Bảng Tính Lương, Chấm Công & Quỹ Phép',
      ceo: '👁️ Phê duyệt lương',
      production: '🔒 Xem công cá nhân',
      hr: '✅ Toàn quyền tính lương',
      itSeo: '🔒 Xem công cá nhân',
      social: '🔒 Xem công cá nhân',
      internalComms: '🔒 Xem công cá nhân',
      tabId: 'payroll' as ActiveNavTab,
    },
    {
      feature: 'Hợp Đồng Dự Án & Quỹ Thưởng Ban Quản Trị',
      ceo: '✅ Toàn quyền',
      production: '🔒 Không có quyền',
      hr: '🔒 Không có quyền',
      itSeo: '🔒 Không có quyền',
      social: '🔒 Không có quyền',
      internalComms: '🔒 Không có quyền',
      tabId: 'board' as ActiveNavTab,
    },
    {
      feature: 'Giao Việc & Quản Lý Dự Án (Kanban)',
      ceo: '✅ Toàn quyền',
      production: '✅ Giao việc tổ đội',
      hr: '✅ Giao việc phòng ban',
      itSeo: '✅ Giao việc kỹ thuật',
      social: '✅ Giao việc chiến dịch',
      internalComms: '✅ Giao việc sự kiện',
      tabId: 'tasks' as ActiveNavTab,
    },
    {
      feature: 'Nhắn Tin Nhóm Toàn Công Ty & Sinh Nhật',
      ceo: '✅ Toàn quyền',
      production: '✅ Đăng tin & Trao đổi',
      hr: '✅ Điều phối thông báo',
      itSeo: '✅ Đăng tin & Trao đổi',
      social: '✅ Đăng tin & Trao đổi',
      internalComms: '✅ Phụ trách chúc mừng',
      tabId: 'chat' as ActiveNavTab,
    },
    {
      feature: 'Tối Ưu VPS Tránh Sập & Quản Lý Lưu Trữ',
      ceo: '✅ Xem & Giám sát',
      production: '🔒 Tự động nén ảnh',
      hr: '🔒 Tự động nén ảnh',
      itSeo: '✅ Toàn quyền tối ưu VPS',
      social: '🔒 Tự động nén ảnh',
      internalComms: '🔒 Tự động nén ảnh',
      tabId: 'role_testing' as ActiveNavTab,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner / Notification */}
      {optimizerMessage && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-sm font-semibold shadow-md animate-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{optimizerMessage}</span>
        </div>
      )}

      {/* Main Title & Action Bar */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-[#0875D9] dark:text-blue-300">
              <Shield className="w-5 h-5" />
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#0875D9] dark:text-blue-300 text-xs font-bold border border-blue-200/60">
              Kiểm Thử Cấp Bậc & Chi Tiết Tính Năng
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Môi Trường Kiểm Thử Phân Quyền Mrex Agency
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Chuyển đổi tức thì giữa các cấp bậc (CEO, Quản Đốc Kho, HR, IT & SEO, Social, TTNB) để kiểm tra giao diện, quyền hạn và chức năng chi tiết.
          </p>
        </div>

        {/* Current User Quick Badge */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/60 p-3.5 rounded-2xl border border-blue-200/80 dark:border-blue-900/50 shrink-0">
          <div className="w-11 h-11 rounded-full overflow-hidden bg-blue-600 text-white font-black flex items-center justify-center border-2 border-white shadow-sm shrink-0">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
              currentUser.name.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              Đang Mô Phỏng Nhân Sự:
            </div>
            <div className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <span>{currentUser.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-600 text-white font-mono">
                {currentUser.role}
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {currentUser.roleTitle} · {currentUser.email}
            </div>
          </div>
        </div>
      </div>

      {/* VPS Stability & Storage Health Monitor Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1: Storage Used */}
        <div className="bg-white/95 dark:bg-slate-900/95 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dung Lượng Bộ Nhớ</div>
            <div className="text-lg font-black text-slate-800 dark:text-slate-100 mt-0.5">{storageHealth.usedFormatted}</div>
            <div className="text-[11px] text-emerald-600 font-medium">An toàn ({storageHealth.percentUsage}% / 3.5MB)</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: VPS RAM Simulated */}
        <div className="bg-white/95 dark:bg-slate-900/95 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tải RAM VPS</div>
            <div className="text-lg font-black text-slate-800 dark:text-slate-100 mt-0.5">{storageHealth.vpsRamSimulated.usedMb} MB / 2 GB</div>
            <div className="text-[11px] text-emerald-600 font-medium">Tải cực nhẹ ({storageHealth.vpsRamSimulated.percent}%)</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Data Keys */}
        <div className="bg-white/95 dark:bg-slate-900/95 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trạng Thái VPS</div>
            <div className="text-lg font-black text-emerald-600 mt-0.5">Tối Ưu & Ổn Định</div>
            <div className="text-[11px] text-slate-400 font-mono">Bảo vệ chống sập: BẬT</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Vacuum CTA */}
        <div className="bg-gradient-to-br from-[#0875D9] to-[#043d8a] p-4 rounded-2xl text-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-100">Bảo Vệ & Tối Ưu VPS</span>
            <RefreshCw className="w-4 h-4 text-blue-200" />
          </div>
          <button
            type="button"
            onClick={handleVacuumVPS}
            className="mt-2 w-full py-2 px-3 bg-white hover:bg-blue-50 text-[#0875D9] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Dọn Dẹp Rác & Tối Ưu VPS</span>
          </button>
        </div>
      </div>

      {/* Role Switcher Grid: Test từng cấp bậc */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#0875D9]" />
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
              Chọn Cấp Bậc / Phòng Ban Để Kiểm Thử (1-Click Switch)
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Chuyển ngay vai trò mà không cần đăng xuất
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roleCards.map(card => {
            const emp = employees.find(e => e.id === card.sampleId) || employees[0];
            const isCurrent = currentUser.id === emp.id;

            return (
              <div
                key={card.sampleId}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-blue-50/70 dark:bg-slate-800/80 border-[#0875D9] ring-2 ring-[#0875D9]/20 shadow-md'
                    : 'bg-white/95 dark:bg-slate-900/95 border-slate-200/80 dark:border-slate-800 hover:border-blue-300'
                }`}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${card.color}20`, color: card.color }}>
                        {card.badge}
                      </span>
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm mt-1.5">
                        {card.title}
                      </h3>
                    </div>

                    <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-xs shrink-0">
                      {emp.avatar ? (
                        <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center font-bold text-xs">
                          {emp.name.slice(0, 2)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Employee detail */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-0.5 text-xs">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{emp.name}</div>
                    <div className="text-slate-500 font-mono text-[11px]">{emp.email}</div>
                    <div className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                      <span>🎂 Sinh nhật: {emp.birthDate || 'Chưa cập nhật'}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Switch button */}
                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                  {isCurrent ? (
                    <div className="w-full py-2 px-3 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
                      <CheckCircle className="w-4 h-4" />
                      <span>Đang Kiểm Thử Cấp Bậc Này</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSwitchUser(emp)}
                      className="w-full py-2 px-3 bg-[#0875D9] hover:bg-[#065eb0] active:scale-[0.98] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <span>Mô Phỏng Cấp Bậc Này</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature & Permissions Matrix Table */}
      <div className="bg-white/95 dark:bg-slate-900/95 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#0875D9]" />
              <span>Ma Trận Phân Quyền & Kiểm Thử Chi Tiết Từng Chức Năng</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Đối soát quyền truy cập thực tế giữa 6 khối phòng ban theo quy chuẩn Mrex Agency.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <th className="py-3 px-3 font-bold text-slate-600 dark:text-slate-300">Chức Năng Hệ Thống</th>
                <th className="py-3 px-3 font-bold text-[#0875D9]">Ban Giám Đốc</th>
                <th className="py-3 px-3 font-bold text-sky-600">Sản Xuất & Kho</th>
                <th className="py-3 px-3 font-bold text-emerald-600">Nhân Sự & HC</th>
                <th className="py-3 px-3 font-bold text-blue-600">IT & SEO</th>
                <th className="py-3 px-3 font-bold text-pink-600">Social Media</th>
                <th className="py-3 px-3 font-bold text-amber-600">TT Nội Bộ</th>
                <th className="py-3 px-3 font-bold text-slate-500 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {featureMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-extrabold text-slate-800 dark:text-slate-200">
                    {item.feature}
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{item.ceo}</td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{item.production}</td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{item.hr}</td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{item.itSeo}</td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{item.social}</td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{item.internalComms}</td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => setActiveTab(item.tabId)}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0875D9] text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      Mở Test
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
