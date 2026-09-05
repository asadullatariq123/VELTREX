import React from 'react';
import { CheckCircle2, ShieldAlert, TrendingUp, Building2, Brain, AlertTriangle, ArrowRight } from 'lucide-react';

export interface SimulationResultData {
  simulationId: string;
  status: string;
  stagesCompleted: number;
  initialRisk: number;
  finalRisk: number;
  initialProbability: number;
  finalProbability: number;
  finalAlertLevel: string;
  finalPriority: string;
  affectedInfrastructure: number;
  summary: string;
  simulationMode: string;
}

interface SimulationResultProps {
  result: SimulationResultData;
  onReset?: () => void;
  onClose?: () => void;
}

export const SimulationResult: React.FC<SimulationResultProps> = ({ result, onReset, onClose }) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              DISASTER SIMULATION COMPLETE
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Simulation Run ID: {result.simulationId}
            </p>
          </div>
        </div>

        {/* DEMONSTRATION SIMULATION Label */}
        <div className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          ● DEMONSTRATION SIMULATION ONLY
        </div>
      </div>

      {/* Summary Narrative */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 text-sm text-slate-200 leading-relaxed font-sans">
        "{result.summary}"
      </div>

      {/* Metrics Delta Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Risk Score Delta */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-medium">
            <span>Risk Score Escalation</span>
            <TrendingUp className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-center space-x-2 font-mono">
            <span className="text-xl text-slate-400">{result.initialRisk}</span>
            <ArrowRight className="w-4 h-4 text-rose-400" />
            <span className="text-2xl font-bold text-rose-400">{result.finalRisk} CRITICAL</span>
          </div>
        </div>

        {/* ML Likelihood Delta */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-medium">
            <span>ML Failure Likelihood</span>
            <Brain className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-center space-x-2 font-mono">
            <span className="text-xl text-slate-400">{Math.round(result.initialProbability * 100)}%</span>
            <ArrowRight className="w-4 h-4 text-purple-400" />
            <span className="text-2xl font-bold text-purple-300">{Math.round(result.finalProbability * 100)}%</span>
          </div>
        </div>

        {/* Affected Assets */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-medium">
            <span>Affected Infrastructure</span>
            <Building2 className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-white">{result.affectedInfrastructure}</span>
            <span className="text-xs text-slate-400">Critical Assets Mapped</span>
          </div>
        </div>

        {/* Early Warning Alert */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-medium">
            <span>Early Warning Generated</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-rose-600 text-white font-mono font-bold px-2 py-0.5 rounded text-xs">
              {result.finalPriority}
            </span>
            <span className="bg-amber-500 text-slate-950 font-bold px-2.5 py-0.5 rounded text-xs uppercase">
              {result.finalAlertLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Recommended Authority Action */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-bold tracking-wide">
              Recommended Authority Action
            </div>
            <div className="text-sm font-semibold text-slate-200">
              Inspect NH-54 bypass corridor, pre-position SDRF Column #04, and execute traffic detour.
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {onReset && (
            <button
              onClick={onReset}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-all"
            >
              RESET SIMULATION
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
            >
              RETURN TO DASHBOARD
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
