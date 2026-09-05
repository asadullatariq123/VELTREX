import React from 'react';
import { Truck, PhoneCall, Clock, Navigation } from 'lucide-react';
import { liveStore } from '../../services/liveSimulationStore';

export const ResponseResourcesPanel: React.FC = () => {
  const resources = liveStore.getResources();

  return (
    <div className="aurora-card rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Truck className="w-5 h-5 text-aurora-mineral" />
          <div>
            <h3 className="text-xs font-black text-aurora-forest uppercase tracking-wider">NEAREST RESPONSE RESOURCES</h3>
            <p className="text-[10px] text-aurora-mineral">Emergency Dispatched Relief Units Telemetry</p>
          </div>
        </div>

        <span className="text-xs text-aurora-mineral font-mono">Radius &lt; 15 km</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {resources.map((res) => (
          <div key={res.id} className="p-3.5 bg-white rounded-xl border border-aurora-mineral/15 space-y-2 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-bold text-aurora-forest block">{res.name}</span>
                <span className="text-[10px] text-aurora-mineral">{res.type}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-aurora-mint/20 text-aurora-forest font-mono text-[10px] font-bold border border-aurora-mint/40">
                {res.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-aurora-forest font-mono text-[11px] pt-1.5 border-t border-aurora-mineral/10">
              <span className="flex items-center space-x-1">
                <Navigation className="w-3 h-3 text-aurora-mineral" />
                <span>{res.distanceKm} km</span>
              </span>
              <span className="flex items-center space-x-1 text-aurora-amber font-bold">
                <Clock className="w-3 h-3" />
                <span>ETA {res.etaMin} min</span>
              </span>
            </div>

            <button
              onClick={() => alert(`Deploy directive sent to ${res.name} (${res.contact})`)}
              className="w-full py-1.5 bg-aurora-forest hover:bg-aurora-mineral text-aurora-mint font-bold rounded-lg text-[11px] transition-all flex items-center justify-center space-x-1"
            >
              <PhoneCall className="w-3 h-3" />
              <span>DEPLOY UNIT</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
