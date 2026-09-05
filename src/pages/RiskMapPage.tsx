import React, { useEffect, useState } from 'react';
import { HeroMap } from '../components/maps/HeroMap';
import { liveStore } from '../services/liveSimulationStore';
import { NerLocation } from '../types';
import { Filter, Compass } from 'lucide-react';

export const RiskMapPage: React.FC = () => {
  const [locations, setLocations] = useState<NerLocation[]>(liveStore.getLocations());
  const [selectedLocation, setSelectedLocation] = useState<NerLocation>(liveStore.getSelectedLocation());
  const [filterRisk, setFilterRisk] = useState<string>('ALL');

  useEffect(() => {
    const unsubscribe = liveStore.subscribe(() => {
      setLocations(liveStore.getLocations());
      setSelectedLocation(liveStore.getSelectedLocation());
    });
    return () => unsubscribe();
  }, []);

  const filteredLocations = locations.filter(loc => {
    if (filterRisk === 'ALL') return true;
    return loc.riskLevel === filterRisk;
  });

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1800px] mx-auto bg-topo-pattern min-h-screen">
      {/* Top Filter Bar */}
      <div className="aurora-card p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-aurora-forest text-aurora-mint flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-aurora-forest uppercase tracking-tight">FULL GEOSPATIAL INTELLIGENCE MAP</h2>
            <p className="text-xs text-aurora-mineral font-medium">Interactive North Eastern Region Landslide Risk Layers</p>
          </div>
        </div>

        {/* Risk Filter Buttons */}
        <div className="flex items-center space-x-2 text-xs font-semibold">
          <Filter className="w-4 h-4 text-aurora-mineral" />
          <span className="text-aurora-forest mr-1">Filter Risk:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map((risk) => (
            <button
              key={risk}
              onClick={() => setFilterRisk(risk)}
              className={`px-3 py-1 rounded-full border transition-all ${
                filterRisk === risk
                  ? 'bg-aurora-forest text-aurora-mint border-aurora-forest font-bold shadow-md'
                  : 'bg-white text-aurora-forest border-aurora-mineral/20 hover:bg-aurora-glacier/40'
              }`}
            >
              {risk}
            </button>
          ))}
        </div>
      </div>

      {/* Main Full-Screen Map Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-9">
          <HeroMap isFullScreen={true} />
        </div>

        {/* Side Location Inspector Drawer */}
        <div className="lg:col-span-3 aurora-card rounded-3xl p-4 shadow-sm space-y-4 overflow-y-auto max-h-[calc(100vh-140px)]">
          <div className="flex items-center justify-between border-b border-aurora-mineral/15 pb-3">
            <span className="text-xs font-bold text-aurora-forest uppercase tracking-wider">SELECTED LOCATION</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              selectedLocation.riskLevel === 'CRITICAL' ? 'bg-aurora-crimson text-white' : 'bg-aurora-amber text-aurora-forest'
            }`}>
              {selectedLocation.riskLevel} ({selectedLocation.riskScore}/100)
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-black text-aurora-forest">{selectedLocation.name}</h3>
            <p className="text-xs text-aurora-mineral font-medium">{selectedLocation.district}, {selectedLocation.state}</p>
            <p className="text-xs font-mono font-bold text-aurora-mineral mt-1">
              LAT: {selectedLocation.coordinates.lat}° N • LNG: {selectedLocation.coordinates.lng}° E
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="bg-white p-3 rounded-2xl border border-aurora-mineral/15 space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-aurora-mineral">Rainfall:</span>
              <span className="font-bold text-aurora-forest">{selectedLocation.rainfallMm} mm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-aurora-mineral">Soil Moisture:</span>
              <span className="font-bold text-aurora-forest">{selectedLocation.soilMoisturePct}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-aurora-mineral">Slope Gradient:</span>
              <span className="font-bold text-aurora-amber">{selectedLocation.slopeDeg}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-aurora-mineral">Risk Window:</span>
              <span className="font-bold text-aurora-coral">{selectedLocation.expectedRiskWindow}</span>
            </div>
          </div>

          {/* Stations List */}
          <div className="space-y-2 pt-2 border-t border-aurora-mineral/15">
            <span className="text-xs font-bold text-aurora-forest uppercase tracking-wider block">
              ALL STATIONS ({filteredLocations.length})
            </span>

            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {filteredLocations.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => liveStore.setSelectedLocation(loc.id)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-colors ${
                    loc.id === selectedLocation.id
                      ? 'bg-aurora-forest text-aurora-ivory border-aurora-forest shadow-md'
                      : 'bg-white border-aurora-mineral/15 text-aurora-forest hover:bg-aurora-glacier/40'
                  }`}
                >
                  <div className="truncate">
                    <span className="block truncate font-bold">{loc.name}</span>
                    <span className="text-[10px] opacity-75">{loc.state}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black font-mono ${
                    loc.riskLevel === 'CRITICAL' ? 'text-aurora-coral' : 'text-aurora-amber'
                  }`}>
                    {loc.riskScore}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
