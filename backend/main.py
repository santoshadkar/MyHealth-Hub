import time
import uuid
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config import settings
from app.models import (
    PatientRecord, VitalsReading, Medication, Appointment,
    EmergencyContact, NearbyFacility, DoctorProfile, UserAuth
)
from app.rag.store import medical_vault_instance
from app.mcp.manager import medical_mcp_instance
from app.loops.engine import health_loop_instance
from app.agents.graph import myhealth_graph_engine

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="MyHealth AI Healthcare Portal Engine for Patients & Doctors in India."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registered Users Store
registered_users: Dict[str, Dict[str, Any]] = {
    "aarav@example.com": {
        "email": "aarav@example.com",
        "password": "password123",
        "role": "patient",
        "name": "Aarav Sharma",
        "patient_id": "P-1001"
    },
    "ananya@myhealth.com": {
        "email": "ananya@myhealth.com",
        "password": "doctor123",
        "role": "doctor",
        "name": "Dr. Ananya Adkar",
        "specialty": "General Physician",
        "doctor_id": "doc-101"
    }
}

# Doctor Profiles Store
doctor_profiles_db: Dict[str, DoctorProfile] = {
    "doc-101": DoctorProfile(
        id="doc-101",
        name="Dr. Ananya Adkar",
        specialty="General Physician",
        clinic_name="MyHealth Primary & Specialist Clinic",
        address="405 Apex Medical Plaza, Bandra West, Mumbai 400050",
        phone="+91 98200 12345",
        email="ananya@myhealth.com",
        operating_hours="Mon-Sat: 09:30 AM - 06:30 PM IST"
    )
}

# Nearby Pharmacies & Diagnostics Store in India
nearby_facilities: List[NearbyFacility] = [
    NearbyFacility(
        id="fac-1",
        name="Apollo Pharmacy 24/7",
        type="24/7 Pharmacy",
        address="74, MG Road, Indiranagar, Bengaluru 560038",
        phone="+91 80 2520 1122",
        distance="0.6 km",
        open_status="Open 24/7",
        rating=4.9
    ),
    NearbyFacility(
        id="fac-2",
        name="Dr. Lal PathLabs Blood & Diagnostic Center",
        type="Diagnostic Blood Lab",
        address="12, Park Street, Kolkata 700016",
        phone="+91 33 2288 9900",
        distance="1.1 km",
        open_status="Open 07:00 AM - 09:00 PM IST",
        rating=4.8
    ),
    NearbyFacility(
        id="fac-3",
        name="Fortis Emergency & Urgent Care Hospital",
        type="Urgent Care Hospital",
        address="15, Bannerghatta Road, Bengaluru 560076",
        phone="+91 80 6621 4444",
        distance="1.8 km",
        open_status="Open 24/7",
        rating=4.9
    )
]

