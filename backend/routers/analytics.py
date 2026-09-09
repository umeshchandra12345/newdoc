from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
import models
from auth import get_optional_current_user
from typing import Optional

router = APIRouter(prefix="/api/analytics", tags=["Enterprise Analytics"])

@router.get("/dashboard-executive")
def get_dashboard_executive(
    year: int = Query(2026),
    facility_id: Optional[str] = Query("All"),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_current_user)
):
    """
    Enterprise Executive KPI Layer (12 Multi-Dimensional Metrics)
    Returns current value, previous year, YoY change %, indicator, sparkline, contextual label.
    """
    # Base multiplier for years
    year_multipliers = {2022: 1.25, 2023: 1.20, 2024: 1.15, 2025: 1.09, 2026: 1.00}
    m = year_multipliers.get(year, 1.00)
    prev_m = year_multipliers.get(year - 1, 1.09)

    # Base figures for enterprise operations
    scope1_base = 74210.0 * m
    scope2_base = 102830.0 * m
    scope3_base = 305600.0 * m
    total_emissions = scope1_base + scope2_base + scope3_base

    prev_scope1 = 74210.0 * prev_m
    prev_scope2 = 102830.0 * prev_m
    prev_scope3 = 305600.0 * prev_m
    prev_total = prev_scope1 + prev_scope2 + prev_scope3

    yoy_total_pct = round(((total_emissions - prev_total) / prev_total) * 100, 1)
    yoy_s1_pct = round(((scope1_base - prev_scope1) / prev_scope1) * 100, 1)
    yoy_s2_pct = round(((scope2_base - prev_scope2) / prev_scope2) * 100, 1)
    yoy_s3_pct = round(((scope3_base - prev_scope3) / prev_scope3) * 100, 1)

    # 12 Enterprise Executive KPIs
    kpis = [
        {
            "id": "total_ghg",
            "title": "Total GHG Emissions",
            "value": round(total_emissions, 1),
            "unit": "tCO₂e",
            "prev_value": round(prev_total, 1),
            "change_pct": yoy_total_pct,
            "trend": "down",
            "status": "positive",
            "sparkline": [round(603300 * 1.0, 1), round(579168 * 1.0, 1), round(555036 * 1.0, 1), round(526058 * 1.0, 1), round(total_emissions, 1)],
            "context": "Gross Scopes 1-3 (ISO 14064-1)",
            "benchmark": "42% cut by 2030"
        },
        {
            "id": "scope1",
            "title": "Scope 1 (Direct)",
            "value": round(scope1_base, 1),
            "unit": "tCO₂e",
            "prev_value": round(prev_scope1, 1),
            "change_pct": yoy_s1_pct,
            "trend": "down",
            "status": "positive",
            "sparkline": [92762, 89052, 85341, 80889, round(scope1_base, 1)],
            "context": f"{round((scope1_base/total_emissions)*100, 1)}% of gross footprint",
            "benchmark": "Furnaces & Logistics Fleet"
        },
        {
            "id": "scope2",
            "title": "Scope 2 (Electricity)",
            "value": round(scope2_base, 1),
            "unit": "tCO₂e",
            "prev_value": round(prev_scope2, 1),
            "change_pct": yoy_s2_pct,
            "trend": "down",
            "status": "positive",
            "sparkline": [128537, 123396, 118254, 112085, round(scope2_base, 1)],
            "context": "Market-based accounting",
            "benchmark": "Location: 141,800 t"
        },
        {
            "id": "scope3",
            "title": "Scope 3 (Value Chain)",
            "value": round(scope3_base, 1),
            "unit": "tCO₂e",
            "prev_value": round(prev_scope3, 1),
            "change_pct": yoy_s3_pct,
            "trend": "down",
            "status": "positive",
            "sparkline": [382000, 366720, 351440, 333104, round(scope3_base, 1)],
            "context": f"{round((scope3_base/total_emissions)*100, 1)}% of gross footprint",
            "benchmark": "15 GHG Categories"
        },
        {
            "id": "emissions_intensity",
            "title": "Emissions Intensity",
            "value": round((total_emissions / 420.0), 1),
            "unit": "tCO₂e / $M Rev",
            "prev_value": round((prev_total / 390.0), 1),
            "change_pct": -14.2,
            "trend": "down",
            "status": "positive",
            "sparkline": [1436, 1378, 1290, 1210, round((total_emissions / 420.0), 1)],
            "context": "Revenue Decoupling Rate",
            "benchmark": "Target: <950 by 2028"
        },
        {
            "id": "renewable_pct",
            "title": "Renewable Energy Share",
            "value": 58.4,
            "unit": "%",
            "prev_value": 46.2,
            "change_pct": 26.4,
            "trend": "up",
            "status": "positive",
            "sparkline": [32.0, 38.5, 42.0, 46.2, 58.4],
            "context": "Offsite Solar PPA & Rooftop",
            "benchmark": "RE100 Goal: 100% by 2030"
        },
        {
            "id": "yoy_reduction",
            "title": "YoY Decarb Velocity",
            "value": 8.4,
            "unit": "% / yr",
            "prev_value": 5.2,
            "change_pct": 61.5,
            "trend": "up",
            "status": "positive",
            "sparkline": [4.0, 4.2, 4.9, 5.2, 8.4],
            "context": "Exceeds 4.2% Paris Goal",
            "benchmark": "1.5°C SBTi Pathway"
        },
        {
            "id": "target_progress",
            "title": "2030 Science Target",
            "value": 73.8,
            "unit": "% Met",
            "prev_value": 62.0,
            "change_pct": 19.0,
            "trend": "up",
            "status": "positive",
            "sparkline": [35.0, 44.0, 52.0, 62.0, 73.8],
            "context": "31.0% / 42.0% Goal Attained",
            "benchmark": "Status: On Track"
        },
        {
            "id": "supplier_coverage",
            "title": "Supplier Primary Data",
            "value": 84.6,
            "unit": "% Spend",
            "prev_value": 71.0,
            "change_pct": 19.1,
            "trend": "up",
            "status": "positive",
            "sparkline": [52.0, 58.0, 64.0, 71.0, 84.6],
            "context": "18 Tier-1 Audited Suppliers",
            "benchmark": "Target: 90% by FY27"
        },
        {
            "id": "mean_pcf",
            "title": "Mean Product Footprint",
            "value": 151.8,
            "unit": "kgCO₂e / unit",
            "prev_value": 164.2,
            "change_pct": -7.5,
            "trend": "down",
            "status": "positive",
            "sparkline": [188.0, 179.0, 172.0, 164.2, 151.8],
            "context": "Across 6 Catalog SKU Models",
            "benchmark": "Eco-Design Benchmark"
        },
        {
            "id": "reduction_achieved",
            "title": "Total Abatement Realized",
            "value": 37300,
            "unit": "tCO₂e abated",
            "prev_value": 24200,
            "change_pct": 54.1,
            "trend": "up",
            "status": "positive",
            "sparkline": [11000, 16500, 20400, 24200, 37300],
            "context": "Annualized Active Interventions",
            "benchmark": "Payback Period: 2.8 yrs"
        },
        {
            "id": "pipeline_potential",
            "title": "Pipeline Abatement",
            "value": 60500,
            "unit": "tCO₂e modeled",
            "prev_value": 45000,
            "change_pct": 34.4,
            "trend": "up",
            "status": "positive",
            "sparkline": [28000, 34000, 39000, 45000, 60500],
            "context": "6 Planned & In-Flight MACC Levers",
            "benchmark": "CapEx: ₹31.6 Cr"
        }
    ]

    return {
        "year": year,
        "facility_filter": facility_id,
        "kpis": kpis
    }

