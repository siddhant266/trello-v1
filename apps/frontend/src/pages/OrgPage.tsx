import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import type { Board, Membership, Organization } from "../types";
import Navbar from "../components/Navbar";

export default function OrgPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const [org, setOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Membership[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [myRole, setMyRole] = useState<"ADMIN" | "MEMBER">("MEMBER");

  const [boardName, setBoardName] = useState("");
  const [boardDesc, setBoardDesc] = useState("");
  const [showBoardForm, setShowBoardForm] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteErr, setInviteErr] = useState("");
  const [inviteOk, setInviteOk] = useState("");

  const [err, setErr] = useState("");

  async function load() {
    try {
      const data = await api.get<{ organization: Organization }>(
        `/organizations/${orgId}`
      );
      const o = data.organization;
      setOrg(o);
      setMembers(o.memberships ?? []);

      const boardsData = await api.get<{ boards: Board[] }>(
        `/organizations/${orgId}/boards`
      );
      setBoards(boardsData.boards);

      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]!));
        const me = o.memberships?.find((m) => m.userId === payload.userId);
        if (me) setMyRole(me.role);
      }
    } catch {
      navigate("/");
    }
  }

  useEffect(() => {
    load();
  }, [orgId]);

  async function createBoard(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      await api.post(`/organizations/${orgId}/boards`, {
        name: boardName,
        description: boardDesc,
      });
      setBoardName("");
      setBoardDesc("");
      setShowBoardForm(false);
      load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setInviteErr("");
    setInviteOk("");
    try {
      await api.post(`/organizations/${orgId}/invitations`, {
        email: inviteEmail,
      });
      setInviteOk(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
    } catch (e: unknown) {
      setInviteErr(e instanceof Error ? e.message : "Failed");
    }
  }

  async function deleteOrg() {
    if (!confirm("Delete this organization? This cannot be undone.")) return;
    try {
      await api.delete(`/organizations/${orgId}`);
      navigate("/");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed");
    }
  }

  if (!org) return (
    <div>
      <Navbar breadcrumbs={[{ label: "organizations", to: "/" }, { label: "loading..." }]} />
      <div style={{ padding: 40 }} className="muted">loading...</div>
    </div>
  );

  return (
    <div>
      <Navbar
        breadcrumbs={[
          { label: "organizations", to: "/" },
          { label: org.name },
        ]}
      />

      <div style={styles.wrap}>
        <div style={styles.topbar}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1>{org.name}</h1>
              <span className={`badge ${myRole === "ADMIN" ? "admin" : ""}`}>
                your role: {myRole.toLowerCase()}
              </span>
            </div>
            {org.description && (
              <p className="muted" style={{ marginTop: 6 }}>
                {org.description}
              </p>
            )}
          </div>
          {myRole === "ADMIN" && (
            <button className="danger" onClick={deleteOrg}>
              delete org
            </button>
          )}
        </div>

        {/* Boards section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2>boards</h2>
            {myRole === "ADMIN" ? (
              <button onClick={() => setShowBoardForm((x) => !x)}>
                {showBoardForm ? "cancel" : "+ board"}
              </button>
            ) : (
              <span className="muted" style={{ fontSize: 11 }}>
                admin can add boards
              </span>
            )}
          </div>

          {showBoardForm && myRole === "ADMIN" && (
            <form onSubmit={createBoard} style={styles.miniForm}>
              <input
                placeholder="board name"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                required
                autoFocus
              />
              <input
                placeholder="description (optional)"
                value={boardDesc}
                onChange={(e) => setBoardDesc(e.target.value)}
                style={{ marginTop: 6 }}
              />
              {err && <p className="err">{err}</p>}
              <button type="submit" style={{ marginTop: 6 }}>
                create
              </button>
            </form>
          )}

          <div style={styles.boardList}>
            {boards.length === 0 && (
              <p className="muted" style={{ fontSize: 12 }}>
                no boards yet.
              </p>
            )}
            {boards.map((b) => (
              <div
                key={b.id}
                style={styles.boardCard}
                onClick={() => navigate(`/board/${b.id}`)}
              >
                <span>{b.name}</span>
                {b.description && (
                  <p className="muted" style={{ fontSize: 11, marginTop: 2 }}>
                    {b.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Members section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2>members</h2>
          </div>
          <div style={styles.memberList}>
            {members.map((m) => (
              <div key={m.id} style={styles.memberRow}>
                <span>{m.user?.email ?? m.userId}</span>
                <span className={`badge ${m.role === "ADMIN" ? "admin" : ""}`}>
                  {m.role.toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Invite section (ADMIN only) */}
        {myRole === "ADMIN" && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2>invite member</h2>
            </div>
            <form onSubmit={invite} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <input
                type="email"
                placeholder="email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                style={{ flex: 1 }}
              />
              <button type="submit">send</button>
            </form>
            {inviteErr && <p className="err" style={{ marginTop: 6 }}>{inviteErr}</p>}
            {inviteOk && <p style={{ color: "#aaa", fontSize: 12, marginTop: 6 }}>{inviteOk}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    maxWidth: 680,
    margin: "0 auto",
    padding: "32px 24px",
  },
  topbar: {
    display: "flex",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  section: {
    marginTop: 32,
    borderTop: "1px solid #2a2a2a",
    paddingTop: 20,
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  miniForm: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 16,
    background: "#111",
    border: "1px solid #2a2a2a",
    padding: 12,
  },
  boardList: {
    display: "flex",
    flexDirection: "column",
    gap: 1,
  },
  boardCard: {
    padding: "12px 14px",
    border: "1px solid #2a2a2a",
    background: "#111",
    cursor: "pointer",
    transition: "border-color 0.15s",
  },
  memberList: {
    display: "flex",
    flexDirection: "column",
    gap: 1,
  },
  memberRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    border: "1px solid #2a2a2a",
    background: "#111",
    fontSize: 13,
  },
};
