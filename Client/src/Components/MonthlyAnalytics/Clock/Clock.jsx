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

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;

  return (
    <div className="clock-card">

      <h3 className="clock-title">Clock</h3>

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

          <div className="digital-time">
            {time.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit"
            })}
          </div>

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

        </div>

      </div>
    </div>
  );
}

export default Clock;