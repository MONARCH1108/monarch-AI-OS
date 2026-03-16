import { Layout, Menu } from "antd";
import { useState } from "react";
import {
  DashboardOutlined,
  UnorderedListOutlined,
  ClockCircleOutlined,
  BarChartOutlined
} from "@ant-design/icons";
import './sidebar.css'
import logo from "../../assets/logo.png";
import { FaGithub, FaLinkedin, FaTwitter, FaMedium  } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";

const { Sider } = Layout;
import { useNavigate } from "react-router-dom";



function Sidebar() {

  const navigate = useNavigate();
  const [loading,setLoading] = useState(false)

  const runPipeline = async () => {
    try{
      setLoading(true)
      await fetch("/pipeline/run",{ method:"POST" })
      alert("Pipeline executed successfully")
    }
    catch(err){
      console.error(err)
      alert("Pipeline failed")
    }
    finally{
      setLoading(false)
    }
  }

  return (
    <Sider width={220} className="SideBar" style={{ background: "white" }}>

    {/* TOP PROFILE SECTION */}
    <div className="sidebar-profile">

        <div className="logo">
          <img src={logo} alt="Monarch Logo" />
        </div>

        <div className="profile-text">
            <div className="profile-name">
              E.Y.S.V.S Abhay
            </div><br />

            <div className="profile-role">
               Productivity OS
            </div>
        </div>
        <div className="sidebar-links">
          <a href="https://github.com/MONARCH1108" target="_blank" rel="noopener noreferrer">
            <FaGithub />
          </a>

          <a href="https://www.linkedin.com/in/e-y-s-v-s-abhay/" target="_blank" rel="noopener noreferrer">
            <FaLinkedin />
          </a>

          <a
            href="https://abhayemani.netlify.app/" target="_blank" rel="noopener noreferrer">
            <FiExternalLink />
          </a>

          <a href="https://x.com/abhay_emani" target="_blank" rel="noopener noreferrer">
            <FaTwitter />
          </a>

          <a href="https://medium.com/@abhayemani8" target="_blank" rel="noopener noreferrer">
            <FaMedium />
          </a>
        </div>
    </div>

      <Menu
              mode="inline"
              defaultSelectedKeys={["1"]}

              className="SideMenu"
              onClick={({ key }) => {
                if (key === "1") navigate("/");
                if (key === "2") navigate("/tracker");
              }}
              items={[
                {
                  key: "1",
                  icon: <DashboardOutlined />,
                  label: "Dashboard",
                },
                {
                  key: "2",
                  icon: <UnorderedListOutlined />,
                  label: "Tracker",
                },
              ]}
            />

            <div className="sidebar-bottom">
        <button
          className="run-analytics-btn"
          onClick={runPipeline}
          disabled={loading}
        >
        <BarChartOutlined style={{ marginRight: "8px" }} />
        {loading ? "Running..." : "Run Analytics"}
        </button>
      </div>
    </Sider>
  );
}

export default Sidebar;