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
    <h3 className="monthly-streak-title">Monthly Consistency</h3>

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

    {/* CENTERED CHART */}
    <div className="monthly-streak-chart-wrapper">
      <div className="monthly-streak-chart">
        <PieChart width={260} height={260}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={0}
            dataKey="value"
            labelLine={false}
            label={({ cx, cy, midAngle, outerRadius, value }) => {
              const RADIAN = Math.PI / 180;
              const radius = outerRadius * 0.65;
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);

              return (
                <text
                  x={x}
                  y={y}
                  fill="#fff"
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{ fontSize: 12, fontWeight: 500 }}
                >
                  {value}
                </text>
              );
            }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>

          <Tooltip formatter={(value, name) => [`${value} days`, name]} />
        </PieChart>
      </div>
    </div>

  </div>
</div>
  );
}

export default MonthlyStreak;