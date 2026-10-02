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
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface QuickLinkItem {
  id: 'fanpage' | 'ads' | 'enterprise';
  title: string;
  subtitle: string;
  badge: string;
  url: string;
  colorGradient: string;
  glowColor: string;
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
    setTempUrls(DEFAULT_LINKS);
  };

  const linksConfig: QuickLinkItem[] = [
    {
      id: 'fanpage',
      title: 'CMS Quản Trị Fanpage',
      subtitle: 'Quản lý Fanpage, tin nhắn & Social Media',
      badge: 'Fanpage Hub',
      url: urls.fanpage || DEFAULT_LINKS.fanpage,
      colorGradient: 'from-[#1877F2] via-[#0A66C2] to-[#3B5998]',
      glowColor: 'shadow-blue-500/35 border-blue-400/40',
      icon: Share2,
    },
    {
      id: 'ads',
      title: 'CMS Web Ads',
      subtitle: 'Quản trị chiến dịch quảng cáo & chi phí Ads',
      badge: 'Ads Manager',
      url: urls.ads || DEFAULT_LINKS.ads,
      colorGradient: 'from-[#FF5E36] via-[#FF3366] to-[#E11D48]',
      glowColor: 'shadow-rose-500/35 border-rose-400/40',
      icon: Target,
    },
    {
      id: 'enterprise',
      title: 'CMS Quản Trị Doanh Nghiệp',
      subtitle: 'Hệ thống ERP, nhân sự, tài chính & điều hành',
      badge: 'Core Enterprise',
      url: urls.enterprise || DEFAULT_LINKS.enterprise,
      colorGradient: 'from-[#0875D9] via-[#0284C7] to-[#0D9488]',
      glowColor: 'shadow-cyan-500/35 border-cyan-400/40',
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
           FLOATING QUICK ACCESS DOCK (Right Middle Edge)
           ============================================================ */}
      <aside
        aria-label="Thanh công cụ liên kết nhanh CMS"
        className="fixed right-2 sm:right-3.5 top-1/2 -translate-y-1/2 z-40 select-none flex flex-col items-center gap-2.5 p-1.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/60 dark:border-slate-700/60 shadow-xl shadow-slate-900/10 group/dock transition-all"
      >
        {/* Subtle Grip indicator */}
        <div className="w-4 h-1 bg-slate-300 dark:bg-slate-600 rounded-full opacity-60" />

        {/* 3 Main Floating Action Buttons */}
        {linksConfig.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="relative group/btn flex items-center">
              <button
                type="button"
                onClick={() => handleButtonClick(item)}
                aria-label={item.title}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${item.colorGradient} text-white flex items-center justify-center shadow-lg ${item.glowColor} border cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0875D9] relative overflow-hidden`}
              >
                {/* Subtle shine overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-white/20 pointer-events-none" />

                {/* Animated pulse dot for active indicator */}
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white shadow-xs animate-ping opacity-60" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white/90 shadow-xs" />

                <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 relative z-10 transition-transform group-hover/btn:rotate-6" />
              </button>

              {/* Flyout Preview Tooltip Card (Appears to the left on hover) */}
              <div className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-start px-3.5 py-2.5 bg-slate-900/95 backdrop-blur-md text-white rounded-xl shadow-2xl border border-slate-700/80 min-w-[240px] max-w-[280px] pointer-events-none opacity-0 translate-x-3 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 group-hover/btn:pointer-events-auto transition-all duration-200 z-50">
                {/* Caret arrow pointing to the button */}
                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-900 rotate-45 border-r border-t border-slate-700/80" />

                <div className="flex items-center justify-between w-full gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 text-slate-200 border border-white/10">
                    {item.badge}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-white" />
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
                  <span className="text-[9px] text-slate-400 font-sans">Bấm để mở ↗</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Small Settings Gear for CEO/Manager */}
        {(currentUser.role === 'CEO' || currentUser.role === 'MANAGER') && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            title="Cấu hình URL hệ thống CMS liên kết"
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer mt-0.5"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        )}
      </aside>

      {/* ============================================================
           MODAL CẤU HÌNH LIÊN KẾT CMS FLOATING
           ============================================================ */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0875D9] text-white flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Cấu Hình Liên Kết Floating CMS
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tuỳ chỉnh 3 đường dẫn web nhanh ở cạnh phải màn hình
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
                  <Share2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>1. Link Web CMS Quản Trị Fanpage</span>
                </label>
                <input
                  type="url"
                  value={tempUrls.fanpage || ''}
                  onChange={e => setTempUrls({ ...tempUrls, fanpage: e.target.value })}
                  placeholder="https://fanpage.mrex.vn"
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0875D9]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-rose-600" />
                  <span>2. Link CMS Web Ads (Quảng Cáo)</span>
                </label>
                <input
                  type="url"
                  value={tempUrls.ads || ''}
                  onChange={e => setTempUrls({ ...tempUrls, ads: e.target.value })}
                  placeholder="https://ads.mrex.vn"
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0875D9]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-cyan-600" />
                  <span>3. Link Web CMS Quản Trị Doanh Nghiệp</span>
                </label>
                <input
                  type="url"
                  value={tempUrls.enterprise || ''}
                  onChange={e => setTempUrls({ ...tempUrls, enterprise: e.target.value })}
                  placeholder="https://cms.mrex.vn"
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0875D9]"
                />
              </div>

              {savedSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Đã lưu cấu hình đường dẫn thành công!</span>
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
                    className="px-4 py-2 rounded-xl bg-[#0875D9] hover:bg-[#065eb0] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Lưu Cấu Hình</span>
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
