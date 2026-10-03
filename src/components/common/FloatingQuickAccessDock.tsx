import React, { useState, useEffect } from 'react';
import {
  Share2,
  Target,
  Building2,
  Headphones,
  HeartHandshake,
  PhoneCall,
  MessageSquare,
  Users,
  Globe,
  BarChart3,
  Sparkles,
  ShieldCheck,
  Briefcase,
  Layers,
  ExternalLink,
  Settings,
  X,
  Check,
  RotateCcw,
  Plus,
  Trash2,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/apiService';

export interface DockLinkItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  url: string;
  iconName: string;
}

// Available icons with friendly Vietnamese labels for the icon picker
export const DOCK_ICON_REGISTRY: Record<string, { label: string; icon: React.ElementType }> = {
  Headphones: { label: 'CSKH / Tổng đài', icon: Headphones },
  HeartHandshake: { label: 'Chăm sóc KH', icon: HeartHandshake },
  PhoneCall: { label: 'Telesale / Hotline', icon: PhoneCall },
  MessageSquare: { label: 'Chat / Tin nhắn', icon: MessageSquare },
  Share2: { label: 'Social / Fanpage', icon: Share2 },
  Target: { label: 'Ads / Mục tiêu', icon: Target },
  Building2: { label: 'Doanh nghiệp', icon: Building2 },
  Users: { label: 'Khách hàng / Nhóm', icon: Users },
  Globe: { label: 'Website / Toàn cầu', icon: Globe },
  BarChart3: { label: 'Báo cáo / Doanh số', icon: BarChart3 },
  Sparkles: { label: 'AI / Nổi bật', icon: Sparkles },
  ShieldCheck: { label: 'Bảo mật / Hệ thống', icon: ShieldCheck },
  Briefcase: { label: 'Dự án / Quản trị', icon: Briefcase },
  Layers: { label: 'Nền tảng / Khối', icon: Layers },
};

const STORAGE_KEY = 'mrex_v7_dock_links';

export const DEFAULT_DOCK_LINKS: DockLinkItem[] = [
  {
    id: 'fanpage',
    title: 'CMS Quản Trị Fanpage',
    subtitle: 'Quản lý Fanpage, lên lịch bài viết & Social Media',
    badge: 'Fanpage Hub',
    url: 'https://post.mrex.vn',
    iconName: 'Share2',
  },
  {
    id: 'ads',
    title: 'CMS Web Ads',
    subtitle: 'Quản trị chiến dịch quảng cáo & tối ưu ngân sách Ads',
    badge: 'Ads Manager',
    url: 'https://ads.mrex.vn',
    iconName: 'Target',
  },
  {
    id: 'crm',
    title: 'CRM Chăm Sóc Khách Hàng',
    subtitle: 'Quản lý quan hệ khách hàng, phân bổ leads & CSKH',
    badge: 'CRM CSKH',
    url: 'https://crm.mrex.vn',
    iconName: 'Headphones',
  },
  {
    id: 'enterprise',
    title: 'CMS Quản Trị Doanh Nghiệp',
    subtitle: 'Hệ thống ERP, quản trị nhân sự, tài chính & điều hành',
    badge: 'Core Enterprise',
    url: 'https://cms.mrex.vn',
    iconName: 'Building2',
  },
];

