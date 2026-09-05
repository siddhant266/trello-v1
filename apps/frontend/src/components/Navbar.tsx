import { useNavigate } from "react-router-dom";

interface NavbarProps {
  breadcrumbs?: { label: string; to?: string }[];
  rightContent?: React.ReactNode;
}

export default function Navbar({ breadcrumbs = [], rightContent }: NavbarProps) {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "user";
  const initials = username.slice(0, 2).toUpperCase();

  function signOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    navigate("/auth");
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <span
          onClick={() => navigate("/")}
          style={styles.logo}
          title="Home - Organizations"
        >
          trello
        </span>
        {breadcrumbs.map((crumb, idx) => (
          <span key={idx} style={styles.crumbItem}>
            <span style={styles.separator}>/</span>
            {crumb.to ? (
              <span
                onClick={() => navigate(crumb.to!)}
                style={styles.crumbLink}
              >
                {crumb.label}
              </span>
            ) : (
              <span style={styles.crumbActive}>{crumb.label}</span>
            )}
          </span>
        ))}
      </div>

      <div style={styles.right}>
        {rightContent}

        <div style={styles.userSection} title={`Logged in as ${username}`}>
          <div style={styles.avatar}>{initials}</div>
          <span style={styles.username}>@{username}</span>
        </div>

        <button onClick={signOut} className="danger" style={styles.signOutBtn}>
          sign out
        </button>
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    height: 48,
    background: "#0d0d0d",
    borderBottom: "1px solid #222222",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 18px",
    flexShrink: 0,
    fontSize: 13,
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    fontWeight: "bold",
    letterSpacing: "0.06em",
    color: "#ffffff",
    cursor: "pointer",
    padding: "2px 4px",
  },
  separator: {
    color: "#444444",
    marginRight: 8,
  },
  crumbItem: {
    display: "flex",
    alignItems: "center",
  },
  crumbLink: {
    color: "#888888",
    cursor: "pointer",
  },
  crumbActive: {
    color: "#e8e8e8",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "4px 8px",
    background: "#141414",
    border: "1px solid #252525",
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: "#2c2c2c",
    border: "1px solid #3d3d3d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    fontWeight: "bold",
    color: "#e8e8e8",
  },
  username: {
    fontSize: 12,
    color: "#cccccc",
  },
  signOutBtn: {
    padding: "4px 10px",
    fontSize: 12,
  },
};
