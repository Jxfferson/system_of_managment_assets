import React from 'react';
import { getPriorityColor } from './utils';

const RecommendationCard = ({ rec }) => (
  <div className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-lg hover:border-slate-600/50 transition-colors">
    <div className="flex items-center gap-2 mb-2 flex-wrap">
      <span className={`px-2 py-1 rounded text-xs font-semibold border ${getPriorityColor(rec.priority)}`}>
        {rec.priority} Priority
      </span>
      <h4 className="text-white font-semibold">{rec.item_name}</h4>
    </div>
    <p className="text-sm text-slate-300 mb-1">
      <span className="text-rose-400 font-semibold">Issue:</span> {rec.issue}
    </p>
    <p className="text-sm text-slate-400 mb-2">
      Current: {rec.current_performance}
    </p>
    <p className="text-sm text-emerald-300 bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
      <span className="font-semibold">💡 Recommendation:</span> {rec.recommendation}
    </p>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-12">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
      <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <p className="text-slate-400 font-medium">All assets are performing well!</p>
    <p className="text-slate-500 text-sm mt-1">No recommendations at this time</p>
    <p className="text-slate-600 text-xs mt-2">
      As you gather more data, the system will provide intelligent recommendations
    </p>
  </div>
);

const RecommendationsList = ({ recommendations }) => {
  if (recommendations.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        Recommendations
      </h3>
      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <RecommendationCard key={index} rec={rec} />
        ))}
      </div>
    </div>
  );
};

export default RecommendationsList;