# In-Memory Patient Database (Indian Patients)
patient_database: Dict[str, PatientRecord] = {
    "P-1001": PatientRecord(
        id="P-1001",
        name="Aarav Sharma",
        age=52,
        gender="Male",
        address="Flat 402, Shanti Heights, Bandra West, Mumbai 400050",
        contact="+91 98201 55443",
        emergency_contact=EmergencyContact(
            name="Priya Sharma",
            relationship="Spouse",
            phone="+91 98201 99887",
            is_primary=True
        ),
        medical_history=["Type-2 Diabetes Mellitus (2021)", "Mild Essential Hypertension"],
        allergies=["Penicillin (Causes skin rash)", "Dust Mites"],
        vitals_history=[
            VitalsReading(
                timestamp=time.strftime("%Y-%m-%d %H:%M"),
                fasting_sugar=142.0,
                pp_sugar=198.0,
                systolic_bp=130,
                diastolic_bp=85,
                spo2=98,
                pulse_rate=78
            ),
            VitalsReading(
                timestamp="2026-08-15 08:30",
                fasting_sugar=135.0,
                pp_sugar=185.0,
                systolic_bp=128,
                diastolic_bp=82,
                spo2=97,
                pulse_rate=80
            )
        ],
        medications=[
            Medication(
                id="med-1",
                name="Metformin 500 mg",
                dosage="500 mg",
                frequency="Twice daily after meals",
                pills_remaining=6,
                total_pills=30,
                prescribed_by="Dr. Ananya Adkar",
                status="refill_needed"
            ),
            Medication(
                id="med-2",
                name="Telmisartan 40 mg",
                dosage="40 mg",
                frequency="Once daily in the morning",
                pills_remaining=22,
                total_pills=30,
                prescribed_by="Dr. Ananya Adkar",
                status="active"
            )
        ],
        next_checkup_recommended={
            "blood_sugar": "In 7 days (Elevated Fasting Sugar: 142 mg/dL)",
            "spo2": "In 30 days (Normal SpO2: 98%)",
            "pulse_rate": "In 30 days (Normal Pulse: 78 bpm)",
            "blood_pressure": "In 14 days (Mild BP: 130/85 mmHg)"
        }
    ),
    "P-1002": PatientRecord(
        id="P-1002",
        name="Priya Patel",
        age=61,
        gender="Female",
        address="12, Kothrud, Pune, Maharashtra 411038",
        contact="+91 98900 11223",
        emergency_contact=EmergencyContact(
            name="Rohan Patel",
            relationship="Son",
            phone="+91 98900 44556",
            is_primary=True
        ),
        medical_history=["Gestational Diabetes History", "Hypercholesterolemia"],
        allergies=["Sulfa Drugs"],
        vitals_history=[
            VitalsReading(
                timestamp="2026-09-03 09:00",
                fasting_sugar=115.0,
                pp_sugar=150.0,
                systolic_bp=122,
                diastolic_bp=78,
                spo2=99,
                pulse_rate=72
            )
        ],
        medications=[
            Medication(
                id="med-3",
                name="Atorvastatin 10 mg",
                dosage="10 mg",
                frequency="Once daily at night",
                pills_remaining=18,
                total_pills=30,
                prescribed_by="Dr. Ananya Adkar",
                status="active"
            )
        ],
        next_checkup_recommended={
            "blood_sugar": "In 30 days (Fasting: 115 mg/dL)",
            "lipid_profile": "In 60 days"
        }
    )
}

appointments_db: List[Appointment] = [
    Appointment(
        id="apt-1",
        patient_id="P-1001",
        patient_name="Aarav Sharma (Age 52)",
        doctor_name="Dr. Ananya Adkar",
        specialty="General Physician",
        date=time.strftime("%Y-%m-%d"),
        time="10:30 AM IST",
        type="Sugar & Metabolic Review",
        status="scheduled"
    ),
    Appointment(
        id="apt-2",
        patient_id="P-1002",
        patient_name="Priya Patel (Age 61)",
        doctor_name="Dr. Ananya Adkar",
        specialty="General Physician",
        date=time.strftime("%Y-%m-%d"),
        time="02:15 PM IST",
        type="Lipid & BP Follow-up",
        status="scheduled"
    )
]

class SignInReq(BaseModel):
    email: str
    password: str

class RegisterReq(BaseModel):
    name: str
    email: str
    password: str
    role: str
    age: Optional[int] = 35
    specialty: Optional[str] = "General Physician"
    contact: Optional[str] = "+91 98000 11111"

class AddVitalsReq(BaseModel):
    fasting_sugar: float
    pp_sugar: float
    systolic_bp: int
    diastolic_bp: int
    spo2: int
    pulse_rate: int

class AddDocumentReq(BaseModel):
    patient_id: Optional[str] = "P-1001"
    title: str
    content: str
    source: Optional[str] = "Patient Upload"
    category: Optional[str] = "General Report"

class ProcessApprovalReq(BaseModel):
    approval_id: str
    action: str

class ChatReq(BaseModel):
    patient_id: Optional[str] = "P-1001"
    user_role: Optional[str] = "patient"
    message: str

@app.get("/")
def root():
    return {"status": "online", "app": settings.PROJECT_NAME, "version": settings.VERSION}

@app.post("/api/auth/signin")
def signin(req: SignInReq):
    user = registered_users.get(req.email.lower())
    if not user or user["password"] != req.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"status": "success", "user": user}

