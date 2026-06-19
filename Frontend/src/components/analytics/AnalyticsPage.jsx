import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import API_URL from '@/services/api.config';
import AnalyticsSummary from './AnalyticsSummary';
import CategoryComparison from './CategoryComparison';
import RecommendationsList from './RecommendationsList';
import AllCategoriesView from './AllCategoriesView';
import { exportAnalyticsToExcel } from '@/utils/exportAnalytics';
import { Download } from 'lucide-react';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [allItems, setAllItems] = useState([]);
  const [categories, setCategories] = useState({});

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      loadAllCategoriesData();
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

  const loadAllCategoriesData = async () => {
    try {
      const categoryTypes = ['cable', 'peripheral', 'accessory'];
      const results = {};
      const allItemsList = [];

      for (const category of categoryTypes) {
        try {
          const res = await fetch(`${API_URL}/api/analytics/category/${category}`);
          if (res.ok) {
            const data = await res.json();
            results[category] = data;
            allItemsList.push(...data.items);
          }
        } catch (err) {
          console.error(`Error loading ${category}:`, err);
        }
      }

      setCategories(results);
      setAllItems(allItemsList);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleExport = () => {
    try {
      const exportData = {
        summary,
        recommendations,
        allItems,
        categories
      };
      
      exportAnalyticsToExcel(exportData, 'inventory-analytics');
      
      toast({ 
        title: "Export successful", 
        description: "Analytics report downloaded as Excel file" 
      });
    } catch (err) {
      console.error('Export error:', err);
      toast({ 
        title: "Export failed", 
        description: "Could not export analytics data", 
        variant: "destructive" 
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-white/10 border-t-white/60 rounded-full animate-spin mb-3" />
        <p className="text-white/50 text-sm">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Asset Analytics</h2>
          <p className="text-sm text-white/50 mt-1">Performance metrics and recommendations</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors text-sm font-medium"
            title="Export to Excel"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <AnalyticsSummary summary={summary} />

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <p className="text-sm text-white/50">Category:</p>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 focus:border-white/20 focus:outline-none"
        >
          <option value="all">All Categories</option>
          <option value="cable">Cables</option>
          <option value="peripheral">Peripherals</option>
          <option value="accessory">Accessories</option>
        </select>
      </div>

      {/* Content based on selection */}
      {selectedCategory === 'all' ? (
        <AllCategoriesView />
      ) : (
        <CategoryComparison category={selectedCategory} />
      )}

      {/* Recommendations */}
      <RecommendationsList recommendations={recommendations} />
    </div>
  );
};

export default AnalyticsPage;