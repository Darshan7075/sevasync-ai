from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    ngo_name = Column(String, index=True)
    area = Column(String)
    city = Column(String)
    issue_type = Column(String)
    description = Column(Text)
    urgency = Column(String) # High, Medium, Low
    urgency_score = Column(Integer) # 1-10
    people_affected = Column(Integer)
    resource_needed = Column(String)
    status = Column(String, default="Pending") # Pending, Assigned, Resolved
    lat = Column(Float)
    lng = Column(Float)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    explanation = Column(Text) # Explainable AI reason

class Volunteer(Base):
    __tablename__ = "volunteers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    skill = Column(String)
    location = Column(String)
    availability = Column(String) # AM, PM, Full
    rating = Column(Float, default=5.0)
    tasks_completed = Column(Integer, default=0)
    contact = Column(String)

class NGO(Base):
    __tablename__ = "ngos"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    contact = Column(String)
    members = Column(Integer, default=0)
    location = Column(String)

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"))
    volunteer_id = Column(Integer, ForeignKey("volunteers.id"))
    status = Column(String, default="Active") # Active, Completed
    assigned_at = Column(DateTime, default=datetime.datetime.utcnow)

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)
    quantity = Column(Integer)
    location = Column(String)
    status = Column(String) # Available, Low, Empty

class Donor(Base):
    __tablename__ = "donors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    blood_group = Column(String)
    city = Column(String)
    availability = Column(String) # Available, Not Available
    last_donation_date = Column(String)
    contact = Column(String)

class BloodInventory(Base):
    __tablename__ = "blood_inventory"

    id = Column(Integer, primary_key=True, index=True)
    blood_group = Column(String, unique=True)
    units_available = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)

class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    value = Column(String)
    category = Column(String) # General, Security, Mission, etc.
