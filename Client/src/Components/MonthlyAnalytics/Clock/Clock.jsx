import { useEffect, useState } from "react";
import "./Clock.css";

// ── Helpers ──────────────────────────────────────────
const greeting = (h) =>
  h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";

const dayProgress = (h, m, s) =>
  Math.floor(((h * 3600 + m * 60 + s) / 86400) * 100);

const weekNumber = () => {
  const now   = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.ceil((now - start) / (7 * 24 * 60 * 60 * 1000));
};

const dayOfYear = () => {
  const now   = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
};

const stripAmPm = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    hour:   "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })
    .formatToParts(date)
    .filter((p) => p.type !== "dayPeriod")
    .map((p) => p.value)
    .join("");

// ── Clock ─────────────────────────────────────────────
function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = time.getHours();
  const m = time.getMinutes();
  const s = time.getSeconds();

  const progress = dayProgress(h, m, s);

  return (
    <div className="clock-card">
      <h3 className="clock-title">Clock</h3>

      <div className="clock-body">

        {/* Digital */}
        <div className="clock-section digital">

          {/* Time + AM/PM */}
          <div className="time-row">
            <div className="digital-time">{stripAmPm(time)}</div>
            <div className="ampm">{h >= 12 ? "PM" : "AM"}</div>
          </div>

          {/* Date */}
          <div className="digital-date">
            {time.toLocaleDateString("en-IN", { weekday: "long" })}
          </div>

          <div className="digital-subdate">
            {time.toLocaleDateString("en-IN", {
              day: "2-digit", month: "long", year: "numeric",
            })}
          </div>

          <div className="clock-divider" />

          {/* Greeting */}
          <div className="greeting">{greeting(h)}</div>

          {/* Day progress bar */}
          <div className="day-progress-row">
            <span className="day-progress-label">Day Progress</span>
            <span className="day-progress-pct">{progress}%</span>
          </div>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          {/* Meta chips */}
          <div className="meta-row">
            <span className="meta-chip">Week {weekNumber()}</span>
            <span className="meta-chip">Day {dayOfYear()}</span>
          </div>

          {/* Timezone */}
          <div className="timezone">IST — GMT+5:30</div>

        </div>
      </div>
    </div>
  );
}

export default Clock;