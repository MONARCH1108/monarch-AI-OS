import { useEffect, useState } from "react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer
} from "recharts";
import "./DailyAvgHrs.css";

function DailyAvgHrs() {
  const [avgHours, setAvgHours] = useState(0);

  const GOAL = 8;

  useEffect(() => {
    const fetchAvg = async () => {
      try {
        const res = await fetch("https://productivity-api-b5hg.onrender.com/analytics/daily");
        const data = await res.json();

        if (!Array.isArray(data)) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const filtered = data.filter((d) => {
          const date = new Date(d.date + "T00:00:00");
          return (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear &&
            date <= today
          );
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
  }, []);

  // 🔥 percentage
  const percentage = Math.min((avgHours / GOAL) * 100, 100);

return (
  <div className="daily-avg-card">

    <p className="daily-avg-title">Avg Hours / Day</p>

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
          { name: "bg", value: 100, fill: "#1f2937" },        // background
          { name: "progress", value: percentage, fill: "#3b82f6" } // progress
        ]}
      >

        {/* Background Track */}
        <RadialBar
          dataKey="value"
          cornerRadius={10}
          clockWise
        />

      </RadialBarChart>

      {/* CENTER TEXT */}
      <div className="daily-avg-center">
        <h2>{avgHours}</h2>
        <span>{Math.round(percentage)}%</span>
      </div>

    </div>

    {/* Target */}
    <p className="daily-avg-goal">Target: {GOAL} hrs</p>

  </div>
);
}

export default DailyAvgHrs;