import { Layout, Menu } from "antd";
import { useState, useCallback } from "react";
import {
  DashboardOutlined,
  UnorderedListOutlined,
  BarChartOutlined
} from "@ant-design/icons";
import './sidebar.css'
import logo from "../../assets/logo.png";
import { FaGithub, FaLinkedin, FaTwitter, FaMedium } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { RocketOutlined  } from '@ant-design/icons';
import { PoweroffOutlined } from "@ant-design/icons";

const { Sider } = Layout;

// ── tiny hook to drive the sidebar toast ──────────────────────────────────────
function useSidebarToast() {
  const [toast, setToast] = useState(null); // { type, icon, text, hiding }

  const show = useCallback((type, icon, text) => {
    setToast({ type, icon, text, hiding: false });
  }, []);

  const hide = useCallback(() => {
    setToast(prev => prev ? { ...prev, hiding: true } : null);
    setTimeout(() => setToast(null), 260); // matches animation duration
  }, []);

  const autoHide = useCallback((type, icon, text, ms = 3000) => {
    show(type, icon, text);
    setTimeout(hide, ms);
  }, [show, hide]);

  return { toast, show, hide, autoHide };
}

// ── component ─────────────────────────────────────────────────────────────────
function Sidebar() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { toast, show, autoHide } = useSidebarToast();

  // ── pipeline ────────────────────────────────────────────────────────────────
  const runPipeline = async () => {
    try {
      setLoading(true);
      show("loading", "⚙️", "Running analytics pipeline...");

      const res  = await fetch("https://productivity-api-b5hg.onrender.com/pipeline/run", { method: "POST" });
      const data = await res.json();

      if (data.status === "success") {
        autoHide("success", "🚀", "Pipeline executed successfully");
      } else {
        autoHide("error", "❌", data.error || "Pipeline failed");
      }
    } catch {
      autoHide("error", "❌", "Pipeline failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
      localStorage.removeItem("auth"); // clears login
      window.location.href = "/login"; // force redirect
    };

  // ── server ──────────────────────────────────────────────────────────────────
  const startServer = async () => {
    try {
      setLoading(true);
      show("loading", "🚀", "Starting server...");

      const res  = await fetch("https://productivity-api-b5hg.onrender.com/health");
      const data = await res.json();

      if (data.status === "ok") {
        autoHide("success", "✅", "Server is ready");
      } else {
        autoHide("error", "❌", "Server not healthy");
      }
    } catch {
      autoHide("error", "❌", "Failed to start server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sider width={220} className="SideBar" style={{ background: "white" }}>

      {/* TOP PROFILE SECTION */}
      <div className="sidebar-profile">
        <div className="logo">
          <img src={logo} alt="Monarch Logo" />
        </div>
        <div className="profile-text">
          <div className="profile-name">E.Y.S.V.S Abhay</div><br />
          <div className="profile-role">Productivity OS</div>
        </div>
        <div className="sidebar-links">
          <a href="https://github.com/MONARCH1108" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
          <a href="https://www.linkedin.com/in/e-y-s-v-s-abhay/" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
          <a href="https://abhayemani.netlify.app/" target="_blank" rel="noopener noreferrer"><FiExternalLink /></a>
          <a href="https://x.com/abhay_emani" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
          <a href="https://medium.com/@abhayemani8" target="_blank" rel="noopener noreferrer"><FaMedium /></a>
        </div>
      </div>

      <Menu
        mode="inline"
        defaultSelectedKeys={["1"]}
        className="SideMenu"
        onClick={({ key }) => {
          if (key === "1") navigate("/");
          if (key === "2") navigate("/monthly-analytics");  
          if (key === "3") navigate("/tracker");
        }}
        items={[
          { key: "1", icon: <DashboardOutlined />,    label: "Dashboard" },
          { key: "2", icon: <BarChartOutlined />,     label: "Monthly Analytics" },
          { key: "3", icon: <UnorderedListOutlined />, label: "Tracker"   },
        ]}
      />

      {/* BOTTOM SECTION — toast lives here, above the buttons */}
      <div className="sidebar-bottom">

        {toast && (
          <div className={`sidebar-toast ${toast.type} ${toast.hiding ? "hide" : ""}`}>
            <span>{toast.icon}</span>
            <span>{toast.text}</span>
          </div>
        )}

        <button className="start-server-btn"  onClick={startServer}  disabled={loading}>
          <RocketOutlined style={{ marginRight: '6px' }} />
          Start Server
        </button>
        <button className="run-analytics-btn" onClick={runPipeline} disabled={loading}>
          <BarChartOutlined style={{ marginRight: "8px" }} />
          {loading ? "Running..." : "Run Analytics"}
        </button>
          {/* 🔐 LOGOUT */}
          <button className="logout-btn" onClick={logout}>
            <PoweroffOutlined style={{ marginRight: "8px" }} />
            Logout
          </button>

      </div>
    </Sider>
  );
}

export default Sidebar;