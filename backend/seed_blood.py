from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import datetime

# Create tables
models.Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    
    # 1. Seed Blood Inventory
    groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
    for group in groups:
        exists = db.query(models.BloodInventory).filter(models.BloodInventory.blood_group == group).first()
        if not exists:
            inventory = models.BloodInventory(blood_group=group, units_available=150)
            db.add(inventory)
    
    # 2. Seed Blood Donors
    if db.query(models.Donor).count() == 0:
        donors = [
            models.Donor(name="Rohan Patel", blood_group="AB+", city="Vadodara", availability="Available", last_donation_date="2024-03-15", contact="9876543210"),
            models.Donor(name="Priya Shah", blood_group="O-", city="Surat", availability="Available", last_donation_date="2024-02-10", contact="9876543211"),
            models.Donor(name="Amit Singh", blood_group="O+", city="Rajkot", availability="Available", last_donation_date="2024-04-01", contact="9876543212"),
            models.Donor(name="Neha Desai", blood_group="B+", city="Ahmedabad", availability="Available", last_donation_date="2024-01-20", contact="9876543213"),
        ]
        db.add_all(donors)

    # 3. Seed Reports (Cases)
    if db.query(models.Report).count() == 0:
        reports = [
            models.Report(
                ngo_name="SevaSync Central",
                area="Sayajigunj",
                city="Vadodara",
                issue_type="Medical Emergency",
                description="Urgent requirement for oxygen and medical assistance at Sector 7.",
                urgency="High",
                urgency_score=9,
                people_affected=15,
                resource_needed="Oxygen",
                status="Pending",
                lat=22.3072,
                lng=73.1812,
                explanation="High urgency due to medical emergency keywords and impact on 15 people.",
                timestamp=datetime.datetime.utcnow()
            ),
            models.Report(
                ngo_name="SevaSync Central",
                area="Adajan",
                city="Surat",
                issue_type="Food Shortage",
                description="Community kitchen needs raw materials for 100+ people.",
                urgency="Medium",
                urgency_score=6,
                people_affected=120,
                resource_needed="Ration",
                status="Assigned",
                lat=21.1702,
                lng=72.8311,
                explanation="Medium urgency due to high scale of affected people (120).",
                timestamp=datetime.datetime.utcnow()
            )
        ]
        db.add_all(reports)
    
    db.commit()
    db.close()
    print("✅ SYSTEM SEED COMPLETE: Blood and Case data inserted.")

if __name__ == "__main__":
    seed()
