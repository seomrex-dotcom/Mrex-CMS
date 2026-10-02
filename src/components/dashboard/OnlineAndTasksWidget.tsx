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
  Laptop
} from 'lucide-react';
import { OnlineUsersModal } from '../common/OnlineUsersModal';

interface Props {
  variant?: 'executive' | 'employee';
}

export const OnlineAndTasksWidget: React.FC<Props> = ({ variant = 'executive' }) => {
  const { employees, tasks, currentUser, setActiveTab, celebrate, onlineCount, activeCount, idleCount, offlineCount, presenceList } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Computations
  const totalEmployeesCount = employees.length > 0 ? employees.length : 45;
  // Realtime online users

  // Pending tasks computation (status !== 'COMPLETED')
  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED');
  const totalPendingCount = pendingTasks.length;

  const myPendingTasks = tasks.filter(
    t => t.assigneeId === currentUser.id && t.status !== 'COMPLETED'
  );
  const myPendingCount = myPendingTasks.length;

  const inProgressCount = pendingTasks.filter(t => t.status === 'IN_PROGRESS').length;
  const todoCount = pendingTasks.filter(t => t.status === 'TODO').length;
  const reviewCount = pendingTasks.filter(t => t.status === 'REVIEW').length;

  // Active avatars from online users
  const onlineEmployeeIds = presenceList.filter(p => p.status === "ACTIVE" || p.status === "IDLE").map(p => p.employeeId);
  const onlineAvatars = employees.filter(e => onlineEmployeeIds.includes(e.id)).slice(0, 5);

  return (
    <>
      <div
        className="relative text-white rounded-2xl p-5 shadow-2xl border border-white/15 overflow-hidden flex flex-col justify-between backdrop-blur-2xl"
        style={{ background: 'linear-gradient(272deg, #00144b 0%, #003189 100%)' }}
      >
        {/* Top Brand & Title */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
              Trực Tuyến & Việc Cần Làm
            </h4>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-blue-100 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer border border-white/15 backdrop-blur-md"
            title="Xem danh sách chi tiết nhân sự online"
          >
            <span className="font-bold text-white">{onlineCount} Online</span>
            <ExternalLink className="w-3 h-3 text-amber-400" />
          </button>
        </div>

        {/* SECTION 1: Số lượng User đang Online */}
        <div className="my-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-300" />
              <span className="text-xs font-semibold text-blue-100">
                Nhân Sự Đang Trực Tuyến
              </span>
            </div>
            <div className="text-right">
              <span className="text-xl sm:text-2xl font-mono font-extrabold text-white">
                {onlineCount}
              </span>
              <span className="text-xs font-semibold text-blue-200 font-sans ml-1">
                / {totalEmployeesCount}
              </span>
            </div>
          </div>

          {/* Avatars Stack & Quick Label */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center -space-x-2">
              {onlineAvatars.map(emp => (
                <img
                  key={emp.id}
                  src={emp.avatar}
                  alt={emp.name}
                  referrerPolicy="no-referrer"
                  title={`${emp.name} (${emp.roleTitle}) - Đang online`}
                  className="w-7 h-7 rounded-full border-2 border-[#00144b] object-cover ring-1 ring-emerald-400/80"
                />
              ))}
              {onlineCount > 5 && (
                <div
                  onClick={() => setIsModalOpen(true)}
                  className="w-7 h-7 rounded-full bg-black/50 border-2 border-[#00144b] text-emerald-300 text-[10px] font-bold font-mono flex items-center justify-center cursor-pointer hover:bg-black/70"
                >
                  +{onlineCount - 5}
                </div>
              )}
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="text-[11px] text-amber-300 hover:text-white hover:underline font-semibold transition-colors cursor-pointer"
            >
              Xem danh sách →
            </button>
          </div>

          {/* Realtime Status Sub-breakdown */}
          <div className="grid grid-cols-3 gap-1.5 pt-1 text-center text-[10px]">
            <div className="p-1 rounded-lg bg-emerald-500/15 border border-emerald-400/20 backdrop-blur-md">
              <span className="block text-emerald-300 font-mono font-bold text-xs">{activeCount}</span>
              <span className="text-emerald-100/90 truncate block text-[9px]">🟢 Đang thao tác</span>
            </div>
            <div className="p-1 rounded-lg bg-amber-500/15 border border-amber-400/20 backdrop-blur-md">
              <span className="block text-amber-300 font-mono font-bold text-xs">{idleCount}</span>
              <span className="text-amber-100/90 truncate block text-[9px]">🟡 Treo tab</span>
            </div>
            <div className="p-1 rounded-lg bg-slate-500/20 border border-slate-400/20 backdrop-blur-md">
              <span className="block text-slate-300 font-mono font-bold text-xs">{offlineCount}</span>
              <span className="text-slate-200/90 truncate block text-[9px]">⚪ Vắng mặt</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 my-1" />

        {/* SECTION 2: Số lượng Công việc cần hoàn thành */}
        <div className="my-2 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-blue-100">
                {variant === 'employee' ? 'Công Việc Của Bạn Cần Làm' : 'Công Việc Cần Hoàn Thành'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xl sm:text-2xl font-mono font-extrabold text-amber-400">
                {variant === 'employee' ? myPendingCount : totalPendingCount}
              </span>
              <span className="text-xs font-semibold text-amber-200/90 font-sans ml-1">
                nhiệm vụ
              </span>
            </div>
          </div>

          {/* Task Status Breakdown Pills */}
          <div className="grid grid-cols-3 gap-1.5 pt-0.5 text-center text-[10px]">
            <div className="p-1.5 rounded-lg bg-white/10 border border-white/10 backdrop-blur-md">
              <span className="block text-amber-300 font-mono font-bold text-xs">{inProgressCount}</span>
              <span className="text-blue-100/80 truncate block">Đang làm</span>
            </div>
            <div className="p-1.5 rounded-lg bg-white/10 border border-white/10 backdrop-blur-md">
              <span className="block text-amber-400 font-mono font-bold text-xs">{todoCount}</span>
              <span className="text-blue-100/80 truncate block">Chờ làm</span>
            </div>
            <div className="p-1.5 rounded-lg bg-white/10 border border-white/10 backdrop-blur-md">
              <span className="block text-purple-300 font-mono font-bold text-xs">{reviewCount}</span>
              <span className="text-blue-100/80 truncate block">Chờ duyệt</span>
            </div>
          </div>
        </div>

        {/* Bottom Action Button (Accent Orange Gradient) */}
        <button
          onClick={() => {
            setActiveTab('tasks');
            celebrate();
          }}
          className="w-full mt-2 py-2 px-3 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/20 transition-all active:scale-98 cursor-pointer border border-white/20 hover:brightness-105"
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
