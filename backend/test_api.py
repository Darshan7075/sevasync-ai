"""Unit tests for the FastAPI endpoints defined in main.py."""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))


# ---------------------------------------------------------------------------
# Root
# ---------------------------------------------------------------------------
class TestRootEndpoint:
    def test_root_returns_active_message(self, client):
        resp = client.get("/")
        assert resp.status_code == 200
        assert resp.json()["message"] == "SevaSync AI Backend Active"


# ---------------------------------------------------------------------------
# Reports CRUD
# ---------------------------------------------------------------------------
class TestReportsEndpoints:
    REPORT_PAYLOAD = {
        "ngo_name": "TestNGO",
        "area": "Sector 7",
        "city": "Vadodara",
        "issue_type": "Fire",
        "description": "Emergency fire in building.",
        "people_affected": 20,
        "resource_needed": "Water",
        "lat": 22.3,
        "lng": 73.2,
    }

    def test_create_report(self, client):
        resp = client.post("/reports", json=self.REPORT_PAYLOAD)
        assert resp.status_code == 200
        data = resp.json()
        assert data["ngo_name"] == "TestNGO"
        assert data["status"] == "Pending"
        assert "urgency" in data
        assert "urgency_score" in data
        assert "explanation" in data
        assert data["id"] is not None

    def test_get_reports_empty(self, client):
        resp = client.get("/reports")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_get_reports_after_creation(self, client):
        client.post("/reports", json=self.REPORT_PAYLOAD)
        resp = client.get("/reports")
        assert resp.status_code == 200
        assert len(resp.json()) == 1

    def test_delete_report(self, client):
        create_resp = client.post("/reports", json=self.REPORT_PAYLOAD)
        report_id = create_resp.json()["id"]
        resp = client.delete(f"/reports/{report_id}")
        assert resp.status_code == 200
        assert "deleted" in resp.json()["message"].lower()

    def test_delete_report_not_found(self, client):
        resp = client.delete("/reports/9999")
        assert resp.status_code == 404

    def test_update_report_status(self, client):
        create_resp = client.post("/reports", json=self.REPORT_PAYLOAD)
        report_id = create_resp.json()["id"]
        resp = client.patch(
            f"/reports/{report_id}/status", params={"status": "Resolved"}
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "Resolved"

    def test_update_report_status_not_found(self, client):
        resp = client.patch("/reports/9999/status", params={"status": "Resolved"})
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Volunteers
# ---------------------------------------------------------------------------
class TestVolunteerEndpoints:
    VOLUNTEER_PAYLOAD = {
        "name": "Test Volunteer",
        "skill": "Medical",
        "location": "Vadodara",
        "availability": "Full",
        "rating": 4.5,
        "contact": "9876543210",
    }

    def test_create_volunteer(self, client):
        resp = client.post("/volunteers", json=self.VOLUNTEER_PAYLOAD)
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "Test Volunteer"
        assert data["tasks_completed"] == 0

    def test_get_volunteers_empty(self, client):
        resp = client.get("/volunteers")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_get_volunteers_after_creation(self, client):
        client.post("/volunteers", json=self.VOLUNTEER_PAYLOAD)
        resp = client.get("/volunteers")
        assert resp.status_code == 200
        assert len(resp.json()) == 1


# ---------------------------------------------------------------------------
# Assignment
# ---------------------------------------------------------------------------
class TestAssignmentEndpoints:
    def _seed(self, client):
        r = client.post(
            "/reports",
            json={
                "ngo_name": "NGO",
                "area": "A",
                "city": "C",
                "issue_type": "Fire",
                "description": "emergency fire",
                "people_affected": 10,
                "resource_needed": "Water",
                "lat": 0.0,
                "lng": 0.0,
            },
        )
        report_id = r.json()["id"]
        v = client.post(
            "/volunteers",
            json={
                "name": "V",
                "skill": "Rescue",
                "location": "L",
                "availability": "Full",
                "rating": 5.0,
                "contact": "123",
            },
        )
        volunteer_id = v.json()["id"]
        return report_id, volunteer_id

    def test_assign_volunteer(self, client):
        rid, vid = self._seed(client)
        resp = client.post(f"/assign/{rid}/{vid}")
        assert resp.status_code == 200
        assert "assignment_id" in resp.json()

    def test_assign_updates_report_status(self, client):
        rid, vid = self._seed(client)
        client.post(f"/assign/{rid}/{vid}")
        report = client.get("/reports").json()[0]
        assert report["status"] == "Assigned"

    def test_assign_report_not_found(self, client):
        _, vid = self._seed(client)
        resp = client.post(f"/assign/9999/{vid}")
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Analytics
# ---------------------------------------------------------------------------
class TestAnalyticsEndpoints:
    def test_stats_empty_db(self, client):
        resp = client.get("/analytics/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert data["totalReports"] == 0
        assert data["highUrgency"] == 0
        assert data["activeVolunteers"] == 0
        assert data["peopleHelped"] == 0

    def test_stats_counts_reports(self, client):
        client.post(
            "/reports",
            json={
                "ngo_name": "N",
                "area": "A",
                "city": "C",
                "issue_type": "T",
                "description": "general description",
                "people_affected": 1,
                "resource_needed": "R",
                "lat": 0.0,
                "lng": 0.0,
            },
        )
        resp = client.get("/analytics/stats")
        assert resp.json()["totalReports"] == 1


# ---------------------------------------------------------------------------
# Blood Donors & Inventory
# ---------------------------------------------------------------------------
class TestBloodEndpoints:
    def test_get_donors_empty(self, client):
        resp = client.get("/blood/donors")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_get_blood_inventory_empty(self, client):
        resp = client.get("/blood/inventory")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_record_donation_not_found(self, client):
        resp = client.post("/blood/donate/9999", params={"units": 5})
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Resources
# ---------------------------------------------------------------------------
class TestResourceEndpoints:
    RESOURCE_PAYLOAD = {
        "type": "Oxygen",
        "quantity": 100,
        "location": "Warehouse A",
        "status": "Available",
    }

    def test_create_resource(self, client):
        resp = client.post("/resources", json=self.RESOURCE_PAYLOAD)
        assert resp.status_code == 200
        assert resp.json()["type"] == "Oxygen"

    def test_get_resources_empty(self, client):
        resp = client.get("/resources")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_restock_resource(self, client):
        r = client.post("/resources", json=self.RESOURCE_PAYLOAD)
        rid = r.json()["id"]
        resp = client.patch(f"/resources/{rid}/restock", params={"quantity": 50})
        assert resp.status_code == 200
        assert resp.json()["quantity"] == 150

    def test_restock_not_found(self, client):
        resp = client.patch("/resources/9999/restock", params={"quantity": 10})
        assert resp.status_code == 404

    def test_dispatch_resource(self, client):
        r = client.post("/resources", json=self.RESOURCE_PAYLOAD)
        rid = r.json()["id"]
        resp = client.patch(f"/resources/{rid}/dispatch", params={"quantity": 30})
        assert resp.status_code == 200
        assert resp.json()["quantity"] == 70

    def test_dispatch_insufficient_stock(self, client):
        r = client.post("/resources", json=self.RESOURCE_PAYLOAD)
        rid = r.json()["id"]
        resp = client.patch(f"/resources/{rid}/dispatch", params={"quantity": 999})
        assert resp.status_code == 400
        assert "insufficient" in resp.json()["detail"].lower()

    def test_dispatch_not_found(self, client):
        resp = client.patch("/resources/9999/dispatch", params={"quantity": 1})
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------
class TestSettingsEndpoints:
    def test_get_settings_empty(self, client):
        resp = client.get("/settings")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_create_setting(self, client):
        resp = client.post(
            "/settings",
            json={"key": "theme", "value": "dark", "category": "General"},
        )
        assert resp.status_code == 200
        assert resp.json()["key"] == "theme"

    def test_update_existing_setting(self, client):
        client.post(
            "/settings",
            json={"key": "theme", "value": "dark", "category": "General"},
        )
        resp = client.post(
            "/settings",
            json={"key": "theme", "value": "light", "category": "General"},
        )
        assert resp.status_code == 200
        assert resp.json()["value"] == "light"

    def test_settings_list_after_creation(self, client):
        client.post(
            "/settings",
            json={"key": "mode", "value": "tactical", "category": "Mission"},
        )
        resp = client.get("/settings")
        assert len(resp.json()) == 1


# ---------------------------------------------------------------------------
# Chat
# ---------------------------------------------------------------------------
class TestChatEndpoint:
    def test_chat_returns_reply(self, client):
        resp = client.post("/chat", json={"message": "Hello"})
        assert resp.status_code == 200
        assert "reply" in resp.json()
        assert len(resp.json()["reply"]) > 0

    def test_chat_emergency_message(self, client):
        resp = client.post("/chat", json={"message": "SOS we need help"})
        assert resp.status_code == 200
        assert len(resp.json()["reply"]) > 0
