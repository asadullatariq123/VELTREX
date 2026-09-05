import React from 'react';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { NerLocation } from '../../types';

interface RiskToActionEngineProps {
  location: NerLocation;
  onDispatchAction?: (actionId: string) => void;
}

export const RiskToActionEngine: React.FC<RiskToActionEngineProps> = ({ location, onDispatchAction }) => {
  return (
    <div className="veltrex-card p-5 rounded-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
            P1
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-veltrex-cobalt uppercase tracking-wider">RISK → IMPACT → ACTION DECISION ENGINE</h3>
            <p className="text-[10px] text-slate-500">Automated Landslide Risk Escalation & Emergency Dispatch Matrix</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-mono text-xs font-black uppercase shadow-sm">
          P1 DIRECTIVE
        </span>
      </div>

      {/* Visual Pipeline Flow */}
      <div className="bg-veltrex-cobalt text-white p-3.5 rounded-xl text-center text-xs font-mono shadow-sm">
        <div className="text-[10px] font-bold text-sky-300 uppercase tracking-wider mb-2 flex items-center justify-center space-x-1">
          <span>SIGNALS</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span>AI ANALYSIS</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span>RISK SCORE</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span>IMPACT MODEL</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span>ACTION</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-slate-700 pt-2">
          <div>
            <span className="text-[9px] text-slate-400 uppercase block font-sans">RISK TIER</span>
            <span className="font-black text-rose-400">{location.riskLevel} ({location.riskScore}/100)</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase block font-sans font-semibold">EXPOSURE</span>
            <span className="font-bold text-sky-300">{location.impact.roadsCount} Roads • {location.impact.villagesCount} Villages</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase block font-sans font-semibold">PRIORITY</span>
            <span className="font-black text-amber-300">P1 RESPONSE</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase block font-sans font-semibold">ACTION</span>
            <span className="font-bold text-emerald-400">DISPATCH FIELD TEAM</span>
          </div>
        </div>
      </div>

      {/* Recommended Action Items */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          DISPATCHABLE RESPONSE DIRECTIVES:
        </span>

        {location.recommendedActions.map((item) => {
          return (
            <div
              key={item.id}
              className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:border-veltrex-cobalt transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-black text-[10px] font-mono">
                  {item.priority}
                </span>
                <span className="text-slate-800 font-bold">{item.action}</span>
              </div>

              <button
                onClick={() => onDispatchAction?.(item.id)}
                className="px-3 py-1 bg-veltrex-cobalt hover:bg-slate-800 text-white font-extrabold rounded-lg text-[11px] transition-all shrink-0 ml-2 shadow-sm"
              >
                DISPATCH
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

