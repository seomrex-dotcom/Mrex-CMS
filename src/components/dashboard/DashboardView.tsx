import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp, TrendingDown, DollarSign, Users, AlertTriangle,
  CheckCircle2, Clock, ArrowRight, Plus, Megaphone,
  Building2, Target, BarChart3, Activity, FileText,
  ChevronRight, Palette, Calendar, Receipt, UserCheck, Briefcase,
  Sparkles, Layers, Zap, Download
} from 'lucide-react';
import { OnlineAndTasksWidget } from './OnlineAndTasksWidget';
import { BoardBrandSettingsModal } from '../board/BoardBrandSettingsModal';

const fmtVND = (n: number) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' Tỷ ₫';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + ' Tr ₫';
  return n.toLocaleString('vi-VN') + ' ₫';
};

/* Interactive SVG Sparkline from Template */
const Sparkline: React.FC<{ data: number[]; color?: string }> = ({ data, color = '#0875D9' }) => {
  if (!data || data.length < 2) return null;
  const w = 84, h = 30;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * w, y: h - ((v - min) / range) * h * 0.75 - 4 }));
  const linePath = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p.x + ',' + p.y).join(' ');
  const areaPath = linePath + ' L' + w + ',' + h + ' L0,' + h + ' Z';
  const gradId = 'spk-' + Math.random().toString(36).substr(2, 6);

  return (
    <svg width={w} height={h} viewBox={'0 0 ' + w + ' ' + h} className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="3" fill={color} />
    </svg>
  );
};

