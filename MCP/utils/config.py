import os
import boto3
from dotenv import load_dotenv

# Load .env from current folder
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path)

def get_s3_client():
    access = os.getenv("AWS_ACCESS_KEY")
    secret = os.getenv("AWS_SECRET_KEY")
    region = os.getenv("AWS_REGION")

    if not all([access, secret, region]):
        raise ValueError("Missing AWS credentials in .env")

    return boto3.client(
        "s3",
        aws_access_key_id=access,
        aws_secret_access_key=secret,
        region_name=region
    )


def get_bucket_name():
    bucket = os.getenv("AWS_BUCKET_NAME")
    if not bucket:
        raise ValueError("Missing AWS_BUCKET_NAME in .env")
    return bucket