class ForgotPasswordReq(BaseModel):
    email: str

@app.post("/api/auth/forgot-password")
def forgot_password(req: ForgotPasswordReq):
    email = req.email.lower()
    # Check if user exists or simulate reset email dispatch
    user = registered_users.get(email)
    import uuid
    token = str(uuid.uuid4())[:8].upper()
    return {
        "status": "dispatched",
        "message": f"Password reset instructions and verification code ({token}) sent to {req.email}.",
        "reset_token": token
    }

@app.post("/api/auth/register")
def register(req: RegisterReq):
    email = req.email.lower()
    if email in registered_users:
        raise HTTPException(status_code=400, detail="Account already exists for this email")

    if req.role == "doctor":
        doc_id = f"doc-{100 + len(doctor_profiles_db) + 1}"
        doctor_name = req.name if req.name.startswith("Dr.") else f"Dr. {req.name}"
        spec = req.specialty if req.specialty else "General Physician"
        user_data = {
            "email": email,
            "password": req.password,
            "role": "doctor",
            "name": doctor_name,
            "specialty": spec,
            "doctor_id": doc_id
        }
        registered_users[email] = user_data
        
        doctor_profiles_db[doc_id] = DoctorProfile(
            id=doc_id,
            name=doctor_name,
            specialty=spec,
            clinic_name="MyHealth Primary & Specialist Clinic",
            address="405 Apex Medical Plaza, Bandra West, Mumbai 400050",
            phone=req.contact or "+91 98200 12345",
            email=email,
            operating_hours="Mon-Sat: 09:30 AM - 06:30 PM IST"
        )
        return {"status": "success", "user": user_data}

    else:
        patient_id = f"P-{1000 + len(patient_database) + 1}"
        user_data = {
            "email": email,
            "password": req.password,
            "role": "patient",
            "name": req.name,
            "patient_id": patient_id
        }
        registered_users[email] = user_data

        patient_database[patient_id] = PatientRecord(
            id=patient_id,
            name=req.name,
            age=req.age or 35,
            gender="Registered Patient",
            address="Indiranagar, Bengaluru, Karnataka 560038",
            contact=req.contact or "+91 98450 11223",
            emergency_contact=EmergencyContact(
                name="Family Primary ICE Contact",
                relationship="Spouse/Family",
                phone="+91 98450 99887",
                is_primary=True
            ),
            medical_history=["Registered Patient Baseline Profile"],
            allergies=["None Reported"],
            vitals_history=[
                VitalsReading(
                    timestamp=time.strftime("%Y-%m-%d %H:%M"),
                    fasting_sugar=95.0,
                    pp_sugar=130.0,
                    systolic_bp=120,
                    diastolic_bp=80,
                    spo2=99,
                    pulse_rate=72
                )
            ],
            medications=[
                Medication(
                    id=f"med-reg-{patient_id}",
                    name="Multivitamin Supplement 10 mg",
                    dosage="10 mg",
                    frequency="Once daily in morning",
                    pills_remaining=25,
                    total_pills=30,
                    prescribed_by="Dr. Ananya Adkar",
                    status="active"
                )
            ],
            next_checkup_recommended={
                "blood_sugar": "In 30 days (Optimal Baseline: 95 mg/dL)",
                "spo2": "In 30 days (Optimal SpO2: 99%)",
                "pulse_rate": "In 30 days (Normal Pulse: 72 bpm)",
                "blood_pressure": "In 30 days (Normal BP: 120/80 mmHg)"
            }
        )

        appointments_db.append(
            Appointment(
                id=f"apt-reg-{patient_id}",
                patient_id=patient_id,
                patient_name=f"{req.name} (Age {req.age or 35})",
                doctor_name="Dr. Ananya Adkar",
                specialty="General Physician",
                date=time.strftime("%Y-%m-%d"),
                time="04:00 PM IST",
                type="Initial Consultation & Baseline Checkup",
                status="scheduled"
            )
        )
        return {"status": "success", "user": user_data}

