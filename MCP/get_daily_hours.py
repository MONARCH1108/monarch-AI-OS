import json
from config import get_s3_client, get_bucket_name

FILE_KEY = "Automation/daily_hours.json"


def get_daily_hours():
    try:
        s3 = get_s3_client()
        bucket = get_bucket_name()

        # Fetch from S3
        response = s3.get_object(Bucket=bucket, Key=FILE_KEY)

        data = json.loads(response["Body"].read().decode("utf-8"))

        print("\n✅ Daily Hours JSON:\n")
        print(json.dumps(data, indent=2))

    except Exception as e:
        print("❌ Error fetching daily hours:")
        print(e)


if __name__ == "__main__":
    get_daily_hours()