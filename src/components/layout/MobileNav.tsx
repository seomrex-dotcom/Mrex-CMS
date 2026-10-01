import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveNavTab, BackgroundTheme } from '../../types';

const BG_THEMES: { id: BackgroundTheme; label: string; preview: string }[] = [
  { id: 'modern_grid', label: 'Lưới Hiện Đại', preview: 'bg-slate-100 border-slate-300' },
  { id: 'soft_mesh', label: 'Gradient Mềm Mại', preview: 'bg-gradient-to-tr from-indigo-100 via-sky-50 to-purple-100 border-indigo-300' },
  { id: 'pure_white', label: 'Trắng Tinh Khiết', preview: 'bg-white border-slate-300' },
  { id: 'dark_executive', label: 'Xám Kỹ Thuật', preview: 'bg-slate-800 border-slate-700' },
];
import {
  LayoutDashboard,
  CalendarCheck,
  CheckSquare,
  FileText,
  TrendingUp,
  Receipt,
  Award,
  Briefcase,
  FileSpreadsheet,
  Boxes,
  BarChart3,
  Users,
  Megaphone,
  MessageSquare,
  Menu,
  X,
  Palette,
  LogOut,
  UserCheck
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { EMPLOYEES } from '../../data/mockData';

interface MobileNavProps {
  isDrawerOpen: boolean;
  onCloseDrawer: () => void;
  onOpenDrawer: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isDrawerOpen,
  onCloseDrawer,
  onOpenDrawer
}) => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    setCurrentUser,
    todayAttendance,
    leaveRequests,
    tasks,
    googleDocs,
    vouchers,
    warehouseItems,
    brandConfig,
    celebrate,
    logout,
    bgTheme,
    setBgTheme
  } = useApp();

  const myPendingTasksCount = tasks.filter(
    t => t.assigneeId === currentUser.id && t.status !== 'COMPLETED'
  ).length;

  const pendingLeavesCount = leaveRequests.filter(r => r.status === 'PENDING').length;
  const pendingDocsCount = googleDocs.filter(d => d.status === 'NEEDS_REVIEW').length;

  const bottomTabs: { id: ActiveNavTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Tổng Quan', icon: LayoutDashboard },
    {
      id: 'tasks',
      label: 'Công Việc',
      icon: CheckSquare,
      badge: myPendingTasksCount > 0 ? myPendingTasksCount : undefined
    },
    {
      id: 'attendance',
      label: 'Chấm Công',
      icon: CalendarCheck,
      badge: !todayAttendance?.checkIn ? 1 : undefined
    },
    { id: 'chat', label: 'Tin Nhắn', icon: MessageSquare },
  ];

  const navSections = [
    {
      title: 'Quản Trị & Điều Hành',
      items: [
        { id: 'dashboard' as ActiveNavTab, label: 'Tổng Quan Điều Hành', icon: LayoutDashboard },
        { id: 'reports' as ActiveNavTab, label: 'Báo Cáo Điều Hành', icon: BarChart3 },
        {
          id: 'board' as ActiveNavTab,
          label: 'Ban Quản Trị & Ngân Sách',
          icon: Award,
          visible: currentUser.role === 'CEO'
        },
        {
          id: 'workload' as ActiveNavTab,
          label: 'Điều Phối Team & Nghiệm Thu',
          icon: Briefcase,
          visible: currentUser.role === 'MANAGER' || currentUser.role === 'CEO'
        },
      ].filter(i => i.visible !== false)
    },
    {
      title: 'Vận Hành & Tài Chính',
      items: [
        { id: 'tasks' as ActiveNavTab, label: 'Giao Việc & Dự Án', icon: CheckSquare, badge: myPendingTasksCount > 0 ? myPendingTasksCount : undefined },
        { id: 'attendance' as ActiveNavTab, label: 'Chấm Công & Quản Lý Ca', icon: CalendarCheck, badge: pendingLeavesCount > 0 ? pendingLeavesCount : undefined },
        { id: 'chat' as ActiveNavTab, label: 'Nhắn Tin Toàn Công Ty', icon: MessageSquare },
        { id: 'finance' as ActiveNavTab, label: 'Sổ Quỹ Thu - Chi', icon: Receipt, badge: vouchers.length || undefined },
        {
          id: 'production' as ActiveNavTab,
          label: 'Sản Xuất & Kho Vận',
          icon: Boxes,
          badge: warehouseItems.filter(i => i.status !== 'IN_STOCK').length || undefined,
          visible: currentUser.role === 'CEO' || currentUser.role === 'MANAGER' || currentUser.departmentId === 'production' || (currentUser.roleTitle && (currentUser.roleTitle.toLowerCase().includes('kho') || currentUser.roleTitle.toLowerCase().includes('sản xuất')))
        },
      ].filter(i => i.visible !== false)
    },
    {
      title: 'Nhân Sự & Nội Dung',
      items: [
        { id: 'employees' as ActiveNavTab, label: 'Sơ Đồ & Danh Bạ Nhân Sự', icon: Users },
        { id: 'performance' as ActiveNavTab, label: 'Đánh Giá KPI / OKR', icon: TrendingUp },
        {
          id: 'payroll' as ActiveNavTab,
          label: 'Lương & Chốt Công Nhật',
          icon: FileSpreadsheet,
          visible: currentUser.role === 'HR' || currentUser.role === 'CEO'
        },
        { id: 'docs' as ActiveNavTab, label: 'Văn Bản & Content (Docs)', icon: FileText, badge: pendingDocsCount > 0 ? pendingDocsCount : undefined },
        { id: 'announcements' as ActiveNavTab, label: 'Bảng Tin Nội Bộ', icon: Megaphone },
      ].filter(i => i.visible !== false)
    }
  ];

  return (
    <>
      {/* 1. Fixed Bottom Navigation Bar on Mobile (< md) */}
      <nav
        aria-label="Điều hướng chính di động"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 h-16 flex items-center justify-around px-1 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)]"
      >
        {bottomTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] transition-all relative active:scale-95 ${
                isActive ? 'text-[#0875D9]' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.2] scale-110' : 'stroke-[1.8]'}`} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0875D9] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0875D9] ring-2 ring-white" />
                  </span>
                )}
              </div>
              <span className={`text-[10.5px] tracking-tight mt-1 truncate max-w-[64px] ${isActive ? 'font-bold text-[#0875D9]' : 'font-medium text-slate-500'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute top-1 w-8 h-0.5 rounded-full bg-[#0875D9]" />
              )}
            </button>
          );
        })}

        {/* Menu drawer trigger */}
        <button
          onClick={onOpenDrawer}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] transition-colors relative active:scale-95 ${
            isDrawerOpen || !bottomTabs.some(t => t.id === activeTab)
              ? 'text-[#0875D9] font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <Menu className={`w-5 h-5 ${isDrawerOpen ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
          </div>
          <span className={`text-[10px] tracking-tight mt-1 font-medium ${isDrawerOpen ? 'font-bold text-[#0875D9]' : ''}`}>Tất Cả</span>
        </button>
      </nav>

      {/* 2. Slide-out Mobile Navigation Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={onCloseDrawer}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Drawer content */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="p-4 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BrandLogo
                    logoType={brandConfig.logoType}
                    logoUrl={brandConfig.logoUrl}
                    symbolId={brandConfig.logoSymbolId}
                    primaryColor={brandConfig.primaryColorHex}
                    size="xs"
                  />
                  <span className="font-bold text-slate-900 text-sm">{brandConfig.companyName}</span>
                </div>
                <button
                  onClick={onCloseDrawer}
                  className="p-2 text-slate-400 hover:text-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
                  aria-label="Đóng menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Active User Card */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-slate-900 truncate">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{currentUser.roleTitle}</div>
                  <div className="text-[10px] text-[#0875D9] font-mono font-medium">{currentUser.code}</div>
                </div>
              </div>

              {/* Categorized Navigation Sections */}
              <div className="space-y-4">
                {navSections.map(sec => (
                  <div key={sec.title}>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-2">
                      {sec.title}
                    </div>
                    <nav className="space-y-0.5">
                      {sec.items.map(item => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              onCloseDrawer();
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-all min-h-[40px] ${
                              isActive
                                ? 'bg-[#EAF5FF] text-[#0875D9] font-bold shadow-2xs'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className={`w-4 h-4 ${isActive ? 'text-[#0875D9]' : 'text-slate-400'}`} />
                              <span>{item.label}</span>
                            </div>
                            {item.badge !== undefined && (
                              <span className="font-mono text-[10px] px-1.5 py-0.5 text-[#0875D9] bg-[#EAF5FF] rounded-md font-bold">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                ))}
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-2">
              <button
                onClick={() => {
                  onCloseDrawer();
                  logout();
                }}
                className="w-full py-2.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center justify-center gap-1.5 min-h-[44px] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất hệ thống</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};