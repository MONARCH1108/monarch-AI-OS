import json
import pandas as pd
import gspread
from datetime import datetime
from google.oauth2.service_account import Credentials

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from utils.s3_utils import upload_json, read_json
from config_loader import load_config

def load_sessions(json_path):
    data = read_json(json_path)
    return pd.DataFrame(data)

def compute_daily_hours(session_df):
    session_df["minutes"] = pd.to_numeric(session_df["minutes"], errors="coerce").fillna(0)
    session_df["hours"] = pd.to_numeric(session_df["hours"], errors="coerce").fillna(0)
    daily_df = (
        session_df
        .groupby("date")
        .agg(
            minutes=("minutes", "sum"),
            hours=("hours", "sum")
        )
        .reset_index()
    )
    daily_df["date"] = pd.to_datetime(daily_df["date"])
    start_date = pd.Timestamp("2025-10-01")
    end_date = pd.Timestamp.today()
    full_range = pd.date_range(start=start_date, end=end_date)
    full_df = pd.DataFrame({"date": full_range})
    daily_df = full_df.merge(daily_df, on="date", how="left")
    daily_df["minutes"] = daily_df["minutes"].fillna(0)
    daily_df["hours"] = daily_df["hours"].fillna(0)
    daily_df["date"] = daily_df["date"].dt.strftime("%Y-%m-%d")
    return daily_df

def add_summary_column(daily_df):
    summaries = []
    for _, row in daily_df.iterrows():
        hours_val = float(row["hours"])
        minutes_val = float(row["minutes"])
        hours = int(hours_val)
        minutes = int(minutes_val % 60)
        summaries.append(f"{hours} Hours {minutes} Min")
    daily_df["summary"] = summaries
    return daily_df

def daily_df_to_json(daily_df):
    daily_df = daily_df.fillna(0)
    records = daily_df.to_dict(orient="records")
    return records

def save_daily_json(records, path):
    upload_json(records, path)

def update_daily_sheet(sheet_id, worksheet_name, records):
    scopes = ["https://www.googleapis.com/auth/spreadsheets"]
    config = load_config()
    credentials = Credentials.from_service_account_info(
        config["google"],
        scopes=scopes
    )
    client = gspread.authorize(credentials)
    sheet = client.open_by_key(sheet_id)
    worksheet = sheet.worksheet(worksheet_name)
    df = pd.DataFrame(records)
    df["Date"] = pd.to_datetime(df["date"]).dt.strftime("%m/%d/%Y")
    df = df.rename(columns={
        "minutes": "Minutes",
        "hours": "Hours",
        "summary": "Summary"
    })
    df = df[["Date", "Minutes", "Hours", "Summary"]]
    final_rows = [df.columns.tolist()] + df.values.tolist()
    worksheet.update(
        range_name="A1",
        values=final_rows
    )
    print("Sheet rebuilt from analytics.")
    apply_monthly_formatting(sheet, worksheet, df)

def apply_monthly_formatting(sheet, worksheet, df):
    sheet_id = worksheet.id
    requests = []
    dates = pd.to_datetime(df["Date"], format="%m/%d/%Y")
    current_month = None
    start_row = None
    for idx, date_obj in enumerate(dates):
        month = date_obj.month
        sheet_row = idx + 1
        if current_month is None:
            current_month = month
            start_row = sheet_row
        elif month != current_month:
            end_row = sheet_row
            if current_month % 2 == 0:
                color = {"red": 0.4, "green": 0.698, "blue": 1.0} 
            else:
                color = {"red": 0.0, "green": 0.47, "blue": 0.84}
            requests.append({
                "repeatCell": {
                    "range": {
                        "sheetId": sheet_id,
                        "startRowIndex": start_row,
                        "endRowIndex": end_row,
                        "startColumnIndex": 0,
                        "endColumnIndex": 4
                    },
                    "cell": {
                        "userEnteredFormat": {
                            "backgroundColor": color
                        }
                    },
                    "fields": "userEnteredFormat.backgroundColor"
                }
            })
            current_month = month
            start_row = sheet_row

    if current_month is not None:
        end_row = len(df) + 1
        if current_month % 2 == 0:
            color = {"red": 0.4, "green": 0.698, "blue": 1.0}
        else:
            color = {"red": 0.0, "green": 0.47, "blue": 0.84} 
        requests.append({
            "repeatCell": {
                "range": {
                    "sheetId": sheet_id,
                    "startRowIndex": start_row,
                    "endRowIndex": end_row,
                    "startColumnIndex": 0,
                    "endColumnIndex": 4
                },
                "cell": {
                    "userEnteredFormat": {
                        "backgroundColor": color
                    }
                },
                "fields": "userEnteredFormat.backgroundColor"
            }
        })

    if requests:
        sheet.batch_update({"requests": requests})
    print("Monthly block formatting applied.")

def run_daily_analytics():
    session_df = load_sessions("JsonRes/time_tracker_structured.json")
    daily_df = compute_daily_hours(session_df)
    daily_df = add_summary_column(daily_df)
    records = daily_df_to_json(daily_df)
    save_daily_json(records, "Automation/daily_hours.json")
    update_daily_sheet(
        "1x0CJgCUpj-DDvGyClKXdc9OhBpOwNO9AUIdoZ1nnAvM",   # spreadsheet ID
        "Day-Hours-Review",                              # worksheet name
        records
    )

if __name__ == "__main__":
    print("Running Daily Hours Analytics Pipeline...")
    try:
        run_daily_analytics()
        print("Daily hours calculation completed successfully.")
    except Exception as e:
        print("Error occurred during analytics pipeline:")
        print(e)
        