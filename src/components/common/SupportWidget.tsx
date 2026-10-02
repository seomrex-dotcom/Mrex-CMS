import React, { useState, useMemo } from 'react';
import {
  Cake,
  MessageSquare,
  Sparkles,
  ChevronRight,
  ChevronUp,
  Bell,
  X,
  Send,
  Users,
  EyeOff,
  CalendarOff,
  Palmtree,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CompanyGroupChat } from '../chat/CompanyGroupChat';

export const SupportWidget: React.FC = () => {
  const { employees, chatMessages, celebrate, leaveRequests, setActiveTab: setAppActiveTab, departments } = useApp();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'birthdays' | 'leaves' | 'chat'>('birthdays');
  const [prefilledMessage, setPrefilledMessage] = useState<string>('');
  
  // State ẩn/hiện bảng thông báo sinh nhật, nhân sự nghỉ & tin nhóm
  const [isCardVisible, setIsCardVisible] = useState<boolean>(() => {
    try {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      if (isMobile) return false;
      return localStorage.getItem('mrex_widget_card_visible') !== 'false';
    } catch {
      return false;
    }
  });

  const toggleCardVisible = (visible: boolean) => {
    setIsCardVisible(visible);
    try {
      localStorage.setItem('mrex_widget_card_visible', visible ? 'true' : 'false');
    } catch {
      // Ignore
    }
  };

  // 1. Calculate upcoming birthdays
  const upcomingBirthdays = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentDay = today.getDate();

    return employees
      .filter(e => e.birthDate)
      .map(e => {
        const parts = e.birthDate!.split('-');
        const bMonth = parseInt(parts[1], 10);
        const bDay = parseInt(parts[2], 10);

        let daysLeft = 0;
        const thisYearBday = new Date(today.getFullYear(), bMonth - 1, bDay);
        if (thisYearBday < today) {
          thisYearBday.setFullYear(today.getFullYear() + 1);
        }
        const diffTime = thisYearBday.getTime() - today.getTime();
        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          ...e,
          bMonth,
          bDay,
          daysLeft,
          displayDate: String(bDay).padStart(2, '0') + '/' + String(bMonth).padStart(2, '0')
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 3);
  }, [employees]);

  // 2. Calculate who is on leave today (Nhân sự nghỉ phép hôm nay)
  const todayDateStr = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }, []);

  const todayOnLeave = useMemo(() => {
    return leaveRequests
      .filter(req => {
        if (req.status !== 'APPROVED') return false;
        return todayDateStr >= req.startDate && todayDateStr <= req.endDate;
      })
      .map(req => {
        const emp = employees.find(e => e.id === req.employeeId);
        const dept = departments.find(d => d.id === emp?.departmentId);
        return {
          ...req,
          employee: emp,
          departmentName: dept?.name || emp?.departmentId || 'Mrex Agency'
        };
      });
  }, [leaveRequests, employees, departments, todayDateStr]);

  // Latest group chat message
  const latestMessage = chatMessages.length > 0 ? chatMessages[chatMessages.length - 1] : null;

  const handleOpenChatWithWish = (name: string, date: string) => {
    setPrefilledMessage('🎉 Chúc mừng sinh nhật ' + name + ' (' + date + ')! Chúc bạn thêm một tuổi mới thật nhiều niềm vui, sức khỏe và đạt nhiều thành công rực rỡ tại Mrex Agency! 🎂🎈✨');
    setIsChatOpen(true);
    celebrate();
  };

  const getLeaveTypeInfo = (type: string) => {
    switch (type) {
      case 'ANNUAL':
        return { label: 'Phép năm', icon: '🌴', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'SICK':
        return { label: 'Nghỉ ốm', icon: '💊', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'MATERNITY':
        return { label: 'Thai sản', icon: '👶', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'UNPAID':
        return { label: 'Việc riêng', icon: '⏳', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'OVERTIME':
        return { label: 'Nghỉ bù', icon: '⏱️', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' };
      default:
        return { label: 'Nghỉ phép', icon: '🏖️', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
  };

  return (
    <>
      {/* Desktop Floating Mascot & Card - Hidden on Mobile to keep screen clear */}
      <aside
        aria-label="Thông báo sinh nhật, nhân sự nghỉ và tin nhắn nhóm Mrex"
        className="hidden md:flex fixed bottom-6 right-6 z-40 select-none flex-col items-center animate-in fade-in slide-in-from-bottom-3 duration-300"
      >
        {/* Mascot GIF - Click to open Company Chat */}
        <button
          type="button"
          onClick={() => {
            if (!isCardVisible) {
              toggleCardVisible(true);
            } else {
              setIsChatOpen(true);
            }
          }}
          title={isCardVisible ? "Bấm vào Linh vật để mở Khung Chat Nội Bộ" : "Bấm để mở lại thông báo"}
          className="relative group transition-transform hover:scale-105 active:scale-95 cursor-pointer focus:outline-none"
        >
          <img
            src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Z5eGpkZXE2bWN6aXF0NWRyeHRsOWY1Z2d4eGpscnQxejR5YXRvbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/L3NtwUki9lF7nCgW3k/giphy.gif"
            alt="Mrex AI Assistant Mascot"
            className="w-16 h-16 drop-shadow-xl"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          {chatMessages.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-white text-[9px] font-bold items-center justify-center">
                {chatMessages.length > 9 ? '9+' : chatMessages.length}
              </span>
            </span>
          )}
        </button>

        {/* Floating Mini Card */}
        {isCardVisible ? (
          <div
            className="mt-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-2.5 rounded-2xl shadow-[0_12px_35px_rgba(8,117,217,0.18)] border border-blue-200/90 dark:border-blue-900/80 flex flex-col items-center text-center w-[250px] sm:w-[275px] animate-in zoom-in-95 duration-200 relative group/card"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(240, 248, 255, 0.95) 100%)'
            }}
          >
            {/* Header Switcher: Sinh Nhật vs Nghỉ Hôm Nay vs Tin Nhắn + Nút Ẩn */}
            <div className="flex items-center gap-1 w-full">
              <div className="flex items-center gap-0.5 flex-1 bg-slate-100/90 dark:bg-slate-800/90 p-0.5 rounded-xl text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('birthdays')}
                  className={'flex-1 py-1 px-1 rounded-lg flex items-center justify-center gap-1 transition-all ' + (
                    activeTab === 'birthdays'
                      ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                  title="Danh sách sinh nhật sắp tới"
                >
                  <Cake className="w-3 h-3 text-rose-500 shrink-0" />
                  <span className="truncate">Sinh Nhật</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('leaves')}
                  className={'flex-1 py-1 px-1 rounded-lg flex items-center justify-center gap-1 transition-all relative ' + (
                    activeTab === 'leaves'
                      ? 'bg-white dark:bg-slate-700 text-amber-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                  title="Nhân sự nghỉ phép hôm nay"
                >
                  <Palmtree className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="truncate">Nghỉ Hôm Nay</span>
                  {todayOnLeave.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className={'flex-1 py-1 px-1 rounded-lg flex items-center justify-center gap-1 transition-all ' + (
                    activeTab === 'chat'
                      ? 'bg-white dark:bg-slate-700 text-[#0875D9] shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                  title="Tin nhắn nhóm toàn công ty"
                >
                  <MessageSquare className="w-3 h-3 text-[#0875D9] shrink-0" />
                  <span className="truncate">Tin Nhóm</span>
                </button>
              </div>

              {/* Nút Ẩn Phần Này */}
              <button
                type="button"
                id="btn-hide-birthday-widget"
                onClick={() => toggleCardVisible(false)}
                title="Ẩn phần thông báo này"
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
                aria-label="Ẩn phần này"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* TAB 1: SẮP ĐẾN SINH NHẬT NHÂN VIÊN */}
            {activeTab === 'birthdays' && (
              <div className="w-full mt-2 space-y-1.5 text-left">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Sắp Đến Sinh Nhật
                  </span>
                  <span className="text-[10px] font-bold text-rose-500 flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Tháng 10</span>
                  </span>
                </div>

                {upcomingBirthdays.map((emp) => (
                  <div
                    key={emp.id}
                    className="p-1.5 rounded-xl bg-rose-50/70 hover:bg-rose-100/70 border border-rose-100 transition-colors flex items-center justify-between gap-1.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-[11px] text-slate-800 truncate flex items-center gap-1">
                        <span>🎂 {emp.name}</span>
                      </div>
                      <div className="text-[10px] text-rose-600 font-medium">
                        {emp.displayDate} · Còn {emp.daysLeft} ngày
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenChatWithWish(emp.name, emp.displayDate)}
                      title="Gửi lời chúc mừng"
                      className="p-1 px-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold shrink-0 transition-transform active:scale-95 flex items-center gap-0.5 shadow-xs cursor-pointer"
                    >
                      <span>Chúc</span>
                      <Sparkles className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: THÔNG BÁO HÔM NAY NHÂN SỰ NÀO NGHỈ */}
            {activeTab === 'leaves' && (
              <div className="w-full mt-2 space-y-1.5 text-left">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <CalendarOff className="w-3 h-3 text-amber-500" />
                    Hôm Nay Nghỉ Phép
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded-md font-mono">
                    {todayOnLeave.length} vắng
                  </span>
                </div>

                {todayOnLeave.length === 0 ? (
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-center space-y-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                    <div className="text-[11px] font-bold text-emerald-800">
                      Đầy đủ 100% nhân sự
                    </div>
                    <div className="text-[10px] text-emerald-600 leading-tight">
                      Hôm nay không có nhân sự nào nghỉ phép
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
                    {todayOnLeave.map((req) => {
                      const typeInfo = getLeaveTypeInfo(req.type);
                      return (
                        <div
                          key={req.id}
                          className="p-2 rounded-xl bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200/70 transition-all space-y-1"
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {req.employee?.avatar ? (
                                <img
                                  src={req.employee.avatar}
                                  alt={req.employeeName}
                                  className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-amber-300"
                                />
                              ) : (
                                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                                  {req.employeeName.slice(0, 1)}
                                </span>
                              )}
                              <span className="font-bold text-[11px] text-slate-800 truncate">
                                {req.employeeName}
                              </span>
                            </div>

                            <span className={'text-[9px] font-bold px-1.5 py-0.2 rounded-md border shrink-0 ' + typeInfo.badgeClass}>
                              {typeInfo.icon} {typeInfo.label}
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-500 truncate">
                            {req.employee?.roleTitle || req.departmentName}
                          </div>

                          <div className="text-[10px] text-amber-900 bg-white/70 px-1.5 py-0.5 rounded-lg border border-amber-100/80 truncate">
                            Lý do: <span className="font-medium text-slate-700">{req.reason}</span>
                          </div>

                          <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
                            <span>
                              {req.startDate === req.endDate
                                ? 'Hôm nay (1 ngày)'
                                : 'Từ ' + req.startDate.slice(8, 10) + '/' + req.startDate.slice(5, 7) + ' đến ' + req.endDate.slice(8, 10) + '/' + req.endDate.slice(5, 7) + ' (' + req.totalDays + ' ngày)'}
                            </span>
                            <span className="font-semibold text-emerald-600 bg-emerald-50 px-1 rounded">
                              ✓ Đã duyệt
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setAppActiveTab('attendance')}
                      className="w-full py-1 text-center text-[10px] font-semibold text-amber-700 hover:text-amber-800 hover:underline flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Xem theo dõi đơn nghỉ (GPS & Chấm công)</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: THÔNG BÁO TIN NHẮN NHÓM */}
            {activeTab === 'chat' && (
              <div className="w-full mt-2 space-y-2 text-left">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Tin Mới Nhóm Toàn Cty
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#0875D9] bg-blue-50 px-1.5 py-0.2 rounded-full border border-blue-200">
                    {chatMessages.length} tin
                  </span>
                </div>

                {latestMessage && (
                  <div
                    onClick={() => setIsChatOpen(true)}
                    className="p-2 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-100 transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-[11px] text-[#063B78] flex items-center justify-between">
                      <span className="truncate">{latestMessage.senderName}</span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {latestMessage.timestamp.slice(11, 16)}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-600 line-clamp-2 mt-0.5 leading-tight">
                      {latestMessage.content}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsChatOpen(true)}
                  className="w-full py-1.5 px-2 bg-gradient-to-r from-[#0875D9] to-[#0B4FA8] hover:from-[#065eb0] hover:to-[#083e87] text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                >
                  <Users className="w-3 h-3" />
                  <span>Mở Chat Toàn Công Ty</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Nút Mở Lại Khi Đã Ẩn */
          <button
            type="button"
            id="btn-show-birthday-widget"
            onClick={() => toggleCardVisible(true)}
            title="Bấm để hiện lại bảng thông báo sinh nhật, nhân sự nghỉ & tin nhóm"
            className="mt-1 px-3 py-1 bg-white/95 hover:bg-white text-slate-700 rounded-full border border-slate-200 shadow-md text-[10px] font-bold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md animate-in fade-in"
          >
            <Cake className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
            <span className="text-rose-600">Sinh nhật ({upcomingBirthdays.length})</span>
            <span className="text-slate-300">·</span>
            <span className="text-amber-600 font-bold">Nghỉ ({todayOnLeave.length})</span>
            <ChevronUp className="w-3 h-3 text-slate-400" />
          </button>
        )}
      </aside>

      {/* Fullscreen / Drawer Group Chat Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl h-[85vh] max-h-[720px] relative animate-in zoom-in-95 duration-200">
            <CompanyGroupChat
              isModal={true}
              onClose={() => {
                setIsChatOpen(false);
                setPrefilledMessage('');
              }}
              prefilledText={prefilledMessage}
            />
          </div>
        </div>
      )}
    </>
  );
};
