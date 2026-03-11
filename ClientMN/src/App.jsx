import { Layout } from "antd";
import Header from "./Components/Header/Header";
import Sidebar from "./Components/Sidebar/Sidebar";

const { Content } = Layout;

function App() {
  return (
    <Layout style={{ minHeight: "100vh" }}>

      <Sidebar />

      <Layout>

        <Header />

        <Content style={{ padding: "20px" }}>
          Main Content
        </Content>

      </Layout>

    </Layout>
  );
}

export default App;