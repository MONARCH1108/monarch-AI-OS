from Components.GSheet_TaskDes import (
    clean_sheet1_taskdesk_data,
    format_sheet1_taskdesk_to_json
)
from Components.GSheet_TimeTracker import (
    clean_sheet_time_tracker_data,
    format_sheet_time_tracker_to_json,
)

import json
from mcp.server.fastmcp import FastMCP


mcp = FastMCP("Personal Productivity System")
credentials_path = "config/Credentials.json"
sheet_id = "1x0CJgCUpj-DDvGyClKXdc9OhBpOwNO9AUIdoZ1nnAvM"


# -------------------------------
# TOOL 1
# Get Task Desk Data
# -------------------------------

@mcp.tool()
async def get_task_desk_data() -> str:
    """
    Fetch and return structured task desk data from Google Sheets.
    """

    from Components.GSheet_TaskDes import authenticate_and_fetch_sheet_data as fetch_taskdesk_data
    
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
    Fetch and return structured time tracker data from Google Sheets.
    """

    from Components.GSheet_TimeTracker import authenticate_and_fetch_sheet_data as fetch_timetracker_data

    dataset = fetch_timetracker_data(credentials_path, sheet_id)
    dataset = clean_sheet_time_tracker_data(dataset)
    structured_data = format_sheet_time_tracker_to_json(dataset)

    return json.dumps(structured_data, indent=2)

# -------------------------------
# Run MCP Server
# -------------------------------

if __name__ == "__main__":
    mcp.run()