from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/api/reduction", tags=["Decarbonization"])

@router.get("", response_model=List[schemas.ReductionInitiativeResponse])
def get_initiatives(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.ReductionInitiative).all()

@router.post("", response_model=schemas.ReductionInitiativeResponse, status_code=status.HTTP_201_CREATED)
def create_initiative(
    initiative_in: schemas.ReductionInitiativeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_init = models.ReductionInitiative(**initiative_in.model_dump())
    db.add(new_init)
    db.commit()
    db.refresh(new_init)
    return new_init

@router.get("/scenarios")
def get_scenarios(scenario: str = "current", db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Baseline actual 2026 total emissions
    baseline = 482640.0

    if scenario.lower() == "accelerated":
        total_reduction = 144600.0
        projected_emissions = baseline - total_reduction
        reduction_pct = round((total_reduction / baseline) * 100, 1)
        return {
            "scenario": "Accelerated Reduction",
            "description": "Aggressive decarbonization via 100% renewable PPA, heat pump boiler replacement, and strict low-carbon supplier quotas.",
            "baseline_emissions": baseline,
            "projected_emissions": projected_emissions,
            "total_reduction": total_reduction,
            "reduction_pct": reduction_pct,
            "investment_required": "₹56.0 Cr",
            "target_achievement_pct": 100.0,
            "status": "Target Aligned (1.5°C)",
            "key_actions": [
                "Full off-site corporate PPA (100% renewable power)",
                "Complete phase-out of fossil-fuel boiler steam systems",
                "Mandatory EPD certification for top 80% spend suppliers",
                "Electrification of 100% distribution fleet"
            ]
        }
    else:
        # Current path
        total_reduction = 60400.0
        projected_emissions = baseline - total_reduction
        reduction_pct = round((total_reduction / baseline) * 100, 1)
        return {
            "scenario": "Current Path",
            "description": "Standard operational trajectory based on committed CAPEX and incremental energy efficiency measures.",
            "baseline_emissions": baseline,
            "projected_emissions": projected_emissions,
            "total_reduction": total_reduction,
            "reduction_pct": reduction_pct,
            "investment_required": "₹25.5 Cr",
            "target_achievement_pct": 73.8,
            "status": "Moderate Progress (2.0°C)",
            "key_actions": [
                "Incremental rooftop solar installations (28% coverage)",
                "Variable frequency drives (VFD) on core pump systems",
                "Pilot EV commercial delivery vans in metropolitan depots",
                "Energy audit lighting retrofits"
            ]
        }