@app.get("/api/patient/{patient_id}")
def get_patient(patient_id: str):
    if patient_id not in patient_database:
        raise HTTPException(status_code=404, detail="Patient record not found")
    return patient_database[patient_id]

@app.get("/api/doctor/today-queue")
def get_today_doctor_queue():
    today = time.strftime("%Y-%m-%d")
    queue_appointments = [a for a in appointments_db if a.date == today]
    queue_data = []
    for apt in queue_appointments:
        p = patient_database.get(apt.patient_id)
        queue_data.append({
            "appointment": apt,
            "patient": p
        })
    return {"queue": queue_data}

@app.get("/api/nearby-facilities")
def get_nearby_facilities():
    return {"facilities": nearby_facilities}

@app.get("/api/doctor-profile/{doc_id}")
def get_doctor_profile_by_id(doc_id: str):
    doc = doctor_profiles_db.get(doc_id) or doctor_profiles_db.get("doc-101")
    return {"doctor": doc}

@app.get("/api/doctor-profile")
def get_doctor_profile():
    return {"doctor": doctor_profiles_db.get("doc-101")}

@app.post("/api/patient/{patient_id}/vitals")
def add_patient_vitals(patient_id: str, req: AddVitalsReq):
    if patient_id not in patient_database:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    new_reading = VitalsReading(
        timestamp=time.strftime("%Y-%m-%d %H:%M"),
        fasting_sugar=req.fasting_sugar,
        pp_sugar=req.pp_sugar,
        systolic_bp=req.systolic_bp,
        diastolic_bp=req.diastolic_bp,
        spo2=req.spo2,
        pulse_rate=req.pulse_rate
    )
    
    p = patient_database[patient_id]
    p.vitals_history.insert(0, new_reading)
    next_sugar = "In 7 days (Elevated Fasting Sugar)" if req.fasting_sugar > 130 else "In 30 days"
    p.next_checkup_recommended["blood_sugar"] = next_sugar
    patient_database[patient_id] = p
    return {"status": "success", "vitals": new_reading, "next_checkup": p.next_checkup_recommended}

@app.get("/api/appointments")
def list_appointments(patient_id: Optional[str] = "P-1001"):
    return {"appointments": [a for a in appointments_db if a.patient_id == patient_id]}

@app.post("/api/appointments")
def schedule_appointment(apt: Appointment):
    appointments_db.append(apt)
    return {"status": "success", "appointment": apt}

@app.get("/api/rag/documents")
def list_medical_documents(patient_id: Optional[str] = "P-1001"):
    return {"documents": medical_vault_instance.list_documents(patient_id)}

@app.post("/api/rag/documents")
def add_medical_document(req: AddDocumentReq):
    doc = medical_vault_instance.add_document(
        patient_id=req.patient_id or "P-1001",
        title=req.title,
        content=req.content,
        source=req.source or "Patient Upload",
        category=req.category or "General Report"
    )
    return {"status": "success", "document": doc}

@app.get("/api/hitl/pending")
def list_hitl_pending():
    return {"pending_approvals": health_loop_instance.get_pending_approvals()}

@app.post("/api/hitl/process")
def process_hitl(req: ProcessApprovalReq):
    res = health_loop_instance.process_approval(req.approval_id, req.action)
    if not res:
        raise HTTPException(status_code=404, detail="Approval request not found")

    if req.action == "approved" and res["tool_name"] == "order_medication_refill":
        p = patient_database.get("P-1001")
        if p:
            for med in p.medications:
                if "Metformin" in med.name:
                    med.pills_remaining = med.total_pills
                    med.status = "active"
            patient_database["P-1001"] = p

    return {"status": "processed", "approval": res}

@app.post("/api/webhooks/lab-results")
async def webhook_lab_results(request: Request):
    payload = await request.json() if request.headers.get("content-type") == "application/json" else {}
    patient_id = payload.get("patient_id", "P-1001")
    report_title = payload.get("report_title", "Automated Lab Result (Dr. Lal PathLabs)")
    lab_content = payload.get("content", "Fasting Sugar: 138 mg/dL, HbA1c: 7.1%.")
    
    doc = medical_vault_instance.add_document(
        patient_id=patient_id,
        title=report_title,
        content=lab_content,
        source=payload.get("lab_name", "Dr. Lal PathLabs Webhook Ingress"),
        category="Lab Ingress Webhook"
    )
    return {"status": "received", "document_indexed": doc}

