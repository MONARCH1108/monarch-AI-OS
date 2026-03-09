import json
import pandas as pd
import gspread
from google.oauth2.service_account import Credentials

def load_daily_hours(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return pd.DataFrame(data)


def compute_weekly_hours(daily_df):
    daily_df["date"] = pd.to_datetime(daily_df["date"])
    iso = daily_df["date"].dt.isocalendar()
    daily_df["iso_year"] = iso.year
    daily_df["iso_week"] = iso.week
    weekly_df = (
        daily_df
        .groupby(["iso_year", "iso_week"])
        .agg(
            minutes=("minutes", "sum"),
            hours=("hours", "sum"),
            start_date=("date", "min"),
            end_date=("date", "max")
        )
        .reset_index()
    )
    weekly_df["start_date"] = weekly_df["start_date"].dt.strftime("%Y-%m-%d")
    weekly_df["end_date"] = weekly_df["end_date"].dt.strftime("%Y-%m-%d")
    weekly_df["week_label"] = (
        weekly_df["iso_year"].astype(str)
        + "-W"
        + weekly_df["iso_week"].astype(str)
    )
    return weekly_df


def add_weekly_summary(weekly_df):
    summaries = []
    for _, row in weekly_df.iterrows():
        hours_val = float(row["hours"])
        minutes_val = float(row["minutes"])
        hours = int(hours_val)
        minutes = int(minutes_val % 60)
        summaries.append(f"{hours} Hours {minutes} Min")
    weekly_df["summary"] = summaries
    return weekly_df


def weekly_df_to_json(weekly_df):
    weekly_df = weekly_df.fillna(0)
    records = weekly_df.to_dict(orient="records")
    return records


def save_weekly_json(records, path):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=4)

def apply_weekly_formatting(sheet, worksheet, df):
    sheet_id = worksheet.id
    requests = []
    start_dates = pd.to_datetime(df["Start"], format="%Y-%m-%d")
    current_month = None
    start_row = None
    for idx, date_obj in enumerate(start_dates):
        month = date_obj.month
        sheet_row = idx + 1
        if current_month is None:
            current_month = month
            start_row = sheet_row
        elif month != current_month:
            end_row = sheet_row
            if current_month % 2 == 0:
                color = {"red": 0.059, "green": 0.616, "blue": 0.345}
            else:
                color = {"red": 0.957, "green": 0.894, "blue": 0.000}
            requests.append({
                "repeatCell": {
                    "range": {
                        "sheetId": sheet_id,
                        "startRowIndex": start_row,
                        "endRowIndex": end_row,
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
            current_month = month
            start_row = sheet_row
    if current_month is not None:
        end_row = len(df) + 1
        if current_month % 2 == 0:
            color = {"red": 0.059, "green": 0.616, "blue": 0.345}
        else:
            color = {"red": 0.957, "green": 0.894, "blue": 0.000}
        requests.append({
            "repeatCell": {
                "range": {
                    "sheetId": sheet_id,
                    "startRowIndex": start_row,
                    "endRowIndex": end_row,
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
    print("Weekly block formatting applied.")

def update_weekly_sheet(credentials_path, sheet_id, worksheet_name, records):
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
        "week_label": "Week",
        "minutes": "Minutes",
        "hours": "Hours",
        "summary": "Summary",
        "start_date": "Start",
        "end_date": "End"
    })
    df = df[["Week", "Start", "End", "Minutes", "Hours", "Summary"]]
    final_rows = [df.columns.tolist()] + df.values.tolist()
    worksheet.update(
        range_name="A1",
        values=final_rows
    )
    apply_weekly_formatting(sheet, worksheet, df)
    print("Weekly sheet updated.")


def run_weekly_analytics():
    daily_df = load_daily_hours("Automation/daily_hours.json")
    weekly_df = compute_weekly_hours(daily_df)
    weekly_df = add_weekly_summary(weekly_df)
    records = weekly_df_to_json(weekly_df)
    save_weekly_json(records, "Automation/weekly_hours.json")
    update_weekly_sheet(
        "config/Credentials.json",
        "1x0CJgCUpj-DDvGyClKXdc9OhBpOwNO9AUIdoZ1nnAvM",
        "Weekly-Review",
        records
    )


if __name__ == "__main__":
    print("Running Weekly Hours Analytics Pipeline...")
    try:
        run_weekly_analytics()
        print("Weekly hours calculation completed successfully.")
    except Exception as e:
        print("Error occurred during weekly analytics pipeline:")
        print(e)