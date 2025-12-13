from fastapi import APIRouter, HTTPException, status, Body
from typing import List
from ..models import SessionResponse, SessionCreate
from ..database import db

router = APIRouter()

@router.get("/patients/{patient_id}/sessions", response_model=List[SessionResponse])
def get_sessions_for_patient(patient_id: str):
    """Retrieve all sessions for a specific patient, sorted by most recent."""
    sessions_ref = db.collection('sessions').where('patientId', '==', patient_id).order_by('date', direction='DESCENDING').stream()
    sessions = []
    for doc in sessions_ref:
        session_data = doc.to_dict()
        session_data['id'] = doc.id
        sessions.append(session_data)
    return sessions

@router.post("/sessions", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(session: SessionCreate = Body(...)):
    """Create and save a new exercise session."""
    session_ref = db.collection('sessions').document()
    session_data = session.model_dump()
    session_data['id'] = session_ref.id
    session_ref.set(session_data)
    created_session = session_ref.get()
    if not created_session.exists:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create session")
    return_session = created_session.to_dict()
    return_session['id'] = created_session.id
    return return_session
