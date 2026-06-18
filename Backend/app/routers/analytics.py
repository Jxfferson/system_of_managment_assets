from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, text, case, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta

from app.config.database import get_db
from app.models.almacen import Almacen
from app.models.item import Item
from app.schemas.analytics import (
    ItemEfficiency,
    CategoryComparison,
    AnalyticsRecommendation,
    AnalyticsSummary
)

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


# === ENDPOINTS ===

@router.get("/item/{item_name}", response_model=ItemEfficiency)
def get_item_efficiency(item_name: str, db: Session = Depends(get_db)):
    """Calculate efficiency metrics for a specific item"""
    item = db.query(Item).filter(Item.name == item_name).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    stats = db.execute(
        text("""
            SELECT 
                COUNT(*) as total_outputs,
                SUM(CASE WHEN Fecha_Salida IS NOT NULL AND Tipo_Retorno IS NULL THEN 1 ELSE 0 END) as successful_outputs,
                SUM(CASE WHEN Tipo_Retorno IN ('Damage', 'Missing') THEN 1 ELSE 0 END) as failure_count,
                AVG(
                    CASE 
                        WHEN Fecha_Salida IS NOT NULL AND Fecha_Ingreso IS NOT NULL 
                        THEN DATEDIFF(Fecha_Salida, Fecha_Ingreso) / 30.0 
                        ELSE NULL 
                    END
                ) as avg_lifespan_months
            FROM ALMACEN
            WHERE Item = :item_name
        """),
        {"item_name": item_name}
    ).fetchone()
    
    total_outputs = stats.total_outputs or 0
    successful_outputs = stats.successful_outputs or 0
    failure_count = stats.failure_count or 0
    avg_lifespan = stats.avg_lifespan_months or 0
    
    failure_rate = (failure_count / total_outputs * 100) if total_outputs > 0 else 0
    cost_per_use = item.price_cop / successful_outputs if successful_outputs > 0 else item.price_cop
    
    expected_lifespan = item.expected_lifespan_months or 24
    lifespan_deviation = ((avg_lifespan - expected_lifespan) / expected_lifespan * 100) if expected_lifespan > 0 else 0
    
    acceptable_failure = item.acceptable_failure_rate or 10.0
    if failure_rate <= acceptable_failure and avg_lifespan >= expected_lifespan * 0.8:
        performance_rating = "Excellent"
    elif failure_rate <= acceptable_failure * 1.5 and avg_lifespan >= expected_lifespan * 0.6:
        performance_rating = "Good"
    elif failure_rate <= acceptable_failure * 2:
        performance_rating = "Fair"
    else:
        performance_rating = "Poor"
    
    if performance_rating == "Excellent":
        recommendation = f"Continue purchasing - Excellent performance with {failure_rate:.1f}% failure rate"
    elif performance_rating == "Good":
        recommendation = f"Acceptable performance - Monitor for improvements"
    elif performance_rating == "Fair":
        recommendation = f"Consider alternative suppliers - {failure_rate:.1f}% failure rate exceeds acceptable {acceptable_failure}%"
    else:
        recommendation = f"Replace product immediately - {failure_rate:.1f}% failure rate is critically high"
    
    return ItemEfficiency(
        item_name=item_name,
        category_type=item.category_type,
        prefix=item.prefix,
        price_cop=item.price_cop,
        total_outputs=total_outputs,
        successful_outputs=successful_outputs,
        failure_count=failure_count,
        failure_rate=round(failure_rate, 2),
        avg_lifespan_months=round(avg_lifespan, 2),
        expected_lifespan_months=expected_lifespan,
        lifespan_deviation=round(lifespan_deviation, 2),
        cost_per_use=round(cost_per_use, 2),
        acceptable_failure_rate=acceptable_failure,
        performance_rating=performance_rating,
        recommendation=recommendation
    )


