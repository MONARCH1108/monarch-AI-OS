import { useEffect, useState } from "react";
import "./MonthlyStreak.css";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

function MonthlyStreak() {
  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [chartData, setChartData] = useState([]);
  const [years, setYears] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://productivity-api-b5hg.onrender.com/analytics/daily");
        const data = await res.json();
        if (!Array.isArray(data)) return;

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        // ✅ Extract years dynamically from API
        const uniqueYears = [
          ...new Set(
            data.map((d) => new Date(d.date + "T00:00:00").getFullYear())
          ),
        ].sort((a, b) => b - a);

        setYears(uniqueYears);

        const isCurrentMonth =
          selectedMonth === now.getMonth() &&
          selectedYear === now.getFullYear();

        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

        const filteredDays = data.filter((d) => {
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

        const passedDays = filteredDays.length;

        if (passedDays === 0) {
          setChartData([{ name: "Remaining", value: daysInMonth }]);
          return;
        }

        const worked = filteredDays.filter((d) => d.hours > 0).length;
        const missed = passedDays - worked;
        const remaining = isCurrentMonth
          ? daysInMonth - passedDays
          : 0;

        setChartData([
          { name: "Worked", value: worked },
          { name: "Missed", value: missed },
          ...(remaining > 0 ? [{ name: "Remaining", value: remaining }] : []),
        ]);

      } catch (err) {
        console.error("Error fetching daily data:", err);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear]);

  const COLORS = ["#3b82f6", "#6b7280", "#d4af37"];

  const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
  ];

return (
  <div className="monthly-streak-card">

    {/* HEADER */}
    <div className="monthly-streak-header">
      <h3 className="monthly-streak-title">Monthly Streak</h3>

      <div className="monthly-streak-filters">
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

    {/* BODY */}
    <div className="monthly-streak-body">

      <div className="monthly-streak-chart-wrapper">

        {/* CHART */}
        <div className="monthly-streak-chart">
          <PieChart width={220} height={220}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={85}
              innerRadius={38}
              dataKey="value"
              labelLine={false}
              strokeWidth={0}
              paddingAngle={2}
              label={({ cx, cy, midAngle, outerRadius, value }) => {
                const RADIAN = Math.PI / 180;
                const radius = outerRadius * 0.72;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                return (
                  <text
                    x={x}
                    y={y}
                    fill="#f0e8d0"
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{ fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}
                  >
                    {value}
                  </text>
                );
              }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.name === "Worked"
                      ? "#3b82f6"
                      : entry.name === "Missed"
                      ? "#6b7280"
                      : "#d4af37"
                  }
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value, name) => [`${value} days`, name]}
              contentStyle={{
                background: "#0d0d0d",
                border: "1px solid rgba(212,175,55,0.25)",
                borderRadius: "10px",
                color: "#f0e8d0",
                fontFamily: "'DM Mono', monospace",
                fontSize: "10px",
                letterSpacing: "0.5px",
              }}
              labelStyle={{ color: "#d4af37", fontWeight: 700 }}
              itemStyle={{ color: "#7a7264" }}
            />
          </PieChart>
        </div>

        {/* LEGEND */}
        <div className="monthly-streak-legend">
          {chartData.map((entry) => (
            <div key={entry.name} className="monthly-streak-legend-item">
              <span
                className="monthly-streak-legend-dot"
                style={{
                  background:
                    entry.name === "Worked"
                      ? "#3b82f6"
                      : entry.name === "Missed"
                      ? "#6b7280"
                      : "#d4af37",
                  border:
                    entry.name === "Remaining"
                      ? "1px solid rgba(212,175,55,0.2)"
                      : "none",
                }}
              />
              <span className="monthly-streak-legend-label">{entry.name}</span>
              <span className="monthly-streak-legend-value">{entry.value}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  </div>
);
}

export default MonthlyStreak;