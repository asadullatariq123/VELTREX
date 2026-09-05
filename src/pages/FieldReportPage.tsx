import React from 'react';
import { FieldReportForm } from '../components/field/FieldReportForm';
import { OfflineQueue } from '../components/field/OfflineQueue';
import { ReportStatus } from '../components/field/ReportStatus';
import { ReportEvidence } from '../components/field/ReportEvidence';
import { ShieldAlert, Database, Wifi } from 'lucide-react';

export const FieldReportPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1800px] mx-auto bg-topo-pattern min-h-screen">
      {/* Header Banner */}
      <div className="veltrex-card p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-veltrex-cobalt text-white flex items-center justify-center font-bold text-sm">
            FR
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                OFFLINE-FIRST FIELD INTELLIGENCE
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
                AUTO-SYNC ENABLED
              </span>
            </div>
            <h1 className="text-2xl font-black text-veltrex-cobalt tracking-tight">
              FIELD OBSERVATIONS & CITIZEN REPORTING
            </h1>
          </div>
        </div>

        <ReportStatus />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Field Report Submission Form */}
        <div className="lg:col-span-7 space-y-6">
          <FieldReportForm />
        </div>

        {/* Right Column: Offline Queue & Recent Evidence Signals */}
        <div className="lg:col-span-5 space-y-6">
          <OfflineQueue />
          <ReportEvidence />
        </div>
      </div>
    </div>
  );
};