@router.get("/emissions-trend")
def get_emissions_multiyear(
    year: int = Query(2026),
    metric: str = Query("total"), # total, scope1, scope2, scope3, intensity, market_scope2, location_scope2
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_current_user)
):
    """
    Multi-Year Emissions Analytics (2022 -> 2026) with 2030 Target Trajectory Line
    """
    years = [2022, 2023, 2024, 2025, 2026]
    
    historical = [
        {
            "year": 2022,
            "scope1": 92762.5,
            "scope2_market": 128537.5,
            "scope2_location": 158200.0,
            "scope3": 382000.0,
            "total": 603300.0,
            "intensity": 1680.0,
            "baseline": 603300.0,
            "target_pathway": 603300.0
        },
        {
            "year": 2023,
            "scope1": 89052.0,
            "scope2_market": 123396.0,
            "scope2_location": 154100.0,
            "scope3": 366720.0,
            "total": 579168.0,
            "intensity": 1540.0,
            "baseline": 603300.0,
            "target_pathway": 570887.0
        },
        {
            "year": 2024,
            "scope1": 85341.5,
            "scope2_market": 118254.5,
            "scope2_location": 149800.0,
            "scope3": 351440.0,
            "total": 555036.0,
            "intensity": 1410.0,
            "baseline": 603300.0,
            "target_pathway": 538475.0
        },
        {
            "year": 2025,
            "scope1": 80888.9,
            "scope2_market": 112084.7,
            "scope2_location": 145200.0,
            "scope3": 333104.0,
            "total": 526077.6,
            "intensity": 1290.0,
            "baseline": 603300.0,
            "target_pathway": 506062.0
        },
        {
            "year": 2026,
            "scope1": 74210.0,
            "scope2_market": 102830.0,
            "scope2_location": 141800.0,
            "scope3": 305600.0,
            "total": 482640.0,
            "intensity": 1149.1,
            "baseline": 603300.0,
            "target_pathway": 473650.0
        }
    ]

    target_2030 = 349914.0 # 42% reduction from 603,300

    return {
        "years": years,
        "historical": historical,
        "baseline_year": 2022,
        "baseline_emissions": 603300.0,
        "target_2030": target_2030,
        "target_reduction_pct": 42.0,
        "current_attainment_pct": 73.8,
        "status": "On Track to 1.5°C SBTi Pathway"
    }

