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
  LogOut
} from 'lucide-react';
import { EMPLOYEES } from '../../data/mockData';
import { OnlineUsersModal } from '../common/OnlineUsersModal';

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
    celebrate
  } = useApp();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showOnlineModal, setShowOnlineModal] = useState(false);

  const totalEmployeesCount = employees.length > 0 ? employees.length : 8;
  const onlineCount = Math.min(6, totalEmployeesCount);
  const pendingTasksCount = tasks.filter(t => t.status !== 'COMPLETED').length;

  // Marquee announcement items
  const marqueeItems = announcements.length > 0 ? announcements : [
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

  return (
    <div className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 transition-all">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 h-12 flex items-center justify-between gap-2 sm:gap-4 overflow-hidden">
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
            {/* First sequence */}
            {marqueeItems.map((item, idx) => (
              <span
                key={`a-${item.id}-${idx}`}
                onClick={() => setActiveTab('announcements')}
                className="flex items-center gap-2 hover:text-[#0875D9] transition-colors"
              >
                <span className="text-[#16C784] font-bold">•</span>
                <span className="truncate max-w-[600px]">{item.title}</span>
              </span>
            ))}

            {/* Repeated sequence for seamless infinite loop */}
            {marqueeItems.map((item, idx) => (
              <span
                key={`b-${item.id}-${idx}`}
                onClick={() => setActiveTab('announcements')}
                className="flex items-center gap-2 hover:text-[#0875D9] transition-colors"
              >
                <span className="text-[#16C784] font-bold">•</span>
                <span className="truncate max-w-[600px]">{item.title}</span>
              </span>
            ))}
            </div>

            {/* Right soft fade mask */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />
          </div>
        </div>

        {/* Right: Online Users, Pending Tasks, Role Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Live Online Users Badge */}
          <button
            onClick={() => setShowOnlineModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-white/80 hover:bg-white text-slate-700 rounded-xl text-[11px] font-semibold transition-all border border-slate-200/80 shadow-xs cursor-pointer backdrop-blur-md"
            title="Nhấn để xem danh sách nhân sự đang trực tuyến"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16C784] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16C784]"></span>
            </span>
            <Users className="w-3 h-3 text-[#0875D9]" />
            <span className="hidden sm:inline font-mono font-bold text-slate-900">{onlineCount}</span>
            <span className="hidden md:inline text-slate-500">Online</span>
          </button>

          {/* Pending Tasks Count Badge */}
          <button
            onClick={() => {
              setActiveTab('tasks');
              celebrate();
            }}
            className="flex items-center gap-1 px-2 sm:px-3 py-1 text-white rounded-xl text-[11px] font-bold transition-all shadow-xs cursor-pointer active:scale-95 bg-gradient-to-r from-[#0875D9] to-[#39A9FF]"
            title="Nhấn để xem danh sách công việc cần hoàn thành"
          >
            <CheckSquare className="w-3.5 h-3.5 text-white" />
            <span className="font-mono text-white font-extrabold">{pendingTasksCount}</span>
            <span className="hidden md:inline text-white/95">Việc Cần Làm</span>
          </button>

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

                  {/* Chuyển Tài Khoản Nhân Sự - CHỈ HIỂN THỊ TRÊN DESKTOP, ẨN HOÀN TOÀN TRÊN MOBILE */}
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
  );
};