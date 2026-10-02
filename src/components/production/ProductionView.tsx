import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  WarehouseItem,
  WarehouseItemCategory,
  WarehouseItemStatus,
  InventoryAuditTicket,
  WarehouseInvoice,
  WarehouseInvoiceType,
  WarehouseInvoiceStatus
} from '../../types';
import {
  Boxes,
  Package,
  ClipboardCheck,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  Edit3,
  Trash2,
  ArrowUpDown,
  FileText,
  DollarSign,
  Layers,
  MapPin,
  ShieldAlert,
  Building,
  Calendar,
  Sparkles,
  BarChart3,
  Eye,
  Check,
  X
} from 'lucide-react';
import { WarehouseItemModal } from './WarehouseItemModal';
import { StockAdjustModal } from './StockAdjustModal';
import { AuditTicketModal } from './AuditTicketModal';
import { AuditDetailModal } from './AuditDetailModal';
import { WarehouseInvoiceModal } from './WarehouseInvoiceModal';
import { InvoicePrintModal } from './InvoicePrintModal';

type ProductionTab = 'inventory' | 'audit' | 'inbound' | 'outbound';

const CATEGORY_MAP: Record<WarehouseItemCategory, { label: string; color: string; badge: string }> = {
  RAW_MATERIAL: {
    label: 'Nguyên Vật Liệu',
    color: 'amber',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
  },
  SEMI_FINISHED: {
    label: 'Bán Thành Phẩm',
    color: 'blue',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
  },
  FINISHED_GOODS: {
    label: 'Thành Phẩm',
    color: 'emerald',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
  },
  PACKAGING: {
    label: 'Bao Bì Đóng Gói',
    color: 'purple',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
  }
};

