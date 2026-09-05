import React, { useEffect, useState } from 'react';
import { Sparkles, X, Activity, Server, Radio } from 'lucide-react';
import { SimulationStatus } from '../simulation/SimulationStatus';
import { SimulationTimeline, STAGES_LIST } from '../simulation/SimulationTimeline';
import { SimulationMetrics } from '../simulation/SimulationMetrics';
import { SimulationControl } from '../simulation/SimulationControl';
import { SimulationResult, SimulationResultData } from '../simulation/SimulationResult';
import { apiClient } from '../../services/apiClient';
import { liveStore } from '../../services/liveSimulationStore';

interface DisasterSimModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DisasterSimModal: React.FC<DisasterSimModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'FAILED'>('IDLE');
  const [currentStage, setCurrentStage] = useState(1);
  const [speed, setSpeed] = useState<'SLOW' | 'NORMAL' | 'FAST'>('NORMAL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<SimulationResultData | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState({
    rainfall24h: 45,
    soilMoisture: 52,
    riskScore: 42,
    riskLevel: 'MODERATE' as const,
    mlProbability: 0.58,
    mlConfidence: 0.84,
    affectedInfrastructure: 0,
    priority: 'P3' as const,
    alertLevel: 'NONE' as const,
    stageName: 'BASELINE',
    description: 'Normal monitoring conditions.',
  });

  // Fetch current backend simulation status when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchStatus = async () => {
      try {
        const res = await apiClient.getSimulationStatus();
        if (res.success && res.data) {
          setStatus(res.data.status || 'IDLE');
          setCurrentStage(res.data.currentStage || 1);
          setSpeed(res.data.speed || 'NORMAL');
          if (res.data.currentMetrics) {
            updateMetricsFromStageData(res.data.currentMetrics);
          }
          if (res.data.result) {
            setResult(res.data.result);
          }
        }
      } catch (err) {
        console.warn('Fallback: Initializing local simulation state');
      }
    };

    fetchStatus();
  }, [isOpen]);

  const updateMetricsFromStageData = (stageData: any) => {
    if (!stageData) return;
    setCurrentMetrics({
      rainfall24h: stageData.rainfall24h ?? 45,
      soilMoisture: stageData.soilMoisture ?? 52,
      riskScore: stageData.riskScore ?? 42,
      riskLevel: stageData.riskLevel || 'MODERATE',
      mlProbability: stageData.mlProbability ?? 0.58,
      mlConfidence: stageData.mlConfidence ?? 0.84,
      affectedInfrastructure: stageData.affectedInfrastructure ?? 0,
      priority: stageData.priority || 'P3',
      alertLevel: stageData.alertLevel || 'NONE',
      stageName: stageData.stageName || 'BASELINE',
      description: stageData.description || 'Normal monitoring conditions.',
    });
  };

  const addLog = (msg: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 49)]);
  };

  const handleStart = async (selectedSpeed: 'SLOW' | 'NORMAL' | 'FAST') => {
    setIsProcessing(true);
    setResult(null);
    try {
      const res = await apiClient.startSimulation({
        scenarioId: 'ner-monsoon-landslide',
        locationId: 'loc-aizawl-01',
        speed: selectedSpeed,
      });
      if (res.success && res.data) {
        setStatus('RUNNING');
        setCurrentStage(res.data.currentStage || 1);
        setSpeed(selectedSpeed);
        addLog(`Started simulation ${res.data.simulationId} at speed ${selectedSpeed}`);
        liveStore.startLiveSimulation();
      }
    } catch (err: any) {
      addLog(`Failed to start simulation: ${err.message || err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePause = async () => {
    setIsProcessing(true);
    try {
      const res = await apiClient.pauseSimulation();
      if (res.success) {
        setStatus('PAUSED');
        addLog('Simulation paused by operator');
      }
    } catch (err: any) {
      addLog(`Failed to pause: ${err.message || err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResume = async () => {
    setIsProcessing(true);
    try {
      const res = await apiClient.resumeSimulation();
      if (res.success) {
        setStatus('RUNNING');
        addLog('Simulation resumed');
      }
    } catch (err: any) {
      addLog(`Failed to resume: ${err.message || err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStop = async () => {
    setIsProcessing(true);
    try {
      const res = await apiClient.stopSimulation();
      if (res.success) {
        setStatus('CANCELLED');
        addLog('Simulation stopped by operator');
      }
    } catch (err: any) {
      addLog(`Failed to stop: ${err.message || err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = async () => {
    setIsProcessing(true);
    setResult(null);
    try {
      const res = await apiClient.resetSimulation();
      if (res.success) {
        setStatus('IDLE');
        setCurrentStage(1);
        addLog('Reset simulation state & cleared DEMO records');
        liveStore.stopLiveSimulation();
      }
    } catch (err: any) {
      addLog(`Failed to reset: ${err.message || err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      {/* Centered Premium Modal Window */}
      <div className="bg-slate-900 border border-slate-800 w-full max-w-[1300px] h-[92vh] max-h-[820px] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative text-slate-100">
        
        {/* HEADER BAR */}
        <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-cyan-950">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  VELTREX LIVE DISASTER SIMULATION ENGINE
                </h2>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
                  SOFTWARE DEMONSTRATION
                </span>
              </div>
              <p className="text-xs text-slate-400">
                NER Monsoon Landslide Escalation • Aizawl Bypass Ridge (High Risk Sector)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-600 text-slate-400 hover:text-white transition-all border border-slate-700"
            title="Close Simulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-950/60">
          {/* 1. Status Bar */}
          <SimulationStatus
            status={status}
            currentStage={currentStage}
            totalStages={8}
            stageName={currentMetrics.stageName}
            speed={speed}
          />

          {/* 2. Completed Summary Result Card (If status === COMPLETED) */}
          {status === 'COMPLETED' && result && (
            <SimulationResult
              result={result}
              onReset={handleReset}
              onClose={onClose}
            />
          )}

          {/* 3. Stage Timeline Bar */}
          <SimulationTimeline
            currentStage={currentStage}
            totalStages={8}
          />

          {/* 4. Live Metrics Panel */}
          <SimulationMetrics
            rainfall24h={currentMetrics.rainfall24h}
            soilMoisture={currentMetrics.soilMoisture}
            riskScore={currentMetrics.riskScore}
            riskLevel={currentMetrics.riskLevel}
            mlProbability={currentMetrics.mlProbability}
            mlConfidence={currentMetrics.mlConfidence}
            affectedInfrastructure={currentMetrics.affectedInfrastructure}
            priority={currentMetrics.priority}
            alertLevel={currentMetrics.alertLevel}
          />

          {/* 5. Live Stage Details & Telemetry Log Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Stage Description & Directive Card */}
            <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 font-mono font-bold text-sm flex items-center justify-center border border-cyan-500/40">
                    0{currentStage}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      {currentMetrics.stageName.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-xs text-slate-400">{currentMetrics.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-xs font-mono font-bold text-cyan-300 border border-slate-700">
                    MODE: DEMO
                  </span>
                </div>
              </div>

              {/* Stage-Specific Context Info */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-2 text-xs">
                <div className="text-slate-400 uppercase font-mono font-bold tracking-wider text-[10px]">
                  SIMULATED SYSTEM WORKFLOW:
                </div>
                <div className="text-slate-200 leading-relaxed font-sans">
                  Environmental Data Ingestion → Baseline Risk Calculation → AI Prediction Pipeline → Field Evidence Correlation → Impact GIS Polygon → P1 Early Warning Dispatch.
                </div>
              </div>
            </div>

            {/* Real-time Telemetry Stream Log */}
            <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 border-b border-slate-800 pb-2 mb-2">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Radio className="w-4 h-4 animate-pulse" />
                  REAL-TIME TELEMETRY LOG
                </span>
                <span className="text-emerald-400 text-[10px]">WEBSOCKET ACTIVE</span>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto font-mono text-[11px] text-slate-300 pr-1">
                {logs.length === 0 ? (
                  <div className="text-slate-500 italic py-4 text-center">
                    Ready. Press START SIMULATION to begin live event stream.
                  </div>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <span className="text-cyan-500 shrink-0">&gt;</span>
                      <span className="text-slate-300">{log}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 6. Simulation Controls Panel */}
          <SimulationControl
            status={status}
            speed={speed}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
            onReset={handleReset}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  );
};
