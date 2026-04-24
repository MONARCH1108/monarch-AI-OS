import { Row, Col } from "antd";
import './MonthlyAnalytics.css';

import MonthlyStreak from "./MonthlyStreak/MonthlyStreak";
import DailyAvgHrs from "./DailyAvgHours/DailyAvgHrs";
import WeeklyAvgHours from "./WeeklyAvgHours/WeeklyAvgHours";

function MonthlyAnalytics() {
  return (
    <div style={{ width: "100%" }}>

      <Row gutter={[16, 16]} align="stretch">

        {/* LEFT */}
        <Col xs={24} md={8} style={{ display: "flex" }}>
          <MonthlyStreak />
        </Col>

        {/* CENTER */}
        <Col xs={24} md={8} style={{ display: "flex" }}>
          <DailyAvgHrs />
        </Col>

        {/* RIGHT */}
        <Col xs={24} md={8} style={{ display: "flex" }}>
          <WeeklyAvgHours />
        </Col>

      </Row>

    </div>
  );
}

export default MonthlyAnalytics;