@router.get("/monthly")
def get_monthly_analytics(
    year: int = Query(2026),
    facility_id: Optional[str] = Query("All"),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_current_user)
):
    """
    Continuous 12-Month Operational Telemetry (Jan - Dec)
    """
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    # Seasonal weights (Summer peak air conditioning in Apr-Jun, industrial ramp in Oct-Dec)
    monthly_weights = [0.078, 0.075, 0.082, 0.091, 0.095, 0.092, 0.085, 0.083, 0.081, 0.084, 0.088, 0.066]
    
    annual_total = 482640.0
    annual_elec_kwh = 142820000.0
    annual_gas_m3 = 15420000.0

    records = []
    for i, m_name in enumerate(months):
        w = monthly_weights[i]
        m_emissions = round(annual_total * w, 1)
        m_elec = round(annual_elec_kwh * w, 0)
        m_gas = round(annual_gas_m3 * w, 0)
        solar_gen = round(m_elec * (0.35 + (0.15 if i in [3, 4, 5] else 0.0)), 0)
        
        records.append({
            "month": m_name,
            "month_num": i + 1,
            "emissions_total": m_emissions,
            "scope1": round(m_emissions * 0.154, 1),
            "scope2": round(m_emissions * 0.213, 1),
            "scope3": round(m_emissions * 0.633, 1),
            "electricity_kwh": m_elec,
            "natural_gas_m3": m_gas,
            "solar_ppa_kwh": solar_gen,
            "renewable_pct": round((solar_gen / m_elec) * 100, 1),
            "production_units": int(28000 * (w / 0.083)),
            "intensity_per_unit": round(m_emissions / (28000 * (w / 0.083)), 2)
        })

    return {
        "year": year,
        "facility": facility_id,
        "months": records
    }

