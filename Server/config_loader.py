import os
import json
from dotenv import load_dotenv

load_dotenv()

def load_config():
    # =========================
    # AWS CONFIG
    # =========================
    aws_config = {
        "aws_access_key_id": os.getenv("AWS_ACCESS_KEY_ID"),
        "aws_secret_access_key": os.getenv("AWS_SECRET_ACCESS_KEY"),
        "region": os.getenv("AWS_REGION"),
        "bucket": os.getenv("S3_BUCKET_NAME")
    }

    # =========================
    # GROQ CONFIG
    # =========================
    groq_config = {
        "api_key": os.getenv("GROQ_API_KEY")
    }

    # =========================
    # GOOGLE SERVICE ACCOUNT
    # =========================
    google_config = {
        "type": "service_account",
        "project_id": os.getenv("GOOGLE_PROJECT_ID"),
        "private_key_id": os.getenv("GOOGLE_PRIVATE_KEY_ID"),
        "private_key":(os.getenv("GOOGLE_PRIVATE_KEY") or "").replace("\\n", "\n"),
        "client_email": os.getenv("GOOGLE_CLIENT_EMAIL"),
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "auth_uri": os.getenv("GOOGLE_AUTH_URI"),
        "token_uri": os.getenv("GOOGLE_TOKEN_URI"),
        "auth_provider_x509_cert_url": os.getenv("GOOGLE_AUTH_PROVIDER_CERT_URL"),
        "client_x509_cert_url": os.getenv("GOOGLE_CLIENT_CERT_URL"),
        "universe_domain": "googleapis.com"
    }

    return {
        "aws": aws_config,
        "groq": groq_config,
        "google": google_config
    }