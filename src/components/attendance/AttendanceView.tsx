import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkLocation, LeaveRequest } from '../../types';
import {
  Clock,
  MapPin,
  Wifi,
  Camera,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Plus,
  Check,
  X,
  Calendar,
  Building,
  Laptop,
  Briefcase
} from 'lucide-react';
import { LeaveRequestModal } from './LeaveRequestModal';

export const AttendanceView: React.FC = () => {
  const {
    currentUser,
    todayAttendance,
    attendanceRecords,
    leaveRequests,
    checkIn,
    checkOut,
    approveLeaveRequest,
    rejectLeaveRequest,
    employees
  } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedLocation, setSelectedLocation] = useState<WorkLocation>('OFFICE');
  const [punchNote, setPunchNote] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'records' | 'leaves'>('records');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>('all');

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeFormatted = currentTime.toTimeString().split(' ')[0]; // HH:mm:ss
  const dateFormatted = currentTime.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleCheckIn = () => {
    const result = checkIn(selectedLocation, punchNote);
    setFeedbackMessage({
      text: result.message,
      type: result.success ? 'success' : 'error'
    });
    if (result.success) setPunchNote('');
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  const handleCheckOut = () => {
    const result = checkOut(punchNote);
    setFeedbackMessage({
      text: result.message,
      type: result.success ? 'success' : 'error'
    });
    if (result.success) setPunchNote('');
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  const canApprove = currentUser.role === 'CEO' || currentUser.role === 'MANAGER' || currentUser.role === 'HR';

  // Filter attendance records
  const filteredRecords = attendanceRecords.filter(rec => {
    if (filterEmployeeId !== 'all' && rec.employeeId !== filterEmployeeId) return false;
    return true;
  });

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              Hệ Thống Chấm Công & Quản Lý Ca
            </h1>
            <span className="font-mono text-xs font-bold text-[#0875D9] bg-[#EAF5FF] px-2.5 py-1 rounded-lg border border-[#0875D9]/25 flex items-center gap-1.5 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-[#0875D9]" />
              <span>Ca Làm Việc: 8:00 AM - 17:30 PM</span>
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Ghi nhận thời gian làm việc thời gian thực, xác thực định vị văn phòng và phê duyệt đơn phép
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLeaveModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Đơn Nghỉ / OT</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-lg border text-xs font-medium flex items-center justify-between transition-all ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Check-In Control Box & Biometric Sim */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Punch Clock Panel */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs text-slate-400 font-medium capitalize">{dateFormatted}</div>
              <div className="text-3xl font-mono font-bold tracking-tight text-slate-900 mt-1 tabular-nums">
                {timeFormatted}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Ca làm việc:</span>
              <span className="font-bold text-[#063B78] bg-[#EAF5FF] border border-[#0875D9]/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-[#0875D9]" />
                <span>8:00 AM - 17:30 PM (Ca Hành Chính)</span>
              </span>
            </div>
          </div>

          {/* Location Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Chọn hình thức làm việc hôm nay
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedLocation('OFFICE')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedLocation === 'OFFICE'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                  <Building className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Tại Văn Phòng HQ</span>
                </div>
                <div className="text-[11px] text-slate-500 leading-tight">
                  Tòa Keangnam 72 (GPS hợp lệ)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedLocation('REMOTE')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedLocation === 'REMOTE'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                  <Laptop className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Làm Việc Từ Xa (WFH)</span>
                </div>
                <div className="text-[11px] text-slate-500 leading-tight">
                  Theo hạn mức 4 ngày/tháng
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedLocation('BUSINESS_TRIP')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedLocation === 'BUSINESS_TRIP'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Đi Công Tác / Ngoại Kiểm</span>
                </div>
                <div className="text-[11px] text-slate-500 leading-tight">
                  Gặp khách hàng & đối tác
                </div>
              </button>
            </div>
          </div>

          {/* Environmental validation telemetry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px]">
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>GPS: 21.0173° N, 105.7838° E (Bán kính 25m - Khớp vị trí)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Wifi className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>SSID: OmniCorp_HQ_Secure (IP: 118.70.180.25)</span>
            </div>
          </div>

          {/* Note input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Ghi chú công việc / Địa điểm cụ thể (không bắt buộc)
            </label>
            <input
              type="text"
              value={punchNote}
              onChange={(e) => setPunchNote(e.target.value)}
              placeholder="VD: Sáng họp với phòng Sản phẩm, chiều qua văn phòng Viettel..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
            <button
              onClick={handleCheckIn}
              disabled={!!todayAttendance?.checkIn}
              className={`flex-1 py-3 px-4 min-h-[48px] rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-xs ${
                todayAttendance?.checkIn
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.98]'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>
                {todayAttendance?.checkIn
                  ? `ĐÃ VÀO CA (${todayAttendance.checkIn})`
                  : 'CHẤM CÔNG VÀO CA'}
              </span>
            </button>

            <button
              onClick={handleCheckOut}
              disabled={!todayAttendance?.checkIn || !!todayAttendance?.checkOut}
              className={`flex-1 py-3 px-4 min-h-[48px] rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-xs ${
                !todayAttendance?.checkIn || todayAttendance?.checkOut
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-[0.98]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {todayAttendance?.checkOut
                  ? `ĐÃ RA VỀ (${todayAttendance.checkOut})`
                  : 'CHẤM CÔNG RA VỀ'}
              </span>
            </button>

            <button
              onClick={() => setCameraActive(!cameraActive)}
              className="p-3 min-h-[48px] min-w-[48px] flex items-center justify-center text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Mở camera nhận diện khuôn mặt / mã QR"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Col: Today Status & Biometric Face ID Simulator */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-800">Thông tin nhân sự</span>
            <span className="text-[11px] font-mono text-indigo-600 font-semibold">{currentUser.code}</span>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-xs"
            />
            <div>
              <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
              <div className="text-[11px] text-slate-500">{currentUser.roleTitle}</div>
              <div className="text-[11px] text-slate-400">{currentUser.email}</div>
            </div>
          </div>

          {/* Today summary details */}
          <div className="space-y-2 py-2 border-y border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Trạng thái vào ca:</span>
              <span className="font-semibold text-slate-800">
                {todayAttendance?.checkIn ? (
                  todayAttendance.status === 'LATE' ? (
                    <span className="text-amber-600">Đi trễ ({todayAttendance.checkIn})</span>
                  ) : (
                    <span className="text-emerald-600">Đúng giờ ({todayAttendance.checkIn})</span>
                  )
                ) : (
                  <span className="text-slate-400">Chưa ghi nhận</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Giờ ra về:</span>
              <span className="font-mono text-slate-800">
                {todayAttendance?.checkOut || 'Đang trong giờ làm'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Giờ làm việc tích lũy:</span>
              <span className="font-mono font-bold text-indigo-600">
                {todayAttendance ? `${todayAttendance.workHours} giờ` : '0 giờ'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Phép năm còn lại:</span>
              <span className="font-mono font-semibold text-slate-800">
                {currentUser.annualLeaveRemaining} ngày
              </span>
            </div>
          </div>

          {/* Camera / Biometric Frame Simulation */}
          {cameraActive ? (
            <div className="relative aspect-4/3 bg-slate-950 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4 border border-indigo-500/40">
              <div className="w-24 h-24 border-2 border-dashed border-emerald-400 rounded-full animate-pulse flex items-center justify-center">
                <Camera className="w-8 h-8 text-emerald-400/80" />
              </div>
              <div className="mt-3 text-[11px] text-emerald-300 font-mono text-center">
                ● Đang quét khuôn mặt AI (99.8% Match)
              </div>
              <button
                onClick={() => setCameraActive(false)}
                className="absolute top-2 right-2 text-slate-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => setCameraActive(true)}
              className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <Camera className="w-5 h-5 mx-auto text-slate-400 mb-1" />
              <div className="text-[11px] font-medium text-slate-600">Chụp ảnh xác thực FaceID / Quét QR</div>
              <div className="text-[10px] text-slate-400">Nhấn để kích hoạt camera AI</div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs: Bảng Chấm Công vs Quản Lý Đơn Từ */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-4 border-b border-slate-200">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveSubTab('records')}
              className={`pb-3 text-xs font-semibold transition-all relative ${
                activeSubTab === 'records'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Bảng Chấm Công Chi Tiết ({filteredRecords.length})
            </button>
            <button
              onClick={() => setActiveSubTab('leaves')}
              className={`pb-3 text-xs font-semibold transition-all relative ${
                activeSubTab === 'leaves'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đơn Từ & Phê Duyệt ({leaveRequests.length})
            </button>
          </div>

          {activeSubTab === 'records' && (
            <div className="flex items-center gap-2 pb-3">
              <span className="text-xs text-slate-500 hidden sm:inline">Lọc nhân sự:</span>
              <select
                value={filterEmployeeId}
                onChange={(e) => setFilterEmployeeId(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none"
              >
                <option value="all">Tất cả nhân viên</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {activeSubTab === 'records' ? (
          /* High-density Attendance Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
                  <th className="py-2.5 px-4">Nhân sự</th>
                  <th className="py-2.5 px-3">Ngày</th>
                  <th className="py-2.5 px-3 font-mono">Giờ vào</th>
                  <th className="py-2.5 px-3 font-mono">Giờ ra</th>
                  <th className="py-2.5 px-3 font-mono text-right">Tổng giờ</th>
                  <th className="py-2.5 px-3 font-mono text-right">Tăng ca (OT)</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3">Địa điểm & Mạng</th>
                  <th className="py-2.5 px-4">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredRecords.map(rec => {
                  const emp = employees.find(e => e.id === rec.employeeId);
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={emp?.avatar || currentUser.avatar}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-semibold text-slate-900">{emp?.name || rec.employeeId}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{emp?.code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 tabular-nums">
                        {rec.date}
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-800 tabular-nums">
                        {rec.checkIn || '--:--'}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 tabular-nums">
                        {rec.checkOut || '--:--'}
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-900 text-right tabular-nums">
                        {rec.workHours}h
                      </td>
                      <td className="py-3 px-3 font-mono text-right tabular-nums">
                        {rec.overtimeHours > 0 ? (
                          <span className="text-indigo-600 font-semibold">+{rec.overtimeHours}h</span>
                        ) : (
                          <span className="text-slate-400">0h</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              rec.status === 'ON_TIME'
                                ? 'bg-emerald-500'
                                : rec.status === 'LATE'
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                          />
                          <span className="font-medium text-slate-700">
                            {rec.status === 'ON_TIME' ? 'Đúng giờ' : rec.status === 'LATE' ? 'Đi trễ' : 'Vắng'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <div>
                          {rec.location === 'OFFICE' ? 'Tại Văn Phòng HQ' : rec.location === 'REMOTE' ? 'Làm Việc Từ Xa' : 'Đi Công Tác'}
                        </div>
                        {rec.ipAddress && (
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-[160px]">
                            {rec.ipAddress}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-[200px] truncate">
                        {rec.note || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Leave Requests Workflow Table */
          <div className="p-4 space-y-3">
            <div className="text-xs text-slate-500 flex items-center justify-between pb-2 border-b border-slate-100">
              <span>Danh sách các đề xuất nghỉ phép, làm thêm giờ và phê duyệt</span>
              <span className="font-mono">
                {leaveRequests.filter(r => r.status === 'PENDING').length} đơn đang chờ phê duyệt
              </span>
            </div>

            <div className="space-y-2">
              {leaveRequests.map(req => {
                const isPending = req.status === 'PENDING';
                return (
                  <div
                    key={req.id}
                    className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors bg-white flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900 text-xs">{req.employeeName}</span>
                        <span className="text-slate-400 text-xs">·</span>
                        <span className="font-medium text-indigo-700 text-xs">
                          {req.type === 'ANNUAL'
                            ? 'Nghỉ phép năm'
                            : req.type === 'OVERTIME'
                            ? 'Làm thêm giờ (OT)'
                            : req.type === 'SICK'
                            ? 'Nghỉ ốm'
                            : req.type}
                        </span>
                        <span className="text-slate-400 text-xs">·</span>
                        <span className="font-mono text-slate-500 text-xs">
                          {req.startDate} {req.startDate !== req.endDate ? `đến ${req.endDate}` : ''} ({req.totalDays} ngày)
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">{req.reason}</p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>Gửi lúc: {req.createdAt}</span>
                        {req.approverName && (
                          <>
                            <span>·</span>
                            <span>Người duyệt: {req.approverName} ({req.approvalDate})</span>
                          </>
                        )}
                        {req.approvalNote && (
                          <>
                            <span>·</span>
                            <span className="text-slate-600">Ghi chú: {req.approvalNote}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status & Approval Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            req.status === 'APPROVED'
                              ? 'bg-emerald-500'
                              : req.status === 'REJECTED'
                              ? 'bg-red-500'
                              : 'bg-amber-400'
                          }`}
                        />
                        <span className="font-medium text-slate-700">
                          {req.status === 'APPROVED' ? 'Đã duyệt' : req.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                        </span>
                      </div>

                      {isPending && canApprove && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => approveLeaveRequest(req.id, 'Đồng ý phê duyệt')}
                            className="px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 rounded-md transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Duyệt</span>
                          </button>
                          <button
                            onClick={() => rejectLeaveRequest(req.id, 'Chưa đủ điều kiện xét duyệt')}
                            className="px-2.5 py-1.5 text-xs font-medium text-red-700 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 rounded-md transition-colors flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Từ chối</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Leave Request Modal */}
      <LeaveRequestModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
      />
    </div>
  );
};
