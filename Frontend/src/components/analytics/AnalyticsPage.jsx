import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import API_URL from '@/services/api.config';
import AnalyticsSummary from './AnalyticsSummary';
import CategoryComparison from './CategoryComparison';
import RecommendationsList from './RecommendationsList';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categoryData, setCategoryData] = useState(null);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  useEffect(() => {
    if (selectedCategory !== 'all') {
      loadCategoryData(selectedCategory);
    } else {
      setCategoryData(null);
    }
  }, [selectedCategory]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [summaryRes, recommendationsRes] = await Promise.all([
        fetch(`${API_URL}/api/analytics/summary`),
        fetch(`${API_URL}/api/analytics/recommendations`)
      ]);

      if (summaryRes.ok) setSummary(await summaryRes.json());
      if (recommendationsRes.ok) setRecommendations(await recommendationsRes.json());
    } catch (err) {
      console.error('Error loading analytics:', err);
      toast({ title: "Error", description: "Could not load analytics data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryData = async (category) => {
    try {
      const res = await fetch(`${API_URL}/api/analytics/category/${category}`);
      if (res.ok) setCategoryData(await res.json());
    } catch (err) {
      console.error('Error loading category data:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-3" />
        <p className="text-slate-400 text-sm">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">📊 Asset Analytics</h2>
          <p className="text-sm text-slate-400 mt-1">Performance metrics and recommendations</p>
        </div>
        <button
          onClick={() => navigate('/admin')}
          className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
        >
          ← Back to Assets
        </button>
      </div>

      {/* Summary Cards */}
      <AnalyticsSummary summary={summary} />

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <p className="text-sm text-slate-400">Category:</p>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
        >
          <option value="all">All Categories</option>
          <option value="cable">Cables</option>
          <option value="peripheral">Peripherals</option>
          <option value="accessory">Accessories</option>
        </select>
      </div>

      {/* Category Comparison */}
      <CategoryComparison category={selectedCategory} data={categoryData} />

      {/* Recommendations */}
      <RecommendationsList recommendations={recommendations} />
    </div>
  );
};

export default AnalyticsPage;