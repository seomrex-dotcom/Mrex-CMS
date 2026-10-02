import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TaskPriority, TaskStatus, Task, TaskAssignmentType } from '../../types';
import {
  Plus,
  Search,
  Filter,
  Kanban,
  List,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Layers,
  MessageSquare,
  Lock,
  Shield,
  UserCheck,
  Users,
  User,
  FileText,
  TrendingUp,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { NewTaskModal } from './NewTaskModal';
import { TaskDetailModal } from './TaskDetailModal';

export const TasksView: React.FC = () => {
  const {
    tasks,
    departments,
    employees,
    updateTaskStatus,
    updateTask,
    deleteTask,
    selectedTaskId,
    setSelectedTaskId,
    currentUser,
    celebrate
  } = useApp();

  const isManagement = currentUser.role === 'CEO' || currentUser.role === 'MANAGER';
  const isEmployee = currentUser.role === 'EMPLOYEE';

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [mobileKanbanTab, setMobileKanbanTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskType, setNewTaskType] = useState<TaskAssignmentType>('INDIVIDUAL');
  const [taskTypeFilter, setTaskTypeFilter] = useState<'ALL' | 'TEAM' | 'INDIVIDUAL'>('ALL');

  // Auto-archive completed tasks: at midnight (or on mount if already past midnight), remove tasks
  // that were completed more than 24h ago
  useEffect(() => {
    const archiveOldCompletedTasks = () => {
      const now = Date.now();
      const ARCHIVE_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours
      tasks.forEach(t => {
        if (t.status === 'COMPLETED' && t.completedAt) {
          const completedMs = new Date(t.completedAt).getTime();
          if (now - completedMs > ARCHIVE_AFTER_MS) {
            // After 24h: delete from active list
            deleteTask(t.id);
          }
        }
      });
    };

    // Run on mount
    archiveOldCompletedTasks();

    // Run every minute to catch midnight boundary
    const interval = setInterval(archiveOldCompletedTasks, 60000);
    return () => clearInterval(interval);
  }, [tasks]); // eslint-disable-line

  // Scope filter:
  // For Employee: 'MY_TASKS' (default & primary) or 'ALL_DEPT'
  // For Management: 'ALL' (default) | 'ASSIGNED_BY_ME' | 'ASSIGNED_TO_ME' | 'MEMBER'
  const [employeeScope, setEmployeeScope] = useState<'MY_TASKS' | 'ALL_DEPT'>('MY_TASKS');
  const [managementScope, setManagementScope] = useState<'ALL' | 'ASSIGNED_BY_ME' | 'ASSIGNED_TO_ME' | 'MEMBER'>('ALL');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');

  // Employee's own tasks
  const myTasks = useMemo(() => {
    return tasks.filter(t => t.assigneeId === currentUser.id || Boolean(t.assigneeIds && t.assigneeIds.includes(currentUser.id)));
  }, [tasks, currentUser.id]);

  // Tasks assigned by currentUser (if management)
  const teamTasksCount = useMemo(() => tasks.filter(t => t.assignmentType === 'TEAM').length, [tasks]);
  const individualTasksCount = useMemo(() => tasks.filter(t => t.assignmentType !== 'TEAM').length, [tasks]);

  const tasksAssignedByMe = useMemo(() => {
    return tasks.filter(t => t.reporterId === currentUser.id);
  }, [tasks, currentUser.id]);

  // Stats for employee
  const myCompleted = myTasks.filter(t => t.status === 'COMPLETED').length;
  const myInProgress = myTasks.filter(t => t.status === 'IN_PROGRESS').length;
  const myReview = myTasks.filter(t => t.status === 'REVIEW').length;
  const myTodo = myTasks.filter(t => t.status === 'TODO').length;
  const myAvgProgress = myTasks.length > 0
    ? Math.round(myTasks.reduce((acc, t) => acc + t.progress, 0) / myTasks.length)
    : 0;

  // Filter tasks based on role and scope
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // 1. Role-based Scope Filtering ("Mỗi thành viên hiển thị công việc riêng")
      if (isEmployee) {
        if (employeeScope === 'MY_TASKS') {
          // Employee strictly views their own assigned tasks
          if (task.assigneeId !== currentUser.id && !task.assigneeIds?.includes(currentUser.id)) return false;
        }
      } else {
        // Management Scope
        if (managementScope === 'ASSIGNED_BY_ME') {
          if (task.reporterId !== currentUser.id) return false;
        } else if (managementScope === 'ASSIGNED_TO_ME') {
          if (task.assigneeId !== currentUser.id && !task.assigneeIds?.includes(currentUser.id)) return false;
        } else if (managementScope === 'MEMBER' && selectedMemberId !== 'all') {
          if (task.assigneeId !== selectedMemberId) return false;
        }
      }

      // 2. Search query
      // Task Assignment Type Filter (Team vs Individual)
      if (taskTypeFilter === 'TEAM' && task.assignmentType !== 'TEAM') return false;
      if (taskTypeFilter === 'INDIVIDUAL' && task.assignmentType === 'TEAM') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const assignee = employees.find(e => e.id === task.assigneeId);
        const match =
          task.title.toLowerCase().includes(q) ||
          task.description.toLowerCase().includes(q) ||
          (assignee && assignee.name.toLowerCase().includes(q)) ||
          task.tags.some(t => t.toLowerCase().includes(q));
        if (!match) return false;
      }

      // 3. Department filter
      if (filterDepartment !== 'all' && task.departmentId !== filterDepartment) return false;

      // 4. Priority filter
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;

      return true;
    });
  }, [
    tasks,
    isEmployee,
    employeeScope,
    currentUser.id,
    managementScope,
    selectedMemberId,
    searchQuery,
    employees,
    filterDepartment,
    filterPriority
  ]);

  const columns: { id: TaskStatus; label: string; count: number; color: string }[] = [
    {
      id: 'TODO',
      label: 'Cần làm (To Do)',
      count: filteredTasks.filter(t => t.status === 'TODO').length,
      color: 'bg-slate-100 text-slate-700 border-slate-200'
    },
    {
      id: 'IN_PROGRESS',
      label: 'Đang thực hiện (In Progress)',
      count: filteredTasks.filter(t => t.status === 'IN_PROGRESS').length,
      color: 'bg-blue-50 text-[#0875D9] border-blue-200'
    },
    {
      id: 'REVIEW',
      label: 'Chờ duyệt / Nghiệm thu (Review)',
      count: filteredTasks.filter(t => t.status === 'REVIEW').length,
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      id: 'COMPLETED',
      label: 'Đã hoàn thành (Done)',
      count: filteredTasks.filter(t => t.status === 'COMPLETED').length,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
  ];

  const getPriorityLabel = (priority: TaskPriority) => {
    switch (priority) {
      case 'URGENT': return { text: 'Khẩn cấp', color: 'text-red-600 bg-red-50 border-red-200' };
      case 'HIGH': return { text: 'Ưu tiên cao', color: 'text-amber-700 bg-amber-50 border-amber-200' };
      case 'MEDIUM': return { text: 'Trung bình', color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'LOW': return { text: 'Thấp', color: 'text-slate-500 bg-slate-50 border-slate-200' };
    }
  };

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'TODO') return 'IN_PROGRESS';
    if (current === 'IN_PROGRESS') return 'REVIEW';
    if (current === 'REVIEW') return 'COMPLETED';
    return null;
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'COMPLETED') return 'REVIEW';
    if (current === 'REVIEW') return 'IN_PROGRESS';
    if (current === 'IN_PROGRESS') return 'TODO';
    return null;
  };

  const selectedMemberObj = employees.find(e => e.id === selectedMemberId);

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#063B78]">
              {isEmployee ? 'Nhiệm Vụ & Công Việc Của Tôi' : 'Giao Việc & Quản Lý Dự Án'}
            </h1>
            {isManagement ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-[#0875D9] bg-[#EAF5FF] px-2.5 py-0.5 rounded-full border border-[#0875D9]/20">
                <Shield className="w-3 h-3" /> Ban Quản Trị · Quyền Giao Việc
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                <UserCheck className="w-3 h-3 text-[#0875D9]" /> Cấp Nhân Viên · Thực Hiện
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            {isEmployee
              ? 'Tập trung thực hiện nhiệm vụ được giao, cập nhật tiến độ và nộp sản phẩm nghiệm thu'
              : 'Điều phối nhiệm vụ phòng ban, giao việc cho nhân viên và theo dõi tiến độ sprint'}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* View mode toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold transition-all min-h-[38px] cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-[#0875D9] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bảng </span>Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold transition-all min-h-[38px] cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-[#0875D9] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Danh Sách</span>
            </button>
          </div>

          {/* Action button based on Permission:
              Only CEO and MANAGER can assign tasks to employees */}
          {isManagement ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setNewTaskType('TEAM');
                  setShowNewTaskModal(true);
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#0875D9] hover:bg-[#065eb0] rounded-xl shadow-xs hover:shadow-md transition-all min-h-[40px] cursor-pointer"
                title="Giao việc cho cả Phòng ban / Đội nhóm cùng phối hợp"
              >
                <Users className="w-4 h-4" />
                <span>Giao Việc Team</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNewTaskType('INDIVIDUAL');
                  setShowNewTaskModal(true);
                }}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#0875D9] to-[#0B4FA8] hover:from-[#0B4FA8] hover:to-[#063B78] rounded-xl shadow-xs hover:shadow-md transition-all min-h-[40px] cursor-pointer"
                title="Chỉ định giao việc cho từng nhân sự cụ thể"
              >
                <User className="w-4 h-4" />
                <span>Giao Việc Cá Nhân</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setNewTaskType('INDIVIDUAL');
                setShowNewTaskModal(true);
              }}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0875D9] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl shadow-2xs transition-all min-h-[40px] cursor-pointer"
              title="Tự lập công việc cá nhân cần làm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Việc Cá Nhân Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Scope Banner: Tailored for Employee or Management */}
      {isEmployee ? (
        /* Employee Personal Work Space Banner */
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#EAF5FF]/90 via-white to-blue-50/60 border border-[#0875D9]/25 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-[#0875D9] ring-offset-2 ring-offset-white shadow-xs"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white">
                  ✓
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-[#063B78]">
                    Không Gian Công Việc Riêng: {currentUser.name}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0875D9] text-white">
                    {currentUser.roleTitle}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chế độ hiển thị việc riêng: Bạn đang xem các nhiệm vụ được Ban Quản Trị & Quản Lý giao cho bạn.
                </p>
              </div>
            </div>

            {/* Employee Scope Tabs */}
            <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setEmployeeScope('MY_TASKS')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  employeeScope === 'MY_TASKS'
                    ? 'bg-[#0875D9] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Việc Riêng Của Tôi ({myTasks.length})
              </button>
              <button
                type="button"
                onClick={() => setEmployeeScope('ALL_DEPT')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  employeeScope === 'ALL_DEPT'
                    ? 'bg-[#0875D9] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Xem Toàn Bộ ({tasks.length})
              </button>
            </div>
          </div>

          {/* Quick Metrics of Personal Tasks */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-[#0875D9]/15 text-xs">
            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100">
              <div className="text-[11px] text-slate-500">Tổng việc được giao</div>
              <div className="text-base font-bold text-[#063B78] font-mono mt-0.5">{myTasks.length} nhiệm vụ</div>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100">
              <div className="text-[11px] text-slate-500">Cần làm</div>
              <div className="text-base font-bold text-slate-700 font-mono mt-0.5">{myTodo}</div>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100">
              <div className="text-[11px] text-blue-600 font-medium">Đang thực hiện</div>
              <div className="text-base font-bold text-[#0875D9] font-mono mt-0.5">{myInProgress}</div>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100">
              <div className="text-[11px] text-amber-600 font-medium">Chờ nghiệm thu</div>
              <div className="text-base font-bold text-amber-600 font-mono mt-0.5">{myReview}</div>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-100">
              <div className="text-[11px] text-emerald-600 font-medium">Đã xong ({myAvgProgress}%)</div>
              <div className="text-base font-bold text-emerald-600 font-mono mt-0.5">{myCompleted}</div>
            </div>
          </div>
        </div>
      ) : (
        /* Management Scope Filter: "Mỗi thành viên hiển thị công việc riêng" */
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#063B78] uppercase tracking-wider">
                Chế độ xem & Lọc công việc:
              </span>
            </div>

            {/* Scope Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setManagementScope('ALL');
                  setSelectedMemberId('all');
                }}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  managementScope === 'ALL'
                    ? 'bg-[#0875D9] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Tất Cả Công Việc ({tasks.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  setManagementScope('ASSIGNED_BY_ME');
                  setSelectedMemberId('all');
                }}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  managementScope === 'ASSIGNED_BY_ME'
                    ? 'bg-[#0875D9] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Việc Tôi Đã Giao ({tasksAssignedByMe.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  setManagementScope('ASSIGNED_TO_ME');
                  setSelectedMemberId('all');
                }}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  managementScope === 'ASSIGNED_TO_ME'
                    ? 'bg-[#0875D9] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Việc Giao Cho Tôi ({myTasks.length})
              </button>

              {/* Specific Member Selector */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <span className="text-slate-500 font-medium text-[11px] hidden sm:inline">
                  Xem việc riêng từng thành viên:
                </span>
                <select
                  value={managementScope === 'MEMBER' ? selectedMemberId : 'all'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'all') {
                      setManagementScope('ALL');
                      setSelectedMemberId('all');
                    } else {
                      setManagementScope('MEMBER');
                      setSelectedMemberId(val);
                    }
                  }}
                  className="px-2.5 py-1.5 bg-[#EAF5FF] border border-[#0875D9]/30 text-[#063B78] rounded-xl font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9]/30"
                >
                  <option value="all">-- Chọn nhân viên để xem việc riêng --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.roleTitle})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* If a specific member is selected */}
          {managementScope === 'MEMBER' && selectedMemberObj && (
            <div className="p-3 bg-gradient-to-r from-blue-50/70 to-indigo-50/50 border border-blue-200 rounded-xl flex items-center justify-between text-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-2.5">
                <img
                  src={selectedMemberObj.avatar}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-[#0875D9]"
                />
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Đang xem công việc riêng của: {selectedMemberObj.name}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-[#0875D9] text-white">
                      {selectedMemberObj.roleTitle}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Tổng số: {filteredTasks.length} nhiệm vụ được phân công
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setManagementScope('ALL');
                  setSelectedMemberId('all');
                }}
                className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold underline cursor-pointer"
              >
                Bỏ lọc thành viên
              </button>
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white border border-slate-200/80 rounded-2xl text-xs shadow-2xs">
        <div className="relative w-full sm:max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm công việc, mô tả, thẻ, nhân sự..."
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0875D9]/30 transition-all min-h-[40px]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-slate-500 font-medium">Khối/Phòng:</span>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none min-h-[38px]"
            >
              <option value="all">Tất cả phòng ban</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-slate-500 font-medium">Ưu tiên:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none min-h-[38px]"
            >
              <option value="all">Tất cả</option>
              <option value="URGENT">Khẩn cấp</option>
              <option value="HIGH">Ưu tiên cao</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="LOW">Thấp</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Kanban Tab Selector (shown only on mobile/tablet) */}
      {viewMode === 'kanban' && (
        <div className="xl:hidden flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs">
          <button
            onClick={() => setMobileKanbanTab('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 min-h-[38px] ${
              mobileKanbanTab === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Tất cả ({filteredTasks.length})
          </button>
          {columns.map(col => (
            <button
              key={col.id}
              onClick={() => setMobileKanbanTab(col.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 min-h-[38px] ${
                mobileKanbanTab === col.id ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              {col.label.split(' (')[0]} ({col.count})
            </button>
          ))}
        </div>
      )}

      {/* Main Task View: Kanban or List */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {columns.map(col => {
            if (mobileKanbanTab !== 'ALL' && mobileKanbanTab !== col.id) {
              return null; // hide on mobile if not active tab
            }
            const colTasks = filteredTasks.filter(t => t.status === col.id);
            return (
              <div
                key={col.id}
                className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 space-y-3 min-h-[360px]"
              >
                {/* Column header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{col.label}</span>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-lg shadow-2xs">
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards container */}
                <div className="space-y-3">
                  {colTasks.map(task => {
                    const assignee = employees.find(e => e.id === task.assigneeId);
                    const reporter = employees.find(e => e.id === task.reporterId);
                    const dept = departments.find(d => d.id === task.departmentId);
                    const pri = getPriorityLabel(task.priority);
                    const nextSt = getNextStatus(task.status);
                    const prevSt = getPrevStatus(task.status);
                    const completedSubs = task.subtasks.filter(s => s.completed).length;

                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className="bg-white border border-slate-200/80 hover:border-[#0875D9]/40 hover:shadow-md rounded-xl p-3.5 shadow-2xs transition-all space-y-3 group cursor-pointer"
                      >
                        {/* Top: Priority & Department */}
                        <div className="flex items-center justify-between gap-1.5 text-[10px]">
                          <span className={`px-2 py-0.5 rounded-md font-semibold border ${pri.color}`}>
                            {pri.text}
                          </span>
                          <span className="text-slate-400 font-medium truncate max-w-[120px]">
                            {dept?.name}
                          </span>
                        </div>

                        {/* Assignment Type Badge */}
                        {task.assignmentType === 'TEAM' ? (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#EAF5FF] border border-[#0875D9]/25/80 text-[#0B4FA8] rounded-md font-semibold text-[10px] w-fit">
                            <Users className="w-3 h-3 text-[#0875D9] shrink-0" />
                            <span>Việc Team: {task.teamName || dept?.name || 'Team'}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-md font-semibold text-[10px] w-fit">
                            <User className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>Cá nhân: {assignee?.name || 'Nhân sự'}</span>
                          </div>
                        )}

                        {/* Title & Description */}
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 group-hover:text-[#0875D9] transition-colors line-clamp-2">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Google Docs Deliverables tag if present */}
                        {task.googleDocsUrl && (
                          <div className="flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50/80 px-2 py-1 rounded-lg border border-blue-200/60 font-medium">
                            <FileText className="w-3 h-3 text-blue-600 shrink-0" />
                            <span className="truncate">Đã nộp Google Docs</span>
                          </div>
                        )}

                        {/* Progress Bar & Subtasks count */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-slate-400" />
                              <span>{completedSubs}/{task.subtasks.length}</span>
                            </span>
                            <span className="font-mono font-bold text-[#0875D9]">{task.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-[#0875D9] to-[#39A9FF] h-full transition-all duration-300"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* People: Assignee (Performer) & Reporter (Assigner) */}
                        <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                          {/* Assignee */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 min-w-0" title={`Người thực hiện: ${assignee?.name}`}>
                              <img
                                src={assignee?.avatar}
                                alt=""
                                referrerPolicy="no-referrer"
                                className="w-5 h-5 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                              <span className="text-[11px] font-semibold text-slate-800 truncate max-w-[100px]">
                                {assignee?.name}
                              </span>
                            </div>

                            {/* Stage shift buttons */}
                            <div className="flex items-center gap-0.5">
                              {prevSt && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateTaskStatus(task.id, prevSt);
                                  }}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                                  title="Chuyển về trạng thái trước"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {nextSt && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateTaskStatus(task.id, nextSt);
                                    if (nextSt === 'COMPLETED') celebrate();
                                  }}
                                  className="p-1 hover:bg-blue-50 rounded text-[#0875D9] hover:text-[#063B78] cursor-pointer"
                                  title="Chuyển sang trạng thái tiếp theo"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Reporter display */}
                          <div className="text-[10px] text-slate-400 flex items-center justify-between">
                            <span className="truncate">
                              Giao bởi: <strong className="text-slate-600">{reporter?.name?.split(' ').slice(-1)[0]}</strong>
                            </span>
                            {task.comments.length > 0 && (
                              <span className="flex items-center gap-0.5 text-slate-400">
                                <MessageSquare className="w-3 h-3" />
                                <span className="font-mono text-[10px]">{task.comments.length}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl text-xs">
                      Không có công việc ở trạng thái này
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List / Spreadsheet View */
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Tên công việc & Thẻ</th>
                  <th className="py-3 px-3">Phòng ban</th>
                  <th className="py-3 px-3">Người thực hiện</th>
                  <th className="py-3 px-3">Người giao việc</th>
                  <th className="py-3 px-3">Trạng thái</th>
                  <th className="py-3 px-3">Ưu tiên</th>
                  <th className="py-3 px-3 font-mono">Hạn chót</th>
                  <th className="py-3 px-3 font-mono text-right">Tiến độ</th>
                  <th className="py-3 px-4 text-right">Giờ công</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map(task => {
                  const assignee = employees.find(e => e.id === task.assigneeId);
                  const reporter = employees.find(e => e.id === task.reporterId);
                  const dept = departments.find(d => d.id === task.departmentId);
                  const pri = getPriorityLabel(task.priority);

                  return (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 truncate hover:text-[#0875D9] transition-colors">
                          {task.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                          <span>{task.tags.join(', ')}</span>
                          {task.googleDocsUrl && (
                            <span className="text-[10px] text-blue-600 font-semibold">· 📄 Docs</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {dept?.name}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={assignee?.avatar}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-6 h-6 rounded-full object-cover border border-slate-200"
                          />
                          <span className="font-semibold text-slate-800">{assignee?.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{reporter?.name}</span>
                          <span className="text-[10px] text-[#0875D9]">({reporter?.role})</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-1 rounded-md text-[11px] font-semibold ${
                          task.status === 'TODO' ? 'bg-slate-100 text-slate-700' :
                          task.status === 'IN_PROGRESS' ? 'bg-blue-50 text-[#0875D9]' :
                          task.status === 'REVIEW' ? 'bg-amber-50 text-amber-700' :
                          'bg-emerald-50 text-emerald-700'
                        }`}>
                          {task.status === 'TODO' ? 'Cần làm' :
                           task.status === 'IN_PROGRESS' ? 'Đang thực hiện' :
                           task.status === 'REVIEW' ? 'Chờ duyệt' : 'Hoàn thành'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`font-semibold ${
                          task.priority === 'URGENT' ? 'text-red-600' : task.priority === 'HIGH' ? 'text-amber-600' : 'text-slate-500'
                        }`}>
                          {pri.text}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 tabular-nums">
                        {task.dueDate}
                      </td>
                      <td className="py-3 px-3 font-mono text-right font-bold text-[#0875D9] tabular-nums">
                        {task.progress}%
                      </td>
                      <td className="py-3 px-4 font-mono text-right text-slate-500 tabular-nums">
                        {task.actualHours}/{task.estimatedHours}h
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <NewTaskModal
        isOpen={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
      />

      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
};
