import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Login</h2>

      <input
        placeholder="Username"
        value={user}
        onChange={(e) => setUser(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
      />
      <br /><br />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;