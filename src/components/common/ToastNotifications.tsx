import React, { useEffect, useState } from 'react';
import { AlertTriangle, Bell, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { realtimeSocket } from '../../services/realtime/socket';
import { liveStore } from '../../services/liveSimulationStore';

interface ToastItem {
  id: string;
  title: string;
  message: string;
  priority?: string;
  riskLevel?: string;
  timestamp: string;
}

export const ToastNotifications: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    // Connect socket if not connected
    realtimeSocket.connect();

    // Listen to real-time ALERT_CREATED
    const unsubAlert = realtimeSocket.subscribe('ALERT_CREATED', (data: any) => {
      const payload = data.payload || data;
      const lang = liveStore.getLanguage();

      const newToast: ToastItem = {
        id: payload.alertId || payload.id || `toast-${Date.now()}`,
        title: payload.title || '🚨 EMERGENCY ALERT',
        message: payload.message || `Risk elevated to ${payload.alertLevel || payload.severity || 'CRITICAL'}`,
        priority: payload.priority || 'P1',
        riskLevel: payload.alertLevel || payload.severity || 'CRITICAL',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // max 5 toasts

      // Auto dismiss
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 6000);
    });

    // Listen to real-time RISK_UPDATED for HIGH/CRITICAL
    const unsubRisk = realtimeSocket.subscribe('RISK_UPDATED', (data: any) => {
      const payload = data.payload || data;
      if (payload.riskLevel === 'CRITICAL' || payload.riskLevel === 'HIGH') {
        const newToast: ToastItem = {
          id: `risk-${Date.now()}`,
          title: `⚠️ ${payload.riskLevel} RISK DETECTED`,
          message: `Location ${payload.locationId || 'Sector'} score updated to ${payload.riskScore}/100.`,
          priority: payload.riskLevel === 'CRITICAL' ? 'P1' : 'P2',
          riskLevel: payload.riskLevel,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };

        setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
        }, 6000);
      }
    });

    return () => {
      unsubAlert();
      unsubRisk();
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isCritical = toast.riskLevel === 'CRITICAL' || toast.priority === 'P1';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all animate-bounce-short flex items-start justify-between gap-3 ${
              isCritical
                ? 'bg-rose-950/95 border-rose-600 text-rose-100 shadow-rose-950/50'
                : 'bg-amber-950/95 border-amber-500 text-amber-100 shadow-amber-950/50'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${isCritical ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'} shrink-0 mt-0.5`}>
                {isCritical ? <ShieldAlert className="w-5 h-5 animate-pulse" /> : <AlertTriangle className="w-5 h-5" />}
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                    isCritical ? 'bg-white text-rose-950' : 'bg-white text-amber-950'
                  }`}>
                    {toast.priority || 'P1'}
                  </span>
                  <span className="font-mono text-[10px] opacity-75">{toast.timestamp}</span>
                </div>

                <h4 className="font-black text-xs tracking-tight">{toast.title}</h4>
                <p className="text-[11px] font-medium leading-snug opacity-90">{toast.message}</p>
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/70 hover:text-white p-1 rounded hover:bg-white/10 shrink-0 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
