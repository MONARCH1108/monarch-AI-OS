import gspread
import pandas as pd
import json
from google.oauth2.service_account import Credentials


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
    data = sheet.sheet1.get_all_values()
    dataset = pd.DataFrame(data[1:], columns=data[0])
    return dataset


# ---------------------------------------------------
# FUNCTION 2
# Cleaning logic specific to Sheet1 TaskDesk
# ---------------------------------------------------
def clean_sheet1_taskdesk_data(dataset):
    dataset.replace("", pd.NA, inplace=True)
    dataset["Date"] = dataset["Date"].ffill()
    dataset["Objective"] = dataset["Objective"].ffill()
    dataset = dataset.fillna("")
    return dataset


# ---------------------------------------------------
# FUNCTION 3
# Format Sheet1 TaskDesk Data → JSON
# ---------------------------------------------------
def format_sheet1_taskdesk_to_json(dataset):
    structured_data = []
    current_task = None
    for _, row in dataset.iterrows():
        if row["Task-ID"] != "":
            current_task = {
                "date": row["Date"],
                "objective": row["Objective"],
                "task_id": row["Task-ID"],
                "subtasks": []
            }

            if row["Task-Description"] != "":
                current_task["subtasks"].append(row["Task-Description"])
            structured_data.append(current_task)
        else:
            if current_task and row["Task-Description"] != "":
                current_task["subtasks"].append(row["Task-Description"])

    return structured_data


# ---------------------------------------------------
# MAIN EXECUTION
# ---------------------------------------------------

def main():
    credentials_path = "config/Credentials.json"
    sheet_id = "1x0CJgCUpj-DDvGyClKXdc9OhBpOwNO9AUIdoZ1nnAvM"
    dataset = authenticate_and_fetch_sheet_data(credentials_path, sheet_id)
    dataset = clean_sheet1_taskdesk_data(dataset)
    structured_data = format_sheet1_taskdesk_to_json(dataset)
    with open("JsonRes/task_desk_structured.json", "w", encoding="utf-8") as f:
        json.dump(structured_data, f, indent=4)
    print("Structured JSON created successfully.")


if __name__ == "__main__":
    main()