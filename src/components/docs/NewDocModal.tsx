import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DepartmentId, GoogleDocDeliverable } from '../../types';
import {
  X,
  FileText,
  ExternalLink,
  Plus,
  Building,
  User,
  CheckCircle2,
  Sparkles,
  Link2,
  Layers
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultTaskId?: string;
  defaultTaskTitle?: string;
}

export const NewDocModal: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultTaskId,
  defaultTaskTitle
}) => {
  const {
    currentUser,
    employees,
    departments,
    tasks,
    addGoogleDoc,
    celebrate
  } = useApp();

  const [title, setTitle] = useState('');
  const [docsUrl, setDocsUrl] = useState('https://docs.google.com/document/d/');
  const [docType, setDocType] = useState<GoogleDocDeliverable['docType']>('CONTENT');
  const [departmentId, setDepartmentId] = useState<DepartmentId>(currentUser.departmentId === 'exec' ? 'tech' : currentUser.departmentId);
  const [reviewerId, setReviewerId] = useState<string>(
    currentUser.managerId || (employees.find(e => e.role === 'MANAGER' || e.role === 'CEO')?.id || 'emp-02')
  );
  const [taskId, setTaskId] = useState<string>(defaultTaskId || '');
  const [summary, setSummary] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !docsUrl.trim()) return;

    const reviewer = employees.find(e => e.id === reviewerId);
    const linkedTask = tasks.find(t => t.id === taskId);

    addGoogleDoc({
      title: title.trim(),
      docsUrl: docsUrl.trim(),
      docType,
      departmentId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      reviewerId,
      reviewerName: reviewer ? `${reviewer.name} (${reviewer.roleTitle})` : 'Quản lý phòng ban',
      taskId: taskId || undefined,
      taskTitle: linkedTask ? linkedTask.title : (defaultTaskTitle || undefined),
      status: 'NEEDS_REVIEW',
      summary: summary.trim() || 'Nhân viên đã gửi liên kết Google Docs để Quản lý rà soát và cho ý kiến.',
    });

    onClose();
  };

  const potentialReviewers = employees.filter(e => e.id !== currentUser.id && (e.role === 'MANAGER' || e.role === 'CEO' || e.role === 'HR'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Gửi & Liên Kết Tài Liệu Google Docs
              </h2>
              <p className="text-[11px] text-slate-500">
                Gửi bài viết content, bản thảo hoặc tài liệu để Cấp Quản lý theo dõi & note ý
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          {/* Quick Create Link Helper Box */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-blue-900">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-[11px] leading-tight">
                Chưa có link? Mở Google Docs tạo tài liệu trắng mới trong 1 giây:
              </span>
            </div>
            <a
              href="https://docs.google.com/document/create"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shrink-0 transition-colors shadow-xs"
            >
              <span>Tạo Google Doc</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Doc Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tiêu đề bài viết / Tên tài liệu <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Bài viết Content PR sản phẩm mới trên CafeF"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs min-h-[40px]"
              required
            />
          </div>

          {/* Docs URL */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Đường dẫn liên kết Google Docs (URL) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Link2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="url"
                value={docsUrl}
                onChange={(e) => setDocsUrl(e.target.value)}
                placeholder="https://docs.google.com/document/d/.../edit"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs min-h-[40px]"
                required
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Mẹo: Đảm bảo đã bật quyền "Bất kỳ ai có đường liên kết đều có thể nhận xét hoặc chỉnh sửa" trên Google Docs.
            </span>
          </div>

          {/* Doc Type & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Phân loại tài liệu
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs min-h-[40px]"
              >
                <option value="CONTENT">✍️ Bài Viết Content / PR / Truyền thông</option>
                <option value="PROPOSAL">📋 Kế Hoạch / Dự Thảo / Tờ Trình</option>
                <option value="SPEC">📐 Tài Liệu Kỹ Thuật (SRS / API)</option>
                <option value="REPORT">📊 Báo Cáo Nghiệm Thu / Báo Cáo Tháng</option>
                <option value="OTHER">📁 Tài Liệu Khác</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Phòng ban phụ trách
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value as DepartmentId)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs min-h-[40px]"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assigned Reviewer (Manager) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Cấp Quản lý theo dõi & duyệt (Người nhận review) <span className="text-rose-500">*</span>
            </label>
            <select
              value={reviewerId}
              onChange={(e) => setReviewerId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs min-h-[40px]"
              required
            >
              {potentialReviewers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} · {m.roleTitle} ({m.role})
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Quản lý này sẽ nhận được thông báo để vào đọc, chỉnh sửa và note ý kiến phản hồi trên tài liệu.
            </span>
          </div>

          {/* Optional Task Link */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Gắn với đầu việc dự án (Tùy chọn)
            </label>
            <select
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs min-h-[40px]"
            >
              <option value="">-- Không gắn công việc cụ thể --</option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>
                  [{t.status}] {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Summary / Notes for Reviewer */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tóm tắt nội dung & Lời nhắn gửi Quản lý
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="VD: Em đã hoàn thành bản thảo đầu tiên bài PR, nhờ Chị Lan xem qua phần thông điệp chính và cho ý kiến giúp em ạ..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs resize-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors min-h-[40px]"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 min-h-[40px]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Gửi Tài Liệu Cho Quản Lý</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
