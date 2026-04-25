import { useEffect, useState } from "react";
import { RadialBarChart, RadialBar } from "recharts";
import "./WeeklyAvgHours.css";

function WeeklyAvgHours() {
  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [avgHours, setAvgHours] = useState(0);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const GOAL = 60;

  useEffect(() => {
    const controller = new AbortController();

    const fetchAvg = async () => {
      setLoading(true);
      setError(null);

      try {
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(
          "https://productivity-api-b5hg.onrender.com/analytics/weekly",
          { signal: controller.signal }
        );

        clearTimeout(timeoutId);

        if (!res.ok) throw new Error("API error");

        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid data");
        }

        // ✅ safe parsing
        const parsed = data.map((w) => ({
          start: new Date(w.start_date),
          end: new Date(w.end_date),
          hours: typeof w.hours === "number" ? w.hours : 0,
          year: w.iso_year
        }));

        // ✅ dynamic years
        const uniqueYears = [
          ...new Set(parsed.map((w) => w.year))
        ].sort((a, b) => b - a);

        setYears(uniqueYears.length ? uniqueYears : [today.getFullYear()]);

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const isCurrentMonth =
          selectedMonth === now.getMonth() &&
          selectedYear === now.getFullYear();

        const monthStart = new Date(selectedYear, selectedMonth, 1);
        const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);

        // ✅ FILTER weeks overlapping month
        const filteredWeeks = parsed.filter((w) => {
          if (isNaN(w.start) || isNaN(w.end)) return false;

          const overlaps =
            w.start <= monthEnd && w.end >= monthStart;

            if (isCurrentMonth) {
              return overlaps && w.end <= now; // only completed weeks
            }

          return overlaps;
        });

        // ✅ STRICT WEEK COUNT (IMPORTANT)
        const getWeeksInMonth = () => {
          let count = 0;

          const temp = new Date(monthStart);

          while (temp <= monthEnd) {
            const weekStart = new Date(temp);
            weekStart.setDate(temp.getDate() - temp.getDay());

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);

            if (weekEnd >= monthStart && weekStart <= monthEnd) {
              if (isCurrentMonth && weekStart > now) break;
              count++;
            }

            temp.setDate(temp.getDate() + 7);
          }

          return count;
        };

        const totalWeeks = getWeeksInMonth();

        if (totalWeeks === 0) {
          setAvgHours(0);
          return;
        }

        const totalHours = filteredWeeks.reduce(
          (sum, w) => sum + w.hours,
          0
        );

        const avg = totalHours / totalWeeks;

        setAvgHours(Number(avg.toFixed(2)));

      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error fetching weekly avg:", err);
          setError("Failed to load");
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
  <div className="weekly-avg-card">

    <div className="weekly-avg-header">
      <h3 className="weekly-avg-title">Avg Hours / Week</h3>

      <div className="weekly-avg-filters">
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

    <div className="weekly-avg-chart">
      <RadialBarChart
        width={220}
        height={220}
        cx="50%"
        cy="50%"
        innerRadius="68%"
        outerRadius="100%"
        barSize={8}
        startAngle={90}
        endAngle={-270}
        data={[
          { name: "bg",       value: 100,       fill: "#0d0d0d" },
          { name: "progress", value: percentage, fill: "#3b82f6" }
        ]}
      >
        <RadialBar dataKey="value" cornerRadius={8} clockWise />
      </RadialBarChart>

      <div className="weekly-avg-center">
        <h2>{loading ? "--" : avgHours}</h2>
        <span>
          {loading ? "--" : error ? "Err" : `${Math.round(percentage)}%`}
        </span>
      </div>
    </div>

    <p className="weekly-avg-goal">
      {error ? "Error loading data" : `Target — ${GOAL} hrs / week`}
    </p>

  </div>
);
}

export default WeeklyAvgHours;