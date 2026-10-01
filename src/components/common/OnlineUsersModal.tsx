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
  Briefcase
} from 'lucide-react';
import { DepartmentId } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface OnlineUser {
  employee: any;
  status: 'ONLINE' | 'BUSY' | 'MEETING' | 'AWAY';
  device: 'WEB' | 'MOBILE';
  activeSince: string;
  currentActivity: string;
}

export const OnlineUsersModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { employees, currentUser, departments } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

  // Build online list: All employees currently in state are treated as active/online in the demo
  const onlineList: OnlineUser[] = useMemo(() => {
    return employees.map((emp, index) => {
      // Deterministic realistic statuses based on employee ID / role
      const statuses: ('ONLINE' | 'BUSY' | 'MEETING' | 'AWAY')[] = [
        'ONLINE',
        'ONLINE',
        'BUSY',
        'MEETING',
        'ONLINE',
        'AWAY'
      ];
      const devices: ('WEB' | 'MOBILE')[] = ['WEB', 'WEB', 'WEB', 'MOBILE', 'WEB', 'MOBILE'];
      const activities = [
        'Đang theo dõi chỉ số KPI & duyệt ngân sách',
        'Đang điều phối sprint & rà soát mã nguồn',
        'Đang phỏng vấn ứng viên & hoàn thiện hồ sơ',
        'Đang thực hiện nhiệm vụ & phát triển tính năng',
        'Đang hoàn thiện wireframe & prototype giao diện',
        'Đang trao đổi hợp đồng cùng đối tác khách hàng'
      ];

      const status = emp.id === currentUser.id ? 'ONLINE' : statuses[index % statuses.length];
      const device = devices[index % devices.length];
      const currentActivity = activities[index % activities.length];
      const activeSince = index === 0 ? 'Vừa mới đây' : `${(index * 7 + 3) % 45 + 5} phút trước`;

      return {
        employee: emp,
        status,
        device,
        activeSince,
        currentActivity
      };
    });
  }, [employees, currentUser.id]);

  // Filter list
  const filteredList = useMemo(() => {
    return onlineList.filter(item => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.employee.name.toLowerCase().includes(q) ||
        item.employee.roleTitle.toLowerCase().includes(q) ||
        (item.employee.code && item.employee.code.toLowerCase().includes(q)) ||
        item.currentActivity.toLowerCase().includes(q);

      const matchDept =
        departmentFilter === 'ALL' || item.employee.departmentId === departmentFilter;

      return matchSearch && matchDept;
    });
  }, [onlineList, searchTerm, departmentFilter]);

  // Statistics
  const totalOnline = onlineList.length;
  const webCount = onlineList.filter(u => u.device === 'WEB').length;
  const mobileCount = onlineList.filter(u => u.device === 'MOBILE').length;

  if (!isOpen) return null;

  const getStatusBadge = (status: 'ONLINE' | 'BUSY' | 'MEETING' | 'AWAY') => {
    switch (status) {
      case 'ONLINE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Trực Tuyến
          </span>
        );
      case 'BUSY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Bận Tập Trung
          </span>
        );
      case 'MEETING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/80 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            Đang Họp
          </span>
        );
      case 'AWAY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/80 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Tạm Vắng
          </span>
        );
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 my-auto">
        {/* Header - Glassmorphism SaaS Brand Style */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-[#EAF5FF] via-white to-[#F4F8FC] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0875D9] to-[#0B4FA8] text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#063B78] tracking-tight">
                  Nhân Sự Đang Trực Tuyến
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#16C784]/15 text-[#107C41] border border-[#16C784]/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16C784] animate-pulse" />
                  {totalOnline} Đang Hoạt Động
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Hệ thống làm việc & cộng tác nội bộ Mrex Agency
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Summary Metrics Bar */}
        <div className="px-5 sm:px-6 py-2.5 bg-[#F4F8FC] border-b border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#16C784]" />
              <span className="font-semibold text-slate-800 font-mono">{totalOnline}</span>
              <span className="text-slate-500">nhân sự online</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-[#0875D9]" />
              <span className="font-semibold text-slate-800 font-mono">{webCount}</span>
              <span className="text-slate-500">trình duyệt Web</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-purple-600" />
              <span className="font-semibold text-slate-800 font-mono">{mobileCount}</span>
              <span className="text-slate-500">Mobile App</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline font-medium">
            Tỉ lệ hiện diện: 100%
          </span>
        </div>

        {/* Filters & Search */}
        <div className="p-4 border-b border-slate-100 bg-white space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, chức danh, mã nhân viên, công việc đang làm..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0875D9]/30 transition-all"
            />
          </div>

          {/* Department Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'exec', label: 'Ban Quản Trị' },
              { id: 'production', label: 'Kh\u1ed1i S\u1ea3n Xu\u1ea5t & Kho V\u1eadn' },
              { id: 'it_seo', label: 'Ph\u00f2ng IT & SEO' },
              { id: 'social', label: 'Ph\u00f2ng Social Media' },
              { id: 'internal_comms', label: 'Truy\u1ec1n Th\u00f4ng N\u1ed9i B\u1ed9' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setDepartmentFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  departmentFilter === tab.id
                    ? 'bg-[#0875D9] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Online Users List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-slate-100">
          {filteredList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Không tìm thấy nhân sự phù hợp với điều kiện tìm kiếm
            </div>
          ) : (
            filteredList.map(item => {
              const dept = departments.find(d => d.id === item.employee.departmentId);
              return (
                <div
                  key={item.employee.id}
                  className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 p-2.5 rounded-2xl hover:bg-[#EAF5FF]/40 border border-transparent hover:border-[#0875D9]/15 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={item.employee.avatar}
                        alt={item.employee.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-[#0875D9]/30 ring-offset-1 ring-offset-white"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#16C784] rounded-full border-2 border-white shadow-2xs" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 truncate group-hover:text-[#0875D9] transition-colors">
                          {item.employee.name}
                        </span>
                        {item.employee.id === currentUser.id && (
                          <span className="text-[10px] bg-[#0875D9] text-white px-1.5 py-0.2 rounded-md font-bold">
                            Bạn
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-slate-400">
                          {item.employee.code}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-md truncate max-w-[110px]">
                          {dept?.name || item.employee.departmentId}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.employee.roleTitle}
                      </div>

                      <div className="text-[11px] text-[#0875D9] truncate font-medium flex items-center gap-1 mt-0.5">
                        <Activity className="w-3 h-3 text-[#0875D9] shrink-0" />
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
                          <Smartphone className="w-3.5 h-3.5" />
                        )}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Online: {item.activeSince}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-100 bg-[#F4F8FC] flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16C784] animate-pulse" />
            <span className="text-[11px]">Tự động đồng bộ trạng thái thời gian thực (Realtime Heartbeat)</span>
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
