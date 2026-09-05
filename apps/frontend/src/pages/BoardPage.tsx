import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useWebSocket } from "../hooks/useWebSocket";
import type { Board, Issue, Section } from "../types";
import Navbar from "../components/Navbar";

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { onlineUsers } = useWebSocket(boardId);

  const [board, setBoard] = useState<Board | null>(null);
  const [userRole, setUserRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [sections, setSections] = useState<Section[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);

  // section creation (Admin only)
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [addingSection, setAddingSection] = useState(false);

  // inline add-issue per section (Any member can add)
  const [addingIssueSection, setAddingIssueSection] = useState<string | null>(null);
  const [newIssueTitle, setNewIssueTitle] = useState("");

  // selected issue detail
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const currentUsername = localStorage.getItem("username") || "user";
  const myInitials = currentUsername.slice(0, 2).toUpperCase();

  // Deduplicate online other users so no duplicate member appears
  const uniqueOtherUsers = Array.from(
    new Set(onlineUsers.filter((u) => u && u !== currentUsername))
  );

  async function loadBoardInfo() {
    try {
      const bData = await api.get<{ board: Board; role: "ADMIN" | "MEMBER" }>(
        `/boards/${boardId}`
      );
      setBoard(bData.board);
      setUserRole(bData.role);

      const sData = await api.get<{ sections: Section[] }>(
        `/boards/${boardId}/sections`
      );
      setSections(sData.sections.sort((a, b) => a.order - b.order));

      const iData = await api.get<{ issues: Issue[] }>(
        `/boards/${boardId}/issues`
      );
      setIssues(iData.issues);
    } catch {
      navigate("/");
    }
  }

  useEffect(() => {
    loadBoardInfo();
  }, [boardId]);

  // refresh selected issue when issues list changes
  useEffect(() => {
    if (selectedIssue) {
      const updated = issues.find((i) => i.id === selectedIssue.id);
      if (updated) setSelectedIssue(updated);
    }
  }, [issues]);

  async function createSection(e: React.FormEvent) {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;
    try {
      await api.post(`/boards/${boardId}/sections`, { title: newSectionTitle });
      setNewSectionTitle("");
      setAddingSection(false);
      loadBoardInfo();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to create section");
    }
  }

  async function deleteSection(sectionId: string) {
    if (!confirm("Delete this section and all its issues?")) return;
    try {
      await api.delete(`/sections/${sectionId}`);
      if (selectedIssue?.sectionId === sectionId) setSelectedIssue(null);
      loadBoardInfo();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to delete section");
    }
  }

  async function addIssue(e: React.FormEvent, sectionId: string) {
    e.preventDefault();
    if (!newIssueTitle.trim()) return;
    try {
      await api.post(`/boards/${boardId}/sections/${sectionId}/issues`, {
        title: newIssueTitle,
      });
      setNewIssueTitle("");
      setAddingIssueSection(null);
      loadBoardInfo();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to create issue");
    }
  }

  function issuesForSection(sectionId: string) {
    return issues
      .filter((i) => i.sectionId === sectionId)
      .sort((a, b) => a.order - b.order);
  }

  const breadcrumbs = [
    { label: "organizations", to: "/" },
    ...(board?.organization
      ? [{ label: board.organization.name, to: `/org/${board.organizationId}` }]
      : []),
    { label: board?.name || "board" },
  ];

  const presenceWidget = (
    <div style={styles.presence}>
      {/* Self avatar */}
      <div
        style={{ ...styles.avatar, background: "#e8e8e8", color: "#0a0a0a" }}
        title={`you (@${currentUsername})`}
      >
        {myInitials}
      </div>

      {/* Unique other users */}
      {uniqueOtherUsers.map((u) => {
        const initials = u.slice(0, 2).toUpperCase();
        return (
          <div
            key={u}
            style={{
              ...styles.avatar,
              background: "#222222",
              color: "#cccccc",
              border: "1px solid #3d3d3d",
            }}
            title={`@${u}`}
          >
            {initials}
          </div>
        );
      })}

      <span className="muted" style={{ fontSize: 11, marginLeft: 4 }}>
        {1 + uniqueOtherUsers.length} online
      </span>
    </div>
  );

  return (
    <div style={styles.page}>
      <Navbar breadcrumbs={breadcrumbs} rightContent={presenceWidget} />

      {/* Subheader with board title & role badge */}
      <div style={styles.subHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h2 style={{ fontSize: 15 }}>{board?.name || "board"}</h2>
          <span className={`badge ${userRole === "ADMIN" ? "admin" : ""}`}>
            {userRole.toLowerCase()}
          </span>
        </div>
        {board?.description && (
          <span className="muted" style={{ fontSize: 12 }}>
            {board.description}
          </span>
        )}
      </div>

      {/* Board columns */}
      <div style={styles.board}>
        {sections.map((sec) => (
          <Column
            key={sec.id}
            section={sec}
            userRole={userRole}
            issues={issuesForSection(sec.id)}
            addingIssue={addingIssueSection === sec.id}
            newIssueTitle={newIssueTitle}
            onNewIssueTitleChange={setNewIssueTitle}
            onStartAddIssue={() => {
              setAddingIssueSection(sec.id);
              setNewIssueTitle("");
            }}
            onCancelAddIssue={() => setAddingIssueSection(null)}
            onAddIssue={(e) => addIssue(e, sec.id)}
            onSelectIssue={setSelectedIssue}
            selectedIssueId={selectedIssue?.id}
            onDeleteSection={() => deleteSection(sec.id)}
          />
        ))}

        {/* Add section column - Admin only */}
        {userRole === "ADMIN" && (
          <div style={styles.addSectionCol}>
            {addingSection ? (
              <form
                onSubmit={createSection}
                style={{ display: "flex", flexDirection: "column", gap: 6 }}
              >
                <input
                  placeholder="section title"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  autoFocus
                />
                <div style={{ display: "flex", gap: 6 }}>
                  <button type="submit" style={{ flex: 1 }}>
                    add
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingSection(false)}
                  >
                    cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setAddingSection(true)}
                style={styles.addSectionBtn}
              >
                + section
              </button>
            )}
          </div>
        )}
      </div>

      {/* Issue detail panel */}
      {selectedIssue && (
        <IssuePanel
          issue={selectedIssue}
          sections={sections}
          userRole={userRole}
          onClose={() => setSelectedIssue(null)}
          onRefresh={loadBoardInfo}
        />
      )}
    </div>
  );
}

