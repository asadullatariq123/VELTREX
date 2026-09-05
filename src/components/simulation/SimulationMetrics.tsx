import React from 'react';
import { CloudRain, Droplets, Gauge, Brain, ShieldAlert, Building2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface SimulationMetricsProps {
  rainfall24h: number;
  soilMoisture: number;
  riskScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  mlProbability: number;
  mlConfidence: number;
  affectedInfrastructure: number;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  alertLevel: 'NONE' | 'ADVISORY' | 'WARNING' | 'EMERGENCY';
}

export const SimulationMetrics: React.FC<SimulationMetricsProps> = ({
  rainfall24h,
  soilMoisture,
  riskScore,
  riskLevel,
  mlProbability,
  mlConfidence,
  affectedInfrastructure,
  priority,
  alertLevel,
}) => {
  const getRiskBadgeColor = () => {
    switch (riskLevel) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/50';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'MODERATE':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
    }
  };

  const getAlertBadgeColor = () => {
    switch (alertLevel) {
      case 'EMERGENCY':
        return 'bg-red-600 text-white font-bold animate-pulse';
      case 'WARNING':
        return 'bg-amber-500 text-slate-950 font-bold';
      case 'ADVISORY':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {/* 1. Rainfall 24H */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-slate-300 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider">Rainfall 24H</span>
          <CloudRain className="w-4 h-4 text-sky-400" />
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold font-mono text-white">{rainfall24h}</span>
          <span className="text-xs text-slate-400 font-mono">mm</span>
        </div>
      </div>

      {/* 2. Soil Moisture */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-slate-300 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider">Soil Moisture</span>
          <Droplets className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold font-mono text-white">{soilMoisture}</span>
          <span className="text-xs text-slate-400 font-mono">%</span>
        </div>
      </div>

      {/* 3. Risk Score */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-slate-300 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider">Risk Score</span>
          <Gauge className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold font-mono text-white">{riskScore}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getRiskBadgeColor()}`}>
            {riskLevel}
          </span>
        </div>
      </div>

      {/* 4. ML Likelihood */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-slate-300 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider">ML Likelihood</span>
          <Brain className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold font-mono text-purple-300">
            {Math.round(mlProbability * 100)}%
          </span>
        </div>
      </div>

      {/* 5. ML Confidence */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-slate-300 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider">Confidence</span>
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold font-mono text-cyan-300">
            {Math.round(mlConfidence * 100)}%
          </span>
        </div>
      </div>

      {/* 6. Impacted Infrastructure */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-slate-300 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider">Affected Assets</span>
          <Building2 className="w-4 h-4 text-orange-400" />
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold font-mono text-white">{affectedInfrastructure}</span>
          <span className="text-xs text-slate-400">assets</span>
        </div>
      </div>

      {/* 7. Priority */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-slate-300 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider">Priority</span>
          <AlertTriangle className="w-4 h-4 text-rose-400" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold font-mono text-white">{priority}</span>
          <span className="text-[10px] text-rose-400 font-semibold uppercase">
            {priority === 'P1' ? 'CRITICAL' : 'ROUTINE'}
          </span>
        </div>
      </div>

      {/* 8. Alert Status */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-slate-300 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider">Alert Status</span>
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-center justify-between">
          <span className={`px-2.5 py-1 rounded text-xs tracking-wide uppercase ${getAlertBadgeColor()}`}>
            {alertLevel}
          </span>
        </div>
      </div>
    </div>
  );
};
