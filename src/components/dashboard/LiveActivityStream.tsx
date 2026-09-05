import React, { useState, useEffect } from 'react';
import { Activity, Radio, AlertTriangle, CloudRain, ShieldCheck, Layers, Cpu } from 'lucide-react';
import { realtimeStore, ActivityStreamItem } from '../../services/realtime/realtimeStore';
import { VeltrexRealtimeEventType } from '../../services/realtime/realtimeEvents';

export const LiveActivityStream: React.FC = () => {
  const [activities, setActivities] = useState<ActivityStreamItem[]>(realtimeStore.getActivities());

  useEffect(() => {
    const unsub = realtimeStore.onActivitiesChange((items) => {
      setActivities([...items]);
    });
    return () => unsub();
  }, []);

  const getEventIcon = (type: VeltrexRealtimeEventType) => {
    switch (type) {
      case VeltrexRealtimeEventType.RISK_UPDATED:
      case VeltrexRealtimeEventType.PREDICTION_UPDATED:
        return <Cpu className="w-3.5 h-3.5 text-sky-600" />;
      case VeltrexRealtimeEventType.ALERT_CREATED:
      case VeltrexRealtimeEventType.ALERT_UPDATED:
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />;
      case VeltrexRealtimeEventType.WEATHER_UPDATED:
        return <CloudRain className="w-3.5 h-3.5 text-emerald-600" />;
      case VeltrexRealtimeEventType.FIELD_REPORT_CREATED:
        return <Layers className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getSeverityBadge = (severity?: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-600 text-white font-black';
      case 'HIGH':
        return 'bg-amber-500 text-white font-bold';
      case 'MODERATE':
        return 'bg-sky-500 text-white font-bold';
      default:
        return 'bg-slate-200 text-slate-700 font-bold';
    }
  };

  return (
    <div className="veltrex-card p-5 rounded-2xl space-y-3">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
          <h3 className="text-xs font-extrabold text-veltrex-cobalt uppercase tracking-wider flex items-center space-x-1.5">
            <Radio className="w-4 h-4 text-emerald-600" />
            <span>LIVE TELEMETRY STREAM</span>
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500 font-bold">WEBSOCKET CHANNEL</span>
      </div>

      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {activities.length === 0 ? (
          <div className="p-4 text-center text-xs font-mono text-slate-500">Waiting for live WebSocket events...</div>
        ) : (
          activities.map((act) => {
            const timeFormatted = new Date(act.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });

            return (
              <div
                key={act.id}
                className="p-3 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl transition-all flex items-start justify-between space-x-3 text-xs"
              >
                <div className="flex items-start space-x-2.5">
                  <div className="mt-0.5 p-1.5 bg-white border border-slate-200 rounded-lg shrink-0">
                    {getEventIcon(act.eventType)}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-slate-900 text-[11px]">{act.title}</span>
                      {act.severity && (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] ${getSeverityBadge(act.severity)}`}>
                          {act.severity}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 font-sans font-medium">{act.description}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0">{timeFormatted}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
