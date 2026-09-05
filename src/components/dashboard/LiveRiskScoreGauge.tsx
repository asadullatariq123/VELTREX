import React, { useState } from 'react';
import { NerLocation } from '../../types';
import { Brain, CloudRain, Droplets, Mountain, History, Satellite, Sparkles } from 'lucide-react';

interface LiveRiskScoreGaugeProps {
  location: NerLocation;
}

export const LiveRiskScoreGauge: React.FC<LiveRiskScoreGaugeProps> = ({ location }) => {
  const [activeFactorIndex, setActiveFactorIndex] = useState<number | null>(0);
  const score = location.riskScore;
  const isCritical = location.riskLevel === 'CRITICAL';
  const isHigh = location.riskLevel === 'HIGH';

  const strokeDashoffset = 283 - (283 * score) / 100;

  const factors = [
    { name: 'Rainfall', value: location.rainfallMm + 'mm', weight: '+24%', icon: CloudRain, color: 'text-aurora-sky' },
    { name: 'Soil Moisture', value: location.soilMoisturePct + '%', weight: '+21%', icon: Droplets, color: 'text-aurora-mint' },
    { name: 'Slope Inclination', value: location.slopeDeg + '°', weight: '+18%', icon: Mountain, color: 'text-aurora-amber' },
    { name: 'Terrain Shift', value: '2.4 ha', weight: '+11%', icon: Satellite, color: 'text-aurora-coral' },
    { name: 'History', value: '3 Failure Events', weight: '+14%', icon: History, color: 'text-aurora-mineral' },
  ];

  const selectedFactor = activeFactorIndex !== null ? factors[activeFactorIndex] : factors[0];

  return (
    <div className="aurora-card p-5 rounded-2xl space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-aurora-forest text-aurora-mint flex items-center justify-center">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-aurora-forest uppercase tracking-wider">LIVE RADIAL RISK INDEX</h3>
            <p className="text-[10px] text-aurora-mineral">Multi-factor environmental vector synthesis</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-aurora-glacier text-aurora-mineral">
          CONFIDENCE {location.confidenceScore}%
        </span>
      </div>

      {/* Radial Gauge Centerpiece */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
        <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              className="stroke-aurora-glacier/60"
              strokeWidth="7"
              fill="transparent"
            />
            {/* Value Ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              className={`transition-all duration-1000 ease-out ${
                isCritical ? 'stroke-aurora-crimson' : isHigh ? 'stroke-aurora-coral' : 'stroke-aurora-amber'
              }`}
              strokeWidth="8"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className={`text-4xl font-black font-mono tracking-tighter ${
              isCritical ? 'text-aurora-crimson' : isHigh ? 'text-aurora-coral' : 'text-aurora-mineral'
            }`}>
              {score}
            </span>
            <span className="text-[10px] font-bold text-aurora-forest/60 uppercase">RISK INDEX</span>
            <span className={`mt-0.5 px-2 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider ${
              isCritical ? 'bg-aurora-crimson text-white' : 'bg-aurora-amber text-aurora-forest'
            }`}>
              {location.riskLevel}
            </span>
          </div>
        </div>

        {/* Factors List / Selector */}
        <div className="flex-1 space-y-2 w-full">
          <span className="text-[10px] font-bold text-aurora-mineral uppercase tracking-wider block">
            CLICK FACTOR TO INSPECT CONTRIBUTION:
          </span>
          <div className="space-y-1.5">
            {factors.map((f, idx) => {
              const Icon = f.icon;
              const isSelected = activeFactorIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveFactorIndex(idx)}
                  className={`w-full p-2 rounded-xl text-xs flex items-center justify-between transition-all border ${
                    isSelected 
                      ? 'bg-aurora-forest text-aurora-ivory border-aurora-forest shadow-md' 
                      : 'bg-white/80 border-aurora-mineral/15 text-aurora-forest hover:bg-aurora-glacier/30'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-aurora-mint' : f.color}`} />
                    <span className="font-bold">{f.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono text-[11px]">
                    <span className="opacity-80">{f.value}</span>
                    <span className={`font-bold ${isSelected ? 'text-aurora-mint' : 'text-aurora-coral'}`}>{f.weight}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Factor Breakdown Footer */}
      {selectedFactor && (
        <div className="p-3 bg-aurora-glacier/40 rounded-xl border border-aurora-mineral/20 text-xs flex items-center justify-between">
          <span className="font-semibold text-aurora-forest">
            Selected Vector: <strong className="text-aurora-mineral">{selectedFactor.name}</strong> ({selectedFactor.value})
          </span>
          <span className="font-mono font-bold text-aurora-coral">
            Weight: {selectedFactor.weight} Impact
          </span>
        </div>
      )}
    </div>
  );
};
