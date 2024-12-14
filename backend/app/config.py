import os
import json
from pathlib import Path

# Get the path to the service account file
service_account_path = Path(__file__).parent.parent / 'taxservices-72ea6-firebase-adminsdk-sakqk-ab79108bb5.json'

# Load the service account file
try:
    with open(service_account_path) as f:
        service_account = json.load(f)
except FileNotFoundError:
    print("Warning: Service account file not found. Using environment variables if available.")
    service_account = None

# Firebase configuration
if service_account:
    FIREBASE_CONFIG = {
        "type": service_account.get("type"),
        "project_id": service_account.get("project_id"),
        "private_key_id": service_account.get("private_key_id"),
        "private_key": service_account.get("private_key"),
        "client_email": service_account.get("client_email"),
        "client_id": service_account.get("client_id"),
        "auth_uri": service_account.get("auth_uri"),
        "token_uri": service_account.get("token_uri"),
        "auth_provider_x509_cert_url": service_account.get("auth_provider_x509_cert_url"),
        "client_x509_cert_url": service_account.get("client_x509_cert_url")
    }
else:
    # Fallback to environment variables if service account file is not found
    FIREBASE_CONFIG = None
    print("No Firebase configuration available. Please ensure service account file exists.")
