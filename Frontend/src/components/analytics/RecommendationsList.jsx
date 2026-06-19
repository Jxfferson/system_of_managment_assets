import React from 'react';

const RecommendationItem = ({ rec }) => {
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High':
        return 'text-rose-300/80 border-rose-400/20 bg-rose-400/5';
      case 'Medium':
        return 'text-cyan-300/80 border-cyan-400/20 bg-cyan-400/5';
      case 'Low':
        return 'text-slate-300/80 border-slate-400/20 bg-slate-400/5';
      default:
        return 'text-slate-300/80 border-slate-400/20 bg-slate-400/5';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'High': return 'Critical';
      case 'Medium': return 'Review';
      case 'Low': return 'Monitor';
      default: return priority;
    }
  };

  return (
    <div className="p-4 border-l-2 border-slate-700/50 hover:border-cyan-400/30 transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-white/90 font-medium text-sm">{rec.item_name}</h4>
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide border ${getPriorityStyle(rec.priority)}`}>
              {getPriorityLabel(rec.priority)}
            </span>
          </div>
          
          <p className="text-sm text-white/70 mb-1">
            {rec.issue}
          </p>
          
          <p className="text-xs text-white/50 mb-3">
            {rec.current_performance}
          </p>
          
          <div className="p-3 bg-white/5 border border-white/10 rounded">
            <p className="text-sm text-white/80">
              {rec.recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="text-center py-12 px-4">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
      <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <p className="text-white/70 font-medium mb-1">All assets performing well</p>
    <p className="text-white/40 text-sm">No recommendations at this time</p>
  </div>
);

const RecommendationsList = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
        <h3 className="text-base font-medium text-white/80 mb-4">Recommendations</h3>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
      <h3 className="text-base font-medium text-white/80 mb-4">Recommendations</h3>
      
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <RecommendationItem key={index} rec={rec} />
        ))}
      </div>
    </div>
  );
};

export default RecommendationsList;