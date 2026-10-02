import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Announcement } from '../../types';
import {
  Megaphone,
  Pin,
  Calendar,
  ShieldCheck,
  Award,
  Plus,
  X,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export const AnnouncementsView: React.FC = () => {
  const {
    currentUser,
    announcements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    celebrate
  } = useApp();

  // Create Modal State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Announcement['category']>('GENERAL');
  const [isPinned, setIsPinned] = useState(false);

  // Edit Modal State
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState<Announcement['category']>('GENERAL');
  const [editIsPinned, setEditIsPinned] = useState(false);

  // Delete Modal State
  const [deletingAnn, setDeletingAnn] = useState<Announcement | null>(null);

  // Success Feedback
  const [feedback, setFeedback] = useState<string | null>(null);

  // PERMISSION CHECK: Ban Giám Đốc (CEO) & Quản Lý (MANAGER) có quyền Sửa, Xoá bảng tin
  const canManage = currentUser.role === 'CEO' || currentUser.role === 'MANAGER';
  const canPost = canManage || currentUser.role === 'HR';

  const showSuccessFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    addAnnouncement(title.trim(), content.trim(), category, isPinned);
    setTitle('');
    setContent('');
    setIsPinned(false);
    setShowModal(false);
    showSuccessFeedback('Đã đăng bản tin nội bộ thành công!');
  };

  const handleStartEdit = (ann: Announcement) => {
    if (!canManage) return;
    setEditingAnn(ann);
    setEditTitle(ann.title);
    setEditContent(ann.content);
    setEditCategory(ann.category);
    setEditIsPinned(ann.isPinned);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnn || !editTitle.trim() || !editContent.trim()) return;
    updateAnnouncement(editingAnn.id, {
      title: editTitle.trim(),
      content: editContent.trim(),
      category: editCategory,
      isPinned: editIsPinned
    });
    setEditingAnn(null);
    celebrate();
    showSuccessFeedback('Đã cập nhật bản tin thành công!');
  };

  const handleConfirmDelete = () => {
    if (!deletingAnn || !canManage) return;
    deleteAnnouncement(deletingAnn.id);
    setDeletingAnn(null);
    showSuccessFeedback('Đã xoá bản tin nội bộ!');
  };

  const handleTogglePin = (ann: Announcement) => {
    if (!canManage) return;
    updateAnnouncement(ann.id, { isPinned: !ann.isPinned });
    showSuccessFeedback(ann.isPinned ? 'Đã bỏ ghim bản tin' : 'Đã ghim bản tin lên đầu');
  };

  const getCategoryInfo = (cat: Announcement['category']) => {
    switch (cat) {
      case 'POLICY':
        return { label: 'Quy chế & Chính sách', icon: ShieldCheck, color: 'text-[#0875D9]' };
      case 'EVENT':
        return { label: 'Sự kiện & Hoạt động', icon: Calendar, color: 'text-amber-600' };
      case 'RECOGNITION':
        return { label: 'Vinh danh & Khen thưởng', icon: Award, color: 'text-emerald-600' };
      default:
        return { label: 'Thông báo chung', icon: Megaphone, color: 'text-slate-600' };
    }
  };

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Toast Feedback */}
      {feedback && (
        <div className="fixed top-16 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              Bảng Tin & Truyền Thông Nội Bộ
            </h1>
            {canManage ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0875D9] border border-blue-200">
                Toàn quyền quản trị ({currentUser.role})
              </span>
            ) : (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                Chế độ xem nhân sự
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Cập nhật tin tức công ty, chế độ chính sách mới, sự kiện gắn kết và bảng vàng vinh danh
          </p>
        </div>

        {canPost && (
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0875D9] hover:bg-[#065eb0] rounded-xl shadow-sm transition-all cursor-pointer active:scale-98 min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>Đăng Bản Tin Mới</span>
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map(ann => {
          const catInfo = getCategoryInfo(ann.category);
          const CatIcon = catInfo.icon;

          return (
            <div
              key={ann.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs transition-all space-y-3 ${
                ann.isPinned
                  ? 'border-[#0875D9]/40 ring-1 ring-blue-200 bg-gradient-to-br from-blue-50/20 via-white to-transparent'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <CatIcon className={`w-3.5 h-3.5 ${catInfo.color}`} />
                  <span className="font-semibold text-slate-700">{catInfo.label}</span>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono text-slate-400">{ann.publishedAt}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {ann.isPinned && (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[#0B4FA8] bg-[#EAF5FF] px-2 py-0.5 rounded-lg border border-[#0875D9]/20">
                      <Pin className="w-3 h-3 text-[#0875D9]" />
                      <span>Ghim đầu bảng</span>
                    </div>
                  )}

                  {/* QUYỀN SỬA & XOÁ: CHỈ DÀNH CHO BAN GIÁM ĐỐC (CEO) & QUẢN LÝ (MANAGER) */}
                  {canManage && (
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => handleTogglePin(ann)}
                        className={`p-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          ann.isPinned
                            ? 'bg-blue-50 text-[#0875D9] border-blue-200 hover:bg-blue-100'
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
                        }`}
                        title={ann.isPinned ? 'Bỏ ghim' : 'Ghim bản tin lên đầu'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleStartEdit(ann)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-blue-50 text-slate-700 hover:text-[#0875D9] border border-slate-200 hover:border-blue-300 transition-all cursor-pointer shadow-2xs"
                        title="Chỉnh sửa bản tin này"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#0875D9]" />
                        <span>Sửa</span>
                      </button>

                      <button
                        onClick={() => setDeletingAnn(ann)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 hover:border-red-300 transition-all cursor-pointer shadow-2xs"
                        title="Xoá bản tin này"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        <span>Xoá</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-slate-900 leading-snug">{ann.title}</h3>

              {/* Content Body */}
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
                {ann.content}
              </p>

              {/* Footer */}
              <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400 gap-2">
                <div>
                  <span>Ban hành bởi: <span className="font-semibold text-slate-700">{ann.authorName}</span> ({ann.authorRole})</span>
                  {ann.updatedAt && (
                    <span className="text-slate-400 ml-2 italic">
                      • Đã chỉnh sửa: {ann.updatedAt} {ann.updatedBy ? `bởi ${ann.updatedBy}` : ''}
                    </span>
                  )}
                </div>
                <span className="font-medium text-slate-500">Mrex Agency Internal Notice</span>
              </div>
            </div>
          );
        })}

        {announcements.length === 0 && (
          <div className="text-center p-12 bg-white rounded-2xl border border-slate-200 space-y-2">
            <Megaphone className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="font-bold text-slate-700 text-sm">Chưa có bản tin nào</div>
            <p className="text-xs text-slate-400">Các thông báo mới nhất từ công ty sẽ hiển thị tại đây.</p>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0875D9]">
                  <Megaphone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Đăng Bản Tin Mới</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePost} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tiêu đề thông báo *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Kế hoạch nghỉ lễ và khen thưởng quý 4..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chủ đề phân loại</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Announcement['category'])}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none"
                >
                  <option value="GENERAL">Thông báo chung</option>
                  <option value="POLICY">Quy chế & Chính sách mới</option>
                  <option value="EVENT">Sự kiện công ty & Team building</option>
                  <option value="RECOGNITION">Vinh danh & Khen thưởng</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nội dung chi tiết *</label>
                <textarea
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Nhập nội dung đầy đủ của thông báo..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9]"
                  required
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-50 border border-slate-100">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-[#0875D9] focus:ring-[#0875D9]"
                />
                <span className="font-semibold text-slate-700">Ghim thông báo này lên đầu trang</span>
              </label>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0875D9] hover:bg-[#065eb0] text-white font-bold rounded-xl shadow-xs cursor-pointer active:scale-98 transition-all"
                >
                  Phát Hành Bản Tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL: DÀNH CHO BAN GIÁM ĐỐC & QUẢN LÝ */}
      {editingAnn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0875D9]">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Chỉnh Sửa Bản Tin</h3>
                  <p className="text-[10px] text-slate-400">Quyền hạn: {currentUser.roleTitle}</p>
                </div>
              </div>
              <button onClick={() => setEditingAnn(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tiêu đề thông báo *</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chủ đề phân loại</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as Announcement['category'])}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none"
                >
                  <option value="GENERAL">Thông báo chung</option>
                  <option value="POLICY">Quy chế & Chính sách mới</option>
                  <option value="EVENT">Sự kiện công ty & Team building</option>
                  <option value="RECOGNITION">Vinh danh & Khen thưởng</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nội dung chi tiết *</label>
                <textarea
                  rows={5}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9]"
                  required
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-50 border border-slate-100">
                <input
                  type="checkbox"
                  checked={editIsPinned}
                  onChange={(e) => setEditIsPinned(e.target.checked)}
                  className="rounded text-[#0875D9] focus:ring-[#0875D9]"
                />
                <span className="font-semibold text-slate-700">Ghim thông báo này lên đầu trang</span>
              </label>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAnn(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
                >
                  Huỷ Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0875D9] hover:bg-[#065eb0] text-white font-bold rounded-xl shadow-xs cursor-pointer active:scale-98 transition-all"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL: DÀNH CHO BAN GIÁM ĐỐC & QUẢN LÝ */}
      {deletingAnn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Xác Nhận Xoá Bản Tin</h3>
                <p className="text-[11px] text-slate-400">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              Bạn có chắc chắn muốn xoá vĩnh viễn bản tin: <br />
              <strong className="text-slate-900 font-bold">"{deletingAnn.title}"</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingAnn(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium text-xs cursor-pointer"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer active:scale-98 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xoá Bản Tin</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
