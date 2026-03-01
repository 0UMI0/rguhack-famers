import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/plan";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setErr("");

    // ✅ Demo auth (hackathon-ready): replace later with backend call
    const ok =
      (email === "demo@ecosafe.com" && password === "demo123") ||
      (email === "admin@ecosafe.com" && password === "admin123");

    if (!ok) {
      setErr("Invalid login. Try demo@ecosafe.com / demo123");
      return;
    }

    onLogin({
      email,
      name: email.startsWith("admin") ? "Admin" : "Demo User",
    });

    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 6 }}>Login</h1>
      <div className="sub" style={{ marginBottom: 14 }}>
        Sign in to save your progress, streaks, and achievements on this device.
      </div>

      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <div>
          <div className="sub" style={{ marginBottom: 6 }}>Email</div>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="demo@ecosafe.com"
            autoComplete="email"
          />
        </div>

        <div>
          <div className="sub" style={{ marginBottom: 6 }}>Password</div>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="demo123"
            autoComplete="current-password"
          />
        </div>

        {err ? (
          <div style={{ color: "#b91c1c", fontWeight: 600 }}>{err}</div>
        ) : null}

        <button className="btn" type="submit">
          Sign in
        </button>

        <div className="sub">
          Demo account: <b>demo@ecosafe.com</b> / <b>demo123</b>
        </div>
      </form>
    </div>
  );
}