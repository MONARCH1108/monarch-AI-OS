import { useEffect, useState } from "react";
import { RadialBarChart, RadialBar } from "recharts";
import "./DailyHours.css";

const GOAL = 12;

function DailyHours() {
  const [selected, setSelected] = useState("today");
  const [hours,    setHours]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          "https://productivity-api-b5hg.onrender.com/analytics/daily",
          { signal: controller.signal }
        );

        if (!res.ok) throw new Error("API error");

        const data = await res.json();

        const today     = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const format     = (d) => d.toISOString().split("T")[0];
        const targetDate = selected === "today" ? format(today) : format(yesterday);
        const point      = data.find((d) => d.date === targetDate);

        setHours(point?.hours ?? 0);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError("Failed to load");
          setHours(0);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [selected]);

  const percentage = Math.min((hours / GOAL) * 100, 100);

  const chartData = [
    { name: "bg",       value: 100,        fill: "#0d0d0d" },
    { name: "progress", value: percentage, fill: "#3b82f6" },
  ];

  return (
    <div className="daily-hours-card">

      {/* HEADER */}
      <div className="daily-hours-header">
        <h3 className="daily-hours-title">Hours Today</h3>

        <div className="daily-hours-toggle">
          <button
            className={selected === "today" ? "active" : ""}
            onClick={() => setSelected("today")}
          >
            Today
          </button>
          <button
            className={selected === "yesterday" ? "active" : ""}
            onClick={() => setSelected("yesterday")}
          >
            Yesterday
          </button>
        </div>
      </div>

      {/* CHART */}
      <div className="daily-hours-chart">
        <RadialBarChart
          width={200}
          height={200}
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          barSize={10}
          startAngle={90}
          endAngle={-270}
          data={chartData}
        >
          <RadialBar dataKey="value" cornerRadius={10} clockWise />
        </RadialBarChart>

        <div className="daily-hours-center">
          <h2>{loading ? "--" : Number(hours.toFixed(2))}</h2>
          <span>
            {loading ? "--" : error ? "Err" : `${Math.round(percentage)}%`}
          </span>
        </div>
      </div>

      {/* FOOTER */}
      <p className="daily-hours-goal">
        {error ? "Error loading data" : `Target — ${GOAL} hrs`}
      </p>

    </div>
  );
}

export default DailyHours;