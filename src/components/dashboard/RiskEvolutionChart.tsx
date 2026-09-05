import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, Clock } from 'lucide-react';
import { NerLocation } from '../../types';

interface RiskEvolutionChartProps {
  location: NerLocation;
}

export const RiskEvolutionChart: React.FC<RiskEvolutionChartProps> = ({ location }) => {
  const data = location.riskEvolution;
  const initialScore = data[0]?.score || 40;
  const currentScore = location.riskScore;
  const scoreDiff = currentScore - initialScore;

  return (
    <div className="aurora-card rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-aurora-coral" />
            <h3 className="text-xs font-black text-aurora-forest uppercase tracking-wider">RISK EVOLUTION TIMELINE</h3>
          </div>
          <p className="text-[10px] text-aurora-mineral">Escalation progression over last 6 hours</p>
        </div>

        <div className="text-right font-mono">
          <span className="text-xs font-bold text-aurora-coral">+{scoreDiff} points</span>
          <div className="text-[10px] text-aurora-mineral flex items-center justify-end space-x-1">
            <Clock className="w-3 h-3" />
            <span>↑ Rapid escalation</span>
          </div>
        </div>
      </div>

      {/* Timeline Steps Banner */}
      <div className="flex items-center justify-between text-xs font-mono font-bold text-aurora-forest py-1.5 px-3 bg-aurora-glacier/40 rounded-xl border border-aurora-mineral/15">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center space-x-1">
            <span className="text-aurora-mineral text-[10px]">{item.time}</span>
            <span className={`px-1.5 py-0.2 rounded ${
              idx === data.length - 1 ? 'bg-aurora-coral text-white font-black' : 'bg-white text-aurora-forest'
            }`}>
              {item.score}
            </span>
            {idx < data.length - 1 && <span className="text-aurora-mineral/40">→</span>}
          </div>
        ))}
      </div>

      {/* Area Chart */}
      <div className="h-36 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF5A5F" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#FF5A5F" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#B8F3EA" />
            <XAxis dataKey="time" stroke="#0E6B5C" fontSize={10} tickLine={false} />
            <YAxis domain={[0, 100]} stroke="#0E6B5C" fontSize={10} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#082C2A', borderColor: '#0E6B5C', borderRadius: '12px', color: '#F7F4EC', fontSize: '11px' }}
              formatter={(val: any) => [`${val} / 100`, 'Risk Index']}
            />
            <Area type="monotone" dataKey="score" stroke="#FF5A5F" strokeWidth={3} fillOpacity={1} fill="url(#riskGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
