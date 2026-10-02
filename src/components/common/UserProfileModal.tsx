import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Cake,
  UserCog,
  Mail,
  Lock,
  Phone,
  Camera,
  Upload,
  Check,
  CheckCircle2,
  X,
  Shield,
  Building,
  KeyRound,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Briefcase
} from 'lucide-react';

import avatarCeo from '../../assets/images/avatar_ceo_tran_1790767301272.jpg';
import avatarPm from '../../assets/images/avatar_pm_lan_1790767317591.jpg';
import avatarHr from '../../assets/images/avatar_hr_minh_1790767332684.jpg';
import avatarDev from '../../assets/images/avatar_dev_duc_1790767344338.jpg';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_PRESETS = [
  { label: 'CEO Nam', url: avatarCeo },
  { label: 'Quản Lý Lan', url: avatarPm },
  { label: 'HR Minh', url: avatarHr },
  { label: 'Kỹ Sư Đức', url: avatarDev },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateEmployee, departments, celebrate } = useApp();

  // Editable fields
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');

  // UI state
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setAvatar(currentUser.avatar || avatarCeo);
      setPhone(currentUser.phone || '');
      setBirthDate(currentUser.birthDate || '');
      setIsSuccess(false);
      setErrorMessage(null);
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const currentDept = departments.find(d => d.id === currentUser.departmentId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('Dung lượng ảnh vượt quá 2MB. Vui lòng chọn ảnh nhỏ hơn.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
          setErrorMessage(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Vui lòng nhập tên hiển thị của bạn.');
      return;
    }

    setErrorMessage(null);

    // Strictly update ONLY allowed personal info: name, avatar, phone.
    // Email and password are NOT updated!
    updateEmployee(currentUser.id, {
      name: name.trim(),
      avatar: avatar,
      phone: phone.trim(),
      birthDate: birthDate || undefined
    });

    setIsSuccess(true);
    celebrate();

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-white/80 overflow-hidden z-10 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-[#EAF5FF] via-white to-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0875D9]/15 flex items-center justify-center text-[#0875D9] shadow-xs">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#063B78] flex items-center gap-2">
                <span>Cài Đặt Thông Tin Cá Nhân</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#0875D9]/15 text-[#0875D9] font-bold border border-[#0875D9]/30">
                  {currentUser.role}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Chỉnh sửa tên hiển thị và cập nhật ảnh đại diện tài khoản của bạn
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          
          {/* Notification Alerts */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="font-bold">Đã lưu thay đổi thông tin cá nhân thành công!</span>
            </div>
          )}

          {/* Section 1: AVATAR / PROFILE PHOTO */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F4F8FC] to-white border border-[#0875D9]/20 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <label className="font-bold text-[#063B78] text-xs flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#0875D9]" />
                <span>Ảnh Đại Diện (Profile Avatar)</span>
              </label>
              <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                Cho phép sửa đổi
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Preview Avatar */}
              <div className="relative group shrink-0">
                <img
                  src={avatar}
                  alt={name || 'Avatar'}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-[#0875D9]/25 shadow-md"
                />
                <label
                  htmlFor="avatar-file-upload"
                  className="absolute inset-0 bg-slate-900/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer text-[10px] font-semibold gap-1"
                  title="Tải ảnh mới từ máy tính"
                >
                  <Upload className="w-4 h-4" />
                  <span>Tải ảnh</span>
                </label>
                <input
                  id="avatar-file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Avatar Presets & URL Options */}
              <div className="flex-1 space-y-2.5 w-full">
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 font-medium">Chọn nhanh mẫu ảnh đại diện:</span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {AVATAR_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(p.url)}
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                          avatar === p.url
                            ? 'border-[#0875D9] bg-[#EAF5FF] text-[#0875D9] font-bold shadow-2xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direct image URL input or File picker */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="Hoặc dán URL ảnh / Base64..."
                      className="w-full pl-3 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] focus:outline-none focus:ring-2 focus:ring-[#0875D9]"
                    />
                  </div>
                  <label
                    htmlFor="avatar-file-upload"
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition-colors flex items-center gap-1 cursor-pointer shrink-0 border border-slate-200"
                  >
                    <Upload className="w-3 h-3 text-slate-500" />
                    <span>Tải file</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: EDITABLE PERSONAL INFO */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-bold text-[#063B78] text-xs flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#0875D9]" />
                <span>Thông Tin Cơ Bản</span>
              </span>
              <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                Cho phép sửa đổi
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Ngày sinh (Sinh nhật) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Ngày sinh (Sinh nhật)
                </label>
                <div className="relative">
                  <Cake className="w-4 h-4 text-rose-500 absolute left-3 top-3" />
                  <input
                    id="profile-birthdate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#0875D9] focus:bg-white transition-all min-h-[40px]"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Đồng bộ lời chúc mừng sinh nhật trên hệ thống.
                </span>
              </div>
              {/* Tên hiển thị (Display Name) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Tên hiển thị <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="profile-display-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Trần Hoàng Nam"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0875D9] focus:bg-white transition-all min-h-[40px]"
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Tên này sẽ hiển thị trên thanh tiêu đề, lời chào và danh bạ công ty.
                </span>
              </div>

              {/* Số điện thoại liên lạc */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Số điện thoại liên lạc
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="profile-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#0875D9] focus:bg-white transition-all min-h-[40px]"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Số điện thoại nội bộ dùng khi trao đổi công việc.
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: LOCKED CREDENTIALS & ACCOUNT (KHÔNG CHO SỬA EMAIL / PASS) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Thông Tin Tài Khoản & Bảo Mật</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                🔒 Không cho phép chỉnh sửa
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Email (Read-only / Locked) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-600">
                    Email công vụ (Tên đăng nhập)
                  </label>
                  <Lock className="w-3 h-3 text-slate-400" />
                </div>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="profile-email-readonly"
                    type="email"
                    value={currentUser.email}
                    disabled
                    readOnly
                    className="w-full pl-8 pr-3 py-2 bg-slate-200/60 border border-slate-300 rounded-xl text-xs font-mono text-slate-500 cursor-not-allowed select-none min-h-[40px]"
                  />
                </div>
                <span className="text-[10px] text-slate-400 italic block">
                  * Email là mã định danh đăng nhập cố định.
                </span>
              </div>

              {/* Password (Read-only / Locked) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-600">
                    Mật khẩu tài khoản
                  </label>
                  <Lock className="w-3 h-3 text-slate-400" />
                </div>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="profile-password-readonly"
                    type="password"
                    value="••••••••••••"
                    disabled
                    readOnly
                    className="w-full pl-8 pr-3 py-2 bg-slate-200/60 border border-slate-300 rounded-xl text-xs font-mono text-slate-500 cursor-not-allowed select-none min-h-[40px]"
                  />
                </div>
                <span className="text-[10px] text-slate-400 italic block">
                  * Không cho phép đổi mật khẩu tại trang này.
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-amber-50/70 border border-amber-200/70 rounded-xl text-[11px] text-amber-800 leading-relaxed flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Quy chế an toàn hệ thống: Để thay đổi <strong>Email</strong> hoặc <strong>Mật khẩu</strong>, vui lòng liên hệ trực tiếp với Ban Quản Trị hoặc Khối Nhân Sự (HR).
              </span>
            </div>
          </div>

          {/* Section 4: ORGANIZATIONAL ROLE DETAILS (READ-ONLY) */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Mã Nhân Viên:</span>
              <span className="font-mono font-bold text-slate-800">{currentUser.code}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Chức Danh:</span>
              <span className="font-semibold text-slate-800 truncate block">{currentUser.roleTitle}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Phòng Ban:</span>
              <span className="font-semibold text-slate-800 truncate block">{currentDept?.name || 'Toàn Công Ty'}</span>
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors min-h-[40px] cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              id="btn-save-profile"
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-[#0875D9] to-[#0B4FA8] hover:from-[#0663ba] hover:to-[#083e87] active:scale-95 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 min-h-[40px] cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Lưu Thay Đổi Thông Tin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
