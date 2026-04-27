import csv
import os
from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine
from backend import models

def seed_data():
    db = SessionLocal()
    
    # Paths to CSV files
    dashboard_public = os.path.join("sevasync-dashboard", "public")
    
    # Seed Reports
    reports_path = os.path.join(dashboard_public, "community_reports_1000.csv")
    if os.path.exists(reports_path):
        with open(reports_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in list(reader)[:100]: # Seed first 100 for dev
                score = int(row.get('urgency_score', 0))
                urgency = "Low"
                if score >= 8: urgency = "High"
                elif score >= 5: urgency = "Medium"
                
                db_report = models.Report(
                    ngo_name=row.get('ngo_name', 'Global Relief'),
                    area=row.get('area_name'),
                    city=row.get('city', 'Bhopal'),
                    issue_type=row.get('issue_type'),
                    description=row.get('description'),
                    urgency=urgency,
                    urgency_score=score,
                    people_affected=int(row.get('people_affected', 0)),
                    resource_needed=row.get('resource_needed', 'General'),
                    lat=float(row.get('latitude', 23.0)),
                    lng=float(row.get('longitude', 77.0)),
                    status="Pending",
                    explanation="Imported from legacy community data."
                )
                db.add(db_report)
    
    # Seed Volunteers
    volunteers_path = os.path.join(dashboard_public, "volunteers_1000.csv")
    if os.path.exists(volunteers_path):
        with open(volunteers_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in list(reader)[:50]:
                db_volunteer = models.Volunteer(
                    name=f"Volunteer {row.get('volunteer_id')}",
                    skill=row.get('skill', 'General'),
                    location=row.get('location', 'Unknown'),
                    availability=row.get('available_time', 'Full'),
                    rating=float(row.get('rating_reliability', 5.0)),
                    contact=f"+91-{row.get('volunteer_id')}000"
                )
                db.add(db_volunteer)
    
    db.commit()
    db.close()
    print("Database Seeded Successfully!")

if __name__ == "__main__":
    models.Base.metadata.create_all(bind=engine)
    seed_data()