@router.get("/scope3-hotspots")
def get_scope3_hotspots(
    year: int = Query(2026),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_current_user)
):
    """
    Scope 3 Hotspot Analysis across all 15 GHG Protocol categories
    """
    total_scope3 = 305600.0

    categories = [
        {
            "rank": 1,
            "category_num": 1,
            "name": "Purchased Goods & Services",
            "emissions": 142500.0,
            "share_pct": 46.6,
            "yoy_change_pct": -9.2,
            "data_quality": "High (Primary Supplier LCA)",
            "activity_coverage_pct": 88.0,
            "reduction_potential": "High (Steel & Aluminum circularity)",
            "supplier_count": 14,
            "primary_driver": "Raw Smelted Metals, Precision Forgings, Polymers"
        },
        {
            "rank": 2,
            "category_num": 2,
            "name": "Capital Goods",
            "emissions": 38200.0,
            "share_pct": 12.5,
            "yoy_change_pct": -6.4,
            "data_quality": "Medium (Supplier Invoices)",
            "activity_coverage_pct": 74.0,
            "reduction_potential": "Medium (Refurbished CNC Centers)",
            "supplier_count": 6,
            "primary_driver": "Manufacturing Robotics, Assembly Lines"
        },
        {
            "rank": 3,
            "category_num": 4,
            "name": "Upstream Transportation",
            "emissions": 26800.0,
            "share_pct": 8.8,
            "yoy_change_pct": -11.5,
            "data_quality": "High (Carrier Telematics)",
            "activity_coverage_pct": 82.0,
            "reduction_potential": "High (Route Optimization, Rail Shift)",
            "supplier_count": 4,
            "primary_driver": "Interstate Heavy Haul Trucking"
        },
        {
            "rank": 4,
            "category_num": 3,
            "name": "Fuel- & Energy-Related Activities",
            "emissions": 21400.0,
            "share_pct": 7.0,
            "yoy_change_pct": -8.0,
            "data_quality": "High (Well-to-Tank EF)",
            "activity_coverage_pct": 95.0,
            "reduction_potential": "Medium (Grid decarbonization)",
            "supplier_count": 2,
            "primary_driver": "Transmission & Distribution Losses"
        },
        {
            "rank": 5,
            "category_num": 11,
            "name": "Use of Sold Products",
            "emissions": 18300.0,
            "share_pct": 6.0,
            "yoy_change_pct": -14.2,
            "data_quality": "Medium (Duty Cycle Testing)",
            "activity_coverage_pct": 65.0,
            "reduction_potential": "High (IE4 Super Premium Motor Efficiency)",
            "supplier_count": 0,
            "primary_driver": "Direct in-field electric motor usage"
        },
        {
            "rank": 6,
            "category_num": 9,
            "name": "Downstream Transportation",
            "emissions": 15200.0,
            "share_pct": 5.0,
            "yoy_change_pct": -7.2,
            "data_quality": "Medium (Customer Manifests)",
            "activity_coverage_pct": 70.0,
            "reduction_potential": "Medium (Regional Distribution Hubs)",
            "supplier_count": 3,
            "primary_driver": "Outbound Finished Goods Delivery"
        },
        {
            "rank": 7,
            "category_num": 10,
            "name": "Processing of Sold Products",
            "emissions": 11800.0,
            "share_pct": 3.9,
            "yoy_change_pct": -4.8,
            "data_quality": "Low (Industry Benchmark)",
            "activity_coverage_pct": 45.0,
            "reduction_potential": "Low (OEM client processing)",
            "supplier_count": 0,
            "primary_driver": "Intermediate machining by industrial buyers"
        },
        {
            "rank": 8,
            "category_num": 5,
            "name": "Waste Generated in Operations",
            "emissions": 8400.0,
            "share_pct": 2.7,
            "yoy_change_pct": -18.0,
            "data_quality": "High (Certified Weighbills)",
            "activity_coverage_pct": 92.0,
            "reduction_potential": "High (Zero-Waste to Landfill diversion)",
            "supplier_count": 3,
            "primary_driver": "Scrap metal turnings, coolant fluid treatment"
        },
        {
            "rank": 9,
            "category_num": 7,
            "name": "Employee Commuting",
            "emissions": 6100.0,
            "share_pct": 2.0,
            "yoy_change_pct": -8.5,
            "data_quality": "Medium (Staff Survey)",
            "activity_coverage_pct": 68.0,
            "reduction_potential": "Medium (EV Shuttles, Hybrid Policy)",
            "supplier_count": 0,
            "primary_driver": "Workforce private commuting"
        },
        {
            "rank": 10,
            "category_num": 12,
            "name": "End-of-Life of Sold Products",
            "emissions": 5200.0,
            "share_pct": 1.7,
            "yoy_change_pct": -3.5,
            "data_quality": "Medium (Recycling Rates)",
            "activity_coverage_pct": 60.0,
            "reduction_potential": "High (Product Takeback & Remanufacturing)",
            "supplier_count": 0,
            "primary_driver": "Steel scrap recovery and shredding"
        },
        {
            "rank": 11,
            "category_num": 6,
            "name": "Business Travel",
            "emissions": 4200.0,
            "share_pct": 1.4,
            "yoy_change_pct": -12.0,
            "data_quality": "High (Travel Agency API)",
            "activity_coverage_pct": 98.0,
            "reduction_potential": "High (Rail Priority Policy, Virtual meetings)",
            "supplier_count": 1,
            "primary_driver": "Commercial Aviation & Executive Lodging"
        },
        {
            "rank": 12,
            "category_num": 8,
            "name": "Upstream Leased Assets",
            "emissions": 3500.0,
            "share_pct": 1.1,
            "yoy_change_pct": -5.0,
            "data_quality": "Medium (Lease Square Footage)",
            "activity_coverage_pct": 80.0,
            "reduction_potential": "Medium (Green Lease Agreements)",
            "supplier_count": 2,
            "primary_driver": "Regional Spares Depots"
        },
        {
            "rank": 13,
            "category_num": 13,
            "name": "Downstream Leased Assets",
            "emissions": 1900.0,
            "share_pct": 0.6,
            "yoy_change_pct": -2.0,
            "data_quality": "Low (Tenant Disclosures)",
            "activity_coverage_pct": 40.0,
            "reduction_potential": "Low (Tenant sub-metering)",
            "supplier_count": 0,
            "primary_driver": "Leased industrial spaces"
        },
        {
            "rank": 14,
            "category_num": 14,
            "name": "Franchises",
            "emissions": 1100.0,
            "share_pct": 0.4,
            "yoy_change_pct": -1.0,
            "data_quality": "Low (Quarterly reporting)",
            "activity_coverage_pct": 35.0,
            "reduction_potential": "Medium (Franchise energy standards)",
            "supplier_count": 0,
            "primary_driver": "Authorized regional service centers"
        },
        {
            "rank": 15,
            "category_num": 15,
            "name": "Investments",
            "emissions": 1000.0,
            "share_pct": 0.3,
            "yoy_change_pct": -6.0,
            "data_quality": "Medium (PCAF Framework)",
            "activity_coverage_pct": 75.0,
            "reduction_potential": "Low (Clean-tech joint ventures)",
            "supplier_count": 0,
            "primary_driver": "Minority equity holdings"
        }
    ]

    return {
        "year": year,
        "total_scope3_tco2e": total_scope3,
        "hotspot_category": "Purchased Goods & Services (46.6% of Scope 3)",
        "categories": categories
    }

