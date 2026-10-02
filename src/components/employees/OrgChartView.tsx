import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee, DepartmentId } from '../../types';
import {
  Users,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Edit3,
  UserCheck,
  Building,
  Mail,
  Phone,
  Briefcase,
  Maximize2,
  Minimize2,
  Sparkles,
  Award,
  Layers,
  ArrowDown,
  Shield,
  Lock
} from 'lucide-react';

interface Props {
  onEditEmployee: (emp: Employee) => void;
  onAddSubordinate: (managerId: string, departmentId: DepartmentId) => void;
}

export const OrgChartView: React.FC<Props> = ({ onEditEmployee, onAddSubordinate }) => {
  const {
    employees,
    departments,
    currentUser,
    setCurrentUser,
    tasks,
    celebrate
  } = useApp();

  const canManageEmployees = currentUser.role === 'CEO' || currentUser.role === 'MANAGER';

  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  // Helper to toggle node collapse
  const toggleCollapse = (empId: string) => {
    setCollapsedNodes(prev => ({ ...prev, [empId]: !prev[empId] }));
  };

  const expandAll = () => setCollapsedNodes({});
  const collapseAll = () => {
    const allIds: Record<string, boolean> = {};
    employees.forEach(e => {
      // Collapse anyone who has subordinates
      const hasKids = employees.some(child => child.managerId === e.id);
      if (hasKids && e.role !== 'CEO') allIds[e.id] = true;
    });
    setCollapsedNodes(allIds);
  };

  // Identify root employees (no managerId, or CEO)
  const rootEmployees = employees.filter(e => !e.managerId || e.role === 'CEO');

  // Get direct subordinates of an employee
  const getSubordinates = (managerId: string) => {
    return employees.filter(e => {
      if (selectedDeptFilter !== 'all' && e.departmentId !== selectedDeptFilter && managerId !== employees.find(m => m.role === 'CEO')?.id) {
        return false;
      }
      return e.managerId === managerId;
    });
  };

  // Node Component for recursive or hierarchical tree rendering
  const renderEmployeeNode = (emp: Employee, depth: number = 0) => {
    const subordinates = getSubordinates(emp.id);
    const hasSubordinates = subordinates.length > 0;
    const isCollapsed = Boolean(collapsedNodes[emp.id]);
    const dept = departments.find(d => d.id === emp.departmentId);
    const activeTasks = tasks.filter(t => t.assigneeId === emp.id && t.status !== 'COMPLETED').length;
    const isCurrentUser = emp.id === currentUser.id;

    // Role styling
    let roleBadge = {
      label: 'Nhân Viên',
      color: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: '💻',
      cardBorder: 'border-slate-200'
    };

    if (emp.role === 'CEO') {
      roleBadge = {
        label: 'Ban Quản Trị / CEO',
        color: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
        icon: '👑',
        cardBorder: 'border-amber-400 ring-2 ring-amber-400/30'
      };
    } else if (emp.role === 'MANAGER') {
      roleBadge = {
        label: 'Cấp Quản Lý (Lead)',
        color: 'bg-blue-100 text-[#00144b] border-[#0875D9]/25 font-bold',
        icon: '🛡️',
        cardBorder: 'border-[#0875D9]/40'
      };
    } else if (emp.role === 'HR') {
      roleBadge = {
        label: 'Khối Nhân Sự (HR)',
        color: 'bg-emerald-100 text-emerald-900 border-emerald-200 font-bold',
        icon: '📋',
        cardBorder: 'border-emerald-300'
      };
    }

    return (
      <div key={emp.id} className="flex flex-col items-center">
        {/* Node Card */}
        <div
          className={`relative bg-white rounded-2xl shadow-sm border transition-all duration-200 p-4 w-72 sm:w-80 group hover:shadow-md ${
            roleBadge.cardBorder
          } ${isCurrentUser ? 'ring-2 ring-[#0875D9] bg-[#EAF5FF]/20' : ''}`}
        >
          {/* Top role header & code */}
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 ${roleBadge.color}`}>
              <span>{roleBadge.icon}</span>
              <span>{roleBadge.label}</span>
            </span>

            <span className="font-mono text-[10px] text-slate-400 font-medium">
              {emp.code}
            </span>
          </div>

          {/* Profile Details */}
          <div className="flex items-start gap-3 mt-3">
            <div className="relative shrink-0">
              <img
                src={emp.avatar}
                alt={emp.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
              />
              {isCurrentUser && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0875D9] text-white rounded-full flex items-center justify-center text-[9px] font-bold ring-2 ring-white">
                  ✓
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{emp.name}</h4>
              </div>
              <div className="text-[11px] font-medium text-[#0B4FA8] truncate mt-0.5">
                {emp.roleTitle}
              </div>
              <div className="text-[10px] text-slate-500 truncate font-sans">
                {dept?.name || 'Khối chung'}
              </div>
            </div>
          </div>

          {/* Meta statistics bar */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-mono">
            <div className="flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-slate-400" />
              <span>{activeTasks} việc đang làm</span>
            </div>
            <div className="text-right text-[#0875D9] font-semibold">
              {hasSubordinates ? `${subordinates.length} trực thuộc` : 'Thành viên'}
            </div>
          </div>

          {/* Node Action Tools */}
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
            {canManageEmployees ? (
              <>
                <button
                  onClick={() => onEditEmployee(emp)}
                  className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center gap-1"
                  title="Chỉnh sửa hồ sơ và phân cấp nhân sự"
                >
                  <Edit3 className="w-3 h-3 text-slate-500" />
                  <span>Sửa</span>
                </button>

                <button
                  onClick={() => onAddSubordinate(emp.id, emp.departmentId)}
                  className="py-1.5 px-2 bg-[#EAF5FF] hover:bg-blue-100 text-[#0B4FA8] rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                  title="Thêm nhân sự cấp dưới báo cáo cho người này"
                >
                  <UserPlus className="w-3 h-3 text-[#0875D9]" />
                  <span className="hidden sm:inline">Thêm cấp dưới</span>
                </button>
              </>
            ) : (
              <div className="flex-1 py-1.5 px-2 bg-slate-50 rounded-lg text-[10px] text-slate-400 text-center font-medium flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-slate-300" />
                <span>Chỉ xem nhánh này</span>
              </div>
            )}

            <button
              onClick={() => {
                setCurrentUser(emp);
                celebrate();
              }}
              disabled={isCurrentUser}
              className={`hidden md:flex py-1.5 px-2 rounded-lg text-[11px] transition-colors items-center justify-center ${
                isCurrentUser
                  ? 'bg-slate-100 text-slate-400 cursor-default'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
              title="Chuyển quyền đăng nhập sang người này (chỉ khả dụng trên máy tính)"
            >
              <UserCheck className="w-3 h-3 text-slate-500" />
            </button>
          </div>

          {/* Subordinates Collapse Toggle Button on bottom edge */}
          {hasSubordinates && (
            <button
              onClick={() => toggleCollapse(emp.id)}
              className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 bg-white border border-slate-300 hover:border-[#0875D9] hover:bg-[#EAF5FF] text-slate-600 hover:text-[#0875D9] rounded-full shadow-xs flex items-center justify-center text-xs transition-all z-10"
              title={isCollapsed ? 'Mở rộng cấp dưới' : 'Thu gọn cấp dưới'}
            >
              {isCollapsed ? (
                <span className="font-bold text-[11px] text-[#0875D9]">+{subordinates.length}</span>
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Children Sub-tree with connecting lines */}
        {hasSubordinates && !isCollapsed && (
          <div className="flex flex-col items-center w-full">
            {/* Vertical stem from parent */}
            <div className="w-0.5 h-7 bg-slate-300" />

            {/* Subordinates Row with horizontal connector */}
            <div className="relative flex items-start justify-center gap-6 sm:gap-8 pt-3">
              {/* Horizontal top bar spanning across children */}
              {subordinates.length > 1 && (
                <div
                  className="absolute top-0 left-12 right-12 h-0.5 bg-slate-300"
                />
              )}

              {subordinates.map((child, index) => (
                <div key={child.id} className="relative flex flex-col items-center">
                  {/* Vertical drop down from horizontal bar */}
                  <div className="w-0.5 h-3 bg-slate-300 -mt-3 mb-0" />
                  {renderEmployeeNode(child, depth + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Metrics summary
  const totalEmployees = employees.length;
  const managersCount = employees.filter(e => e.role === 'MANAGER' || e.role === 'CEO').length;
  const avgReports = managersCount > 0 ? (totalEmployees / managersCount).toFixed(1) : '0';

  return (
    <div className="space-y-4">
      {/* Top Controls & Strategic Metrics Toolbar */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Department filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            Lọc nhánh cây:
          </span>
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none font-medium"
          >
            <option value="all">Toàn bộ doanh nghiệp (Tất cả khối)</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Center: Hierarchy Stats */}
        <div className="hidden lg:flex items-center gap-4 text-slate-600 font-mono text-[11px] border-x border-slate-200 px-4">
          <div>
            <span>Tầng bậc: </span>
            <span className="font-bold text-slate-900">3 Cấp chỉ huy</span>
          </div>
          <div>
            <span>Quản lý & Trưởng khối: </span>
            <span className="font-bold text-[#0875D9]">{managersCount}</span>
          </div>
          <div>
            <span>Tỷ lệ span-of-control: </span>
            <span className="font-bold text-emerald-600">1 : {avgReports}</span>
          </div>
        </div>

        {/* Right: Expand/Collapse tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition-colors flex items-center gap-1 font-medium min-h-[36px]"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Mở rộng tất cả</span>
          </button>
          <button
            onClick={collapseAll}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition-colors flex items-center gap-1 font-medium min-h-[36px]"
          >
            <Minimize2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Thu gọn nhánh</span>
          </button>
        </div>
      </div>

      {/* Role Permission Guidance Banner */}
      {!canManageEmployees ? (
        <div className="p-3 bg-amber-50/90 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Chế độ chỉ xem sơ đồ:</strong> Bạn đang đăng nhập vai trò <strong>{currentUser.roleTitle}</strong> ({currentUser.role}). Quyền thêm nhân sự cấp dưới, sửa hồ sơ và điều chuyển cây phân cấp chỉ dành riêng cho <strong>Ban Quản Trị (CEO)</strong> và <strong>Cấp Quản Lý (PM/Lead)</strong>.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-2.5 bg-blue-50/80 border border-[#0875D9]/25 text-indigo-950 rounded-xl text-xs flex items-center gap-2 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#0875D9] shrink-0" />
          <span>
            <strong>Quyền Quản Trị Sơ Đồ Cây ({currentUser.role === 'CEO' ? 'Ban Quản Trị' : 'Cấp Quản Lý'}):</strong> Bạn có toàn quyền bấm <strong>"Sửa"</strong> để cập nhật hồ sơ hoặc <strong>"Thêm cấp dưới"</strong> trực tiếp trên từng nhánh chỉ huy.
          </span>
        </div>
      )}

      {/* Main Diagram Canvas with Pan / Horizontal Scroll */}
      <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-6 sm:p-10 overflow-x-auto min-h-[600px] shadow-inner relative flex justify-center">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

        <div className="relative z-10 py-4 flex flex-col items-center">
          {rootEmployees.map(root => renderEmployeeNode(root, 0))}
        </div>
      </div>

      {/* Legend & Instructions footer */}
      <div className="p-3 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-700">Chú giải cấp bậc:</span>
          <span className="flex items-center gap-1 font-medium text-amber-800">
            <span>👑</span> Ban Quản Trị / CEO
          </span>
          <span className="flex items-center gap-1 font-medium text-[#063B78]">
            <span>🛡️</span> Cấp Quản Lý / PM / Trưởng Phòng
          </span>
          <span className="flex items-center gap-1 font-medium text-emerald-800">
            <span>📋</span> Khối Nhân Sự & Hành Chính
          </span>
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <span>💻</span> Cấp Nhân Viên Chuyên Môn
          </span>
        </div>

        <div className="font-mono text-[10px] text-slate-400">
          Nhấp nút "Sửa" hoặc "+" trên mỗi thẻ để điều chỉnh sơ đồ
        </div>
      </div>
    </div>
  );
};
