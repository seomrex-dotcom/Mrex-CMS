import React, { useRef } from 'react';
import { FinancialVoucher } from '../../types';
import { numberToVietnameseWords } from '../../utils/numberToVietnameseWords';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../common/BrandLogo';
import {
  Printer,
  X,
  FileText,
  Building,
  CheckCircle,
  Download,
  Calendar,
  CreditCard,
  Banknote
} from 'lucide-react';

interface Props {
  voucher: FinancialVoucher | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VoucherPrintModal: React.FC<Props> = ({ voucher, isOpen, onClose }) => {
  const { brandConfig } = useApp();
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !voucher) return null;

  const isReceipt = voucher.type === 'RECEIPT';
  const voucherTitle = isReceipt ? 'PHIẾU THU' : 'PHIẾU CHI';
  const standardTemplateCode = isReceipt ? 'Mẫu số 01 - TT' : 'Mẫu số 02 - TT';
  const standardCircular = '(Ban hành theo Thông tư số 200/2014/TT-BTC & 133/2016/TT-BTC của Bộ Tài chính)';

  const formattedAmount = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(voucher.amountVND);

  const amountInWords = numberToVietnameseWords(voucher.amountVND);

  // Parse date
  const [year, month, day] = voucher.date.split('-');

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [
        ['Mục', 'Thông tin chứng từ'],
        ['Mã phiếu', voucher.code],
        ['Loại chứng từ', isReceipt ? 'Phiếu Thu' : 'Phiếu Chi'],
        ['Ngày lập', voucher.date],
        ['Lý do', `"${voucher.title}"`],
        ['Họ tên đối tác', `"${voucher.payerOrPayee}"`],
        ['Số điện thoại', `"${voucher.payerOrPayeePhone || ''}"`],
        ['Địa chỉ', `"${voucher.payerOrPayeeAddress || ''}"`],
        ['Số tiền (VND)', voucher.amountVND],
        ['Số tiền bằng chữ', `"${amountInWords}"`],
        ['Phương thức', voucher.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt'],
        ['Chứng từ kèm theo', `"${voucher.referenceDoc || ''}"`],
        ['Người lập phiếu', `"${voucher.accountantName}"`],
        ['Người duyệt', `"${voucher.approverName}"`],
        ['Thủ quỹ', `"${voucher.cashierName}"`],
      ]
        .map(row => row.join(','))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${voucher.code}_${voucher.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200">
        {/* Top Control Bar (Hidden during print) */}
        <div className="print:hidden px-5 sm:px-6 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs ${
                isReceipt ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            >
              {isReceipt ? 'PT' : 'PC'}
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Xem & Xuất {voucherTitle}</span>
                <span className="font-mono text-[11px] text-[#0B4FA8] bg-[#EAF5FF] px-2 py-0.5 rounded border border-[#0875D9]/25">
                  {voucher.code}
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Xuất file CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Xuất CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#0875D9] hover:bg-[#065eb0] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              title="In trực tiếp ra giấy hoặc lưu thành file PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Phiếu / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Paper Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100/50 print:bg-white print:p-0">
          <div
            ref={printAreaRef}
            className="max-w-2xl mx-auto bg-white p-8 sm:p-12 border border-slate-200 rounded-xl shadow-sm print:border-none print:shadow-none print:p-6 text-slate-900 font-sans"
          >
            {/* Header: Company & Circular Template Info */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-300">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <BrandLogo
                    logoType={brandConfig.logoType}
                    logoUrl={brandConfig.logoUrl}
                    symbolId={brandConfig.logoSymbolId}
                    primaryColor={brandConfig.primaryColorHex}
                    size="xs"
                  />
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                    {brandConfig.companyName} {brandConfig.tagline ? `· ${brandConfig.tagline}` : ''}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-600">
                  Trụ sở: Tòa nhà Hội sở Doanh nghiệp · Hệ thống phần mềm quản trị
                </p>
                <p className="text-[11px] text-slate-600 font-mono">
                  Mã số thuế: 0109988776 · Hotline: 1900 8899
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="font-bold text-xs text-slate-800">{standardTemplateCode}</div>
                <div className="text-[9px] text-slate-500 max-w-[210px] leading-tight mt-0.5">
                  {standardCircular}
                </div>
              </div>
            </div>

            {/* Voucher Title and Meta */}
            <div className="text-center my-6 space-y-1">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                {voucherTitle}
              </h1>
              <div className="text-xs text-slate-600 italic">
                Ngày {day} tháng {month} năm {year}
              </div>
              <div className="text-xs font-mono font-semibold text-slate-700">
                Số: <span className="text-[#0B4FA8] font-bold">{voucher.code}</span>
              </div>
            </div>

            {/* Voucher Details Body */}
            <div className="space-y-3.5 text-xs text-slate-800">
              <div className="flex items-baseline">
                <span className="font-semibold text-slate-900 w-44 shrink-0">
                  {isReceipt ? 'Họ và tên người nộp tiền:' : 'Họ và tên người nhận tiền:'}
                </span>
                <span className="font-bold text-slate-900 flex-1 border-b border-dotted border-slate-400 pb-0.5">
                  {voucher.payerOrPayee}
                </span>
              </div>

              {voucher.payerOrPayeeAddress && (
                <div className="flex items-baseline">
                  <span className="font-semibold text-slate-900 w-44 shrink-0">Địa chỉ / Bộ phận:</span>
                  <span className="flex-1 border-b border-dotted border-slate-400 pb-0.5 text-slate-700">
                    {voucher.payerOrPayeeAddress} {voucher.payerOrPayeePhone ? `· ĐT: ${voucher.payerOrPayeePhone}` : ''}
                  </span>
                </div>
              )}

              <div className="flex items-baseline">
                <span className="font-semibold text-slate-900 w-44 shrink-0">
                  {isReceipt ? 'Lý do nộp tiền:' : 'Lý do chi tiền:'}
                </span>
                <span className="flex-1 border-b border-dotted border-slate-400 pb-0.5 text-slate-800 font-medium">
                  {voucher.title}
                </span>
              </div>

              <div className="flex items-baseline">
                <span className="font-semibold text-slate-900 w-44 shrink-0">Hạng mục thu/chi:</span>
                <span className="flex-1 border-b border-dotted border-slate-400 pb-0.5 text-slate-700">
                  {voucher.category}
                </span>
              </div>

              <div className="flex items-baseline">
                <span className="font-semibold text-slate-900 w-44 shrink-0">Hình thức thanh toán:</span>
                <span className="flex-1 border-b border-dotted border-slate-400 pb-0.5 font-semibold text-slate-800">
                  {voucher.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản Ngân hàng (Ủy nhiệm chi)' : 'Tiền mặt tại quỹ'}
                </span>
              </div>

              {/* Amount Highlight */}
              <div className="flex items-baseline pt-1">
                <span className="font-bold text-slate-900 w-44 shrink-0">Số tiền thanh toán:</span>
                <span className="flex-1 text-base font-extrabold text-[#00144b] font-mono border-b border-slate-300 pb-0.5">
                  {formattedAmount}
                </span>
              </div>

              {/* Amount in Vietnamese Words */}
              <div className="flex items-baseline bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-900 w-40 shrink-0 italic">Viết bằng chữ:</span>
                <span className="flex-1 font-bold text-slate-800 italic leading-snug">
                  {amountInWords}
                </span>
              </div>

              {voucher.referenceDoc && (
                <div className="flex items-baseline pt-1">
                  <span className="font-semibold text-slate-600 w-44 shrink-0 text-[11px]">Kèm theo chứng từ gốc:</span>
                  <span className="flex-1 text-[11px] text-slate-600 border-b border-dotted border-slate-300 pb-0.5">
                    {voucher.referenceDoc}
                  </span>
                </div>
              )}
            </div>

            {/* Date line before signatures */}
            <div className="text-right text-[11px] text-slate-600 italic mt-8 mb-4">
              Hà Nội, ngày {day} tháng {month} năm {year}
            </div>

            {/* Signatures 4 Columns */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs pt-2">
              <div className="space-y-1">
                <div className="font-bold text-slate-900">Giám đốc</div>
                <div className="text-[10px] text-slate-400 italic">(Ký, đóng dấu, họ tên)</div>
                <div className="h-16 flex items-end justify-center font-semibold text-[11px] text-slate-800">
                  {voucher.approverName.split('(')[0].trim()}
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-slate-900">Kế toán trưởng</div>
                <div className="text-[10px] text-slate-400 italic">(Ký, họ tên)</div>
                <div className="h-16 flex items-end justify-center font-semibold text-[11px] text-slate-800">
                  {voucher.accountantName}
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-slate-900">Thủ quỹ</div>
                <div className="text-[10px] text-slate-400 italic">(Ký, họ tên)</div>
                <div className="h-16 flex items-end justify-center font-semibold text-[11px] text-slate-800">
                  {voucher.cashierName}
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-slate-900">
                  {isReceipt ? 'Người nộp tiền' : 'Người nhận tiền'}
                </div>
                <div className="text-[10px] text-slate-400 italic">(Ký, họ tên)</div>
                <div className="h-16 flex items-end justify-center font-semibold text-[11px] text-slate-800">
                  {voucher.payerOrPayee.split('(')[0].trim().slice(0, 20)}
                </div>
              </div>
            </div>

            {/* Receipt acknowledgment text */}
            <div className="mt-8 pt-4 border-t border-dashed border-slate-200 text-[10px] text-slate-500 italic text-center">
              (Đã nhận đủ số tiền: <span className="font-semibold text-slate-700">{amountInWords}</span>)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
