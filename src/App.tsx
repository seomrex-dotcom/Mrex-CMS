import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HeaderMarquee } from './components/layout/HeaderMarquee';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardView } from './components/dashboard/DashboardView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { TasksView } from './components/tasks/TasksView';
import { PerformanceView } from './components/performance/PerformanceView';
import { ReportsView } from './components/reports/ReportsView';
import { EmployeesView } from './components/employees/EmployeesView';
import { AnnouncementsView } from './components/announcements/AnnouncementsView';
import { BoardView } from './components/board/BoardView';
import { WorkloadView } from './components/workload/WorkloadView';
import { PayrollView } from './components/payroll/PayrollView';
import { DocsView } from './components/docs/DocsView';
import { FinanceView } from './components/finance/FinanceView';
import { ProductionView } from './components/production/ProductionView';
import { UserProfileModal } from './components/common/UserProfileModal';
import { SupportWidget } from './components/common/SupportWidget';
import { CompanyGroupChat } from './components/chat/CompanyGroupChat';

const MainLayout: React.FC = () => {
  const { activeTab, isAuthenticated, bgTheme, brandConfig, isProfileModalOpen, closeProfileModal } = useApp();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div
      className="min-h-screen relative overflow-x-hidden p-0 xl:p-6 2xl:p-8 flex items-center justify-center antialiased"
      style={{
        fontFamily: `"${brandConfig.fontFamily}", sans-serif`,
        background: 'linear-gradient(135deg, #EAF5FF 0%, #F4F8FC 55%, #DCEEFF 100%)'
      }}
    >
      {/* Ambient background glow & floating glass orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        {/* Large Rotating Trống Đồng Đông Sơn Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] xl:w-[1200px] xl:h-[1200px] pointer-events-none select-none opacity-[0.09] dark:opacity-[0.06] animate-spin-slow">
          <img
            src="/trong-dong-dong-son-opt.webp"
            alt="Trống Đồng Đông Sơn"
            className="w-full h-full object-contain filter drop-shadow-sm"
          />
        </div>
      </div>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="ambient-light-1" style={{
          position: 'absolute',
          top: '-100px',
          left: '10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(57, 169, 255, 0.18) 0%, rgba(234, 245, 255, 0) 70%)',
          filter: 'blur(60px)',
          animation: 'floatSlow 18s ease-in-out infinite alternate'
        }} />
        <div className="ambient-light-2" style={{
          position: 'absolute',
          bottom: '-150px',
          right: '5%',
          width: '750px',
          height: '750px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(8, 117, 217, 0.14) 0%, rgba(220, 238, 255, 0) 70%)',
          filter: 'blur(80px)',
          animation: 'floatSlow 24s ease-in-out infinite alternate-reverse'
        }} />
        <div style={{
          position: 'absolute',
          top: '12%',
          right: '7%',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(168,216,255,0.25) 100%)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.85)',
          boxShadow: '0 10px 30px rgba(8,117,217,0.1)',
          animation: 'floatBounce 14s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '16%',
          left: '3%',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(168,216,255,0.25) 100%)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.85)',
          boxShadow: '0 10px 30px rgba(8,117,217,0.1)',
          animation: 'floatBounce 18s ease-in-out infinite reverse'
        }} />
      </div>

      {/* Executive Desktop App Frame */}
      <div className="w-full max-w-[1560px] h-screen xl:h-[94vh] bg-white/75 backdrop-blur-[24px] xl:rounded-[26px] shadow-[0_16px_50px_rgba(30,90,150,0.12)] overflow-hidden flex flex-col md:flex-row border border-white/85 relative z-10">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-transparent">
          <HeaderMarquee onOpenMobileMenu={() => setIsMobileDrawerOpen(true)} />
          <main className={`flex-1 overflow-y-auto pb-24 md:pb-6 p-3 sm:p-5 md:p-6 theme-${bgTheme} relative`}>
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'attendance' && <AttendanceView />}
            {activeTab === 'tasks' && <TasksView />}
            {activeTab === 'finance' && <FinanceView />}
            {activeTab === 'docs' && <DocsView />}
            {activeTab === 'performance' && <PerformanceView />}
            {activeTab === 'reports' && <ReportsView />}
            {activeTab === 'employees' && <EmployeesView />}
            {activeTab === 'announcements' && <AnnouncementsView />}
            {activeTab === 'board' && <BoardView />}
            {activeTab === 'workload' && <WorkloadView />}
            {activeTab === 'payroll' && <PayrollView />}
            {activeTab === 'production' && <ProductionView />}
            {activeTab === 'chat' && <CompanyGroupChat />}
          </main>
        </div>
      </div>

      {/* Personal Profile Settings Modal */}
      <UserProfileModal isOpen={isProfileModalOpen} onClose={closeProfileModal} />

      {/* 24/7 Support Hotline & Mascot Widget */}
      <SupportWidget />

      <MobileNav
        isDrawerOpen={isMobileDrawerOpen}
        onCloseDrawer={() => setIsMobileDrawerOpen(false)}
        onOpenDrawer={() => setIsMobileDrawerOpen(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
