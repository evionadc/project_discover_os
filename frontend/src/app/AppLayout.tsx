import type { CSSProperties, ReactNode } from "react";

/* =========================
   Base Theme
========================= */

const fontFamily =
  '"Source Sans 3", "Segoe UI", "Helvetica Neue", "Noto Sans", sans-serif';

/* =========================
   Styles
========================= */

const sidebarStyle: CSSProperties = {
  width: 260,
  padding: 16,
  background: "#f4f5f7",
  color: "#1f2937",
  borderRight: "1px solid #e5e7eb",
  flexShrink: 0,
  fontFamily,
};

const topbarStyle: CSSProperties = {
  height: 56,
  padding: "0 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "#ffffff",
  color: "#111827",
  borderBottom: "1px solid #e5e7eb",
  flexShrink: 0,
  fontFamily,
};

const contentStyle: CSSProperties = {
  flex: 1,
  padding: 24,
  overflow: "auto",
  background: "#f8f9fb",
  color: "#111827",
  fontFamily,
};

/* =========================
   Components
========================= */

function TopBar({
  userName,
  workspaceName,
  onProfile,
  onWorkspace,
  onQuit,
  activeNav,
}: {
  userName: string;
  workspaceName: string;
  onProfile: () => void;
  onWorkspace: () => void;
  onQuit: () => void;
  activeNav: string;
}) {
  const sectionLabel: Record<string, string> = {
    problems: "Problemas",
    personas: "Personas",
    hypotheses: "Hypotheses",
    mvps: "MVPs",
    profile: "Profile",
    workspace: "Workspace",
  };

  return (
    <header style={topbarStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <strong style={{ fontSize: 15, letterSpacing: 0.2 }}>Product OS</strong>
        <span style={{ color: "#9ca3af" }}>/</span>
        <span style={{ color: "#6b7280" }}>{workspaceName}</span>
        <span style={{ color: "#9ca3af" }}>/</span>
        <span style={{ color: "#111827" }}>
          {sectionLabel[activeNav] ?? "Problemas"}
        </span>
      </div>

      <div style={{ fontSize: 13, color: "#6b7280" }}>
        <button
          onClick={onWorkspace}
          style={{
            marginRight: 16,
            background: "transparent",
            border: "none",
            color: "#6b7280",
            cursor: "pointer",
            padding: 0,
            fontSize: 13,
          }}
        >
          Workspace: <strong style={{ color: "#111827" }}>{workspaceName}</strong>
        </button>
        <button
          onClick={onProfile}
          style={{
            background: "transparent",
            border: "none",
            color: "#111827",
            cursor: "pointer",
            padding: 0,
            fontSize: 13,
            marginRight: 12,
          }}
        >
          {userName}
        </button>
        <button
          onClick={onQuit}
          style={{
            background: "#f3f4f6",
            border: "1px solid #e5e7eb",
            color: "#111827",
            padding: "4px 10px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          Sair
        </button>
      </div>
    </header>
  );
}

function SideNav({
  activeNav,
  onNavigate,
}: {
  activeNav: string;
  onNavigate: (next: string, anchor?: string) => void;
}) {
  return (
    <aside style={sidebarStyle}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: "#2563eb",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 12,
            marginRight: 10,
          }}
        >
          PO
        </div>
        <div style={{ fontWeight: 600 }}>Produto XPTO</div>
        <button
          style={{
            marginLeft: "auto",
            background: "transparent",
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            width: 26,
            height: 26,
            cursor: "pointer",
            color: "#6b7280",
          }}
          aria-label="Add"
        >
          +
        </button>
      </div>

      <NavSection title="Discovery">
        <NavItem active={activeNav === "problems"} onClick={() => onNavigate("problems")}
        >
          Problemas
        </NavItem>
        <NavItem active={activeNav === "personas"} onClick={() => onNavigate("personas")}
        >
          Personas
        </NavItem>
        <NavItem active={activeNav === "hypotheses"} onClick={() => onNavigate("hypotheses")}
        >
          Hipóteses
        </NavItem>
        <NavItem active={activeNav === "mvps"} onClick={() => onNavigate("mvps")}
        >
          MVPs
        </NavItem>
      </NavSection>

      <NavSection title="Delivery">
        <NavItem active={activeNav === "features"} onClick={() => onNavigate("features")}>
          Features
        </NavItem>
        <NavItem active={activeNav === "stories"} onClick={() => onNavigate("stories")}>
          Stories
        </NavItem>
      </NavSection>
    </aside>
  );
}

/* =========================
   Nav Helpers
========================= */

function NavSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: "#9ca3af",
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>{children}</ul>
    </div>
  );
}

function NavItem({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <li
      style={{
        padding: "8px 12px",
        marginBottom: 4,
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 14,
        color: active ? "#111827" : "#374151",
        background: active ? "#e5e7eb" : "transparent",
        fontWeight: active ? 600 : 500,
        borderLeft: active ? "3px solid #2563eb" : "3px solid transparent",
      }}
      onClick={onClick}
    >
      {children}
    </li>
  );
}

/* =========================
   Layout
========================= */

interface LayoutProps {
  children: ReactNode;
  activeNav: string;
  onNavigate: (next: string, anchor?: string) => void;
  onProfile: () => void;
  onWorkspace: () => void;
  onQuit: () => void;
  userName: string;
  workspaceName: string;
}

export default function AppLayout({
  children,
  activeNav,
  onNavigate,
  onProfile,
  onWorkspace,
  onQuit,
  userName,
  workspaceName,
}: LayoutProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      <TopBar
        userName={userName}
        workspaceName={workspaceName}
        onProfile={onProfile}
        onWorkspace={onWorkspace}
        onQuit={onQuit}
        activeNav={activeNav}
      />

      <div style={{ display: "flex", flex: 1 }}>
        <SideNav activeNav={activeNav} onNavigate={onNavigate} />
        <main style={contentStyle}>{children}</main>
      </div>
    </div>
  );
}
