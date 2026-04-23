import { useEffect, useState } from "react";
import "./MonthlyStreak.css";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

function MonthlyStreak() {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://productivity-api-b5hg.onrender.com/analytics/daily");
        const data = await res.json();
        if (!Array.isArray(data)) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0); // ✅ normalize

        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        const filteredDays = data.filter((d) => {
          const date = new Date(d.date + "T00:00:00"); // ✅ safe parsing
          return (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear &&
            date <= today
          );
        });

        const passedDays = filteredDays.length;

        // ✅ handle empty case
        if (passedDays === 0) {
          setChartData([
            { name: "Remaining", value: daysInMonth }
          ]);
          return;
        }

        const worked = filteredDays.filter((d) => d.hours > 0).length;
        const missed = passedDays - worked;
        const remaining = daysInMonth - passedDays;
        setChartData([
          { name: "Worked", value: worked },
          { name: "Missed", value: missed },
          { name: "Remaining", value: remaining }
        ]);

      } catch (err) {
        console.error("Error fetching daily data:", err);
      }
    };

    fetchData();
  }, []);

  const COLORS = ["#3b82f6", "#6b7280" ,"#d4af37"];

  return (
<div className="monthly-streak-card">
  <h3 className="monthly-streak-title">Monthly Consistency</h3>

  <div className="monthly-streak-chart">
    <PieChart width={260} height={260}>
<Pie
  data={chartData}
  cx="50%"
  cy="50%"
  outerRadius={90}   // full circle
  innerRadius={0}    // ❌ removes donut → makes it solid circle
  dataKey="value"
  labelLine={false}  // ❌ removes those small lines
  label={({ cx, cy, midAngle, outerRadius, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 0.65; // move text slightly inside
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

      <Tooltip
        formatter={(value, name) => [`${value} days`, name]}
      />
    </PieChart>
  </div>
</div>
  );
}

export default MonthlyStreak;