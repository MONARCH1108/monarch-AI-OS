import { useEffect, useState } from "react";
import "./Clock.css";

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  // 🔥 Smooth movement
  const secondDeg = seconds * 6 + time.getMilliseconds() * 0.006;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;

  // 🔥 AM / PM
  const isPM = hours >= 12;

  // 🔥 Greeting
  const getGreeting = () => {
    if (hours < 12) return "Good Morning";
    if (hours < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // 🔥 Day Progress
  const getDayProgress = () => {
    const totalSeconds = 86400;
    const passed =
      hours * 3600 + minutes * 60 + seconds;

    return Math.floor((passed / totalSeconds) * 100);
  };

  // 🔥 Week Number
  const getWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
  };

  // 🔥 Day of Year
  const getDayOfYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  // 🔥 REMOVE AM/PM from time string (IMPORTANT FIX)
  const timeParts = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).formatToParts(time);

  const formattedTime = timeParts
    .filter(part => part.type !== "dayPeriod")
    .map(part => part.value)
    .join("");

  return (
    <div className="clock-card">

      <div className="clock-body">

        {/* LEFT → ANALOG */}
        <div className="clock-analog">
          <div className="clock-face">
            <div className="clock-center"></div>

            <div
              className="hand hour"
              style={{ transform: `rotate(${hourDeg}deg)` }}
            ></div>

            <div
              className="hand minute"
              style={{ transform: `rotate(${minuteDeg}deg)` }}
            ></div>

            <div
              className="hand second"
              style={{ transform: `rotate(${secondDeg}deg)` }}
            ></div>
          </div>
        </div>

        {/* RIGHT → DIGITAL */}
        <div className="clock-digital">

          {/* TIME + AM/PM */}
          <div className="time-row">
            <div className="digital-time">
              {formattedTime}
            </div>
            <div className="ampm">
              {isPM ? "PM" : "AM"}
            </div>
          </div>

          {/* DATE */}
          <div className="digital-date">
            {time.toLocaleDateString("en-IN", {
              weekday: "long"
            })}
          </div>

          <div className="digital-subdate">
            {time.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric"
            })}
          </div>

          {/* EXTRA INFO */}
          <div className="extra-info">

            <div className="greeting">{getGreeting()}</div>

            <div className="day-progress">
              Day Progress: {getDayProgress()}%
            </div>

            <div className="meta-row">
              <span>Week {getWeekNumber()}</span>
              <span>Day {getDayOfYear()}</span>
            </div>

            <div className="timezone">
              IST (GMT+5:30)
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Clock;