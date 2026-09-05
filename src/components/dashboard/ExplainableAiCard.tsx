import React from 'react';
import { Brain, Info, Database } from 'lucide-react';
import { NerLocation } from '../../types';

interface ExplainableAiCardProps {
  location: NerLocation;
}

export const ExplainableAiCard: React.FC<ExplainableAiCardProps> = ({ location }) => {
  const contributors = location.xaiContributors;

  return (
    <div className="aurora-card rounded-2xl p-5 shadow-sm space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-aurora-mineral" />
          <div>
            <h3 className="text-xs font-black text-aurora-forest uppercase tracking-wider">WHY IS THE RISK RISING?</h3>
            <p className="text-[10px] text-aurora-mineral">VELTREX Explainable AI (XAI) Vector Attribution</p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-aurora-glacier text-aurora-forest text-[10px] font-bold font-mono">
          Engine: VELTREX v1.0
        </span>
      </div>

      {/* Factors list with animated progress bars */}
      <div className="space-y-3">
        {contributors.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center space-x-2 text-aurora-forest">
                <span className="text-sm">{item.icon}</span>
                <span>{item.factor}</span>
              </span>
              <span className="font-mono font-bold text-aurora-coral">+{item.weightPct}%</span>
            </div>

            <div className="w-full h-2 bg-aurora-glacier/60 rounded-full overflow-hidden border border-aurora-mineral/10">
              <div
                className="h-full bg-gradient-to-r from-aurora-mint via-aurora-amber to-aurora-coral rounded-full transition-all duration-700"
                style={{ width: `${item.weightPct * 3.5}%` }}
              />
            </div>
            <p className="text-[10px] text-aurora-forest/60">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Plain Language Summary */}
      <div className="p-3 rounded-xl bg-aurora-glacier/40 border border-aurora-mineral/15 text-xs text-aurora-forest flex items-start space-x-2">
        <Info className="w-4 h-4 text-aurora-mineral shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-aurora-forest font-bold">AI Summary:</strong> Risk is escalating primarily due to torrential 6-hour rainfall precipitation accumulating over steep 38° slope profiles and saturated soil layers.
        </p>
      </div>

      {/* Data Confidence Box */}
      <div className="bg-aurora-forest text-aurora-ivory p-3.5 rounded-xl flex items-center justify-between text-xs shadow-md">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-aurora-mint" />
          <div>
            <div className="font-bold flex items-center space-x-1.5">
              <span>DATA CONFIDENCE:</span>
              <span className="text-aurora-mint font-mono font-black">{location.confidenceScore}% HIGH</span>
            </div>
            <div className="text-[10px] opacity-75">Based on Rain, Soil, Terrain, History & Satellite</div>
          </div>
        </div>

        <div className="text-right font-mono">
          <div className="text-[10px] opacity-75">Sensor Coverage</div>
          <div className="text-xs font-bold text-aurora-mint">78% Active</div>
        </div>
      </div>
    </div>
  );
};
