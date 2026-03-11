# What this project is about
This is a personal productivity system for your own task management, time tracking, analytics, and AI-ready reporting workflows. It pulls data from your Google Sheets tracker, cleans and structures it into JSON, and exposes it through MCP tools so analytics and report generation can run on top of reliable data.

# Progress until now
As of 2026-03-08, the core data pipeline and analytics foundation are implemented and actively producing outputs.

- Structured datasets generated:
  - `task_desk_structured.json`: 99 tasks (`2025-10-13` to `2026-03-03`)
  - `time_tracker_structured.json`: 282 session records (`2025-10-13` to `2026-03-07`)
  - `day_hours_structured.json`: 151 day-level rows (`2025-10-01` to `2026-02-28`)
  - `week_hours_structured.json`: 26 week-level rows (months covered: October to February)
  - `daily_hours.json`: 80 computed analytics rows (`2025-10-13` to `2026-03-07`)
- MCP server is running with 4 data tools exposed for Task Desk, Time Tracker, Day Hours, and Weekly Hours.
- Daily analytics engine is implemented to aggregate session-level tracking into day-level totals and summaries, save JSON output, and write updates back to Google Sheets.

# Components added and everything
- `main.py`
  - FastMCP server setup for the personal productivity system.
  - 4 MCP tools:
    - `get_task_desk_data`
    - `get_time_tracker_data`
    - `get_day_hours_data`
    - `get_weekly_hours_data`
- `Components/GSheet_TaskDes.py`
  - Google Sheets auth + fetch for Task Desk (Sheet1).
  - Task desk cleaning and structuring into task-level JSON with subtasks.
- `Components/GSheet_TimeTracker.py`
  - Google Sheets auth + fetch for Time Tracker sheet.
  - Time tracker cleaning, time normalization, task/session structuring, and flattening.
- `Components/GSheet_DayHours.py`
  - Google Sheets auth + fetch for Day-Hours-Review sheet.
  - Day-hours cleaning and JSON formatting (`date`, `day`, `minutes`, `hours`, `summary`).
- `Components/GSheet_WeekHours.py`
  - Google Sheets auth + fetch for Weekly-Review sheet.
  - Week-hours cleaning and JSON formatting (`month`, `range`, `hours`, `minutes`, `summary`).
- `Analytics/daily_hours_engine.py`
  - Reads structured time tracker sessions.
  - Computes daily minute/hour totals.
  - Builds readable daily summaries.
  - Saves `JsonRes/daily_hours.json`.
  - Updates Day-Hours-Review sheet with computed metrics.
- `JsonRes/`
  - Stores generated structured and analytics JSON outputs used for tracking and report workflows.

Cmd for the Server app:
` python -m uvicorn server:app --reload `