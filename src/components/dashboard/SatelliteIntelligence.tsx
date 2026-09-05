import React, { useEffect, useState } from 'react';
import { Satellite, Scan, ShieldCheck, AlertCircle } from 'lucide-react';
import { NerLocation } from '../../types';
import { apiClient } from '../../services/apiClient';

interface SatelliteIntelligenceProps {
  location: NerLocation;
}

export const SatelliteIntelligence: React.FC<SatelliteIntelligenceProps> = ({ location }) => {
  const sat = location.satelliteChange;
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [satData, setSatData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    apiClient
      .getSatelliteObservation(location.id)
      .then((res) => {
        if (isMounted) {
          if (res && res.data) {
            setSatData(res.data);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'SATELLITE DATA UNAVAILABLE');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [location.id]);

  const providerName = satData?.source === 'SENTINEL_HUB' || satData?.provider === 'SentinelHubProvider'
    ? 'SENTINEL HUB'
    : 'DEMO SATELLITE';
  const obsStatus = satData?.status || 'DEMO';
  const obsType = satData?.observationType || 'SAR';
  const obsTime = satData?.observationTime ? new Date(satData.observationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '08:21 IST';
  const cloudCoverage = satData?.cloudCoverage !== undefined ? `${satData.cloudCoverage}%` : '12%';

  const isUnavailable = obsStatus === 'AUTH FAILED' || obsStatus === 'DATA REQUEST FAILED' || Boolean(error);

  return (
    <div className="veltrex-card p-5 rounded-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-veltrex-cobalt text-white flex items-center justify-center shrink-0">
            <Satellite className="w-4 h-4 text-sky-300" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-veltrex-cobalt uppercase tracking-wider">
              SATELLITE TERRAIN DISPLACEMENT ({obsType})
            </h3>
            <p className="text-[10px] text-slate-600 font-medium">
              Provider: <span className="font-bold text-veltrex-cobalt">{providerName}</span> • Cloud Cover: {cloudCoverage}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border flex items-center space-x-1 ${
            obsStatus === 'LIVE'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : obsStatus === 'AUTH FAILED' || obsStatus === 'DATA REQUEST FAILED'
              ? 'bg-rose-100 text-rose-800 border-rose-300'
              : 'bg-cyan-100 text-cyan-800 border-cyan-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              obsStatus === 'LIVE' ? 'bg-emerald-500 animate-ping' : 'bg-cyan-500'
            }`}></span>
            <span>{providerName} • {obsStatus}</span>
          </span>
        </div>
      </div>

      {isUnavailable ? (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">SATELLITE DATA UNAVAILABLE</h4>
          <p className="text-[11px] text-slate-400 font-mono">
            {obsStatus === 'AUTH FAILED' ? 'Sentinel Hub OAuth authentication failed. Please verify API credentials.' : 'Satellite pass imagery currently unavailable for target bounding box.'}
          </p>
        </div>
      ) : (
        <>
          {/* Interactive Split Comparison Slider */}
          <div className="relative w-full h-52 bg-slate-900 rounded-xl overflow-hidden border border-slate-200 select-none group">
            {/* Layer 1: BEFORE Baseline */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${sat.beforeImgUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'})`
              }}
            >
              <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded bg-slate-950/90 text-white font-mono text-[10px] font-bold border border-white/30 shadow-md">
                BASELINE OBSERVATION
              </div>
            </div>

            {/* Layer 2: NOW Recent Pass */}
            <div 
              className="absolute inset-0 bg-cover bg-center border-r-2 border-sky-400 shadow-2xl overflow-hidden"
              style={{ 
                width: `${sliderPos}%`,
                backgroundImage: `url(${
                  satData?.imageUrl && !satData.imageUrl.includes('veltrex.gov.in') 
                    ? satData.imageUrl 
                    : sat.nowImgUrl || 'https://images.unsplash.com/photo-1511497584788-8767611136f6?auto=format&fit=crop&w=1200&q=80'
                })`
              }}
            >
              <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded bg-rose-600 text-white font-mono text-[10px] font-bold border border-white/30 shadow-md">
                RECENT PASS (+{satData?.displacement || 4.2}mm)
              </div>

              <div className="absolute inset-0 bg-rose-500/10 flex items-center justify-center pointer-events-none">
                <div className="p-2.5 bg-slate-950/90 border border-rose-500 rounded-lg text-center text-xs font-bold text-white shadow-2xl backdrop-blur-sm">
                  ⚠️ SHIFT: +{satData?.displacement || 4.2}mm ({obsType})
                </div>
              </div>
            </div>

            {/* Range Input Overlay */}
            <input 
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-20"
            />

            {/* Divider Bar */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl z-10 pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-veltrex-cobalt text-white border border-sky-300 flex items-center justify-center font-bold text-xs shadow-lg">
                ↔
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-veltrex-cobalt text-white p-3 rounded-xl text-xs font-mono">
            <div>
              <span className="text-[9px] text-slate-300 block font-sans">Terrain Shift</span>
              <span className="font-bold text-rose-400">+{satData?.displacement || 4.2} mm</span>
            </div>

            <div>
              <span className="text-[9px] text-slate-300 block font-sans">Observation Type</span>
              <span className="font-bold text-emerald-400">{obsType}</span>
            </div>

            <div>
              <span className="text-[9px] text-slate-300 block font-sans">Cloud Cover</span>
              <span className="font-bold text-sky-300">{cloudCoverage}</span>
            </div>

            <div>
              <span className="text-[9px] text-slate-300 block font-sans">Observation Time</span>
              <span className="font-bold text-amber-300">{obsTime}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

