import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ProjectContract,
  PaymentMilestone,
  DepartmentId
} from '../../types';
import {
  FileText,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Building,
  Upload,
  Download,
  Bell,
  BellRing,
  Trash2,
  Edit,
  X,
  TrendingUp,
  Percent,
  Check,
  Shield,
  FileCheck
} from 'lucide-react';

export const ProjectContractsView: React.FC = () => {
  const {
    currentUser,
    departments,
    contracts,
    addContract,
    updateContract,
    deleteContract,
    toggleMilestoneStatus,
    toggleMilestoneReminder,
    celebrate
  } = useApp();

  const isCEO = currentUser.role === 'CEO';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING_PAYMENT' | 'COMPLETED'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [contractToEdit, setContractToEdit] = useState<ProjectContract | null>(null);

  // Form states for Add / Edit
  const [contractCode, setContractCode] = useState('');
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [signingDate, setSigningDate] = useState(new Date().toISOString().slice(0, 10));
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');
  const [totalValueVND, setTotalValueVND] = useState<number>(100000000);
  const [departmentId, setDepartmentId] = useState<DepartmentId>('exec');
  const [managerName, setManagerName] = useState(currentUser.name);
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [notes, setNotes] = useState('');

  // Milestone list in modal
  const [modalMilestones, setModalMilestones] = useState<Omit<PaymentMilestone, 'id'>[]>([
    {
      name: 'Đợt 1: Tạm ứng khi ký kết hợp đồng',
      dueDate: new Date().toISOString().slice(0, 10),
      amountVND: 30000000,
      percentage: 30,
      status: 'PAID',
      notes: 'Tạm ứng 30% giá trị hợp đồng'
    },
    {
      name: 'Đợt 2: Nghiệm thu hoàn thành dự án & Quyết toán',
      dueDate: '',
      amountVND: 70000000,
      percentage: 70,
      status: 'PENDING',
      notes: 'Thanh toán 70% sau khi ký biên bản nghiệm thu'
    }
  ]);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  // High-level financial calculations
  const totalContractRevenue = contracts.reduce((sum, c) => sum + c.totalValueVND, 0);
  const totalCollectedRevenue = contracts.reduce((sum, c) => sum + c.collectedVND, 0);
  const totalReceivables = totalContractRevenue - totalCollectedRevenue;
  const collectionRate = totalContractRevenue > 0 ? Math.round((totalCollectedRevenue / totalContractRevenue) * 100) : 0;

  // Reminders count (due soon or overdue)
  const pendingRemindersCount = contracts.flatMap(c => c.milestones).filter(m => m.status === 'PENDING' || m.status === 'OVERDUE').length;

  // Filtered contracts
  const filteredContracts = contracts.filter(c => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesSearch =
      c.contractCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleOpenAddModal = (contract?: ProjectContract) => {
    if (contract) {
      setContractToEdit(contract);
      setContractCode(contract.contractCode);
      setProjectName(contract.projectName);
      setClientName(contract.clientName);
      setClientContact(contract.clientContact || '');
      setSigningDate(contract.signingDate);
      setStartDate(contract.startDate);
      setEndDate(contract.endDate);
      setTotalValueVND(contract.totalValueVND);
      setDepartmentId(contract.departmentId);
      setManagerName(contract.managerName);
      setFileName(contract.fileName || '');
      setFileUrl(contract.fileUrl || '');
      setFileSize(contract.fileSize || '');
      setNotes(contract.notes || '');
      setModalMilestones(contract.milestones.map(({ id, ...rest }) => rest));
    } else {
      setContractToEdit(null);
      const generatedCode = `HĐ-${new Date().getFullYear()}/DA-${Math.floor(100 + Math.random() * 900)}`;
      setContractCode(generatedCode);
      setProjectName('');
      setClientName('');
      setClientContact('');
      setSigningDate(new Date().toISOString().slice(0, 10));
      setStartDate(new Date().toISOString().slice(0, 10));
      setEndDate('');
      setTotalValueVND(150000000);
      setDepartmentId('exec');
      setManagerName(currentUser.name);
      setFileName('');
      setFileUrl('');
      setFileSize('');
      setNotes('');
      setModalMilestones([
        {
          name: 'Đợt 1: Tạm ứng khi ký kết hợp đồng',
          dueDate: new Date().toISOString().slice(0, 10),
          amountVND: 45000000,
          percentage: 30,
          status: 'PENDING',
          notes: 'Tạm ứng 30% giá trị hợp đồng'
        },
        {
          name: 'Đợt 2: Nghiệm thu hoàn thành dự án',
          dueDate: '',
          amountVND: 105000000,
          percentage: 70,
          status: 'PENDING',
          notes: 'Quyết toán 70%'
        }
      ]);
    }
    setIsAddModalOpen(true);
  };

  // Handle contract file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      setFileUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !clientName.trim() || !contractCode.trim()) {
      alert('Vui lòng điền đầy đủ Mã hợp đồng, Tên dự án và Khách hàng.');
      return;
    }

    const compiledMilestones: PaymentMilestone[] = modalMilestones.map((m, idx) => ({
      ...m,
      id: `m-${Date.now()}-${idx}`
    }));

    const calculatedCollected = compiledMilestones
      .filter(m => m.status === 'PAID')
      .reduce((sum, m) => sum + m.amountVND, 0);

    const payload: Omit<ProjectContract, 'id' | 'createdAt'> = {
      contractCode: contractCode.trim(),
      projectName: projectName.trim(),
      clientName: clientName.trim(),
      clientContact: clientContact.trim(),
      signingDate,
      startDate,
      endDate: endDate || startDate,
      totalValueVND: Number(totalValueVND),
      collectedVND: calculatedCollected,
      departmentId,
      managerName,
      status: calculatedCollected >= totalValueVND ? 'COMPLETED' : calculatedCollected > 0 ? 'ACTIVE' : 'PENDING_PAYMENT',
      fileName: fileName || undefined,
      fileUrl: fileUrl || undefined,
      fileSize: fileSize || undefined,
      milestones: compiledMilestones,
      notes: notes.trim() || undefined
    };

    if (contractToEdit) {
      updateContract(contractToEdit.id, payload);
    } else {
      addContract(payload);
    }

    setIsAddModalOpen(false);
    celebrate();
  };

  return (
    <div className="space-y-6">
      {/* 1. EXECUTIVE REVENUE & CONTRACT METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tổng Doanh Thu Hợp Đồng Ký Kết</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-indigo-700 tabular-nums mt-2">
            {formatVND(totalContractRevenue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
            <span>{contracts.length} hợp đồng dự án đang quản lý</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Thực Thu Đã Về Tài Khoản</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-600 tabular-nums mt-2">
            {formatVND(totalCollectedRevenue)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>Đạt {collectionRate}% tổng giá trị ký kết</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Công Nợ Dự Án Cần Thu</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-amber-600 tabular-nums mt-2">
            {formatVND(totalReceivables)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span>Đang theo sát các đợt nghiệm thu</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Lịch Nhắc Thanh Toán Đến Hạn</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <BellRing className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-rose-600 tabular-nums mt-2">
            {pendingRemindersCount} đợt nhắc
          </div>
          <div className="text-[11px] text-rose-500 mt-1 font-semibold">
            <span>Cần đối soát và gửi văn bản nhắc</span>
          </div>
        </div>
      </div>

      {/* 2. TOOLBAR: Search, Filters & Add button */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm mã HĐ, tên dự án, khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                statusFilter === 'ALL' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({contracts.length})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                statusFilter === 'ACTIVE' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đang thực hiện
            </button>
            <button
              onClick={() => setStatusFilter('PENDING_PAYMENT')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                statusFilter === 'PENDING_PAYMENT' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chờ thanh toán
            </button>
            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                statusFilter === 'COMPLETED' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đã hoàn tất
            </button>
          </div>
        </div>

        {/* Add Contract Button */}
        <button
          onClick={() => handleOpenAddModal()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Hợp Đồng Dự Án Mới</span>
        </button>
      </div>

      {/* 3. CONTRACTS LIST & REMINDER SCHEDULE */}
      <div className="space-y-4">
        {filteredContracts.map(contract => {
          const dept = departments.find(d => d.id === contract.departmentId);
          const percentCollected = contract.totalValueVND > 0
            ? Math.round((contract.collectedVND / contract.totalValueVND) * 100)
            : 0;

          return (
            <div
              key={contract.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-all"
            >
              {/* Row 1: Header info, Code, Client, Status & Action */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                      {contract.contractCode}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {contract.clientName}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500 font-mono">
                      Ký ngày: <strong className="text-slate-700">{formatDate(contract.signingDate)}</strong>
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {contract.projectName}
                  </h3>
                </div>

                <div className="flex items-center gap-2 self-start lg:self-auto">
                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      contract.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : contract.status === 'PENDING_PAYMENT'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}
                  >
                    {contract.status === 'COMPLETED'
                      ? 'Đã Thanh Quyết Toán'
                      : contract.status === 'PENDING_PAYMENT'
                      ? 'Chờ Tạm Ứng / Thanh Toán'
                      : 'Đang Triển Khai Hợp Đồng'}
                  </span>

                  {/* Edit / Delete for Management */}
                  <button
                    onClick={() => handleOpenAddModal(contract)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Chỉnh sửa hợp đồng"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Bạn có chắc chắn muốn xóa hợp đồng ${contract.contractCode}?`)) {
                        deleteContract(contract.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Xóa hợp đồng"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Row 2: Financial Details & Contract File Download */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-xl text-xs">
                {/* Revenue & Collected (7 cols) */}
                <div className="md:col-span-7 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500">Doanh thu hợp đồng:</span>{' '}
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {formatVND(contract.totalValueVND)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500">Đã thu:</span>{' '}
                      <span className="font-mono font-bold text-sm text-emerald-600">
                        {formatVND(contract.collectedVND)}
                      </span>{' '}
                      <span className="font-mono text-slate-400 text-[11px]">({percentCollected}%)</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentCollected}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>Thời hạn: {formatDate(contract.startDate)} → {formatDate(contract.endDate)}</span>
                    <span>Còn lại cần thu: <strong className="font-mono text-amber-700">{formatVND(contract.totalValueVND - contract.collectedVND)}</strong></span>
                  </div>
                </div>

                {/* Contract Attached File (5 cols) */}
                <div className="md:col-span-5 md:border-l md:border-slate-200 md:pl-4 space-y-2">
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Tệp Hợp Đồng Đính Kèm</span>
                  </div>

                  {contract.fileName ? (
                    <div className="flex items-center justify-between gap-2 p-2 bg-white border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 truncate text-[11px]">
                            {contract.fileName}
                          </div>
                          {contract.fileSize && (
                            <div className="text-[10px] text-slate-400 font-mono">
                              {contract.fileSize}
                            </div>
                          )}
                        </div>
                      </div>

                      <a
                        href={contract.fileUrl || '#'}
                        download={contract.fileName}
                        onClick={(e) => {
                          if (!contract.fileUrl) {
                            e.preventDefault();
                            alert(`Mở xem tệp hợp đồng số hóa: ${contract.fileName}`);
                          }
                        }}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded text-[11px] flex items-center gap-1 shrink-0 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        <span>Tải file</span>
                      </a>
                    </div>
                  ) : (
                    <div className="p-2 bg-white border border-dashed border-slate-200 rounded-lg text-slate-400 text-center text-[11px]">
                      Chưa đính kèm tệp hợp đồng PDF scan
                    </div>
                  )}
                </div>
              </div>

              {/* Row 3: LỊCH NHẮC THANH TOÁN (PAYMENT MILESTONES & REMINDERS) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Lịch Nhắc Thanh Toán & Tiến Độ Nghiệm Thu ({contract.milestones.length} đợt)</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Người phụ trách: {contract.managerName}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                  {contract.milestones.map((m) => {
                    const isPaid = m.status === 'PAID';
                    const isOverdue = m.status === 'OVERDUE';

                    return (
                      <div
                        key={m.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isPaid
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : isOverdue
                            ? 'bg-rose-50/60 border-rose-300 ring-1 ring-rose-400/20'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="font-bold text-slate-800 leading-tight">
                            {m.name}
                          </span>
                          <span
                            className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-800'
                                : isOverdue
                                ? 'bg-rose-100 text-rose-800 animate-pulse'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isPaid ? 'ĐÃ THU' : isOverdue ? 'QUÁ HẠN' : 'CHỜ THU'}
                          </span>
                        </div>

                        <div className="mt-2 flex items-baseline justify-between font-mono">
                          <span className="text-sm font-extrabold text-slate-900">
                            {formatVND(m.amountVND)}
                          </span>
                          <span className="text-[11px] text-slate-500 font-semibold">
                            {m.percentage}% HĐ
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                          <span>Hạn: <strong className="text-slate-700">{formatDate(m.dueDate)}</strong></span>
                          {m.paidDate && (
                            <span className="text-emerald-700 font-semibold">Thu: {formatDate(m.paidDate)}</span>
                          )}
                        </div>

                        {/* Interactive toggle for payment status & reminders */}
                        <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              toggleMilestoneStatus(
                                contract.id,
                                m.id,
                                isPaid ? 'PENDING' : 'PAID'
                              )
                            }
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                              isPaid
                                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                                : 'bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700'
                            }`}
                            title={isPaid ? 'Bấm để hủy trạng thái đã thu' : 'Xác nhận khách hàng đã chuyển tiền đợt này'}
                          >
                            <Check className="w-3 h-3" />
                            <span>{isPaid ? 'Đã thu tiền' : 'Xác nhận thu'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleMilestoneReminder(contract.id, m.id)}
                            className={`p-1 rounded transition-colors flex items-center gap-1 text-[11px] ${
                              m.reminderSent
                                ? 'text-amber-700 bg-amber-100'
                                : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                            }`}
                            title={m.reminderSent ? 'Đã gửi lịch nhắc thanh toán' : 'Bật nhắc hẹn thanh toán cho kế toán'}
                          >
                            <Bell className="w-3.5 h-3.5" />
                            <span className="text-[10px]">{m.reminderSent ? 'Đã nhắc' : 'Nhắc nợ'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {filteredContracts.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-3">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <div className="font-semibold text-sm text-slate-700">Không tìm thấy hợp đồng phù hợp</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Thử tìm kiếm với từ khóa khác hoặc bấm nút "Thêm Hợp Đồng Dự Án Mới" để tạo hợp đồng.
            </p>
          </div>
        )}
      </div>

      {/* 4. MODAL: ADD / EDIT PROJECT CONTRACT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsAddModalOpen(false)}
          />

          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold">
                    {contractToEdit ? 'Chỉnh Sửa Hợp Đồng Dự Án' : 'Thêm Hợp Đồng Doanh Thu Dự Án Mới'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Khai báo doanh thu, ngày ký, tệp hợp đồng và thiết lập lịch nhắc thanh toán
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveContract} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Row 1: Code & Project Name */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <label className="block font-bold text-slate-700 mb-1">Mã Hợp Đồng *</label>
                  <input
                    type="text"
                    required
                    value={contractCode}
                    onChange={(e) => setContractCode(e.target.value)}
                    placeholder="e.g. HĐ-2026/VINSMART-ERP"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-8">
                  <label className="block font-bold text-slate-700 mb-1">Tên Dự Án Hợp Đồng *</label>
                  <input
                    type="text"
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Ví dụ: Triển khai Hệ sinh thái ERP OmniCorp Giai đoạn 2"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Row 2: Client & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khách Hàng / Đối Tác Ký Kết *</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Tên công ty hoặc tổ chức đối tác"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Người Đại Diện / SĐT / Email Liên Hệ</label>
                  <input
                    type="text"
                    value={clientContact}
                    onChange={(e) => setClientContact(e.target.value)}
                    placeholder="0912 345 678 (Mr. Tuấn - Giám đốc CNTT)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Row 3: Signing Date, Start Date & End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày Ký Hợp Đồng *</label>
                  <input
                    type="date"
                    required
                    value={signingDate}
                    onChange={(e) => setSigningDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày Bắt Đầu Triển Khai</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hạn Nghiệm Thu Bàn Giao</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Row 4: Total Value VND & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tổng Doanh Thu Hợp Đồng (VND) *</label>
                  <input
                    type="number"
                    required
                    min={1000000}
                    step={1000000}
                    value={totalValueVND}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setTotalValueVND(val);
                      // Auto update default 2 milestones 30% / 70%
                      setModalMilestones([
                        {
                          name: 'Đợt 1: Tạm ứng khi ký kết hợp đồng',
                          dueDate: signingDate,
                          amountVND: Math.round(val * 0.3),
                          percentage: 30,
                          status: 'PENDING',
                          notes: 'Tạm ứng 30%'
                        },
                        {
                          name: 'Đợt 2: Nghiệm thu hoàn thành dự án',
                          dueDate: endDate || signingDate,
                          amountVND: Math.round(val * 0.7),
                          percentage: 70,
                          status: 'PENDING',
                          notes: 'Quyết toán 70%'
                        }
                      ]);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-indigo-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                    {formatVND(totalValueVND)}
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối Phòng Ban Phụ Trách</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value as DepartmentId)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 5: UPLOAD FILE HỢP ĐỒNG (PDF / SCAN / DOCX) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <label className="block font-bold text-slate-800 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Upload Tệp Hợp Đồng Đã Ký (PDF, Scan, DOCX)</span>
                </label>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-800 truncate block">
                        {fileName || 'Chưa tải lên tệp hợp đồng'}
                      </span>
                      {fileSize && (
                        <span className="text-[10px] text-slate-400 font-mono">{fileSize}</span>
                      )}
                    </div>
                  </div>

                  <label className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg cursor-pointer transition-colors shrink-0 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Chọn tệp hợp đồng</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Row 6: THIẾT LẬP CÁC ĐỢT THANH TOÁN (LỊCH NHẮC THANH TOÁN) */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Thiết Lập Lịch Nhắc Thanh Toán ({modalMilestones.length} đợt)</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setModalMilestones(prev => [
                        ...prev,
                        {
                          name: `Đợt ${prev.length + 1}: Thanh toán giai đoạn`,
                          dueDate: endDate || '',
                          amountVND: 20000000,
                          percentage: 20,
                          status: 'PENDING',
                          notes: ''
                        }
                      ]);
                    }}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm đợt thanh toán</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {modalMilestones.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                    >
                      <div className="sm:col-span-4">
                        <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Tên đợt thanh toán</label>
                        <input
                          type="text"
                          value={m.name}
                          onChange={(e) => {
                            const updated = [...modalMilestones];
                            updated[idx].name = e.target.value;
                            setModalMilestones(updated);
                          }}
                          className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Hạn thanh toán</label>
                        <input
                          type="date"
                          value={m.dueDate}
                          onChange={(e) => {
                            const updated = [...modalMilestones];
                            updated[idx].dueDate = e.target.value;
                            setModalMilestones(updated);
                          }}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Số tiền (VND)</label>
                        <input
                          type="number"
                          step={1000000}
                          value={m.amountVND}
                          onChange={(e) => {
                            const updated = [...modalMilestones];
                            const val = Number(e.target.value);
                            updated[idx].amountVND = val;
                            updated[idx].percentage = totalValueVND > 0 ? Math.round((val / totalValueVND) * 100) : 0;
                            setModalMilestones(updated);
                          }}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900"
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-center justify-between pt-3">
                        <select
                          value={m.status}
                          onChange={(e) => {
                            const updated = [...modalMilestones];
                            updated[idx].status = e.target.value as 'PAID' | 'PENDING' | 'OVERDUE';
                            setModalMilestones(updated);
                          }}
                          className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold"
                        >
                          <option value="PENDING">Chờ thu</option>
                          <option value="PAID">Đã thu</option>
                          <option value="OVERDUE">Quá hạn</option>
                        </select>

                        {modalMilestones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setModalMilestones(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Hủy bỏ
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{contractToEdit ? 'Cập Nhật Hợp Đồng' : 'Lưu Hợp Đồng & Kích Hoạt Lịch Nhắc'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