@router.get("/facilities-deep")
def get_facilities_deep(
    year: int = Query(2026),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_current_user)
):
    """
    Enterprise Facility Comparison & Asset Intensity
    """
    total_company_emissions = 482640.0

    facilities = [
        {
            "id": 1,
            "name": "Hyderabad Plant",
            "code": "HYD-PLANT-01",
            "type": "Heavy Manufacturing & Forging",
            "state": "Telangana",
            "region": "South India",
            "total_emissions": 186420.0,
            "share_pct": 38.6,
            "scope1": 36106.4,
            "scope2": 41904.0,
            "scope3": 108409.6,
            "energy_mwh": 58200.0,
            "renewable_pct": 62.5,
            "intensity_per_unit": 6.65,
            "yoy_change_pct": -6.2,
            "high_emission_alert": True,
            "headcount": 840,
            "iso_status": "ISO 14064 Verified"
        },
        {
            "id": 2,
            "name": "Pune Manufacturing Unit",
            "code": "PUN-MFG-02",
            "type": "Precision Assembly & Machining",
            "state": "Maharashtra",
            "region": "West India",
            "total_emissions": 162140.0,
            "share_pct": 33.6,
            "scope1": 32160.0,
            "scope2": 35640.0,
            "scope3": 94340.0,
            "energy_mwh": 49500.0,
            "renewable_pct": 48.0,
            "intensity_per_unit": 5.79,
            "yoy_change_pct": -7.8,
            "high_emission_alert": False,
            "headcount": 620,
            "iso_status": "ISO 14064 Verified"
        },
        {
            "id": 3,
            "name": "Bengaluru Technology Campus",
            "code": "BLR-CAMPUS-03",
            "type": "R&D & High-Density Engineering",
            "state": "Karnataka",
            "region": "South India",
            "total_emissions": 68420.0,
            "share_pct": 14.2,
            "scope1": 3967.2,
            "scope2": 13104.0,
            "scope3": 51348.8,
            "energy_mwh": 18200.0,
            "renewable_pct": 84.5,
            "intensity_per_unit": 2.44,
            "yoy_change_pct": -12.4,
            "high_emission_alert": False,
            "headcount": 950,
            "iso_status": "LEED Platinum & ISO 14064"
        },
        {
            "id": 4,
            "name": "Chennai Distribution Warehouse",
            "code": "CHN-LOG-04",
            "type": "Logistics & High-Bay Fulfillment",
            "state": "Tamil Nadu",
            "region": "South India",
            "total_emissions": 39660.0,
            "share_pct": 8.2,
            "scope1": 1976.4,
            "scope2": 12182.0,
            "scope3": 25501.6,
            "energy_mwh": 16920.0,
            "renewable_pct": 70.0,
            "intensity_per_unit": 1.41,
            "yoy_change_pct": -9.1,
            "high_emission_alert": False,
            "headcount": 180,
            "iso_status": "ISO 14064 Verified"
        },
        {
            "id": 5,
            "name": "Gujarat Advanced Components",
            "code": "GUJ-FOUNDRY-05",
            "type": "Foundry & Casting Facility",
            "state": "Gujarat",
            "region": "West India",
            "total_emissions": 26000.0,
            "share_pct": 5.4,
            "scope1": 8400.0,
            "scope2": 9800.0,
            "scope3": 7800.0,
            "energy_mwh": 14200.0,
            "renewable_pct": 42.0,
            "intensity_per_unit": 7.20,
            "yoy_change_pct": -4.2,
            "high_emission_alert": False,
            "headcount": 220,
            "iso_status": "ISO 14064 Verified"
        }
    ]

    return {
        "year": year,
        "total_enterprise_emissions": total_company_emissions,
        "facility_count": len(facilities),
        "highest_emitting_facility": "Hyderabad Plant (186,420 tCO₂e • 38.6%)",
        "facilities": facilities
    }

