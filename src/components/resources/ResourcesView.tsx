import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ResourceLink, ResourceCategory, ResourceAccessLevel } from '../../types';
import {
  BookMarked,
  Plus,
  Link,
  FolderOpen,
  Globe,
  FileText,
  Wrench,
  Trash2,
  Edit3,
  ExternalLink,
  Search,
  Shield,
  Lock,
  Users,
  Building,
  X,
  Star,
  Copy,
  Check
} from 'lucide-react';

const CATEGORY_ICONS: Record<ResourceCategory, React.ElementType> = {
  TOOL: Wrench,
  DRIVE: FolderOpen,
  DOCS: FileText,
  LINK: Globe,
  OTHER: Link,
};

const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  TOOL: 'Công cụ',
  DRIVE: 'Google Drive',
  DOCS: 'Tài liệu',
  LINK: 'Đường dẫn',
  OTHER: 'Khác',
};

const ACCESS_LABELS: Record<ResourceAccessLevel, string> = {
  PERSONAL: 'Cá nhân',
  DEPARTMENT: 'Phòng ban',
  MANAGEMENT: 'Quản lý',
  ALL: 'Toàn công ty',
};

const ACCESS_COLORS: Record<ResourceAccessLevel, string> = {
  PERSONAL: 'bg-slate-100 text-slate-700',
  DEPARTMENT: 'bg-blue-50 text-blue-700',
  MANAGEMENT: 'bg-amber-50 text-amber-700',
  ALL: 'bg-emerald-50 text-emerald-700',
};

interface ResourceFormData {
  title: string;
  url: string;
  description: string;
  category: ResourceCategory;
  accessLevel: ResourceAccessLevel;
  isPinned: boolean;
}

const defaultForm: ResourceFormData = {
  title: '',
  url: 'https://',
  description: '',
  category: 'LINK',
  accessLevel: 'PERSONAL',
  isPinned: false,
};

