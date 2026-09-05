import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Search, 
  Play, 
  AlertTriangle,
  MapPin,
  Globe
} from 'lucide-react';
import { liveStore } from '../../services/liveSimulationStore';
import { UserRole, LanguageCode } from '../../types';
import { realtimeSocket } from '../../services/realtime/socket';
import { ConnectionStatus } from '../../services/realtime/realtimeEvents';

interface TopHeaderProps {
  onOpenSimModal: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenSimModal, currentPath, onNavigate }) => {
  const [timeStr, setTimeStr] = useState<string>(new Date().toLocaleTimeString());
  const [selectedLocation, setSelectedLocation] = useState(liveStore.getSelectedLocation());
  const [locations, setLocations] = useState(liveStore.getLocations());
  const [emergencyMode, setEmergencyMode] = useState(liveStore.isEmergencyModeActive());
  const [isOffline, setIsOffline] = useState(liveStore.isOfflineMode());
  const [userRole, setUserRole] = useState(liveStore.getUserRole());
  const [language, setLanguage] = useState(liveStore.getLanguage());
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [socketStatus, setSocketStatus] = useState<ConnectionStatus>(realtimeSocket.getStatus());

  useEffect(() => {
    // Auto-connect real-time socket on mount
    realtimeSocket.connect();

    const timer = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString());
    }, 1000);

    const unsubSocket = realtimeSocket.onStatusChange((st) => setSocketStatus(st));

    const unsubscribe = liveStore.subscribe(() => {
      setSelectedLocation(liveStore.getSelectedLocation());
      setLocations(liveStore.getLocations());
      setEmergencyMode(liveStore.isEmergencyModeActive());
      setIsOffline(liveStore.isOfflineMode());
      setUserRole(liveStore.getUserRole());
      setLanguage(liveStore.getLanguage());
    });

    return () => {
      clearInterval(timer);
      unsubscribe();
      unsubSocket();
    };
  }, []);

  const handleSelectLocation = (locId: string) => {
    liveStore.setSelectedLocation(locId);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navLinks = [
    { path: '/dashboard', label: 'OVERVIEW' },
    { path: '/risk-map', label: 'RISK MAP' },
    { path: '/predictions', label: 'PREDICTIONS' },
    { path: '/incidents', label: 'INCIDENTS' },
    { path: '/field-report', label: 'FIELD REPORT' },
    { path: '/alerts', label: 'ALERTS' },
    { path: '/analytics', label: 'ANALYTICS' },
    { path: '/settings', label: 'SETTINGS' },
  ];

  const rolesList: UserRole[] = ['DISTRICT AUTHORITY', 'ADMIN', 'FIELD OFFICER', 'COMMUNITY USER'];
  const languagesList: { code: LanguageCode; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'hi', label: 'HI' },
    { code: 'as', label: 'AS' },
    { code: 'bn', label: 'BN' },
    { code: 'mni', label: 'MNI' },
    { code: 'mzo', label: 'MZO' },
    { code: 'kha', label: 'KHA' },
    { code: 'ne', label: 'NE' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-50 border-b border-slate-200 px-4 py-2.5 shadow-sm select-none">
      {/* Emergency Mode Banner */}
      {emergencyMode && (
        <div className="mb-2 bg-rose-600 px-4 py-1.5 text-white flex items-center justify-between rounded-lg shadow-sm animate-pulse">
          <div className="flex items-center space-x-2 text-xs font-bold tracking-wide">
            <AlertTriangle className="w-4 h-4 text-amber-200 shrink-0" />
            <span>🚨 EMERGENCY DISASTER MODE ACTIVE — CRITICAL THREAT ELEVATION IN AIZAWL SECTOR 04</span>
          </div>
          <button 
            onClick={() => liveStore.toggleEmergencyMode()}
            className="px-2.5 py-0.5 bg-black/30 hover:bg-black/50 rounded text-[10px] font-bold uppercase border border-white/20"
          >
            EXIT EMERGENCY MODE
          </button>
        </div>
      )}

      <div className="max-w-[1800px] mx-auto space-y-2.5">
        {/* ROW 1: Branding Top-Left & Main Navigation Menu Top-Right */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Top-Left Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('/dashboard')}>
            {/* Logo Container: Sharp dark cobalt rounded container with glowing mint/cyan vector icon - ZERO white overlay */}
            <div className="w-10 h-10 rounded-xl bg-[#0F2C59] border border-slate-700 flex items-center justify-center text-white shadow-md relative shrink-0">
              <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 20L9 8L14 15L17 11L21 20H3Z" fill="rgba(16, 185, 129, 0.2)" />
                <path d="M12 3C16.9706 3 21 7.02944 21 12" strokeDasharray="2 2" strokeWidth="1.5" stroke="#38BDF8" />
              </svg>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-[#0F2C59]">VELTREX</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-900 border border-sky-300">
                  SIH 2026
                </span>
              </div>
              <p className="text-[10px] text-slate-700 font-extrabold tracking-wider uppercase">
                AI-POWERED GEOSPATIAL LANDSLIDE INTELLIGENCE
              </p>
            </div>
          </div>

          {/* Top-Right Navigation Menu */}
          <nav className="flex items-center space-x-1 bg-white border border-slate-300 p-1 rounded-xl shadow-sm overflow-x-auto">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => onNavigate(link.path)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold tracking-wide transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#0F2C59] text-white shadow-sm'
                      : 'text-slate-800 hover:text-[#0F2C59] hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ROW 2: Action Bar Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1.5 border-t border-slate-200">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-600">
            <span className="font-bold text-[#0F2C59]">REGION:</span>
            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-900 font-bold text-[11px]">NORTH EAST INDIA</span>
            <span className="text-slate-400">•</span>
            <span className="font-bold text-slate-800">{timeStr} IST</span>
          </div>

          {/* Action Bar Item Controls */}
          <div className="flex flex-wrap items-center space-x-2 text-xs">
            {/* Search Sector */}
            <div className="relative min-w-[170px]">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search sector..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  className="w-full bg-white border border-slate-300 text-xs font-bold rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#0F2C59] text-slate-900 placeholder-slate-400 shadow-sm"
                />
              </div>

              {/* Dropdown Results */}
              {showSearchResults && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-xl shadow-xl overflow-hidden z-50">
                  {filteredLocations.map(loc => (
                    <button
                      key={loc.id}
                      onClick={() => handleSelectLocation(loc.id)}
                      className="w-full px-3 py-2 text-left hover:bg-slate-100 flex items-center justify-between border-b border-slate-100 text-xs"
                    >
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-bold text-slate-900">{loc.name}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-rose-600">{loc.riskScore}/100</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* LIVE EVENT SIMULATION Button (Prominent Action Accent) */}
            <button
              onClick={onOpenSimModal}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>LIVE EVENT SIMULATION</span>
            </button>

            {/* EMERGENCY Toggle */}
            <button
              onClick={() => liveStore.toggleEmergencyMode()}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold uppercase transition-all ${
                emergencyMode 
                  ? 'bg-rose-700 text-white animate-pulse shadow-sm' 
                  : 'bg-white border border-slate-300 text-slate-800 hover:bg-rose-50 hover:text-rose-700'
              }`}
            >
              🚨 EMERGENCY
            </button>

            {/* Real-time Connection Status Indicator */}
            <button
              onClick={() => {
                if (socketStatus === 'OFFLINE') realtimeSocket.connect();
                else realtimeSocket.disconnect();
              }}
              className={`px-3 py-1.5 rounded-lg border flex items-center space-x-1.5 font-bold transition-all ${
                socketStatus === 'LIVE'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : socketStatus === 'CONNECTING' || socketStatus === 'RECONNECTING'
                  ? 'bg-sky-50 border-sky-300 text-sky-800 animate-pulse'
                  : 'bg-amber-100 border-amber-300 text-amber-900'
              }`}
              title="Click to toggle real-time WebSocket connection"
            >
              <span className={`w-2 h-2 rounded-full ${
                socketStatus === 'LIVE' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : socketStatus === 'CONNECTING' ? 'bg-sky-500' : 'bg-amber-500'
              }`} />
              <span className="font-mono text-[11px] font-extrabold">{socketStatus}</span>
            </button>

            {/* Role Selector */}
            <select
              value={userRole}
              onChange={(e) => liveStore.setUserRole(e.target.value as UserRole)}
              className="bg-white border border-slate-300 text-slate-900 text-[11px] font-extrabold px-3 py-1.5 rounded-lg cursor-pointer focus:outline-none shadow-sm"
            >
              {rolesList.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => liveStore.setLanguage(e.target.value as LanguageCode)}
              className="bg-white border border-slate-300 text-slate-900 text-[11px] font-extrabold px-3 py-1.5 rounded-lg cursor-pointer focus:outline-none shadow-sm"
            >
              {languagesList.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};

