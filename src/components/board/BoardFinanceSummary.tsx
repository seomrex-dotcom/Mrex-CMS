import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { FinancialVoucher, VoucherType } from '../../types';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Banknote,
  Search,
  Filter,
  Download,
  Calendar,
  Printer,
  CheckCircle2,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { VoucherPrintModal } from '../finance/VoucherPrintModal';

export const BoardFinanceSummary: React.FC = () => {
  const { vouchers, payrollRecords } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'ALL' | VoucherType>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [printingVoucher, setPrintingVoucher] = useState<FinancialVoucher | null>(null);

  // Extract available months
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    vouchers.forEach(v => {
      if (v.month) set.add(v.month);
    });
    return Array.from(set).sort().reverse();
  }, [vouchers]);

  // Filter vouchers
  const filteredVouchers = useMemo(() => {
    return vouchers.filter(v => {
      const matchMonth = selectedMonth === 'all' || v.month === selectedMonth;
      const matchType = selectedType === 'ALL' || v.type === selectedType;
      const matchSearch =
        v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.payerOrPayee.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchMonth && matchType && matchSearch;
    });
  }, [vouchers, selectedMonth, selectedType, searchTerm]);

  // Financial calculations
  const totalReceipts = useMemo(() => {
    return filteredVouchers
      .filter(v => v.type === 'RECEIPT')
      .reduce((sum, v) => sum + v.amountVND, 0);
  }, [filteredVouchers]);

  const totalPayments = useMemo(() => {
    return filteredVouchers
      .filter(v => v.type === 'PAYMENT')
      .reduce((sum, v) => sum + v.amountVND, 0);
  }, [filteredVouchers]);

  const netCashFlow = totalReceipts - totalPayments;
  const isSurplus = netCashFlow >= 0;
  const coverageRatio = totalPayments > 0 ? ((totalReceipts / totalPayments) * 100).toFixed(0) : '100';

  // Category breakdown for Receipts
  const receiptCategories = useMemo(() => {
    const map = new Map<string, number>();
    filteredVouchers
      .filter(v => v.type === 'RECEIPT')
      .forEach(v => {
        map.set(v.category, (map.get(v.category) || 0) + v.amountVND);
      });
    return Array.from(map.entries())
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalReceipts > 0 ? Math.round((amount / totalReceipts) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredVouchers, totalReceipts]);

  // Category breakdown for Payments
  const paymentCategories = useMemo(() => {
    const map = new Map<string, number>();
    filteredVouchers
      .filter(v => v.type === 'PAYMENT')
      .forEach(v => {
        map.set(v.category, (map.get(v.category) || 0) + v.amountVND);
      });
    return Array.from(map.entries())
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalPayments > 0 ? Math.round((amount / totalPayments) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredVouchers, totalPayments]);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  // Export CSV summary report
  const handleExportSummaryCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [
        ['BÁO CÁO TỔNG KẾT THU CHI BAN QUẢN TRỊ', selectedMonth === 'all' ? 'Tất cả các tháng' : selectedMonth],
        ['Tổng Thu (VND)', totalReceipts],
        ['Tổng Chi (VND)', totalPayments],
        ['Dòng Tiền Ròng Thặng Dư (VND)', netCashFlow],
        [],
        ['Mã Phiếu', 'Loại', 'Ngày Lập', 'Lý Do Thu/Chi', 'Danh Mục', 'Số Tiền (VND)', 'Đối Tác / Người Nộp / Nhận', 'Phương Thức', 'Người Duyệt'],
        ...filteredVouchers.map(v => [
          v.code,
          v.type === 'RECEIPT' ? 'Phiếu Thu' : 'Phiếu Chi',
          v.date,
          `"${v.title}"`,
          `"${v.category}"`,
          v.amountVND,
          `"${v.payerOrPayee}"`,
          v.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt',
          `"${v.approverName}"`
        ])
      ]
        .map(row => row.join(','))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TongKet_ThuChi_BanQuanTri_${selectedMonth}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. EXECUTIVE BENTO KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Receipts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">Tổng Tiền Thu Về (Doanh Thu)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-600 tabular-nums">
            {formatVND(totalReceipts)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {filteredVouchers.filter(v => v.type === 'RECEIPT').length} phiếu thu hợp lệ
          </div>
        </div>

        {/* Card 2: Total Payments */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">Tổng Tiền Đã Chi (Chi Phí)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-rose-600 tabular-nums">
            {formatVND(totalPayments)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {filteredVouchers.filter(v => v.type === 'PAYMENT').length} phiếu chi đã chuẩn y
          </div>
        </div>

        {/* Card 3: Net Cash Flow */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">Dòng Tiền Ròng (Thu - Chi)</span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isSurplus ? 'bg-[#EAF5FF] text-[#0875D9]' : 'bg-rose-50 text-rose-600'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-lg sm:text-xl font-bold font-mono tabular-nums ${
              isSurplus ? 'text-[#0B4FA8]' : 'text-rose-600'
            }`}
          >
            {isSurplus ? `+${formatVND(netCashFlow)}` : formatVND(netCashFlow)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Thặng dư tài chính an toàn</span>
          </div>
        </div>

        {/* Card 4: Coverage Ratio */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">Tỷ Lệ Bao Phủ Thu / Chi</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 tabular-nums">
            {coverageRatio}%
          </div>
          <div className="text-[11px] text-slate-500">
            <span>Doanh thu gấp {(totalReceipts / (totalPayments || 1)).toFixed(2)} lần chi phí</span>
          </div>
        </div>
      </div>

      {/* 2. FILTER TOOLBAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Month selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả các tháng</option>
              {availableMonths.map(m => (
                <option key={m} value={m}>
                  Tháng {m.slice(5, 7)}/{m.slice(0, 4)}
                </option>
              ))}
            </select>
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedType('ALL')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                selectedType === 'ALL' ? 'bg-white text-[#0875D9] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({filteredVouchers.length})
            </button>
            <button
              onClick={() => setSelectedType('RECEIPT')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                selectedType === 'RECEIPT' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Khoản Thu
            </button>
            <button
              onClick={() => setSelectedType('PAYMENT')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                selectedType === 'PAYMENT' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Khoản Chi
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm mã chứng từ, người nộp/nhận, lý do..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0875D9]"
            />
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportSummaryCSV}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center gap-2"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Xuất Báo Cáo Tài Chính HĐQT (CSV)</span>
        </button>
      </div>

      {/* 3. CATEGORY STRUCTURE ANALYSIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Receipts Structure */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Cơ Cấu Nguồn Thu (Inflow Sources)</span>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-600">
              {formatVND(totalReceipts)}
            </span>
          </div>

          <div className="space-y-3">
            {receiptCategories.map(cat => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-medium truncate max-w-[260px]">
                    {cat.name}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-900 font-bold">{formatVND(cat.amount)}</span>
                    <span className="text-[11px] text-slate-400 w-9 text-right font-semibold">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}

            {receiptCategories.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs">
                Không có dữ liệu thu trong kỳ được chọn.
              </div>
            )}
          </div>
        </div>

        {/* Payments Structure */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Cơ Cấu Chi Phí (Outflow Allocation)</span>
            </div>
            <span className="font-mono text-xs font-bold text-rose-600">
              {formatVND(totalPayments)}
            </span>
          </div>

          <div className="space-y-3">
            {paymentCategories.map(cat => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-medium truncate max-w-[260px]">
                    {cat.name}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-900 font-bold">{formatVND(cat.amount)}</span>
                    <span className="text-[11px] text-slate-400 w-9 text-right font-semibold">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}

            {paymentCategories.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs">
                Không có dữ liệu chi trong kỳ được chọn.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. DETAILED VOUCHERS TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              Bảng Kê Chi Tiết Chứng Từ Thu - Chi Đã Chuẩn Y
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Hồ sơ kế toán tài chính phục vụ công tác kiểm toán và giám sát điều hành của Ban Quản Trị
            </p>
          </div>
          <span className="font-mono text-xs font-bold text-slate-700">
            {filteredVouchers.length} chứng từ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                <th className="py-2.5 px-3">Mã Phiếu</th>
                <th className="py-2.5 px-3">Loại</th>
                <th className="py-2.5 px-3">Ngày Hạch Toán</th>
                <th className="py-2.5 px-3">Nội Dung / Lý Do</th>
                <th className="py-2.5 px-3">Hạng Mục</th>
                <th className="py-2.5 px-3 font-mono text-right">Số Tiền (VND)</th>
                <th className="py-2.5 px-3">Đối Tác / Người Nộp-Nhận</th>
                <th className="py-2.5 px-3">Phương Thức</th>
                <th className="py-2.5 px-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredVouchers.map(v => {
                const isReceipt = v.type === 'RECEIPT';
                return (
                  <tr key={v.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-mono font-bold text-slate-700">
                      {v.code}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isReceipt
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {isReceipt ? 'THU' : 'CHI'}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-600">
                      {formatDate(v.date)}
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-900 max-w-[260px] truncate" title={v.title}>
                      {v.title}
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {v.category}
                      </span>
                    </td>

                    <td
                      className={`py-3 px-3 font-mono text-right font-extrabold text-sm ${
                        isReceipt ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {isReceipt ? `+${formatVND(v.amountVND)}` : `-${formatVND(v.amountVND)}`}
                    </td>

                    <td className="py-3 px-3 text-slate-700 max-w-[180px] truncate">
                      {v.payerOrPayee}
                    </td>

                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {v.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt'}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setPrintingVoucher(v)}
                        className="p-1.5 text-[#0875D9] hover:text-white hover:bg-[#0875D9] rounded-lg transition-colors border border-[#0875D9]/25 shadow-2xs"
                        title="Xem và in phiếu thu / chi chuẩn kế toán"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredVouchers.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Không có chứng từ tài chính nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Voucher Modal */}
      <VoucherPrintModal
        voucher={printingVoucher}
        isOpen={Boolean(printingVoucher)}
        onClose={() => setPrintingVoucher(null)}
      />
    </div>
  );
};
