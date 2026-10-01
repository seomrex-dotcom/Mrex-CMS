import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DepartmentId, Employee, UserRole } from '../../types';
import {
  Users,
  Building,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Search,
  UserCheck,
  Award,
  UserPlus,
  GitFork,
  LayoutGrid,
  Download,
  Edit3,
  DollarSign,
  Shield,
  Layers,
  ChevronRight,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  ShieldCheck,
  X
} from 'lucide-react';
import { EmployeeFormModal } from './EmployeeFormModal';
import { OrgChartView } from './OrgChartView';

export const EmployeesView: React.FC = () => {
  const {
    employees,
    departments,
    tasks,
    currentUser,
    setCurrentUser,
    celebrate
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'grid' | 'org_chart' | 'departments'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Permission check: only Board of Directors (CEO) and Managers (MANAGER) can edit personnel and org chart
  const canManageEmployees = currentUser.role === 'CEO' || currentUser.role === 'MANAGER';

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [defaultManagerId, setDefaultManagerId] = useState<string | undefined>(undefined);
  const [defaultDepartmentId, setDefaultDepartmentId] = useState<DepartmentId | undefined>(undefined);

  // View credentials modal state
  const [viewingCredentials, setViewingCredentials] = useState<Employee | null>(null);
  const [showCredentialsPass, setShowCredentialsPass] = useState(false);
  const [credsCopied, setCredsCopied] = useState(false);

  const handleCopyEmployeeCredentials = (emp: Employee) => {
    const pass = emp.password || '123456';
    const text = `THÔNG TIN TÀI KHOẢN ĐĂNG NHẬP AEUXGLOBAL:\n- Họ tên: ${emp.name}\n- Chức vụ: ${emp.roleTitle}\n- Email: ${emp.email}\n- Mật khẩu: ${pass}\n- Link đăng nhập: http://localhost:3000/`;
    navigator.clipboard.writeText(text);
    setCredsCopied(true);
    setTimeout(() => setCredsCopied(false), 2500);
  };

  const handleOpenAddModal = (managerId?: string, departmentId?: DepartmentId) => {
    if (!canManageEmployees) {
      alert('Quyền bị giới hạn: Chỉ Ban Quản Trị (CEO) và Cấp Quản Lý (PM/Lead) mới có quyền thêm nhân sự mới vào hệ thống.');
      return;
    }
    setEmployeeToEdit(null);
    setDefaultManagerId(managerId);
    setDefaultDepartmentId(departmentId);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    if (!canManageEmployees) {
      alert('Quyền bị giới hạn: Chỉ Ban Quản Trị (CEO) và Cấp Quản Lý (PM/Lead) mới có quyền sửa đổi hồ sơ nhân sự và cơ cấu sơ đồ.');
      return;
    }
    setEmployeeToEdit(emp);
    setDefaultManagerId(undefined);
    setDefaultDepartmentId(undefined);
    setIsModalOpen(true);
  };

  const handleExportCSV = () => {
    const headers = ['Mã NV', 'Họ Tên', 'Email', 'Điện Thoại', 'Phòng Ban', 'Chức Danh', 'Cấp Bậc', 'Lương Cơ Bản (VND)', 'Ngày Gia Nhập', 'Phép Còn Lại'];
    const rows = employees.map(e => {
      const dept = departments.find(d => d.id === e.departmentId);
      return [
        e.code,
        `"${e.name}"`,
        e.email,
        `"${e.phone}"`,
        `"${dept?.name || e.departmentId}"`,
        `"${e.roleTitle}"`,
        e.role,
        e.baseSalaryVND,
        e.joinDate,
        e.annualLeaveRemaining
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `danh_ba_nhan_su_omnicorp_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    celebrate();
  };

  const filteredEmployees = employees.filter(emp => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        emp.name.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.roleTitle.toLowerCase().includes(q) ||
        emp.code.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedDept !== 'all' && emp.departmentId !== selectedDept) return false;
    if (roleFilter !== 'all' && emp.role !== roleFilter) return false;
    return true;
  });

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              Sơ Đồ Tổ Chức & Quản Trị Nhân Sự
            </h1>
            <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              {employees.length} Thành Viên
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Quản lý hồ sơ nhân viên, phân cấp chức danh, thêm/sửa nhân sự và hiển thị sơ đồ cây chỉ huy
          </p>
        </div>

        {/* Primary Action Buttons & Permission Notice */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#EAF5FF] border border-[#0875D9]/25 text-[#063B78] rounded-xl text-xs font-semibold">
            <KeyRound className="w-3.5 h-3.5 text-[#0875D9]" />
            <span>Tự động cấp tài khoản đăng nhập (Email / Password)</span>
          </div>

          {!canManageEmployees && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-medium">
              <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Chỉ Ban Quản Trị & Quản Lý mới có quyền thêm/sửa nhân sự</span>
            </div>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs min-h-[40px]"
            title="Tải về danh bạ nhân sự file CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Xuất CSV</span>
          </button>

          {canManageEmployees ? (
            <button
              id="btn-add-employee" onClick={() => handleOpenAddModal()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 min-h-[40px]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm Nhân Sự Mới</span>
            </button>
          ) : (
            <button
              disabled
              className="px-3 py-2 bg-slate-100 border border-slate-200 text-slate-400 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-not-allowed min-h-[40px]"
              title="Chỉ Ban Quản Trị & Quản Lý mới có quyền thêm nhân sự"
            >
              <UserPlus className="w-4 h-4 text-slate-300" />
              <span className="hidden sm:inline">Thêm Nhân Sự (Khóa)</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('grid')}
          className={`py-2.5 px-4 border-b-2 flex items-center gap-2 transition-colors min-h-[44px] ${
            activeSubTab === 'grid'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Danh Bạ Thẻ ({employees.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('org_chart')}
          className={`py-2.5 px-4 border-b-2 flex items-center gap-2 transition-colors min-h-[44px] ${
            activeSubTab === 'org_chart'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <GitFork className="w-4 h-4" />
          <span>Sơ Đồ Cây Phân Cấp (Org Chart)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('departments')}
          className={`py-2.5 px-4 border-b-2 flex items-center gap-2 transition-colors min-h-[44px] ${
            activeSubTab === 'departments'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Cơ Cấu Phòng Ban ({departments.length})</span>
        </button>
      </div>

      {/* TAB 1: GRID DIRECTORY VIEW */}
      {activeSubTab === 'grid' && (
        <div className="space-y-4">
          {/* Departments Quick Filter Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {departments.map(dept => {
              const count = employees.filter(e => e.departmentId === dept.id).length;
              const isSelected = selectedDept === dept.id;

              return (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDept(isSelected ? 'all' : dept.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-slate-400 font-semibold">{dept.code}</span>
                    <span className="font-mono text-xs font-bold text-slate-800">{count}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate">{dept.name}</div>
                </button>
              );
            })}
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl text-xs shadow-xs">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên, chức danh, email hoặc mã nhân sự..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:bg-white min-h-[40px]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none min-h-[40px]"
              >
                <option value="all">Tất cả phòng ban</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none min-h-[40px]"
              >
                <option value="all">Tất cả cấp bậc</option>
                <option value="CEO">👑 Ban Quản Trị (CEO)</option>
                <option value="MANAGER">🛡️ Cấp Quản Lý (Lead)</option>
                <option value="HR">📋 Khối Nhân Sự (HR)</option>
                <option value="EMPLOYEE">💻 Cấp Nhân Viên</option>
              </select>
            </div>
          </div>

          {/* Employees Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map(emp => {
              const dept = departments.find(d => d.id === emp.departmentId);
              const manager = employees.find(m => m.id === emp.managerId);
              const empTasks = tasks.filter(t => t.assigneeId === emp.id);
              const activeTasksCount = empTasks.filter(t => t.status !== 'COMPLETED').length;
              const isCurrentActive = emp.id === currentUser.id;

              return (
                <div
                  key={emp.id}
                  className={`bg-white border rounded-2xl p-5 shadow-xs transition-all space-y-4 relative ${
                    isCurrentActive
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Card Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{emp.name}</h3>
                          {isCurrentActive && (
                            <span className="font-mono text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-200 shrink-0">
                              Bạn
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-medium text-indigo-700 truncate mt-0.5">
                          {emp.roleTitle}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {emp.code} · {dept?.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {canManageEmployees && (
                        <button
                          onClick={() => handleOpenEditModal(emp)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Chỉnh sửa hồ sơ nhân sự này (Ban Quản Trị & Quản Lý)"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        emp.role === 'CEO' ? 'bg-amber-100 text-amber-900' :
                        emp.role === 'MANAGER' ? 'bg-indigo-100 text-indigo-900' :
                        emp.role === 'HR' ? 'bg-emerald-100 text-emerald-900' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {emp.role}
                      </span>
                    </div>
                  </div>

                  {/* Contact info list */}
                  <div className="space-y-1.5 py-2.5 border-y border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{emp.phone}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Báo cáo:</span>
                        <span className="font-semibold text-slate-700 truncate max-w-[130px]">
                          {manager ? manager.name : 'Ban Giám Đốc'}
                        </span>
                      </div>
                      <span className="font-mono">{emp.joinDate}</span>
                    </div>
                  </div>

                  {/* Account Credentials Badge */}
                  <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#EAF5FF] to-white border border-[#0875D9]/20 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-[#0875D9]/15 flex items-center justify-center text-[#0875D9] shrink-0">
                        <KeyRound className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-slate-500 text-[10px] block font-semibold uppercase">Tài khoản đăng nhập</span>
                        <span className="font-mono text-[11px] font-bold text-[#063B78] truncate block">
                          {emp.email}
                        </span>
                      </div>
                    </div>

                    {canManageEmployees && (
                      <button
                        type="button"
                        onClick={() => {
                          setViewingCredentials(emp);
                          setShowCredentialsPass(false);
                        }}
                        className="px-2 py-1 bg-white hover:bg-blue-50 text-[#0875D9] border border-blue-200/80 rounded-lg text-[10.5px] font-bold transition-colors shrink-0 shadow-2xs cursor-pointer"
                        title="Xem tài khoản và mật khẩu đăng nhập"
                      >
                        Xem Pass
                      </button>
                    )}
                  </div>

                  {/* Workload & Leave balance */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-400 text-[10px] block">Đang làm:</span>
                      <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">{activeTasksCount} nhiệm vụ</div>
                    </div>

                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-400 text-[10px] block">Phép năm tồn:</span>
                      <div className="font-mono font-bold text-indigo-600 text-xs mt-0.5">
                        {emp.annualLeaveRemaining} ngày
                      </div>
                    </div>
                  </div>

                  {/* Action buttons: Switch role + Edit profile */}
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentUser(emp);
                        celebrate();
                      }}
                      className={`hidden md:flex flex-1 py-2 text-center text-xs font-semibold rounded-lg transition-colors items-center justify-center gap-1.5 min-h-[38px] ${
                        isCurrentActive
                          ? 'bg-slate-100 text-slate-500 cursor-default'
                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{isCurrentActive ? 'Đang kích hoạt' : 'Đăng nhập vai trò này'}</span>
                    </button>

                    {canManageEmployees && (
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(emp)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 min-h-[38px]"
                        title="Sửa thông tin hồ sơ nhân sự"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredEmployees.length === 0 && (
            <div className="p-10 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-700 text-sm">Không tìm thấy nhân sự phù hợp</div>
              <p className="text-xs text-slate-400">
                Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các tiêu chí lọc phòng ban.
              </p>
              <button
                onClick={() => handleOpenAddModal()}
                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg text-xs inline-flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Thêm nhân sự mới</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ORGANIZATIONAL CHART (ORG TREE) */}
      {activeSubTab === 'org_chart' && (
        <OrgChartView
          onEditEmployee={handleOpenEditModal}
          onAddSubordinate={(managerId, departmentId) => handleOpenAddModal(managerId, departmentId)}
        />
      )}

      {/* TAB 3: DEPARTMENTS BREAKDOWN & HEADCOUNT */}
      {activeSubTab === 'departments' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map(dept => {
              const deptMembers = employees.filter(e => e.departmentId === dept.id);
              const manager = employees.find(e => e.id === dept.managerId);
              const totalDeptPayroll = deptMembers.reduce((sum, e) => sum + e.baseSalaryVND, 0);

              return (
                <div
                  key={dept.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: dept.color }}
                        />
                        <h3 className="font-bold text-slate-900 text-sm">{dept.name}</h3>
                      </div>
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {dept.code}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Trưởng phòng / Quản lý:</span>
                        <span className="font-bold text-slate-800">{manager?.name || 'Chưa bổ nhiệm'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Định biên nhân sự:</span>
                        <span className="font-mono font-bold text-slate-900">{deptMembers.length} nhân viên</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Quỹ lương cơ bản:</span>
                        <span className="font-mono text-emerald-600 font-bold">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalDeptPayroll)}
                        </span>
                      </div>
                    </div>

                    {/* Member Avatars Stack */}
                    <div className="pt-2">
                      <span className="text-[11px] text-slate-400 block mb-1.5">Thành viên phòng ban:</span>
                      <div className="flex items-center -space-x-2 overflow-hidden py-1">
                        {deptMembers.map(member => (
                          <img
                            key={member.id}
                            src={member.avatar}
                            alt={member.name}
                            title={`${member.name} - ${member.roleTitle}`}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-xs"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {canManageEmployees && (
                    <div className="pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenAddModal(manager?.id, dept.id)}
                        className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Thêm nhân sự vào khối này</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Employee Add & Edit Modal */}
      <EmployeeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employeeToEdit={employeeToEdit}
        defaultManagerId={defaultManagerId}
        defaultDepartmentId={defaultDepartmentId}
      />

      {/* MODAL XEM & QUẢN LÝ TÀI KHOẢN NHÂN SỰ */}
      {viewingCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setViewingCredentials(null)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0875D9]/15 flex items-center justify-center text-[#0875D9]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Tài Khoản Đăng Nhập Hệ Thống</h3>
                  <p className="text-[11px] text-slate-500">{viewingCredentials.name} · {viewingCredentials.code}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingCredentials(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Email Đăng Nhập (Login ID):</span>
                <div className="font-mono text-xs font-bold text-[#0875D9] select-all">
                  {viewingCredentials.email}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Mật Khẩu Đăng Nhập:</span>
                  <button
                    type="button"
                    onClick={() => setShowCredentialsPass(!showCredentialsPass)}
                    className="text-[10px] text-[#0875D9] hover:underline font-semibold flex items-center gap-1"
                  >
                    {showCredentialsPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showCredentialsPass ? 'Ẩn' : 'Hiện'}</span>
                  </button>
                </div>
                <div className="font-mono text-sm font-bold text-slate-800 select-all">
                  {showCredentialsPass ? '•••••••••••• (Mã hóa SHA-256)' : '••••••••••••'}
                </div>
              </div>

              <div className="flex items-center justify-between px-1 text-xs">
                <span className="text-slate-500">Trạng thái tài khoản:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  viewingCredentials.accountStatus === 'LOCKED'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {viewingCredentials.accountStatus === 'LOCKED' ? 'Tạm Khóa' : 'Đang Hoạt Động'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleCopyEmployeeCredentials(viewingCredentials)}
                className="w-full py-2.5 px-4 bg-[#EAF5FF] hover:bg-[#d9ecff] text-[#0875D9] font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-xs border border-[#0875D9]/30"
              >
                {credsCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Đã Sao Chép Vào Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Sao Chép Thông Tin Gửi Cho Nhân Sự</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const emp = viewingCredentials;
                    setViewingCredentials(null);
                    handleOpenEditModal(emp);
                  }}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Đổi Mật Khẩu / Sửa Hồ Sơ
                </button>
                <button
                  type="button"
                  onClick={() => setViewingCredentials(null)}
                  className="py-2 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
