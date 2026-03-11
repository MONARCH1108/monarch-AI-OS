# -------------------------------
# IMPORT COMPONENT PIPELINES
# -------------------------------

from Components.GSheet_TaskDes import (
    authenticate_and_fetch_sheet_data as fetch_taskdesk,
    clean_sheet1_taskdesk_data,
    format_sheet1_taskdesk_to_json
)

from Components.GSheet_TimeTracker import (
    authenticate_and_fetch_sheet_data as fetch_timetracker,
    clean_sheet_time_tracker_data,
    format_sheet_time_tracker_to_json
)

from Analytics.daily_hours_engine import run_daily_analytics
from Analytics.weekly_hours_engine import run_weekly_analytics
from Analytics.monthly_hours_engine import run_monthly_analytics


import json


# -------------------------------
# CONFIG
# -------------------------------

CREDENTIALS_PATH = "Server/config/Credentials.json"
SHEET_ID = "1x0CJgCUpj-DDvGyClKXdc9OhBpOwNO9AUIdoZ1nnAvM"

TASK_JSON_PATH = "Server/JsonRes/task_desk_structured.json"
SESSION_JSON_PATH = "Server/JsonRes/time_tracker_structured.json"


# -------------------------------
# STEP 1
# BUILD TASK DESK JSON
# -------------------------------

def build_taskdesk_json():

    print("Fetching TaskDesk data...")

    dataset = fetch_taskdesk(CREDENTIALS_PATH, SHEET_ID)
    dataset = clean_sheet1_taskdesk_data(dataset)

    structured_data = format_sheet1_taskdesk_to_json(dataset)

    with open(TASK_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(structured_data, f, indent=4)

    print("TaskDesk JSON created")


# -------------------------------
# STEP 2
# BUILD TIME TRACKER JSON
# -------------------------------

def build_timetracker_json():

    print("Fetching TimeTracker data...")

    dataset = fetch_timetracker(CREDENTIALS_PATH, SHEET_ID)
    dataset = clean_sheet_time_tracker_data(dataset)

    structured_data = format_sheet_time_tracker_to_json(dataset)

    with open(SESSION_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(structured_data, f, indent=4)

    print("TimeTracker JSON created")


# -------------------------------
# MASTER PIPELINE
# -------------------------------

def run_pipeline():

    print("===================================")
    print("Starting Productivity Data Pipeline")
    print("===================================")

    # Step 1
    build_taskdesk_json()

    # Step 2
    build_timetracker_json()

    # Step 3
    print("Running Daily Analytics...")
    run_daily_analytics()

    # Step 4
    print("Running Weekly Analytics...")
    run_weekly_analytics()

    # Step 5
    print("Running Monthly Analytics...")
    run_monthly_analytics()

    print("===================================")
    print("Pipeline Completed Successfully")
    print("===================================")


# -------------------------------
# ENTRY POINT
# -------------------------------

if __name__ == "__main__":

    try:

        run_pipeline()

    except Exception as e:

        print("Pipeline failed.")
        print(e)