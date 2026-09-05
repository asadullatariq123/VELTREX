import React, { useState, useEffect } from 'react';
import { Database, TrendingUp, AlertTriangle, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { liveStore } from '../services/liveSimulationStore';
import { apiClient } from '../services/apiClient';
import { ExplainableAiCard } from '../components/dashboard/ExplainableAiCard';

export type PredictionHorizon = 'NOW' | '6H' | '24H' | '72H' | '7D';

export const PredictionsPage: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState(liveStore.getSelectedLocation());
  const [horizon, setHorizon] = useState<PredictionHorizon>('24H');
  const [predictionsData, setPredictionsData] = useState<any>(null);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const locations = liveStore.getLocations();

  useEffect(() => {
    fetchPredictions();
    fetchModelMetadata();
  }, [selectedLocation.id, horizon]);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getPredictions(selectedLocation.id);
      if (res.success && res.data) {
        setPredictionsData(res.data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const fetchModelMetadata = async () => {
    try {
      const res = await apiClient.getPredictionModelInfo();
      if (res.success && res.data) {
        setModelInfo(res.data);
      }
    } catch {
      // Fallback
    }
  };

  const currentPred = predictionsData?.predictions?.find((p: any) => p.horizon === horizon) || {
    horizon,
    probability: (selectedLocation.riskScore / 100) * 0.95,
    riskLevel: selectedLocation.riskLevel,
    confidence: selectedLocation.confidenceScore / 100,
    modelName: 'VELTREX-DEMO-V1',
    predictionSource: 'DEMO_MODEL',
  };

  const currentProbPct = Math.round((currentPred.probability || 0.75) * 100);
  const currentConfidencePct = Math.round((currentPred.confidence || 0.86) * 100);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1800px] mx-auto bg-topo-pattern min-h-screen">
      {/* Header */}
      <div className="veltrex-card p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-veltrex-cobalt text-white flex items-center justify-center font-bold text-sm">
            AI
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                PREDICTIVE SPATIAL MODELING
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold font-mono">
                PROTOTYPE RISK MODEL
              </span>
            </div>
            <h1 className="text-2xl font-black text-veltrex-cobalt tracking-tight">
              WHERE WILL THE TERRAIN MOVE NEXT?
            </h1>
          </div>
        </div>

        {/* Time Window Buttons */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="text-slate-400 font-sans text-xs font-bold mr-1">FORECAST HORIZON:</span>
          {(['NOW', '6H', '24H', '72H', '7D'] as const).map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`px-3 py-1.5 rounded-lg border font-bold uppercase transition-all ${
                horizon === h
                  ? 'bg-veltrex-cobalt text-white border-veltrex-cobalt shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {h}
            </button>
          ))}
          <button
            onClick={fetchPredictions}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            title="Recalculate Prediction"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Explainable AI Card & Model Architecture Tech Card */}
        <div className="lg:col-span-7 space-y-6">
          {/* Likelihood Summary Banner */}
          <div className="veltrex-card rounded-2xl p-5 border-l-4 border-veltrex-cobalt flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-sky-500" />
                <span className="text-xs font-bold text-slate-500 font-mono">MODEL-ESTIMATED LIKELIHOOD ({horizon})</span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {currentProbPct}% Likelihood ({currentPred.riskLevel || 'HIGH'})
              </div>
              <p className="text-xs text-slate-600">
                Confidence: <strong className="font-mono">{currentConfidencePct}%</strong> • Fusion: BASELINE_ML_WEIGHTED
              </p>
            </div>

            <div className="text-right">
              <span className={`px-3 py-1.5 rounded-xl font-bold font-mono text-xs ${
                currentPred.riskLevel === 'CRITICAL' ? 'bg-rose-600 text-white' :
                currentPred.riskLevel === 'HIGH' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {currentPred.riskLevel || 'HIGH'}
              </span>
            </div>
          </div>

          <ExplainableAiCard location={selectedLocation} />

          {/* Model Architecture Tech Card */}
          <div className="veltrex-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-veltrex-cobalt uppercase tracking-wider flex items-center space-x-2">
                <Database className="w-4 h-4 text-sky-600" />
                <span>PREDICTIVE ENGINE ARCHITECTURE & MODEL METADATA</span>
              </h3>
              <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                SOURCE: {modelInfo?.predictionSource || 'DEMO_MODEL'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-sans font-semibold">Active Algorithm</span>
                <span className="font-bold text-veltrex-cobalt">{modelInfo?.modelName || 'VELTREX-DEMO-V1'} (v{modelInfo?.modelVersion || '1.0.0'})</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-sans font-semibold">Training Status</span>
                <span className="font-bold text-slate-800">{modelInfo?.trainingStatus || 'DEMO_CALIBRATED'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-sans font-semibold">Feature Vector</span>
                <span className="font-bold text-emerald-600">{modelInfo?.featureCount || 11} Inputs Extracted</span>
              </div>
            </div>

            {/* Prototype Disclaimer */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Disclaimer:</strong> {modelInfo?.disclaimer || 'The current prototype prediction model is intended for demonstration and engineering validation. It is not a scientifically validated operational landslide forecasting model.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Risk Forecast Windows for Monitored Locations */}
        <div className="lg:col-span-5 veltrex-card rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-extrabold text-veltrex-cobalt uppercase tracking-wider flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span>TERRAIN FAILURE PROBABILITY ({horizon} HORIZON)</span>
          </h3>

          <div className="space-y-2">
            {locations.map((loc) => (
              <div
                key={loc.id}
                onClick={() => {
                  liveStore.setSelectedLocation(loc.id);
                  setSelectedLocation(loc);
                }}
                className={`p-3.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                  loc.id === selectedLocation.id
                    ? 'bg-veltrex-cobalt text-white border-veltrex-cobalt shadow-sm'
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div>
                  <span className="font-extrabold block text-sm">{loc.name}</span>
                  <span className="text-[10px] opacity-75">{loc.state} • District: {loc.district}</span>
                </div>

                <div className="text-right font-mono">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                    loc.riskLevel === 'CRITICAL' ? 'bg-rose-600 text-white' :
                    loc.riskLevel === 'HIGH' ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {loc.riskScore}/100
                  </span>
                  <span className="text-[10px] opacity-75 block mt-0.5">{loc.confidenceScore}% Conf</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
