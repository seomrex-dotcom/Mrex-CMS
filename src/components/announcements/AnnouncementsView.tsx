import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Announcement } from '../../types';
import {
  Megaphone,
  Pin,
  Calendar,
  Award,
  ShieldCheck,
  Plus,
  X,
  Sparkles
} from 'lucide-react';

export const AnnouncementsView: React.FC = () => {
  const { announcements, addAnnouncement, currentUser } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Announcement['category']>('GENERAL');
  const [isPinned, setIsPinned] = useState(false);

  const canPost = currentUser.role === 'CEO' || currentUser.role === 'MANAGER' || currentUser.role === 'HR';

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    addAnnouncement(title.trim(), content.trim(), category, isPinned);
    setTitle('');
    setContent('');
    setIsPinned(false);
    setShowModal(false);
  };

  const getCategoryInfo = (cat: Announcement['category']) => {
    switch (cat) {
      case 'POLICY': return { label: 'Quy chế & Chính sách', icon: ShieldCheck, color: 'text-indigo-600' };
      case 'EVENT': return { label: 'Sự kiện & Hoạt động', icon: Calendar, color: 'text-amber-600' };
      case 'RECOGNITION': return { label: 'Vinh danh & Khen thưởng', icon: Award, color: 'text-emerald-600' };
      default: return { label: 'Thông báo chung', icon: Megaphone, color: 'text-slate-600' };
    }
  };

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            Bảng Tin & Truyền Thông Nội Bộ
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Cập nhật tin tức công ty, chế độ chính sách mới, sự kiện gắn kết và bảng vàng vinh danh
          </p>
        </div>

        {canPost && (
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors min-h-[44px]"
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
              className={`bg-white border rounded-xl p-5 shadow-xs transition-all space-y-3 ${
                ann.isPinned ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <CatIcon className={`w-3.5 h-3.5 ${catInfo.color}`} />
                  <span className="font-semibold text-slate-700">{catInfo.label}</span>
                  <span className="text-slate-400">·</span>
                  <span className="font-mono text-slate-400">{ann.publishedAt}</span>
                </div>

                {ann.isPinned && (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    <Pin className="w-3 h-3" />
                    <span>Ghim đầu bảng</span>
                  </div>
                )}
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">{ann.title}</h3>

              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                {ann.content}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                <span>Ban hành bởi: <span className="font-medium text-slate-700">{ann.authorName}</span> ({ann.authorRole})</span>
                <span>OmniCorp Internal Notice</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">Đăng Thông Báo Mới</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePost} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Tiêu đề thông báo *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Kế hoạch nghỉ lễ và khen thưởng quý..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Chủ đề phân loại</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Announcement['category'])}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                >
                  <option value="GENERAL">Thông báo chung</option>
                  <option value="POLICY">Quy chế & Chính sách mới</option>
                  <option value="EVENT">Sự kiện công ty & Team building</option>
                  <option value="RECOGNITION">Vinh danh & Khen thưởng</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Nội dung chi tiết *</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Nhập nội dung đầy đủ của thông báo..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-700">Ghim thông báo này lên đầu trang</span>
              </label>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm"
                >
                  Phát Hành Bản Tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
