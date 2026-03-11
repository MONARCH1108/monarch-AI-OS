from Server.APIExtraction.GSheet_TaskDes import (
    clean_sheet1_taskdesk_data,
    format_sheet1_taskdesk_to_json
)
from Server.APIExtraction.GSheet_TimeTracker import (
    clean_sheet_time_tracker_data,
    format_sheet_time_tracker_to_json,
)
from Test.GSheet_DayHours import (
    clean_sheet_day_hours_data,
    format_sheet_day_hours_to_json
)
from Test.GSheet_WeekHours import (
    clean_sheet_week_hours_data,
    format_sheet_week_hours_to_json
)

import json
from mcp.server.fastmcp import FastMCP
import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

mcp = FastMCP("Personal Productivity System")
credentials_path = os.path.join(BASE_DIR, "config", "Credentials.json")
sheet_id = "1x0CJgCUpj-DDvGyClKXdc9OhBpOwNO9AUIdoZ1nnAvM"


# -------------------------------
# TOOL 1
# Get Task Desk Data
# -------------------------------

@mcp.tool()
async def get_task_desk_data() -> str:
    """
    Retrieve the structured Task Desk data from the Google Sheets productivity tracker.

    This tool fetches the main task planning sheet where each task contains:
    - date
    - objective
    - task ID
    - list of subtasks

    Use this tool when you need information about:
    • Planned tasks
    • Task objectives
    • Task descriptions or subtasks
    • Task planning history

    Returns:
        JSON array of task objects in the following structure:

        [
            {
                "date": "MM/DD/YYYY",
                "objective": "Main objective for the day",
                "task_id": "task-001",
                "subtasks": [
                    "Subtask description 1",
                    "Subtask description 2"
                ]
            }
        ]
    """

    from Server.APIExtraction.GSheet_TaskDes import authenticate_and_fetch_sheet_data as fetch_taskdesk_data

    dataset = fetch_taskdesk_data(credentials_path, sheet_id)
    dataset = clean_sheet1_taskdesk_data(dataset)
    structured_data = format_sheet1_taskdesk_to_json(dataset)
    return json.dumps(structured_data, indent=2)

# -------------------------------
# TOOL 2
# Get Time Tracker Data
# -------------------------------

@mcp.tool()
async def get_time_tracker_data() -> str:
    """
    Retrieve the structured Time Tracker data from the Google Sheets productivity tracker.

    This tool fetches time tracking information for tasks, including work sessions
    and time spent on each task.

    Use this tool when you need information about:
    • Time spent on tasks
    • Work sessions (clock in / clock out)
    • Productivity tracking
    • Task execution history

    Returns:
        JSON array of task time records with the following structure:

        [
            {
                "date": "MM/DD/YYYY",
                "day": "Monday",
                "task": "Task name",
                "task_id": "task-001",
                "category": "Coding",
                "status": "Completed",
                "sessions": [
                    {
                        "clock_in": "10:00",
                        "clock_out": "11:30",
                        "minutes": 90,
                        "hours": 1.5
                    }
                ]
            }
        ]
    """
    from Server.APIExtraction.GSheet_TimeTracker import authenticate_and_fetch_sheet_data as fetch_timetracker_data

    dataset = fetch_timetracker_data(credentials_path, sheet_id)
    dataset = clean_sheet_time_tracker_data(dataset)
    structured_data = format_sheet_time_tracker_to_json(dataset)

    return json.dumps(structured_data, indent=2)

# -------------------------------
# TOOL 3
# Get Day Hours Review Data
# -------------------------------

@mcp.tool()
async def get_day_hours_data() -> str:
    """
    Retrieve the structured Day Hours Review data from the productivity tracker.

    This tool fetches daily productivity hours recorded in the Day-Hours-Review sheet.

    Use this tool when you need information about:
    • Daily work hours
    • Total minutes worked per day
    • Daily productivity summaries
    • Work patterns across days

    Returns:
        JSON array of daily productivity records with the following structure:

        [
            {
                "date": "YYYY-MM-DD",
                "day": "Monday",
                "minutes": 607.77,
                "hours": 10.13,
                "summary": "10 Hours 8 Min"
            }
        ]
    """

    from Test.GSheet_DayHours import authenticate_and_fetch_sheet_data as fetch_dayhours_data

    dataset = fetch_dayhours_data(credentials_path, sheet_id)
    dataset = clean_sheet_day_hours_data(dataset)
    structured_data = format_sheet_day_hours_to_json(dataset)

    return json.dumps(structured_data, indent=2)

# -------------------------------
# TOOL 4
# Get Weekly Hours Review Data
# -------------------------------

@mcp.tool()
async def get_weekly_hours_data() -> str:
    """
    Retrieve the structured Weekly Hours Review data from the productivity tracker.

    This tool fetches weekly productivity summaries from the Weekly-Review sheet.

    Use this tool when you need information about:
    • Weekly productivity hours
    • Weekly work summaries
    • Work distribution across weeks
    • Monthly productivity totals

    Returns:
        JSON array of weekly productivity records with the following structure:

        [
            {
                "month": "October",
                "range": "12th - 18th",
                "hours": 28.79,
                "minutes": 1727.31,
                "summary": "28 Hrs 48 Min"
            }
        ]
    """

    from Test.GSheet_WeekHours import authenticate_and_fetch_sheet_data as fetch_weekhours_data

    dataset = fetch_weekhours_data(credentials_path, sheet_id)
    dataset = clean_sheet_week_hours_data(dataset)
    structured_data = format_sheet_week_hours_to_json(dataset)
    return json.dumps(structured_data, indent=2)

# -------------------------------
# Run MCP Server
# -------------------------------

if __name__ == "__main__":
    mcp.run()