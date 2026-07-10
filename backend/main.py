from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect

from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import datetime

import models, schemas, database, ai_engine
from database import engine, get_db

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
def dispatch_resource(resource_id: int, quantity: int, db: Session = Depends(get_db)):
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
def update_setting(setting: schemas.SystemSettingBase, db: Session = Depends(get_db)):
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

@app.on_event("startup")
def seed_users():
    db = database.SessionLocal()
    try:
        # Check if volunteer demo account exists
        volunteer = db.query(models.User).filter(models.User.email == "volunteer@sevasync.com").first()
        if not volunteer:
            db_vol = models.User(
                name="Demo Volunteer",
                email="volunteer@sevasync.com",
                password="demo123",
                role="Volunteer",
                status="approved"
            )
            db.add(db_vol)
        
        # Check if admin demo account exists
        admin = db.query(models.User).filter(models.User.email == "admin@sevasync.com").first()
        if not admin:
            db_admin = models.User(
                name="System Admin",
                email="admin@sevasync.com",
                password="admin123",
                role="admin",
                status="approved"
            )
            db.add(db_admin)
        db.commit()
    except Exception as e:
        print(f"Error seeding default users: {e}")
    finally:
        db.close()

@app.post("/users/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email.lower()).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Assign pending status to admin registrations, approved for volunteers
    status = "pending" if user.role == "admin" else "approved"
    
    new_user = models.User(
        name=user.name,
        email=user.email.lower(),
        password=user.password,
        role=user.role,
        status=status
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/users/login", response_model=schemas.UserResponse)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(
        models.User.email == login_data.email.lower(),
        models.User.password == login_data.password
    ).first()
    
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    if db_user.role == "admin" and db_user.status == "pending":
        raise HTTPException(status_code=403, detail="ACCESS PENDING: Your admin registration is awaiting commander approval.")
        
    return db_user

@app.get("/users", response_model=List[schemas.UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.patch("/users/{user_id}/status", response_model=schemas.UserResponse)
def update_user_status(user_id: int, status_update: schemas.UserUpdateStatus, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db_user.status = status_update.status
    db.commit()
    db.refresh(db_user)
    return db_user

@app.patch("/users/{user_id}/role", response_model=schemas.UserResponse)
def update_user_role(user_id: int, role_update: schemas.UserUpdateRole, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db_user.role = role_update.role
    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}

# Trigger reload
