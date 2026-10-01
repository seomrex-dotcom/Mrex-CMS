import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PerformanceReview, ReviewCriteria, ReviewRating } from '../../types';
import { X, Sparkles, AlertCircle } from 'lucide-react';
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
  const { currentUser, employees, saveReview, celebrate } = useApp();

  const [employeeId, setEmployeeId] = useState(existingReview?.employeeId || employees[1].id);
  const [period, setPeriod] = useState(existingReview?.period || 'Q3/2026');
  const [criteria, setCriteria] = useState<ReviewCriteria[]>(existingReview?.criteria || DEFAULT_CRITERIA);
  const [strengths, setStrengths] = useState(existingReview?.employeeStrengths || '');
  const [improvements, setImprovements] = useState(existingReview?.employeeImprovements || '');
  const [managerFeedback, setManagerFeedback] = useState(existingReview?.managerFeedback || '');
  const [developmentPlan, setDevelopmentPlan] = useState(existingReview?.developmentPlan || '');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  if (!isOpen) return null;

  const targetEmployee = employees.find(e => e.id === employeeId);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {existingReview ? 'Cập Nhật Phiếu Đánh Giá Hiệu Suất' : 'Lập Phiếu Đánh Giá Hiệu Suất (KPI/OKR)'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Đánh giá đa chiều 360°, đối chiếu mục tiêu và xây dựng lộ trình phát triển (IDP)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Target employee & Period */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Nhân sự được đánh giá</label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                disabled={!!existingReview}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.roleTitle})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Kỳ đánh giá</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
              >
                <option value="Q3/2026">Quý 3/2026 (01/07 - 30/09/2026)</option>
                <option value="Q4/2026">Quý 4/2026 (01/10 - 31/12/2026)</option>
                <option value="2026-Annual">Đánh giá Thường Niên 2026</option>
              </select>
            </div>
          </div>

          {/* Criteria Scoring Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-slate-800">Bảng tiêu chuẩn năng lực & Điểm số (Thang 1.0 - 5.0)</label>
              <div className="font-mono text-slate-500 text-[11px]">
                Điểm Quản lý: <span className="font-bold text-indigo-700">{managerTotal}</span>/5.0
              </div>
            </div>

            <div className="space-y-2 border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              {criteria.map((cr, idx) => (
                <div key={cr.id} className="grid grid-cols-12 gap-2 items-center text-xs pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="col-span-6 pr-2">
                    <div className="font-medium text-slate-800">{cr.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Trọng số: {cr.weight}%</div>
                  </div>

                  <div className="col-span-3">
                    <label className="block text-[10px] text-slate-400">Tự chấm</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={cr.selfScore}
                      onChange={(e) => {
                        const copy = [...criteria];
                        copy[idx].selfScore = parseFloat(e.target.value) || 1;
                        setCriteria(copy);
                      }}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-mono text-center text-xs"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="block text-[10px] text-indigo-600 font-semibold">Quản lý chấm</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={cr.managerScore}
                      onChange={(e) => {
                        const copy = [...criteria];
                        copy[idx].managerScore = parseFloat(e.target.value) || 1;
                        setCriteria(copy);
                      }}
                      className="w-full px-2 py-1 bg-white border border-indigo-300 rounded font-mono text-center font-bold text-indigo-700 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Helper Banner */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-indigo-900 font-medium">
                Tự động soạn nhận xét & đề xuất lộ trình phát triển (IDP) bằng AI
              </span>
            </div>
            <button
              type="button"
              onClick={handleAiAssist}
              disabled={isGeneratingAI}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium transition-colors"
            >
              {isGeneratingAI ? 'Đang tạo...' : 'Kích hoạt AI'}
            </button>
          </div>

          {/* Qualitative comments */}
          <div className="space-y-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Điểm mạnh nổi bật (Strengths)</label>
              <textarea
                rows={2}
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="Năng lực làm việc độc lập, khả năng chịu áp lực tiến độ..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Điểm cần cải thiện (Areas for Improvement)</label>
              <textarea
                rows={2}
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                placeholder="Cần chủ động trao đổi khi gặp bài toán khó..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Ý kiến & Kết luận của cấp Quản lý</label>
              <textarea
                rows={2}
                value={managerFeedback}
                onChange={(e) => setManagerFeedback(e.target.value)}
                placeholder="Ghi nhận thành tích, định hướng cho quý tiếp theo..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Kế hoạch phát triển cá nhân (IDP)</label>
              <textarea
                rows={2}
                value={developmentPlan}
                onChange={(e) => setDevelopmentPlan(e.target.value)}
                placeholder="Các khóa học được cử đi tham gia, dự án thử thách mới..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors"
            >
              Lưu & Ban Hành Kết Quả
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
