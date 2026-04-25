import { useEffect, useState } from "react";
import "./MomentumCount.css";

// ── Helpers ──────────────────────────────────────────
const sign  = (n) => n > 0 ? "+" : "";
const arrow = (n) => n >= 0 ? "↑" : "↓";
const tone  = (n) => n >= 0 ? "positive" : "negative";

// ── MetricRow ─────────────────────────────────────────
function MetricRow({ label, diff, barScale, loading }) {
  const fillPct   = Math.min(Math.abs(diff) * barScale, 100);
  const fillColor = diff >= 0 ? "#3b82f6" : "#ef4444";

  return (
    <div className="momentum-section">
      <p className="label">{label}</p>

      <h2 className={tone(diff)}>
        {loading
          ? "--"
          : `${sign(diff)}${diff} hrs ${arrow(diff)}`}
      </h2>

      <div className="momentum-bar">
        <div
          className="momentum-fill"
          style={{ width: `${fillPct}%`, background: fillColor }}
        />
      </div>
    </div>
  );
}

// ── MomentumCount ─────────────────────────────────────
function MomentumCount() {
  const [todayDiff, setTodayDiff] = useState(0);
  const [weekDiff,  setWeekDiff]  = useState(0);
  const [status,    setStatus]    = useState("Loading...");
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchMomentum = async () => {
      try {
        setLoading(true);

        const [dailyRes, weeklyRes] = await Promise.all([
          fetch("https://productivity-api-b5hg.onrender.com/analytics/daily",  { signal: controller.signal }),
          fetch("https://productivity-api-b5hg.onrender.com/analytics/weekly", { signal: controller.signal }),
        ]);

        const dailyData  = await dailyRes.json();
        const weeklyData = await weeklyRes.json();

        // Daily diff
        const format    = (d) => d.toISOString().split("T")[0];
        const today     = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const todayHours     = dailyData.find(d => d.date === format(today))?.hours     ?? 0;
        const yesterdayHours = dailyData.find(d => d.date === format(yesterday))?.hours ?? 0;
        const dailyDiff      = Number((todayHours - yesterdayHours).toFixed(2));

        // Weekly diff
        const [thisWeek, lastWeek] = weeklyData
          .map(w => ({ ...w, start: new Date(w.start_date) }))
          .sort((a, b) => b.start - a.start)
          .map(w => w.hours ?? 0);

        const weeklyDiff = Number(((thisWeek ?? 0) - (lastWeek ?? 0)).toFixed(2));

        setTodayDiff(dailyDiff);
        setWeekDiff(weeklyDiff);
        setStatus(
          dailyDiff >= 0 && weeklyDiff >= 0 ? "Improving 🔵" :
          dailyDiff <  0 && weeklyDiff <  0 ? "Dropping ⚠️"  :
                                              "Mixed ⚪"
        );
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
        <MetricRow label="Today vs Yesterday"      diff={todayDiff} barScale={10} loading={loading} />
        <MetricRow label="This Week vs Last Week"  diff={weekDiff}  barScale={5}  loading={loading} />

        <div className="momentum-status">
          {loading ? "Loading..." : status}
        </div>
      </div>
    </div>
  );
}

export default MomentumCount;