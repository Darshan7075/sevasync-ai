from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List
import datetime
import logging

import models, schemas, database, ai_engine
from database import engine, get_db

logger = logging.getLogger(__name__)

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SevaSync AI API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.warning("Failed to send WebSocket message: %s", e)
                disconnected.append(connection)
        for connection in disconnected:
            self.active_connections.remove(connection)

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
    try:
        level, score, explanation = ai_engine.AIEngine.calculate_urgency(report.description, report.people_affected)
    except Exception as e:
        logger.error("AI urgency calculation failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to process report urgency")
    
    db_report = models.Report(
        **report.dict(),
        urgency=level,
        urgency_score=score,
        explanation=explanation,
        status="Pending",
        timestamp=datetime.datetime.now()
    )
    db.add(db_report)
    try:
        db.commit()
        db.refresh(db_report)
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("Database error creating report: %s", e)
        raise HTTPException(status_code=500, detail="Failed to save report")
    return db_report

@app.get("/volunteers", response_model=List[schemas.Volunteer])
def get_volunteers(db: Session = Depends(get_db)):
    return db.query(models.Volunteer).all()

@app.post("/volunteers", response_model=schemas.Volunteer)
def create_volunteer(volunteer: schemas.VolunteerBase, db: Session = Depends(get_db)):
    db_volunteer = models.Volunteer(**volunteer.dict())
    db.add(db_volunteer)
    try:
        db.commit()
        db.refresh(db_volunteer)
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("Database error creating volunteer: %s", e)
        raise HTTPException(status_code=500, detail="Failed to save volunteer")
    return db_volunteer

@app.post("/assign/{report_id}/{volunteer_id}")
def assign_volunteer(report_id: int, volunteer_id: int, db: Session = Depends(get_db)):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    volunteer = db.query(models.Volunteer).filter(models.Volunteer.id == volunteer_id).first()
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    
    assignment = models.Assignment(report_id=report_id, volunteer_id=volunteer_id)
    report.status = "Assigned"
    
    db.add(assignment)
    try:
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("Database error creating assignment: %s", e)
        raise HTTPException(status_code=500, detail="Failed to create assignment")
    return {"message": "Success", "assignment_id": assignment.id}

@app.patch("/reports/{report_id}/status")
def update_report_status(report_id: int, status: str, db: Session = Depends(get_db)):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = status
    db.commit()
    db.refresh(report)
    return report

@app.delete("/reports/{report_id}")
def delete_report(report_id: int, db: Session = Depends(get_db)):
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
    try:
        db.commit()
        db.refresh(db_resource)
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("Database error creating resource: %s", e)
        raise HTTPException(status_code=500, detail="Failed to save resource")
    return db_resource

@app.patch("/resources/{resource_id}/restock")
def restock_resource(resource_id: int, quantity: int, db: Session = Depends(get_db)):
    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be positive")
    db_resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not db_resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    db_resource.quantity += quantity
    try:
        db.commit()
        db.refresh(db_resource)
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("Database error restocking resource: %s", e)
        raise HTTPException(status_code=500, detail="Failed to restock resource")
    return db_resource

@app.patch("/resources/{resource_id}/dispatch")
def dispatch_resource(resource_id: int, quantity: int, db: Session = Depends(get_db)):
    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be positive")
    db_resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not db_resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    if db_resource.quantity < quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    db_resource.quantity -= quantity
    try:
        db.commit()
        db.refresh(db_resource)
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("Database error dispatching resource: %s", e)
        raise HTTPException(status_code=500, detail="Failed to dispatch resource")
    return db_resource

@app.post("/blood/donate/{donor_id}")
def record_donation(donor_id: int, units: int, db: Session = Depends(get_db)):
    if units <= 0:
        raise HTTPException(status_code=400, detail="Units must be positive")
    donor = db.query(models.Donor).filter(models.Donor.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")
    
    inventory = db.query(models.BloodInventory).filter(models.BloodInventory.blood_group == donor.blood_group).first()
    if not inventory:
        inventory = models.BloodInventory(blood_group=donor.blood_group, units_available=0)
        db.add(inventory)
    
    inventory.units_available += units
    try:
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("Database error recording donation: %s", e)
        raise HTTPException(status_code=500, detail="Failed to record donation")
    return {"message": "Success", "new_total": inventory.units_available}

@app.get("/settings", response_model=List[schemas.SystemSetting])
def get_settings(db: Session = Depends(get_db)):
    return db.query(models.SystemSetting).all()

@app.post("/settings", response_model=schemas.SystemSetting)
def update_setting(setting: schemas.SystemSettingBase, db: Session = Depends(get_db)):
    db_setting = db.query(models.SystemSetting).filter(models.SystemSetting.key == setting.key).first()
    if db_setting:
        db_setting.value = setting.value
        db_setting.category = setting.category
    else:
        db_setting = models.SystemSetting(**setting.dict())
        db.add(db_setting)
    try:
        db.commit()
        db.refresh(db_setting)
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("Database error updating setting: %s", e)
        raise HTTPException(status_code=500, detail="Failed to save setting")
    return db_setting

# Trigger reload