@router.get("/category/{category_type}", response_model=CategoryComparison)
def compare_items_by_category(category_type: str, db: Session = Depends(get_db)):
    """Compare all items within a specific category"""
    items = db.query(Item).filter(Item.category_type == category_type).all()
    
    if not items:
        raise HTTPException(status_code=404, detail=f"No items found in category: {category_type}")
    
    items_efficiency = []
    for item in items:
        try:
            efficiency = get_item_efficiency(item.name, db)
            items_efficiency.append(efficiency)
        except:
            continue
    
    if not items_efficiency:
        raise HTTPException(status_code=404, detail="No efficiency data available")
    
    best = min(items_efficiency, key=lambda x: x.failure_rate)
    worst = max(items_efficiency, key=lambda x: x.failure_rate)
    
    avg_failure = sum(i.failure_rate for i in items_efficiency) / len(items_efficiency)
    avg_lifespan = sum(i.avg_lifespan_months for i in items_efficiency) / len(items_efficiency)
    
    return CategoryComparison(
        category_type=category_type,
        items=items_efficiency,
        best_performer=best.item_name,
        worst_performer=worst.item_name,
        avg_failure_rate=round(avg_failure, 2),
        avg_lifespan=round(avg_lifespan, 2)
    )


@router.get("/recommendations", response_model=List[AnalyticsRecommendation])
def get_recommendations(db: Session = Depends(get_db)):
    """Generate automated recommendations based on performance data"""
    items = db.query(Item).all()
    recommendations = []
    
    for item in items:
        try:
            efficiency = get_item_efficiency(item.name, db)
            
            if efficiency.total_outputs == 0:
                continue
            
            if efficiency.failure_rate > efficiency.acceptable_failure_rate * 2:
                recommendations.append(AnalyticsRecommendation(
                    item_name=item.name,
                    current_performance=f"{efficiency.failure_rate:.1f}% failure rate, {efficiency.avg_lifespan_months:.1f} months lifespan",
                    expected_performance=f"<{efficiency.acceptable_failure_rate}% failure rate, {efficiency.expected_lifespan_months} months lifespan",
                    issue="Critically high failure rate",
                    recommendation="Immediate replacement recommended - Consider alternative product or supplier",
                    priority="High"
                ))
            elif efficiency.failure_rate > efficiency.acceptable_failure_rate * 1.5:
                recommendations.append(AnalyticsRecommendation(
                    item_name=item.name,
                    current_performance=f"{efficiency.failure_rate:.1f}% failure rate",
                    expected_performance=f"<{efficiency.acceptable_failure_rate}% failure rate",
                    issue="High failure rate",
                    recommendation="Consider changing supplier or product model",
                    priority="Medium"
                ))
            elif efficiency.lifespan_deviation < -30:
                recommendations.append(AnalyticsRecommendation(
                    item_name=item.name,
                    current_performance=f"{efficiency.avg_lifespan_months:.1f} months lifespan",
                    expected_performance=f"{efficiency.expected_lifespan_months} months lifespan",
                    issue=f"Lifespan {abs(efficiency.lifespan_deviation):.0f}% below expected",
                    recommendation="Evaluate product quality - May need to upgrade to higher quality option",
                    priority="Medium"
                ))
            elif efficiency.cost_per_use > item.price_cop * 0.5:
                recommendations.append(AnalyticsRecommendation(
                    item_name=item.name,
                    current_performance=f"${efficiency.cost_per_use:,.0f} cost per use",
                    expected_performance=f"<${item.price_cop * 0.3:,.0f} cost per use",
                    issue="High cost per use due to frequent replacements",
                    recommendation="Consider bulk purchasing or higher quality alternative",
                    priority="Low"
                ))
                
        except Exception as e:
            continue
    
    priority_order = {"High": 0, "Medium": 1, "Low": 2}
    recommendations.sort(key=lambda x: priority_order.get(x.priority, 3))
    
    return recommendations


