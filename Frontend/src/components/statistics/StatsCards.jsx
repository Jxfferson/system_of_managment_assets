import React from 'react';
import { Package, ArrowDownToLine, ArrowUpFromLine, TrendingUp } from 'lucide-react';

export const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total in Period',
      value: stats.total,
      icon: Package,
      colorClass: 'text-cyan-400',
      bgClass: 'bg-cyan-500/10'
    },
    {
      title: 'Entries',
      value: stats.entries,
      icon: ArrowDownToLine,
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-500/10'
    },
    {
      title: 'Exits',
      value: stats.exits,
      icon: ArrowUpFromLine,
      colorClass: 'text-amber-400',
      bgClass: 'bg-amber-500/10'
    },
    {
      title: 'Net Flow',
      value: stats.entries - stats.exits > 0 
        ? `+${stats.entries - stats.exits}` 
        : stats.entries - stats.exits,
      icon: TrendingUp,
      colorClass: 'text-slate-300',
      bgClass: 'bg-slate-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div key={index} className="p-4 rounded-xl bg-slate-900/30 border border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${card.bgClass} flex items-center justify-center`}>
              <card.icon className={`w-5 h-5 ${card.colorClass}`} />
            </div>
            <div>
              <p className="text-slate-500 text-xs">{card.title}</p>
              <p className={`text-2xl font-semibold ${card.colorClass}`}>{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};