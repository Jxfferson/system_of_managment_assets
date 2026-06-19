import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const AnalyticsCharts = ({ items }) => {
  const ratingData = React.useMemo(() => {
    if (!items || items.length === 0) return [];
    
    const counts = {};
    items.forEach(item => {
      if (item.performance_rating) {
        counts[item.performance_rating] = (counts[item.performance_rating] || 0) + 1;
      }
    });
    
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value
    }));
  }, [items]);

  const ratingColors = {
    'Excellent': 'rgba(6, 182, 212, 0.90)',
    'Good': 'rgba(34, 211, 238, 0.80)',
    'Fair': 'rgba(6, 182, 212, 0.55)',
    'Poor': 'rgba(103, 232, 249, 0.85)',
    'New': 'rgba(148, 163, 184, 0.50)'
  };

  const failureData = React.useMemo(() => {
    if (!items || items.length === 0) return [];
    
    return items
      .filter(item => item.failure_rate > 0)
      .sort((a, b) => b.failure_rate - a.failure_rate)
      .slice(0, 10)
      .map(item => ({
        name: item.item_name.length > 25 
          ? item.item_name.substring(0, 25) + '...' 
          : item.item_name,
        failure_rate: item.failure_rate,
        fullName: item.item_name
      }));
  }, [items]);

  const getBarColor = (rate) => {
    if (rate > 15) return 'rgba(103, 232, 249, 0.85)';
    if (rate > 8) return 'rgba(34, 211, 238, 0.75)';
    return 'rgba(6, 182, 212, 0.65)';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-slate-900/98 border border-cyan-500/40 rounded-lg px-3 py-2 shadow-2xl backdrop-blur-md">
          <p className="text-white font-medium text-xs mb-1.5">
            {data?.payload?.fullName || label}
          </p>
          <p className="text-cyan-300 text-xs">
            {data?.name === 'value' ? 'Items: ' : 'Failure Rate: '}
            <span className="text-white font-semibold">
              {data?.value}{data?.name !== 'value' ? '%' : ''}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  // No renderizar si no hay datos
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart - Rating Distribution */}
      <div className="p-6 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
        <h3 className="text-base font-medium text-white/80 mb-4">Rating Distribution</h3>
        {ratingData.length > 0 ? (
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ratingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={95}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="rgba(15, 23, 42, 0.9)"
                  strokeWidth={2.5}
                >
                  {ratingData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={ratingColors[entry.name] || 'rgba(148, 163, 184, 0.5)'}
                      stroke="rgba(15, 23, 42, 0.9)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ 
                    fontSize: '11px',
                    paddingTop: '10px'
                  }}
                  formatter={(value) => (
                    <span className="text-white/75 font-medium">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[280px]">
            <p className="text-white/40 text-sm">No rating data available</p>
          </div>
        )}
      </div>

      {/* Bar Chart - Top Failure Rates */}
      <div className="p-6 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
        <h3 className="text-base font-medium text-white/80 mb-4">Top Failure Rates</h3>
        {failureData.length > 0 ? (
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={failureData} layout="vertical" margin={{ left: 15, right: 25 }}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgba(255,255,255,0.06)" 
                  horizontal={false} 
                />
                <XAxis 
                  type="number" 
                  domain={[0, 'auto']} 
                  stroke="rgba(148, 163, 184, 0.4)" 
                  fontSize={11}
                  tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                  unit="%"
                  axisLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="rgba(148, 163, 184, 0.4)" 
                  fontSize={10}
                  width={140}
                  tick={{ fill: 'rgba(255, 255, 255, 0.75)' }}
                  axisLine={false}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(34, 211, 238, 0.10)' }}
                />
                <Bar 
                  dataKey="failure_rate" 
                  radius={[0, 8, 8, 0]}
                  maxBarSize={24}
                  animationDuration={600}
                >
                  {failureData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getBarColor(entry.failure_rate)}
                      stroke="rgba(15, 23, 42, 0.5)"
                      strokeWidth={1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[280px]">
            <p className="text-white/40 text-sm">No failure data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsCharts;