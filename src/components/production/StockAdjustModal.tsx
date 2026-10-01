import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { WarehouseItem } from '../../types';
import { X, ArrowUpDown, Plus, Minus, AlertCircle, CheckCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: WarehouseItem | null;
  onAdjust: (id: string, deltaQuantity: number, reason?: string) => void;
}

const COMMON_REASONS = [
  'Nhập bổ sung đột xuất từ phân xưởng',
  'Xuất cấp phát trực tiếp cho dây chuyền',
  'Điều chỉnh sau đối chiếu kiểm đếm',
  'Hàng lỗi/vỡ hỏng xuất hủy',
  'Xuất làm mẫu thử nghiệm R&D'
];

export const StockAdjustModal: React.FC<Props> = ({
  isOpen,
  onClose,
  item,
  onAdjust
}) => {
  const [mode, setMode] = useState<'INCREASE' | 'DECREASE'>('INCREASE');
  const [amount, setAmount] = useState<number>(10);
  const [reason, setReason] = useState<string>(COMMON_REASONS[0]);

  if (!isOpen || !item) return null;

  const currentQty = item.quantity;
  const delta = mode === 'INCREASE' ? amount : -amount;
  const projectedQty = Math.max(0, currentQty + delta);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Vui lòng nhập số lượng lớn hơn 0!');
      return;
    }
    if (mode === 'DECREASE' && amount > currentQty) {
      if (!confirm(`Số lượng xuất (${amount}) lớn hơn tồn kho hiện tại (${currentQty}). Tồn kho sẽ về 0. Bạn có chắc chắn?`)) {
        return;
      }
    }

    onAdjust(item.id, delta, reason);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <ArrowUpDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Điều Chỉnh Số Lượng Tồn Kho</h3>
              <p className="text-xs text-blue-100 font-mono">{item.sku} - {item.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-slate-800 dark:text-slate-200">
          {/* Item Status Info */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium">Tồn kho hiện tại:</div>
              <div className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100">
                {currentQty.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 font-medium">Vị trí lưu trữ:</div>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {item.warehouseLocation}
              </div>
            </div>
          </div>

          {/* Mode Tabs (+ / -) */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setMode('INCREASE')}
              className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                mode === 'INCREASE'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Cộng Thêm Số Lượng</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('DECREASE')}
              className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                mode === 'DECREASE'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Minus className="w-4 h-4" />
              <span>Trừ Bớt Số Lượng</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Số lượng điều chỉnh ({item.unit}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-lg font-bold font-mono text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            {/* Quick amount chips */}
            <div className="flex gap-2 mt-2">
              {[5, 10, 20, 50, 100].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setAmount(val)}
                  className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Reason selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Lý do điều chỉnh
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do điều chỉnh..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {COMMON_REASONS.slice(0, 3).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setReason(r)}
                  className="text-[11px] px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Projected Result Card */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="text-xs text-slate-500">Tồn kho dự kiến sau cập nhật:</div>
                <div className="text-base font-bold font-mono text-blue-700 dark:text-blue-300">
                  {projectedQty.toLocaleString('vi-VN')} {item.unit}
                </div>
              </div>
            </div>
            <div className="text-xs font-bold px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600">
              {projectedQty <= 0 ? (
                <span className="text-rose-500">Hết hàng</span>
              ) : projectedQty <= item.minStock ? (
                <span className="text-amber-500">Sắp hết hàng</span>
              ) : (
                <span className="text-emerald-500">Đủ hàng</span>
              )}
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
              className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-md transition-all ${
                mode === 'INCREASE'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Xác Nhận {mode === 'INCREASE' ? 'Cộng Kho' : 'Trừ Kho'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
