import { useEffect, useState } from "react";
import {
  RadialBarChart,
  RadialBar
} from "recharts";
import "./DailyAvgHrs.css";

function DailyAvgHrs() {
  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [avgHours, setAvgHours] = useState(0);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const GOAL = 12;

  useEffect(() => {
    const controller = new AbortController();

    const fetchAvg = async () => {
      setLoading(true);
      setError(null);

      try {
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(
          "https://productivity-api-b5hg.onrender.com/analytics/daily",
          { signal: controller.signal }
        );

        clearTimeout(timeoutId);

        if (!res.ok) throw new Error("API error");

        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid data format");
        }

        // ✅ Safe date parsing + validation
        const parsedData = data.map((d) => {
          const date = new Date(d.date);
          date.setHours(0, 0, 0, 0);

          return {
            date,
            hours: typeof d.hours === "number" ? d.hours : 0
          };
        });

        // ✅ dynamic years
        const uniqueYears = [
          ...new Set(parsedData.map((d) => d.date.getFullYear()))
        ].sort((a, b) => b - a);

        setYears(uniqueYears.length ? uniqueYears : [today.getFullYear()]);

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const isCurrentMonth =
          selectedMonth === now.getMonth() &&
          selectedYear === now.getFullYear();

        // ✅ Filter relevant days
        const filtered = parsedData.filter((d) => {
          if (isNaN(d.date)) return false;

          if (isCurrentMonth) {
            return (
              d.date.getMonth() === selectedMonth &&
              d.date.getFullYear() === selectedYear &&
              d.date <= now
            );
          } else {
            return (
              d.date.getMonth() === selectedMonth &&
              d.date.getFullYear() === selectedYear
            );
          }
        });

        // ✅ STRICT AVG LOGIC (IMPORTANT)
        let totalDays = 0;

        if (isCurrentMonth) {
          totalDays = now.getDate(); // days till today
        } else {
          totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        }

        if (totalDays === 0) {
          setAvgHours(0);
          return;
        }

        const totalHours = filtered.reduce((sum, d) => sum + d.hours, 0);

        const avg = totalHours / totalDays;

        setAvgHours(Number(avg.toFixed(2)));

      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error fetching avg hours:", err);
          setError("Failed to load data");
          setAvgHours(0);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAvg();

    return () => controller.abort();
  }, [selectedMonth, selectedYear]);

  const percentage = Math.min((avgHours / GOAL) * 100, 100);

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  return (
    <div className="daily-avg-card">

      {/* HEADER */}
      <div className="daily-avg-header">
        <h3 className="daily-avg-title">Avg Hours / Day</h3>

        <div className="daily-avg-filters">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {months.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {(years.length ? years : [today.getFullYear()]).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* CHART */}
      <div className="daily-avg-chart">
        <RadialBarChart
          width={260}
          height={260}
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          barSize={10}
          startAngle={90}
          endAngle={-270}
          data={[
            { name: "bg", value: 100, fill: "#1e293b" },
            { name: "progress", value: percentage, fill: "#3b82f6" }
          ]}
        >
          <RadialBar dataKey="value" cornerRadius={10} clockWise />
        </RadialBarChart>

        <div className="daily-avg-center">
          <h2>{loading ? "--" : avgHours}</h2>
          <span>
            {loading ? "--" : error ? "Err" : `${Math.round(percentage)}%`}
          </span>
        </div>
      </div>

      <p className="daily-avg-goal">
        {error ? "Error loading data" : `Target: ${GOAL} hrs`}
      </p>

    </div>
  );
}

export default DailyAvgHrs;