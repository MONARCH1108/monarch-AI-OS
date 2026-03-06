import gspread
import pandas as pd
from google.oauth2.service_account import Credentials
import json

# ---------------------------------------------------
# FUNCTION 1
# Authentication + Fetch Data
# ---------------------------------------------------
def authenticate_and_fetch_sheet_data(credentials_path, sheet_id):

    scopes = ["https://www.googleapis.com/auth/spreadsheets"]
    credentials = Credentials.from_service_account_file(
        credentials_path,
        scopes=scopes
    )

    client = gspread.authorize(credentials)
    sheet = client.open_by_key(sheet_id)
    worksheet = sheet.worksheet("Time-Tracker")
    data = worksheet.get_all_values()
    dataset = pd.DataFrame(data[1:], columns=data[0])
    return dataset

# ---------------------------------------------------
# FUNCTION 2
# Cleaning logic specific to Time Tracker Sheet
# ---------------------------------------------------
def clean_sheet_time_tracker_data(dataset):

    dataset.replace("", pd.NA, inplace=True)
    dataset["Date"] = dataset["Date"].ffill()
    dataset["Day"] = dataset["Day"].ffill()
    dataset["Task"] = dataset["Task"].ffill()
    dataset["Task-ID"] = dataset["Task-ID"].ffill()
    dataset["Category"] = dataset["Category"].ffill()
    dataset["Status"] = dataset["Status"].ffill()
    dataset = dataset.fillna("")
    return dataset

# ---------------------------------------------------
# FUNCTION 3
# Formatter for Time Tracker Sheet → JSON
# ---------------------------------------------------
def format_sheet_time_tracker_to_json(dataset):

    structured_data = []
    task_map = {}
    for _, row in dataset.iterrows():
        task_id = row["Task-ID"]
        if task_id == "":
            continue

        session = {
            "clock_in": row["Clock-IN"],
            "clock_out": row["Clock-OUT"],
            "minutes": row["Total-MIN"],
            "hours": row["Total-Hr"]
        }
        if task_id not in task_map:

            task_entry = {
                "date": row["Date"],
                "day": row["Day"],
                "task": row["Task"],
                "task_id": task_id,
                "category": row["Category"],
                "status": row["Status"],
                "sessions": []
            }

            task_map[task_id] = task_entry
            structured_data.append(task_entry)
        task_map[task_id]["sessions"].append(session)
    return structured_data

def main():

    credentials_path = "config/Credentials.json"
    sheet_id = "1x0CJgCUpj-DDvGyClKXdc9OhBpOwNO9AUIdoZ1nnAvM"

    # Fetch data
    dataset = authenticate_and_fetch_sheet_data(credentials_path, sheet_id)

    # Clean dataset
    dataset = clean_sheet_time_tracker_data(dataset)

    # Format to JSON structure
    structured_data = format_sheet_time_tracker_to_json(dataset)

    # Save output for testing
    with open("time_tracker_structured.json", "w", encoding="utf-8") as f:
        json.dump(structured_data, f, indent=4)

    print("Time Tracker JSON created successfully.")


if __name__ == "__main__":
    main()