from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class EmergencyContact(BaseModel):
    name: str
    relationship: str
    phone: str
    is_primary: bool = True

class NearbyFacility(BaseModel):
    id: str
    name: str
    type: str           # "24/7 Pharmacy", "Diagnostic Blood Lab", "Urgent Care Clinic"
    address: str
    phone: str
    distance: str        # e.g., "0.8 km"
    open_status: str     # "Open 24/7", "Open until 10:00 PM"
    rating: float

class DoctorProfile(BaseModel):
    id: str
    name: str
    specialty: str
    clinic_name: str
    address: str
    phone: str
    email: str
    operating_hours: str

class UserAuth(BaseModel):
    email: str
    password: str
    role: str            # "patient" or "doctor"
    name: str
    age: Optional[int] = 30
    specialty: Optional[str] = "General Physician"

class VitalsReading(BaseModel):
    timestamp: str
    fasting_sugar: float
    pp_sugar: float
    systolic_bp: int
    diastolic_bp: int
    spo2: int
    pulse_rate: int

class Medication(BaseModel):
    id: str
    name: str
    dosage: str
    frequency: str
    pills_remaining: int
    total_pills: int
    prescribed_by: str
    status: str

class Appointment(BaseModel):
    id: str
    patient_id: str
    patient_name: str
    doctor_name: str
    specialty: str
    date: str
    time: str
    type: str
    status: str

class FitbitTelemetry(BaseModel):
    steps_today: int = 8420
    step_goal: int = 10000
    current_heart_rate: int = 72
    resting_heart_rate: int = 68
    active_minutes: int = 42
    calories_burned: int = 1850
    sleep_hours: float = 7.2
    sync_status: str = "Connected (Synced 2 mins ago)"
    battery_level: int = 88
    device_name: str = "Fitbit Sense 2"

class HealthTrendSummary(BaseModel):
    status: str = "Improving" # "Improving", "Stable", "Deteriorating"
    health_score: int = 88
    delta_percentage: float = 7.5
    summary_text: str = "Blood sugar levels stabilized; daily physical activity increased by 15% over the past 14 days."
    alert_flag: Optional[str] = None

class PatientRecord(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    address: str
    contact: str
    emergency_contact: EmergencyContact
    medical_history: List[str]
    allergies: List[str]
    vitals_history: List[VitalsReading]
    medications: List[Medication]
    next_checkup_recommended: Dict[str, Any]
    fitbit_telemetry: Optional[FitbitTelemetry] = FitbitTelemetry()
    health_trend_summary: Optional[HealthTrendSummary] = HealthTrendSummary()

