import { Row, Col } from "antd";
import "./MonthlyAnalytics.css";

import MonthlyStreak from "./MonthlyStreak/MonthlyStreak";
import DailyAvgHrs from "./DailyAvgHours/DailyAvgHrs";
import WeeklyAvgHours from "./WeeklyAvgHours/WeeklyAvgHours";
import Clock from "./Clock/Clock";
import DailyHours from "./DailyHours/DailyHours";
import MomentumCount from "./MomentumCount/MomentumCount";

function MonthlyAnalytics() {
  return (
    <div className="analytics-container">
      <Row gutter={[12, 12]} className="analytics-grid">
        <Col span={8}><Clock /></Col>
        <Col span={8}><DailyHours /></Col>
        <Col span={8}><MomentumCount /></Col>

        <Col span={8}><DailyAvgHrs /></Col>
        <Col span={8}><WeeklyAvgHours /></Col>
        <Col span={8}><MonthlyStreak /></Col>    
      </Row>

    </div>
  );
}

export default MonthlyAnalytics;