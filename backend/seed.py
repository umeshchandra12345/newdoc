import os
from database import engine, SessionLocal, Base
import models
from auth import hash_password

def seed_database():
    # Recreate tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("🌱 Seeding Nexgile-DecarbX database...")

        # 1. User
        demo_user = models.User(
            name="Aarav Sharma",
            email="demo@nexgile.com",
            password_hash=hash_password("demo123"),
            role="Sustainability Director"
        )
        db.add(demo_user)

        # 2. Organization
        org = models.Organization(
            name="Nexgile Industrial Systems"
        )
        db.add(org)
        db.flush()

        # 3. Facilities
        fac_hyd = models.Facility(name="Hyderabad Plant", location="Hyderabad, Telangana", organization_id=org.id)
        fac_pune = models.Facility(name="Pune Manufacturing Unit", location="Pune, Maharashtra", organization_id=org.id)
        fac_blr = models.Facility(name="Bengaluru Office", location="Bengaluru, Karnataka", organization_id=org.id)
        fac_chn = models.Facility(name="Chennai Warehouse", location="Chennai, Tamil Nadu", organization_id=org.id)
        
        db.add_all([fac_hyd, fac_pune, fac_blr, fac_chn])
        db.flush()

        # 4. Emission Factors
        ef1 = models.EmissionFactor(name="India CEA Grid Emission Factor", region="India National", unit="kWh", factor=0.72, year=2026)
        ef2 = models.EmissionFactor(name="Natural Gas Combustion", region="Global", unit="m³", factor=2.02, year=2026)
        ef3 = models.EmissionFactor(name="High Speed Diesel (HSD)", region="India", unit="Liters", factor=2.68, year=2026)
        ef4 = models.EmissionFactor(name="Refrigerant R-410A Fugitive", region="Global", unit="kg", factor=2088.0, year=2026)
        ef5 = models.EmissionFactor(name="Road Freight Diesel Truck", region="India", unit="t-km", factor=0.115, year=2026)
        db.add_all([ef1, ef2, ef3, ef4, ef5])

        # 5. Realistic Emissions Data (2026 baseline & historical)
        # Scope 1: Stationary Combustion, Mobile Combustion, Fleet, Fugitive Emissions (~74,210 tCO2e in 2026)
        scope1_records = [
            models.Emission(facility_id=fac_hyd.id, source="Natural Gas Furnaces", scope="Scope 1", category="Stationary Combustion", activity=15420000, unit="m³", emissions=31148.4, year=2026, status="Verified"),
            models.Emission(facility_id=fac_pune.id, source="Diesel Backup Generators", scope="Scope 1", category="Stationary Combustion", activity=7200000, unit="Liters", emissions=19296.0, year=2026, status="Verified"),
            models.Emission(facility_id=fac_pune.id, source="Heavy Logistics Fleet", scope="Scope 1", category="Fleet", activity=4800000, unit="Liters", emissions=12864.0, year=2026, status="Verified"),
            models.Emission(facility_id=fac_hyd.id, source="Internal Transport Forklifts", scope="Scope 1", category="Mobile Combustion", activity=1850000, unit="Liters", emissions=4958.0, year=2026, status="Verified"),
            models.Emission(facility_id=fac_blr.id, source="HVAC Chiller Refrigerant Top-up", scope="Scope 1", category="Fugitive Emissions", activity=1900, unit="kg", emissions=3967.2, year=2026, status="Verified"),
            models.Emission(facility_id=fac_chn.id, source="Warehouse Logistics Vans", scope="Scope 1", category="Fleet", activity=737300, unit="Liters", emissions=1976.4, year=2026, status="Verified"),
        ]
        db.add_all(scope1_records)

        # Scope 2: Electricity Consumption (~102,830 tCO2e in 2026)
        scope2_records = [
            models.Emission(facility_id=fac_hyd.id, source="Electricity Consumption", scope="Scope 2", category="Grid Electricity", activity=58200000, unit="kWh", emissions=41904.0, year=2026, status="Verified"),
            models.Emission(facility_id=fac_pune.id, source="Electricity Consumption", scope="Scope 2", category="Grid Electricity", activity=49500000, unit="kWh", emissions=35640.0, year=2026, status="Verified"),
            models.Emission(facility_id=fac_blr.id, source="Electricity Consumption", scope="Scope 2", category="Grid Electricity", activity=18200000, unit="kWh", emissions=13104.0, year=2026, status="Verified"),
            models.Emission(facility_id=fac_chn.id, source="Electricity Consumption", scope="Scope 2", category="Grid Electricity", activity=16920000, unit="kWh", emissions=12182.0, year=2026, status="Verified"),
        ]
        db.add_all(scope2_records)

        # Scope 3: All 15 GHG Protocol Categories (~305,600 tCO2e in 2026)
        scope3_categories = [
            ("Cat 1: Purchased Goods & Services", 142500.0, "Spend/LCA", "High"),
            ("Cat 2: Capital Goods", 38200.0, "Supplier Invoices", "Medium"),
            ("Cat 3: Fuel- & Energy-Related Activities", 21400.0, "Activity-based", "High"),
            ("Cat 4: Upstream Transportation", 26800.0, "Carrier Manifests", "Medium"),
            ("Cat 5: Waste Generated in Operations", 8400.0, "Waste Manifests", "High"),
            ("Cat 6: Business Travel", 4200.0, "Travel Agency API", "High"),
            ("Cat 7: Employee Commuting", 6100.0, "Employee Survey", "Medium"),
            ("Cat 8: Upstream Leased Assets", 3500.0, "Lease Area & Energy", "Medium"),
            ("Cat 9: Downstream Transportation", 15200.0, "Customer Logistics", "Medium"),
            ("Cat 10: Processing of Sold Products", 11800.0, "Industry Average", "Low"),
            ("Cat 11: Use of Sold Products", 18300.0, "Energy Consumption Model", "Medium"),
            ("Cat 12: End-of-Life of Sold Products", 5200.0, "Recyclability Estimates", "Medium"),
            ("Cat 13: Downstream Leased Assets", 1900.0, "Tenant Allocation", "Low"),
            ("Cat 14: Franchises", 1100.0, "Franchise Reports", "Low"),
            ("Cat 15: Investments", 1000.0, "Equity Share Accounting", "Medium")
        ]
        for name, val, src, dq in scope3_categories:
            db.add(models.Emission(
                facility_id=fac_hyd.id,
                source=src,
                scope="Scope 3",
                category=name,
                activity=val,
                unit="tCO2e",
                emissions=val,
                year=2026,
                status="Verified"
            ))

        # Add 2025 and 2024 emissions for trend & YoY calculations
        for yr, mult in [(2025, 1.09), (2024, 1.15), (2023, 1.20), (2022, 1.25)]:
            db.add(models.Emission(facility_id=fac_hyd.id, source="Stationary & Fleet", scope="Scope 1", category="Combustion", activity=74210 * mult, unit="tCO2e", emissions=round(74210 * mult, 1), year=yr, status="Verified"))
            db.add(models.Emission(facility_id=fac_pune.id, source="Facility Power", scope="Scope 2", category="Purchased Power", activity=102830 * mult, unit="tCO2e", emissions=round(102830 * mult, 1), year=yr, status="Verified"))
            db.add(models.Emission(facility_id=fac_hyd.id, source="Supply Chain Aggregate", scope="Scope 3", category="Value Chain", activity=305600 * mult, unit="tCO2e", emissions=round(305600 * mult, 1), year=yr, status="Verified"))

        # 6. Products
        products = [
            models.Product(name="Industrial Motor", sku="DX-100", category="Motors", carbon_footprint=142.0, change_pct=-12.0, status="Verified", materials_pct=56.0, manufacturing_pct=24.0, packaging_pct=7.0, transport_pct=9.0, end_of_life_pct=4.0),
            models.Product(name="High-Pressure Pump", sku="DX-220", category="Fluid Systems", carbon_footprint=98.0, change_pct=-8.4, status="Verified", materials_pct=52.0, manufacturing_pct=26.0, packaging_pct=8.0, transport_pct=10.0, end_of_life_pct=4.0),
            models.Product(name="Industrial Rotary Compressor", sku="DX-500", category="Heavy Machinery", carbon_footprint=310.0, change_pct=-5.2, status="Review", materials_pct=60.0, manufacturing_pct=20.0, packaging_pct=6.0, transport_pct=10.0, end_of_life_pct=4.0),
            models.Product(name="Smart Logic Control Unit", sku="DX-800", category="Electronics", carbon_footprint=45.0, change_pct=-14.1, status="Verified", materials_pct=42.0, manufacturing_pct=34.0, packaging_pct=10.0, transport_pct=10.0, end_of_life_pct=4.0),
            models.Product(name="Pneumatic Actuator Valve", sku="DX-150", category="Valves", carbon_footprint=76.0, change_pct=-6.8, status="Verified", materials_pct=58.0, manufacturing_pct=22.0, packaging_pct=8.0, transport_pct=8.0, end_of_life_pct=4.0),
            models.Product(name="Thermal Heat Exchanger", sku="DX-400", category="Thermal", carbon_footprint=240.0, change_pct=-9.5, status="Verified", materials_pct=64.0, manufacturing_pct=18.0, packaging_pct=5.0, transport_pct=9.0, end_of_life_pct=4.0),
        ]
        db.add_all(products)

        # 7. Suppliers
        suppliers = [
            models.Supplier(name="ABC Metals Corp", region="India", category="Steel & Forgings", emissions=28400.0, data_quality="High", engagement=82, status="Active"),
            models.Supplier(name="Global Components Ltd", region="Germany", category="Precision Components", emissions=19200.0, data_quality="Medium", engagement=64, status="Needs Data"),
            models.Supplier(name="Precision Polymers Pvt", region="India", category="Plastics & Resins", emissions=14800.0, data_quality="High", engagement=90, status="Active"),
            models.Supplier(name="Nordic Logistics SE", region="Sweden", category="Freight & Distribution", emissions=22100.0, data_quality="High", engagement=78, status="Active"),
            models.Supplier(name="Delta Electronics Tech", region="Taiwan", category="Semiconductors & PCBs", emissions=17500.0, data_quality="Medium", engagement=71, status="Active"),
            models.Supplier(name="Vertex Chemical Corp", region="USA", category="Industrial Lubricants", emissions=31000.0, data_quality="Low", engagement=45, status="Needs Review"),
            models.Supplier(name="Bharat Aluminum Ltd", region="India", category="Raw Smelted Aluminum", emissions=26300.0, data_quality="High", engagement=85, status="Active"),
            models.Supplier(name="EuroCables GmbH", region="Germany", category="Electrical Wiring", emissions=8900.0, data_quality="Medium", engagement=62, status="Active"),
        ]
        db.add_all(suppliers)

        # 8. Reduction Initiatives
        initiatives = [
            models.ReductionInitiative(name="Renewable Electricity (Solar PPA)", reduction=18400.0, investment="₹12.0 Cr", roi=24.0, status="In Progress"),
            models.ReductionInitiative(name="Boiler Electrification & Heat Pumps", reduction=12200.0, investment="₹8.5 Cr", roi=19.5, status="In Progress"),
            models.ReductionInitiative(name="Fleet Electrification (EV Trucks & Vans)", reduction=6800.0, investment="₹4.2 Cr", roi=28.0, status="Planned"),
            models.ReductionInitiative(name="Low-Carbon Recycled Steel Sourcing", reduction=14500.0, investment="₹5.0 Cr", roi=32.0, status="In Progress"),
            models.ReductionInitiative(name="AI-Driven HVAC & Chiller Optimization", reduction=5100.0, investment="₹2.1 Cr", roi=41.0, status="Completed"),
            models.ReductionInitiative(name="Circular Packaging & Zero-Waste", reduction=3400.0, investment="₹1.8 Cr", roi=22.0, status="Planned"),
        ]
        db.add_all(initiatives)

        # 9. Regulatory Reports
        regulatory = [
            models.RegulatoryReport(framework="CSRD / ESRS", completion=78, status="On Track", year=2026),
            models.RegulatoryReport(framework="CBAM", completion=64, status="Action Required", year=2026),
            models.RegulatoryReport(framework="TCFD", completion=82, status="Compliant", year=2026),
            models.RegulatoryReport(framework="EU Taxonomy", completion=71, status="On Track", year=2026),
            models.RegulatoryReport(framework="SEC Climate Disclosures", completion=60, status="Action Required", year=2026),
            models.RegulatoryReport(framework="CDP Climate Change", completion=74, status="On Track", year=2026),
        ]
        db.add_all(regulatory)

        db.commit()
        print("✅ Database successfully seeded with rich realistic demo data!")
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
