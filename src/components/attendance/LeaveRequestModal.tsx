import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LeaveType } from '../../types';
import { X, Calendar, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaveRequestModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { currentUser, createLeaveRequest, celebrate } = useApp();

  const [type, setType] = useState<LeaveType>('ANNUAL');
  const [startDate, setStartDate] = useState('2026-10-02');
  const [endDate, setEndDate] = useState('2026-10-02');
  const [totalDays, setTotalDays] = useState(1);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do cụ thể');
      return;
    }
    if (totalDays <= 0) {
      setError('Số ngày đăng ký phải lớn hơn 0');
      return;
    }

    createLeaveRequest(type, startDate, endDate, totalDays, reason.trim());
    celebrate();
    onClose();
  };

  const getTypeName = (t: LeaveType) => {
    switch (t) {
      case 'ANNUAL': return 'Nghỉ phép năm (AL - Hưởng nguyên lương)';
      case 'SICK': return 'Nghỉ ốm đau / Khám bệnh (SL - Hưởng BHXH)';
      case 'OVERTIME': return 'Đăng ký làm thêm giờ (OT - Tính hệ số 150-200%)';
      case 'LATE_EARLY': return 'Đăng ký đi muộn / Về sớm (Lý do chính đáng)';
      case 'UNPAID': return 'Nghỉ không hưởng lương';
      case 'MATERNITY': return 'Chế độ thai sản / Chăm sóc con ốm';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Tạo Đơn Từ Phê Duyệt</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Đơn sẽ tự động chuyển tới Quản lý trực tiếp và Trưởng phòng Nhân sự
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Employee summary */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-800">{currentUser.name}</div>
              <div className="text-slate-500">{currentUser.roleTitle} · Mã: {currentUser.code}</div>
            </div>
            <div className="text-right">
              <div className="text-slate-500">Phép năm còn lại</div>
              <div className="font-mono font-bold text-indigo-600 text-sm">{currentUser.annualLeaveRemaining} ngày</div>
            </div>
          </div>

          {/* Request Type */}
          <div>
            <label className="block font-medium text-slate-700 mb-1.5">Loại đơn từ đề xuất</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as LeaveType)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ANNUAL">{getTypeName('ANNUAL')}</option>
              <option value="OVERTIME">{getTypeName('OVERTIME')}</option>
              <option value="SICK">{getTypeName('SICK')}</option>
              <option value="LATE_EARLY">{getTypeName('LATE_EARLY')}</option>
              <option value="UNPAID">{getTypeName('UNPAID')}</option>
            </select>
          </div>

          {/* Dates & duration */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1.5">Từ ngày</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1.5">Đến ngày</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1.5">Số ngày / ca</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="30"
                value={totalDays}
                onChange={(e) => setTotalDays(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block font-medium text-slate-700 mb-1.5">
              Lý do chi tiết & Kế hoạch bàn giao công việc
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Nghỉ việc riêng gia đình; đã bàn giao đầu mối xử lý task gấp cho bạn Linh cùng phòng..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors"
            >
              Gửi Đơn Phê Duyệt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
