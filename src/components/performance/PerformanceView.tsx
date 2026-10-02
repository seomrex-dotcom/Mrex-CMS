import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PerformanceReview, OKRObjective } from '../../types';
import {
  TrendingUp,
  Shield,
  Lock,
  UserCheck,
  Target,
  Award,
  Plus,
  Edit3,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { NewReviewModal } from './NewReviewModal';

export const PerformanceView: React.FC = () => {
  const {
    reviews,
    okrs,
    employees,
    departments,
    currentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'reviews' | 'okrs'>('reviews');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Q3/2026');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState<PerformanceReview | null>(null);

  const filteredReviews = reviews.filter(r => r.period === selectedPeriod);

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'A_PLUS':
        return { text: 'Xuất sắc (A+)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'A':
        return { text: 'Tốt (A)', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
      case 'B':
        return { text: 'Đạt yêu cầu (B)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
      default:
        return { text: 'Cần nỗ lực (C)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    }
  };

  const isCEO = currentUser.role === 'CEO';
  const isManager = currentUser.role === 'MANAGER' || departments.some(d => d.managerId === currentUser.id);
  const isEmployee = currentUser.role === 'EMPLOYEE';

  const managedDept = departments.find(d => d.managerId === currentUser.id) || departments.find(d => d.id === currentUser.departmentId);
  const managedDeptId = managedDept?.id || currentUser.departmentId;

  // Thẩm quyền lập phiếu:
  // - Ban Giám Đốc (CEO): Toàn quyền đánh giá toàn bộ nhân sự công ty
  // - Trưởng bộ phận: Chỉ có quyền đánh giá nhân viên thuộc bộ phận đó
  const canCreate = isCEO || isManager;

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            Đánh Giá Hiệu Suất & Quản Trị Mục Tiêu KPI/OKR
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Thiết lập mục tiêu trọng tâm quý, đánh giá năng lực 360° và lập lộ trình phát triển nhân tài (IDP)
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 sm:pb-0">
          {/* Subtabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs shrink-0">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors min-h-[38px] ${
                activeTab === 'reviews'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Đánh Giá</span>
            </button>
            <button
              onClick={() => setActiveTab('okrs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors min-h-[38px] ${
                activeTab === 'okrs'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Mục Tiêu OKR</span>
            </button>
          </div>

          {canCreate && activeTab === 'reviews' ? (
            <button
              onClick={() => {
                setEditingReview(null);
                setShowReviewModal(true);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors shrink-0 min-h-[44px] cursor-pointer"
              title={isCEO ? 'Ban Giám Đốc đánh giá toàn bộ nhân sự' : `Lập phiếu đánh giá nhân viên thuộc ${managedDept?.name}`}
            >
              <Plus className="w-4 h-4" />
              <span>{isCEO ? '+ Lập Phiếu Đánh Giá' : `+ Đánh Giá KPI (${managedDept?.code || 'Bộ Phận'})`}</span>
            </button>
          ) : isEmployee && activeTab === 'reviews' ? (
            <div className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-500 bg-slate-100 rounded-lg border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Cấp Nhân Viên (Xem KPI)</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Permission & Scope Banner */}
      {activeTab === 'reviews' && (
        <div className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
          isCEO
            ? 'bg-gradient-to-r from-indigo-50/90 via-blue-50/60 to-white border-indigo-200 text-indigo-950'
            : isManager
            ? 'bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-white border-emerald-200 text-emerald-950'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 ${
              isCEO ? 'bg-indigo-600 text-white' : isManager ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold flex items-center gap-2">
                <span>{isCEO ? '👑 Ban Giám Đốc (CEO)' : isManager ? `🛡️ Trưởng Bộ Phận: ${managedDept?.name}` : '👤 Cấp Nhân Viên'}</span>
                <span className={`px-2 py-0.2 text-[10px] font-bold rounded-full border ${
                  isCEO
                    ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                    : isManager
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}>
                  {isCEO ? 'Toàn quyền đánh giá toàn bộ' : isManager ? `Phạm vi: ${managedDept?.name}` : 'Chỉ xem kết quả cá nhân'}
                </span>
              </div>
              <p className="text-[11px] opacity-85 mt-0.5">
                {isCEO
                  ? 'Ban Giám Đốc có thẩm quyền đánh giá, hiệu chỉnh và phê duyệt toàn bộ nhân viên các phòng ban trong công ty.'
                  : isManager
                  ? `Chỉ có quyền đánh giá và sửa phiếu của nhân viên thuộc ${managedDept?.name}. Nhân sự phòng ban khác do Trưởng phòng tương ứng & Ban Giám Đốc quản lý.`
                  : 'Theo dõi chỉ số KPI năng lực cá nhân và phản hồi từ Trưởng bộ phận & Ban Giám Đốc.'}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[11px] text-slate-500 font-medium">
              Kỳ đánh giá: <strong className="text-slate-900 font-mono">{selectedPeriod}</strong>
            </span>
          </div>
        </div>
      )}

      {activeTab === 'reviews' ? (
        /* Performance Reviews List View */
        <div className="space-y-6">
          {/* Period selector & Summary stat chips */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl text-xs shadow-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700">Kỳ đánh giá:</span>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  onClick={() => setSelectedPeriod('Q3/2026')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    selectedPeriod === 'Q3/2026' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Quý 3/2026
                </button>
                <button
                  onClick={() => setSelectedPeriod('Q4/2026')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    selectedPeriod === 'Q4/2026' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Quý 4/2026
                </button>
                <button
                  onClick={() => setSelectedPeriod('2026-Annual')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    selectedPeriod === '2026-Annual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Cả năm 2026
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-slate-500">
                Tổng đã duyệt: <span className="font-bold text-slate-900">{filteredReviews.length} nhân sự</span>
              </div>
              <div className="text-slate-500">
                Điểm trung bình kỳ: <span className="font-bold text-indigo-600">
                  {filteredReviews.length > 0
                    ? (filteredReviews.reduce((sum, r) => sum + r.managerScoreTotal, 0) / filteredReviews.length).toFixed(2)
                    : 0}/5.0
                </span>
              </div>
            </div>
          </div>

          {/* Review cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredReviews.map(rev => {
              const emp = employees.find(e => e.id === rev.employeeId);
              const reviewer = employees.find(e => e.id === rev.reviewerId);
              const dept = departments.find(d => d.id === emp?.departmentId);
              const ratingInfo = getRatingBadge(rev.finalRating);

              return (
                <div
                  key={rev.id}
                  className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-5 shadow-xs transition-all space-y-4"
                >
                  {/* Card top */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={emp?.avatar}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-lg object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{emp?.name}</div>
                        <div className="text-[11px] text-slate-500">{emp?.roleTitle} · {dept?.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Mã NV: {emp?.code}</div>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="font-semibold text-xs text-indigo-700">
                        {ratingInfo.text}
                      </div>
                      <div className="font-mono text-xs">
                        <span className="text-slate-400 text-[10px]">Quản lý chấm: </span>
                        <span className="font-bold text-slate-900 text-sm">{rev.managerScoreTotal}</span>
                        <span className="text-slate-400 text-[10px]">/5.0</span>
                      </div>
                    </div>
                  </div>

                  {/* Criteria score bars */}
                  <div className="space-y-1.5 py-1">
                    {rev.criteria.map(cr => (
                      <div key={cr.id} className="text-xs">
                        <div className="flex items-center justify-between text-[11px] text-slate-600 mb-0.5">
                          <span className="truncate max-w-[240px]">{cr.name}</span>
                          <span className="font-mono text-slate-800 tabular-nums">
                            {cr.managerScore}/5.0 ({cr.weight}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${(cr.managerScore / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Feedback quotes */}
                  <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {rev.employeeStrengths && (
                      <div>
                        <span className="font-semibold text-slate-700">Điểm mạnh: </span>
                        <span className="text-slate-600">{rev.employeeStrengths}</span>
                      </div>
                    )}
                    {rev.managerFeedback && (
                      <div>
                        <span className="font-semibold text-slate-700">Nhận xét Quản lý: </span>
                        <span className="text-slate-600 italic">"{rev.managerFeedback}"</span>
                      </div>
                    )}
                    {rev.developmentPlan && (
                      <div className="pt-1 border-t border-slate-200/60 flex items-start gap-1.5 text-indigo-900">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">Lộ trình đào tạo (IDP): </span>
                          <span>{rev.developmentPlan}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer metadata & edit */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    <div>
                      <span>Đánh giá bởi: {reviewer?.name || 'Ban Điều Hành'}</span>
                      <span className="mx-1">·</span>
                      <span className="font-mono">{rev.updatedAt.slice(0, 10)}</span>
                    </div>

                    {(() => {
                      const canEditThisReview = isCEO || (isManager && emp?.departmentId === managedDeptId);
                      if (canEditThisReview) {
                        return (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReview(rev);
                              setShowReviewModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer hover:underline text-xs"
                            title={isCEO ? 'Ban Giám Đốc có quyền sửa' : `Trưởng phòng ${dept?.name} có quyền sửa`}
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Sửa phiếu</span>
                          </button>
                        );
                      }
                      return (
                        <span className="text-[10.5px] text-slate-400 italic">
                          {isManager ? `Chỉ xem (Thuộc ${dept?.name || 'Khối khác'})` : 'Đã duyệt'}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* OKR Objectives View */
        <div className="space-y-4">
          <div className="text-xs text-slate-500 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Mục tiêu then chốt (Objectives) & Kết quả then chốt (Key Results) theo từng khối ban</span>
            <span className="font-mono">Kỳ báo cáo: Quý 3/2026</span>
          </div>

          <div className="space-y-4">
            {okrs.map(okr => {
              const dept = departments.find(d => d.id === okr.departmentId);
              return (
                <div
                  key={okr.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-indigo-600">{dept?.name}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-mono text-slate-500">{okr.quarter}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-mono text-slate-500">Trọng số {okr.weight}%</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{okr.title}</h3>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold font-mono text-indigo-600 tabular-nums">
                        {okr.progress}%
                      </div>
                      <div className="text-[11px] text-slate-400">Tiến độ tổng thể</div>
                    </div>
                  </div>

                  {/* Key results sub-table */}
                  <div className="space-y-3">
                    {okr.keyResults.map(kr => (
                      <div key={kr.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-800">{kr.description}</span>
                          <span className="font-mono font-semibold text-slate-900 tabular-nums">
                            {kr.currentValue} / {kr.targetValue} {kr.unit} ({kr.progress}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              kr.progress >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${Math.min(kr.progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review Modal */}
      <NewReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setEditingReview(null);
        }}
        existingReview={editingReview}
      />
    </div>
  );
};
