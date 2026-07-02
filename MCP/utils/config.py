import os
import boto3
from dotenv import load_dotenv

# Load .env from current folder
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path)


def get_s3_client():
    endpoint = os.getenv("S3_ENDPOINT_URL")
    access = os.getenv("AWS_ACCESS_KEY_ID")
    secret = os.getenv("AWS_SECRET_ACCESS_KEY")
    region = os.getenv("AWS_REGION")

    if not all([endpoint, access, secret, region]):
        raise ValueError("Missing Supabase S3 credentials in .env")

    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=access,
        aws_secret_access_key=secret,
        region_name=region
    )


def get_bucket_name():
    bucket = os.getenv("S3_BUCKET_NAME")

    if not bucket:
        raise ValueError("Missing S3_BUCKET_NAME in .env")

    return bucket