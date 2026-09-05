import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Server, CheckCircle2 } from 'lucide-react';
import { liveStore } from '../services/liveSimulationStore';
import { UserRole } from '../types';

export const SettingsPage: React.FC = () => {
  const [role, setRole] = useState<UserRole>(liveStore.getUserRole());
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    liveStore.setUserRole(role);
    setSavedStatus('Settings & System Thresholds Saved Successfully!');
    setTimeout(() => setSavedStatus(null), 3000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto bg-topo-pattern min-h-screen">
      {/* Header */}
      <div className="aurora-card p-5 rounded-3xl flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-aurora-forest text-aurora-mint flex items-center justify-center">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-aurora-forest uppercase tracking-tight">SYSTEM CONFIGURATION & API INTEGRATION</h2>
            <p className="text-xs text-aurora-mineral font-medium">VELTREX Production API Keys, Gateway Endpoints & Thresholds</p>
          </div>
        </div>
      </div>

      {savedStatus && (
        <div className="p-3.5 bg-aurora-mint/20 border border-aurora-mint text-aurora-forest rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-aurora-mineral" />
          <span>{savedStatus}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* User Role Card */}
        <div className="aurora-card rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-black text-aurora-forest uppercase tracking-wider flex items-center space-x-2">
            <Shield className="w-4 h-4 text-aurora-mineral" />
            <span>USER ROLE & ACCESS CONTROL</span>
          </h3>

          <div>
            <label className="block text-xs text-aurora-mineral font-bold mb-1">Active User Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="bg-white border border-aurora-mineral/20 text-xs font-bold rounded-xl px-3.5 py-2.5 text-aurora-forest focus:outline-none focus:border-aurora-mineral w-full max-w-md"
            >
              <option value="DISTRICT AUTHORITY">DISTRICT AUTHORITY (Full Disaster Control)</option>
              <option value="ADMIN">ADMIN (System Architecture)</option>
              <option value="FIELD OFFICER">FIELD OFFICER (Field Telemetry & GPS Logging)</option>
              <option value="COMMUNITY USER">COMMUNITY USER (Public Emergency Alerts)</option>
            </select>
          </div>
        </div>

        {/* API Integration Interfaces */}
        <div className="aurora-card rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-black text-aurora-forest uppercase tracking-wider flex items-center space-x-2">
            <Server className="w-4 h-4 text-aurora-mineral" />
            <span>EXTERNAL API & DATA FEED ENDPOINTS</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-aurora-forest mb-1">IMD Weather Telemetry API Key</label>
              <input
                type="password"
                defaultValue="••••••••••••••••"
                className="w-full bg-white border border-aurora-mineral/20 rounded-xl px-3.5 py-2 text-aurora-forest font-mono"
              />
              <span className="text-[10px] text-aurora-mineral">Environment key: VITE_IMD_WEATHER_API_KEY</span>
            </div>

            <div>
              <label className="block font-bold text-aurora-forest mb-1">Sentinel Hub Satellite API Key</label>
              <input
                type="password"
                defaultValue="••••••••••••••••"
                className="w-full bg-white border border-aurora-mineral/20 rounded-xl px-3.5 py-2 text-aurora-forest font-mono"
              />
              <span className="text-[10px] text-aurora-mineral">Environment key: VITE_SENTINEL_HUB_API_KEY</span>
            </div>

            <div>
              <label className="block font-bold text-aurora-forest mb-1">IoT Sensors MQTT Broker URL</label>
              <input
                type="text"
                defaultValue="mqtts://telemetry.veltrex-ner.gov.in:8883"
                className="w-full bg-white border border-aurora-mineral/20 rounded-xl px-3.5 py-2 text-aurora-forest font-mono"
              />
              <span className="text-[10px] text-aurora-mineral">Protocol: MQTT v5.0 TLS 1.3</span>
            </div>

            <div>
              <label className="block font-bold text-aurora-forest mb-1">SMS & Emergency Voice Broadcast Gateway</label>
              <input
                type="text"
                defaultValue="https://alert-gateway.ndma.gov.in/v2/broadcast"
                className="w-full bg-white border border-aurora-mineral/20 rounded-xl px-3.5 py-2 text-aurora-forest font-mono"
              />
              <span className="text-[10px] text-aurora-mineral">Status: Operational (8 Languages)</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-aurora-forest hover:bg-aurora-mineral font-extrabold text-aurora-mint rounded-xl text-xs shadow-lg transition-all"
        >
          SAVE SYSTEM CONFIGURATION
        </button>
      </form>
    </div>
  );
};
