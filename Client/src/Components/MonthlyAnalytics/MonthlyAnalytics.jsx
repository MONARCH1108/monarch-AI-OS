import { Row, Col } from "antd";
import './MonthlyAnalytics.css'
import MonthlyStreak from "./MonthlyStreak/MonthlyStreak";
import DailyAvgHrs from "./DailyAvgHours/DailyAvgHrs";

function MonthlyAnalytics() {
  return (
    <div style={{ width: "100%" }}>

      <Row gutter={[16, 16]} align="stretch">
        
        {/* LEFT - Monthly Streak */}
        <Col xs={24} md={12} style={{ display: "flex" }}>
          <MonthlyStreak />
        </Col>

        {/* RIGHT - Avg Hours */}
        <Col xs={24} md={12} style={{ display: "flex" }}>
          <DailyAvgHrs />
        </Col>

      </Row>

    </div>
  );
}

export default MonthlyAnalytics;