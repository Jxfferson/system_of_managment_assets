import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const EntryExitChart = ({ stats }) => {
  const data = [
    { name: 'Entries', value: stats.entries, color: '#10b981' },  // emerald-500
    { name: 'Exits', value: stats.exits, color: '#38bdf8' }       // sky-400 (reemplaza amber)
  ];

  return (
    <div className="p-6 rounded-xl bg-slate-900/30 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">Entry vs Exit Flow</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#e2e8f0'
            }}
            cursor={{ fill: 'rgba(56, 189, 248, 0.1)' }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};