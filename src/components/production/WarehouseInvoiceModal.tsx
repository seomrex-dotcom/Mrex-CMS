import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  WarehouseInvoice,
  WarehouseInvoiceType,
  WarehouseInvoiceStatus,
  InvoiceItemDetail
} from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  Save,
  ArrowDownLeft,
  ArrowUpRight,
  Calculator,
  Building,
  User,
  Phone,
  Sparkles
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: WarehouseInvoiceType;
  onSave: (invoiceData: Omit<WarehouseInvoice, 'id'>) => void;
}

export const WarehouseInvoiceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultType = 'IMPORT',
  onSave
}) => {
  const { warehouseItems, currentUser } = useApp();

  const today = new Date().toISOString().slice(0, 10);
  const randomSuffix = Math.floor(100 + Math.random() * 900);

  const [type, setType] = useState<WarehouseInvoiceType>(defaultType);
  const [code, setCode] = useState(() => {
    const prefix = defaultType === 'IMPORT' ? 'NK' : 'XK';
    return `${prefix}-${today.replace(/-/g, '')}-${randomSuffix}`;
  });
  const [title, setTitle] = useState(
    defaultType === 'IMPORT'
      ? `Hóa đơn nhập vật tư đợt ${today.slice(5)}`
      : `Hóa đơn xuất thiết bị dự án ${today.slice(5)}`
  );
  const [partnerName, setPartnerName] = useState(
    defaultType === 'IMPORT'
      ? 'Công ty Cổ phần Công nghệ Linh Kiện Việt Nhật'
      : 'Tập đoàn Bất Động Sản & Công Nghệ Hưng Thịnh'
  );
  const [contactPhone, setContactPhone] = useState('0988 123 456');
  const [warehouseName, setWarehouseName] = useState('Kho Tổng Phân Xưởng A');
  const [deliveryDate, setDeliveryDate] = useState(today);
  const [vatRate, setVatRate] = useState<number>(10);
  const [status, setStatus] = useState<WarehouseInvoiceStatus>('COMPLETED');
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'UNPAID' | 'PARTIAL'>('PAID');
  const [note, setNote] = useState('');

  // Selected items list
  const [items, setItems] = useState<InvoiceItemDetail[]>(() => {
    const defaultItem = warehouseItems[0];
    if (!defaultItem) return [];
    const price = defaultType === 'IMPORT' ? defaultItem.unitPrice : (defaultItem.sellingPrice || defaultItem.unitPrice * 1.3);
    const qty = defaultType === 'IMPORT' ? 50 : Math.min(10, defaultItem.quantity);
    return [
      {
        itemId: defaultItem.id,
        itemName: defaultItem.name,
        sku: defaultItem.sku,
        quantity: qty,
        unit: defaultItem.unit,
        unitPrice: price,
        totalAmount: qty * price
      }
    ];
  });

  if (!isOpen) return null;

  const handleTypeChange = (newType: WarehouseInvoiceType) => {
    setType(newType);
    const prefix = newType === 'IMPORT' ? 'NK' : 'XK';
    setCode(`${prefix}-${today.replace(/-/g, '')}-${randomSuffix}`);
    setTitle(
      newType === 'IMPORT'
        ? `Hóa đơn nhập vật tư đợt ${today.slice(5)}`
        : `Hóa đơn xuất thiết bị dự án ${today.slice(5)}`
    );
    setPartnerName(
      newType === 'IMPORT'
        ? 'Công ty Cổ phần Công nghệ Linh Kiện Việt Nhật'
        : 'Tập đoàn Bất Động Sản & Công Nghệ Hưng Thịnh'
    );
  };

  const handleAddItem = (itemId: string) => {
    if (!itemId) return;
    const found = warehouseItems.find(i => i.id === itemId);
    if (!found) return;
    if (items.some(i => i.itemId === itemId)) {
      alert('Mặt hàng này đã có trong danh sách!');
      return;
    }

    const price = type === 'IMPORT' ? found.unitPrice : (found.sellingPrice || found.unitPrice * 1.3);
    const qty = type === 'IMPORT' ? 20 : Math.min(5, found.quantity || 1);

    setItems([
      ...items,
      {
        itemId: found.id,
        itemName: found.name,
        sku: found.sku,
        quantity: qty,
        unit: found.unit,
        unitPrice: price,
        totalAmount: qty * price
      }
    ]);
  };

  const handleUpdateItem = (index: number, updates: Partial<InvoiceItemDetail>) => {
    setItems(prev => {
      const copy = [...prev];
      const cur = copy[index];
      const merged = { ...cur, ...updates };
      merged.totalAmount = merged.quantity * merged.unitPrice;
      copy[index] = merged;
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const subTotal = items.reduce((sum, it) => sum + it.totalAmount, 0);
  const taxVND = Math.round(subTotal * (vatRate / 100));
  const grandTotal = subTotal + taxVND;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Vui lòng thêm ít nhất một mặt hàng!');
      return;
    }

    // Check stock for EXPORT
    if (type === 'EXPORT') {
      for (const it of items) {
        const stockItem = warehouseItems.find(w => w.id === it.itemId);
        if (stockItem && it.quantity > stockItem.quantity) {
          const confirmOver = confirm(
            `Cảnh báo: Mặt hàng "${it.itemName}" chỉ còn ${stockItem.quantity} ${it.unit} trong kho, nhưng số lượng xuất là ${it.quantity} ${it.unit}.\nBạn có muốn tiếp tục xuất?`
          );
          if (!confirmOver) return;
        }
      }
    }

    onSave({
      code: code.trim().toUpperCase(),
      type,
      title: title.trim(),
      partnerName: partnerName.trim(),
      contactPhone: contactPhone.trim(),
      createdDate: today,
      deliveryDate: deliveryDate || undefined,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      items,
      totalAmount: subTotal,
      taxVND,
      grandTotal,
      status,
      warehouseName,
      paymentStatus,
      note: note.trim() || undefined
    });

    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 pb-4 text-white flex items-center justify-between ${
          type === 'IMPORT'
            ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600'
            : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
              {type === 'IMPORT' ? <ArrowDownLeft className="w-6 h-6 text-white" /> : <ArrowUpRight className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {type === 'IMPORT' ? 'Lập Hóa Đơn Nhập Kho (Inbound)' : 'Lập Hóa Đơn Xuất Kho (Outbound)'}
              </h2>
              <p className="text-xs text-white/80 font-medium">
                {type === 'IMPORT' ? 'Ghi nhận hàng về từ nhà cung cấp & tăng tồn kho tự động' : 'Xuất bán khách hàng, dự án & trừ kho tự động'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200">
          {/* Invoice Type Selector */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('IMPORT')}
              className={`flex-1 py-3 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                type === 'IMPORT'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
              <span>HÓA ĐƠN NHẬP KHO (NHÀ CUNG CẤP)</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('EXPORT')}
              className={`flex-1 py-3 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                type === 'EXPORT'
                  ? 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-blue-600" />
              <span>HÓA ĐƠN XUẤT KHO (KHÁCH HÀNG / DỰ ÁN)</span>
            </button>
          </div>

          {/* Row 1: Code & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Số Hóa Đơn <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Tên Giao Dịch / Đợt Hàng <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </div>

          {/* Row 2: Partner & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-blue-500" />
                <span>{type === 'IMPORT' ? 'Nhà Cung Cấp' : 'Khách Hàng / Đối Tác Nhận'} <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                required
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-blue-500" />
                <span>Số Điện Thoại</span>
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </div>

          {/* Row 3: Warehouse & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                {type === 'IMPORT' ? 'Kho Nhập Đến' : 'Kho Xuất Đi'}
              </label>
              <select
                value={warehouseName}
                onChange={(e) => setWarehouseName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="Kho Tổng Phân Xưởng A">Kho Tổng Phân Xưởng A</option>
                <option value="Kho Linh Kiện & Bo Mạch">Kho Linh Kiện & Bo Mạch</option>
                <option value="Kho Nguyên Vật Liệu Thô">Kho Nguyên Vật Liệu Thô</option>
                <option value="Kho Thành Phẩm Hoàn Chỉnh">Kho Thành Phẩm Hoàn Chỉnh</option>
                <option value="Kho Bao Bì & Đóng Gói">Kho Bao Bì & Đóng Gói</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Ngày Giao Nhận Hàng
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Tình Trạng Thanh Toán
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="PAID">Đã thanh toán 100%</option>
                <option value="PARTIAL">Thanh toán tạm ứng 50%</option>
                <option value="UNPAID">Chưa thanh toán (Công nợ)</option>
              </select>
            </div>
          </div>

          {/* Items Table Section */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span>Chi tiết mặt hàng trong hóa đơn ({items.length})</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  onChange={(e) => {
                    handleAddItem(e.target.value);
                    e.target.value = '';
                  }}
                  defaultValue=""
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:outline-none"
                >
                  <option value="" disabled>+ Chọn mặt hàng từ kho...</option>
                  {warehouseItems.map(item => (
                    <option key={item.id} value={item.id}>
                      [{item.sku}] {item.name} (Tồn: {item.quantity} {item.unit})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Hàng Hóa / SKU</th>
                    <th className="p-3 text-center">ĐVT</th>
                    <th className="p-3 text-center w-24">Số Lượng</th>
                    <th className="p-3 text-right w-36">Đơn Giá (VNĐ)</th>
                    <th className="p-3 text-right w-40">Thành Tiền (VNĐ)</th>
                    <th className="p-3 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((it, idx) => {
                    const stockItem = warehouseItems.find(w => w.id === it.itemId);
                    const isExceed = type === 'EXPORT' && stockItem && it.quantity > stockItem.quantity;

                    return (
                      <tr key={it.itemId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{it.itemName}</div>
                          <div className="text-[10px] font-mono text-blue-600 flex items-center gap-2">
                            <span>{it.sku}</span>
                            {stockItem && (
                              <span className="text-slate-400">
                                (Hiện có: {stockItem.quantity} {stockItem.unit})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center text-slate-500">{it.unit}</td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="1"
                            value={it.quantity}
                            onChange={(e) => handleUpdateItem(idx, { quantity: Math.max(1, Number(e.target.value)) })}
                            className={`w-20 px-2 py-1.5 rounded-lg border font-mono font-bold text-center focus:outline-none ${
                              isExceed
                                ? 'border-rose-400 bg-rose-50 text-rose-600'
                                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-blue-600'
                            }`}
                          />
                          {isExceed && (
                            <div className="text-[10px] text-rose-500 font-medium mt-0.5">Vượt tồn kho!</div>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={it.unitPrice}
                            onChange={(e) => handleUpdateItem(idx, { unitPrice: Math.max(0, Number(e.target.value)) })}
                            className="w-32 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-right font-mono font-semibold focus:outline-none"
                          />
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                          {new Intl.NumberFormat('vi-VN').format(it.totalAmount)} đ
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Calculation Summary Box */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Thuế suất VAT:</span>
              <div className="flex gap-2">
                {[0, 8, 10].map((rate) => (
                  <button
                    type="button"
                    key={rate}
                    onClick={() => setVatRate(rate)}
                    className={`px-3 py-1 rounded-lg font-bold border transition-colors ${
                      vatRate === rate
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full sm:w-auto space-y-1.5 text-right font-mono">
              <div className="flex justify-between sm:justify-end gap-6 text-slate-500">
                <span>Tiền hàng trước thuế:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {new Intl.NumberFormat('vi-VN').format(subTotal)} đ
                </span>
              </div>
              <div className="flex justify-between sm:justify-end gap-6 text-slate-500">
                <span>Tiền thuế VAT ({vatRate}%):</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {new Intl.NumberFormat('vi-VN').format(taxVND)} đ
                </span>
              </div>
              <div className="flex justify-between sm:justify-end gap-6 text-sm font-bold text-blue-600 dark:text-blue-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>TỔNG THANH TOÁN:</span>
                <span>{new Intl.NumberFormat('vi-VN').format(grandTotal)} VNĐ</span>
              </div>
            </div>
          </div>

          {/* Row 4: Status & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Trạng Thái Hóa Đơn
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as WarehouseInvoiceStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="COMPLETED">
                  {type === 'IMPORT' ? 'Đã Nhập Kho Hoàn Tất (Cộng Tồn Ngay)' : 'Đã Xuất Kho Hoàn Tất (Trừ Tồn Ngay)'}
                </option>
                <option value="APPROVED">Đã Duyệt Phiếu (Chờ Xuất/Nhập Thực Tế)</option>
                <option value="PENDING_APPROVAL">Chờ Ban Quản Trị / Quản Đốc Duyệt</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Ghi Chú Đơn Hàng / Phương Tiện Vận Chuyển
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Xe tải 2.5T biển số 29C-888.99, người nhận Mr. Hùng..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-md flex items-center gap-2 ${
                type === 'IMPORT'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{type === 'IMPORT' ? 'Tạo Hóa Đơn Nhập Kho' : 'Tạo Hóa Đơn Xuất Kho'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
