import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Briefcase,
  Lock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Plus,
  ArrowRight,
  ShieldCheck,
  Layers,
  ChevronRight
} from 'lucide-react';
import { NewTaskModal } from '../tasks/NewTaskModal';

export const WorkloadView: React.FC = () => {
  const {
    currentUser,
    tasks,
    updateTaskStatus,
    employees,
    departments,
    leaveRequests,
    approveLeaveRequest,
    attendanceRecords,
    setSelectedTaskId,
    setActiveTab,
    celebrate
  } = useApp();

  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    currentUser.departmentId === 'exec' ? 'exec' : currentUser.departmentId
  );

  const isManagement = currentUser.role === 'CEO' || currentUser.role === 'MANAGER';
  const deptEmployees = employees.filter(e => e.departmentId === selectedDeptId);
  const deptTasks = tasks.filter(t => t.departmentId === selectedDeptId);
  const reviewTasks = deptTasks.filter(t => t.status === 'REVIEW');
  const activeTasks = deptTasks.filter(t => t.status !== 'COMPLETED');

  // Employee workload metrics
  const memberWorkloads = deptEmployees.map(emp => {
    const memberTasks = tasks.filter(t => t.assigneeId === emp.id && t.status !== 'COMPLETED');
    const completedMemberTasks = tasks.filter(t => t.assigneeId === emp.id && t.status === 'COMPLETED');
    const totalEstHours = memberTasks.reduce((sum, t) => sum + t.estimatedHours, 0);

    let status: 'NORMAL' | 'OVERLOAD' | 'FREE' = 'NORMAL';
    if (memberTasks.length >= 3 || totalEstHours > 45) status = 'OVERLOAD';
    else if (memberTasks.length === 0) status = 'FREE';

    return {
      employee: emp,
      activeTasks: memberTasks,
      activeCount: memberTasks.length,
      completedCount: completedMemberTasks.length,
      totalEstHours,
      status
    };
  });

  // Department leave requests
  const deptLeaves = leaveRequests.filter(r =>
    deptEmployees.some(e => e.id === r.employeeId) && r.status === 'PENDING'
  );

  const currentDept = departments.find(d => d.id === selectedDeptId);

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 sm:pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              Điều Phối Tải Công Việc & Nghiệm Thu Phòng Ban
            </h1>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
              Cấp Quản Lý / PM
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Cân bằng khối lượng công việc, duyệt nghiệm thu sản phẩm bàn giao và phê duyệt đơn phép cấp phòng
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Department selector */}
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none min-h-[44px]"
          >
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {isManagement ? (
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors min-h-[44px] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Giao Việc Cho Team</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-100 rounded-lg border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Cấp Nhân Viên: Chỉ Thực Hiện</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
          <div className="text-xs text-slate-500">Quy mô nhân sự phòng</div>
          <div className="text-2xl font-mono font-bold text-slate-900">{deptEmployees.length} nhân sự</div>
          <div className="text-[11px] text-slate-400">{currentDept?.name}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
          <div className="text-xs text-slate-500">Đầu việc đang thực thi</div>
          <div className="text-2xl font-mono font-bold text-indigo-600">{activeTasks.length} task</div>
          <div className="text-[11px] text-slate-400">Đang chạy trong sprint</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
          <div className="text-xs text-slate-500">Chờ Quản lý nghiệm thu</div>
          <div className="text-2xl font-mono font-bold text-amber-600">{reviewTasks.length} task</div>
          <div className="text-[11px] text-slate-400">Cần review chất lượng</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
          <div className="text-xs text-slate-500">Đơn phép cấp phòng chờ duyệt</div>
          <div className="text-2xl font-mono font-bold text-rose-600">{deptLeaves.length} đơn</div>
          <div className="text-[11px] text-slate-400">Nghỉ phép & tăng ca OT</div>
        </div>
      </div>

      {/* Section 1: Tasks Awaiting Management Review (Nghiệm Thu) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              Công Việc Đã Hoàn Thành Chờ Nghiệm Thu (Review Pending)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Nhân viên đã bàn giao sản phẩm; Quản lý kiểm tra tiêu chuẩn DoD và bấm "Nghiệm Thu" để đóng task
            </p>
          </div>
          <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
            {reviewTasks.length} công việc
          </span>
        </div>

        {reviewTasks.length > 0 ? (
          <div className="space-y-2.5">
            {reviewTasks.map(t => {
              const assignee = employees.find(e => e.id === t.assigneeId);
              return (
                <div
                  key={t.id}
                  className="p-3.5 bg-amber-50/40 border border-amber-200/80 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-900">{t.title}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-mono text-indigo-700">{t.progress}%</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <img src={assignee?.avatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                      <span>Thực hiện: <strong>{assignee?.name}</strong></span>
                      <span>·</span>
                      <span>Hạn chót: {t.dueDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedTaskId(t.id);
                        setActiveTab('tasks');
                      }}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md"
                    >
                      Xem chi tiết
                    </button>

                    <button
                      onClick={() => {
                        updateTaskStatus(t.id, 'COMPLETED');
                        celebrate();
                      }}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs flex items-center gap-1.5 min-h-[38px]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ký Nghiệm Thu Đạt</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
            Hiện không có công việc nào đang chờ Quản lý nghiệm thu.
          </div>
        )}
      </div>

      {/* Section 2: Team Member Workload Balancer */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              Bảng Phân Bổ Tải Trọng Nhân Sự (Team Workload Balancer)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Phát hiện sớm nhân viên bị quá tải hoặc chưa nhận đủ việc để điều phối lại nhiệm vụ
            </p>
          </div>
          <span className="text-xs text-slate-500">Khối: {currentDept?.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {memberWorkloads.map(wl => {
            const isOverload = wl.status === 'OVERLOAD';
            const isFree = wl.status === 'FREE';

            return (
              <div
                key={wl.employee.id}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  isOverload
                    ? 'bg-rose-50/50 border-rose-200'
                    : isFree
                    ? 'bg-amber-50/40 border-amber-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={wl.employee.avatar}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="font-bold text-xs text-slate-900">{wl.employee.name}</div>
                      <div className="text-[10px] text-slate-500">{wl.employee.roleTitle}</div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                    isOverload
                      ? 'bg-rose-100 text-rose-700'
                      : isFree
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {isOverload ? 'QUÁ TẢI' : isFree ? 'ĐANG RẢNH' : 'BÌNH THƯỜNG'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Việc đang thực hiện:</span>
                    <span className="font-mono font-bold text-slate-900">{wl.activeCount} việc ({wl.totalEstHours}h)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Việc đã xong:</span>
                    <span className="font-mono font-bold text-emerald-600">{wl.completedCount} việc</span>
                  </div>
                </div>

                {/* Active tasks snippet */}
                {wl.activeTasks.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <div className="text-[10px] font-semibold text-slate-400">Các việc đang phụ trách:</div>
                    {wl.activeTasks.slice(0, 2).map(t => (
                      <div key={t.id} className="text-[11px] text-slate-700 truncate">
                        • {t.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Pending Department Leaves */}
      {deptLeaves.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900">
              Đơn Nghỉ Phép Cần Trưởng Phòng Phê Duyệt ({deptLeaves.length})
            </h3>
            <span className="text-[11px] text-slate-400">Cấp quản lý trực tiếp</span>
          </div>

          <div className="space-y-2">
            {deptLeaves.map(leave => (
              <div key={leave.id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">{leave.employeeName}</div>
                  <div className="text-slate-500">{leave.reason} ({leave.startDate} - {leave.totalDays} ngày)</div>
                </div>
                <button
                  onClick={() => {
                    approveLeaveRequest(leave.id, 'Trưởng bộ phận đồng ý duyệt');
                    celebrate();
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold text-xs min-h-[38px]"
                >
                  Duyệt Đơn
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <NewTaskModal
        isOpen={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
      />
    </div>
  );
};
