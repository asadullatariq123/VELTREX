import React from 'react';
import { ShieldAlert, ShieldCheck, ChevronRight, Activity, Zap } from 'lucide-react';
import { NerLocation } from '../../types';

interface ThreatSituationPanelProps {
  location: NerLocation;
  onOpenResponsePlan?: () => void;
}

export const ThreatSituationPanel: React.FC<ThreatSituationPanelProps> = ({ location, onOpenResponsePlan }) => {
  const isHighOrCritical = location.riskLevel === 'HIGH' || location.riskLevel === 'CRITICAL';

  return (
    <div className={`rounded-2xl p-5 sm:p-6 border shadow-md transition-all ${
      isHighOrCritical
        ? 'bg-gradient-to-r from-aurora-volcanic/95 via-aurora-forest to-aurora-mineral text-aurora-ivory border-aurora-coral/40 shadow-aurora-coral/10'
        : 'bg-gradient-to-r from-white via-aurora-glacier/30 to-white border-aurora-mineral/20 text-aurora-forest'
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Status Indicator */}
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            isHighOrCritical 
              ? 'bg-aurora-coral text-white animate-pulse shadow-lg shadow-aurora-coral/30' 
              : 'bg-aurora-mineral text-aurora-mint shadow-lg shadow-aurora-mineral/20'
          }`}>
            {isHighOrCritical ? <ShieldAlert className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
          </div>

          <div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                isHighOrCritical ? 'bg-aurora-coral text-white' : 'bg-aurora-mint text-aurora-forest'
              }`}>
                {isHighOrCritical ? '🔴 ELEVATED LANDSLIDE THREAT' : '🟢 STABLE TERRAIN CONDITIONS'}
              </span>
              <span className="text-xs font-bold opacity-80 font-mono">
                {location.name} • {location.state}
              </span>
            </div>

            <h2 className="text-xl font-black mt-1 tracking-tight">
              {isHighOrCritical ? (
                <>Precipitation threshold breached — Risk surge <span className="text-aurora-coral font-mono">+18%</span> in last 3h</>
              ) : (
                <>Geotechnical sensors report baseline terrain equilibrium</>
              )}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs opacity-90 mt-2 font-medium">
              <span className="font-bold opacity-75">Primary Environmental Drivers:</span>
              {location.xaiContributors.slice(0, 3).map((driver, i) => (
                <span key={i} className="flex items-center space-x-1 bg-black/10 px-2 py-0.5 rounded-full text-[11px]">
                  <span>{driver.icon}</span>
                  <span>{driver.factor}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Actions & Score */}
        <div className="flex items-center space-x-5">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-70">Location Risk Index</div>
            <div className="flex items-baseline space-x-1 justify-end">
              <span className={`text-4xl font-black font-mono tracking-tight ${
                isHighOrCritical ? 'text-aurora-coral' : 'text-aurora-mineral'
              }`}>
                {location.riskScore}
              </span>
              <span className="opacity-60 text-sm font-bold">/100</span>
            </div>
            <div className="text-[11px] font-semibold opacity-80">{location.expectedRiskWindow} Window</div>
          </div>

          <button
            onClick={onOpenResponsePlan}
            className="px-4 py-2.5 rounded-xl bg-aurora-forest hover:bg-aurora-mineral text-aurora-mint font-extrabold text-xs transition-all shadow-lg flex items-center space-x-1.5"
          >
            <span>DISASTER RESPONSE PLAN</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
