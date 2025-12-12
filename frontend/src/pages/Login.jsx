import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import logo from "../assets/images/shivaam-farms-and-resorts.png";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // ---- ADMIN ----
    if (username === "admin" && password === "12345") {
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("role", "admin");   // ⭐ IMPORTANT
      navigate("/");                  // main page
      return;
    }

    // ---- STAFF ----
    if (username === "staff" && password === "12345") {
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("role", "staff");   // ⭐ IMPORTANT
      navigate("/");
      return;
    }

    // ---- EXECUTIVE ----
    if (username === "executive" && password === "12345") {
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("role", "executive");
      // ⭐ EXECUTIVE gets STAFF permissions
      navigate("/");
      return;
    }


    // ---- ELSE ----
    setError("Invalid username or password");
  };

  return (
    <div className="login-wrapper">
      <div className="login-card shadow-lg">
        <img src={logo} alt="Shivaam Logo" className="login-logo" />
        <h2 className="login-title">Villa Login</h2>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            className="login-input"
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="login-input"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}