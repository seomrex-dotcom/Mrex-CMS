import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  CheckSquare,
  ArrowRight,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Laptop,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { OnlineUsersModal } from '../common/OnlineUsersModal';
import { Task } from '../../types';

interface Props {
  variant?: 'executive' | 'employee';
}

export const OnlineAndTasksWidget: React.FC<Props> = ({ variant = 'executive' }) => {
  const {
    employees,
    tasks,
    currentUser,
    setActiveTab,
    celebrate,
    onlineCount,
    activeCount,
    idleCount,
    offlineCount,
    presenceList,
    setSelectedTaskId
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Computations
  const totalEmployeesCount = employees.length > 0 ? employees.length : 45;

  // Realtime Personal Pending Tasks Calculation
  const isAssignedToMe = (t: Task) =>
    t.assigneeId === currentUser.id || Boolean(t.assigneeIds && t.assigneeIds.includes(currentUser.id));

  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED');
  const totalPendingCount = pendingTasks.length;

  const myPendingTasks = tasks.filter(t => isAssignedToMe(t) && t.status !== 'COMPLETED');
  const myPendingCount = myPendingTasks.length;

  // Urgent tasks: priority URGENT or HIGH or tagged with Khẩn cấp/Gấp
  const myUrgentTasks = myPendingTasks.filter(
    t =>
      t.priority === 'URGENT' ||
      t.priority === 'HIGH' ||
      t.tags?.some(tag => tag.toLowerCase().includes('khẩn') || tag.toLowerCase().includes('gấp'))
  );
  const myUrgentCount = myUrgentTasks.length;

  // When variant === 'employee', the status pills reflect personal tasks
  const targetTaskList = variant === 'employee' ? myPendingTasks : pendingTasks;
  const inProgressCount = targetTaskList.filter(t => t.status === 'IN_PROGRESS').length;
  const todoCount = targetTaskList.filter(t => t.status === 'TODO').length;
  const reviewCount = targetTaskList.filter(t => t.status === 'REVIEW').length;

  // Active avatars from online users
  const onlineEmployeeIds = presenceList.filter(p => p.status === 'ACTIVE' || p.status === 'IDLE').map(p => p.employeeId);
  const onlineAvatars = employees.filter(e => onlineEmployeeIds.includes(e.id)).slice(0, 5);

  return (
    <>
      <div
        className="relative overflow-hidden rounded-3xl p-5 border border-sky-200/70 shadow-lg shadow-sky-500/5 backdrop-blur-xl flex flex-col justify-between text-slate-800 transition-all hover:shadow-xl hover:-translate-y-0.5 group"
        style={{
          background: 'linear-gradient(145deg, rgba(240, 249, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 50%, rgba(244, 248, 255, 0.9) 100%)'
        }}
      >
        {/* Ambient Glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

        {/* Top Brand & Title with 3D Glass Icon */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-100/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-[#0875D9] shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-5 h-5 text-[#0875D9]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight truncate">
                  Trực Tuyến & Việc Cần Làm
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 block truncate">
                Cập nhật tức thời realtime
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-2.5 py-1 rounded-xl bg-[#0875D9]/10 hover:bg-[#0875D9]/20 text-[#0875D9] text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border border-[#0875D9]/25 shrink-0"
            title="Xem danh sách chi tiết nhân sự online"
          >
            <span>{onlineCount} Online</span>
            <ExternalLink className="w-3 h-3 text-[#0875D9]" />
          </button>
        </div>

        {/* SECTION 1: Số lượng User đang Online */}
        <div className="my-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#0875D9]" />
              <span className="text-xs font-bold text-slate-700">
                Nhân Sự Đang Trực Tuyến
              </span>
            </div>
            <div className="text-right">
              <span className="text-xl font-mono font-extrabold text-[#0875D9]">
                {onlineCount}
              </span>
              <span className="text-xs font-semibold text-slate-400 font-sans ml-1">
                / {totalEmployeesCount}
              </span>
            </div>
          </div>

          {/* Avatars Stack & Quick Label */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center -space-x-2">
              {onlineAvatars.map(emp => (
                <img
                  key={emp.id}
                  src={emp.avatar}
                  alt={emp.name}
                  referrerPolicy="no-referrer"
                  title={`${emp.name} (${emp.roleTitle}) - Đang online`}
                  className="w-7 h-7 rounded-full border-2 border-white object-cover ring-1 ring-[#0875D9]/40 shadow-xs"
                />
              ))}
              {onlineCount > 5 && (
                <div
                  onClick={() => setIsModalOpen(true)}
                  className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white text-[#0875D9] text-[10px] font-bold font-mono flex items-center justify-center cursor-pointer hover:bg-blue-200 shadow-xs"
                >
                  +{onlineCount - 5}
                </div>
              )}
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="text-[11px] text-[#0875D9] hover:underline font-bold transition-colors cursor-pointer"
            >
              Xem danh sách →
            </button>
          </div>

          {/* Realtime Status Sub-breakdown */}
          <div className="grid grid-cols-3 gap-1.5 pt-1 text-center text-[10px]">
            <div className="p-1 rounded-xl bg-emerald-50 border border-emerald-200/80">
              <span className="block text-emerald-700 font-mono font-bold text-xs">{activeCount}</span>
              <span className="text-emerald-800/80 truncate block text-[9px] font-medium">🟢 Thao tác</span>
            </div>
            <div className="p-1 rounded-xl bg-amber-50 border border-amber-200/80">
              <span className="block text-amber-700 font-mono font-bold text-xs">{idleCount}</span>
              <span className="text-amber-800/80 truncate block text-[9px] font-medium">🟡 Treo tab</span>
            </div>
            <div className="p-1 rounded-xl bg-slate-100 border border-slate-200/80">
              <span className="block text-slate-600 font-mono font-bold text-xs">{offlineCount}</span>
              <span className="text-slate-600 truncate block text-[9px] font-medium">⚪ Vắng</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 my-1" />

        {/* SECTION 2: Số lượng Công việc cần hoàn thành */}
        <div className="my-2 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-bold text-slate-700">
                {variant === 'employee' ? 'Công Việc Của Bạn Cần Làm' : 'Công Việc Cần Hoàn Thành'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xl font-mono font-extrabold text-amber-600">
                {variant === 'employee' ? myPendingCount : totalPendingCount}
              </span>
              <span className="text-xs font-semibold text-slate-400 font-sans ml-1">
                nhiệm vụ
              </span>
            </div>
          </div>

          {/* Urgent Callout if there are urgent tasks */}
          {variant === 'employee' && myUrgentCount > 0 && (
            <div className="p-2 rounded-xl bg-gradient-to-r from-red-500/10 via-rose-500/15 to-amber-500/10 border border-red-300/90 flex items-center justify-between gap-2 shadow-xs animate-pulse">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                <Flame className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] font-black text-red-700 truncate">
                    ⚡ {myUrgentCount} việc khẩn cấp cần xử lý!
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  if (myUrgentTasks[0]) setSelectedTaskId(myUrgentTasks[0].id);
                  setActiveTab('tasks');
                  celebrate();
                }}
                className="shrink-0 px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white text-[9px] font-extrabold rounded-md shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                Xử lý ngay
              </button>
            </div>
          )}

          {/* Task Status Breakdown Pills */}
          <div className="grid grid-cols-3 gap-1.5 pt-0.5 text-center text-[10px]">
            <div className="p-1 rounded-xl bg-amber-50 border border-amber-200">
              <span className="block text-amber-700 font-mono font-bold text-xs">{inProgressCount}</span>
              <span className="text-amber-800/80 truncate block text-[9px] font-medium">Đang làm</span>
            </div>
            <div className="p-1 rounded-xl bg-blue-50 border border-blue-200">
              <span className="block text-[#0875D9] font-mono font-bold text-xs">{todoCount}</span>
              <span className="text-blue-800/80 truncate block text-[9px] font-medium">Chờ làm</span>
            </div>
            <div className="p-1 rounded-xl bg-purple-50 border border-purple-200">
              <span className="block text-purple-700 font-mono font-bold text-xs">{reviewCount}</span>
              <span className="text-purple-800/80 truncate block text-[9px] font-medium">Chờ duyệt</span>
            </div>
          </div>
        </div>

        {/* Bottom Action Button (Accent Orange Gradient) */}
        <button
          onClick={() => {
            setActiveTab('tasks');
            celebrate();
          }}
          className="w-full mt-2 py-2 px-3 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition-all active:scale-98 cursor-pointer border border-white/20 hover:brightness-105"
          style={{ background: 'linear-gradient(25deg, #ee6a23 0%, #f9a533 100%)' }}
        >
          <span>Xem & Xử Lý Công Việc</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Online Users Detail Modal */}
      <OnlineUsersModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
