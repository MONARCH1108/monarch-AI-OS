import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UnorderedListOutlined,
  ClockCircleOutlined,
  BarChartOutlined
} from "@ant-design/icons";
import './sidebar.css'
import logo from "../../assets/logo.png";

const { Sider } = Layout;

function Sidebar() {
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
    </div>

      <Menu
        mode="inline"
        defaultSelectedKeys={["1"]}
        style={{ height: "100%" }}
        className="SideMenu"
        items={[
          {
            key: "1",
            icon: <DashboardOutlined />,
            label: "Dashboard",
          },
          {
            key: "2",
            icon: <UnorderedListOutlined />,
            label: "Tasks",
          },
          {
            key: "3",
            icon: <ClockCircleOutlined />,
            label: "Sessions",
          },
          {
            key: "4",
            icon: <BarChartOutlined />,
            label: "Analytics",
          },
        ]}
      />

    </Sider>
  );
}

export default Sidebar;