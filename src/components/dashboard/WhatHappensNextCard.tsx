import React from 'react';
import { ArrowDown, ShieldAlert, Zap } from 'lucide-react';
import { NerLocation } from '../../types';

interface WhatHappensNextCardProps {
  location: NerLocation;
}

export const WhatHappensNextCard: React.FC<WhatHappensNextCardProps> = ({ location }) => {
  return (
    <div className="aurora-card rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-aurora-amber" />
          <div>
            <h3 className="text-xs font-black text-aurora-forest uppercase tracking-wider">WHEN WILL THE LAND MOVE?</h3>
            <p className="text-[10px] text-aurora-mineral">Predictive AI Multi-Tier Forecast (Next 6 Hours)</p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-aurora-amber/20 text-aurora-volcanic font-mono text-xs font-bold border border-aurora-amber/40">
          PROBABILITY 82%
        </span>
      </div>

      {/* Forecast Pipeline Cards */}
      <div className="space-y-2">
        {/* Tier 1: Environmental Triggers */}
        <div className="p-3 bg-white rounded-xl border border-aurora-mineral/15 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <span className="text-[10px] text-aurora-forest/60 block font-bold">🌧 Rainfall</span>
            <span className="font-bold text-aurora-coral font-mono">HIGH (82mm)</span>
          </div>
          <div>
            <span className="text-[10px] text-aurora-forest/60 block font-bold">💧 Soil Saturation</span>
            <span className="font-bold text-aurora-coral font-mono">CRITICAL (91%)</span>
          </div>
          <div>
            <span className="text-[10px] text-aurora-forest/60 block font-bold">⛰ Slope Stability</span>
            <span className="font-bold text-aurora-amber font-mono">LOW (38°)</span>
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowDown className="w-4 h-4 text-aurora-mineral/60 animate-bounce" />
        </div>

        {/* Tier 2: Escalation Probability */}
        <div className="p-3.5 bg-gradient-to-r from-aurora-forest via-aurora-mineral to-aurora-forest text-aurora-ivory rounded-xl flex items-center justify-between text-xs shadow-md">
          <div>
            <span className="font-bold">Landslide Escalation Probability</span>
            <div className="text-[10px] opacity-75">Ensemble neural net time-series prediction</div>
          </div>
          <span className="text-2xl font-black font-mono text-aurora-mint">82%</span>
        </div>

        <div className="flex justify-center">
          <ArrowDown className="w-4 h-4 text-aurora-mineral/60" />
        </div>

        {/* Tier 3: Impact Assets */}
        <div className="p-3 bg-white rounded-xl border border-aurora-mineral/15 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-aurora-forest">Potential Asset Impact:</span>
            <div className="flex items-center space-x-3 mt-1 font-bold text-aurora-mineral">
              <span>🛣 {location.impact.roadsCount} Roads</span>
              <span>🏘 {location.impact.villagesCount} Village</span>
              <span>🌉 {location.impact.bridgesCount} Bridge</span>
            </div>
          </div>
          <span className="text-xs font-bold text-aurora-coral font-mono">~{location.impact.peopleAffected} People</span>
        </div>

        {/* Tier 4: Recommended Priority Action */}
        <div className="p-3 bg-aurora-coral/10 rounded-xl border border-aurora-coral/40 flex items-center justify-between text-xs text-aurora-volcanic">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-aurora-coral shrink-0" />
            <div>
              <span className="font-bold text-aurora-crimson">Recommended Directive:</span>
              <span className="block font-semibold">P1 — Immediate Field Inspection & Road Closure Setup</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
