import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Clock,
  RotateCcw,
  Sparkles,
  UserCheck,
  ChevronDown,
  LogOut,
  Shield,
  KeyRound,
  Palette,
  Check,
  Search,
  Megaphone
} from 'lucide-react';
import { EMPLOYEES } from '../../data/mockData';
import { BackgroundTheme } from '../../types';

const BG_THEMES: { id: BackgroundTheme; label: string; desc: string; preview: string }[] = [
  {
    id: 'modern_grid',
    label: 'Lưới Hiện Đại',
    desc: 'Nền Slate & vi lưới kỹ thuật công nghệ',
    preview: 'bg-slate-100 border-slate-300'
  },
  {
    id: 'soft_mesh',
    label: 'Gradient Mềm Mại',
    desc: 'Hào quang Indigo & Sky êm dịu, tinh tế',
    preview: 'bg-gradient-to-tr from-indigo-100 via-sky-50 to-purple-100 border-indigo-300'
  },
  {
    id: 'pure_white',
    label: 'Trắng Tinh Khiết',
    desc: 'Thuần khiết, tối giản, tương phản chuẩn mực',
    preview: 'bg-white border-slate-300'
  },
  {
    id: 'warm_zinc',
    label: 'Ấm Áp Thanh Lịch',
    desc: 'Tông kem linen dịu nhẹ bảo vệ mắt',
    preview: 'bg-stone-100 border-stone-300'
  },
  {
    id: 'dark_executive',
    label: 'Tối Đẳng Cấp',
    desc: 'Phong cách Midnight Studio sang trọng',
    preview: 'bg-slate-900 border-slate-700'
  }
];