// --- Column Component ----------------------------------------------------------

interface ColumnProps {
  section: Section;
  userRole: "ADMIN" | "MEMBER";
  issues: Issue[];
  addingIssue: boolean;
  newIssueTitle: string;
  onNewIssueTitleChange: (v: string) => void;
  onStartAddIssue: () => void;
  onCancelAddIssue: () => void;
  onAddIssue: (e: React.FormEvent) => void;
  onSelectIssue: (i: Issue) => void;
  selectedIssueId: string | undefined;
  onDeleteSection: () => void;
}

function Column({
  section,
  userRole,
  issues,
  addingIssue,
  newIssueTitle,
  onNewIssueTitleChange,
  onStartAddIssue,
  onCancelAddIssue,
  onAddIssue,
  onSelectIssue,
  selectedIssueId,
  onDeleteSection,
}: ColumnProps) {
  return (
    <div style={colStyles.col}>
      <div style={colStyles.header}>
        <span style={{ fontSize: 13, color: "#ccc" }}>{section.title}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="muted" style={{ fontSize: 11 }}>
            {issues.length}
          </span>
          {/* Only admin can remove sections */}
          {userRole === "ADMIN" && (
            <button
              onClick={onDeleteSection}
              className="danger"
              style={{ padding: "1px 6px", fontSize: 11 }}
              title="Delete section (admin only)"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div style={colStyles.issues}>
        {issues.map((issue) => (
          <div
            key={issue.id}
            style={{
              ...colStyles.issueCard,
              ...(selectedIssueId === issue.id ? colStyles.issueCardActive : {}),
            }}
            onClick={() => onSelectIssue(issue)}
          >
            <span>{issue.title}</span>
            {issue.comments && issue.comments.length > 0 && (
              <span className="muted" style={{ fontSize: 10, marginTop: 4, display: "block" }}>
                {issue.comments.length} comment{issue.comments.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Any member or admin can add an issue */}
      {addingIssue ? (
        <form onSubmit={onAddIssue} style={{ marginTop: 8 }}>
          <input
            placeholder="issue title"
            value={newIssueTitle}
            onChange={(e) => onNewIssueTitleChange(e.target.value)}
            autoFocus
            style={{ marginBottom: 6 }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            <button type="submit" style={{ flex: 1 }}>
              add
            </button>
            <button type="button" onClick={onCancelAddIssue}>
              cancel
            </button>
          </div>
        </form>
      ) : (
        <button onClick={onStartAddIssue} style={colStyles.addIssueBtn}>
          + issue
        </button>
      )}
    </div>
  );
}

const colStyles: Record<string, React.CSSProperties> = {
  col: {
    width: 250,
    flexShrink: 0,
    background: "#111111",
    border: "1px solid #222222",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    alignSelf: "flex-start",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottom: "1px solid #222222",
  },
  issues: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: 1,
  },
  issueCard: {
    padding: "8px 10px",
    border: "1px solid #282828",
    background: "#161616",
    cursor: "pointer",
    fontSize: 13,
    transition: "border-color 0.12s",
  },
  issueCardActive: {
    borderColor: "#555555",
    background: "#1f1f1f",
  },
  addIssueBtn: {
    marginTop: 10,
    width: "100%",
    fontSize: 12,
    color: "#666666",
    borderColor: "#202020",
    background: "transparent",
  },
};

// --- Issue Panel Component ----------------------------------------------------

interface IssuePanelProps {
  issue: Issue;
  sections: Section[];
  userRole: "ADMIN" | "MEMBER";
  onClose: () => void;
  onRefresh: () => void;
}

function IssuePanel({
  issue,
  sections,
  userRole,
  onClose,
  onRefresh,
}: IssuePanelProps) {
  const [title, setTitle] = useState(issue.title);
  const [desc, setDesc] = useState(issue.description ?? "");
  const [saving, setSaving] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  // Move section state
  const [targetSection, setTargetSection] = useState(issue.sectionId);
  const [moveComment, setMoveComment] = useState("");
  const [moving, setMoving] = useState(false);
  const [moveErr, setMoveErr] = useState("");

  useEffect(() => {
    setTitle(issue.title);
    setDesc(issue.description ?? "");
    setTargetSection(issue.sectionId);
    setMoveComment("");
    setMoveErr("");
  }, [issue.id, issue.sectionId]);

  async function save() {
    setSaving(true);
    try {
      await api.put(`/issues/${issue.id}`, { title, description: desc });
      onRefresh();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to update issue");
    } finally {
      setSaving(false);
    }
  }

  async function deleteIssue() {
    if (!confirm("Delete this issue? (Admin only)")) return;
    try {
      await api.delete(`/issues/${issue.id}`);
      onClose();
      onRefresh();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to delete issue");
    }
  }

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    const text = commentText.trim();
    if (!text || postingComment) return;
    setPostingComment(true);
    try {
      await api.post(`/issues/${issue.id}/comments`, { comment: text });
      setCommentText("");
      await onRefresh();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to add comment");
    } finally {
      setPostingComment(false);
    }
  }

  async function deleteComment(commentId: string) {
    try {
      await api.delete(`/comments/${commentId}`);
      onRefresh();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to delete comment");
    }
  }

  async function handleMoveSection() {
    if (targetSection === issue.sectionId) return;

    if (!moveComment.trim()) {
      setMoveErr("A comment is compulsory when moving an issue to another section.");
      return;
    }

    setMoving(true);
    setMoveErr("");
    try {
      await api.patch(`/issues/${issue.id}/move`, {
        sectionId: targetSection,
        comment: moveComment.trim(),
      });
      setMoveComment("");
      onRefresh();
    } catch (e: unknown) {
      setMoveErr(e instanceof Error ? e.message : "Failed to move issue");
    } finally {
      setMoving(false);
    }
  }

  return (
    <div style={panelStyles.overlay}>
      <div style={panelStyles.panel}>
        {/* Panel header */}
        <div style={panelStyles.header}>
          <span className="muted" style={{ fontSize: 11, letterSpacing: "0.05em" }}>
            ISSUE DETAILS
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            {/* Admin only delete issue */}
            {userRole === "ADMIN" && (
              <button
                className="danger"
                onClick={deleteIssue}
                title="Delete issue (admin only)"
              >
                delete
              </button>
            )}
            <button onClick={onClose}>× close</button>
          </div>
        </div>

        {/* Title */}
        <label style={panelStyles.label}>title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ fontSize: 14, marginBottom: 12, background: "#0a0a0a" }}
        />

        {/* Description */}
        <label style={panelStyles.label}>description</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          style={{ minHeight: 70, marginBottom: 10 }}
        />
        <button
          onClick={save}
          disabled={saving}
          style={{ marginBottom: 20, alignSelf: "flex-start" }}
        >
          {saving ? "saving..." : "save details"}
        </button>

        {/* --- Move Section Box (Compulsory Comment) ------------------- */}
        <label style={panelStyles.label}>move section (comment compulsory)</label>
        <div style={panelStyles.moveBox}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#888", width: 60 }}>To:</span>
            <select
              value={targetSection}
              onChange={(e) => {
                setTargetSection(e.target.value);
                setMoveErr("");
              }}
              style={{ flex: 1 }}
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} {s.id === issue.sectionId ? " (current)" : ""}
                </option>
              ))}
            </select>
          </div>

          {targetSection !== issue.sectionId && (
            <div style={{ marginTop: 10 }}>
              <label style={{ ...panelStyles.label, color: "#aaa" }}>
                compulsory comment for moving *
              </label>
              <textarea
                placeholder="Why is this issue being moved? (Required)"
                value={moveComment}
                onChange={(e) => {
                  setMoveComment(e.target.value);
                  if (e.target.value.trim()) setMoveErr("");
                }}
                style={{ minHeight: 60, marginBottom: 6 }}
              />
              {moveErr && <p className="err">{moveErr}</p>}
              <button
                onClick={handleMoveSection}
                disabled={!moveComment.trim() || moving}
                style={{
                  width: "100%",
                  background: moveComment.trim() ? "#1f1f1f" : "#141414",
                  borderColor: moveComment.trim() ? "#444" : "#222",
                }}
              >
                {moving ? "moving..." : "confirm move"}
              </button>
            </div>
          )}
        </div>

        {/* --- Comments Section ------------------------------------------ */}
        <label style={{ ...panelStyles.label, marginTop: 10 }}>
          comments & activity
        </label>
        <div style={{ marginBottom: 12 }}>
          {(!issue.comments || issue.comments.length === 0) && (
            <p className="muted" style={{ fontSize: 12 }}>
              no comments yet.
            </p>
          )}
          {issue.comments?.map((c) => (
            <div key={c.id} style={panelStyles.commentRow}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "#777" }}>
                  {c.user?.email || "user"}
                </span>
                <button
                  onClick={() => deleteComment(c.id)}
                  className="danger"
                  style={{ padding: "0px 6px", fontSize: 10 }}
                  title="delete comment"
                >
                  ×
                </button>
              </div>
              <p style={{ fontSize: 13, marginTop: 4, whiteSpace: "pre-wrap" }}>
                {c.comment}
              </p>
            </div>
          ))}
        </div>

        {/* Add normal comment */}
        <form onSubmit={addComment} style={{ display: "flex", gap: 6 }}>
          <input
            placeholder={postingComment ? "posting comment..." : "write a comment..."}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={postingComment}
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            disabled={!commentText.trim() || postingComment}
            style={{ minWidth: 72 }}
          >
            {postingComment ? "posting..." : "post"}
          </button>
        </form>
      </div>
    </div>
  );
}

