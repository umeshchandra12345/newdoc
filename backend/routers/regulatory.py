from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import io
import csv
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/api/regulatory", tags=["Regulatory & Reports"])

@router.get("", response_model=List[schemas.RegulatoryReportResponse])
def get_regulatory_frameworks(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.RegulatoryReport).all()

@router.get("/reports")
def get_reports_list(current_user: models.User = Depends(get_current_user)):
    return [
        {
            "id": "carbon-accounting",
            "name": "Carbon Accounting Comprehensive Report",
            "year": 2026,
            "status": "Verified",
            "last_updated": "Sep 08, 2026",
            "standard": "GHG Protocol Corporate Standard",
            "summary": "Full inventory of Scope 1, Scope 2 (market & location), and Scope 3 emissions across all four regional facilities."
        },
        {
            "id": "scopes-breakdown",
            "name": "Scope 1, 2 & 3 Emission Inventories",
            "year": 2026,
            "status": "Audited",
            "last_updated": "Sep 07, 2026",
            "standard": "ISO 14064-1:2018",
            "summary": "Disaggregated activity data, conversion factors, emission outputs, and uncertainty assessments for direct and indirect sources."
        },
        {
            "id": "product-pcf",
            "name": "Product Carbon Footprint (PCF) Portfolio",
            "year": 2026,
            "status": "Certified",
            "last_updated": "Sep 04, 2026",
            "standard": "ISO 14067 / GHG Product Standard",
            "summary": "Cradle-to-gate lifecycle analyses for DX-series industrial products, bill of materials emission intensities, and material substitution impacts."
        },
        {
            "id": "supplier-emissions",
            "name": "Supplier Engagement & Scope 3 Category 1 Report",
            "year": 2026,
            "status": "Published",
            "last_updated": "Aug 29, 2026",
            "standard": "CDP Supply Chain Guidance",
            "summary": "Primary supplier data collection returns, supplier emission factors, ESG questionnaire scores, and data completeness matrix."
        },
        {
            "id": "csrd-esrs",
            "name": "CSRD / ESRS E1 Climate Change Disclosure",
            "year": 2026,
            "status": "Ready for Filing",
            "last_updated": "Sep 02, 2026",
            "standard": "European Sustainability Reporting Standards",
            "summary": "Mandatory climate governance, transition plan alignment, Scope 1-3 disclosures, and climate risk resilience assessments."
        },
        {
            "id": "cbam-declaration",
            "name": "CBAM Embedded Emissions Quarterly Declaration",
            "year": 2026,
            "status": "Verified",
            "last_updated": "Aug 30, 2026",
            "standard": "EU CBAM Regulation (EU) 2023/956",
            "summary": "Specific embedded direct and indirect emissions for steel and electrical components exported to the European single market."
        }
    ]

@router.get("/download/{report_id}")
def download_report_csv(report_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    output = io.StringIO()
    writer = csv.writer(output)

    if report_id == "carbon-accounting" or report_id == "scopes-breakdown":
        writer.writerow(["ID", "Facility", "Source", "Scope", "Category", "Activity", "Unit", "Emissions (tCO2e)", "Year", "Status"])
        emissions = db.query(models.Emission).filter(models.Emission.year == 2026).all()
        for e in emissions:
            f_name = e.facility.name if e.facility else "General"
            writer.writerow([e.id, f_name, e.source, e.scope, e.category, e.activity, e.unit, e.emissions, e.year, e.status])
    elif report_id == "product-pcf":
        writer.writerow(["ID", "Product Name", "SKU", "Category", "Carbon Footprint (kgCO2e/unit)", "YoY Change (%)", "Materials %", "Mfg %", "Packaging %", "Transport %", "End-of-Life %", "Status"])
        products = db.query(models.Product).all()
        for p in products:
            writer.writerow([p.id, p.name, p.sku, p.category, p.carbon_footprint, p.change_pct, p.materials_pct, p.manufacturing_pct, p.packaging_pct, p.transport_pct, p.end_of_life_pct, p.status])
    elif report_id == "supplier-emissions":
        writer.writerow(["ID", "Supplier Name", "Region", "Category", "Emissions (tCO2e)", "Data Quality", "Engagement Score (%)", "Status"])
        suppliers = db.query(models.Supplier).all()
        for s in suppliers:
            writer.writerow([s.id, s.name, s.region, s.category, s.emissions, s.data_quality, s.engagement, s.status])
    else:
        writer.writerow(["Metric", "Standard", "Value", "Status", "Reporting Year"])
        writer.writerow(["CSRD ESRS E1-6 Gross Scopes 1, 2, 3 GHG Emissions", "CSRD / ESRS", "482,640 tCO2e", "Verified", "2026"])
        writer.writerow(["Scope 1 Direct Stationary & Fleet", "GHG Protocol", "74,210 tCO2e", "Verified", "2026"])
        writer.writerow(["Scope 2 Purchased Grid Electricity (Location)", "GHG Protocol", "102,830 tCO2e", "Verified", "2026"])
        writer.writerow(["Scope 2 Purchased Renewable Electricity (Market)", "GHG Protocol", "73,523 tCO2e", "Verified", "2026"])
        writer.writerow(["Scope 3 Value Chain Total", "GHG Protocol", "305,600 tCO2e", "Verified", "2026"])
        writer.writerow(["CBAM Specific Direct Embedded Emissions", "EU Regulation 2023/956", "1.42 tCO2e / t steel", "Approved", "2026"])
        writer.writerow(["Target 2030 Decarbonization Rate", "SBTi 1.5°C", "42% Reduction", "On Track (31% Achieved)", "2026"])

    output.seek(0)
    filename = f"Nexgile-DecarbX_{report_id}_2026.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
