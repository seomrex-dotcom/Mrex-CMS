import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  AlertCircle,
  Building,
  ArrowRight,
  KeyRound,
  Info
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export const LoginPage: React.FC = () => {
  const { login, brandConfig } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email công vụ.');
      return;
    }
    if (!password.trim()) {
      setError('Vui lòng nhập mật khẩu truy cập.');
      return;
    }
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(email, password);
      if (!res.success) {
        setError(res.message);
      }
      setIsLoading(false);
    }, 350);
  };

  return (
    <div
      className="min-h-screen text-slate-100 flex flex-col justify-between selection:bg-[#0875D9] selection:text-white relative overflow-hidden font-sans bg-[#020b33]"
      style={{
        fontFamily: `var(--brand-font, "${brandConfig.fontFamily}", sans-serif)`,
        backgroundImage: `radial-gradient(ellipse at 60% 65%, rgba(8, 117, 217, 0.35) 0%, rgba(11, 79, 168, 0.22) 35%, transparent 70%), radial-gradient(circle at 10% 20%, rgba(57, 169, 255, 0.15) 0%, transparent 40%), url('/login_bg_blue.svg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background silky wave highlights & depth vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#01061f]/80 via-transparent to-[#020b33]/50 pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-blue-950/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[700px] h-[500px] bg-[#0875D9]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-blue-400/15 bg-[#020b33]/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <BrandLogo
            size="md"
            logoType={brandConfig.logoType}
            logoUrl={brandConfig.logoUrl}
            symbolId={brandConfig.logoSymbolId}
            primaryColor={brandConfig.primaryColorHex || '#0875D9'}
          />
          <div>
            <div className="font-extrabold text-sm tracking-wide text-white flex items-center gap-2">
              <span>{brandConfig.companyName || 'Mrex Agency'}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#0875D9]/25 text-[#39A9FF] rounded border border-[#0875D9]/40">
                Enterprise Cloud
              </span>
            </div>
            <div className="text-[11px] text-blue-200/70 font-medium">
              {brandConfig.tagline || 'Nền Tảng Quản Trị Doanh Nghiệp Tinh Gọn & Hiện Đại'}
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-blue-200/80 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Mã hóa SSL 256-bit bảo mật</span>
        </div>
      </header>

      {/* Main Content: Centered Enterprise Login Card */}
      <main className="relative z-10 flex-1 max-w-lg mx-auto w-full px-4 py-8 sm:py-12 flex items-center justify-center">
        <div className="w-full bg-white/95 backdrop-blur-2xl p-7 sm:p-9 rounded-3xl shadow-2xl border border-white/90 text-slate-800 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF5FF] text-[#0875D9] text-xs font-bold border border-[#0875D9]/20">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Cổng Đăng Nhập Cán Bộ Nhân Sự</span>
            </div>
            <h1 className="text-2xl font-black text-[#063B78] tracking-tight">
              Đăng Nhập Doanh Nghiệp
            </h1>
            <p className="text-xs text-slate-500">
              Nhập Email công vụ và Mật khẩu được cấp để truy cập không gian làm việc
            </p>
          </div>

          {/* Error Notification */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* Enterprise Security Notice */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11.5px] leading-relaxed text-slate-600">
              Cổng bảo mật nội bộ <strong>Mrex Enterprise Security</strong>. Vui lòng sử dụng tài khoản email công vụ được cấp phát để truy cập.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Email công vụ (@mrex.vn)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  id="input-login-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ten.nhanvien@mrex.vn"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0875D9] focus:bg-white transition-all min-h-[44px]"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Mật khẩu truy cập
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="input-login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#0875D9] focus:bg-white transition-all min-h-[44px]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Ẩn hiện mật khẩu"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#0875D9] focus:ring-[#0875D9]"
                />
                <span className="text-xs text-slate-600">Ghi nhớ phiên đăng nhập</span>
              </label>

              <span className="text-xs text-[#0875D9] hover:underline cursor-pointer">
                Quên mật khẩu?
              </span>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              id="btn-login-submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#0875D9] to-[#063B78] hover:from-[#0984f5] hover:to-[#084994] text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer min-h-[44px]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang Xác Thực...</span>
                </>
              ) : (
                <>
                  <span>Đăng Nhập Vào Hệ Thống</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 text-center space-y-1 text-slate-400 text-[11px]">
            <div className="flex items-center justify-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>T17-31 Manhattan Glory, Vinhomes Grand Park, Q.9, TP.HCM</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="relative z-10 py-4 px-6 text-center text-xs text-blue-200/60 border-t border-blue-400/10 bg-[#020b33]/40 backdrop-blur-md">
        © 2026 Mrex Agency · Bản quyền thuộc về Mrex Agency. Bảo lưu mọi quyền.
      </footer>
    </div>
  );
};