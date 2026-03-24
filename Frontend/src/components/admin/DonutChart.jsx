import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444']; 

const DonutChart = ({ inStock, outWithReturn, outWithDamage }) => {
  const data = [
    { name: 'En Stock', value: inStock },
    { name: 'Salida (Retorno)', value: outWithReturn },
    { name: 'Salida (Pérdida/Daño)', value: outWithDamage },
  ].filter(item => item.value > 0);

  if (data.length === 0) return <div className="text-slate-500 text-sm">Sin datos</div>;

  return (
    <ResponsiveContainer width="100%" height={120}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={30}
          outerRadius={50}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DonutChart;