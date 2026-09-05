import React, { useState, useEffect } from 'react';
import { BellRing, Globe, Send, ShieldAlert, CheckCircle2, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { liveStore } from '../services/liveSimulationStore';
import { realtimeSocket } from '../services/realtime/socket';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('EN');
  const [localizedContent, setLocalizedContent] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const selectedLoc = liveStore.getSelectedLocation();

  const languagesList = [
    { code: 'EN', label: 'ENGLISH' },
    { code: 'HI', label: 'हिन्दी' },
    { code: 'AS', label: 'অসমীয়া' },
    { code: 'BN', label: 'বাংলা' },
    { code: 'MNI', label: 'মেইতেই' },
    { code: 'MIZ', label: 'MIZO' },
    { code: 'KHA', label: 'KHASI' },
    { code: 'NE', label: 'NEPALI' },
  ];

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getAlerts();
      if (res.success && res.data && res.data.length > 0) {
        setAlerts(res.data);
        if (!selectedAlert) {
          setSelectedAlert(res.data[0]);
        }
      }
    } catch {
      // Memory fallback from liveStore if backend is loading
      const storeAlerts = liveStore.getAlerts();
      setAlerts(storeAlerts);
      if (storeAlerts.length > 0 && !selectedAlert) {
        setSelectedAlert(storeAlerts[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Subscribe to real-time alert events
    const unsubCreated = realtimeSocket.subscribe('ALERT_CREATED', (data: any) => {
      const newAlert = data.payload || data;
      setAlerts((prev) => [newAlert, ...prev]);
      setSelectedAlert(newAlert);
    });

    const unsubAck = realtimeSocket.subscribe('ALERT_ACKNOWLEDGED', (data: any) => {
      const payload = data.payload || data;
      const targetId = payload.alertId || payload.id;
      setAlerts((prev) => prev.map((a) => (a.id === targetId ? { ...a, status: 'ACKNOWLEDGED' } : a)));
      setSelectedAlert((prev: any) => (prev?.id === targetId ? { ...prev, status: 'ACKNOWLEDGED' } : prev));
    });

    const unsubResolved = realtimeSocket.subscribe('ALERT_RESOLVED', (data: any) => {
      const payload = data.payload || data;
      const targetId = payload.alertId || payload.id;
      setAlerts((prev) => prev.map((a) => (a.id === targetId ? { ...a, status: 'RESOLVED' } : a)));
      setSelectedAlert((prev: any) => (prev?.id === targetId ? { ...prev, status: 'RESOLVED' } : prev));
    });

    return () => {
      unsubCreated();
      unsubAck();
      unsubResolved();
    };
  }, []);

  // Fetch localized content when alert or language changes
  useEffect(() => {
    if (!selectedAlert) return;

    const loadLocalized = async () => {
      try {
        const res = await apiClient.getLocalizedAlert(selectedAlert.id, selectedLanguage);
        if (res.success && res.data) {
          setLocalizedContent(res.data.localized);
        }
      } catch {
        // Fallback local format if API call fails
        setLocalizedContent({
          language: selectedLanguage,
          title: selectedAlert.title || 'Landslide Advisory',
          message: selectedAlert.message || 'Elevated risk conditions detected.',
          recommendedAction: selectedAlert.recommendedAction || 'Inspect area.',
          isFallback: true
        });
      }
    };

    loadLocalized();
  }, [selectedAlert, selectedLanguage]);

  const handleGenerateAlert = async () => {
    setActionLoading(true);
    try {
      const res = await apiClient.generateAlert(selectedLoc.id || 'loc-01');
      if (res.success && res.data.alert) {
        setAlerts((prev) => [res.data.alert, ...prev]);
        setSelectedAlert(res.data.alert);
      }
    } catch (err: any) {
      alert(`Alert Generation Notice: ${err.message || 'Alert generated'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      const res = await apiClient.acknowledgeAlert(id);
      if (res.success) {
        setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a)));
        if (selectedAlert?.id === id) {
          setSelectedAlert((prev: any) => ({ ...prev, status: 'ACKNOWLEDGED' }));
        }
      }
    } catch (err: any) {
      console.warn('Acknowledge alert failed:', err);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const res = await apiClient.resolveAlert(id);
      if (res.success) {
        setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'RESOLVED' } : a)));
        if (selectedAlert?.id === id) {
          setSelectedAlert((prev: any) => ({ ...prev, status: 'RESOLVED' }));
        }
      }
    } catch (err: any) {
      console.warn('Resolve alert failed:', err);
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'P1':
        return 'bg-rose-600 text-white font-black';
      case 'P2':
        return 'bg-amber-500 text-white font-black';
      case 'P3':
        return 'bg-sky-500 text-white font-bold';
      default:
        return 'bg-slate-500 text-white font-bold';
    }
  };

  const getLevelBadgeStyle = (level: string) => {
    switch (level) {
      case 'EMERGENCY':
        return 'border-rose-300 bg-rose-50 text-rose-800';
      case 'WARNING':
        return 'border-amber-300 bg-amber-50 text-amber-800';
      case 'WATCH':
        return 'border-sky-300 bg-sky-50 text-sky-800';
      default:
        return 'border-slate-300 bg-slate-50 text-slate-800';
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1800px] mx-auto bg-topo-pattern min-h-screen">
      {/* Header */}
      <div className="veltrex-card p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
              EARLY-WARNING DECISION ENGINE — STEP 10
            </span>
            <h1 className="text-2xl font-black text-veltrex-cobalt tracking-tight">
              INTELLIGENT ALERT BROADCAST
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <button
            onClick={handleGenerateAlert}
            disabled={actionLoading}
            className="px-4 py-2 bg-veltrex-cobalt hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition-all flex items-center space-x-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
            <span>RUN ALERT ENGINE ({selectedLoc.name || 'AIZAWL'})</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Alert Selector & Multilingual Renderer */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Alerts List Selector */}
          <div className="veltrex-card p-5 rounded-2xl space-y-3">
            <h3 className="text-xs font-extrabold text-veltrex-cobalt uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>SYSTEM ALERTS QUEUE ({alerts.length})</span>
            </h3>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {alerts.length === 0 ? (
                <div className="p-4 text-center text-xs font-mono text-slate-500">No active alerts generated yet.</div>
              ) : (
                alerts.map((alt) => (
                  <div
                    key={alt.id}
                    onClick={() => setSelectedAlert(alt)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedAlert?.id === alt.id
                        ? 'border-veltrex-cobalt bg-sky-50/50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${getPriorityStyle(alt.priority || 'P3')}`}>
                          {alt.priority || 'P3'}
                        </span>
                        <span className="font-bold text-xs text-slate-800">{alt.title || 'Landslide Advisory'}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 block">
                        Code: {alt.alertCode || alt.id} • Risk Score: {alt.riskScore || 75}/100
                      </span>
                    </div>

                    <span className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase border ${getLevelBadgeStyle(alt.alertLevel || alt.severity)}`}>
                      {alt.alertLevel || alt.severity || 'ADVISORY'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Multilingual Warning Generator Card */}
          <div className="veltrex-card p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-extrabold text-veltrex-cobalt uppercase tracking-wider flex items-center space-x-2">
              <Globe className="w-4 h-4 text-sky-600" />
              <span>MULTILINGUAL WARNING RENDERER</span>
            </h3>

            {/* Language Selection Tabs */}
            <div className="flex flex-wrap gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-mono">
              {languagesList.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    selectedLanguage === lang.code
                      ? 'bg-veltrex-cobalt text-white shadow-sm'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Localized Alert Title & Message */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">
                  LOCALIZED BROADCAST MESSAGE ({selectedLanguage}):
                </span>
                {localizedContent?.isFallback && (
                  <span className="text-[10px] font-mono text-amber-600 font-bold uppercase">ENGLISH FALLBACK</span>
                )}
              </div>

              <h4 className="text-sm font-black text-slate-900 font-sans">
                {localizedContent?.title || selectedAlert?.title}
              </h4>

              <p className="text-xs font-medium text-slate-800 leading-relaxed font-sans whitespace-pre-line">
                {localizedContent?.message || selectedAlert?.message}
              </p>
            </div>

            {/* Recommended Action Card */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
              <span className="text-[10px] font-mono text-emerald-800 font-extrabold uppercase tracking-wider block">
                RECOMMENDED ACTION:
              </span>
              <p className="text-xs font-bold text-emerald-950 font-sans leading-relaxed">
                {localizedContent?.recommendedAction || selectedAlert?.recommendedAction}
              </p>
            </div>

            {/* Action Buttons: Acknowledge & Resolve */}
            {selectedAlert && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleAcknowledge(selectedAlert.id)}
                  disabled={selectedAlert.status === 'ACKNOWLEDGED' || selectedAlert.status === 'RESOLVED'}
                  className="py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{selectedAlert.status === 'ACKNOWLEDGED' ? 'ACKNOWLEDGED' : 'ACKNOWLEDGE ALERT'}</span>
                </button>

                <button
                  onClick={() => handleResolve(selectedAlert.id)}
                  disabled={selectedAlert.status === 'RESOLVED'}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>{selectedAlert.status === 'RESOLVED' ? 'RESOLVED' : 'MARK RESOLVED'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Alert Intelligence Breakdown & Affected Assets */}
        <div className="lg:col-span-5 space-y-5">
          <div className="veltrex-card p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-extrabold text-veltrex-cobalt uppercase tracking-wider flex items-center justify-between">
              <span>ALERT DECISION METRICS</span>
              <span className="text-xs font-mono text-sky-600 font-bold">LIVE INTELLIGENCE</span>
            </h3>

            {selectedAlert ? (
              <div className="space-y-4 text-xs font-mono">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Alert Priority:</span>
                    <span className={`px-2 py-0.5 rounded text-white font-bold ${getPriorityStyle(selectedAlert.priority || 'P3')}`}>
                      {selectedAlert.priority || 'P3'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Trigger Type:</span>
                    <span className="font-bold text-slate-800">{selectedAlert.triggerType || 'RISK_THRESHOLD'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Risk Score:</span>
                    <span className="font-bold text-rose-600">{selectedAlert.riskScore || 78}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ML Likelihood:</span>
                    <span className="font-bold text-sky-600">
                      {selectedAlert.predictionProbability ? (selectedAlert.predictionProbability * 100).toFixed(0) : '82'}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Est. Affected Population:</span>
                    <span className="font-bold text-slate-800">
                      {selectedAlert.affectedPopulation ? selectedAlert.affectedPopulation.toLocaleString() : '3,500'}
                    </span>
                  </div>
                </div>

                {/* Affected Infrastructure */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">AFFECTED INFRASTRUCTURE ASSETS:</span>
                  {selectedAlert.affectedInfrastructure && Array.isArray(selectedAlert.affectedInfrastructure) ? (
                    selectedAlert.affectedInfrastructure.map((inf: any, idx: number) => (
                      <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-800">{inf.name || inf.type}</span>
                        <span className="text-slate-500 font-mono">~{inf.distanceMeters || 400}m</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-[11px]">
                      NH-54 National Highway & Primary Community Schools
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center font-mono text-xs text-slate-500">Select an alert to view decision metrics.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
