from fastapi import APIRouter, HTTPException, status
from typing import List
from ..models import Doctor, DoctorResponse
from ..database import db

router = APIRouter()

@router.post("", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
async def create_doctor(doctor: Doctor):
    """Create a new doctor."""
    doctor_ref = db.collection('doctors').document()
    doctor.id = doctor_ref.id
    doctor_data = doctor.model_dump(exclude_unset=True)
    doctor_ref.set(doctor_data)
    created_doctor = doctor_ref.get()
    if not created_doctor.exists:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create doctor")
    return_doctor = created_doctor.to_dict()
    return_doctor['id'] = created_doctor.id
    return return_doctor


@router.get("", response_model=List[DoctorResponse])
def get_all_doctors():
    """Retrieve all doctors from the database."""
    doctors_ref = db.collection('doctors').stream()
    doctors = []
    for doc in doctors_ref:
        doctor_data = doc.to_dict()
        doctor_data['id'] = doc.id
        doctors.append(doctor_data)
    return doctors

@router.get("/{doctor_id}", response_model=DoctorResponse)
def get_doctor_by_id(doctor_id: str):
    """Retrieve a single doctor by their ID."""
    doctor_ref = db.collection('doctors').document(doctor_id)
    doctor = doctor_ref.get()
    if not doctor.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Doctor with id '{doctor_id}' not found"
        )
    doctor_data = doctor.to_dict()
    doctor_data['id'] = doctor.id
    return doctor_data

@router.put("/{doctor_id}", response_model=DoctorResponse)
def update_doctor(doctor_id: str, doctor: Doctor):
    """Update a doctor's information."""
    doctor_ref = db.collection('doctors').document(doctor_id)
    if not doctor_ref.get().exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Doctor with id '{doctor_id}' not found"
        )
    
    # Don't update the ID
    doctor_data = doctor.model_dump(exclude={'id'}, exclude_unset=True) 
    doctor_ref.set(doctor_data, merge=True)

    updated_doctor = doctor_ref.get()
    return_doctor = updated_doctor.to_dict()
    return_doctor['id'] = updated_doctor.id
    return return_doctor

@router.delete("/{doctor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_doctor(doctor_id: str):
    """Delete a doctor."""
    doctor_ref = db.collection('doctors').document(doctor_id)
    if not doctor_ref.get().exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Doctor with id '{doctor_id}' not found"
        )
    doctor_ref.delete()
    return {}
