import React, { useState, useEffect } from 'react';
import { FinancialVoucher, PaymentMethod, VoucherType } from '../../types';
import { useApp } from '../../context/AppContext';
import { numberToVietnameseWords } from '../../utils/numberToVietnameseWords';
import {
  X,
  PlusCircle,
  FileText,
  DollarSign,
  Calendar,
  Building,
  CreditCard,
  User,
  Sparkles,
  Phone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  voucherToEdit?: FinancialVoucher | null;
  defaultType?: VoucherType;
}

const RECEIPT_CATEGORIES = [
  'Doanh thu Dự án & Hợp đồng phần mềm',
  'Doanh thu Tư vấn & Chuyển đổi số',
  'Doanh thu Dịch vụ Bảo trì & Vận hành',
  'Thu hồi tạm ứng & Khác',
  'Thu lãi tiền gửi ngân hàng'
];

const PAYMENT_CATEGORIES = [
  'Lương & Chế độ đãi ngộ Nhân sự',
  'Chi phí Thuê văn phòng & Hạ tầng',
  'Chi phí Hạ tầng Kỹ thuật & Máy chủ Cloud',
  'Mua sắm Thiết bị & Công cụ làm việc',
  'Hoạt động Văn hóa & Tiếp khách',
  'Công tác phí & Di chuyển',
  'Đào tạo & Phát triển nhân sự',
  'Chi phí Hành chính & Văn phòng phẩm'
];

