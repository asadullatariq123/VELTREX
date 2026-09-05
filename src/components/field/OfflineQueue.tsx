import React, { useState, useEffect } from 'react';
import { RefreshCw, Database, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { offlineQueue, PendingReportItem } from '../../services/offlineReportQueue';

export const OfflineQueue: React.FC = () => {
  const [pendingReports, setPendingReports] = useState<PendingReportItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadQueue = async () => {
    const reports = await offlineQueue.getPendingReports();
    setPendingReports(reports);
  };

  useEffect(() => {
    loadQueue();
    const unsubscribe = offlineQueue.subscribe(loadQueue);
    return () => unsubscribe();
  }, []);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setStatusMsg('Syncing pending field reports with VELTREX server...');
    const result = await offlineQueue.syncPendingReports();
    setIsSyncing(false);
    setStatusMsg(`Sync finished: ${result.synced} synced, ${result.failed} failed.`);
    loadQueue();
  };

  const handleRemove = async (clientReportId: string) => {
    await offlineQueue.removeSyncedReport(clientReportId);
    loadQueue();
  };

  if (pendingReports.length === 0) {
    return (
      <div className="veltrex-card p-4 rounded-xl text-center text-xs text-slate-500 font-mono">
        <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
        <span>No reports waiting in offline queue. All field observations synced.</span>
      </div>
    );
  }

  return (
    <div className="veltrex-card p-5 rounded-2xl space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-amber-600" />
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              OFFLINE SYNCHRONIZATION QUEUE
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">
              {pendingReports.length} report(s) waiting for server sync
            </p>
          </div>
        </div>

        <button
          onClick={handleSyncNow}
          disabled={isSyncing}
          className="px-3.5 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold font-mono flex items-center space-x-1.5 hover:bg-amber-600 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'SYNCING...' : 'SYNC NOW'}</span>
        </button>
      </div>

      {statusMsg && (
        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 font-mono">
          {statusMsg}
        </div>
      )}

      <div className="space-y-2">
        {pendingReports.map((item) => (
          <div
            key={item.clientReportId}
            className="p-3 bg-white border border-slate-200 rounded-xl text-xs flex items-center justify-between font-mono"
          >
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-veltrex-cobalt">{item.reportType}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  item.severity === 'CRITICAL' ? 'bg-rose-600 text-white' :
                  item.severity === 'HIGH' ? 'bg-amber-500 text-white' : 'bg-slate-600 text-white'
                }`}>
                  {item.severity}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-sans truncate max-w-md">{item.description}</p>
              <span className="text-[10px] text-slate-400 block">
                Queued: {new Date(item.queuedAt).toLocaleTimeString()} • ID: {item.clientReportId.substring(0, 18)}...
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleRemove(item.clientReportId)}
                className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                title="Discard offline report"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
