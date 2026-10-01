import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { WarehouseItem, WarehouseItemCategory, WarehouseItemStatus } from '../../types';
import { X, Package, Layers, MapPin, DollarSign, AlertCircle, Save, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Omit<WarehouseItem, 'id'>) => void;
  itemToEdit?: WarehouseItem | null;
}

const CATEGORIES: { id: WarehouseItemCategory; label: string; color: string }[] = [
  { id: 'RAW_MATERIAL', label: 'Nguyên Vật Liệu Thô', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30' },
  { id: 'SEMI_FINISHED', label: 'Bán Thành Phẩm / Linh Kiện', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30' },
  { id: 'FINISHED_GOODS', label: 'Thành Phẩm Hoàn Chỉnh', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
  { id: 'PACKAGING', label: 'Bao Bì & Đóng Gói', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30' },
];

const COMMON_UNITS = ['Chiếc', 'Bộ', 'Thùng', 'Hộp', 'Kg', 'Mét', 'Cuộn', 'Tấm', 'Bịch', 'Lọ'];

export const WarehouseItemModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  itemToEdit
}) => {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<WarehouseItemCategory>('FINISHED_GOODS');
  const [unit, setUnit] = useState('Chiếc');
  const [quantity, setQuantity] = useState(0);
  const [minStock, setMinStock] = useState(10);
  const [maxStock, setMaxStock] = useState(200);
  const [unitPrice, setUnitPrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [warehouseLocation, setWarehouseLocation] = useState('Kho Tổng Phân Xưởng A - Kệ 01');
  const [specification, setSpecification] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setSku(itemToEdit.sku);
      setName(itemToEdit.name);
      setCategory(itemToEdit.category);
      setUnit(itemToEdit.unit);
      setQuantity(itemToEdit.quantity);
      setMinStock(itemToEdit.minStock);
      setMaxStock(itemToEdit.maxStock);
      setUnitPrice(itemToEdit.unitPrice);
      setSellingPrice(itemToEdit.sellingPrice || 0);
      setWarehouseLocation(itemToEdit.warehouseLocation);
      setSpecification(itemToEdit.specification || '');
    } else {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      setSku(`SKU-${randomSuffix}`);
      setName('');
      setCategory('FINISHED_GOODS');
      setUnit('Chiếc');
      setQuantity(50);
      setMinStock(10);
      setMaxStock(300);
      setUnitPrice(150000);
      setSellingPrice(250000);
      setWarehouseLocation('Kho Tổng Phân Xưởng A - Kệ 01');
      setSpecification('');
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên mặt hàng!');
      return;
    }
    if (!sku.trim()) {
      alert('Vui lòng nhập mã SKU!');
      return;
    }

    let status: WarehouseItemStatus = 'IN_STOCK';
    if (quantity <= 0) status = 'OUT_OF_STOCK';
    else if (quantity <= minStock) status = 'LOW_STOCK';

    const today = new Date().toISOString().slice(0, 10);

    onSave({
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      category,
      unit: unit.trim(),
      quantity: Number(quantity),
      minStock: Number(minStock),
      maxStock: Number(maxStock),
      unitPrice: Number(unitPrice),
      sellingPrice: Number(sellingPrice) > 0 ? Number(sellingPrice) : undefined,
      warehouseLocation: warehouseLocation.trim(),
      status,
      lastCheckedDate: itemToEdit?.lastCheckedDate || today,
      specification: specification.trim() || undefined
    });
    onClose();
  };

  const totalValue = quantity * unitPrice;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner border border-white/30">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {itemToEdit ? 'Chỉnh Sửa Mặt Hàng Kho' : 'Thêm Mặt Hàng / Vật Tư Mới'}
              </h2>
              <p className="text-xs text-blue-100/90 font-medium">
                {itemToEdit ? `Cập nhật thông tin mã hàng: ${itemToEdit.sku}` : 'Quản lý danh mục nguyên phụ liệu, bán thành phẩm & thành phẩm'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors relative z-10"
            aria-label="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200">
          {/* Row 1: SKU & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Mã SKU <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="VD: SKU-101"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono font-bold text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Tên Hàng Hóa / Vật Tư <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Bo mạch điều khiển MCU Cortex-M4"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </div>

          {/* Row 2: Category & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Phân Loại Mặt Hàng
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as WarehouseItemCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Đơn Vị Tính
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="VD: Chiếc, Bộ, Cuộn"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {COMMON_UNITS.slice(0, 6).map((u) => (
                  <button
                    type="button"
                    key={u}
                    onClick={() => setUnit(u)}
                    className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                      unit === u
                        ? 'bg-blue-500/10 text-blue-600 border-blue-400 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent hover:border-slate-300'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Stock Quantity & Min/Max */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>Định mức tồn kho & Giới hạn an toàn</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Số lượng tồn hiện tại
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Định mức tối thiểu (Cảnh báo)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={minStock}
                  onChange={(e) => setMinStock(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700/50 bg-white dark:bg-slate-800 text-sm font-semibold text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Định mức tối đa (Sức chứa)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={maxStock}
                  onChange={(e) => setMaxStock(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Đơn giá vốn / Nhập (VNĐ)</span>
                <span className="text-[11px] text-blue-500 font-mono">
                  {new Intl.NumberFormat('vi-VN').format(unitPrice)} đ
                </span>
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  step="1000"
                  required
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Đơn giá bán / Xuất (VNĐ)</span>
                <span className="text-[11px] text-emerald-500 font-mono">
                  {new Intl.NumberFormat('vi-VN').format(sellingPrice)} đ
                </span>
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  placeholder="Để trống nếu là nguyên liệu thô"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
            </div>
          </div>

          {/* Row 5: Warehouse Location & Specification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>Vị trí lưu kho (Kệ / Phân xưởng)</span>
              </label>
              <input
                type="text"
                value={warehouseLocation}
                onChange={(e) => setWarehouseLocation(e.target.value)}
                placeholder="VD: Kho Tổng A - Dãy K3 - Ngăn 04"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Quy cách đóng gói / Thông số kỹ thuật
              </label>
              <input
                type="text"
                value={specification}
                onChange={(e) => setSpecification(e.target.value)}
                placeholder="VD: Thùng 50 hộp, Tiêu chuẩn IP67..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </div>

          {/* Total Value Summary Badge */}
          <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-900/40 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Tổng giá trị tồn kho mặt hàng này:</span>
            </div>
            <div className="text-base font-bold font-mono text-blue-700 dark:text-blue-300">
              {new Intl.NumberFormat('vi-VN').format(totalValue)} VNĐ
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{itemToEdit ? 'Lưu Thay Đổi' : 'Tạo Mặt Hàng'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
