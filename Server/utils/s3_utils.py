import boto3
import json
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "config", ".env"))

def get_s3_client():
    return boto3.client(
        "s3",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("AWS_REGION")
    )

def get_bucket():
    return os.getenv("S3_BUCKET_NAME")


def upload_json(data, key):
    s3 = get_s3_client()  # ✅ lazy init
    bucket = get_bucket()

    s3.put_object(
        Bucket=bucket,
        Key=key,
        Body=json.dumps(data, indent=4),
        ContentType="application/json"
    )


def read_json(key):
    s3 = get_s3_client()  # ✅ lazy init
    bucket = get_bucket()

    response = s3.get_object(
        Bucket=bucket,
        Key=key
    )

    return json.loads(response["Body"].read().decode("utf-8"))