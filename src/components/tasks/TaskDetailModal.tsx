import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TaskPriority, TaskStatus } from '../../types';
import {
  X,
  Users,
  User,
  CheckCircle2,
  Clock,
  Sparkles,
  Trash2,
  Send,
  Plus,
  FileText,
  ExternalLink,
  Link2,
  MessageSquare,
  Lock,
  Shield,
  UserCheck,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { breakdownTaskWithAI } from '../../services/aiService';

interface Props {
  taskId: string;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<Props> = ({ taskId, onClose }) => {
  const {
    tasks,
    employees,
    departments,
    updateTask,
    updateTaskStatus,
    deleteTask,
    toggleSubtask,
    addTaskComment,
    addGoogleDoc,
    setActiveTab,
    currentUser,
    celebrate
  } = useApp();

  const task = tasks.find(t => t.id === taskId);
  const [newComment, setNewComment] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isAttachingDocs, setIsAttachingDocs] = useState(false);
  const [docsInputUrl, setDocsInputUrl] = useState('');
  const [docsInputTitle, setDocsInputTitle] = useState('');

  if (!task) return null;

  const assignee = employees.find(e => e.id === task.assigneeId);
  const reporter = employees.find(e => e.id === task.reporterId);
  const department = departments.find(d => d.id === task.departmentId);

  const isManagement = currentUser.role === 'CEO' || currentUser.role === 'MANAGER';
  const isEmployee = currentUser.role === 'EMPLOYEE';
  const isAssignee = task.assigneeId === currentUser.id;
  const isReporter = task.reporterId === currentUser.id;
  const canDelete = isManagement || isReporter;
  const canReassign = isManagement || isReporter;
  const canEditCoreMeta = isManagement || isReporter;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addTaskComment(task.id, newComment.trim());
    setNewComment('');
  };

  const handleAddInlineSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const updatedSubtasks = [
      ...task.subtasks,
      { id: `sb-${Date.now()}`, title: newSubtaskTitle.trim(), completed: false }
    ];
    updateTask(task.id, { subtasks: updatedSubtasks });
    setNewSubtaskTitle('');
  };

  const handleAiBreakdown = async () => {
    setIsGeneratingAI(true);
    try {
      const generated = await breakdownTaskWithAI(task.title, task.description);
      const newItems = generated.map((s, idx) => ({
        id: `ai-${Date.now()}-${idx}`,
        title: s,
        completed: false
      }));
      updateTask(task.id, { subtasks: [...task.subtasks, ...newItems] });
      celebrate();
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const completedSubtasks = task.subtasks.filter(s => s.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-4xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-[#EAF5FF] via-white to-white">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-bold text-[#0875D9]">{department?.name}</span>
              <span>·</span>
              <span className="font-mono text-slate-400">Mã: {task.id}</span>
              <span>·</span>
              <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                task.priority === 'URGENT' ? 'bg-red-50 text-red-600 border border-red-200' :
                task.priority === 'HIGH' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-slate-100 text-slate-600'
              }`}>
                Ưu tiên {task.priority === 'URGENT' ? 'Khẩn cấp' : task.priority === 'HIGH' ? 'Cao' : task.priority === 'MEDIUM' ? 'Trung bình' : 'Thấp'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{task.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Notice Banner */}
        <div className="px-6 py-2.5 bg-blue-50/70 border-b border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#063B78]">
            {isEmployee ? (
              <>
                <UserCheck className="w-4 h-4 text-[#0875D9] shrink-0" />
                <span>
                  <strong>Phân quyền Nhân viên:</strong> Bạn có quyền <strong>thực hiện công việc</strong>, báo cáo tiến độ, cập nhật checklist và nộp sản phẩm nghiệm thu.
                </span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 text-[#0875D9] shrink-0" />
                <span>
                  <strong>Phân quyền Quản lý:</strong> Bạn có quyền điều phối, chỉ định nhân sự, nghiệm thu và đánh giá tiến độ task.
                </span>
              </>
            )}
          </div>
          <div className="shrink-0 font-mono text-[11px] text-slate-500">
            Tài khoản hiện tại: <span className="font-bold text-slate-700">{currentUser.name}</span> ({currentUser.role})
          </div>
        </div>

        {/* Content body: 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Main Column (2 cols): Description, Progress Execution, Subtasks, Comments */}
          <div className="lg:col-span-2 p-6 space-y-6 max-h-[72vh] overflow-y-auto">
            {/* Assignment Type Banner */}
            {task.assignmentType === 'TEAM' ? (
              <div className="p-3 bg-gradient-to-r from-indigo-50 via-blue-50/50 to-white border border-[#0875D9]/25/90 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0B4FA8] flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-indigo-950 flex items-center gap-2">
                      <span>Nhiệm Vụ Phối Hợp Team: {task.teamName || department?.name}</span>
                      <span className="px-2 py-0.5 bg-[#0875D9] text-white rounded text-[10px] font-bold">Việc Team</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5 flex flex-wrap items-center gap-2">
                      <span>Đầu mối chính: <strong>{assignee?.name}</strong></span>
                      {task.assigneeIds && task.assigneeIds.length > 0 && (
                        <span>· {task.assigneeIds.length} thành viên phối hợp</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>Nhiệm Vụ Giao Cho Cá Nhân</span>
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-bold">Cá Nhân</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Chỉ định trực tiếp: <strong>{assignee?.name}</strong> ({assignee?.roleTitle})
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Mô tả mục tiêu & Yêu cầu</h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
                {task.description || 'Không có mô tả bổ sung cho nhiệm vụ này.'}
              </p>
            </div>

            {/* Execution Section: Progress Slider & Status quick action for Employee */}
            <div className="p-4 bg-gradient-to-br from-[#EAF5FF]/60 to-white rounded-xl border border-[#0875D9]/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#0875D9]" />
                  <h4 className="text-xs font-bold text-[#063B78] uppercase tracking-wider">
                    Tiến Độ Thực Thi Công Việc (Nhân viên cập nhật)
                  </h4>
                </div>
                <span className="font-mono font-bold text-sm text-[#0875D9] bg-white px-2.5 py-0.5 rounded-lg border border-[#0875D9]/30 shadow-2xs">
                  {task.progress}%
                </span>
              </div>

              {/* Progress Slider */}
              <div className="space-y-1.5">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={task.progress}
                  onChange={(e) => {
                    const p = Number(e.target.value);
                    const newStatus: TaskStatus = p === 100 ? 'COMPLETED' : (p > 0 && task.status === 'TODO') ? 'IN_PROGRESS' : task.status;
                    updateTask(task.id, {
                      progress: p,
                      status: newStatus
                    });
                    if (p === 100) celebrate();
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0875D9]"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0% (Bắt đầu)</span>
                  <span>25%</span>
                  <span>50% (Đang làm)</span>
                  <span>75% (Gần xong)</span>
                  <span>100% (Hoàn thành)</span>
                </div>
              </div>

              {/* Quick Status Buttons for Execution */}
              <div className="pt-2 border-t border-[#0875D9]/15 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-600">Chuyển trạng thái thực hiện:</span>
                {(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'] as TaskStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => updateTaskStatus(task.id, st)}
                    className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold transition-all cursor-pointer ${
                      task.status === st
                        ? 'bg-[#0875D9] text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {st === 'TODO' && 'Cần làm'}
                    {st === 'IN_PROGRESS' && 'Đang làm'}
                    {st === 'REVIEW' && 'Nộp kiểm duyệt'}
                    {st === 'COMPLETED' && 'Hoàn thành'}
                  </button>
                ))}
              </div>
            </div>

            {/* Google Docs Deliverables Section */}
            <div className="p-4 bg-blue-50/60 border border-blue-200/90 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                    Sản Phẩm & Bài Viết Google Docs (docs.google.com)
                  </h4>
                </div>

                {!task.googleDocsUrl && !isAttachingDocs && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAttachingDocs(true);
                      setDocsInputTitle(`Tài liệu cho: ${task.title}`);
                    }}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nộp link Google Doc</span>
                  </button>
                )}
              </div>

              {task.googleDocsUrl ? (
                <div className="p-3 bg-white border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 truncate">
                      <span>📄</span>
                      <span className="truncate">{task.googleDocsTitle || task.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                      {task.googleDocsUrl}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={task.googleDocsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <span>Mở Google Docs</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        setActiveTab('docs');
                      }}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      title="Xem ghi chú và góp ý của Quản lý trên phân hệ Docs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Xem Góp Ý</span>
                    </button>
                  </div>
                </div>
              ) : isAttachingDocs ? (
                <div className="p-3 bg-white border border-blue-200 rounded-xl space-y-2.5 shadow-2xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Đường link tài liệu Google Docs
                    </label>
                    <input
                      type="url"
                      value={docsInputUrl}
                      onChange={(e) => setDocsInputUrl(e.target.value)}
                      placeholder="https://docs.google.com/document/d/.../edit"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <a
                      href="https://docs.google.com/document/create"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>Tạo doc mới trên docs.google.com</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAttachingDocs(false)}
                        className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-xs hover:bg-slate-200 cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!docsInputUrl.trim()) return;
                          updateTask(task.id, {
                            googleDocsUrl: docsInputUrl.trim(),
                            googleDocsTitle: docsInputTitle.trim() || task.title
                          });
                          addGoogleDoc({
                            title: docsInputTitle.trim() || `Tài liệu: ${task.title}`,
                            docsUrl: docsInputUrl.trim(),
                            docType: 'CONTENT',
                            departmentId: task.departmentId,
                            authorId: task.assigneeId,
                            authorName: assignee ? assignee.name : currentUser.name,
                            authorAvatar: assignee ? assignee.avatar : currentUser.avatar,
                            reviewerId: task.reporterId || 'emp-02',
                            reviewerName: reporter ? `${reporter.name} (${reporter.roleTitle})` : 'Quản lý dự án',
                            taskId: task.id,
                            taskTitle: task.title,
                            status: 'NEEDS_REVIEW',
                            summary: 'Tài liệu được nhân viên đính kèm từ phần thực hiện nhiệm vụ.'
                          });
                          setIsAttachingDocs(false);
                          celebrate();
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors cursor-pointer"
                      >
                        Lưu & Nộp Sản Phẩm
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Subtasks Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Checklist việc con (Subtasks)
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">
                    {completedSubtasks}/{task.subtasks.length} ({task.progress}%)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAiBreakdown}
                  disabled={isGeneratingAI}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#0875D9] bg-[#EAF5FF] hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGeneratingAI ? 'AI đang phân rã...' : 'AI Gợi ý thêm việc'}</span>
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-gradient-to-r from-[#0875D9] to-[#39A9FF] h-full transition-all duration-300"
                  style={{ width: `${task.progress}%` }}
                />
              </div>

              {/* Checklist */}
              <div className="space-y-1.5">
                {task.subtasks.map(st => (
                  <label
                    key={st.id}
                    className={`flex items-start gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                      st.completed
                        ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => toggleSubtask(task.id, st.id)}
                      className="mt-0.5 rounded text-[#0875D9] focus:ring-[#0875D9] cursor-pointer"
                    />
                    <span className="flex-1 leading-snug">{st.title}</span>
                  </label>
                ))}
              </div>

              {/* Add inline subtask form */}
              <form onSubmit={handleAddInlineSubtask} className="mt-2.5 flex items-center gap-2">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Thêm đầu việc con mới trong quá trình thực hiện..."
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm</span>
                </button>
              </form>
            </div>

            {/* Comments thread */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">
                Trao đổi & Cập nhật tiến độ ({task.comments.length})
              </h4>

              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1">
                {task.comments.map(cm => (
                  <div key={cm.id} className="flex items-start gap-2.5 text-xs">
                    <img
                      src={cm.authorAvatar}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">{cm.authorName}</span>
                        <span className="text-[11px] font-mono text-slate-400">{cm.createdAt}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{cm.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add comment box */}
              <form onSubmit={handleAddComment} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Viết phản hồi hoặc báo cáo tiến độ..."
                  className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0875D9]/30"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-[#0875D9] hover:bg-[#0B4FA8] text-white rounded-xl transition-colors cursor-pointer"
                  title="Gửi phản hồi"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Right sidebar: Metadata, Status, Assignee, Actions */}
          <div className="p-6 space-y-5 text-xs bg-slate-50/60">
            {/* Status Selector */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">
                Trạng thái nhiệm vụ
              </label>
              <select
                value={task.status}
                onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9]/30 text-slate-800"
              >
                <option value="TODO">Cần làm (To Do)</option>
                <option value="IN_PROGRESS">Đang thực hiện (In Progress)</option>
                <option value="REVIEW">Chờ nghiệm thu (Review)</option>
                <option value="COMPLETED">Đã hoàn thành (Done)</option>
              </select>
            </div>

            {/* Actual Hours Worked */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">
                Số giờ thực tế đã làm (Giờ)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={task.actualHours}
                  onChange={(e) => updateTask(task.id, { actualHours: Math.max(0, Number(e.target.value) || 0) })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9]/30"
                />
                <span className="text-slate-400 font-mono">/ {task.estimatedHours}h</span>
              </div>
            </div>

            {/* Priority Selector (Management can edit, Employee read-only) */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Mức độ ưu tiên</label>
              {canEditCoreMeta ? (
                <select
                  value={task.priority}
                  onChange={(e) => updateTask(task.id, { priority: e.target.value as TaskPriority })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9]/30"
                >
                  <option value="URGENT">Khẩn cấp (Urgent)</option>
                  <option value="HIGH">Cao (High)</option>
                  <option value="MEDIUM">Trung bình (Medium)</option>
                  <option value="LOW">Thấp (Low)</option>
                </select>
              ) : (
                <div className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>
                    {task.priority === 'URGENT' ? 'Khẩn cấp' : task.priority === 'HIGH' ? 'Cao' : task.priority === 'MEDIUM' ? 'Trung bình' : 'Thấp'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">(Do Quản lý ấn định)</span>
                </div>
              )}
            </div>

            {/* Assignee (Target Employee) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-600 font-semibold">Người phụ trách (Thực hiện)</label>
                {!canReassign && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Cố định
                  </span>
                )}
              </div>

              {canReassign ? (
                <select
                  value={task.assigneeId}
                  onChange={(e) => updateTask(task.id, { assigneeId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9]/30"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.roleTitle})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-2.5 p-2 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <img
                    src={assignee?.avatar}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 truncate">{assignee?.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{assignee?.roleTitle}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Reporter (Manager / Board) */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">
                Người giao việc (Ban Quản Trị / Quản Lý)
              </label>
              <div className="flex items-center gap-2.5 p-2 bg-white border border-slate-200 rounded-xl shadow-2xs">
                <img
                  src={reporter?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 truncate">
                    {reporter?.name || 'Ban Quản Trị'}
                  </div>
                  <div className="text-[11px] text-[#0875D9] font-medium truncate">
                    {reporter?.roleTitle || 'Cấp Quản Lý'}
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-2 py-3 border-y border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Ngày giao:</span>
                <span className="font-mono text-slate-800">{task.startDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Hạn chót (Deadline):</span>
                <span className="font-mono font-bold text-[#0B4FA8]">{task.dueDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Kế hoạch / Thực tế:</span>
                <span className="font-mono text-slate-800">{task.estimatedHours}h / {task.actualHours}h</span>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Thẻ phân loại</label>
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map((t, idx) => (
                  <span key={idx} className="font-mono text-[11px] text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-lg shadow-2xs">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Delete button (Only for Management/Reporter) */}
            <div className="pt-2">
              {canDelete ? (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Xác nhận xóa nhiệm vụ này? Thao tác này không thể hoàn tác.')) {
                      deleteTask(task.id);
                    }
                  }}
                  className="w-full py-2 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa nhiệm vụ này</span>
                </button>
              ) : (
                <div className="p-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Chỉ Quản lý giao việc mới có quyền xóa task</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
