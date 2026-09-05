import { apiClient } from './apiClient';

export interface PendingReportItem {
  clientReportId: string;
  latitude: number;
  longitude: number;
  reportType: string;
  severity: string;
  description: string;
  observedAt: string;
  locationId?: string;
  reporterName?: string;
  reporterRole?: string;
  accuracy?: number;
  mediaItems?: { base64Data: string; fileName: string; mimeType: string }[];
  queuedAt: string;
  syncAttempts: number;
  lastError?: string;
}

const DB_NAME = 'VeltrexOfflineDB';
const STORE_NAME = 'pendingReports';
const DB_VERSION = 1;

class OfflineReportQueue {
  private isOnline = navigator.onLine;
  private isSyncing = false;
  private listeners: (() => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notifyListeners();
        this.syncPendingReports();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notifyListeners();
      });
    }
  }

  public getNetworkStatus(): 'ONLINE' | 'OFFLINE' | 'SYNCING' {
    if (this.isSyncing) return 'SYNCING';
    return this.isOnline ? 'ONLINE' : 'OFFLINE';
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l());
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'clientReportId' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public generateClientReportId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `VELTREX-${crypto.randomUUID()}`;
    }
    return `VELTREX-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }

  public async saveReportOffline(report: Omit<PendingReportItem, 'queuedAt' | 'syncAttempts'>): Promise<PendingReportItem> {
    const item: PendingReportItem = {
      ...report,
      queuedAt: new Date().toISOString(),
      syncAttempts: 0,
    };

    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(item);
      req.onsuccess = () => {
        this.notifyListeners();
        resolve(item);
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async getPendingReports(): Promise<PendingReportItem[]> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return [];
    }
  }

  public async removeSyncedReport(clientReportId: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(clientReportId);
      req.onsuccess = () => {
        this.notifyListeners();
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async getQueueCount(): Promise<number> {
    const reports = await this.getPendingReports();
    return reports.length;
  }

  public async syncPendingReports(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing) return { synced: 0, failed: 0 };
    this.isSyncing = true;
    this.notifyListeners();

    let syncedCount = 0;
    let failedCount = 0;

    try {
      const pending = await this.getPendingReports();
      for (const item of pending) {
        try {
          // 1. Submit report to backend
          const res = await apiClient.createFieldReport({
            clientReportId: item.clientReportId,
            latitude: item.latitude,
            longitude: item.longitude,
            reportType: item.reportType,
            severity: item.severity,
            description: item.description,
            observedAt: item.observedAt,
            locationId: item.locationId,
            reporterName: item.reporterName,
            reporterRole: item.reporterRole,
            accuracy: item.accuracy,
            offlineCreated: true,
          });

          if (res.success && res.data) {
            const reportId = res.data.id;

            // 2. Upload attached media if present
            if (item.mediaItems && item.mediaItems.length > 0) {
              for (const media of item.mediaItems) {
                await apiClient.uploadFieldReportMedia(reportId, media.base64Data, media.fileName).catch(() => {});
              }
            }

            // 3. Remove successfully synced report from IndexedDB
            await this.removeSyncedReport(item.clientReportId);
            syncedCount++;
          } else {
            failedCount++;
          }
        } catch (err: any) {
          failedCount++;
          item.syncAttempts = (item.syncAttempts || 0) + 1;
          item.lastError = err.message || 'Network sync failed';
          const db = await this.openDB();
          const tx = db.transaction(STORE_NAME, 'readwrite');
          tx.objectStore(STORE_NAME).put(item);
        }
      }
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }

    return { synced: syncedCount, failed: failedCount };
  }
}

export const offlineQueue = new OfflineReportQueue();
