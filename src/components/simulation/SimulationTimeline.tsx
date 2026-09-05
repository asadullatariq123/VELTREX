import React from 'react';
import { CheckCircle2, Circle, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export interface TimelineStage {
  stage: number;
  stageName: string;
  label: string;
  description: string;
}

export const STAGES_LIST: TimelineStage[] = [
  { stage: 1, stageName: 'BASELINE', label: 'Baseline', description: 'Normal monitoring conditions.' },
  { stage: 2, stageName: 'RAINFALL_ESCALATION', label: 'Rainfall Escalation', description: 'Heavy monsoon rainfall surge detected.' },
  { stage: 3, stageName: 'SOIL_SATURATION', label: 'Soil Saturation', description: 'Terrain moisture saturation increasing.' },
  { stage: 4, stageName: 'RAPID_RISK_ESCALATION', label: 'Risk Escalation', description: 'Rapid landslide risk escalation.' },
  { stage: 5, stageName: 'AI_PREDICTION', label: 'AI Prediction', description: 'Spatial LSTM landslide likelihood surge.' },
  { stage: 6, stageName: 'FIELD_EVIDENCE', label: 'Field Evidence', description: 'Geo-tagged slope crack report received.' },
  { stage: 7, stageName: 'IMPACT_ASSESSMENT', label: 'Impact Assessment', description: 'Potential highway & settlement impact detected.' },
  { stage: 8, stageName: 'EARLY_WARNING', label: 'Early Warning', description: 'P1 Early Warning & incident command issued.' }
];

interface SimulationTimelineProps {
  currentStage: number;
  totalStages?: number;
  onSelectStage?: (stageNum: number) => void;
}

export const SimulationTimeline: React.FC<SimulationTimelineProps> = ({
  currentStage,
  totalStages = 8,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          Live Disaster Simulation Timeline
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          Stage {currentStage > totalStages ? totalStages : currentStage} of {totalStages}
        </span>
      </div>

      {/* Timeline Steps Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {STAGES_LIST.map((st) => {
          const isCompleted = currentStage > st.stage;
          const isCurrent = currentStage === st.stage;

          return (
            <div
              key={st.stage}
              className={`flex flex-col p-3 rounded-lg border transition-all duration-300 relative overflow-hidden ${
                isCurrent
                  ? 'bg-cyan-950 border-cyan-400 shadow-md ring-1 ring-cyan-400/50'
                  : isCompleted
                  ? 'bg-slate-800 border-emerald-500/60 text-slate-200'
                  : 'bg-slate-900 border-slate-700 text-slate-300'
              }`}
            >
              {/* Highlight bar for active stage */}
              {isCurrent && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-300 animate-pulse" />
              )}

              <div className="flex items-center justify-between mb-2">
                <span className={`font-mono text-xs font-bold ${
                  isCurrent ? 'text-cyan-300' : isCompleted ? 'text-emerald-400' : 'text-slate-300'
                }`}>
                  0{st.stage}
                </span>

                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
              </div>

              <div className="font-bold text-xs leading-tight mb-1 text-white line-clamp-1">
                {st.label}
              </div>

              <div className="text-[10px] leading-tight text-slate-300 line-clamp-2">
                {st.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
