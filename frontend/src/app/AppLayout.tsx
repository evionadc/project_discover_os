import type { CSSProperties, ReactNode } from "react";

/* =========================
   Base Theme
========================= */

const fontFamily =
  '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

/* =========================
   Styles
========================= */

const sidebarStyle: CSSProperties = {
  width: 240,
  padding: 20,
  background: "#0f172a", // slate-900
  color: "#e5e7eb", // gray-200
  borderRight: "1px solid #1e293b",
  flexShrink: 0,
  fontFamily,
};

const topbarStyle: CSSProperties = {
  height: 56,
  padding: "0 24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "#020617", // almost black
  color: "#f8fafc",
  borderBottom: "1px solid #1e293b",
  flexShrink: 0,
  fontFamily,
};

const contentStyle: CSSProperties = {
  flex: 1,
  padding: 32,
  overflow: "auto",
  background:
    "radial-gradient(circle at top left, #0f172a, #020617)",
  color: "#f8fafc",
  fontFamily,
};


/* =========================
   Components
========================= */

function TopBar() {
  return (
    <header style={topbarStyle}>
      <strong style={{ fontSize: 16, letterSpacing: 0.4 }}>
        Product OS
      </strong>

      <div style={{ fontSize: 13, color: "#cbd5f5" }}>
        <span style={{ marginRight: 16 }}>
          Workspace: <strong>Produto XPTO</strong>
        </span>
        <span>PM</span>
      </div>
    </header>
  );
}

function SideNav() {
  return (
    <aside style={sidebarStyle}>
      <NavSection title="Discovery">
        <NavItem active>Problemas</NavItem>
        <NavItem>Personas</NavItem>
        <NavItem>Hipóteses</NavItem>
        <NavItem>MVPs</NavItem>
      </NavSection>

      <NavSection title="Delivery">
        <NavItem>Features</NavItem>
        <NavItem>Stories</NavItem>
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
          color: "#94a3b8",
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {children}
      </ul>
    </div>
  );
}




function NavItem({
  children,
  active,
}: {
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <li
      style={{
        padding: "8px 12px",
        marginBottom: 4,
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 14,
        color: active ? "#ffffff" : "#cbd5e1",
        background: active ? "#1e293b" : "transparent",
        fontWeight: active ? 600 : 400,
      }}
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
}

export default function AppLayout({ children }: LayoutProps) {
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
      <TopBar />

      <div style={{ display: "flex", flex: 1 }}>
        <SideNav />
        <main style={contentStyle}>{children}</main>
      </div>
    </div>
  );
}
