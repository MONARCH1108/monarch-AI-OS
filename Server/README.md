# Productivity Analytics API

This `Server` folder contains a FastAPI service that:

- pulls task and time-tracker data from Google Sheets,
- converts that data into structured JSON files,
- computes daily, weekly, and monthly analytics,
- exposes the generated data through HTTP endpoints.

The API code lives in `server.py`.

## Run the server

From the `Server` directory:

```bash
python -m uvicorn server:app --reload
```

```bash
python -m uvicorn server:app --host 0.0.0.0 --port 8000
```

Default local URL:

```text
http://127.0.0.1:8000
```

Interactive docs:

```text
http://127.0.0.1:8000/docs
```

## Data flow

The pipeline runs in this order:

1. Read Task Desk data from Google Sheets.
2. Build `JsonRes/task_desk_structured.json`.
3. Read Time Tracker data from Google Sheets.
4. Build `JsonRes/time_tracker_structured.json`.
5. Build `Automation/daily_hours.json`.
6. Build `Automation/weekly_hours.json`.
7. Build `Automation/monthly_hours.json`.
8. Push daily, weekly, and monthly summaries back to Google Sheets.

## API endpoints

### `GET /health`

Checks whether the main generated JSON files exist.

Request body:

```json
null
```

Response shape:

```json
{
  "status": "ok",
  "service": "Productivity Analytics API",
  "checks": {
    "tasks_json_exists": true,
    "sessions_json_exists": true,
    "daily_json_exists": true
  }
}
```

### `POST /pipeline/run`

Runs the full pipeline:

- fetch Task Desk data,
- fetch Time Tracker data,
- compute daily analytics,
- compute weekly analytics,
- compute monthly analytics.

Request body:

```json
null
```

Successful response:

```json
{
  "status": "success",
  "message": "Pipeline executed successfully"
}
```

Notes:

- This endpoint does not currently read any JSON payload from the client.
- You do not pass any input fields in the request body.
- If Google Sheets credentials or sheet access fail, the endpoint returns HTTP `500`.

### `GET /tasks`

Returns the structured Task Desk data from `JsonRes/task_desk_structured.json`.

Request body:

```json
null
```

Response type:

```json
[
  {
    "date": "2025-10-13",
    "objective": "",
    "task_id": "2025-10-13-task-001",
    "subtasks": [
      "organizing the google sheets for daily activity tracking",
      "organizing all learning and To-Do tasks in Noiton"
    ]
  }
]
```

Field meanings:

- `date`: task date in `YYYY-MM-DD`
- `objective`: top-level objective from the Task Desk sheet
- `task_id`: unique task identifier built as `<date>-<Task-ID>`
- `subtasks`: list of task description lines grouped under that task

Data you pass to this endpoint:

```json
null
```

### `GET /analytics/daily`

Returns the daily analytics from `Automation/daily_hours.json`.

Request body:

```json
null
```

Response type:

```json
[
  {
    "date": "2025-10-13",
    "minutes": 285.36,
    "hours": 4.75,
    "summary": "4 Hours 45 Min"
  }
]
```

Field meanings:

- `date`: day in `YYYY-MM-DD`
- `minutes`: total tracked minutes for that day
- `hours`: total tracked hours for that day
- `summary`: human-readable summary string

Notes:

- The daily analytics file includes zero-value rows for dates with no tracked sessions.
- The current analytics code builds rows starting from `2025-10-01` through the day the pipeline runs.

Data you pass to this endpoint:

```json
null
```

### `GET /analytics/weekly`

Returns the weekly analytics from `Automation/weekly_hours.json`.

Request body:

```json
null
```

Response type:

```json
[
  {
    "iso_year": 2025,
    "iso_week": 42,
    "minutes": 1727.29,
    "hours": 28.77,
    "start_date": "2025-10-13",
    "end_date": "2025-10-19",
    "week_label": "2025-W42",
    "summary": "28 Hours 47 Min"
  }
]
```

Field meanings:

- `iso_year`: ISO week-numbering year
- `iso_week`: ISO week number
- `minutes`: total tracked minutes for that ISO week
- `hours`: total tracked hours for that ISO week
- `start_date`: first date included in the grouped week
- `end_date`: last date included in the grouped week
- `week_label`: formatted label like `2025-W42`
- `summary`: human-readable summary string

Data you pass to this endpoint:

```json
null
```

### `GET /analytics/monthly`

Returns the monthly analytics from `Automation/monthly_hours.json`.

Request body:

```json
null
```

Response type:

```json
[
  {
    "year": 2025,
    "month": 10,
    "minutes": 2447.49,
    "hours": 40.75,
    "start_date": "2025-10-01",
    "end_date": "2025-10-31",
    "month_label": "2025-10",
    "summary": "40 Hours 47 Min"
  }
]
```

Field meanings:

- `year`: calendar year
- `month`: calendar month number
- `minutes`: total tracked minutes for that month
- `hours`: total tracked hours for that month
- `start_date`: first date present in that month group
- `end_date`: last date present in that month group
- `month_label`: formatted label like `2025-10`
- `summary`: human-readable summary string

Data you pass to this endpoint:

```json
null
```

## Source data and generated files

### Google Sheets inputs

The pipeline reads from the spreadsheet configured in `server.py` using:

- `Sheet1` for Task Desk data
- `Time-Tracker` for session data

### Generated files

- `JsonRes/task_desk_structured.json`
- `JsonRes/time_tracker_structured.json`
- `Automation/daily_hours.json`
- `Automation/weekly_hours.json`
- `Automation/monthly_hours.json`

## Internal data formats

These are not directly exposed as separate endpoints, but they are part of the API pipeline.

### Time tracker structured JSON

Built by `Components/GSheet_TimeTracker.py` and saved to `JsonRes/time_tracker_structured.json`.

Current stored format is flattened per session:

```json
[
  {
    "session_id": "2025-10-13-task-001-s1",
    "date": "2025-10-13",
    "day": "",
    "task": "Organization",
    "task_id": "2025-10-13-task-001",
    "category": "PERSONAL",
    "status": "COMPLETED",
    "clock_in": "12:06:00",
    "clock_out": "13:00:49",
    "minutes": 54.81,
    "hours": 0.91
  }
]
```

Field meanings:

- `session_id`: unique session id built as `<task_id>-s<counter>`
- `date`: session date in `YYYY-MM-DD`
- `day`: day label from the sheet
- `task`: task name
- `task_id`: unique task id matched to Task Desk
- `category`: normalized uppercase category
- `status`: task status
- `clock_in`: normalized `HH:MM:SS`
- `clock_out`: normalized `HH:MM:SS`
- `minutes`: session duration in minutes
- `hours`: session duration in hours

## Project structure

```text
Server/
  server.py
  main.py
  Components/
    GSheet_TaskDes.py
    GSheet_TimeTracker.py
  Analytics/
    daily_hours_engine.py
    weekly_hours_engine.py
    monthly_hours_engine.py
  JsonRes/
    task_desk_structured.json
    time_tracker_structured.json
  Automation/
    daily_hours.json
    weekly_hours.json
    monthly_hours.json
```

## Important implementation note

The current FastAPI service exposes these routes only:

- `GET /health`
- `POST /pipeline/run`
- `GET /tasks`
- `GET /analytics/daily`
- `GET /analytics/weekly`
- `GET /analytics/monthly`

There are currently no POST endpoints that accept user JSON payloads other than `POST /pipeline/run`, and that route also expects no request body.
