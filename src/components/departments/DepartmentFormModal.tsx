import React, { useState, useEffect } from 'react';
import { X, Building2, Save, AlertCircle, Palette } from 'lucide-react';
import { Department } from '../../types';
import { useApp } from '../../context/AppContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingDept?: Department | null;
}

const PRESET_COLORS = [
  '#4F46E5', '#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B',
  '#EF4444', '#EC4899', '#14B8A6', '#F97316', '#6366F1',
  '#84CC16', '#06B6D4', '#A855F7', '#64748B', '#1E40AF',
];

export const DepartmentFormModal: React.FC<Props> = ({ isOpen, onClose, editingDept }) => {
  const { departments, employees, addDepartment, updateDepartment, currentUser } = useApp();
  const isEditing = !!editingDept;

  const [form, setForm] = useState({
    name: '',
    code: '',
    color: '#4F46E5',
    description: '',
    managerId: '',
    parentId: '',
    level: 2,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    foundedDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    if (editingDept) {
      setForm({
        name: editingDept.name || '',
        code: editingDept.code || '',
        color: editingDept.color || '#4F46E5',
        description: editingDept.description || '',
        managerId: editingDept.managerId || '',
        parentId: editingDept.parentId || '',
        level: editingDept.level || 2,
        status: editingDept.status || 'ACTIVE',
        foundedDate: editingDept.foundedDate || '',
      });
    } else {
      setForm({
        name: '',
        code: '',
        color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)],
        description: '',
        managerId: '',
        parentId: '',
        level: 2,
        status: 'ACTIVE',
        foundedDate: new Date().toISOString().slice(0, 10),
      });
    }
    setErrors({});
  }, [isOpen, editingDept]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Tên phòng ban không được để trống';
    if (!form.code.trim()) errs.code = 'Mã phòng ban không được để trống';
    if (form.code.trim() && !/^[A-Z0-9_-]{2,10}$/.test(form.code.trim().toUpperCase())) {
      errs.code = 'Mã phải từ 2-10 ký tự chữ hoa, số, dấu gạch';
    }
    // Check duplicate code
    const existing = departments.find(
      d => d.code.toUpperCase() === form.code.trim().toUpperCase() && d.id !== editingDept?.id
    );
    if (existing) errs.code = `Mã "${form.code.toUpperCase()}" đã tồn tại (${existing.name})`;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const deptData = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      color: form.color,
      description: form.description.trim(),
      managerId: form.managerId || '',
      parentId: form.parentId || undefined,
      level: form.level,
      status: form.status,
      foundedDate: form.foundedDate || undefined,
      employeeCount: editingDept?.employeeCount || 0,
    };

    if (isEditing && editingDept) {
      updateDepartment(editingDept.id, deptData);
    } else {
      addDepartment(deptData);
    }
    onClose();
  };

  const managerOptions = employees.filter(e =>
    e.role === 'CEO' || e.role === 'MANAGER' || e.role === 'HR'
  );

  const parentOptions = departments.filter(d => d.id !== editingDept?.id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: form.color + '20', border: `2px solid ${form.color}40` }}>
              <Building2 className="w-5 h-5" style={{ color: form.color }} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">
                {isEditing ? 'Chỉnh Sửa Phòng Ban' : 'Thêm Phòng Ban Mới'}
              </h2>
              <p className="text-[11px] text-slate-500">
                {isEditing ? `Đang sửa: ${editingDept?.name}` : 'Tạo đơn vị tổ chức mới'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tên Phòng Ban / Đơn Vị <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="VD: Phòng Kỹ Thuật & Công Nghệ"
              className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.name ? 'border-red-400 focus:ring-red-200 bg-red-50' : 'border-slate-200 focus:ring-indigo-200 focus:border-indigo-400'}`}
            />
            {errors.name && <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
          </div>

          {/* Code + Color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mã Phòng Ban <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.code}
                onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                placeholder="VD: TECH, HRAD"
                maxLength={10}
                className={`w-full px-3 py-2.5 text-sm font-mono border rounded-xl focus:outline-none focus:ring-2 transition-all uppercase ${errors.code ? 'border-red-400 focus:ring-red-200 bg-red-50' : 'border-slate-200 focus:ring-indigo-200 focus:border-indigo-400'}`}
              />
              {errors.code && <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.code}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cấp Tổ Chức
              </label>
              <select
                value={form.level}
                onChange={e => setForm(p => ({ ...p, level: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              >
                <option value={1}>Cấp 1 – Ban Giám Đốc</option>
                <option value={2}>Cấp 2 – Phòng / Khối</option>
                <option value={3}>Cấp 3 – Tổ / Nhóm</option>
              </select>
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              Màu Nhận Diện
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, color: c }))}
                  className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${form.color === c ? 'border-slate-700 scale-110 shadow-md' : 'border-transparent'}`}
                  style={{ background: c }}
                  title={c}
                />
              ))}
              <input
                type="color"
                value={form.color}
                onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                className="w-7 h-7 rounded-lg border border-slate-200 cursor-pointer"
                title="Chọn màu tùy chỉnh"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mô Tả Chức Năng</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Mô tả chức năng, nhiệm vụ chính của phòng ban..."
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-none"
            />
          </div>

          {/* Manager */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Trưởng Phòng / Phụ Trách</label>
            <select
              value={form.managerId}
              onChange={e => setForm(p => ({ ...p, managerId: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            >
              <option value="">-- Chưa chỉ định --</option>
              {managerOptions.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.roleTitle})</option>
              ))}
            </select>
          </div>

          {/* Parent Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Trực Thuộc (Phòng Ban Cha)</label>
            <select
              value={form.parentId}
              onChange={e => setForm(p => ({ ...p, parentId: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            >
              <option value="">-- Đơn vị độc lập / Cấp cao nhất --</option>
              {parentOptions.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Founded Date + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ngày Thành Lập</label>
              <input
                type="date"
                value={form.foundedDate}
                onChange={e => setForm(p => ({ ...p, foundedDate: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Trạng Thái</label>
              <select
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value as 'ACTIVE' | 'INACTIVE' }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              >
                <option value="ACTIVE">✅ Đang Hoạt Động</option>
                <option value="INACTIVE">⏸ Tạm Dừng</option>
              </select>
            </div>
          </div>

          {/* Permission note */}
          <div className="p-3 bg-[#EAF5FF] border border-[#0875D9]/25 rounded-xl text-[11px] text-[#0B4FA8] flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#0875D9]" />
            <span>
              Đang thao tác với quyền <strong>{currentUser.roleTitle}</strong>.
              Mọi thay đổi được ghi nhận thời gian và người chỉnh sửa.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-bold text-white bg-[#0875D9] hover:bg-[#065eb0] rounded-xl shadow-sm transition-all flex items-center gap-2 min-h-[40px]"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Lưu Thay Đổi' : 'Tạo Phòng Ban'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
