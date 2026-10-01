import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GoogleDocDeliverable, DocReviewStatus, ManagerDocNote } from '../../types';
import {
  X,
  FileText,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Send,
  Building,
  User,
  Trash2,
  Edit3,
  Bookmark,
  ChevronRight,
  Maximize2
} from 'lucide-react';

interface Props {
  doc: GoogleDocDeliverable | null;
  onClose: () => void;
}

export const DocDetailModal: React.FC<Props> = ({ doc, onClose }) => {
  const {
    currentUser,
    updateGoogleDocStatus,
    addDocManagerNote,
    deleteGoogleDoc,
    celebrate
  } = useApp();

  const [noteContent, setNoteContent] = useState('');
  const [sectionHint, setSectionHint] = useState('');
  const [noteType, setNoteType] = useState<ManagerDocNote['type']>('SUGGESTION');
  const [activeTab, setActiveTab] = useState<'notes' | 'preview'>('notes');

  if (!doc) return null;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    addDocManagerNote(doc.id, noteContent, sectionHint, noteType);
    setNoteContent('');
    setSectionHint('');

    // If manager requests change, auto update status to REVISION_NEEDED
    if (noteType === 'REQUEST_CHANGE' && doc.status !== 'REVISION_NEEDED') {
      updateGoogleDocStatus(doc.id, 'REVISION_NEEDED');
    } else if (noteType === 'APPROVAL' && doc.status !== 'APPROVED') {
      updateGoogleDocStatus(doc.id, 'APPROVED');
    }
  };

  const handleStatusChange = (newStatus: DocReviewStatus) => {
    updateGoogleDocStatus(doc.id, newStatus);
    if (newStatus === 'APPROVED') {
      celebrate();
    }
  };

  const handleDelete = () => {
    if (confirm(`Bạn có chắc chắn muốn xóa liên kết tài liệu "${doc.title}"?`)) {
      deleteGoogleDoc(doc.id);
      onClose();
    }
  };

  // Convert Google Docs edit URL to preview embed URL safely
  // Standard format: https://docs.google.com/document/d/{DOC_ID}/edit
  // Embed format: https://docs.google.com/document/d/{DOC_ID}/preview
  const getEmbedUrl = (url: string) => {
    try {
      const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        return `https://docs.google.com/document/d/${match[1]}/preview`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const embedUrl = getEmbedUrl(doc.docsUrl);

  const isManagerOrReviewer =
    currentUser.role === 'CEO' ||
    currentUser.role === 'MANAGER' ||
    currentUser.role === 'HR' ||
    currentUser.id === doc.reviewerId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Main Dialog */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0 mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                  doc.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                  doc.status === 'REVISION_NEEDED' ? 'bg-rose-100 text-rose-800' :
                  doc.status === 'NEEDS_REVIEW' ? 'bg-amber-100 text-amber-800' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {doc.status === 'APPROVED' ? '✅ Đã Nghiệm Thu' :
                   doc.status === 'REVISION_NEEDED' ? '⚠️ Yêu Cầu Chỉnh Sửa' :
                   doc.status === 'NEEDS_REVIEW' ? '⏳ Chờ Quản Lý Duyệt' : 'Bản Thảo'}
                </span>

                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {doc.docType === 'CONTENT' ? '✍️ Content PR' :
                   doc.docType === 'PROPOSAL' ? '📋 Kế Hoạch' :
                   doc.docType === 'SPEC' ? '📐 Tài Liệu Kỹ Thuật' : 'Báo Cáo'}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug line-clamp-1">
                {doc.title}
              </h2>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1">
                <span>Tác giả: <strong className="text-slate-700">{doc.authorName}</strong></span>
                <span>•</span>
                <span>Người duyệt: <strong className="text-slate-700">{doc.reviewerName}</strong></span>
                <span>•</span>
                <span>Cập nhật: {doc.updatedAt}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={doc.docsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              title="Mở tài liệu trực tiếp trên docs.google.com"
            >
              <span>Mở Google Docs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status bar & Quản lý Action Bar */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Trạng thái duyệt bài:</span>
            <select
              value={doc.status}
              onChange={(e) => handleStatusChange(e.target.value as DocReviewStatus)}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="NEEDS_REVIEW">⏳ Chờ Quản lý đọc & góp ý</option>
              <option value="REVISION_NEEDED">⚠️ Cần tác giả chỉnh sửa theo note</option>
              <option value="APPROVED">✅ Đã nghiệm thu & phê duyệt nội dung</option>
              <option value="DRAFT">📝 Bản thảo đang viết</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch between notes & embedded preview */}
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'notes' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ghi chú của Quản lý ({doc.notes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'preview' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Xem trực tiếp Google Docs</span>
            </button>

            <button
              onClick={handleDelete}
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors ml-2"
              title="Xóa liên kết tài liệu"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-xs">
          {activeTab === 'notes' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 5 Cols: Document Summary & Google Docs Link Info */}
              <div className="lg:col-span-5 space-y-4">
                {/* Google Docs launcher card */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-950 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Tài Liệu Đang Làm Việc</span>
                    </span>
                    <span className="text-[10px] text-blue-700 font-mono font-semibold bg-blue-100/70 px-2 py-0.5 rounded">
                      Google Docs Live
                    </span>
                  </div>

                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {doc.summary}
                  </p>

                  <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between">
                    <a
                      href={doc.docsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-center text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>Mở Để Đọc & Chỉnh Sửa Trực Tiếp</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Linked task card if exists */}
                {doc.taskTitle && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Gắn với nhiệm vụ công việc:
                    </span>
                    <div className="font-semibold text-slate-800 text-xs line-clamp-2">
                      {doc.taskTitle}
                    </div>
                  </div>
                )}

                {/* AI Content Suggestion Assistant */}
                <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Trợ Lý Góp Ý Bài Viết (AI Writing Feedback)</span>
                  </div>
                  <ul className="text-[11px] text-amber-800 space-y-1.5 list-disc pl-4 leading-relaxed">
                    <li>Đảm bảo câu mở đầu (Hook) nêu bật được vấn đề mà độc giả quan tâm nhất.</li>
                    <li>Chèn từ 1 đến 2 biểu đồ hoặc số liệu nghiên cứu cụ thể để tăng độ tin cậy.</li>
                    <li>Lời kêu gọi hành động (CTA) ở cuối bài cần ngắn gọn và dẫn link về trang đích.</li>
                  </ul>
                </div>
              </div>

              {/* Right 7 Cols: Manager Notes & Review Workspace */}
              <div className="lg:col-span-7 space-y-4">
                {/* Form to leave note */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span>Thêm Góp Ý & Note Ý Kiến Của Quản Lý</span>
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      Tác giả sẽ nhận được ngay
                    </span>
                  </div>

                  <form onSubmit={handleAddNote} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Section Hint */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Vị trí đoạn cần góp ý
                        </label>
                        <input
                          type="text"
                          value={sectionHint}
                          onChange={(e) => setSectionHint(e.target.value)}
                          placeholder="VD: Tiêu đề, Đoạn 2, Mục 3.1..."
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:bg-white"
                        />
                      </div>

                      {/* Note Type */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Tính chất nhận xét
                        </label>
                        <select
                          value={noteType}
                          onChange={(e) => setNoteType(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:bg-white"
                        >
                          <option value="SUGGESTION">💡 Gợi ý nâng cấp (Suggestion)</option>
                          <option value="REQUEST_CHANGE">⚠️ Yêu cầu sửa đổi (Request Change)</option>
                          <option value="APPROVAL">✅ Đồng ý / Khen ngợi (Approval)</option>
                          <option value="GENERAL">💬 Ý kiến trao đổi chung</option>
                        </select>
                      </div>
                    </div>

                    {/* Note Content */}
                    <div>
                      <textarea
                        rows={3}
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Nhập chi tiết các ý cần chỉnh sửa, góp ý về câu chữ, số liệu hoặc góc nhìn..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Gửi Note Cho Tác Giả</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Notes Timeline List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Lịch sử góp ý & nhận xét ({doc.notes.length})</span>
                    <span className="text-[11px] text-slate-400 font-mono">Mới nhất lên đầu</span>
                  </div>

                  {doc.notes.length > 0 ? (
                    <div className="space-y-2.5">
                      {doc.notes.slice().reverse().map(note => (
                        <div
                          key={note.id}
                          className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:bg-white transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <img
                                src={note.authorAvatar}
                                alt={note.authorName}
                                referrerPolicy="no-referrer"
                                className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <span className="font-bold text-slate-900 text-xs">{note.authorName}</span>
                                <span className="text-[10px] text-slate-400 block">{note.authorRole}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {note.sectionHint && (
                                <span className="font-mono text-[10px] bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded">
                                  {note.sectionHint}
                                </span>
                              )}
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                note.type === 'REQUEST_CHANGE' ? 'bg-rose-100 text-rose-800' :
                                note.type === 'APPROVAL' ? 'bg-emerald-100 text-emerald-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {note.type === 'REQUEST_CHANGE' ? 'Cần sửa' :
                                 note.type === 'APPROVAL' ? 'Đã duyệt' : 'Gợi ý'}
                              </span>
                            </div>
                          </div>

                          <p className="text-slate-700 text-xs leading-relaxed pl-8">
                            {note.content}
                          </p>

                          <div className="text-[10px] text-slate-400 font-mono pl-8 pt-1">
                            {note.createdAt}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                      Chưa có ghi chú nào. Cấp Quản lý có thể nhập góp ý đầu tiên ở khung phía trên!
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Tab 2: Embedded Google Docs Preview & Full-window frame */
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                <span className="text-blue-900 font-medium">
                  Đang hiển thị bản xem trước tài liệu trực tiếp từ Google Docs:
                </span>
                <a
                  href={doc.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-blue-700 hover:underline flex items-center gap-1"
                >
                  <span>Mở tab riêng để gõ văn bản đầy đủ</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="w-full h-[650px] bg-white rounded-xl border border-slate-300 overflow-hidden shadow-sm relative">
                <iframe
                  src={embedUrl}
                  title={doc.title}
                  className="w-full h-full border-0"
                  allow="clipboard-write"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
