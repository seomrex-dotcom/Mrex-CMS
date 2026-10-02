import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DepartmentId, TaskPriority, TaskStatus, TaskAssignmentType } from '../../types';
import {
  X,
  Sparkles,
  Plus,
  Trash2,
  Shield,
  UserCheck,
  Users,
  User,
  Check,
  Calendar,
  Layers,
  Info
} from 'lucide-react';
import { breakdownTaskWithAI } from '../../services/aiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TaskAssignmentType;
}

export const NewTaskModal: React.FC<Props> = ({ isOpen, onClose, initialType = 'INDIVIDUAL' }) => {
  const { currentUser, employees, departments, createTask, celebrate } = useApp();

  const isManagement = currentUser.role === 'CEO' || currentUser.role === 'MANAGER';

  // Assignment mode: INDIVIDUAL vs TEAM
  const [assignmentType, setAssignmentType] = useState<TaskAssignmentType>(initialType);

  useEffect(() => {
    if (initialType) {
      setAssignmentType(initialType);
    }
  }, [initialType, isOpen]);

  // Default candidate employees
  const employeeCandidates = employees.filter(e => e.role === 'EMPLOYEE');
  const defaultAssignee = isManagement
    ? (employeeCandidates.length > 0 ? employeeCandidates[0].id : employees[0]?.id)
    : currentUser.id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState<DepartmentId>('social');
  const [assigneeId, setAssigneeId] = useState(defaultAssignee || currentUser.id);

  // Team Assignment State
  const [teamLeadId, setTeamLeadId] = useState<string>(currentUser.id);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);

  // Update selected team members when departmentId changes
  useEffect(() => {
    const deptEmployees = employees.filter(e => e.departmentId === departmentId);
    const deptEmpIds = deptEmployees.map(e => e.id);
    setSelectedTeamMembers(deptEmpIds.length > 0 ? deptEmpIds : [currentUser.id]);

    const dept = departments.find(d => d.id === departmentId);
    if (dept && dept.managerId) {
      setTeamLeadId(dept.managerId);
    } else if (deptEmpIds.length > 0) {
      setTeamLeadId(deptEmpIds[0]);
    } else {
      setTeamLeadId(currentUser.id);
    }
  }, [departmentId, departments, employees, currentUser.id]);

  const [priority, setPriority] = useState<TaskPriority>('HIGH');
  const [startDate, setStartDate] = useState('2026-10-02');
  const [dueDate, setDueDate] = useState('2026-10-09');
  const [estimatedHours, setEstimatedHours] = useState(24);
  const [tagsInput, setTagsInput] = useState('');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([
    { id: '1', title: 'Thu thập yêu cầu chi tiết & phân tích nghiệp vụ', completed: false },
    { id: '2', title: 'Triển khai kỹ thuật và kiểm thử chất lượng', completed: false }
  ]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAssignmentType(initialType || 'INDIVIDUAL');
      if (!isManagement) {
        setAssigneeId(currentUser.id);
        setDepartmentId(currentUser.departmentId);
      }
    }
  }, [isOpen, initialType, isManagement, currentUser]);

  if (!isOpen) return null;

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

  const toggleTeamMember = (empId: string) => {
    if (selectedTeamMembers.includes(empId)) {
      if (selectedTeamMembers.length === 1) return; // keep at least 1 member
      setSelectedTeamMembers(selectedTeamMembers.filter(id => id !== empId));
    } else {
      setSelectedTeamMembers([...selectedTeamMembers, empId]);
    }
  };

  const handleSelectAllDeptMembers = () => {
    const deptEmployees = employees.filter(e => e.departmentId === departmentId);
    setSelectedTeamMembers(deptEmployees.map(e => e.id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const validSubtasks = subtasks.filter(s => s.title.trim().length > 0);
    const targetDept = departments.find(d => d.id === departmentId);

    if (assignmentType === 'TEAM') {
      const teamTags = parsedTags.length > 0 ? parsedTags : ['Việc Team', targetDept?.name || 'Team'];
      createTask({
        title: title.trim(),
        description: description.trim(),
        departmentId,
        assigneeId: teamLeadId || assigneeId,
        assigneeIds: selectedTeamMembers.length > 0 ? selectedTeamMembers : [teamLeadId],
        assignmentType: 'TEAM',
        teamName: targetDept?.name || 'Team',
        reporterId: currentUser.id,
        status: 'TODO' as TaskStatus,
        priority,
        startDate,
        dueDate,
        estimatedHours: Number(estimatedHours) || 16,
        actualHours: 0,
        progress: 0,
        tags: teamTags,
        subtasks: validSubtasks,
      });
    } else {
      const indTags = parsedTags.length > 0 ? parsedTags : ['Việc Cá Nhân'];
      createTask({
        title: title.trim(),
        description: description.trim(),
        departmentId,
        assigneeId: isManagement ? assigneeId : currentUser.id,
        assigneeIds: [isManagement ? assigneeId : currentUser.id],
        assignmentType: 'INDIVIDUAL',
        reporterId: currentUser.id,
        status: 'TODO' as TaskStatus,
        priority,
        startDate,
        dueDate,
        estimatedHours: Number(estimatedHours) || 8,
        actualHours: 0,
        progress: 0,
        tags: indTags,
        subtasks: validSubtasks,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0875D9]/15 text-[#0875D9] flex items-center justify-center font-bold">
              {assignmentType === 'TEAM' ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-[#063B78]">
                {assignmentType === 'TEAM' ? 'Giao Việc Cho Team / Phòng Ban' : 'Giao Việc Cho Cá Nhân'}
              </h2>
              <p className="text-[11px] text-[#0875D9] font-medium">
                {assignmentType === 'TEAM'
                  ? 'Phân công nhiệm vụ nhóm đa thành viên phối hợp thực hiện'
                  : isManagement
                  ? 'Chỉ định trực tiếp nhân sự chịu trách nhiệm thực thi'
                  : 'Tự lập kế hoạch và đầu việc cá nhân cần hoàn thành'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[82vh] overflow-y-auto">
          {/* Mode Switcher: Giao việc cá nhân vs Giao việc team */}
          <div className="p-1 bg-slate-100 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setAssignmentType('INDIVIDUAL')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                assignmentType === 'INDIVIDUAL'
                  ? 'bg-white text-[#0B4FA8] shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Giao Việc Cá Nhân</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isManagement) {
                  alert('Tài khoản cấp Nhân viên chỉ có quyền tạo việc cá nhân. Chỉ Ban Quản trị và Quản lý mới có quyền điều phối việc cho Team.');
                  return;
                }
                setAssignmentType('TEAM');
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                assignmentType === 'TEAM'
                  ? 'bg-white text-[#0B4FA8] shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Giao Việc Cho Team</span>
            </button>
          </div>

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
                    {currentUser.role === 'CEO' ? 'Ban Giám Đốc' : currentUser.role === 'MANAGER' ? 'Cấp Quản Lý' : 'Nhân Viên'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {isManagement ? `Người điều phối: ${currentUser.roleTitle}` : 'Tự tạo việc cá nhân để theo dõi'}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                <UserCheck className="w-3 h-3" />
                {isManagement ? 'Quyền Quản Trị' : 'Việc Cá Nhân'}
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
              placeholder={
                assignmentType === 'TEAM'
                  ? 'VD: Chiến dịch truyền thông ra mắt sản phẩm Q4...'
                  : 'VD: Hoàn thiện báo cáo tiến độ tuần và tối ưu giao diện...'
              }
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0875D9]/30 focus:border-[#0875D9] transition-all"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mô tả chi tiết & Tiêu chuẩn nghiệm thu (DoD)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nêu rõ yêu cầu chất lượng, tài liệu bàn giao hoặc kết quả mong muốn đạt được..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0875D9]/30 focus:border-[#0875D9] transition-all"
            />
          </div>

          {/* Section: TEAM Assignment Specific Inputs */}
          {assignmentType === 'TEAM' ? (
            <div className="p-3.5 bg-[#EAF5FF]/50 border border-[#0875D9]/25/80 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                  <Users className="w-4 h-4 text-[#0875D9]" />
                  <span>Cấu hình Đội Nhóm Thực Hiện</span>
                </div>
                <span className="text-[10.5px] text-[#0875D9] font-semibold bg-white px-2 py-0.5 rounded-full border border-indigo-100">
                  {selectedTeamMembers.length} thành viên được chọn
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Team / Phòng ban nhận việc</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value as DepartmentId)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9]/30 min-h-[40px] font-medium"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Trưởng nhóm / Đầu mối chịu trách nhiệm (Team Lead)
                  </label>
                  <select
                    value={teamLeadId}
                    onChange={(e) => setTeamLeadId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9]/30 min-h-[40px] font-medium"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} — {emp.roleTitle} {emp.departmentId === departmentId ? '★ (Cùng Team)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Members multi-select checklist */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700 text-[11px]">
                    Thành viên trong Team cùng tham gia:
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllDeptMembers}
                    className="text-[10.5px] text-[#0875D9] hover:text-[#063B78] font-semibold cursor-pointer underline"
                  >
                    Chọn tất cả thành viên trong phòng
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1 bg-white rounded-lg border border-slate-200">
                  {employees.map(emp => {
                    const isSelected = selectedTeamMembers.includes(emp.id);
                    const isLead = emp.id === teamLeadId;

                    return (
                      <label
                        key={emp.id}
                        className={`flex items-center gap-2 p-1.5 rounded-md cursor-pointer transition-colors border ${
                          isSelected
                            ? 'bg-blue-50/70 border-[#0875D9]/25 text-indigo-950'
                            : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleTeamMember(emp.id)}
                          className="rounded text-[#0875D9] focus:ring-[#0875D9] cursor-pointer"
                        />
                        <img
                          src={emp.avatar}
                          alt=""
                          className="w-5 h-5 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="font-medium truncate block text-[11px] leading-tight">
                            {emp.name} {isLead && <strong className="text-[#0875D9] font-bold">(Lead)</strong>}
                          </span>
                          <span className="text-[9.5px] text-slate-400 block truncate">
                            {emp.roleTitle}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Section: INDIVIDUAL Assignment Inputs */
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
                  Người nhận việc (Assignee) <span className="text-red-500">*</span>
                </label>
                {isManagement ? (
                  <select
                    value={assigneeId}
                    onChange={(e) => {
                      const empId = e.target.value;
                      setAssigneeId(empId);
                      const emp = employees.find(x => x.id === empId);
                      if (emp && emp.departmentId) {
                        setDepartmentId(emp.departmentId);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9]/30 min-h-[40px] font-medium"
                  >
                    <optgroup label="Cấp Nhân Viên">
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
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 min-h-[40px]">
                    <img src={currentUser.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                    <span>{currentUser.name} (Tự làm)</span>
                  </div>
                )}
              </div>
            </div>
          )}

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
              <label className="block font-semibold text-slate-700 mb-1">
                Ước tính thời gian thực hiện (Giờ)
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9]/30 min-h-[40px]"
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ngày bắt đầu</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9]/30 min-h-[40px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hạn hoàn thành (Deadline)</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9]/30 min-h-[40px]"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nhãn thẻ (Tags phân loại, cách nhau bằng dấu phẩy)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder={assignmentType === 'TEAM' ? 'Việc Team, Social Media, Q4' : 'Việc Cá Nhân, Sprint, Fix Bug'}
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
              className="px-5 py-2.5 bg-gradient-to-r from-[#0875D9] to-[#0B4FA8] hover:from-[#0B4FA8] hover:to-[#063B78] text-white font-semibold rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              {assignmentType === 'TEAM' ? (
                <>
                  <Users className="w-4 h-4" />
                  <span>Xác Nhận Giao Việc Cho Team</span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  <span>Xác Nhận Giao Việc Cá Nhân</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
