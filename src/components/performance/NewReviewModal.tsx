import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PerformanceReview, ReviewCriteria, ReviewRating } from '../../types';
import { X, Sparkles, AlertCircle, Shield, Award, UserCheck, Lock, Building } from 'lucide-react';
import { generatePerformanceFeedbackAI } from '../../services/aiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  existingReview?: PerformanceReview | null;
}

const DEFAULT_CRITERIA: ReviewCriteria[] = [
  { id: 'cr-1', name: 'Hoàn thành khối lượng công việc & Tiến độ cam kết', weight: 35, selfScore: 4.0, managerScore: 4.0 },
  { id: 'cr-2', name: 'Chất lượng chuyên môn, kiến trúc & Giải quyết vấn đề', weight: 25, selfScore: 4.0, managerScore: 4.0 },
  { id: 'cr-3', name: 'Tinh thần phối hợp đồng đội & Lắng nghe phản hồi', weight: 20, selfScore: 4.0, managerScore: 4.0 },
  { id: 'cr-4', name: 'Kỷ luật công việc, chấm công & Tuân thủ quy định', weight: 10, selfScore: 4.0, managerScore: 4.0 },
  { id: 'cr-5', name: 'Sáng kiến cải tiến quy trình & Đóng góp ý tưởng mới', weight: 10, selfScore: 4.0, managerScore: 4.0 },
];