export const VoucherFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  voucherToEdit,
  defaultType = 'RECEIPT'
}) => {
  const { vouchers, addVoucher, updateVoucher, currentUser } = useApp();

  const isExecutive = currentUser.role === 'CEO' || currentUser.role === 'MANAGER';
  const isEditing = Boolean(voucherToEdit);

  // If not executive, always restrict to PAYMENT (Phiếu Chi)
  const effectiveDefaultType = isExecutive ? defaultType : 'PAYMENT';

  const [type, setType] = useState<VoucherType>(effectiveDefaultType);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(RECEIPT_CATEGORIES[0]);
  const [amountVND, setAmountVND] = useState<number>(10000000);
  const [date, setDate] = useState('2026-09-30');
  const [payerOrPayee, setPayerOrPayee] = useState('');
  const [payerOrPayeePhone, setPayerOrPayeePhone] = useState('');
  const [payerOrPayeeAddress, setPayerOrPayeeAddress] = useState('');
  const [accountantName, setAccountantName] = useState(currentUser.name);
  const [approverName, setApproverName] = useState('Trần Hoàng Nam (Tổng Giám Đốc)');
  const [cashierName, setCashierName] = useState('Hoàng Bích Thủy (Thủ quỹ)');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [referenceDoc, setReferenceDoc] = useState('');
  const [notes, setNotes] = useState('');

  // Auto-generate code when type changes or on open
  useEffect(() => {
    if (voucherToEdit) {
      setType(voucherToEdit.type);
      setCode(voucherToEdit.code);
      setTitle(voucherToEdit.title);
      setCategory(voucherToEdit.category);
      setAmountVND(voucherToEdit.amountVND);
      setDate(voucherToEdit.date);
      setPayerOrPayee(voucherToEdit.payerOrPayee);
      setPayerOrPayeePhone(voucherToEdit.payerOrPayeePhone || '');
      setPayerOrPayeeAddress(voucherToEdit.payerOrPayeeAddress || '');
      setAccountantName(voucherToEdit.accountantName);
      setApproverName(voucherToEdit.approverName);
      setCashierName(voucherToEdit.cashierName);
      setPaymentMethod(voucherToEdit.paymentMethod);
      setReferenceDoc(voucherToEdit.referenceDoc || '');
      setNotes(voucherToEdit.notes || '');
    } else {
      const isReceipt = type === 'RECEIPT';
      const prefix = isReceipt ? 'PT' : 'PC';
      const yearMonth = '202609';
      const count = vouchers.filter(v => v.type === type).length + 1;
      const formattedCount = count < 10 ? `00${count}` : count < 100 ? `0${count}` : `${count}`;

      setCode(`${prefix}-${yearMonth}-${formattedCount}`);
      setCategory(isReceipt ? RECEIPT_CATEGORIES[0] : PAYMENT_CATEGORIES[0]);
      setTitle('');
      setAmountVND(isReceipt ? 50000000 : 15000000);
      setDate(new Date().toISOString().slice(0, 10));
      setPayerOrPayee('');
      setPayerOrPayeePhone('');
      setPayerOrPayeeAddress('');
      setAccountantName(currentUser.name);
      setApproverName('Trần Hoàng Nam (Tổng Giám Đốc)');
      setCashierName('Hoàng Bích Thủy (Thủ quỹ)');
      setPaymentMethod('BANK_TRANSFER');
      setReferenceDoc('');
      setNotes('');
    }
  }, [voucherToEdit, isOpen, type, vouchers.length, currentUser.name]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !payerOrPayee.trim() || amountVND <= 0) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc: Lý do, Người nộp/nhận và Số tiền hợp lệ.');
      return;
    }

    if (type === 'RECEIPT' && !isExecutive) {
      alert('Quyền bị từ chối: Chỉ có Ban Quản Trị và Cấp Quản Lý mới có quyền thu tiền và lập Phiếu Thu. Cấp nhân viên lập Phiếu Chi.');
      return;
    }

    const month = date.slice(0, 7);

    const payload: Omit<FinancialVoucher, 'id' | 'createdAt'> = {
      code: code.trim(),
      type,
      title: title.trim(),
      category,
      amountVND: Number(amountVND) || 0,
      date,
      month,
      payerOrPayee: payerOrPayee.trim(),
      payerOrPayeePhone: payerOrPayeePhone.trim() || undefined,
      payerOrPayeeAddress: payerOrPayeeAddress.trim() || undefined,
      accountantName: accountantName.trim(),
      approverName: approverName.trim(),
      cashierName: cashierName.trim(),
      paymentMethod,
      referenceDoc: referenceDoc.trim() || undefined,
      notes: notes.trim() || undefined,
      status: 'APPROVED'
    };

    if (isEditing && voucherToEdit) {
      updateVoucher(voucherToEdit.id, payload);
    } else {
      addVoucher(payload);
    }

    onClose();
  };

  const amountInWords = numberToVietnameseWords(amountVND);
  const categoriesList = type === 'RECEIPT' ? RECEIPT_CATEGORIES : PAYMENT_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-xs ${
                type === 'RECEIPT' ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            >
              {type === 'RECEIPT' ? 'PT' : 'PC'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  {isEditing
                    ? `Chỉnh Sửa ${type === 'RECEIPT' ? 'Phiếu Thu' : 'Phiếu Chi'}`
                    : `Lập ${type === 'RECEIPT' ? 'Phiếu Thu Tiền' : 'Phiếu Chi Tiền'} Mới`}
                </h2>
                <span className="font-mono text-xs font-semibold text-[#0B4FA8] bg-[#EAF5FF] border border-[#0875D9]/25 px-2 py-0.5 rounded">
                  {code}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Chứng từ hạch toán quỹ doanh nghiệp chuẩn Thông tư 200/133 BTC
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          {/* Voucher Type Tabs (Only if not editing) */}
          {!isEditing && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Loại chứng từ quỹ</label>
              {isExecutive ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('RECEIPT')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      type === 'RECEIPT'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Phiếu Thu (Tiền vào doanh nghiệp)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('PAYMENT')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      type === 'PAYMENT'
                        ? 'bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-500/20 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Phiếu Chi (Tiền ra khỏi quỹ)</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-rose-50/90 border border-rose-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                    <div>
                      <span className="font-bold text-rose-950">Phiếu Chi / Đề Xuất Thanh Toán Tạm Ứng</span>
                      <p className="text-[11px] text-rose-700 mt-0.5">
                        Quyền cấp Nhân viên: Khai báo nội dung chi để gửi Ban Quản Trị và Cấp Quản Lý phê duyệt
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200 font-bold shrink-0">
                    Cấp Nhân Viên
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Code & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mã số phiếu</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0875D9]"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ngày lập phiếu</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0875D9]"
                required
              />
            </div>
          </div>

          {/* Amount & Vietnamese Words Preview */}
          <div className="p-3.5 bg-[#EAF5FF]/50 border border-indigo-100 rounded-xl space-y-2">
            <div>
              <label className="block font-bold text-slate-900 mb-1">
                Số tiền thanh toán (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1000"
                  step="10000"
                  value={amountVND}
                  onChange={e => setAmountVND(Number(e.target.value) || 0)}
                  className="w-full pl-3 pr-14 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold font-mono text-[#00144b] focus:outline-none focus:ring-2 focus:ring-[#0875D9]"
                  required
                />
                <span className="absolute right-3 top-2.5 font-bold text-xs text-slate-400 font-mono">
                  VND
                </span>
              </div>
            </div>

            <div className="flex items-start gap-1.5 text-[11px] text-[#00144b] bg-white p-2 rounded-lg border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-[#0875D9] shrink-0 mt-0.5" />
              <div className="leading-tight">
                <span className="font-semibold text-slate-500">Bằng chữ: </span>
                <span className="font-bold text-indigo-950 italic">{amountInWords}</span>
              </div>
            </div>
          </div>

          {/* Reason / Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {type === 'RECEIPT' ? 'Lý do nộp tiền' : 'Lý do chi tiền'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={type === 'RECEIPT' ? 'Ví dụ: Thu tiền hợp đồng triển khai phần mềm...' : 'Ví dụ: Chi trả lương nhân viên tháng 09...'}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0875D9]"
              required
            />
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hạng mục thu / chi</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#0875D9]"
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hình thức thanh toán</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#0875D9]"
              >
                <option value="BANK_TRANSFER">Chuyển khoản Ngân hàng (Ủy nhiệm chi)</option>
                <option value="CASH">Tiền mặt tại quỹ</option>
              </select>
            </div>
          </div>

          {/* Payer or Payee Info */}
          <div className="p-3 border border-slate-200 rounded-xl space-y-3 bg-slate-50/50">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#0875D9]" />
              <span>{type === 'RECEIPT' ? 'Thông tin Người nộp tiền' : 'Thông tin Người nhận tiền'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Họ tên đối tác / Nhân viên <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={payerOrPayee}
                  onChange={e => setPayerOrPayee(e.target.value)}
                  placeholder="Họ tên cá nhân hoặc tên Doanh nghiệp"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0875D9]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Số điện thoại liên hệ</label>
                <input
                  type="text"
                  value={payerOrPayeePhone}
                  onChange={e => setPayerOrPayeePhone(e.target.value)}
                  placeholder="0912 xxx xxx"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0875D9]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Địa chỉ / Đơn vị công tác</label>
              <input
                type="text"
                value={payerOrPayeeAddress}
                onChange={e => setPayerOrPayeeAddress(e.target.value)}
                placeholder="Địa chỉ trụ sở hoặc tên phòng ban nội bộ"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0875D9]"
              />
            </div>
          </div>

          {/* Reference Docs & Responsible People */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chứng từ gốc kèm theo</label>
              <input
                type="text"
                value={referenceDoc}
                onChange={e => setReferenceDoc(e.target.value)}
                placeholder="HĐ số..., Hóa đơn GTGT..., Tờ trình..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0875D9]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Người duyệt chứng từ</label>
              <input
                type="text"
                value={approverName}
                onChange={e => setApproverName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0875D9]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ghi chú thêm</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Thông tin tài khoản ngân hàng, mốc nghiệm thu, điều khoản thanh toán..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0875D9]"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              className={`px-5 py-2 text-white font-bold rounded-lg text-xs transition-all shadow-md flex items-center gap-1.5 ${
                type === 'RECEIPT'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditing ? 'Cập Nhật Chứng Từ' : `Lưu & Xuất ${type === 'RECEIPT' ? 'Phiếu Thu' : 'Phiếu Chi'}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
