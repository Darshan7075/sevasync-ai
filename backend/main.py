from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, Security
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from enum import Enum
import datetime
import os

import models, schemas, database, ai_engine
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SevaSync AI API")

ALLOWED_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "https://sevasync-ai.vercel.app,http://localhost:5173,http://localhost:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API-key guard for destructive endpoints ---
_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

def require_api_key(api_key: str = Security(_api_key_header)):
    """Reject the request when an API key is configured but not provided/matched."""
    expected = os.getenv("SEVASYNC_API_KEY")
    if expected and api_key != expected:
        raise HTTPException(status_code=403, detail="Invalid or missing API key")


class ReportStatus(str, Enum):
    pending = "Pending"
    assigned = "Assigned"
    resolved = "Resolved"

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        import json
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                pass

manager = ConnectionManager()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast({
                "sender": client_id,
                "event": "notification",
                "message": data
            })
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
def read_root():

    return {"message": "SevaSync AI Backend Active"}

@app.post("/chat", response_model=schemas.ChatResponse)
def chat_with_command(req: schemas.ChatRequest):
    reply = ai_engine.AIEngine.chat_response(req.message)
    return {"reply": reply}

@app.get("/reports", response_model=List[schemas.Report])
def get_reports(db: Session = Depends(get_db)):
    return db.query(models.Report).all()

@app.post("/reports", response_model=schemas.Report)
def create_report(report: schemas.ReportCreate, db: Session = Depends(get_db)):
    # AI Processing
    level, score, explanation = ai_engine.AIEngine.calculate_urgency(report.description, report.people_affected)
    
    db_report = models.Report(
        **report.dict(),
        urgency=level,
        urgency_score=score,
        explanation=explanation,
        status="Pending",
        timestamp=datetime.datetime.now()
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

@app.get("/volunteers", response_model=List[schemas.Volunteer])
def get_volunteers(db: Session = Depends(get_db)):
    return db.query(models.Volunteer).all()

@app.post("/volunteers", response_model=schemas.Volunteer)
def create_volunteer(volunteer: schemas.VolunteerBase, db: Session = Depends(get_db)):
    db_volunteer = models.Volunteer(**volunteer.dict())
    db.add(db_volunteer)
    db.commit()
    db.refresh(db_volunteer)
    return db_volunteer

@app.post("/assign/{report_id}/{volunteer_id}")
def assign_volunteer(report_id: int, volunteer_id: int, db: Session = Depends(get_db)):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    assignment = models.Assignment(report_id=report_id, volunteer_id=volunteer_id)
    report.status = "Assigned"
    
    db.add(assignment)
    db.commit()
    return {"message": "Success", "assignment_id": assignment.id}

@app.patch("/reports/{report_id}/status")
def update_report_status(report_id: int, status: ReportStatus, db: Session = Depends(get_db)):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = status.value
    db.commit()
    db.refresh(report)
    return report

@app.delete("/reports/{report_id}")
def delete_report(report_id: int, db: Session = Depends(get_db), _key: str = Depends(require_api_key)):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    db.delete(report)
    db.commit()
    return {"message": "Report deleted successfully"}

@app.get("/analytics/stats")
def get_stats(db: Session = Depends(get_db)):
    total_reports = db.query(models.Report).count()
    high_urgency = db.query(models.Report).filter(models.Report.urgency == "High").count()
    active_volunteers = db.query(models.Volunteer).count()
    people_helped = db.query(models.Report).filter(models.Report.status == "Resolved").count() * 20 # Mock calculation
    
    return {
        "totalReports": total_reports,
        "highUrgency": high_urgency,
        "activeVolunteers": active_volunteers,
        "peopleHelped": people_helped
    }
@app.get("/blood/donors", response_model=List[schemas.Donor])
def get_donors(db: Session = Depends(get_db)):
    return db.query(models.Donor).all()

@app.get("/blood/inventory")
def get_blood_inventory(db: Session = Depends(get_db)):
    return db.query(models.BloodInventory).all()

@app.get("/resources", response_model=List[schemas.Resource])
def get_resources(db: Session = Depends(get_db)):
    return db.query(models.Resource).all()

@app.post("/resources", response_model=schemas.Resource)
def create_resource(resource: schemas.ResourceCreate, db: Session = Depends(get_db)):
    db_resource = models.Resource(**resource.dict())
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource

@app.patch("/resources/{resource_id}/restock")
def restock_resource(resource_id: int, quantity: int, db: Session = Depends(get_db)):
    db_resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not db_resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    db_resource.quantity += quantity
    db.commit()
    db.refresh(db_resource)
    return db_resource

@app.patch("/resources/{resource_id}/dispatch")
def dispatch_resource(resource_id: int, quantity: int, db: Session = Depends(get_db), _key: str = Depends(require_api_key)):
    db_resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not db_resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    if db_resource.quantity < quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    db_resource.quantity -= quantity
    db.commit()
    db.refresh(db_resource)
    return db_resource

@app.post("/blood/donate/{donor_id}")
def record_donation(donor_id: int, units: int, db: Session = Depends(get_db)):
    donor = db.query(models.Donor).filter(models.Donor.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")
    
    inventory = db.query(models.BloodInventory).filter(models.BloodInventory.blood_group == donor.blood_group).first()
    if not inventory:
        inventory = models.BloodInventory(blood_group=donor.blood_group, units_available=0)
        db.add(inventory)
    
    inventory.units_available += units
    db.commit()
    return {"message": "Success", "new_total": inventory.units_available}

@app.get("/settings", response_model=List[schemas.SystemSetting])
def get_settings(db: Session = Depends(get_db)):
    return db.query(models.SystemSetting).all()

@app.post("/settings", response_model=schemas.SystemSetting)
def update_setting(setting: schemas.SystemSettingBase, db: Session = Depends(get_db), _key: str = Depends(require_api_key)):
    db_setting = db.query(models.SystemSetting).filter(models.SystemSetting.key == setting.key).first()
    if db_setting:
        db_setting.value = setting.value
        db_setting.category = setting.category
    else:
        db_setting = models.SystemSetting(**setting.dict())
        db.add(db_setting)
    db.commit()
    db.refresh(db_setting)
    return db_setting

# Trigger reload