@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary(db: Session = Depends(get_db)):
    """Get overall analytics summary"""
    # Total items
    total_items = db.query(Item).count()
    
    # Items with data (usando JOIN explícito)
    items_with_data = db.query(func.count(func.distinct(Almacen.Item))).scalar()
    
    # Overall failure rate
    overall_stats = db.execute(
        text("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN Tipo_Retorno IN ('Damage', 'Missing') THEN 1 ELSE 0 END) as failures
            FROM ALMACEN
            WHERE Fecha_Salida IS NOT NULL
        """)
    ).fetchone()
    
    overall_failure_rate = (overall_stats.failures / overall_stats.total * 100) if overall_stats.total > 0 else 0
    
    # Average lifespan across all items
    avg_lifespan = db.execute(
        text("""
            SELECT AVG(DATEDIFF(Fecha_Salida, Fecha_Ingreso) / 30.0)
            FROM ALMACEN
            WHERE Fecha_Salida IS NOT NULL AND Fecha_Ingreso IS NOT NULL
        """)
    ).scalar() or 0
    
    # Top performing category
    category_stats = db.execute(
        text("""
            SELECT 
                i.category_type,
                COUNT(a.ID) as total_uses,
                SUM(CASE WHEN a.Tipo_Retorno IN ('Damage', 'Missing') THEN 1 ELSE 0 END) as failures
            FROM ALMACEN a
            JOIN items i ON a.Item = i.name
            WHERE i.category_type IS NOT NULL
            GROUP BY i.category_type
            ORDER BY total_uses DESC
            LIMIT 1
        """)
    ).fetchone()
    
    return AnalyticsSummary(
        total_items=total_items,
        items_with_data=items_with_data,
        overall_failure_rate=round(overall_failure_rate, 2),
        avg_lifespan_months=round(avg_lifespan, 2),
        most_used_category=category_stats.category_type if category_stats else None,
        total_movements=overall_stats.total if overall_stats else 0
    )

# === SIMULATION ENDPOINTS ===

@router.post("/simulate-outputs/{item_name}")
def simulate_outputs(item_name: str, count: int = 10, db: Session = Depends(get_db)):
    """Simulate asset outputs for testing analytics (can be rolled back)"""
    import random
    
    item = db.query(Item).filter(Item.name == item_name).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    simulated_records = []
    base_date = datetime.now() - timedelta(days=365)
    
    for i in range(count):
        ingreso_date = base_date + timedelta(days=random.randint(0, 300))
        salida_date = ingreso_date + timedelta(days=random.randint(30, 365))
        return_type = random.choice([None, None, None, None, None, None, None, 'Damage', 'Missing', 'Damage'])
        
        simulated_records.append({
            "Item": item_name,
            "Serial": f"SIM-{item.prefix or 'ITM'}{10000 + i}",
            "Fecha_Ingreso": ingreso_date.date(),
            "Fecha_Salida": salida_date.date() if return_type else None,
            "Destino": f"SIM-STATION-{random.randint(1, 50)}",
            "Tipo_Retorno": return_type,
            "Observaciones_Retorno": "Simulated data for testing" if return_type else None
        })
    
    db.bulk_insert_mappings(Almacen, simulated_records)
    db.commit()
    
    return {
        "message": f"Successfully simulated {count} outputs for {item_name}",
        "records_created": count,
        "note": "Use DELETE method to remove simulated data"
    }


@router.delete("/simulate-outputs/{item_name}")
def delete_simulated_outputs(item_name: str, db: Session = Depends(get_db)):
    """Delete all simulated outputs for an item (rollback simulation)"""
    deleted = db.query(Almacen).filter(
        Almacen.Item == item_name,
        Almacen.Serial.like("SIM-%")
    ).delete(synchronize_session=False)
    
    db.commit()
    
    return {
        "message": f"Deleted {deleted} simulated records for {item_name}",
        "records_deleted": deleted
    }


@router.delete("/simulate-outputs/all")
def delete_all_simulated_outputs(db: Session = Depends(get_db)):
    """Delete ALL simulated outputs (rollback all simulations)"""
    deleted = db.query(Almacen).filter(
        Almacen.Serial.like("SIM-%")
    ).delete(synchronize_session=False)
    
    db.commit()
    
    return {
        "message": f"Deleted {deleted} total simulated records",
        "records_deleted": deleted
    }