@router.get("/energy-intelligence")
def get_energy_intelligence(
    year: int = Query(2026),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_current_user)
):
    """
    Dedicated Energy Intelligence Analytics
    """
    total_mwh = 157020.0
    renewable_mwh = 91700.0
    grid_mwh = 65320.0
    
    return {
        "year": year,
        "total_electricity_mwh": total_mwh,
        "renewable_electricity_mwh": renewable_mwh,
        "grid_electricity_mwh": grid_mwh,
        "renewable_share_pct": round((renewable_mwh / total_mwh) * 100, 1),
        "natural_gas_m3": 15420000.0,
        "diesel_liters": 14587300.0,
        "energy_intensity_mwh_per_unit": 5.61,
        "sources": [
            {"source": "Solar PPA (Offsite)", "mwh": 68400.0, "share_pct": 43.6, "carbon_intensity": 0.0},
            {"source": "State Grid (Thermal mix)", "mwh": 65320.0, "share_pct": 41.6, "carbon_intensity": 0.72},
            {"source": "Onsite Rooftop Solar", "mwh": 23300.0, "share_pct": 14.8, "carbon_intensity": 0.0}
        ],
        "fuels": [
            {"fuel": "Natural Gas (Furnaces)", "consumption": "15,420,000 m³", "emissions": 31148.4, "clean_alternative": "Electric Induction"},
            {"fuel": "High Speed Diesel (Generators)", "consumption": "7,200,000 L", "emissions": 19296.0, "clean_alternative": "Battery BESS Storage"},
            {"fuel": "Diesel Logistics Fleet", "consumption": "5,537,300 L", "emissions": 14840.4, "clean_alternative": "EV Commercial Trucks"}
        ]
    }

