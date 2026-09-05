import React, { useState } from 'react';
import { AlertOctagon, Filter, Clock, ShieldAlert, CheckCircle2, UserCheck, Layers, ChevronRight } from 'lucide-react';
import { liveStore } from '../services/liveSimulationStore';

export const IncidentsPage: React.FC = () => {
  const incidents = liveStore.getIncidents();
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'timeline' | 'kanban'>('timeline');

  const filtered = incidents.filter(inc => {
    if (filterSeverity === 'ALL') return true;
    return inc.severity === filterSeverity;
  });

  const timelineEvents = [
    { time: '08:42 IST', title: 'Risk Threshold Crossed (87/100 Index)', location: 'Aizawl Sector 04', status: 'CRITICAL THREAT', desc: 'Rainfall reached 81.1mm/3h, soil moisture saturation reached 91% VWC.' },
    { time: '08:45 IST', title: 'Explainable AI Verification Completed', location: 'VELTREX Ensemble Engine', status: '91% CONFIDENCE', desc: 'SHAP factor vector attributes +24% risk to rainfall accumulation & slope gradient.' },
    { time: '08:47 IST', title: 'District Disaster Authority Notified', location: 'Mizoram SDMA Command Center', status: 'NOTIFIED', desc: 'Automated high-priority alert payload dispatched to District Magistrate & SDRF.' },
    { time: '08:49 IST', title: 'SDRF Field Column #04 Dispatched', location: 'NH-54 Bypass Corridor', status: 'DISPATCHED', desc: 'Field unit deployed with heavy earth-moving equipment and emergency rescue gear.' },
    { time: '08:55 IST', title: 'Multilingual Community Warning Issued', location: '87 Mizo & English Cell Towers', status: 'BROADCAST SENT', desc: 'Cell broadcast SMS & push notifications delivered to ~12,480 sector residents.' },
    { time: '09:02 IST', title: 'NH-54 Road Closure & Detour Active', location: 'Aizawl North Entry Gate', status: 'CORRIDOR SECURED', desc: 'Police barriers placed; traffic rerouted away from vulnerable slope segment.' },
  ];

  const columns = [
    { id: 'Investigating', label: 'DETECTED', color: 'border-sky-300 text-sky-700 bg-sky-50' },
    { id: 'Pending AI Verification', label: 'VERIFYING', color: 'border-amber-300 text-amber-700 bg-amber-50' },
    { id: 'Response Team Assigned', label: 'CRITICAL DISPATCH', color: 'border-rose-300 text-rose-700 bg-rose-50' },
    { id: 'Dispatched', label: 'RESPONDING', color: 'border-emerald-300 text-emerald-700 bg-emerald-50' },
    { id: 'Resolved', label: 'RESOLVED', color: 'border-slate-300 text-slate-700 bg-slate-100' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1800px] mx-auto bg-topo-pattern min-h-screen">
      {/* Header */}
      <div className="veltrex-card p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-sm">
            IC
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">DISASTER RESPONSE COMMAND</span>
            <h1 className="text-2xl font-black text-veltrex-cobalt tracking-tight">
              INCIDENT RESPONSE CENTER
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 rounded font-bold transition-all ${
                viewMode === 'timeline' ? 'bg-veltrex-cobalt text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SPATIAL TIMELINE
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 rounded font-bold transition-all ${
                viewMode === 'kanban' ? 'bg-veltrex-cobalt text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              KANBAN BOARD
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            {['ALL', 'CRITICAL', 'HIGH'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded border font-bold uppercase transition-all ${
                  filterSeverity === sev
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Spatial Vertical Timeline View */}
      {viewMode === 'timeline' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 veltrex-card p-6 rounded-2xl space-y-6">
            <h3 className="text-xs font-extrabold text-veltrex-cobalt uppercase tracking-wider flex items-center space-x-2">
              <Clock className="w-4 h-4 text-rose-600" />
              <span>REAL-TIME OPERATIONAL EVENT SEQUENCE (AIZAWL SECTOR 04)</span>
            </h3>

            <div className="relative pl-6 space-y-6 border-l-2 border-slate-200 ml-2">
              {timelineEvents.map((evt, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-veltrex-cobalt border-2 border-white ring-4 ring-sky-100 flex items-center justify-center"></div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                      <span className="font-mono font-bold text-sky-700 text-xs">{evt.time}</span>
                      <span className="px-2.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-black uppercase font-mono">
                        {evt.status}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-veltrex-cobalt text-sm">{evt.title}</h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{evt.desc}</p>
                    <span className="text-[10px] font-mono text-slate-400 block pt-1">Location: {evt.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="veltrex-card p-5 rounded-2xl space-y-3">
              <h4 className="text-xs font-extrabold text-veltrex-cobalt uppercase tracking-wider">COMMAND DISPATCH STATISTICS</h4>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                  <span className="text-slate-600 font-sans">Active Directives:</span>
                  <span className="font-bold text-rose-600">06 Executed</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                  <span className="text-slate-600 font-sans">Response Time:</span>
                  <span className="font-bold text-emerald-600">3m 14s Avg</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                  <span className="text-slate-600 font-sans font-semibold">Population Safe:</span>
                  <span className="font-bold text-sky-700">~12,480 Residents</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Kanban Operational Board Grid */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {columns.map((col) => {
            const columnIncidents = filtered.filter(inc => inc.status === col.id || (col.id === 'Investigating' && inc.status === 'Investigating'));

            return (
              <div key={col.id} className="veltrex-card p-3 rounded-2xl space-y-3 min-h-[500px]">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${col.color}`}>
                    {col.label}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">{columnIncidents.length}</span>
                </div>

                <div className="space-y-3">
                  {columnIncidents.map((inc) => (
                    <div
                      key={inc.id}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono font-bold text-slate-400 text-[11px]">{inc.id}</span>
                          <h4 className="font-extrabold text-slate-800 text-sm mt-0.5">{inc.locationName}</h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          inc.severity === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                        }`}>
                          {inc.severity}
                        </span>
                      </div>

                      <p className="text-slate-600 text-[11px] line-clamp-2">{inc.description}</p>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span>{inc.reportedTimeAgo}</span>
                        <span className="font-bold text-veltrex-cobalt">{inc.assignedTeam}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

