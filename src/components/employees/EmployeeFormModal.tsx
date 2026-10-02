import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DepartmentId, Employee, UserRole } from '../../types';
import {
  X,
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  DollarSign,
  Calendar,
  Shield,
  Trash2,
  CheckCircle2,
  Sparkles,
  Camera,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

import avatarCeo from '../../assets/images/avatar_ceo_tran_1790767301272.jpg';
import avatarPm from '../../assets/images/avatar_pm_lan_1790767317591.jpg';
import avatarHr from '../../assets/images/avatar_hr_minh_1790767332684.jpg';
import avatarDev from '../../assets/images/avatar_dev_duc_1790767344338.jpg';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  employeeToEdit?: Employee | null;
  defaultManagerId?: string;
  defaultDepartmentId?: DepartmentId;
}

const AVATAR_PRESETS = [
  { label: 'CEO Nam', url: avatarCeo },
  { label: 'Quản Lý Lan', url: avatarPm },
  { label: 'HR Minh', url: avatarHr },
  { label: 'Kỹ Sư Đức', url: avatarDev },
];

export const EmployeeFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  employeeToEdit,
  defaultManagerId,
  defaultDepartmentId
}) => {
  const {
    employees,
    departments,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    currentUser
  } = useApp();

  const isEditing = Boolean(employeeToEdit);

  // Permission validation
  const canManage = currentUser.role === 'CEO' || currentUser.role === 'MANAGER';

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('EMPLOYEE');
  const [roleTitle, setRoleTitle] = useState('');
  const [departmentId, setDepartmentId] = useState<DepartmentId>('exec');
  const [managerId, setManagerId] = useState<string>('');
  const [baseSalaryVND, setBaseSalaryVND] = useState<number>(22000000);
  const [baseSalaryGrade, setBaseSalaryGrade] = useState('Bậc 3 (Specialist)');
  const [joinDate, setJoinDate] = useState('2026-09-30');
  const [birthDate, setBirthDate] = useState('1995-10-15');
  const [annualLeaveRemaining, setAnnualLeaveRemaining] = useState<number>(12);
  const [status, setStatus] = useState<'ACTIVE' | 'ON_LEAVE' | 'PROBATION'>('ACTIVE');
  const [avatar, setAvatar] = useState<string>(avatarDev);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Account creation & password states
  const [createAccount, setCreateAccount] = useState(true);
  const [accountPassword, setAccountPassword] = useState('123456');
  const [showAccountPassword, setShowAccountPassword] = useState(false);
  const [accountStatus, setAccountStatus] = useState<'ACTIVE' | 'LOCKED'>('ACTIVE');

  // Success dialog state after creating account
  const [createdAccountInfo, setCreatedAccountInfo] = useState<{
    name: string;
    email: string;
    pass: string;
    roleTitle: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (employeeToEdit) {
      setName(employeeToEdit.name);
      setCode(employeeToEdit.code);
      setEmail(employeeToEdit.email);
      setPhone(employeeToEdit.phone);
      setRole(employeeToEdit.role);
      setRoleTitle(employeeToEdit.roleTitle);
      setDepartmentId(employeeToEdit.departmentId);
      setManagerId(employeeToEdit.managerId || '');
      setBaseSalaryVND(employeeToEdit.baseSalaryVND);
      setBaseSalaryGrade(employeeToEdit.baseSalaryGrade);
      setJoinDate(employeeToEdit.joinDate);
        setBirthDate(employeeToEdit.birthDate || '1995-10-15');
      setAnnualLeaveRemaining(employeeToEdit.annualLeaveRemaining);
      setStatus(employeeToEdit.status);
      setAvatar(employeeToEdit.avatar);
      setAccountPassword(employeeToEdit.password || '123456');
      setAccountStatus(employeeToEdit.accountStatus === 'LOCKED' ? 'LOCKED' : 'ACTIVE');
      setCreateAccount(employeeToEdit.accountStatus !== 'NOT_CREATED');
      setCreatedAccountInfo(null);
    } else {
      // New employee default setup
      const nextNum = employees.length + 1;
      const formattedNum = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
      setCode(`NV-0${formattedNum}`);
      setName('');
      setEmail('');
      setPhone('0912 888 999');
      setRole('EMPLOYEE');
      setRoleTitle('Kỹ Sư Phần Mềm (Software Engineer)');
      setDepartmentId(defaultDepartmentId || 'exec');
      setManagerId(defaultManagerId || 'emp-02');
      setBaseSalaryVND(22000000);
      setBaseSalaryGrade('Bậc 3 (Specialist)');
      setJoinDate(new Date().toISOString().split('T')[0]);
        setBirthDate('1995-10-15');
      setAnnualLeaveRemaining(12);
      setStatus('ACTIVE');
      setAvatar(avatarDev);
      setAccountPassword('123456');
      setShowAccountPassword(false);
      setAccountStatus('ACTIVE');
      setCreateAccount(true);
      setShowDeleteConfirm(false);
      setCreatedAccountInfo(null);
    }
  }, [employeeToEdit, isOpen, defaultManagerId, defaultDepartmentId, employees.length]);

  if (!isOpen) return null;

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newPass = `Omni@${rand}`;
    setAccountPassword(newPass);
    setShowAccountPassword(true);
  };

  const handleCopyCredentials = () => {
    if (!createdAccountInfo) return;
    const text = `THÔNG TIN TÀI KHOẢN ĐĂNG NHẬP AEUXGLOBAL:\n- Họ tên: ${createdAccountInfo.name}\n- Chức vụ: ${createdAccountInfo.roleTitle}\n- Email: ${createdAccountInfo.email}\n- Mật khẩu: ${createdAccountInfo.pass}\n- Link đăng nhập: http://localhost:3000/`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) {
      alert('Quyền bị từ chối: Chỉ Ban Quản Trị (CEO) và Cấp Quản Lý (PM/Lead) mới có quyền thêm hoặc cập nhật thông tin nhân sự.');
      return;
    }
    if (!name.trim()) return;

    const finalPass = createAccount ? (accountPassword.trim() || '123456') : undefined;
    const finalAccountStatus = createAccount ? accountStatus : 'NOT_CREATED';

    const payload: Employee = {
      id: employeeToEdit ? employeeToEdit.id : `emp-${Date.now()}`,
      name: name.trim(),
      code: code.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role,
      roleTitle: roleTitle.trim(),
      departmentId,
      managerId: managerId ? managerId : undefined,
      baseSalaryVND: Number(baseSalaryVND) || 15000000,
      baseSalaryGrade,
      joinDate,
      birthDate: birthDate || undefined,
      annualLeaveRemaining: Number(annualLeaveRemaining) || 12,
      status,
      avatar,
      password: finalPass,
      accountStatus: finalAccountStatus
    };

    if (isEditing && employeeToEdit) {
      updateEmployee(employeeToEdit.id, payload);
      onClose();
    } else {
      addEmployee(payload);
      if (createAccount) {
        // Show success modal with credentials
        setCreatedAccountInfo({
          name: payload.name,
          email: payload.email,
          pass: finalPass || '123456',
          roleTitle: payload.roleTitle
        });
      } else {
        onClose();
      }
    }
  };

  const handleDelete = () => {
    if (!employeeToEdit) return;
    if (!canManage) {
      alert('Quyền bị từ chối: Chỉ Ban Quản Trị (CEO) và Cấp Quản Lý (PM/Lead) mới có quyền xóa nhân sự.');
      return;
    }
    if (employeeToEdit.id === 'emp-01') {
      alert('Không thể xóa tài khoản Tổng Giám Đốc sáng lập.');
      return;
    }
    deleteEmployee(employeeToEdit.id);
    onClose();
  };

  const potentialManagers = employees.filter(e => !employeeToEdit || e.id !== employeeToEdit.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => {
          if (!createdAccountInfo) onClose();
        }}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* SUCCESS CREDENTIALS POPUP AFTER CREATING NEW EMPLOYEE */}
        {createdAccountInfo ? (
          <div className="p-6 sm:p-8 space-y-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">
                Thêm Nhân Sự & Khởi Tạo Tài Khoản Thành Công!
              </h2>
              <p className="text-xs text-slate-500">
                Hồ sơ đã được lưu vào hệ thống. Dưới đây là thông tin tài khoản đăng nhập để cấp cho nhân sự:
              </p>
            </div>

            {/* Credential Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#EAF5FF] to-white border border-[#0875D9]/30 text-left space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-blue-100">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#0875D9]" />
                  <span className="font-bold text-[#063B78] text-xs uppercase tracking-wider">
                    Thông Tin Đăng Nhập Hệ Thống
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Đã Kích Hoạt
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">Họ và tên nhân sự:</span>
                  <span className="font-bold text-slate-800">{createdAccountInfo.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Chức danh / Vai trò:</span>
                  <span className="font-semibold text-slate-700">{createdAccountInfo.roleTitle}</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-blue-200/80">
                  <span className="text-slate-500 text-[10px] block font-semibold uppercase">Email Đăng Nhập:</span>
                  <span className="font-mono font-bold text-[#0875D9] text-xs select-all">
                    {createdAccountInfo.email}
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-blue-200/80">
                  <span className="text-slate-500 text-[10px] block font-semibold uppercase">Mật Khẩu Đăng Nhập:</span>
                  <span className="font-mono font-bold text-slate-900 text-xs select-all">
                    {createdAccountInfo.pass}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic pt-1">
                * Nhân viên có thể sử dụng Email và Mật khẩu trên để đăng nhập tại trang Login ngay lập tức.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                id="btn-copy-credentials"
                onClick={handleCopyCredentials}
                className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs min-h-[44px]"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Đã Sao Chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Sao Chép Thông Tin Tài Khoản</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="btn-close-credentials"
                onClick={() => {
                  setCreatedAccountInfo(null);
                  onClose();
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#0875D9] hover:bg-[#0663ba] text-white font-bold rounded-xl shadow-md transition-all min-h-[44px]"
              >
                Hoàn Tất & Đóng
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0875D9] flex items-center justify-center text-white font-bold shadow-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">
                      {isEditing ? 'Chỉnh Sửa Hồ Sơ & Tài Khoản Nhân Sự' : 'Tiếp Nhận Nhân Sự & Cấp Tài Khoản Mới'}
                    </h2>
                    <span className="font-mono text-[10px] text-[#0B4FA8] bg-blue-100/70 px-2 py-0.5 rounded font-semibold border border-[#0875D9]/25">
                      Quyền: {currentUser.role === 'CEO' ? 'Ban Quản Trị' : 'Quản Lý'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {isEditing ? `Cập nhật thông tin mã nhân sự: ${employeeToEdit?.code}` : 'Khai báo nhân viên mới & tự động tạo tài khoản đăng nhập email / password'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
              {/* Avatar selector row */}
              <div>
                <label className="block font-semibold text-slate-700 mb-2">
                  Ảnh chân dung đại diện
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <img
                    src={avatar}
                    alt="Selected avatar"
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover border-2 border-[#0875D9] shadow-xs shrink-0"
                  />
                  <div className="flex-1 min-w-[200px] space-y-1.5">
                    <div className="flex items-center gap-2">
                      {AVATAR_PRESETS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatar(p.url)}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                            avatar === p.url
                              ? 'border-[#0875D9] bg-[#EAF5FF] text-[#0B4FA8] font-bold'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        placeholder="Hoặc dán URL ảnh trực tiếp..."
                        className="w-full pl-3 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 1: Name and Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Họ và tên nhân sự <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!isEditing && !email) {
                        const slug = e.target.value
                          .toLowerCase()
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '')
                          .replace(/đ/g, 'd')
                          .replace(/[^a-z0-9]/g, '.');
                        setEmail(`${slug}@omnicorp.vn`);
                      }
                    }}
                    id="emp-form-name" placeholder="VD: Nguyễn Hoàng Anh"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0875D9] focus:bg-white text-xs min-h-[40px]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mã số nhân viên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    id="emp-form-code" placeholder="VD: NV-088"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#0875D9] focus:bg-white text-xs min-h-[40px]"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Email and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email công vụ (Dùng làm tên đăng nhập) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      id="emp-form-email" placeholder="ten.ho@omnicorp.vn"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0875D9] focus:bg-white text-xs min-h-[40px]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Số điện thoại liên lạc
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      id="emp-form-phone" placeholder="0912 xxx xxx"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#0875D9] focus:bg-white text-xs min-h-[40px]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: TẠO TÀI KHOẢN ĐĂNG NHẬP CHO NHÂN SỰ */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#EAF5FF]/90 via-[#F4F8FC] to-white border border-[#0875D9]/30 space-y-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#0875D9]/15">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#0875D9]/15 flex items-center justify-center text-[#0875D9]">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <span>Tài Khoản Đăng Nhập Hệ Thống</span>
                        <span className="font-mono text-[10px] text-[#0875D9] bg-blue-100/70 px-1.5 py-0.2 rounded font-semibold">
                          Email & Password
                        </span>
                      </h3>
                      <p className="text-[10px] text-slate-500">
                        {isEditing ? 'Quản lý mật khẩu đăng nhập & trạng thái truy cập' : 'Tự động tạo tài khoản đăng nhập cho nhân sự mới'}
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={createAccount}
                      onChange={(e) => setCreateAccount(e.target.checked)}
                      className="rounded text-[#0875D9] focus:ring-[#0875D9] w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      {createAccount ? 'Đã kích hoạt cấp tài khoản' : 'Không tạo tài khoản'}
                    </span>
                  </label>
                </div>

                {createAccount ? (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Tài khoản Email đăng nhập
                        </label>
                        <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono text-[11px] truncate flex items-center justify-between">
                          <span className="truncate">{email || '(Nhập email ở trên)'}</span>
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold shrink-0">
                            Login ID
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-semibold text-slate-700">
                            Mật khẩu đăng nhập <span className="text-rose-500">*</span>
                          </label>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={handleGenerateRandomPassword}
                              className="text-[10px] text-[#0875D9] hover:underline flex items-center gap-1 font-semibold"
                              title="Tự sinh mật khẩu ngẫu nhiên"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Sinh ngẫu nhiên</span>
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={() => setAccountPassword('123456')}
                              className="text-[10px] text-slate-500 hover:text-slate-800 hover:underline font-semibold"
                            >
                              Mặc định (123456)
                            </button>
                          </div>
                        </div>

                        <div className="relative">
                          <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                          <input
                            type={showAccountPassword ? 'text' : 'password'}
                            value={accountPassword}
                            onChange={(e) => setAccountPassword(e.target.value)}
                            id="emp-form-password" placeholder="Mật khẩu đăng nhập"
                            className="w-full pl-8 pr-10 py-2 bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#0875D9] text-xs min-h-[40px]"
                            required={createAccount}
                          />
                          <button
                            type="button"
                            onClick={() => setShowAccountPassword(!showAccountPassword)}
                            className="p-2 absolute right-1.5 top-1 text-slate-400 hover:text-slate-600"
                            aria-label="Ẩn hiện mật khẩu"
                          >
                            {showAccountPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-600">Trạng thái tài khoản:</span>
                        <select
                          value={accountStatus}
                          onChange={(e) => setAccountStatus(e.target.value as 'ACTIVE' | 'LOCKED')}
                          className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800"
                        >
                          <option value="ACTIVE">🟢 Hoạt động (Cho phép đăng nhập)</option>
                          <option value="LOCKED">🔴 Tạm khóa (Chặn đăng nhập)</option>
                        </select>
                      </div>

                      <div className="text-[10px] text-slate-400 font-mono">
                        Mật khẩu gợi ý: <span className="font-bold text-slate-600">123456</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    ⚠️ Nhân sự này sẽ không được cấp tài khoản đăng nhập vào hệ thống AeuxGlobal.
                  </p>
                )}
              </div>

              {/* Row 3: Role and Role Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phân quyền cấp bậc <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0875D9] focus:bg-white text-xs min-h-[40px]"
                  >
                    <option value="EMPLOYEE">💻 Cấp Nhân Viên (Staff)</option>
                    <option value="MANAGER">🛡️ Cấp Quản Lý (PM / Team Lead)</option>
                    <option value="HR">📋 Khối Nhân Sự & Hành Chính (HR)</option>
                    <option value="CEO">👑 Ban Quản Trị (CEO / HĐQT)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Chức danh chuyên môn <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="VD: Kỹ Sư Phần Mềm Cao Cấp"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0875D9] focus:bg-white text-xs min-h-[40px]"
                    required
                  />
                </div>
              </div>

              {/* Row 4: Department and Direct Manager */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phòng ban trực thuộc <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value as DepartmentId)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0875D9] focus:bg-white text-xs min-h-[40px]"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cấp trên trực tiếp (Quản lý báo cáo)
                  </label>
                  <select
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0875D9] focus:bg-white text-xs min-h-[40px]"
                  >
                    <option value="">Không có (Báo cáo trực tiếp HĐQT / CEO)</option>
                    {potentialManagers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} · {m.roleTitle} ({m.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 5: Salary and Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lương cơ bản hàng tháng (VND)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="number"
                      step="500000"
                      value={baseSalaryVND}
                      onChange={(e) => setBaseSalaryVND(Number(e.target.value))}
                      placeholder="22000000"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#0875D9] focus:bg-white text-xs min-h-[40px]"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(baseSalaryVND || 0)}
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Bậc thang lương nội bộ
                  </label>
                  <select
                    value={baseSalaryGrade}
                    onChange={(e) => setBaseSalaryGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0875D9] focus:bg-white text-xs min-h-[40px]"
                  >
                    <option value="Bậc 1 (Fresher / Intern)">Bậc 1 (Fresher / Intern)</option>
                    <option value="Bậc 2 (Junior)">Bậc 2 (Junior)</option>
                    <option value="Bậc 3 (Specialist)">Bậc 3 (Specialist / Mid)</option>
                    <option value="Bậc 4 (Senior)">Bậc 4 (Senior / Tech Lead)</option>
                    <option value="Bậc 5 (Manager)">Bậc 5 (Manager / Trưởng phòng)</option>
                    <option value="Bậc 6 (Director)">Bậc 6 (Director / Giám đốc khối)</option>
                    <option value="Bậc 8 (Executive)">Bậc 8 (Executive / HĐQT)</option>
                  </select>
                </div>
              </div>

              {/* Row 6: Join Date, Leave balance, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ngày gia nhập
                  </label>
                  <input
                    type="date"
                    value={joinDate}
                    onChange={(e) => setJoinDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0875D9] focus:bg-white text-xs min-h-[40px]"
                  />
                </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Ngày sinh (Sinh nhật)
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0875D9] focus:bg-white text-xs min-h-[40px]"
                    />
                  </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phép năm khả dụng
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={annualLeaveRemaining}
                    onChange={(e) => setAnnualLeaveRemaining(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#0875D9] focus:bg-white text-xs min-h-[40px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Trạng thái nhân sự
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0875D9] focus:bg-white text-xs min-h-[40px]"
                  >
                    <option value="ACTIVE">Chính thức (Active)</option>
                    <option value="PROBATION">Thử việc (Probation)</option>
                    <option value="ON_LEAVE">Tạm hoãn (On Leave)</option>
                  </select>
                </div>
              </div>

              {/* Delete confirmation section (if editing) */}
              {isEditing && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa nhân sự khỏi hệ thống...</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-rose-50 border border-rose-200 rounded-lg">
                      <span className="text-[11px] text-rose-700 font-medium">Chắc chắn xóa hồ sơ này?</span>
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="px-2 py-1 bg-rose-600 text-white rounded text-[11px] font-bold hover:bg-rose-700"
                      >
                        Xác nhận xóa
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[11px] hover:bg-slate-300"
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Footer Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors min-h-[40px]"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0875D9] hover:bg-[#0663ba] active:scale-95 text-white font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 min-h-[40px]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? 'Lưu Thay Đổi Hồ Sơ & Mật Khẩu' : 'Xác Nhận Thêm & Cấp Tài Khoản'}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
