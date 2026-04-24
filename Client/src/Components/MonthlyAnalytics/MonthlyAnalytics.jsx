import MonthlyStreak from "./MonthlyStreak/MonthlyStreak";
import DailyAvgHrs from "./DailyAvgHours/DailyAvgHrs";

function MonthlyAnalytics() {
  return (
    <div>
        <div>
            <MonthlyStreak />
            <DailyAvgHrs />
        </div>
    </div>
  );
}

export default MonthlyAnalytics;