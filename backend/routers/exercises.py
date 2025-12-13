from fastapi import APIRouter, HTTPException, status
from typing import List
from ..models import ExercisePreset, ExercisePresetResponse
from ..database import db

router = APIRouter()

@router.post("", response_model=ExercisePresetResponse, status_code=status.HTTP_201_CREATED)
def create_exercise_preset(preset: ExercisePreset):
    """Create a new exercise preset."""
    preset_ref = db.collection('exercisePresets').document()
    preset.id = preset_ref.id
    preset_data = preset.model_dump(exclude_unset=True)
    preset_ref.set(preset_data)
    created_preset = preset_ref.get()
    if not created_preset.exists:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create exercise preset")
    return_preset = created_preset.to_dict()
    return_preset['id'] = created_preset.id
    return return_preset

@router.get("", response_model=List[ExercisePresetResponse])
def get_all_exercise_presets():
    """Retrieve all exercise presets from the database."""
    presets_ref = db.collection('exercisePresets').stream()
    presets = []
    for doc in presets_ref:
        preset_data = doc.to_dict()
        preset_data['id'] = doc.id
        presets.append(preset_data)
    return presets

@router.get("/{preset_id}", response_model=ExercisePresetResponse)
def get_exercise_preset_by_id(preset_id: str):
    """Retrieve a single exercise preset by its ID."""
    preset_ref = db.collection('exercisePresets').document(preset_id)
    preset = preset_ref.get()
    if not preset.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exercise preset with id '{preset_id}' not found"
        )
    preset_data = preset.to_dict()
    preset_data['id'] = preset.id
    return preset_data

@router.put("/{preset_id}", response_model=ExercisePresetResponse)
def update_exercise_preset(preset_id: str, preset: ExercisePreset):
    """Update an exercise preset's information."""
    preset_ref = db.collection('exercisePresets').document(preset_id)
    if not preset_ref.get().exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exercise preset with id '{preset_id}' not found"
        )
    
    preset_data = preset.model_dump(exclude={'id'}, exclude_unset=True)
    preset_ref.set(preset_data, merge=True)

    updated_preset = preset_ref.get()
    return_preset = updated_preset.to_dict()
    return_preset['id'] = updated_preset.id
    return return_preset

@router.delete("/{preset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exercise_preset(preset_id: str):
    """Delete an exercise preset."""
    preset_ref = db.collection('exercisePresets').document(preset_id)
    if not preset_ref.get().exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exercise preset with id '{preset_id}' not found"
        )
    preset_ref.delete()
    return {}
