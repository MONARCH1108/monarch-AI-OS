import gspread
import pandas as pd
from google.oauth2.service_account import Credentials
from datetime import datetime
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

    # ---- FIXES ----

    # remove trailing spaces in task
    dataset["Task"] = dataset["Task"].astype(str).str.strip()

    # normalize task_id case
    dataset["Task-ID"] = dataset["Task-ID"].astype(str).str.lower().str.strip()

    # normalize category
    dataset["Category"] = dataset["Category"].astype(str).str.upper().str.strip()

    return dataset

# ---------------------------------------------------
# HELPER FUNCTION
# Flatten hierarchical session data
# ---------------------------------------------------
def flatten_sessions(structured_data):

    flat_data = []

    for task in structured_data:

        session_counter = 1

        for session in task["sessions"]:

            session_id = f"{task['task_id']}-s{session_counter}"

            record = {
                "session_id": session_id,
                "date": task["date"],
                "day": task["day"],
                "task": task["task"],
                "task_id": task["task_id"],
                "category": task["category"],
                "status": task["status"],
                "clock_in": session["clock_in"],
                "clock_out": session["clock_out"],
                "minutes": session["minutes"],
                "hours": session["hours"]
            }

            flat_data.append(record)

            session_counter += 1

    return flat_data

# ---------------------------------------------------
# FUNCTION 3
# Formatter for Time Tracker Sheet → JSON
# ---------------------------------------------------
def format_sheet_time_tracker_to_json(dataset, flatten=True):

    structured_data = []
    task_map = {}

    # --------------------------------
    # HELPER → Normalize time format
    # --------------------------------
    def normalize_time(t):

        if t == "":
            return ""

        t = str(t).strip()

        try:
            return datetime.strptime(t, "%I:%M:%S %p").strftime("%H:%M:%S")
        except:
            try:
                return datetime.strptime(t, "%I:%M %p").strftime("%H:%M:%S")
            except:
                return t

    for _, row in dataset.iterrows():

        task_id_raw = row["Task-ID"]

        if task_id_raw == "":
            continue

        # ---- Convert date safely ----
        date_str = row["Date"]

        try:
            formatted_date = datetime.strptime(date_str, "%m/%d/%Y").strftime("%Y-%m-%d")
        except:
            continue

        # ---- Match taskdesk task_id ----
        task_id = f"{formatted_date}-{task_id_raw}"

        # ---- Remove empty sessions ----
        if row["Clock-IN"] == "" or row["Clock-OUT"] == "":
            continue

        # ---- Convert minutes ----
        try:
            minutes = float(row["Total-MIN"])
        except:
            minutes = ""

        # ---- Convert hours ----
        try:
            hours = float(row["Total-Hr"])
        except:
            hours = ""

        session = {
            "clock_in": normalize_time(row["Clock-IN"]),
            "clock_out": normalize_time(row["Clock-OUT"]),
            "minutes": minutes,
            "hours": hours
        }

        if task_id not in task_map:

            task_entry = {
                "date": formatted_date,
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

    # ----------------------------------------
    # FLATTEN FLAG
    # ----------------------------------------

    if flatten:
        return flatten_sessions(structured_data)

    return structured_data

def main():
    credentials_path = "Server/config/Credentials.json"
    sheet_id = "1x0CJgCUpj-DDvGyClKXdc9OhBpOwNO9AUIdoZ1nnAvM"
    dataset = authenticate_and_fetch_sheet_data(credentials_path, sheet_id)
    dataset = clean_sheet_time_tracker_data(dataset)
    structured_data = format_sheet_time_tracker_to_json(dataset)
    with open("Server/JsonRes/time_tracker_structured.json", "w", encoding="utf-8") as f:
        json.dump(structured_data, f, indent=4)
    print("Time Tracker JSON created successfully.")

if __name__ == "__main__":
    main()