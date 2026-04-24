import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const ReturnTypeChart = ({ stats }) => {
  const data = [
    { name: 'Return', value: stats.returns },
    { name: 'Missing', value: stats.missing },
    { name: 'Damage', value: stats.damage }
  ].filter(item => item.value > 0); // Solo mostrar categorías con datos

  // Paleta mejorada: más suave y profesional
  const COLORS = ['#94a3b8', '#f43f5e', '#38bdf8']; // slate-400, rose-500, sky-400

  return (
    <div className="p-6 rounded-xl bg-slate-900/30 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">Return Status</h3>
      
      {data.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-slate-500 text-sm">
          No data available for selected filters
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    stroke="#1e293b"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                formatter={(value) => <span className="text-slate-400 text-xs">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Stats numbers */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span className="text-slate-500 text-xs">Return</span>
              </div>
              <p className="text-xl font-semibold text-slate-300">{stats.returns}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span className="text-slate-500 text-xs">Missing</span>
              </div>
              <p className="text-xl font-semibold text-rose-400">{stats.missing}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                <span className="text-slate-500 text-xs">Damage</span>
              </div>
              <p className="text-xl font-semibold text-sky-400">{stats.damage}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};