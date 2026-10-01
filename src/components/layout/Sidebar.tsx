import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  Boxes,
  CalendarCheck,
  CheckSquare,
  TrendingUp,
  BarChart3,
  Users,
  Megaphone,
  Award,
  Briefcase,
  FileSpreadsheet,
  LogOut,
  UserCog,
  FileText,
  Receipt,
  HelpCircle,
  Sparkles,
  Shield
} from 'lucide-react';
import { ActiveNavTab } from '../../types';
import { BrandLogo } from '../common/BrandLogo';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    tasks,
    budgetApprovals,
    googleDocs,
    vouchers,
    warehouseItems,
    chatMessages,
    leaveRequests,
    brandConfig,
    logout,
    celebrate,
    openProfileModal
  } = useApp();

  const isExec = currentUser.role === 'CEO' || currentUser.role === 'MANAGER';
  const myTasks = tasks.filter(t => t.assigneeId === currentUser.id);
  const myDone = myTasks.filter(t => t.status === 'COMPLETED').length;
  const myTaskRate = myTasks.length > 0 ? Math.round((myDone / myTasks.length) * 100) : 0;

  const totalTasks = tasks.length;
  const totalCompleted = tasks.filter(t => t.status === 'COMPLETED').length;
  const totalTaskRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  const displayRate = isExec ? totalTaskRate : (myTasks.length > 0 ? myTaskRate : totalTaskRate);
  const displayDone = isExec ? totalCompleted : (myTasks.length > 0 ? myDone : totalCompleted);
  const displayTotal = isExec ? totalTasks : (myTasks.length > 0 ? myTasks.length : totalTasks);
  const displayPending = displayTotal - displayDone;

  const myPendingTasksCount = tasks.filter(
    t => t.assigneeId === currentUser.id && t.status !== 'COMPLETED'
  ).length;

  const pendingLeavesCount = leaveRequests.filter(r => r.status === 'PENDING').length;
  const pendingBudgetsCount = budgetApprovals.filter(b => b.status === 'PENDING').length;
  const pendingReviewsCount = tasks.filter(t => t.status === 'REVIEW').length;
  const pendingDocsCount = googleDocs.filter(d => d.status === 'NEEDS_REVIEW').length;

  const navItems: { id: ActiveNavTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'finance', label: 'Sổ Quỹ Thu - Chi', icon: Receipt, badge: vouchers.length },
    { id: 'chat', label: 'Chat Toàn Công Ty', icon: MessageSquare, badge: chatMessages.length > 0 ? chatMessages.length : undefined },
    { id: 'attendance', label: 'Chấm Công & Ca', icon: CalendarCheck, badge: pendingLeavesCount > 0 ? pendingLeavesCount : undefined },
    { id: 'tasks', label: 'Giao Việc & Dự Án', icon: CheckSquare, badge: myPendingTasksCount > 0 ? myPendingTasksCount : undefined },
    { id: 'docs', label: 'Văn Bản & Docs', icon: FileText, badge: pendingDocsCount > 0 ? pendingDocsCount : undefined },
    { id: 'performance', label: 'Đánh Giá KPI / OKR', icon: TrendingUp },
    { id: 'employees', label: 'Team Structure', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  const lowStockCount = warehouseItems.filter(i => i.status !== 'IN_STOCK').length;
  const canAccessProduction =
    currentUser.role === 'CEO' ||
    currentUser.role === 'MANAGER' ||
    currentUser.departmentId === 'production' ||
    (currentUser.roleTitle && (
      currentUser.roleTitle.toLowerCase().includes('kho') ||
      currentUser.roleTitle.toLowerCase().includes('sản xuất')
    ));

  // Specific role items
  const roleNavItems = [

    {
      id: 'production' as ActiveNavTab,
      label: 'Sản Xuất & Kho Vận',
      icon: Boxes,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      visible: canAccessProduction
    },
    {
      id: 'board' as ActiveNavTab,
      label: 'Ban Quản Trị & Ngân Sách',
      icon: Award,
      badge: pendingBudgetsCount > 0 ? pendingBudgetsCount : undefined,
      visible: currentUser.role === 'CEO'
    },
    {
      id: 'workload' as ActiveNavTab,
      label: 'Điều Phối Team & Review',
      icon: Briefcase,
      badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined,
      visible: currentUser.role === 'MANAGER' || currentUser.role === 'CEO'
    },
    {
      id: 'payroll' as ActiveNavTab,
      label: 'Lương & Chốt Công Nhật',
      icon: FileSpreadsheet,
      badge: undefined,
      visible: currentUser.role === 'HR' || currentUser.role === 'CEO'
    }
  ].filter(i => i.visible);

  const getSidebarClasses = () => {
    switch (brandConfig.sidebarTheme) {
      case 'midnight_slate':
        return {
          aside: 'bg-[#0f172a] text-white border-r border-[#1e293b]',
          style: undefined,
          active: 'bg-[#1e293b] text-white shadow-inner border border-slate-700/50',
          inactive: 'text-slate-300 hover:text-white hover:bg-slate-800/50',
          iconActive: 'text-indigo-400',
          iconInactive: 'text-slate-400',
          headerSub: 'text-slate-400',
          sectionHeader: 'text-slate-400/70',
          footer: 'border-t border-[#1e293b] bg-[#0a0f1d]',
          userSub: 'text-slate-400'
        };
      case 'charcoal_dark':
        return {
          aside: 'bg-[#18181b] text-white border-r border-[#27272a]',
          active: 'bg-[#27272a] text-white shadow-inner border border-zinc-600/40',
          inactive: 'text-zinc-300 hover:text-white hover:bg-zinc-800/50',
          iconActive: 'text-zinc-200',
          iconInactive: 'text-zinc-500',
          headerSub: 'text-zinc-400',
          sectionHeader: 'text-zinc-400/60',
          footer: 'border-t border-[#27272a] bg-[#111113]',
          userSub: 'text-zinc-400'
        };
      case 'glass_navy':
      default:
        return {
          aside: 'bg-white/70 backdrop-blur-2xl text-slate-800 border-r border-white/80 shadow-[0_8px_32px_rgba(30,90,150,0.06)] relative',
          style: undefined,
          active: 'bg-gradient-to-r from-[#0875D9]/15 to-[#39A9FF]/10 text-[#0875D9] font-bold border border-[#0875D9]/25 shadow-xs',
          inactive: 'text-slate-600 hover:text-[#0875D9] hover:bg-white/80',
          iconActive: 'text-[#0875D9]',
          iconInactive: 'text-slate-400',
          headerSub: 'text-slate-400',
          sectionHeader: 'text-slate-400',
          footer: 'border-t border-white/80 bg-white/40 backdrop-blur-md',
          userSub: 'text-slate-400'
        };
    }
  };

  const themeClasses = getSidebarClasses();

  return (
    <aside
      className={`hidden md:flex w-60 lg:w-64 shrink-0 flex-col justify-between select-none relative z-20 ${themeClasses.aside}`}
      style={themeClasses.style}
    >
      <div className="p-5 space-y-6 overflow-y-auto">
        {/* Brand Logo Header */}
        <div className="flex items-center gap-2.5 pt-1 pb-2 border-b border-slate-100">
          <BrandLogo
            logoType={brandConfig.logoType}
            logoUrl={brandConfig.logoUrl}
            symbolId={brandConfig.logoSymbolId}
            primaryColor={brandConfig.primaryColorHex || '#0875D9'}
            size="sm"
          />
          <div>
            <div className="font-extrabold tracking-tight text-base font-sans flex items-center gap-1.5 text-[#063B78]">
              <span>{brandConfig.companyName}</span>
            </div>
            <div className={`text-[10px] font-mono tracking-wider font-semibold -mt-0.5 truncate max-w-[150px] ${themeClasses.headerSub}`}>
              {brandConfig.tagline || 'Enterprise Platform'}
            </div>
            {brandConfig.companyAddress && (
              <div className="text-[9px] font-sans tracking-normal -mt-0.5 truncate max-w-[160px] opacity-70">
                {brandConfig.companyAddress}
              </div>
            )}
          </div>
        </div>

        {/* NAVIGATION Section */}
        <div>
          <div className={`text-[10px] font-bold uppercase tracking-widest mb-2.5 px-3 ${themeClasses.sectionHeader}`}>
            NAVIGATION
          </div>
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    isActive ? themeClasses.active : themeClasses.inactive
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? themeClasses.iconActive : themeClasses.iconInactive
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className="font-mono text-[10px] px-2 py-0.5 rounded-full font-bold text-white shadow-xs"
                      style={{ background: 'linear-gradient(135deg, #0875D9 0%, #39A9FF 100%)' }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Role Executive Section (If applicable) */}
        {roleNavItems.length > 0 && (
          <div>
            <div className={`text-[10px] font-bold uppercase tracking-widest mb-2.5 px-3 ${themeClasses.sectionHeader}`}>
              EXECUTIVE ({currentUser.role})
            </div>
            <nav className="space-y-1">
              {roleNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      isActive ? themeClasses.active : themeClasses.inactive
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${isActive ? themeClasses.iconActive : themeClasses.iconInactive}`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className="font-mono text-[10px] px-2 py-0.5 rounded-full font-bold text-white shadow-xs"
                        style={{ background: 'linear-gradient(135deg, #0875D9 0%, #39A9FF 100%)' }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Support Link */}
        <div>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'announcements' ? themeClasses.active : themeClasses.inactive
            }`}
          >
            <div className="flex items-center gap-3">
              <HelpCircle className={`w-4 h-4 ${themeClasses.iconInactive}`} />
              <span>Support & Bảng Tin</span>
            </div>
          </button>
        </div>

        {/* Task Progress & Statistics Widget (Replaces Cloud Quota) */}
        <div
          onClick={() => setActiveTab('tasks')}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-[#EAF5FF]/85 to-white/95 border border-[#0875D9]/20 shadow-xs hover:border-[#0875D9]/40 hover:shadow-md transition-all cursor-pointer group"
          title="Bấm để xem danh sách nhiệm vụ chi tiết"
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-[#063B78] text-[11.5px] flex items-center gap-1.5 group-hover:text-[#0875D9] transition-colors">
              <CheckSquare className="w-3.5 h-3.5 text-[#0875D9]" /> Tiến Độ Task
            </span>
            <span className="font-bold text-[#0875D9] text-[11px] font-mono">{displayRate}%</span>
          </div>
          <div className="h-1.5 bg-[#0875D9]/12 rounded-full overflow-hidden mb-1.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0875D9] to-[#39A9FF] transition-all duration-700"
              style={{ width: `${displayRate}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>{displayDone}/{displayTotal} hoàn thành</span>
            <span className="text-[#0875D9] font-medium">{displayPending} đang chạy</span>
          </div>
        </div>
      </div>

      {/* USER ACCOUNT Section */}
      <div className={`p-4 ${themeClasses.footer}`}>
        <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 px-1 ${themeClasses.sectionHeader}`}>
          USER ACCOUNT
        </div>

        <div className="flex items-center justify-between gap-2 p-1 rounded-xl">
          <div
            onClick={openProfileModal}
            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer hover:opacity-85 transition-opacity"
            title="Bấm để mở cài đặt thông tin cá nhân"
          >
            <div className="relative shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-[#0875D9] ring-offset-2 ring-offset-white shadow-xs"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#16C784] rounded-full border-2 border-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold truncate leading-tight text-slate-800">
                {currentUser.name}
              </div>
              <div className={`text-[10px] font-mono truncate mt-0.5 ${themeClasses.userSub} flex items-center gap-1`}>
                <span>#{currentUser.code.toLowerCase() || 'exec-01'}</span>
                <span className="text-[#0875D9] font-sans font-bold">· Cài đặt</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              id="btn-sidebar-profile"
              type="button"
              onClick={openProfileModal}
              className="p-1.5 text-slate-400 hover:text-[#0875D9] hover:bg-[#EAF5FF] rounded-lg transition-colors cursor-pointer"
              title="Cài đặt thông tin cá nhân (Tên, Ảnh đại diện)"
              aria-label="Cài đặt thông tin cá nhân"
            >
              <UserCog className="w-4 h-4" />
            </button>

            <button
              id="btn-sidebar-logout"
              type="button"
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0 cursor-pointer"
              title="Đăng xuất"
              aria-label="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
