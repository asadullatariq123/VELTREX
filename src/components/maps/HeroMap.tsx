import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Layers, 
  MapPin, 
  Navigation, 
  ShieldAlert, 
  LocateFixed,
  Eye,
  Sliders
} from 'lucide-react';
import { liveStore } from '../../services/liveSimulationStore';
import { mapConfigService, MapLayerType } from '../../services/mapConfigService';
import { NER_STATE_BOUNDARIES_GEOJSON, HIGH_RISK_ZONES_OVERLAY } from '../../mockData/nerGeoJson';
import { NerLocation } from '../../types';
import { realtimeSocket } from '../../services/realtime/socket';

// Custom Leaflet Marker Icons based on Risk Level
const createCustomIcon = (riskLevel: string, isSelected: boolean) => {
  const color = 
    riskLevel === 'CRITICAL' ? '#EF476F' :
    riskLevel === 'HIGH' ? '#F77F00' :
    riskLevel === 'MODERATE' ? '#FFD166' : '#06D6A0';

  const pulseClass = riskLevel === 'CRITICAL' ? 'pulsing-critical-marker' : '';

  const html = `
    <div style="position: relative; width: 30px; height: 30px;">
      <div class="${pulseClass}" style="
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background-color: ${color};
        border: 3px solid ${isSelected ? '#FFFFFF' : '#0B132B'};
        box-shadow: 0 0 14px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #0B132B;"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

// Component to handle smooth camera pan & toggle map interactions during live simulation
const MapController: React.FC<{ 
  selectedLoc: NerLocation; 
  userGps: { lat: number; lng: number } | null;
  isSimulating: boolean;
}> = ({ selectedLoc, userGps, isSimulating }) => {
  const map = useMap();

  // Enable/disable map dragging and zooming based on simulation state
  useEffect(() => {
    if (isSimulating) {
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
    } else {
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
    }
  }, [isSimulating, map]);

  // Pan camera to target location
  useEffect(() => {
    if (userGps) {
      map.flyTo([userGps.lat, userGps.lng], 10, { duration: 1.5 });
    } else if (selectedLoc) {
      map.flyTo([selectedLoc.coordinates.lat, selectedLoc.coordinates.lng], 8.5, { duration: 1.2 });
    }
  }, [selectedLoc, userGps, map]);

  return null;
};

interface HeroMapProps {
  isFullScreen?: boolean;
}

export const HeroMap: React.FC<HeroMapProps> = ({ isFullScreen = false }) => {
  const [locations, setLocations] = useState<NerLocation[]>(liveStore.getLocations());
  const [selectedLocation, setSelectedLocation] = useState<NerLocation>(liveStore.getSelectedLocation());
  const [isSimulating, setIsSimulating] = useState<boolean>(liveStore.getIsSimulating());
  const [simStepIndex, setSimStepIndex] = useState<number>(liveStore.getSimStepIndex());
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('dark');
  const [userGps, setUserGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  
  // Layer Toggles
  const [showRiskOverlay, setShowRiskOverlay] = useState<boolean>(true);
  const [showStateBoundaries, setShowStateBoundaries] = useState<boolean>(true);
  const [showStationMarkers, setShowStationMarkers] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = liveStore.subscribe(() => {
      setLocations(liveStore.getLocations());
      setSelectedLocation(liveStore.getSelectedLocation());
      setIsSimulating(liveStore.getIsSimulating());
      setSimStepIndex(liveStore.getSimStepIndex());
    });

    const unsubRisk = realtimeSocket.subscribe('RISK_UPDATED', (data: any) => {
      const payload = data.payload || data;
      if (payload.locationId) {
        liveStore.updateLocationRisk(payload.locationId, {
          riskScore: payload.riskScore,
          riskLevel: payload.riskLevel,
          rainfallMm: payload.rainfallMm,
          soilMoisturePct: payload.soilMoisturePct,
        });
      }
    });

    return () => {
      unsubscribe();
      unsubRisk();
    };
  }, []);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserGps(coords);
        setGpsError(null);
      },
      (err) => {
        console.warn('Geolocation error', err);
        // Fallback gracefully to default NER coordinates (Aizawl)
        setUserGps({ lat: 23.7271, lng: 92.7176 });
        setGpsError('GPS permission denied. Fallback to Aizawl station coordinates.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Get tile config from MapConfigService (abstracts map provider, environment variables & keyless fallbacks)
  const currentTileConfig = mapConfigService.getTileConfig(activeLayer);

  // GeoJSON style handler for state boundaries
  const stateBoundaryStyle = (feature: any) => {
    const riskLevel = feature?.properties?.riskLevel || 'MODERATE';
    const color = 
      riskLevel === 'CRITICAL' ? '#EF476F' :
      riskLevel === 'HIGH' ? '#F77F00' :
      riskLevel === 'MODERATE' ? '#FFD166' : '#06D6A0';

    return {
      color,
      weight: 1.5,
      opacity: 0.6,
      fillColor: color,
      fillOpacity: 0.08,
      dashArray: '4, 4'
    };
  };

  // Compute dynamic radius for Aizawl during simulation steps
  const aizawlSimRadius = isSimulating 
    ? 15000 + (simStepIndex * 2500)
    : 18000;

  return (
    <div className={`relative bg-navy-950 border border-navy-800 rounded-xl overflow-hidden shadow-2xl flex flex-col ${
      isFullScreen ? 'h-[calc(100vh-140px)]' : 'h-[460px] sm:h-[520px]'
    }`}>
      {/* Map Top Header Controls Overlay */}
      <div className="absolute top-3 left-3 right-3 z-[100] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="bg-navy-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-navy-750 text-xs font-bold text-white flex items-center space-x-2 shadow-lg pointer-events-auto">
          <MapPin className="w-4 h-4 text-veltrex-blue" />
          <span>NORTH EASTERN INDIA GEOSPATIAL INTELLIGENCE MAP</span>
          <span className="px-1.5 py-0.2 rounded bg-veltrex-blue/20 text-veltrex-blue text-[10px]">
            {locations.length} STATIONS
          </span>
        </div>

        <div className="flex items-center space-x-2 pointer-events-auto">
          {/* Layer Controls Switcher */}
          <div className="bg-navy-900/90 backdrop-blur-md p-1 rounded-lg border border-navy-750 flex items-center space-x-1 shadow-lg text-xs">
            {(['dark', 'satellite', 'terrain', 'street'] as MapLayerType[]).map((layerKey) => (
              <button
                key={layerKey}
                onClick={() => setActiveLayer(layerKey)}
                className={`px-2 py-1 rounded text-[11px] font-bold uppercase transition-all ${
                  activeLayer === layerKey ? 'bg-veltrex-blue text-navy-950 shadow-md' : 'text-slate-300 hover:text-white'
                }`}
              >
                {layerKey === 'dark' ? 'DARK GIS' : layerKey}
              </button>
            ))}
          </div>

          {/* Device GPS Button */}
          <button
            onClick={handleUseMyLocation}
            className="px-3 py-1.5 bg-navy-900/90 hover:bg-veltrex-blue hover:text-navy-950 border border-navy-750 text-slate-200 text-xs font-bold rounded-lg shadow-lg flex items-center space-x-1.5 transition-all"
            title="Locate browser device GPS coordinates"
          >
            <LocateFixed className="w-4 h-4" />
            <span className="hidden sm:inline">USE MY LOCATION</span>
          </button>
        </div>
      </div>

      {/* Layer Toggle Checks Overlay (Top Right Below Controls) */}
      <div className="absolute top-14 right-3 z-[100] bg-navy-900/90 backdrop-blur-md p-2 rounded-lg border border-navy-750 shadow-xl text-xs space-y-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">MAP OVERLAYS</span>
        <label className="flex items-center space-x-2 text-slate-200 cursor-pointer">
          <input
            type="checkbox"
            checked={showRiskOverlay}
            onChange={(e) => setShowRiskOverlay(e.target.checked)}
            className="rounded border-navy-700 bg-navy-950 text-veltrex-blue focus:ring-0"
          />
          <span className="text-[11px] font-medium">Risk Heat Circles</span>
        </label>
        <label className="flex items-center space-x-2 text-slate-200 cursor-pointer">
          <input
            type="checkbox"
            checked={showStateBoundaries}
            onChange={(e) => setShowStateBoundaries(e.target.checked)}
            className="rounded border-navy-700 bg-navy-950 text-veltrex-blue focus:ring-0"
          />
          <span className="text-[11px] font-medium">State GeoJSON Bounds</span>
        </label>
        <label className="flex items-center space-x-2 text-slate-200 cursor-pointer">
          <input
            type="checkbox"
            checked={showStationMarkers}
            onChange={(e) => setShowStationMarkers(e.target.checked)}
            className="rounded border-navy-700 bg-navy-950 text-veltrex-blue focus:ring-0"
          />
          <span className="text-[11px] font-medium">Station Markers</span>
        </label>
      </div>

      {/* GPS Status Toast Popup */}
      {userGps && (
        <div className="absolute top-14 left-3 z-[100] bg-teal-950 border border-teal-600 text-teal-200 px-3 py-1.5 rounded-lg text-xs font-mono shadow-xl flex items-center space-x-2">
          <LocateFixed className="w-4 h-4 text-teal-400 animate-spin" />
          <span>GPS LOCATION ACTIVE: {userGps.lat.toFixed(4)}° N, {userGps.lng.toFixed(4)}° E (±12m)</span>
        </div>
      )}

      {/* Map Legend (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-[100] bg-navy-900/90 backdrop-blur-md p-2.5 rounded-lg border border-navy-750 shadow-xl text-xs space-y-1">
        <div className="flex items-center justify-between space-x-4 mb-1">
          <span className="font-bold text-slate-300 text-[10px] uppercase">RISK LEVEL LEGEND</span>
          <span className="text-[9px] text-slate-400 font-mono">{currentTileConfig.name}</span>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
            <span className="text-slate-300">Low</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-slate-300">Moderate</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span className="text-slate-300">High</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-slate-300 font-bold">Critical</span>
          </span>
        </div>
      </div>

      {/* Actual Leaflet Map */}
      <MapContainer
        center={[25.5788, 91.8933]} // Centered over Meghalaya/Assam NER
        zoom={7}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          key={activeLayer}
          url={currentTileConfig.url}
          attribution={currentTileConfig.attribution}
          maxZoom={currentTileConfig.maxZoom}
        />

        <MapController selectedLoc={selectedLocation} userGps={userGps} isSimulating={isSimulating} />

        {/* State Boundary GeoJSON Overlay */}
        {showStateBoundaries && (
          <GeoJSON
            key={`geojson-${activeLayer}`}
            data={NER_STATE_BOUNDARIES_GEOJSON as any}
            style={stateBoundaryStyle as any}
          />
        )}

        {/* Risk Zone Heat Circles */}
        {showRiskOverlay && HIGH_RISK_ZONES_OVERLAY.map((zone) => {
          const isAizawl = zone.id === 'zone-aizawl-sec04';
          const radius = isAizawl ? aizawlSimRadius : zone.radius;
          const color = (isAizawl && isSimulating && simStepIndex >= 3) || zone.riskLevel === 'CRITICAL' ? '#EF476F' : '#F77F00';
          
          return (
            <Circle
              key={zone.id}
              center={zone.center as [number, number]}
              radius={radius}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: zone.riskLevel === 'CRITICAL' || isSimulating ? 0.3 : 0.15,
                weight: 2,
                dashArray: zone.riskLevel === 'CRITICAL' ? '6, 6' : undefined
              }}
            >
              <Popup>
                <div className="p-1 text-xs space-y-1">
                  <span className="font-bold text-white block">{zone.name}</span>
                  <span className="text-red-400 font-mono font-bold">{zone.riskLevel} RISK ({zone.riskScore}/100)</span>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {/* User Device GPS Marker */}
        {userGps && (
          <Marker position={[userGps.lat, userGps.lng]}>
            <Popup>
              <div className="text-xs p-1">
                <span className="font-bold text-teal-400">📍 YOUR DEVICE GPS LOCATION</span>
                <p className="text-slate-300 mt-1">{userGps.lat.toFixed(4)}° N, {userGps.lng.toFixed(4)}° E</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Station Markers */}
        {showStationMarkers && locations.map((loc) => {
          const isSelected = loc.id === selectedLocation.id;
          const icon = createCustomIcon(loc.riskLevel, isSelected);

          return (
            <Marker
              key={loc.id}
              position={[loc.coordinates.lat, loc.coordinates.lng]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (!isSimulating) {
                    liveStore.setSelectedLocation(loc.id);
                  }
                }
              }}
            >
              <Popup>
                <div className="p-2 space-y-2 text-xs min-w-[200px]">
                  <div className="flex items-center justify-between border-b border-navy-800 pb-1">
                    <span className="font-bold text-white text-sm">{loc.name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      loc.riskLevel === 'CRITICAL' ? 'bg-red-950 text-red-400' : 'bg-amber-950 text-amber-400'
                    }`}>
                      {loc.riskLevel}
                    </span>
                  </div>

                  <div className="space-y-1 font-mono text-[11px] text-slate-300">
                    <div className="flex justify-between">
                      <span>Risk Score:</span>
                      <span className="font-bold text-amber-400">{loc.riskScore}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rainfall:</span>
                      <span className="font-bold text-blue-400">{loc.rainfallMm} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Soil Moisture:</span>
                      <span className="font-bold text-teal-400">{loc.soilMoisturePct}%</span>
                    </div>
                  </div>

                  <button
                    onClick={() => liveStore.setSelectedLocation(loc.id)}
                    className="w-full mt-2 py-1 bg-veltrex-blue text-navy-950 font-bold rounded text-[11px] hover:bg-teal-400 transition-colors"
                  >
                    INSPECT LOCATION
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
