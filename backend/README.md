# RehabTrack API Backend

This directory contains the Python backend for the RehabTrack application, built with FastAPI and MongoDB.

## Setup

1.  **Create a virtual environment:**
    ```bash
    python -m venv neuropath
    # On Unix/macOS:
    source neuropath/bin/activate
    # On Windows:
    neuropath\Scripts\activate
    ```

2.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Set up environment variables:**
    -   Create a `.env` file in this `backend` directory.
    -   It should contain your MongoDB connection string and database name:
    ```
MONGODB_URI="mongodb://localhost:27017"
DATABASE_NAME="rehabTrackDB"
    ```

4.  **Set up MongoDB:**
    -   Ensure you have a running MongoDB instance (e.g., via Docker or a local installation) accessible at the URI specified in your `.env` file.

## Seeding the Database

Before running the application for the first time, you need to populate the database with initial data that matches the frontend's expectations.

Run the seed script from the `backend` directory:
```bash
python seed.py
```
This will clear any existing data in the collections and insert the default set of doctors, patients, exercises, and sessions.

## Running the Application

To start the FastAPI server, run the following command from the `backend` directory:
```bash
uvicorn main:app --reload
```
The API will be available at `http://127.0.0.1:8000`. You can also access the interactive API documentation (Swagger UI) at `http://127.0.0.1:8000/docs`.


Default wipes DB:

RESET_DB=true python backend/seed.py


Keep old data:

RESET_DB=false python backend/seed.py