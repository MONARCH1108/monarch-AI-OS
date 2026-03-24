# MCP (Model Context Protocol) Server - Analytics Tools

## Overview

This MCP server provides Claude with **real-time analytics and productivity data** through stdio. The server implements the Model Context Protocol using **FastMCP**, enabling Claude to fetch and analyze productivity metrics directly.

---

## 📡 How Tools Are Provided to Claude

The MCP server exposes tools through **stdio** using the FastMCP framework:

1. **Server Initialization**: The MCP server (`mcp_server.py`) initializes a FastMCP instance named "analytics"
2. **Tool Registration**: Each tool is decorated with `@mcp.tool()` and registered as a callable function
3. **Communication Protocol**: Tools are exposed via the Model Context Protocol (stdio-based JSON-RPC)
4. **Claude Integration**: Claude receives tool schemas and can invoke them asynchronously to fetch data

### Architecture

```
Claude (LLM) 
    ↓ (stdio communication)
MCP Server (FastMCP) 
    ↓ (tool calls)
Data Fetchers (boto3/S3) 
    ↓
S3 Storage (JSON data files)
```

---

## 🛠️ Available Tools

### 1. **get_daily_hours**
Fetch granular daily productivity data

**Parameters:**
- `year` (optional, int): Filter by year (e.g., 2026)
- `month` (optional, int): Filter by month (1-12)

**Response Schema:**
```json
[
  {
    "date": "2026-03-24",
    "minutes_worked": 480,
    "hours_worked": 8.0,
    "summary": "Productive day with focused work sessions"
  }
]
```

**Use Cases:**
- Analyze specific days or date ranges
- Detect daily habits and streaks
- Identify consistency patterns

---

### 2. **get_weekly_hours**
Fetch weekly productivity summaries

**Parameters:**
- `year` (optional, int): Filter by year
- `month` (optional, int): Filter by month (uses week start date)

**Response Schema:**
```json
[
  {
    "week_label": "2026-W12",
    "start_date": "2026-03-22",
    "end_date": "2026-03-28",
    "total_minutes": 3360,
    "total_hours": 56.0,
    "summary": "Very productive week"
  }
]
```

**Use Cases:**
- Track weekly productivity trends
- Compare productivity across weeks
- Identify peak and low-productivity weeks

---

### 3. **get_monthly_hours**
Fetch monthly productivity summaries

**Parameters:**
- `year` (optional, int): Filter by specific year

**Response Schema:**
```json
[
  {
    "month_label": "2026-03",
    "year": 2026,
    "month": 3,
    "start_date": "2026-03-01",
    "end_date": "2026-03-31",
    "total_hours": 224.0,
    "total_minutes": 13440,
    "summary": "Strong performance this month"
  }
]
```

**Use Cases:**
- High-level performance analysis
- Month-to-month comparison
- Long-term trend identification

---

### 4. **get_available_data_range**
Get the available date range for all analytics

**Parameters:** None

**Response Schema:**
```json
{
  "start_date": "2026-01-01",
  "end_date": "2026-03-31"
}
```

**Use Cases:**
- Validate available data before making requests
- Understand data boundaries
- Guard against invalid date requests

---

## 📊 Data Source & Storage

- **Data Format**: JSON (structured format)
- **Storage Backend**: AWS S3
- **Data Access**: Boto3 (Python AWS SDK)
- **Configuration**: AWS credentials loaded from `.env` file

### Required Environment Variables (.env)
```
AWS_ACCESS_KEY=your_access_key
AWS_SECRET_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your_bucket_name
```

---

## 🔄 Response Handling

All tools return JSON data with consistent error handling:

**Success Response:**
```json
[
  { "date": "...", "data": "..." }
]
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Data not available for the requested time range"
}
```

**Empty Response:**
```json
{
  "status": "empty",
  "message": "No data available for given filters"
}
```

---

## 🚀 Server Startup

To start the MCP server:

```bash
python mcp_server.py
```

The server exposes tools via stdio for Claude to consume through the MCP protocol.

---

## 📝 Notes

- All timestamps use ISO 8601 format (`YYYY-MM-DD`)
- Data is fetched from S3 on-demand (not cached in the MCP server)
- Tools include automatic validation and filtering
- Error messages are descriptive for debugging purposes
