import React, { useState } from "react";

function Login() {
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (role === "user") {
      alert(`✅ Logging in as User\nEmail: ${email}`);
    } else {
      alert(`✅ Logging in as Admin\nEmail: ${email}`);
    }

    // Clear form after successful login (demo)
    setEmail("");
    setPassword("");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Sign in to your account</p>

        <form onSubmit={handleLogin} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          {/* Role Selection */}
          <div style={styles.roleGroup}>
            <label style={styles.roleLabel}>
              <input
                type="radio"
                value="user"
                checked={role === "user"}
                onChange={() => setRole("user")}
                style={styles.radio}
              />
              User
            </label>
            <label style={styles.roleLabel}>
              <input
                type="radio"
                value="admin"
                checked={role === "admin"}
                onChange={() => setRole("admin")}
                style={styles.radio}
              />
              Admin
            </label>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="hello@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.button}>
            Sign In
          </button>

          <p style={styles.link}>
            <a href="/forgot-password" style={styles.linkAnchor}>
              Forgot Password?
            </a>
          </p>

          <p style={styles.link}>
            Don't have an account?{" "}
            <a href="/register" style={styles.linkAnchor}>
              Register here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

// All styles in one place (modern & matches Register)
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    backgroundColor: "#fff",
    padding: "2.5rem 2rem",
    borderRadius: "16px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
    width: "100%",
    maxWidth: "420px",
  },
  title: {
    textAlign: "center",
    margin: "0 0 0.5rem",
    color: "#1a1a1a",
    fontSize: "1.9rem",
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    margin: "0 0 2rem",
    fontSize: "0.95rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.1rem",
  },
  roleGroup: {
    display: "flex",
    justifyContent: "center",
    gap: "2.5rem",
    marginBottom: "0.5rem",
  },
  roleLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "1rem",
    cursor: "pointer",
    color: "#444",
  },
  radio: {
    accentColor: "#667eea",
    transform: "scale(1.2)",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#444",
  },
  input: {
    width: "100%",
    padding: "0.8rem 1rem",
    border: "1.5px solid #ddd",
    borderRadius: "8px",
    fontSize: "1rem",
    boxSizing: "border-box",
  },
  button: {
    marginTop: "1.2rem",
    padding: "0.9rem",
    backgroundColor: "#667eea",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1.05rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  error: {
    color: "#e63946",
    fontSize: "0.9rem",
    textAlign: "center",
    backgroundColor: "#ffebee",
    padding: "0.8rem",
    borderRadius: "8px",
  },
  link: {
    textAlign: "center",
    fontSize: "0.92rem",
    color: "#555",
    marginTop: "0.5rem",
  },
  linkAnchor: {
    color: "#667eea",
    textDecoration: "none",
    fontWeight: "500",
  },
};

export default Login;
