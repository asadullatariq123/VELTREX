import React from 'react';
import { ShieldAlert, AlertTriangle, Navigation, Home, Bell, Activity } from 'lucide-react';

export const KpiCards: React.FC = () => {
  const kpiData = [
    { title: 'Active High-Risk Zones', value: '47', subtext: '8 NER States', icon: ShieldAlert, color: 'text-aurora-amber', bg: 'bg-aurora-amber/10 border-aurora-amber/30' },
    { title: 'Critical Zones', value: '12', subtext: 'P1 Immediate Threat', icon: AlertTriangle, color: 'text-aurora-coral', bg: 'bg-aurora-coral/10 border-aurora-coral/30' },
    { title: 'Roads at Risk', value: '31', subtext: 'NH Highways & Passes', icon: Navigation, color: 'text-aurora-volcanic', bg: 'bg-aurora-sand/30 border-aurora-mineral/20' },
    { title: 'Villages at Risk', value: '18', subtext: '~12,480 Residents', icon: Home, color: 'text-aurora-mineral', bg: 'bg-aurora-glacier/40 border-aurora-mineral/20' },
    { title: 'Active Alerts', value: '09', subtext: 'SMS, Push & Voice', icon: Bell, color: 'text-aurora-sky', bg: 'bg-aurora-sky/10 border-aurora-sky/30' },
    { title: 'Sensor Telemetry', value: '87%', subtext: '247 Stations Active', icon: Activity, color: 'text-aurora-mint', bg: 'bg-aurora-forest text-aurora-mint border-aurora-mineral/40' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {kpiData.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div 
            key={idx} 
            className={`p-4 rounded-2xl border ${kpi.bg} backdrop-blur-sm shadow-sm transition-all hover:-translate-y-0.5`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-aurora-forest/70 uppercase tracking-wider truncate">{kpi.title}</span>
              <Icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className={`text-2xl font-black font-mono tracking-tight ${kpi.color}`}>
                {kpi.value}
              </span>
            </div>
            <div className="text-[10px] text-aurora-forest/60 font-semibold mt-1">{kpi.subtext}</div>
          </div>
        );
      })}
    </div>
  );
};
