import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import type { Organization } from "../types";
import Navbar from "../components/Navbar";

export default function OrgsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  async function load() {
    try {
      const data = await api.get<{ organizations: Organization[] }>(
        "/organizations"
      );
      setOrgs(data.organizations);
    } catch {
      navigate("/auth");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setCreating(true);
    try {
      await api.post("/organizations", { name, description: desc });
      setName("");
      setDesc("");
      setShowForm(false);
      load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <Navbar breadcrumbs={[{ label: "organizations" }]} />

      <div style={styles.wrap}>
        <div style={styles.header}>
          <h1>organizations</h1>
          <button onClick={() => setShowForm((x) => !x)}>
            {showForm ? "cancel" : "+ new org"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={create} style={styles.form}>
            <input
              placeholder="organization name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
            <input
              placeholder="description (optional)"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              style={{ marginTop: 8 }}
            />
            {err && <p className="err">{err}</p>}
            <button type="submit" disabled={creating} style={{ marginTop: 8 }}>
              {creating ? "..." : "create"}
            </button>
          </form>
        )}

        <div style={styles.list}>
          {orgs.length === 0 && (
            <p className="muted" style={{ padding: 20 }}>
              no organizations yet.
            </p>
          )}
          {orgs.map((org) => {
            const myRole = org.memberships?.[0]?.role ?? "MEMBER";
            return (
              <div
                key={org.id}
                style={styles.card}
                onClick={() => navigate(`/org/${org.id}`)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span>{org.name}</span>
                  <span className={`badge ${myRole === "ADMIN" ? "admin" : ""}`}>
                    {myRole.toLowerCase()}
                  </span>
                </div>
                {org.description && (
                  <p className="muted" style={{ marginTop: 4, fontSize: 12 }}>
                    {org.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    maxWidth: 640,
    margin: "0 auto",
    padding: "40px 24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    border: "1px solid #2a2a2a",
    padding: 16,
    marginBottom: 20,
    background: "#111",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 1,
  },
  card: {
    padding: "14px 16px",
    border: "1px solid #2a2a2a",
    background: "#111",
    cursor: "pointer",
    transition: "border-color 0.15s",
  },
};