@router.get("/supplier-risk-matrix")
def get_supplier_risk_matrix(
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_current_user)
):
    """
    Supplier Intelligence 2x2 Risk Matrix:
    X-axis: Emissions Volume (tCO2e)
    Y-axis: Data Quality & Engagement Score (0-100)
    Quadrants: Critical, High Risk, Medium, Low
    """
    suppliers = [
        {"id": 1, "name": "ABC Metals Corp", "category": "Raw Steel & Forgings", "emissions": 42800.0, "engagement": 84, "data_quality": "High", "quadrant": "High Volume / High Engagement", "risk": "Medium", "reduction_status": "Decarb Plan Agreed"},
        {"id": 2, "name": "Vertex Chemical Corp", "category": "Industrial Lubricants", "emissions": 38500.0, "engagement": 38, "data_quality": "Low", "quadrant": "Critical Risk (High Volume, Low Engagement)", "risk": "Critical", "reduction_status": "No Response"},
        {"id": 3, "name": "Bharat Aluminum Ltd", "category": "Smelted Ingot", "emissions": 32000.0, "engagement": 88, "data_quality": "High", "quadrant": "High Volume / High Engagement", "risk": "Low", "reduction_status": "Hydro-Powered Smelting"},
        {"id": 4, "name": "Nordic Logistics SE", "category": "Global Distribution", "emissions": 24600.0, "engagement": 78, "data_quality": "High", "quadrant": "Medium Risk", "risk": "Medium", "reduction_status": "Biofuel Fleet Testing"},
        {"id": 5, "name": "Global Components Ltd", "category": "Precision CNC Parts", "emissions": 21400.0, "engagement": 48, "data_quality": "Medium", "quadrant": "High Risk", "risk": "High", "reduction_status": "Audit Pending"},
        {"id": 6, "name": "Delta Electronics Tech", "category": "PCB & Microchips", "emissions": 18200.0, "engagement": 72, "data_quality": "Medium", "quadrant": "Medium Risk", "risk": "Medium", "reduction_status": "Renewable Transition"},
        {"id": 7, "name": "Precision Polymers Pvt", "category": "Plastics & Resins", "emissions": 15600.0, "engagement": 92, "data_quality": "High", "quadrant": "Low Risk", "risk": "Low", "reduction_status": "Recycled Resin 40%"},
        {"id": 8, "name": "EuroCables GmbH", "category": "Copper Wiring", "emissions": 9400.0, "engagement": 65, "data_quality": "Medium", "quadrant": "Low Risk", "risk": "Low", "reduction_status": "Circular Copper Takeback"}
    ]

    return {
        "total_suppliers": len(suppliers),
        "total_supplier_emissions": sum(s["emissions"] for s in suppliers),
        "mean_engagement_score": round(sum(s["engagement"] for s in suppliers) / len(suppliers), 1),
        "critical_suppliers_count": sum(1 for s in suppliers if s["risk"] == "Critical"),
        "suppliers": suppliers
    }

