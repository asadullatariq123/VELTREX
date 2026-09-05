import React, { useState } from 'react';
import { BarChart3, Filter, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');
  const [stateFilter, setStateFilter] = useState<string>('ALL NER');

  const correlationData = [
    { month: 'May', rainfall: 140, landslides: 3, displacement: 1.2 },
    { month: 'Jun', rainfall: 280, landslides: 12, displacement: 2.8 },
    { month: 'Jul', rainfall: 420, landslides: 28, displacement: 4.2 },
    { month: 'Aug', rainfall: 380, landslides: 22, displacement: 3.6 },
    { month: 'Sep', rainfall: 310, landslides: 16, displacement: 3.1 },
    { month: 'Oct', rainfall: 180, landslides: 5, displacement: 1.8 },
  ];

  const stateDisruptionData = [
    { state: 'Mizoram', roads: 14, villages: 8 },
    { state: 'Sikkim', roads: 18, villages: 12 },
    { state: 'Meghalaya', roads: 11, villages: 6 },
    { state: 'Nagaland', roads: 8, villages: 4 },
    { state: 'Manipur', roads: 9, villages: 5 },
    { state: 'Arunachal', roads: 6, villages: 3 },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1800px] mx-auto bg-topo-pattern min-h-screen">
      {/* Header */}
      <div className="veltrex-card p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-veltrex-cobalt text-white flex items-center justify-center font-bold text-sm">
            AN
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block font-sans">SCIENTIFIC RESEARCH ENVIRONMENT</span>
            <h1 className="text-2xl font-black text-veltrex-cobalt tracking-tight">
              GEOSPATIAL ANALYTICS & CORRELATION
            </h1>
          </div>
        </div>

        {/* Time Filters & State Filter */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {(['7D', '30D', '90D', '1Y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                className={`px-3 py-1 rounded font-bold transition-all ${
                  timeFilter === tf
                    ? 'bg-veltrex-cobalt text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tf === '7D' ? '7 DAYS' : tf === '30D' ? '30 DAYS' : tf === '90D' ? '90 DAYS' : '1 YEAR'}
              </button>
            ))}
          </div>

          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer focus:outline-none"
          >
            {['ALL NER', 'ASSAM', 'MIZORAM', 'MEGHALAYA', 'SIKKIM', 'NAGALAND', 'MANIPUR', 'ARUNACHAL'].map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rainfall vs Landslides Chart */}
        <div className="veltrex-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-veltrex-cobalt uppercase tracking-wider">RAINFALL VS LANDSLIDE CORRELATION</h3>
            <span className="text-xs text-slate-500 font-mono">Filter: {timeFilter} ({stateFilter})</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={correlationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="slideGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F2C59', borderColor: '#1E3A8A', borderRadius: '8px', color: '#FFFFFF' }} />
                <Area type="monotone" dataKey="rainfall" name="Rainfall (mm)" stroke="#0EA5E9" fill="url(#rainGrad)" />
                <Area type="monotone" dataKey="landslides" name="Incidents" stroke="#DC2626" fill="url(#slideGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* State Disruption Statistics Bar Chart */}
        <div className="veltrex-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-veltrex-cobalt uppercase tracking-wider">INFRASTRUCTURE EXPOSURE BY NER STATE</h3>
            <span className="text-xs text-slate-500 font-mono">Roads Cutoff vs Villages Impacted</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateDisruptionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="state" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F2C59', borderColor: '#1E3A8A', borderRadius: '8px', color: '#FFFFFF' }} />
                <Bar dataKey="roads" name="Road Segments" fill="#DC2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="villages" name="Villages Affected" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

