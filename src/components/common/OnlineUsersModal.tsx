import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Search,
  X,
  Laptop,
  Smartphone,
  Clock,
  Sparkles,
  Shield,
  Activity,
  CheckCircle2,
  Briefcase,
  Moon,
  AlertCircle
} from 'lucide-react';
import { DepartmentId, PresenceStatus } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type StatusFilterType = 'ALL' | 'ONLINE' | 'ACTIVE' | 'IDLE' | 'OFFLINE';

export const OnlineUsersModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { employees, currentUser, departments, presenceList, onlineCount, activeCount, idleCount, offlineCount } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('ALL');

  // Combined full employee presence data
  const fullList = useMemo(() => {
    return employees.map((emp) => {
      const presence = presenceList.find(p => p.employeeId === emp.id) || {
        employeeId: emp.id,
        status: 'OFFLINE' as PresenceStatus,
        lastActive: Date.now() - 3600000,
        currentActivity: 'Đã đăng xuất / Vắng mặt',
        device: 'WEB' as const
      };

      const diffMinutes = Math.max(0, Math.floor((Date.now() - presence.lastActive) / 60000));
      let activeSince = 'Vừa mới đây';
      if (presence.status === 'OFFLINE') {
        activeSince = 'Đã rời ca / Logout';
      } else if (presence.status === 'IDLE') {
        activeSince = diffMinutes > 0 ? ('Treo tab ' + diffMinutes + ' phút trước') : 'Vừa treo tab';
      } else {
        activeSince = diffMinutes > 0 ? (diffMinutes + ' phút trước') : 'Vừa thao tác';
      }

      return {
        employee: emp,
        status: presence.status,
        device: presence.device,
        activeSince,
        currentActivity: presence.currentActivity,
        lastActive: presence.lastActive
      };
    });
  }, [employees, presenceList]);

  // Filter list by status, department, and search query
  const filteredList = useMemo(() => {
    return fullList.filter(item => {
      // 1. Status Filter
      if (statusFilter === 'ONLINE') {
        if (item.status === 'OFFLINE') return false;
      } else if (statusFilter !== 'ALL') {
        if (item.status !== statusFilter) return false;
      }

      // 2. Department Filter
      if (departmentFilter !== 'ALL' && item.employee.departmentId !== departmentFilter) {
        return false;
      }

      // 3. Search query
      const q = searchTerm.toLowerCase().trim();
      if (!q) return true;

      return (
        item.employee.name.toLowerCase().includes(q) ||
        item.employee.roleTitle.toLowerCase().includes(q) ||
        (item.employee.code && item.employee.code.toLowerCase().includes(q)) ||
        item.currentActivity.toLowerCase().includes(q)
      );
    });
  }, [fullList, statusFilter, departmentFilter, searchTerm]);

  const webCount = fullList.filter(u => u.status !== 'OFFLINE' && u.device === 'WEB').length;
  const mobileCount = fullList.filter(u => u.status !== 'OFFLINE' && u.device === 'MOBILE').length;

  if (!isOpen) return null;

  const getStatusBadge = (status: PresenceStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Đang thao tác
          </span>
        );
      case 'IDLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Treo tab
          </span>
        );
      case 'OFFLINE':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Vắng mặt
          </span>
        );
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-white via-blue-50/20 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#0875D9]/10 text-[#0875D9]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Hiện Diện Trực Tuyến & Thao Tác Realtime
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#0875D9] text-white">
                  LIVE
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Theo dõi chính xác trạng thái thao tác, treo tab hoặc vắng mặt của toàn bộ nhân sự
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Counters Banner */}
        <div className="px-5 sm:px-6 py-3 bg-[#F4F8FC] border-b border-slate-100 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2.5">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200/70 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono font-bold text-emerald-700">{activeCount}</span>
              <span className="text-slate-600">Đang thao tác</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200/70 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="font-mono font-bold text-amber-700">{idleCount}</span>
              <span className="text-slate-600">Treo tab</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200/70 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="font-mono font-bold text-slate-600">{offlineCount}</span>
              <span className="text-slate-500">Vắng mặt</span>
            </div>

            <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Laptop className="w-3.5 h-3.5 text-[#0875D9]" />
                <b className="text-slate-700 font-mono">{webCount}</b> Web
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                <b className="text-slate-700 font-mono">{mobileCount}</b> Mobile
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-semibold text-[#0875D9] bg-[#0875D9]/10 px-2.5 py-1 rounded-xl">
            <span>Tổng Trực Tuyến:</span>
            <span className="font-mono font-extrabold">{onlineCount}</span>
            <span className="text-slate-400 font-normal">/ {employees.length}</span>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="p-4 border-b border-slate-100 bg-white space-y-2.5">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên nhân viên, chức vụ, mã NV, công việc đang làm..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0875D9]/30 transition-all"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ' + (
                statusFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              Tất cả ({fullList.length})
            </button>
            <button
              onClick={() => setStatusFilter('ONLINE')}
              className={'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ' + (
                statusFilter === 'ONLINE'
                  ? 'bg-[#0875D9] text-white shadow-xs'
                  : 'bg-blue-50 text-[#0875D9] hover:bg-blue-100'
              )}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Trực tuyến ({onlineCount})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ' + (
                statusFilter === 'ACTIVE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Đang thao tác ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('IDLE')}
              className={'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ' + (
                statusFilter === 'IDLE'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Treo tab ({idleCount})
            </button>
            <button
              onClick={() => setStatusFilter('OFFLINE')}
              className={'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ' + (
                statusFilter === 'OFFLINE'
                  ? 'bg-slate-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Vắng mặt ({offlineCount})
            </button>
          </div>

          {/* Department Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px]">
            <span className="text-slate-400 shrink-0 font-medium mr-1">Phòng ban:</span>
            {[
              { id: 'ALL', label: 'Tất cả PB' },
              ...departments.map(d => ({ id: d.id, label: d.name }))
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setDepartmentFilter(tab.id)}
                className={'px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ' + (
                  departmentFilter === tab.id
                    ? 'bg-[#0875D9]/15 text-[#0875D9] font-bold border border-[#0875D9]/30'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200/50'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-slate-100">
          {filteredList.length === 0 ? (
            <div className="py-14 text-center text-slate-400 text-xs">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              Không tìm thấy nhân sự phù hợp với điều kiện tìm kiếm
            </div>
          ) : (
            filteredList.map(item => {
              const dept = departments.find(d => d.id === item.employee.departmentId);
              const isMe = item.employee.id === currentUser.id;

              return (
                <div
                  key={item.employee.id}
                  className={'pt-2.5 first:pt-0 flex items-center justify-between gap-3 p-2.5 rounded-2xl transition-all group ' + (
                    isMe
                      ? 'bg-blue-50/50 border border-[#0875D9]/25 hover:bg-blue-50/80'
                      : 'hover:bg-[#EAF5FF]/40 border border-transparent hover:border-[#0875D9]/15'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={item.employee.avatar}
                        alt={item.employee.name}
                        referrerPolicy="no-referrer"
                        className={'w-10 h-10 rounded-full object-cover ring-2 ring-offset-1 ring-offset-white ' + (
                          item.status === 'ACTIVE'
                            ? 'ring-emerald-400/80'
                            : item.status === 'IDLE'
                            ? 'ring-amber-400/80'
                            : 'ring-slate-200'
                        )}
                      />
                      <span
                        className={'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white shadow-2xs ' + (
                          item.status === 'ACTIVE'
                            ? 'bg-emerald-500 ring-2 ring-emerald-300/40'
                            : item.status === 'IDLE'
                            ? 'bg-amber-500'
                            : 'bg-slate-300'
                        )}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-900 truncate group-hover:text-[#0875D9] transition-colors">
                          {item.employee.name}
                        </span>
                        {isMe && (
                          <span className="text-[10px] bg-[#0875D9] text-white px-1.5 py-0.2 rounded-md font-bold shadow-2xs">
                            Bạn
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-slate-400">
                          {item.employee.code}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-md truncate max-w-[120px]">
                          {dept?.name || item.employee.departmentId}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.employee.roleTitle}
                      </div>

                      <div
                        className={'text-[11px] truncate font-medium flex items-center gap-1.5 mt-0.5 ' + (
                          item.status === 'ACTIVE'
                            ? 'text-emerald-700'
                            : item.status === 'IDLE'
                            ? 'text-amber-700'
                            : 'text-slate-400'
                        )}
                      >
                        {item.status === 'ACTIVE' ? (
                          <Activity className="w-3 h-3 text-emerald-500 shrink-0 animate-pulse" />
                        ) : item.status === 'IDLE' ? (
                          <Moon className="w-3 h-3 text-amber-500 shrink-0" />
                        ) : (
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        )}
                        <span className="truncate">{item.currentActivity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-1.5">
                      {getStatusBadge(item.status)}
                      <span
                        className="p-1 rounded-lg bg-slate-100 text-slate-600 text-xs border border-slate-200/60"
                        title={item.device === 'WEB' ? 'Đang truy cập trình duyệt Web' : 'Đang truy cập qua Mobile App'}
                      >
                        {item.device === 'WEB' ? (
                          <Laptop className="w-3.5 h-3.5" />
                        ) : (
                          <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                        )}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.activeSince}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-100 bg-[#F4F8FC] flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px]">
              Tự động cập nhật: Đang thao tác (🟢), Treo tab khi ẩn tab/không thao tác &gt; 1p (🟡), Logout thì vắng (⚪)
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gradient-to-r from-[#0875D9] to-[#0B4FA8] hover:from-[#0B4FA8] hover:to-[#063B78] text-white font-semibold rounded-xl transition-all shadow-xs cursor-pointer text-xs"
          >
            Đóng Lại
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
