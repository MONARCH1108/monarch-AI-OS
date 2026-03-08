import json
import pandas as pd
import gspread
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

    rows = worksheet.get_all_values()

    for record in records:

        date = record["date"]

        for i, row in enumerate(rows):

            if row[0] == date:

                worksheet.update(
                    f"C{i+1}:E{i+1}",
                    [[
                        record["minutes"],
                        record["hours"],
                        record["summary"]
                    ]]
                )

                break

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
        