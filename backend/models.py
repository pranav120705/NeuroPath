from pydantic import BaseModel, EmailStr
from typing import List, Optional
from enum import Enum

class UserRole(str, Enum):
    PATIENT = 'patient'
    DOCTOR = 'doctor'
    ADMIN = 'admin'

class User(BaseModel):
    id: Optional[str] = None
    name: str
    email: EmailStr
    role: UserRole

class Patient(User):
    role: UserRole = UserRole.PATIENT
    doctorId: str

class Doctor(User):
    role: UserRole = UserRole.DOCTOR

class PatientResponse(Patient):
    id: str

class DoctorResponse(Doctor):
    id: str

class JointAngles(BaseModel):
    leftElbow: List[float]
    rightElbow: List[float]
    leftKnee: List[float]
    rightKnee: List[float]

class Session(BaseModel):
    id: Optional[str] = None
    patientId: str
    doctorId: str
    date: str
    angles: JointAngles
    exercisePresetId: Optional[str] = None

class SessionCreate(BaseModel):
    patientId: str
    doctorId: str
    date: str
    angles: JointAngles
    exercisePresetId: Optional[str] = None

class SessionResponse(Session):
    id: str

class ExercisePreset(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    duration: int
    benchmarkData: JointAngles

class ExercisePresetResponse(ExercisePreset):
    id: str
