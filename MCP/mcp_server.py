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


# ================================
# 🔹 MCP TOOLS
# ================================

@mcp.tool()
async def get_daily_hours(year: Optional[int] = None, month: Optional[int] = None) -> str:
    """
    Get daily productivity data
    """
    data = fetch_daily()   # ✅ reuse your existing S3 function
    filtered = filter_daily(data, year, month)

    return json.dumps(filtered, indent=2)


@mcp.tool()
async def get_weekly_hours(year: Optional[int] = None, month: Optional[int] = None) -> str:
    """
    Get weekly productivity data
    """
    data = fetch_weekly()
    filtered = filter_weekly(data, year, month)

    return json.dumps(filtered, indent=2)


@mcp.tool()
async def get_monthly_hours(year: Optional[int] = None) -> str:
    """
    Get monthly productivity data
    """
    data = fetch_monthly()
    filtered = filter_monthly(data, year)

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

    dates = [d["date"] for d in data]

    return json.dumps({
        "start_date": min(dates),
        "end_date": max(dates)
    }, indent=2)


# ================================
# 🔹 RUN SERVER (STDIO)
# ================================

if __name__ == "__main__":
    mcp.run()