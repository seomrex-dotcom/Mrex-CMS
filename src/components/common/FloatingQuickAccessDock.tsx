import React, { useState, useEffect } from 'react';
import {
  Share2,
  Target,
  Building2,
  ExternalLink,
  Settings,
  X,
  Check,
  ChevronRight,
  Layers,
  Sparkles,
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
      subtitle: 'Quản lý Fanpage, tin nhắn khách hàng & Social',
      badge: 'Fanpage Hub',
      url: urls.fanpage || DEFAULT_LINKS.fanpage,
      icon: Share2,
    },
    {
      id: 'ads',
      title: 'CMS Web Ads',
      subtitle: 'Quản trị chiến dịch quảng cáo đa kênh & chi phí',
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
           BRIGHT BLUE GLASS FLOATING DOCK (Cạnh Phải Giữa Màn Hình)
           ============================================================ */}
      <aside
        aria-label="Thanh phím tắt liên kết nhanh CMS (Bright Blue Glass)"
        className="fixed right-2 sm:right-3.5 top-1/2 -translate-y-1/2 z-40 select-none flex flex-col items-center gap-2.5 p-1.5 rounded-2xl bg-sky-950/20 dark:bg-slate-900/40 backdrop-blur-2xl border border-sky-300/40 dark:border-sky-500/30 shadow-2xl shadow-sky-900/25 ring-1 ring-white/30 group/dock transition-all"
      >
        {/* Subtle Grip Bar */}
        <div className="w-4 h-1 bg-sky-400/50 rounded-full" />

        {/* 3 Floating Bright Blue Glass Buttons */}
        {linksConfig.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="relative group/btn flex items-center">
              <button
                type="button"
                onClick={() => handleButtonClick(item)}
                aria-label={item.title}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-sky-400/35 via-blue-500/30 to-[#0875D9]/40 hover:from-[#0875D9]/90 hover:via-sky-500/90 hover:to-blue-600/90 backdrop-blur-xl border border-sky-300/70 hover:border-white shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-400/50 ring-1 ring-white/40 text-white flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-sky-400 relative overflow-hidden group-hover/btn:ring-2 group-hover/btn:ring-sky-200"
              >
                {/* Top Glass Gloss Reflection Highlight */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none rounded-t-xl" />

                {/* Animated Pulsing Active Cyan Dot */}
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-sky-200 shadow-sm animate-ping opacity-75" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-white shadow-sm" />

                <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 relative z-10 transition-transform duration-300 group-hover/btn:rotate-6 drop-shadow-md" />
              </button>

              {/* Flyout Preview Tooltip Card (Slide from right to left on hover) */}
              <div className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-start px-3.5 py-2.5 bg-slate-900/95 backdrop-blur-xl text-white rounded-xl shadow-2xl border border-sky-400/40 min-w-[240px] max-w-[280px] pointer-events-none opacity-0 translate-x-3 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 group-hover/btn:pointer-events-auto transition-all duration-200 z-50">
                {/* Caret arrow pointing to the button */}
                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-900 rotate-45 border-r border-t border-sky-400/40" />

                <div className="flex items-center justify-between w-full gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                    {item.badge}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400 group-hover/btn:text-white" />
                </div>

                <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>{item.title}</span>
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  {item.subtitle}
                </p>

                <div className="mt-2 pt-2 border-t border-slate-800 w-full flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="truncate max-w-[170px] text-sky-300 underline underline-offset-2">
                    {item.url.replace(/^https?:\/\//, '')}
                  </span>
                  <span className="text-[9px] text-sky-400 font-sans">Bấm để mở ↗</span>
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
            className="w-7 h-7 rounded-lg text-sky-400 hover:text-white hover:bg-sky-500/30 backdrop-blur-md border border-sky-400/30 transition-all flex items-center justify-center cursor-pointer mt-0.5 shadow-sm"
          >
            <Settings className="w-3.5 h-3.5 animate-spin-slow" />
          </button>
        )}
      </aside>

      {/* ============================================================
           MODAL CẤU HÌNH LIÊN KẾT CMS FLOATING (DÀNH RIÊNG BAN GIÁM ĐỐC)
           ============================================================ */}
      {isEditing && isBoardOfDirectors && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-sky-50/70 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-[#0875D9] text-white flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Cấu Hình Liên Kết CMS Floating</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">Ban Giám Đốc</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Chỉ cấp Ban Giám Đốc có quyền điều chỉnh 3 liên kết cạnh phải
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>1. Link Web CMS Quản Trị Fanpage</span>
                </label>
                <input
                  type="url"
                  value={tempUrls.fanpage || ''}
                  onChange={e => setTempUrls({ ...tempUrls, fanpage: e.target.value })}
                  placeholder="https://fanpage.mrex.vn"
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-sky-600" />
                  <span>2. Link CMS Web Ads (Quảng Cáo)</span>
                </label>
                <input
                  type="url"
                  value={tempUrls.ads || ''}
                  onChange={e => setTempUrls({ ...tempUrls, ads: e.target.value })}
                  placeholder="https://ads.mrex.vn"
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>3. Link Web CMS Quản Trị Doanh Nghiệp</span>
                </label>
                <input
                  type="url"
                  value={tempUrls.enterprise || ''}
                  onChange={e => setTempUrls({ ...tempUrls, enterprise: e.target.value })}
                  placeholder="https://cms.mrex.vn"
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {savedSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Ban Giám Đốc đã lưu cấu hình đường dẫn thành công!</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-700 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Mặc định</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-semibold text-xs"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-[#0875D9] hover:from-sky-600 hover:to-[#065eb0] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
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