export const ProductionView: React.FC = () => {
  const {
    currentUser,
    warehouseItems,
    addWarehouseItem,
    updateWarehouseItem,
    deleteWarehouseItem,
    adjustWarehouseStock,
    inventoryAudits,
    createInventoryAudit,
    approveInventoryAudit,
    deleteInventoryAudit,
    warehouseInvoices,
    createWarehouseInvoice,
    updateWarehouseInvoiceStatus,
    deleteWarehouseInvoice
  } = useApp();

  // Role Access Guard
  const canAccess =
    currentUser.role === 'CEO' ||
    currentUser.role === 'MANAGER' ||
    currentUser.departmentId === 'production' ||
    (currentUser.roleTitle && (
      currentUser.roleTitle.toLowerCase().includes('kho') ||
      currentUser.roleTitle.toLowerCase().includes('sản xuất')
    ));

  const [activeSubTab, setActiveSubTab] = useState<ProductionTab>('inventory');

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<WarehouseItem | null>(null);

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [itemToAdjust, setItemToAdjust] = useState<WarehouseItem | null>(null);

  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedAuditDetail, setSelectedAuditDetail] = useState<InventoryAuditTicket | null>(null);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceModalType, setInvoiceModalType] = useState<WarehouseInvoiceType>('IMPORT');
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<WarehouseInvoice | null>(null);

  // Filters & Search
  const [inventorySearch, setInventorySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('ALL');

  const [auditSearch, setAuditSearch] = useState('');
  const [auditStatusFilter, setAuditStatusFilter] = useState<string>('ALL');

  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('ALL');

  // Calculations for KPIs
  const totalStockValue = useMemo(() => {
    return warehouseItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }, [warehouseItems]);

  const totalSKUs = warehouseItems.length;

  const lowStockCount = useMemo(() => {
    return warehouseItems.filter(i => i.status !== 'IN_STOCK').length;
  }, [warehouseItems]);

  const thisMonthInboundTotal = useMemo(() => {
    return warehouseInvoices
      .filter(i => i.type === 'IMPORT' && i.status !== 'CANCELLED')
      .reduce((sum, i) => sum + i.grandTotal, 0);
  }, [warehouseInvoices]);

  const thisMonthOutboundTotal = useMemo(() => {
    return warehouseInvoices
      .filter(i => i.type === 'EXPORT' && i.status !== 'CANCELLED')
      .reduce((sum, i) => sum + i.grandTotal, 0);
  }, [warehouseInvoices]);

  const auditComplianceRate = useMemo(() => {
    let totalItemsAudited = 0;
    let qualifiedItems = 0;
    inventoryAudits.forEach(ticket => {
      ticket.items.forEach(it => {
        totalItemsAudited += 1;
        if (it.qualityStatus === 'QUALIFIED' && it.difference === 0) {
          qualifiedItems += 1;
        }
      });
    });
    return totalItemsAudited > 0 ? Math.round((qualifiedItems / totalItemsAudited) * 100) : 98;
  }, [inventoryAudits]);

  // Filtered Inventory Items
  const filteredItems = useMemo(() => {
    return warehouseItems.filter(item => {
      const matchSearch =
        item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        item.sku.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        item.warehouseLocation.toLowerCase().includes(inventorySearch.toLowerCase());
      const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchStatus = selectedStockStatus === 'ALL' || item.status === selectedStockStatus;
      return matchSearch && matchCat && matchStatus;
    });
  }, [warehouseItems, inventorySearch, selectedCategory, selectedStockStatus]);

  // Filtered Audits
  const filteredAudits = useMemo(() => {
    return inventoryAudits.filter(a => {
      const matchSearch =
        a.title.toLowerCase().includes(auditSearch.toLowerCase()) ||
        a.code.toLowerCase().includes(auditSearch.toLowerCase()) ||
        a.warehouseName.toLowerCase().includes(auditSearch.toLowerCase()) ||
        a.auditorName.toLowerCase().includes(auditSearch.toLowerCase());
      const matchStatus = auditStatusFilter === 'ALL' || a.status === auditStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [inventoryAudits, auditSearch, auditStatusFilter]);

  // Filtered Inbound Invoices
  const filteredInbound = useMemo(() => {
    return warehouseInvoices.filter(i => {
      if (i.type !== 'IMPORT') return false;
      const matchSearch =
        i.code.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
        i.partnerName.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
        i.title.toLowerCase().includes(invoiceSearch.toLowerCase());
      const matchStatus = invoiceStatusFilter === 'ALL' || i.status === invoiceStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [warehouseInvoices, invoiceSearch, invoiceStatusFilter]);

  // Filtered Outbound Invoices
  const filteredOutbound = useMemo(() => {
    return warehouseInvoices.filter(i => {
      if (i.type !== 'EXPORT') return false;
      const matchSearch =
        i.code.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
        i.partnerName.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
        i.title.toLowerCase().includes(invoiceSearch.toLowerCase());
      const matchStatus = invoiceStatusFilter === 'ALL' || i.status === invoiceStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [warehouseInvoices, invoiceSearch, invoiceStatusFilter]);

  // If user is unauthorized
  if (!canAccess) {
    return (
      <div className="p-8 max-w-3xl mx-auto my-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-rose-200/80 dark:border-rose-900/40 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Quyền Truy Cập Bị Giới Hạn
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          Phân hệ <strong>Bộ Phận Sản Xuất & Quản Lý Kho Vận</strong> chỉ dành riêng cho <strong>Ban Quản Trị</strong>, <strong>Quản Đốc Sản Xuất</strong> và <strong>Nhân Sự Quản Lý Kho</strong>.
        </p>
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-500 inline-block font-mono">
          Tài khoản hiện tại: {currentUser.name} ({currentUser.roleTitle || currentUser.role})
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#0875D9] via-[#0b5bb0] to-[#063B78] text-white shadow-xl shadow-blue-900/10 border border-white/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide border border-white/25">
              <Boxes className="w-3.5 h-3.5 text-sky-300" />
              <span>Khối Sản Xuất & Chuỗi Cung Ứng Kho Vận</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Quản Lý Kho Hàng & Kiểm Kê Sản Xuất
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl leading-relaxed">
              Kiểm soát danh mục vật tư, nguyên liệu, theo dõi hạn ngạch tồn, lập phiếu kiểm kê đối chiếu thực tế và phát hành hóa đơn xuất / nhập kho điện tử kèm mã QR.
            </p>
          </div>

          {/* Quick Actions Header */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setItemToEdit(null);
                setIsItemModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-white text-[#0875D9] hover:bg-blue-50 font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Mặt Hàng</span>
            </button>
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md border border-white/30 transition-all flex items-center gap-2"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Lập Phiếu Kiểm Kê</span>
            </button>
            <button
              onClick={() => {
                setInvoiceModalType('IMPORT');
                setIsInvoiceModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Hóa Đơn Nhập</span>
            </button>
            <button
              onClick={() => {
                setInvoiceModalType('EXPORT');
                setIsInvoiceModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Hóa Đơn Xuất</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Value */}
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tổng Giá Trị Tồn Kho</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black font-mono tracking-tight text-slate-900 dark:text-slate-100">
            {new Intl.NumberFormat('vi-VN').format(totalStockValue)} <span className="text-xs font-normal text-slate-500">đ</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-500" />
            <span>Định giá theo giá vốn kho</span>
          </div>
        </div>

        {/* Card 2: SKU count */}
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Danh Mục Mặt Hàng</span>
            <div className="p-2 rounded-xl bg-[#0875D9]/10 text-[#0875D9]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black font-mono tracking-tight text-slate-900 dark:text-slate-100">
            {totalSKUs} <span className="text-xs font-normal text-slate-500">Mã SKU</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            4 phân loại vật tư & thành phẩm
          </div>
        </div>

        {/* Card 3: Stock Alert */}
        <div className={`p-5 rounded-2xl backdrop-blur-xl border shadow-xs hover:shadow-md transition-all ${
          lowStockCount > 0
            ? 'bg-amber-500/5 border-amber-300 dark:border-amber-800/40'
            : 'bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Cảnh Báo Thiếu Hàng</span>
            <div className={`p-2 rounded-xl ${lowStockCount > 0 ? 'bg-amber-500/20 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl font-black font-mono tracking-tight ${lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {lowStockCount} <span className="text-xs font-normal text-slate-500">mặt hàng</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {lowStockCount > 0 ? 'Cần bổ sung nhập kho khẩn' : 'Tồn kho trong mức an toàn'}
          </div>
        </div>

        {/* Card 4: Audit & Quality */}
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tỉ Lệ Đạt Chuẩn Kiểm Kê</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black font-mono tracking-tight text-teal-600">
            {auditComplianceRate}% <span className="text-xs font-normal text-slate-500">chuẩn</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {inventoryAudits.length} đợt kiểm kê gần nhất
          </div>
        </div>

        {/* Card 5: Monthly In/Out */}
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Nhập / Xuất Tháng Này</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xs font-mono font-bold text-emerald-600 flex items-center justify-between">
            <span>Nhập:</span>
            <span>+{new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(thisMonthInboundTotal)} đ</span>
          </div>
          <div className="text-xs font-mono font-bold text-blue-600 flex items-center justify-between mt-1">
            <span>Xuất:</span>
            <span>-{new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(thisMonthOutboundTotal)} đ</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {warehouseInvoices.length} phiếu giao dịch kho
          </div>
        </div>
      </div>

      {/* Main Tab Switcher Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
            activeSubTab === 'inventory'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Danh Mục Kho Hàng</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeSubTab === 'inventory' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
          }`}>
            {warehouseItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
            activeSubTab === 'audit'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Kiểm Hàng & Biên Bản Kiểm Kê</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeSubTab === 'audit' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
          }`}>
            {inventoryAudits.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('inbound')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
            activeSubTab === 'inbound'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>Hóa Đơn Nhập Kho (Inbound)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeSubTab === 'inbound' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
          }`}>
            {warehouseInvoices.filter(i => i.type === 'IMPORT').length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('outbound')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
            activeSubTab === 'outbound'
              ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Hóa Đơn Xuất Kho (Outbound)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeSubTab === 'outbound' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
          }`}>
            {warehouseInvoices.filter(i => i.type === 'EXPORT').length}
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: QUẢN LÝ KHO HÀNG (INVENTORY) */}
      {/* ======================================================== */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Tìm theo tên hàng, mã SKU hoặc vị trí kho..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-medium focus:outline-none"
              >
                <option value="ALL">Tất cả nhóm hàng</option>
                <option value="RAW_MATERIAL">Nguyên Vật Liệu</option>
                <option value="SEMI_FINISHED">Bán Thành Phẩm</option>
                <option value="FINISHED_GOODS">Thành Phẩm</option>
                <option value="PACKAGING">Bao Bì Đóng Gói</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStockStatus}
                onChange={(e) => setSelectedStockStatus(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-medium focus:outline-none"
              >
                <option value="ALL">Tất cả tình trạng tồn</option>
                <option value="IN_STOCK">Đủ hàng trong kho</option>
                <option value="LOW_STOCK">Sắp hết (Dưới mức tối thiểu)</option>
                <option value="OUT_OF_STOCK">Hết hàng (Tồn = 0)</option>
              </select>

              <button
                onClick={() => {
                  setItemToEdit(null);
                  setIsItemModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Mới</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Mã SKU & Tên Mặt Hàng</th>
                    <th className="p-4">Phân Loại</th>
                    <th className="p-4 text-center">ĐVT</th>
                    <th className="p-4 text-center w-40">Tồn Kho Thực Tế</th>
                    <th className="p-4 text-right">Đơn Giá Vốn</th>
                    <th className="p-4 text-right">Giá Bán / Xuất</th>
                    <th className="p-4">Vị Trí Lưu Kho</th>
                    <th className="p-4 text-center">Trạng Thái</th>
                    <th className="p-4 text-center w-28">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        Không tìm thấy mặt hàng nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const percentMax = Math.min(100, Math.round((item.quantity / item.maxStock) * 100));
                      const isLow = item.status === 'LOW_STOCK';
                      const isOut = item.status === 'OUT_OF_STOCK';

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                              {item.name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
                                {item.sku}
                              </span>
                              {item.specification && (
                                <span className="text-[11px] text-slate-400 truncate max-w-xs">
                                  • {item.specification}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-4">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${CATEGORY_MAP[item.category]?.badge}`}>
                              {CATEGORY_MAP[item.category]?.label}
                            </span>
                          </td>

                          <td className="p-4 text-center font-medium text-slate-600 dark:text-slate-400">
                            {item.unit}
                          </td>

                          <td className="p-4 text-center">
                            <div className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                              {item.quantity.toLocaleString('vi-VN')}
                            </div>
                            {/* Stock progress bar */}
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1.5">
                              <div
                                className={`h-full rounded-full ${
                                  isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${percentMax}%` }}
                              />
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                              Min: {item.minStock} | Max: {item.maxStock}
                            </div>
                          </td>

                          <td className="p-4 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                            {new Intl.NumberFormat('vi-VN').format(item.unitPrice)} đ
                          </td>

                          <td className="p-4 text-right font-mono font-semibold text-emerald-600">
                            {item.sellingPrice ? `${new Intl.NumberFormat('vi-VN').format(item.sellingPrice)} đ` : '—'}
                          </td>

                          <td className="p-4">
                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span className="truncate max-w-[180px]">{item.warehouseLocation}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Kiểm: {item.lastCheckedDate}
                            </div>
                          </td>

                          <td className="p-4 text-center">
                            {isOut ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                Hết hàng
                              </span>
                            ) : isLow ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                                Sắp hết
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                Đủ hàng
                              </span>
                            )}
                          </td>

                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Quick Adjust Button */}
                              <button
                                onClick={() => {
                                  setItemToAdjust(item);
                                  setIsAdjustModalOpen(true);
                                }}
                                title="Điều chỉnh nhanh tồn kho (+/-)"
                                className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-600 transition-colors"
                              >
                                <ArrowUpDown className="w-3.5 h-3.5" />
                              </button>
                              {/* Edit Button */}
                              <button
                                onClick={() => {
                                  setItemToEdit(item);
                                  setIsItemModalOpen(true);
                                }}
                                title="Chỉnh sửa thông tin mặt hàng"
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {/* Delete Button */}
                              <button
                                onClick={() => {
                                  if (confirm(`Bạn có chắc muốn xóa mặt hàng [${item.sku}] ${item.name}?`)) {
                                    deleteWarehouseItem(item.id);
                                  }
                                }}
                                title="Xóa mặt hàng"
                                className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: KIỂM HÀNG & BIÊN BẢN KIỂM KÊ (AUDIT) */}
      {/* ======================================================== */}
      {activeSubTab === 'audit' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Tìm theo mã phiếu kiểm kê (PKH-xxxx), tên đợt, kho hoặc nhân sự..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={auditStatusFilter}
                onChange={(e) => setAuditStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-medium focus:outline-none"
              >
                <option value="ALL">Tất cả trạng thái phiếu</option>
                <option value="COMPLETED">Chờ Quản đốc duyệt</option>
                <option value="APPROVED">Đã chốt duyệt tồn</option>
                <option value="IN_PROGRESS">Đang kiểm đếm</option>
                <option value="DRAFT">Bản nháp</option>
              </select>

              <button
                onClick={() => setIsAuditModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Lập Phiếu Mới</span>
              </button>
            </div>
          </div>

          {/* Audits Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAudits.length === 0 ? (
              <div className="md:col-span-2 p-12 text-center text-slate-400 bg-white/60 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                Chưa có phiếu kiểm kê nào phù hợp.
              </div>
            ) : (
              filteredAudits.map((ticket) => {
                const totalDiff = ticket.items.filter(i => i.difference !== 0).length;
                const totalDefect = ticket.items.filter(i => i.qualityStatus !== 'QUALIFIED').length;
                const isApproved = ticket.status === 'APPROVED';

                return (
                  <div
                    key={ticket.id}
                    className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Top Code & Status */}
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            {ticket.code}
                          </span>
                          <span className="text-xs text-slate-400">
                            {ticket.auditDate}
                          </span>
                        </div>
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đã chốt duyệt
                          </span>
                        ) : ticket.status === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            <Clock className="w-3.5 h-3.5" /> Chờ Quản đốc duyệt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800">
                            Đang kiểm
                          </span>
                        )}
                      </div>

                      {/* Title & Warehouse */}
                      <div className="pt-3">
                        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug">
                          {ticket.title}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5">
                          <div className="flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-blue-500" />
                            <span>{ticket.warehouseName}</span>
                          </div>
                          <div>
                            Kiểm bởi: <strong>{ticket.auditorName}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Stats chips */}
                      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center">
                          <div className="text-[10px] text-slate-400">Mặt hàng kiểm</div>
                          <div className="font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                            {ticket.items.length} mục
                          </div>
                        </div>
                        <div className={`p-2 rounded-xl text-center ${
                          totalDiff > 0 ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600' : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                        }`}>
                          <div className="text-[10px] opacity-75">Lệch tồn</div>
                          <div className="font-bold font-mono mt-0.5">
                            {totalDiff > 0 ? `${totalDiff} lệch` : 'Khớp 100%'}
                          </div>
                        </div>
                        <div className={`p-2 rounded-xl text-center ${
                          totalDefect > 0 ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600' : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                        }`}>
                          <div className="text-[10px] opacity-75">Hàng lỗi/vỡ</div>
                          <div className="font-bold font-mono mt-0.5">
                            {totalDefect > 0 ? `${totalDefect} lỗi` : 'Đạt chuẩn'}
                          </div>
                        </div>
                      </div>

                      {/* Approval note preview */}
                      {ticket.approvedBy && (
                        <div className="mt-3 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between">
                          <span>Duyệt bởi: <strong>{ticket.approvedBy}</strong></span>
                          <span>{ticket.approvalDate}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedAuditDetail(ticket)}
                        className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-600 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem Chi Tiết & Đối Chiếu</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        {!isApproved && (
                          <button
                            onClick={() => {
                              if (confirm('Phê duyệt chốt tồn kho thực tế cho phiếu này ngay?')) {
                                approveInventoryAudit(ticket.id, currentUser.name, 'Đã ký duyệt qua danh sách');
                              }
                            }}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Duyệt Chốt</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm(`Xóa phiếu kiểm kê ${ticket.code}?`)) {
                              deleteInventoryAudit(ticket.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: HÓA ĐƠN NHẬP KHO (INBOUND) */}
      {/* ======================================================== */}
      {activeSubTab === 'inbound' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
                placeholder="Tìm mã hóa đơn nhập (NK-xxxx), nhà cung cấp hoặc nội dung..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={invoiceStatusFilter}
                onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-medium focus:outline-none"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="COMPLETED">Đã nhập kho hoàn tất</option>
                <option value="APPROVED">Đã duyệt (Chờ giao hàng)</option>
                <option value="PENDING_APPROVAL">Chờ duyệt</option>
              </select>

              <button
                onClick={() => {
                  setInvoiceModalType('IMPORT');
                  setIsInvoiceModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Lập Hóa Đơn Nhập</span>
              </button>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Số Hóa Đơn & Nội Dung</th>
                    <th className="p-4">Nhà Cung Cấp</th>
                    <th className="p-4">Kho Nhập</th>
                    <th className="p-4 text-center">Ngày Lập / Giao</th>
                    <th className="p-4 text-center">Số Mặt Hàng</th>
                    <th className="p-4 text-right">Tổng Thanh Toán</th>
                    <th className="p-4 text-center">Thanh Toán</th>
                    <th className="p-4 text-center">Trạng Thái</th>
                    <th className="p-4 text-center w-28">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredInbound.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        Chưa có hóa đơn nhập kho nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredInbound.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-4">
                          <div className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                            {inv.code}
                          </div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                            {inv.title}
                          </div>
                        </td>

                        <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                          <div>{inv.partnerName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{inv.contactPhone}</div>
                        </td>

                        <td className="p-4 text-slate-600 dark:text-slate-400">
                          {inv.warehouseName}
                        </td>

                        <td className="p-4 text-center">
                          <div className="font-mono">{inv.createdDate}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Hẹn: {inv.deliveryDate || '—'}
                          </div>
                        </td>

                        <td className="p-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                          {inv.items.length} mặt hàng
                        </td>

                        <td className="p-4 text-right font-mono font-bold text-emerald-600 text-sm">
                          {new Intl.NumberFormat('vi-VN').format(inv.grandTotal)} đ
                        </td>

                        <td className="p-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : inv.paymentStatus === 'PARTIAL'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {inv.paymentStatus === 'PAID' ? 'Đã TT 100%' : inv.paymentStatus === 'PARTIAL' ? 'Đặt cọc 50%' : 'Chưa TT'}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : inv.status === 'APPROVED'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {inv.status === 'COMPLETED' ? 'Đã Nhập Kho' : inv.status === 'APPROVED' ? 'Đã Duyệt' : 'Chờ Duyệt'}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Print / View Modal */}
                            <button
                              onClick={() => setSelectedInvoiceForPrint(inv)}
                              title="In hóa đơn kèm mã QR"
                              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-600 transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            {inv.status !== 'COMPLETED' && (
                              <button
                                onClick={() => {
                                  if (confirm('Xác nhận hoàn tất nhập kho và cộng tồn kho ngay?')) {
                                    updateWarehouseInvoiceStatus(inv.id, 'COMPLETED');
                                  }
                                }}
                                title="Chốt nhập kho hoàn tất"
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-600 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (confirm(`Xóa hóa đơn nhập ${inv.code}?`)) {
                                  deleteWarehouseInvoice(inv.id);
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: HÓA ĐƠN XUẤT KHO (OUTBOUND) */}
      {/* ======================================================== */}
      {activeSubTab === 'outbound' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
                placeholder="Tìm mã hóa đơn xuất (XK-xxxx), khách hàng, dự án hoặc nội dung..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={invoiceStatusFilter}
                onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-medium focus:outline-none"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="COMPLETED">Đã xuất kho thành công</option>
                <option value="APPROVED">Đã duyệt (Chờ xuất hàng)</option>
                <option value="PENDING_APPROVAL">Chờ duyệt</option>
              </select>

              <button
                onClick={() => {
                  setInvoiceModalType('EXPORT');
                  setIsInvoiceModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Lập Hóa Đơn Xuất</span>
              </button>
            </div>
          </div>

          {/* Outbound Table */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Số Hóa Đơn & Mục Đích</th>
                    <th className="p-4">Khách Hàng / Dự Án</th>
                    <th className="p-4">Kho Xuất</th>
                    <th className="p-4 text-center">Ngày Lập / Giao</th>
                    <th className="p-4 text-center">Số Mặt Hàng</th>
                    <th className="p-4 text-right">Tổng Tiền Xuất</th>
                    <th className="p-4 text-center">Thanh Toán</th>
                    <th className="p-4 text-center">Trạng Thái</th>
                    <th className="p-4 text-center w-28">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredOutbound.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        Chưa có hóa đơn xuất kho nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredOutbound.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-4">
                          <div className="font-mono font-bold text-blue-700 dark:text-blue-400 text-sm">
                            {inv.code}
                          </div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                            {inv.title}
                          </div>
                        </td>

                        <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                          <div>{inv.partnerName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{inv.contactPhone}</div>
                        </td>

                        <td className="p-4 text-slate-600 dark:text-slate-400">
                          {inv.warehouseName}
                        </td>

                        <td className="p-4 text-center">
                          <div className="font-mono">{inv.createdDate}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Hẹn: {inv.deliveryDate || '—'}
                          </div>
                        </td>

                        <td className="p-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                          {inv.items.length} mặt hàng
                        </td>

                        <td className="p-4 text-right font-mono font-bold text-blue-600 text-sm">
                          {new Intl.NumberFormat('vi-VN').format(inv.grandTotal)} đ
                        </td>

                        <td className="p-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : inv.paymentStatus === 'PARTIAL'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {inv.paymentStatus === 'PAID' ? 'Đã TT 100%' : inv.paymentStatus === 'PARTIAL' ? 'Tạm ứng 50%' : 'Công nợ'}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : inv.status === 'APPROVED'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {inv.status === 'COMPLETED' ? 'Đã Xuất Kho' : inv.status === 'APPROVED' ? 'Đã Duyệt' : 'Chờ Duyệt'}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Print / View Modal */}
                            <button
                              onClick={() => setSelectedInvoiceForPrint(inv)}
                              title="In phiếu xuất kho kèm mã QR"
                              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-600 transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            {inv.status !== 'COMPLETED' && (
                              <button
                                onClick={() => {
                                  if (confirm('Xác nhận xuất kho thực tế và trừ tồn kho ngay?')) {
                                    updateWarehouseInvoiceStatus(inv.id, 'COMPLETED');
                                  }
                                }}
                                title="Chốt xuất kho hoàn tất"
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-600 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (confirm(`Xóa hóa đơn xuất ${inv.code}?`)) {
                                  deleteWarehouseInvoice(inv.id);
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODALS */}
      {/* ======================================================== */}

      {/* 1. Add / Edit Warehouse Item */}
      <WarehouseItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setItemToEdit(null);
        }}
        onSave={(data) => {
          if (itemToEdit) {
            updateWarehouseItem(itemToEdit.id, data);
          } else {
            addWarehouseItem(data);
          }
        }}
        itemToEdit={itemToEdit}
      />

      {/* 2. Quick Stock Adjust */}
      <StockAdjustModal
        isOpen={isAdjustModalOpen}
        onClose={() => {
          setIsAdjustModalOpen(false);
          setItemToAdjust(null);
        }}
        item={itemToAdjust}
        onAdjust={(id, delta, reason) => adjustWarehouseStock(id, delta, reason)}
      />

      {/* 3. New Audit Ticket */}
      <AuditTicketModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        onSave={(data) => createInventoryAudit(data)}
      />

      {/* 4. Audit Detail & Reconciliation */}
      <AuditDetailModal
        isOpen={Boolean(selectedAuditDetail)}
        onClose={() => setSelectedAuditDetail(null)}
        audit={selectedAuditDetail}
      />

      {/* 5. Inbound / Outbound Invoice Creator */}
      <WarehouseInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        defaultType={invoiceModalType}
        onSave={(data) => createWarehouseInvoice(data)}
      />

      {/* 6. Invoice Print & QR Code Modal */}
      <InvoicePrintModal
        isOpen={Boolean(selectedInvoiceForPrint)}
        onClose={() => setSelectedInvoiceForPrint(null)}
        invoice={selectedInvoiceForPrint}
      />
    </div>
  );
};