@router.get("/ai-insights")
def get_ai_insights(
    year: int = Query(2026),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_current_user)
):
    """
    AI / Analytical Insights Panel (Rule-Based Environmental Telemetry Intelligence)
    """
    insights = [
        {
            "id": "ins-1",
            "severity": "critical",
            "title": "Scope 3 Dominates 63.3% of Total Enterprise Footprint",
            "metric": "305,600 tCO₂e",
            "explanation": "Purchased Goods & Services (Category 1) accounts for 46.6% of Scope 3 emissions, driven primarily by raw steel and virgin aluminum procurement.",
            "recommended_action": "Mandate recycled scrap minimums (35%) in 2027 supplier master service agreements to abate an estimated 18,400 tCO₂e.",
            "impact": "-18,400 tCO₂e",
            "badge": "Procurement Lever"
        },
        {
            "id": "ins-2",
            "severity": "high",
            "title": "Hyderabad Plant Natural Gas Combustion Spike",
            "metric": "31,148 tCO₂e (+4.8% vs Expected)",
            "explanation": "Stationary furnace thermal efficiency dropped 6.2% during Q2 high-temp forging cycles, consuming an extra 1.2M m³ of natural gas.",
            "recommended_action": "Perform waste-heat recovery economizer installation on Reheat Furnace #2 to recover 4,200 tCO₂e annually.",
            "impact": "-4,200 tCO₂e",
            "badge": "Operational Efficiency"
        },
        {
            "id": "ins-3",
            "severity": "medium",
            "title": "Supplier Risk Alert: Vertex Chemical Data Gap",
            "metric": "38,500 tCO₂e (Low Quality)",
            "explanation": "Vertex Chemical accounts for 18.9% of Tier-1 supply chain emissions but has not submitted verified carbon audit data for 2 consecutive quarters.",
            "recommended_action": "Issue formal compliance questionnaire under ISO 14064 supplier code of conduct with Dec 1 deadline.",
            "impact": "Data Assurance",
            "badge": "Compliance Gap"
        },
        {
            "id": "ins-4",
            "severity": "success",
            "title": "Bengaluru Campus Solar PPA Exceeds RE80 Target",
            "metric": "84.5% Renewable Electricity",
            "explanation": "Offsite 12 MW wind-solar hybrid PPA combined with rooftop PV enabled Bengaluru to achieve net-zero Scope 2 operational power during daytime peaks.",
            "recommended_action": "Replicate captive PPA model for Pune Manufacturing Unit by Q3 2027.",
            "impact": "-14,000 tCO₂e potential",
            "badge": "Success Benchmark"
        },
        {
            "id": "ins-5",
            "severity": "info",
            "title": "Product Eco-Design: DX-100 Motor Carbon Decoupling",
            "metric": "-12.0% YoY PCF",
            "explanation": "Replacing cast iron end-shields with recycled die-cast aluminum reduced cradle-to-gate footprint from 161.4 to 142.0 kgCO₂e per motor unit.",
            "recommended_action": "Standardize recycled aluminum alloy specification across DX-220 and DX-500 pump lines.",
            "impact": "-2,800 tCO₂e/yr",
            "badge": "Product Innovation"
        }
    ]

    return {
        "year": year,
        "insights_count": len(insights),
        "insights": insights
    }
