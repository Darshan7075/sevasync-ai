"""Unit tests for Pydantic schemas defined in schemas.py."""

import os
import sys
from datetime import datetime

import pytest
from pydantic import ValidationError

sys.path.insert(0, os.path.dirname(__file__))

import schemas


# ---------------------------------------------------------------------------
# ReportCreate / Report
# ---------------------------------------------------------------------------
class TestReportSchemas:
    VALID_REPORT = {
        "ngo_name": "TestNGO",
        "area": "Sector 7",
        "city": "Vadodara",
        "issue_type": "Fire",
        "description": "Building on fire.",
        "people_affected": 20,
        "resource_needed": "Water",
        "lat": 22.3,
        "lng": 73.2,
    }

    def test_valid_report_create(self):
        r = schemas.ReportCreate(**self.VALID_REPORT)
        assert r.area == "Sector 7"

    def test_report_create_optional_ngo_name(self):
        data = {**self.VALID_REPORT, "ngo_name": None}
        r = schemas.ReportCreate(**data)
        assert r.ngo_name is None

    def test_report_create_missing_required_field(self):
        data = {k: v for k, v in self.VALID_REPORT.items() if k != "city"}
        with pytest.raises(ValidationError):
            schemas.ReportCreate(**data)

    def test_report_schema_with_id_and_urgency(self):
        data = {
            **self.VALID_REPORT,
            "id": 1,
            "urgency": "High",
            "urgency_score": 9,
            "status": "Pending",
            "timestamp": datetime.now(),
            "explanation": "Critical",
        }
        r = schemas.Report(**data)
        assert r.id == 1
        assert r.urgency == "High"

    def test_report_explanation_optional(self):
        data = {
            **self.VALID_REPORT,
            "id": 1,
            "urgency": "Low",
            "urgency_score": 2,
            "status": "Pending",
            "timestamp": datetime.now(),
            "explanation": None,
        }
        r = schemas.Report(**data)
        assert r.explanation is None


# ---------------------------------------------------------------------------
# Volunteer
# ---------------------------------------------------------------------------
class TestVolunteerSchemas:
    VALID_VOLUNTEER = {
        "name": "Agent X",
        "skill": "Rescue",
        "location": "Mumbai",
        "availability": "Full",
        "rating": 4.5,
        "contact": "9999999999",
    }

    def test_valid_volunteer_base(self):
        v = schemas.VolunteerBase(**self.VALID_VOLUNTEER)
        assert v.name == "Agent X"

    def test_volunteer_schema_with_id(self):
        v = schemas.Volunteer(**self.VALID_VOLUNTEER, id=1, tasks_completed=5)
        assert v.tasks_completed == 5

    def test_missing_name_raises(self):
        data = {k: v for k, v in self.VALID_VOLUNTEER.items() if k != "name"}
        with pytest.raises(ValidationError):
            schemas.VolunteerBase(**data)


# ---------------------------------------------------------------------------
# NGO
# ---------------------------------------------------------------------------
class TestNGOSchemas:
    def test_valid_ngo(self):
        n = schemas.NGO(id=1, name="Relief Org", contact="info@org.com", members=50, location="Delhi")
        assert n.name == "Relief Org"

    def test_missing_contact_raises(self):
        with pytest.raises(ValidationError):
            schemas.NGOBase(name="Org", members=10, location="Delhi")


# ---------------------------------------------------------------------------
# Donor
# ---------------------------------------------------------------------------
class TestDonorSchemas:
    VALID_DONOR = {
        "name": "Rohan",
        "blood_group": "O+",
        "city": "Surat",
        "availability": "Available",
        "last_donation_date": "2024-03-15",
        "contact": "1234567890",
    }

    def test_valid_donor(self):
        d = schemas.Donor(**self.VALID_DONOR, id=1)
        assert d.blood_group == "O+"

    def test_donor_missing_blood_group(self):
        data = {k: v for k, v in self.VALID_DONOR.items() if k != "blood_group"}
        with pytest.raises(ValidationError):
            schemas.DonorBase(**data)


# ---------------------------------------------------------------------------
# Resource
# ---------------------------------------------------------------------------
class TestResourceSchemas:
    def test_valid_resource(self):
        r = schemas.Resource(id=1, type="Oxygen", quantity=50, location="WH-A")
        assert r.status == "Available"  # default

    def test_resource_custom_status(self):
        r = schemas.Resource(id=2, type="Food", quantity=0, location="WH-B", status="Empty")
        assert r.status == "Empty"

    def test_resource_create(self):
        rc = schemas.ResourceCreate(type="Medical", quantity=10, location="Clinic")
        assert rc.type == "Medical"


# ---------------------------------------------------------------------------
# BloodInventory
# ---------------------------------------------------------------------------
class TestBloodInventorySchema:
    def test_valid(self):
        bi = schemas.BloodInventory(
            blood_group="AB+", units_available=150, last_updated=datetime.now()
        )
        assert bi.units_available == 150


# ---------------------------------------------------------------------------
# SystemSetting
# ---------------------------------------------------------------------------
class TestSystemSettingSchemas:
    def test_default_category(self):
        s = schemas.SystemSettingBase(key="theme", value="dark")
        assert s.category == "General"

    def test_custom_category(self):
        s = schemas.SystemSetting(id=1, key="mode", value="tactical", category="Mission")
        assert s.category == "Mission"


# ---------------------------------------------------------------------------
# Chat
# ---------------------------------------------------------------------------
class TestChatSchemas:
    def test_chat_request(self):
        cr = schemas.ChatRequest(message="Hello")
        assert cr.message == "Hello"

    def test_chat_response(self):
        cr = schemas.ChatResponse(reply="Hi there")
        assert cr.reply == "Hi there"

    def test_chat_request_missing_message(self):
        with pytest.raises(ValidationError):
            schemas.ChatRequest()
