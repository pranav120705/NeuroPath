import firebase_admin
from firebase_admin import credentials, firestore
import os

# Get the absolute path to the directory containing this file
current_dir = os.path.dirname(os.path.abspath(__file__))
# Construct the absolute path to the credentials file
cred_path = os.path.join(current_dir, "firebase_credentials.json")


# Initialize Firebase Admin SDK
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

db = firestore.client()
