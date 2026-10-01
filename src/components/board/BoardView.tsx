import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  FileCheck,
  Building,
  Target,
  Users,
  Award,
  Clock,
  Sparkles,
  Receipt,
  FileText,
  Palette,
  Briefcase,
  Sliders
} from 'lucide-react';
import { BoardFinanceSummary } from './BoardFinanceSummary';
import { ProjectContractsView } from './ProjectContractsView';
import { BoardBrandSettings } from './BoardBrandSettings';
import { DepartmentsManagementView } from '../departments/DepartmentsManagementView';
import { Layers } from 'lucide-react';

export const BoardView: React.FC = () => {
  const {
    currentUser,
    budgetApprovals,
    approveBudget,
    rejectBudget,
    payrollRecords,
    okrs,
    employees,
    departments,
    vouchers,
    contracts,
    brandConfig,
    celebrate
  } = useApp();

  const [activeBoardTab, setActiveBoardTab] = useState<
    'budgets' | 'finance_summary' | 'contracts' | 'okrs' | 'compensation' | 'org_structure' | 'branding'
  >('budgets');

  // Strategic Executive calculations
  const totalMonthlyPayroll = payrollRecords.reduce((sum, r) => sum + r.netSalaryVND, 0);
  const totalOtCost = payrollRecords.reduce((sum, r) => sum + r.otSalaryVND, 0);
  const pendingBudgets = budgetApprovals.filter(b => b.status === 'PENDING');
  const approvedBudgetsTotal = budgetApprovals
    .filter(b => b.status === 'APPROVED')
    .reduce((sum, b) => sum + b.amountVND, 0);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const isCEO = currentUser.role === 'CEO';

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight">
                  Phân Hệ Ban Quản Trị & Hội Đồng Điều Hành
                </h1>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">
                  C-Level Executive
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Phê duyệt ngân sách quỹ thưởng KPI, thẩm định mục tiêu chiến lược OKR và giám sát tài chính nhân sự
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Người đại diện:</span>
            <span className="font-semibold text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              {currentUser.name} ({currentUser.roleTitle})
            </span>
          </div>
        </div>

        {/* Executive Quick Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
          <div>
            <div className="text-[11px] text-slate-400">Tổng quỹ lương thực tế tháng</div>
            <div className="text-lg font-bold font-mono text-white tabular-nums">
              {formatVND(totalMonthlyPayroll)}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400">Chi phí làm thêm giờ (OT)</div>
            <div className="text-lg font-bold font-mono text-amber-400 tabular-nums">
              {formatVND(totalOtCost)}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400">Đề xuất ngân sách đang chờ duyệt</div>
            <div className="text-lg font-bold font-mono text-rose-400 tabular-nums">
              {pendingBudgets.length} đề xuất
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400">Quỹ thưởng quý đã chuẩn y</div>
            <div className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
              {formatVND(approvedBudgetsTotal)}
            </div>
          </div>
        </div>
      </div>

      {/* Role notice if not CEO */}
      {!isCEO && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Bạn đang xem giao diện ở góc nhìn <strong>{currentUser.roleTitle}</strong>. Chức năng phê chuẩn chính thức thuộc thẩm quyền của Tổng Giám Đốc (CEO).
            </span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveBoardTab('budgets')}
          className={`px-3 py-2 rounded-lg font-semibold transition-colors shrink-0 min-h-[40px] flex items-center gap-1.5 ${
            activeBoardTab === 'budgets'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Phê Duyệt Ngân Sách Quỹ Thưởng ({pendingBudgets.length})</span>
        </button>

        <button
          onClick={() => setActiveBoardTab('finance_summary')}
          className={`px-3 py-2 rounded-lg font-semibold transition-colors shrink-0 min-h-[40px] flex items-center gap-1.5 ${
            activeBoardTab === 'finance_summary'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Tổng Kết Thu / Chi ({vouchers.length})</span>
        </button>

        <button
          onClick={() => setActiveBoardTab('contracts')}
          className={`px-3 py-2 rounded-lg font-semibold transition-colors shrink-0 min-h-[40px] flex items-center gap-1.5 ${
            activeBoardTab === 'contracts'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Doanh Thu & Hợp Đồng Dự Án ({contracts.length})</span>
        </button>

        <button
          onClick={() => setActiveBoardTab('okrs')}
          className={`px-3 py-2 rounded-lg font-semibold transition-colors shrink-0 min-h-[40px] flex items-center gap-1.5 ${
            activeBoardTab === 'okrs'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Chuẩn Y Mục Tiêu OKR Công Ty ({okrs.length})</span>
        </button>

        <button
          onClick={() => setActiveBoardTab('compensation')}
          className={`px-3 py-2 rounded-lg font-semibold transition-colors shrink-0 min-h-[40px] flex items-center gap-1.5 ${
            activeBoardTab === 'compensation'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Phân Tích Chi Phí Nhân Sự & Định Biên</span>
        </button>

        <button
          onClick={() => setActiveBoardTab('org_structure')}
          className={`px-3 py-2 rounded-lg font-semibold transition-colors shrink-0 min-h-[40px] flex items-center gap-1.5 ${activeBoardTab === 'org_structure' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Cơ Cấu Tổ Chức</span>
        </button>

        <button
          onClick={() => setActiveBoardTab('branding')}
          className={`px-3 py-2 rounded-lg font-semibold transition-colors shrink-0 min-h-[40px] flex items-center gap-1.5 ${
            activeBoardTab === 'branding'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-amber-400" />
          <span>Cài Đặt Thương Hiệu, Logo & Theme</span>
        </button>
      </div>

      {/* Tab 1: Budgets */}
      {activeBoardTab === 'budgets' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 flex items-center justify-between pb-1">
            <span>Danh sách các tờ trình ngân sách dự án và quỹ thưởng quý từ các Trưởng phòng ban</span>
            <span className="font-mono">{budgetApprovals.length} tờ trình</span>
          </div>

          <div className="space-y-3">
            {budgetApprovals.map(budget => {
              const dept = departments.find(d => d.id === budget.departmentId);
              const isPending = budget.status === 'PENDING';

              return (
                <div
                  key={budget.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-indigo-700">{dept?.name}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-mono text-slate-500">{budget.quarter}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500">Người trình: {budget.requestedBy}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">{budget.title}</h3>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-base sm:text-lg font-bold font-mono text-indigo-700 tabular-nums">
                        {formatVND(budget.amountVND)}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500">
                        {budget.status === 'APPROVED' ? (
                          <span className="text-emerald-600">Đã Chuẩn Y ({budget.approvedAt})</span>
                        ) : budget.status === 'REJECTED' ? (
                          <span className="text-red-600">Từ Chối Phê Duyệt</span>
                        ) : (
                          <span className="text-amber-600">Chờ CEO Ký Duyệt</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                    {budget.description}
                  </p>

                  {/* Actions for CEO */}
                  {isPending && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => rejectBudget(budget.id)}
                        className="px-3 py-2 text-xs font-medium text-red-700 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 rounded-lg transition-colors flex items-center gap-1 min-h-[40px]"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Từ chối</span>
                      </button>

                      <button
                        onClick={() => approveBudget(budget.id)}
                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 min-h-[40px]"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Ký Chuẩn Y Ngân Sách</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: OKRs */}
      {activeBoardTab === 'okrs' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 pb-1">
            Mục tiêu chiến lược OKR cấp Tập đoàn và phòng ban được Hội Đồng Quản Trị giao phó
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {okrs.map(okr => {
              const dept = departments.find(d => d.id === okr.departmentId);
              return (
                <div key={okr.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <span className="font-bold text-indigo-700 text-xs">{dept?.name}</span>
                      <span className="text-slate-400 text-xs mx-1">·</span>
                      <span className="font-mono text-slate-500 text-xs">{okr.quarter}</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Tiến độ: {okr.progress}%
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-xs leading-snug">{okr.title}</h3>

                  <div className="space-y-2 pt-1">
                    {okr.keyResults.map(kr => (
                      <div key={kr.id} className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-700 text-[11px] truncate max-w-[200px]">{kr.description}</span>
                          <span className="font-mono font-semibold text-slate-900">{kr.currentValue}/{kr.targetValue} {kr.unit}</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${kr.progress}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Compensation & Payroll Overview */}
      {activeBoardTab === 'compensation' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Chi Phí Nhân Lực & Bậc Lương Toàn Doanh Nghiệp</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Dữ liệu bảo mật chỉ dành cho Ban Quản Trị và Trưởng phòng Nhân sự</p>
            </div>
            <span className="font-mono text-xs font-bold text-slate-900">{employees.length} nhân sự</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                  <th className="py-2.5 px-3">Mã NV</th>
                  <th className="py-2.5 px-3">Họ Tên</th>
                  <th className="py-2.5 px-3">Chức Danh</th>
                  <th className="py-2.5 px-3">Bậc Lương</th>
                  <th className="py-2.5 px-3 font-mono text-right">Lương Cơ Bản</th>
                  <th className="py-2.5 px-3 font-mono text-right">Thực Lĩnh Dự Kiến</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {employees.map(emp => {
                  const pay = payrollRecords.find(p => p.employeeId === emp.id);
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 font-mono text-slate-500">{emp.code}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{emp.name}</td>
                      <td className="py-3 px-3 text-slate-600">{emp.roleTitle}</td>
                      <td className="py-3 px-3 text-indigo-700 font-medium">{emp.baseSalaryGrade}</td>
                      <td className="py-3 px-3 font-mono text-right text-slate-800">
                        {formatVND(emp.baseSalaryVND)}
                      </td>
                      <td className="py-3 px-3 font-mono text-right font-bold text-emerald-700">
                        {pay ? formatVND(pay.netSalaryVND) : '--'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Strategic Financial Summary (Tổng Kết Thu - Chi) */}
      {activeBoardTab === 'finance_summary' && <BoardFinanceSummary />}

      {/* Tab: Project Contracts & Revenue Reminders (Doanh Thu, Hợp Đồng, Lịch Nhắc Thanh Toán) */}
      {activeBoardTab === 'contracts' && <ProjectContractsView />}

      {/* Tab: Org Structure & Department CRUD */}
      {activeBoardTab === 'org_structure' && <DepartmentsManagementView />}

      {/* Tab: Brand Customization, Logo, Typography & Themes (Ban Quan Tri) */}
      {activeBoardTab === 'branding' && <BoardBrandSettings />}
    </div>
  );
};



