import React, { useState, useEffect } from 'react';
import {
  Share2,
  Target,
  Building2,
  ExternalLink,
  Settings,
  X,
  Check,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface QuickLinkItem {
  id: 'fanpage' | 'ads' | 'enterprise';
  title: string;
  subtitle: string;
  badge: string;
  url: string;
  icon: React.ElementType;
}

const STORAGE_KEY = 'mrex_floating_dock_urls';

const DEFAULT_LINKS: Record<string, string> = {
  fanpage: 'https://fanpage.mrex.vn',
  ads: 'https://ads.mrex.vn',
  enterprise: 'https://cms.mrex.vn'
};

export const FloatingQuickAccessDock: React.FC = () => {
  const { currentUser, setActiveTab } = useApp();

  // Quyền: Chỉ cấp Ban Giám Đốc (CEO) mới được chỉnh sửa liên kết
  const isBoardOfDirectors = currentUser.role === 'CEO';

  const [urls, setUrls] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...DEFAULT_LINKS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_LINKS;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempUrls, setTempUrls] = useState(urls);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setTempUrls(urls);
  }, [urls]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBoardOfDirectors) return;
    setUrls(tempUrls);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tempUrls));
    } catch {}
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsEditing(false);
    }, 1200);
  };

  const handleReset = () => {
    if (!isBoardOfDirectors) return;
    setTempUrls(DEFAULT_LINKS);
  };

  const linksConfig: QuickLinkItem[] = [
    {
      id: 'fanpage',
      title: 'CMS Quản Trị Fanpage',
      subtitle: 'Quản lý Fanpage, tin nhắn & Social Media',
      badge: 'Fanpage Hub',
      url: urls.fanpage || DEFAULT_LINKS.fanpage,
      icon: Share2,
    },
    {
      id: 'ads',
      title: 'CMS Web Ads',
      subtitle: 'Quản trị chiến dịch quảng cáo & chi phí Ads',
      badge: 'Ads Manager',
      url: urls.ads || DEFAULT_LINKS.ads,
      icon: Target,
    },
    {
      id: 'enterprise',
      title: 'CMS Quản Trị Doanh Nghiệp',
      subtitle: 'Hệ thống ERP, nhân sự, tài chính & điều hành',
      badge: 'Core Enterprise',
      url: urls.enterprise || DEFAULT_LINKS.enterprise,
      icon: Building2,
    },
  ];

  const handleButtonClick = (item: QuickLinkItem) => {
    if (item.id === 'enterprise' && window.location.hostname.includes('mrex.vn')) {
      setActiveTab('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      {/* ============================================================
           LIGHT TONE & SOFTENED BLUE LAYERED GLASS FLOATING DOCK
           ============================================================ */}
      <aside
        aria-label="Thanh phím tắt liên kết nhanh CMS (Nền Sáng & Xanh Nhạt)"
        className="fixed right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-40 select-none flex flex-col items-center gap-3.5 p-2 rounded-[22px] bg-white/75 dark:bg-white/85 backdrop-blur-2xl border border-white/95 shadow-[0_10px_30px_rgba(37,99,235,0.12)] transition-all"
      >
        {/* Subtle Grip indicator */}
        <div className="w-5 h-1 bg-sky-200 rounded-full" />

        {/* 3 Layered Frosted Blue Glass Floating Buttons (Màu xanh dịu nhẹ, tươi sáng) */}
        {linksConfig.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="relative group/btn flex items-center">
              <button
                type="button"
                onClick={() => handleButtonClick(item)}
                aria-label={item.title}
                className="relative w-12 h-12 sm:w-[52px] sm:h-[52px] cursor-pointer focus:outline-none transition-transform duration-300 hover:scale-105 active:scale-95"
              >
                {/* 1. LAYER PHÍA SAU: Khối bo góc màu xanh dương nhạt dịu (Softened light blue) */}
                <div className="absolute inset-0 rounded-[16px] sm:rounded-[18px] bg-gradient-to-br from-[#68BDFF] via-[#489FFF] to-[#3B86F7] shadow-[0_6px_16px_rgba(59,134,247,0.26)] transform translate-x-1 -translate-y-1 transition-transform duration-300 group-hover/btn:translate-x-1.5 group-hover/btn:-translate-y-1.5" />

                {/* 2. LAYER PHÍA TRƯỚC: Mặt kính mờ Frosted Glass nền sáng mượt mà */}
                <div className="absolute inset-0 rounded-[16px] sm:rounded-[18px] bg-gradient-to-b from-white/90 via-sky-50/60 to-sky-100/40 backdrop-blur-md border border-white shadow-[0_8px_18px_rgba(56,189,248,0.18)] flex items-center justify-center transition-all duration-300 group-hover/btn:bg-white/95 group-hover/btn:shadow-[0_10px_22px_rgba(56,189,248,0.26)]">
                  {/* Subtle Top Glass Reflection Shine */}
                  <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-[16px] sm:rounded-t-[18px] bg-gradient-to-b from-white/80 to-transparent pointer-events-none" />

                  {/* Icon nổi bật màu trắng 3D với bóng đổ mềm */}
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10 transition-transform duration-300 group-hover/btn:rotate-6 drop-shadow-[0_1.5px_3px_rgba(30,64,175,0.42)] stroke-[2.2]" />
                </div>
              </button>

              {/* Flyout Preview Tooltip Card (NỀN SÁNG CAO CẤP - Bright Frosted Glass Card) */}
              <div className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-start px-3.5 py-3 bg-white/95 dark:bg-white/95 backdrop-blur-2xl text-slate-800 rounded-2xl shadow-[0_16px_36px_rgba(37,99,235,0.16)] border border-sky-100 min-w-[245px] max-w-[285px] pointer-events-none opacity-0 translate-x-3 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 group-hover/btn:pointer-events-auto transition-all duration-200 z-50">
                {/* Caret arrow pointing to the button (Nền trắng đồng bộ) */}
                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rotate-45 border-r border-t border-sky-100" />

                <div className="flex items-center justify-between w-full gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-50 text-[#0875D9] border border-sky-200/80">
                    {item.badge}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-[#0875D9] transition-colors" />
                </div>

                <h4 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <span>{item.title}</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  {item.subtitle}
                </p>

                <div className="mt-2.5 pt-2 border-t border-slate-100 w-full flex items-center justify-between text-[10px] font-mono">
                  <span className="truncate max-w-[170px] text-[#0875D9] font-medium underline underline-offset-2">
                    {item.url.replace(/^https?:\/\//, '')}
                  </span>
                  <span className="text-[9px] text-sky-600 font-semibold font-sans">Bấm để mở ↗</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Nút Bánh Răng Cài Đặt (CHỈ HIỂN THỊ VỚI CẤP BAN GIÁM ĐỐC / CEO) */}
        {isBoardOfDirectors && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            title="Ban Giám Đốc: Cấu hình liên kết hệ thống"
            className="w-8 h-8 rounded-xl text-sky-600 hover:text-[#0875D9] hover:bg-sky-50 bg-white/90 backdrop-blur-md border border-sky-100 transition-all flex items-center justify-center cursor-pointer mt-0.5 shadow-xs hover:shadow-sm"
          >
            <Settings className="w-4 h-4 animate-spin-slow" />
          </button>
        )}
      </aside>

      {/* ============================================================
           MODAL CẤU HÌNH LIÊN KẾT CMS FLOATING (DÀNH RIÊNG BAN GIÁM ĐỐC)
           ============================================================ */}
      {isEditing && isBoardOfDirectors && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-sky-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#68BDFF] to-[#3B86F7] text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Cấu Hình Liên Kết CMS Floating</span>
                    <span className="px-1.5 py-0.5 rounded bg-sky-100 text-[#0875D9] text-[9px] font-bold">Ban Giám Đốc</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Chỉ cấp Ban Giám Đốc có quyền điều chỉnh 3 liên kết cạnh phải
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>1. Link Web CMS Quản Trị Fanpage</span>
                </label>
                <input
                  type="url"
                  value={tempUrls.fanpage || ''}
                  onChange={e => setTempUrls({ ...tempUrls, fanpage: e.target.value })}
                  placeholder="https://fanpage.mrex.vn"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-sky-600" />
                  <span>2. Link CMS Web Ads (Quảng Cáo)</span>
                </label>
                <input
                  type="url"
                  value={tempUrls.ads || ''}
                  onChange={e => setTempUrls({ ...tempUrls, ads: e.target.value })}
                  placeholder="https://ads.mrex.vn"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>3. Link Web CMS Quản Trị Doanh Nghiệp</span>
                </label>
                <input
                  type="url"
                  value={tempUrls.enterprise || ''}
                  onChange={e => setTempUrls({ ...tempUrls, enterprise: e.target.value })}
                  placeholder="https://cms.mrex.vn"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              {savedSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Ban Giám Đốc đã lưu cấu hình đường dẫn thành công!</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-700 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-100"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Mặc định</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#68BDFF] to-[#3B86F7] hover:from-[#54A4FF] hover:to-[#2575FC] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/20 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Lưu Cấu Hình (CEO)</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
