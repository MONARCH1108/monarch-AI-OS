import { Layout } from "antd";
import Header from "./Components/Header/Header";
import Sidebar from "./Components/Sidebar/Sidebar";
import Dashboard from "./Components/Dashboard/Dashboard";
import Tracker from "./Components/Tracker/Tracker";
import MonthlyAnalytics from "./Components/MonthlyAnalytics/MonthlyAnalytics";
import Login from "./Components/Login/Login";
import ProtectedRoute from "./Components/ProtectedRoute";

import { BrowserRouter, Routes, Route } from "react-router-dom";

const { Content } = Layout;

// 🔹 Layout (only AFTER login)
function MainApp() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout>
        <Header />
        <Content style={{ padding: "20px" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/monthly-analytics" element={<MonthlyAnalytics />} />
            <Route path="/tracker" element={<Tracker />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔐 Login Page */}
        <Route path="/login" element={<Login />} />

        {/* 🔐 Protected App */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;