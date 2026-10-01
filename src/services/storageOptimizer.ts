import { StorageHealth, ChatMessage } from '../types';

const MAX_SAFE_STORAGE_BYTES = 3.5 * 1024 * 1024; // 3.5 MB safe limit for browser localStorage
const MAX_CHAT_MESSAGES = 80; // Keep latest 80 messages to prevent VPS/RAM bloat

export const StorageOptimizer = {
  /**
   * Tính toán tổng dung lượng localStorage đang sử dụng (Bytes)
   */
  getUsedStorageBytes(): number {
    let total = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key) || '';
          total += (key.length + value.length) * 2; // UTF-16 characters = 2 bytes each
        }
      }
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    return total;
  },

  /**
   * Format bytes sang KB / MB thân thiện
   */
  formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  },

  /**
   * Lấy tình trạng sức khỏe lưu trữ & mô phỏng VPS
   */
  getStorageHealth(lowMemoryMode = false): StorageHealth {
    const usedBytes = this.getUsedStorageBytes();
    const percentUsage = Math.min(100, Math.round((usedBytes / MAX_SAFE_STORAGE_BYTES) * 100));

    let status: 'OPTIMAL' | 'WARNING' | 'CRITICAL' = 'OPTIMAL';
    if (percentUsage > 85) status = 'CRITICAL';
    else if (percentUsage > 55) status = 'WARNING';

    // Mô phỏng tài nguyên VPS Node/PHP chạy CMS
    // Giả sử VPS 2GB RAM tiêu chuẩn cho SMEs
    const vpsTotalMb = 2048;
    const baseUsageMb = lowMemoryMode ? 145 : 210;
    const dynamicUsageMb = Math.round((usedBytes / (1024 * 1024)) * 8);
    const vpsUsedMb = baseUsageMb + dynamicUsageMb;
    const vpsPercent = Math.round((vpsUsedMb / vpsTotalMb) * 100);

    return {
      usedBytes,
      usedFormatted: this.formatBytes(usedBytes),
      maxRecommendedBytes: MAX_SAFE_STORAGE_BYTES,
      percentUsage,
      status,
      totalItems: localStorage.length,
      vpsRamSimulated: {
        usedMb: vpsUsedMb,
        totalMb: vpsTotalMb,
        percent: vpsPercent,
      },
      lastOptimizedAt: localStorage.getItem('mrex_last_optimized') || new Date().toISOString().replace('T', ' ').slice(0, 16),
      lowMemoryMode,
    };
  },

  /**
   * Cắt tỉa tin nhắn chat giữ lại N tin gần nhất tránh tràn RAM
   */
  pruneChatMessages(messages: ChatMessage[], maxCount = MAX_CHAT_MESSAGES): ChatMessage[] {
    if (messages.length <= maxCount) return messages;
    // Giữ lại các tin nhắn mới nhất
    return messages.slice(messages.length - maxCount);
  },

  /**
   * Dọn dẹp bộ nhớ đệm tạm thời, dọn sạch dữ liệu rác, tối ưu VPS
   */
  vacuumAndOptimize(): { freedBytes: number; message: string } {
    const beforeBytes = this.getUsedStorageBytes();
    let removedCount = 0;

    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          // Xóa các key test cũ từ omnicorp hoặc cache tạm
          if (key.startsWith('omnicorp_') || key.includes('_temp_') || key.includes('_draft_old')) {
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach(k => {
        localStorage.removeItem(k);
        removedCount++;
      });

      localStorage.setItem('mrex_last_optimized', new Date().toISOString().replace('T', ' ').slice(0, 16));
    } catch (e) {
      console.warn('Vacuum error:', e);
    }

    const afterBytes = this.getUsedStorageBytes();
    const freed = Math.max(0, beforeBytes - afterBytes);

    return {
      freedBytes: freed,
      message: `Đã dọn dẹp ${removedCount} khóa rác cũ, giải phóng ${this.formatBytes(freed)}. Hệ thống VPS đã được tối ưu hóa!`,
    };
  },

  /**
   * Nén ảnh Base64 trước khi lưu để tránh tràn LocalStorage / VPS Disk
   */
  compressBase64Image(base64Str: string, maxWidth = 600, quality = 0.7): Promise<string> {
    return new Promise((resolve) => {
      // Nếu không phải data:image thì trả về nguyên bản
      if (!base64Str.startsWith('data:image/')) {
        return resolve(base64Str);
      }

      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(base64Str);

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => resolve(base64Str);
    });
  }
};
