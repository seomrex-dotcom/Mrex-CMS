import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Send,
  Smile,
  Users,
  MessageSquare,
  Cake,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  Volume2,
  Hash,
  Database
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChatMessage, UserRole } from '../../types';
import { StorageOptimizer } from '../../services/storageOptimizer';

interface CompanyGroupChatProps {
  isModal?: boolean;
  onClose?: () => void;
  defaultChannel?: string;
  prefilledText?: string;
}

const CHANNELS = [
  { id: 'general', name: 'toan-cong-ty', label: 'Toàn Công Ty', icon: '📢', desc: 'Kênh chung kết nối toàn bộ cán bộ nhân viên Mrex Agency' },
  { id: 'birthdays', name: 'sinh-nhat-noi-bo', label: 'Sinh Nhật & Sự Kiện', icon: '🎂', desc: 'Kênh chúc mừng sinh nhật, kỷ niệm và sự kiện công ty' },
  { id: 'exec', name: 'ban-giam-doc', label: 'Ban Giám Đốc', icon: '👑', desc: 'Chỉ đạo định hướng chiến lược và quyết sách' },
  { id: 'production', name: 'kho-san-xuat', label: 'Khối Sản Xuất & Kho Vận', icon: '📦', desc: 'Tiến độ gia công, nhập/xuất kho và hóa đơn vận chuyển' },
  { id: 'hr', name: 'nhan-su-hanh-chinh', label: 'Phòng Nhân Sự & HC', icon: '👥', desc: 'Thông báo tuyển dụng, chế độ, sinh nhật và văn hóa công ty' },
  { id: 'it_seo', name: 'it-seo', label: 'Phòng IT & SEO', icon: '💻', desc: 'Hạ tầng hệ thống, tối ưu VPS chống sập, task kỹ thuật' },
  { id: 'social', name: 'social-media', label: 'Phòng Social Media', icon: '📱', desc: 'Chiến dịch marketing, bài đăng mạng xã hội và tương tác' },
  { id: 'internal_comms', name: 'truyen-thong-noi-bo', label: 'Truyền Thông Nội Bộ', icon: '✨', desc: 'Bản tin tuần, gắn kết thành viên và truyền thông' },
];

