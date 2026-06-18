import React from 'react';

const SummaryCard = ({ icon, label, value, borderColor }) => (
  <div className={`p-4 bg-slate-800/40 border ${borderColor} rounded-xl`}>
    <div className="flex items-center gap-3">
      <div className={`p-2 ${icon.bg} rounded-lg`}>
        {icon.svg}
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  </div>
);

const AnalyticsSummary = ({ summary }) => {
  if (!summary) return null;

  const cards = [
    {
      label: 'Total Items',
      value: summary.total_items,
      borderColor: 'border-cyan-500/20',
      icon: {
        bg: 'bg-cyan-500/20',
        svg: (
          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )
      }
    },
    {
      label: 'Active Items',
      value: summary.items_with_data,
      borderColor: 'border-emerald-500/20',
      icon: {
        bg: 'bg-emerald-500/20',
        svg: (
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      }
    },
    {
      label: 'Failure Rate',
      value: `${summary.overall_failure_rate}%`,
      borderColor: 'border-rose-500/20',
      icon: {
        bg: 'bg-rose-500/20',
        svg: (
          <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      }
    },
    {
      label: 'Avg Lifespan',
      value: `${summary.avg_lifespan_months} mo`,
      borderColor: 'border-purple-500/20',
      icon: {
        bg: 'bg-purple-500/20',
        svg: (
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      }
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <SummaryCard key={index} {...card} />
      ))}
    </div>
  );
};

export default AnalyticsSummary;