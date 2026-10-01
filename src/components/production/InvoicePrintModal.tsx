import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { WarehouseInvoice } from '../../types';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../common/BrandLogo';
import { numberToVietnameseWords } from '../../utils/numberToVietnameseWords';
import {
  Printer,
  X,
  FileText,
  Building,
  CheckCircle,
  Calendar,
  Phone,
  QrCode,
  Download
} from 'lucide-react';

interface Props {
  invoice: WarehouseInvoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<Props> = ({ invoice, isOpen, onClose }) => {
  const { brandConfig } = useApp();
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !invoice) return null;

  const isImport = invoice.type === 'IMPORT';
  const docTitle = isImport ? 'PHIẾU NHẬP KHO' : 'PHIẾU XUẤT KHO';
  const templateCode = isImport ? 'Mẫu số 01 - VT' : 'Mẫu số 02 - VT';
  const circular = '(Ban hành theo Thông tư số 200/2014/TT-BTC & 133/2016/TT-BTC của Bộ Tài chính)';

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Xem & In Hóa Đơn Kho Điện Tử: {invoice.code}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>In Hóa Đơn (Ctrl + P)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div 
          ref={printAreaRef} 
          className="p-8 sm:p-10 overflow-y-auto flex-1 bg-white font-sans text-slate-900 space-y-6 print:p-0 print:m-0"
        >
          {/* Header 2 columns */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b border-slate-300">
            {/* Left: Brand & Company info */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <BrandLogo
                  logoType={brandConfig.logoType}
                  logoUrl={brandConfig.logoUrl}
                  symbolId={brandConfig.logoSymbolId}
                  primaryColor={brandConfig.primaryColorHex}
                  size="sm"
                />
                <div>
                  <h1 className="text-base font-extrabold tracking-tight text-slate-900 uppercase">
                    {brandConfig.companyName || 'AEUXGLOBAL TECHNOLOGY & PRODUCTION CORP'}
                  </h1>
                  <p className="text-[11px] text-slate-500 font-medium">Khối Sản Xuất & Trung Tâm Phân Phối Kho Vận Toàn Cầu</p>
                </div>
              </div>
              <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                <div>Địa chỉ: Khu Công Nghệ Cao Hòa Lạc, Thạch Thất, TP. Hà Nội</div>
                <div>Điện thoại: (024) 3899 8888 • Hotline Kỹ thuật & Kho: 1900 6868</div>
                <div>Mã số thuế: 0108992345 • Website: aeuxglobal.com</div>
              </div>
            </div>

            {/* Right: Ministry Standard & QR Code */}
            <div className="flex items-center gap-4 text-right sm:self-start">
              <div className="space-y-1 text-xs">
                <div className="font-bold text-slate-800">{templateCode}</div>
                <div className="text-[10px] text-slate-500 max-w-[200px] leading-tight">{circular}</div>
                <div className="font-mono text-xs font-bold text-blue-700 pt-1">
                  Số: <span className="underline">{invoice.code}</span>
                </div>
              </div>

              {/* QR Code Graphic for Invoice Verification */}
              <div className="p-2 border border-slate-300 rounded-xl bg-slate-50 text-center shrink-0">
                <svg className="w-16 h-16 text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" fillOpacity="0.15" />
                  <rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor" fillOpacity="0.15" />
                  <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor" fillOpacity="0.15" />
                  <rect x="5" y="5" width="3" height="3" fill="currentColor" />
                  <rect x="16" y="5" width="3" height="3" fill="currentColor" />
                  <rect x="5" y="16" width="3" height="3" fill="currentColor" />
                  <rect x="14" y="14" width="3" height="3" fill="currentColor" />
                  <rect x="19" y="15" width="2" height="4" fill="currentColor" />
                  <rect x="15" y="19" width="4" height="2" fill="currentColor" />
                  <circle cx="12" cy="8" r="1" fill="currentColor" />
                  <circle cx="8" cy="12" r="1" fill="currentColor" />
                  <circle cx="12" cy="16" r="1" fill="currentColor" />
                </svg>
                <div className="text-[9px] font-mono text-slate-500 mt-1">Quét xác thực</div>
              </div>
            </div>
          </div>

          {/* Title Centered */}
          <div className="text-center py-2">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              {docTitle}
            </h2>
            <div className="text-xs text-slate-500 italic mt-1">
              Ngày lập phiếu: {invoice.createdDate} • Ngày xuất/nhập thực tế: {invoice.deliveryDate || invoice.createdDate}
            </div>
          </div>

          {/* Details Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
            <div className="flex">
              <span className="w-32 text-slate-500 font-medium">
                {isImport ? 'Đơn vị giao hàng / NCC:' : 'Đơn vị nhận / Khách hàng:'}
              </span>
              <span className="font-bold text-slate-900 flex-1">{invoice.partnerName}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500 font-medium">Số điện thoại:</span>
              <span className="font-mono font-semibold text-slate-800 flex-1">{invoice.contactPhone}</span>
            </div>
            <div className="flex">
              <span className="w-32 text-slate-500 font-medium">
                {isImport ? 'Nhập tại kho:' : 'Xuất từ kho:'}
              </span>
              <span className="font-semibold text-blue-700 flex-1">{invoice.warehouseName}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500 font-medium">Nhân sự lập phiếu:</span>
              <span className="font-semibold text-slate-800 flex-1">{invoice.creatorName}</span>
            </div>
            <div className="flex sm:col-span-2">
              <span className="w-32 text-slate-500 font-medium">Lý do giao dịch:</span>
              <span className="text-slate-800 flex-1">{invoice.title} {invoice.note ? `(${invoice.note})` : ''}</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-3 text-center w-12 border-r border-slate-300">STT</th>
                  <th className="p-3 border-r border-slate-300">Tên Hàng Hóa, Vật Tư / Quy Cách</th>
                  <th className="p-3 text-center border-r border-slate-300 w-24">Mã SKU</th>
                  <th className="p-3 text-center border-r border-slate-300 w-20">ĐVT</th>
                  <th className="p-3 text-center border-r border-slate-300 w-24">Số Lượng</th>
                  <th className="p-3 text-right border-r border-slate-300 w-32">Đơn Giá</th>
                  <th className="p-3 text-right w-36">Thành Tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items.map((it, idx) => (
                  <tr key={it.itemId}>
                    <td className="p-3 text-center font-mono border-r border-slate-200">{idx + 1}</td>
                    <td className="p-3 font-semibold text-slate-900 border-r border-slate-200">
                      {it.itemName}
                    </td>
                    <td className="p-3 text-center font-mono text-blue-600 font-bold border-r border-slate-200">
                      {it.sku}
                    </td>
                    <td className="p-3 text-center text-slate-600 border-r border-slate-200">{it.unit}</td>
                    <td className="p-3 text-center font-mono font-bold text-slate-900 border-r border-slate-200">
                      {it.quantity.toLocaleString('vi-VN')}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-700 border-r border-slate-200">
                      {new Intl.NumberFormat('vi-VN').format(it.unitPrice)} đ
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      {new Intl.NumberFormat('vi-VN').format(it.totalAmount)} đ
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-slate-300 bg-slate-50 font-semibold text-xs">
                <tr>
                  <td colSpan={6} className="p-2.5 text-right text-slate-600 border-r border-slate-300">
                    Cộng tiền hàng (chưa VAT):
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                    {new Intl.NumberFormat('vi-VN').format(invoice.totalAmount)} đ
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} className="p-2.5 text-right text-slate-600 border-r border-slate-300">
                    Thuế suất giá trị gia tăng (VAT):
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                    {new Intl.NumberFormat('vi-VN').format(invoice.taxVND)} đ
                  </td>
                </tr>
                <tr className="bg-slate-100/80 font-bold text-sm">
                  <td colSpan={6} className="p-3 text-right text-blue-800 uppercase tracking-wider border-r border-slate-300">
                    TỔNG CỘNG TIỀN THANH TOÁN (VNĐ):
                  </td>
                  <td className="p-3 text-right font-mono text-blue-700">
                    {new Intl.NumberFormat('vi-VN').format(invoice.grandTotal)} VNĐ
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Amount in Vietnamese Words */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-start gap-2">
            <span className="font-bold text-slate-700 shrink-0">Số tiền viết bằng chữ:</span>
            <span className="italic font-medium text-slate-800 capitalize">
              {numberToVietnameseWords(invoice.grandTotal)} đồng chẵn.
            </span>
          </div>

          {/* Signatures section (4 boxes) */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
            <div className="space-y-1">
              <div className="font-bold text-slate-900 uppercase">Người Lập Phiếu</div>
              <div className="text-[11px] text-slate-400 italic">(Ký, ghi rõ họ tên)</div>
              <div className="h-16 flex items-end justify-center font-bold text-slate-800 pb-1">
                {invoice.creatorName}
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900 uppercase">
                {isImport ? 'Người Giao Hàng' : 'Người Nhận Hàng'}
              </div>
              <div className="text-[11px] text-slate-400 italic">(Ký, ghi rõ họ tên)</div>
              <div className="h-16 flex items-end justify-center font-bold text-slate-800 pb-1">
                {invoice.partnerName.slice(0, 24)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900 uppercase">Thủ Kho</div>
              <div className="text-[11px] text-slate-400 italic">(Ký, xác nhận nhập/xuất)</div>
              <div className="h-16 flex items-end justify-center font-bold text-slate-800 pb-1">
                Hoàng Kim Oanh
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900 uppercase">Kế Toán / Quản Đốc</div>
              <div className="text-[11px] text-slate-400 italic">(Ký, đóng dấu duyệt)</div>
              <div className="h-16 flex items-end justify-center font-bold text-blue-700 pb-1">
                Võ Văn Lực
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
