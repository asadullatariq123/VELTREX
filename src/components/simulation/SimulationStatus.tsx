import React from 'react';
import { Activity, ShieldAlert, Sparkles } from 'lucide-react';

interface SimulationStatusProps {
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  currentStage: number;
  totalStages: number;
  stageName?: string;
  speed?: string;
}

export const SimulationStatus: React.FC<SimulationStatusProps> = ({
  status,
  currentStage,
  totalStages,
  stageName,
  speed = 'NORMAL',
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'RUNNING':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'PAUSED':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'COMPLETED':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      case 'CANCELLED':
      case 'FAILED':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-lg">
      <div className="flex items-center space-x-3">
        {/* Subtle pulsing DEMO SIMULATION badge */}
        <div className="flex items-center space-x-2 bg-gradient-to-r from-cyan-950 to-indigo-950 border border-cyan-500/30 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider text-cyan-300">
          <span className="relative flex h-2.5 w-2.5">
            {status === 'RUNNING' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            )}
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
          </span>
          <span className="uppercase">● DEMO SIMULATION</span>
        </div>

        <div className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${getStatusColor()}`}>
          {status}
        </div>
      </div>

      {status !== 'IDLE' && (
        <div className="flex items-center space-x-4 text-xs">
          <div className="text-slate-400">
            Stage:{' '}
            <span className="font-bold text-white font-mono">
              {currentStage}/{totalStages}
            </span>
          </div>

          {stageName && (
            <div className="hidden sm:flex items-center space-x-1.5 text-cyan-300 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold uppercase tracking-wide">{stageName}</span>
            </div>
          )}

          <div className="text-slate-400 font-mono">
            Speed: <span className="text-cyan-400 font-bold">{speed}</span>
          </div>
        </div>
      )}
    </div>
  );
};
