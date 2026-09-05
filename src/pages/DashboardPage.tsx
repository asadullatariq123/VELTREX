import React, { useEffect, useState } from 'react';
import { liveStore } from '../services/liveSimulationStore';
import { ThreatSituationPanel } from '../components/dashboard/ThreatSituationPanel';
import { LiveRiskScoreGauge } from '../components/dashboard/LiveRiskScoreGauge';
import { HeroMap } from '../components/maps/HeroMap';
import { RiskDnaGauge } from '../components/dashboard/RiskDnaGauge';
import { ExplainableAiCard } from '../components/dashboard/ExplainableAiCard';
import { WhatHappensNextCard } from '../components/dashboard/WhatHappensNextCard';
import { RiskEvolutionChart } from '../components/dashboard/RiskEvolutionChart';
import { SatelliteIntelligence } from '../components/dashboard/SatelliteIntelligence';
import { RiskToActionEngine } from '../components/dashboard/RiskToActionEngine';
import { ResponseResourcesPanel } from '../components/dashboard/ResponseResourcesPanel';
import { LiveActivityStream } from '../components/dashboard/LiveActivityStream';
import { NerLocation } from '../types';
import { Radio, MapPin, AlertTriangle, ShieldCheck, ArrowRight, Play, Layers } from 'lucide-react';

interface DashboardPageProps {
  onOpenSimModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenSimModal }) => {
  const [selectedLocation, setSelectedLocation] = useState<NerLocation>(liveStore.getSelectedLocation());

  useEffect(() => {
    const unsubscribe = liveStore.subscribe(() => {
      setSelectedLocation(liveStore.getSelectedLocation());
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1800px] mx-auto bg-topo-pattern min-h-screen">
      {/* 1. Spatial Cartographic Hero Introduction */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Big Editorial Statement & Risk DNA */}
        <div className="lg:col-span-5 space-y-5">
          <div className="veltrex-card p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-extrabold text-sky-700 tracking-wider uppercase">
              <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>EARTH INTELLIGENCE NETWORK</span>
              <span>•</span>
              <span className="font-mono text-slate-500">NORTH EAST INDIA</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-veltrex-cobalt tracking-tight leading-none">
              READ THE TERRAIN<br />BEFORE IT MOVES.
            </h1>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              VELTREX combines synthetic aperture radar satellite observation, ground sensor telemetry, rainfall intensity, and explainable AI to predict landslide movement across North East India before disaster strikes.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2 font-mono text-[11px]">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>LIVE SYSTEM ACTIVE</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                08 NER STATES
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                247 STATIONS
              </span>
              <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-200">
                18 RISK ZONES
              </span>
            </div>

            <button
              onClick={onOpenSimModal}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 shadow-sm transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>TRIGGER LIVE DISASTER SIMULATION</span>
            </button>
          </div>

          {/* Explainable AI Risk DNA Gauge */}
          <RiskDnaGauge location={selectedLocation} />
        </div>

        {/* Right Column: Centered Geospatial Map Workspace with Floating Location Intelligence */}
        <div className="lg:col-span-7 space-y-5">
          <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white">
            <HeroMap />

            {/* Floating Location Intelligence Panel Overlaid on Map */}
            <div className="absolute top-4 right-4 z-20 max-w-xs w-full bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-xl space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">{selectedLocation.state} / SECTOR 04</span>
                  <h4 className="font-extrabold text-sm text-veltrex-cobalt">{selectedLocation.name}</h4>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase text-white bg-rose-600">
                    {selectedLocation.riskLevel}
                  </span>
                  <div className="text-[10px] font-mono font-bold text-rose-600 mt-0.5">{selectedLocation.riskScore}/100 INDEX</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[9px] text-slate-400 font-bold block">PROBABILITY</span>
                  <span className="font-bold text-rose-600 text-xs">78% CRITICAL</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[9px] text-slate-400 font-bold block">WINDOW</span>
                  <span className="font-bold text-slate-800 text-xs">{selectedLocation.expectedRiskWindow}</span>
                </div>
              </div>

              <div className="space-y-1 text-[11px]">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">KEY RISK DRIVERS:</span>
                <div className="space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Rainfall ({selectedLocation.rainfallMm}mm)</span>
                    <span className="font-bold text-sky-700">+24%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Soil Saturation ({selectedLocation.soilMoisturePct}%)</span>
                    <span className="font-bold text-teal-700">+21%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Slope ({selectedLocation.slopeDeg}°)</span>
                    <span className="font-bold text-amber-700">+18%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Displacement (+4.2mm)</span>
                    <span className="font-bold text-rose-600">+13%</span>
                  </div>
                </div>
              </div>

              <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg space-y-1 text-[10px]">
                <span className="font-bold text-rose-800 uppercase block">RECOMMENDED RESPONSE P1:</span>
                <p className="text-rose-900 font-semibold">Inspect NH-54 corridor immediately & deploy field response team.</p>
              </div>
            </div>
          </div>

          <RiskEvolutionChart location={selectedLocation} />
        </div>
      </div>

      {/* 2. Secondary Row: Satellite Intelligence & Risk-to-Action Decision Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SatelliteIntelligence location={selectedLocation} />
        <RiskToActionEngine location={selectedLocation} />
      </div>

      {/* 3. Real-Time Telemetry Stream & Explainable AI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6">
          <LiveActivityStream />
          <WhatHappensNextCard location={selectedLocation} />
        </div>
        <div className="lg:col-span-7">
          <ResponseResourcesPanel />
        </div>
      </div>
    </div>
  );
};

