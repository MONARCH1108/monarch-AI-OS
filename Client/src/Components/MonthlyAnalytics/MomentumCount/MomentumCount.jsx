import { useEffect, useState } from "react";
import "./MomentumCount.css";

function MomentumCount() {
  const [todayDiff, setTodayDiff] = useState(0);
  const [weekDiff, setWeekDiff] = useState(0);
  const [status, setStatus] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchMomentum = async () => {
      try {
        setLoading(true);

        // 🔥 Fetch both APIs
        const [dailyRes, weeklyRes] = await Promise.all([
          fetch("https://productivity-api-b5hg.onrender.com/analytics/daily", {
            signal: controller.signal,
          }),
          fetch("https://productivity-api-b5hg.onrender.com/analytics/weekly", {
            signal: controller.signal,
          }),
        ]);

        const dailyData = await dailyRes.json();
        const weeklyData = await weeklyRes.json();

        // ======================
        // 🔹 DAILY COMPARISON
        // ======================

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const format = (d) => d.toISOString().split("T")[0];

        const todayData = dailyData.find(d => d.date === format(today));
        const yesterdayData = dailyData.find(d => d.date === format(yesterday));

        const todayHours = todayData?.hours || 0;
        const yesterdayHours = yesterdayData?.hours || 0;

        const dailyDiff = todayHours - yesterdayHours;

        setTodayDiff(Number(dailyDiff.toFixed(2)));

        // ======================
        // 🔹 WEEKLY COMPARISON
        // ======================

        const sortedWeeks = weeklyData
          .map(w => ({
            ...w,
            start: new Date(w.start_date),
          }))
          .sort((a, b) => b.start - a.start);

        const thisWeek = sortedWeeks[0]?.hours || 0;
        const lastWeek = sortedWeeks[1]?.hours || 0;

        const weeklyDiff = thisWeek - lastWeek;

        setWeekDiff(Number(weeklyDiff.toFixed(2)));

        // ======================
        // 🔹 STATUS LOGIC
        // ======================

        if (dailyDiff >= 0 && weeklyDiff >= 0) {
          setStatus("Improving 🔵");
        } else if (dailyDiff < 0 && weeklyDiff < 0) {
          setStatus("Dropping ⚠️");
        } else {
          setStatus("Mixed ⚪");
        }

      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Momentum error:", err);
          setStatus("Error");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMomentum();

    return () => controller.abort();
  }, []);

  return (
<div className="momentum-card">

  <h3 className="momentum-title">Momentum</h3>

  <div className="momentum-body">

    {/* DAILY */}
    <div className="momentum-section">
      <p className="label">Today vs Yesterday</p>

      <h2 className={todayDiff >= 0 ? "positive" : "negative"}>
        {loading ? "--" : `${todayDiff > 0 ? "+" : ""}${todayDiff} hrs`}
        <span>{todayDiff >= 0 ? " ↑" : " ↓"}</span>
      </h2>

      <div className="momentum-bar">
        <div
          className="momentum-fill"
          style={{
            width: `${Math.min(Math.abs(todayDiff) * 10, 100)}%`,
            background: todayDiff >= 0 ? "#3b82f6" : "#ef4444"
          }}
        />
      </div>
    </div>

    {/* WEEKLY */}
    <div className="momentum-section">
      <p className="label">This Week vs Last Week</p>

      <h2 className={weekDiff >= 0 ? "positive" : "negative"}>
        {loading ? "--" : `${weekDiff > 0 ? "+" : ""}${weekDiff} hrs`}
        <span>{weekDiff >= 0 ? " ↑" : " ↓"}</span>
      </h2>

      <div className="momentum-bar">
        <div
          className="momentum-fill"
          style={{
            width: `${Math.min(Math.abs(weekDiff) * 5, 100)}%`,
            background: weekDiff >= 0 ? "#3b82f6" : "#ef4444"
          }}
        />
      </div>
    </div>

    {/* STATUS */}
    <div className="momentum-status">
      {loading ? "Loading..." : status}
    </div>

  </div>
</div>
  );
}

export default MomentumCount;