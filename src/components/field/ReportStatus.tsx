import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { offlineQueue } from '../../services/offlineReportQueue';

export const ReportStatus: React.FC = () => {
  const [status, setStatus] = useState(offlineQueue.getNetworkStatus());
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const update = async () => {
      setStatus(offlineQueue.getNetworkStatus());
      const count = await offlineQueue.getQueueCount();
      setPendingCount(count);
    };

    update();
    const unsubscribe = offlineQueue.subscribe(update);
    return () => unsubscribe();
  }, []);

  const handleSyncNow = async () => {
    await offlineQueue.syncPendingReports();
  };

  return (
    <div className="flex items-center space-x-3 text-xs font-mono">
      {/* Network Status Pill */}
      <div
        className={`px-3 py-1.5 rounded-full flex items-center space-x-1.5 font-bold border transition-all ${
          status === 'ONLINE'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : status === 'SYNCING'
            ? 'bg-sky-50 text-sky-700 border-sky-200 animate-pulse'
            : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}
      >
        {status === 'ONLINE' ? (
          <>
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            <span>ONLINE</span>
          </>
        ) : status === 'SYNCING' ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-sky-600 animate-spin" />
            <span>SYNCING...</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5 text-rose-600" />
            <span>OFFLINE</span>
          </>
        )}
      </div>

      {/* Queue Indicator Badge */}
      {pendingCount > 0 && (
        <button
          onClick={handleSyncNow}
          className="px-3 py-1.5 rounded-full bg-amber-500 text-white font-bold flex items-center space-x-1.5 shadow-sm hover:bg-amber-600 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${status === 'SYNCING' ? 'animate-spin' : ''}`} />
          <span>{pendingCount} QUEUED</span>
        </button>
      )}
    </div>
  );
};
