import React, { useState } from 'react';
import {
  Building2, Plus, Edit2, Trash2, Users, Search, ChevronRight,
  Shield, Layers, CheckCircle2, AlertTriangle, Info, GitBranch,
  Calendar, UserCheck, RefreshCcw
} from 'lucide-react';
import { Department } from '../../types';
import { useApp } from '../../context/AppContext';
import { DepartmentFormModal } from './DepartmentFormModal';

const LEVEL_LABELS: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: 'Ban Giám Đốc', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  2: { label: 'Phòng / Khối', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  3: { label: 'Tổ / Nhóm', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
};

export const DepartmentsManagementView: React.FC = () => {
  const { departments, employees, deleteDepartment, currentUser, celebrate } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Permission check
  const canManage = currentUser.role === 'CEO' || currentUser.role === 'MANAGER';

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleDelete = (deptId: string) => {
    const result = deleteDepartment(deptId);
    if (result.success) {
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
    setDeleteConfirm(null);
  };

  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingDept(null);
    setIsModalOpen(true);
  };

  // Filter
  const filtered = departments.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || (d.description || '').toLowerCase().includes(q);
    const matchLevel = filterLevel === 'all' || String(d.level || 2) === filterLevel;
    const matchStatus = filterStatus === 'all' || (d.status || 'ACTIVE') === filterStatus;
    return matchSearch && matchLevel && matchStatus;
  });

  // Build hierarchy
  const rootDepts = filtered.filter(d => !d.parentId);
  const childDepts = filtered.filter(d => !!d.parentId);

  const getChildren = (parentId: string) => childDepts.filter(d => d.parentId === parentId);

  const getManager = (managerId: string) => employees.find(e => e.id === managerId);
  const getDeptEmployeeCount = (deptId: string) => employees.filter(e => e.departmentId === deptId).length;

  const totalActive = departments.filter(d => (d.status || 'ACTIVE') === 'ACTIVE').length;
  const totalEmployees = employees.length;

  const DeptCard: React.FC<{ dept: Department; depth?: number }> = ({ dept, depth = 0 }) => {
    const manager = getManager(dept.managerId);
    const realCount = getDeptEmployeeCount(dept.id);
    const children = getChildren(dept.id);
    const level = dept.level || 2;
    const levelInfo = LEVEL_LABELS[level] || LEVEL_LABELS[2];
    const isInactive = dept.status === 'INACTIVE';
    const confirmingDelete = deleteConfirm === dept.id;

    return (
      <div className={`relative ${depth > 0 ? 'ml-6' : ''}`}>
        {/* Vertical connector for children */}
        {depth > 0 && (
          <div className="absolute left-[-20px] top-[28px] w-4 h-0.5 bg-slate-300" />
        )}
        <div
          className={`bg-white border rounded-xl shadow-xs overflow-hidden mb-3 transition-all hover:shadow-sm ${isInactive ? 'opacity-60' : ''} ${depth > 0 ? 'border-l-4' : ''}`}
          style={depth > 0 ? { borderLeftColor: dept.color } : {}}
        >
          {/* Card top bar color strip */}
          {depth === 0 && (
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${dept.color}, ${dept.color}88)` }} />
          )}

          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              {/* Left: Info */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Icon badge */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: dept.color + '18', border: `1.5px solid ${dept.color}30` }}
                >
                  <Building2 className="w-5 h-5" style={{ color: dept.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">{dept.name}</h3>
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                      {dept.code}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${levelInfo.bg} ${levelInfo.color}`}>
                      {levelInfo.label}
                    </span>
                    {isInactive && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500">
                        ⏸ Tạm dừng
                      </span>
                    )}
                  </div>

                  {dept.description && (
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{dept.description}</p>
                  )}

                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {/* Manager */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      {manager ? (
                        <span>{manager.name}</span>
                      ) : (
                        <span className="text-slate-400 italic">Chưa chỉ định</span>
                      )}
                    </div>
                    {/* Employee count */}
                    <div className="flex items-center gap-1 text-[11px] text-slate-600">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold" style={{ color: dept.color }}>{realCount}</span>
                      <span>nhân viên</span>
                    </div>
                    {/* Sub-departments */}
                    {children.length > 0 && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                        <span>{children.length} đơn vị con</span>
                      </div>
                    )}
                    {/* Founded */}
                    {dept.foundedDate && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{dept.foundedDate}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              {canManage && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(dept)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(dept.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Xoá phòng ban"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Delete confirmation inline */}
            {confirmingDelete && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-2 text-red-700 font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  Xác nhận xoá phòng ban "{dept.name}"?
                </div>
                <p className="text-red-600 text-[11px]">
                  Hành động này không thể hoàn tác. Phòng ban có nhân viên hoặc đơn vị con sẽ không thể xoá.
                </p>
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-3 py-1.5 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Huỷ
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id)}
                    className="px-3 py-1.5 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium"
                  >
                    Xác Nhận Xoá
                  </button>
                </div>
              </div>
            )}

            {/* Update meta */}
            {dept.updatedAt && (
              <div className="mt-2 pt-2 border-t border-slate-50 text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <RefreshCcw className="w-2.5 h-2.5" />
                Cập nhật: {dept.updatedAt} bởi {dept.updatedBy}
              </div>
            )}
          </div>
        </div>

        {/* Children */}
        {children.length > 0 && (
          <div className="relative ml-6 pl-0">
            <div className="absolute left-[-12px] top-0 bottom-3 w-0.5 bg-slate-200" />
            {children.map(child => (
              <DeptCard key={child.id} dept={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium flex items-center gap-2 animate-slideIn transition-all max-w-sm ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}
        >
          {toast.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <AlertTriangle className="w-4 h-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            Quản Lý Cơ Cấu Tổ Chức
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Thêm, sửa, xoá phòng ban & cấu trúc phân cấp</p>
        </div>
        {canManage && (
          <button
            onClick={handleAdd}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            Thêm Phòng Ban
          </button>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Tổng phòng ban', value: departments.length, color: 'text-indigo-600', icon: Building2 },
          { label: 'Đang hoạt động', value: totalActive, color: 'text-emerald-600', icon: CheckCircle2 },
          { label: 'Tổng nhân viên', value: totalEmployees, color: 'text-sky-600', icon: Users },
          { label: 'Đơn vị cấp con', value: departments.filter(d => !!d.parentId).length, color: 'text-violet-600', icon: GitBranch },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
              <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
            </div>
            <div>
              <div className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-[11px] text-slate-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Permission Banner */}
      {!canManage ? (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-center gap-2 text-amber-800">
          <Shield className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Chỉ xem:</strong> Bạn đang đăng nhập với quyền <strong>{currentUser.roleTitle}</strong>.
            Chức năng thêm/sửa/xoá chỉ dành cho <strong>Ban Quản Trị (CEO)</strong> và <strong>Cấp Quản Lý</strong>.
          </span>
        </div>
      ) : (
        <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs flex items-center gap-2 text-indigo-800">
          <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>
            Quyền <strong>{currentUser.role === 'CEO' ? 'Ban Quản Trị' : 'Quản Lý'}</strong>:
            Bạn có thể thêm mới, chỉnh sửa và xoá cơ cấu phòng ban. Phòng ban có nhân viên sẽ không thể xoá trực tiếp.
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm tên, mã, mô tả..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          />
        </div>
        <select
          value={filterLevel}
          onChange={e => setFilterLevel(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="all">Tất cả cấp</option>
          <option value="1">Cấp 1 – Ban Giám Đốc</option>
          <option value="2">Cấp 2 – Phòng / Khối</option>
          <option value="3">Cấp 3 – Tổ / Nhóm</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="all">Mọi trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="INACTIVE">Tạm dừng</option>
        </select>
        <div className="text-xs text-slate-500 font-mono">
          {filtered.length}/{departments.length} phòng ban
        </div>
      </div>

      {/* Department List with Hierarchy */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-slate-500">Không tìm thấy phòng ban nào</p>
          <p className="text-xs mt-1">Thử thay đổi bộ lọc hoặc tạo phòng ban mới</p>
        </div>
      ) : (
        <div>
          {rootDepts.length > 0 ? (
            rootDepts.map(dept => <DeptCard key={dept.id} dept={dept} depth={0} />)
          ) : (
            // Flat list if no hierarchy
            filtered.map(dept => <DeptCard key={dept.id} dept={dept} depth={0} />)
          )}
        </div>
      )}

      {/* Department Form Modal */}
      <DepartmentFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingDept(null); }}
        editingDept={editingDept}
      />
    </div>
  );
};