export const CompanyGroupChat: React.FC<CompanyGroupChatProps> = ({
  isModal = false,
  onClose,
  defaultChannel = 'general',
  prefilledText = ''
}) => {
  const { currentUser, employees, departments, chatMessages, sendChatMessage, celebrate, markChatAsRead } = useApp();
  const [selectedChannel, setSelectedChannel] = useState<string>(defaultChannel);
  const [inputText, setInputText] = useState<string>(prefilledText);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mark chat as read when component opens
  useEffect(() => {
    markChatAsRead();
  }, []);

  // Sync prefilled text if provided (e.g. from birthday wish button)
  useEffect(() => {
    if (prefilledText) {
      setInputText(prefilledText);
      setSelectedChannel('birthdays');
    }
  }, [prefilledText]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, selectedChannel]);

  const activeChannel = CHANNELS.find(c => c.id === selectedChannel) || CHANNELS[0];
  const filteredMessages = chatMessages.filter(
    (m: ChatMessage) => (m.channelId || 'general') === selectedChannel
  );

  // REALTIME DYNAMIC BIRTHDAYS CALCULATION
  const currentMonth = new Date().getMonth() + 1; // 1-12

  const birthdayEmployees = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const curYear = today.getFullYear();

    return employees
      .filter(e => e.birthDate && e.status !== 'INACTIVE')
      .map(e => {
        const parts = e.birthDate!.split('-');
        const bMonth = parseInt(parts[1], 10);
        const bDay = parseInt(parts[2], 10);

        let nextBday = new Date(curYear, bMonth - 1, bDay);
        if (nextBday < todayStart) {
          nextBday.setFullYear(curYear + 1);
        }
        const diffDays = Math.round((nextBday.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
        const isToday = diffDays === 0;

        let icon = '🎂';
        if (e.role === 'CEO') icon = '👑';
        else if (e.departmentId === 'production') icon = '📦';
        else if (isToday) icon = '🎉';

        const displayDate = `${String(bDay).padStart(2, '0')}/${String(bMonth).padStart(2, '0')}`;

        return {
          id: e.id,
          name: e.name,
          roleTitle: e.roleTitle,
          avatar: e.avatar,
          birthDate: e.birthDate,
          bMonth,
          bDay,
          diffDays,
          isToday,
          icon,
          displayDate
        };
      })
      .sort((a, b) => a.diffDays - b.diffDays);
  }, [employees]);

  // Filter birthdays in current month first, or upcoming 4
  const monthBirthdays = birthdayEmployees.filter(e => e.bMonth === currentMonth);
  const displayBirthdays = monthBirthdays.length > 0 ? monthBirthdays : birthdayEmployees.slice(0, 4);


  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const isBirthdayWish = inputText.includes('🎂') || inputText.includes('sinh nhật') || selectedChannel === 'birthdays';

    sendChatMessage({
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderRoleTitle: currentUser.roleTitle,
      senderAvatar: currentUser.avatar,
      departmentId: currentUser.departmentId,
      channelId: selectedChannel,
      channelName: activeChannel.label,
      content: inputText.trim(),
      type: isBirthdayWish ? 'BIRTHDAY_WISH' : 'TEXT',
      reactions: isBirthdayWish ? [{ emoji: '🎂', count: 1, users: [currentUser.id] }] : []
    });

    if (isBirthdayWish) {
      celebrate();
    }

    setInputText('');
  };

  const handleQuickBirthdayWish = (empName: string) => {
    setSelectedChannel('birthdays');
    setInputText(`🎉 Chúc mừng sinh nhật ${empName}! Chúc bạn thêm tuổi mới luôn dồi dào sức khỏe, hạnh phúc và bứt phá thành công cùng Mrex Agency! 🎂🎈✨`);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'CEO':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">👑 CEO</span>;
      case 'MANAGER':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">🛡️ Manager</span>;
      case 'HR':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">👥 HR</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Nhân viên</span>;
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-slate-900 ${isModal ? 'rounded-2xl shadow-2xl overflow-hidden border border-blue-200 dark:border-slate-800' : 'rounded-2xl border border-slate-200 dark:border-slate-800'}`}>
      {/* Top Header */}
      <div className="px-4 py-3.5 bg-gradient-to-r from-[#0875D9] via-[#0b5cb5] to-[#043370] text-white flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">
            {activeChannel.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight flex items-center gap-1">
                <Hash className="w-4 h-4 text-blue-200" />
                {activeChannel.name}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 font-medium">
                {activeChannel.label}
              </span>
            </div>
            <p className="text-[11px] text-blue-100/80 line-clamp-1">
              {activeChannel.desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* VPS Safe Storage Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-300/30 text-emerald-100 text-[11px] font-mono">
            <Database className="w-3.5 h-3.5 text-emerald-300" />
            <span>VPS RAM Safe · Giới hạn 80 tin</span>
          </div>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
              title="Đóng cửa sổ chat"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Body: Channel List (Mobile pills / Desktop sidebar) + Messages */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Channels Column */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-2 sm:p-3 overflow-x-auto md:overflow-y-auto shrink-0 flex md:flex-col gap-1.5">
          <div className="hidden md:flex items-center justify-between px-2 py-1 mb-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Kênh Hội Thoại</span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {CHANNELS.map(ch => {
            const isSelected = ch.id === selectedChannel;
            const count = chatMessages.filter((m: ChatMessage) => (m.channelId || 'general') === ch.id).length;

            return (
              <button
                key={ch.id}
                onClick={() => setSelectedChannel(ch.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap md:whitespace-normal text-left ${
                  isSelected
                    ? 'bg-[#0875D9] text-white shadow-md shadow-blue-500/20 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-[#0875D9]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm shrink-0">{ch.icon}</span>
                  <span className="truncate">#{ch.name}</span>
                </div>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ml-1 ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Birthday Celebration Card in Sidebar - REALTIME SYNC */}
          <div className="hidden md:block mt-3 p-3 rounded-xl bg-gradient-to-br from-amber-50 to-rose-50 dark:from-slate-800 dark:to-slate-800/60 border border-amber-200/80 dark:border-amber-900/40 text-xs shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300">
                <Cake className="w-3.5 h-3.5 text-rose-500" />
                <span>Sắp Sinh Nhật Tháng {currentMonth}</span>
              </div>
              <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                {displayBirthdays.length} nhân sự
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2">
              Bấm để gửi lời chúc nhanh vào kênh sinh nhật:
            </p>
            <div className="space-y-1">
              {displayBirthdays.map(emp => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => handleQuickBirthdayWish(`${emp.name} (${emp.displayDate})`)}
                  className="w-full text-left px-2 py-1.5 bg-white/90 dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-slate-600 rounded-lg text-[11px] font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors border border-amber-100 dark:border-slate-600 cursor-pointer shadow-2xs group"
                >
                  <span className="truncate flex items-center gap-1.5 min-w-0">
                    <span className="shrink-0">{emp.icon}</span>
                    <span className="truncate font-semibold group-hover:text-rose-600 transition-colors">{emp.name}</span>
                  </span>
                  <span className={`text-[10px] font-bold font-mono ml-1.5 shrink-0 px-1 py-0.2 rounded ${
                    emp.isToday
                      ? 'bg-rose-500 text-white font-black animate-pulse'
                      : 'text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-slate-800'
                  }`}>
                    {emp.displayDate}
                  </span>
                </button>
              ))}

              {displayBirthdays.length === 0 && (
                <div className="text-center py-2 text-slate-400 text-[11px]">
                  Không có sinh nhật nào sắp tới
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message Feed & Input Column */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {filteredMessages.length === 0 ? (
              <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2 stroke-1" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Chưa có tin nhắn trong #{activeChannel.name}</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Hãy gửi lời chào đầu tiên đến đồng nghiệp trong kênh này!
                </p>
              </div>
            ) : (
              filteredMessages.map((msg: ChatMessage) => {
                const isMe = msg.senderId === currentUser.id;
                const isBirthday = msg.type === 'BIRTHDAY_WISH';

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 border border-slate-300 shrink-0 shadow-xs">
                      {msg.senderAvatar ? (
                        <img src={msg.senderAvatar} alt={msg.senderName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                          {msg.senderName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Bubble Content */}
                    <div className="space-y-1">
                      <div className={`flex items-center gap-1.5 text-[11px] ${isMe ? 'justify-end' : ''}`}>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{msg.senderName}</span>
                        {getRoleBadge(msg.senderRole)}
                        <span className="text-[10px] text-slate-400 font-mono">
                          {msg.timestamp.slice(11, 16) || msg.timestamp}
                        </span>
                      </div>

                      <div
                        className={`p-3 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                          isBirthday
                            ? 'bg-gradient-to-r from-amber-50 to-rose-50 text-rose-900 border border-amber-200'
                            : isMe
                            ? 'bg-[#0875D9] text-white rounded-tr-none'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/70 dark:border-slate-700'
                        }`}
                      >
                        {isBirthday && (
                          <div className="flex items-center gap-1 font-bold text-rose-700 text-xs mb-1">
                            <Cake className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
                            <span>Lời chúc mừng sinh nhật ý nghĩa</span>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{msg.content}</p>

                        {/* Reactions */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className="flex items-center gap-1 mt-2 pt-1 border-t border-black/5 dark:border-white/5">
                            {msg.reactions.map((r: { emoji: string; count: number; users: string[] }, i: number) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/70 dark:bg-slate-700 text-[11px] shadow-xs border border-slate-200/60 dark:border-slate-600 font-medium"
                              >
                                <span>{r.emoji}</span>
                                <span className="font-bold text-[10px]">{r.count}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reaction Bar */}
          <div className="px-4 py-1.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Phím nhanh:</span>
              <button
                type="button"
                onClick={() => setInputText(prev => prev + ' 🎂 ')}
                className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-700 hover:bg-slate-100 border border-slate-200 dark:border-slate-600 text-xs"
              >
                🎂 Bánh kem
              </button>
              <button
                type="button"
                onClick={() => setInputText(prev => prev + ' 🎉 ')}
                className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-700 hover:bg-slate-100 border border-slate-200 dark:border-slate-600 text-xs"
              >
                🎉 Pháo hoa
              </button>
              <button
                type="button"
                onClick={() => setInputText(prev => prev + ' 🚀 ')}
                className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-700 hover:bg-slate-100 border border-slate-200 dark:border-slate-600 text-xs"
              >
                🚀 Bứt phá
              </button>
              <button
                type="button"
                onClick={() => setInputText(prev => prev + ' 👍 ')}
                className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-700 hover:bg-slate-100 border border-slate-200 dark:border-slate-600 text-xs"
              >
                👍 Đồng ý
              </button>
            </div>
            <button
              type="button"
              onClick={celebrate}
              title="Bắn pháo hoa ăn mừng"
              className="text-amber-500 hover:text-amber-600 p-1 flex items-center gap-1 text-[11px] font-bold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ăn mừng</span>
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Nhắn tin trong #${activeChannel.name}...`}
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0875D9] focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-800 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 py-2.5 bg-[#0875D9] hover:bg-[#065eb0] disabled:opacity-40 disabled:hover:bg-[#0875D9] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer transition-all active:scale-95"
            >
              <span>Gửi</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