const panelStyles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: 400,
    background: "#111111",
    borderLeft: "1px solid #2a2a2a",
    zIndex: 100,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  panel: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 20px",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottom: "1px solid #222222",
  },
  label: {
    display: "block",
    fontSize: 10,
    color: "#777777",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    marginBottom: 6,
  },
  moveBox: {
    background: "#141414",
    border: "1px solid #252525",
    padding: 10,
    marginBottom: 18,
  },
  commentRow: {
    padding: "8px 0",
    borderBottom: "1px solid #1f1f1f",
  },
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  subHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 20px",
    background: "#0d0d0d",
    borderBottom: "1px solid #1f1f1f",
    flexShrink: 0,
  },
  presence: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    fontWeight: "bold",
    cursor: "default",
    userSelect: "none" as const,
    letterSpacing: "0.02em",
  },
  board: {
    flex: 1,
    display: "flex",
    gap: 12,
    padding: 20,
    overflowX: "auto",
    overflowY: "auto",
    alignItems: "flex-start",
  },
  addSectionCol: {
    width: 200,
    flexShrink: 0,
    padding: 12,
    border: "1px dashed #2a2a2a",
    alignSelf: "flex-start",
  },
  addSectionBtn: {
    width: "100%",
    color: "#555555",
    background: "transparent",
    borderColor: "transparent",
  },
};
