# backend/seed.py
import os
import random
import math
from datetime import datetime, timedelta
import firebase_admin
from firebase_admin import credentials, firestore

# --- Config ---
RESET_DB = os.getenv("RESET_DB", "true").lower() == "true"
# You can control this via .env or CLI:
# RESET_DB=true  → wipes collections before seeding
# RESET_DB=false → only inserts new data (may duplicate unless you handle IDs)

# Initialize Firebase Admin SDK
cred = credentials.Certificate("backend/firebase_credentials.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# --- Seed Data ---
DOCTORS = [
    {"id": "doc1", "name": "Dr. Evelyn Reed", "email": "e.reed@clinic.com", "role": "doctor"},
    {"id": "doc2", "name": "Dr. Samuel Chen", "email": "s.chen@clinic.com", "role": "doctor"},
]

PATIENTS = [
    {"id": "pat1", "name": "John Doe", "email": "j.doe@email.com", "role": "patient", "doctorId": "doc1"},
    {"id": "pat2", "name": "Jane Smith", "email": "j.smith@email.com", "role": "patient", "doctorId": "doc1"},
    {"id": "pat3", "name": "Peter Jones", "email": "p.jones@email.com", "role": "patient", "doctorId": "doc2"},
]

def generate_random_angles(length, min_angle, max_angle, noise):
    """Generates a list of angles simulating an exercise movement."""
    angles = []
    for i in range(length):
        progress = i / length
        base_angle = min_angle + (max_angle - min_angle) * (0.5 + 0.5 * math.cos(progress * 2 * math.pi))
        noisy_angle = base_angle + random.uniform(-noise, noise)
        angles.append(round(noisy_angle, 2))
    return angles

EXERCISE_PRESETS = [
    {
        "id": "ex1",
        "name": "Bicep Curls",
        "description": "Perform bicep curls with dumbbells.",
        "duration": 30,
        "benchmarkData": {
            "leftElbow": generate_random_angles(30, 0, 90, 10),
            "rightElbow": generate_random_angles(30, 0, 90, 10),
            "leftKnee": generate_random_angles(30, 0, 10, 5),
            "rightKnee": generate_random_angles(30, 0, 10, 5),
        },
    },
    {
        "id": "ex2",
        "name": "Squats",
        "description": "Perform squats.",
        "duration": 45,
        "benchmarkData": {
            "leftElbow": generate_random_angles(45, 0, 10, 5),
            "rightElbow": generate_random_angles(45, 0, 10, 5),
            "leftKnee": generate_random_angles(45, 90, 140, 5),
            "rightKnee": generate_random_angles(45, 90, 140, 5),
        },
    },
]

# Generate some sessions
SESSIONS = []
start_date = datetime.utcnow() - timedelta(days=10)
for i, patient in enumerate(PATIENTS, start=1):
    for j, preset in enumerate(EXERCISE_PRESETS, start=1):
        session_id = f"ses{i}{j}"
        session = {
            "id": session_id,
            "patientId": patient["id"],
            "doctorId": patient["doctorId"], 
            "exercisePresetId": preset["id"],
            "date": (start_date + timedelta(days=i+j)).isoformat(),
            "angles": {
                "leftElbow": generate_random_angles(preset["duration"], 0, 90, 15),
                "rightElbow": generate_random_angles(preset["duration"], 0, 90, 15),
                "leftKnee": generate_random_angles(preset["duration"], 80, 140, 10),
                "rightKnee": generate_random_angles(preset["duration"], 80, 140, 10),
            },
        }
        SESSIONS.append(session)

# --- Seeding logic ---
def seed_data():
    if RESET_DB:
        print("⚠️ RESET_DB is TRUE → wiping old collections...")
        delete_collection('doctors')
        delete_collection('patients')
        delete_collection('exercisePresets')
        delete_collection('sessions')
    else:
        print("✅ RESET_DB is FALSE → keeping old data, just adding new docs...")

    # Insert doctors
    for doctor in DOCTORS:
        db.collection('doctors').document(doctor['id']).set(doctor)
    print(f"Inserted {len(DOCTORS)} doctors")

    # Insert patients
    for patient in PATIENTS:
        db.collection('patients').document(patient['id']).set(patient)
    print(f"Inserted {len(PATIENTS)} patients")

    # Insert exercise presets
    for preset in EXERCISE_PRESETS:
        db.collection('exercisePresets').document(preset['id']).set(preset)
    print(f"Inserted {len(EXERCISE_PRESETS)} exercise presets")

    # Insert sessions
    for session in SESSIONS:
        db.collection('sessions').document(session['id']).set(session)
    print(f"Inserted {len(SESSIONS)} sessions")

    print("--- Database seeding complete ---")

def delete_collection(coll_path, batch_size=50):
    coll_ref = db.collection(coll_path)
    docs = coll_ref.limit(batch_size).stream()
    deleted = 0

    for doc in docs:
        print(f'Deleting doc {doc.id} => {doc.to_dict()}')
        doc.reference.delete()
        deleted = deleted + 1

    if deleted >= batch_size:
        return delete_collection(coll_path, batch_size) # Recurse on the same collection

if __name__ == "__main__":
    seed_data()