export const FloatingQuickAccessDock: React.FC = () => {
  const { currentUser, setActiveTab } = useApp();

  // Quyền: Chỉ cấp Ban Giám Đốc (CEO) mới được chỉnh sửa liên kết, tiêu đề và icon
  const isBoardOfDirectors = currentUser.role === 'CEO';

  const [links, setLinks] = useState<DockLinkItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_DOCK_LINKS;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [activeEditIndex, setActiveEditIndex] = useState<number>(0);
  const [tempLinks, setTempLinks] = useState<DockLinkItem[]>(links);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state across tabs and listen for changes
  useEffect(() => {
    setTempLinks(links);
  }, [links]);

  // Load authoritative dock config from VPS server database and cache locally
  useEffect(() => {
    ApiService.getDatabase().then(serverDb => {
      if (serverDb && Array.isArray((serverDb as any).dockLinks) && (serverDb as any).dockLinks.length > 0) {
        setLinks((serverDb as any).dockLinks);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify((serverDb as any).dockLinks));
        } catch {}
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const unsubscribe = ApiService.onBroadcast((msg) => {
      if (msg.type === 'DOCK_CONFIG_UPDATED' && Array.isArray(msg.data)) {
        setLinks(msg.data);
      } else if (msg.type === 'DATABASE_SYNC' && msg.data && Array.isArray((msg.data as any).dockLinks)) {
        setLinks((msg.data as any).dockLinks);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBoardOfDirectors) return;
    setLinks(tempLinks);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tempLinks));
      ApiService.broadcast('DOCK_CONFIG_UPDATED', tempLinks);
      ApiService.syncDatabase({ dockLinks: tempLinks } as any);
    } catch {}
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsEditing(false);
    }, 900);
  };

  const handleReset = () => {
    if (!isBoardOfDirectors) return;
    setTempLinks(DEFAULT_DOCK_LINKS);
    setLinks(DEFAULT_DOCK_LINKS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DOCK_LINKS));
      ApiService.broadcast('DOCK_CONFIG_UPDATED', DEFAULT_DOCK_LINKS);
      ApiService.syncDatabase({ dockLinks: DEFAULT_DOCK_LINKS } as any);
    } catch {}
  };

  const handleLinkChange = (index: number, field: keyof DockLinkItem, value: string) => {
    setTempLinks(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleButtonClick = (item: DockLinkItem) => {
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

        {/* 4 Layered Frosted Blue Glass Floating Buttons (Màu xanh dịu nhẹ, tươi sáng) */}
        {links.map((item) => {
          const iconEntry = DOCK_ICON_REGISTRY[item.iconName] || DOCK_ICON_REGISTRY.Globe;
          const IconComponent = iconEntry.icon;

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
                  <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10 transition-transform duration-300 group-hover/btn:rotate-6 drop-shadow-[0_1.5px_3px_rgba(30,64,175,0.42)] stroke-[2.2]" />
                </div>
              </button>

              {/* Flyout Preview Tooltip Card (NỀN SÁNG CAO CẤP - Bright Frosted Glass Card) */}
              <div className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-start px-3.5 py-3 bg-white/95 dark:bg-white/95 backdrop-blur-2xl text-slate-800 rounded-2xl shadow-[0_16px_36px_rgba(37,99,235,0.16)] border border-sky-100 min-w-[250px] max-w-[290px] pointer-events-none opacity-0 translate-x-3 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 group-hover/btn:pointer-events-auto transition-all duration-200 z-50">
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
            onClick={() => {
              setTempLinks(links);
              setActiveEditIndex(0);
              setIsEditing(true);
            }}
            title="Ban Giám Đốc: Cấu hình liên kết, tiêu đề và icon hệ thống"
            className="w-8 h-8 rounded-xl text-sky-600 hover:text-[#0875D9] hover:bg-sky-50 bg-white/90 backdrop-blur-md border border-sky-100 transition-all flex items-center justify-center cursor-pointer mt-0.5 shadow-xs hover:shadow-sm"
          >
            <Settings className="w-4 h-4 animate-spin-slow" />
          </button>
        )}
      </aside>

      {/* ============================================================
           MODAL CẤU HÌNH LIÊN KẾT, TIÊU ĐỀ & ICON (DÀNH RIÊNG BAN GIÁM ĐỐC)
           ============================================================ */}
      {isEditing && isBoardOfDirectors && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50/80 via-blue-50/40 to-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#68BDFF] to-[#3B86F7] text-white flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span>Cấu Hình Thanh Liên Kết Nhanh CMS</span>
                    <span className="px-2 py-0.5 rounded-full bg-sky-100 text-[#0875D9] text-[9px] font-bold">Ban Giám Đốc (CEO)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tùy chỉnh 4 liên kết nhanh (CRM CSKH, Fanpage, Ads, Doanh Nghiệp), đổi tiêu đề và biểu tượng icon
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
              {/* Tab Selector for 4 Links */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Chọn liên kết cần điều chỉnh:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {tempLinks.map((item, idx) => {
                    const iconObj = DOCK_ICON_REGISTRY[item.iconName] || DOCK_ICON_REGISTRY.Globe;
                    const ItemIcon = iconObj.icon;
                    const isActive = activeEditIndex === idx;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveEditIndex(idx)}
                        className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#EAF5FF] border-[#0875D9] text-[#0875D9] shadow-xs ring-1 ring-[#0875D9]'
                            : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-[#0875D9] text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                        }`}>
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <div className="truncate min-w-0">
                          <span className="block font-bold text-[11px] truncate">{item.badge}</span>
                          <span className="block text-[10px] text-slate-400 truncate">{item.title}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Editing Card for the Selected Link */}
              {tempLinks[activeEditIndex] && (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#0875D9]" />
                      <span>Chi tiết: {tempLinks[activeEditIndex].badge}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">ID: {tempLinks[activeEditIndex].id}</span>
                  </div>

                  {/* Title & Badge */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="block font-bold text-slate-700">
                        Tiêu đề hiển thị (Title) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={tempLinks[activeEditIndex].title}
                        onChange={e => handleLinkChange(activeEditIndex, 'title', e.target.value)}
                        placeholder="VD: CRM Chăm Sóc Khách Hàng"
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">
                        Huy hiệu (Badge) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={tempLinks[activeEditIndex].badge}
                        onChange={e => handleLinkChange(activeEditIndex, 'badge', e.target.value)}
                        placeholder="VD: CRM CSKH"
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  {/* URL */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 flex items-center justify-between">
                      <span>Đường dẫn liên kết (URL) <span className="text-rose-500">*</span></span>
                      <span className="text-[10px] text-slate-400 font-normal">Bắt đầu bằng https://</span>
                    </label>
                    <div className="relative">
                      <ExternalLink className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="url"
                        value={tempLinks[activeEditIndex].url}
                        onChange={e => handleLinkChange(activeEditIndex, 'url', e.target.value)}
                        placeholder="https://crm.mrex.vn"
                        required
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  {/* Subtitle */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">
                      Mô tả ngắn khi rê chuột (Subtitle)
                    </label>
                    <input
                      type="text"
                      value={tempLinks[activeEditIndex].subtitle}
                      onChange={e => handleLinkChange(activeEditIndex, 'subtitle', e.target.value)}
                      placeholder="VD: Quản lý khách hàng, hội thoại và chăm sóc sau bán"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  {/* Icon Selector Grid */}
                  <div className="space-y-2 pt-2 border-t border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700 block">
                        Chọn biểu tượng Icon hiển thị:
                      </label>
                      <span className="text-[10px] text-[#0875D9] font-bold">
                        Đang chọn: {DOCK_ICON_REGISTRY[tempLinks[activeEditIndex].iconName]?.label || tempLinks[activeEditIndex].iconName}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 max-h-44 overflow-y-auto p-1.5 bg-white rounded-xl border border-slate-200">
                      {Object.entries(DOCK_ICON_REGISTRY).map(([iconKey, { label, icon: IconComp }]) => {
                        const isSelected = tempLinks[activeEditIndex].iconName === iconKey;

                        return (
                          <button
                            key={iconKey}
                            type="button"
                            onClick={() => handleLinkChange(activeEditIndex, 'iconName', iconKey)}
                            title={`${label} (${iconKey})`}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-gradient-to-br from-[#68BDFF] to-[#3B86F7] text-white shadow-sm ring-2 ring-offset-1 ring-[#3B86F7]'
                                : 'hover:bg-slate-100 text-slate-600'
                            }`}
                          >
                            <IconComp className="w-5 h-5 mb-1" />
                            <span className="text-[9px] font-medium truncate w-full text-center leading-tight">
                              {label.split('/')[0].trim()}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {savedSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 border border-emerald-200 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Ban Giám Đốc đã lưu cấu hình thanh liên kết thành công!</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-700 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Khôi phục mặc định</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs cursor-pointer transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#68BDFF] via-[#489FFF] to-[#3B86F7] hover:from-[#54A4FF] hover:to-[#2575FC] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/25 active:scale-98 cursor-pointer transition-all"
                  >
                    <Check className="w-4 h-4" />
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
