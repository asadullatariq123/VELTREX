import React, { useState } from 'react';
import { MapPin, Navigation, AlertTriangle, Check } from 'lucide-react';

interface GPSCaptureProps {
  latitude: number;
  longitude: number;
  accuracy?: number;
  onChange: (lat: number, lng: number, accuracy?: number) => void;
}

export const GPSCapture: React.FC<GPSCaptureProps> = ({
  latitude,
  longitude,
  accuracy,
  onChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCaptureGPS = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const acc = Math.round(pos.coords.accuracy);
        onChange(lat, lng, acc);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        setErrorMsg(`GPS error: ${err.message}. Using default location.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <label className="text-xs font-extrabold text-veltrex-cobalt uppercase tracking-wider flex items-center space-x-1.5">
          <MapPin className="w-4 h-4 text-sky-600" />
          <span>GEO-LOCATION COORDINATES</span>
        </label>
        <button
          type="button"
          onClick={handleCaptureGPS}
          disabled={loading}
          className="px-3 py-1.5 bg-veltrex-cobalt text-white rounded-lg text-xs font-bold font-mono flex items-center space-x-1.5 hover:bg-sky-900 transition-all shadow-sm"
        >
          <Navigation className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'ACQUIRING GPS...' : 'CAPTURE CURRENT GPS'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 font-mono text-xs">
        <div>
          <span className="text-[10px] text-slate-500 block">LATITUDE</span>
          <input
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0, longitude, accuracy)}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-veltrex-cobalt"
          />
        </div>

        <div>
          <span className="text-[10px] text-slate-500 block">LONGITUDE</span>
          <input
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => onChange(latitude, parseFloat(e.target.value) || 0, accuracy)}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-veltrex-cobalt"
          />
        </div>
      </div>

      {accuracy !== undefined && (
        <div className="text-[11px] font-mono text-slate-600 flex items-center justify-between pt-1">
          <span className="flex items-center space-x-1">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Accuracy: <strong>~{accuracy} meters</strong></span>
          </span>
          {accuracy > 30 && (
            <span className="text-amber-600 font-bold flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Low precision warning</span>
            </span>
          )}
        </div>
      )}

      {errorMsg && (
        <p className="text-xs text-rose-600 font-medium font-sans">{errorMsg}</p>
      )}
    </div>
  );
};