export const NewReviewModal: React.FC<Props> = ({ isOpen, onClose, existingReview }) => {
  const { currentUser, employees, departments, saveReview, celebrate } = useApp();

  const isCEO = currentUser.role === 'CEO';
  const isManager = currentUser.role === 'MANAGER' || departments.some(d => d.managerId === currentUser.id);

  // Managed department for Department Head
  const managedDept = departments.find(d => d.managerId === currentUser.id) || departments.find(d => d.id === currentUser.departmentId);
  const managedDeptId = managedDept?.id || currentUser.departmentId;

  // Determine allowed candidate employees:
  // - Ban Giám Đốc (CEO): được đánh giá TOÀN BỘ nhân viên (tất cả các phòng ban)
  // - Trưởng bộ phận: CHỈ ĐƯỢC đánh giá nhân viên thuộc bộ phận đó
  const candidateEmployees = isCEO
    ? employees.filter(e => e.id !== currentUser.id)
    : isManager
    ? (employees.filter(e => e.departmentId === managedDeptId && e.id !== currentUser.id).length > 0
        ? employees.filter(e => e.departmentId === managedDeptId && e.id !== currentUser.id)
        : employees.filter(e => e.departmentId === managedDeptId))
    : [];

  const initialEmployeeId = existingReview?.employeeId || (candidateEmployees.length > 0 ? candidateEmployees[0].id : employees[0]?.id);

  const [employeeId, setEmployeeId] = useState(initialEmployeeId);
  const [period, setPeriod] = useState(existingReview?.period || 'Q3/2026');
  const [criteria, setCriteria] = useState<ReviewCriteria[]>(existingReview?.criteria || DEFAULT_CRITERIA);
  const [strengths, setStrengths] = useState(existingReview?.employeeStrengths || '');
  const [improvements, setImprovements] = useState(existingReview?.employeeImprovements || '');
  const [managerFeedback, setManagerFeedback] = useState(existingReview?.managerFeedback || '');
  const [developmentPlan, setDevelopmentPlan] = useState(existingReview?.developmentPlan || '');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setEmployeeId(existingReview.employeeId);
      setPeriod(existingReview.period);
      setCriteria(existingReview.criteria);
      setStrengths(existingReview.employeeStrengths || '');
      setImprovements(existingReview.employeeImprovements || '');
      setManagerFeedback(existingReview.managerFeedback || '');
      setDevelopmentPlan(existingReview.developmentPlan || '');
    } else {
      if (candidateEmployees.length > 0 && !candidateEmployees.some(e => e.id === employeeId)) {
        setEmployeeId(candidateEmployees[0].id);
      }
    }
  }, [existingReview, isOpen]);

  if (!isOpen) return null;

  // Check if target employee belongs to permissions
  const targetEmployee = employees.find(e => e.id === employeeId);
  const targetDept = departments.find(d => d.id === targetEmployee?.departmentId);

  // If Trưởng bộ phận attempts to edit a review of another department
  const isTargetAllowed = isCEO || (isManager && targetEmployee?.departmentId === managedDeptId);

  if (!isCEO && !isManager) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-red-200 w-full max-w-md p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Giới Hạn Quyền Đánh Giá KPI</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Theo quy định phân quyền hệ thống: <strong>Chỉ Trưởng bộ phận</strong> (đánh giá nhân viên thuộc bộ phận đó) và <strong>Ban Giám Đốc</strong> (đánh giá toàn bộ nhân sự) mới có quyền lập và chỉnh sửa phiếu đánh giá KPI.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Đã hiểu & Đóng lại
          </button>
        </div>
      </div>
    );
  }

  if (existingReview && !isTargetAllowed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-amber-200 w-full max-w-md p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-100">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Không Có Quyền Chỉnh Sửa</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Nhân sự <strong>{targetEmployee?.name}</strong> thuộc <strong>{targetDept?.name}</strong>.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Bạn chỉ có quyền đánh giá nhân viên thuộc <strong>{managedDept?.name}</strong>. Để đánh giá nhân sự khác phòng ban, quyền hạn thuộc về <strong>Ban Giám Đốc</strong>.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Đã hiểu & Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Calculate weighted average
  const calcTotalScore = (type: 'self' | 'manager') => {
    let total = 0;
    let totalWeight = 0;
    criteria.forEach(c => {
      const score = type === 'self' ? c.selfScore : c.managerScore;
      total += score * (c.weight / 100);
      totalWeight += c.weight;
    });
    return totalWeight > 0 ? Number((total / (totalWeight / 100)).toFixed(2)) : 0;
  };

  const selfTotal = calcTotalScore('self');
  const managerTotal = calcTotalScore('manager');

  const getRating = (score: number): ReviewRating => {
    if (score >= 4.5) return 'A_PLUS';
    if (score >= 4.0) return 'A';
    if (score >= 3.5) return 'B';
    return 'C';
  };

  const handleAiAssist = async () => {
    if (!targetEmployee) return;
    setIsGeneratingAI(true);
    try {
      const result = await generatePerformanceFeedbackAI(
        targetEmployee.name,
        targetEmployee.roleTitle,
        managerTotal,
        criteria.map(c => c.name)
      );
      setStrengths(result.strengths);
      setImprovements(result.improvements);
      setManagerFeedback(result.managerFeedback);
      setDevelopmentPlan(result.developmentPlan);
      celebrate();
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalRating = getRating(managerTotal);

    const reviewData: PerformanceReview = {
      id: existingReview?.id || `rev-${Date.now()}`,
      employeeId,
      reviewerId: currentUser.id,
      period,
      status: 'COMPLETED',
      criteria,
      selfScoreTotal: selfTotal,
      managerScoreTotal: managerTotal,
      finalRating,
      employeeStrengths: strengths,
      employeeImprovements: improvements,
      managerFeedback: managerFeedback,
      developmentPlan: developmentPlan,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    saveReview(reviewData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0875D9] text-white flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {existingReview ? 'Cập Nhật Phiếu Đánh Giá Hiệu Suất' : 'Lập Phiếu Đánh Giá Hiệu Suất (KPI/OKR)'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Đánh giá chỉ tiêu năng lực 360°, đối chiếu mục tiêu và xây dựng lộ trình phát triển (IDP)
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

        {/* Scope and Permissions Info Banner */}
        <div className={`px-6 py-3 border-b text-xs flex items-center justify-between gap-3 ${
          isCEO
            ? 'bg-blue-50/80 border-indigo-100 text-indigo-950'
            : 'bg-emerald-50/80 border-emerald-100 text-emerald-950'
        }`}>
          <div className="flex items-center gap-2">
            <Shield className={`w-4 h-4 shrink-0 ${isCEO ? 'text-[#0875D9]' : 'text-emerald-600'}`} />
            <div>
              <span className="font-bold">
                {isCEO ? 'Quyền Hạn Ban Giám Đốc (CEO)' : `Quyền Hạn Trưởng Bộ Phận: ${managedDept?.name}`}
              </span>
              <p className="text-[11px] opacity-80 mt-0.5">
                {isCEO
                  ? 'Ban Giám Đốc được quyền đánh giá và phê duyệt KPI cho toàn bộ nhân viên trong công ty.'
                  : `Chỉ được quyền đánh giá các nhân viên thuộc bộ phận ${managedDept?.name}.`}
              </p>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 border ${
            isCEO
              ? 'bg-blue-100 text-[#063B78] border-[#0875D9]/25'
              : 'bg-emerald-100 text-emerald-800 border-emerald-200'
          }`}>
            {isCEO ? 'Đánh giá toàn bộ' : 'Phạm vi bộ phận'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Target employee & Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">Nhân sự được đánh giá</label>
                <span className="text-[10px] text-slate-400">
                  {candidateEmployees.length} nhân sự hợp lệ
                </span>
              </div>

              {candidateEmployees.length === 0 ? (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                  Chưa có nhân viên nào thuộc bộ phận {managedDept?.name} để đánh giá.
                </div>
              ) : (
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  disabled={!!existingReview}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9] font-medium min-h-[40px]"
                >
                  {isCEO ? (
                    departments.map(dept => {
                      const deptEmps = candidateEmployees.filter(e => e.departmentId === dept.id);
                      if (deptEmps.length === 0) return null;
                      return (
                        <optgroup key={dept.id} label={`Khối: ${dept.name}`}>
                          {deptEmps.map(emp => (
                            <option key={emp.id} value={emp.id}>
                              {emp.name} — {emp.roleTitle} ({emp.code})
                            </option>
                          ))}
                        </optgroup>
                      );
                    })
                  ) : (
                    candidateEmployees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} — {emp.roleTitle} ({emp.code})
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kỳ đánh giá KPI</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9] font-medium min-h-[40px]"
              >
                <option value="Q3/2026">Quý 3/2026 (01/07 - 30/09/2026)</option>
                <option value="Q4/2026">Quý 4/2026 (01/10 - 31/12/2026)</option>
                <option value="2026-Annual">Đánh giá Thường Niên 2026</option>
              </select>
            </div>
          </div>

          {/* Selected Employee Preview Pill */}
          {targetEmployee && (
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={targetEmployee.avatar}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-[#0875D9]/20"
                />
                <div>
                  <div className="font-bold text-slate-900">{targetEmployee.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {targetEmployee.roleTitle} · <span className="text-[#0875D9] font-semibold">{targetDept?.name}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-slate-400 text-[10.5px]">Mã NV: {targetEmployee.code}</span>
              </div>
            </div>
          )}

          {/* Criteria Scoring Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-slate-800">Bảng tiêu chuẩn năng lực & Điểm số (Thang 1.0 - 5.0)</label>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-500">Điểm tự chấm: <strong className="text-slate-800 font-mono">{selfTotal}/5.0</strong></span>
                <span className="text-[#0B4FA8] font-bold bg-[#EAF5FF] px-2 py-0.5 rounded border border-[#0875D9]/25">
                  Điểm Quản lý: <span className="font-mono">{managerTotal}/5.0 ({getRating(managerTotal)})</span>
                </span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Tiêu chí đánh giá KPI</th>
                    <th className="py-2.5 px-3 w-20 text-center">Tỷ trọng</th>
                    <th className="py-2.5 px-3 w-28 text-center">Tự đánh giá</th>
                    <th className="py-2.5 px-3 w-28 text-center bg-[#EAF5FF]/50 text-[#00144b] font-bold">Điểm Quản lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {criteria.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2 px-3 font-medium text-slate-800">{c.name}</td>
                      <td className="py-2 px-3 text-center font-mono text-slate-500">{c.weight}%</td>
                      <td className="py-2 px-3 text-center">
                        <select
                          value={c.selfScore}
                          onChange={(e) => {
                            const updated = [...criteria];
                            updated[idx].selfScore = Number(e.target.value);
                            setCriteria(updated);
                          }}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-center font-mono text-xs"
                        >
                          <option value="5">5.0 (Xuất sắc)</option>
                          <option value="4.5">4.5</option>
                          <option value="4">4.0 (Tốt)</option>
                          <option value="3.5">3.5</option>
                          <option value="3">3.0 (Đạt)</option>
                          <option value="2">2.0 (Yếu)</option>
                        </select>
                      </td>
                      <td className="py-2 px-3 text-center bg-[#EAF5FF]/30">
                        <select
                          value={c.managerScore}
                          onChange={(e) => {
                            const updated = [...criteria];
                            updated[idx].managerScore = Number(e.target.value);
                            setCriteria(updated);
                          }}
                          className="w-full px-2 py-1 bg-white border border-[#0875D9]/40 rounded text-center font-mono font-bold text-[#0B4FA8] text-xs focus:ring-1 focus:ring-[#0875D9]"
                        >
                          <option value="5">5.0 (Xuất sắc)</option>
                          <option value="4.5">4.5</option>
                          <option value="4">4.0 (Tốt)</option>
                          <option value="3.5">3.5</option>
                          <option value="3">3.0 (Đạt)</option>
                          <option value="2">2.0 (Yếu)</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Feedback Assistant Button */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50/60 to-purple-50/60 border border-[#0875D9]/25/80 rounded-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0875D9]" />
              <div>
                <span className="font-bold text-slate-800 block text-xs">Trợ Lý AI Đề Xuất Nhận Xét & IDP</span>
                <span className="text-[11px] text-slate-500">Tự động gợi ý điểm mạnh, điểm cần cải thiện và kế hoạch phát triển năng lực</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAiAssist}
              disabled={isGeneratingAI}
              className="px-3 py-1.5 bg-[#0875D9] hover:bg-[#065eb0] text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGeneratingAI ? 'Đang tạo...' : 'AI Phân Tích'}</span>
            </button>
          </div>

          {/* Qualitative feedback textareas */}
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Điểm mạnh nổi bật (Strengths)</label>
              <textarea
                rows={2}
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="Nêu rõ các thành tích nổi bật, sáng kiến và kỹ năng xuất sắc của nhân viên..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0875D9]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Điểm cần hoàn thiện (Areas for Improvement)</label>
              <textarea
                rows={2}
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                placeholder="Các kỹ năng cần bồi dưỡng thêm hoặc quy trình cần cải thiện..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0875D9]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nhận xét & Lời khuyên của Người Đánh Giá</label>
              <textarea
                rows={2}
                value={managerFeedback}
                onChange={(e) => setManagerFeedback(e.target.value)}
                placeholder="Nhận xét tổng quát từ Quản lý / Ban Giám Đốc..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0875D9]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lộ trình đào tạo & Phát triển cá nhân (IDP)</label>
              <textarea
                rows={2}
                value={developmentPlan}
                onChange={(e) => setDevelopmentPlan(e.target.value)}
                placeholder="Các khóa học, dự án thử thách hoặc chứng chỉ mục tiêu trong kỳ tới..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0875D9]"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#0875D9] hover:bg-[#065eb0] text-white font-semibold rounded-lg shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              <span>{existingReview ? 'Lưu Cập Nhật Đánh Giá' : 'Hoàn Tất Đánh Giá KPI'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
