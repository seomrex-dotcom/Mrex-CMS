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
  Info,
  X,
  Layers,
  Settings,
  Building
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

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BoardBrandSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    brandConfig,
    updateBrandConfig,
    resetBrandConfig,
    celebrate
  } = useApp();

  const isCEO = currentUser.role === 'CEO';

  // Draft state
  const [formData, setFormData] = useState<CompanyBrandConfig>({ ...brandConfig });
  const [activeTab, setActiveTab] = useState<'logo_info' | 'fonts' | 'colors' | 'background'>('logo_info');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync draft when opened or brandConfig changes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({ ...brandConfig });
      setSaveSuccess(false);
    }
  }, [isOpen, brandConfig]);

  if (!isOpen) return null;

  // Font options
  const FONT_OPTIONS: { id: FontFamilyOption; name: string; desc: string; sample: string }[] = [
    {
      id: 'Be Vietnam Pro',
      name: 'Be Vietnam Pro',
      desc: 'Tối ưu tuyệt hảo cho Tiếng Việt, thanh nhã và chuyên nghiệp',
      sample: 'Cộng hòa Xã hội Chủ nghĩa Việt Nam - AeuxGlobal ERP'
    },
    {
      id: 'Inter',
      name: 'Inter',
      desc: 'Chuẩn mực phần mềm quốc tế, sắc nét trên mọi màn hình',
      sample: 'Enterprise Platform ERP & Global Management'
    },
    {
      id: 'Plus Jakarta Sans',
      name: 'Plus Jakarta Sans',
      desc: 'Hiện đại, năng động, mang phong cách công nghệ thế hệ mới',
      sample: 'Đổi mới sáng tạo & Tăng trưởng bền vững 2026'
    },
    {
      id: 'Outfit',
      name: 'Outfit',
      desc: 'Hình học tối giản, cao cấp và tinh gọn đậm chất thương hiệu',
      sample: 'Executive Leadership & Strategic Management'
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

  // Preset Colors
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
      desc: 'Sinh thái, bền vững & công nghệ'
    },
    {
      id: 'indigo',
      name: 'Xanh Chàm Công Nghệ',
      hex: '#6366f1',
      desc: 'Hiện đại, chuyên sâu và giải pháp số'
    },
    {
      id: 'violet',
      name: 'Tím Hoàng Gia Sáng Tạo',
      hex: '#8b5cf6',
      desc: 'Tinh hoa, quyền lực và đột phá'
    },
    {
      id: 'cyan',
      name: 'Xanh Biển Cyan Tương Lai',
      hex: '#06b6d4',
      desc: 'Trực quan, năng động và dữ liệu'
    },
    {
      id: 'amber',
      name: 'Vàng Hổ Phách Thịnh Vượng',
      hex: '#f59e0b',
      desc: 'Tài chính, ngân sách và thành tựu'
    },
    {
      id: 'rose',
      name: 'Đỏ Ruby Quyết Sách',
      hex: '#f43f5e',
      desc: 'Nhiệt huyết, kiên định và lãnh đạo'
    },
    {
      id: 'slate',
      name: 'Xám Than Chì Tối Giản',
      hex: '#475569',
      desc: 'Lịch lãm, tập trung và vững chắc'
    }
  ];

  // Background Options
  const BACKGROUND_THEMES: {
    id: BackgroundTheme;
    name: string;
    desc: string;
    previewBg: string;
  }[] = [
    {
      id: 'modern_grid',
      name: 'Lưới Vi Mô Kỹ Thuật (Modern Grid)',
      desc: 'Họa tiết chấm lưới ô vuông vi mô mờ nhạt chuẩn AeuxGlobal',
      previewBg: 'bg-[#f8fafc] border-dashed border-slate-300'
    },
    {
      id: 'pure_white',
      name: 'Trắng Phẳng Tinh Khiết (Pure White)',
      desc: 'Nền trắng thuần khiết, tối giản, độ tương phản tuyệt đối',
      previewBg: 'bg-white'
    },
    {
      id: 'soft_mesh',
      name: 'Dải Gradient Nhẹ (Soft Mesh)',
      desc: 'Chuyển sắc mượt mà giữa ngọc lục bảo và xanh nhạt',
      previewBg: 'bg-gradient-to-br from-emerald-50/50 via-teal-50/30 to-sky-50/40'
    },
    {
      id: 'warm_zinc',
      name: 'Xám Ấm Sang Trọng (Warm Zinc)',
      desc: 'Tông màu xám kim loại ấm cúng, êm mắt khi làm việc lâu',
      previewBg: 'bg-[#f4f4f5]'
    },
    {
      id: 'dark_executive',
      name: 'Đen Quyền Lực Ban Giám Đốc (Dark Executive)',
      desc: 'Tone màu sẫm đen sang trọng dành riêng cho phòng họp kín',
      previewBg: 'bg-[#0f172a]'
    }
  ];

  // Logo Symbols
  const LOGO_SYMBOLS: {
    id: LogoSymbolOption;
    name: string;
    subtitle: string;
    desc: string;
  }[] = [
    {
      id: 'double_leaf',
      name: 'Song Diệp AeuxGlobal',
      subtitle: 'Mẫu nhận diện gốc',
      desc: 'Hai phiến lá xoay góc thanh thoát, tượng trưng cho sinh thái số, bền vững.'
    },
    {
      id: 'tech_hexagon',
      name: 'Lục Lăng Kiến Trúc Số',
      subtitle: 'Công nghệ & Kỹ thuật',
      desc: 'Khối đa giác liên kết chặt chẽ, thể hiện điện toán vững chắc.'
    },
    {
      id: 'quantum_prism',
      name: 'Lăng Kính Đa Diện',
      subtitle: 'Sáng tạo & Tinh hoa',
      desc: 'Phản chiếu ánh sáng, đại diện cho giá trị tinh hoa và minh bạch.'
    },
    {
      id: 'globe_core',
      name: 'Mạng Lưới Toàn Cầu',
      subtitle: 'Vươn tầm quốc tế',
      desc: 'Quả địa cầu số thể hiện tầm nhìn mở rộng thị trường.'
    },
    {
      id: 'crown_executive',
      name: 'Vương Miện Lãnh Đạo',
      subtitle: 'Cấp Ban Quản Trị',
      desc: 'Vương miện hình học cao cấp khẳng định vị thế dẫn đầu.'
    },
    {
      id: 'shield_crest',
      name: 'Khiên Bảo Mật Vững Chãi',
      subtitle: 'Bảo mật & Chuẩn ISO',
      desc: 'Chiếc khiên vững chắc cùng chứng nhận an ninh thông tin.'
    }
  ];

  // Sidebar Themes
  const SIDEBAR_THEMES: {
    id: SidebarThemeOption;
    name: string;
    bgHex: string;
    desc: string;
  }[] = [
    {
      id: 'deep_emerald',
      name: 'Deep Emerald (AeuxGlobal Original)',
      bgHex: '#072a27',
      desc: 'Tone màu rừng nhiệt đới sang trọng, tương phản cao chữ trắng ngọc lục bảo.'
    },
    {
      id: 'midnight_slate',
      name: 'Midnight Slate (Tối Tân)',
      bgHex: '#0f172a',
      desc: 'Phong cách Cloud SaaS đẳng cấp, thanh lịch và tập trung tối đa.'
    },
    {
      id: 'royal_navy',
      name: 'Royal Navy (Hải Quân Hoàng Gia)',
      bgHex: '#0a192f',
      desc: 'Xanh biển sâu biểu tượng cho sức mạnh chiến lược ban quản trị.'
    },
    {
      id: 'charcoal_dark',
      name: 'Charcoal Dark (Than Chì)',
      bgHex: '#18181b',
      desc: 'Tone than chì trung tính, làm nổi bật dữ liệu bảng biểu.'
    },
    {
      id: 'crisp_light',
      name: 'Crisp Light (Trắng Sáng)',
      bgHex: '#ffffff',
      desc: 'Nền sáng tối giản hiện đại cho môi trường văn phòng trẻ trung.'
    }
  ];

  // File Upload Handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Vui lòng chọn ảnh logo dung lượng dưới 2MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logoType: 'custom_image',
          logoUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateBrandConfig(formData);
    setSaveSuccess(true);
    celebrate();
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    if (window.confirm('Khôi phục toàn bộ cài đặt nhận diện thương hiệu về mặc định của AeuxGlobal?')) {
      resetBrandConfig();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 text-slate-800">
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 bg-[#072a27] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/80 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Cài Đặt Cấp Ban Quản Trị
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500 text-slate-950 uppercase">
                  BOD Settings
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Tùy chỉnh Logo, Mô tả công ty, Phông chữ Tiếng Việt, Bảng màu và Nền hiển thị toàn hệ thống
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ROLE NOTICE */}
        {!isCEO && (
          <div className="px-6 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs flex items-center gap-2 shrink-0">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Lưu ý:</strong> Bạn đang đăng nhập với vai trò <strong>{currentUser.roleTitle}</strong>. Quyền lưu thay đổi thương hiệu chỉ dành cho <strong>Tổng Giám Đốc (CEO / Ban Quản Trị)</strong>. Bạn có thể xem thử các tùy chọn bên dưới.
            </span>
          </div>
        )}

        {/* TAB NAVIGATION */}
        <div className="px-6 border-b border-slate-200 bg-slate-50/80 flex items-center gap-2 overflow-x-auto shrink-0 py-2">
          <button
            onClick={() => setActiveTab('logo_info')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'logo_info'
                ? 'bg-[#072a27] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>1. Logo & Mô Tả Công Ty</span>
          </button>

          <button
            onClick={() => setActiveTab('fonts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'fonts'
                ? 'bg-[#072a27] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>2. Phông Chữ (Fonts)</span>
          </button>

          <button
            onClick={() => setActiveTab('colors')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'colors'
                ? 'bg-[#072a27] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>3. Màu Sắc & Sidebar</span>
          </button>

          <button
            onClick={() => setActiveTab('background')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'background'
                ? 'bg-[#072a27] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>4. Background Canvas</span>
          </button>
        </div>

        {/* TAB CONTENT (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: LOGO & THÔNG TIN CÔNG TY */}
          {activeTab === 'logo_info' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Logo Selection Section */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                      <span>Logo Doanh Nghiệp</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Chọn biểu tượng tiêu chuẩn hoặc tải lên ảnh logo thương hiệu riêng của bạn
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 text-xs">
                    <button
                      onClick={() => setFormData(p => ({ ...p, logoType: 'preset_symbol' }))}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        formData.logoType === 'preset_symbol'
                          ? 'bg-[#072a27] text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Biểu Tượng Mẫu
                    </button>
                    <button
                      onClick={() => setFormData(p => ({ ...p, logoType: 'custom_image' }))}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        formData.logoType === 'custom_image'
                          ? 'bg-[#072a27] text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Tải Logo Lên
                    </button>
                  </div>
                </div>

                {/* Mode A: Custom Upload */}
                {formData.logoType === 'custom_image' ? (
                  <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-white rounded-xl border border-slate-200">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center p-2 shrink-0">
                      {formData.logoUrl ? (
                        <img
                          src={formData.logoUrl}
                          alt="Custom logo"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                      )}
                    </div>

                    <div className="space-y-2 flex-1 text-center sm:text-left">
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-all">
                        <Upload className="w-4 h-4" />
                        <span>Chọn Tệp Ảnh Logo (PNG, SVG, JPG)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-slate-400">
                        Khuyến nghị tỷ lệ vuông 1:1 hoặc ngang 3:1, nền trong suốt (PNG/SVG), dung lượng dưới 2MB.
                      </p>
                    </div>

                    {formData.logoUrl && (
                      <button
                        onClick={() =>
                          setFormData(p => ({
                            ...p,
                            logoUrl: undefined,
                            logoType: 'preset_symbol'
                          }))
                        }
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Xóa</span>
                      </button>
                    )}
                  </div>
                ) : (
                  /* Mode B: Preset Symbols */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {LOGO_SYMBOLS.map(symbol => (
                      <div
                        key={symbol.id}
                        onClick={() =>
                          setFormData(p => ({
                            ...p,
                            logoSymbolId: symbol.id,
                            logoType: 'preset_symbol'
                          }))
                        }
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          formData.logoSymbolId === symbol.id && formData.logoType === 'preset_symbol'
                            ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#072a27] p-2 shrink-0 flex items-center justify-center">
                          <BrandLogo
                            logoType="preset_symbol"
                            symbolId={symbol.id}
                            primaryColor={formData.primaryColorHex}
                            size="md"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-slate-900 truncate">
                            {symbol.name}
                          </div>
                          <div className="text-[10px] text-emerald-700 font-semibold truncate">
                            {symbol.subtitle}
                          </div>
                          <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">
                            {symbol.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Company Info Fields */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Building className="w-4 h-4 text-emerald-600" />
                  <span>Tên Công Ty, Khẩu Hiệu & Mô Tả</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tên Thương Hiệu Doanh Nghiệp <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={e => setFormData(p => ({ ...p, companyName: e.target.value }))}
                      placeholder="Ví dụ: AeuxGlobal, OmniCorp, FPT..."
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Hiển thị trên Sidebar, Header, phiếu in chứng từ và báo cáo
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Khẩu Hiệu / Slogan (Tagline)
                    </label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={e => setFormData(p => ({ ...p, tagline: e.target.value }))}
                      placeholder="Ví dụ: OmniCorp Platform, Kiến tạo tương lai..."
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Hiển thị phụ bên dưới logo trên thanh điều hướng bên trái
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mô Tả Doanh Nghiệp
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                    placeholder="Mô tả tóm tắt về sứ mệnh, lĩnh vực hoạt động của công ty..."
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PHÔNG CHỮ TIẾNG VIỆT */}
          {activeTab === 'fonts' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Tất cả các phông chữ dưới đây đều được tích hợp đầy đủ bảng mã Tiếng Việt, hiển thị sắc nét trên cả màn hình Desktop và Mobile.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {FONT_OPTIONS.map(font => (
                  <div
                    key={font.id}
                    onClick={() => setFormData(p => ({ ...p, fontFamily: font.id }))}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      formData.fontFamily === font.id
                        ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="font-bold text-sm text-slate-900" style={{ fontFamily: `"${font.id}", sans-serif` }}>
                          {font.name}
                        </div>
                        {formData.fontFamily === font.id ? (
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                            <Check className="w-3 h-3" />
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full border border-slate-300" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2">
                        {font.desc}
                      </p>
                    </div>

                    <div
                      className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-800 border border-slate-100"
                      style={{ fontFamily: `"${font.id}", sans-serif` }}
                    >
                      <div className="font-bold">{font.sample}</div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        1234567890 · Á, Ế, Ố, Ứ, Ợ, Đ, Ỷ · Hệ thống ERP OmniCorp
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MÀU SẮC & SIDEBAR THEME */}
          {activeTab === 'colors' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Primary Color Palette */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-emerald-600" />
                      <span>Màu Sắc Nhận Diện Chủ Đạo</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Áp dụng cho biểu tượng, nút bấm quan trọng, chỉ số KPI và điểm nhấn giao diện
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">Mã màu:</span>
                    <input
                      type="color"
                      value={formData.primaryColorHex}
                      onChange={e =>
                        setFormData(p => ({
                          ...p,
                          primaryColorHex: e.target.value,
                          primaryColorPreset: 'custom'
                        }))
                      }
                      className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200"
                    />
                    <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-1 rounded-lg border border-slate-200">
                      {formData.primaryColorHex}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {COLOR_PRESETS.map(preset => (
                    <div
                      key={preset.id}
                      onClick={() =>
                        setFormData(p => ({
                          ...p,
                          primaryColorPreset: preset.id,
                          primaryColorHex: preset.hex
                        }))
                      }
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                        formData.primaryColorHex.toLowerCase() === preset.hex.toLowerCase()
                          ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-lg shrink-0 shadow-inner flex items-center justify-center text-white"
                        style={{ backgroundColor: preset.hex }}
                      >
                        {formData.primaryColorHex.toLowerCase() === preset.hex.toLowerCase() && (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {preset.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {preset.hex}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Theme Palette */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>Màu Giao Diện Menu Bên Trái (Sidebar Theme)</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tùy chọn phong cách màu nền cho cột điều hướng Menu chính
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {SIDEBAR_THEMES.map(theme => (
                    <div
                      key={theme.id}
                      onClick={() => setFormData(p => ({ ...p, sidebarTheme: theme.id }))}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                        formData.sidebarTheme === theme.id
                          ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-xl border border-slate-300/40 shrink-0 flex items-center justify-center shadow-inner"
                        style={{ backgroundColor: theme.bgHex }}
                      >
                        {formData.sidebarTheme === theme.id && (
                          <Check
                            className={`w-4 h-4 ${
                              theme.id === 'crisp_light' ? 'text-slate-900' : 'text-white'
                            }`}
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {theme.name}
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          {theme.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BACKGROUND CANVAS */}
          {activeTab === 'background' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-500 shrink-0" />
                <span>
                  Hình nền không gian làm việc (Background) hiển thị phía sau các thẻ Dashboard và các bảng biểu của ứng dụng.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {BACKGROUND_THEMES.map(theme => (
                  <div
                    key={theme.id}
                    onClick={() => setFormData(p => ({ ...p, backgroundTheme: theme.id }))}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      formData.backgroundTheme === theme.id
                        ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="font-bold text-xs sm:text-sm text-slate-900">
                          {theme.name}
                        </div>
                        {formData.backgroundTheme === theme.id ? (
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                            <Check className="w-3 h-3" />
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full border border-slate-300" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2">
                        {theme.desc}
                      </p>
                    </div>

                    <div className={`mt-3 h-14 rounded-xl border border-slate-200 shadow-inner p-2 flex items-center justify-center ${theme.previewBg}`}>
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-white/70 px-2 py-0.5 rounded backdrop-blur-xs">
                        Xem thử nền
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi Phục Mặc Định</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Hủy Bỏ
            </button>

            <button
              disabled={!isCEO}
              onClick={handleSave}
              className={`flex-1 sm:flex-initial px-6 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${
                isCEO
                  ? 'bg-[#072a27] hover:bg-[#0c3f3b] text-white cursor-pointer active:scale-98'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Đã Áp Dụng Toàn Hệ Thống!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Lưu & Áp Dụng Cài Đặt</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
