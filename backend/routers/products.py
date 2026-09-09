from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("", response_model=List[schemas.ProductResponse])
def get_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Product)
    if category and category != "All":
        query = query.filter(models.Product.category == category)
    if search:
        query = query.filter(
            (models.Product.name.ilike(f"%{search}%")) |
            (models.Product.sku.ilike(f"%{search}%")) |
            (models.Product.category.ilike(f"%{search}%"))
        )
    return query.order_by(models.Product.id.asc()).all()

@router.post("", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    existing = db.query(models.Product).filter(models.Product.sku == product_in.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail="Product with this SKU already exists")

    new_prod = models.Product(**product_in.model_dump())
    db.add(new_prod)
    db.commit()
    db.refresh(new_prod)
    return new_prod

@router.get("/{id}")
def get_product_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    prod = db.query(models.Product).filter(models.Product.id == id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    total_cf = prod.carbon_footprint
    mat_cf = round(total_cf * (prod.materials_pct / 100), 1)
    mfg_cf = round(total_cf * (prod.manufacturing_pct / 100), 1)
    pkg_cf = round(total_cf * (prod.packaging_pct / 100), 1)
    trn_cf = round(total_cf * (prod.transport_pct / 100), 1)
    eol_cf = round(total_cf * (prod.end_of_life_pct / 100), 1)

    # Detailed bill of materials (realistic demo data)
    materials = [
        {"material": "Virgin Electric Arc Steel", "supplier": "ABC Metals Corp", "quantity": "42 kg", "intensity": "1.82 kgCO2e/kg", "stage_pct": "54%"},
        {"material": "Copper Rotor Windings", "supplier": "EuroCables GmbH", "quantity": "12 kg", "intensity": "3.40 kgCO2e/kg", "stage_pct": "28%"},
        {"material": "Aluminum Die-Cast Housing", "supplier": "Bharat Aluminum Ltd", "quantity": "18 kg", "intensity": "4.10 kgCO2e/kg", "stage_pct": "14%"},
        {"material": "Polymer Insulation Resin", "supplier": "Precision Polymers", "quantity": "3.5 kg", "intensity": "2.20 kgCO2e/kg", "stage_pct": "4%"}
    ]

    # Material comparison scenario
    comparison = {
        "current_material": {
            "name": "Standard Virgin Structural Steel",
            "footprint": f"{mat_cf} kgCO2e",
            "cost": "₹14,200 / unit",
            "supplier": "ABC Metals Corp"
        },
        "alternative_material": {
            "name": "75% Recycled Low-Carbon EAF Steel",
            "footprint": f"{round(mat_cf * 0.72, 1)} kgCO2e",
            "cost": "₹14,850 / unit (+4.5%)",
            "supplier": "GreenSteel India (Certified)"
        },
        "carbon_reduction": f"{round(mat_cf * 0.28, 1)} kgCO2e (-28% material carbon)",
        "cost_impact": "+4.5% CapEx premium (offset in CBAM tariff credits)"
    }

    return {
        "id": prod.id,
        "name": prod.name,
        "sku": prod.sku,
        "category": prod.category,
        "functional_unit": f"1 unit of {prod.name} (Service life: 10 years)",
        "carbon_footprint": prod.carbon_footprint,
        "change_pct": prod.change_pct,
        "status": prod.status,
        "lifecycle_breakdown": [
            {"stage": "Raw Materials", "percentage": prod.materials_pct, "emissions_kg": mat_cf},
            {"stage": "Manufacturing", "percentage": prod.manufacturing_pct, "emissions_kg": mfg_cf},
            {"stage": "Packaging", "percentage": prod.packaging_pct, "emissions_kg": pkg_cf},
            {"stage": "Transportation", "percentage": prod.transport_pct, "emissions_kg": trn_cf},
            {"stage": "End-of-Life", "percentage": prod.end_of_life_pct, "emissions_kg": eol_cf}
        ],
        "materials": materials,
        "comparison": comparison
    }

@router.put("/{id}", response_model=schemas.ProductResponse)
def update_product(
    id: int,
    prod_update: schemas.ProductUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    prod = db.query(models.Product).filter(models.Product.id == id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = prod_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(prod, field, val)

    db.commit()
    db.refresh(prod)
    return prod

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    prod = db.query(models.Product).filter(models.Product.id == id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(prod)
    db.commit()
    return None
