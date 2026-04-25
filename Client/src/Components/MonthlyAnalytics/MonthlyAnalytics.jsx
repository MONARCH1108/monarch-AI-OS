import { Row, Col } from "antd";
import './MonthlyAnalytics.css';

import MonthlyStreak from "./MonthlyStreak/MonthlyStreak";
import DailyAvgHrs from "./DailyAvgHours/DailyAvgHrs";
import WeeklyAvgHours from "./WeeklyAvgHours/WeeklyAvgHours";
import Clock from "./Clock/Clock";
import DailyHours from "./DailyHours/DailyHours";

function MonthlyAnalytics() {
  return (
    <div style={{ width: "100%" }}>

      <Row gutter={[16, 16]} align="stretch">

        {/* TOP ROW */}
        <Col xs={24} md={8} style={{ display: "flex" }}>
          <MonthlyStreak />
        </Col>

        <Col xs={24} md={8} style={{ display: "flex" }}>
          <DailyAvgHrs />
        </Col>

        <Col xs={24} md={8} style={{ display: "flex" }}>
          <WeeklyAvgHours />
        </Col>

        {/* SECOND ROW */}
        <Col xs={24} md={8} style={{ display: "flex" }}>
          <Clock />
        </Col>

        <Col xs={24} md={8} style={{ display: "flex" }}>
          <DailyHours />
        </Col>

        {/* EMPTY SLOT */}
        <Col xs={24} md={8}></Col>

      </Row>

    </div>
  );
}

export default MonthlyAnalytics;