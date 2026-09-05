import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function AuthPage() {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (tab === "signup") {
        await api.post("/auth/signup", { email, password, username });
        setTab("signin");
        setErr("");
        alert("Account created. Sign in now.");
      } else {
        const data = await api.post<{ token: string; username: string }>(
          "/auth/signin",
          { email, password }
        );
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        navigate("/");
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.box}>
        <h1 style={{ marginBottom: 24 }}>trello</h1>

        <div style={styles.tabs}>
          <button
            onClick={() => { setTab("signin"); setErr(""); }}
            style={tab === "signin" ? styles.tabActive : styles.tab}
          >
            sign in
          </button>
          <button
            onClick={() => { setTab("signup"); setErr(""); }}
            style={tab === "signup" ? styles.tabActive : styles.tab}
          >
            sign up
          </button>
        </div>

        <form onSubmit={submit} style={styles.form}>
          <label style={styles.label}>email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />

          {tab === "signup" && (
            <>
              <label style={{ ...styles.label, marginTop: 12 }}>username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="e.g. siddhant"
                autoComplete="off"
              />
            </>
          )}

          <label style={{ ...styles.label, marginTop: 12 }}>password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {err && <p className="err">{err}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: 20, width: "100%" }}
          >
            {loading ? "..." : tab === "signin" ? "sign in" : "create account"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    width: 340,
    border: "1px solid #2a2a2a",
    padding: "32px 28px",
    background: "#111",
  },
  tabs: {
    display: "flex",
    gap: 8,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    border: "1px solid #2a2a2a",
    background: "#0a0a0a",
    color: "#666",
  },
  tabActive: {
    flex: 1,
    border: "1px solid #3d3d3d",
    background: "#1a1a1a",
    color: "#e8e8e8",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
  },
};
