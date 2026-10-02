import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Download,
  Printer,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  Building,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { generateExecutiveReportAI } from '../../services/aiService';

export const ReportsView: React.FC = () => {
  const {
    currentUser,
    employees,
    departments,
    attendanceRecords,
    tasks,
    reviews,
    leaveRequests,
    celebrate
  } = useApp();

  const isManagement = currentUser.role === 'CEO' || currentUser.role === 'MANAGER' || currentUser.role === 'HR';

  const [aiReportText, setAiReportText] = useState<string | null>(null);

  // SECURITY: Reports only visible to CEO/MANAGER/HR
  if (!isManagement) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-10 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Shield className="w-8 h-8 text-slate-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Quyền truy cập bị hạn chế</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xs">
            Báo cáo tổng thể chỉ dành cho Ban Giám Đốc, Quản Lý và phòng Nhân Sự.
          </p>
        </div>
      </div>
    );
  }
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Compute key metrics
  const totalEmployees = employees.length;
  const onTimeCount = attendanceRecords.filter(r => r.status === 'ON_TIME').length;
  const onTimeRate = attendanceRecords.length > 0
    ? Math.round((onTimeCount / attendanceRecords.length) * 100)
    : 100;

  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const taskCompletionRate = tasks.length > 0
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  const totalOtHours = attendanceRecords.reduce((sum, r) => sum + r.overtimeHours, 0);

  const avgKpi = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.managerScoreTotal, 0) / reviews.length
    : 4.2;

  const pendingApprovals = leaveRequests.filter(r => r.status === 'PENDING').length;

  // Department breakdown stats
  const deptStats = departments.map(d => {
    const deptEmps = employees.filter(e => e.departmentId === d.id);
    const deptTasks = tasks.filter(t => t.departmentId === d.id);
    const deptCompleted = deptTasks.filter(t => t.status === 'COMPLETED').length;
    const deptAttendance = attendanceRecords.filter(r =>
      deptEmps.some(e => e.id === r.employeeId)
    );
    const deptOnTime = deptAttendance.filter(r => r.status === 'ON_TIME').length;
    const deptOt = deptAttendance.reduce((sum, r) => sum + r.overtimeHours, 0);

    return {
      department: d,
      empCount: deptEmps.length,
      taskCount: deptTasks.length,
      completedTaskCount: deptCompleted,
      completionRate: deptTasks.length > 0 ? Math.round((deptCompleted / deptTasks.length) * 100) : 0,
      onTimeRate: deptAttendance.length > 0 ? Math.round((deptOnTime / deptAttendance.length) * 100) : 100,
      otHours: Number(deptOt.toFixed(1)),
    };
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Mã NV', 'Họ Tên', 'Phòng Ban', 'Ngày', 'Giờ Vào', 'Giờ Ra', 'Tổng Giờ', 'OT', 'Trạng Thái'];
    const rows = attendanceRecords.map(r => {
      const emp = employees.find(e => e.id === r.employeeId);
      const dept = departments.find(d => d.id === emp?.departmentId);
      return [
        emp?.code || r.employeeId,
        `"${emp?.name || ''}"`,
        `"${dept?.name || ''}"`,
        r.date,
        r.checkIn || '',
        r.checkOut || '',
        r.workHours,
        r.overtimeHours,
        r.status
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bao_Cao_Cham_Cong_OmniCorp_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    celebrate();
  };

  // AI Executive Report generator
  const handleGenerateAIReport = async () => {
    setIsGeneratingAI(true);
    try {
      const result = await generateExecutiveReportAI({
        totalEmployees,
        onTimeRate,
        completedTasks,
        totalTasks: tasks.length,
        avgKpi,
        pendingApprovals,
      });
      setAiReportText(result);
      celebrate();
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            Báo Cáo Điều Hành & Phân Tích Hiệu Suất
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Tổng hợp dữ liệu chuyên cần, năng suất dự án và phân tích chỉ số vận hành toàn công ty
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors min-h-[44px]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In / PDF</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors min-h-[44px]"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Xuất CSV</span>
          </button>

          <button
            onClick={handleGenerateAIReport}
            disabled={isGeneratingAI}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0875D9] hover:bg-[#065eb0] rounded-lg shadow-xs transition-colors min-h-[44px]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGeneratingAI ? 'AI đang tổng hợp...' : 'AI Tổng Hợp Điều Hành'}</span>
          </button>
        </div>
      </div>

      {/* AI Generated Briefing Modal / Card if active */}
      {aiReportText && (
        <div className="bg-blue-50/70 border border-[#0875D9]/25 rounded-xl p-6 space-y-4 text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-[#0875D9]/25">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0B4FA8]" />
              <h3 className="font-bold text-indigo-950 text-sm">
                Bản Tóm Tắt Điều Hành Do AI Tổng Hợp (Executive Brief)
              </h3>
            </div>
            <button
              onClick={() => setAiReportText(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              Đóng
            </button>
          </div>

          <div className="text-slate-800 leading-relaxed whitespace-pre-line font-sans">
            {aiReportText}
          </div>
        </div>
      )}

      {/* High-level Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Attendance Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Tỷ lệ chuyên cần</span>
            <Clock className="w-4 h-4 text-[#0875D9]" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
            {onTimeRate}%
          </div>
          <div className="text-[11px] text-slate-500">
            {onTimeCount}/{attendanceRecords.length} lượt chấm công đúng giờ
          </div>
        </div>

        {/* Card 2: Task Completion */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Tiến độ hoàn thành việc</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
            {taskCompletionRate}%
          </div>
          <div className="text-[11px] text-slate-500">
            {completedTasks}/{tasks.length} đầu việc đã nghiệm thu
          </div>
        </div>

        {/* Card 3: Performance Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Điểm KPI trung bình</span>
            <TrendingUp className="w-4 h-4 text-[#0875D9]" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
            {avgKpi.toFixed(2)}
            <span className="text-xs text-slate-400 font-normal"> / 5.0</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Xếp loại doanh nghiệp: Tốt (Chuẩn A)
          </div>
        </div>

        {/* Card 4: Overtime & Leave */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Tổng giờ tăng ca (OT)</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
            {totalOtHours}h
          </div>
          <div className="text-[11px] text-slate-500">
            {pendingApprovals} đơn từ đang chờ Ban Giám Đốc duyệt
          </div>
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900">Bảng Phân Tích Năng Suất Từng Khối Phòng Ban</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Số liệu đối chiếu giữa nhân sự, khối lượng việc và chuyên cần</p>
          </div>
          <span className="text-xs font-mono text-slate-400">Dữ liệu tháng 09/2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-2.5 px-4">Phòng ban</th>
                <th className="py-2.5 px-3 font-mono text-right">Nhân sự</th>
                <th className="py-2.5 px-3 font-mono text-right">Tổng task</th>
                <th className="py-2.5 px-3 font-mono text-right">Đã xong</th>
                <th className="py-2.5 px-3 font-mono text-right">Tỷ lệ xong</th>
                <th className="py-2.5 px-3 font-mono text-right">Đúng giờ</th>
                <th className="py-2.5 px-4 font-mono text-right">Giờ OT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deptStats.map(st => (
                <tr key={st.department.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{st.department.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">Mã: {st.department.code}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-right text-slate-800 tabular-nums">
                    {st.empCount}
                  </td>
                  <td className="py-3 px-3 font-mono text-right text-slate-800 tabular-nums">
                    {st.taskCount}
                  </td>
                  <td className="py-3 px-3 font-mono text-right text-slate-800 tabular-nums">
                    {st.completedTaskCount}
                  </td>
                  <td className="py-3 px-3 font-mono text-right font-bold text-slate-900 tabular-nums">
                    {st.completionRate}%
                  </td>
                  <td className="py-3 px-3 font-mono text-right text-emerald-700 tabular-nums font-semibold">
                    {st.onTimeRate}%
                  </td>
                  <td className="py-3 px-4 font-mono text-right text-slate-600 tabular-nums">
                    {st.otHours > 0 ? `+${st.otHours}h` : '0h'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Grade Distribution & Work Mode Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Performance Bell Curve Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-800">Phân Bổ Xếp Loại Hiệu Suất Kỳ Q3/2026</h4>
            <span className="text-[11px] font-mono text-slate-400">Chuẩn Gauss</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-slate-700">Loại A+ (Xuất Sắc - Top 10-15%)</span>
                <span className="font-mono font-bold text-emerald-700">1 nhân sự (33%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '33%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-slate-700">Loại A (Tốt - 40-50%)</span>
                <span className="font-mono font-bold text-[#0B4FA8]">1 nhân sự (33%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#0875D9] h-full rounded-full" style={{ width: '33%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-slate-700">Loại B (Đạt Yêu Cầu - 30-40%)</span>
                <span className="font-mono font-bold text-amber-700">1 nhân sự (33%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '33%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-slate-700">Loại C (Cần Cải Thiện - &lt; 5%)</span>
                <span className="font-mono text-slate-400">0 nhân sự (0%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Work Location Mode Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-800">Tỷ Lệ Địa Điểm Làm Việc Thực Tế</h4>
            <span className="text-[11px] font-mono text-slate-400">Mô hình Hybrid Work</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-slate-700">Tại Văn Phòng T17-31 Manhattan Glory, Vinhomes Grand Park, Q.9, TP.HCM</span>
                <span className="font-mono font-bold text-[#0B4FA8]">80%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#0875D9] h-full rounded-full" style={{ width: '80%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-slate-700">Làm Việc Từ Xa (WFH có phép)</span>
                <span className="font-mono font-bold text-slate-700">10%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-500 h-full rounded-full" style={{ width: '10%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-slate-700">Công Tác / Gặp Đối Tác Ngoại Nghiệp</span>
                <span className="font-mono font-bold text-amber-700">10%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '10%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
