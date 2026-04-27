from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ReportBase(BaseModel):
    ngo_name: Optional[str]
    area: str
    city: str
    issue_type: str
    description: str
    people_affected: int
    resource_needed: str
    lat: float
    lng: float

class ReportCreate(ReportBase):
    pass

class Report(ReportBase):
    id: int
    urgency: str
    urgency_score: int
    status: str
    timestamp: datetime
    explanation: Optional[str]

    class Config:
        from_attributes = True

class VolunteerBase(BaseModel):
    name: str
    skill: str
    location: str
    availability: str
    rating: float
    contact: str

class Volunteer(VolunteerBase):
    id: int
    tasks_completed: int

    class Config:
        from_attributes = True

class NGOBase(BaseModel):
    name: str
    contact: str
    members: int
    location: str

class NGO(NGOBase):
    id: int

    class Config:
        from_attributes = True

class DonorBase(BaseModel):
    name: str
    blood_group: str
    city: str
    availability: str
    last_donation_date: str
    contact: str

class Donor(DonorBase):
    id: int

    class Config:
        from_attributes = True

class BloodInventory(BaseModel):
    blood_group: str
    units_available: int
    last_updated: datetime

    class Config:
        from_attributes = True

class ResourceBase(BaseModel):
    type: str
    quantity: int
    location: str
    status: Optional[str] = "Available"

class ResourceCreate(ResourceBase):
    pass

class Resource(ResourceBase):
    id: int

    class Config:
        from_attributes = True

class SystemSettingBase(BaseModel):
    key: str
    value: str
    category: Optional[str] = "General"

class SystemSetting(SystemSettingBase):
    id: int

    class Config:
        from_attributes = True