@app.post("/api/chat")
def health_chat_endpoint(req: ChatReq):
    res = myhealth_graph_engine.run_chat_turn(
        user_role=req.user_role or "patient",
        patient_id=req.patient_id or "P-1001",
        message=req.message,
        thread_history=[]
    )
    return res

@app.post("/api/fitbit/sync/{patient_id}")
def sync_fitbit_data(patient_id: str):
    p = patient_database.get(patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Simulate fresh Fitbit sync with randomized increment
    import random
    if not p.fitbit_telemetry:
        from app.models import FitbitTelemetry
        p.fitbit_telemetry = FitbitTelemetry()
    
    p.fitbit_telemetry.steps_today = min(12000, p.fitbit_telemetry.steps_today + random.randint(150, 450))
    p.fitbit_telemetry.current_heart_rate = random.randint(68, 84)
    p.fitbit_telemetry.active_minutes += random.randint(2, 8)
    p.fitbit_telemetry.calories_burned += random.randint(30, 90)
    p.fitbit_telemetry.sync_status = f"Connected (Synced Live at {time.strftime('%H:%M:%S IST')})"
    patient_database[patient_id] = p
    return {"status": "synced", "fitbit_telemetry": p.fitbit_telemetry}

@app.get("/api/patient/{patient_id}/analytics")
def get_patient_analytics(patient_id: str):
    p = patient_database.get(patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Generate 7-day historical telemetry trends
    sugar_trend = [
        {"day": "Day -6", "fasting": 155, "pp": 210},
        {"day": "Day -5", "fasting": 150, "pp": 205},
        {"day": "Day -4", "fasting": 148, "pp": 200},
        {"day": "Day -3", "fasting": 145, "pp": 195},
        {"day": "Day -2", "fasting": 144, "pp": 192},
        {"day": "Day -1", "fasting": 140, "pp": 188},
        {"day": "Today", "fasting": p.vitals_history[0].fasting_sugar if p.vitals_history else 142, "pp": p.vitals_history[0].pp_sugar if p.vitals_history else 198}
    ]
    
    fitbit_step_trend = [
        {"day": "Mon", "steps": 6200, "goal": 10000},
        {"day": "Tue", "steps": 7100, "goal": 10000},
        {"day": "Wed", "steps": 8500, "goal": 10000},
        {"day": "Thu", "steps": 9200, "goal": 10000},
        {"day": "Fri", "steps": 7800, "goal": 10000},
        {"day": "Sat", "steps": 9400, "goal": 10000},
        {"day": "Sun", "steps": p.fitbit_telemetry.steps_today if p.fitbit_telemetry else 8420, "goal": 10000}
    ]
    
    bp_trend = [
        {"day": "Day -6", "systolic": 138, "diastolic": 88, "spo2": 96},
        {"day": "Day -5", "systolic": 135, "diastolic": 86, "spo2": 97},
        {"day": "Day -4", "systolic": 134, "diastolic": 85, "spo2": 97},
        {"day": "Day -3", "systolic": 132, "diastolic": 84, "spo2": 98},
        {"day": "Day -2", "systolic": 131, "diastolic": 83, "spo2": 98},
        {"day": "Day -1", "systolic": 130, "diastolic": 82, "spo2": 98},
        {"day": "Today", "systolic": p.vitals_history[0].systolic_bp if p.vitals_history else 130, "diastolic": p.vitals_history[0].diastolic_bp if p.vitals_history else 85, "spo2": p.vitals_history[0].spo2 if p.vitals_history else 98}
    ]

    return {
        "patient_id": patient_id,
        "patient_name": p.name,
        "health_trend_summary": p.health_trend_summary,
        "fitbit_telemetry": p.fitbit_telemetry,
        "sugar_trend": sugar_trend,
        "fitbit_step_trend": fitbit_step_trend,
        "bp_trend": bp_trend
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

