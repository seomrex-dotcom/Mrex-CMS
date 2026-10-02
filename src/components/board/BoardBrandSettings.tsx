import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Palette,
  Sparkles,
  Upload,
  Check,
  RotateCcw,
  Type,
  Layout,
  Sliders,
  Shield,
  ShieldAlert,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Eye,
  Info
} from 'lucide-react';
import {
  CompanyBrandConfig,
  FontFamilyOption,
  BrandColorPreset,
  SidebarThemeOption,
  LogoSymbolOption,
  BackgroundTheme
} from '../../types';
import { BrandLogo } from '../common/BrandLogo';

export const BoardBrandSettings: React.FC = () => {
  const {
    currentUser,
    brandConfig,
    updateBrandConfig,
    resetBrandConfig,
    celebrate
  } = useApp();

  const isCEO = currentUser.role === 'CEO';

  // Local draft state for editing before saving
  const [formData, setFormData] = useState<CompanyBrandConfig>({ ...brandConfig });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewTab, setPreviewTab] = useState<'desktop' | 'mobile'>('desktop');

  // Available Fonts Configuration
  const FONT_OPTIONS: { id: FontFamilyOption; name: string; desc: string; sample: string }[] = [
    {
      id: 'Be Vietnam Pro',
      name: 'Be Vietnam Pro',
      desc: 'Tối ưu tuyệt hảo cho Tiếng Việt, thanh nhã và chuyên nghiệp',
      sample: 'Cộng hòa Xã hội Chủ nghĩa Việt Nam - 2026'
    },
    {
      id: 'Inter',
      name: 'Inter',
      desc: 'Chuẩn mực phần mềm quốc tế, sắc nét trên mọi màn hình',
      sample: 'Enterprise Platform ERP & Global Solution'
    },
    {
      id: 'Plus Jakarta Sans',
      name: 'Plus Jakarta Sans',
      desc: 'Hiện đại, năng động, mang phong cách công nghệ thế hệ mới',
      sample: 'Đổi mới sáng tạo & Tăng trưởng bền vững'
    },
    {
      id: 'Outfit',
      name: 'Outfit',
      desc: 'Hình học tối giản, cao cấp và tinh gọn đậm chất thương hiệu',
      sample: 'Executive Leadership & Strategic OKRs'
    },
    {
      id: 'Montserrat',
      name: 'Montserrat',
      desc: 'Mạnh mẽ, sang trọng, uy tín và vững chãi',
      sample: 'Quyết Sách Ban Quản Trị & Hội Đồng Điều Hành'
    },
    {
      id: 'Roboto',
      name: 'Roboto',
      desc: 'Kinh điển, mạch lạc, dễ đọc dữ liệu bảng biểu và tài chính',
      sample: 'Báo cáo doanh thu, quỹ thưởng và KPI nhân sự'
    }
  ];

  // Preset Colors Configuration
  const COLOR_PRESETS: {
    id: BrandColorPreset;
    name: string;
    hex: string;
    desc: string;
  }[] = [
    {
      id: 'emerald',
      name: 'Ngọc Lục Bảo AeuxGlobal',
      hex: '#10b981',
      desc: 'Sinh thái, bền vững & công nghệ tinh hoa'
    },
    {
      id: 'indigo',
      name: 'Xanh Lam Sapphire',
      hex: '#4f46e5',
      desc: 'Công nghệ tập đoàn, uy tín & chuyên sâu'
    },
    {
      id: 'violet',
      name: 'Tím Hoàng Gia',
      hex: '#8b5cf6',
      desc: 'Sáng tạo, đẳng cấp & phong cách khác biệt'
    },
    {
      id: 'cyan',
      name: 'Xanh Biển Tương Lai',
      hex: '#06b6d4',
      desc: 'Số hóa tốc độ cao & hạ tầng Cloud'
    },
    {
      id: 'amber',
      name: 'Vàng Đồng Thịnh Vượng',
      hex: '#f59e0b',
      desc: 'Tài chính, phát triển thịnh vượng & quỹ thưởng'
    },
    {
      id: 'rose',
      name: 'Đỏ Ruby Quyết Sách',
      hex: '#f43f5e',
      desc: 'Nhiệt huyết, quyết đoán & chỉ số năng lượng'
    },
    {
      id: 'slate',
      name: 'Than Chì Tối Giản',
      hex: '#475569',
      desc: 'Thanh lịch, tối giản & tính chuẩn mực cao'
    }
  ];

  // Preset Vector Symbols Configuration
  const SYMBOL_OPTIONS: {
    id: LogoSymbolOption;
    name: string;
    subtitle: string;
    desc: string;
  }[] = [
    {
      id: 'double_leaf',
      name: 'Song Diệp AeuxGlobal',
      subtitle: 'Mẫu nhận diện gốc',
      desc: 'Hai phiến lá xoay góc thanh thoát, tượng trưng cho sinh thái số, sự vươn mình và phát triển bền vững.'
    },
    {
      id: 'tech_hexagon',
      name: 'Lục Lăng Kiến Trúc Số',
      subtitle: 'Công nghệ & Kỹ thuật',
      desc: 'Khối đa giác liên kết chặt chẽ, thể hiện nền tảng điện toán vững chắc và mạng lưới kết nối phòng ban.'
    },
    {
      id: 'quantum_prism',
      name: 'Lăng Kính Đa Diện',
      subtitle: 'Sáng tạo & Tinh hoa',
      desc: 'Viên kim cương đa giác phản chiếu ánh sáng, đại diện cho giá trị tinh hoa và sự minh bạch trong quản trị.'
    },
    {
      id: 'globe_core',
      name: 'Mạng Lưới Toàn Cầu',
      subtitle: 'Vươn tầm quốc tế',
      desc: 'Quả địa cầu số với các quỹ đạo kinh tuyến, thể hiện tầm nhìn mở rộng thị trường và hội nhập sâu rộng.'
    },
    {
      id: 'crown_executive',
      name: 'Vương Miện Lãnh Đạo',
      subtitle: 'Cấp Ban Quản Trị',
      desc: 'Vương miện cách điệu hình học cao cấp, khẳng định vị thế tiên phong của Hội đồng Điều hành.'
    },
    {
      id: 'shield_crest',
      name: 'Khiên Bảo Mật Vững Chãi',
      subtitle: 'Bảo mật & Chuẩn ISO',
      desc: 'Chiếc khiên vững chắc cùng dấu kiểm định an ninh thông tin, đại diện cho sự tin cậy tuyệt đối.'
    }
  ];

  // Sidebar Themes Configuration
  const SIDEBAR_THEMES: {
    id: SidebarThemeOption;
    name: string;
    bgHex: string;
    borderHex: string;
    desc: string;
  }[] = [
    {
      id: 'deep_emerald',
      name: 'Xanh Đậm Sinh Thái (AeuxGlobal Original)',
      bgHex: '#072a27',
      borderHex: '#0c3f3b',
      desc: 'Tone màu rừng nhiệt đới sang trọng, tương phản cao với chữ trắng và ngọc lục bảo.'
    },
    {
      id: 'midnight_slate',
      name: 'Xanh Đen Slate Tối Tân',
      bgHex: '#0f172a',
      borderHex: '#1e293b',
      desc: 'Phong cách Cloud SaaS đẳng cấp thế giới, thanh lịch và tập trung tối đa.'
    },
    {
      id: 'royal_navy',
      name: 'Xanh Hải Quân Hoàng Gia',
      bgHex: '#0a192f',
      borderHex: '#132f54',
      desc: 'Màu xanh biển sâu biểu tượng cho sức mạnh chiến lược và sự uy nghiêm của Hội đồng quản trị.'
    },
    {
      id: 'charcoal_dark',
      name: 'Đen Than Chì Zinc Tối Thượng',
      bgHex: '#18181b',
      borderHex: '#27272a',
      desc: 'Tone màu đen than chì trung tính, tôn vinh các biểu tượng màu rực rỡ và dữ liệu nổi bật.'
    },
    {
      id: 'crisp_light',
      name: 'Trắng Sáng Thanh Lịch (Light Executive)',
      bgHex: '#ffffff',
      borderHex: '#e2e8f0',
      desc: 'Giao diện nền sáng trong trẻo, mang lại cảm giác nhẹ nhàng, dễ chịu cho mắt.'
    }
  ];

  // Background Canvas Themes
  const BG_THEMES: { id: BackgroundTheme; label: string; desc: string }[] = [
    {
      id: 'modern_grid',
      label: 'Lưới Hiện Đại (Modern Grid)',
      desc: 'Nền kỹ thuật công nghệ với họa tiết vi lưới tinh tế'
    },
    {
      id: 'soft_mesh',
      label: 'Gradient Mềm Mại (Soft Mesh)',
      desc: 'Hào quang ánh sắc dịu nhẹ, chuyển sắc hài hòa'
    },
    {
      id: 'pure_white',
      label: 'Trắng Tinh Khiết (Pure White)',
      desc: 'Tối giản, tương phản cao, tập trung tuyệt đối vào nội dung'
    },
    {
      id: 'warm_zinc',
      label: 'Ấm Áp Linen (Warm Zinc)',
      desc: 'Tông kem ấm bảo vệ mắt khi làm việc thời gian dài'
    },
    {
      id: 'dark_executive',
      label: 'Tối Đẳng Cấp (Dark Executive)',
      desc: 'Không gian làm việc ban đêm sang trọng'
    }
  ];

  // Handle Logo file upload (PNG / SVG / JPG)
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Kích thước ảnh vượt quá 2MB. Vui lòng chọn ảnh logo nhỏ gọn hơn.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData(prev => ({
        ...prev,
        logoType: 'custom_image',
        logoUrl: base64
      }));
    };
    reader.readAsDataURL(file);
  };

  // Remove custom logo and revert to symbol
  const handleRemoveCustomLogo = () => {
    setFormData(prev => ({
      ...prev,
      logoType: 'preset_symbol',
      logoUrl: undefined
    }));
  };

  // Select color preset
  const handleSelectColorPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setFormData(prev => ({
      ...prev,
      primaryColorPreset: preset.id,
      primaryColorHex: preset.hex
    }));
  };

  // Save changes
  const handleSaveBrand = () => {
    if (!isCEO) {
      alert('Quyền bị từ chối: Chỉ Ban Quản Trị (Tổng Giám Đốc - CEO) mới có quyền lưu cấu hình thương hiệu doanh nghiệp.');
      return;
    }

    if (!formData.companyName.trim()) {
      alert('Vui lòng nhập tên công ty / thương hiệu.');
      return;
    }

    updateBrandConfig(formData);
    setSaveSuccess(true);
    celebrate();
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  // Revert to initial or default
  const handleResetToDefault = () => {
    if (!isCEO) {
      alert('Quyền bị từ chối: Chỉ Ban Quản Trị mới có quyền khôi phục cài đặt gốc.');
      return;
    }

    if (window.confirm('Bạn có chắc chắn muốn khôi phục giao diện, logo, màu sắc và phông chữ về mặc định AeuxGlobal ban đầu?')) {
      resetBrandConfig();
      setFormData({
        companyName: 'Mrex Agency',
        tagline: 'Giải Pháp Marketing Thông Minh',
        description: 'Hệ thống quản trị doanh nghiệp toàn diện: Chấm công, Giao việc & Dự Án, Đánh giá KPI/OKR và Báo cáo điều hành.',
        companyAddress: 'T17-31 Khu Manhattan Glory, Vinhomes Grand Park, Quận 9',
        logoType: 'custom_image',
        logoUrl: '/logo.png',
        logoSymbolId: 'double_leaf',
        primaryColorPreset: 'ocean_breeze',
        primaryColorHex: '#1e3a8a',
        sidebarTheme: 'glass_navy',
        backgroundTheme: 'glass_gradient',
        fontFamily: 'Be Vietnam Pro',
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      {!isCEO && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Chế độ xem trước cấu hình:</span> Bạn đang đăng nhập ở vai trò{' '}
              <span className="font-semibold underline">{currentUser.roleTitle}</span>. Chỉ cấp{' '}
              <strong>Ban Quản Trị (Tổng Giám Đốc - CEO)</strong> mới có thẩm quyền lưu và áp dụng thương hiệu toàn doanh nghiệp.
            </div>
          </div>
          <span className="font-mono text-[10px] px-2 py-0.5 bg-amber-200/60 rounded text-amber-800 font-bold shrink-0">
            VIEW ONLY
          </span>
        </div>
      )}

      {/* 1. REAL-TIME LIVE PREVIEW CARD */}
      <div className="bg-white text-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: formData.primaryColorHex }}
            >
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-slate-900">
                Mô Phỏng Trực Tiếp Thương Hiệu (Live Brand Preview)
              </h2>
              <p className="text-[11px] text-slate-500">
                Giao diện và nhận diện sẽ hiển thị ngay lập tức trên hệ sinh thái phần mềm
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-mono">
              Phông chữ: <strong className="text-slate-800">{formData.fontFamily}</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-[11px] text-slate-400 font-mono">
              Màu: <span style={{ color: formData.primaryColorHex }} className="font-bold">{formData.primaryColorHex}</span>
            </span>
          </div>
        </div>

        {/* Live Mock Header Preview Component */}
        <div
          className="rounded-xl p-4 sm:p-5 border shadow-inner transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          style={{
            fontFamily: `"${formData.fontFamily}", sans-serif`,
            backgroundColor: formData.sidebarTheme === 'crisp_light' ? '#f8fafc' : '#041c19',
            borderColor: `${formData.primaryColorHex}40`
          }}
        >
          {/* Logo & Brand Info Preview */}
          <div className="flex items-center gap-3.5">
            <BrandLogo
              logoType={formData.logoType}
              logoUrl={formData.logoUrl}
              symbolId={formData.logoSymbolId}
              primaryColor={formData.primaryColorHex}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-base sm:text-lg font-extrabold tracking-tight"
                  style={{
                    color: formData.sidebarTheme === 'crisp_light' ? '#0f172a' : '#ffffff'
                  }}
                >
                  {formData.companyName || 'Tên Công Ty'}
                </span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${formData.primaryColorHex}25`,
                    color: formData.primaryColorHex,
                    border: `1px solid ${formData.primaryColorHex}50`
                  }}
                >
                  Enterprise
                </span>
              </div>
              <div
                className="text-xs font-medium tracking-wide mt-0.5"
                style={{
                  color: formData.sidebarTheme === 'crisp_light' ? '#64748b' : `${formData.primaryColorHex}dd`
                }}
              >
                {formData.tagline || 'Khẩu hiệu doanh nghiệp'}
              </div>
            </div>
          </div>

          {/* Quick interactive mock buttons in selected brand accent */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              className="px-3.5 py-1.5 rounded-lg text-white font-bold shadow-xs transition-transform transform active:scale-95 flex items-center gap-1.5"
              style={{
                backgroundColor: formData.primaryColorHex
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nút Tác Vụ Chính</span>
            </button>

            <span
              className="px-3 py-1.5 rounded-lg font-medium text-xs border"
              style={{
                borderColor: `${formData.primaryColorHex}60`,
                color: formData.sidebarTheme === 'crisp_light' ? '#334155' : '#e2e8f0',
                backgroundColor: `${formData.primaryColorHex}12`
              }}
            >
              Huy hiệu mẫu
            </span>
          </div>
        </div>

        {/* Live Typography Preview String */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">
            Kiểm tra hiển thị dấu Tiếng Việt & Số học theo phông {formData.fontFamily}:
          </div>
          <div
            className="text-sm font-medium text-slate-200 leading-relaxed"
            style={{ fontFamily: `"${formData.fontFamily}", sans-serif` }}
          >
            "Cộng hòa Xã hội Chủ nghĩa Việt Nam - Hội đồng Quản trị chuẩn y ngân sách quý 4/2026: 125.800.000 VNĐ."
          </div>
        </div>
      </div>

      {/* Form sections grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Logo & Branding Info (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* SECTION 1: LOGO & BIỂU TƯỢNG */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ImageIcon className="w-4 h-4 text-[#0875D9]" />
                <span>1. Biểu Tượng & Logo Doanh Nghiệp</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {formData.logoType === 'custom_image' ? 'Ảnh tùy chỉnh' : 'Biểu tượng chuẩn'}
              </span>
            </div>

            {/* Logo type switcher */}
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-700">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, logoType: 'preset_symbol' }))}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  formData.logoType === 'preset_symbol'
                    ? 'bg-white text-[#0875D9] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Biểu Tượng Vector Chuẩn Doanh Nghiệp (Khuyên dùng)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, logoType: 'custom_image' }))}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  formData.logoType === 'custom_image'
                    ? 'bg-white text-[#0875D9] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Tải Ảnh Logo Lên (PNG, SVG, JPG)</span>
              </button>
            </div>

            {/* Mode A: Preset Symbol Selection */}
            {formData.logoType === 'preset_symbol' && (
              <div className="space-y-3 pt-1">
                <div className="text-xs text-slate-500">
                  Chọn biểu tượng đại diện doanh nghiệp (được vector hóa độ nét cao, tương thích mọi màn hình):
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SYMBOL_OPTIONS.map(sym => {
                    const isSelected = formData.logoSymbolId === sym.id;
                    return (
                      <div
                        key={sym.id}
                        onClick={() => setFormData(prev => ({ ...prev, logoSymbolId: sym.id }))}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-blue-50/60 border-[#0875D9] ring-2 ring-[#0875D9]/20 shadow-xs'
                            : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60 hover:border-slate-300'
                        }`}
                      >
                        <div className="p-2 rounded-xl bg-white border border-slate-200 shrink-0 shadow-xs">
                          <BrandLogo
                            logoType="preset_symbol"
                            symbolId={sym.id}
                            primaryColor={formData.primaryColorHex}
                            size="md"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {sym.name}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-[#0875D9] shrink-0" />
                            )}
                          </div>
                          <span className="inline-block text-[10px] font-semibold text-[#0875D9] mt-0.5">
                            {sym.subtitle}
                          </span>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                            {sym.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mode B: Custom Logo Upload */}
            {formData.logoType === 'custom_image' && (
              <div className="space-y-4 pt-1">
                <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center space-y-3">
                  {formData.logoUrl ? (
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 p-2 shadow-sm flex items-center justify-center">
                        <img
                          src={formData.logoUrl}
                          alt="Custom Logo Preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="text-xs text-slate-600">
                        Ảnh logo tùy chỉnh đã được nạp thành công
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCustomLogo}
                        className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa logo & Dùng lại biểu tượng gốc</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 py-2">
                      <div className="w-12 h-12 mx-auto rounded-full bg-[#EAF5FF] border border-[#0875D9]/25 flex items-center justify-center text-[#0875D9]">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800">
                          Bấm để tải tệp ảnh logo doanh nghiệp
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Hỗ trợ định dạng PNG (khuyên dùng nền trong suốt), SVG, JPG (Tối đa 2MB)
                        </p>
                      </div>
                      <label className="inline-block mt-2 px-4 py-2 bg-[#0875D9] hover:bg-[#065eb0] text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs transition-colors">
                        Chọn tệp từ máy tính
                        <input
                          type="file"
                          accept="image/png,image/svg+xml,image/jpeg,image/webp"
                          onChange={handleLogoFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Direct image URL input fallback */}
                <div className="text-xs space-y-1">
                  <label className="block text-slate-600 font-semibold">
                    Hoặc dán đường dẫn ảnh logo trực tiếp (URL):
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={formData.logoUrl || ''}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        logoType: 'custom_image',
                        logoUrl: e.target.value.trim() ? e.target.value : undefined
                      }))
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0875D9] font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: BRAND NAME, TAGLINE & DESCRIPTION */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Sliders className="w-4 h-4 text-[#0875D9]" />
                <span>2. Tên Doanh Nghiệp, Slogan & Mô Tả</span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên Thương Hiệu Doanh Nghiệp / Nền Tảng *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Ví dụ: AeuxGlobal, OmniCorp ERP, VinGroup..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0875D9]"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Tên này sẽ hiển thị trang trọng trên Sidebar, thanh Marquee, tiêu đề trang và biểu mẫu kế toán.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Khẩu Hiệu Ngắn / Định Vị Nền Tảng (Tagline)
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                  placeholder="Ví dụ: OmniCorp Platform, Enterprise Operating System..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0875D9]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mô Tả Tổng Quan Hệ Thống / Doanh Nghiệp
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả chức năng cốt lõi hoặc thông điệp sứ mệnh của doanh nghiệp..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0875D9] leading-relaxed"
                />
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Được hiển thị tại màn hình đăng nhập công vụ và phần giới thiệu chính thức.
                </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Địa Chỉ Văn Phòng
                </label>
                <input
                  type="text"
                  value={formData.companyAddress || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyAddress: e.target.value }))}
                  placeholder="VD: T17-31 Khu Manhattan Glory, Vinhomes Grand Park, Quận 9"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0875D9]"
                />
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Hiển thị trên thanh bên sidebar và trang đăng nhập.
                </p>
              </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Typography, Color & Sidebar Theme (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* SECTION 3: TYPOGRAPHY & FONT CHỮ */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Type className="w-4 h-4 text-[#0875D9]" />
                <span>3. Phông Chữ Toàn Doanh Nghiệp</span>
              </div>
              <span className="text-[11px] text-[#0875D9] font-mono font-bold">
                {formData.fontFamily}
              </span>
            </div>

            <div className="space-y-2.5">
              {FONT_OPTIONS.map(font => {
                const isSelected = formData.fontFamily === font.id;
                return (
                  <div
                    key={font.id}
                    onClick={() => setFormData(prev => ({ ...prev, fontFamily: font.id }))}
                    className={`p-3 rounded-xl border cursor-pointer transition-all text-left ${
                      isSelected
                        ? 'bg-blue-50/70 border-[#0875D9] ring-2 ring-[#0875D9]/20 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm font-bold text-slate-900"
                          style={{ fontFamily: `"${font.id}", sans-serif` }}
                        >
                          {font.name}
                        </span>
                        {font.id === 'Be Vietnam Pro' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">
                            Chuẩn VN
                          </span>
                        )}
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#0875D9] shrink-0" />}
                    </div>

                    <p className="text-[11px] text-slate-500 mt-0.5">{font.desc}</p>
                    <div
                      className="text-xs text-slate-800 mt-1 font-medium truncate pt-1 border-t border-slate-200/50"
                      style={{ fontFamily: `"${font.id}", sans-serif` }}
                    >
                      {font.sample}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: MÀU SẮC NHẬN DIỆN (BRAND COLOR ACCENT) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Palette className="w-4 h-4 text-[#0875D9]" />
                <span>4. Màu Sắc Nhận Diện Thương Hiệu</span>
              </div>
              <div
                className="w-4 h-4 rounded-full border border-slate-300"
                style={{ backgroundColor: formData.primaryColorHex }}
              />
            </div>

            {/* Color swatches */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {COLOR_PRESETS.map(preset => {
                  const isSelected = formData.primaryColorHex.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectColorPreset(preset)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        isSelected
                          ? 'bg-slate-50 border-slate-900 ring-2 ring-slate-900/10 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-lg shrink-0 shadow-xs border border-white"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold text-slate-900 truncate">
                          {preset.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {preset.hex}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Hex Color Picker */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.primaryColorHex}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        primaryColorPreset: 'custom',
                        primaryColorHex: e.target.value
                      }))
                    }
                    className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <div>
                    <span className="font-bold text-slate-800">Tùy biến mã màu Hex</span>
                    <p className="text-[10px] text-slate-500">Mã màu chuẩn của công ty</p>
                  </div>
                </div>

                <input
                  type="text"
                  value={formData.primaryColorHex}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      primaryColorPreset: 'custom',
                      primaryColorHex: e.target.value
                    }))
                  }
                  placeholder="#10b981"
                  className="w-24 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 uppercase text-center"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: THEME MENU SIDEBAR & BACKGROUND CANVAS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Layout className="w-4 h-4 text-[#0875D9]" />
                <span>5. Giao Diện Sidebar & Canvas</span>
              </div>
            </div>

            {/* Sidebar Theme Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Phong cách Thanh Menu Sidebar:
              </label>
              <div className="space-y-2">
                {SIDEBAR_THEMES.map(theme => {
                  const isSelected = formData.sidebarTheme === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => setFormData(prev => ({ ...prev, sidebarTheme: theme.id }))}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-slate-50 border-slate-900 ring-2 ring-slate-900/10'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-6 h-6 rounded-lg shrink-0 border shadow-xs"
                          style={{
                            backgroundColor: theme.bgHex,
                            borderColor: theme.borderHex
                          }}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {theme.name}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {theme.desc}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-slate-900 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Canvas Background Theme Picker */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700">
                Nền Không Gian Làm Việc (Canvas Background):
              </label>
              <select
                value={formData.backgroundTheme}
                onChange={(e) => setFormData(prev => ({ ...prev, backgroundTheme: e.target.value as BackgroundTheme }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0875D9]"
              >
                {BG_THEMES.map(bg => (
                  <option key={bg.id} value={bg.id}>
                    {bg.label} - {bg.desc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="sticky bottom-4 z-20 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>
            {brandConfig.updatedAt
              ? `Cập nhật lần cuối: ${brandConfig.updatedAt} bởi ${brandConfig.updatedBy || 'CEO'}`
              : 'Cấu hình tiêu chuẩn theo hệ sinh thái AeuxGlobal Enterprise'}
          </span>
          {saveSuccess && (
            <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40 animate-in fade-in flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã áp dụng toàn hệ thống!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleResetToDefault}
            disabled={!isCEO}
            className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50"
            title="Khôi phục lại giao diện và thương hiệu ban đầu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục mặc định</span>
          </button>

          <button
            type="button"
            onClick={handleSaveBrand}
            disabled={!isCEO}
            className="px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: formData.primaryColorHex
            }}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Áp Dụng Toàn Doanh Nghiệp (CEO)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
