import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DepartmentId, Employee, UserRole } from '../../types';
import {
  FileSpreadsheet,
  Lock,
  Unlock,
  UserPlus,
  Plus,
  Minus,
  Calendar,
  CheckCircle2,
  DollarSign,
  Download,
  ShieldCheck,
  X
} from 'lucide-react';

export const PayrollView: React.FC = () => {
  const {
    currentUser,
    payrollRecords,
    isPayrollLocked,
    togglePayrollLock,
    employees,
    departments,
    addEmployee,
    adjustEmployeeLeave,
    celebrate
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSubTab, setSelectedSubTab] = useState<'payroll' | 'leave_ledger'>('payroll');

  // New employee form state
  const [name, setName] = useState('');
  const [code, setCode] = useState(`NV-0${employees.length + 10}`);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('0912 888 999');
  const [role, setRole] = useState<UserRole>('EMPLOYEE');
  const [roleTitle, setRoleTitle] = useState('Chuyên Viên Phần Mềm');
  const [departmentId, setDepartmentId] = useState<DepartmentId>('exec');
  const [baseSalaryVND, setBaseSalaryVND] = useState(22000000);
  const [annualLeave, setAnnualLeave] = useState(12);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const totalPayrollGross = payrollRecords.reduce((sum, r) => sum + r.netSalaryVND, 0);
  const totalOtHours = payrollRecords.reduce((sum, r) => sum + r.otHours, 0);

  const handleExportBankCSV = () => {
    const headers = ['Mã NV', 'Họ Tên', 'Phòng Ban', 'Công Chuẩn', 'Công Đi Làm', 'Giờ OT', 'Lương Cơ Bản', 'Lương OT', 'Thực Lĩnh Net (VND)'];
    const rows = payrollRecords.map(r => [
      r.employeeId,
      `"${r.employeeName}"`,
      `"${r.departmentName}"`,
      r.standardDays,
      r.actualWorkedDays,
      r.otHours,
      r.baseSalaryVND,
      r.otSalaryVND,
      r.netSalaryVND
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bang_Luong_Thang_09_2026_OmniCorp.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    celebrate();
  };

  const handleAddEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name: name.trim(),
      code: code.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      roleTitle: roleTitle.trim(),
      departmentId,
      avatar: employees[0].avatar, // Default corporate avatar
      joinDate: new Date().toISOString().slice(0, 10),
      baseSalaryGrade: 'Bậc 3 (Chính thức)',
      baseSalaryVND,
      status: 'ACTIVE',
      annualLeaveRemaining: annualLeave,
    };

    addEmployee(newEmp);
    setShowAddModal(false);
  };

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 sm:pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              Quản Trị Nhân Sự & Chốt Lương Công Nhật
            </h1>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              Khối Nhân Sự (HR)
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Tổng hợp công chuẩn, tính hệ số giờ làm thêm, khóa sổ bảng lương tháng và quản lý quỹ phép năm
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors min-h-[44px]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tiếp Nhận Nhân Sự</span>
          </button>

          <button
            onClick={handleExportBankCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors min-h-[44px]"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Xuất Bảng Lương</span>
          </button>

          <button
            onClick={togglePayrollLock}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg shadow-xs transition-colors min-h-[44px] ${
              isPayrollLocked
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isPayrollLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>{isPayrollLocked ? 'Mở Khóa Bảng Lương' : 'Khóa Sổ Bảng Lương T9/2026'}</span>
          </button>
        </div>
      </div>

      {/* Lock banner notice */}
      {isPayrollLocked && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Bảng lương Tháng 09/2026 đã được Khóa Sổ thành công.</strong> Dữ liệu công nhật đã được niêm phong để phòng Kế toán lập ủy nhiệm chi ngân hàng.
            </span>
          </div>
        </div>
      )}

      {/* Top 3 HR Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
          <div className="text-xs text-slate-500">Tổng quỹ chi trả lương tháng</div>
          <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
            {formatVND(totalPayrollGross)}
          </div>
          <div className="text-[11px] text-slate-400">Đã bao gồm lương OT và phụ cấp</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
          <div className="text-xs text-slate-500">Tổng số giờ OT ghi nhận</div>
          <div className="text-xl font-bold font-mono text-indigo-600 tabular-nums">
            {totalOtHours} giờ
          </div>
          <div className="text-[11px] text-slate-400">Tính theo hệ số 150% - 200%</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
          <div className="text-xs text-slate-500">Trạng thái kỳ lương T9</div>
          <div className="text-xl font-bold font-mono text-emerald-600">
            {isPayrollLocked ? 'ĐÃ KHÓA SỔ (LOCKED)' : 'ĐANG RÀ SOÁT (OPEN)'}
          </div>
          <div className="text-[11px] text-slate-400">Kỳ thanh toán: Ngày 05/10/2026</div>
        </div>
      </div>

      {/* Subtab Toggle */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setSelectedSubTab('payroll')}
          className={`px-3 py-2 rounded-lg font-semibold transition-colors min-h-[40px] ${
            selectedSubTab === 'payroll' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Bảng Chi Tiết Công & Lương Tháng ({payrollRecords.length})
        </button>

        <button
          onClick={() => setSelectedSubTab('leave_ledger')}
          className={`px-3 py-2 rounded-lg font-semibold transition-colors min-h-[40px] ${
            selectedSubTab === 'leave_ledger' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Sổ Quản Lý Quỹ Phép Năm ({employees.length})
        </button>
      </div>

      {/* Subtab 1: Payroll Table */}
      {selectedSubTab === 'payroll' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">Bảng Tổng Hợp Công Nhật & Dự Toán Lương T9/2026</h3>
            <span className="font-mono text-xs text-slate-500">Công chuẩn: 22 ngày</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
                  <th className="py-2.5 px-3">Nhân sự</th>
                  <th className="py-2.5 px-3">Phòng ban</th>
                  <th className="py-2.5 px-3 font-mono text-right">Công thực</th>
                  <th className="py-2.5 px-3 font-mono text-right">Phép năm</th>
                  <th className="py-2.5 px-3 font-mono text-right">Đi muộn</th>
                  <th className="py-2.5 px-3 font-mono text-right">Giờ OT</th>
                  <th className="py-2.5 px-3 font-mono text-right">Lương cơ bản</th>
                  <th className="py-2.5 px-3 font-mono text-right">Lương OT</th>
                  <th className="py-2.5 px-3 font-mono text-right font-bold text-slate-900">Thực lĩnh Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {payrollRecords.map(rec => (
                  <tr key={rec.employeeId} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{rec.employeeName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{rec.employeeId}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{rec.departmentName}</td>
                    <td className="py-3 px-3 font-mono text-right font-semibold text-slate-900">{rec.actualWorkedDays}</td>
                    <td className="py-3 px-3 font-mono text-right text-emerald-700 font-medium">+{rec.paidLeaveDays}</td>
                    <td className="py-3 px-3 font-mono text-right text-amber-700">{rec.lateTimes}</td>
                    <td className="py-3 px-3 font-mono text-right text-indigo-700 font-semibold">{rec.otHours}h</td>
                    <td className="py-3 px-3 font-mono text-right text-slate-700">{formatVND(rec.baseSalaryVND)}</td>
                    <td className="py-3 px-3 font-mono text-right text-indigo-700 font-medium">+{formatVND(rec.otSalaryVND)}</td>
                    <td className="py-3 px-3 font-mono text-right font-bold text-emerald-700">{formatVND(rec.netSalaryVND)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 2: Annual Leave Ledger */}
      {selectedSubTab === 'leave_ledger' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-4 p-4 sm:p-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Sổ Quản Lý Quỹ Phép Năm Cán Bộ Nhân Viên (2026)</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Tiêu chuẩn: 12 ngày phép cơ bản + phép thâm niên</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                  <th className="py-2.5 px-3">Mã NV</th>
                  <th className="py-2.5 px-3">Họ Tên</th>
                  <th className="py-2.5 px-3">Chức Vụ</th>
                  <th className="py-2.5 px-3 font-mono">Ngày Gia Nhập</th>
                  <th className="py-2.5 px-3 font-mono text-right">Phép Còn Lại</th>
                  <th className="py-2.5 px-3 text-right">Thao Tác Điều Chỉnh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-mono text-slate-500">{emp.code}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{emp.name}</td>
                    <td className="py-3 px-3 text-slate-600">{emp.roleTitle}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{emp.joinDate}</td>
                    <td className="py-3 px-3 font-mono text-right font-bold text-indigo-700 text-sm">
                      {emp.annualLeaveRemaining} ngày
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => adjustEmployeeLeave(emp.id, 1)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[11px] font-medium flex items-center gap-0.5"
                          title="Thưởng thêm 1 ngày phép"
                        >
                          <Plus className="w-3 h-3" />
                          <span>1 ngày</span>
                        </button>
                        <button
                          onClick={() => adjustEmployeeLeave(emp.id, -1)}
                          className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-medium flex items-center gap-0.5"
                          title="Trừ 1 ngày phép"
                        >
                          <Minus className="w-3 h-3" />
                          <span>1 ngày</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">Tiếp Nhận Nhân Sự Mới (Onboarding)</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEmployeeSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Hoàng Tuấn Anh"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mã nhân sự</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email công vụ *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="anh.hoang@omnicorp.vn"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Phòng ban</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value as DepartmentId)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Chức danh</label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Lương cơ bản (VND)</label>
                  <input
                    type="number"
                    step="1000000"
                    value={baseSalaryVND}
                    onChange={(e) => setBaseSalaryVND(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Quỹ phép năm (Ngày)</label>
                  <input
                    type="number"
                    value={annualLeave}
                    onChange={(e) => setAnnualLeave(parseInt(e.target.value) || 12)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm"
                >
                  Lưu & Tiếp Nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
