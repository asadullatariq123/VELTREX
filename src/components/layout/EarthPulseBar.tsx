import React, { useState, useEffect } from 'react';
import { Radio, ChevronDown, ChevronUp, CloudRain, Mountain, Satellite, Activity, Brain } from 'lucide-react';
import { liveStore } from '../../services/liveSimulationStore';
import { NerLocation } from '../../types';

export const EarthPulseBar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeStr, setTimeStr] = useState<string>(new Date().toLocaleTimeString());
  const [selectedLoc, setSelectedLoc] = useState<NerLocation>(liveStore.getSelectedLocation());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString());
    }, 1000);

    const unsubscribe = liveStore.subscribe(() => {
      setSelectedLoc(liveStore.getSelectedLocation());
    });

    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, []);

  return (
    <div className="w-full bg-veltrex-cobalt text-white border-b border-slate-700 text-xs shadow-sm select-none transition-all">
      {/* Main Persistent Ticker Strip */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="max-w-[1800px] mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider animate-pulse">
            <Radio className="w-3 h-3 text-rose-400" />
            <span>EARTH PULSE ● LIVE</span>
          </div>

          <span className="font-mono text-sky-300 font-bold text-[11px]">{timeStr} IST</span>
          <span className="text-slate-400 hidden sm:inline">•</span>

          <div className="hidden sm:flex items-center space-x-4 font-mono text-[11px] text-slate-200">
            <span>Rainfall <strong className="text-sky-300">↑ 18%</strong></span>
            <span>Soil Saturation <strong className="text-emerald-300">↑ 11%</strong></span>
            <span>Terrain Displacement <strong className="text-rose-300">+4.2mm</strong></span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-black/30 px-3 py-0.5 rounded-full border border-white/10 font-mono text-[11px]">
            <span className="opacity-75">Target Risk Index:</span>
            <span className="font-black text-rose-400">{selectedLoc.riskScore}/100</span>
          </div>

          <button className="flex items-center space-x-1 text-sky-300 font-bold hover:text-white transition-colors">
            <span className="text-[10px] uppercase">{isExpanded ? 'HIDE SYSTEM STATUS' : 'SYSTEM STATUS'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Layer Panel */}
      {isExpanded && (
        <div className="border-t border-slate-700 bg-slate-900 p-4 font-mono text-xs animate-fadeIn">
          <div className="max-w-[1800px] mx-auto grid grid-cols-1 sm:grid-cols-5 gap-3">
            {/* ATMOSPHERE */}
            <div className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-1">
              <div className="flex items-center space-x-1.5 text-sky-400 font-bold text-[11px]">
                <CloudRain className="w-3.5 h-3.5" />
                <span>ATMOSPHERE</span>
              </div>
              <p className="text-white font-bold">{selectedLoc.rainfallMm} mm / 6h</p>
              <p className="text-[10px] text-slate-400">IMD Doppler cloudburst radar active</p>
            </div>

            {/* TERRAIN */}
            <div className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-[11px]">
                <Mountain className="w-3.5 h-3.5" />
                <span>TERRAIN</span>
              </div>
              <p className="text-white font-bold">{selectedLoc.soilMoisturePct}% Saturation • {selectedLoc.slopeDeg}° Slope</p>
              <p className="text-[10px] text-slate-400">Pore pressure threshold exceeded</p>
            </div>

            {/* SATELLITE */}
            <div className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-1">
              <div className="flex items-center space-x-1.5 text-rose-400 font-bold text-[11px]">
                <Satellite className="w-3.5 h-3.5" />
                <span>SATELLITE</span>
              </div>
              <p className="text-rose-300 font-bold">+4.2 mm Displacement</p>
              <p className="text-[10px] text-slate-400">Sentinel-2 SAR pass 08:21 IST</p>
            </div>

            {/* SENSORS */}
            <div className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-1">
              <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-[11px]">
                <Activity className="w-3.5 h-3.5" />
                <span>SENSORS</span>
              </div>
              <p className="text-white font-bold">247 Nodes (87% Online)</p>
              <p className="text-[10px] text-slate-400">Telemetry sync 15s interval</p>
            </div>

            {/* AI ENGINE */}
            <div className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-1">
              <div className="flex items-center space-x-1.5 text-teal-400 font-bold text-[11px]">
                <Brain className="w-3.5 h-3.5" />
                <span>AI ENGINE</span>
              </div>
              <p className="text-teal-300 font-bold">VELTREX Ensemble 91%</p>
              <p className="text-[10px] text-slate-400">XGBoost + Spatial LSTM inference</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

