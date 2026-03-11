import gspread
import pandas as pd
import json
from datetime import datetime
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

    # remove leading/trailing spaces
    dataset["Date"] = dataset["Date"].astype(str).str.strip()
    dataset["Objective"] = dataset["Objective"].astype(str).str.strip()

    # normalize objective case
    dataset["Objective"] = dataset["Objective"].apply(
        lambda x: x.title() if x != "" else x
    )

    return dataset


# ---------------------------------------------------
# FUNCTION 3
# Format Sheet1 TaskDesk Data → JSON
# ---------------------------------------------------
def format_sheet1_taskdesk_to_json(dataset):
    structured_data = []
    current_task = None
    for _, row in dataset.iterrows():
        date_str = row["Date"]

        # Skip rows like "October Month 2025"
        try:
            formatted_date = datetime.strptime(date_str, "%m/%d/%Y").strftime("%Y-%m-%d")
        except ValueError:
            continue

        if row["Task-ID"] != "":
            base_task_id = row["Task-ID"]
            unique_task_id = f"{formatted_date}-{base_task_id}"
            current_task = {
                "date": formatted_date,
                "objective": row["Objective"],
                "task_id": unique_task_id,
                "subtasks": []
            }
            if row["Task-Description"] != "":
                subtask = row["Task-Description"].lstrip("- ").strip()
                current_task["subtasks"].append(subtask)

            structured_data.append(current_task)
        else:
            if current_task and row["Task-Description"] != "":
                subtask = row["Task-Description"].lstrip("- ").strip()
                current_task["subtasks"].append(subtask)

    return structured_data

# ---------------------------------------------------
# MAIN EXECUTION
# ---------------------------------------------------

def main():
    credentials_path = "Server/config/Credentials.json"
    sheet_id = "1x0CJgCUpj-DDvGyClKXdc9OhBpOwNO9AUIdoZ1nnAvM"
    dataset = authenticate_and_fetch_sheet_data(credentials_path, sheet_id)
    dataset = clean_sheet1_taskdesk_data(dataset)
    structured_data = format_sheet1_taskdesk_to_json(dataset)
    with open("Server/JsonRes/task_desk_structured.json", "w", encoding="utf-8") as f:
        json.dump(structured_data, f, indent=4)
    print("Structured JSON created successfully.")


if __name__ == "__main__":
    main()