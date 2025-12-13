
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import doctors, patients, exercises, sessions

app = FastAPI()

# CORS middleware
origins = [
    "http://localhost:3000",
    "https://9000-firebase-neuropath-1758643087802.cluster-aic6jbiihrhmyrqafasatvzbwe.cloudworkstations.dev"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(doctors.router, prefix="/api/doctors", tags=["doctors"])
app.include_router(patients.router, prefix="/api/patients", tags=["patients"])
app.include_router(exercises.router, prefix="/api/exercises", tags=["exercises"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["sessions"])

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
