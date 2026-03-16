import json
import pandas as pd
import gspread
from google.oauth2.service_account import Credentials

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from utils.s3_utils import upload_json, read_json


def load_daily_hours(json_path):
    data = read_json(json_path)
    return pd.DataFrame(data)


def compute_monthly_hours(daily_df):
    daily_df["date"] = pd.to_datetime(daily_df["date"])
    daily_df["year"] = daily_df["date"].dt.year
    daily_df["month"] = daily_df["date"].dt.month
    monthly_df = (
        daily_df
        .groupby(["year", "month"])
        .agg(
            minutes=("minutes", "sum"),
            hours=("hours", "sum"),
            start_date=("date", "min"),
            end_date=("date", "max")
        )
        .reset_index()
    )
    monthly_df["start_date"] = monthly_df["start_date"].dt.strftime("%Y-%m-%d")
    monthly_df["end_date"] = monthly_df["end_date"].dt.strftime("%Y-%m-%d")
    monthly_df["month_label"] = (
        monthly_df["year"].astype(str)
        + "-"
        + monthly_df["month"].astype(str).str.zfill(2)
    )
    return monthly_df


def add_monthly_summary(monthly_df):
    summaries = []
    for _, row in monthly_df.iterrows():
        hours_val = float(row["hours"])
        minutes_val = float(row["minutes"])
        hours = int(hours_val)
        minutes = int(minutes_val % 60)
        summaries.append(f"{hours} Hours {minutes} Min")
    monthly_df["summary"] = summaries
    return monthly_df


def monthly_df_to_json(monthly_df):
    monthly_df = monthly_df.fillna(0)
    records = monthly_df.to_dict(orient="records")
    return records

def save_monthly_json(records, path):
    upload_json(records, path)

def apply_monthly_formatting(sheet, worksheet, df):
    sheet_id = worksheet.id
    requests = []
    for idx, row in df.iterrows():
        month = int(row["Month"].split("-")[1])
        if month % 2 == 0:
            color = {"red": 0.4, "green": 0.698, "blue": 1.0}   # light blue
        else:
            color = {"red": 0.0, "green": 0.47, "blue": 0.84}    # bright blue
        requests.append({
            "repeatCell": {
                "range": {
                    "sheetId": sheet_id,
                    "startRowIndex": idx + 1,
                    "endRowIndex": idx + 2,
                    "startColumnIndex": 0,
                    "endColumnIndex": 6
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
    print("Monthly formatting applied.")

def update_monthly_sheet(credentials_path, sheet_id, worksheet_name, records):
    scopes = ["https://www.googleapis.com/auth/spreadsheets"]
    credentials = Credentials.from_service_account_file(
        credentials_path,
        scopes=scopes
    )
    client = gspread.authorize(credentials)
    sheet = client.open_by_key(sheet_id)
    worksheet = sheet.worksheet(worksheet_name)
    df = pd.DataFrame(records)
    df = df.rename(columns={
        "month_label": "Month",
        "minutes": "Minutes",
        "hours": "Hours",
        "summary": "Summary",
        "start_date": "Start",
        "end_date": "End"
    })
    df = df[["Month", "Start", "End", "Minutes", "Hours", "Summary"]]
    final_rows = [df.columns.tolist()] + df.values.tolist()
    worksheet.update(
        range_name="A1",
        values=final_rows
    )
    apply_monthly_formatting(sheet, worksheet, df)
    print("Monthly sheet updated.")

def run_monthly_analytics():
    daily_df = load_daily_hours("Automation/daily_hours.json")
    monthly_df = compute_monthly_hours(daily_df)
    monthly_df = add_monthly_summary(monthly_df)
    records = monthly_df_to_json(monthly_df)
    save_monthly_json(records, "Automation/monthly_hours.json")
    update_monthly_sheet(
        "config/Credentials.json",
        "1x0CJgCUpj-DDvGyClKXdc9OhBpOwNO9AUIdoZ1nnAvM",
        "Monthy-Review",
        records
    )

if __name__ == "__main__":
    print("Running Monthly Hours Analytics Pipeline...")
    try:
        run_monthly_analytics()
        print("Monthly hours calculation completed successfully.")
    except Exception as e:
        print("Error occurred during monthly analytics pipeline:")
        print(e)