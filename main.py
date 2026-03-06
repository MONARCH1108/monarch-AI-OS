import gspread
import io
import pandas as pd
import json
from google.oauth2.service_account import Credentials

# -------------------------------
# Google Sheets Authentication
# -------------------------------
scopes = ["https://www.googleapis.com/auth/spreadsheets"]

credentials = Credentials.from_service_account_file(
    "Credentials.json",
    scopes=scopes
)

client = gspread.authorize(credentials)

sheet_id = "1x0CJgCUpj-DDvGyClKXdc9OhBpOwNO9AUIdoZ1nnAvM"
sheet = client.open_by_key(sheet_id)

# -------------------------------
# Fetch Data
# -------------------------------
data = sheet.sheet1.get_all_values()
dataset = pd.DataFrame(data[1:], columns=data[0])

# -------------------------------
# CLEANING STEP
# -------------------------------

# Replace empty strings with NaN
dataset.replace("", pd.NA, inplace=True)

# Forward fill Date & Objective
dataset["Date"] = dataset["Date"].ffill()
dataset["Objective"] = dataset["Objective"].ffill()

# -------------------------------
# STRUCTURING STEP
# -------------------------------

structured_data = []

current_task = None

for _, row in dataset.iterrows():
    if pd.notna(row["Task-ID"]):
        # New task starts
        current_task = {
            "date": row["Date"],
            "objective": row["Objective"],
            "task_id": row["Task-ID"],
            "task_description": row["Task-Description"],
            "subtasks": []
        }
        structured_data.append(current_task)
    else:
        # Subtask row
        if current_task and pd.notna(row["Task-Description"]):
            current_task["subtasks"].append(row["Task-Description"])

# -------------------------------
# SAVE CLEAN CSV
# -------------------------------
dataset.to_csv("task_desk_cleaned.csv", index=False, encoding="utf-8")

# -------------------------------
# SAVE STRUCTURED JSON
# -------------------------------
with open("task_desk_structured.json", "w", encoding="utf-8") as f:
    json.dump(structured_data, f, indent=4)

print("Dataset cleaned and structured successfully.")