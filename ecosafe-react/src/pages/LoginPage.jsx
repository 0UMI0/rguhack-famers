import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    document.title = "Login | EcoSafe";
    // If already logged in, go straight to plan
    if (localStorage.getItem("isAuthenticated") === "true") {
      navigate("/plan", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Hackathon demo credentials (change as you like)
    if (email === "admin@eco.com" && password === "1234") {
      localStorage.setItem("isAuthenticated", "true");
      navigate("/plan", { replace: true });
      return;
    }

    alert("Invalid credentials. Try admin@eco.com / 1234");
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>EcoSafe Login</h2>
          <p style={styles.sub}>Use demo credentials to continue</p>
        </div>

        <input
          style={styles.input}
          type="email"
          placeholder="Email (admin@eco.com)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password (1234)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <button style={styles.button} type="submit">
          Login
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(180deg, #f3faf4 0%, #f7f7f7 100%)",
    padding: 16,
  },
  card: {
    width: "min(420px, 92vw)",
    background: "#fff",
    borderRadius: 18,
    padding: 26,
    boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  header: { marginBottom: 6 },
  sub: { margin: "6px 0 0", opacity: 0.7 },
  input: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    outline: "none",
    fontSize: 14,
  },
  button: {
    marginTop: 6,
    padding: "12px 14px",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    background: "#2e7d32",
    color: "white",
  },
};