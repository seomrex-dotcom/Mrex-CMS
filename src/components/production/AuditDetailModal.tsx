import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { InventoryAuditTicket } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Building,
  User,
  Calendar,
  FileCheck,
  CheckCircle,
  Clock,
  Printer
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  audit: InventoryAuditTicket | null;
}

export const AuditDetailModal: React.FC<Props> = ({
  isOpen,
  onClose,
  audit
}) => {
  const { currentUser, approveInventoryAudit } = useApp();
  const [approvalNote, setApprovalNote] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  if (!isOpen || !audit) return null;

  const canApprove =
    audit.status !== 'APPROVED' &&
    (currentUser.role === 'CEO' ||
      currentUser.role === 'MANAGER' ||
      currentUser.departmentId === 'production' ||
      (currentUser.roleTitle && currentUser.roleTitle.toLowerCase().includes('quản đốc')));

  const handleApprove = () => {
    if (!confirm('Bạn có chắc chắn muốn KÝ DUYỆT phiếu kiểm này? Hệ thống sẽ tự động đồng bộ số lượng thực tế vào kho hàng.')) {
      return;
    }
    approveInventoryAudit(audit.id, currentUser.name, approvalNote || 'Đã kiểm tra và đồng ý chốt tồn');
    setIsApproving(false);
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  const totalDifferences = audit.items.filter(i => i.difference !== 0).length;
  const totalDefective = audit.items.filter(i => i.qualityStatus !== 'QUALIFIED').length;

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
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">{audit.title}</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-semibold">
                  {audit.code}
                </span>
              </div>
              <p className="text-xs text-blue-100 font-medium">Chi tiết biên bản kiểm kê và đối chiếu sổ sách</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
              title="In biên bản"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
            <div>
              <div className="text-slate-500 font-medium flex items-center gap-1 mb-1">
                <Building className="w-3.5 h-3.5 text-blue-500" />
                <span>Kho kiểm tra</span>
              </div>
              <div className="font-bold text-slate-900 dark:text-slate-100">{audit.warehouseName}</div>
            </div>
            <div>
              <div className="text-slate-500 font-medium flex items-center gap-1 mb-1">
                <User className="w-3.5 h-3.5 text-[#0875D9]" />
                <span>Nhân sự kiểm</span>
              </div>
              <div className="font-bold text-slate-900 dark:text-slate-100">{audit.auditorName}</div>
            </div>
            <div>
              <div className="text-slate-500 font-medium flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span>Ngày kiểm đếm</span>
              </div>
              <div className="font-bold font-mono text-slate-900 dark:text-slate-100">{audit.auditDate}</div>
            </div>
            <div>
              <div className="text-slate-500 font-medium flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Trạng thái</span>
              </div>
              <div>
                {audit.status === 'APPROVED' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle className="w-3 h-3" /> Đã chốt duyệt
                  </span>
                ) : audit.status === 'COMPLETED' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    <Clock className="w-3 h-3" /> Chờ Quản đốc duyệt
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Đang thực hiện
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* If Approved, show approval stamp */}
          {audit.status === 'APPROVED' && (
            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                  ĐÃ PHÊ DUYỆT VÀ CHỐT TỒN KHO THỰC TẾ
                </div>
                <div className="text-emerald-700/80 dark:text-emerald-400 mt-0.5">
                  Người duyệt: <strong>{audit.approvedBy || 'Ban Quản Trị'}</strong> • Ngày duyệt: {audit.approvalDate || audit.auditDate}
                </div>
                {audit.summaryNote && (
                  <div className="text-slate-600 dark:text-slate-400 mt-1 italic">
                    Ghi chú: "{audit.summaryNote}"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Table of items */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Hàng Hóa / SKU</th>
                  <th className="p-3 text-center">ĐVT</th>
                  <th className="p-3 text-center">Sổ Sách</th>
                  <th className="p-3 text-center">Thực Tế</th>
                  <th className="p-3 text-center">Chênh Lệch</th>
                  <th className="p-3">Chất Lượng</th>
                  <th className="p-3">Ghi Chú Đánh Giá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {audit.items.map((item) => (
                  <tr key={item.itemId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{item.itemName}</div>
                      <div className="font-mono text-[10px] text-blue-600">{item.sku}</div>
                    </td>
                    <td className="p-3 text-center text-slate-500">{item.unit}</td>
                    <td className="p-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                      {item.systemQty}
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                      {item.actualQty}
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
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          item.qualityStatus === 'QUALIFIED'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : item.qualityStatus === 'DEFECTIVE'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {item.qualityStatus === 'QUALIFIED'
                          ? 'Đạt chuẩn 100%'
                          : item.qualityStatus === 'DEFECTIVE'
                          ? 'Lỗi kỹ thuật / Xước'
                          : 'Cần xuất hủy'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      {item.note || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <div className="text-slate-500">Tổng mặt hàng kiểm kê:</div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{audit.items.length} mặt hàng</div>
            </div>
            <div>
              <div className="text-slate-500">Mặt hàng lệch tồn:</div>
              <div className={`text-lg font-bold ${totalDifferences > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {totalDifferences} mục {totalDifferences === 0 && '(Khớp 100%)'}
              </div>
            </div>
            <div>
              <div className="text-slate-500">Mặt hàng lỗi / cần xử lý:</div>
              <div className={`text-lg font-bold ${totalDefective > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {totalDefective} mục
              </div>
            </div>
          </div>

          {/* Approval Section for Manager / CEO */}
          {canApprove && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-indigo-950/40 rounded-2xl border border-blue-200/80 dark:border-blue-900/50 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span>Ký Duyệt & Chốt Cập Nhật Tồn Kho (Dành cho Quản đốc & Ban Quản trị)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Khi nhấn duyệt, toàn bộ số lượng thực tế kiểm đếm trên phiếu này sẽ được áp dụng tự động làm số lượng tồn kho mới nhất trên hệ thống.
              </p>
              <div>
                <input
                  type="text"
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder="Ghi chú phê duyệt (VD: Đồng ý xử lý lệch tồn theo đề xuất...)"
                  className="w-full px-3.5 py-2 rounded-xl border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleApprove}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ký Duyệt & Đồng Bộ Tồn Kho Ngay</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
