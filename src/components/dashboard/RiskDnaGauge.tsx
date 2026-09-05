import React, { useState } from 'react';
import { NerLocation } from '../../types';
import { Brain, CloudRain, Droplets, Mountain, History, Satellite, Sparkles } from 'lucide-react';

interface RiskDnaGaugeProps {
  location: NerLocation;
}

export const RiskDnaGauge: React.FC<RiskDnaGaugeProps> = ({ location }) => {
  const [selectedFactorIndex, setSelectedFactorIndex] = useState<number>(0);
  const score = location.riskScore;
  const isCritical = location.riskLevel === 'CRITICAL';
  const isHigh = location.riskLevel === 'HIGH';

  const dnaFactors = [
    { 
      name: 'RAINFALL', 
      weight: '+24%', 
      value: location.rainfallMm + ' mm / 3h', 
      threshold: '72.0 mm',
      icon: CloudRain, 
      color: 'text-sky-600', 
      whyItMatters: 'Rainfall has exceeded local soil saturation threshold, causing pore pressure surge.',
      confidence: '91%'
    },
    { 
      name: 'SOIL SATURATION', 
      weight: '+21%', 
      value: location.soilMoisturePct + '% VWC', 
      threshold: '85.0%',
      icon: Droplets, 
      color: 'text-teal-600', 
      whyItMatters: 'Subsurface soil volumetric water content exceeds critical shear resistance limits.',
      confidence: '94%'
    },
    { 
      name: 'SLOPE GRADIENT', 
      weight: '+18%', 
      value: location.slopeDeg + '° Inclination', 
      threshold: '30.0°',
      icon: Mountain, 
      color: 'text-amber-600', 
      whyItMatters: 'Steep hillside gradient increases gravity-driven debris velocity along transport corridors.',
      confidence: '96%'
    },
    { 
      name: 'TERRAIN DISPLACEMENT', 
      weight: '+13%', 
      value: '+4.2 mm Shift', 
      threshold: '2.5 mm',
      icon: Satellite, 
      color: 'text-rose-600', 
      whyItMatters: 'Sentinel-2 SAR interferometry detected active ground micro-deformation across the ridge line.',
      confidence: '89%'
    },
    { 
      name: 'HISTORICAL ACTIVITY', 
      weight: '+11%', 
      value: '3 Past Failures', 
      threshold: '1 Event',
      icon: History, 
      color: 'text-indigo-600', 
      whyItMatters: 'Historical landslide catalog records 3 major slope failures in this exact sector during past monsoons.',
      confidence: '98%'
    },
  ];

  const currentFactor = dnaFactors[selectedFactorIndex];

  return (
    <div className="veltrex-card p-5 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-veltrex-cobalt text-white flex items-center justify-center font-bold text-xs">
            DNA
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-veltrex-cobalt uppercase tracking-wider">RISK DNA VECTOR EXPLAINER</h3>
            <p className="text-[10px] text-slate-500 font-medium">Deconstructed Multi-Factor AI Risk Attribution</p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-bold border border-slate-200">
          ENSEMBLE ML
        </span>
      </div>

      {/* DNA Center Gauge & Factor Vectors */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left: DNA Radial Score (5 Cols) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-sky-50/50 rounded-xl border border-sky-100">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" className="stroke-slate-200" strokeWidth="6" fill="transparent" />
              <circle
                cx="50"
                cy="50"
                r="42"
                className={`transition-all duration-1000 ${isCritical ? 'stroke-rose-600' : isHigh ? 'stroke-amber-600' : 'stroke-emerald-600'}`}
                strokeWidth="7"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * score) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute text-center flex flex-col items-center">
              <span className={`text-3xl font-black font-mono tracking-tight ${isCritical ? 'text-rose-600' : 'text-amber-600'}`}>
                {score}
              </span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">RISK INDEX</span>
              <span className={`mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase text-white ${isCritical ? 'bg-rose-600' : 'bg-amber-600'}`}>
                {location.riskLevel}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-semibold text-slate-500 mt-1">WINDOW: {location.expectedRiskWindow}</span>
        </div>

        {/* Right: Factor Selector Vectors (7 Cols) */}
        <div className="md:col-span-7 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            CLICK FACTOR FOR EXPLANATION:
          </span>

          <div className="space-y-1.5">
            {dnaFactors.map((f, idx) => {
              const Icon = f.icon;
              const isSelected = selectedFactorIndex === idx;

              return (
                <button
                  key={f.name}
                  onClick={() => setSelectedFactorIndex(idx)}
                  className={`w-full p-2 rounded-xl border text-xs flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-veltrex-cobalt text-white border-veltrex-cobalt shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-300' : f.color}`} />
                    <span className="font-bold">{f.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="text-[11px] opacity-80">{f.value}</span>
                    <span className={`font-extrabold text-xs ${isSelected ? 'text-sky-300' : 'text-rose-600'}`}>{f.weight}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expanded Factor Detail Box */}
      {currentFactor && (
        <div className="p-3.5 bg-veltrex-cobalt text-white rounded-xl space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs border-b border-slate-700 pb-1.5">
            <span className="font-bold flex items-center space-x-1.5 text-sky-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentFactor.name}: {currentFactor.value}</span>
            </span>
            <span className="font-mono text-emerald-400 text-[10px]">Confidence: {currentFactor.confidence}</span>
          </div>
          <p className="text-xs text-slate-200 leading-normal">
            <strong className="text-amber-300 font-bold">Why it matters:</strong> "{currentFactor.whyItMatters}"
          </p>
        </div>
      )}
    </div>
  );
};

