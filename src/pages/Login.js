import { useState } from "react";
import API from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("login.php", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      window.location = "/events";
    } catch {
      alert("Login failed");
    }
  };

  return (
    <div style={styles.page}>
      {/* Gradient header */}
      <div style={styles.header}></div>

      {/* Login card */}
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={styles.inputGroup}>
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter email HERE"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          {/* Password */}
          <div style={styles.inputGroup}>
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          <button style={styles.button}>Login</button>
        </form>

        <p style={styles.links}>
          Don't have an account? <a href="/signup">Signup</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    background: "#F8F9FD",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "300px",
    background: "linear-gradient(135deg,#FBCFE8,#A5B4FC)",
    borderBottomLeftRadius: "50% 20%",
    borderBottomRightRadius: "50% 20%",
  },

  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "12px",
    width: "320px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
    position: "relative",
    zIndex: 2,
  },

  title: {
    textAlign: "center",
    marginBottom: "20px",
  },

  inputGroup: {
    marginBottom: "20px",
  },

  input: {
    width: "100%",
    border: "none",
    borderBottom: "2px solid #A5B4FC",
    padding: "8px",
    outline: "none",
  },

  button: {
    width: "100%",
    background: "#A5B4FC",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },

  links: {
    marginTop: "15px",
    textAlign: "center",
    fontSize: "14px",
  },
};

export default Login;