/* Glassmorphism KPI Card from Template */
const KPICard: React.FC<{
  label: string; value: string; delta: string; deltaLabel: string;
  positive: boolean; sparkData: number[]; color: string;
  gradientBg: string;
  icon: React.ReactNode; onClick?: () => void;
}> = ({ label, value, delta, deltaLabel, positive, sparkData, color, gradientBg, icon, onClick }) => (
  <div
    onClick={onClick}
    className={'glass-card glass-card-hover rounded-2xl p-5 border border-white/80 transition-all duration-200 group ' + (onClick ? 'cursor-pointer' : '')}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
          style={{ background: gradientBg }}
        >
          {icon}
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 block">{label}</span>
          <span className="text-[10.5px] text-slate-400 font-medium">Theo dõi thời gian thực</span>
        </div>
      </div>
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
          positive
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
            : 'bg-amber-50 text-amber-700 border-amber-200/60'
        }`}
      >
        {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {delta}
      </span>
    </div>

    <div className="flex items-baseline justify-between mt-2">
      <div className="font-extrabold text-[#172B45] text-2xl font-mono tracking-tight">{value}</div>
      <Sparkline data={sparkData} color={color} />
    </div>

    <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between pt-2 border-t border-slate-100">
      <span>{deltaLabel}</span>
      {onClick && (
        <span className="text-[#0875D9] font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
          Chi tiết <ChevronRight className="w-3 h-3" />
        </span>
      )}
    </div>
  </div>
);

/* Modern Glass Waterfall Cash Flow */
const WaterfallChart: React.FC<{ items: { label: string; value: number; type: 'in' | 'out' | 'total' }[] }> = ({ items }) => {
  const maxAbs = Math.max(...items.map(i => Math.abs(i.value)));
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => {
        const pct = (Math.abs(item.value) / maxAbs) * 100;
        const isIn = item.type === 'in', isTotal = item.type === 'total';
        const color = isTotal ? '#0875D9' : isIn ? '#16C784' : '#EF5350';
        const bg = isTotal
          ? 'bg-gradient-to-r from-blue-50/90 to-sky-50/70 border-[#0875D9]/25 mt-3 pt-3 shadow-xs'
          : isIn
          ? 'bg-emerald-50/60 border-emerald-100/80'
          : 'bg-rose-50/60 border-rose-100/80';
        return (
          <div key={i} className={'rounded-xl p-3 border transition-all hover:bg-white/80 ' + bg}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 text-xs">{item.label}</span>
              <span className="font-mono font-bold text-xs" style={{ color }}>
                {isIn ? '+' : isTotal ? '' : '-'}{fmtVND(Math.abs(item.value))}
              </span>
            </div>
            <div className="h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: pct + '%', background: color, opacity: 0.9 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* Executive Revenue Chart with Glassmorphism Bézier Spline from Template */
const RevenueChart: React.FC<{ data2026: number[]; data2025: number[]; labels: string[] }> = ({ data2026, data2025, labels }) => {
  const [hov, setHov] = useState<number | null>(null);
  const W = 1000, H = 220, months = labels.length;
  const maxV = Math.max(...data2026, ...data2025) * 1.15;

  const toXY = (vals: number[]) =>
    vals.map((v, i) => ({
      x: 60 + (i / (months - 1)) * (W - 100),
      y: H - (v / maxV) * (H * 0.75) - 25
    }));

  const pts26 = toXY(data2026), pts25 = toXY(data2025);

  // Generate smooth cubic bezier path
  const makeSmoothCurve = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i < points.length - 2 ? points[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const line26 = makeSmoothCurve(pts26);
  const line25 = makeSmoothCurve(pts25);
  const area26 = line26 + ` L ${pts26[pts26.length - 1].x} ${H - 10} L ${pts26[0].x} ${H - 10} Z`;

  const yLabels = [maxV, maxV * 0.66, maxV * 0.33, 0];

  return (
    <div className="relative pt-2">
      <div className="relative" onMouseLeave={() => setHov(null)}>
        <svg
          viewBox={`0 0 ${W} ${H + 20}`}
          className="w-full overflow-visible"
          style={{ height: '220px' }}
        >
          <defs>
            <linearGradient id="execChartAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0875D9" stopOpacity="0.28" />
              <stop offset="70%" stopColor="#39A9FF" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#39A9FF" stopOpacity="0.0" />
            </linearGradient>
            <filter id="execLineGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#0875D9" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((p, idx) => (
            <line
              key={idx}
              x1="50"
              y1={H - p * (H * 0.75) - 25}
              x2={W - 30}
              y2={H - p * (H * 0.75) - 25}
              stroke="rgba(8,117,217,0.06)"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          ))}
          <line x1="50" y1={H - 10} x2={W - 30} y2={H - 10} stroke="rgba(8,117,217,0.12)" strokeWidth="1.5" />

          {/* 2025 Target line */}
          <path d={line25} fill="none" stroke="#39A9FF" strokeWidth="2" strokeDasharray="5 5" opacity="0.6" />

          {/* 2026 Area fill */}
          <path d={area26} fill="url(#execChartAreaGrad)" />

          {/* 2026 Main stroke line */}
          <path d={line26} fill="none" stroke="#0875D9" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#execLineGlow)" />

          {/* Interactive hover tracking */}
          {pts26.map((p, i) => (
            <g key={i} onMouseEnter={() => setHov(i)} style={{ cursor: 'pointer' }}>
              <rect x={p.x - 20} y={0} width={40} height={H + 20} fill="transparent" />
              {hov === i ? (
                <>
                  <line x1={p.x} y1={20} x2={p.x} y2={H - 10} stroke="#0875D9" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
                  <circle cx={p.x} cy={p.y} r="6" fill="#0875D9" stroke="white" strokeWidth="3" />
                  <circle cx={pts25[i].x} cy={pts25[i].y} r="4" fill="#39A9FF" stroke="white" strokeWidth="2" />
                </>
              ) : (
                <circle cx={p.x} cy={p.y} r="3.5" fill="white" stroke="#0875D9" strokeWidth="2" />
              )}
            </g>
          ))}

          {/* X Axis Labels */}
          {labels.map((l, i) => (
            <text
              key={i}
              x={pts26[i].x}
              y={H + 12}
              textAnchor="middle"
              fill={hov === i ? '#0875D9' : '#64748B'}
              fontSize="11"
              fontWeight={hov === i ? '700' : '600'}
            >
              {l}
            </text>
          ))}
        </svg>

        {/* Dynamic Tooltip from Template */}
        {hov !== null && (
          <div
            className="absolute top-2 bg-white/95 backdrop-blur-xl border border-white/90 shadow-[0_12px_32px_rgba(8,117,217,0.2)] rounded-2xl p-3 z-20 pointer-events-none transition-all"
            style={{
              left: `${(pts26[hov].x / W) * 100}%`,
              transform: 'translate(-50%, -10px)'
            }}
          >
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Tháng {labels[hov]} / 2026
            </div>
            <div className="text-sm font-extrabold text-[#0875D9] font-mono">
              2026: {fmtVND(data2026[hov])}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              2025: {fmtVND(data2025[hov])}
            </div>
            <div className={'mt-1 text-[11px] font-bold flex items-center gap-1 ' + (data2026[hov] >= data2025[hov] ? 'text-emerald-600' : 'text-rose-500')}>
              {data2026[hov] >= data2025[hov] ? '↑ +' : '↓ -'}
              {Math.abs(Math.round(((data2026[hov] - data2025[hov]) / data2025[hov]) * 100))}% YoY
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer Summary Metrics from Template */}
      <div className="grid grid-cols-3 gap-3 pt-3 mt-3 border-t border-slate-100">
        <div>
          <span className="text-[11px] text-slate-400 font-medium block">Doanh Thu Đỉnh</span>
          <span className="text-sm font-bold text-[#172B45] font-mono">
            {fmtVND(Math.max(...data2026))} <span className="text-[10.5px] text-emerald-600 font-semibold">(T10)</span>
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 font-medium block">Doanh Thu Bình Quân</span>
          <span className="text-sm font-bold text-[#172B45] font-mono">
            {fmtVND(data2026.reduce((a, b) => a + b, 0) / data2026.length)}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 font-medium block">Tăng Trưởng Lũy Kế</span>
          <span className="text-sm font-bold text-[#0875D9] font-mono">
            +24% YoY <span className="text-[10.5px] text-emerald-600 font-semibold">(Đạt chỉ tiêu)</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export const DashboardView: React.FC = () => {
  const {
    currentUser, setActiveTab, todayAttendance, checkIn, checkOut,
    tasks, vouchers, employees, attendanceRecords, announcements,
    contracts, payrollRecords, departments, celebrate, budgetApprovals
  } = useApp();

  const isExec = currentUser.role === 'CEO' || currentUser.role === 'MANAGER';
  const [isBrandOpen, setIsBrandOpen] = useState(false);

  // Live Clock State from Template
  const [liveTime, setLiveTime] = useState('');
  const [liveDate, setLiveDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setLiveDate(now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalReceipts = useMemo(() => vouchers.filter(v => v.type === 'RECEIPT').reduce((s, v) => s + v.amountVND, 0), [vouchers]);
  const totalPayments = useMemo(() => vouchers.filter(v => v.type === 'PAYMENT').reduce((s, v) => s + v.amountVND, 0), [vouchers]);
  const totalPayroll  = useMemo(() => payrollRecords.reduce((s, r) => s + r.netSalaryVND, 0), [payrollRecords]);
  const netCash = totalReceipts - totalPayments;

  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const taskRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const activeEmp = employees.filter(e => e.status === 'ACTIVE').length;
  const pendingContracts = contracts.filter(c => c.status === 'ACTIVE' || c.status === 'PENDING_PAYMENT').length;
  const totalContractVal = contracts.reduce((s, c) => s + c.totalValueVND, 0);
  const totalCollected = contracts.reduce((s, c) => s + c.collectedVND, 0);
  const pendingBudgets = budgetApprovals.filter(b => b.status === 'PENDING').length;

  const myTasks = useMemo(() => tasks.filter(t => t.assigneeId === currentUser.id || Boolean(t.assigneeIds && t.assigneeIds.includes(currentUser.id))), [tasks, currentUser.id]);
  const myDone  = myTasks.filter(t => t.status === 'COMPLETED').length;
  const myKpi   = myTasks.length > 0 ? Math.round((myDone / myTasks.length) * 100) : 0;
  const myAtt   = useMemo(() => attendanceRecords.filter(r => r.employeeId === currentUser.id), [attendanceRecords, currentUser.id]);
  const onTimeDays = myAtt.filter(r => r.status === 'ON_TIME').length;

  const revSpark = [1.8, 2.0, 1.7, 2.2, 2.1, 2.5, 2.3, 2.4].map(v => v * 1e9);
  const empSpark = [980, 1050, 1100, 1150, 1200, 1230, 1270, activeEmp];
  const taskSpark = [70, 74, 78, 80, 83, 85, 86, taskRate];

  const chartMonths = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10'];
  const rev26 = [1.6, 1.8, 1.7, 2.0, 2.1, 2.2, 2.4, 2.1, 2.3, 2.4].map(v => v * 1e9);
  const rev25 = [1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.8, 2.0].map(v => v * 1e9);

  const cashItems = [
    { label: 'Thu từ hợp đồng & dịch vụ', value: totalReceipts, type: 'in' as const },
    { label: 'Chi phí nhân sự & lương', value: totalPayroll, type: 'out' as const },
    { label: 'Chi phí vận hành & mua sắm', value: Math.max(totalPayments - totalPayroll, 0), type: 'out' as const },
    { label: 'Lợi nhuận ròng tháng này', value: Math.abs(netCash), type: 'total' as const },
  ];

  const deptStats = departments.map(d => {
    const count = employees.filter(e => e.departmentId === d.id).length;
    const dTasks = tasks.filter(t => t.departmentId === d.id);
    const rate = dTasks.length > 0 ? Math.round((dTasks.filter(t => t.status === 'COMPLETED').length / dTasks.length) * 100) : 0;
    return { ...d, count, rate };
  });

  const recentTasks = [...tasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const recentAnns  = announcements.slice(0, 3);

  const quickActions = [
    { label: 'Thêm Việc', icon: <Plus className="w-3.5 h-3.5" />, tab: 'tasks', color: '#0875D9' },
    { label: 'Tạo Phiếu', icon: <Receipt className="w-3.5 h-3.5" />, tab: 'finance', color: '#16C784' },
    { label: 'Thêm NV', icon: <UserCheck className="w-3.5 h-3.5" />, tab: 'employees', color: '#39A9FF' },
    { label: 'Thông Báo', icon: <Megaphone className="w-3.5 h-3.5" />, tab: 'announcements', color: '#F5B942' },
    { label: 'Hợp Đồng', icon: <FileText className="w-3.5 h-3.5" />, tab: 'board', color: '#8B5CF6' },
    { label: 'Cơ Cấu PB', icon: <Building2 className="w-3.5 h-3.5" />, tab: 'board', color: '#063B78' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* ============================================================
           EXECUTIVE WELCOME BANNER (Glassmorphism Template)
           ============================================================ */}
      <section className="glass-card rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5 border border-white/80 shadow-[0_12px_36px_rgba(30,90,150,0.08)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <span>Platform</span>
            <span>/</span>
            <span className="text-[#0875D9]">Executive Overview</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-bold text-[10px] ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live Sync Active
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#063B78] tracking-tight flex items-center gap-2">
            <span>Xin chào, {currentUser.name}</span>
            <span className="inline-block animate-[waveHand_2s_infinite]">✨</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            {isExec
              ? 'Tất cả các chỉ số tài chính, tiến độ dự án và hiệu suất nhân sự đang tăng trưởng mạnh mẽ trong quý này.'
              : 'Theo dõi chỉ số KPI cá nhân, tiến độ công việc được giao và lịch làm việc của bạn hôm nay.'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Realtime Clock Widget from Template */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs backdrop-blur-md">
            <Clock className="w-5 h-5 text-[#0875D9] shrink-0" />
            <div className="flex flex-col">
              <span className="font-mono font-extrabold text-sm text-[#063B78] leading-tight">{liveTime || '11:05:00'}</span>
              <span className="text-[10.5px] text-slate-400 font-medium">{liveDate || 'Hôm nay'}</span>
            </div>
          </div>

          {/* Quick Attendance Check-in */}
          {!todayAttendance?.checkIn ? (
            <button
              onClick={() => { checkIn('OFFICE', 'Chấm công nhanh'); celebrate(); }}
              className="px-4 py-2.5 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #0875D9 0%, #39A9FF 100%)' }}
            >
              <Clock className="w-4 h-4" /> Chấm Công Vào Ca
            </button>
          ) : !todayAttendance?.checkOut ? (
            <button
              onClick={() => { checkOut('Kết thúc ca'); celebrate(); }}
              className="px-4 py-2.5 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #0875D9 0%, #39A9FF 100%)' }}
            >
              <CheckCircle2 className="w-4 h-4" /> Chấm Công Ra Ca
            </button>
          ) : (
            <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Đã Chấm Công
            </div>
          )}

          {currentUser.role === 'CEO' && (
            <button
              onClick={() => setIsBrandOpen(true)}
              className="px-3.5 py-2.5 bg-white/80 border border-slate-200/80 text-slate-700 text-xs font-semibold rounded-xl hover:bg-white shadow-xs flex items-center gap-1.5 cursor-pointer backdrop-blur-md transition-all hover:-translate-y-0.5"
            >
              <Palette className="w-4 h-4 text-[#0875D9]" /> Thương Hiệu
            </button>
          )}
        </div>
      </section>

      {/* ============================================================
           4 KPI STATISTIC CARDS (Glassmorphism Template)
           ============================================================ */}
      {isExec ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <KPICard
            label="Doanh Thu Tháng"
            value={fmtVND(totalReceipts)}
            delta="+14.2%"
            deltaLabel="so với tháng trước"
            positive={true}
            sparkData={revSpark}
            color="#0875D9"
            gradientBg="linear-gradient(135deg, #0875D9 0%, #39A9FF 100%)"
            icon={<DollarSign className="w-5 h-5" />}
            onClick={() => setActiveTab('finance')}
          />
          <KPICard
            label="Nhân Viên Hoạt Động"
            value={String(activeEmp)}
            delta="+2 mới"
            deltaLabel="nhân sự tháng này"
            positive={true}
            sparkData={empSpark}
            color="#00A3FF"
            gradientBg="linear-gradient(135deg, #00A3FF 0%, #0066FF 100%)"
            icon={<Users className="w-5 h-5" />}
            onClick={() => setActiveTab('employees')}
          />
          <KPICard
            label="Hoàn Thành Nhiệm Vụ"
            value={taskRate + '%'}
            delta="+3.1%"
            deltaLabel="tỷ lệ hoàn thành đúng hạn"
            positive={true}
            sparkData={taskSpark}
            color="#16C784"
            gradientBg="linear-gradient(135deg, #10B981 0%, #059669 100%)"
            icon={<CheckCircle2 className="w-5 h-5" />}
            onClick={() => setActiveTab('tasks')}
          />
          <KPICard
            label="Hợp Đồng Đang Chạy"
            value={String(pendingContracts)}
            delta={fmtVND(totalContractVal - totalCollected)}
            deltaLabel="công nợ cần thu hồi"
            positive={false}
            sparkData={[3, 4, 5, 4, 6, 5, 7, pendingContracts]}
            color="#8B5CF6"
            gradientBg="linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)"
            icon={<Briefcase className="w-5 h-5" />}
            onClick={() => setActiveTab('board')}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <KPICard
            label="KPI Cá Nhân"
            value={myKpi + '%'}
            delta="+5.2%"
            deltaLabel="hiệu suất làm việc"
            positive={true}
            sparkData={[70, 74, 78, 80, 83, 85, 86, myKpi]}
            color="#0875D9"
            gradientBg="linear-gradient(135deg, #0875D9 0%, #39A9FF 100%)"
            icon={<Target className="w-5 h-5" />}
          />
          <KPICard
            label="Nhiệm Vụ Của Tôi"
            value={String(myTasks.length)}
            delta={myDone + ' xong'}
            deltaLabel="đã hoàn tất"
            positive={true}
            sparkData={[2, 3, 4, 3, 5, 4, 6, myTasks.length]}
            color="#16C784"
            gradientBg="linear-gradient(135deg, #10B981 0%, #059669 100%)"
            icon={<CheckCircle2 className="w-5 h-5" />}
            onClick={() => setActiveTab('tasks')}
          />
          <KPICard
            label="Ngày Đúng Giờ"
            value={onTimeDays + '/24'}
            delta={Math.round((onTimeDays / 24) * 100) + '%'}
            deltaLabel="chuẩn 24 ngày (T7 xen kẽ)"
            positive={onTimeDays >= 22}
            sparkData={[18, 19, 20, 20, 21, 21, 22, onTimeDays]}
            color="#8B5CF6"
            gradientBg="linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)"
            icon={<Calendar className="w-5 h-5" />}
            onClick={() => setActiveTab('attendance')}
          />
          <KPICard
            label="Thông Báo Mới"
            value={String(announcements.length)}
            delta="Hôm nay"
            deltaLabel="bảng tin nội bộ"
            positive={true}
            sparkData={[1, 2, 1, 3, 2, 4, 3, announcements.length]}
            color="#F5B942"
            gradientBg="linear-gradient(135deg, #F5B942 0%, #D97706 100%)"
            icon={<Megaphone className="w-5 h-5" />}
            onClick={() => setActiveTab('announcements')}
          />
        </div>
      )}

      {/* ============================================================
           MAIN ANALYTICS CHART & ACTIVITY FEED
           ============================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-5">
        {isExec && (
          <div className="xl:col-span-2 glass-card rounded-2xl p-4 sm:p-6 border border-white/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-[#063B78] text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#0875D9]" />
                  Xu Hướng Doanh Thu Doanh Nghiệp 2026
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mô hình dòng doanh thu so với cùng kỳ 2025 — rê chuột để xem chi tiết
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-[#0875D9] font-bold">
                  <span className="w-5 h-1 bg-[#0875D9] rounded-full inline-block" /> 2026
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-5 inline-block border-t-2 border-dashed border-[#39A9FF]" /> 2025
                </span>
              </div>
            </div>
            <RevenueChart data2026={rev26} data2025={rev25} labels={chartMonths} />
          </div>
        )}

        {/* Activity Feed from Template */}
        <div className={'glass-card rounded-2xl p-4 sm:p-6 border border-white/80 shadow-xs flex flex-col' + (!isExec ? ' xl:col-span-3' : '')}>
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-[#063B78] text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#16C784]" />
              Hoạt Động Gần Đây
            </h3>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs font-bold text-[#0875D9] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Tất cả <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[280px] divide-y divide-slate-100/80 my-2">
            {recentTasks.map(task => {
              const emp = employees.find(e => e.id === task.assigneeId);
              const dept = departments.find(d => d.id === task.departmentId);
              const stColor =
                task.status === 'COMPLETED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                  : task.status === 'IN_PROGRESS'
                  ? 'bg-blue-50 text-[#0875D9] border-blue-200/60'
                  : task.status === 'REVIEW'
                  ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                  : 'bg-slate-100 text-slate-500';
              const stLabel =
                task.status === 'COMPLETED'
                  ? 'Hoàn thành'
                  : task.status === 'IN_PROGRESS'
                  ? 'Đang làm'
                  : task.status === 'REVIEW'
                  ? 'Đang duyệt'
                  : 'Chờ xử lý';

              return (
                <div
                  key={task.id}
                  className="py-3 px-1 hover:bg-white/90 rounded-xl transition-colors cursor-pointer"
                  onClick={() => setActiveTab('tasks')}
                >
                  <div className="flex items-start gap-2.5">
                    {emp?.avatar ? (
                      <img src={emp.avatar} alt="" className="w-7 h-7 rounded-full object-cover mt-0.5 shrink-0 ring-1 ring-slate-200" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#0875D9]/15 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-[#0875D9]">
                        {emp?.name?.[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 line-clamp-1">{task.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {dept && (
                          <>
                            <span className="text-[10px] text-slate-400">{dept.name}</span>
                            <span className="text-[10px] text-slate-300">·</span>
                          </>
                        )}
                        <span className="text-[10px] text-slate-400">{emp?.name || 'Chưa gán'}</span>
                      </div>
                    </div>
                    <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ' + stColor}>
                      {stLabel}
                    </span>
                  </div>
                </div>
              );
            })}

            {recentTasks.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400">Chưa có nhiệm vụ mới nào</div>
            )}
          </div>

          {recentAnns.length > 0 && (
            <div className="p-3 bg-gradient-to-r from-blue-50/60 to-sky-50/40 border border-[#0875D9]/15 rounded-xl mt-auto">
              <div className="text-[10px] font-bold text-[#0875D9] uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5 text-[#0875D9]" /> Thông Báo Mới Nhất
              </div>
              <div className="space-y-1">
                {recentAnns.slice(0, 2).map(ann => (
                  <div
                    key={ann.id}
                    className="flex items-center justify-between text-xs cursor-pointer hover:text-[#0875D9]"
                    onClick={() => setActiveTab('announcements')}
                  >
                    <span className="truncate max-w-[200px] text-slate-700 font-medium">{ann.title}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{ann.publishedAt?.slice(5, 10)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
           SECONDARY GRID: CASH FLOW + DEPT PERFORMANCE + QUICK ACTIONS
           ============================================================ */}
      {isExec && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-5">
          {/* Cash Flow */}
          <div className="glass-card rounded-2xl p-4 sm:p-6 border border-white/80 shadow-xs">
            <h3 className="font-bold text-[#063B78] text-sm mb-4 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#16C784]" /> Dòng Tiền Thu - Chi Tháng Này
            </h3>
            <WaterfallChart items={cashItems} />
            <button
              onClick={() => setActiveTab('finance')}
              className="mt-4 w-full text-xs font-bold text-[#0875D9] border border-[#0875D9]/25 rounded-xl py-2 hover:bg-[#0875D9]/10 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              Xem sổ quỹ chi tiết <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dept Performance */}
          <div className="glass-card rounded-2xl p-4 sm:p-6 border border-white/80 shadow-xs">
            <h3 className="font-bold text-[#063B78] text-sm mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#0875D9]" /> Hiệu Suất Từng Phòng Ban
            </h3>
            <div className="space-y-3.5">
              {deptStats.map(d => {
                const rColor = d.rate >= 90 ? '#16C784' : d.rate >= 70 ? '#F5B942' : '#EF5350';
                return (
                  <div key={d.id}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color || '#0875D9' }} />
                        <span className="font-semibold text-slate-700 text-xs truncate max-w-[130px]">{d.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400">{d.count} NV</span>
                        <span className="font-bold font-mono" style={{ color: rColor }}>{d.rate}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: d.rate + '%', background: rColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setActiveTab('workload')}
              className="mt-4 w-full text-xs font-bold text-[#0875D9] border border-[#0875D9]/25 rounded-xl py-2 hover:bg-[#0875D9]/10 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              Phân tích điều phối công việc <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Actions + Alerts */}
          <div className="space-y-4">
            {pendingBudgets > 0 && (
              <div
                className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:bg-amber-100 transition-colors shadow-xs"
                onClick={() => setActiveTab('board')}
              >
                <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-amber-900">{pendingBudgets} Ngân Sách Chờ Duyệt</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">Cần CEO phê duyệt</p>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-500 shrink-0" />
              </div>
            )}

            <div className="glass-card rounded-2xl p-5 border border-white/80 shadow-xs">
              <h3 className="font-bold text-[#063B78] text-xs mb-3 uppercase tracking-wide">
                Thao Tác Nhanh
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {quickActions.map(a => (
                  <button
                    key={a.label}
                    onClick={() => setActiveTab(a.tab as any)}
                    className="flex items-center gap-2 p-2.5 bg-white/70 hover:bg-white border border-slate-200/70 rounded-xl text-xs font-semibold text-slate-700 transition-all hover:border-[#0875D9]/40 hover:-translate-y-0.5 text-left cursor-pointer shadow-xs"
                  >
                    <span style={{ color: a.color }}>{a.icon}</span>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {recentAnns[0] && (
              <div
                className="rounded-2xl p-4 text-white cursor-pointer hover:brightness-105 transition-all shadow-md"
                style={{ background: 'linear-gradient(135deg, #063B78 0%, #0875D9 100%)' }}
                onClick={() => setActiveTab('announcements')}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Megaphone className="w-3.5 h-3.5 text-blue-200" />
                  <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wide">Bản Tin Chiến Lược</span>
                </div>
                <p className="text-sm font-bold line-clamp-2">{recentAnns[0].title}</p>
                <p className="text-[11px] text-blue-100/80 mt-1">
                  {recentAnns[0].authorName} · {recentAnns[0].publishedAt?.slice(0, 10)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Non-exec View (Personal KPI & Attendance & Online/Tasks) - 3D Glass Cards */}
      {!isExec && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* CARD 1: XẾP LOẠI HIỆU SUẤT / KPI - Pinterest 3D Glass */}
          <div
            className="relative overflow-hidden rounded-3xl p-5 border border-blue-200/70 shadow-lg shadow-blue-500/5 backdrop-blur-xl flex flex-col justify-between transition-all hover:shadow-xl hover:-translate-y-0.5 group"
            style={{
              background: 'linear-gradient(145deg, rgba(238, 246, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 50%, rgba(240, 246, 255, 0.9) 100%)'
            }}
          >
            {/* Ambient Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/15 rounded-full blur-2xl pointer-events-none" />

            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-blue-100/80">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0875D9]" />
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Hiệu Suất Cá Nhân
                  </span>
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0875D9]/12 text-[#0875D9] border border-[#0875D9]/25">
                  Hạng {myKpi >= 90 ? 'A+' : myKpi >= 80 ? 'A' : myKpi >= 70 ? 'B' : 'C'}
                </span>
              </div>

              {/* Main Content with 3D Glass Icon */}
              <div className="my-4 flex items-center gap-4">
                <div className="relative w-16 h-16 shrink-0 rounded-2xl overflow-hidden shadow-[0_8px_20px_rgba(8,117,217,0.22)] border border-white/90 group-hover:scale-105 transition-transform">
                  <img
                    src="/kpi_glass_3d.jpg"
                    alt="KPI 3D Glass Icon"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black font-mono text-slate-900">
                      {myKpi}%
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      chỉ số KPI
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#063B78] truncate mt-0.5">
                    Xếp Loại Hiệu Suất
                  </h4>
                  <div className="w-full bg-blue-100/70 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, myKpi)}%`,
                        background: 'linear-gradient(90deg, #0875D9 0%, #39A9FF 100%)'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveTab('performance');
                celebrate();
              }}
              className="w-full py-2 px-3 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/80 text-[#0875D9] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:shadow-xs"
            >
              <span>Xem Bảng Đánh Giá KPI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* CARD 2: CHUYÊN CẦN / NGÀY ĐÚNG GIỜ - Pinterest 3D Glass */}
          <div
            className="relative overflow-hidden rounded-3xl p-5 border border-emerald-200/70 shadow-lg shadow-emerald-500/5 backdrop-blur-xl flex flex-col justify-between transition-all hover:shadow-xl hover:-translate-y-0.5 group"
            style={{
              background: 'linear-gradient(145deg, rgba(236, 253, 245, 0.95) 0%, rgba(255, 255, 255, 0.98) 50%, rgba(240, 253, 244, 0.9) 100%)'
            }}
          >
            {/* Ambient Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />

            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100/80">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Chuyên Cần & Đúng Giờ
                  </span>
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Chuẩn 24 ngày (T7 xen kẽ)
                </span>
              </div>

              {/* Main Content with 3D Glass Icon */}
              <div className="my-4 flex items-center gap-4">
                <div className="relative w-16 h-16 shrink-0 rounded-2xl bg-white/90 border border-emerald-200/90 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                  <svg viewBox="0 0 44 44" className="w-14 h-14 -rotate-90">
                    <circle cx="22" cy="22" r="17" className="stroke-emerald-100" strokeWidth="3.5" fill="none" />
                    <circle
                      cx="22"
                      cy="22"
                      r="17"
                      stroke="#10B981"
                      strokeWidth="3.5"
                      fill="none"
                      strokeDasharray="106.8"
                      strokeDashoffset={106.8 - (Math.min(24, onTimeDays) / 24) * 106.8}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-mono font-black text-xs text-emerald-800">
                    {onTimeDays}d
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black font-mono text-slate-900">
                      {onTimeDays}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      / 24 ngày đúng giờ
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-emerald-800 truncate mt-0.5">
                    {Math.round((onTimeDays / 24) * 100)}% — {onTimeDays >= 20 ? 'Đạt chuẩn khen thưởng' : 'Cần duy trì đều đặn'}
                  </h4>
                  <p className="text-[10px] text-emerald-700/80 mt-0.5 font-medium">
                    Nghỉ xen kẽ Thứ 7 (2 T7 làm việc, 2 T7 nghỉ/tháng)
                  </p>
                  <div className="w-full bg-emerald-100/80 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.round((onTimeDays / 24) * 100))}%`,
                        background: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveTab('attendance');
                celebrate();
              }}
              className="w-full py-2 px-3 bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:shadow-xs"
            >
              <span>Xem Lịch Sử Chấm Công & GPS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* CARD 3: TRỰC TUYẾN & VIỆC CẦN LÀM - Synchronized OnlineAndTasksWidget */}
          <OnlineAndTasksWidget variant="employee" />
        </div>
      )}

      <BoardBrandSettingsModal isOpen={isBrandOpen} onClose={() => setIsBrandOpen(false)} />
    </div>
  );
};
