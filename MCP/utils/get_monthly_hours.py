import json
from utils.config import get_s3_client, get_bucket_name

FILE_KEY = "Automation/monthly_hours.json"


def get_monthly_hours():
    try:
        s3 = get_s3_client()
        bucket = get_bucket_name()

        response = s3.get_object(Bucket=bucket, Key=FILE_KEY)
        data = json.loads(response["Body"].read().decode("utf-8"))

        return data

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


if __name__ == "__main__":
    result = get_monthly_hours()
    print(json.dumps(result, indent=2))