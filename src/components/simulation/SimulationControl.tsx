import React, { useState } from 'react';
import { Play, Pause, Square, RotateCcw, FastForward, SlidersHorizontal } from 'lucide-react';

interface SimulationControlProps {
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  speed: 'SLOW' | 'NORMAL' | 'FAST';
  onStart: (speed: 'SLOW' | 'NORMAL' | 'FAST') => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
  isProcessing?: boolean;
}

export const SimulationControl: React.FC<SimulationControlProps> = ({
  status,
  speed: initialSpeed,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
  isProcessing = false,
}) => {
  const [selectedSpeed, setSelectedSpeed] = useState<'SLOW' | 'NORMAL' | 'FAST'>(initialSpeed || 'NORMAL');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const canStart = status === 'IDLE' || status === 'COMPLETED' || status === 'CANCELLED' || status === 'FAILED';
  const canPause = status === 'RUNNING';
  const canResume = status === 'PAUSED';
  const canStop = status === 'RUNNING' || status === 'PAUSED';
  const canReset = status === 'COMPLETED' || status === 'CANCELLED' || status === 'FAILED' || status === 'PAUSED';

  const handleResetClick = () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }
    setShowResetConfirm(false);
    onReset();
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
      {/* Control Buttons Group */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* START / RESUME button */}
        {canStart && (
          <button
            onClick={() => onStart(selectedSpeed)}
            disabled={isProcessing}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>START SIMULATION</span>
          </button>
        )}

        {canPause && (
          <button
            onClick={onPause}
            disabled={isProcessing}
            className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50"
          >
            <Pause className="w-4 h-4 fill-current" />
            <span>PAUSE</span>
          </button>
        )}

        {canResume && (
          <button
            onClick={onResume}
            disabled={isProcessing}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME</span>
          </button>
        )}

        {canStop && (
          <button
            onClick={onStop}
            disabled={isProcessing}
            className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>STOP</span>
          </button>
        )}

        {canReset && (
          <div className="relative">
            <button
              onClick={handleResetClick}
              disabled={isProcessing}
              className={`flex items-center space-x-2 font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 border ${
                showResetConfirm
                  ? 'bg-rose-700 text-white border-rose-500 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>{showResetConfirm ? 'CONFIRM RESET?' : 'RESET DEMO'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Speed Selector */}
      <div className="flex items-center space-x-2 bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
        <SlidersHorizontal className="w-4 h-4 text-slate-400 ml-2 mr-1" />
        <span className="text-xs text-slate-400 font-medium mr-2">Speed:</span>

        {(['SLOW', 'NORMAL', 'FAST'] as const).map((spd) => {
          const isSelected = selectedSpeed === spd;
          return (
            <button
              key={spd}
              onClick={() => setSelectedSpeed(spd)}
              disabled={status === 'RUNNING'}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                isSelected
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              } disabled:opacity-60`}
            >
              {spd === 'SLOW' ? 'SLOW (8s)' : spd === 'NORMAL' ? 'NORMAL (4s)' : 'FAST (1.5s)'}
            </button>
          );
        })}
      </div>
    </div>
  );
};
