from pydantic import BaseModel
from typing import List, Optional


class ItemEfficiency(BaseModel):
    item_name: str
    category_type: Optional[str]
    prefix: Optional[str]
    price_cop: float
    total_outputs: int
    successful_outputs: int
    failure_count: int
    failure_rate: float
    avg_lifespan_months: float
    expected_lifespan_months: Optional[int]
    lifespan_deviation: float
    cost_per_use: float
    acceptable_failure_rate: Optional[float]
    performance_rating: str
    recommendation: str
    
    class Config:
        from_attributes = True


class CategoryComparison(BaseModel):
    category_type: str
    items: List[ItemEfficiency]
    best_performer: Optional[str]
    worst_performer: Optional[str]
    avg_failure_rate: float
    avg_lifespan: float
    
    class Config:
        from_attributes = True


class AnalyticsRecommendation(BaseModel):
    item_name: str
    current_performance: str
    expected_performance: str
    issue: str
    recommendation: str
    priority: str
    
    class Config:
        from_attributes = True


class AnalyticsSummary(BaseModel):
    total_items: int
    items_with_data: int
    overall_failure_rate: float
    avg_lifespan_months: float
    most_used_category: Optional[str]
    total_movements: int
    
    class Config:
        from_attributes = True