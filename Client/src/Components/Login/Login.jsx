import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import logo from "../../assets/logo.png";
import './Login.css'

const USERNAME = "monarch";
const PASSWORD = "8125887355";

function Login() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const isAuth = localStorage.getItem("auth") === "true";
    if (isAuth) {
      navigate("/");
    }
  }, []);

  const handleLogin = () => {
    if (user === USERNAME && pass === PASSWORD) {
      localStorage.setItem("auth", "true");
      navigate("/");
    } else {
      alert("Invalid credentials");
    }
  };

return (
<div className="login-page">
  <div className="login-container">

    {/* Logo */}
    <div className="login-logo">
      <img src={logo} alt="Monarch Logo" />
    </div>

    {/* Title */}
    <div className="login-title">MonarchOS</div>
    <div className="login-subtitle">Access your productivity system</div>

    {/* Username */}
    <div className="input-group">
      <UserOutlined className="input-icon" />
      <input
        className="login-input"
        placeholder="Username"
        value={user}
        onChange={(e) => setUser(e.target.value)}
      />
    </div>

    {/* Password */}
    <div className="input-group">
      <LockOutlined className="input-icon" />
      <input
        className="login-input"
        type="password"
        placeholder="Password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
      />
    </div>

    {/* Button */}
    <button className="login-btn" onClick={handleLogin}>
      Login
    </button>

  </div>
</div>
);
}

export default Login;