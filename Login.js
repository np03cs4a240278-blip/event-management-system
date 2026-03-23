import React, { useState } from "react";

function Login() {
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (role === "user") {
      alert(`Logging in as User\nEmail: ${email}`);
    } else {
      alert(`Logging in as Admin\nEmail: ${email}`);
    }
    setEmail("");
    setPassword("");
  };

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f0f2f5",
    fontFamily: "Arial, sans-serif",
  };

  const formStyle = {
    backgroundColor: "#fff",
    padding: "30px 40px",
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    width: "300px",
    textAlign: "center",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 15px",
    margin: "8px 0",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "16px",
    boxSizing: "border-box",
  };

  const buttonStyle = {
    width: "100%",
    padding: "10px 15px",
    marginTop: "15px",
    backgroundColor: "#007bff",
    border: "none",
    borderRadius: "5px",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  };

  const radioContainerStyle = {
    display: "flex",
    justifyContent: "center",
    marginBottom: "15px",
    gap: "20px",
    fontSize: "14px",
  };

  const linkStyle = {
    marginTop: "10px",
    fontSize: "14px",
  };

  return (
    <div style={containerStyle}>
      <h1>Login</h1>
      <form onSubmit={handleLogin} style={formStyle}>
        <div style={radioContainerStyle}>
          <label>
            <input
              type="radio"
              value="user"
              checked={role === "user"}
              onChange={() => setRole("user")}
            />
            User
          </label>
          <label>
            <input
              type="radio"
              value="admin"
              checked={role === "admin"}
              onChange={() => setRole("admin")}
            />
            Admin
          </label>
        </div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>
          Login
        </button>
        <p style={linkStyle}>
          <a href="/forgot-password">Forgot Password?</a>
        </p>
        <p style={linkStyle}>
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </form>
    </div>
  );
}

export default Login;
