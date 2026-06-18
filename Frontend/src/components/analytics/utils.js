export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    case 'Medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    case 'Low': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
  }
};

export const getPerformanceColor = (rating) => {
  switch (rating) {
    case 'Excellent': return 'text-emerald-400';
    case 'Good': return 'text-cyan-400';
    case 'Fair': return 'text-amber-400';
    case 'Poor': return 'text-rose-400';
    default: return 'text-slate-400';
  }
};

export const getFailureRateColor = (rate) => {
  if (rate > 15) return 'from-rose-500 to-rose-600';
  if (rate > 8) return 'from-amber-500 to-amber-600';
  return 'from-emerald-500 to-emerald-600';
};

export const formatCategoryName = (category) => {
  if (!category || category === 'all') return 'All Categories';
  return category.charAt(0).toUpperCase() + category.slice(1);
};