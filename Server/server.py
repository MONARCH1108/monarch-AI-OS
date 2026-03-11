from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import os


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

# -------------------------------
# FASTAPI APP
# -------------------------------

app = FastAPI(
    title="Productivity Analytics API",
    version="1.0"
)

# -------------------------------
# CORS CONFIG
# -------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow any origin (dev mode)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# CONFIG
# -------------------------------

CREDENTIALS_PATH = "config\Credentials.json"
SHEET_ID = "1x0CJgCUpj-DDvGyClKXdc9OhBpOwNO9AUIdoZ1nnAvM"

TASK_JSON_PATH = "JsonRes/task_desk_structured.json"
SESSION_JSON_PATH = "JsonRes/time_tracker_structured.json"

DAILY_JSON_PATH = "Automation/daily_hours.json"
WEEKLY_JSON_PATH = "Automation/weekly_hours.json"
MONTHLY_JSON_PATH = "Automation/monthly_hours.json"

# -------------------------------
# GET /health
# -------------------------------

@app.get("/health")
def health_check():

    checks = {
        "tasks_json_exists": os.path.exists("JsonRes/task_desk_structured.json"),
        "sessions_json_exists": os.path.exists("JsonRes/time_tracker_structured.json"),
        "daily_json_exists": os.path.exists("Automation/daily_hours.json")
    }

    return {
        "status": "ok",
        "service": "Productivity Analytics API",
        "checks": checks
    }

# -------------------------------
# STEP 1
# BUILD TASK DESK JSON
# -------------------------------

def build_taskdesk_json():
    dataset = fetch_taskdesk(CREDENTIALS_PATH, SHEET_ID)
    dataset = clean_sheet1_taskdesk_data(dataset)
    structured_data = format_sheet1_taskdesk_to_json(dataset)
    with open(TASK_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(structured_data, f, indent=4)

# -------------------------------
# STEP 2
# BUILD TIME TRACKER JSON
# -------------------------------

def build_timetracker_json():
    dataset = fetch_timetracker(CREDENTIALS_PATH, SHEET_ID)
    dataset = clean_sheet_time_tracker_data(dataset)
    structured_data = format_sheet_time_tracker_to_json(dataset)
    with open(SESSION_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(structured_data, f, indent=4)

# -------------------------------
# MASTER PIPELINE
# -------------------------------

def run_pipeline():
    build_taskdesk_json()
    build_timetracker_json()
    run_daily_analytics()
    run_weekly_analytics()
    run_monthly_analytics()

# -------------------------------
# POST /pipeline/run
# -------------------------------

@app.post("/pipeline/run")
def run_full_pipeline():
    try:
        run_pipeline()
        return {
            "status": "success",
            "message": "Pipeline executed successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# -------------------------------
# GET /tasks
# -------------------------------

@app.get("/tasks")
def get_tasks():
    try:
        with open(TASK_JSON_PATH, "r") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# -------------------------------
# GET /analytics/daily
# -------------------------------

@app.get("/analytics/daily")
def get_daily():
    try:
        with open(DAILY_JSON_PATH, "r") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# -------------------------------
# GET /analytics/weekly
# -------------------------------

@app.get("/analytics/weekly")
def get_weekly():
    try:
        with open(WEEKLY_JSON_PATH, "r") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# -------------------------------
# GET /analytics/monthly
# -------------------------------

@app.get("/analytics/monthly")
def get_monthly():
    try:
        with open(MONTHLY_JSON_PATH, "r") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
