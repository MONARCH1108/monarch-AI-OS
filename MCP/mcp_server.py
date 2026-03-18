from typing import Optional
import json
from datetime import datetime
from mcp.server.fastmcp import FastMCP

from utils.get_daily_hours import get_daily_hours as fetch_daily
from utils.get_weekly_hours import get_weekly_hours as fetch_weekly
from utils.get_monthly_hours import get_monthly_hours as fetch_monthly

mcp = FastMCP("analytics")

# ================================
# 🔹 FILTER HELPERS
# ================================

def filter_daily(data, year=None, month=None):
    if not year and not month:
        return data
    filtered = []
    for item in data:
        date_obj = datetime.strptime(item["date"], "%Y-%m-%d")

        if year and date_obj.year != year:
            continue
        if month and date_obj.month != month:
            continue

        filtered.append(item)

    return filtered


def filter_weekly(data, year=None, month=None):
    if not year and not month:
        return data

    filtered = []
    for item in data:
        start_date = datetime.strptime(item["start_date"], "%Y-%m-%d")

        if year and start_date.year != year:
            continue
        if month and start_date.month != month:
            continue

        filtered.append(item)

    return filtered


def filter_monthly(data, year=None):
    if not year:
        return data

    return [item for item in data if item["year"] == year]

def validate_date_range(year, month, data):
    dates = [datetime.strptime(d["date"], "%Y-%m-%d") for d in data]
    min_date = min(dates)
    max_date = max(dates)

    if year:
        if year < min_date.year or year > max_date.year:
            return False

    if month and year:
        test_date = datetime(year, month, 1)
        if test_date < min_date or test_date > max_date:
            return False

    return True



# ================================
# 🔹 MCP TOOLS
# ================================

@mcp.tool()
async def get_daily_hours(year: Optional[int] = None, month: Optional[int] = None) -> str:
    """
    Fetch daily productivity data.

    Use this when:
    - User asks about specific days
    - User wants detailed breakdown
    - User asks about habits, streaks, or consistency

    Parameters:
    - year (optional): e.g. 2026
    - month (optional): 1–12

    Behavior:
    - If filters are provided → return only matching dates
    - If no filters → return full dataset

    Data contains:
    - date
    - minutes worked
    - hours worked
    - summary string

    Important:
    - Always use this tool for granular analysis
    - Useful for detecting patterns, streaks, and daily trends
    """
    data = fetch_daily()

    # ✅ validation
    if not validate_date_range(year, month, data):
        return json.dumps({
            "status": "error",
            "message": "Data not available for the requested time range"
        })

    filtered = filter_daily(data, year, month)

    # ✅ empty handling
    if not filtered:
        return json.dumps({
            "status": "empty",
            "message": "No data available for given filters"
        })

    return json.dumps(filtered, indent=2)


@mcp.tool()
async def get_weekly_hours(year: Optional[int] = None, month: Optional[int] = None) -> str:
    """
    Fetch weekly productivity summaries.

    Use this when:
    - User asks for weekly performance
    - User wants trend analysis across weeks
    - Comparing productivity across time

    Parameters:
    - year (optional)
    - month (optional, filters based on week start date)

    Data contains:
    - week_label (ISO week)
    - start_date, end_date
    - total minutes and hours
    - summary

    Important:
    - Best for trend analysis
    - Helps identify productive vs unproductive weeks
    """
    data = fetch_weekly()

    # ✅ validation (use start_date)
    if year or month:
        valid = False
        for item in data:
            start_date = datetime.strptime(item["start_date"], "%Y-%m-%d")

            if year and start_date.year != year:
                continue
            if month and start_date.month != month:
                continue

            valid = True
            break

        if not valid:
            return json.dumps({
                "status": "error",
                "message": "Data not available for the requested time range"
            })

    filtered = filter_weekly(data, year, month)

    # ✅ empty handling
    if not filtered:
        return json.dumps({
            "status": "empty",
            "message": "No data available for given filters"
        })

    return json.dumps(filtered, indent=2)


@mcp.tool()
async def get_monthly_hours(year: Optional[int] = None) -> str:
    """
    Fetch monthly productivity summaries.

    Use this when:
    - User asks about overall performance
    - Long-term trends
    - Comparing months

    Parameters:
    - year (optional)

    Data contains:
    - month_label (YYYY-MM)
    - total hours and minutes
    - start_date, end_date
    - summary

    Important:
    - Best for high-level insights
    - Useful for performance comparison
    """
    data = fetch_monthly()

    # ✅ validation
    if year:
        years = [item["year"] for item in data]
        if year not in years:
            return json.dumps({
                "status": "error",
                "message": "Data not available for the requested year"
            })

    filtered = filter_monthly(data, year)

    # ✅ empty handling
    if not filtered:
        return json.dumps({
            "status": "empty",
            "message": "No data available for given filters"
        })

    return json.dumps(filtered, indent=2)


# ================================
# 🔹 EXTRA TOOL (VERY USEFUL)
# ================================

@mcp.tool()
async def get_available_data_range() -> str:
    """
    Get available data range for analytics
    """

    data = fetch_daily()

    dates = [datetime.strptime(d["date"], "%Y-%m-%d") for d in data]

    return json.dumps({
        "start_date": min(dates).strftime("%Y-%m-%d"),
        "end_date": max(dates).strftime("%Y-%m-%d")
    }, indent=2)

@mcp.resource("analytics://instructions")
def analytics_instructions() -> str:
    """
    Core behavioral instructions for analytics assistant
    """
    return """
You are a productivity analytics assistant connected to a local MCP server.

Your responsibilities:

1. ALWAYS check data availability before answering
   - First determine available date range using available tools/resources
   - If user asks outside available range → respond:
     "Data not available for the requested time range"
   - Do NOT hallucinate or assume missing data

2. ALWAYS use tools when data is required
   - Never guess values
   - Use:
     - get_daily_hours → daily analysis
     - get_weekly_hours → weekly trends
     - get_monthly_hours → high-level insights

3. ALWAYS apply filters correctly
   - Extract year/month from user query
   - If not provided → fetch full dataset

4. ALWAYS analyze, not just return data
   - Identify trends
   - Highlight peaks and low performance
   - Detect consistency patterns
   - Provide actionable suggestions

5. RESPONSE FORMAT:
   - Summary (1–2 lines)
   - Key Insights (bullet points)
   - Suggestions

6. NEVER:
   - fabricate data
   - ignore missing ranges
   - dump raw JSON unless explicitly asked

You are an intelligent analytics assistant, not a raw data API.
"""


# ================================
# 🔹 RUN SERVER (STDIO)
# ================================

if __name__ == "__main__":
    mcp.run()