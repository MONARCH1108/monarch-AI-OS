import { Layout } from "antd";
import Header from "./Components/Header/Header";
import Sidebar from "./Components/Sidebar/Sidebar";
import Dashboard from "./Components/Dashboard/Dashboard";
import Tracker from "./Components/Tracker/Tracker";
import MonthlyAnalytics from "./Components/MonthlyAnalytics/MonthlyAnalytics";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const { Content } = Layout;

function App() {
 return (
    <BrowserRouter>
      <Layout style={{ minHeight: "100vh" }}>
        <Sidebar />
        <Layout>
          <Header />
          <Content style={{ padding: "20px" }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/monthly-analytics" element={<MonthlyAnalytics />} />
              <Route path="/Tracker" element={<Tracker />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </BrowserRouter>
  );
}

export default App;