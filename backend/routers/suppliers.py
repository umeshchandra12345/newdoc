from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/api/suppliers", tags=["Suppliers"])

@router.get("")
def get_suppliers(
    search: Optional[str] = None,
    data_quality: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Supplier)
    if data_quality and data_quality != "All":
        query = query.filter(models.Supplier.data_quality == data_quality)
    if search:
        query = query.filter(
            (models.Supplier.name.ilike(f"%{search}%")) |
            (models.Supplier.region.ilike(f"%{search}%")) |
            (models.Supplier.category.ilike(f"%{search}%"))
        )
    suppliers = query.all()

    total_count = len(suppliers)
    avg_engagement = round(sum(s.engagement for s in suppliers) / total_count, 1) if total_count else 0
    high_quality_count = sum(1 for s in suppliers if s.data_quality == "High")
    primary_coverage = round((high_quality_count / total_count) * 100, 1) if total_count else 0
    high_emission_count = sum(1 for s in suppliers if s.emissions > 20000)

    return {
        "stats": {
            "total_suppliers": total_count,
            "suppliers_engaged_pct": avg_engagement,
            "primary_data_coverage_pct": primary_coverage,
            "high_emission_suppliers": high_emission_count
        },
        "suppliers": [schemas.SupplierResponse.model_validate(s) for s in suppliers]
    }

@router.get("/{id}")
def get_supplier_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    supplier = db.query(models.Supplier).filter(models.Supplier.id == id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    # Historical YoY emissions
    base = supplier.emissions
    yoy_trend = [
        {"year": 2023, "emissions": round(base * 1.14, 1)},
        {"year": 2024, "emissions": round(base * 1.09, 1)},
        {"year": 2025, "emissions": round(base * 1.04, 1)},
        {"year": 2026, "emissions": round(base, 1)},
    ]

    # Questionnaire response demo
    questionnaire = [
        {"question": "Has your organization set SBTi-aligned science-based emission targets?", "answer": "Yes, Near-term 1.5°C target validated by SBTi in 2024", "status": "Compliant"},
        {"question": "Do you measure and report Scope 1 and Scope 2 GHG emissions?", "answer": "Yes, third-party verified under ISO 14064-1", "status": "Compliant"},
        {"question": "What percentage of your facility electrical energy is renewable?", "answer": "42% via captive solar rooftop and green energy wheeling", "status": "Moderate"},
        {"question": "Can you provide product-specific carbon footprint (PCF) declarations?", "answer": "Yes, ISO 14067 EPD declarations available for all supplied codes", "status": "Compliant"},
        {"question": "Water stewardship & circular scrap recycling program in place?", "answer": "Annual scrap recycling rate of 88% verified", "status": "Compliant"}
    ]

    # Evidence & documents
    evidence = [
        {"document": "ISO 14064-1 Verification Statement 2025.pdf", "type": "Third-Party Audit", "date": "Jan 15, 2026", "verifier": "DNV GL"},
        {"document": "Environmental Product Declaration (EPD) 2026.pdf", "type": "Product LCA", "date": "Feb 22, 2026", "verifier": "Environdec"},
        {"document": "Scope 1 & 2 Energy Utility Bills Batch.zip", "type": "Primary Evidence", "date": "Mar 01, 2026", "verifier": "Internal Audit"},
    ]

    scorecard = {
        "overall_score": supplier.engagement,
        "climate_governance": 88,
        "emissions_transparency": 85 if supplier.data_quality == "High" else 62,
        "renewable_energy": 74,
        "supplier_engagement_tier": "Tier-1 Strategic Decarbonization Partner"
    }

    return {
        "id": supplier.id,
        "name": supplier.name,
        "region": supplier.region,
        "category": supplier.category,
        "emissions": supplier.emissions,
        "data_quality": supplier.data_quality,
        "engagement": supplier.engagement,
        "status": supplier.status,
        "yoy_trend": yoy_trend,
        "questionnaire": questionnaire,
        "evidence": evidence,
        "scorecard": scorecard
    }
