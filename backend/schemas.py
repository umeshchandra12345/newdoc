from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any

# Auth Schemas
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None

# Facility Schemas
class FacilityResponse(BaseModel):
    id: int
    name: str
    location: str

    class Config:
        from_attributes = True

# Emission Schemas
class EmissionBase(BaseModel):
    facility_id: int
    source: str
    scope: str
    category: str
    activity: float
    unit: str
    emissions: float
    year: int
    status: str = "Verified"

class EmissionCreate(EmissionBase):
    pass

class EmissionUpdate(BaseModel):
    facility_id: Optional[int] = None
    source: Optional[str] = None
    scope: Optional[str] = None
    category: Optional[str] = None
    activity: Optional[float] = None
    unit: Optional[str] = None
    emissions: Optional[float] = None
    year: Optional[int] = None
    status: Optional[str] = None

class EmissionResponse(EmissionBase):
    id: int
    facility_name: Optional[str] = None

    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    sku: str
    category: str
    carbon_footprint: float
    change_pct: float = 0.0
    status: str = "Verified"
    materials_pct: float = 54.0
    manufacturing_pct: float = 22.0
    packaging_pct: float = 8.0
    transport_pct: float = 11.0
    end_of_life_pct: float = 5.0

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    carbon_footprint: Optional[float] = None
    change_pct: Optional[float] = None
    status: Optional[str] = None

class ProductResponse(ProductBase):
    id: int

    class Config:
        from_attributes = True

# Supplier Schemas
class SupplierResponse(BaseModel):
    id: int
    name: str
    region: str
    category: str
    emissions: float
    data_quality: str
    engagement: int
    status: str

    class Config:
        from_attributes = True

# Reduction Schemas
class ReductionInitiativeBase(BaseModel):
    name: str
    reduction: float
    investment: str
    roi: float
    status: str = "In Progress"

class ReductionInitiativeCreate(ReductionInitiativeBase):
    pass

class ReductionInitiativeResponse(ReductionInitiativeBase):
    id: int

    class Config:
        from_attributes = True

# Regulatory Schemas
class RegulatoryReportResponse(BaseModel):
    id: int
    framework: str
    completion: int
    status: str
    year: int

    class Config:
        from_attributes = True
