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
  EyeOff
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CompanyGroupChat } from '../chat/CompanyGroupChat';

export const SupportWidget: React.FC = () => {
  const { employees, chatMessages, celebrate } = useApp();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'birthdays' | 'chat'>('birthdays');
  const [prefilledMessage, setPrefilledMessage] = useState<string>('');
  
  // State ẩn/hiện bảng thông báo sinh nhật & tin nhóm
  const [isCardVisible, setIsCardVisible] = useState<boolean>(() => {
    try {
      return localStorage.getItem('mrex_widget_card_visible') !== 'false';
    } catch {
      return true;
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

        // Day diff within this month or next
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
          displayDate: `${String(bDay).padStart(2, '0')}/${String(bMonth).padStart(2, '0')}`
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 3);
  }, [employees]);

  // Latest group chat message
  const latestMessage = chatMessages.length > 0 ? chatMessages[chatMessages.length - 1] : null;

  const handleOpenChatWithWish = (name: string, date: string) => {
    setPrefilledMessage(`🎉 Chúc mừng sinh nhật ${name} (${date})! Chúc bạn thêm một tuổi mới thật nhiều niềm vui, sức khỏe và đạt nhiều thành công rực rỡ tại Mrex Agency! 🎂🎈✨`);
    setIsChatOpen(true);
    celebrate();
  };

  return (
    <>
      <aside
        aria-label="Thông báo sinh nhật và tin nhắn nhóm Mrex"
        className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40 select-none flex flex-col items-center animate-in fade-in slide-in-from-bottom-3 duration-300"
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
          title={isCardVisible ? "Bấm để mở Nhắn tin nhóm toàn công ty Mrex Agency" : "Bấm để xem thông báo sinh nhật & tin nhóm"}
          className="relative group cursor-pointer block transition-transform duration-300 hover:scale-105 active:scale-95 focus:outline-none"
        >
          <img
            src="/mascotmrex.gif"
            alt="Mascot Mrex Agency"
            className="w-[148px] sm:w-[164px] h-auto object-contain filter drop-shadow-md"
            style={{ mixBlendMode: "multiply" }}
          />

          {/* Pulsing notification badge */}
          <span className="absolute bottom-2 right-2 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-white shadow-sm items-center justify-center text-[9px] font-bold text-white">
              {chatMessages.length > 0 ? chatMessages.length : 3}
            </span>
          </span>
        </button>

        {/* Thông báo Sinh nhật & Tin nhắn nhóm - Có nút Ẩn/Hiện */}
        {isCardVisible ? (
          <div
            className="mt-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-2.5 rounded-2xl shadow-[0_12px_35px_rgba(8,117,217,0.18)] border border-blue-200/90 dark:border-blue-900/80 flex flex-col items-center text-center w-[210px] sm:w-[230px] animate-in zoom-in-95 duration-200 relative group/card"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(240, 248, 255, 0.95) 100%)'
            }}
          >
            {/* Header Switcher: Sinh Nhật vs Tin Nhắn + Nút Ẩn */}
            <div className="flex items-center gap-1 w-full">
              <div className="flex items-center gap-1 flex-1 bg-slate-100/80 dark:bg-slate-800/80 p-0.5 rounded-xl text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('birthdays')}
                  className={`flex-1 py-1 px-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                    activeTab === 'birthdays'
                      ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Cake className="w-3 h-3 text-rose-500" />
                  <span>Sinh Nhật</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-1 px-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                    activeTab === 'chat'
                      ? 'bg-white dark:bg-slate-700 text-[#0875D9] shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <MessageSquare className="w-3 h-3 text-[#0875D9]" />
                  <span>Tin Nhóm</span>
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
                      className="p-1 px-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold shrink-0 transition-transform active:scale-95 flex items-center gap-0.5 shadow-xs"
                    >
                      <span>Chúc</span>
                      <Sparkles className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: THÔNG BÁO TIN NHẮN NHÓM */}
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
            title="Bấm để hiện lại bảng thông báo sinh nhật & tin nhóm"
            className="mt-1 px-3 py-1 bg-white/95 hover:bg-white text-rose-600 rounded-full border border-rose-200 shadow-md text-[10px] font-bold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md animate-in fade-in"
          >
            <Cake className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
            <span>Sinh nhật ({upcomingBirthdays.length})</span>
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