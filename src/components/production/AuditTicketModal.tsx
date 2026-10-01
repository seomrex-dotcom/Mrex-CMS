import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { WarehouseItem, InventoryAuditTicket, AuditItemDetail, QualityCheckStatus, AuditStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, ClipboardCheck, Plus, Trash2, AlertTriangle, CheckCircle, Save, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (auditData: Omit<InventoryAuditTicket, 'id' | 'createdAt'>) => void;
}

export const AuditTicketModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const { warehouseItems, currentUser, employees } = useApp();

  const today = new Date().toISOString().slice(0, 10);
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  
  const [code, setCode] = useState(`PKH-${today.replace(/-/g, '')}-${randomSuffix}`);
  const [title, setTitle] = useState(`Kiểm kê định kỳ Kho - ${today}`);
  const [warehouseName, setWarehouseName] = useState('Kho Tổng Phân Xưởng A');
  const [auditorId, setAuditorId] = useState(currentUser.id);
  const [status, setStatus] = useState<AuditStatus>('COMPLETED');
  const [summaryNote, setSummaryNote] = useState('');

  // Initial items selected
  const [selectedItems, setSelectedItems] = useState<AuditItemDetail[]>(() => {
    return warehouseItems.slice(0, 4).map(item => ({
      itemId: item.id,
      itemName: item.name,
      sku: item.sku,
      unit: item.unit,
      systemQty: item.quantity,
      actualQty: item.quantity,
      difference: 0,
      qualityStatus: 'QUALIFIED' as QualityCheckStatus,
      note: 'Hàng nguyên seal, bao bì tiêu chuẩn'
    }));
  });

  if (!isOpen) return null;

  const handleAddItem = (itemId: string) => {
    if (!itemId) return;
    const item = warehouseItems.find(i => i.id === itemId);
    if (!item) return;
    if (selectedItems.some(si => si.itemId === itemId)) {
      alert('Mặt hàng này đã có trong danh sách kiểm kê!');
      return;
    }

    setSelectedItems([
      ...selectedItems,
      {
        itemId: item.id,
        itemName: item.name,
        sku: item.sku,
        unit: item.unit,
        systemQty: item.quantity,
        actualQty: item.quantity,
        difference: 0,
        qualityStatus: 'QUALIFIED',
        note: ''
      }
    ]);
  };

  const handleUpdateItem = (index: number, updates: Partial<AuditItemDetail>) => {
    setSelectedItems(prev => {
      const copy = [...prev];
      const current = copy[index];
      const merged = { ...current, ...updates };
      if ('actualQty' in updates || 'systemQty' in updates) {
        merged.difference = merged.actualQty - merged.systemQty;
      }
      copy[index] = merged;
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert('Vui lòng thêm ít nhất một mặt hàng để kiểm kê!');
      return;
    }

    const auditorEmp = employees.find(e => e.id === auditorId) || currentUser;

    onSave({
      code: code.trim().toUpperCase(),
      title: title.trim(),
      auditorId,
      auditorName: auditorEmp.name,
      auditDate: today,
      warehouseName,
      items: selectedItems,
      status,
      summaryNote: summaryNote.trim() || undefined
    });

    onClose();
  };

  const totalDifferences = selectedItems.filter(i => i.difference !== 0).length;
  const totalDefective = selectedItems.filter(i => i.qualityStatus !== 'QUALIFIED').length;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
              <ClipboardCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Lập Phiếu Kiểm Kê & Kiểm Hàng</h2>
              <p className="text-xs text-blue-100/90 font-medium">Đối chiếu số lượng thực tế với sổ sách phần mềm & phân loại chất lượng</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200">
          {/* General Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Mã Phiếu Kiểm <span className="text-rose-500">*</span>
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
                Tên Đợt Kiểm Kê <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Kiểm kê quý 4 kho bo mạch phân xưởng 1"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Kho Kiểm Tra
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
                Nhân Sự Kiểm Đếm
              </label>
              <select
                value={auditorId}
                onChange={(e) => setAuditorId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.roleTitle || emp.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Trạng Thái Phiếu
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AuditStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="DRAFT">Bản nháp</option>
                <option value="IN_PROGRESS">Đang kiểm đếm</option>
                <option value="COMPLETED">Hoàn tất kiểm (Chờ Quản đốc duyệt)</option>
              </select>
            </div>
          </div>

          {/* Items Table Section */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span>Danh mục mặt hàng kiểm đếm ({selectedItems.length} mục)</span>
              </div>
              {/* Quick Add from catalog */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  onChange={(e) => {
                    handleAddItem(e.target.value);
                    e.target.value = '';
                  }}
                  defaultValue=""
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:outline-none"
                >
                  <option value="" disabled>+ Chọn mặt hàng từ kho để thêm...</option>
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
                    <th className="p-3 text-center">Sổ Sách</th>
                    <th className="p-3 text-center w-28">Thực Đếm</th>
                    <th className="p-3 text-center">Chênh Lệch</th>
                    <th className="p-3">Chất Lượng</th>
                    <th className="p-3">Ghi Chú</th>
                    <th className="p-3 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedItems.map((item, idx) => (
                    <tr key={item.itemId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-medium">
                        <div className="text-slate-900 dark:text-slate-100 font-semibold">{item.itemName}</div>
                        <div className="text-[10px] font-mono text-blue-600">{item.sku}</div>
                      </td>
                      <td className="p-3 text-center text-slate-500">{item.unit}</td>
                      <td className="p-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                        {item.systemQty}
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={item.actualQty}
                          onChange={(e) => handleUpdateItem(idx, { actualQty: Number(e.target.value) })}
                          className="w-20 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-mono font-bold text-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-3 text-center font-mono font-bold">
                        {item.difference === 0 ? (
                          <span className="text-slate-400">0</span>
                        ) : item.difference > 0 ? (
                          <span className="text-emerald-600">+{item.difference}</span>
                        ) : (
                          <span className="text-rose-600">{item.difference}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <select
                          value={item.qualityStatus}
                          onChange={(e) => handleUpdateItem(idx, { qualityStatus: e.target.value as QualityCheckStatus })}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold border focus:outline-none ${
                            item.qualityStatus === 'QUALIFIED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : item.qualityStatus === 'DEFECTIVE'
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : 'bg-rose-50 text-rose-700 border-rose-300'
                          }`}
                        >
                          <option value="QUALIFIED">Đạt chuẩn 100%</option>
                          <option value="DEFECTIVE">Lỗi / Xước vỡ</option>
                          <option value="EXPIRED">Cần xuất hủy</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={item.note || ''}
                          onChange={(e) => handleUpdateItem(idx, { note: e.target.value })}
                          placeholder="Ghi chú vị trí/tình trạng..."
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary stats */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <span className="text-slate-500">Mặt hàng kiểm: <strong className="text-slate-800 dark:text-slate-100">{selectedItems.length}</strong></span>
              <span className="text-slate-500">Lệch tồn: <strong className={totalDifferences > 0 ? 'text-rose-600' : 'text-emerald-600'}>{totalDifferences}</strong></span>
              <span className="text-slate-500">Lỗi/Hỏng: <strong className={totalDefective > 0 ? 'text-amber-600' : 'text-emerald-600'}>{totalDefective}</strong></span>
            </div>
            {totalDifferences > 0 && (
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>Có chênh lệch tồn thực tế! Sẽ cần Quản đốc ký duyệt để cập nhật kho.</span>
              </div>
            )}
          </div>

          {/* Summary Note */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Ghi chú tổng kết đợt kiểm kê
            </label>
            <textarea
              rows={2}
              value={summaryNote}
              onChange={(e) => setSummaryNote(e.target.value)}
              placeholder="Ghi chú kiến nghị xử lý hàng lệch tồn, kế hoạch niêm phong hoặc xuất hủy..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          {/* Footer */}
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Phiếu Kiểm Kê</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
