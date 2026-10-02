import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkLocation, LeaveRequest } from '../../types';
import {
  Clock,
  MapPin,
  Wifi,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Plus,
  Check,
  X,
  Calendar,
  Building,
  Laptop,
  Briefcase,
  Navigation,
  RotateCcw,
  LocateFixed,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { LeaveRequestModal } from './LeaveRequestModal';

interface GpsState {
  latitude: number;
  longitude: number;
  accuracy: number;
  status: 'IDLE' | 'LOCATING' | 'SUCCESS' | 'ERROR';
  address: string;
  errorMsg?: string;
  updatedAt: string;
}

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
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>('all');

  // GPS Real-time Telemetry State
  const [gps, setGps] = useState<GpsState>({
    latitude: 21.017345,
    longitude: 105.783812,
    accuracy: 15,
    status: 'IDLE',
    address: 'Trụ sở chính: Tầng 18, Keangnam Landmark 72, Nam Từ Liêm, Hà Nội',
    updatedAt: '--:--:--'
  });
  const [isLocating, setIsLocating] = useState(false);

  // Confirmation Modal state to prevent accidental misclicks
  const [confirmAction, setConfirmAction] = useState<'CHECK_IN' | 'CHECK_OUT' | null>(null);

  // Real-time GPS Fetcher
  const fetchRealtimeGps = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      setGps(prev => ({
        ...prev,
        status: 'ERROR',
        errorMsg: 'Trình duyệt không hỗ trợ Geolocation GPS',
        updatedAt: new Date().toLocaleTimeString('vi-VN')
      }));
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const acc = Math.round(pos.coords.accuracy);
        const time = new Date().toLocaleTimeString('vi-VN');
        setGps({
          latitude: lat,
          longitude: lng,
          accuracy: acc,
          status: 'SUCCESS',
          address: `Vị trí thực tế: ${lat}° N, ${lng}° E (Sai số ±${acc}m)`,
          updatedAt: time
        });
        setIsLocating(false);
      },
      (err) => {
        const time = new Date().toLocaleTimeString('vi-VN');
        let msg = 'Không thể lấy tín hiệu GPS';
        if (err.code === 1) msg = 'Chưa cấp quyền vị trí (Đang dùng GPS dự phòng trụ sở)';
        else if (err.code === 2) msg = 'Mất tín hiệu định vị vệ tinh';
        else if (err.code === 3) msg = 'Quá thời gian chờ GPS (Timeout)';

        setGps(prev => ({
          ...prev,
          status: 'ERROR',
          errorMsg: msg,
          updatedAt: time
        }));
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Clock tick & Initial GPS fetch
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchRealtimeGps();
    return () => clearInterval(timer);
  }, []);

  const timeFormatted = currentTime.toTimeString().split(' ')[0]; // HH:mm:ss
  const dateFormatted = currentTime.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Execute Confirmed Attendance Punch
  const handleExecuteAction = () => {
    if (!confirmAction) return;

    const gpsSummary = gps.status === 'SUCCESS'
      ? `${gps.latitude}° N, ${gps.longitude}° E (±${gps.accuracy}m)`
      : `${gps.latitude}° N, ${gps.longitude}° E (Trụ sở Keangnam 72)`;

    if (confirmAction === 'CHECK_IN') {
      const result = checkIn(selectedLocation, punchNote, gpsSummary);
      setFeedbackMessage({
        text: result.message,
        type: result.success ? 'success' : 'error'
      });
      if (result.success) setPunchNote('');
    } else if (confirmAction === 'CHECK_OUT') {
      const result = checkOut(punchNote, gpsSummary);
      setFeedbackMessage({
        text: result.message,
        type: result.success ? 'success' : 'error'
      });
      if (result.success) setPunchNote('');
    }

    setConfirmAction(null);
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
            Ghi nhận thời gian làm việc thời gian thực, xác thực định vị vệ tinh GPS và phê duyệt đơn phép
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLeaveModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors min-h-[44px] cursor-pointer"
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

      {/* Main Check-In Control Box & GPS Telemetry */}
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
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
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
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
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
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
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

          {/* Environmental validation telemetry with Live GPS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px]">
            <div className="flex items-center justify-between gap-2 text-slate-600">
              <div className="flex items-center gap-2 min-w-0">
                <Navigation className={`w-4 h-4 shrink-0 ${
                  gps.status === 'SUCCESS' ? 'text-emerald-600 animate-pulse' : 'text-amber-500'
                }`} />
                <div className="truncate">
                  <span className="font-semibold block text-slate-800">
                    GPS: {gps.latitude}° N, {gps.longitude}° E
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Bán kính: ±{gps.accuracy}m · {gps.status === 'SUCCESS' ? 'Đã định vị vệ tinh' : (gps.errorMsg || 'Chế độ dự phòng')}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={fetchRealtimeGps}
                disabled={isLocating}
                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all shrink-0 cursor-pointer"
                title="Lấy lại tọa độ GPS thực tế"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-indigo-600' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-2 text-slate-600">
              <Wifi className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-semibold block text-slate-800">Mạng: OmniCorp_HQ_Secure</span>
                <span className="text-[10px] text-slate-400">IP: 118.70.180.25 (Đường truyền doanh nghiệp)</span>
              </div>
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
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
          </div>

          {/* Action buttons (Camera button removed) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setConfirmAction('CHECK_IN')}
              disabled={!!todayAttendance?.checkIn}
              className={`flex-1 py-3 px-4 min-h-[50px] rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
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
              type="button"
              onClick={() => setConfirmAction('CHECK_OUT')}
              disabled={!todayAttendance?.checkIn || !!todayAttendance?.checkOut}
              className={`flex-1 py-3 px-4 min-h-[50px] rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
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
          </div>
        </div>

        {/* Right Col: Today Status & GPS Station Telemetry (Camera Removed) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
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
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{currentUser.roleTitle}</div>
                <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
              </div>
            </div>

            {/* Today summary details */}
            <div className="space-y-2 py-2 border-y border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Trạng thái vào ca:</span>
                <span className="font-semibold text-slate-800">
                  {todayAttendance?.checkIn ? (
                    todayAttendance.status === 'LATE' ? (
                      <span className="text-amber-600 font-bold">Đi trễ ({todayAttendance.checkIn})</span>
                    ) : (
                      <span className="text-emerald-600 font-bold">Đúng giờ ({todayAttendance.checkIn})</span>
                    )
                  ) : (
                    <span className="text-slate-400">Chưa ghi nhận</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Giờ ra về:</span>
                <span className="font-mono text-slate-800 font-semibold">
                  {todayAttendance?.checkOut || (todayAttendance?.checkIn ? 'Đang trong giờ làm' : '--:--:--')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Giờ làm tích lũy:</span>
                <span className="font-mono font-bold text-indigo-600">
                  {todayAttendance ? `${todayAttendance.workHours} giờ` : '0.0 giờ'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Phép năm còn lại:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {currentUser.annualLeaveRemaining} ngày
                </span>
              </div>
            </div>
          </div>

          {/* GPS Radar Telemetry Panel (Replaces Camera) */}
          <div className="p-3.5 bg-gradient-to-br from-emerald-50/70 via-slate-50 to-blue-50/50 border border-emerald-200/80 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block leading-tight">Định Vị Vệ Tinh GPS</span>
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                    {gps.status === 'SUCCESS' ? 'Tín hiệu GPS chuẩn' : isLocating ? 'Đang định vị...' : 'Sẵn sàng ghi nhận'}
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10.5px] text-slate-400">{gps.updatedAt}</span>
            </div>

            <div className="p-2 bg-white/90 rounded-lg border border-emerald-100 space-y-1 font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-400">Vĩ độ (Lat):</span>
                <span className="font-bold text-emerald-800">{gps.latitude}° N</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-400">Kinh độ (Lng):</span>
                <span className="font-bold text-emerald-800">{gps.longitude}° E</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-400">Sai số bán kính:</span>
                <span className="font-bold text-slate-800">± {gps.accuracy} mét</span>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchRealtimeGps}
              disabled={isLocating}
              className="w-full py-2 px-3 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{isLocating ? 'Đang cập nhật GPS...' : 'Cập nhật lại GPS hiện tại'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs: Bảng Chấm Công vs Quản Lý Đơn Từ */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-4 border-b border-slate-200">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveSubTab('records')}
              className={`pb-3 text-xs font-semibold transition-all relative cursor-pointer ${
                activeSubTab === 'records'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Bảng Chấm Công Chi Tiết ({filteredRecords.length})
            </button>
            <button
              onClick={() => setActiveSubTab('leaves')}
              className={`pb-3 text-xs font-semibold transition-all relative cursor-pointer ${
                activeSubTab === 'leaves'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold'
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
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Tất cả nhân sự ({employees.length})</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {activeSubTab === 'records' ? (
          /* Attendance Records Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Nhân Sự</th>
                  <th className="py-3 px-3">Ngày</th>
                  <th className="py-3 px-3">Vào Ca</th>
                  <th className="py-3 px-3">Ra Về</th>
                  <th className="py-3 px-3">Tổng Giờ</th>
                  <th className="py-3 px-3">Trạng Thái</th>
                  <th className="py-3 px-3">Địa Điểm & Tọa Độ GPS</th>
                  <th className="py-3 px-4">Ghi Chú</th>
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
                      <td className="py-3 px-3 font-mono font-medium text-slate-800 tabular-nums">
                        {rec.checkOut || '--:--'}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-indigo-700">
                        {rec.workHours}h
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold text-[10px] inline-flex items-center gap-1 ${
                            rec.status === 'ON_TIME'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : rec.status === 'LATE'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              rec.status === 'ON_TIME'
                                ? 'bg-emerald-500'
                                : rec.status === 'LATE'
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                          />
                          {rec.status === 'ON_TIME'
                            ? 'Đúng giờ'
                            : rec.status === 'LATE'
                            ? 'Đi trễ'
                            : 'Vắng mặt'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-700">
                          {rec.location === 'OFFICE'
                            ? 'Văn phòng HQ'
                            : rec.location === 'REMOTE'
                            ? 'Làm việc từ xa (WFH)'
                            : 'Đi công tác'}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-mono truncate max-w-[200px]" title={rec.locationDetails}>
                          {rec.locationDetails || 'GPS Verified'}
                        </div>
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
              <span className="font-mono font-bold text-indigo-600">
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
                            className="px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Duyệt</span>
                          </button>
                          <button
                            onClick={() => rejectLeaveRequest(req.id, 'Chưa đủ điều kiện xét duyệt')}
                            className="px-2.5 py-1.5 text-xs font-medium text-red-700 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
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

      {/* MODAL XÁC NHẬN CHẤM CÔNG (TRÁNH NHẤN NHẦM) */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setConfirmAction(null)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  confirmAction === 'CHECK_IN'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {confirmAction === 'CHECK_IN' ? (
                    <Clock className="w-5 h-5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {confirmAction === 'CHECK_IN' ? 'Xác Nhận Chấm Công Vào Ca' : 'Xác Nhận Chấm Công Ra Về'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Xác thực thời gian và vị trí định vị</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thông tin xác nhận */}
            <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Nhân sự:</span>
                <div className="flex items-center gap-2">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover border border-slate-200"
                  />
                  <span className="font-bold text-slate-900">{currentUser.name}</span>
                  <span className="font-mono text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-semibold">{currentUser.code}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Thời gian ghi nhận:</span>
                <span className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                  {timeFormatted} <span className="text-[11px] font-normal text-slate-500">({dateFormatted})</span>
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Hình thức làm việc:</span>
                <span className="font-semibold text-slate-800">
                  {selectedLocation === 'OFFICE'
                    ? '🏢 Tại Văn Phòng HQ'
                    : selectedLocation === 'REMOTE'
                    ? '💻 Làm Việc Từ Xa (WFH)'
                    : '💼 Đi Công Tác / Ngoại Kiểm'}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-500 font-medium shrink-0">Tọa độ GPS ghi nhận:</span>
                <div className="text-right">
                  <span className="font-mono text-emerald-700 font-bold block text-xs">
                    {gps.latitude}° N, {gps.longitude}° E
                  </span>
                  <span className="text-[10.5px] text-slate-400 block">
                    Độ chính xác: ±{gps.accuracy}m · {gps.status === 'SUCCESS' ? 'Vệ tinh chuẩn' : 'Tọa độ mặc định'}
                  </span>
                </div>
              </div>

              {punchNote && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-500 font-medium block mb-1">Ghi chú kèm theo:</span>
                  <div className="p-2 bg-white rounded border border-slate-200 text-slate-700 italic text-[11px]">
                    "{punchNote}"
                  </div>
                </div>
              )}
            </div>

            {/* Warning block avoiding misclicks */}
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Vui lòng kiểm tra kỹ trước khi bấm xác nhận để tránh chấm công nhầm ca. Dữ liệu sẽ được lưu tự động vào Bảng công nội bộ của công ty.
              </span>
            </div>

            {/* Action buttons */}
            <div className="pt-1 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                className={`py-2.5 px-5 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
                  confirmAction === 'CHECK_IN'
                    ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]'
                    : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
                }`}
              >
                {confirmAction === 'CHECK_IN' ? (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Xác Nhận Vào Ca</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xác Nhận Ra Về</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Request Modal */}
      <LeaveRequestModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
      />
    </div>
  );
};
