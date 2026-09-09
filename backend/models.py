from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="Sustainability Lead")

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)

    facilities = relationship("Facility", back_populates="organization", cascade="all, delete-orphan")

class Facility(Base):
    __tablename__ = "facilities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    location = Column(String(100), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)

    organization = relationship("Organization", back_populates="facilities")
    emissions = relationship("Emission", back_populates="facility", cascade="all, delete-orphan")

class Emission(Base):
    __tablename__ = "emissions"

    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id"), nullable=False)
    source = Column(String(150), nullable=False) # e.g. Electricity, Natural Gas, Diesel Generator, Fleet
    scope = Column(String(50), nullable=False)  # "Scope 1", "Scope 2", "Scope 3"
    category = Column(String(100), nullable=False) # e.g. Stationary Combustion, Electricity, Purchased Goods
    activity = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False) # kWh, Liters, tonnes, etc.
    emissions = Column(Float, nullable=False) # in tCO2e
    year = Column(Integer, nullable=False, index=True)
    status = Column(String(50), default="Verified") # Verified, Pending, Review

    facility = relationship("Facility", back_populates="emissions")

class EmissionFactor(Base):
    __tablename__ = "emission_factors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    region = Column(String(100), nullable=False)
    unit = Column(String(50), nullable=False)
    factor = Column(Float, nullable=False) # e.g. kg CO2e / unit
    year = Column(Integer, nullable=False)

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    sku = Column(String(50), unique=True, index=True, nullable=False)
    category = Column(String(100), nullable=False)
    carbon_footprint = Column(Float, nullable=False) # kgCO2e/unit
    change_pct = Column(Float, default=0.0) # YoY change e.g. -12.0
    status = Column(String(50), default="Verified")
    materials_pct = Column(Float, default=54.0)
    manufacturing_pct = Column(Float, default=22.0)
    packaging_pct = Column(Float, default=8.0)
    transport_pct = Column(Float, default=11.0)
    end_of_life_pct = Column(Float, default=5.0)

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    region = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False)
    emissions = Column(Float, nullable=False) # tCO2e
    data_quality = Column(String(50), nullable=False) # High, Medium, Low
    engagement = Column(Integer, nullable=False) # 0-100%
    status = Column(String(50), default="Active")

class ReductionInitiative(Base):
    __tablename__ = "reduction_initiatives"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    reduction = Column(Float, nullable=False) # tCO2e
    investment = Column(String(50), nullable=False) # e.g. "₹12 Cr"
    roi = Column(Float, nullable=False) # ROI %
    status = Column(String(50), default="In Progress") # Completed, In Progress, Planned

class RegulatoryReport(Base):
    __tablename__ = "regulatory_reports"

    id = Column(Integer, primary_key=True, index=True)
    framework = Column(String(100), nullable=False) # CSRD / ESRS, CBAM, TCFD, EU Taxonomy, SEC Climate, CDP
    completion = Column(Integer, nullable=False) # 0 - 100%
    status = Column(String(50), default="Compliant") # Compliant, On Track, Action Required
    year = Column(Integer, nullable=False)
