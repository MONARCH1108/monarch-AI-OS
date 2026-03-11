import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UnorderedListOutlined,
  ClockCircleOutlined,
  BarChartOutlined
} from "@ant-design/icons";
import './sidebar.css'

const { Sider } = Layout;

function Sidebar() {
  return (
    <Sider width={220} className="SideBar" style={{ background: "white" }}>

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