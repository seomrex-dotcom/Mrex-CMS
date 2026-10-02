import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { FinancialVoucher, VoucherType, PaymentMethod } from '../../types';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Banknote,
  Calendar,
  Search,
  Filter,
  Download,
  PlusCircle,
  Printer,
  Edit3,
  Trash2,
  FileText,
  Building,
  CheckCircle2,
  PieChart,
  Shield,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Wallet
} from 'lucide-react';
import { VoucherPrintModal } from './VoucherPrintModal';
import { VoucherFormModal } from './VoucherFormModal';

export const FinanceView: React.FC = () => {
  const {
    vouchers,
    deleteVoucher,
    currentUser,
    celebrate
  } = useApp();

  const isExecutive = currentUser.role === 'CEO' || currentUser.role === 'MANAGER';

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [typeFilter, setTypeFilter] = useState<'ALL' | VoucherType>(isExecutive ? 'ALL' : 'PAYMENT');
  const [methodFilter, setMethodFilter] = useState<'ALL' | PaymentMethod>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<VoucherType>('RECEIPT');
  const [voucherToEdit, setVoucherToEdit] = useState<FinancialVoucher | null>(null);

  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [voucherToPrint, setVoucherToPrint] = useState<FinancialVoucher | null>(null);

  // Available months list from vouchers
  const availableMonths = useMemo(() => {
    const monthsSet = new Set(vouchers.map(v => v.month));
    monthsSet.add('2026-09');
    monthsSet.add('2026-10');
    return Array.from(monthsSet).sort().reverse();
  }, [vouchers]);

  // Vouchers filtered by month
  const monthVouchers = useMemo(() => {
    if (selectedMonth === 'ALL') return vouchers;
    return vouchers.filter(v => v.month === selectedMonth);
  }, [vouchers, selectedMonth]);

  // Monthly summary calculations
  const monthlySummary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let receiptCount = 0;
    let paymentCount = 0;
    let bankTransferTotal = 0;
    let cashTotal = 0;

    const incomeByCategory: Record<string, number> = {};
    const expenseByCategory: Record<string, number> = {};

    monthVouchers.forEach(v => {
      if (v.type === 'RECEIPT') {
        totalIncome += v.amountVND;
        receiptCount++;
        incomeByCategory[v.category] = (incomeByCategory[v.category] || 0) + v.amountVND;
      } else {
        totalExpense += v.amountVND;
        paymentCount++;
        expenseByCategory[v.category] = (expenseByCategory[v.category] || 0) + v.amountVND;
      }

      if (v.paymentMethod === 'BANK_TRANSFER') {
        bankTransferTotal += v.amountVND;
      } else {
        cashTotal += v.amountVND;
      }
    });

    const netCashFlow = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      netCashFlow,
      receiptCount,
      paymentCount,
      bankTransferTotal,
      cashTotal,
      incomeByCategory,
      expenseByCategory,
    };
  }, [monthVouchers]);

  // Filtered vouchers for display in table
  const filteredVouchers = useMemo(() => {
    return monthVouchers.filter(v => {
      // Role enforcement: Non-executives (Employees) only see payment vouchers
      if (!isExecutive && v.type === 'RECEIPT') return false;

      if (typeFilter !== 'ALL' && v.type !== typeFilter) return false;
      if (methodFilter !== 'ALL' && v.paymentMethod !== methodFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          v.code.toLowerCase().includes(q) ||
          v.title.toLowerCase().includes(q) ||
          v.payerOrPayee.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          (v.referenceDoc && v.referenceDoc.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [monthVouchers, typeFilter, methodFilter, searchQuery, isExecutive]);

  const handleOpenAdd = (type: VoucherType) => {
    if (!isExecutive && type === 'RECEIPT') {
      alert('Quyền bị từ chối: Chỉ có Ban Quản Trị và Cấp Quản Lý mới có quyền thu tiền và lập Phiếu Thu. Cấp nhân viên lập Phiếu Chi.');
      return;
    }
    setVoucherToEdit(null);
    setFormType(type);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (v: FinancialVoucher) => {
    if (!isExecutive) {
      alert('Quyền bị từ chối: Chỉ có Ban Quản Trị và Cấp Quản Lý mới có quyền chỉnh sửa chứng từ sổ quỹ.');
      return;
    }
    setVoucherToEdit(v);
    setFormType(v.type);
    setIsFormOpen(true);
  };

  const handleOpenPrint = (v: FinancialVoucher) => {
    setVoucherToPrint(v);
    setIsPrintOpen(true);
  };

  const handleDelete = (id: string, code: string) => {
    if (!isExecutive) {
      alert('Quyền bị từ chối: Chỉ có Ban Quản Trị và Cấp Quản Lý mới có quyền xóa chứng từ sổ quỹ.');
      return;
    }
    if (confirm(`Bạn có chắc muốn xóa chứng từ ${code} khỏi sổ quỹ?`)) {
      deleteVoucher(id);
    }
  };

  const handleExportMonthCSV = () => {
    const headers = [
      'Mã Phiếu',
      'Loại Chứng Từ',
      'Ngày Lập',
      'Hạng Mục Thu/Chi',
      'Lý Do / Nội Dung',
      'Đối Tác (Nộp/Nhận)',
      'Số Điện Thoại',
      'Số Tiền (VND)',
      'Phương Thức',
      'Chứng Từ Gốc',
      'Người Lập',
      'Người Duyệt'
    ];

    const rows = filteredVouchers.map(v => [
      v.code,
      v.type === 'RECEIPT' ? 'Phiếu Thu' : 'Phiếu Chi',
      v.date,
      `"${v.category}"`,
      `"${v.title}"`,
      `"${v.payerOrPayee}"`,
      `"${v.payerOrPayeePhone || ''}"`,
      v.amountVND,
      v.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt',
      `"${v.referenceDoc || ''}"`,
      `"${v.accountantName}"`,
      `"${v.approverName}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `so_quy_thu_chi_omnicorp_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    celebrate();
  };

  const formatVND = (num: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0875D9] flex items-center justify-center text-white shadow-xs">
              <Receipt className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Sổ Quỹ Thu - Chi & Quản Lý Dòng Tiền
            </h1>
            <span className="font-mono text-xs font-semibold text-[#0B4FA8] bg-[#EAF5FF] border border-[#0875D9]/25 px-2 py-0.5 rounded">
              Thông tư 200/133 BTC
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
            Lập phiếu thu, phiếu chi, xuất chứng từ in ấn chuẩn mực và tổng kết báo cáo doanh thu - chi phí định kỳ
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {isExecutive && (
            <>
              <button
                onClick={handleExportMonthCSV}
                className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs min-h-[40px]"
                title="Tải về file Excel / CSV sổ quỹ tháng đang chọn (BQT & Quản Lý)"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Xuất Sổ Quỹ (CSV)</span>
              </button>

              <button
                onClick={() => handleOpenAdd('RECEIPT')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 min-h-[40px]"
                title="Lập phiếu thu tiền mới (BQT & Quản Lý)"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Lập Phiếu Thu</span>
              </button>
            </>
          )}

          <button
            onClick={() => handleOpenAdd('PAYMENT')}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-rose-600/20 min-h-[40px]"
            title={isExecutive ? "Lập phiếu chi tiền mới" : "Lập đề xuất chi tiền / thanh toán tạm ứng"}
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isExecutive ? '+ Lập Phiếu Chi' : '+ Lập Đề Xuất / Phiếu Chi'}</span>
          </button>
        </div>
      </div>

      {/* Month Selector Bar & Quick Stats Filter */}
      <div className="p-3 sm:p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#0875D9]" />
            <span>Kỳ tổng kết tháng:</span>
          </span>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0875D9]"
          >
            {availableMonths.map(m => (
              <option key={m} value={m}>
                Tháng {m.slice(5)}/{m.slice(0, 4)}
              </option>
            ))}
            <option value="ALL">Tất cả các tháng</option>
          </select>

          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            (Đang lọc {monthVouchers.length} chứng từ)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{monthlySummary.receiptCount} Phiếu Thu</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-800 rounded-lg border border-rose-200 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>{monthlySummary.paymentCount} Phiếu Chi</span>
          </div>
        </div>
      </div>

      {/* Monthly Summary Cards (Chỉ Ban Quản Trị & Cấp Quản Lý được xem tổng kết) */}
      {isExecutive ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Receipts */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-500">Tổng Thu Trong Tháng</span>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {monthlySummary.receiptCount} khoản thu đã ghi nhận
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
              </div>
              <div className="pt-3">
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 font-mono tracking-tight">
                  +{formatVND(monthlySummary.totalIncome)}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Dòng tiền thực thu về quỹ</span>
                </div>
              </div>
            </div>

            {/* Card 2: Total Payments */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-500">Tổng Chi Trong Tháng</span>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {monthlySummary.paymentCount} khoản chi đã duyệt
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
              <div className="pt-3">
                <div className="text-xl sm:text-2xl font-extrabold text-rose-600 font-mono tracking-tight">
                  -{formatVND(monthlySummary.totalExpense)}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                  <span>Bao gồm lương, văn phòng, server</span>
                </div>
              </div>
            </div>

            {/* Card 3: Net Cash Flow (Thu - Chi) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-500">Dòng Tiền Ròng (Net Flow)</span>
                  <div className="text-[11px] text-slate-400 font-mono">Tổng Thu trừ Tổng Chi</div>
                </div>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    monthlySummary.netCashFlow >= 0
                      ? 'bg-[#EAF5FF] text-[#0875D9]'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="pt-3">
                <div
                  className={`text-xl sm:text-2xl font-extrabold font-mono tracking-tight ${
                    monthlySummary.netCashFlow >= 0 ? 'text-[#0875D9]' : 'text-amber-600'
                  }`}
                >
                  {monthlySummary.netCashFlow >= 0 ? '+' : ''}
                  {formatVND(monthlySummary.netCashFlow)}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                  <span
                    className={`font-semibold ${
                      monthlySummary.netCashFlow >= 0 ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {monthlySummary.netCashFlow >= 0
                      ? 'Thặng dư ngân sách dương'
                      : 'Thâm hụt tạm thời kỳ này'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: Method distribution */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-500">Cơ Cấu Thanh Toán</span>
                  <div className="text-[11px] text-slate-400 font-mono">Theo kênh luân chuyển tiền</div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <div className="pt-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-[#0875D9]" />
                    <span>Chuyển khoản:</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatVND(monthlySummary.bankTransferTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Banknote className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Tiền mặt tại quỹ:</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatVND(monthlySummary.cashTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown Progress Analysis (Phân Tích Cơ Cấu Thu - Chi) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Income Breakdown */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                    Cơ Cấu Các Nguồn Thu ({formatVND(monthlySummary.totalIncome)})
                  </h3>
                </div>
                <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {monthlySummary.receiptCount} khoản
                </span>
              </div>

              <div className="space-y-3">
                {Object.entries(monthlySummary.incomeByCategory).map(([cat, amount]) => {
                  const pct = monthlySummary.totalIncome > 0 ? (amount / monthlySummary.totalIncome) * 100 : 0;
                  return (
                    <div key={cat} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700 truncate max-w-[280px]">{cat}</span>
                        <span className="font-mono font-bold text-slate-900">
                          {formatVND(amount)} ({pct.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {Object.keys(monthlySummary.incomeByCategory).length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    Chưa có dữ liệu phiếu thu nào trong tháng này.
                  </div>
                )}
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                    Cơ Cấu Các Khoản Chi ({formatVND(monthlySummary.totalExpense)})
                  </h3>
                </div>
                <span className="font-mono text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                  {monthlySummary.paymentCount} khoản
                </span>
              </div>

              <div className="space-y-3">
                {Object.entries(monthlySummary.expenseByCategory).map(([cat, amount]) => {
                  const pct = monthlySummary.totalExpense > 0 ? (amount / monthlySummary.totalExpense) * 100 : 0;
                  return (
                    <div key={cat} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700 truncate max-w-[280px]">{cat}</span>
                        <span className="font-mono font-bold text-slate-900">
                          {formatVND(amount)} ({pct.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {Object.keys(monthlySummary.expenseByCategory).length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    Chưa có dữ liệu phiếu chi nào trong tháng này.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          {/* Employee Financial Security Notice Banner */}
          <div className="p-4 bg-amber-50/90 border border-amber-200 text-amber-900 rounded-2xl text-xs shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900">
                  Phân Quyền Bảo Mật Tài Chính Doanh Nghiệp
                </div>
                <div className="text-[11px] text-amber-800 mt-0.5">
                  Bạn đang đăng nhập với quyền <strong>{currentUser.roleTitle}</strong> ({currentUser.role}). Báo cáo tổng kết dòng tiền thu / chi toàn doanh nghiệp được bảo mật, chỉ dành riêng cho <strong>Ban Quản Trị (CEO)</strong> và <strong>Cấp Quản Lý (PM/Lead)</strong>. Cấp nhân viên có toàn quyền <strong>Lập Phiếu Chi / Đề xuất thanh toán</strong> bên dưới.
                </div>
              </div>
            </div>

            <button
              onClick={() => handleOpenAdd('PAYMENT')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Lập Đề Xuất Chi</span>
            </button>
          </div>

          {/* Employee Expense Overview (3 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Số Phiếu Chi Đã Lập Kỳ Này</div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
                {monthlySummary.paymentCount} <span className="text-xs font-normal text-slate-500">phiếu chi</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Gồm các đề xuất thanh toán & tạm ứng</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Tổng Số Tiền Chi Trong Kỳ</div>
              <div className="text-2xl font-extrabold text-rose-600 font-mono mt-1">
                {formatVND(monthlySummary.totalExpense)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Đã được lập và gửi lên cấp duyệt</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Quy Trình Duyệt Giải Ngân</div>
              <div className="text-xs font-bold text-emerald-700 mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Ban Quản Trị & Kế Toán Tiếp Nhận</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Thủ quỹ chi trả tiền mặt hoặc chuyển khoản</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Table: Sổ Chứng Từ Thu / Chi */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-3 p-4 sm:p-5">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm mã phiếu, lý do, đối tác..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0875D9]"
              />
            </div>

            {/* Type Filter Buttons */}
            {isExecutive ? (
              <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                <button
                  onClick={() => setTypeFilter('ALL')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    typeFilter === 'ALL'
                      ? 'bg-white shadow-xs text-slate-900 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tất cả ({monthVouchers.length})
                </button>
                <button
                  onClick={() => setTypeFilter('RECEIPT')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                    typeFilter === 'RECEIPT'
                      ? 'bg-white shadow-xs text-emerald-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Phiếu Thu ({monthlySummary.receiptCount})</span>
                </button>
                <button
                  onClick={() => setTypeFilter('PAYMENT')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                    typeFilter === 'PAYMENT'
                      ? 'bg-white shadow-xs text-rose-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Phiếu Chi ({monthlySummary.paymentCount})</span>
                </button>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-bold text-xs flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Phiếu Chi / Đề Xuất Chi Tiêu ({filteredVouchers.length})</span>
              </div>
            )}

            {/* Payment Method filter */}
            <select
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value as any)}
              className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="ALL">Tất cả hình thức</option>
              <option value="BANK_TRANSFER">Chuyển khoản</option>
              <option value="CASH">Tiền mặt</option>
            </select>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Hiển thị <strong>{filteredVouchers.length}</strong> chứng từ
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                <th className="py-3 px-3">Mã phiếu</th>
                <th className="py-3 px-3">Ngày</th>
                <th className="py-3 px-3">Loại</th>
                <th className="py-3 px-4">Lý do thu / chi & Đối tác</th>
                <th className="py-3 px-3">Hình thức</th>
                <th className="py-3 px-3 text-right">Số tiền (VNĐ)</th>
                <th className="py-3 px-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVouchers.map(voucher => {
                const isReceipt = voucher.type === 'RECEIPT';
                return (
                  <tr key={voucher.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Code */}
                    <td className="py-3 px-3 font-mono font-bold">
                      <button
                        onClick={() => handleOpenPrint(voucher)}
                        className="text-[#0875D9] hover:text-[#063B78] hover:underline flex items-center gap-1"
                        title="Xem & in phiếu chuẩn"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{voucher.code}</span>
                      </button>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                      {voucher.date}
                    </td>

                    {/* Type Badge */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isReceipt
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isReceipt ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}
                        />
                        {isReceipt ? 'Phiếu Thu' : 'Phiếu Chi'}
                      </span>
                    </td>

                    {/* Title & Payer/Payee */}
                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-semibold text-slate-900 leading-snug">
                        {voucher.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 truncate">
                        <span className="font-medium text-slate-700">
                          {isReceipt ? 'Người nộp:' : 'Người nhận:'}
                        </span>
                        <span className="truncate">{voucher.payerOrPayee}</span>
                        {voucher.referenceDoc && (
                          <span className="text-slate-400 font-mono text-[10px] shrink-0">
                            · {voucher.referenceDoc.slice(0, 24)}...
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                        {voucher.paymentMethod === 'BANK_TRANSFER' ? (
                          <>
                            <CreditCard className="w-3.5 h-3.5 text-[#0875D9]" />
                            <span>Chuyển khoản</span>
                          </>
                        ) : (
                          <>
                            <Banknote className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Tiền mặt</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 text-right font-mono font-bold whitespace-nowrap text-sm">
                      <span className={isReceipt ? 'text-emerald-600' : 'text-rose-600'}>
                        {isReceipt ? '+' : '-'}
                        {formatVND(voucher.amountVND)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenPrint(voucher)}
                          className="p-1.5 text-slate-500 hover:text-[#0875D9] hover:bg-[#EAF5FF] rounded-lg transition-colors"
                          title="In phiếu hoặc xuất PDF chuẩn Bộ Tài Chính"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {isExecutive && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(voucher)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Chỉnh sửa thông tin phiếu (BQT & Quản Lý)"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDelete(voucher.id, voucher.code)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Xóa chứng từ (BQT & Quản Lý)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredVouchers.length === 0 && (
            <div className="py-12 text-center space-y-2">
              <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-700 text-sm">Không tìm thấy chứng từ phù hợp</div>
              <p className="text-xs text-slate-400">
                Thử thay đổi từ khóa tìm kiếm hoặc bấm chọn kỳ tháng khác.
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  onClick={() => handleOpenAdd('RECEIPT')}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                >
                  + Lập Phiếu Thu
                </button>
                <button
                  onClick={() => handleOpenAdd('PAYMENT')}
                  className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold"
                >
                  + Lập Phiếu Chi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <VoucherPrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        voucher={voucherToPrint}
      />

      <VoucherFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        voucherToEdit={voucherToEdit}
        defaultType={formType}
      />
    </div>
  );
};
