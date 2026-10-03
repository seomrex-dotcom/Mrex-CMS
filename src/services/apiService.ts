/**
 * Enterprise API & Central Database Sync Service
 * Ensures 100% synchronization across tabs, browsers, and devices via VPS Database
 */

import { Employee, Department, Task, AttendanceRecord, LeaveRequest, Announcement, GoogleDocDeliverable, FinancialVoucher, ProjectContract, WarehouseItem, InventoryAuditTicket, WarehouseInvoice, ChatMessage, BudgetApproval, PayrollRecord, CompanyBrandConfig } from '../types';

export interface DatabasePayload {
  employees?: Employee[];
  departments?: Department[];
  tasks?: Task[];
  attendance?: AttendanceRecord[];
  leaveRequests?: LeaveRequest[];
  announcements?: Announcement[];
  googleDocs?: GoogleDocDeliverable[];
  vouchers?: FinancialVoucher[];
  contracts?: ProjectContract[];
  warehouseItems?: WarehouseItem[];
  inventoryAudits?: InventoryAuditTicket[];
  warehouseInvoices?: WarehouseInvoice[];
  chatMessages?: ChatMessage[];
  budgets?: BudgetApproval[];
  payroll?: PayrollRecord[];
  brandConfig?: CompanyBrandConfig | null;
  resources?: any[];
  dockLinks?: any[];
}

export interface SyncResponse {
  success: boolean;
  data?: DatabasePayload;
  timestamp?: string;
  message?: string;
}

// BroadcastChannel for instant cross-tab sync in the same browser session
let syncChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel('mrex_cms_sync_channel');
  }
} catch (e) {
  console.warn('BroadcastChannel not supported', e);
}

export const ApiService = {
  /**
   * Broadcast state changes to all other open tabs immediately
   */
  broadcast(type: string, data: any) {
    if (syncChannel) {
      try {
        syncChannel.postMessage({ type, data, timestamp: Date.now() });
      } catch (err) {
        console.warn('Broadcast error', err);
      }
    }
  },

  /**
   * Subscribe to cross-tab updates
   */
  onBroadcast(callback: (msg: { type: string; data: any; timestamp: number }) => void) {
    if (syncChannel) {
      const handler = (event: MessageEvent) => {
        if (event && event.data && event.data.type) {
          callback(event.data);
        }
      };
      syncChannel.addEventListener('message', handler);
      return () => syncChannel?.removeEventListener('message', handler);
    }
    return () => {};
  },

  /**
   * Fetch complete persistent dataset from VPS Database
   */
  async getDatabase(): Promise<DatabasePayload | null> {
    try {
      const res = await fetch('/api/data', {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      });
      if (!res.ok) return null;
      const json: SyncResponse = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    } catch (err) {
      console.warn('[ApiService] Server database unreachable, using local fallback:', err);
    }
    return null;
  },

  /**
   * Push changes to VPS Database
   */
  async syncDatabase(payload: DatabasePayload): Promise<DatabasePayload | null> {
    try {
      // First broadcast to other open tabs locally
      this.broadcast('DATABASE_SYNC', payload);

      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) return null;
      const json: SyncResponse = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    } catch (err) {
      console.warn('[ApiService] Sync to VPS database failed, saved in local storage:', err);
    }
    return null;
  }
};
