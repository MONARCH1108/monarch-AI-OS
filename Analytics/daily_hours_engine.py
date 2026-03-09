import json
import pandas as pd
import gspread
from datetime import datetime
from google.oauth2.service_account import Credentials

def load_sessions(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
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

    # START DATE FIX
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
    with open(path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=4)

def update_daily_sheet(credentials_path, sheet_id, worksheet_name, records):

    scopes = ["https://www.googleapis.com/auth/spreadsheets"]

    credentials = Credentials.from_service_account_file(
        credentials_path,
        scopes=scopes
    )

    client = gspread.authorize(credentials)

    sheet = client.open_by_key(sheet_id)
    worksheet = sheet.worksheet(worksheet_name)

    # Build dataframe directly from analytics
    df = pd.DataFrame(records)

    df["Date"] = pd.to_datetime(df["date"]).dt.strftime("%m/%d/%Y")

    df = df.rename(columns={
        "minutes": "Minutes",
        "hours": "Hours",
        "summary": "Summary"
    })

    df = df[["Date", "Minutes", "Hours", "Summary"]]

    # Convert dataframe to sheet rows
    final_rows = [df.columns.tolist()] + df.values.tolist()

    # Replace entire sheet
    worksheet.clear()

    worksheet.update(
        range_name="A1",
        values=final_rows
    )

    print("Sheet rebuilt from analytics.")

    # Apply monthly colors
    apply_monthly_formatting(sheet, worksheet, df)

def apply_monthly_formatting(sheet, worksheet, df):

    sheet_id = worksheet.id
    requests = []

    for i, date_str in enumerate(df["Date"], start=1):

        date_obj = datetime.strptime(date_str, "%m/%d/%Y")
        month = date_obj.month

        if month % 2 == 0:
            color = {"red": 0.059, "green": 0.616, "blue": 0.345}  # green
        else:
            color = {"red": 0.957, "green": 0.894, "blue": 0.000}  # yellow

        requests.append({
            "repeatCell": {
                "range": {
                    "sheetId": sheet_id,
                    "startRowIndex": i,
                    "endRowIndex": i + 1,
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

    print("Monthly color formatting applied.")

def run_daily_analytics():
    session_df = load_sessions("JsonRes/time_tracker_structured.json")
    daily_df = compute_daily_hours(session_df)
    daily_df = add_summary_column(daily_df)
    records = daily_df_to_json(daily_df)
    save_daily_json(records, "JsonRes/daily_hours.json")
    update_daily_sheet(
        "config/Credentials.json",
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
        