import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DepartmentId, TaskPriority, TaskStatus } from '../../types';
import { X, Sparkles, Plus, Trash2, Shield, Lock, UserCheck, AlertCircle } from 'lucide-react';
import { breakdownTaskWithAI } from '../../services/aiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NewTaskModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { currentUser, employees, departments, createTask, celebrate } = useApp();

  const isManagement = currentUser.role === 'CEO' || currentUser.role === 'MANAGER';

  // Subordinate employees or team members (exclude currentUser if manager wants to assign to employees)
  const employeeCandidates = employees.filter(e => e.role === 'EMPLOYEE');
  const defaultAssignee = employeeCandidates.length > 0 ? employeeCandidates[0].id : employees[0]?.id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState<DepartmentId>('exec');
  const [assigneeId, setAssigneeId] = useState(defaultAssignee || currentUser.id);
  const [priority, setPriority] = useState<TaskPriority>('HIGH');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [dueDate, setDueDate] = useState('2026-10-08');
  const [estimatedHours, setEstimatedHours] = useState(24);
  const [tagsInput, setTagsInput] = useState('Sprint, Feature');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([
    { id: '1', title: 'Thu thập yêu cầu chi tiết & phân tích nghiệp vụ', completed: false },
    { id: '2', title: 'Triển khai kỹ thuật và kiểm thử chất lượng', completed: false }
  ]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  if (!isOpen) return null;

  // Access control guard: Only Management and Board of Directors can assign tasks
  if (!isManagement) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-red-200 w-full max-w-md overflow-hidden p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Giới Hạn Quyền Hạn Giao Việc</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Theo quy định phân quyền hệ thống: <strong>Chỉ cấp Quản lý và Ban Quản trị</strong> mới có quyền giao việc cho nhân viên.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Tài khoản cấp <strong>Nhân viên</strong> ({currentUser.name}) chỉ được thực hiện công việc được giao.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Đã hiểu & Đóng lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAiBreakdown = async () => {
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề công việc trước để AI có thể phân rã đầu việc.');
      return;
    }
    setIsGeneratingAI(true);
    try {
      const generated = await breakdownTaskWithAI(title, description);
      setSubtasks(generated.map((s, idx) => ({ id: `ai-${Date.now()}-${idx}`, title: s, completed: false })));
      celebrate();
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, { id: `sb-${Date.now()}`, title: '', completed: false }]);
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const validSubtasks = subtasks.filter(s => s.title.trim().length > 0);

    createTask({
      title: title.trim(),
      description: description.trim(),
      departmentId,
      assigneeId,
      reporterId: currentUser.id,
      status: 'TODO' as TaskStatus,
      priority,
      startDate,
      dueDate,
      estimatedHours: Number(estimatedHours) || 8,
      actualHours: 0,
      progress: 0,
      tags: tags.length > 0 ? tags : ['Nhiệm vụ'],
      subtasks: validSubtasks,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-[#EAF5FF] via-white to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0875D9]/15 text-[#0875D9] flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#063B78]">Giao Việc Cho Nhân Viên</h2>
              <p className="text-[11px] text-[#0875D9] font-medium">
                Ban Quản Trị & Cấp Quản Lý điều phối nhiệm vụ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          {/* Reporter Preview Banner */}
          <div className="p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 border border-[#0875D9]/25 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={currentUser.avatar}
                alt=""
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-[#0875D9] ring-offset-1 ring-offset-white shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 truncate">{currentUser.name}</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-[#0875D9] text-white">
                    {currentUser.role === 'CEO' ? 'Ban Quản Trị' : 'Cấp Quản Lý'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Người giao việc: {currentUser.roleTitle}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                <UserCheck className="w-3 h-3" /> Đủ quyền giao việc
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tiêu đề nhiệm vụ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Triển khai cổng thanh toán QR code cho khách hàng..."
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0875D9]/30 focus:border-[#0875D9] transition-all"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mô tả chi tiết & Tiêu chí nghiệm thu (DoD)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nêu rõ yêu cầu kỹ thuật, tài liệu bàn giao hoặc kết quả mong muốn nhân viên đạt được..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0875D9]/30 focus:border-[#0875D9] transition-all"
            />
          </div>

          {/* Department & Assignee (Target Employee) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phòng ban phụ trách</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value as DepartmentId)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9]/30 min-h-[40px]"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Giao cho nhân viên (Assignee) <span className="text-red-500">*</span>
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9]/30 min-h-[40px] font-medium"
              >
                {/* Group employees */}
                <optgroup label="Cấp Nhân Viên (Thực hiện)">
                  {employees.filter(e => e.role === 'EMPLOYEE').map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — {emp.roleTitle}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Cán bộ / Trưởng bộ phận khác">
                  {employees.filter(e => e.role !== 'EMPLOYEE').map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.roleTitle})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Priority & Estimated hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mức độ ưu tiên</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9]/30 min-h-[40px]"
              >
                <option value="URGENT">Khẩn cấp (Urgent)</option>
                <option value="HIGH">Cao (High)</option>
                <option value="MEDIUM">Trung bình (Medium)</option>
                <option value="LOW">Thấp (Low)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ước tính thời gian (Giờ)</label>
              <input
                type="number"
                min="1"
                max="500"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9]/30 min-h-[40px]"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ngày bắt đầu</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9]/30"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hạn chót bàn giao (Deadline)</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9]/30"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Thẻ phân loại (ngăn cách bằng dấu phẩy)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Backend, API, Release-V3..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9]/30"
            />
          </div>

          {/* Subtasks with AI Assistant */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-slate-800">
                Phân rã đầu việc con (Checklist thực hiện)
              </label>
              <button
                type="button"
                onClick={handleAiBreakdown}
                disabled={isGeneratingAI}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-[#EAF5FF] hover:bg-blue-100 text-[#0875D9] rounded-lg font-semibold transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGeneratingAI ? 'AI đang phân rã...' : 'AI Phân Rã Việc Tự Động'}</span>
              </button>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {subtasks.map((st, idx) => (
                <div key={st.id} className="flex items-center gap-2">
                  <span className="font-mono text-slate-400 text-[11px] w-4">{idx + 1}.</span>
                  <input
                    type="text"
                    value={st.title}
                    onChange={(e) => {
                      const updated = [...subtasks];
                      updated[idx].title = e.target.value;
                      setSubtasks(updated);
                    }}
                    placeholder={`Đầu việc con #${idx + 1}`}
                    className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                    title="Xóa đầu việc này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddSubtask}
              className="mt-2 text-[#0875D9] hover:text-[#063B78] font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Thêm đầu việc con thủ công</span>
            </button>
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-[#0875D9] to-[#0B4FA8] hover:from-[#0B4FA8] hover:to-[#063B78] text-white font-semibold rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              Xác Nhận Giao Việc Cho Nhân Viên
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
