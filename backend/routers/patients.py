from fastapi import APIRouter, HTTPException, status
from typing import List
from ..models import Patient, PatientResponse
from ..database import db

router = APIRouter()

@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(patient: Patient):
    """Create a new patient."""
    patient_ref = db.collection('patients').document()
    patient.id = patient_ref.id
    patient_data = patient.model_dump(exclude_unset=True)
    patient_ref.set(patient_data)
    created_patient = patient_ref.get()
    if not created_patient.exists:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create patient")
    return_patient = created_patient.to_dict()
    return_patient['id'] = created_patient.id
    return return_patient

@router.get("", response_model=List[PatientResponse])
def get_all_patients():
    """Retrieve all patients from the database."""
    patients_ref = db.collection('patients').stream()
    patients = []
    for doc in patients_ref:
        patient_data = doc.to_dict()
        patient_data['id'] = doc.id
        patients.append(patient_data)
    return patients

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient_by_id(patient_id: str):
    """Retrieve a single patient by their ID."""
    patient_ref = db.collection('patients').document(patient_id)
    patient = patient_ref.get()
    if not patient.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with id '{patient_id}' not found"
        )
    patient_data = patient.to_dict()
    patient_data['id'] = patient.id
    return patient_data

@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(patient_id: str, patient: Patient):
    """Update a patient's information."""
    patient_ref = db.collection('patients').document(patient_id)
    if not patient_ref.get().exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with id '{patient_id}' not found"
        )
    
    patient_data = patient.model_dump(exclude={'id'}, exclude_unset=True)
    patient_ref.set(patient_data, merge=True)

    updated_patient = patient_ref.get()
    return_patient = updated_patient.to_dict()
    return_patient['id'] = updated_patient.id
    return return_patient

@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(patient_id: str):
    """Delete a patient."""
    patient_ref = db.collection('patients').document(patient_id)
    if not patient_ref.get().exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with id '{patient_id}' not found"
        )
    patient_ref.delete()
    return {}
