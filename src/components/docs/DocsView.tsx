import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GoogleDocDeliverable, DocReviewStatus } from '../../types';
import {
  FileText,
  ExternalLink,
  Plus,
  Search,
  Filter,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Building,
  User,
  Trash2,
  Edit3,
  Bookmark,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { NewDocModal } from './NewDocModal';
import { DocDetailModal } from './DocDetailModal';

export const DocsView: React.FC = () => {
  const {
    currentUser,
    googleDocs,
    departments,
    employees,
    updateGoogleDocStatus,
    celebrate
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [activeStatusTab, setActiveStatusTab] = useState<'ALL' | DocReviewStatus | 'MY_DOCS'>('ALL');
  const [selectedType, setSelectedType] = useState<string>('all');

  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<GoogleDocDeliverable | null>(null);

  // Filtered documents
  const filteredDocs = googleDocs.filter(doc => {
    if (activeStatusTab === 'MY_DOCS') {
      if (doc.authorId !== currentUser.id && doc.reviewerId !== currentUser.id) return false;
    } else if (activeStatusTab !== 'ALL') {
      if (doc.status !== activeStatusTab) return false;
    }

    if (selectedDept !== 'all' && doc.departmentId !== selectedDept) return false;
    if (selectedType !== 'all' && doc.docType !== selectedType) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        doc.title.toLowerCase().includes(q) ||
        doc.authorName.toLowerCase().includes(q) ||
        doc.reviewerName.toLowerCase().includes(q) ||
        doc.summary.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const pendingReviewCount = googleDocs.filter(d => d.status === 'NEEDS_REVIEW').length;
  const revisionNeededCount = googleDocs.filter(d => d.status === 'REVISION_NEEDED').length;
  const approvedCount = googleDocs.filter(d => d.status === 'APPROVED').length;
  const myDocsCount = googleDocs.filter(d => d.authorId === currentUser.id || d.reviewerId === currentUser.id).length;

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span>Văn Bản & Content (Google Docs)</span>
            </h1>
            <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              docs.google.com
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Nhân viên soạn & gửi bài viết content - Cấp Quản lý theo dõi tiến độ, chỉnh sửa và note ý kiến trực tiếp
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick link to create new google doc */}
          <a
            href="https://docs.google.com/document/create"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs min-h-[40px]"
            title="Mở Google Docs tạo tài liệu trắng mới"
          >
            <span>Tạo Doc Mới</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </a>

          {/* Add Doc Modal Button */}
          <button
            onClick={() => setShowNewDocModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-blue-600/20 min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>Gửi Liên Kết Google Doc</span>
          </button>
        </div>
      </div>

      {/* Top 4 Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div
          onClick={() => setActiveStatusTab('ALL')}
          className="p-4 bg-white border border-slate-200 hover:border-blue-300 rounded-xl shadow-xs cursor-pointer transition-all space-y-1"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Tổng tài liệu</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {googleDocs.length}
          </div>
          <div className="text-[11px] text-slate-400">Tất cả bài viết & văn bản</div>
        </div>

        <div
          onClick={() => setActiveStatusTab('NEEDS_REVIEW')}
          className="p-4 bg-white border border-slate-200 hover:border-amber-300 rounded-xl shadow-xs cursor-pointer transition-all space-y-1"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Chờ Quản lý duyệt</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600">
            {pendingReviewCount}
          </div>
          <div className="text-[11px] text-slate-400">Cần đọc & cho ý kiến</div>
        </div>

        <div
          onClick={() => setActiveStatusTab('REVISION_NEEDED')}
          className="p-4 bg-white border border-slate-200 hover:border-rose-300 rounded-xl shadow-xs cursor-pointer transition-all space-y-1"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Cần sửa theo note</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600">
            {revisionNeededCount}
          </div>
          <div className="text-[11px] text-slate-400">Có nhận xét từ cấp trên</div>
        </div>

        <div
          onClick={() => setActiveStatusTab('APPROVED')}
          className="p-4 bg-white border border-slate-200 hover:border-emerald-300 rounded-xl shadow-xs cursor-pointer transition-all space-y-1"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Đã nghiệm thu</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600">
            {approvedCount}
          </div>
          <div className="text-[11px] text-slate-400">Đã chốt nội dung duyệt đăng</div>
        </div>
      </div>

      {/* Filter and Status Sub-Tabs */}
      <div className="space-y-3">
        <div className="flex border-b border-slate-200 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveStatusTab('ALL')}
            className={`py-2.5 px-3.5 border-b-2 whitespace-nowrap transition-colors min-h-[44px] ${
              activeStatusTab === 'ALL'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Tất cả tài liệu ({googleDocs.length})
          </button>

          <button
            onClick={() => setActiveStatusTab('NEEDS_REVIEW')}
            className={`py-2.5 px-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 min-h-[44px] ${
              activeStatusTab === 'NEEDS_REVIEW'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Chờ Quản lý duyệt</span>
            {pendingReviewCount > 0 && (
              <span className="font-mono text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">
                {pendingReviewCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveStatusTab('REVISION_NEEDED')}
            className={`py-2.5 px-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 min-h-[44px] ${
              activeStatusTab === 'REVISION_NEEDED'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Cần chỉnh sửa</span>
            {revisionNeededCount > 0 && (
              <span className="font-mono text-[10px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">
                {revisionNeededCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveStatusTab('APPROVED')}
            className={`py-2.5 px-3.5 border-b-2 whitespace-nowrap transition-colors min-h-[44px] ${
              activeStatusTab === 'APPROVED'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Đã nghiệm thu ({approvedCount})
          </button>

          <button
            onClick={() => setActiveStatusTab('MY_DOCS')}
            className={`py-2.5 px-3.5 border-b-2 whitespace-nowrap transition-colors min-h-[44px] ${
              activeStatusTab === 'MY_DOCS'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Tài liệu của tôi ({myDocsCount})
          </button>
        </div>

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl text-xs shadow-xs">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên bài viết, tác giả, người duyệt, nội dung tóm tắt..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:bg-white min-h-[40px]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none min-h-[40px]"
            >
              <option value="all">Tất cả phòng ban</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none min-h-[40px]"
            >
              <option value="all">Tất cả thể loại</option>
              <option value="CONTENT">✍️ Content PR</option>
              <option value="PROPOSAL">📋 Kế Hoạch</option>
              <option value="SPEC">📐 Tài Liệu Kỹ Thuật</option>
              <option value="REPORT">📊 Báo Cáo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map(doc => {
          const dept = departments.find(d => d.id === doc.departmentId);

          return (
            <div
              key={doc.id}
              className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 shadow-xs transition-all space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Header: Type and Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    doc.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                    doc.status === 'REVISION_NEEDED' ? 'bg-rose-100 text-rose-800' :
                    doc.status === 'NEEDS_REVIEW' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {doc.status === 'APPROVED' ? '✅ Đã Duyệt' :
                     doc.status === 'REVISION_NEEDED' ? '⚠️ Cần Sửa Lại' :
                     doc.status === 'NEEDS_REVIEW' ? '⏳ Chờ Duyệt' : 'Bản Thảo'}
                  </span>

                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded truncate max-w-[120px]">
                    {dept?.name || 'Chung'}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h3
                    onClick={() => setSelectedDoc(doc)}
                    className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 cursor-pointer group-hover:text-blue-600 transition-colors"
                  >
                    {doc.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {doc.summary}
                  </p>
                </div>

                {/* Author & Reviewer meta */}
                <div className="p-2.5 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 truncate">
                      <img
                        src={doc.authorAvatar}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-4 h-4 rounded-full object-cover shrink-0"
                      />
                      <span className="text-slate-500">Soạn bởi:</span>
                      <strong className="text-slate-800 truncate">{doc.authorName}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500">Quản lý duyệt:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[140px]">
                      {doc.reviewerName.split('(')[0]}
                    </span>
                  </div>
                </div>

                {/* Notes count indicator */}
                {doc.notes.length > 0 && (
                  <div
                    onClick={() => setSelectedDoc(doc)}
                    className="p-2 bg-blue-50/60 border border-blue-100 rounded-lg flex items-center justify-between text-[11px] text-blue-800 cursor-pointer hover:bg-blue-50 transition-colors"
                  >
                    <span className="flex items-center gap-1 font-medium">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>{doc.notes.length} ghi chú góp ý của Quản lý</span>
                    </span>
                    <span className="text-[10px] font-mono text-blue-600 font-bold">Xem note →</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDoc(doc)}
                  className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 min-h-[38px]"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Xem & Note Ý Kiến</span>
                </button>

                <a
                  href={doc.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors shrink-0"
                  title="Mở Google Docs tab riêng"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDocs.length === 0 && (
        <div className="p-10 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="font-bold text-slate-700 text-sm">Chưa có tài liệu Google Docs nào</div>
          <p className="text-xs text-slate-400">
            Nhân viên có thể gửi bài viết content hoặc tài liệu Google Docs để Quản lý vào theo dõi và note ý kiến!
          </p>
          <button
            onClick={() => setShowNewDocModal(true)}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Gửi tài liệu Google Doc ngay</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <NewDocModal
        isOpen={showNewDocModal}
        onClose={() => setShowNewDocModal(false)}
      />

      <DocDetailModal
        doc={selectedDoc}
        onClose={() => setSelectedDoc(null)}
      />
    </div>
  );
};