export const Navbar: React.FC<{ onOpenMobileMenu?: () => void }> = ({ onOpenMobileMenu }) => {
  const {
    currentUser,
    setCurrentUser,
    activeTab,
    setActiveTab,
    todayAttendance,
    leaveRequests,
    announcements,
    resetToDefaultData,
    logout,
    bgTheme,
    setBgTheme
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);

  const pendingApprovalsCount = leaveRequests.filter(r => r.status === 'PENDING').length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3">
        {/* Zone 1: Single text element wordmark & mobile menu trigger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile hamburger menu */}
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            aria-label="Mở menu điều hướng"
          >
            <div className="space-y-1 w-4">
              <span className="block w-4 h-0.5 bg-slate-700 rounded-full" />
              <span className="block w-4 h-0.5 bg-slate-700 rounded-full" />
              <span className="block w-4 h-0.5 bg-slate-700 rounded-full" />
            </div>
          </button>

          {/* Mobile only logo */}
          <div className="flex md:hidden items-center gap-2">
            <div className="w-6 h-6 relative flex items-center justify-center">
              <span className="w-3.5 h-1.5 bg-emerald-500 rounded-full rotate-[-35deg] block" />
              <span className="w-3.5 h-1.5 bg-emerald-400 rounded-full rotate-[-35deg] block opacity-80" />
            </div>
            <span className="text-sm font-bold text-slate-900">AeuxGlobal</span>
          </div>

          {/* Desktop Search input & Live Date */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm kiếm chức năng, dữ liệu..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="hidden xl:flex items-center text-xs text-slate-400 pl-2 border-l border-slate-200 gap-1.5 font-mono tabular-nums">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Thứ Tư, 30/09/2026</span>
            </div>
          </div>
        </div>

        {/* Zone 2: Company Announcements Ticker (Thay thế hoàn toàn menu cũ theo yêu cầu người dùng) */}
        <div className="flex-1 overflow-hidden relative mx-3 max-w-2xl hidden md:flex items-center mask-marquee">
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <Megaphone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>THÔNG BÁO CÔNG TY:</span>
          </div>

          <div className="overflow-hidden relative flex-1 ml-2.5 h-6 flex items-center">
            <div className="animate-marquee-track flex items-center gap-6 text-xs text-slate-700 font-medium whitespace-nowrap cursor-pointer">
              {announcements.map((item, idx) => (
                <span
                  key={`nav-ann-${item.id}-${idx}`}
                  onClick={() => setActiveTab('announcements')}
                  className="flex items-center gap-1.5 hover:text-emerald-700 transition-colors"
                >
                  <span className="text-emerald-500 font-bold">●</span>
                  <span className="truncate max-w-[450px]">{item.title}</span>
                </span>
              ))}
              {/* Duplicate loop */}
              {announcements.map((item, idx) => (
                <span
                  key={`nav-ann-dup-${item.id}-${idx}`}
                  onClick={() => setActiveTab('announcements')}
                  className="flex items-center gap-1.5 hover:text-emerald-700 transition-colors"
                >
                  <span className="text-emerald-500 font-bold">●</span>
                  <span className="truncate max-w-[450px]">{item.title}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Zone 3: 1-2 primary actions & User Role Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Today Check-in status hint (desktop only) */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md">
            <span
              className={`w-2 h-2 rounded-full ${
                todayAttendance?.checkIn ? 'bg-emerald-500 ring-2 ring-emerald-100' : 'bg-amber-400'
              }`}
            />
            <span>
              {todayAttendance?.checkIn
                ? `Đã vào ${todayAttendance.checkIn.slice(0, 5)}`
                : 'Chưa chấm công hôm nay'}
            </span>
          </div>

          {/* Notifications button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Thông báo hệ thống"
            >
              <Bell className="w-4 h-4" />
              {pendingApprovalsCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900">Thông báo ({pendingApprovalsCount})</span>
                  <button
                    onClick={() => { setShowNotifications(false); setActiveTab('attendance'); }}
                    className="text-indigo-600 hover:underline"
                  >
                    Xem đơn từ
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {leaveRequests.slice(0, 4).map(req => (
                    <div
                      key={req.id}
                      className="p-3 hover:bg-slate-50 cursor-pointer"
                      onClick={() => { setShowNotifications(false); setActiveTab('attendance'); }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-slate-800">{req.employeeName}</span>
                        <span className="text-slate-400 font-mono text-[11px]">{req.createdAt.slice(5)}</span>
                      </div>
                      <p className="text-slate-500 truncate">{req.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Background Theme Selector - CHỈ DÀNH CHO BAN GIÁM ĐỐC (CEO) */}
          {currentUser.role === 'CEO' && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowThemePicker(!showThemePicker);
                  setShowNotifications(false);
                  setShowUserDropdown(false);
                }}
              className={`p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                showThemePicker
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Đổi màu nền & giao diện"
              aria-label="Chọn kiểu nền"
            >
              <Palette className="w-4 h-4" />
            </button>

            {showThemePicker && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Chọn Kiểu Nền (Background)</div>
                    <div className="text-[11px] text-slate-500">Font hệ thống: Inter (chuẩn quốc tế)</div>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-semibold uppercase">
                    Inter 100%
                  </span>
                </div>
                <div className="p-2 space-y-1">
                  {BG_THEMES.map(theme => {
                    const isSelected = bgTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => {
                          setBgTheme(theme.id);
                          setShowThemePicker(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg flex items-center gap-3 transition-colors ${
                          isSelected
                            ? 'bg-indigo-50/80 border border-indigo-200 text-indigo-950'
                            : 'hover:bg-slate-50 border border-transparent text-slate-700'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-md border flex items-center justify-center shrink-0 shadow-xs ${theme.preview}`}
                        >
                          {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold">{theme.label}</span>
                            {isSelected && (
                              <span className="text-[10px] text-indigo-600 font-medium">Đang dùng</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{theme.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          )}

          {/* Reset data button for testing (hidden on smallest screen) */}
          <button
            onClick={() => {
              if (confirm('Đặt lại toàn bộ dữ liệu mẫu ban đầu?')) {
                resetToDefaultData();
              }
            }}
            className="hidden sm:flex p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] items-center justify-center"
            title="Khôi phục dữ liệu mẫu mặc định"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-1.5 sm:gap-2 pl-1.5 pr-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors min-h-[40px]"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-slate-200"
              />
              <div className="text-left hidden sm:block max-w-[110px] md:max-w-[130px]">
                <div className="text-xs font-semibold text-slate-800 truncate">{currentUser.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{currentUser.roleTitle}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                    Chuyển tài khoản nhân sự
                  </span>
                  <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-semibold">
                    {currentUser.role}
                  </span>
                </div>
                <div className="py-1 max-h-72 overflow-y-auto">
                  {EMPLOYEES.map(emp => (
                    <button
                      key={emp.id}
                      onClick={() => {
                        setCurrentUser(emp);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors ${
                        emp.id === currentUser.id ? 'bg-indigo-50/70' : ''
                      }`}
                    >
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800 truncate">{emp.name}</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                            emp.role === 'CEO' ? 'bg-amber-100 text-amber-800' :
                            emp.role === 'MANAGER' ? 'bg-indigo-100 text-indigo-800' :
                            emp.role === 'HR' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {emp.role === 'CEO' ? 'Ban Quản Trị' :
                             emp.role === 'MANAGER' ? 'Quản Lý' :
                             emp.role === 'HR' ? 'Nhân Sự' : 'Nhân Viên'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 truncate block">{emp.roleTitle}</span>
                      </div>
                      {emp.id === currentUser.id && (
                        <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Logout row */}
                <div className="pt-1.5 mt-1 border-t border-slate-100 px-2">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg flex items-center justify-between transition-colors min-h-[40px]"
                  >
                    <span className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất (Về màn hình đăng nhập)</span>
                    </span>
                    <KeyRound className="w-3.5 h-3.5 text-rose-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