export const ResourcesView: React.FC = () => {
  const {
    resources,
    addResource,
    updateResource,
    deleteResource,
    currentUser,
    departments,
    employees,
  } = useApp();

  const isManagement = currentUser.role === 'CEO' || currentUser.role === 'MANAGER';
  const isCEO = currentUser.role === 'CEO';

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ResourceFormData>(defaultForm);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const myDept = departments.find(d => d.id === currentUser.departmentId);

  const visibleResources = useMemo(() => {
    return resources.filter(r => {
      if (r.accessLevel === 'PERSONAL' && r.ownerId !== currentUser.id) return false;
      if (r.accessLevel === 'MANAGEMENT' && !isManagement) return false;
      if (r.accessLevel === 'DEPARTMENT' && r.departmentId && r.departmentId !== currentUser.departmentId && !isCEO) return false;
      if (filterCategory !== 'ALL' && r.category !== filterCategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!r.title.toLowerCase().includes(q) && !r.description?.toLowerCase().includes(q) && !r.url.toLowerCase().includes(q)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [resources, currentUser, isManagement, isCEO, filterCategory, search]);

  const pinnedResources = visibleResources.filter(r => r.isPinned);
  const regularResources = visibleResources.filter(r => !r.isPinned);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const handleOpenEdit = (res: ResourceLink) => {
    setEditingId(res.id);
    setForm({
      title: res.title,
      url: res.url,
      description: res.description || '',
      category: res.category,
      accessLevel: res.accessLevel,
      isPinned: res.isPinned || false,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim()) return;
    if (editingId) {
      updateResource(editingId, {
        title: form.title.trim(),
        url: form.url.trim(),
        description: form.description.trim() || undefined,
        category: form.category,
        accessLevel: form.accessLevel,
        isPinned: form.isPinned,
        departmentId: form.accessLevel === 'DEPARTMENT' ? currentUser.departmentId : undefined,
      });
    } else {
      addResource({
        title: form.title.trim(),
        url: form.url.trim(),
        description: form.description.trim() || undefined,
        category: form.category,
        accessLevel: form.accessLevel,
        isPinned: form.isPinned,
        departmentId: form.accessLevel === 'DEPARTMENT' ? currentUser.departmentId : undefined,
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        ownerRole: currentUser.roleTitle,
      });
    }
    setShowModal(false);
  };

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const canEditResource = (res: ResourceLink) => isCEO || res.ownerId === currentUser.id;

  const ResourceCard: React.FC<{ res: ResourceLink }> = ({ res }) => {
    const CatIcon = CATEGORY_ICONS[res.category];
    const owner = employees.find(e => e.id === res.ownerId);
    return (
      <div className={"group relative bg-white border rounded-xl p-4 shadow-xs hover:shadow-md transition-all hover:border-[#0875D9]/30 " + (res.isPinned ? 'border-amber-200 ring-1 ring-amber-100' : 'border-slate-200')}>
        {res.isPinned && <div className="absolute top-2 right-2"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /></div>}
        <div className="flex items-start gap-3">
          <div className={"w-10 h-10 rounded-xl flex items-center justify-center shrink-0 " + (res.category === 'TOOL' ? 'bg-violet-50 text-violet-600' : res.category === 'DRIVE' ? 'bg-emerald-50 text-emerald-600' : res.category === 'DOCS' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600')}>
            <CatIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-900 text-sm truncate max-w-[200px]">{res.title}</h3>
              <span className={"text-[10px] font-bold px-1.5 py-0.5 rounded " + ACCESS_COLORS[res.accessLevel]}>{ACCESS_LABELS[res.accessLevel]}</span>
            </div>
            {res.description && <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{res.description}</p>}
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400">
              <span className="font-mono truncate max-w-[180px]">{res.url.replace(/^https?:\/\//, '')}</span>
            </div>
            {owner && <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400"><img src={owner.avatar} className="w-4 h-4 rounded-full object-cover" alt="" referrerPolicy="no-referrer" /><span>{owner.name} · {res.createdAt?.slice(0, 10)}</span></div>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100">
          <a href={res.url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#0875D9] text-white text-[11px] font-semibold rounded-lg hover:bg-[#0b5cb5] transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />Mở liên kết
          </a>
          <button onClick={() => handleCopy(res.id, res.url)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Sao chép URL">
            {copiedId === res.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          {canEditResource(res) && (
            <>
              <button onClick={() => handleOpenEdit(res)} className="p-1.5 text-slate-400 hover:text-[#0875D9] hover:bg-blue-50 rounded-lg transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
              <button onClick={() => { if (confirm('Xoá "' + res.title + '"?')) deleteResource(res.id); }} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-3.5 sm:p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-[#0875D9]" />Tài Liệu & Tư Liệu Làm Việc
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Lưu trữ link công cụ, Google Drive, tài liệu cá nhân và chia sẻ theo cấp bậc</p>
        </div>
        <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2 bg-[#0875D9] text-white text-xs font-bold rounded-xl hover:bg-[#0b5cb5] transition-colors shadow-sm">
          <Plus className="w-4 h-4" />Thêm Tài Liệu
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span className="text-slate-500 font-semibold">Phạm vi hiển thị:</span>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium"><Lock className="w-3 h-3" /> Cá nhân</span>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium"><Building className="w-3 h-3" /> Phòng ban</span>
        {isManagement && <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium"><Shield className="w-3 h-3" /> Quản lý</span>}
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium"><Users className="w-3 h-3" /> Toàn công ty</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm..." className="pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0875D9] w-44" />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0875D9]">
          <option value="ALL">Tất cả loại</option>
          {(['TOOL','DRIVE','DOCS','LINK','OTHER'] as ResourceCategory[]).map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
        </select>
      </div>

      {pinnedResources.length > 0 && (
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2 flex items-center gap-1.5"><Star className="w-3.5 h-3.5 fill-amber-400" />Được ghim</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">{pinnedResources.map(r => <ResourceCard key={r.id} res={r} />)}</div>
        </div>
      )}

      {regularResources.length > 0 ? (
        <div>
          {pinnedResources.length > 0 && <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Tất cả tài liệu</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">{regularResources.map(r => <ResourceCard key={r.id} res={r} />)}</div>
        </div>
      ) : visibleResources.length === 0 && (
        <div className="text-center py-14 text-slate-400">
          <BookMarked className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <div className="font-semibold text-sm text-slate-600">Chưa có tài liệu nào</div>
          <p className="text-xs mt-1">Nhấn "Thêm Tài Liệu" để lưu link công cụ, Drive hoặc chia sẻ với đội nhóm.</p>
          <button onClick={handleOpenAdd} className="mt-4 px-4 py-2 bg-[#0875D9] text-white text-xs font-bold rounded-xl hover:bg-[#0b5cb5] transition-colors"><Plus className="w-3.5 h-3.5 inline mr-1.5" />Thêm tài liệu đầu tiên</button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0875D9] flex items-center justify-center"><BookMarked className="w-4 h-4 text-white" /></div>
                <h2 className="text-sm font-bold text-slate-900">{editingId ? 'Chỉnh sửa tài liệu' : 'Thêm tài liệu mới'}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên tài liệu *</label>
                <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="VD: Google Analytics, Figma Design..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9] bg-slate-50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">URL *</label>
                <input type="url" required value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0875D9] bg-slate-50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả (không bắt buộc)</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Mô tả ngắn..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9] bg-slate-50 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Loại</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as ResourceCategory }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9] bg-slate-50">
                    {(['TOOL','DRIVE','DOCS','LINK','OTHER'] as ResourceCategory[]).map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phạm vi</label>
                  <select value={form.accessLevel} onChange={e => setForm(f => ({ ...f, accessLevel: e.target.value as ResourceAccessLevel }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0875D9] bg-slate-50">
                    <option value="PERSONAL">🔒 Cá nhân</option>
                    <option value="DEPARTMENT">🏢 Phòng ban ({myDept?.name})</option>
                    {isManagement && <option value="MANAGEMENT">🛡️ Quản lý</option>}
                    <option value="ALL">👥 Toàn công ty</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isPinned} onChange={e => setForm(f => ({ ...f, isPinned: e.target.checked }))} className="w-4 h-4 rounded" />
                <span className="text-xs font-medium text-slate-700">⭐ Ghim tài liệu (hiển thị đầu tiên)</span>
              </label>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50">Huỷ</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-[#0875D9] text-white text-xs font-bold rounded-xl hover:bg-[#0b5cb5] transition-colors">{editingId ? 'Lưu thay đổi' : 'Thêm tài liệu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};