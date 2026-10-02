import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Megaphone,
  Bell,
  ChevronDown,
  UserCheck,
  UserCog,
  Clock,
  Sparkles,
  Shield,
  Menu,
  Users,
  CheckSquare,
  LogOut,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ArrowRight,
  X,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { EMPLOYEES } from '../../data/mockData';
import { OnlineUsersModal } from '../common/OnlineUsersModal';
import { Task } from '../../types';

interface Props {
  onOpenMobileMenu?: () => void;
}

export const HeaderMarquee: React.FC<Props> = ({ onOpenMobileMenu }) => {
  const {
    currentUser,
    setCurrentUser,
    announcements,
    tasks,
    employees,
    setActiveTab,
    openProfileModal,
    logout,
    celebrate,
    onlineCount,
    activeCount,
    idleCount,
    setSelectedTaskId
  } = useApp();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showOnlineModal, setShowOnlineModal] = useState(false);
  const [showTasksDropdown, setShowTasksDropdown] = useState(false);
  const [dismissedUrgentToast, setDismissedUrgentToast] = useState(false);

  // REALTIME PERSONAL TASKS CALCULATION:
  // Only tasks assigned to current logged in user that need resolving (status !== 'COMPLETED')
  const isAssignedToMe = (t: Task) =>
    t.assigneeId === currentUser.id || Boolean(t.assigneeIds && t.assigneeIds.includes(currentUser.id));

  const myPendingTasks = tasks.filter(t => isAssignedToMe(t) && t.status !== 'COMPLETED');
  const pendingTasksCount = myPendingTasks.length;

  // Urgent tasks: priority URGENT or HIGH or tagged with Khẩn cấp/Gấp
  const myUrgentTasks = myPendingTasks.filter(
    t =>
      t.priority === 'URGENT' ||
      t.priority === 'HIGH' ||
      t.tags?.some(tag => tag.toLowerCase().includes('khẩn') || tag.toLowerCase().includes('gấp'))
  );
  const urgentCount = myUrgentTasks.length;
  const topUrgentTask = myUrgentTasks[0];

  // Realtime Today's Birthdays calculation from employees
  const today = new Date();
  const curMo = String(today.getMonth() + 1).padStart(2, '0');
  const curDa = String(today.getDate()).padStart(2, '0');
  const todayDateStr = `${curMo}-${curDa}`;

  const todayBirthdayAnnouncements = employees
    .filter(e => e.birthDate && e.birthDate.endsWith(todayDateStr) && e.status !== 'INACTIVE')
    .map(e => ({
      id: `bday-${e.id}`,
      title: `🎂 Chúc mừng sinh nhật ${e.name} (${e.roleTitle || e.role}) hôm nay! 🎉 Chúc bạn tuổi mới ngập tràn hạnh phúc và thành công rực rỡ! ✨`,
      category: 'EVENT' as const
    }));

  // Marquee announcement items
  const baseMarquee = announcements.length > 0 ? announcements : [
    {
      id: 'm-1',
      title: 'Chào mừng quý cán bộ nhân viên đến với hệ thống Quản trị & Điều hành Mrex Agency.',
      category: 'POLICY'
    },
    {
      id: 'm-2',
      title: 'Văn phòng trụ sở: T17-31 Khu Manhattan Glory, Vinhomes Grand Park, Quận 9.',
      category: 'EVENT'
    }
  ];
  const marqueeItems = [...todayBirthdayAnnouncements, ...baseMarquee];

  return (
    <>
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 transition-all">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 h-12 flex items-center justify-between gap-2 sm:gap-4 overflow-visible">
          {/* Mobile Hamburger Menu Toggle */}
          <div className="flex md:hidden items-center shrink-0">
            <button
              onClick={onOpenMobileMenu}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer active:scale-95 transition-all"
              aria-label="Mở menu điều hướng"
            >
              <Menu className="w-5 h-5 text-[#0875D9]" />
            </button>
          </div>

          {/* Left: Tag + Live Marquee Ticker */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 flex-1 min-w-0 overflow-hidden">
            {/* Static Tag Badge - Outside Marquee Overflow */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF5FF] text-[#0875D9] text-[11px] font-bold shrink-0 border border-[#0875D9]/20 shadow-2xs z-10">
              <Megaphone className="w-3.5 h-3.5 animate-pulse text-[#0875D9]" />
              <span className="tracking-wide uppercase text-[10px] whitespace-nowrap">Bản Tin Nội Bộ</span>
            </div>

            {/* Separate Marquee Viewport with dedicated overflow-hidden and soft fade masks */}
            <div className="relative flex-1 overflow-hidden min-w-0 h-6 flex items-center">
              {/* Left soft fade mask to prevent clipping at badge boundary */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />

              {/* Scrolling track */}
              <div className="animate-marquee-track flex items-center gap-8 text-xs text-[#063B78] font-medium whitespace-nowrap cursor-pointer group">
                {marqueeItems.map((item, idx) => (
                  <span
                    key={`a-${item.id}-${idx}`}
                    onClick={() => {
                      if (String(item.id).startsWith('bday-')) {
                        setActiveTab('chat');
                        celebrate();
                      } else {
                        setActiveTab('announcements');
                      }
                    }}
                    className="flex items-center gap-2 hover:text-[#0875D9] transition-colors"
                  >
                    <span className="text-[#16C784] font-bold">●</span>
                    <span className="truncate max-w-[600px]">{item.title}</span>
                  </span>
                ))}
              </div>

              {/* Right soft fade mask */}
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />
            </div>
          </div>

          {/* Right: Online Users, Pending Tasks (Nổi Bật / Khẩn Cấp), Role Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Live Online Users Badge */}
            <button
              onClick={() => setShowOnlineModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-white/80 hover:bg-white text-slate-700 rounded-xl text-[11px] font-semibold transition-all border border-slate-200/80 shadow-xs cursor-pointer backdrop-blur-md"
              title="Nhấn để xem danh sách nhân sự đang trực tuyến"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Users className="w-3.5 h-3.5 text-[#0875D9]" />
              <span className="font-mono font-bold text-slate-900">{onlineCount}</span>
              <span className="hidden md:inline text-slate-500">Online</span>
              <span className="text-[10px] text-slate-400 font-mono hidden lg:inline">
                (🟢 {activeCount} • 🟡 {idleCount})
              </span>
            </button>

            {/* VIỆC CẦN LÀM - NỔI BẬT & CẢNH BÁO KHẨN CẤP REALTIME */}
            <div className="relative">
              {urgentCount > 0 ? (
                /* URGENT STATE: FIERY GLOWING ALERT BUTTON */
                <button
                  onClick={() => { setShowTasksDropdown(!showTasksDropdown); setDismissedUrgentToast(true); }}
                  className="relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 text-white rounded-xl text-[11px] font-extrabold transition-all cursor-pointer active:scale-95 shadow-md shadow-rose-500/30 ring-2 ring-rose-400/80 animate-pulse bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:brightness-110"
                  title={`Bạn có ${pendingTasksCount} việc cá nhân cần giải quyết (${urgentCount} việc KHẨN CẤP)!`}
                >
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-90"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  <Flame className="w-3.5 h-3.5 text-amber-200 animate-bounce" />
                  <span className="font-mono text-white font-black text-xs">{pendingTasksCount}</span>
                  <span className="hidden sm:inline text-white/95">Việc Cần Làm</span>
                  <span className="bg-white/25 px-1.5 py-0.2 rounded-full text-[9px] font-black text-white tracking-wider flex items-center gap-0.5">
                    ⚡ {urgentCount} Khẩn
                  </span>
                </button>
              ) : pendingTasksCount > 0 ? (
                /* ACTIVE NORMAL STATE: VIBRANT GLOWING BLUE PILL */
                <button
                  onClick={() => { setShowTasksDropdown(!showTasksDropdown); setDismissedUrgentToast(true); }}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 text-white rounded-xl text-[11px] font-bold transition-all shadow-[0_4px_14px_rgba(8,117,217,0.35)] ring-1 ring-blue-300/50 cursor-pointer active:scale-95 bg-gradient-to-r from-[#0875D9] via-[#0066CC] to-[#2590F6] hover:brightness-105"
                  title={`Bạn có ${pendingTasksCount} việc cá nhân cần giải quyết`}
                >
                  <CheckSquare className="w-3.5 h-3.5 text-white" />
                  <span className="font-mono text-white font-extrabold text-xs">{pendingTasksCount}</span>
                  <span className="hidden sm:inline text-white/95">Việc Cần Làm</span>
                </button>
              ) : (
                /* ALL DONE ZERO STATE */
                <button
                  onClick={() => { setShowTasksDropdown(!showTasksDropdown); setDismissedUrgentToast(true); }}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1 bg-emerald-50/90 hover:bg-emerald-100/90 text-emerald-700 border border-emerald-200/80 rounded-xl text-[11px] font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
                  title="Bạn đã hoàn thành tất cả công việc cá nhân!"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-mono font-bold">0</span>
                  <span className="hidden sm:inline">Việc Cần Làm</span>
                </button>
              )}

              {/* Tasks Quick Popover Dropdown */}
              {showTasksDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowTasksDropdown(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white/98 backdrop-blur-2xl border border-slate-200/90 rounded-2xl shadow-2xl z-50 p-3 text-xs space-y-2 text-slate-800 animate-in zoom-in-95">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0875D9]">
                          <CheckSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">Việc Cá Nhân Cần Xử Lý</div>
                          <div className="text-[10px] text-slate-400">
                            Chỉ hiển thị việc giao riêng cho {currentUser.name}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-full bg-blue-100 text-[#0875D9]">
                        {pendingTasksCount} việc
                      </span>
                    </div>

                    {/* Urgent Warning Header Banner in Dropdown */}
                    {urgentCount > 0 && (
                      <div className="p-2.5 rounded-xl bg-gradient-to-r from-red-500/10 via-rose-500/15 to-amber-500/10 border border-red-300 flex items-center gap-2.5 animate-pulse">
                        <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                          <Flame className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-extrabold text-red-700">
                            Cảnh báo: Có {urgentCount} việc khẩn cấp!
                          </div>
                          <div className="text-[10px] text-red-600/90 truncate">
                            Ưu tiên giải quyết ngay để không trễ tiến độ dự án
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Task List */}
                    <div className="max-h-72 overflow-y-auto space-y-1.5 pr-0.5">
                      {myPendingTasks.length > 0 ? (
                        myPendingTasks.map(task => {
                          const isUrgent =
                            task.priority === 'URGENT' ||
                            task.tags?.some(t => t.toLowerCase().includes('khẩn') || t.toLowerCase().includes('gấp'));
                          const isHigh = task.priority === 'HIGH';

                          return (
                            <div
                              key={task.id}
                              onClick={() => {
                                setSelectedTaskId(task.id);
                                setActiveTab('tasks');
                                setShowTasksDropdown(false);
                                celebrate();
                              }}
                              className={`p-2.5 rounded-xl border transition-all text-left cursor-pointer hover:shadow-sm ${
                                isUrgent
                                  ? 'bg-rose-50/70 border-rose-300/80 hover:bg-rose-50'
                                  : isHigh
                                  ? 'bg-amber-50/50 border-amber-200 hover:bg-amber-50'
                                  : 'bg-slate-50/80 border-slate-200/80 hover:bg-blue-50/60 hover:border-blue-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <div className="font-bold text-slate-800 text-[11px] line-clamp-2 hover:text-[#0875D9] transition-colors">
                                  {task.title}
                                </div>
                                <span
                                  className={`shrink-0 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${
                                    isUrgent
                                      ? 'bg-red-600 text-white border-red-700 animate-pulse'
                                      : isHigh
                                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                                      : 'bg-blue-50 text-[#0875D9] border-blue-200'
                                  }`}
                                >
                                  {isUrgent ? '⚡ KHẨN' : isHigh ? 'CAO' : 'TB'}
                                </span>
                              </div>

                              {/* Meta: Due date & status */}
                              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  <span>Hạn: {task.dueDate}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-semibold text-slate-700">
                                    {task.progress}%
                                  </span>
                                  <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        isUrgent ? 'bg-red-500' : 'bg-[#0875D9]'
                                      }`}
                                      style={{ width: `${task.progress}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-6 text-center text-slate-500 space-y-1">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                          <div className="font-bold text-slate-700 text-xs">Không có việc tồn đọng</div>
                          <div className="text-[10px] text-slate-400">
                            Bạn đã hoàn tất mọi việc cần giải quyết hôm nay.
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Button: Navigate to tasks */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setActiveTab('tasks');
                          setShowTasksDropdown(false);
                          celebrate();
                        }}
                        className="w-full py-1.5 px-3 bg-[#0875D9] hover:bg-[#0066CC] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all"
                      >
                        <span>Mở Mục Giao Việc & Dự Án</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 bg-white/80 hover:bg-white text-slate-700 rounded-xl text-[11px] font-semibold transition-all border border-slate-200/80 shadow-xs backdrop-blur-md cursor-pointer"
                title="Thông tin tài khoản"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-4 h-4 rounded-full object-cover shrink-0 ring-1 ring-slate-200 sm:hidden"
                />
                <UserCheck className="hidden sm:inline w-3.5 h-3.5 text-[#0875D9]" />
                <span className="hidden sm:inline truncate max-w-[120px] font-semibold">{currentUser.name}</span>
                <span className="font-mono text-[10px] text-[#0875D9] font-bold">
                  ({currentUser.role})
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Switch Dropdown */}
              {showRoleDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowRoleDropdown(false)}
                  />
                  <div
                    className="absolute right-0 top-full mt-1.5 w-64 bg-white/95 backdrop-blur-2xl border border-white/90 rounded-2xl shadow-2xl z-50 p-2 text-xs space-y-1 text-slate-800 animate-in zoom-in-95"
                  >
                    {/* Current User Summary on Mobile/Desktop */}
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 mb-1">
                      <div className="font-bold text-slate-900 truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-[#0875D9] font-semibold">{currentUser.roleTitle}</div>
                      <div className="text-[10px] text-slate-400 truncate">{currentUser.email}</div>
                    </div>

                    <button
                      id="btn-header-profile"
                      type="button"
                      onClick={() => {
                        setShowRoleDropdown(false);
                        openProfileModal();
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-left hover:bg-[#EAF5FF] text-[#0875D9] font-bold text-xs cursor-pointer border border-[#0875D9]/20 bg-[#EAF5FF]/40 mb-1"
                    >
                      <UserCog className="w-4 h-4 text-[#0875D9]" />
                      <span>Cài Đặt Thông Tin Cá Nhân</span>
                    </button>

                    {/* Chuyển Tài Khoản Nhân Sự */}
                    <div className="hidden md:block pt-1 border-t border-slate-100">
                      <div className="px-2 py-1.5 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        Chuyển Tài Khoản Nhân Sự
                      </div>

                      <div className="max-h-56 overflow-y-auto space-y-0.5">
                        {employees.map(emp => (
                          <button
                            key={emp.id}
                            onClick={() => {
                              setCurrentUser(emp);
                              setShowRoleDropdown(false);
                              celebrate();
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors text-left cursor-pointer ${
                              currentUser.id === emp.id
                                ? 'bg-[#0875D9]/12 text-[#0875D9] font-bold border border-[#0875D9]/20'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={emp.avatar}
                                alt={emp.name}
                                className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                              />
                              <div className="truncate">
                                <div className="truncate font-semibold text-xs">{emp.name}</div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {emp.roleTitle}
                                </div>
                              </div>
                            </div>
                            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0 ml-1 font-semibold">
                              {emp.role}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Đăng xuất tài khoản */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowRoleDropdown(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-left hover:bg-rose-50 text-rose-600 font-semibold text-xs cursor-pointer border border-rose-100 mt-1"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Đăng Xuất</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Online Users Modal */}
        <OnlineUsersModal isOpen={showOnlineModal} onClose={() => setShowOnlineModal(false)} />
      </div>

      {/* FLOATING URGENT NOTIFICATION TOAST BANNER (HIỆN KHI CÓ VIỆC KHẨN CẤP) */}
      {urgentCount > 0 && !dismissedUrgentToast && topUrgentTask && (
        <aside
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Cảnh báo công việc khẩn cấp"
          className="fixed top-14 right-3 sm:right-6 z-50 max-w-sm sm:max-w-md w-[calc(100vw-1.5rem)] bg-white/95 backdrop-blur-2xl border-2 border-red-500 rounded-2xl shadow-2xl shadow-red-500/20 p-3.5 animate-in slide-in-from-top-4 duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-500/30 animate-pulse">
              <Flame className="w-5 h-5 text-amber-200" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wide text-red-600 flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                  </span>
                  Công Việc Khẩn Cấp Cần Xử Lý
                </span>
                <button
                  onClick={() => setDismissedUrgentToast(true)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                  title="Tạm ẩn thông báo"
                  aria-label="Đóng thông báo khẩn cấp"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="font-bold text-slate-900 text-xs mt-0.5 line-clamp-1">
                {topUrgentTask.title}
              </div>

              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                <span className="flex items-center gap-1 font-medium text-red-600">
                  <Clock className="w-3 h-3" />
                  Hạn chót: {topUrgentTask.dueDate}
                </span>
                <span>•</span>
                <span className="text-slate-500">Tiến độ: {topUrgentTask.progress}%</span>
              </div>

              <div className="flex items-center gap-2 mt-2.5">
                <button
                  onClick={() => {
                    setSelectedTaskId(topUrgentTask.id);
                    setActiveTab('tasks');
                    setDismissedUrgentToast(true);
                    celebrate();
                  }}
                  className="px-3 py-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold rounded-xl text-[11px] flex items-center gap-1.5 shadow-sm shadow-red-500/30 cursor-pointer active:scale-95 transition-all"
                >
                  <span>⚡ Xử lý ngay</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => {
                    setActiveTab('tasks');
                    setDismissedUrgentToast(true);
                  }}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-bold rounded-xl text-[11px] hover:bg-slate-100 cursor-pointer transition-all"
                >
                  Xem danh sách
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}
    </>
  );
};
