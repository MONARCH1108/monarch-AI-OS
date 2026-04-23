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

  const COLORS = ["#1890ff", "#ff4d4f", "#8c8c8c"];

  return (
    <div className="Testing">
      <h3>Monthly Consistency</h3>
      <PieChart width={260} height={260}>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={90}
          dataKey="value"
          label={({ value }) => value}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Pie>

        <Tooltip formatter={(value, name) => [`${value} days`, name]} />
      </PieChart>
    </div>
  );
}

export default MonthlyStreak;