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

  const GOAL = 12;

  useEffect(() => {
    const fetchAvg = async () => {
      try {
        const res = await fetch("https://productivity-api-b5hg.onrender.com/analytics/daily");
        const data = await res.json();

        if (!Array.isArray(data)) return;

        // 🔹 dynamic years
        const uniqueYears = [
          ...new Set(
            data.map((d) => new Date(d.date + "T00:00:00").getFullYear())
          )
        ].sort((a, b) => b - a);

        setYears(uniqueYears);

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const isCurrentMonth =
          selectedMonth === now.getMonth() &&
          selectedYear === now.getFullYear();

        const filtered = data.filter((d) => {
          const date = new Date(d.date + "T00:00:00");

          if (isCurrentMonth) {
            return (
              date.getMonth() === selectedMonth &&
              date.getFullYear() === selectedYear &&
              date <= now
            );
          } else {
            return (
              date.getMonth() === selectedMonth &&
              date.getFullYear() === selectedYear
            );
          }
        });

        if (filtered.length === 0) {
          setAvgHours(0);
          return;
        }

        const totalHours = filtered.reduce((sum, d) => sum + d.hours, 0);
        const avg = totalHours / filtered.length;

        setAvgHours(Number(avg.toFixed(2)));

      } catch (err) {
        console.error("Error fetching avg hours:", err);
      }
    };

    fetchAvg();
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
      {years.map((y) => (
        <option key={y} value={y}>{y}</option>
      ))}
    </select>
  </div>
</div>

      {/* CHART */}
      <div className="daily-avg-chart">
        <RadialBarChart
          width={140}
          height={140}
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
          <h2>{avgHours}</h2>
          <span>{Math.round(percentage)}%</span>
        </div>
      </div>

      <p className="daily-avg-goal">Target: {GOAL} hrs</p>

    </div>
  );
}

export default DailyAvgHrs;