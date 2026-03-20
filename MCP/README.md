# MCP Productivity Analytics Server

A Model Context Protocol (MCP) server that provides productivity analytics tools for tracking and analyzing work hours data stored in AWS S3.

## Overview

This MCP server exposes three main tools for productivity analysis:
- **Daily Hours**: Granular day-by-day productivity tracking
- **Weekly Hours**: Weekly summaries and trend analysis
- **Monthly Hours**: High-level monthly performance insights

## Features

- 📊 **Multi-timeframe Analysis**: Daily, weekly, and monthly productivity insights
- 🔍 **Flexible Filtering**: Filter data by year and month
- ☁️ **AWS S3 Integration**: Secure data storage and retrieval
- ✅ **Data Validation**: Automatic range checking and error handling
- 📈 **Trend Analysis**: Built-in analytics for identifying patterns and streaks

## Prerequisites

- Python 3.12+
- AWS S3 bucket with productivity data
- AWS credentials with S3 read access

## Installation

1. **Clone or navigate to the MCP directory**
   ```bash
   cd /path/to/MCP
   ```

2. **Create and activate virtual environment**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install mcp-server-fastmcp boto3 python-dotenv
   ```

## Configuration

Create a `.env` file in the `utils/` directory with your AWS credentials:

```env
AWS_ACCESS_KEY=your_access_key_here
AWS_SECRET_KEY=your_secret_key_here
AWS_REGION=your_region_here
AWS_BUCKET_NAME=your_bucket_name_here
```

## Data Structure

The server expects JSON data files in your S3 bucket:

### Daily Hours (`Automation/daily_hours.json`)
```json
[
  {
    "date": "2024-01-01",
    "minutes": 480,
    "hours": 8.0,
    "summary": "Productive day with focused work sessions"
  }
]
```

### Weekly Hours (`Automation/weekly_hours.json`)
```json
[
  {
    "week_label": "2024-W01",
    "start_date": "2024-01-01",
    "end_date": "2024-01-07",
    "total_minutes": 2400,
    "total_hours": 40.0,
    "summary": "Consistent weekly performance"
  }
]
```

### Monthly Hours (`Automation/monthly_hours.json`)
```json
[
  {
    "month_label": "2024-01",
    "year": 2024,
    "month": 1,
    "total_hours": 160.0,
    "total_minutes": 9600,
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "summary": "Strong monthly productivity"
  }
]
```

## Usage

### Running the Server

```bash
python mcp_server.py
```

The server runs on stdio and can be integrated with MCP-compatible clients.

### Available Tools

#### `get_daily_hours(year?, month?)`
Fetches daily productivity data with optional year/month filtering.

**Parameters:**
- `year` (optional): Filter by specific year (e.g., 2024)
- `month` (optional): Filter by specific month (1-12)

**Use cases:**
- Detailed daily breakdown
- Habit and streak analysis
- Consistency tracking

#### `get_weekly_hours(year?, month?)`
Fetches weekly productivity summaries.

**Parameters:**
- `year` (optional): Filter by year
- `month` (optional): Filter by month (based on week start date)

**Use cases:**
- Weekly trend analysis
- Performance comparison across weeks

#### `get_monthly_hours(year?)`
Fetches monthly productivity summaries.

**Parameters:**
- `year` (optional): Filter by specific year

**Use cases:**
- High-level performance insights
- Long-term trend analysis
- Monthly comparisons

#### `get_available_data_range()`
Returns the date range of available data in the system.

## Architecture

```
MCP/
├── mcp_server.py          # Main MCP server with FastMCP
├── utils/
│   ├── config.py           # AWS S3 configuration and client setup
│   ├── get_daily_hours.py  # Daily data fetching utility
│   ├── get_weekly_hours.py # Weekly data fetching utility
│   └── get_monthly_hours.py# Monthly data fetching utility
└── .venv/                  # Python virtual environment
```

## Error Handling

The server includes comprehensive error handling:
- **Data Validation**: Checks if requested date ranges exist
- **AWS Errors**: Handles S3 connection and permission issues
- **Empty Results**: Returns structured messages for no-data scenarios
- **Input Validation**: Validates year/month parameters

## Development

### Adding New Tools

1. Define your tool function with `@mcp.tool()` decorator
2. Add proper type hints and docstrings
3. Include parameter validation
4. Return JSON-formatted responses

### Testing

Run individual utilities for testing:

```bash
python utils/get_daily_hours.py
python utils/get_weekly_hours.py
python utils/get_monthly_hours.py
```

## Security Notes

- AWS credentials are loaded from environment variables
- Never commit `.env` files to version control
- Use IAM roles with minimal required permissions for S3 access
- Data is fetched securely via HTTPS from AWS S3

## Contributing

1. Follow the existing code structure and naming conventions
2. Add comprehensive docstrings to new functions
3. Include error handling for edge cases
4. Test with various data scenarios
5. Update this README for any new features

## License

[Add your license information here]